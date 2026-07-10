# ONE THEME — WordPress model (PRISM permanent duty)

## Single source of truth

| Asset | Role |
|-------|------|
| **`css/press-theme.css`** | Entire visual system (palette, type, cover, glass, chrome) |
| **`tools/press.py`** | Builds homepage + evidence + story from `content/` |
| **`tools/apply_one_theme.py`** | Forces every HTML page onto the one CSS file |
| **`tools/prism_site_duty.py`** | Continuous guardian (rebuild + enforce + proof) |

## Ground truth

Screenshot `2026-07-10 042513`: *The record, read **backwards.***  
Fraunces display · ice `#9adbe8` · red rails · ivory paper · ghost 5 · LIRIL guide.

## Page contract

Every public HTML page loads **only**:

```html
<link href="…Fraunces…IBM+Plex+Mono…" rel="stylesheet">
<link rel="stylesheet" href="css/press-theme.css?v=64">
```

No `product.css`, `quantanium.css`, `tokens.css`, `tenet5.css`, or Cap stacks.

## Continuous PRISM duty

```bash
# one lap
python tools/prism_site_duty.py

# local continuous (supervisor)
python tools/prism_site_duty.py --loop 60

# GitHub Actions: .github/workflows/prism-site-duty.yml every 15 minutes
```

Proof: `C:/PRISM/log/prism_site_duty_last.json` · `data/prism_site_duty_last.json`

## Forward development rule

Any new page or agent edit must:

1. Not invent a second theme file
2. Link only `press-theme.css`
3. Use press chrome (`.press-bar` / `.press-main` / `.press-foot`) on interiors
4. Run `prism_site_duty.py` before declaring ship
