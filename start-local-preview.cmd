@echo off
setlocal

set "ROOT=%~dp0"
set "LAN_IP="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "[System.Net.Dns]::GetHostAddresses($env:COMPUTERNAME) ^| Where-Object { $_.AddressFamily -eq 'InterNetwork' -and $_.IPAddressToString -notlike '127.*' -and $_.IPAddressToString -notlike '169.254*' } ^| Select-Object -ExpandProperty IPAddressToString -First 1"`) do set "LAN_IP=%%I"
if not defined LAN_IP set "LAN_IP=localhost"

echo Starting Ajix local preview...
echo.
echo Frontend: http://localhost:8000
echo Admin:    http://localhost:8000/admin
echo API:      http://localhost:4000
echo Phone:    http://%LAN_IP%:8000
echo.

start "Ajix Frontend" cmd /k "cd /d "%ROOT%" && python -m http.server 8000"
start "Ajix Backend" cmd /k "cd /d "%ROOT%backend" && set NODE_ENV=development && set CORS_ORIGIN=* && set TRUST_PROXY=false && set AI_ENABLED=false && npm.cmd start"

echo Two local preview windows were opened.
echo Leave them running while you review the app locally.

endlocal
