param(
  [int]$WindowMinutes = 15,
  [int]$ErrorThreshold = 5
)

$ErrorActionPreference = "Stop"

$backendDir = $PSScriptRoot
$logDir = Join-Path $backendDir "logs"
$accessLog = Join-Path $logDir "access.log"
$monitorLog = Join-Path $logDir "monitor.log"
$alertLog = Join-Path $logDir "alerts.log"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

if (-not (Test-Path $accessLog)) {
  Add-Content -Path $monitorLog -Value "$(Get-Date -Format s) error-monitor skipped: no access.log"
  exit 0
}

$lines = Get-Content $accessLog -Tail 1000
$count = 0

foreach ($line in $lines) {
  if ($line -match '"\s(?<status>\d{3})\s') {
    $status = [int]$Matches["status"]
    if ($status -ge 500) {
      $count += 1
    }
  }
}

Add-Content -Path $monitorLog -Value "$(Get-Date -Format s) error-monitor window=${WindowMinutes}m count5xx=$count"

if ($count -ge $ErrorThreshold) {
  Add-Content -Path $alertLog -Value "$(Get-Date -Format s) ALERT: high 5xx rate count=$count threshold=$ErrorThreshold"
  exit 1
}

exit 0
