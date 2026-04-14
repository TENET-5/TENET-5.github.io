#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path('e:/TENET-5.github.io')
DATA = ROOT / 'data'


def load_json(filename):
    with open(DATA / filename, 'r', encoding='utf-8') as f:
        return json.load(f)


maid_still_sitting = load_json('maid_still_sitting.json')
maid_lobbying = load_json('maid_lobbying_crossref.json')
maid_votes = load_json('maid_votes.json')
hansard = load_json('hansard_maid_speeches.json')

lobby_lookup = {mp['name']: mp for mp in maid_lobbying.get('mps', [])}
still_lookup = {mp['name']: mp for mp in maid_still_sitting.get('mps', [])}

speech_rows = []
for bill_name, bill in hansard.get('bills', {}).items():
    for speech in bill.get('key_speeches', []):
        speaker = speech.get('speaker', '')
        still = speaker in still_lookup
        speech_rows.append({
            'speaker': speaker,
            'role': speech.get('role', ''),
            'party': speech.get('party', ''),
            'riding': speech.get('riding', ''),
            'bill': bill_name,
            'session': bill.get('session', ''),
            'date': speech.get('date', ''),
            'stage': speech.get('stage', ''),
            'hansard_url': speech.get('hansard_url', ''),
            'quotes': speech.get('key_quotes', []),
            'still_sitting': still,
            'speaker_has_maid_vote': speaker in still_lookup,
            'speaker_vote_summary': still_lookup.get(speaker, {}).get('maid_bills', []),
            'source': 'hansard_maid_speeches.json'
        })

speech_rows.sort(key=lambda x: (not x['still_sitting'], x['bill'], x['speaker']))

mp_rows = []
for mp in maid_still_sitting.get('mps', []):
    name = mp['name']
    lobby = lobby_lookup.get(name, {})
    speeches = [s for s in speech_rows if s['speaker'] == name]
    mp_rows.append({
        'name': name,
        'current_party': mp.get('current_party', ''),
        'party_when_voted': mp.get('party_when_voted', ''),
        'riding': mp.get('riding', ''),
        'province': mp.get('province', ''),
        'maid_bills': mp.get('maid_bills', []),
        'voted_both': mp.get('voted_both', False),
        'lobbying_contacts': lobby.get('lobbying_contacts', 0),
        'lobbying_institutions': lobby.get('institutions', []),
        'openparliament_search': f'https://openparliament.ca/search/?q={name.replace(" ", "+")}+medical+assistance+dying',
        'ourcommons_profile': f'https://www.ourcommons.ca/members/en/search?searchText={name.replace(" ", "+")}',
        'lobbying_registry': f'https://lobbycanada.gc.ca/app/secure/ocl/lrs/do/cmmLgPblcVw?DPOHName={name.replace(" ", "+")}',
        'hansard_c14_vote': 'https://openparliament.ca/votes/42-1/76/' if 'C-14' in mp.get('maid_bills', []) else None,
        'hansard_c7_vote': 'https://openparliament.ca/votes/43-2/72/' if 'C-7' in mp.get('maid_bills', []) else None,
        'speech_count': len(speeches),
        'speeches': [{'bill': s['bill'], 'date': s['date'], 'stage': s['stage'], 'hansard_url': s['hansard_url']} for s in speeches],
        'source': ['maid_still_sitting.json', 'maid_lobbying_crossref.json', 'hansard_maid_speeches.json']
    })

mp_rows.sort(key=lambda x: (-x['voted_both'], -x['lobbying_contacts'], x['name']))

catalog = {
    'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'description': 'Canonical MAID evidence catalog for still-sitting MPs, including votes, lobbying, and Hansard speech provenance.',
    'sources': {
        'maid_still_sitting': 'data/maid_still_sitting.json',
        'maid_lobbying_crossref': 'data/maid_lobbying_crossref.json',
        'maid_votes': 'data/maid_votes.json',
        'hansard_maid_speeches': 'data/hansard_maid_speeches.json'
    },
    'summary': {
        'total_still_sitting_mps': len(mp_rows),
        'total_speeches': len(speech_rows),
        'still_sitting_speech_count': sum(1 for s in speech_rows if s['still_sitting']),
        'bills': {
            'C-14': sum(1 for s in speech_rows if s['bill'] == 'C-14'),
            'C-7': sum(1 for s in speech_rows if s['bill'] == 'C-7')
        }
    },
    'mp_evidence': mp_rows,
    'speech_evidence': speech_rows
}

with open(DATA / 'maid_evidence_master.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)

with open(DATA / 'maid_mp_evidence_index.json', 'w', encoding='utf-8') as f:
    json.dump({'generated': catalog['generated'], 'description': 'MP evidence index generated from maid_evidence_master.json', 'total_mps': len(mp_rows), 'rows': mp_rows}, f, indent=2, ensure_ascii=False)

with open(DATA / 'maid_speech_evidence.json', 'w', encoding='utf-8') as f:
    json.dump({'generated': catalog['generated'], 'description': 'Speech evidence generated from maid_evidence_master.json', 'total_speeches': len(speech_rows), 'rows': speech_rows}, f, indent=2, ensure_ascii=False)

print('Generated maid_evidence_master.json, maid_mp_evidence_index.json, and maid_speech_evidence.json')
