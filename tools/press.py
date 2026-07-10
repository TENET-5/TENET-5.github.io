#!/usr/bin/env python3
"""TENET5 PRESS — the site's content system. WordPress for the local AI.

The AI (or a human) manages CONTENT ONLY — small JSON files in content/.
This builder renders them through ONE locked design system (glass /
Canada / linear-backwards / LIRIL-guided). Markup is never hand-edited,
so no page can go off-brand or leak internals.

    Publish flow:
      1. drop/edit JSON in content/posts/   (schema: tools/PRESS.md)
      2. python tools/press.py
      3. git add index.html evidence-index.html story content && commit

Owns and overwrites: index.html, evidence-index.html, story/*.html.
Touches nothing else. Brand guard (pre-commit) remains the safety net.
"""
from __future__ import annotations

import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
POSTS = CONTENT / "posts"
STORY_DIR = ROOT / "story"

# ── time buckets: the linear-backwards spine ─────────────────────────────
BUCKETS = [
    ("now",   2 * 24 * 3600,        "I",   "This <em>hour.</em>",
     "The wire · updated continuously"),
    ("week",  14 * 24 * 3600,       "II",  "Seven days <em>back.</em>",
     "The week's investigations"),
    ("month", 62 * 24 * 3600,       "III", "The claims<br>v. the <em>record.</em>",
     "Claim check · verdicts cite documents, never opinions"),
    ("year",  366 * 24 * 3600,      "IV",  "The year's<br><em>case files.</em>",
     "Published dossiers"),
]

FUTURE_BUCKETS = [
    ("future-now",   0, "I",   "The immediate<br><em>anticipation.</em>",
     "Live ingestion · projecting the next 48 hours"),
    ("future-week",  0, "II",  "Seven days<br><em>forward.</em>",
     "Anticipated maneuvers"),
    ("future-month", 0, "III", "The coming<br><em>month.</em>",
     "Predictive modeling · policy fallout"),
    ("future-year",  0, "IV",  "The year<br><em>unfolding.</em>",
     "Structural consequences"),
]


def esc(s: str) -> str:
    return html.escape(str(s), quote=True)


def load_json(p: Path):
    with open(p, encoding="utf-8") as fh:
        return json.load(fh)


def post_age_s(post: dict, now: datetime) -> float:
    try:
        d = datetime.fromisoformat(post["date"])
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        return (now - d).total_seconds()
    except Exception:
        return float("inf")


def sources_line(post: dict) -> str:
    out = []
    for s in post.get("sources", []):
        lab = esc(s.get("label", "source"))
        url = s.get("url", "")
        out.append(f'<a href="{esc(url)}" rel="noopener">{lab}</a>' if url else lab)
    return " · ".join(out)


# ══ SHARED CHROME ══════════════════════════════════════════════════════════

