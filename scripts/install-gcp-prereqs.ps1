#Requires -Version 5.1
<#
.SYNOPSIS
    Install and configure all prerequisites for GCP deployment.

.DESCRIPTION
    Checks for gcloud CLI, Docker Desktop, and Firebase CLI.
    Authenticates gcloud and Firebase, then creates the three Firebase Hosting sites.
    Safe to re-run -- each step is idempotent.

.EXAMPLE
    .\scripts\install-gcp-prereqs.ps1
#>

Set-StrictMode -Off
$ErrorActionPreference = 'Continue'

$PROJECT_ID = "gen-lang-client-0315293206"
$REGION     = "us-central1"

function Write-Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)    { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Missing($msg) { Write-Host "    [MISSING] $msg" -ForegroundColor Red }
function Write-Info($msg)  { Write-Host "    $msg" -ForegroundColor DarkGray }
function Write-Warn($msg)  { Write-Host "    [WARN] $msg" -ForegroundColor Yellow }

# ---------------------------------------------------------------------------
# BANNER
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host "  Connected Commerce -- GCP Prerequisites Installer" -ForegroundColor Cyan
Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 1: CHECK WHAT IS INSTALLED
# ---------------------------------------------------------------------------
Write-Step "Checking installed tools"

$gcloudOk  = $null -ne (Get-Command gcloud  -ErrorAction SilentlyContinue)
$dockerOk  = $null -ne (Get-Command docker  -ErrorAction SilentlyContinue)
$firebaseOk = $null -ne (Get-Command firebase -ErrorAction SilentlyContinue)
$npmOk     = $null -ne (Get-Command npm     -ErrorAction SilentlyContinue)

if ($gcloudOk)   { Write-OK   "gcloud CLI found" }
else             { Write-Missing "gcloud CLI not found" }

if ($dockerOk)   { Write-OK   "Docker found" }
else             { Write-Missing "Docker not found" }

if ($npmOk)      { Write-OK   "npm found" }
else             { Write-Missing "npm not found (required for Firebase CLI)" }

if ($firebaseOk) { Write-OK   "Firebase CLI found" }
else             { Write-Warn  "Firebase CLI not found (will install via npm if npm is available)" }

# ---------------------------------------------------------------------------
# STEP 2: INSTALLATION INSTRUCTIONS FOR MISSING TOOLS
# ---------------------------------------------------------------------------
$allOk = $gcloudOk -and $dockerOk -and $npmOk

if (-not $gcloudOk -or -not $dockerOk -or -not $npmOk) {
    Write-Host ""
    Write-Host "  Some tools need to be installed manually before continuing." -ForegroundColor Yellow
    Write-Host "  Please install the following and then re-run this script:" -ForegroundColor Yellow
    Write-Host ""

    if (-not $gcloudOk) {
        Write-Host "  [1] Google Cloud SDK (gcloud):" -ForegroundColor White
        Write-Host "      https://cloud.google.com/sdk/docs/install" -ForegroundColor Blue
        Write-Host "      - Download 'Google Cloud CLI installer' for Windows"
        Write-Host "      - Run the installer, accept defaults"
        Write-Host "      - Restart PowerShell after install"
        Write-Host ""
    }

    if (-not $dockerOk) {
        Write-Host "  [2] Docker Desktop:" -ForegroundColor White
        Write-Host "      https://www.docker.com/products/docker-desktop/" -ForegroundColor Blue
        Write-Host "      - Download Docker Desktop for Windows"
        Write-Host "      - Run installer, restart when prompted"
        Write-Host "      - Start Docker Desktop from the taskbar before deploying"
        Write-Host ""
    }

    if (-not $npmOk) {
        Write-Host "  [3] Node.js 20+ (includes npm):" -ForegroundColor White
        Write-Host "      https://nodejs.org/en/download" -ForegroundColor Blue
        Write-Host "      - Download 'Windows Installer (.msi)' LTS version"
        Write-Host "      - Run installer, accept defaults"
        Write-Host ""
    }

    Write-Host "  After installing, re-run: .\scripts\install-gcp-prereqs.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# ---------------------------------------------------------------------------
# STEP 3: INSTALL FIREBASE CLI IF MISSING
# ---------------------------------------------------------------------------
Write-Step "Firebase CLI"

if (-not $firebaseOk) {
    Write-Info "Installing Firebase CLI via npm..."
    npm install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR: Failed to install Firebase CLI. Check npm is working." -ForegroundColor Red
        exit 1
    }
    Write-OK "Firebase CLI installed"
} else {
    Write-OK "Firebase CLI already installed"
}

# ---------------------------------------------------------------------------
# STEP 4: GCLOUD AUTH
# ---------------------------------------------------------------------------
Write-Step "Authenticating with Google Cloud"

Write-Info "Checking current gcloud account..."
$currentAccount = gcloud config get-value account 2>$null
if ($currentAccount -and $currentAccount -ne "(unset)") {
    Write-OK "Already authenticated as: $currentAccount"
    $doLogin = $false
} else {
    Write-Info "No active gcloud account found. Launching browser login..."
    $doLogin = $true
}

if ($doLogin) {
    gcloud auth login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR: gcloud auth login failed." -ForegroundColor Red
        exit 1
    }
    Write-OK "gcloud authentication complete"
}

