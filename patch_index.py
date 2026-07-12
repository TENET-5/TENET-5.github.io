import pathlib

p = pathlib.Path(r"E:\TENET-5.github.io\index.html")
c = p.read_text(encoding="utf-8")

# Replace in TENETS DESK (newsdesk-grid-visual)
c = c.replace(
    '<div class="newsdesk-thumb"><img src="media/landing/ledger_desk.jpg" alt="" width="640" height="360" loading="eager"></div>',
    '<div class="newsdesk-thumb"><img src="media/generated/tenets_desk_hero.png" alt="Tenets Desk" width="640" height="360" loading="eager"></div>'
)

# Add to Global RSS (first wire-external lead-card)
rss_target = """      <article class="glass lead-card wire-external">
        <time>22:54 ET</time>"""
rss_replacement = """      <article class="glass lead-card wire-external has-thumb">
        <div class="newsdesk-thumb" style="margin-bottom:1rem"><img src="media/generated/global_rss_wire.png" alt="Global RSS Wire" style="width:100%;height:auto;object-fit:cover;border-radius:4px" loading="lazy"></div>
        <time>22:54 ET</time>"""
c = c.replace(rss_target, rss_replacement)

# Replace in stills grid (media/landing/parliament_ice.jpg and ledger_desk.jpg)
c = c.replace(
    '<div class="still-frame"><img src="media/landing/parliament_ice.jpg" alt="Parliament buildings in cold ice-grey light" width="800" height="500" loading="lazy"></div>',
    '<div class="still-frame"><img src="media/generated/frozen_parliament.png" alt="Parliament buildings in cold ice-grey light" width="800" height="500" loading="lazy"></div>'
)

c = c.replace(
    '<div class="still-frame"><img src="media/landing/ledger_desk.jpg" alt="Open ledgers and paper dossiers on a dark desk" width="800" height="500" loading="lazy"></div>',
    '<div class="still-frame"><img src="media/generated/tenets_desk_hero.png" alt="Open ledgers and paper dossiers on a dark desk" width="800" height="500" loading="lazy"></div>'
)

p.write_text(c, encoding="utf-8")
print("index.html patched.")