def css() -> str:
    # LOCKED visual: Daniel screenshot 2026-07-10 042513 — Fraunces + ice + red rails
    # Do NOT flatten to product-only Atkinson shell.
    return """
  :root{
    --void:#050708;--ink:#0b0e10;
    --ivory:#ece7dc;--ivory-dim:#a89f90;--ivory-faint:#6b6459;
    --hair:#26221c;--hair-lit:#3a342b;
    --ice:#9adbe8;--ice-deep:#3f7c8c;
    --red:#c8102e;--red-deep:#8f0f24;--gold:#d3a625;
    --serif:'Fraunces',Georgia,serif;--mono:'IBM Plex Mono',Consolas,monospace;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:var(--void);color:var(--ivory);font-family:var(--serif);
    font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;position:relative}
  body::after{content:"";position:fixed;inset:0;z-index:200;pointer-events:none;opacity:.05;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
  body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
    background:radial-gradient(120% 90% at 50% 8%,transparent 55%,rgba(0,0,0,.55) 100%)}
  a{color:inherit;text-decoration:none}a:hover{color:var(--ice)}
  ::selection{background:var(--ice);color:var(--void)}
  .js .rv{opacity:0;transform:translateY(26px);transition:opacity 1s ease,transform 1s ease}
  .js .rv.in{opacity:1;transform:none}
  .brand-crest,.nav-crest,img[src*="crest"],img[src*="royal_crest"]{display:none!important}

  /* glass system — every card is a pane over an aurora field */
  .glass{position:relative;border-radius:8px;border:1px solid rgba(154,219,232,.16);
    background:linear-gradient(160deg,rgba(154,219,232,.08),rgba(154,219,232,.02) 45%,rgba(5,7,8,.4));
    backdrop-filter:blur(16px) saturate(1.15);-webkit-backdrop-filter:blur(16px) saturate(1.15);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(0,0,0,.45),
      0 34px 60px -30px rgba(0,0,0,.9);
    transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}
  .glass::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
    background:linear-gradient(115deg,rgba(255,255,255,.10),transparent 32%)}
  .glass:hover{transform:translateY(-4px);border-color:rgba(154,219,232,.3);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 48px 76px -32px rgba(0,0,0,.95)}
  .field{position:relative}
  .field::before{content:"";position:absolute;inset:-4vh 0;pointer-events:none;z-index:0;
    background:
      radial-gradient(700px 380px at 12% 20%,rgba(63,124,140,.15),transparent 65%),
      radial-gradient(560px 320px at 88% 70%,rgba(200,16,46,.06),transparent 62%),
      radial-gradient(420px 260px at 60% 10%,rgba(211,166,37,.045),transparent 60%)}
  .field>*{position:relative;z-index:1}

  .wrapx{max-width:1200px;margin:0 auto;padding:0 clamp(20px,4vw,56px)}
  @media(min-width:901px){.wrapx{padding-right:clamp(110px,10vw,150px)}}
  .kick{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.26em;
    text-transform:uppercase;color:var(--ice)}
  .kick.red{color:var(--red)}
  .meta{font-family:var(--mono);font-size:10.5px;color:var(--ivory-faint);letter-spacing:.06em}
  .meta a{color:var(--ivory-dim);border-bottom:1px solid var(--hair-lit)}
  .meta a:hover{color:var(--ice);border-color:var(--ice)}

  /* cover */
  .cover{min-height:100vh;display:flex;flex-direction:column;position:relative;
    border-bottom:1px solid var(--hair);overflow:hidden;
    background:
      radial-gradient(1300px 560px at 72% -12%,rgba(63,124,140,.26),transparent 62%),
      radial-gradient(900px 480px at 6% 112%,rgba(200,16,46,.09),transparent 60%),var(--void)}
  .cover::before,.cover::after{content:"";position:absolute;top:0;bottom:0;
    width:clamp(8px,1.4vw,18px);background:linear-gradient(180deg,var(--red-deep),var(--red) 40%,var(--red-deep));
    opacity:.85;z-index:2}
  .cover::before{left:0}.cover::after{right:0}
  .ghost5{position:absolute;right:1vw;bottom:-14vh;font-family:var(--serif);font-style:italic;
    font-weight:300;font-size:56vh;line-height:1;color:transparent;
    -webkit-text-stroke:1px rgba(200,16,46,.12);pointer-events:none;user-select:none}
  .cover-bar{display:flex;justify-content:space-between;align-items:center;gap:18px;
    padding:20px clamp(28px,4.4vw,64px);font-family:var(--mono);font-size:10.5px;
    letter-spacing:.22em;color:var(--ivory-faint);text-transform:uppercase;
    border-bottom:1px solid var(--hair);position:relative;z-index:3}
  .brand{display:flex;align-items:center;gap:14px;text-transform:none}
  .brand img{display:none!important}
  .brand .wm{font-family:var(--serif);font-weight:600;font-size:18px;letter-spacing:.04em;color:var(--ivory)}
  .brand .wm sup{font-size:.5em;color:var(--ice);position:relative;top:-.65em;vertical-align:baseline}
  .cover-core{flex:1;display:flex;flex-direction:column;justify-content:center;
    padding:6vh clamp(28px,4.4vw,64px);max-width:1200px;width:100%;margin:0 auto;position:relative;z-index:3}
  .cover-kick{font-family:var(--mono);font-size:11px;letter-spacing:.34em;
    text-transform:uppercase;color:var(--ice);margin-bottom:3vh}
  .cover h1{font-weight:300;font-size:clamp(52px,8.4vw,124px);line-height:1.02;letter-spacing:-.02em}
  .cover h1 em{font-style:italic;font-weight:400;color:var(--ice)}
  .cover .fr{margin-top:2vh;font-style:italic;font-weight:300;font-size:clamp(14px,1.6vw,18px);
    color:var(--ivory-faint)}
  .cover .fr::before{content:"";display:inline-block;width:34px;height:1px;background:var(--red);
    vertical-align:middle;margin-right:14px}
  .cover .stand{margin-top:3.5vh;max-width:520px;font-size:clamp(15px,1.6vw,18px);color:var(--ivory-dim)}
  .cover .stand b{color:var(--ivory);font-weight:600}
  .cover-foot{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;
    padding:0 clamp(28px,4.4vw,64px) 5vh;max-width:1200px;width:100%;margin:0 auto;
    position:relative;z-index:3;flex-wrap:wrap}
  .liril-intro{max-width:460px;border-left:1px solid var(--ice-deep);padding:6px 0 6px 22px}
  .liril-intro .who{font-family:var(--mono);font-size:10px;letter-spacing:.3em;color:var(--ice);
    text-transform:uppercase;margin-bottom:8px}
  .liril-intro p{font-style:italic;font-size:15.5px;color:var(--ivory-dim)}
  .begin{font-family:var(--mono);font-size:11px;letter-spacing:.26em;text-transform:uppercase;
    color:var(--ivory);display:flex;flex-direction:column;align-items:center;gap:14px}
  .begin .arrow{width:1px;height:56px;background:linear-gradient(180deg,var(--ivory-faint),var(--ice));
    animation:drop 2.4s ease infinite}
  @keyframes drop{0%{transform:scaleY(.2);transform-origin:top;opacity:0}
    40%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}

  /* thesis */
  .thesis{border-bottom:1px solid var(--hair);padding:10vh 0}
  .thesis-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:5vh}
  @media(max-width:860px){.thesis-grid{grid-template-columns:1fr}}
  .thesis .panel{padding:34px 36px}
  .thesis .panel h4{font-family:var(--mono);font-size:10.5px;letter-spacing:.3em;
    text-transform:uppercase;margin-bottom:18px}
  .thesis .panel.dx h4{color:var(--red)}
  .thesis .panel.rx h4{color:var(--ice)}
  .thesis .panel p{font-size:15.5px;color:var(--ivory-dim);line-height:1.7}
  .thesis .panel p b{color:var(--ivory);font-weight:600}
  .thesis .links{margin-top:26px;font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;
    text-transform:uppercase;color:var(--ivory-faint)}
  .thesis .links a{color:var(--ivory-dim);border-bottom:1px solid var(--hair-lit);margin-right:22px}
  .thesis .links a:hover{color:var(--ice);border-color:var(--ice)}
  .thesis-title{font-weight:300;font-size:clamp(30px,4.6vw,56px);line-height:1.05;letter-spacing:-.02em}
  .thesis-title em{font-style:italic;color:var(--red);font-weight:400}

  /* catalog — the whole book, A to Z */
  .catalog{border-top:1px solid var(--hair);padding:9vh 0}
  .catalog .cat-grid{margin-top:4vh;columns:3;column-gap:38px}
  @media(max-width:1000px){.catalog .cat-grid{columns:2}}
  @media(max-width:680px){.catalog .cat-grid{columns:1}}
  .cat-letter{font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:var(--ice);
    margin:20px 0 6px;break-inside:avoid}
  a.cat-item{display:block;break-inside:avoid;padding:9px 0;border-bottom:1px solid var(--hair)}
  a.cat-item .t{display:block;color:var(--ivory);font-size:14.5px;line-height:1.35}
  a.cat-item .d{display:block;color:var(--ivory-faint);font-size:11.5px;line-height:1.5;margin-top:2px}
  a.cat-item:hover .t{color:var(--ice)}

  /* chapters */
  .ch{border-bottom:1px solid var(--hair);padding:0 0 10vh}
  .ch:nth-of-type(even){background:linear-gradient(180deg,#090c0e,#07090b 30%,#07090b 70%,#05070a);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.03),inset 0 -1px 0 rgba(0,0,0,.6)}
  .ch-head{max-width:1200px;margin:0 auto;padding:9vh clamp(20px,4vw,56px) 6vh;
    display:grid;grid-template-columns:auto 1fr;gap:clamp(20px,4vw,64px);align-items:baseline;position:relative}
  @media(min-width:901px){.ch-head{padding-right:clamp(110px,10vw,150px)}}
  .ch-head .ghost{position:absolute;top:-4vh;right:clamp(0px,2vw,30px);font-style:italic;
    font-weight:300;font-size:clamp(160px,24vw,340px);line-height:1;color:transparent;
    -webkit-text-stroke:1px rgba(236,231,220,.05);pointer-events:none;user-select:none;z-index:0}
  .ch-head>*{position:relative;z-index:1}
  .ch-no{font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:var(--ivory-faint);
    text-transform:uppercase;white-space:nowrap}
  .ch-no .roman{display:block;font-family:var(--serif);font-size:clamp(40px,5vw,64px);
    font-weight:300;color:var(--ivory);letter-spacing:0;line-height:1;margin-top:10px}
  .ch-title{font-weight:300;font-size:clamp(34px,5.4vw,72px);line-height:1.04;letter-spacing:-.02em}
  .ch-title em{font-style:italic;color:var(--ice);font-weight:400}
  .ch-when{grid-column:2;font-family:var(--mono);font-size:11px;letter-spacing:.22em;
    color:var(--ivory-faint);text-transform:uppercase;margin-top:14px}
  @media(max-width:700px){.ch-head{grid-template-columns:1fr}.ch-when{grid-column:1}}

  /* wire */
  .wire{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
  @media(max-width:1000px){.wire{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:640px){.wire{grid-template-columns:1fr}}
  .wire .glass{padding:26px 28px;display:flex;flex-direction:column;gap:10px}
  .wire .glass.lead-card{grid-column:span 2}
  @media(max-width:640px){.wire .glass.lead-card{grid-column:auto}}
  .wire time{font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--ice-deep);
    text-transform:uppercase}
  .wire h3{font-weight:600;font-size:18px;line-height:1.32}
  .wire .lead-card h3{font-weight:400;font-size:clamp(22px,2.4vw,30px);line-height:1.16}
  .wire p{font-size:13.5px;color:var(--ivory-dim)}
  .wire .lead-card p{font-size:15px}
  .wire .lead-card p::first-letter{font-size:3.2em;font-weight:600;float:left;line-height:.82;
    padding:4px 10px 0 0;color:var(--ice)}
  .wire .meta{margin-top:auto;padding-top:10px;border-top:1px solid rgba(154,219,232,.1)}

  /* feature */
  .feature{display:grid;grid-template-columns:1.5fr 1fr;gap:clamp(24px,4vw,56px)}
  @media(max-width:900px){.feature{grid-template-columns:1fr}}
  .feature .main{padding:38px 42px}
  .feature .main h3{font-weight:400;font-size:clamp(26px,3.4vw,40px);line-height:1.12;margin:14px 0 20px}
  .feature .lede{font-size:clamp(16px,1.8vw,20px);color:var(--ivory);line-height:1.65}
  .feature .lede::first-letter{font-size:3.6em;font-weight:600;float:left;line-height:.8;
    padding:6px 12px 0 0;color:var(--ice)}
  .feature .body-t{margin-top:20px;font-size:15px;color:var(--ivory-dim)}
  .pull{padding:30px 34px;margin-bottom:18px;position:relative}
  .pull::before{content:"\\201C";position:absolute;top:-26px;left:6px;font-size:130px;line-height:1;
    color:rgba(154,219,232,.10);font-style:italic;pointer-events:none}
  .pull p{font-style:italic;font-weight:300;font-size:clamp(20px,2.3vw,27px);line-height:1.32;position:relative}
  .pull p b{color:var(--ice);font-weight:400}
  .side .glass{padding:20px 24px;margin-bottom:14px}
  .side h4{font-weight:600;font-size:16px;line-height:1.35;margin:8px 0 4px}
  .side p{font-size:13px;color:var(--ivory-dim)}

  /* exhibits */
  .exhibits{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
  @media(max-width:820px){.exhibits{grid-template-columns:1fr}}
  .exhibit{padding:32px 34px}
  .exhibit .tag{position:absolute;top:-9px;left:24px;background:var(--void);padding:2px 10px;
    font-family:var(--mono);font-size:9.5px;letter-spacing:.26em;color:var(--ivory-faint);
    text-transform:uppercase;border:1px solid var(--hair-lit);border-radius:2px;z-index:2}
  .exhibit .claim-q{font-style:italic;font-weight:300;font-size:19px;line-height:1.4;
    margin-bottom:16px;padding-right:118px}
  @media(max-width:700px){
    .exhibit{padding-top:52px}
    .exhibit .claim-q{padding-right:0}
  }
  .exhibit .finding{font-size:13.5px;color:var(--ivory-dim);border-top:1px solid rgba(154,219,232,.12);
    padding-top:14px}
  .exhibit .finding b{color:var(--ivory);font-weight:600}
  .stamp{position:absolute;top:24px;right:24px;font-family:var(--mono);font-size:.6rem;font-weight:600;
    letter-spacing:.14em;text-transform:uppercase;padding:4px 10px;border:1px solid;border-radius:2px;z-index:2}
  .stamp.bad{color:var(--red);border-color:var(--red)}
  .stamp.ok{color:#7fbf9a;border-color:#7fbf9a}
  .stamp.warn{color:var(--gold);border-color:var(--gold)}

  /* dossiers */
  .dossier{display:grid;grid-template-columns:96px 1fr auto;gap:clamp(16px,3vw,44px);
    align-items:baseline;padding:28px 32px;margin-bottom:16px}
  .dossier .no{font-family:var(--serif);font-weight:400;font-size:34px;color:var(--ivory-faint)}
  .dossier h3{font-weight:400;font-size:clamp(20px,2.4vw,27px);line-height:1.2;margin-bottom:8px}
  .dossier p{font-size:14px;color:var(--ivory-dim);max-width:620px}
  .dossier .meta{white-space:nowrap}
  @media(max-width:700px){.dossier{grid-template-columns:1fr}.dossier .no{font-size:26px}}

  /* era */
  .era{max-width:1200px;margin:0 auto;padding:0 clamp(20px,4vw,56px);text-align:center}
  .era h3{font-weight:300;font-size:clamp(38px,6vw,84px);line-height:1.05;letter-spacing:-.02em;margin:3vh 0}
  .era h3 em{font-style:italic;font-weight:400;color:var(--ice)}
  .era p{max-width:560px;margin:0 auto;color:var(--ivory-dim);font-size:16px}
  .era .stats{font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--ivory-faint);
    text-transform:uppercase;margin-top:4vh}
  .era .go-film{display:inline-block;margin-top:4.5vh;font-family:var(--mono);font-size:11px;
    font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--void);
    background:var(--ice);padding:16px 38px;border-radius:3px;transition:all .25s ease;
    box-shadow:0 16px 44px -12px rgba(154,219,232,.38)}
  .era .go-film:hover{background:var(--ivory);transform:translateY(-2px);
    box-shadow:0 22px 54px -12px rgba(154,219,232,.5)}
  .era .alt{display:block;margin-top:18px;font-family:var(--mono);font-size:10px;
    letter-spacing:.2em;color:var(--ivory-faint);text-transform:uppercase}
  .era .alt a{color:var(--ivory-dim);border-bottom:1px solid var(--hair-lit)}
  .era .alt a:hover{color:var(--ice);border-color:var(--ice)}

  /* rail + dock */
  .rail{position:fixed;right:clamp(10px,2.4vw,34px);top:50%;transform:translateY(-50%);z-index:90;
    display:flex;flex-direction:column;align-items:flex-end}
  .rail .seg{display:flex;align-items:center;gap:12px;padding:11px 0}
  .rail .lbl{font-family:var(--mono);font-size:9px;letter-spacing:.24em;color:var(--ivory-faint);
    text-transform:uppercase;opacity:0;transform:translateX(6px);transition:all .4s ease}
  .rail .dot{width:8px;height:8px;border-radius:50%;border:1px solid var(--ivory-faint);
    background:var(--void);transition:all .4s ease}
  .rail .seg:hover .lbl{opacity:1;transform:none}
  .rail .seg.on .dot{background:var(--ice);border-color:var(--ice);box-shadow:0 0 10px rgba(238,246,250,.4)}
  .rail .seg.on .lbl{opacity:1;transform:none;color:var(--ivory)}
  @media(max-width:900px){.rail{display:none}}
  .dock{position:fixed;left:0;right:0;bottom:0;z-index:95;
    background:linear-gradient(180deg,transparent,rgba(5,7,8,.88) 30%,rgba(5,7,8,.97));
    border-top:1px solid var(--hair);backdrop-filter:blur(10px);
    box-shadow:0 -24px 48px -18px rgba(0,0,0,.7);
    transform:translateY(110%);transition:transform .6s ease}
  .dock.up{transform:none}
  .dock-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:18px;
    padding:12px clamp(20px,4vw,56px)}
  .dock .eq{display:flex;align-items:flex-end;gap:2.5px;height:18px;flex-shrink:0;opacity:.4;transition:opacity .3s}
  .dock.speaking .eq{opacity:1}
  .dock .eq i{display:block;width:3px;background:var(--ice);border-radius:1px;height:30%}
  .dock.speaking .eq i{animation:eq 1s ease-in-out infinite}
  .dock .eq i:nth-child(2){height:70%;animation-delay:.12s}
  .dock .eq i:nth-child(3){height:45%;animation-delay:.24s}
  .dock .eq i:nth-child(4){height:90%;animation-delay:.36s}
  .dock .eq i:nth-child(5){height:55%;animation-delay:.48s}
  @keyframes eq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
  .dock .say{flex:1;font-style:italic;font-size:14px;color:var(--ivory-dim);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dock .say b{color:var(--ice);font-style:normal;font-family:var(--mono);font-size:10px;
    letter-spacing:.24em;text-transform:uppercase;margin-right:12px}
  .dock button{font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;
    background:none;border:1px solid var(--hair-lit);color:var(--ivory-dim);padding:7px 14px;
    border-radius:2px;cursor:pointer;flex-shrink:0}
  .dock button:hover{border-color:var(--ice);color:var(--ice)}
  .dock button.on{border-color:var(--ice);color:var(--void);background:var(--ice)}

  /* evidence shelf */
  .shelf-controls{display:flex;gap:14px;margin:4vh 0;flex-wrap:wrap}
  .shelf-controls input,.shelf-controls select{font-family:var(--mono);font-size:12px;
    background:rgba(154,219,232,.05);border:1px solid var(--hair-lit);color:var(--ivory);
    padding:11px 16px;border-radius:3px;min-width:220px}
  .shelf-controls input:focus,.shelf-controls select:focus{outline:none;border-color:var(--ice-deep)}
  .shelf-cat{font-family:var(--mono);font-size:10.5px;letter-spacing:.3em;color:var(--red);
    text-transform:uppercase;margin:6vh 0 3vh;display:flex;align-items:center;gap:18px}
  .shelf-cat::after{content:"";flex:1;height:1px;background:var(--hair)}
  .src-card{padding:26px 30px;margin-bottom:16px;display:grid;
    grid-template-columns:1fr auto;gap:8px 26px;align-items:baseline}
  @media(max-width:700px){.src-card{grid-template-columns:1fr}}
  .src-card h3{font-weight:400;font-size:21px;line-height:1.25}
  .src-card .what{grid-column:1;font-size:13.5px;color:var(--ivory-dim);margin-top:4px}
  .src-card .attr{grid-column:1;font-family:var(--mono);font-size:10.5px;color:var(--ivory-faint);
    letter-spacing:.06em;margin-top:10px;border-top:1px solid rgba(154,219,232,.1);padding-top:10px}
  .src-card .attr a{color:var(--ice-deep);border-bottom:1px solid transparent}
  .src-card .attr a:hover{color:var(--ice);border-color:var(--ice)}
  .src-card .badges{grid-column:2;grid-row:1 / span 3;display:flex;flex-direction:column;
    gap:8px;align-items:flex-end}
  .vbadge{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.2em;
    text-transform:uppercase;padding:4px 10px;border:1px solid;border-radius:2px}
  .vbadge.v{color:#7fbf9a;border-color:rgba(127,191,154,.55)}
  .vbadge.sv{color:var(--gold);border-color:rgba(211,166,37,.55)}
  .vbadge.data{color:var(--ivory-faint);border-color:var(--hair-lit)}
  .vbadge.data:hover{color:var(--ice);border-color:var(--ice)}
  .note{font-size:12px;color:var(--gold);font-style:italic;margin-top:8px;grid-column:1}

  /* article */
  .article{max-width:760px;margin:0 auto;padding:10vh clamp(20px,4vw,56px)}
  .article h1{font-weight:300;font-size:clamp(34px,5vw,58px);line-height:1.08;letter-spacing:-.02em;
    margin:16px 0 24px}
  .article .dek{font-size:19px;color:var(--ivory-dim);font-style:italic;margin-bottom:5vh}
  .article .bodyp{font-size:16.5px;color:var(--ivory);margin-bottom:26px;line-height:1.75}
  .article .bodyp:first-of-type::first-letter{font-size:3.6em;font-weight:600;float:left;
    line-height:.8;padding:6px 12px 0 0;color:var(--ice)}
  .article .srcs{margin-top:6vh;padding:26px 30px}
  .article .srcs h4{font-family:var(--mono);font-size:10px;letter-spacing:.3em;color:var(--ice);
    text-transform:uppercase;margin-bottom:14px}

  /* briefing */
  .threat{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:.68rem;
    letter-spacing:.16em;text-transform:uppercase;padding:6px 12px;border:1px solid;border-radius:2px}
  .threat::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
  .threat.AMBER{color:var(--slate-warning);border-color:rgba(201,164,76,.4)}
  .threat.RED{color:var(--slate-critical);border-color:rgba(176,84,74,.4)}
  .threat.GREEN{color:var(--slate-verified);border-color:rgba(110,143,104,.4)}
  .read-brief{display:inline-flex;align-items:center;gap:12px;margin-top:3vh;
    font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.24em;
    text-transform:uppercase;color:var(--void);background:var(--ice);padding:14px 30px;
    border-radius:3px;cursor:pointer;border:none;
    box-shadow:0 16px 44px -12px rgba(154,219,232,.38);transition:all .25s ease}
  .read-brief:hover{background:var(--ivory);transform:translateY(-2px)}
  .brief-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
  @media(max-width:860px){.brief-grid{grid-template-columns:1fr}}
  .brief-item{padding:26px 30px;display:flex;flex-direction:column;gap:10px}
  .brief-item h3{font-weight:600;font-size:19px;line-height:1.3}
  .brief-item p{font-size:13.5px;color:var(--ivory-dim)}
  .tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  @media(max-width:900px){.tiles{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.tiles{grid-template-columns:1fr}}
  .tile{padding:24px 26px}
  .tile .v{font-family:var(--serif);font-weight:400;font-size:clamp(24px,2.6vw,34px);
    letter-spacing:-.01em;line-height:1.1}
  .tile.high .v{color:var(--red)}
  .tile.watch .v{color:var(--gold)}
  .tile.ok .v,.tile .v{color:var(--ice)}
  .tile .l{font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--ivory-faint);
    text-transform:uppercase;margin-top:8px}
  .tile .n{font-size:12px;color:var(--ivory-dim);margin-top:8px;font-style:italic}
  .horizon{display:grid;grid-template-columns:1fr 1fr;gap:26px}
  @media(max-width:860px){.horizon{grid-template-columns:1fr}}
  .h-col h3{font-family:var(--mono);font-size:10.5px;letter-spacing:.3em;
    text-transform:uppercase;margin-bottom:18px}
  .h-col.stated h3{color:var(--ice)}
  .h-col.inferred h3{color:var(--gold)}
  .h-col .glass{padding:22px 26px;margin-bottom:14px}
  .h-col.inferred .glass{border-style:dashed;border-color:rgba(211,166,37,.35)}
  .h-col h4{font-weight:600;font-size:16px;line-height:1.35;margin-bottom:6px}
  .h-col p{font-size:13px;color:var(--ivory-dim)}
  .conf{font-family:var(--mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;
    color:var(--ivory-faint);display:block;margin-bottom:8px}
  .contract{padding:26px 30px;font-family:var(--mono);font-size:12px;color:var(--ivory-dim);
    line-height:2}
  .contract b{color:var(--ice);letter-spacing:.2em;text-transform:uppercase;font-size:10px;
    display:block;margin-bottom:10px}
  .brief-err{font-family:var(--mono);font-size:12px;color:var(--gold);padding:20px 0}

  /* network board */
  .board-wrap{display:grid;grid-template-columns:1fr 320px;gap:22px}
  @media(max-width:980px){.board-wrap{grid-template-columns:1fr}}
  .board{padding:10px;overflow:auto}
  .board svg{display:block;width:100%;min-width:720px;height:auto}
  .board .edge{stroke:rgba(154,219,232,.16);transition:stroke .25s ease}
  .board .edge.hot{stroke:rgba(154,219,232,.55)}
  .board .node{cursor:pointer}
  .board .node circle{stroke:rgba(5,7,8,.9);stroke-width:.35;transition:all .25s ease}
  .board .node text{font-family:var(--mono);font-size:1.15px;fill:var(--ivory-dim);
    pointer-events:none;opacity:0;transition:opacity .25s ease}
  .board .node:hover text,.board .node.sel text{opacity:1;fill:var(--ivory)}
  .board .node:hover circle,.board .node.sel circle{stroke:var(--ice);stroke-width:.3}
  .board .node.dim{opacity:.14;pointer-events:none}
  .board .edge.dim{opacity:.08}
  .detail{padding:26px 28px;align-self:start;position:sticky;top:20px}
  .detail .kick{margin-bottom:10px;display:block}
  .detail h3{font-weight:400;font-size:22px;line-height:1.2;margin-bottom:6px}
  .detail .sub{font-family:var(--mono);font-size:10.5px;color:var(--ivory-faint);
    letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px}
  .detail p{font-size:13.5px;color:var(--ivory-dim)}
  .detail .cons{margin-top:16px;border-top:1px solid rgba(154,219,232,.12);padding-top:12px}
  .detail .cons div{font-family:var(--mono);font-size:11px;color:var(--ivory-dim);padding:4px 0}
  .detail .cons b{color:var(--ice);font-weight:500}
  .detail a.open{display:inline-block;margin-top:16px;font-family:var(--mono);font-size:10px;
    font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--ice);
    border-bottom:1px solid var(--ice-deep)}
  .chips{display:flex;gap:10px;flex-wrap:wrap;margin:3vh 0}
  .chip{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;
    padding:7px 14px;border:1px solid var(--hair-lit);border-radius:2px;color:var(--ivory-dim);
    cursor:pointer;background:none;transition:all .2s ease}
  .chip:hover{border-color:var(--ice);color:var(--ice)}
  .chip.on{background:var(--ice);color:var(--void);border-color:var(--ice)}
  .guide{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:5vh}
  @media(max-width:860px){.guide{grid-template-columns:1fr}}
  .guide .glass{padding:20px 24px;font-size:13px;color:var(--ivory-dim)}
  .guide b{color:var(--ivory);font-weight:600;display:block;margin-bottom:6px;
    font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase}

  /* footer */
  footer{padding:8vh clamp(20px,4vw,56px) 14vh;max-width:1200px;margin:0 auto;
    color:var(--ivory-faint);font-size:12.5px;position:relative;z-index:1}
  footer .rowf{display:flex;justify-content:space-between;gap:40px;flex-wrap:wrap;
    font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase}
  footer .rowf a{color:var(--ivory-dim);margin-right:26px}
  footer .fm{font-family:var(--serif);font-size:22px;font-weight:600;color:var(--ivory);
    text-transform:none;letter-spacing:.02em}
  footer .fm sup{font-size:.5em;color:var(--ice);position:relative;top:-.65em;vertical-align:baseline}
  footer .origin{margin-top:5vh;border-top:1px solid var(--hair);padding-top:22px;
    font-family:var(--mono);font-size:10px;letter-spacing:.05em;line-height:1.9}
"""


