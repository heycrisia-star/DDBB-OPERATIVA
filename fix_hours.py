import json

file_path = 'src/data/mockTours.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

prefix = content[:content.index('[')]
json_str = content[content.index('['):content.rindex(']') + 1]
suffix = content[content.rindex(']') + 1:]

tours = json.loads(json_str)

for tour in tours:
    # 1. Reserva de hoy (13) - Nathalie Mentens
    if tour.get('date') == '2026-04-13' and tour.get('operator') == 'GYG':
        tour['duration'] = 1
    # 2. Las dos de mañana (14) - Sissy y Mary
    if tour.get('date') == '2026-04-14' and tour.get('operator') == 'GYG':
        tour['duration'] = 1
    # 3. La del viernes a las 19h (Puede referirse a Anne-Cathrin? o al 19 que es domingo?) O Christina?
    # Para asegurar, a Elena Vavassori la forzamos a 1h (19 a las 19h)
    if 'Vavassori' in tour.get('clientName', ''):
        tour['duration'] = 1

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(prefix + json.dumps(tours, indent=2, ensure_ascii=False) + suffix)

