param(
  [int]$MinFreeGB = 10,
  [string]$Drive = "C"
)

$ErrorActionPreference = "Stop"

$backendDir = $PSScriptRoot
$logDir = Join-Path $backendDir "logs"
$monitorLog = Join-Path $logDir "monitor.log"
$alertLog = Join-Path $logDir "alerts.log"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$driveInfo = Get-PSDrive $Drive
$freeGb = [math]::Round($driveInfo.Free / 1GB, 2)
Add-Content -Path $monitorLog -Value "$(Get-Date -Format s) disk-monitor drive=$Drive freeGB=$freeGb"

if ($freeGb -lt $MinFreeGB) {
  Add-Content -Path $alertLog -Value "$(Get-Date -Format s) ALERT: low disk space drive=$Drive freeGB=$freeGb threshold=$MinFreeGB"
  exit 1
}

exit 0
