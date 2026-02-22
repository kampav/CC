# Connected Commerce - Start All Services
# Run from PowerShell: .\start-all.ps1
# NOTE: This is a convenience alias. The canonical script is .\scripts\start.ps1

$scriptPath = Join-Path $PSScriptRoot "scripts\start.ps1"
if (Test-Path $scriptPath) {
    & $scriptPath @args
} else {
    Write-Host "Error: scripts\start.ps1 not found. Are you in the repo root?" -ForegroundColor Red
    exit 1
}
