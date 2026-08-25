import os
import sys

base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "ALMAS_База_Заявок.csv")
xls_path = os.path.join(base_dir, "ALMAS_База_Заявок.xls")
xlsx_path = os.path.join(base_dir, "ALMAS_База_Заявок.xlsx")

# Sample data
rows = [
    ["ID Заявки", "Дата и Время", "Тип Заявки", "Имя / Компания", "Контакты", "Детали / Сообщение", "Статус"],
    ["REQ-1001", "2026-07-27 02:40", "Подать КП", "ООО «ТехноСтрой» (Иван Петров)", "info@technostroy.ru | +7 (999) 111-22-33", "Коммерческое предложение по монтажу слаботочных сетей и СКУД на объекте 12 000 кв.м.", "В обработке"],
    ["REQ-1002", "2026-07-27 02:35", "Отклик на вакансию", "Алексей Смирнов", "a.smirnov@mail.ru | +7 (985) 444-55-66", "Отклик на вакансию: Инженер сетевой инфраструктуры (Senior Cisco/Eltex). Опыт 8 лет.", "Получено"],
    ["REQ-1003", "2026-07-27 02:30", "Калькулятор ИТ", "АО «Альфа Инвест»", "alfa@invest.ru | +7 (495) 777-88-99", "Предварительный расчет: 5 серверов, 50 АРМ, СКУД + Техподдержка 24/7. Сумма: 3 180 000 ₽", "В обработке"]
]

# 1. Write Native UTF-8 BOM CSV (Semicolon delimited) - 100% opens in MS Excel with clean Russian fonts
with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    for row in rows:
        f.write(";".join([f'"{cell}"' for cell in row]) + "\n")

# 2. Write HTML Spreadsheet (.xls) - MS Excel opens this natively with beautiful styles
html_excel = """<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
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
"""

for i, row in enumerate(rows):
    html_excel += "<tr>"
    tag = "th" if i == 0 else "td"
    for cell in row:
        html_excel += f"<{tag}>{cell}</{tag}>"
    html_excel += "</tr>\n"

html_excel += "</table></body></html>"

with open(xls_path, 'w', encoding='utf-8') as f:
    f.write(html_excel)

with open(xlsx_path, 'w', encoding='utf-8') as f:
    f.write(html_excel)

print("Excel files generated successfully!")
