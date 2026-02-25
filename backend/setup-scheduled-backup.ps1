param(
  [string]$TaskName = "PharmacyQuizBackupDaily",
  [string]$At = "02:00"
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "run-backup-cleanup.ps1"

if (-not (Test-Path $scriptPath)) {
  throw "Script not found: $scriptPath"
}

$taskAction = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""

# Remove existing task to keep this idempotent.
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
schtasks /Query /TN $TaskName 2>$null | Out-Null
$taskExists = $LASTEXITCODE -eq 0
$ErrorActionPreference = $previousPreference

if ($taskExists) {
  schtasks /Delete /TN $TaskName /F | Out-Null
}

schtasks /Create `
  /TN $TaskName `
  /SC DAILY `
  /ST $At `
  /TR $taskAction `
  /F | Out-Null

Write-Host "Scheduled task created: $TaskName at $At"
Write-Host "Command: $taskAction"
