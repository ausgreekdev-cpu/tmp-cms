param(
  [string]$OutputDir = "release"
)

$ErrorActionPreference = "Stop"
$base = Split-Path $PSScriptRoot -Parent
Push-Location $base

try {
  Write-Host "=== Building frontend ==="
  Push-Location frontend
  npm run build
  if (-not $?) { throw "Frontend build failed" }
  Pop-Location

  Write-Host "=== Packaging Electron app ==="
  # Build without --prune (causes missing files) 
  npx electron-packager . TMP-CMS --platform=win32 --arch=x64 --out=$OutputDir --overwrite --ignore='release' --ignore='\.git'
  if (-not $?) { throw "Packaging failed" }

  Write-Host "=== Fixing missing node_modules files ==="
  $pkgDir = "$base\$OutputDir\TMP-CMS-win32-x64\resources\app\backend\node_modules"
  $srcDir = "$base\backend\node_modules"

  # List of known missing files that packaging drops
  $missing = @(
    "semver\functions\prerelease.js"
  )

  foreach ($f in $missing) {
    $srcFile = "$srcDir\$f"
    $dstFile = "$pkgDir\$f"
    if (Test-Path $srcFile) {
      $dstParent = Split-Path $dstFile -Parent
      if (-not (Test-Path $dstParent)) { New-Item -ItemType Directory -Path $dstParent -Force | Out-Null }
      Copy-Item $srcFile $dstFile -Force
      Write-Host "  Fixed: $f"
    }
  }

  Write-Host "=== Bundling node.exe ==="
  $nodeSrc = (Get-Command node).Source
  $nodeDst = "$base\$OutputDir\TMP-CMS-win32-x64\resources\node.exe"
  Copy-Item $nodeSrc $nodeDst -Force
  Write-Host "  Bundled: node.exe ($((Get-Item $nodeDst).Length / 1MB) MB)"

  Write-Host "=== Done ==="
  $exe = "$base\$OutputDir\TMP-CMS-win32-x64\TMP-CMS.exe"
  Write-Host "EXE: $exe"
}
finally {
  Pop-Location
}