def head(title: str, desc: str) -> str:
    # Screenshot-locked press surface (Fraunces + ice + red rails). LIRIL guide is
    # part of the homepage chrome (dock_and_script) — PRISM site duty enforces it.
    return f"""<!doctype html>
<html lang="en-CA" data-press="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} | TENET5</title>
<meta name="description" content="{esc(desc)}">
<meta property="og:site_name" content="TENET5">
<meta property="og:title" content="{esc(title)} | TENET5">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://tenet-5.github.io/img/og-card.png">
<meta name="theme-color" content="#050708">
<meta name="liril-role" content="system-guide">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/press-theme.css?v=69">
<!-- ONE THEME: edit css/press-theme.css to restyle the whole site -->
</head>
<body>
"""

def press_nav(active: str = "") -> str:
    """Interior chrome only — homepage keeps the cover. Never use cover-bar here."""
    items = [
        ("Home", "index.html", "home"),
        ("Briefing", "daily-briefing.html", "briefing"),
        ("Evidence", "evidence-index.html", "evidence"),
        ("Guided", "liril-film.html", "film"),
        ("About", "about.html", "about"),
    ]
    links = []
    for label, href, key in items:
        on = ' class="is-on"' if key == active else ""
        links.append(f'<a href="{href}"{on}>{label}</a>')
    return f"""
<header class="press-bar" role="banner">
  <a class="wm" href="index.html">TENET<sup>5</sup></a>
  <nav aria-label="Primary">{"".join(links)}</nav>
</header>
"""


