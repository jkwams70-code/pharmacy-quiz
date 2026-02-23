$base = "http://localhost:4000/api"
$adminKey = "pharmacy-quiz-admin-key-2026"

Write-Host "=== PHARMACY QUIZ BACKEND API TESTS ===" -ForegroundColor Cyan
Write-Host "`n[1] Health Check" -ForegroundColor Green
$health = Invoke-WebRequest -Uri "$base/health" | ConvertFrom-Json
Write-Host "✓ Status: $($health.status)"

Write-Host "`n[2] Get Categories" -ForegroundColor Green
$categories = Invoke-WebRequest -Uri "$base/categories" | ConvertFrom-Json
Write-Host "✓ Found categories: $($categories.categories -join ', ')"

Write-Host "`n[3] Get Questions" -ForegroundColor Green
$questions = Invoke-WebRequest -Uri "$base/questions?limit=3" | ConvertFrom-Json
Write-Host "✓ Total questions: $($questions.total)"
Write-Host "✓ First question: $($questions.questions[0].text)"

Write-Host "`n[4] Register User" -ForegroundColor Green
$regBody = @{
    name = "John Test"
    email = "john@test.com"
    password = "password123"
} | ConvertTo-Json

$reg = Invoke-WebRequest -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body $regBody -ErrorAction SilentlyContinue | ConvertFrom-Json
if ($reg.token) {
    Write-Host "✓ User registered with ID: $($reg.user.id)"
    $token = $reg.token
} else {
    Write-Host "✗ Registration failed or user exists"
    $token = $null
}

if ($token) {
    Write-Host "`n[5] Login User" -ForegroundColor Green
    $loginBody = @{
        email = "john@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $login = Invoke-WebRequest -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $loginBody | ConvertFrom-Json
    Write-Host "✓ Logged in, token: $($login.token.Substring(0, 20))..."

    Write-Host "`n[6] Get Profile (Me)" -ForegroundColor Green
    $headers = @{ "Authorization" = "Bearer $($login.token)" }
    $me = Invoke-WebRequest -Uri "$base/auth/me" -Headers $headers | ConvertFrom-Json
    Write-Host "✓ Profile: $($me.name) ($($me.email))"

    Write-Host "`n[7] Start Attempt" -ForegroundColor Green
    $attemptBody = @{
        mode = "study"
        category = $categories.categories[0]
        count = 5
    } | ConvertTo-Json
    
    $attempt = Invoke-WebRequest -Uri "$base/attempts/start" -Method Post -ContentType "application/json" -Body $attemptBody -Headers $headers | ConvertFrom-Json
    Write-Host "✓ Attempt started: $($attempt.attemptId)"
    Write-Host "✓ Questions: $($attempt.questionIds -join ', ')"
    $attemptId = $attempt.attemptId

    Write-Host "`n[8] Answer Question" -ForegroundColor Green
    $answerBody = @{
        questionId = $attempt.questionIds[0]
        answer = $questions.questions[0].options[0]
    } | ConvertTo-Json
    
    $answer = Invoke-WebRequest -Uri "$base/attempts/$attemptId/answer" -Method Post -ContentType "application/json" -Body $answerBody -Headers $headers | ConvertFrom-Json
    Write-Host "✓ Answer recorded: $($answer.ok)"

    Write-Host "`n[9] Finish Attempt" -ForegroundColor Green
    $finishBody = @{
        answers = @{
            "$($attempt.questionIds[0])" = $questions.questions[0].options[1]
            "$($attempt.questionIds[1])" = $questions.questions[0].options[0]
        }
        durationSeconds = 120
    } | ConvertTo-Json
    
    $finish = Invoke-WebRequest -Uri "$base/attempts/$attemptId/finish" -Method Post -ContentType "application/json" -Body $finishBody -Headers $headers | ConvertFrom-Json
    Write-Host "✓ Attempt finished"
    Write-Host "✓ Score: $($finish.attempt.score)/$($finish.attempt.total) ($($finish.attempt.percent)%)"

    Write-Host "`n[10] Get History" -ForegroundColor Green
    $history = Invoke-WebRequest -Uri "$base/attempts/history" -Headers $headers | ConvertFrom-Json
    Write-Host "✓ Total attempts: $($history.attempts.Count)"

    Write-Host "`n[11] Get Dashboard" -ForegroundColor Green
    $dashboard = Invoke-WebRequest -Uri "$base/dashboard" -Headers $headers | ConvertFrom-Json
    Write-Host "✓ Overall accuracy: $($dashboard.overallAccuracy)%"
    Write-Host "✓ Categories: $($dashboard.categories.Count)"

    Write-Host "`n[12] Sync Performance" -ForegroundColor Green
    $syncBody = @{
        questionId = $attempt.questionIds[0]
        isCorrect = $true
        category = $categories.categories[0]
    } | ConvertTo-Json
    
    $sync = Invoke-WebRequest -Uri "$base/sync/performance" -Method Post -ContentType "application/json" -Body $syncBody -Headers $headers | ConvertFrom-Json
    Write-Host "✓ Performance synced: $($sync.ok)"

    Write-Host "`n[13] Anonymous Session Tracking" -ForegroundColor Green
    $anonHeaders = @{ "x-client-id" = "test-client-123" }
    $sessionBody = @{
        mode = "exam"
        score = 8
        total = 10
        percent = 80
        duration = "5m 32s"
    } | ConvertTo-Json
    
    $session = Invoke-WebRequest -Uri "$base/sync/sessions" -Method Post -ContentType "application/json" -Body $sessionBody -Headers $anonHeaders | ConvertFrom-Json
    Write-Host "✓ Session tracked: $($session.ok)"
}

Write-Host "`n[14] Admin Seed Questions" -ForegroundColor Green
$adminHeaders = @{ "x-admin-key" = $adminKey }
$seed = Invoke-WebRequest -Uri "$base/admin/seed-questions" -Method Post -Headers $adminHeaders | ConvertFrom-Json
Write-Host "✓ Database status: $($seed.seeded)"

Write-Host "`n=== ALL TESTS COMPLETE ===" -ForegroundColor Cyan
