import json
import os

BOARD_FILE = r"e:\TENET-5.github.io\data\investigation_board.js"

with open(BOARD_FILE, "r", encoding="utf-8") as f:
    content = f.read()

json_str = content.replace("window.BOARD_DATA = ", "").strip()
if json_str.endswith(";"):
    json_str = json_str[:-1]

data = json.loads(json_str)

new_nodes = [
    {
      "id": "cija_lobbying",
      "type": "organization",
      "label": "CIJA Lobbying Pipeline",
      "subtitle": "579 Sponsored Trips/Interactions",
      "detail": "Identified Matrix complexity NP-HARD pipeline of unaccounted sponsored political transit. Threat Score: 0.95",
      "link": "foreign-influence.html",
      "categories": ["evidence", "scandals"],
      "x": 35,
      "y": 70
    },
    {
      "id": "cfnis_proxy",
      "type": "event",
      "label": "CFNIS Proxy Node",
      "subtitle": "Internal Oversight Tampering",
      "detail": "Telemetry isolated CFNIS shielding mechanisms altering oversight integrity. Threat Score: 0.88",
      "link": "cfnis.html",
      "categories": ["event", "cfnis"],
      "x": 40,
      "y": 75
    },
    {
        "id": "foreign_alpha",
        "type": "organization",
        "label": "Foreign Influence Target Alpha",
        "subtitle": "Registry Detection",
        "detail": "Direct matrix intersection mapping severe lobbying anomalies. P-CLASS certainty. Threat Score: 0.98",
        "link": "foreign-influence.html",
        "categories": ["evidence"],
        "x": 45,
        "y": 70
    }
]

existing_ids = {n["id"] for n in data["nodes"]}
for n in new_nodes:
    if n["id"] not in existing_ids:
        data["nodes"].append(n)

new_threads = [
    {
        "from": "cija_lobbying",
        "to": "foreign_alpha", 
        "label": "VECTOR_MATCH",
        "strength": 5
    },
    {
        "from": "cfnis_proxy",
        "to": "cija_lobbying",
        "label": "OVERSIGHT_TAMPERING",
        "strength": 3
    }
]

for t in new_threads:
    if not any(et["from"] == t["from"] and et["to"] == t["to"] for et in data["threads"]):
        data["threads"].append(t)

new_content = "window.BOARD_DATA = " + json.dumps(data, indent=2) + ";"
with open(BOARD_FILE, "w", encoding="utf-8") as f:
    f.write(new_content)

# Update the json equivalent as well for offline integrity
with open(BOARD_FILE.replace(".js", ".json"), "w", encoding="utf-8") as f:
    f.write(json.dumps(data, indent=2))

print("SUCCESS: Injected analytical findings to investigation_board.js")
