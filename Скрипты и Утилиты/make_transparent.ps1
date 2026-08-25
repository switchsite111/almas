Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\almas_user_logo.jpg"
$outPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\almas_user_logo_transparent.png"

$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
$bmp.MakeTransparent([System.Drawing.Color]::Black)

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 40 -and $p.G -lt 40 -and $p.B -lt 40) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "TRANSPARENT PNG LOGO CREATED AT:" $outPath
