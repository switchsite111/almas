$targetDir = "c:\Users\ARDORTIMUR\Downloads\сайт алмас"
$resDir = Join-Path $targetDir "ресурсы"

if (-not (Test-Path $resDir)) {
    New-Item -Path $resDir -ItemType Directory -Force
}

Get-ChildItem -Path $targetDir -File | ForEach-Object {
    $name = $_.Name
    if ($name -ne "index.html" -and $name -ne "almas_user_logo_transparent.png" -and $name -ne "ALMAS_База_Заявок.xlsx") {
        Move-Item -Path $_.FullName -Destination $resDir -Force
    }
}

Get-ChildItem -Path $targetDir -Directory | ForEach-Object {
    if ($_.Name -ne "ресурсы") {
        Move-Item -Path $_.FullName -Destination $resDir -Force
    }
}

Write-Host "CLEANUP COMPLETE! Root contains only index.html, logo, and ALMAS_База_Заявок.xlsx!"
