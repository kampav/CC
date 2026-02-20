# Connected Commerce Platform — Stop All Services
Write-Host "Stopping Connected Commerce services..." -ForegroundColor DarkGray
foreach ($port in @(8081,8082,8083,8084,3000,5173,5174,5175)) {
    $c = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($c) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  Stopped port $port" -ForegroundColor Yellow
    }
}
Write-Host "Done." -ForegroundColor Green
