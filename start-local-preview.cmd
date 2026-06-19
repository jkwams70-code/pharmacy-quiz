@echo off
setlocal

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%"
set "BACKEND=%ROOT%backend"
set "LOCAL_IP="

for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$ip = Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and $_.InterfaceOperationalStatus -eq 'Up' } ^| Select-Object -First 1 -ExpandProperty IPAddress; if ($ip) { $ip }"`) do set "LOCAL_IP=%%I"

if defined LOCAL_IP (
  set "PREVIEW_CORS=http://localhost:8000,http://127.0.0.1:8000,http://%LOCAL_IP%:8000,http://localhost:4000,http://127.0.0.1:4000,http://%LOCAL_IP%:4000"
) else (
  set "PREVIEW_CORS=http://localhost:8000,http://127.0.0.1:8000,http://localhost:4000,http://127.0.0.1:4000"
)

if not exist "%FRONTEND%\index.html" (
  echo Frontend files were not found at:
  echo   %FRONTEND%
  echo.
  echo Run this file from the AjixPharmacy repository root.
  exit /b 1
)

if not exist "%BACKEND%\package.json" (
  echo Backend package.json was not found at:
  echo   %BACKEND%
  echo.
  echo Run this file from the AjixPharmacy repository root.
  exit /b 1
)

echo Starting Ajix local preview...
echo.
echo Frontend: http://localhost:8000
echo Admin:    http://localhost:8000/admin
echo API:      http://localhost:4000
if defined LOCAL_IP echo LAN:      http://%LOCAL_IP%:8000
echo.

start "Ajix Frontend" cmd /k "cd /d ""%FRONTEND%"" && (py -m http.server 8000 || python -m http.server 8000)"
start "Ajix Backend" cmd /k "cd /d ""%BACKEND%"" && set NODE_ENV=development && set CORS_ORIGIN=%PREVIEW_CORS% && npm.cmd run dev"

timeout /t 2 /nobreak >nul
start "" http://localhost:8000

echo Two local preview windows were opened.
echo Leave them running while you review the app locally.

endlocal
