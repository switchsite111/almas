$source = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)"
$targetName = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("0YHQsNC50YIg0LDQu9C80LDRgQ=="))
$target = Join-Path "c:\Users\ARDORTIMUR\Downloads" $targetName

if (-not (Test-Path $target)) {
    New-Item -Path $target -ItemType Directory -Force
}

Copy-Item -Path "$source\*" -Destination $target -Recurse -Force
Write-Host "SUCCESS: Workspace copied into folder:" $target
