# Connected Commerce Platform -- Start All Services
# Run from the repo root: .\scripts\start.ps1
param([string]$LogsDir = "$PSScriptRoot\..\logs")

$root    = (Resolve-Path "$PSScriptRoot\..").Path
$runner  = "$PSScriptRoot\run-java-service.ps1"
$logsDir = (New-Item -ItemType Directory -Force -Path $LogsDir).FullName

function Stop-Port($port) {
    $c = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($c) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 300
    }
}

function Start-JavaBg($name, $port, $dir) {
    Stop-Port $port
    $unixDir = $dir.Replace("C:\", "/c/").Replace("\", "/")
    $log = "$logsDir\$name.log"
    $proc = Start-Process powershell `
        -ArgumentList @("-ExecutionPolicy","Bypass","-File",$runner,"-UnixDir",$unixDir,"-Log",$log) `
        -WindowStyle Hidden -PassThru
    Write-Host ("  {0,-30} http://localhost:{1}  [PID {2}]" -f $name, $port, $proc.Id) -ForegroundColor Yellow
}

function Start-NodeBg($name, $port, $dir) {
    Stop-Port $port
    $proc = Start-Process node -ArgumentList "src/index.js" -WorkingDirectory $dir `
        -RedirectStandardOutput "$logsDir\$name.log" `
        -RedirectStandardError  "$logsDir\$name-err.log" `
        -NoNewWindow -PassThru

    # Wait up to 8s for the port to open, then confirm or warn
    $ok = $false
    for ($i = 0; $i -lt 16; $i++) {
        Start-Sleep -Milliseconds 500
        if (-not $proc.HasExited -and (Get-NetTCPConnection -LocalPort $port -State Listen -EA SilentlyContinue)) {
            $ok = $true; break
        }
    }
    if ($ok) {
        Write-Host ("  {0,-30} http://localhost:{1}  [PID {2}] OK" -f $name, $port, $proc.Id) -ForegroundColor Green
    } else {
        Write-Host ("  {0,-30} FAILED -- check logs\{1}-err.log" -f $name, $name) -ForegroundColor Red
    }
}

function Start-ViteBg($name, $port, $dir) {
    Stop-Port $port
    $proc = Start-Process cmd -ArgumentList @("/c","npm run dev") -WorkingDirectory $dir `
        -RedirectStandardOutput "$logsDir\$name.log" `
        -RedirectStandardError  "$logsDir\$name-err.log" `
        -NoNewWindow -PassThru
    Write-Host ("  {0,-30} http://localhost:{1}  [PID {2}]" -f $name, $port, $proc.Id) -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Connected Commerce Platform v1.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Java microservices (wait ~90s to compile):" -ForegroundColor White
Start-JavaBg "offer-service"            8081 "$root\services\offer-service"
Start-JavaBg "partner-service"          8082 "$root\services\partner-service"
Start-JavaBg "eligibility-service"      8083 "$root\services\eligibility-service"
Start-JavaBg "redemption-service"       8084 "$root\services\redemption-service"
Start-JavaBg "customer-data-service"    8085 "$root\services\customer-data-service"
Start-JavaBg "transaction-data-service" 8086 "$root\services\transaction-data-service"

Write-Host ""
Write-Host "BFF (Node.js):" -ForegroundColor White
Start-NodeBg "bff" 3000 "$root\services\bff"

Write-Host ""
Write-Host "Frontend apps:" -ForegroundColor White
Start-ViteBg "customer-app"      5173 "$root\apps\customer-app"
Start-ViteBg "merchant-portal"   5174 "$root\apps\merchant-portal"
Start-ViteBg "colleague-portal"  5175 "$root\apps\colleague-portal"

Write-Host ""
Write-Host "All services launched." -ForegroundColor Green
Write-Host ""
Write-Host "  http://localhost:5173   Customer App (9 personas, all pw: demo1234)" -ForegroundColor White
Write-Host "  http://localhost:5173/demo  A/B Personalisation Demo" -ForegroundColor White
Write-Host "  http://localhost:5174   Merchant Portal (merchant@demo.com)" -ForegroundColor White
Write-Host "  http://localhost:5175   Colleague Portal (colleague@demo.com)" -ForegroundColor White
Write-Host "  http://localhost:5175   Exec Dashboard   (exec@demo.com)" -ForegroundColor White
Write-Host "  http://localhost:3000/demo  BFF Demo (no login)" -ForegroundColor White
Write-Host ""
Write-Host "Health checks (after ~90s):" -ForegroundColor DarkGray
Write-Host "  curl http://localhost:8085/api/v1/customers/health" -ForegroundColor DarkGray
Write-Host "  curl http://localhost:8086/api/v1/banking-transactions/health" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Logs: $logsDir" -ForegroundColor DarkGray
Write-Host "Stop: .\scripts\stop.ps1" -ForegroundColor DarkGray
