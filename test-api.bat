@echo off
setlocal enabledelayedexpansion

set BASE=http://localhost:4000/api
set ADMIN_KEY=pharmacy-quiz-admin-key-2026

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
curl -s -X POST %BASE%/auth/register -H "Content-Type: application/json" -d "{\"name\":\"John Test\",\"email\":\"john@test.com\",\"password\":\"password123\"}"
echo.
echo.

echo [5] Login User
curl -s -X POST %BASE%/auth/login -H "Content-Type: application/json" -d "{\"email\":\"john@test.com\",\"password\":\"password123\"}"
echo.
echo.

echo [6] Get Categories again for exam
curl -s %BASE%/categories
echo.
echo.

echo ===== API TESTS COMPLETE =====
