# QUANTANIUM 1.5 — Design Contract
**Repo:** `(repo root)` (live Pages-from-main) · **Hosting:** static GitHub Pages, no build step · **Supersedes:** QUANTANIUM 1.x motion/type/data/tour rules

## Hard constraints (unchanged, restated for enforcement)
- **Palette:** ice-lake dark — ground `#05080d`, chrome `#eef6fa`. Colour appears **only** as data semantics (chart series, up/down). No decorative hue, no glow.
- **Fonts:** two-font lock — Atkinson Hyperlegible (display/body) + IBM Plex Mono (metadata/numerals). Upgrade path: Atkinson Hyperlegible Next **variable** (§2.1) stays inside the lock.
- **Licenses:** vendor MIT/ISC/BSD only. anime.js v4 = MIT ✅. Shepherd.js + intro.js = AGPL ❌ (never vendor).
- **Progressive enhancement:** every page reads fully with JS off; real numbers/text authored in HTML; JS only animates *from* zero, never gates content.
- **Reduced motion:** every animation gated on `prefers-reduced-motion` — root CSS kill-switch + JS scope guard. 0 ms under reduce.
- **Contrast:** `#eef6fa` on `#05080d` ≈ 17:1. All muted/data hues ≥4.5:1 as text, ≥3:1 as graphics on `#05080d`.

---

## 1. MOTION SYSTEM

### 1.0 Vendoring plan (anime.js v4.5.0)
- Download `https://cdn.jsdelivr.net/npm/animejs@4.5.0/dist/bundles/anime.esm.min.js` → commit as **`/assets/vendor/anime-4.5.0.esm.min.js`** (MIT — keep license header). 115.9 KB on disk, ~24.5 KB gzipped over the wire (Pages gzips automatically).
- Loaded only via `<script type="module">` (deferred by default, non-render-blocking). **No subpath tree-shaking** (needs a bundler) — one cached file site-wide is the right static trade.
- **`js/motion.js` is the ONLY file that imports the vendor bundle.** Everything else imports from `js/motion.js`.

```
// js/motion.js — the only file that touches the vendor bundle
import { animate, createTimeline, stagger, onScroll, spring, svg, splitText, utils, createScope }
  from '/assets/vendor/anime-4.5.0.esm.min.js';

export const VOICE = {
  enter:   { duration: 800,  ease: 'outExpo' },   // entrances: fast attack, long settle
  data:    { duration: 1600, ease: 'outCubic' },  // count-ups: sober, no overshoot
  scrub:   'inOutQuad',                            // eased scroll scrub
  press:   spring({ stiffness: 110, damping: 14 })// pointer interactions ONLY
};

export let reduceMotion = false;
export const scope = createScope({
  mediaQueries: { rm: '(prefers-reduced-motion)' }
}).add(self => { reduceMotion = self.matches.rm; });

export { animate, createTimeline, stagger, onScroll, spring, svg, splitText, utils };
```

### 1.1 Motion tokens
One easing voice site-wide. CSS ladder for CSS transitions; `VOICE` for anime.js; `PACE` (§4.5) for the tour. Raw `cubic-bezier`/duration literals are **forbidden** outside `css/tokens.css`.

```
:root{
  --ease-out-expo:cubic-bezier(.16,1,.3,1);   /* reveals, panels */
  --ease-out-quart:cubic-bezier(.25,1,.5,1);  /* hovers, underlines */
  --ease-inout:cubic-bezier(.65,0,.35,1);     /* position swaps */
  --dur-1:120ms; --dur-2:240ms; --dur-3:480ms; --dur-4:800ms;
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
```

**Equivalence table (normative):** CSS `--ease-out-expo` ≡ anime `'outExpo'`; `--dur-4` ≡ `VOICE.enter.duration`. Count-ups everywhere = **1600 ms outCubic** (`VOICE.data`) — where a snippet below shows 900/1200 ms, set the constant to 1600/outCubic at implementation.

**Grain constants:** stagger — chars 15–25 ms, words 40–80 ms, cards/rows 60–100 ms, SVG strokes 100–150 ms. Entrances 600–900 ms outExpo. **Never elastic/bounce on statistical or mortality content** — springs (stiffness 90–120, damping 12–16, bounce 0) only on pointer interactions. Pinning = CSS `position: sticky` (anime.js has no pin primitive by design).

### 1.2 The 8 canonical animations

**A1 — Master load timeline (chrome-last choreography).** Homepage + dossier landings only; interior pages instant. Budget <1.4 s; readable from ~400 ms.

```
import { createTimeline, stagger, reduceMotion } from '/assets/js/motion.js';

if (!reduceMotion) createTimeline({ defaults: { ease: 'outExpo' } })
  .add('.masthead-rule', { scaleX: [0, 1], duration: 600 })
  .label('headline', '<-=400')                        // overlap: rule still finishing
  .add('.hero .word',  { y: ['1.1em', '0em'], opacity: [0, 1],
                         duration: 800, delay: stagger(45) }, 'headline')
  .add('nav, .site-meta', { opacity: [0, 1], y: ['-6px', '0px'],
                            duration: 500 }, '<-=300'); // chrome lands last
```

**A2 — Hero headline masked stagger-in (splitText).** Masthead + dossier H1 only. `accessible:true` keeps the screen-reader clone; `addEffect()` survives font-load/resize re-splits.

```
import { splitText, stagger, reduceMotion } from '/assets/js/motion.js';

const split = splitText('.hero h1', {
  words: { wrap: 'clip' },   // overflow-clipped word wrappers = mask
  chars: true,
  accessible: true            // screen readers get the intact clone
});

if (!reduceMotion) split.addEffect(({ chars }) => animate(chars, {
  y: ['1.1em', '0em'],
  opacity: { from: 0, duration: 300 },
  duration: 800,
  ease: 'outExpo',
  delay: stagger(20)          // 20ms grain: crisp, not showy
}));
```

**A3 — Masked line-reveal on scroll (CSS + IO — every non-hero heading/lede).** No vendor dependency; char-level reserved for A2.

```
.reveal{overflow:clip}
.reveal .line{display:block;transform:translateY(110%);
  transition:transform var(--dur-4) var(--ease-out-expo)}
.reveal.is-inview .line{transform:none}
.reveal .line:nth-child(2){transition-delay:80ms}
.reveal .line:nth-child(3){transition-delay:160ms}
<script>
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('is-inview');io.unobserve(e.target)}
}),{threshold:.3});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
</script>
```

**A4 — Count-up statistics (canonical, anime.js).** Real number authored in HTML; JS zeroes only at animation start. Tabular-nums mono prevents jitter. Vanilla fallback + full stat-lede component in §3.4.

```
import { animate, onScroll, utils, reduceMotion } from '/assets/js/motion.js';

utils.$('.stat').forEach($el => {
  const target = +$el.dataset.count;
  if (reduceMotion) return;                    // real number already in HTML
  animate($el, {
    innerHTML: [0, target],
    modifier: v => Math.round(v).toLocaleString('en-CA'),
    duration: 1600,
    ease: 'outCubic',
    autoplay: onScroll({ target: $el, enter: 'bottom-=10% top', sync: 'play', repeat: false })
  });
});
/* CSS: .stat { font-family: 'IBM Plex Mono'; font-variant-numeric: tabular-nums; } */
```

**A5 — SVG evidence-chain line draw.** Money-flow, timelines, org charts trace themselves. Structure strokes = ice-white `#eef6fa` (chrome, not data); data series use `--ch-*` tokens (§3.1). `vector-effect="non-scaling-stroke"`. Reduced-motion/no-JS shows the finished diagram.

