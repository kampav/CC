# Connected Commerce Platform — Start All Services
# Run from the repo root: .\scripts\start.ps1
param([string]$LogsDir = "$PSScriptRoot\..\logs")

$root    = (Resolve-Path "$PSScriptRoot\..").Path
$runner  = "$PSScriptRoot\run-java-service.ps1"
$logsDir = (New-Item -ItemType Directory -Force -Path $LogsDir).FullName

function Stop-Port($port) {
    $c = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue }
}

function Start-JavaBg($name, $port, $dir) {
    Stop-Port $port
    $unixDir = $dir.Replace("C:\", "/c/").Replace("\", "/")
    $log = "$logsDir\$name.log"
    $proc = Start-Process powershell `
        -ArgumentList @("-ExecutionPolicy","Bypass","-File",$runner,"-UnixDir",$unixDir,"-Log",$log) `
        -WindowStyle Hidden -PassThru
    Write-Host ("  {0,-25} http://localhost:{1}  [PID {2}]" -f $name, $port, $proc.Id) -ForegroundColor Yellow
}

function Start-NodeBg($name, $port, $dir) {
    Stop-Port $port
    $proc = Start-Process node -ArgumentList "src/index.js" -WorkingDirectory $dir `
        -RedirectStandardOutput "$logsDir\$name.log" `
        -RedirectStandardError  "$logsDir\$name-err.log" `
        -NoNewWindow -PassThru
    Write-Host ("  {0,-25} http://localhost:{1}  [PID {2}]" -f $name, $port, $proc.Id) -ForegroundColor Yellow
}

function Start-ViteBg($name, $port, $dir) {
    Stop-Port $port
    $proc = Start-Process cmd -ArgumentList @("/c","npm run dev") -WorkingDirectory $dir `
        -RedirectStandardOutput "$logsDir\$name.log" `
        -RedirectStandardError  "$logsDir\$name-err.log" `
        -NoNewWindow -PassThru
    Write-Host ("  {0,-25} http://localhost:{1}  [PID {2}]" -f $name, $port, $proc.Id) -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Connected Commerce Platform" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Java microservices (wait ~90s to start):" -ForegroundColor White
Start-JavaBg "offer-service"       8081 "$root\services\offer-service"
Start-JavaBg "partner-service"     8082 "$root\services\partner-service"
Start-JavaBg "eligibility-service" 8083 "$root\services\eligibility-service"
Start-JavaBg "redemption-service"  8084 "$root\services\redemption-service"

Write-Host ""
Write-Host "BFF:" -ForegroundColor White
Start-NodeBg "bff" 3000 "$root\services\bff"

Write-Host ""
Write-Host "Frontend apps:" -ForegroundColor White
Start-ViteBg "customer-app"      5173 "$root\apps\customer-app"
Start-ViteBg "merchant-portal"   5174 "$root\apps\merchant-portal"
Start-ViteBg "colleague-portal"  5175 "$root\apps\colleague-portal"

Write-Host ""
Write-Host "All services launched." -ForegroundColor Green
Write-Host ""
Write-Host "  http://localhost:5173   Customer App"
Write-Host "  http://localhost:5174   Merchant Portal"
Write-Host "  http://localhost:5175   Colleague Portal"
Write-Host "  http://localhost:3000/demo   AI Demo"
Write-Host ""
Write-Host "Logs: $logsDir" -ForegroundColor DarkGray
Write-Host "Stop: .\scripts\stop.ps1" -ForegroundColor DarkGray
