param(
  [string]$BaseUrl = "http://localhost:4000/api/health"
)

$ErrorActionPreference = "Stop"

$backendDir = $PSScriptRoot
$logDir = Join-Path $backendDir "logs"
$monitorLog = Join-Path $logDir "monitor.log"
$alertLog = Join-Path $logDir "alerts.log"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Write-Line {
  param([string]$Path, [string]$Message)
  Add-Content -Path $Path -Value "$(Get-Date -Format s) $Message"
}

try {
  $res = Invoke-RestMethod -Uri $BaseUrl -Method Get -TimeoutSec 8
  if ($res.status -eq "ok") {
    Write-Line -Path $monitorLog -Message "health-check ok"
    exit 0
  }
  Write-Line -Path $alertLog -Message "health-check unexpected response"
  exit 1
} catch {
  Write-Line -Path $alertLog -Message "health-check failed: $($_.Exception.Message)"
  exit 1
}
