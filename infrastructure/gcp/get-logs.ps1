param([string]$Service = "partner-service", [int]$Limit = 50)
$env:PATH = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin;$env:PATH"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$Service" `
    --project=gen-lang-client-0315293206 `
    --format="table(timestamp,textPayload)" `
    --limit=$Limit `
    --freshness=7d
