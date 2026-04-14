#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path('e:/TENET-5.github.io')
DATA_DIR = ROOT / 'data'

with open(DATA_DIR / 'hansard_maid_speeches.json', 'r', encoding='utf-8') as f:
    hansard = json.load(f)
with open(DATA_DIR / 'maid_still_sitting.json', 'r', encoding='utf-8') as f:
    still_sitting = json.load(f)

still_names = {mp['name'] for mp in still_sitting['mps']}
rows = []
for bill_name, bill in hansard['bills'].items():
    for speech in bill['key_speeches']:
        speaker = speech.get('speaker', '')
        rows.append({
            'bill': bill_name,
            'session': bill.get('session', ''),
            'date': speech.get('date', ''),
            'stage': speech.get('stage', ''),
            'speaker': speaker,
            'party': speech.get('party', ''),
            'riding': speech.get('riding', ''),
            'role': speech.get('role', ''),
            'hansard_url': speech.get('hansard_url', ''),
            'quotes': speech.get('key_quotes', []),
            'still_sitting': speaker in still_names,
            'vote_alignment': 'Still sitting and voted MAID' if speaker in still_names else 'Not still sitting'
        })

rows.sort(key=lambda x: (not x['still_sitting'], x['speaker']))
output = {
    'generated': '2026-04-14',
    'description': 'Key Hansard speeches from MAID C-14 and C-7 debates, flagged for still-sitting MPs where present.',
    'total_speeches': len(rows),
    'still_sitting_speeches': sum(1 for r in rows if r['still_sitting']),
    'rows': rows,
    'bill_summary': {
        'C-14': len([r for r in rows if r['bill'] == 'C-14']),
        'C-7': len([r for r in rows if r['bill'] == 'C-7'])
    }
}
with open(DATA_DIR / 'maid_speech_evidence.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

html_rows = []
for row in rows:
    quote = row['quotes'][0] if row['quotes'] else ''
    if len(quote) > 220:
        quote = quote[:217] + '...'
    badges = []
    if row['still_sitting']:
        badges.append('<span style="color:#33ff77;font-weight:700;">STILL SITTING</span>')
    badges.append('<span style="color:#f59e0b;">' + row['bill'] + '</span>')
    html_rows.append(
        '<tr>'
        f'<td><a href="{row["hansard_url"]}" target="_blank">{row["speaker"]}</a><br><small>{row["role"]}</small></td>'
        f'<td>{row["party"]}</td>'
        f'<td>{row["riding"]}</td>'
        f'<td>{row["date"]}</td>'
        f'<td>{row["stage"]}</td>'
        f'<td>{" ".join(badges)}</td>'
        f'<td>{quote}</td>'
        '</tr>'
    )

html = f"""<!DOCTYPE html>
<html lang=\"en-GB\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>MAID Speech Evidence — Still-Sitting MPs | TENET5</title>
  <meta name=\"description\" content=\"Key Hansard speech evidence from MAID debates, highlighting still-sitting MPs and their positions.\">
  <link rel=\"stylesheet\" href=\"style.css?v=20\">
  <link rel=\"stylesheet\" href=\"css/inline_generated.css\">
  <style>
    .hero {{ max-width: 980px; margin: 0 auto; padding: 38px 20px 14px; text-align:center; }}
    .hero h1 {{ font-family:'Playfair Display',serif; font-size:2.2rem; margin-bottom:8px; color:var(--text-primary); }}
    .stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; max-width:980px; margin:24px auto; }}
    .stat {{ background:var(--bg-card); border:1px solid var(--border); padding:18px 14px; border-radius:12px; text-align:center; }}
    .stat strong {{ display:block; font-size:2rem; color:var(--accent); margin-bottom:6px; }}
    .stat small {{ color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.08em; }}
    .table-wrap {{ max-width:980px; margin:0 auto; overflow-x:auto; }}
    table {{ width:100%; border-collapse:collapse; min-width:980px; }}
    th, td {{ padding:12px 10px; border-bottom:1px solid rgba(255,255,255,0.06); text-align:left; font-size:0.9rem; }}
    th {{ color:var(--text-primary); font-weight:700; }}
    td a {{ color:var(--accent); text-decoration:none; }}
    td a:hover {{ text-decoration:underline; }}
    .note {{ max-width:980px; margin:24px auto; padding:18px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; color:var(--text-secondary); }}
    @media (max-width:820px) {{ .stats {{ grid-template-columns:1fr; }} }}
  </style>
</head>
<body>
  <div id=\"site-header-frame\"></div>
  <main id=\"main\" class=\"container\" style=\"padding:20px\"> 
    <section class=\"hero\">
      <h1>MAID Speech Evidence — Still-Sitting MPs</h1>
      <p style=\"max-width:780px;margin:0 auto;color:var(--text-tertiary);\">This page extracts key Hansard debate speeches from MAID C-14 and C-7, flags speeches by still-sitting MPs, and links each statement to official debate transcripts.</p>
    </section>
    <section class=\"stats\">
      <div class=\"stat\"><strong>{output['total_speeches']}</strong><small>Total key speeches</small></div>
      <div class=\"stat\"><strong>{output['bill_summary']['C-14']}</strong><small>C-14 speeches</small></div>
      <div class=\"stat\"><strong>{output['bill_summary']['C-7']}</strong><small>C-7 speeches</small></div>
      <div class=\"stat\"><strong>{output['still_sitting_speeches']}</strong><small>Still-sitting MPs</small></div>
    </section>
    <section class=\"note\">
      <p>This evidence page is generated from <strong>data/hansard_maid_speeches.json</strong> and cross-referenced against <strong>data/maid_still_sitting.json</strong>. Only one still-sitting MP appears in the key speech set, reflecting the available debate transcripts included in the corpus.</p>
    </section>
    <section class=\"table-wrap\">
      <table>
        <thead>
          <tr><th>Speaker</th><th>Party</th><th>Riding</th><th>Date</th><th>Stage</th><th>Flags</th><th>Quote</th></tr>
        </thead>
        <tbody>
          {''.join(html_rows)}
        </tbody>
      </table>
    </section>
    <section class=\"note\">
      <p>Source: Official Hansard transcripts via OpenParliament.ca and the MAID debate summary dataset. This page is intended as a statement-level cross-reference for accountability research.</p>
    </section>
  </main>
  <div id=\"site-footer-frame\"></div>
  <script src=\"shell.js?v=20\"></script>
  <script src=\"js/ux.js\"></script>
</body>
</html>"""

with open(ROOT / 'maid-speech-evidence.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Generated maid_speech_evidence.json and maid-speech-evidence.html')
