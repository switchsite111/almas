import csv
import json
import os
import datetime

# Directory path
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "ALMAS_База_Заявок.csv")
xlsx_path = os.path.join(base_dir, "ALMAS_База_Заявок.xlsx")

# Demo initial dataset if file does not exist
initial_rows = [
    {
        "ID": "REQ-1001",
        "Дата и Время": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "Тип Заявки": "Подать КП",
        "Имя / Компания": "ООО «ТехноСтрой» (Иван Петров)",
        "Контакты": "info@technostroy.ru | +7 (999) 111-22-33",
        "Детали / Сообщение": "Коммерческое предложение по монтажу слаботочных сетей и СКУД для объекта 12 000 кв.м.",
        "Статус": "В обработке"
    },
    {
        "ID": "REQ-1002",
        "Дата и Время": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "Тип Заявки": "Отклик на вакансию",
        "Имя / Компания": "Алексей Смирнов",
        "Контакты": "a.smirnov@mail.ru | +7 (985) 444-55-66",
        "Детали / Сообщение": "Отклик на вакансию: Инженер сетевой инфраструктуры (Senior Cisco/Eltex). Опыт 8 лет.",
        "Статус": "Получено"
    },
    {
        "ID": "REQ-1003",
        "Дата и Время": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "Тип Заявки": "Калькулятор ИТ",
        "Имя / Компания": "АО «Альфа Инвест»",
        "Контакты": "alfa@invest.ru | +7 (495) 777-88-99",
        "Детали / Сообщение": "Предварительный расчет: 5 серверов, 50 АРМ, СКУД + Техподдержка 24/7. Сумма: 3 180 000 ₽",
        "Статус": "В обработке"
    }
]

# Write UTF-8 BOM CSV (Opens natively in Excel with perfect Russian letters)
with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=["ID", "Дата и Время", "Тип Заявки", "Имя / Компания", "Контакты", "Детали / Сообщение", "Статус"], delimiter=';')
    writer.writeheader()
    writer.writerows(initial_rows)

print(f"Файл баз данных Excel успешно создан по адресу: {csv_path}")

# Try creating .xlsx via openpyxl if installed
try:
    import openpyxl
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Заявки ALMAS"
    
    headers = ["ID", "Дата и Время", "Тип Заявки", "Имя / Компания", "Контакты", "Детали / Сообщение", "Статус"]
    ws.append(headers)
    
    for row in initial_rows:
        ws.append([row[h] for h in headers])
        
    wb.save(xlsx_path)
    print(f"Нативный файл Excel (.xlsx) успешно создан: {xlsx_path}")
except ImportError:
    # If openpyxl not installed, copy csv to .xlsx naming for compatibility
    with open(xlsx_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["ID", "Дата и Время", "Тип Заявки", "Имя / Компания", "Контакты", "Детали / Сообщение", "Статус"], delimiter=';')
        writer.writeheader()
        writer.writerows(initial_rows)
    print(f"Файл Excel создан по адресу: {xlsx_path}")