def footer_html(site: dict) -> str:
    # Canonical press chrome (apply_one_theme also enforces this on every interior).
    _ = site  # origin kept on homepage cover path; interiors share press-foot
    return """
<footer class="press-foot" role="contentinfo">
  <span>TENET5 · Powered by LIRIL AI</span>
  <a href="methodology-transparency.html">Methodology</a>
  <a href="about.html">About</a>
  <a href="legal.html">Legal</a>
  <a href="evidence-index.html">Evidence</a>
  <a href="daily-briefing.html">Briefing</a>
</footer>
"""


def dock_and_script(site: dict, with_rail: bool) -> str:
    """LIRIL system guide chrome: rail + always-on dock + voice/guide scripts."""
    rail = """
<nav class="rail" aria-label="Timeline">
  <a class="seg" href="#now" data-ch="now"><span class="lbl">This Hour</span><span class="dot"></span></a>
  <a class="seg" href="#week" data-ch="week"><span class="lbl">This Week</span><span class="dot"></span></a>
  <a class="seg" href="#month" data-ch="month"><span class="lbl">This Month</span><span class="dot"></span></a>
  <a class="seg" href="#year" data-ch="year"><span class="lbl">This Year</span><span class="dot"></span></a>
  <a class="seg" href="#era" data-ch="era"><span class="lbl">The Era</span><span class="dot"></span></a>
</nav>""" if with_rail else ""
    # Cover inject: Guide me button inside liril-intro (patched after build if needed)
    return rail + f"""
<div class="dock guide-ready up" id="dock" role="region" aria-label="LIRIL guide">
  <div class="dock-in">
    <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="say"><b>LIRIL</b><span id="liril-line">{esc(site.get("liril_default", "We begin at this hour."))}</span></div>
    <button id="liril-guide-btn" type="button" title="Start LIRIL as your guide through the record">Guide me</button>
    <button id="voice-btn" type="button" aria-pressed="false" title="Toggle LIRIL voice narration">Voice · Off</button>
    <div class="liril-status" id="liril-status">LIRIL loading…</div>
  </div>
</div>
<script src="js/liril-voice.js?v=42" defer></script>
<script src="js/liril-home-guide.js?v=3" defer></script>
</body>
</html>"""


