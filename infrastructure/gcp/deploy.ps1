#Requires -Version 5.1
<#
.SYNOPSIS
    Deploy Connected Commerce Platform to GCP (Cloud Run + Cloud SQL + Firebase Hosting)

.PARAMETER SkipBuild
    Skip Docker build+push. Re-deploy Cloud Run services using existing images.

.PARAMETER OnlyFrontend
    Only build + deploy the 3 React apps to Firebase Hosting. Skips backend.

.EXAMPLE
    .\deploy.ps1                   # Full deploy (first run ~15 min)
    .\deploy.ps1 -SkipBuild        # Re-deploy without rebuilding images
    .\deploy.ps1 -OnlyFrontend     # Update frontend only
#>
param(
    [switch]$SkipBuild,
    [switch]$OnlyFrontend
)

Set-StrictMode -Off
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
$PROJECT_ID   = "gen-lang-client-0315293206"
$REGION       = "us-central1"
$REGISTRY     = "$REGION-docker.pkg.dev/$PROJECT_ID/cc-services"
$DB_INSTANCE  = "cc-postgres"
$DB_NAME      = "connected_commerce"
$DB_USER      = "commerce"
$SCRIPT_DIR   = $PSScriptRoot
$ROOT         = (Resolve-Path "$SCRIPT_DIR\..\..\").Path
$SECRETS_FILE = "$SCRIPT_DIR\secrets.json"
$URLS_FILE    = "$SCRIPT_DIR\urls.json"

$SERVICES = @(
    @{ Name="offer-service";           Port=8081; Dir="services/offer-service" },
    @{ Name="partner-service";         Port=8082; Dir="services/partner-service" },
    @{ Name="eligibility-service";     Port=8083; Dir="services/eligibility-service" },
    @{ Name="redemption-service";      Port=8084; Dir="services/redemption-service" },
    @{ Name="customer-data-service";   Port=8085; Dir="services/customer-data-service" },
    @{ Name="transaction-data-service";Port=8086; Dir="services/transaction-data-service" }
)

$FRONTENDS = @(
    @{ Name="customer-app";     Site="cc-customer-0315";  Dir="apps/customer-app" },
    @{ Name="merchant-portal";  Site="cc-merchant-0315";  Dir="apps/merchant-portal" },
    @{ Name="colleague-portal"; Site="cc-colleague-0315"; Dir="apps/colleague-portal" }
)

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    WARN: $msg" -ForegroundColor Yellow }
function Invoke-Cmd($cmd) {
    Write-Host "    $ $cmd" -ForegroundColor DarkGray
    $result = Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $cmd" }
    return $result
}

# ---------------------------------------------------------------------------
# PRE-FLIGHT
# ---------------------------------------------------------------------------
Write-Step "Checking prerequisites"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host @"

ERROR: gcloud CLI not found.
Install from: https://cloud.google.com/sdk/docs/install
Then run:   gcloud auth login
            gcloud auth configure-docker $REGION-docker.pkg.dev

"@ -ForegroundColor Red
    exit 1
}

if (-not $OnlyFrontend -and -not $SkipBuild) {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Docker not found. Install Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not running. Start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
}

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host @"

ERROR: Firebase CLI not found.
Install: npm install -g firebase-tools
Then:    firebase login

"@ -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm not found. Install Node.js 20+." -ForegroundColor Red
    exit 1
}

Write-OK "All prerequisites found"

# ---------------------------------------------------------------------------
# GCP PROJECT
# ---------------------------------------------------------------------------
Write-Step "Configuring GCP project: $PROJECT_ID"
Invoke-Cmd "gcloud config set project $PROJECT_ID"
Invoke-Cmd "gcloud config set run/region $REGION"

if (-not $OnlyFrontend) {
    Write-Step "Enabling required GCP APIs (first run takes ~2 min)"
    $apis = "run.googleapis.com,sqladmin.googleapis.com,artifactregistry.googleapis.com,secretmanager.googleapis.com"
    Invoke-Cmd "gcloud services enable $apis --quiet"
    Write-OK "APIs enabled"
}

# ---------------------------------------------------------------------------
# ARTIFACT REGISTRY
# ---------------------------------------------------------------------------
if (-not $OnlyFrontend -and -not $SkipBuild) {
    Write-Step "Creating Artifact Registry repository (skipped if exists)"
    $existing = gcloud artifacts repositories describe cc-services --location=$REGION --format="value(name)" 2>$null
    if (-not $existing) {
        Invoke-Cmd "gcloud artifacts repositories create cc-services --repository-format=docker --location=$REGION --quiet"
        Write-OK "Repository created"
    } else {
        Write-OK "Repository already exists"
    }
    Invoke-Cmd "gcloud auth configure-docker $REGION-docker.pkg.dev --quiet"
}

