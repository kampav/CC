#Requires -Version 5.1
$candidates = @(
    "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin",
    "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin",
    "C:\Program Files\Google\Cloud SDK\google-cloud-sdk\bin"
)
foreach ($c in $candidates) {
    if (Test-Path "$c\gcloud.cmd") { $env:PATH = "$c;$env:PATH"; break }
}

$PROJECT = "gen-lang-client-0315293206"
$REVISION = if ($args[0]) { $args[0] } else { "offer-service-00015-c2m" }

Write-Host "==> Fetching logs for revision: $REVISION" -ForegroundColor Cyan

& gcloud logging read `
    "resource.type=cloud_run_revision AND resource.labels.service_name=offer-service AND resource.labels.revision_name=$REVISION" `
    "--project=$PROJECT" `
    "--limit=80" `
    "--format=value(textPayload)" 2>&1
