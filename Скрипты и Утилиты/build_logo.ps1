Add-Type -AssemblyName System.Drawing

$width = 512
$height = 512
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

# Points
$pTopLeft = New-Object System.Drawing.Point(186, 140)
$pTopRight = New-Object System.Drawing.Point(326, 140)
$pMidLeft = New-Object System.Drawing.Point(126, 210)
$pMidRight = New-Object System.Drawing.Point(386, 210)
$pBottom = New-Object System.Drawing.Point(256, 350)

$pMidTop = New-Object System.Drawing.Point(256, 140)
$pCenterLeft = New-Object System.Drawing.Point(221, 210)
$pCenterRight = New-Object System.Drawing.Point(291, 210)

$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 167, 200, 255), 3)

# Brushes
$b1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 59, 130, 246))
$b2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 14, 165, 233))
$b3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 125, 211, 252))
$b4 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 29, 78, 216))
$b5 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 56, 189, 248))
$b6 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 3, 105, 161))

$g.FillPolygon($b1, [System.Drawing.Point[]]@($pTopLeft, $pMidTop, $pCenterLeft, $pMidLeft))
$g.FillPolygon($b2, [System.Drawing.Point[]]@($pMidTop, $pTopRight, $pMidRight, $pCenterRight))
$g.FillPolygon($b3, [System.Drawing.Point[]]@($pTopLeft, $pTopRight, $pCenterRight, $pCenterLeft))
$g.FillPolygon($b4, [System.Drawing.Point[]]@($pMidLeft, $pCenterLeft, $pBottom))
$g.FillPolygon($b5, [System.Drawing.Point[]]@($pCenterLeft, $pCenterRight, $pBottom))
$g.FillPolygon($b6, [System.Drawing.Point[]]@($pCenterRight, $pMidRight, $pBottom))

$g.DrawPolygon($pen, [System.Drawing.Point[]]@($pTopLeft, $pTopRight, $pMidRight, $pBottom, $pMidLeft))
$g.DrawLine($pen, $pTopLeft, $pTopRight)
$g.DrawLine($pen, $pMidLeft, $pMidRight)
$g.DrawLine($pen, $pMidTop, $pBottom)

$font = New-Object System.Drawing.Font('Arial', 34, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center

$g.DrawString('АЛМАС', $font, $textBrush, 256, 375, $sf)

$targetPath = 'c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\almas_user_logo_transparent.png'
$bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "ALMAS logo created successfully at: $targetPath"