# ---------------------------------------------------------------------------
# CLOUD SQL (first run only — takes 5-8 min)
# ---------------------------------------------------------------------------
if (-not $OnlyFrontend) {
    Write-Step "Checking Cloud SQL instance"
    $dbStatus = gcloud sql instances describe $DB_INSTANCE --format="value(state)" 2>$null
    if (-not $dbStatus) {
        Write-Host "    Creating Cloud SQL instance (db-f1-micro, ~7 min)..." -ForegroundColor Yellow
        Invoke-Cmd "gcloud sql instances create $DB_INSTANCE --database-version=POSTGRES_14 --tier=db-f1-micro --region=$REGION --storage-size=10 --storage-type=SSD --no-backup --quiet"
        Write-OK "Cloud SQL instance created"

        # Generate password
        $DB_PASS = [System.Web.Security.Membership]::GeneratePassword(24, 4)
        if (-not $DB_PASS) { $DB_PASS = [guid]::NewGuid().ToString().Replace("-","") + "Aa1!" }

        Invoke-Cmd "gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE --quiet"
        Invoke-Cmd "gcloud sql users create $DB_USER --instance=$DB_INSTANCE --password=`"$DB_PASS`" --quiet"

        $secrets = @{ db_password = $DB_PASS; db_instance = "$PROJECT_ID`:$REGION`:$DB_INSTANCE" }
        $secrets | ConvertTo-Json | Set-Content $SECRETS_FILE
        Write-OK "Secrets saved to $SECRETS_FILE"
    } else {
        Write-OK "Cloud SQL instance already running (state: $dbStatus)"
        if (Test-Path $SECRETS_FILE) {
            $secrets = Get-Content $SECRETS_FILE | ConvertFrom-Json
            $DB_PASS = $secrets.db_password
        } else {
            Write-Host "ERROR: $SECRETS_FILE not found. Cannot get DB password." -ForegroundColor Red
            Write-Host "       If you reset the DB password, update secrets.json manually." -ForegroundColor Red
            exit 1
        }
    }

    $DB_CONNECTION = "$PROJECT_ID`:$REGION`:$DB_INSTANCE"
    Write-OK "DB connection: $DB_CONNECTION"
}

# ---------------------------------------------------------------------------
# BUILD + PUSH DOCKER IMAGES
# ---------------------------------------------------------------------------
if (-not $OnlyFrontend -and -not $SkipBuild) {
    Write-Step "Building and pushing Docker images"
    foreach ($svc in $SERVICES) {
        $imgTag = "$REGISTRY/$($svc.Name):latest"
        $buildDir = Join-Path $ROOT $svc.Dir
        Write-Host "    Building $($svc.Name)..." -ForegroundColor DarkGray
        Invoke-Cmd "docker build -t `"$imgTag`" `"$buildDir`""
        Invoke-Cmd "docker push `"$imgTag`""
        Write-OK "$($svc.Name) pushed"
    }

    # BFF
    $bffTag = "$REGISTRY/bff:latest"
    $bffDir = Join-Path $ROOT "services/bff"
    Write-Host "    Building bff..." -ForegroundColor DarkGray
    Invoke-Cmd "docker build -t `"$bffTag`" `"$bffDir`""
    Invoke-Cmd "docker push `"$bffTag`""
    Write-OK "bff pushed"
}

# ---------------------------------------------------------------------------
# DEPLOY JAVA SERVICES TO CLOUD RUN
# ---------------------------------------------------------------------------
if (-not $OnlyFrontend) {
    Write-Step "Deploying Java microservices to Cloud Run"

    $DB_URL = "jdbc:postgresql:///$DB_NAME?cloudSqlInstance=$DB_CONNECTION&socketFactory=com.google.cloud.sql.postgres.SocketFactory"

    $serviceUrls = @{}

    foreach ($svc in $SERVICES) {
        $imgTag = "$REGISTRY/$($svc.Name):latest"
        Write-Host "    Deploying $($svc.Name)..." -ForegroundColor DarkGray

        $deployCmd = "gcloud run deploy $($svc.Name) " +
            "--image=`"$imgTag`" " +
            "--region=$REGION " +
            "--platform=managed " +
            "--no-allow-unauthenticated " +
            "--min-instances=0 " +
            "--max-instances=10 " +
            "--memory=512Mi " +
            "--cpu=1 " +
            "--port=$($svc.Port) " +
            "--set-env-vars=SPRING_PROFILES_ACTIVE=gcp,SPRING_DATASOURCE_URL=`"$DB_URL`",SPRING_DATASOURCE_USERNAME=$DB_USER,SPRING_DATASOURCE_PASSWORD=`"$DB_PASS`" " +
            "--add-cloudsql-instances=$DB_CONNECTION " +
            "--quiet"

        Invoke-Cmd $deployCmd

        $url = gcloud run services describe $svc.Name --region=$REGION --format="value(status.url)"
        $serviceUrls[$svc.Name] = $url
        Write-OK "$($svc.Name): $url"
    }

    # ---------------------------------------------------------------------------
    # DEPLOY BFF TO CLOUD RUN
    # ---------------------------------------------------------------------------
    Write-Step "Deploying BFF to Cloud Run"

    $bffEnvVars = "NODE_ENV=production," +
        "PORT=3000," +
        "DB_HOST=/cloudsql/$DB_CONNECTION," +
        "DB_NAME=$DB_NAME," +
        "DB_USER=$DB_USER," +
        "DB_PASS=`"$DB_PASS`"," +
        "OFFER_SERVICE_URL=$($serviceUrls['offer-service'])," +
        "PARTNER_SERVICE_URL=$($serviceUrls['partner-service'])," +
        "ELIGIBILITY_SERVICE_URL=$($serviceUrls['eligibility-service'])," +
        "REDEMPTION_SERVICE_URL=$($serviceUrls['redemption-service'])," +
        "CUSTOMER_DATA_SERVICE_URL=$($serviceUrls['customer-data-service'])," +
        "TRANSACTION_DATA_SERVICE_URL=$($serviceUrls['transaction-data-service'])"

    $bffTag = "$REGISTRY/bff:latest"
    $bffCmd = "gcloud run deploy bff " +
        "--image=`"$bffTag`" " +
        "--region=$REGION " +
        "--platform=managed " +
        "--allow-unauthenticated " +
        "--min-instances=1 " +
        "--max-instances=10 " +
        "--memory=256Mi " +
        "--cpu=1 " +
        "--port=3000 " +
        "--set-env-vars=$bffEnvVars " +
        "--add-cloudsql-instances=$DB_CONNECTION " +
        "--quiet"

    Invoke-Cmd $bffCmd

    $bffUrl = gcloud run services describe bff --region=$REGION --format="value(status.url)"
    $serviceUrls["bff"] = $bffUrl
    Write-OK "BFF: $bffUrl"

    # Save all service URLs
    $serviceUrls | ConvertTo-Json | Set-Content $URLS_FILE
    Write-OK "Service URLs saved to $URLS_FILE"

    # Grant Java services internal access to each other via BFF only
    # (Java services are --no-allow-unauthenticated; BFF calls them as service account)
    Write-Step "Granting BFF Cloud Run SA access to internal services"
    $bffSA = gcloud run services describe bff --region=$REGION --format="value(spec.template.spec.serviceAccountName)" 2>$null
    if (-not $bffSA) { $bffSA = "$PROJECT_ID-compute@developer.gserviceaccount.com" }
    foreach ($svc in $SERVICES) {
        gcloud run services add-iam-policy-binding $svc.Name --region=$REGION --member="serviceAccount:$bffSA" --role="roles/run.invoker" --quiet 2>$null
    }
    Write-OK "IAM bindings applied"
}

