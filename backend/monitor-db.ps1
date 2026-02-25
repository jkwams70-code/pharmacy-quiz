param(
  [string]$BaseUrl = "http://localhost:4000/api",
  [int]$Samples = 5
)

$ErrorActionPreference = "Stop"

$backendDir = $PSScriptRoot
$logDir = Join-Path $backendDir "logs"
$monitorLog = Join-Path $logDir "monitor.log"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$endpoints = @("/health", "/categories", "/questions?limit=20")
$rows = @()

foreach ($ep in $endpoints) {
  $total = 0.0
  for ($i = 0; $i -lt $Samples; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    Invoke-WebRequest -Uri ($BaseUrl + $ep) -UseBasicParsing -TimeoutSec 8 | Out-Null
    $sw.Stop()
    $total += $sw.Elapsed.TotalMilliseconds
  }
  $avg = [math]::Round($total / $Samples, 2)
  $rows += "$ep=$avg"
}

Add-Content -Path $monitorLog -Value "$(Get-Date -Format s) db-monitor $($rows -join ' ')"
Write-Host "DB performance sample logged"
