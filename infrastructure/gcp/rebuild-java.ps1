#Requires -Version 5.1
<#
.SYNOPSIS
    Rebuild all 6 Java service images with the HikariCP pool fix and redeploy to Cloud Run.
    This is a targeted script - does not touch BFF or Firebase Hosting.
.PARAMETER SkipBuild
    Skip Docker build+push. Re-deploy Cloud Run services using existing images.
#>
param([switch]$SkipBuild)

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

$PROJECT_ID  = "gen-lang-client-0315293206"
$REGION      = "us-central1"
$REGISTRY    = "$REGION-docker.pkg.dev/$PROJECT_ID/cc-services"
$DB_USER     = "commerce"
$SCRIPT_DIR  = $PSScriptRoot
$ROOT        = (Resolve-Path "$SCRIPT_DIR\..\..\").Path
$SECRETS_FILE = "$SCRIPT_DIR\secrets.json"

$SERVICES = @(
    @{ Name="offer-service";            Port=8081; Dir="services/offer-service" },
    @{ Name="partner-service";          Port=8082; Dir="services/partner-service" },
    @{ Name="eligibility-service";      Port=8083; Dir="services/eligibility-service" },
    @{ Name="redemption-service";       Port=8084; Dir="services/redemption-service" },
    @{ Name="customer-data-service";    Port=8085; Dir="services/customer-data-service" },
    @{ Name="transaction-data-service"; Port=8086; Dir="services/transaction-data-service" }
)

$LABELS = "app=connected-commerce,env=demo,version=v1-3-0,team=engineering"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "    ERR: $msg" -ForegroundColor Red }

# Read DB password from secrets.json
if (-not (Test-Path $SECRETS_FILE)) {
    Write-Host "ERROR: $SECRETS_FILE not found." -ForegroundColor Red; exit 1
}
$secrets = Get-Content $SECRETS_FILE | ConvertFrom-Json
$DB_PASS = $secrets.db_password
$DB_CONNECTION = $secrets.db_instance

Write-Host "DB connection: $DB_CONNECTION" -ForegroundColor DarkGray

# ---------------------------------------------------------------------------
# BUILD + PUSH
# ---------------------------------------------------------------------------
if (-not $SkipBuild) {
    Write-Step "Building and pushing Java service images"

    foreach ($svc in $SERVICES) {
        $imgTag  = "$REGISTRY/$($svc.Name):latest"
        $buildDir = Join-Path $ROOT $svc.Dir
        Write-Host "    Building $($svc.Name)..." -ForegroundColor DarkGray
        docker build -t "$imgTag" "$buildDir" 2>&1 | Where-Object { $_ -match "Step|ERROR|error" }
        if ($LASTEXITCODE -ne 0) { Write-Err "Build FAILED: $($svc.Name)"; exit 1 }
        docker push "$imgTag" 2>&1 | Where-Object { $_ -match "pushed|digest|ERROR" }
        if ($LASTEXITCODE -ne 0) { Write-Err "Push FAILED: $($svc.Name)"; exit 1 }
        Write-OK "$($svc.Name) built and pushed"
    }
}

# ---------------------------------------------------------------------------
# DEPLOY TO CLOUD RUN
# ---------------------------------------------------------------------------
Write-Step "Deploying Java services to Cloud Run"

foreach ($svc in $SERVICES) {
    $imgTag = "$REGISTRY/$($svc.Name):latest"
    Write-Host "    Deploying $($svc.Name)..." -ForegroundColor DarkGray

    & gcloud run deploy $svc.Name `
        "--image=$imgTag" `
        "--region=$REGION" `
        "--platform=managed" `
        "--no-allow-unauthenticated" `
        "--min-instances=0" `
        "--max-instances=10" `
        "--memory=512Mi" `
        "--cpu=1" `
        "--port=$($svc.Port)" `
        "--set-env-vars=SPRING_PROFILES_ACTIVE=gcp,SPRING_DATASOURCE_USERNAME=$DB_USER,SPRING_DATASOURCE_PASSWORD=$DB_PASS" `
        "--add-cloudsql-instances=$DB_CONNECTION" `
        "--labels=$LABELS" `
        "--quiet"

    if ($LASTEXITCODE -ne 0) {
        Write-Err "Deploy FAILED: $($svc.Name)"
        Write-Host "    Check logs: gcloud logging read `"resource.type=cloud_run_revision AND resource.labels.service_name=$($svc.Name)`" --project=$PROJECT_ID --limit=20" -ForegroundColor Yellow
        exit 1
    }

    $url = gcloud run services describe $svc.Name --region=$REGION --format="value(status.url)"
    Write-OK "$($svc.Name): $url"
}

Write-Host "`n==> All Java services deployed successfully!" -ForegroundColor Green
Write-Host "    Next: run .\deploy.ps1 -SkipBuild to deploy BFF + Firebase Hosting" -ForegroundColor Cyan
