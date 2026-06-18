$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFolderName
)

$backendDir = $PSScriptRoot
$backupsDir = Join-Path $backendDir "backups"
$dataDir = Join-Path $backendDir "data"
$sourceDir = Join-Path $backupsDir $BackupFolderName

if (-not (Test-Path $sourceDir)) {
  throw "Backup folder not found: $sourceDir"
}

$required = @(
  "users.json",
  "questions.json",
  "attempts.json",
  "syncPerformance.json",
  "syncSessions.json"
)

foreach ($file in $required) {
  $path = Join-Path $sourceDir $file
  if (-not (Test-Path $path)) {
    throw "Backup is missing file: $file"
  }
}

# Safety snapshot before restoring.
$safetyName = "pre_restore_" + (Get-Date -Format "yyyyMMdd_HHmmss")
$safetyDir = Join-Path $backupsDir $safetyName
New-Item -ItemType Directory -Path $safetyDir | Out-Null
Copy-Item (Join-Path $dataDir "*.json") -Destination $safetyDir -Force

Copy-Item (Join-Path $sourceDir "*.json") -Destination $dataDir -Force

Write-Host "Restore completed from: $sourceDir"
Write-Host "Safety snapshot created: $safetyDir"
