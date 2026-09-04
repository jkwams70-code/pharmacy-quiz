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

function Sync-AndroidAssets {
  $sourceDir = Join-Path $repoRoot "www"
  $androidAssetsDir = Join-Path $repoRoot "android\app\src\main\assets\public"
  $downloadDir = Join-Path $sourceDir "downloads"

  if (-not (Test-Path $sourceDir)) {
    Write-Host "Skipping Android sync: source directory missing."
    return
  }

  if (-not (Test-Path $androidAssetsDir)) {
    Write-Host "Skipping Android sync: Android assets directory missing."
    return
  }

  Write-Host "Syncing Android assets from www/..."
  robocopy $sourceDir $androidAssetsDir /MIR /XD $downloadDir /NFL /NDL /NJH /NJS /NP /R:1 /W:1 | Out-Null
  $syncCode = $LASTEXITCODE
  if ($syncCode -ge 8) {
    throw "Android asset sync failed with robocopy exit code $syncCode"
  }

  $staleDownloadDir = Join-Path $androidAssetsDir "downloads"
  if (Test-Path $staleDownloadDir) {
    Remove-Item $staleDownloadDir -Recurse -Force
  }
}

Write-Host "Repository: $repoRoot"
Write-Host "Branch target: $Branch"

Sync-AndroidAssets

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
