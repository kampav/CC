#Requires -Version 5.1
$ErrorActionPreference = 'Continue'

# PATH fix
$candidates = @(
    "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin",
    "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin",
    "C:\Program Files\Google\Cloud SDK\google-cloud-sdk\bin"
)
foreach ($c in $candidates) {
    if (Test-Path "$c\gcloud.cmd") { $env:PATH = "$c;$env:PATH"; break }
}

$PROJECT  = "gen-lang-client-0315293206"
$REGION   = "us-central1"
$REGISTRY = "$REGION-docker.pkg.dev/$PROJECT/cc-services"
$SCRIPT_DIR = $PSScriptRoot
$ROOT     = (Resolve-Path "$SCRIPT_DIR\..\..\").Path
$SECRETS  = "$SCRIPT_DIR\secrets.json"

$secrets = Get-Content $SECRETS | ConvertFrom-Json
$DB_PASS = $secrets.db_password
$DB_CONN = $secrets.db_instance

$imgTag   = "$REGISTRY/offer-service:latest"
$buildDir = Join-Path $ROOT "services\offer-service"

Write-Host "==> Building offer-service (--no-cache) from $buildDir ..." -ForegroundColor Cyan
docker build --no-cache -t "$imgTag" "$buildDir"
if ($LASTEXITCODE -ne 0) { Write-Host "Build FAILED" -ForegroundColor Red; exit 1 }

Write-Host "==> Pushing offer-service..." -ForegroundColor Cyan
docker push "$imgTag"
if ($LASTEXITCODE -ne 0) { Write-Host "Push FAILED" -ForegroundColor Red; exit 1 }

Write-Host "==> Deploying offer-service to Cloud Run..." -ForegroundColor Cyan
& gcloud run deploy offer-service `
    "--image=$imgTag" `
    "--region=$REGION" `
    "--platform=managed" `
    "--no-allow-unauthenticated" `
    "--min-instances=0" `
    "--max-instances=10" `
    "--memory=512Mi" `
    "--cpu=1" `
    "--port=8081" `
    "--set-env-vars=SPRING_PROFILES_ACTIVE=gcp,SPRING_DATASOURCE_USERNAME=commerce,SPRING_DATASOURCE_PASSWORD=$DB_PASS" `
    "--add-cloudsql-instances=$DB_CONN" `
    "--labels=app=connected-commerce,env=demo,version=v1-3-0" `
    "--quiet"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deploy FAILED" -ForegroundColor Red
    exit 1
}

$url = & gcloud run services describe offer-service --region=$REGION --format="value(status.url)"
Write-Host "OK: offer-service deployed: $url" -ForegroundColor Green