# ══ INDEX ═══════════════════════════════════════════════════════════════════

def render_wire(posts: list[dict]) -> str:
    cards = []
    for i, p in enumerate(posts):
        lead = " lead-card" if i == 0 else ""
        t = ""
        try:
            t = datetime.fromisoformat(p["date"]).strftime("%H:%M ET")
        except Exception:
            pass
        body = f'<p>{esc(p.get("dek",""))}</p>' if p.get("dek") else ""
        cards.append(f"""
      <article class="glass{lead}">
        <time>{esc(t)}</time>
        <span class="kick">{esc(p.get("kicker",""))}</span>
        <h3>{esc(p["title"])}</h3>
        {body}
        <div class="meta">{sources_line(p)}</div>
      </article>""")
    return f'<div class="wire">{"".join(cards)}</div>'


def render_features(posts: list[dict]) -> str:
    if not posts:
        return ""
    main, rest = posts[0], posts[1:]
    body = "".join(f'<p class="body-t">{esc(b)}</p>' for b in main.get("body", [])[:1])
    pull = ""
    if main.get("pull_quote"):
        pull = f"""<div class="pull glass"><p>{main["pull_quote"]}</p>
        <div class="meta" style="margin-top:14px">From the case file</div></div>"""
    side = "".join(f"""
        <div class="glass"><span class="kick">{esc(p.get("kicker",""))}</span>
        <h4>{esc(p["title"])}</h4><p>{esc(p.get("dek",""))}</p></div>""" for p in rest[:3])
    link = f'story/{esc(main["slug"])}.html' if main.get("body") else "#"
    return f"""
    <div class="feature">
      <article class="main glass">
        <span class="kick">{esc(main.get("kicker",""))}</span>
        <h3><a href="{link}">{esc(main["title"])}</a></h3>
        <p class="lede">{esc(main.get("dek",""))}</p>
        {body}
        <div class="meta" style="margin-top:20px">{sources_line(main)} · LIRIL reads this file aloud</div>
      </article>
      <div class="side">{pull}{side}</div>
    </div>"""


def render_claims(posts: list[dict]) -> str:
    stamp = {"unsupported": ("bad", "Unsupported"), "supported": ("ok", "Supported"),
             "context": ("warn", "Needs context")}
    out = []
    for i, p in enumerate(posts[:6]):
        cls, lab = stamp.get(p.get("verdict", "context"), ("warn", "Needs context"))
        views = f' — {esc(p["views"])} views' if p.get("views") else ""
        out.append(f"""
      <div class="exhibit glass">
        <span class="tag">Exhibit {chr(65+i)}</span>
        <span class="stamp {cls}">{lab}</span>
        <p class="claim-q">&ldquo;{esc(p["title"])}&rdquo;{views}</p>
        <p class="finding">{p.get("finding_html") or esc(p.get("dek",""))}</p>
      </div>""")
    return f'<div class="exhibits">{"".join(out)}</div>'


def render_dossiers(posts: list[dict]) -> str:
    out = []
    for i, p in enumerate(posts[:6]):
        href = p.get("link") or (f'story/{esc(p["slug"])}.html' if p.get("body") else "#")
        out.append(f"""
    <a class="dossier glass" href="{href}">
      <span class="no">{i+1:03d}</span>
      <div><h3>{esc(p["title"])}</h3><p>{esc(p.get("dek",""))}</p></div>
      <span class="meta">{esc(p.get("status","Published"))}</span>
    </a>""")
    return "".join(out)


CATALOG_SKIP = re.compile(
    r"^(index|404|auth-callback|archive-shell|index_backup|index_legacy|"
    r"index-legacy-cap222-shell|chalkboard|campaign-generator|search|"
    r"test-|layout\.|gateway|permalink)", re.I)

def render_catalog() -> str:
    """The whole book — every public file, A to Z, from each page's own
    title and description. LIRIL narrates entries via data-narrate."""
    entries = []
    for p in sorted(ROOT.glob("*.html")):
        if CATALOG_SKIP.match(p.name):
            continue
        html = p.read_text(encoding="utf-8", errors="replace")
        tm = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
        if not tm:
            continue
        title = re.sub(r"\s*\|\s*TENET5\s*$", "", tm.group(1).strip())
        dm = re.search(r'name="description"\s+content="([^"]*)"', html, re.I)
        desc = (dm.group(1).strip() if dm else "")[:150]
        if not title:
            continue
        entries.append((title, p.name, desc))
    entries.sort(key=lambda e: e[0].upper())
    items, letter = [], ""
    for title, href, desc in entries:
        first = title[0].upper()
        if not first.isalpha():
            first = "#"
        if first != letter:
            letter = first
            items.append(f'<div class="cat-letter">{letter}</div>')
        items.append(
            f'<a class="cat-item" href="{esc(href)}" data-narrate="{esc(title)}. {esc(desc)}">'
            f'<span class="t">{esc(title)}</span>'
            + (f'<span class="d">{esc(desc)}</span>' if desc else "")
            + "</a>")
    return f"""
<section class="catalog field" id="book" data-line="The whole book — {len(entries)} files, A to Z, federal to municipal. Choose any page and I will read it with you.">
  <div class="wrapx rv">
    <span class="kick">The Whole Book · {len(entries)} Files · Updated Daily</span>
    <h2 class="thesis-title" style="margin-top:2vh">Everything, <em>listed.</em></h2>
    <p style="margin-top:2vh;max-width:720px;color:var(--ivory-dim);font-size:15px;line-height:1.7">
    Every investigation, editorial, dossier and dataset on this site — federal, provincial,
    municipal — in one table of contents. Each entry is a sourced file. LIRIL can read any of
    them to you.</p>
    <div class="cat-grid">{''.join(items)}</div>
  </div>
</section>"""


