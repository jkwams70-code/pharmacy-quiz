$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root "images\\ajix-logo.png.png"
$targets = @(
  @{ Path = "icons\\favicon-16-s2.png"; Size = 16 },
  @{ Path = "icons\\favicon-32-s2.png"; Size = 32 },
  @{ Path = "icons\\favicon-48-s2.png"; Size = 48 },
  @{ Path = "icons\\favicon-180-s2.png"; Size = 180 },
  @{ Path = "icons\\icon-192-s2.png"; Size = 192 },
  @{ Path = "icons\\icon-512-s2.png"; Size = 512 }
)

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)

$minX = $src.Width
$minY = $src.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $src.Height; $y++) {
  for ($x = 0; $x -lt $src.Width; $x++) {
    $pixel = $src.GetPixel($x, $y)
    if ($pixel.A -gt 10) {
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

$cropWidth = $maxX - $minX + 1
$cropHeight = $maxY - $minY + 1
$crop = New-Object System.Drawing.Bitmap $cropWidth, $cropHeight
$cropGraphics = [System.Drawing.Graphics]::FromImage($crop)
$cropGraphics.DrawImage(
  $src,
  0,
  0,
  [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1),
  [System.Drawing.GraphicsUnit]::Pixel
)
$cropGraphics.Dispose()

foreach ($target in $targets) {
  $size = [int]$target.Size
  $destination = Join-Path $root $target.Path
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $padding = [Math]::Max(0, [int]([Math]::Round($size * 0.02)))
  $box = $size - ($padding * 2)

  if ($cropWidth -ge $cropHeight) {
    $scaledHeight = [int]([Math]::Round($box * $cropHeight / $cropWidth))
    $offsetY = [int](($size - $scaledHeight) / 2)
    $graphics.DrawImage($crop, $padding, $offsetY, $box, $scaledHeight)
  } else {
    $scaledWidth = [int]([Math]::Round($box * $cropWidth / $cropHeight))
    $offsetX = [int](($size - $scaledWidth) / 2)
    $graphics.DrawImage($crop, $offsetX, $padding, $scaledWidth, $box)
  }

  $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$crop.Dispose()
$src.Dispose()
