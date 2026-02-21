#Requires -Version 5.1
<#
.SYNOPSIS
    Set up Cloud Monitoring uptime checks and email alerts for Connected Commerce Platform.

.DESCRIPTION
    Creates 4 uptime checks (BFF /health, 3 Firebase Hosting sites) and one alerting
    policy that emails the GCP account holder when any check fails for > 60 seconds.
    Safe to re-run -- all steps are idempotent.

.PARAMETER BffUrl
    The Cloud Run URL for the BFF service (e.g. https://bff-xxxx-uc.a.run.app)

.PARAMETER ProjectId
    GCP project ID. Defaults to gen-lang-client-0315293206

.EXAMPLE
    .\setup-monitoring.ps1 -BffUrl "https://bff-xxxx-uc.a.run.app"
    .\setup-monitoring.ps1 -BffUrl "https://bff-xxxx-uc.a.run.app" -ProjectId "my-project"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$BffUrl,

    [string]$ProjectId = "gen-lang-client-0315293206"
)

Set-StrictMode -Off
$ErrorActionPreference = 'Continue'

function Write-Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)    { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "    [WARN] $msg" -ForegroundColor Yellow }
function Write-Info($msg)  { Write-Host "    $msg" -ForegroundColor DarkGray }

# ---------------------------------------------------------------------------
# STEP 1: Enable Monitoring API
# ---------------------------------------------------------------------------
Write-Step "Enabling Cloud Monitoring API"
gcloud services enable monitoring.googleapis.com --project $ProjectId --quiet
if ($LASTEXITCODE -eq 0) {
    Write-OK "monitoring.googleapis.com enabled"
} else {
    Write-Warn "Could not enable monitoring API (may already be enabled)"
}

# ---------------------------------------------------------------------------
# STEP 2: Get alert email from gcloud account
# ---------------------------------------------------------------------------
Write-Step "Getting alert email address"
$alertEmail = gcloud config get-value account 2>$null
if (-not $alertEmail -or $alertEmail -eq "(unset)") {
    Write-Warn "Could not determine gcloud account email. Using placeholder."
    $alertEmail = "alert@example.com"
}
Write-OK "Alert email: $alertEmail"

# ---------------------------------------------------------------------------
# STEP 3: Create / find notification channel
# ---------------------------------------------------------------------------
Write-Step "Setting up email notification channel"

$channelName = "CC Platform Alerts"
$existingChannels = gcloud monitoring channels list --project=$ProjectId --format="json" 2>$null | ConvertFrom-Json
$channel = $existingChannels | Where-Object { $_.displayName -eq $channelName } | Select-Object -First 1

if ($channel) {
    $channelId = $channel.name
    Write-OK "Notification channel already exists: $channelId"
} else {
    Write-Info "Creating notification channel '$channelName' for $alertEmail ..."
    $channelJson = @{
        type        = "email"
        displayName = $channelName
        labels      = @{ email_address = $alertEmail }
    } | ConvertTo-Json -Compress

    $tmpChannel = [System.IO.Path]::GetTempFileName() + ".json"
    $channelJson | Set-Content $tmpChannel -Encoding UTF8

    $channelId = gcloud monitoring channels create --channel-content-from-file=$tmpChannel --project=$ProjectId --format="value(name)" 2>$null
    Remove-Item $tmpChannel -ErrorAction SilentlyContinue

    if ($channelId) {
        Write-OK "Notification channel created: $channelId"
    } else {
        Write-Warn "Could not create notification channel. Alerts will be skipped."
        $channelId = ""
    }
}

# ---------------------------------------------------------------------------
# STEP 4: Create uptime checks (idempotent)
# ---------------------------------------------------------------------------
Write-Step "Creating uptime checks"

# Parse BFF host from URL (strip https:// and trailing slash)
$bffHost = $BffUrl -replace "^https?://", "" -replace "/$", ""

$uptimeChecks = @(
    @{ DisplayName = "cc-bff-health";     Host = $bffHost;                    Path = "/health"; },
    @{ DisplayName = "cc-customer-site";  Host = "cc-customer-0315.web.app";  Path = "/"; },
    @{ DisplayName = "cc-merchant-site";  Host = "cc-merchant-0315.web.app";  Path = "/"; },
    @{ DisplayName = "cc-colleague-site"; Host = "cc-colleague-0315.web.app"; Path = "/"; }
)

$uptimeCheckIds = @{}

# Get existing checks
$existingChecks = gcloud monitoring uptime list-configs --project=$ProjectId --format="json" 2>$null | ConvertFrom-Json

