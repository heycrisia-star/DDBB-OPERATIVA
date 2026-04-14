import json
import copy

file_path = 'src/data/mockTours.js'
content = open(file_path, encoding='utf-8').read()
prefix = content[:content.index('[')]
json_str = content[content.index('['):content.rindex(']') + 1]
suffix = content[content.rindex(']') + 1:]
d = json.loads(json_str)

# ------------------------------------------------------------------
# 1. GYG net price table (integer values from the user's spreadsheet)
# key: (duration_hours, pax_tier) -> net
GYG_NETO = {
    (1, '1-2'): 75, (1, '3-4'): 94,
    (2, '1-2'): 119, (2, '3-4'): 150,
    (3, '1-2'): 176, (3, '3-4'): 217,
}
# SERV. CHOFER (50%) neto values from table:
# 1H: 1-2px=37(47), 2H: 1-2px=60(75), 3H: 88(109)
# For now only used as reference, not auto-applied

def gyg_neto(duration, pax):
    tier = '3-4' if pax >= 3 else '1-2'
    return GYG_NETO.get((int(duration), tier), None)

# ------------------------------------------------------------------
# 2. Fix all GYG bookings with decimal net prices → use table
for t in d:
    if t.get('operator') == 'GYG' and t.get('status') == 'confirmado':
        dur = t.get('duration', 2)
        pax = t.get('pax', 2)
        neto = gyg_neto(dur, pax)
        if neto is not None:
            t['netPrice'] = neto

# ------------------------------------------------------------------
# 3. Fix Nina names on April 24 (FareHarbor)
for t in d:
    if t.get('code') in ['FH343696332', 'FH343696684']:
        t['clientName'] = 'Nina'
        t['duration'] = 2       # Park City & Beach is 2h
        t['pax'] = 3            # 3 pax confirmed
        # FH neto for 2h/3pax: user table says same outcome as GYG ≈ 150 each
        # But one is split to Carlos (50%), so we record full and split below

# ------------------------------------------------------------------
# 4. Split April 18 CASH booking into two entries
# Remove the combined entry and add two separate ones
new_entries = []
remove_codes = {'CASH-849182'}

for t in d:
    if t.get('code') == 'CASH-849182':
        # Entry for Cristian: 4 pax, 130€
        cristian = copy.deepcopy(t)
        cristian['code'] = 'CASH-849182-A'
        cristian['driver'] = 'Cristian'
        cristian['pax'] = 4
        cristian['netPrice'] = 130
        cristian['vehicle'] = '01-DR'
        cristian['clientName'] = 'Martina Franke (Cash)'

        # Entry for Carlos: 3 pax, 75€
        carlos = copy.deepcopy(t)
        carlos['code'] = 'CASH-849182-B'
        carlos['driver'] = 'Carlos'
        carlos['pax'] = 3
        carlos['netPrice'] = 75
        carlos['vehicle'] = '02-NR'
        carlos['clientName'] = 'Martina Franke (Cash)'

        new_entries.append(cristian)
        new_entries.append(carlos)

# Remove the old combined entry and add the two new ones
d = [t for t in d if t.get('code') not in remove_codes]
d.extend(new_entries)

# ------------------------------------------------------------------
# 5. Assign Carlos to April 24 10:00 FH booking (already split 50%)
# FH343696332 = Carlos (already done), FH343696684 = Cristian
# For Carlos, mark split: 50% of 150 neto = 75
for t in d:
    if t.get('code') == 'FH343696332':
        t['driver'] = 'Carlos'
        t['netPrice'] = 75  # 50% of 150

# ------------------------------------------------------------------
# 6. Assign Carlos to April 25 10:00 booking
# The group booking at 10:00 on April 25 - based on context, Josee Lafontaine
# Check which one has time 10:00 or earliest on that day
for t in d:
    if t.get('date') == '2026-04-25' and t.get('clientName') == 'Josee Lafontaine':
        t['driver'] = 'Carlos'
        t['netPrice'] = 75  # 50% of GYG neto 150

# ------------------------------------------------------------------
# 7. Rename "Chofer 3" → "Joao" everywhere
for t in d:
    if t.get('driver') == 'Chofer 3':
        t['driver'] = 'Joao'

# ------------------------------------------------------------------
# Sort by date
d.sort(key=lambda t: (t.get('date', ''), t.get('time', '')))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(prefix + json.dumps(d, indent=2, ensure_ascii=False) + suffix)

print("✅ Done")

# Print summary of modified entries
for t in d:
    if t.get('date') in ['2026-04-18', '2026-04-24', '2026-04-25']:
        print(f"  {t.get('code')} | {t.get('date')} {t.get('time')} | {t.get('clientName')} | driver={t.get('driver')} | pax={t.get('pax')} | net={t.get('netPrice')}")