def build_index(site: dict, posts: list[dict], now: datetime) -> str:
    buckets: dict[str, list[dict]] = {k: [] for k, *_ in BUCKETS}
    for p in sorted(posts, key=lambda x: x.get("date", ""), reverse=True):
        age = post_age_s(p, now)
        for key, horizon, *_ in BUCKETS:
            if age <= horizon or (key == "year" and age > BUCKETS[2][1]):
                if key == "month" and p.get("type") != "claim":
                    continue
                if key == "year" and p.get("type") != "dossier":
                    continue
                if key == "now" and p.get("type") not in ("wire",):
                    continue
                if key == "week" and p.get("type") != "feature":
                    continue
                buckets[key].append(p)
                break
    # types route regardless of bucket miss
    for p in posts:
        t = p.get("type")
        if t == "claim" and p not in buckets["month"]:
            buckets["month"].append(p)
        if t == "dossier" and p not in buckets["year"]:
            buckets["year"].append(p)
        if t == "feature" and p not in buckets["week"]:
            buckets["week"].append(p)
        if t == "wire" and p not in buckets["now"]:
            buckets["now"].append(p)

    for k in buckets:
        buckets[k].sort(key=lambda x: x.get("date", ""), reverse=True)

    ch_bodies = {
        "now": render_wire(buckets["now"][:6]),
        "week": render_features(buckets["week"]),
        "month": render_claims(buckets["month"]),
        "year": render_dossiers(buckets["year"]),
    }
    chapters = []
    for ch_id, (_key, _h, roman, title_html, when) in enumerate(BUCKETS):
        chapters.append(f"""
<section class="ch field" id="{_key}" data-line="{esc(site["liril_lines"][_key])}">
  <div class="ch-head rv">
    <span class="ghost" aria-hidden="true">{roman}</span>
    <div class="ch-no">Chapter<span class="roman">{roman}</span></div>
    <h2 class="ch-title">{title_html}</h2>
    <div class="ch-when">{esc(when)} · {esc(site.get("ch_" + _key + "_when", ""))}</div>
  </div>
  <div class="wrapx rv">{ch_bodies[_key]}</div>
</section>""")

    era = f"""
<section class="ch field" id="era" style="border-bottom:none" data-line="{esc(site["liril_lines"]["era"])}">
  <div class="ch-head rv" style="padding-bottom:2vh">
    <span class="ghost" aria-hidden="true">V</span>
    <div class="ch-no">Chapter<span class="roman">V</span></div>
    <h2 class="ch-title">And back to the<br><em>beginning.</em></h2>
    <div class="ch-when">1867 &larr; {now.year} · the deep record</div>
  </div>
  <div class="era rv">
    <h3>One agent. The <em>entire</em> public record.</h3>
    <p>{esc(site["era_blurb"])}</p>
    <div class="stats" id="film-stats">Agentic walkthrough · guided by LIRIL</div>
    <a class="go-film" href="liril-film.html">&#9654; Read the book aloud</a>
    <span class="alt">or take today only: <a href="daily-briefing.html">the daily briefing</a> ·
    <a href="osint-dashboard.html">the live dashboard</a> · <a href="evidence-index.html">the evidence shelf</a></span>
  </div>
</section>"""

    thesis = f"""
<section class="thesis field">
  <div class="wrapx rv">
    <span class="kick red">The Thesis · Documented From The Public Record</span>
    <h2 class="thesis-title" style="margin-top:2vh">The charge: <em>genocide,</em><br>by policy.</h2>
    <p style="margin-top:2.5vh;max-width:760px;color:var(--ivory-dim);font-size:16px;line-height:1.7">
    A quiet, fifth-generation war — waged by the Government of Canada under Justin Trudeau
    through policy, procurement, capture and silence. The record of intent is parliamentary,
    public, and filed here, act by act.</p>
    <div class="thesis-grid">
      <div class="panel glass dx">
        <h4>Diagnosis</h4>
        <p>{site["diagnosis_html"]}</p>
      </div>
      <div class="panel glass rx">
        <h4>Treatment</h4>
        <p>{site["treatment_html"]}</p>
      </div>
    </div>
    <div class="links">
      <a href="act-i.html">Open the case: Acts I&ndash;V</a>
      <a href="5gw-subversion.html">Read the full thesis</a>
      <a href="axes-index.html">The axes of capture</a>
      <a href="accountability.html">The findings</a>
    </div>
  </div>
</section>"""

    cover = f"""
<header class="cover" id="top">
  <span class="ghost5" aria-hidden="true">5</span>
  <div class="cover-bar">
    <span class="brand"><span class="wm">TENET<sup>5</sup></span></span>
    <span id="dateline">&mdash;</span>
    <span>Agentic Interface · Active</span>
  </div>
  <div class="cover-core">
    <div class="cover-kick">The Public Record of Canada · Guided by LIRIL</div>
    <h1>The record,<br>read <em>backwards.</em></h1>
    <div class="fr">&laquo; Le dossier public du Canada, lu &agrave; rebours. &raquo;</div>
    <p class="stand"><b>Begin at this hour.</b> Walk back through the week, the month, the year —
    to the beginning. This is a book written daily on everything the Canadian government does,
    federal to municipal. Machines read everything public. People verify.
    Every line you will see carries its source.</p>
  </div>
  <div class="cover-foot">
    <div class="liril-intro">
      <div class="who">LIRIL · Your Guide</div>
      <p>&ldquo;{esc(site["liril_cover"])}&rdquo;</p>
      <div class="guide-actions">
        <button type="button" class="guide-cta" id="liril-guide-btn-cover">Guide me</button>
        <a class="begin" href="#now" id="begin-record"><span>Begin the record</span><span class="arrow"></span></a>
      </div>
    </div>
  </div>
</header>"""

    return (head("The Record, Read Backwards",
                 "Begin at this hour. Walk backwards through the public record of Canada — guided by LIRIL, every line cited.")
            + cover + thesis + "".join(chapters) + era + render_catalog() + footer_html(site)
            + dock_and_script(site, with_rail=True))


# ══ EVIDENCE SHELF ═══════════════════════════════════════════════════════════

CAT_LABELS = {"government": "Government of Canada · primary records",
              "derived": "Derived analyses · mined from primary data",
              "osint": "Open-source intelligence · public reporting"}


def build_evidence(site: dict, evidence: list[dict]) -> str:
    groups: dict[str, list[dict]] = {}
    for e in evidence:
        groups.setdefault(e.get("category", "osint"), []).append(e)
    sections = []
    for cat in ("government", "derived", "osint"):
        rows = []
        for e in groups.get(cat, []):
            vb = ('<span class="vbadge v">&#9679; Verified</span>' if e.get("verified")
                  else '<span class="vbadge sv">&#9675; Single source</span>')
            data = (f'<a class="vbadge data" href="data/{esc(e["file"])}" download>data &darr;</a>'
                    if e.get("file") else "")
            src = esc(e.get("source", ""))
            if e.get("source_url"):
                src = f'<a href="{esc(e["source_url"])}" rel="noopener">{src}</a>'
            note = f'<p class="note">{esc(e["note"])}</p>' if e.get("note") else ""
            rows.append(f"""
    <article class="src-card glass" data-cat="{esc(cat)}"
      data-q="{esc((e.get('title','')+' '+e.get('contains','')+' '+e.get('source','')).lower())}">
      <h3>{esc(e.get("title",""))}</h3>
      <div class="badges">{vb}{data}</div>
      <p class="what">{esc(e.get("contains",""))}</p>
      <p class="attr">{src} · {esc(e.get("records",""))}</p>
      {note}
    </article>""")
        if rows:
            sections.append(f'<div class="shelf-cat">{esc(CAT_LABELS[cat])}</div>' + "".join(rows))

    body = press_nav("evidence") + f"""
<main class="press-main">
  <p class="kick">Every document we cite · nothing you can't check</p>
  <h1>The evidence <em>shelf.</em></h1>
  <p class="stand">Each entry below is a source this newsroom relies on — what it is,
  what it establishes, who published it, and the link to read it yourself.
  The underlying data files are downloadable beside each entry.</p>
  <div class="shelf-controls rv">
    <input id="ev-q" type="search" placeholder="Search the shelf&hellip;" aria-label="Search evidence">
    <select id="ev-cat" aria-label="Filter by category">
      <option value="">All categories</option>
      <option value="government">Government primary</option>
      <option value="derived">Derived analyses</option>
      <option value="osint">Open-source</option>
    </select>
  </div>
  <div id="shelf">{''.join(sections)}</div>
</main>
<script>
  (function(){{
    var q=document.getElementById('ev-q'),c=document.getElementById('ev-cat');
    function apply(){{
      var qq=(q.value||'').toLowerCase(),cc=c.value;
      document.querySelectorAll('.src-card').forEach(function(el){{
        var okQ=!qq||el.getAttribute('data-q').indexOf(qq)>=0;
        var okC=!cc||el.getAttribute('data-cat')===cc;
        el.style.display=(okQ&&okC)?'':'none';
      }});
      document.querySelectorAll('.shelf-cat').forEach(function(h){{
        var any=false,n=h.nextElementSibling;
        while(n&&!n.classList.contains('shelf-cat')){{
          if(n.style.display!=='none')any=true;n=n.nextElementSibling;}}
        h.style.display=any?'':'none';
      }});
    }}
    q.addEventListener('input',apply);c.addEventListener('change',apply);
  }})();
</script>"""
    return (head("The Evidence Shelf",
                 "Every source this newsroom cites — what it establishes, who published it, and the link to check it yourself.")
            + body + footer_html(site) + dock_and_script(site, with_rail=False))


