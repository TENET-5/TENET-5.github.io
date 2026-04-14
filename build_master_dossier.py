#!/usr/bin/env python3
"""Build master cross-referenced dossier for all 97 still-sitting MPs who voted for MAID."""
import json

with open('data/maid_still_sitting.json') as f:
    sitting = json.load(f)

with open('data/maid_lobbying_crossref.json') as f:
    lobbying = json.load(f)

# Build lobbying lookup
lobby_map = {}
for mp in lobbying.get('mps', []):
    lobby_map[mp['name']] = mp

dossiers = []
for mp in sitting['mps']:
    name = mp['name']
    lob = lobby_map.get(name, {})
    name_plus = name.replace(" ", "+")

    dossier = {
        'name': name,
        'party': mp['current_party'],
        'riding': mp['riding'],
        'province': mp['province'],
        'maid_bills': mp['maid_bills'],
        'voted_both': mp.get('voted_both', False),
        'lobbying_contacts': lob.get('lobbying_contacts', 0),
        'lobbying_institutions': lob.get('institutions', []),
        'openparliament_search': f'https://openparliament.ca/search/?q={name_plus}+medical+assistance+dying',
        'hansard_c14_vote': 'https://openparliament.ca/votes/42-1/76/' if 'C-14' in mp['maid_bills'] else None,
        'hansard_c7_vote': 'https://openparliament.ca/votes/43-2/72/' if 'C-7' in mp['maid_bills'] else None,
        'ourcommons_profile': f'https://www.ourcommons.ca/members/en/search?searchText={name_plus}',
        'lobbying_registry': f'https://lobbycanada.gc.ca/app/secure/ocl/lrs/do/cmmLgPblcVw?DPOHName={name_plus}'
    }
    dossiers.append(dossier)

# Sort by lobbying contacts desc
dossiers.sort(key=lambda x: x['lobbying_contacts'], reverse=True)

# Party breakdown
party_counts = {}
for d in dossiers:
    p = d['party']
    if p not in party_counts:
        party_counts[p] = {'count': 0, 'total_lobbying': 0, 'voted_both': 0}
    party_counts[p]['count'] += 1
    party_counts[p]['total_lobbying'] += d['lobbying_contacts']
    if d['voted_both']:
        party_counts[p]['voted_both'] += 1

output = {
    'generated': '2026-04-14',
    'description': 'Comprehensive cross-referenced dossier for all 97 still-sitting MPs who voted for MAID (C-14 and/or C-7)',
    'total_mps': len(dossiers),
    'total_lobbying_contacts': sum(d['lobbying_contacts'] for d in dossiers),
    'voted_both_count': sum(1 for d in dossiers if d['voted_both']),
    'voted_c14_only': sum(1 for d in dossiers if d['maid_bills'] == ['C-14']),
    'voted_c7_only': sum(1 for d in dossiers if 'C-7' in d['maid_bills'] and 'C-14' not in d['maid_bills']),
    'by_party': party_counts,
    'dossiers': dossiers
}

with open('data/mp_maid_master_dossier.json', 'w') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Built master dossier: {len(dossiers)} MPs")
print(f"Total lobbying contacts: {sum(d['lobbying_contacts'] for d in dossiers):,}")
print(f"Voted both bills: {sum(1 for d in dossiers if d['voted_both'])}")
print(f"\nParty breakdown:")
for party, stats in sorted(party_counts.items(), key=lambda x: -x[1]['count']):
    print(f"  {party}: {stats['count']} MPs, {stats['total_lobbying']:,} lobbying contacts, {stats['voted_both']} voted both")
print(f"\nTop 20 most lobbied MAID-voting MPs still sitting:")
for d in dossiers[:20]:
    both = ' [BOTH]' if d['voted_both'] else ''
    print(f"  {d['lobbying_contacts']:>5} contacts - {d['name']} ({d['party']}, {d['riding']}, {d['province']}){both}")
