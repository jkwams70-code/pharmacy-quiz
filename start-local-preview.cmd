@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "PORT=4000"
set "NODE_ENV=development"
set "CORS_ORIGIN=http://localhost:%PORT%,http://127.0.0.1:%PORT%"
set "HTTPS_ENABLED=false"
set "HTTPS_ENFORCE=false"

if not exist "%BACKEND%\package.json" (
  echo Could not find backend at "%BACKEND%".
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%start-local-preview.ps1"