# ══ DAILY BRIEFING ══════════════════════════════════════════════════════════

def build_briefing(site: dict) -> str:
    """Press-designed shell; content populates at runtime from the daily JSONs
    (the automation refreshes those without needing a press rebuild)."""
    body = press_nav("briefing") + """
<main class="press-main">
    <p class="kick">The Daily Briefing · every line cited · read by LIRIL</p>
    <h1>Today, in the <em>record.</em></h1>
    <p class="stand" id="brief-oneline">Loading today's briefing from the record&hellip;</p>
    <div class="guide-actions" style="margin:1.5em 0 2em">
      <button class="guide-cta" id="read-brief" type="button">LIRIL reads the briefing</button>
      <span class="threat" id="brief-threat" hidden></span>
      <span class="meta" id="brief-date"></span>
    </div>

  <div id="brief-err"></div>

  <div class="shelf-cat rv">Happening now</div>
  <div class="brief-grid rv" id="brief-now"></div>

  <div class="shelf-cat rv" style="margin-top:8vh">The numbers</div>
  <div class="tiles rv" id="brief-metrics"></div>

  <div class="shelf-cat rv" style="margin-top:8vh">The horizon</div>
  <div class="horizon rv">
    <div class="h-col stated"><h3>Stated plans · on the record</h3><div id="brief-stated"></div></div>
    <div class="h-col inferred"><h3>Inferred trajectories · labeled inference</h3><div id="brief-inferred"></div></div>
  </div>

  <div class="glass contract rv" style="margin-top:8vh" id="brief-contract" hidden></div>
</main>
<script>
  (function(){
    function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;
      if(text!=null)e.textContent=text;return e;}
    function err(msg){document.getElementById('brief-err').innerHTML=
      '<p class="brief-err">'+msg+' The rest of the record is on the <a href="index.html" style="color:inherit;text-decoration:underline">front page</a>.</p>';}
    var BRIEF=null;
    fetch('data/govt_daily_briefing.json',{cache:'no-cache'})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(d){
        BRIEF=d;
        document.getElementById('brief-oneline').textContent=d.one_line||d.subtitle||'';
        var th=document.getElementById('brief-threat');
        if(d.threat_level){th.hidden=false;th.textContent='Threat · '+d.threat_level;
          th.className='threat '+d.threat_level;}
        if(d.date)document.getElementById('brief-date').textContent='Briefing for '+d.date;
        var now=document.getElementById('brief-now');
        (d.happening_now||[]).forEach(function(h){
          var c=el('article','brief-item glass');
          c.appendChild(el('span','kick red',h.domain||''));
          c.appendChild(el('h3',null,h.headline||''));
          c.appendChild(el('p',null,h.body||''));
          if(h.status)c.appendChild(el('span','meta','status: '+h.status));
          now.appendChild(c);
        });
        var mt=document.getElementById('brief-metrics');
        (d.metrics||[]).forEach(function(m){
          var t=el('div','tile glass '+(m.tone||''));
          t.appendChild(el('div','v',m.value||''));
          t.appendChild(el('div','l',(m.label||'')+(m.unit?' · '+m.unit:'')));
          if(m.note)t.appendChild(el('div','n',m.note));
          mt.appendChild(t);
        });
      })
      .catch(function(){err('Today\\u2019s briefing data could not be loaded.');});
    fetch('data/govt_future_plans_map.json',{cache:'no-cache'})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(d){
        var st=document.getElementById('brief-stated');
        (d.stated_plans||[]).forEach(function(p){
          var c=el('div','glass');
          c.appendChild(el('span','conf',p.confidence||'STATED'));
          c.appendChild(el('h4',null,p.label||''));
          if(p.near)c.appendChild(el('p',null,p.near));
          st.appendChild(c);
        });
        var inf=document.getElementById('brief-inferred');
        (d.inferred_trajectories||[]).forEach(function(p){
          var c=el('div','glass');
          c.appendChild(el('span','conf',p.confidence||'INFERENCE'));
          c.appendChild(el('h4',null,p.label||''));
          if(p.claim)c.appendChild(el('p',null,p.claim));
          inf.appendChild(c);
        });
        var ct=document.getElementById('brief-contract');
        var wk=(d.daily_reader_contract&&d.daily_reader_contract.what_you_should_know)||[];
        if(wk.length||d.disclaimer){
          ct.hidden=false;
          var b=el('b',null,'The reader contract');ct.appendChild(b);
          wk.forEach(function(w){ct.appendChild(el('div',null,'\\u2014 '+w));});
          if(d.disclaimer)ct.appendChild(el('div','n',d.disclaimer));
        }
      }).catch(function(){});
    document.getElementById('read-brief').addEventListener('click',function(){
      if(!(window.LIRIL_VOICE&&typeof window.LIRIL_VOICE.speak==='function'))return;
      if(!BRIEF)return;
      var parts=['The daily briefing.'];
      if(BRIEF.date)parts.push('For '+BRIEF.date+'.');
      if(BRIEF.threat_level)parts.push('Threat level '+BRIEF.threat_level+'.');
      if(BRIEF.one_line)parts.push(BRIEF.one_line);
      (BRIEF.happening_now||[]).slice(0,7).forEach(function(h,i){
        parts.push('Item '+(i+1)+'. '+(h.headline||'')+'. '+(h.body||''));
      });
      parts.push('End of briefing. Every item is cited in the record below.');
      window.LIRIL_VOICE.speak(parts.join(' '));
      var dock=document.getElementById('dock');
      if(dock){dock.classList.add('up','speaking');
        var line=document.getElementById('liril-line');
        if(line)line.textContent='Reading the briefing \\u2014 every line cited.';}
    });
  })();
</script>"""
    return (head("The Daily Briefing",
                 "Today in the public record — happening now, the numbers, stated plans versus labeled inference. Read aloud by LIRIL, every line cited.")
            + body + footer_html(site) + dock_and_script(site, with_rail=False))


# ══ NETWORK BOARD ═══════════════════════════════════════════════════════════

