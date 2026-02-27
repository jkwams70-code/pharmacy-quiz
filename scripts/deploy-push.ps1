param(
  [Parameter(Mandatory = $false)]
  [string]$Message = "chore: update deployment",

  [Parameter(Mandatory = $false)]
  [string]$Branch = "deploy-baseline",

  [Parameter(Mandatory = $false)]
  [switch]$Yes
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Repository: $repoRoot"
Write-Host "Branch target: $Branch"

cmd /c git add -A

$statusOutput = (cmd /c git status --short)
if (-not $statusOutput) {
  Write-Host "No changes to commit."
  exit 0
}

Write-Host "Changes staged for commit:"
Write-Host $statusOutput

if (-not $Yes) {
  $answer = Read-Host "Commit and push these changes to '$Branch'? (y/N)"
  if ($answer -notmatch "^(y|yes)$") {
    Write-Host "Cancelled. Nothing was committed."
    exit 0
  }
}

cmd /c git commit -m "$Message"
cmd /c git push origin "HEAD:$Branch"

Write-Host "Push complete."
