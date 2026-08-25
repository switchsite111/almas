Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ARDORTIMUR\.gemini\antigravity-ide\brain\e534905d-9cdb-494d-ac15-be6f5dcf0cc6\media__1785135060350.jpg"

if (-not (Test-Path $srcPath)) {
    $srcPath = "C:\Users\ARDORTIMUR\.gemini\antigravity-ide\brain\e534905d-9cdb-494d-ac15-be6f5dcf0cc6\media__1785108884787.jpg"
}

Write-Host "Opening source logo image from: $srcPath"
$img = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $img.Width
$height = $img.Height

$outBmp = New-Object System.Drawing.Bitmap($width, $height)

for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $pixel = $img.GetPixel($x, $y)
        # Check if near black background
        if ($pixel.R -lt 38 -and $pixel.G -lt 38 -and $pixel.B -lt 38) {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $outBmp.SetPixel($x, $y, $pixel)
        }
    }
}

$img.Dispose()

$targetFolders = @(
    "c:\Users\ARDORTIMUR\Downloads\сайт алмас",
    "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)",
    "c:\Users\ARDORTIMUR\Downloads\алмас"
)

foreach ($folder in $targetFolders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }
    $p1 = Join-Path $folder "almas_user_logo_transparent.png"
    $p2 = Join-Path $folder "almas_logo.png"
    $p3 = Join-Path $folder "logo.png"
    
    $outBmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Save($p3, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Saved transparent user logo to: $folder"
}

$outBmp.Dispose()
Write-Host "Background removal and logo deployment completed successfully!"
