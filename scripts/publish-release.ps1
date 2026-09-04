param(
  [Parameter(Mandatory = $false)]
  [string]$Version = "",

  [Parameter(Mandatory = $false)]
  [string]$Branch = "",

  [Parameter(Mandatory = $false)]
  [string]$Server = "root@139.84.233.243",

  [Parameter(Mandatory = $false)]
  [switch]$NoDeploy
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
Set-Location $repoRoot

function Get-GitBranch {
  $name = (git branch --show-current).Trim()
  if (-not $name) {
    throw "Unable to determine the current git branch."
  }
  return $name
}

function Read-JsonFile([string]$Path) {
  return Get-Content $Path -Raw | ConvertFrom-Json
}

function Write-JsonFile([string]$Path, $Value) {
  ($Value | ConvertTo-Json -Depth 8) + [Environment]::NewLine | Set-Content $Path -NoNewline
}

function Get-NextPatchVersion([string]$CurrentVersion) {
  if ($CurrentVersion -notmatch '^(\d+)\.(\d+)\.(\d+)$') {
    throw "Version '$CurrentVersion' is not in major.minor.patch format."
  }
  $major = [int]$Matches[1]
  $minor = [int]$Matches[2]
  $patch = [int]$Matches[3] + 1
  return "$major.$minor.$patch"
}

function Get-VersionCode([string]$VersionText) {
  $digits = ($VersionText -replace '\D', '')
  if (-not $digits) {
    throw "Unable to derive a version code from '$VersionText'."
  }
  return [int]$digits
}

function Update-VersionFiles([string]$ReleaseVersion) {
  $appUpdatePath = Join-Path $repoRoot "www\app-update.json"
  $indexPath = Join-Path $repoRoot "www\index.html"
  $buildGradlePath = Join-Path $repoRoot "android\app\build.gradle"

  $appUpdate = Read-JsonFile $appUpdatePath
  $appUpdate.latestVersion = $ReleaseVersion
  $appUpdate.apkUrl = "https://ajixpharmacy.online/downloads/ajix-pharm.apk"
  Write-JsonFile $appUpdatePath $appUpdate

  $buildGradle = Get-Content $buildGradlePath -Raw
  $buildGradle = [regex]::Replace($buildGradle, 'versionCode\s+\d+', "versionCode $(Get-VersionCode $ReleaseVersion)")
  $buildGradle = [regex]::Replace($buildGradle, 'versionName\s+"[^"]+"', "versionName `"$ReleaseVersion`"")
  [System.IO.File]::WriteAllText($buildGradlePath, $buildGradle, [System.Text.UTF8Encoding]::new($false))

  $indexHtml = Get-Content $indexPath -Raw
  $indexHtml = [regex]::Replace($indexHtml, 'const APP_NATIVE_VERSION = "[^"]+";', "const APP_NATIVE_VERSION = `"$ReleaseVersion`";")
  [System.IO.File]::WriteAllText($indexPath, $indexHtml, [System.Text.UTF8Encoding]::new($false))
}

function Sync-AndroidAssets {
  $sourceDir = Join-Path $repoRoot "www"
  $androidAssetsDir = Join-Path $repoRoot "android\app\src\main\assets\public"
  $downloadDir = Join-Path $sourceDir "downloads"

  if (-not (Test-Path $sourceDir) -or -not (Test-Path $androidAssetsDir)) {
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

function Get-GradleBatPath {
  $cached = Get-ChildItem -Path (Join-Path $env:USERPROFILE ".gradle\wrapper\dists") -Recurse -Filter gradle.bat -File -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($cached) {
    return $cached.FullName
  }
  $gradleCmd = Get-Command gradle -ErrorAction SilentlyContinue
  if ($gradleCmd) {
    return $gradleCmd.Source
  }
  throw "Gradle was not found. Install Android Studio or Gradle, then retry."
}

function Build-ReleaseApk {
  $gradleBat = Get-GradleBatPath
  $env:ANDROID_SDK_ROOT = Join-Path $env:LOCALAPPDATA "Android\Sdk"
  Write-Host "Building release APK..."
  Push-Location (Join-Path $repoRoot "android")
  try {
    & $gradleBat assembleRelease --no-daemon --console=plain
  } finally {
    Pop-Location
  }
}

function Copy-ReleaseApk {
  $apkSource = Join-Path $repoRoot "android\app\build\outputs\apk\release\app-release.apk"
  if (-not (Test-Path $apkSource)) {
    throw "Release APK was not produced at '$apkSource'."
  }
  $downloadDir = Join-Path $repoRoot "www\downloads"
  New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
  Copy-Item $apkSource (Join-Path $downloadDir "ajix-pharm.apk") -Force
}

$currentBranch = if ($Branch) { $Branch } else { Get-GitBranch }
$currentVersion = (Read-JsonFile (Join-Path $repoRoot "www\app-update.json")).latestVersion
$releaseVersion = if ($Version) { $Version } else { Get-NextPatchVersion $currentVersion }
$commitMessage = "release: Ajix Pharm $releaseVersion"

Write-Host "Repository: $repoRoot"
Write-Host "Branch: $currentBranch"
Write-Host "Release version: $releaseVersion"

Update-VersionFiles $releaseVersion
Sync-AndroidAssets
Build-ReleaseApk
Copy-ReleaseApk

if ($NoDeploy) {
  Write-Host "Skipping push and VPS deploy because -NoDeploy was specified."
  exit 0
}

Write-Host "Publishing release through the existing deployment flow..."
powershell -ExecutionPolicy Bypass -File (Join-Path $scriptRoot "deploy-all.ps1") -Message $commitMessage -Branch $currentBranch -Yes
