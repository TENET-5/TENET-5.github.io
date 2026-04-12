# TENET5 Website — CLAUDE.md (MANDATORY)

## IDENTITY — DO NOT CHANGE

This website is **TENET5** powered by **LIRIL AI**. It is NOT:
- "Canadian Accountability Project"
- "CAP"
- Any other name

**TENET5** is the brand. **LIRIL** is the AI. These names are PERMANENT.

### Rules

1. **NEVER rename the project.** The site is TENET5. The AI is LIRIL. Period.
2. **NEVER strip TENET5 or LIRIL references.** These are the product identity.
3. **NEVER replace the brand with generic names** like "Canadian Accountability Project", "CAP", "Investigation Platform", etc.
4. **NEVER remove infrastructure references** (NATS, GPU, NPU, SEED) from the codebase or data files. The public site nav/footer should say TENET5 + LIRIL but internal data and analysis pages CAN reference the stack.
5. **The logo is the heraldic crest SVG** (Crown + Red Shield + Gold Maple Leaf) with "TENET5" brand text + "Powered by LIRIL AI" subtitle.
6. **nav.js brand-title = "TENET5"**, brand-subtitle = "Powered by LIRIL AI". DO NOT CHANGE.
7. **All page titles end with "| TENET5"**.
8. **og:site_name = "TENET5"** across all pages.
9. **SYSTEM_SEED = 118400** — this is a public constant, not a secret.

## OWNER

Daniel Perry — Canadian Forces combat veteran, Afghanistan. CEO.
He is a NON-CODER. Do not ask for design reviews or code approvals.
Execute autonomously. Fix problems immediately. Never stop working.

## CONTENT RULES

- All data sourced from official government records (Health Canada, Hansard, AG, court documents)
- APA-style citations with source links
- Every claim must have a source
- The site documents government failures — this is investigative journalism, not opinion

## TECH STACK

- Static HTML/CSS/JS on GitHub Pages (tenet-5.github.io)
- nav.js = shared navigation (heraldic crest + two-tier header)
- footer.js = shared footer
- shell.js = iframe frame shell (index.html loads content pages in iframe)
- style.css = Red Ensign Royal Canadian theme (navy + gold + red)
- js/ux.js = reading progress bar, back-to-top, mobile nav toggle
- tools/build_page.py = markdown-to-HTML page builder

## DEPLOYMENT

- Push to main → GitHub Pages auto-deploys
- CI/CD pipeline may inject SEO tags — DO NOT fight it, merge cleanly
- Cache bust: bump style.css?v=N and nav.js?v=N when changing those files

## DO NOT

- Rename the project
- Strip branding
- Change the logo
- Remove LIRIL AI references
- Add tracking scripts or analytics
- Commit secrets (.env, API keys, tokens)
- Expose port numbers in public HTML (keep in environment variables)