```
import { animate, svg, stagger, onScroll, reduceMotion } from '/assets/js/motion.js';

if (!reduceMotion) animate(svg.createDrawable('#flow .trace'), {
  draw: ['0 0', '0 1'],       // from zero-length to fully drawn
  duration: 1200,
  ease: 'inOutQuad',
  delay: stagger(120),        // segments trace in sequence
  autoplay: onScroll({ target: '#flow', enter: 'bottom-=15% top', sync: 'play', repeat: false })
});
// then reveal node labels:
// animate('#flow .node', { opacity: [0,1], delay: stagger(120, { start: 600 }) ... })
```

**A6 — Scroll-scrubbed pinned chapter transitions.** Sticky pin inside a 200–300 vh section; `sync:'inOutQuad'` eased scrub = the documentary playhead.

```
import { createTimeline, onScroll, reduceMotion } from '/assets/js/motion.js';
/* HTML: <section class="chapter" style="height:250vh">
           <div class="pin" style="position:sticky;top:0;height:100vh">…</div>
         </section> */
if (!reduceMotion) createTimeline({
  defaults: { ease: 'linear' },   // easing comes from the scrub itself
  autoplay: onScroll({
    target: '.chapter',
    enter: 'bottom top',          // container-bottom meets target-top
    leave: 'top bottom',
    sync: 'inOutQuad'             // eased scrub — the documentary feel
  })
})
.add('.pin .ch-num',    { opacity: [0, 1], y: ['2rem', '0rem'] })
.add('.pin .ch-figure', { scale: [0.92, 1], opacity: [0, 1] }, '<-=200')
.add('.pin .ch-kicker', { x: ['-1.5rem', '0rem'], opacity: [0, 1] }, '<+=100');
```

**A7 — Evidence-grid entrance choreography.** Translate+opacity only (compositor-friendly).

```
import { animate, stagger, onScroll, reduceMotion } from '/assets/js/motion.js';

export function initGrid(sel, cols = 3) {
  if (reduceMotion) return;
  animate(`${sel} > *`, {
    y: ['12px', '0px'],
    opacity: [0, 1],
    duration: 700,
    ease: 'outExpo',
    delay: stagger(70, { grid: [cols, 99], from: 'first' }), // diagonal sweep
    autoplay: onScroll({ target: sel, enter: 'bottom-=10% top', sync: 'play', repeat: false })
  });
}
```

**A8 — Spring micro-interactions (pointer ONLY).** The tonal line: springs never touch statistics, charts, or text reveals.

```
import { animate, reduceMotion, VOICE } from '/assets/js/motion.js';

document.addEventListener('pointerenter', e => {
  const $t = e.target.closest?.('.card, .chip, nav a');
  if (!$t || reduceMotion) return;
  animate($t, { scale: 1.02, y: '-2px', ease: VOICE.press }); // duration auto-computed
}, true);
document.addEventListener('pointerleave', e => {
  const $t = e.target.closest?.('.card, .chip, nav a');
  if (!$t || reduceMotion) return;
  animate($t, { scale: 1, y: '0px', ease: VOICE.press });
}, true);
```

### 1.3 Chrome motion (supporting, not canonical)

**Reading-progress rail — primary: CSS scroll-driven (compositor-thread, zero JS), `@supports`-guarded.** Also drives `view()` figure reveals on `.plate` only (never on `.reveal` headings — no double-animating).

```
@supports (animation-timeline: scroll()){
  .progress{position:fixed;top:0;left:0;width:100%;height:2px;z-index:70;
    background:var(--data-accent,#8fb8d8);transform-origin:0 50%;
    animation:grow linear both;animation-timeline:scroll(root)}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .plate{animation:rise linear both;animation-timeline:view();
    animation-range:entry 0% entry 40%}
  @keyframes rise{from{opacity:0;transform:translateY(2rem)}to{opacity:1;transform:none}}
}
```

**Fallback rail (Safari/no-support): anime.js hard scrub.**

```
import { animate, onScroll } from '/assets/js/motion.js';
/* HTML: <div class="rail"><div class="rail-fill"></div></div>
   CSS:  .rail-fill { transform-origin: left; height: 2px; background: #eef6fa; } */
animate('.rail-fill', {
  scaleX: [0, 1],
  ease: 'linear',
  autoplay: onScroll({
    target: 'article.dossier',
    enter: 'top top',
    leave: 'bottom bottom',
    sync: true                 // hard scrub: rail == scroll position, no lag
  })
});
```

**Declassification scramble reveal (P2 accent — max once per page, kickers/pull-quote leads in Plex Mono only).**

```
import { onScroll, reduceMotion } from '/assets/js/motion.js';
import { scrambleText } from '/assets/vendor/anime-4.5.0.esm.min.js';

if (!reduceMotion) scrambleText('.kicker', {
  chars: '█▓▒░/\\|',           // redaction-bar glyph set
  revealRate: 0.6,
  settleDuration: 900,
  autoplay: onScroll({ target: '.kicker', enter: 'bottom-=20% top', sync: 'play', repeat: false })
});
```

---

## 2. TYPE & LAYOUT SYSTEM

### 2.1 Fonts — variable upgrade inside the two-font lock
Vendor **Atkinson Hyperlegible Next VF** (Braille Institute, free, wght 200–800) as one woff2 — replaces static cuts, fewer bytes, unlocks weight contrast (wght 250 ghost numerals behind wght 700 headlines).

```
@font-face{font-family:'Atkinson Hyperlegible Next';
  src:url('/fonts/AtkinsonHyperlegibleNext-VF.woff2') format('woff2-variations');
  font-weight:200 800;font-display:swap}
html{font-synthesis:none}
.nav-link{font-variation-settings:'wght' 440;
  transition:font-variation-settings var(--dur-2) var(--ease-out-quart)}
.nav-link:hover,.nav-link:focus-visible{font-variation-settings:'wght' 640}
.ghost-numeral{font-variation-settings:'wght' 250;color:transparent;
  -webkit-text-stroke:1px rgba(238,246,250,.18)}
```

Animate `font-variation-settings` only where ~2–3% width shift is safe (standalone display, never inline prose).

### 2.2 Fluid display scale (Utopia two-slope)
Ratio 1.2 @320px → 1.333 @1440px + two display steps. All heading sizes come **only** from these tokens — no raw px anywhere.

```
:root{
  --step--1: clamp(.8333rem,.81rem + .12vw,.9rem);
  --step-0: clamp(1rem,.96rem + .18vw,1.125rem);
  --step-1: clamp(1.2rem,1.11rem + .43vw,1.5rem);
  --step-2: clamp(1.44rem,1.28rem + .8vw,2rem);
  --step-3: clamp(1.7281rem,1.46rem + 1.33vw,2.6663rem);
  --step-4: clamp(2.0738rem,1.65rem + 2.11vw,3.5525rem);
  --step-5: clamp(2.4881rem,1.85rem + 3.2vw,4.7331rem);
  --display: clamp(3rem,1.86rem + 5.71vw,7rem);      /* 48->112px */
  --display-stat: clamp(4rem,2rem + 10vw,11rem);     /* 64->176px */
}
.display{font-family:'Atkinson Hyperlegible Next',var(--font-sans);font-size:var(--display);line-height:.98;letter-spacing:-.02em;font-weight:700;text-wrap:balance}
```

