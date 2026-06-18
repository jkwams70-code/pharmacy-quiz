$ErrorActionPreference = "Stop"

$base = "http://localhost:4000/api"
$envPath = Join-Path $PSScriptRoot ".env"
$adminKey = (Get-Content $envPath | Where-Object { $_ -match "^ADMIN_KEY=" }) -replace "^ADMIN_KEY=", ""
$adminKey = $adminKey.Trim()

Write-Host "=== PHARMACY QUIZ BACKEND API TESTS ===" -ForegroundColor Cyan

Write-Host "`n[1] Health Check" -ForegroundColor Green
$health = Invoke-RestMethod -Uri "$base/health" -Method Get
Write-Host "OK Status: $($health.status)"

Write-Host "`n[2] Get Categories" -ForegroundColor Green
$categories = Invoke-RestMethod -Uri "$base/categories" -Method Get
Write-Host "OK Categories: $($categories.categories.Count)"

Write-Host "`n[3] Get Questions" -ForegroundColor Green
$questions = Invoke-RestMethod -Uri "$base/questions?limit=3" -Method Get
Write-Host "OK Returned: $($questions.questions.Count)"

$email = "apitest+$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@example.com"
$password = "p@" + [guid]::NewGuid().ToString("N")

Write-Host "`n[4] Register User" -ForegroundColor Green
$regBody = @{
  name = "John Test"
  email = $email
  password = $password
} | ConvertTo-Json
$reg = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body $regBody
Write-Host "OK Registered: $($reg.user.id)"

Write-Host "`n[5] Login User" -ForegroundColor Green
$loginBody = @{
  email = $email
  password = $password
} | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$headers = @{ "Authorization" = "Bearer $($login.token)" }
Write-Host "OK Login token issued"

Write-Host "`n[6] Get Profile" -ForegroundColor Green
$me = Invoke-RestMethod -Uri "$base/auth/me" -Method Get -Headers $headers
Write-Host "OK Profile: $($me.email)"

Write-Host "`n[7] Start Attempt" -ForegroundColor Green
$attemptBody = @{
  mode = "study"
  category = "all"
  count = 5
} | ConvertTo-Json
$attempt = Invoke-RestMethod -Uri "$base/attempts/start" -Method Post -ContentType "application/json" -Body $attemptBody -Headers $headers
Write-Host "OK Attempt: $($attempt.attemptId)"

Write-Host "`n[8] Answer Question" -ForegroundColor Green
$answerBody = @{
  questionId = $attempt.questionIds[0]
  answer = "A"
} | ConvertTo-Json
$answer = Invoke-RestMethod -Uri "$base/attempts/$($attempt.attemptId)/answer" -Method Post -ContentType "application/json" -Body $answerBody -Headers $headers
Write-Host "OK Answer recorded: $($answer.ok)"

Write-Host "`n[9] Finish Attempt" -ForegroundColor Green
$finishBody = @{
  answers = @{
    "$($attempt.questionIds[0])" = "A"
  }
  durationSeconds = 120
} | ConvertTo-Json -Depth 5
$finish = Invoke-RestMethod -Uri "$base/attempts/$($attempt.attemptId)/finish" -Method Post -ContentType "application/json" -Body $finishBody -Headers $headers
Write-Host "OK Finished score: $($finish.attempt.score)/$($finish.attempt.total)"

Write-Host "`n[10] Get History" -ForegroundColor Green
$history = Invoke-RestMethod -Uri "$base/attempts/history" -Method Get -Headers $headers
Write-Host "OK Attempts: $($history.attempts.Count)"

Write-Host "`n[11] Get Dashboard" -ForegroundColor Green
$dashboard = Invoke-RestMethod -Uri "$base/dashboard" -Method Get -Headers $headers
Write-Host "OK Accuracy: $($dashboard.overallAccuracy)%"

Write-Host "`n[12] Sync Performance" -ForegroundColor Green
$syncBody = @{
  questionId = $attempt.questionIds[0]
  isCorrect = $true
  category = "General"
} | ConvertTo-Json
$sync = Invoke-RestMethod -Uri "$base/sync/performance" -Method Post -ContentType "application/json" -Body $syncBody -Headers $headers
Write-Host "OK Performance synced: $($sync.ok)"

Write-Host "`n[13] Sync Session" -ForegroundColor Green
$sessionBody = @{
  mode = "exam"
  score = 8
  total = 10
  percent = 80
  duration = "5m 32s"
} | ConvertTo-Json
$session = Invoke-RestMethod -Uri "$base/sync/sessions" -Method Post -ContentType "application/json" -Body $sessionBody -Headers $headers
Write-Host "OK Session tracked: $($session.ok)"

Write-Host "`n[14] Sync History" -ForegroundColor Green
$syncHistory = Invoke-RestMethod -Uri "$base/sync/history" -Method Get -Headers $headers
Write-Host "OK Session history entries: $($syncHistory.sessions.Count)"

Write-Host "`n[15] Admin Stats" -ForegroundColor Green
$adminHeaders = @{ "x-admin-key" = $adminKey }
$stats = Invoke-RestMethod -Uri "$base/admin/stats" -Method Get -Headers $adminHeaders
Write-Host "OK Total users: $($stats.totalUsers)"

Write-Host "`n[16] Admin Seed Questions" -ForegroundColor Green
$seed = Invoke-RestMethod -Uri "$base/admin/seed-questions" -Method Post -Headers $adminHeaders
Write-Host "OK Seed endpoint reachable (seeded=$($seed.seeded))"

Write-Host "`n=== ALL TESTS COMPLETE ===" -ForegroundColor Cyan