# ---------------------------------------------------------------------------
# BUILD + DEPLOY REACT APPS TO FIREBASE HOSTING
# ---------------------------------------------------------------------------
Write-Step "Building and deploying frontend apps"

# Load BFF URL for VITE env
if (Test-Path $URLS_FILE) {
    $urls = Get-Content $URLS_FILE | ConvertFrom-Json
    $bffUrl = $urls.bff
} elseif ($OnlyFrontend) {
    Write-Host "    Reading BFF URL from Cloud Run..." -ForegroundColor DarkGray
    $bffUrl = gcloud run services describe bff --region=$REGION --format="value(status.url)" 2>$null
}

foreach ($fe in $FRONTENDS) {
    $feDir = Join-Path $ROOT $fe.Dir
    Write-Host "    Building $($fe.Name)..." -ForegroundColor DarkGray

    # Write VITE env so React apps hit the correct BFF URL in production
    if ($bffUrl) {
        "VITE_API_BASE_URL=$bffUrl" | Set-Content (Join-Path $feDir ".env.production")
    }

    Push-Location $feDir
    try {
        Invoke-Cmd "npm install --silent"
        Invoke-Cmd "npm run build"
        Write-OK "$($fe.Name) built"

        Invoke-Cmd "firebase deploy --only hosting:$($fe.Site) --project $PROJECT_ID --non-interactive"
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

if (Test-Path $URLS_FILE) {
    $urls = Get-Content $URLS_FILE | ConvertFrom-Json
    Write-Host "`n  Backend services (Cloud Run):" -ForegroundColor Cyan
    $urls.PSObject.Properties | ForEach-Object { Write-Host "    $($_.Name): $($_.Value)" }
}

Write-Host "`n  Frontend apps (Firebase Hosting):" -ForegroundColor Cyan
foreach ($fe in $FRONTENDS) {
    Write-Host "    $($fe.Name): https://$($fe.Site).web.app"
}

Write-Host "`n  Demo users (password: demo1234)" -ForegroundColor Cyan
Write-Host "    customer@demo.com   (Alice, PREMIER)"
Write-Host "    customer2@demo.com  (Ben, MASS_AFFLUENT)"
Write-Host "    customer3@demo.com  (Cara, MASS_MARKET)"
Write-Host "    merchant@demo.com"
Write-Host "    colleague@demo.com"
Write-Host "    exec@demo.com`n"