Display: line-height 0.95–1.05, tracking −0.02 to −0.03em. Body: 1.6, 60–72ch. `--display-stat` is the **single** canonical stat-numeral token (stat-lede in §3.4 uses it).

### 2.3 Mono eyebrow / index metadata layer
Every display heading gets an auto-numbered mono eyebrow ("01 / MAID — RECORDS 2016–2025") + hairline rule. The mixed-register pair is the signature.

```
body{counter-reset:sec}
section.chapter{counter-increment:sec}
.eyebrow{display:flex;align-items:center;gap:.75rem;
  font:500 .75rem/1 'IBM Plex Mono',monospace;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ice-muted,#9fb6c4)}
.eyebrow::before{content:counter(sec,decimal-leading-zero) ' /';color:var(--ice-dim,#5d7382)}
.eyebrow::after{content:'';flex:1;height:1px;background:rgba(238,246,250,.14)}
```

### 2.4 Named-lines editorial grid + whitespace rules
Every article child defaults to a 66ch column; `.full-bleed` opts out to viewport; `.breakout` mid-width for tables/charts (wide content scrolls in `overflow-x:auto`). **Whitespace is a number:** section padding `clamp(5rem, 4rem + 8vw, 11rem)`; heroes ≥60% empty; gutter `clamp(1rem,2.5vw,2rem)`; outer margin `clamp(1.25rem,5vw,6rem)`; max ~90rem; prose never starts at column 1.

```
.article{display:grid;row-gap:var(--flow,1.5rem);
  grid-template-columns:
    [full-start] minmax(clamp(1.25rem,5vw,6rem),1fr)
    [wide-start] minmax(0,1fr)
    [content-start] min(66ch,100% - 2*clamp(1.25rem,5vw,6rem)) [content-end]
    minmax(0,2fr) [wide-end]
    minmax(clamp(1.25rem,5vw,6rem),1fr) [full-end]}
.article>*{grid-column:content}
.article>.breakout{grid-column:wide}
.article>.full-bleed{grid-column:full}
.chapter{padding-block:clamp(5rem,4rem + 8vw,11rem)}
```

### 2.5 Editorial patterns adopted

**Film grain overlay — ONE static fixed layer** (feTurbulence baseFrequency .8, octaves 3 max, never animated full-viewport). Opacity .03–.06.

```
body::after{content:'';position:fixed;inset:0;z-index:60;pointer-events:none;
  opacity:.04;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
```

**Ice duotone imagery pipeline — no image may import foreign colour.** One `.fig-duotone` wrapper on every `<img>`; plate + wash are tokens, so re-grading is site-wide. Captions outside the blend layer for AA.

```
.fig-duotone{position:relative;background:#0d1826;overflow:clip}
.fig-duotone img{display:block;width:100%;
  filter:grayscale(1) contrast(1.08) brightness(.92);
  mix-blend-mode:luminosity}
.fig-duotone::after{content:'';position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,rgba(93,138,168,.16),rgba(5,8,13,.5));
  mix-blend-mode:multiply}
```

**Archive plate annotation system** — every chart, scan, and table framed as a declassified technical plate; doubles as citation UI.

```
body{counter-reset:fig}
.plate{counter-increment:fig;position:relative;
  border:1px solid rgba(238,246,250,.14);padding:1rem}
.plate::before,.plate::after{content:'';position:absolute;width:9px;height:9px;
  border:0 solid rgba(238,246,250,.45)}
.plate::before{top:-5px;left:-5px;border-width:1px 0 0 1px}
.plate::after{bottom:-5px;right:-5px;border-width:0 1px 1px 0}
.plate figcaption{margin-top:.75rem;font:500 .6875rem/1.5 'IBM Plex Mono';
  letter-spacing:.12em;text-transform:uppercase;color:var(--ice-muted,#9fb6c4)}
.plate figcaption::before{content:'FIG. ' counter(fig,decimal-leading-zero) ' \2014  '}
```

**Redaction-reveal motif** — 1–2 per page max. Text stays real DOM (selectable, SR-intact). Reveals on hover/focus AND scroll-into-view (`.is-revealed` via the A3 observer) so touch/keyboard users are never locked out.

```
.redact{background:var(--ice,#eef6fa);color:transparent;
  box-decoration-break:clone;-webkit-box-decoration-break:clone;
  padding-inline:.15em;
  transition:background-color var(--dur-3) var(--ease-out-quart),color var(--dur-3) var(--ease-out-quart)}
.redact:hover,.redact:focus-visible,.redact.is-revealed{
  background:transparent;color:inherit}
```

**Directional underline-draw links** — draws L→R on hover, retracts the same way; doubles as focus style.

```
.link{text-decoration:none;color:inherit;
  background-image:linear-gradient(currentColor,currentColor);
  background-size:0% 1px;background-position:100% 100%;background-repeat:no-repeat;
  transition:background-size .35s var(--ease-out-quart)}
.link:hover,.link:focus-visible{background-size:100% 1px;background-position:0% 100%}
.link:focus-visible{outline:1px solid var(--ice,#eef6fa);outline-offset:3px}
```

**Magnetic buttons (P2)** — the 2–3 real CTAs only, pointer-fine + motion-allowed only, transform on a child span.

```
if(matchMedia('(hover:hover) and (pointer:fine)').matches
 && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('[data-magnetic]').forEach(el=>{
    let x=0,y=0,tx=0,ty=0,raf;const K=.25,MAX=10,inner=el.firstElementChild;
    const step=()=>{x+=(tx-x)*.15;y+=(ty-y)*.15;
      inner.style.transform=`translate(${x}px,${y}px)`;
      if(Math.abs(tx-x)+Math.abs(ty-y)>.1)raf=requestAnimationFrame(step)};
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();
      tx=Math.max(-MAX,Math.min(MAX,(e.clientX-r.x-r.width/2)*K));
      ty=Math.max(-MAX,Math.min(MAX,(e.clientY-r.y-r.height/2)*K));
      cancelAnimationFrame(raf);raf=requestAnimationFrame(step)});
    el.addEventListener('pointerleave',()=>{tx=0;ty=0;
      cancelAnimationFrame(raf);raf=requestAnimationFrame(step)});
  });
}
```

---

## 3. DATA DISPLAY SYSTEM

### 3.1 Chart tokens (the one file every chart obeys)
Dark-ground rules: gridlines 8% ice-white, ticks 55%, domain 22%; series HSL S 45–60% / L 62–75%; de-emphasis by alpha, never hue-switch; annotations = brightest ink. **Annotation-first house rule: no legends** — direct labels at line ends, story sentence inside the plot with a leader line; titles are findings ("Deaths tripled after 2021"), not descriptions. **Chart-type map:** time series → annotated line/area or dot-strip; flows → sankey (d3-sankey) or waterfall; timelines → dot-strip lanes; networks → adjacency matrix/arc diagram, **never force-directed hairballs**.

