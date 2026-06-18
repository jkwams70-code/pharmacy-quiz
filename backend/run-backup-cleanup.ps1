$ErrorActionPreference = "Stop"

$backendDir = $PSScriptRoot
$logDir = Join-Path $backendDir "logs"
$maintenanceLog = Join-Path $logDir "maintenance.log"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Write-MaintenanceLog {
  param([string]$Message)
  $line = "$(Get-Date -Format s) $Message"
  Add-Content -Path $maintenanceLog -Value $line
  Write-Host $line
}

Push-Location $backendDir
try {
  Write-MaintenanceLog "Starting scheduled backup + cleanup"
  npm run backup | Out-String | ForEach-Object { Write-MaintenanceLog $_.TrimEnd() }
  npm run cleanup | Out-String | ForEach-Object { Write-MaintenanceLog $_.TrimEnd() }
  npm run cleanup:users | Out-String | ForEach-Object { Write-MaintenanceLog $_.TrimEnd() }
  Write-MaintenanceLog "Maintenance completed successfully"
} catch {
  Write-MaintenanceLog "Maintenance failed: $($_.Exception.Message)"
  throw
} finally {
  Pop-Location
}
