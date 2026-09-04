param(
  [string]$HealthTask = "PharmacyQuizHealthMonitor",
  [string]$ErrorTask = "PharmacyQuizErrorMonitor",
  [string]$DiskTask = "PharmacyQuizDiskMonitor",
  [string]$DbTask = "PharmacyQuizDbMonitor",
  [string]$UserCleanupTask = "PharmacyQuizUserCleanup"
)

$ErrorActionPreference = "Stop"

$backendDir = $PSScriptRoot
$healthScript = Join-Path $backendDir "monitor-health.ps1"
$errorScript = Join-Path $backendDir "monitor-errors.ps1"
$diskScript = Join-Path $backendDir "monitor-disk.ps1"
$dbScript = Join-Path $backendDir "monitor-db.ps1"
$userCleanupScript = Join-Path $backendDir "run-backup-cleanup.ps1"

function Ensure-Task {
  param(
    [string]$Name,
    [string]$ScheduleType,
    [string]$ScheduleArgs,
    [string]$Action
  )

  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  schtasks /Query /TN $Name 2>$null | Out-Null
  $exists = $LASTEXITCODE -eq 0
  $ErrorActionPreference = $prev

  if ($exists) {
    schtasks /Delete /TN $Name /F | Out-Null
  }

  $args = "/Create /TN `"$Name`" /SC $ScheduleType $ScheduleArgs /TR `"$Action`" /F"
  cmd /c "schtasks $args" | Out-Null
}

$healthAction = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$healthScript`""
$errorAction = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$errorScript`""
$diskAction = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$diskScript`""
$dbAction = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$dbScript`""
$userCleanupAction = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$userCleanupScript`""

Ensure-Task -Name $HealthTask -ScheduleType "MINUTE" -ScheduleArgs "/MO 5" -Action $healthAction
Ensure-Task -Name $ErrorTask -ScheduleType "MINUTE" -ScheduleArgs "/MO 15" -Action $errorAction
Ensure-Task -Name $DiskTask -ScheduleType "DAILY" -ScheduleArgs "/ST 03:00" -Action $diskAction
Ensure-Task -Name $DbTask -ScheduleType "MINUTE" -ScheduleArgs "/MO 30" -Action $dbAction
Ensure-Task -Name $UserCleanupTask -ScheduleType "WEEKLY" -ScheduleArgs "/D SUN /ST 03:30" -Action $userCleanupAction

Write-Host "Monitoring tasks created/updated:"
Write-Host "- $HealthTask (every 5 minutes)"
Write-Host "- $ErrorTask (every 15 minutes)"
Write-Host "- $DiskTask (daily 03:00)"
Write-Host "- $DbTask (every 30 minutes)"
Write-Host "- $UserCleanupTask (weekly Sunday 03:30)"
