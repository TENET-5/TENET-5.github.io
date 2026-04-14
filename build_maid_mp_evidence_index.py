#!/usr/bin/env python3
import json
from pathlib import Path

root = Path('e:/TENET-5.github.io')

def load(path):
    with open(root / path, 'r', encoding='utf-8') as f:
        return json.load(f)

sitting = load('data/maid_still_sitting.json')
master = load('data/mp_maid_master_dossier.json')
hansard = load('data/hansard_maid_speeches.json')

# Build speech lookup by speaker name.
speech_map = {}
for bill in hansard.get('bills', {}).values():
    for speech in bill.get('key_speeches', []):
        name = speech.get('speaker')
        if not name:
            continue
        if name not in speech_map:
            speech_map[name] = []
        speech_map[name].append({
            'bill': bill.get('session', '') if bill.get('session') else bill.get('third_reading_date', ''),
            'role': speech.get('role'),
            'party': speech.get('party'),
            'riding': speech.get('riding'),
            'stage': speech.get('stage'),
            'date': speech.get('date'),
            'quotes': speech.get('key_quotes', []),
            'hansard_url': speech.get('hansard_url')
        })

master_lookup = {mp['name']: mp for mp in master.get('dossiers', [])}

rows = []
for mp in sitting.get('mps', []):
    name = mp['name']
    entry = {
        'name': name,
        'party': mp['current_party'],
        'riding': mp['riding'],
        'province': mp['province'],
        'maid_bills': mp['maid_bills'],
        'voted_both': mp.get('voted_both', False),
        'lobbying_contacts': master_lookup.get(name, {}).get('lobbying_contacts', 0),
        'hansard_c14_vote': master_lookup.get(name, {}).get('hansard_c14_vote'),
        'hansard_c7_vote': master_lookup.get(name, {}).get('hansard_c7_vote'),
        'openparliament_search': master_lookup.get(name, {}).get('openparliament_search'),
        'ourcommons_profile': master_lookup.get(name, {}).get('ourcommons_profile'),
        'lobbying_registry': master_lookup.get(name, {}).get('lobbying_registry'),
        'hansard_speeches': speech_map.get(name, []),
        'hansard_speech_count': len(speech_map.get(name, [])),
        'evidence_link_count': len(speech_map.get(name, [])) + (1 if master_lookup.get(name, {}).get('openparliament_search') else 0)
    }
    rows.append(entry)

rows.sort(key=lambda x: (not x['voted_both'], -x['lobbying_contacts']))

output = {
    'generated': '2026-04-14',
    'description': 'Cross-reference index for 97 still-sitting MAID MPs, combining vote records, lobbying data, and Hansard speech evidence.',
    'total_mps': len(rows),
    'rows': rows
}

with open(root / 'data' / 'maid_mp_evidence_index.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f'Wrote {len(rows)} entries to data/maid_mp_evidence_index.json')