```
:root{
  --ch-ground:#05080d;
  --ch-grid:rgba(238,246,250,.08);
  --ch-domain:rgba(238,246,250,.22);
  --ch-tick:rgba(238,246,250,.55);
  --ch-label:#eef6fa;                     /* annotations: brightest ink   */
  --ch-context:rgba(238,246,250,.14);     /* de-emphasized series          */
  --ch-s1:hsl(205 52% 68%);   /* glacial blue  — primary series */
  --ch-s2:hsl(28 60% 66%);    /* amber         — comparison     */
  --ch-s3:hsl(350 48% 66%);   /* muted red     — deaths/deficit */
  --ch-s4:hsl(150 38% 62%);   /* sage          — surplus/ok     */
  --ch-up:var(--ch-s4); --ch-down:var(--ch-s3);
}
.chart text{font:.72rem 'IBM Plex Mono',monospace;fill:var(--ch-tick)}
.chart .annot text{font:600 .8rem 'Atkinson Hyperlegible',sans-serif;fill:var(--ch-label)}
.chart .annot line{stroke:var(--ch-tick);stroke-dasharray:2 3}
.chart .grid line{stroke:var(--ch-grid);shape-rendering:crispEdges}
.chart .domain{stroke:var(--ch-domain)}
```

### 3.2 Scrollytelling engine (CANONICAL: vanilla IO scrolly-scene)
Sticky graphic + IO at `-45%` rootMargin (≡ Scrollama offset 0.5). Zero deps, zero scroll listeners. **No ancestor of `.scrolly` may have `overflow:hidden/auto`** or sticky dies silently. Mobile <700px: keep scrolly only if the transition carries meaning, else stack steps as standalone figures. No-JS degrades to a linear document.

```
.scrolly{display:grid;grid-template-columns:minmax(28ch,38ch) 1fr;gap:3rem}
.scrolly__graphic{position:sticky;top:var(--header-h,0px);height:calc(100vh - var(--header-h,0px));grid-column:2;grid-row:1;display:flex;align-items:center}
.scrolly__steps{grid-column:1;grid-row:1}
.scrolly__steps section{min-height:85vh;opacity:.35;transition:opacity .4s ease-out}
.scrolly__steps section.is-active{opacity:1}
.scrolly__steps section:last-child{margin-bottom:40vh}
@media (prefers-reduced-motion:reduce){.scrolly__steps section{transition:none}}

<script>
const scenes={ 0:g=>g.dataset.state='baseline', 1:g=>g.dataset.state='spike', 2:g=>g.dataset.state='annotated' };
document.querySelectorAll('.scrolly').forEach(sc=>{
  const graphic=sc.querySelector('.scrolly__graphic');
  const io=new IntersectionObserver(entries=>{
    for(const e of entries){ if(!e.isIntersecting) continue;
      sc.querySelectorAll('.is-active').forEach(x=>x.classList.remove('is-active'));
      e.target.classList.add('is-active');
      scenes[+e.target.dataset.step]?.(graphic); }
  },{rootMargin:'-45% 0px -45% 0px',threshold:0});
  sc.querySelectorAll('[data-step]').forEach(s=>io.observe(s));
});
</script>
```

**Variant: 5fr/7fr split-screen chapter layout** (same engine, alternative proportions — use for chapter heads where the graphic dominates):

```
.scrolly{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);
  gap:clamp(1rem,2.5vw,2rem);align-items:start}
.scrolly-graphic{position:sticky;top:clamp(4rem,12vh,8rem);height:min(80vh,46rem)}
.step{min-height:90vh;display:flex;align-items:center;
  opacity:.35;transition:opacity var(--dur-3) var(--ease-out-quart)}
.step.is-active{opacity:1}
<script>
new IntersectionObserver(es=>es.forEach(e=>{
  e.target.classList.toggle('is-active',e.isIntersecting);
  if(e.isIntersecting)renderState(e.target.dataset.step);
}),{rootMargin:'-45% 0px -45% 0px'})
</script>
```

### 3.3 Pinned-chart progressive annotation
Chart never re-renders — pre-built annotation `<g>` layers revealed cumulatively via `data-state`. Solid strokes = established facts, dashed = projections/allegations (fabrication is visually impossible to hide).

```
<figure class="chart scrolly__graphic" data-state="0">
  <svg viewBox="0 0 720 420">
    <g class="grid">…</g>
    <path class="series" d="…" stroke="var(--ch-s1)" fill="none" stroke-width="2"/>
    <g class="annot" data-reveal="1">
      <rect x="430" y="0" width="120" height="420" fill="var(--ch-s3)" opacity=".1"/>
      <line x1="470" y1="60" x2="430" y2="110"/>
      <text x="474" y="58">Track 2 expansion takes effect</text>
    </g>
    <g class="annot" data-reveal="2">…</g>
  </svg>
</figure>

.annot{opacity:0;transform:translateY(4px);transition:opacity .35s ease-out,transform .35s ease-out}
[data-state="1"] .annot[data-reveal="1"],
[data-state="2"] .annot[data-reveal="1"],
[data-state="2"] .annot[data-reveal="2"],
[data-state="3"] .annot{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.annot{transition:none}}
```

### 3.4 Stat lede (one number, huge) — full component
One per chapter max. Numeral uses `--display-stat` token (§2.2). Real value authored in HTML; when motion.js is loaded, A4 (§1.2) drives it at 1600 ms outCubic; this vanilla version is the no-vendor fallback (normalize D→1600, ease→outCubic).

```
<figure class="stat">
  <figcaption class="stat__claim">Medically assisted deaths reported in 2022</figcaption>
  <p class="stat__num" data-countup>13,241</p>
  <p class="stat__src">Health Canada, Fourth Annual Report on MAID, Table 1.1</p>
</figure>

.stat__num{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums;font-size:clamp(4rem,12vw,9rem);line-height:1;color:var(--ice,#eef6fa);letter-spacing:-.02em}
.stat__claim{font-size:1rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(238,246,250,.62)}
.stat__src{font-family:'IBM Plex Mono',monospace;font-size:.72rem;color:rgba(238,246,250,.45)}

<script>
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>t===1?1:1-Math.pow(2,-10*t);
new IntersectionObserver((es,io)=>es.forEach(e=>{ if(!e.isIntersecting) return; io.unobserve(e.target);
  const el=e.target, final=parseFloat(el.textContent.replace(/,/g,'')), fmt=new Intl.NumberFormat('en-CA');
  if(rm||!isFinite(final)) return;                    // HTML already shows the real value
  const t0=performance.now(), D=900;
  (function tick(t){ const p=Math.min((t-t0)/D,1);
    el.textContent=fmt.format(Math.round(final*ease(p)));
    if(p<1) requestAnimationFrame(tick); })(t0);
}),{threshold:.6}).observe(document.querySelector('[data-countup]'));
</script>
```

Compact alternative (stat bands, multiple `.stat` elements):

```
.stat{font:700 var(--display-stat)/1 'IBM Plex Mono';letter-spacing:-.04em;
  font-variant-numeric:tabular-nums;color:var(--ice,#eef6fa)}
<script>
const fmt=new Intl.NumberFormat('en-CA');
const ease=t=>1-Math.pow(2,-10*t);
new IntersectionObserver((es,o)=>es.forEach(e=>{if(!e.isIntersecting)return;o.unobserve(e.target);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const el=e.target,end=+el.dataset.value,t0=performance.now();
  (function f(t){const p=Math.min((t-t0)/1200,1);
    el.textContent=fmt.format(Math.round(end*ease(p)));
    if(p<1)requestAnimationFrame(f)})(t0);
}),{threshold:.6}).observe(document.querySelector('.stat'));
</script>
```

### 3.5 Evidence table
Sticky header, right-aligned tabular-nums, zero vertical borders, inline bars via `--v` custom property (no extra DOM, prints correctly), provenance chip on hover AND `:focus-within`.

