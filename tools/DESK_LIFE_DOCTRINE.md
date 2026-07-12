# TENET5 Life Desk Doctrine — Sunroom · Sports · Markets · Press Ink

Elite newsroom for everyone. Ice-lake press taste. Powered by LIRIL AI.
Atmosphere is not proof; market and sports predictions are **labeled models**, not tips.

## Four desks

| Desk | Public page | Job |
|------|-------------|-----|
| **Sunroom** | `sunroom.html` | Gentlemen’s summer fashion desk (Maxim energy) — sundresses, resort, swim-as-clothing. Fully clothed, confident, glamorous. Face not the subject. Never creepy, never softcore. |
| **Sports Desk** | `sports-desk.html` | Future games, win probability, **point spreads** — Canadian + major leagues. STATED lines vs MODEL edge. |
| **Markets Desk** | `markets.html` | Full **TSX / TSXV / Canadian markets** analysis: indices, sectors, movers, thesis cards. |
| **Press Ink** | `cartoon-desk.html` | Political cartoons + short animated caricature beats. People must **actually laugh**. Absolute taste. |

## Hard taste (instant fail if violated)

### Sunroom — for gentlemen
- **Audience:** gentlemen’s magazine desk — aspirational, confident, heat done properly.
- **Adults only (18+).** Never minors, never school settings.
- **Fully clothed** — sundress, linen, resort, swim-as-clothing. Sex sells; clothes stay on.
- **Maxim energy, elite ice-lake taste** — body language open and assured; wardrobe and place are the story.
- **Face not the subject** — turn, hat silhouette, over-shoulder as *magazine craft*, never “identity obscured” / hands-over-face thriller.
- **No tattoos, logos, neon, cyber, softcore, creep, surveillance language.**
- Caption: *Sunroom · gentlemen’s summer · Powered by LIRIL AI*
- Copy must sound like Maxim for grown men who read the newsroom — never “are these real?”

### Sports / Markets
- Never claim guaranteed wins. Every pick: **STATED** (public line) vs **MODEL** (LIRIL) vs **INFERENCE**.
- Cite public data sources (league sites, exchange, SEDAR+ when filing-based).
- Not investment advice. Not gambling advice. Desk analysis only.

### Press Ink (cartoons) — high-quality editorial only
- **Ship editorial ink art** (`.jpg` / `.png` broadsheet quality). **SVG placeholders are banned** on the public desk.
- **HQ lock:** once `art_kind: editorial_hq` is in `cartoon_desk.json`, forge + SVG tools must not overwrite.
- **3-second rule:** gag reads at a glance. One visual + one knife caption under the art.
- **Specific Canadian public record** — Phoenix, ArriveCAN, ATIP, MAID capacity, VAC, interference, media subsidy, ethics, PSDPA, daycare, defence, two-tier justice.
- **Public offices / institutions only.** Punch the system. Faceless silhouettes / roles — no softcore, no hate art.
- **Caption is the card headline.** Record hook is one line under.
- Optional **animated short** (3–8s LTX) later from the same gag.

## Generation owners

| Desk | Tool |
|------|------|
| Sunroom | `tools/prism_sunroom_gen.py` → `data/sunroom_catalog.json` |
| Sports | `tools/prism_sports_desk.py` → `data/sports_desk.json` |
| Markets | `tools/prism_markets_desk.py` → `data/markets_desk.json` |
| Cartoons | `tools/prism_cartoon_forge.py` → `data/cartoon_desk.json` |

Still/video models: site Comfy/Flux + LTX when GPU free (KP41). Prompts only on public site — never engine internals.

## Home placement
Newsdesk row or pills: Sunroom · Sports · Markets · Press Ink.
Brand lock: **Powered by LIRIL AI** only AI reference.
