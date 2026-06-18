$ErrorActionPreference = "Stop"

$base = "http://localhost:4000/api"
$results = @()

function Add-Result {
  param([string]$Name, [bool]$Ok, [string]$Detail)
  $script:results += [PSCustomObject]@{
    check = $Name
    ok = $Ok
    detail = $Detail
  }
}

# Injection-like payloads should not bypass auth.
try {
  Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body (@{
      email = "' OR 1=1 --"
      password = "' OR 1=1 --"
    } | ConvertTo-Json) -ErrorAction Stop | Out-Null
  Add-Result "Auth bypass payload rejected" $false "unexpected login success"
} catch {
  $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { -1 }
  Add-Result "Auth bypass payload rejected" ($status -in 400, 401) "status=$status"
}

# Query injection-like string should not crash API.
try {
  $resp = Invoke-RestMethod -Uri "$base/questions?category=';DROP TABLE users;--" -Method Get -ErrorAction Stop
  $ok = $null -ne $resp.questions
  Add-Result "Query injection-like payload safe" $ok "questionsReturned=$(@($resp.questions).Count)"
} catch {
  Add-Result "Query injection-like payload safe" $false $_.Exception.Message
}

# Admin endpoint with bad key must be blocked.
try {
  Invoke-RestMethod -Uri "$base/admin/stats" -Headers @{ "x-admin-key" = "bad-key" } -ErrorAction Stop | Out-Null
  Add-Result "Admin unauthorized blocked" $false "unexpected admin access"
} catch {
  $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { -1 }
  Add-Result "Admin unauthorized blocked" ($status -in 401, 403) "status=$status"
}

# Invalid sync payload should return handled 4xx, not 5xx.
try {
  Invoke-RestMethod -Uri "$base/sync/sessions" -Method Post -ContentType "application/json" -Body (@{
      mode = "study"
      score = -1
      total = -1
      percent = 999
    } | ConvertTo-Json) -ErrorAction Stop | Out-Null
  Add-Result "Invalid payload handled safely" $false "unexpected success"
} catch {
  $status = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { -1 }
  Add-Result "Invalid payload handled safely" ($status -eq 400) "status=$status"
}

$pass = @($results | Where-Object { $_.ok }).Count
$fail = @($results | Where-Object { -not $_.ok }).Count
[PSCustomObject]@{
  passed = $pass
  failed = $fail
  total = $results.Count
} | Format-List

$results | Format-Table -AutoSize

if ($fail -gt 0) {
  exit 1
}
