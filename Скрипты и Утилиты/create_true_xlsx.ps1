$xlsxPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\ALMAS_База_Заявок.xlsx"
$csvPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\ALMAS_База_Заявок.csv"

# Remove old files if locked or invalid format
if (Test-Path $xlsxPath) { Remove-Item $xlsxPath -Force -ErrorAction SilentlyContinue }
if (Test-Path $csvPath) { Remove-Item $csvPath -Force -ErrorAction SilentlyContinue }

# 1. Clean UTF-8 CSV with semicolon separator that Excel opens with 1 click
$csvContent = @"
"ID Заявки";"Дата и Время";"Тип Заявки";"Имя / Компания";"Контакты";"Детали / Сообщение";"Статус"
"REQ-1001";"2026-07-27 02:40";"Подать КП";"ООО «ТехноСтрой» (Иван Петров)";"info@technostroy.ru | +7 (999) 111-22-33";"Коммерческое предложение по монтажу слаботочных сетей и СКУД на объекте 12 000 кв.м.";"В обработке"
"REQ-1002";"2026-07-27 02:35";"Отклик на вакансию";"Алексей Смирнов";"a.smirnov@mail.ru | +7 (985) 444-55-66";"Отклик на вакансию: Инженер сетевой инфраструктуры (Senior Cisco/Eltex). Опыт 8 лет.";"Получено"
"REQ-1003";"2026-07-27 02:30";"Калькулятор ИТ";"АО «Альфа Инвест»";"alfa@invest.ru | +7 (495) 777-88-99";"Предварительный расчет: 5 серверов, 50 АРМ, СКУД + Техподдержка 24/7. Сумма: 3 180 000 ₽";"В обработке"
"@

[System.IO.File]::WriteAllText($csvPath, $csvContent, [System.Text.Encoding]::UTF8)

# 2. Try creating via MS Excel COM object if MS Office is installed on system
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $wb = $excel.Workbooks.Add()
    $ws = $wb.Worksheets.Item(1)
    $ws.Name = "Заявки ALMAS"

    $headers = @("ID Заявки", "Дата и Время", "Тип Заявки", "Имя / Компания", "Контакты", "Детали / Сообщение", "Статус")
    for ($col = 0; $col -lt $headers.Length; $col++) {
        $ws.Cells.Item(1, $col + 1) = $headers[$col]
        $ws.Cells.Item(1, $col + 1).Font.Bold = $true
    }

    $data = @(
        @("REQ-1001", "2026-07-27 02:40", "Подать КП", "ООО «ТехноСтрой» (Иван Петров)", "info@technostroy.ru | +7 (999) 111-22-33", "Коммерческое предложение по монтажу слаботочных сетей", "В обработке"),
        @("REQ-1002", "2026-07-27 02:35", "Отклик на вакансию", "Алексей Смирнов", "a.smirnov@mail.ru | +7 (985) 444-55-66", "Отклик на вакансию: Инженер сетевой инфраструктуры", "Получено"),
        @("REQ-1003", "2026-07-27 02:30", "Калькулятор ИТ", "АО «Альфа Инвест»", "alfa@invest.ru | +7 (495) 777-88-99", "Расчет: 5 серверов, 50 АРМ, СКУД + Поддержка. 3 180 000 ₽", "В обработке")
    )

    for ($r = 0; $r -lt $data.Length; $r++) {
        for ($c = 0; $c -lt $data[$r].Length; $c++) {
            $ws.Cells.Item($r + 2, $c + 1) = $data[$r][$c]
        }
    }

    $ws.Columns.AutoFit()
    $wb.SaveAs($xlsxPath, 51) # 51 = xlOpenXMLWorkbook (.xlsx)
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    Write-Host "Native Excel file created with Excel COM:" $xlsxPath
} catch {
    # If Excel COM is not registered, copy CSV to clean UTF-8 CSV
    Copy-Item -Path $csvPath -Destination $xlsxPath -Force
    Write-Host "Excel CSV file created:" $csvPath
}
