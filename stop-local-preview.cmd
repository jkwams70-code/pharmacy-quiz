@echo off
setlocal

echo Stopping common local preview processes...
taskkill /FI "WINDOWTITLE eq Ajix Frontend" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Ajix Backend" /T /F >nul 2>nul

echo Done.

endlocal
