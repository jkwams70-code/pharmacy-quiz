$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$node = (Get-Command node.exe).Source
$lanIp = $null

try {
  $ipconfigLines = & ipconfig
  $match = ($ipconfigLines |
    Select-String -Pattern 'IPv4 Address[^:]*:\s*(\d{1,3}(?:\.\d{1,3}){3})' -AllMatches |
    ForEach-Object { $_.Matches } |
    ForEach-Object { $_.Groups[1].Value } |
    Where-Object {
      $_ -and
      $_ -notmatch '^(127\.|169\.254\.)' -and
      $_ -ne '0.0.0.0'
    } |
    Select-Object -First 1)
  if ($match) {
    $lanIp = $match
  }
} catch {}

if (-not $lanIp) {
  $lanIp = '127.0.0.1'
}

if (-not (Test-Path (Join-Path $backend 'package.json'))) {
  Write-Error "Could not find backend at $backend."
  exit 1
}

$env:NODE_ENV = 'development'
$env:CORS_ORIGIN = "http://localhost:4000,http://127.0.0.1:4000,http://$lanIp:4000"
$env:HTTPS_ENABLED = 'false'
$env:HTTPS_ENFORCE = 'false'

Start-Process cmd.exe -ArgumentList '/k', "cd /d `"$backend`" && set NODE_ENV=development&& set CORS_ORIGIN=http://localhost:4000,http://127.0.0.1:4000,http://$lanIp:4000&& set HTTPS_ENABLED=false&& set HTTPS_ENFORCE=false&& `"$node`" src/server.js" | Out-Null
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "App is running at http://localhost:4000/"
Write-Host "Open on phone: http://$lanIp:4000/"
Write-Host "API health: http://localhost:4000/api/health"
