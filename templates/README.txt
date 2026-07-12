TENET5 LOCKED TEMPLATES (2026-07-12)
====================================
Daniel: do not freestyle public HTML. Use these skeletons + the lock file.

Contract:  ../data/site_templates_lock.json
Validate:  python tools/prism_templates.py --validate --json
Render:    python tools/prism_templates.py --render investigation.press-file --out draft.html
Apply:     python tools/apply_one_theme.py  (stamps nav/foot/theme)

TEMPLATES
---------
shell.html                    Chrome shell only
investigation.press-file.html Long-form dossier (Investigations) — exemplar: griffon-glle-procurement.html
news.package.html             Day package (News) — NOT a finished investigation
hub.lane.html                 Lane hubs (news.html, investigations.html)
case.act.html                 Five-act case stages
evidence.shelf.html           Primary sources shelf

RETIRED — do not copy
---------------------
accountability-template.html  (old LIRIL guide dock)

LANES
-----
News           → news.html + news.package
Investigations → investigations.html + investigation.press-file
The Case       → argument.html + case.act
Evidence       → evidence-index.html + evidence.shelf

RULES
-----
* One theme: press-theme.css + design-lock.css
* No page-local :root palette
* No Guide me / dock / autoplay voice
* Stamp data-template= and data-lane=
* You verify — Powered by LIRIL AI brand only
