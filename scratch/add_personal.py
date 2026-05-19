import json
import re

events = [
    {"date": "2026-06-03", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-04", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-05", "name": "👦 JUNTOS - 🎂 Cumpleaños Milán"},
    {"date": "2026-06-06", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-07", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-08", "name": "👦 JUNTOS - 🎂 Cumpleaños Maxi"},
    {"date": "2026-06-11", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-12", "name": "👦 Niños (DÍA PAPA - NOCHE MAMA)"},
    {"date": "2026-06-16", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-17", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-18", "name": "👦 JUNTOS - 🎉 Fiesta cumpleaños"},
    {"date": "2026-06-19", "name": "👦 Niños (DÍA MAMA - NOCHE PAPA)"},
    {"date": "2026-06-24", "name": "👦 Niños (PAPA)"},
    {"date": "2026-06-25", "name": "👦 Niños (PAPA) - 🎒 Casal 9-15h"},
    {"date": "2026-06-26", "name": "👦 Niños (PAPA) - 🎒 Casal 9-15h"},
    {"date": "2026-06-27", "name": "👦 Niños (PAPA) - 🎒 Casal 9-15h"},
    {"date": "2026-06-28", "name": "👦 Niños (PAPA) - 🎒 Casal 9-15h"}
]

with open('src/data/mockTours.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the array
match = re.search(r'\];\s*$', content)
if match:
    insert_pos = match.start()
    
    new_items_str = ""
    for idx, ev in enumerate(events):
        item = f"""  ,{{
    "operator": "PERSONAL",
    "code": "KIDS-{ev['date'][-5:].replace('-', '')}",
    "date": "{ev['date']}",
    "start": "00:00",
    "duration": "24",
    "status": "confirmado",
    "pax": 2,
    "vehicle": "N/A",
    "driver": "Cristian",
    "clientName": "{ev['name']}",
    "phone": "",
    "language": "ES",
    "country": "ES",
    "netPrice": 0,
    "product": "Cuidado niños",
    "bookingDate": "2026-05-19",
    "id": "pers-202606{idx}"
  }}"""
        new_items_str += item + "\n"

    new_content = content[:insert_pos] + new_items_str + content[insert_pos:]
    
    with open('src/data/mockTours.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Added events to mockTours.js")
else:
    print("Could not find the end of the array")