foreach ($check in $uptimeChecks) {
    $existing = $existingChecks | Where-Object { $_.displayName -eq $check.DisplayName } | Select-Object -First 1
    if ($existing) {
        Write-OK "Uptime check already exists: $($check.DisplayName)"
        $uptimeCheckIds[$check.DisplayName] = $existing.name
    } else {
        Write-Info "Creating uptime check: $($check.DisplayName) -> https://$($check.Host)$($check.Path) ..."

        $checkConfig = @{
            displayName = $check.DisplayName
            monitoredResource = @{
                type   = "uptime_url"
                labels = @{ host = $check.Host; project_id = $ProjectId }
            }
            httpCheck = @{
                path           = $check.Path
                port           = 443
                useSsl         = $true
                validateSsl    = $true
                requestMethod  = "GET"
            }
            period  = "300s"
            timeout = "10s"
        } | ConvertTo-Json -Depth 6 -Compress

        $tmpCheck = [System.IO.Path]::GetTempFileName() + ".json"
        $checkConfig | Set-Content $tmpCheck -Encoding UTF8

        $checkId = gcloud monitoring uptime create --config-from-file=$tmpCheck --project=$ProjectId --format="value(name)" 2>$null
        Remove-Item $tmpCheck -ErrorAction SilentlyContinue

        if ($checkId) {
            Write-OK "Created: $($check.DisplayName) ($checkId)"
            $uptimeCheckIds[$check.DisplayName] = $checkId
        } else {
            Write-Warn "Could not create uptime check for $($check.DisplayName)"
        }
    }
}

# ---------------------------------------------------------------------------
# STEP 5: Create alerting policy (idempotent)
# ---------------------------------------------------------------------------
Write-Step "Creating alerting policy"

$policyName = "CC Platform Uptime Alert"
$existingPolicies = gcloud monitoring policies list --project=$ProjectId --format="json" 2>$null | ConvertFrom-Json
$existingPolicy = $existingPolicies | Where-Object { $_.displayName -eq $policyName } | Select-Object -First 1

if ($existingPolicy) {
    Write-OK "Alerting policy already exists: $policyName"
} elseif (-not $channelId) {
    Write-Warn "Skipping alerting policy creation (no notification channel)"
} else {
    Write-Info "Creating alerting policy '$policyName'..."

    # Build one condition per uptime check
    $conditions = @()
    foreach ($check in $uptimeChecks) {
        $checkId = $uptimeCheckIds[$check.DisplayName]
        if ($checkId) {
            # Extract just the short name portion for the filter
            $checkShortName = $checkId -replace ".*/", ""
            $conditions += @{
                displayName = "Uptime check failed: $($check.DisplayName)"
                conditionThreshold = @{
                    filter          = "resource.type = `"uptime_url`" AND metric.type = `"monitoring.googleapis.com/uptime_check/check_passed`" AND metric.labels.check_id = `"$checkShortName`""
                    comparison      = "COMPARISON_LT"
                    thresholdValue  = 1
                    duration        = "60s"
                    aggregations    = @(
                        @{
                            alignmentPeriod   = "60s"
                            perSeriesAligner  = "ALIGN_NEXT_OLDER"
                            crossSeriesReducer = "REDUCE_COUNT_FALSE"
                            groupByFields     = @("resource.label.host")
                        }
                    )
                    trigger = @{ count = 1 }
                }
            }
        }
    }

    if ($conditions.Count -eq 0) {
        Write-Warn "No uptime check IDs found -- skipping alerting policy"
    } else {
        $policy = @{
            displayName         = $policyName
            combiner            = "OR"
            conditions          = $conditions
            notificationChannels = @($channelId)
            alertStrategy       = @{
                autoClose = "86400s"
            }
            documentation = @{
                content  = "One or more Connected Commerce Platform uptime checks failed. Check Cloud Run and Firebase Hosting status."
                mimeType = "text/markdown"
            }
        } | ConvertTo-Json -Depth 10

        $tmpPolicy = [System.IO.Path]::GetTempFileName() + ".json"
        $policy | Set-Content $tmpPolicy -Encoding UTF8

        gcloud monitoring policies create --policy-from-file=$tmpPolicy --project=$ProjectId --quiet 2>&1
        $createResult = $LASTEXITCODE
        Remove-Item $tmpPolicy -ErrorAction SilentlyContinue

        if ($createResult -eq 0) {
            Write-OK "Alerting policy created: $policyName"
        } else {
            Write-Warn "Could not create alerting policy (check Cloud Console manually)"
        }
    }
}

# ---------------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host ("=" * 65) -ForegroundColor Green
Write-Host "  Monitoring setup complete" -ForegroundColor Green
Write-Host ("=" * 65) -ForegroundColor Green
Write-Host ""
Write-Host "  Uptime checks (5-min interval):" -ForegroundColor Cyan
Write-Host "    BFF health:     https://$bffHost/health"
Write-Host "    Customer site:  https://cc-customer-0315.web.app"
Write-Host "    Merchant site:  https://cc-merchant-0315.web.app"
Write-Host "    Colleague site: https://cc-colleague-0315.web.app"
Write-Host ""
Write-Host "  Alert email: $alertEmail (on failure > 60s)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Cloud Console links:" -ForegroundColor Cyan
Write-Host "    Uptime:  https://console.cloud.google.com/monitoring/uptime?project=$ProjectId"
Write-Host "    Alerts:  https://console.cloud.google.com/monitoring/alerting?project=$ProjectId"
Write-Host ""
