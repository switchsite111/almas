$files = Get-ChildItem -Path "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)" -Filter "*База_Заявок*"

foreach ($file in $files) {
    Copy-Item -Path $file.FullName -Destination "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\stitch_almas_system_integration_portal\" -Force
    Get-ChildItem -Path "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\stitch_almas_system_integration_portal" -Directory | ForEach-Object {
        Copy-Item -Path $file.FullName -Destination "$($_.FullName)\" -Force
    }
}

Write-Host "Excel database files synced across all subfolders successfully!"