# Set project
Write-Info "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "    ERROR: Could not set project. Check you have access to $PROJECT_ID." -ForegroundColor Red
    exit 1
}
Write-OK "Project set: $PROJECT_ID"

# ---------------------------------------------------------------------------
# STEP 5: CONFIGURE DOCKER FOR ARTIFACT REGISTRY
# ---------------------------------------------------------------------------
Write-Step "Configuring Docker for Artifact Registry"

Write-Info "Checking Docker is running..."
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Docker Desktop is not running. Start it from the taskbar, then re-run this script."
    Write-Warn "Skipping Docker configuration for now."
} else {
    gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-OK "Docker configured for $REGION-docker.pkg.dev"
    } else {
        Write-Warn "Docker configuration failed (non-fatal -- will retry during deploy)"
    }
}

# ---------------------------------------------------------------------------
# STEP 6: FIREBASE LOGIN
# ---------------------------------------------------------------------------
Write-Step "Authenticating with Firebase"

Write-Info "Checking Firebase login status..."
$firebaseCi = firebase login:list 2>&1
if ($LASTEXITCODE -eq 0 -and $firebaseCi -match "@") {
    Write-OK "Already logged in to Firebase"
} else {
    Write-Info "Launching Firebase browser login..."
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR: Firebase login failed." -ForegroundColor Red
        exit 1
    }
    Write-OK "Firebase authentication complete"
}

# ---------------------------------------------------------------------------
# STEP 7: CREATE FIREBASE HOSTING SITES (idempotent)
# ---------------------------------------------------------------------------
Write-Step "Creating Firebase Hosting sites (skipped if already exist)"

$sites = @("cc-customer-0315", "cc-merchant-0315", "cc-colleague-0315")

foreach ($site in $sites) {
    Write-Info "Checking site: $site ..."
    $existing = firebase hosting:sites:get $site --project $PROJECT_ID 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-OK "Site already exists: $site"
    } else {
        Write-Info "Creating site: $site ..."
        firebase hosting:sites:create $site --project $PROJECT_ID 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-OK "Site created: https://$site.web.app"
        } else {
            Write-Warn "Could not create site '$site' -- it may already exist or you may need to create it manually in the Firebase console"
            Write-Warn "Console: https://console.firebase.google.com/project/$PROJECT_ID/hosting/sites"
        }
    }
}

# ---------------------------------------------------------------------------
# DONE
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host ("=" * 65) -ForegroundColor Green
Write-Host "  Prerequisites are ready!" -ForegroundColor Green
Write-Host ("=" * 65) -ForegroundColor Green
Write-Host ""
Write-Host "  Next step -- run the full deploy:" -ForegroundColor Cyan
Write-Host "  .\infrastructure\gcp\deploy.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  This will (~15 min on first run):" -ForegroundColor DarkGray
Write-Host "    - Create Cloud SQL instance" -ForegroundColor DarkGray
Write-Host "    - Build + push Docker images" -ForegroundColor DarkGray
Write-Host "    - Deploy 6 Java services to Cloud Run" -ForegroundColor DarkGray
Write-Host "    - Deploy BFF to Cloud Run" -ForegroundColor DarkGray
Write-Host "    - Deploy 3 React apps to Firebase Hosting" -ForegroundColor DarkGray
Write-Host "    - Set up uptime monitoring + email alerts" -ForegroundColor DarkGray
Write-Host ""
