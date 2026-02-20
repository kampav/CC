# Connected Commerce - Start All Services
# Run from PowerShell: .\start-all.ps1

$root = "C:\Projects\CC\extracted\connected-commerce"
$bash = "C:\Program Files\Git\usr\bin\bash.exe"

Write-Host "Starting Connected Commerce Platform..." -ForegroundColor Cyan

# 1. Docker infra
Write-Host "`n[1/3] Starting Docker infrastructure..." -ForegroundColor Yellow
Set-Location $root
docker compose up -d
Write-Host "Docker containers ready." -ForegroundColor Green
Start-Sleep -Seconds 5

# Helper: launch a Java service in a new window
function Start-JavaService($name, $dir) {
    $unixDir = $dir -replace 'C:\\', '/c/' -replace '\\', '/'
    # Single-quoted bash -c arg avoids inner double-quote escaping issues in Start-Process
    $pscmd = "& '$bash' -c 'cd $unixDir && ./mvnw spring-boot:run'"
    Write-Host "  Launching $name..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $pscmd
    Start-Sleep -Seconds 2
}

# 2. Java microservices
Write-Host "`n[2/3] Starting Java microservices (4 new windows)..." -ForegroundColor Yellow
Start-JavaService "offer-service (8081)"       "$root\services\offer-service"
Start-JavaService "partner-service (8082)"     "$root\services\partner-service"
Start-JavaService "eligibility-service (8083)" "$root\services\eligibility-service"
Start-JavaService "redemption-service (8084)"  "$root\services\redemption-service"

Write-Host "Waiting 60s for Java services to boot..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# 3. BFF and frontend apps
Write-Host "`n[3/3] Starting BFF and frontends (4 new windows)..." -ForegroundColor Yellow

foreach ($app in @(
    @("BFF (3000)",            "$root\services\bff"),
    @("customer-app (5173)",   "$root\apps\customer-app"),
    @("merchant-portal (5174)","$root\apps\merchant-portal"),
    @("colleague-portal (5175)","$root\apps\colleague-portal")
)) {
    $appName = $app[0]; $appDir = $app[1]
    Write-Host "  Launching $appName..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command",
        "Write-Host 'Starting $appName' -ForegroundColor Cyan; Set-Location '$appDir'; npm run dev"
    Start-Sleep -Seconds 1
}

Write-Host "`n[Done] All services launched!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Customer App:     http://localhost:5173"
Write-Host "  Merchant Portal:  http://localhost:5174"
Write-Host "  Colleague Portal: http://localhost:5175"
Write-Host "  BFF Health:       http://localhost:3000/health"
Write-Host "  Kafka UI:         http://localhost:9080"