```
.tbl-wrap{max-height:70vh;overflow:auto;border:1px solid rgba(238,246,250,.08);border-radius:8px}
table.evidence{border-collapse:collapse;width:100%;font-size:.875rem}
.evidence th{position:sticky;top:0;z-index:2;background:#05080d;text-align:left;font:600 .72rem/1 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:rgba(238,246,250,.6);padding:.65rem .75rem;box-shadow:0 1px 0 rgba(238,246,250,.14)}
.evidence td{padding:.55rem .75rem;border-top:1px solid rgba(238,246,250,.06);color:#eef6fa}
.evidence td.num{text-align:right;font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}
/* inline bar behind the number: <td class="num bar" style="--v:.62">13,241</td> */
.evidence td.bar{background:linear-gradient(to right,rgba(122,168,204,.22) calc(var(--v)*100%),transparent 0)}
.evidence .src-chip{opacity:0;transition:opacity .15s;font:.68rem 'IBM Plex Mono',monospace;color:rgba(238,246,250,.55);border:1px solid rgba(238,246,250,.18);border-radius:999px;padding:.1rem .5rem}
.evidence tr:hover .src-chip,.evidence tr:focus-within .src-chip{opacity:1}
@media (prefers-reduced-motion:reduce){.evidence .src-chip{transition:none}}
```

### 3.6 Citations: Popover API footnotes + provenance chips
The footnote `<li>` IS the popover (no duplication); `<a href="#fn">` anchor fallback for no-support/print/crawlers. Every citation: document ID, page, retrieval date, archive.org link. Use everywhere a number appears — highest-credibility-per-byte component on the site.

```
<!-- in text -->
<span class="cite">
  <a class="cite__fallback" href="#fn12"><sup>12</sup></a>
  <button class="cite__chip" popovertarget="fn12">HC-2023 · p.14</button>
</span>
<!-- endnotes list -->
<ol class="footnotes">
  <li id="fn12" popover>Health Canada, <cite>Fourth Annual Report on MAID</cite>, 2023, p.14.
     <a href="https://web.archive.org/...">archived 2026-05-02</a></li>
</ol>

.cite__chip{display:none;font:.68rem 'IBM Plex Mono',monospace;color:rgba(238,246,250,.65);background:none;border:1px solid rgba(238,246,250,.2);border-radius:999px;padding:.05rem .45rem;cursor:pointer}
.cite__chip:hover{border-color:rgba(238,246,250,.5);color:#eef6fa}
@supports selector(:popover-open){
  .cite__chip{display:inline-block}
  .cite__fallback{display:none}
}
.footnotes li:popover-open{position:fixed;inset:auto;margin:auto;max-width:26rem;padding:1rem 1.25rem;background:rgba(10,16,24,.92);backdrop-filter:blur(12px);border:1px solid rgba(238,246,250,.15);border-radius:10px;color:#eef6fa;font-size:.85rem;box-shadow:0 12px 40px rgba(0,0,0,.5)}
```

### 3.7 Sparklines (dependency-free)
For static data, run once and paste the generated markup into HTML (works with JS off).

