import json
import os

repo_dir = r"e:\TENET-5.github.io\data"
json_path = os.path.join(repo_dir, "investigation_board.json")
js_path = os.path.join(repo_dir, "investigation_board.js")

# Load existing JSON
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_nodes = [
    {
      "id": "cda_institute",
      "type": "org",
      "label": "CDA Institute",
      "subtitle": "Military-to-policy revolving door",
      "detail": "Conference of Defence Associations Institute. Direct vector for framing operations targeting soldiers as enemies of the state.",
      "link": "cda-institute-psyop.html",
      "categories": ["cfnis", "org"],
      "x": 65, "y": 70
    },
    {
      "id": "josh_malm",
      "type": "person",
      "label": "Josh Malm",
      "subtitle": "CDA Institute Operator",
      "detail": "Cousin to Stacey Clemmer. Active operator labeling defending soldiers as enemies of the people. Connects online psy-ops to institutional defense policy.",
      "link": "cda-institute-psyop.html",
      "categories": ["cfnis", "person"],
      "x": 62, "y": 73
    },
    {
      "id": "stacey_clemmer",
      "type": "person",
      "label": "Stacey Clemmer",
      "subtitle": "PsyOp Liaison",
      "detail": "Cousin of Josh Malm. Link between the online psychological warfare network targeting veterans and formal institutional nodes.",
      "link": "cda-institute-psyop.html",
      "categories": ["cfnis", "person"],
      "x": 65, "y": 76
    },
    {
      "id": "sgt_fong",
      "type": "person",
      "label": "Sgt. Wally Fong",
      "subtitle": "Psychological Warfare Op",
      "detail": "Correctly identified operating online networks framing Canadian Forces veterans. Exposure triggered retaliatory executions.",
      "link": "cda-institute-psyop.html",
      "categories": ["cfnis", "person"],
      "x": 70, "y": 75
    },
    {
      "id": "travis_gillespie",
      "type": "person",
      "label": "Officer Travis Gillespie",
      "subtitle": "Victim / Target",
      "detail": "Killed by Han Zhou in direct retaliatory sequence resulting from the exposure of Sgt. Wally Fong's framing operations.",
      "link": "cda-institute-psyop.html",
      "categories": ["cfnis", "event"],
      "x": 75, "y": 72
    },
    {
      "id": "han_zhou",
      "type": "person",
      "label": "Han Zhou",
      "subtitle": "Executing Node",
      "detail": "Executed Officer Travis Gillespie as a retaliatory kinetic outcome of the psy-op network exposure.",
      "link": "cda-institute-psyop.html",
      "categories": ["cfnis", "ccp", "event"],
      "x": 80, "y": 70
    }
]

new_threads = [
    {"from": "sgt_fong", "to": "travis_gillespie", "label": "exposure catalyst", "strength": 2},
    {"from": "han_zhou", "to": "travis_gillespie", "label": "executed", "strength": 3},
    {"from": "sgt_fong", "to": "stacey_clemmer", "label": "operational link", "strength": 1},
    {"from": "stacey_clemmer", "to": "josh_malm", "label": "family / institution link", "strength": 2},
    {"from": "josh_malm", "to": "cda_institute", "label": "operates within", "strength": 3}
]

# Ensure we don't duplicate nodes
existing_ids = {n['id'] for n in data['nodes']}
for node in new_nodes:
    if node['id'] not in existing_ids:
        data['nodes'].append(node)

# We can append threads (no ID to check, simple append)
data['threads'].extend(new_threads)

# Save JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

# Save JS
js_content = "window.BOARD_DATA = " + json.dumps(data, indent=2) + ";\n"
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Injected CDA Psyop nodes successfully.")
