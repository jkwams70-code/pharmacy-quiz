$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root 'www'
$backend = Join-Path $root 'backend'
$node = (Get-Command node.exe).Source
$lanIp = $null
$python = $null

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

if (-not (Test-Path (Join-Path $frontend 'index.html'))) {
  Write-Error "Could not find frontend at $frontend."
  exit 1
}

try {
  $pyCommand = Get-Command py.exe -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($pyCommand) {
    $python = $pyCommand.Source
  }
  if (-not $python) {
    $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pythonCommand) {
      $python = $pythonCommand.Source
    }
  }
} catch {}

$env:NODE_ENV = 'development'
$env:CORS_ORIGIN = "http://localhost:8000,http://127.0.0.1:8000,http://$lanIp:8000,http://localhost:4000,http://127.0.0.1:4000,http://$lanIp:4000"
$env:HTTPS_ENABLED = 'false'
$env:HTTPS_ENFORCE = 'false'

if ($python) {
  Start-Process -FilePath $python -ArgumentList '-m', 'http.server', '8000' -WorkingDirectory $frontend | Out-Null
} else {
  Write-Warning "Python was not found, so the frontend preview server was not started."
}

Start-Process cmd.exe -ArgumentList '/k', "cd /d `"$backend`" && set NODE_ENV=development&& set CORS_ORIGIN=http://localhost:8000,http://127.0.0.1:8000,http://$lanIp:8000,http://localhost:4000,http://127.0.0.1:4000,http://$lanIp:4000&& set HTTPS_ENABLED=false&& set HTTPS_ENFORCE=false&& `"$node`" src/server.js" | Out-Null
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Frontend: http://localhost:8000/"
Write-Host "App is running at http://localhost:4000/"
Write-Host "Open on phone: http://$lanIp:4000/"
Write-Host "API health: http://localhost:4000/api/health"
