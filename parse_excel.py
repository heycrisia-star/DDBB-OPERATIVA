import pandas as pd
import json

df = pd.read_excel('../bookings-export (7).xlsx', engine='openpyxl')

tours = []
vehicles = ['01-DR', '02-NR']

for idx, row in df.iterrows():
    if str(row['Booking Ref #']) == 'nan':
        continue
    
    first_name = str(row.get("Traveler's First Name", "")) if str(row.get("Traveler's First Name", "")) != 'nan' else ''
    last_name = str(row.get("Traveler's Last Name", "")) if str(row.get("Traveler's Last Name", "")) != 'nan' else ''
    name = f"{first_name} {last_name}".strip()
    
    adults = row.get('Adult', 0)
    adults = int(adults) if pd.notna(adults) else 0
    children = row.get('Child', 0)
    children = int(children) if pd.notna(children) else 0
    pax = adults + children
    
    dt = str(row['Date'])
    date_str = ''
    time_str = ''
    if ' ' in dt:
        parts = dt.split(' ')
        date_str = parts[0]
        time_str = parts[1][:5]
        
    net_price = str(row['Net Price']).replace(' EUR', '')
    if net_price == 'nan': net_price = '0'
    net_price = float(net_price)
    
    lang = str(row.get('Language', 'EN'))
    if lang == 'English': lang = 'EN'
    elif lang == 'German': lang = 'DE'
    elif lang == 'French': lang = 'FR'
    elif lang == 'Spanish': lang = 'ES'
    elif lang == 'Italian': lang = 'IT'
    elif lang == 'Dutch': lang = 'NL'
    elif lang == 'Portuguese': lang = 'PT'
    else: lang = 'EN'

    opt = str(row['Option'])
    duration = 2
    if '1:00 h' in opt or '1 h' in opt: duration = 1
    elif '2:00 h' in opt or '2 h' in opt: duration = 2
    elif '3:00 h' in opt or '3 h' in opt: duration = 3
    elif '4:00 h' in opt or '4 h' in opt: duration = 4

    vehicle = vehicles[idx % 2] # 50% split

    tours.append({
        'id': idx + 1,
        'code': str(row['Booking Ref #']),
        'date': date_str,
        'start': time_str,
        'duration': duration,
        'operator': 'GYG',
        'status': 'confirmado',
        'pax': pax,
        'vehicle': vehicle,
        'driver': 'Cristian', # Only Cristian
        'clientName': name,
        'phone': str(row.get('Phone', '')).replace('nan', ''),
        'language': lang,
        'country': str(row.get("Traveler's Country", "")).replace('nan', ''),
        'netPrice': net_price,
        'product': str(row['Product'])
    })

with open('src/data/mockTours.js', 'w', encoding='utf-8') as f:
    f.write('export const MOCK_TOURS = ' + json.dumps(tours, indent=2, ensure_ascii=False) + ';\n')
