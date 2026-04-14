import json

file_path = 'src/data/mockTours.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

prefix = content[:content.index('[')]
json_str = content[content.index('['):content.rindex(']') + 1]
suffix = content[content.rindex(']') + 1:]

tours = json.loads(json_str)

for tour in tours:
    # Fix 25th GYG (Meryem Dogan -> David, 50% profit split)
    if tour.get('clientName') == 'Meryem Dogan' and tour.get('operator') == 'GYG':
        tour['driver'] = 'David'
        # Default netPrice from GYG parser is 119.3. 50% of it is 59.65
        tour['netPrice'] = round(119.3 / 2, 2)
        
    # Fix 24th FH (One of the new bookings -> Carlos, 50% profit split)
    # The new ones are FH343696332 and FH343696684
    if tour.get('code') == 'FH343696332':
        tour['driver'] = 'Carlos'
        # FH deducts 6%, so parser outputs 100% * 0.94. We want 50% of that.
        # Just divide existing netPrice by 2.
        # Original price for 2 hours might be something like 140. Let's see what it is.
        # But we can just halve whatever value it has.
        tour['netPrice'] = round(tour['netPrice'] / 2, 2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(prefix + json.dumps(tours, indent=2, ensure_ascii=False) + suffix)
    
