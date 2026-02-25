@echo off
setlocal enabledelayedexpansion

set BASE=http://localhost:4000/api
set ADMIN_KEY=
set TEST_EMAIL=john%RANDOM%%RANDOM%@example.com
set TEST_PASSWORD=p%RANDOM%%RANDOM%%RANDOM%
for /f "tokens=1,* delims==" %%A in ('findstr /B /C:"ADMIN_KEY=" "%~dp0.env"') do set ADMIN_KEY=%%B

echo.
echo ===== PHARMACY QUIZ BACKEND API TESTS =====
echo.

echo [1] Health Check
curl -s %BASE%/health
echo.
echo.

echo [2] Get Categories
curl -s %BASE%/categories
echo.
echo.

echo [3] Get Questions
curl -s "%BASE%/questions?limit=3"
echo.
echo.

echo [4] Register User
curl -s -X POST %BASE%/auth/register -H "Content-Type: application/json" -d "{\"name\":\"John Test\",\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\"}"
echo.
echo.

echo [5] Login User
curl -s -X POST %BASE%/auth/login -H "Content-Type: application/json" -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\"}"
echo.
echo.

echo [6] Get Categories again for exam
curl -s %BASE%/categories
echo.
echo.

if not "%ADMIN_KEY%"=="" (
echo [7] Admin Stats
curl -s -H "x-admin-key: %ADMIN_KEY%" %BASE%/admin/stats
echo.
echo.
)

echo ===== API TESTS COMPLETE =====
