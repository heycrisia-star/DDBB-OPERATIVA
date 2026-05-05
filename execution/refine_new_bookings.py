import json
import re

file_path = 'src/data/mockTours.js'
content = open(file_path, encoding='utf-8').read()
prefix = content[:content.index('[')]
json_str = content[content.index('['):content.rindex(']') + 1]
suffix = content[content.rindex(']') + 1:]
tours = json.loads(json_str)

# New bookings IDs: 166, 167, 168, 169, 170
new_ids = [166, 167, 168, 169, 170]

for t in tours:
    if t.get('id') in new_ids:
        # Rule: Cristian -> 02-NR, Others -> 01-DR
        if t.get('driver') == 'Cristian':
            t['vehicle'] = '02-NR'
        else:
            t['vehicle'] = '01-DR'
        
        # Specific fix for Viator booking (id: 170)
        if t.get('id') == 170:
            # If date is Jan 10th and we are in May, it might be Oct 1st
            # But I won't change it without confirmation.
            # I'll just ensure vehicle is correct.
            t['vehicle'] = '01-DR' # Carlos is driver
            # Cleanup phone
            if t.get('phone'):
                t['phone'] = t['phone'].replace(')', '').strip()

# Save back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(prefix + json.dumps(tours, indent=2, ensure_ascii=False) + suffix)

print("✅ New bookings refined.")
