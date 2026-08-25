$csvPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\ALMAS_База_Заявок.csv"
$xlsxPath = "c:\Users\ARDORTIMUR\Downloads\stitch_almas_system_integration_portal(2)\ALMAS_База_Заявок.xlsx"

$initialData = @"
"ID Заявки";"Дата и Время";"Тип Заявки";"Имя / Компания";"Контакты";"Детали / Сообщение";"Статус"
"REQ-1001";"2026-07-27 02:40";"Подать КП";"ООО «ТехноСтрой» (Иван Петров)";"info@technostroy.ru | +7 (999) 111-22-33";"Коммерческое предложение по монтажу слаботочных сетей и СКУД на объекте 12 000 кв.м.";"В обработке"
"REQ-1002";"2026-07-27 02:35";"Отклик на вакансию";"Алексей Смирнов";"a.smirnov@mail.ru | +7 (985) 444-55-66";"Отклик на вакансию: Инженер сетевой инфраструктуры (Senior Cisco/Eltex). Опыт 8 лет.";"Получено"
"REQ-1003";"2026-07-27 02:30";"Калькулятор ИТ";"АО «Альфа Инвест»";"alfa@invest.ru | +7 (495) 777-88-99";"Предварительный расчет: 5 серверов, 50 АРМ, СКУД + Техподдержка 24/7. Сумма: 3 180 000 ₽";"В обработке"
"@

# Write UTF-8 with BOM so Microsoft Excel opens it natively with crisp Russian encoding
[System.IO.File]::WriteAllText($csvPath, $initialData, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($xlsxPath, $initialData, [System.Text.Encoding]::UTF8)

Write-Host "Файлы Excel локальной базы данных успешно созданы:"
Write-Host "1. $csvPath"
Write-Host "2. $xlsxPath"
