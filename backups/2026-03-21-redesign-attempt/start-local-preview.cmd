@echo off
setlocal

set "ROOT=%~dp0"

echo Starting Ajix local preview...
echo.
echo Frontend: http://localhost:8000
echo Admin:    http://localhost:8000/admin
echo API:      http://localhost:4000
echo.

start "Ajix Frontend" cmd /k "cd /d "%ROOT%" && python -m http.server 8000"
start "Ajix Backend" cmd /k "cd /d "%ROOT%backend" && set NODE_ENV=development && set CORS_ORIGIN=http://localhost:8000,http://127.0.0.1:8000 && set TRUST_PROXY=false && set AI_ENABLED=false && npm.cmd start"

echo Two local preview windows were opened.
echo Leave them running while you review the app locally.

endlocal
