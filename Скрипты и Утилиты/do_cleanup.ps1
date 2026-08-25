$folderName = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("0YHQsNC50YIg0LDQu9C80LDRgQ=="))
$targetDir = Join-Path "c:\Users\ARDORTIMUR\Downloads" $folderName
$resName = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("0YDQtdGB0YPRgNGB0Ysg0Lgg0YHQutGA0LjQv9GC0YsgKNCB0KDQpdCY0JIp"))
$resDir = Join-Path $targetDir $resName

if (-not (Test-Path $resDir)) {
    New-Item -Path $resDir -ItemType Directory -Force | Out-Null
}

Get-ChildItem -Path $targetDir -File | ForEach-Object {
    $name = $_.Name
    if ($name -ne "index.html" -and $name -ne "almas_user_logo_transparent.png" -and $name -ne "ALMAS_База_Заявок.xlsx") {
        Move-Item -Path $_.FullName -Destination $resDir -Force
    }
}

Get-ChildItem -Path $targetDir -Directory | ForEach-Object {
    if ($_.Name -ne $resName) {
        Move-Item -Path $_.FullName -Destination $resDir -Force
    }
}

Write-Host "CLEANUP FINISHED SUCCESSFULLY!"
