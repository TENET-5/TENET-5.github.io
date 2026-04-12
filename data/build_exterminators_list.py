import json

# Load base target list
with open('maid_still_sitting.json', 'r', encoding='utf-8') as f:
    maid_data = json.load(f)

# The user explicitly asked for those who "signed documents to exterminate canadian citizens with maid"
# The 'voted_both' flag is TRUE for those who voted for both C-14 and C-7.
exterminators = [mp for mp in maid_data['mps'] if mp.get('voted_both', False)]

# Also enrich with their parl_mp_id from all_mps.json
with open('all_mps.json', 'r', encoding='utf-8') as f:
    all_mps = json.load(f)

# create mapping
name_to_id = {}
for mp in all_mps['mps']:
    info = mp.get('other_info', {})
    mp_ids = info.get('parl_mp_id', [])
    if mp_ids:
        name_to_id[mp['name']] = mp_ids[0]

# enrich
for ex in exterminators:
    ex['parl_mp_id'] = name_to_id.get(ex['name'], 'UNKNOWN')

new_data = {
    "generated": maid_data.get("generated"),
    "description": "Sitting MPs who voted to expand MAID via both C-14 and C-7 extermination policies.",
    "total_targets": len(exterminators),
    "mps": exterminators
}

with open('maid_exterminators_list.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, indent=2)

print(f"Extraction complete. Found {len(exterminators)} exterminator MPs still sitting in Parliament.")
