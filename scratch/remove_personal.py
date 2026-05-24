import json

with open('src/data/mockTours.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the first occurrence of operator: "PERSONAL" and cut the array before that.
import re
# find the first operator: "PERSONAL" and the object start `{` before it.
match = re.search(r',\s*\{\s*"operator":\s*"PERSONAL"', content)
if match:
    new_content = content[:match.start()] + "\n];\n"
    with open('src/data/mockTours.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Removed PERSONAL tours.")
else:
    print("PERSONAL tours not found.")
