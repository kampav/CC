$ErrorActionPreference = 'Continue'
$npmBin = (npm root -g 2>$null) -replace "node_modules$", ""
if ($npmBin -and -not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    $env:PATH = "$npmBin;$env:PATH"
}
$PROJECT = "gen-lang-client-0315293206"
$sites = @("cc-customer-0315", "cc-merchant-0315", "cc-colleague-0315")
foreach ($site in $sites) {
    Write-Host "Creating site: $site..." -ForegroundColor Cyan
    firebase hosting:sites:create $site --project $PROJECT 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: $site created" -ForegroundColor Green
    } else {
        Write-Host "  WARN: $site may already exist (continuing)" -ForegroundColor Yellow
    }
}
Write-Host "`nListing all hosting sites:" -ForegroundColor Cyan
firebase hosting:sites:list --project $PROJECT 2>&1