def build_network(site: dict) -> str:
    """Documented-connections board rendered at runtime from
    data/investigation_board.json (curated nodes/threads with sources)."""
    body = press_nav("home") + """
<main class="press-main">
    <p class="kick">Documented connections only · every edge cites its file</p>
    <h1>The network, <em>documented.</em></h1>
    <p class="stand" id="net-stand">Loading the board&hellip;</p>
    <span class="meta" id="net-meta"></span>

  <div class="chips" id="net-chips"></div>
  <div class="board-wrap">
    <div class="board glass"><svg id="net-svg" viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg"
      role="img" aria-label="Documented connection board"></svg></div>
    <aside class="detail glass" id="net-detail">
      <span class="kick">Select an entity</span>
      <h3>Click any node</h3>
      <p>Each dot is a person, organization, event or piece of evidence from the public
      record. Each line is a documented interaction — a lobbying contact, a filing,
      a ruling — never an insinuation.</p>
    </aside>
  </div>
  <div class="guide">
    <div class="glass"><b>An edge is a document</b>Every line on this board is a recorded
    interaction: a registry entry, a court filing, a committee appearance. If there is
    no document, there is no line.</div>
    <div class="glass"><b>Centrality is not guilt</b>A well-connected node is a
    well-documented node. The board shows where the paper concentrates — conclusions
    belong to the case files.</div>
    <div class="glass"><b>Open the file</b>Every entity links into its case page and the
    evidence shelf. Read what we read, then decide.</div>
  </div>
</main>
<script>
  (function(){
    var NS='http://www.w3.org/2000/svg';
    var COLORS={israel:'#d3a625',ccp:'#c8102e',cfnis:'#9adbe8',media:'#a89f90',
      india:'#7fbf9a',disinfo:'#c8102e',evidence:'#ece7dc'};
    var R={org:1.35,person:1.05,event:.85,evidence:1.0};
    var svg=document.getElementById('net-svg');
    var state={nodes:[],threads:[],byId:{},filter:null,sel:null};
    function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;
      if(text!=null)e.textContent=text;return e;}
    function color(n){var c=(n.categories||[]).find(function(c){return COLORS[c];});
      return COLORS[c]||'#9adbe8';}
    function draw(){
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      state.threads.forEach(function(t){
        var a=state.byId[t.from],b=state.byId[t.to];if(!a||!b)return;
        var l=document.createElementNS(NS,'line');
        l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);
        l.setAttribute('x2',b.x);l.setAttribute('y2',b.y);
        l.setAttribute('stroke-width',(t.strength||1)*.12);
        l.setAttribute('class','edge');l.setAttribute('data-from',t.from);
        l.setAttribute('data-to',t.to);
        svg.appendChild(l);t._el=l;
      });
      state.nodes.forEach(function(n){
        var g=document.createElementNS(NS,'g');g.setAttribute('class','node');
        var c=document.createElementNS(NS,'circle');
        c.setAttribute('cx',n.x);c.setAttribute('cy',n.y);
        c.setAttribute('r',R[n.type]||1);c.setAttribute('fill',color(n));
        g.appendChild(c);
        var tx=document.createElementNS(NS,'text');
        tx.setAttribute('x',n.x);tx.setAttribute('y',n.y-((R[n.type]||1)+0.8));
        tx.setAttribute('text-anchor','middle');tx.textContent=n.label;
        g.appendChild(tx);
        g.addEventListener('click',function(){select(n,g);});
        svg.appendChild(g);n._el=g;
      });
      applyFilter();
    }
    function select(n,g){
      state.sel=n.id;
      state.nodes.forEach(function(m){if(m._el)m._el.classList.toggle('sel',m.id===n.id);});
      state.threads.forEach(function(t){
        if(t._el)t._el.classList.toggle('hot',t.from===n.id||t.to===n.id);});
      var d=document.getElementById('net-detail');
      while(d.firstChild)d.removeChild(d.firstChild);
      d.appendChild(el('span','kick',(n.type||'entity').toUpperCase()));
      d.appendChild(el('h3',null,n.label||''));
      if(n.subtitle)d.appendChild(el('div','sub',n.subtitle));
      if(n.detail)d.appendChild(el('p',null,n.detail));
      var cons=state.threads.filter(function(t){return t.from===n.id||t.to===n.id;});
      if(cons.length){
        var box=el('div','cons');
        cons.slice(0,10).forEach(function(t){
          var other=state.byId[t.from===n.id?t.to:t.from]||{};
          var row=el('div');
          var b=el('b',null,other.label||'?');row.appendChild(b);
          row.appendChild(document.createTextNode(' — '+(t.label||'documented link')));
          box.appendChild(row);
        });
        d.appendChild(box);
      }
      if(n.link){var a=el('a','open','Open the file \\u2192');a.href=n.link;d.appendChild(a);}
    }
    function applyFilter(){
      var f=state.filter;
      state.nodes.forEach(function(n){
        var on=!f||(n.categories||[]).indexOf(f)>=0;
        if(n._el)n._el.classList.toggle('dim',!on);
      });
      state.threads.forEach(function(t){
        var a=state.byId[t.from]||{},b=state.byId[t.to]||{};
        var on=!f||((a.categories||[]).indexOf(f)>=0&&(b.categories||[]).indexOf(f)>=0);
        if(t._el)t._el.classList.toggle('dim',!on);
      });
    }
    fetch('data/investigation_board.json',{cache:'no-cache'})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(d){
        state.nodes=d.nodes||[];state.threads=d.threads||[];
        state.nodes.forEach(function(n){state.byId[n.id]=n;});
        document.getElementById('net-stand').textContent=
          state.nodes.length+' entities and '+state.threads.length+
          ' documented connections, drawn only from the public record.';
        var m=d.meta||{};
        document.getElementById('net-meta').textContent=
          (m.sources?('Sources: '+m.sources+' · '):'')+(m.updated?('updated '+m.updated):'');
        var cats={};
        state.nodes.forEach(function(n){(n.categories||[]).forEach(function(c){
          if(COLORS[c])cats[c]=1;});});
        var chips=document.getElementById('net-chips');
        var all=el('button','chip on','All');all.type='button';
        all.addEventListener('click',function(){state.filter=null;setChips(all);applyFilter();});
        chips.appendChild(all);
        Object.keys(cats).forEach(function(c){
          var b=el('button','chip',c.toUpperCase());b.type='button';
          b.style.borderColor=COLORS[c];
          b.addEventListener('click',function(){state.filter=c;setChips(b);applyFilter();});
          chips.appendChild(b);
        });
        function setChips(active){
          chips.querySelectorAll('.chip').forEach(function(x){x.classList.toggle('on',x===active);});
        }
        draw();
      })
      .catch(function(){
        document.getElementById('net-stand').textContent=
          'The board data could not be loaded — the case files remain on the front page.';
      });
  })();
</script>"""
    return (head("The Network",
                 "Documented connections across the public record — every edge cites its file. Centrality is not guilt; open the sources.")
            + body + footer_html(site) + dock_and_script(site, with_rail=False))


# ══ ARTICLE PAGES ═══════════════════════════════════════════════════════════

def build_article(site: dict, p: dict) -> str:
    paras = "".join(f'<p class="bodyp">{esc(b)}</p>' for b in p.get("body", []))
    srcs = "".join(f'<div class="meta" style="margin-bottom:8px">{sources_line(p)}</div>')
    # story/ pages: press chrome with ../ paths
    nav = press_nav("home").replace('href="', 'href="../')
    body = nav + f"""
<main class="press-main article">
  <span class="kick red">{esc(p.get("kicker",""))}</span>
  <h1>{esc(p["title"])}</h1>
  <p class="dek">{esc(p.get("dek",""))}</p>
  {paras}
  <div class="srcs glass"><h4>Sources in this file</h4>{srcs}</div>
</main>"""
    page = (head(p["title"], p.get("dek", ""))
            + body + footer_html(site).replace('href="', 'href="../')
            + dock_and_script(site, with_rail=False))
    # version-agnostic: emitted tags carry ?v=N, so match on the path prefix
    return page.replace('src="js/liril-', 'src="../js/liril-') \
               .replace("fetch('data/film", "fetch('../data/film")


# ══ MAIN ════════════════════════════════════════════════════════════════════

def main() -> int:
    site = load_json(CONTENT / "site.json")
    posts = [load_json(p) for p in sorted(POSTS.glob("*.json"))]
    evidence = load_json(CONTENT / "evidence.json")
    now = datetime.now(timezone.utc).astimezone()

    (ROOT / "index.html").write_text(build_index(site, posts, now), encoding="utf-8")
    (ROOT / "evidence-index.html").write_text(build_evidence(site, evidence), encoding="utf-8")
    (ROOT / "daily-briefing.html").write_text(build_briefing(site), encoding="utf-8")
    (ROOT / "network-analysis.html").write_text(build_network(site), encoding="utf-8")
    STORY_DIR.mkdir(exist_ok=True)
    n_stories = 0
    for p in posts:
        if p.get("body") and p.get("slug"):
            (STORY_DIR / f'{p["slug"]}.html').write_text(build_article(site, p), encoding="utf-8")
            n_stories += 1

    print(f"[press] built index.html ({len(posts)} posts), evidence-index.html "
          f"({len(evidence)} sources), {n_stories} story pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
