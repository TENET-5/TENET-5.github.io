import re
import json
import os

html_path = 'E:/TENET-5.github.io/accountability.html'
json_path_records = 'E:/TENET-5.github.io/data/accountability_records.json'
json_path_purchases = 'E:/TENET-5.github.io/data/accountability_purchases.json'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

from bs4 import BeautifulSoup
print("Using BeautifulSoup")
soup = BeautifulSoup(content, 'html.parser')

records = []
record_divs = soup.find_all('div', class_='record')
for div in record_divs:
    rec = {}
    rec['data_level'] = div.get('data-level', '')
    rec['data_party'] = div.get('data-party', '')
    rec['data_search'] = div.get('data-search', '')
    rec['data_type'] = div.get('data-type', '')
    
    header = div.find('div', class_='rec-header')
    if header:
        name_el = header.find('span', class_='rec-name')
        rec['name'] = name_el.get_text(strip=True) if name_el else ''
        
        party_el = header.find('span', class_=re.compile('rec-party'))
        rec['party'] = party_el.get_text(strip=True) if party_el else ''
        party_class = [c for c in (party_el.get('class', []) if party_el else []) if c.startswith('party-')]
        rec['party_class'] = party_class[0] if party_class else ''
        
        level_el = header.find('span', class_='rec-level')
        rec['level'] = level_el.get_text(strip=True) if level_el else ''
        
        year_el = header.find('span', class_='rec-year')
        rec['year'] = year_el.get_text(strip=True) if year_el else ''
        
        type_el = header.find('span', class_=re.compile('rec-type'))
        rec['type'] = type_el.get_text(strip=True) if type_el else ''
        type_class = [c for c in (type_el.get('class', []) if type_el else []) if c.startswith('type-')]
        rec['type_class'] = type_class[0] if type_class else ''
        
    detail_el = div.find('div', class_='rec-detail')
    rec['detail'] = detail_el.decode_contents().strip() if detail_el else ''
    
    outcome_el = div.find('div', class_=re.compile('rec-outcome'))
    rec['outcome'] = outcome_el.decode_contents().strip() if outcome_el else ''
    rec['outcome_class'] = ''
    if outcome_el:
        classes = outcome_el.get('class', [])
        outcome_classes = [c for c in classes if c.startswith('outcome-')]
        if outcome_classes:
            rec['outcome_class'] = outcome_classes[0]
            
    records.append(rec)

print(f"Extracted {len(records)} 'record' elements.")

# Write records
with open(json_path_records, 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)


# Now extract purchase-item
purchase_divs = soup.find_all('div', class_='purchase-item')
purchases = []
# They seem to come in pairs?
i = 0
while i < len(purchase_divs):
    div1 = purchase_divs[i]
    if i + 1 < len(purchase_divs) and div1.find('span', class_='purchase-cost') is None and div1.find('span', class_='purchase-note') is None:
        # maybe it's just a single? 
        pass
        
    # Let's just store the raw HTML for now, or extract structured?
    # the first div has <span>Name</span> <span><span class="purchase-cost">Cost</span></span>
    # the second div has <span class="purchase-note">Note</span> <span></span>
    
    spans1 = div1.find_all('span', recursive=False)
    if len(spans1) >= 2 and spans1[1].find('span', class_='purchase-cost'):
        name = spans1[0].get_text(strip=True)
        cost = spans1[1].get_text(strip=True)
        
        note = ''
        if i + 1 < len(purchase_divs):
            div2 = purchase_divs[i+1]
            note_el = div2.find('span', class_='purchase-note')
            if note_el:
                note = note_el.get_text(strip=True)
                i += 2
                purchases.append({'name': name, 'cost': cost, 'note': note})
                continue
                
        purchases.append({'name': name, 'cost': cost, 'note': note})
        i += 1
    else:
        i += 1

print(f"Extracted {len(purchase_divs)} 'purchase-item' elements, grouped into {len(purchases)} paired items.")

with open(json_path_purchases, 'w', encoding='utf-8') as f:
    json.dump(purchases, f, indent=2, ensure_ascii=False)

