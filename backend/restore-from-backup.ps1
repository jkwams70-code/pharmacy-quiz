$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFolderName
)

$backendDir = $PSScriptRoot
$backupsDir = Join-Path $backendDir "backups"
$sourceDir = Join-Path $backupsDir $BackupFolderName

if (-not (Test-Path $sourceDir)) {
  throw "Backup folder not found: $sourceDir"
}
node (Join-Path $backendDir "src\scripts\restoreData.js") $BackupFolderName
