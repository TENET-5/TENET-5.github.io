// LIRIL Procedural Theme Slider
// Modified: 2026-04-20 | Cap#12-c3 | Daniel directive:
//   "procedural slider at the top of the page: 0=dark, 1=light, in between =
//    user-set color theme"
// Reads/writes --liril-phase (0..1), --liril-hue (0..360), --liril-saturation
// (% string), --liril-warmth (0..1) on :root. Persisted in localStorage.
// Pairs with css/liril-theme.css (which binds every site color to these vars).
//
// No dependencies. Vanilla JS. Graceful fail if DOM isn't ready.

(function LirilThemeSlider() {
  'use strict';

  const LS_KEY = 'liril.theme.v1';
  const DEFAULTS = {
    phase:      0.08,     // 0=dark, 1=light
    hue:        210,      // degrees 0..360
    saturation: 68,       // percent
    warmth:     0.0       // 0 cool .. 1 warm
  };

  // Curated hue palette (cycle through these on hue-chip click)
  const HUE_PALETTE = [
    { name: 'LIRIL Blue',    hue: 210 },
    { name: 'Crown Red',     hue: 352 },
    { name: 'Maple Gold',    hue:  44 },
    { name: 'Signal Cyan',   hue: 188 },
    { name: 'Ember Amber',   hue:  28 },
    { name: 'Obsidian Purple', hue: 268 },
    { name: 'Accountability Green', hue: 142 },
    { name: 'Twilight Indigo', hue: 240 }
  ];

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return { ...DEFAULTS };
      const v = JSON.parse(raw);
      return { ...DEFAULTS, ...v };
    } catch(e) { return { ...DEFAULTS }; }
  }

  function save(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
    catch(e) { /* ignore */ }
  }

  function apply(state) {
    const root = document.documentElement;
    root.style.setProperty('--liril-phase',      state.phase);
    root.style.setProperty('--liril-hue',        state.hue);
    root.style.setProperty('--liril-saturation', state.saturation + '%');
    root.style.setProperty('--liril-warmth',     state.warmth);
  }

  function formatReadout(state) {
    const pct = Math.round(state.phase * 100);
    const mode = pct < 20 ? 'DARK'
               : pct > 80 ? 'LIGHT'
               : 'TWILIGHT';
    return `${pct}% · ${mode}`;
  }

  function createSlider() {
    // Prevent double-injection
    if (document.getElementById('liril-theme-slider-shell')) return;

    const state = load();
    apply(state);

    // Check for a mount slot — pages can include a
    // <div class="liril-theme-slider-mount"></div> anywhere in their
    // banner/masthead. If present, the slider becomes an inline
    // permanent control instead of a floating edge-reveal overlay.
    const mountPoint = document.querySelector('.liril-theme-slider-mount');
    const isMounted = !!mountPoint;

    // Edge trigger (only when floating — invisible strip at top reveals on hover)
    let edge = null;
    if (!isMounted) {
      edge = document.createElement('div');
      edge.className = 'liril-slider-edge-trigger';
      edge.setAttribute('aria-hidden', 'true');
    }

    // Shell
    const shell = document.createElement('div');
    shell.id = 'liril-theme-slider-shell';
    shell.className = 'liril-theme-slider-shell' +
                      (isMounted ? ' liril-slider-mounted'
                                 : ' liril-glass liril-slider-hidden');
    shell.setAttribute('role', 'toolbar');
    shell.setAttribute('aria-label', 'Theme controls');

    // Label
    const label = document.createElement('label');
    label.textContent = 'theme';
    label.htmlFor = 'liril-phase-range';

    // Phase range slider (the main one Daniel asked for)
    const range = document.createElement('input');
    range.type = 'range';
    range.min = 0; range.max = 1; range.step = 0.01;
    range.value = state.phase;
    range.id = 'liril-phase-range';
    range.setAttribute('aria-label', 'Theme phase: 0 dark, 1 light');

    // Readout
    const readout = document.createElement('span');
    readout.className = 'liril-slider-readout';
    readout.textContent = formatReadout(state);

    // Hue chip (click-to-cycle color)
    const hueChip = document.createElement('button');
    hueChip.className = 'liril-hue-chip';
    hueChip.type = 'button';
    hueChip.title = 'Click to cycle accent color';
    hueChip.setAttribute('aria-label', 'Change accent color');

    // Advanced: secondary range for hue (double-click chip to expand)
    const hueRange = document.createElement('input');
    hueRange.type = 'range';
    hueRange.min = 0; hueRange.max = 360; hueRange.step = 1;
    hueRange.value = state.hue;
    hueRange.className = 'liril-hue-range';
    hueRange.style.display = 'none';
    hueRange.style.width = '110px';
    hueRange.setAttribute('aria-label', 'Accent hue 0..360 degrees');

    // Wire events
    range.addEventListener('input', (e) => {
      state.phase = parseFloat(e.target.value);
      apply(state);
      readout.textContent = formatReadout(state);
      save(state);
    });

    let paletteIdx = (HUE_PALETTE.findIndex(p => Math.abs(p.hue - state.hue) < 10) + 1) || 0;
    hueChip.addEventListener('click', () => {
      const entry = HUE_PALETTE[paletteIdx % HUE_PALETTE.length];
      state.hue = entry.hue;
      apply(state);
      save(state);
      hueRange.value = state.hue;
      hueChip.title = 'Click to cycle accent color — now: ' + entry.name;
      paletteIdx = (paletteIdx + 1) % HUE_PALETTE.length;
    });

    hueChip.addEventListener('dblclick', (e) => {
      e.preventDefault();
      hueRange.style.display = hueRange.style.display === 'none' ? 'inline-block' : 'none';
    });

    hueRange.addEventListener('input', (e) => {
      state.hue = parseInt(e.target.value, 10);
      apply(state);
      save(state);
    });

    // Assemble
    shell.appendChild(label);
    shell.appendChild(range);
    shell.appendChild(readout);
    shell.appendChild(hueChip);
    shell.appendChild(hueRange);

    // Reveal logic: only active for the floating-overlay variant.
    // Mounted variant stays permanently visible as a banner control.
    if (!isMounted) {
      let hideTimer = null;
      const show = () => {
        shell.classList.remove('liril-slider-hidden');
        if (hideTimer) clearTimeout(hideTimer);
      };
      const scheduleHide = () => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          shell.classList.add('liril-slider-hidden');
        }, 1500);
      };

      edge.addEventListener('mouseenter', show);
      shell.addEventListener('mouseenter', show);
      shell.addEventListener('mouseleave', scheduleHide);
      range.addEventListener('focus', show);
      range.addEventListener('blur', scheduleHide);
      hueRange.addEventListener('focus', show);
      hueRange.addEventListener('blur', scheduleHide);

      // Keyboard: Alt+T toggles visibility persistently
      document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 't' || e.key === 'T')) {
          shell.classList.toggle('liril-slider-hidden');
        }
      });
    }

    if (isMounted) {
      mountPoint.appendChild(shell);
    } else {
      document.body.appendChild(edge);
      document.body.appendChild(shell);
    }

    // Emit an event so other scripts can react to theme readiness
    window.dispatchEvent(new CustomEvent('liril-theme-ready', { detail: state }));
  }

  // Wait for body
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSlider);
  } else {
    createSlider();
  }
})();
