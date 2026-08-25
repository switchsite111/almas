$csvPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\ALMAS_База_Заявок.csv"
$xlsPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\ALMAS_База_Заявок.xls"
$xlsxPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\ALMAS_База_Заявок.xlsx"

# Remove old locked files
Remove-Item $csvPath -ErrorAction SilentlyContinue
Remove-Item $xlsPath -ErrorAction SilentlyContinue
Remove-Item $xlsxPath -ErrorAction SilentlyContinue

$rows = @(
    @("ID Заявки", "Дата и Время", "Тип Заявки", "Имя / Компания", "Контакты", "Детали / Сообщение", "Статус"),
    @("REQ-1001", "2026-07-27 02:40", "Подать КП", "ООО «ТехноСтрой» (Иван Петров)", "info@technostroy.ru | +7 (999) 111-22-33", "Коммерческое предложение по монтажу слаботочных сетей и СКУД на объекте 12 000 кв.м.", "В обработке"),
    @("REQ-1002", "2026-07-27 02:35", "Отклик на вакансию", "Алексей Смирнов", "a.smirnov@mail.ru | +7 (985) 444-55-66", "Отклик на вакансию: Инженер сетевой инфраструктуры (Senior Cisco/Eltex). Опыт 8 лет.", "Получено"),
    @("REQ-1003", "2026-07-27 02:30", "Калькулятор ИТ", "АО «Альфа Инвест»", "alfa@invest.ru | +7 (495) 777-88-99", "Предварительный расчет: 5 серверов, 50 АРМ, СКУД + Техподдержка 24/7. Сумма: 3 180 000 ₽", "В обработке")
)

# Build CSV text
$csvText = ""
foreach ($row in $rows) {
    $line = ($row | ForEach-Object { "`"$_`"" }) -join ";"
    $csvText += $line + "`r`n"
}
[System.IO.File]::WriteAllText($csvPath, $csvText, [System.Text.Encoding]::UTF8)

# Build MS Excel HTML Spreadsheet text
$htmlText = @"
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Заявки ALMAS</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
th { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #334155; padding: 8px; }
td { border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; }
</style>
</head>
<body>
<table>
"@

for ($i = 0; $i -lt $rows.Count; $i++) {
    $tag = if ($i -eq 0) { "th" } else { "td" }
    $htmlText += "<tr>"
    foreach ($cell in $rows[$i]) {
        $htmlText += "<$tag>$cell</$tag>"
    }
    $htmlText += "</tr>`r`n"
}
$htmlText += "</table></body></html>"

[System.IO.File]::WriteAllText($xlsPath, $htmlText, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($xlsxPath, $htmlText, [System.Text.Encoding]::UTF8)

Write-Host "ALL EXCEL FILES GENERATED NATIVELY:"
Write-Host "1. $csvPath"
Write-Host "2. $xlsPath"
Write-Host "3. $xlsxPath"
