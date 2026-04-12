import json
import os

ext_path = 'data/maid_exterminators_list.json'
lob_path = 'data/lobbying_analysis.json'

with open(ext_path, 'r', encoding='utf-8') as f:
    ext = json.load(f)

with open(lob_path, 'r', encoding='utf-8') as f:
    lob = json.load(f)

lobbed = {x['name']: x['meetings'] for x in lob['top_lobbied_officials']}
overlaps = []
for m in ext['mps']:
    if m['name'] in lobbed:
        overlaps.append({'name': m['name'], 'meetings': lobbed[m['name']]})

print('Overlap count:', len(overlaps))
print(json.dumps(overlaps, indent=2))
