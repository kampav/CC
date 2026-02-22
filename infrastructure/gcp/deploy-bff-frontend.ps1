#Requires -Version 5.1
<#
.SYNOPSIS
    Deploy BFF to Cloud Run and React apps to Firebase Hosting.
    Assumes all 6 Java services are already deployed.
.PARAMETER SkipBffBuild
    Skip Docker build+push of BFF image (use existing image in Artifact Registry).
#>
param([switch]$SkipBffBuild)

$ErrorActionPreference = 'Continue'

# PATH fix
$gcloudCandidates = @(
    "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin",
    "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin",
    "C:\Program Files\Google\Cloud SDK\google-cloud-sdk\bin"
)
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    foreach ($c in $gcloudCandidates) {
        if (Test-Path "$c\gcloud.cmd") { $env:PATH = "$c;$env:PATH"; break }
    }
}
$npmBin = (npm root -g 2>$null) -replace "node_modules$", ""
if ($npmBin -and -not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    $env:PATH = "$npmBin;$env:PATH"
}

$PROJECT_ID  = "gen-lang-client-0315293206"
$REGION      = "us-central1"
$REGISTRY    = "$REGION-docker.pkg.dev/$PROJECT_ID/cc-services"
$DB_USER     = "commerce"
$DB_NAME     = "connected_commerce"
$SCRIPT_DIR  = $PSScriptRoot
$ROOT        = (Resolve-Path "$SCRIPT_DIR\..\..\").Path
$SECRETS_FILE = "$SCRIPT_DIR\secrets.json"
$URLS_FILE   = "$SCRIPT_DIR\urls.json"
$LABELS      = "app=connected-commerce,env=demo,version=v1-3-0,team=engineering"

$JAVA_SERVICES = @(
    "offer-service", "partner-service", "eligibility-service",
    "redemption-service", "customer-data-service", "transaction-data-service"
)

$FRONTENDS = @(
    @{ Name="customer-app";     Site="cc-customer-0315";  Dir="apps/customer-app" },
    @{ Name="merchant-portal";  Site="cc-merchant-0315";  Dir="apps/merchant-portal" },
    @{ Name="colleague-portal"; Site="cc-colleague-0315"; Dir="apps/colleague-portal" }
)

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "    ERR: $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "    WARN: $msg" -ForegroundColor Yellow }

# Read DB password
if (-not (Test-Path $SECRETS_FILE)) { Write-Err "$SECRETS_FILE not found"; exit 1 }
$secrets = Get-Content $SECRETS_FILE | ConvertFrom-Json
$DB_PASS = $secrets.db_password
$DB_CONNECTION = $secrets.db_instance

# ---------------------------------------------------------------------------
# COLLECT JAVA SERVICE URLs
# ---------------------------------------------------------------------------
Write-Step "Collecting Java service URLs from Cloud Run"
$serviceUrls = @{}
foreach ($name in $JAVA_SERVICES) {
    $url = gcloud run services describe $name --region=$REGION --format="value(status.url)" 2>$null
    if ($url) {
        $serviceUrls[$name] = $url
        Write-Host "    $name`: $url" -ForegroundColor DarkGray
    } else {
        Write-Warn "Could not get URL for $name - service may not be deployed"
    }
}

# ---------------------------------------------------------------------------
# BUILD + PUSH BFF
# ---------------------------------------------------------------------------
if (-not $SkipBffBuild) {
    Write-Step "Building and pushing BFF image"
    $bffTag = "$REGISTRY/bff:latest"
    $bffDir = Join-Path $ROOT "services/bff"
    docker build -t "$bffTag" "$bffDir" 2>&1 | Where-Object { $_ -match "Step|Successfully|ERROR|error" }
    if ($LASTEXITCODE -ne 0) { Write-Err "BFF build failed"; exit 1 }
    docker push "$bffTag" 2>&1 | Where-Object { $_ -match "pushed|digest|ERROR" }
    if ($LASTEXITCODE -ne 0) { Write-Err "BFF push failed"; exit 1 }
    Write-OK "BFF image pushed"
}

# ---------------------------------------------------------------------------
# DEPLOY BFF TO CLOUD RUN
# ---------------------------------------------------------------------------
Write-Step "Deploying BFF to Cloud Run"

$bffEnvVars = "NODE_ENV=production," +
    "DB_HOST=/cloudsql/$DB_CONNECTION," +
    "DB_NAME=$DB_NAME," +
    "DB_USER=$DB_USER," +
    "DB_PASS=$DB_PASS," +
    "OFFER_SERVICE_URL=$($serviceUrls['offer-service'])," +
    "PARTNER_SERVICE_URL=$($serviceUrls['partner-service'])," +
    "ELIGIBILITY_SERVICE_URL=$($serviceUrls['eligibility-service'])," +
    "REDEMPTION_SERVICE_URL=$($serviceUrls['redemption-service'])," +
    "CUSTOMER_SERVICE_URL=$($serviceUrls['customer-data-service'])," +
    "TRANSACTION_SERVICE_URL=$($serviceUrls['transaction-data-service'])"

$bffTag = "$REGISTRY/bff:latest"
& gcloud run deploy bff `
    "--image=$bffTag" `
    "--region=$REGION" `
    "--platform=managed" `
    "--allow-unauthenticated" `
    "--min-instances=1" `
    "--max-instances=10" `
    "--memory=256Mi" `
    "--cpu=1" `
    "--set-env-vars=$bffEnvVars" `
    "--add-cloudsql-instances=$DB_CONNECTION" `
    "--labels=$LABELS" `
    "--quiet"

if ($LASTEXITCODE -ne 0) { Write-Err "BFF deploy failed"; exit 1 }

$bffUrl = gcloud run services describe bff --region=$REGION --format="value(status.url)"
$serviceUrls["bff"] = $bffUrl
Write-OK "BFF: $bffUrl"

# Save URLs
$serviceUrls | ConvertTo-Json | Set-Content $URLS_FILE
Write-OK "URLs saved to $URLS_FILE"

# ---------------------------------------------------------------------------
# IAM: Grant BFF SA invoker access to internal Java services
# ---------------------------------------------------------------------------
Write-Step "Granting BFF Cloud Run SA access to internal services"
$bffSA = gcloud run services describe bff --region=$REGION --format="value(spec.template.spec.serviceAccountName)" 2>$null
if (-not $bffSA) { $bffSA = "$PROJECT_ID-compute@developer.gserviceaccount.com" }
foreach ($name in $JAVA_SERVICES) {
    gcloud run services add-iam-policy-binding $name --region=$REGION `
        --member="serviceAccount:$bffSA" --role="roles/run.invoker" --quiet 2>$null
}
Write-OK "IAM bindings applied (BFF SA: $bffSA)"

# ---------------------------------------------------------------------------
# REACT APPS TO FIREBASE HOSTING
# ---------------------------------------------------------------------------
Write-Step "Building and deploying React apps to Firebase Hosting"

foreach ($fe in $FRONTENDS) {
    $feDir = Join-Path $ROOT $fe.Dir
    Write-Host "    Building $($fe.Name)..." -ForegroundColor DarkGray

    if ($bffUrl) {
        "VITE_API_BASE_URL=$bffUrl" | Set-Content (Join-Path $feDir ".env.production")
    }

    Push-Location $feDir
    try {
        npm install --silent 2>&1 | Out-Null
        npm run build 2>&1 | Where-Object { $_ -match "built|error|Error" }
        if ($LASTEXITCODE -ne 0) { Write-Err "$($fe.Name) build failed"; Pop-Location; exit 1 }
        Write-OK "$($fe.Name) built"

        firebase deploy --only "hosting:$($fe.Site)" --project $PROJECT_ID --non-interactive 2>&1 | Where-Object { $_ -match "hosting|deploy|error|Error|Complete" }
        if ($LASTEXITCODE -ne 0) { Write-Err "$($fe.Name) Firebase deploy failed"; Pop-Location; exit 1 }
        Write-OK "$($fe.Name) deployed to https://$($fe.Site).web.app"
    } finally {
        Pop-Location
    }
}

# ---------------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------------
Write-Host "`n" + ("=" * 60) -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host "`n  Backend (Cloud Run):" -ForegroundColor Cyan
$serviceUrls.PSObject.Properties | ForEach-Object { Write-Host "    $($_.Name): $($_.Value)" }
Write-Host "`n  Frontend (Firebase Hosting):" -ForegroundColor Cyan
foreach ($fe in $FRONTENDS) {
    Write-Host "    $($fe.Name): https://$($fe.Site).web.app"
}
Write-Host "`n  Demo users (password: demo1234)" -ForegroundColor Cyan
Write-Host "    customer@demo.com  (Alice, PREMIER)"
Write-Host "    customer2@demo.com (Ben, MASS_AFFLUENT)"
Write-Host "    customer3@demo.com (Cara, MASS_MARKET)"
Write-Host "    merchant@demo.com, colleague@demo.com, exec@demo.com`n"
