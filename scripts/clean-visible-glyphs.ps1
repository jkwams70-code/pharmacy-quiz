$ErrorActionPreference = 'Stop'

function Normalize-VisibleGlyphs {
  param([string]$Text)

  if ($null -eq $Text) {
    return $Text
  }

  $replacements = @(
    @('Ã—', '×'),
    @('Â·', '·'),
    @('â€¦', '…'),
    @('â€”', '—'),
    @('â†’', '→'),
    @('â†', '←'),
    @('â†‘', '↑'),
    @('â†“', '↓'),
    @('âœ•', '✕'),
    @('âœŽ', '✎'),
    @('ðŸ—‘', '🗑'),
    @('ðŸ‘', '👁')
  )

  foreach ($pair in $replacements) {
    $Text = $Text.Replace($pair[0], $pair[1])
  }

  $Text = $Text.Replace("�", "")

  return $Text
}

function Update-TextFile {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [switch]$LineScoped
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return $false
  }

  $original = Get-Content -LiteralPath $Path -Raw
  $updated = $original

  if ($LineScoped) {
    $lines = Get-Content -LiteralPath $Path
    for ($i = 0; $i -lt $lines.Count; $i++) {
      $lineNumber = $i + 1
      if (($lineNumber -ge 31690 -and $lineNumber -le 31730) -or ($lineNumber -ge 35040 -and $lineNumber -le 35060)) {
        $lines[$i] = Normalize-VisibleGlyphs $lines[$i]
      }
    }
    $updated = $lines -join [Environment]::NewLine
    if ($original.EndsWith([Environment]::NewLine)) {
      $updated += [Environment]::NewLine
    }
  }
  else {
    $updated = Normalize-VisibleGlyphs $updated
  }

  if ($updated -ne $original) {
    Set-Content -LiteralPath $Path -Value $updated -Encoding utf8
    Write-Host "Updated $Path"
    return $true
  }

  return $false
}

$root = Split-Path -Parent $PSScriptRoot
$targets = @(
  Join-Path $root 'www\admin\news-studio.html',
  Join-Path $root 'admin\news-studio.html',
  Join-Path $root 'android\app\src\main\assets\public\admin\news-studio.html',
  Join-Path $root 'www\news.html',
  Join-Path $root 'android\app\src\main\assets\public\news.html',
  Join-Path $root 'www\news-story.html',
  Join-Path $root 'android\app\src\main\assets\public\news-story.html',
  Join-Path $root 'admin\index.html',
  Join-Path $root 'www\engine.js',
  Join-Path $root 'android\app\src\main\assets\public\engine.js'
)

$changed = 0
foreach ($target in $targets) {
  if ($target -like '*engine.js') {
    if (Update-TextFile -Path $target -LineScoped) {
      $changed++
    }
  }
  else {
    if (Update-TextFile -Path $target) {
      $changed++
    }
  }
}

Write-Host "Files changed: $changed"