```
function spark(v,{w=100,h=28,p=3}={}){
  const min=Math.min(...v),max=Math.max(...v),r=max-min||1;
  const x=i=>p+i*(w-2*p)/(v.length-1);
  const y=d=>h-p-((d-min)/r)*(h-2*p);
  const pts=v.map((d,i)=>`${x(i).toFixed(1)},${y(d).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img"
    aria-label="trend from ${v[0]} to ${v.at(-1)}">
    <polyline points="${pts}" fill="none" stroke="currentColor"
      stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    <circle cx="${x(v.length-1).toFixed(1)}" cy="${y(v.at(-1)).toFixed(1)}" r="2.2" fill="var(--ch-s3)"/>
  </svg>`;
}
/* CSS */ .spark{width:9ch;height:1.1em;color:rgba(238,246,250,.7);vertical-align:-0.15em}
```

### 3.8 Small multiples
Shared domain computed across ALL panels once (per-panel scales are the classic lie). Panel title = series label; no legend. 2 cols min on mobile; ranked table below ~360px.

```
.multiples{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem 1.25rem}
.multiples figure{margin:0;padding:.5rem;background:rgba(238,246,250,.03);border:1px solid rgba(238,246,250,.06);border-radius:8px}
.multiples figcaption{font:600 .72rem 'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ch-tick);margin-bottom:.25rem}
.multiples .ctx{stroke:var(--ch-context);fill:none;stroke-width:1}
.multiples .hero{stroke:var(--ch-s1);fill:none;stroke-width:2}
.multiples .hero-end{fill:var(--ch-s1)}
/* each panel: same viewBox, same x/y scale, all series drawn, one promoted */
<figure><figcaption>British Columbia</figcaption>
  <svg viewBox="0 0 160 90">
    <path class="ctx" d="…AB…"/><path class="ctx" d="…ON…"/>
    <path class="hero" d="…BC…"/><circle class="hero-end" cx="156" cy="22" r="2.5"/>
  </svg>
</figure>
```

### 3.9 CSS bar rows (chart-less comparisons — zero JS, zero SVG)
Default for single-dimension magnitude comparisons; save SVG for time series and flows.

```
<ul class="bars" role="list">
  <li style="--v:1"><span class="bars__lbl">ArriveCAN</span><span class="bars__bar"></span><span class="bars__val">$59.5M</span></li>
  <li style="--v:.23"><span class="bars__lbl">Original estimate</span><span class="bars__bar"></span><span class="bars__val">$80K</span></li>
</ul>

.bars{display:grid;gap:.45rem;padding:0;margin:0}
.bars li{display:grid;grid-template-columns:12ch 1fr 8ch;align-items:center;gap:.75rem;list-style:none}
.bars__lbl{font-size:.8rem;color:rgba(238,246,250,.75)}
.bars__bar{height:.9rem;border-radius:2px;background:var(--ch-s1);transform-origin:left;transform:scaleX(var(--v));opacity:.85}
.bars__val{font:400 .8rem 'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums;text-align:right;color:#eef6fa}
@media (prefers-reduced-motion:no-preference){
  .bars__bar{animation:grow .6s cubic-bezier(.16,1,.3,1) both}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(var(--v))}}
}
```

### 3.10 d3 micro-module vendoring policy
Hand-roll bars/dots/strips/sparklines (~20 lines each). Vendor local ESM ONLY when math is nontrivial: `d3-scale` + `d3-array` (~11 KB gz) for ticks/time scales, `d3-shape` (+6 KB) for curves/areas, `d3-sankey` (+4 KB) for the budget flow, `d3-format`/`d3-time-format` for locale numbers. **Never** d3-selection/d3-transition, never the 90 KB bundle. All ISC/BSD — license-compatible. Every generated SVG: `role="img"`, `aria-label` stating the finding, `<table>` fallback in `<details>` beneath.

```
<script type="module">
import {scaleLinear, scaleUtc} from '/vendor/d3/d3-scale.js';
import {line, curveMonotoneX} from '/vendor/d3/d3-shape.js';
import {extent} from '/vendor/d3/d3-array.js';

const W=720,H=420,M={t:24,r:110,b:32,l:44};   // right margin reserved for direct labels
const x=scaleUtc(extent(data,d=>d.date),[M.l,W-M.r]);
const y=scaleLinear([0,Math.max(...data.map(d=>d.n))],[H-M.b,M.t]).nice();
const path=line(d=>x(d.date),d=>y(d.n)).curve(curveMonotoneX)(data);
figure.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="MAID deaths rose from ${data[0].n} to ${data.at(-1).n}">
  <g class="grid">${y.ticks(5).map(t=>`<line x1="${M.l}" x2="${W-M.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${M.l-8}" y="${y(t)+3}" text-anchor="end">${t.toLocaleString()}</text>`).join('')}</g>
  <path class="series" d="${path}" fill="none" stroke="var(--ch-s1)" stroke-width="2"/>
  <text class="direct-label" x="${x(data.at(-1).date)+8}" y="${y(data.at(-1).n)+4}" fill="var(--ch-s1)">MAID deaths</text>
</svg>`;
</script>
```

---

## 4. LIRIL DOCUMENTARY TOUR ENGINE ("LIRIL Conductor")

### 4.0 Verdict: HAND-ROLL
- **License gate:** Shepherd.js (AGPL since v14, Oct 2024) and intro.js (AGPL) fail the MIT constraint. driver.js is MIT/~5 KB but has documented a11y defects (focus not trapped — issues #24/#434; `<a>` buttons; stray landmarks/`aria-expanded`) and, like every tour lib, zero support for the actual deliverable: autoplay, TTS sync, cross-page steps, scrubbing, captions.
- **Budget:** ~600–800 lines vanilla JS ≈ 7–9 KB min+gz. One file `js/tour-engine.js` + per-tour JSON at `/tours/<id>.json`. Borrow driver.js's config grammar (stagePadding, side/align, lifecycle hooks) so scripts read familiar. Borrow its SVG-cutout overlay technique (~150 lines).
- IO is **not** the step trigger (engine drives the camera) — it is a presentation guard (§4.10). rAF-throttled scroll + ResizeObserver keep the cutout glued to the target.

### 4.1 State machine
```
IDLE ─start(id,{step,autoplay})→ LOADING(fetch tour JSON)
LOADING ─ok→ ARMED ─present(i)→ [step.page ≠ here?] → NAVIGATING (persist cursor, location.assign) ⇢ next page boots → ARMED
ARMED → PRESENTING (scroll 400-600ms + cutout morph + popover fade, await IO ≥0.6)
PRESENTING → SPEAKING (chunked utterances; captions live) → DWELL (afterglow 1s / muted timer) → advance → PRESENTING…
PAUSED   ⟷ overlays SPEAKING|DWELL (Space / ⏯ / visibilitychange)
ENDED    ← last beat done → outro card ("Explore on your own" / chapter TOC)
ABORTED  ← Esc | × | overlay click, from ANY state → teardown: cancel speech, remove overlay, restore focus, clear cursor
```

**API** (`window.LirilTour`, an EventTarget): `load(url)`, `start(id,{step=0,autoplay=false})`, `pause()`, `resume()`, `next()`, `prev()`, `goto(i)`, `stop(reason)`, `state()` → `{phase, step, total, playing, muted}`. Events: `tour:armed|step|speakstart|speakend|paused|resumed|ended|aborted`. Keyboard: Space=pause/resume, ←/→=prev/next, Esc=exit, Home/End=first/last, M=mute.

```
const Tour = new (class extends EventTarget {
  #phase='IDLE'; #i=0; #tour=null; #playing=false; #muted=false;
  async start(id,{step=0,autoplay=false}={}){
    this.#tour = await (await fetch(`/tours/${id}.json`)).json();
    this.#playing = autoplay; this.#set('ARMED'); this.#present(step);
  }
  next(){ this.#cancelSpeech(); this.#i < this.#tour.beats.length-1 ? this.#present(this.#i+1) : this.#end(); }
  prev(){ this.#cancelSpeech(); this.#present(Math.max(0,this.#i-1)); }
  pause(){ this.#playing=false; speechSynthesis.cancel(); clearTimeout(this.#dwellT); this.#set('PAUSED'); }
  stop(reason='user'){ speechSynthesis.cancel(); overlay.teardown(); sessionStorage.removeItem('liril.tour');
    this.#restoreFocus(); this.#set('ABORTED',{reason}); }
  #set(phase,detail={}){ this.#phase=phase;
    this.dispatchEvent(new CustomEvent('tour:'+phase.toLowerCase(),{detail:{...detail,step:this.#i}})); }
})();
window.LirilTour = Tour;
addEventListener('keydown', e => {
  if (Tour.state().phase==='IDLE') return;
  const k={' ':'toggle',ArrowRight:'next',ArrowLeft:'prev',Escape:'stop',Home:'first',End:'last',m:'mute'}[e.key];
  if (k){ e.preventDefault(); Tour[k==='toggle'?(Tour.state().playing?'pause':'resume'):k](); }
});
```

### 4.2 Spotlight overlay (SVG even-odd cutout)
Dim = abyssal ground at 0.82 alpha. Avoids box-shadow hack (breaks in transform/filter stacking contexts) and 4-div frames (seams). stagePadding 12, stageRadius 10. Rebuild `d` on scroll (rAF-throttled), ResizeObserver, and step change; 400–600 ms morph between targets.

```
const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
svg.setAttribute('style','position:fixed;inset:0;width:100%;height:100%;z-index:9998;pointer-events:none');
const path = document.createElementNS(svg.namespaceURI,'path');
path.setAttribute('fill','rgba(5,8,13,.82)');
path.setAttribute('fill-rule','evenodd');
path.style.pointerEvents = 'auto';           // dim zone catches clicks; hole falls through
svg.append(path); document.body.append(svg);
function spotlight(el, pad=12, r=10){
  const b = el.getBoundingClientRect(), W=innerWidth, H=innerHeight;
  const x=b.x-pad, y=b.y-pad, w=b.width+2*pad, h=b.height+2*pad;
  const hole = `M${x+r},${y} h${w-2*r} a${r},${r} 0 0 1 ${r},${r} v${h-2*r} a${r},${r} 0 0 1 -${r},${r} h${2*r-w} a${r},${r} 0 0 1 -${r},-${r} v${2*r-h} a${r},${r} 0 0 1 ${r},-${r} z`;
  path.setAttribute('d', `M0,0 H${W} V${H} H0 Z ${hole}`);
}
addEventListener('scroll', () => requestAnimationFrame(() => current && spotlight(current)), {passive:true});
```

### 4.3 Tour script JSON format
Tours are data, not code. `onEnter` is a NAMED action resolved from a per-page registry — never eval'd (CSP-safe on Pages). A node lint script (manual run, no site build) validates word counts, selector existence against built HTML, and chapter sizes.

```
{
  "id": "first-visit", "version": 1,
  "voice": { "lang": "en-GB", "rate": 0.95, "pitch": 1.0 },
  "chapters": [{
    "title": "The records",
    "beats": [{
      "id": "maid-trend",
      "page": "/maid/",
      "target": "#annual-deaths-chart",
      "fallback": "main h1",
      "title": "MAID, year over year",
      "narration": "Each bar is one year of reported deaths. Watch the slope change after twenty twenty-one — that is when Track Two eligibility began.",
      "spotlight": { "padding": 12, "radius": 10 },
      "scroll": "center",
      "dwellMs": null,
      "onEnter": "expandChartLegend"
    }]
  }]
}
```

### 4.4 Pacing constants (lint-enforced)
10–20 beats/chapter, 30 max/tour (Web Stories); 20–35 words/beat (Serrell ≤50w ceiling) ≈ 8–14 s spoken at rate 0.95; caption ≤2 lines × ~42 chars (BBC); dwell floor 375 ms/word muted; one idea per beat — never introduce two site features in one narration.

```
const PACE = {
  MAX_BEATS: 30,            // Web Stories max pages
  CHAPTER_BEATS: [10, 20],  // ideal band
  WORDS_PER_BEAT: [20, 35], // Serrell <=50w ceiling, lint-enforced
  TTS_RATE: 0.95,           // ~150-160 wpm en-GB
  DWELL_MIN_MS: 4000,
  MS_PER_WORD_MUTED: 375,   // BBC 0.3-0.375 s/word
  AFTERGLOW_MS: 1000,
  CAMERA_MS: 500, CAMERA_EASE: 'cubic-bezier(0.22,1,0.36,1)',
  POP_FADE_MS: 200,
};
```

### 4.5 Speech conductor (voice sync)
All speech routes through the existing **LIRIL_VOICE guard** (British female en-GB local voice; silence > wrong voice). No voice → muted run on caption timing, identical UX minus audio. Three trap fixes baked in: (1) Chrome kills utterances ~15 s → sentence-chunk ≤180 chars chained on `onend`; (2) `cancel()` fires `onerror('interrupted')`, not `onend` → settled-promise wrapper so the state machine never hangs; (3) advance on speech end + 1 s afterglow, never fixed timers. Pause on `visibilitychange`; on resume, cancel + re-speak current beat (`speechSynthesis.resume()` is unreliable). Speech only starts from a user gesture (autoplay policy).

```
function speakBeat(text, voice){
  return new Promise(res => {
    if (!voice) return res('muted');
    const parts = (text.match(/[^.!?…]+[.!?…]*/g) ?? [text]).map(s=>s.trim()); // <=~180ch defeats Chrome's ~15s kill
    let i = 0;
    (function next(){
      if (i >= parts.length) return res('spoken');
      const u = new SpeechSynthesisUtterance(parts[i++]);
      Object.assign(u, { voice, lang:'en-GB', rate:0.95 });
      u.onend = next;
      u.onerror = e => (e.error==='interrupted'||e.error==='canceled') ? res('cancelled') : next();
      speechSynthesis.speak(u);
    })();
  });
}
async function runBeat(beat){
  const outcome = await speakBeat(beat.narration, LIRIL_VOICE.current());
  if (outcome === 'cancelled' || !playing) return;               // user seized control
  const words = beat.narration.split(/\s+/).length;
  const dwell = beat.dwellMs ?? (outcome==='muted' ? Math.max(4000, words*375) : 1000);
  dwellTimer = setTimeout(() => LirilTour.next(), dwell);
}
document.addEventListener('visibilitychange', () => document.hidden && LirilTour.pause());
```

### 4.6 Cross-page relay (static site — full navigations between pages)
URL = shareable source of truth (`?tour=liril&step=12&autoplay=1`, kept current via `history.replaceState` → every beat is a deep link). sessionStorage = playback state (tab-scoped, never ambushes days later; 30-min stale guard). `tour-engine.js` boots from the shared footer on every page.

```
// boot (shared footer, every page)
const q = new URLSearchParams(location.search);
const cur = q.has('tour')
  ? { id:q.get('tour'), step:+q.get('step')||0, playing:q.get('autoplay')==='1' }
  : JSON.parse(sessionStorage.getItem('liril.tour') || 'null');
if (cur && Date.now()-(cur.t??Date.now()) < 30*60_000) LirilTour.start(cur.id, {step:cur.step, autoplay:cur.playing});

// presenting a beat that lives on another page
function present(i){
  const b = tour.beats[i];
  sessionStorage.setItem('liril.tour', JSON.stringify({id:tour.id, step:i, playing, muted, t:Date.now()}));
  if (new URL(b.page, location.origin).pathname !== location.pathname)
    return location.assign(`${b.page}?tour=${tour.id}&step=${i}&autoplay=${playing?1:0}`);
  history.replaceState(null,'',`?tour=${tour.id}&step=${i}`);   // every beat is a shareable deep link
  waitForTarget(b.target, b.fallback, 3000).then(el => el ? show(el,b) : LirilTour.next());
}
function waitForTarget(sel, fb, ms){
  return new Promise(res => {
    const t0 = performance.now();
    (function poll(){
      const el = document.querySelector(sel) ?? document.querySelector(fb);
      el ? res(el) : performance.now()-t0 > ms ? res(null) : requestAnimationFrame(poll);
    })();
  });
}
```

### 4.7 Controls: popover + segmented progress scrubber
Web-Stories segmented bar: one 2px segment per beat; done = solid ice, live fills via `--p`, future 18% alpha; each segment click = `goto(i)`. Mono counter "Chapter 2 · 4/17". `--p` from the dwell clock (muted) or `onboundary` charIndex (local voices, progressive enhancement). Pure background gradients — flat, no-glow compliant.

```
.tp-progress{display:flex;gap:3px;margin-bottom:10px}
.tp-progress i{flex:1;height:2px;background:rgba(238,246,250,.18);cursor:pointer;border-radius:1px}
.tp-progress i.done{background:#eef6fa}
.tp-progress i.live{background:linear-gradient(90deg,#eef6fa var(--p,0%),rgba(238,246,250,.18) 0)}

// engine side
function tickProgress(startT, totalMs){
  const el = bar.children[i];
  (function f(){
    if (!playing) return;
    el.style.setProperty('--p', Math.min(100,(performance.now()-startT)/totalMs*100)+'%');
    if (performance.now()-startT < totalMs) requestAnimationFrame(f);
  })();
}
bar.addEventListener('click', e => {
  const idx = [...bar.children].indexOf(e.target);
  if (idx > -1) LirilTour.goto(idx);
});
```

### 4.8 A11y kit
Fixes every driver.js defect at the root: real `<button>`s, `role=dialog` `aria-modal=false` (spotlight, not modal — page element stays perceivable), labelled by title/caption, container focused per beat (`preventScroll`), Tab cycled, Esc exits, focus restored on teardown (WCAG 2.4.3/2.1.1). **Captions are not optional** — narration text always rendered in an `aria-live=polite` region (muted path + SR path + WCAG 1.2.1 in one; TTS would double-speak for SR users).

```
<aside class="tour-pop" role="dialog" aria-modal="false" aria-labelledby="tp-t" aria-describedby="tp-c" tabindex="-1">
  <div class="tp-progress" aria-hidden="true"><!-- 1 <i> per beat --></div>
  <h2 id="tp-t">MAID, year over year</h2>
  <p  id="tp-c" class="tp-caption" aria-live="polite"><!-- narration text, always visible --></p>
  <div class="tp-bar" role="group" aria-label="Tour controls">
    <button data-act="prev"  aria-label="Previous">‹</button>
    <button data-act="pause" aria-label="Pause narration" aria-pressed="false">⏸</button>
    <button data-act="next"  aria-label="Next">›</button>
    <button data-act="mute"  aria-label="Mute voice" aria-pressed="false">🔇</button>
    <button data-act="stop"  aria-label="Exit tour">✕</button>
  </div>
</aside>
<script>
pop.addEventListener('keydown', e => {           // focus trap
  if (e.key !== 'Tab') return;
  const f = pop.querySelectorAll('button:not([disabled])');
  const [first,last] = [f[0], f[f.length-1]];
  if (e.shiftKey && document.activeElement===first){ last.focus(); e.preventDefault(); }
  else if (!e.shiftKey && document.activeElement===last){ first.focus(); e.preventDefault(); }
});
function onBeat(){ pop.focus({preventScroll:true}); }           // announce title+caption via dialog labelling
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
target.scrollIntoView({behavior: reduced?'auto':'smooth', block: beat.scroll??'center'});
</script>
```

### 4.9 IO presentation guard + read-mode
Guard confirms the target really became ≥60% visible after the smooth scroll (fixed headers/lazy content lie) before narration starts; one nudge, then proceed caption-only. Read-mode (later, cheap): free-scroll stepper over the same tour JSON — IO at 0.6 lights the matching beat caption, no voice.

```
function whenVisible(el, ms=1200){
  return new Promise(res => {
    const io = new IntersectionObserver(es => {
      if (es[0].intersectionRatio >= 0.6){ io.disconnect(); res(true); }
    }, {threshold:[0.6]});
    io.observe(el);
    setTimeout(() => { io.disconnect(); res(false); }, ms);
  });
}
// PRESENTING phase:
target.scrollIntoView({behavior:'smooth', block:'center'});
if (!(await whenVisible(target))) target.scrollIntoView({block:'center'}); // one nudge, then speak regardless
```

### 4.10 Kiosk off-ramps + attract invite
Off-ramp always visible (✕/Esc from every state); end card = "Explore on your own" + chapter TOC, never a dead end; "Jump to chapter" beats a lone "Skip tour". Landing-page idle invite at 45 s, once per session, never auto-starts audio.

```
let idleT; const invite = () => {
  if (sessionStorage.getItem('liril.invited') || location.pathname !== '/') return;
  sessionStorage.setItem('liril.invited','1');
  const chip = Object.assign(document.createElement('button'), {
    className:'tour-invite', textContent:'▸ Take the 4-minute guided tour',
    onclick(){ location.assign('/?tour=first-visit&step=0&autoplay=1'); }
  });
  document.body.append(chip);          // frosted chip, bottom-right, dismissible
};
const resetIdle = () => { clearTimeout(idleT); idleT = setTimeout(invite, 45_000); };
['pointermove','keydown','scroll'].forEach(ev => addEventListener(ev, resetIdle, {passive:true}));
resetIdle();
```

---

## 5. IMPLEMENTATION ORDER (file-by-file, repo root `(repo root)`)

### P0 — Wave 1: foundation (nothing else lands before this)
1. **`assets/vendor/anime-4.5.0.esm.min.js`** (NEW) — vendor from jsdelivr, keep MIT header. Verify byte size ≈115.9 KB.
2. **`fonts/AtkinsonHyperlegibleNext-VF.woff2`** (NEW) — vendor variable font; add `@font-face` (§2.1).
3. **`css/tokens.css`** (EDIT) — add: fluid type scale + `--display`/`--display-stat` (§2.2), motion tokens + reduced-motion kill-switch (§1.1), chart tokens `--ch-*` (§3.1), `@font-face` + `font-synthesis:none`.
4. **`js/motion.js`** (REWRITE) — becomes the motion kernel (§1.0): sole importer of the vendor bundle, exports `VOICE`, `reduceMotion`, scope, re-exports. Audit current `js/motion.js` consumers and migrate their imports.

### P0 — Wave 2: type, layout, canonical motion
5. **`css/quantanium.css`** (NEW — one file, replaces piecemeal additions) — `.eyebrow` (§2.3), `.article` named-lines grid + `.chapter` padding (§2.4), `.reveal` line-mask (A3), `.plate` (§2.5), `.redact` (§2.5), `.link` underline-draw (§2.5), `.display`. Link after `tokens.css` on every page.
6. **`css/film-grain.css`** (EDIT) — replace contents with the single static feTurbulence `body::after` (§2.5); delete any animated grain.
7. **`js/reveal.js`** (REWRITE) — the A3 IntersectionObserver controller (threshold .3, unobserve after fire) + `.is-revealed` hook for `.redact`.
8. **`js/main.js`** (EDIT) — wire A1 master load timeline + A2 hero splitText on homepage/dossier landings only.
9. **`js/figures.js`** (EDIT) — stat-lede + count-up: anime.js A4 canonical path via `js/motion.js`; vanilla fallback (§3.4, D=1600/outCubic) when vendor absent. All counters read authored HTML values.
10. **Evidence table + citations** — table CSS (§3.5) and cite-pop CSS (§3.6) into `css/quantanium.css`; convert existing tables/footnotes markup to `.evidence` + `popover` pattern page-by-page.

### P0 — Wave 3: tour engine
11. **`js/tour-engine.js`** (NEW, ~700 lines) — LIRIL Conductor: state machine (§4.1), spotlight (§4.2), speech conductor (§4.5) routed through `js/liril-voice.js`'s LIRIL_VOICE guard, cross-page relay (§4.6), controls/scrubber (§4.7), a11y kit (§4.8), IO guard (§4.9), `PACE` constants (§4.4). Include via shared footer on **every** page.
12. **`css/liril-tour.css`** (REWRITE) — popover, progress segments, invite chip, overlay styles per §4.7/§4.8.
13. **`tours/first-visit.json`** (NEW) — first authored tour per §4.3 format.
14. **`ops/tour_lint.mjs`** (NEW, node, manual run) — validates `PACE` word counts, selector existence, chapter sizes.
15. **DEPRECATE** (after tour-engine.js is boot-proven on live pages): `js/liril-tour.js`, `js/liril-documentary.js`, `js/liril-walkthrough.js`, `js/tenet5-unified-walkthrough.js`, `js/liril-autoreader.js`, `css/documentary-tour.css`, `css/cinematic-tour.css` — one engine, one stylesheet.

### P1 — data display + editorial depth
16. **`js/scrolly.js`** (NEW) — canonical scrolly-scene engine (§3.2) + pin-annotate `data-state` pattern (§3.3); retrofit existing scroll code in `js/flow.js`/`js/timeline.js` to it.
17. **`js/charts/spark.js`** (NEW) — sparkline generator (§3.7); paste generated SVG into static pages.
18. **Small multiples** (§3.8) + **duotone pipeline** (§2.5 `.fig-duotone`) + **progress rail** (CSS scroll-driven primary + anime.js fallback, §1.3) → `css/quantanium.css` + small hooks in `js/main.js`.
19. **A5 SVG evidence-chain draws** — add `.trace` classes to inline diagram SVGs; hook in `js/figures.js`.
20. **A6 chapter scrub + A7 grid entrance + A8 springs** — thin modules importing from `js/motion.js`.
21. **Variable-font nav weights + ghost numerals** (§2.1) into `css/quantanium.css`.

### P2 — accents (only after P0/P1 are live and boot-proven)
22. Scramble kicker reveal (§1.3) — max one per page.
23. Magnetic CTAs (§2.5) — `data-magnetic` on 2–3 real CTAs only.
24. Kiosk attract invite + read-mode layer (§4.10, §4.9) in `js/tour-engine.js`.
25. CSS bar rows (§3.9) as the default for new simple comparisons.
26. **`vendor/d3/`** (NEW, on first real need only) — d3-scale/array/shape/sankey/format per §3.10 policy.

### Acceptance gates (every wave)
- Page reads fully with JS disabled (real numbers/text in HTML).
- Zero animation under `prefers-reduced-motion` (toggle mid-session must auto-revert via scope).
- No raw easing/duration/size literals outside `css/tokens.css`.
- All data hues from `--ch-*`; ≥4.5:1 text / ≥3:1 graphics on `#05080d`.
- Tour: Esc exits from every state; captions visible when muted; deep link `?tour=…&step=…` reproduces any beat.