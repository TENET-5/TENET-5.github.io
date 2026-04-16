/* ═══════════════════════════════════════════════════════
   TENET5 Procedural Theme Slider — Dark ↔ Light
   HSL colour-science interpolation for perceptually
   smooth transitions. Slider range 0 (dark) → 100 (light).
   TENET5 — Powered by LIRIL AI | SEED 118400
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__TENET5_THEME_SLIDER) return;
  window.__TENET5_THEME_SLIDER = true;

  var STORAGE_KEY = 'tenet5-theme-level';

  // ── Colour Science Helpers ──────────────────────────────

  function hexToRGB(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  }

  function rgbToHSL(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToRGB(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpColor(hexA, hexB, t) {
    var a = hexToRGB(hexA), b = hexToRGB(hexB);
    var hslA = rgbToHSL(a[0], a[1], a[2]);
    var hslB = rgbToHSL(b[0], b[1], b[2]);
    var h = lerp(hslA[0], hslB[0], t);
    var s = lerp(hslA[1], hslB[1], t);
    var l = lerp(hslA[2], hslB[2], t);
    var rgb = hslToRGB(h, s, l);
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
  }

  function lerpRGBA(rA, gA, bA, aA, rB, gB, bB, aB, t) {
    return 'rgba(' +
      Math.round(lerp(rA, rB, t)) + ',' +
      Math.round(lerp(gA, gB, t)) + ',' +
      Math.round(lerp(bA, bB, t)) + ',' +
      (lerp(aA, aB, t)).toFixed(2) + ')';
  }

  // ── Theme Definitions ───────────────────────────────────
  // Dark endpoints (current theme) and light endpoints

  var THEME = {
    // Surfaces
    bg:          ['#0c1220', '#f5f2ec'],
    bgElevated:  ['#111827', '#ede9e1'],
    bgDark:      ['#080e1a', '#faf8f6'],
    // Cards (rgba)
    bgCard:      [[17,24,39,0.80],   [235,230,220,0.85]],
    bgCardH:     [[22,30,48,0.90],   [225,220,210,0.92]],
    bgSurface:   [[15,22,36,0.75],   [240,236,228,0.80]],
    bgTable:     [[12,18,32,0.50],   [230,225,215,0.45]],
    // Text
    textPrimary:   ['#e8e4dc', '#1a1612'],
    textSecondary: ['#b8b4aa', '#4a4540'],
    textTertiary:  ['#7a776e', '#6b6860'],
    textQuaternary:['#504e48', '#908d85'],
    textLight:     ['#f5f2ec', '#0f0d0a'],
    textLightMuted:['#d4d0c8', '#2a2620'],
    // Borders (rgba)
    border:      [[255,255,255,0.08], [0,0,0,0.10]],
    borderHover: [[255,255,255,0.14], [0,0,0,0.16]],
    // Shadows
    shadowSm:    ['0 1px 2px rgba(0,0,0,0.05)',   '0 1px 2px rgba(0,0,0,0.04)'],
    shadowMd:    ['0 4px 16px rgba(0,0,0,0.18)',   '0 4px 16px rgba(0,0,0,0.08)'],
    shadowLg:    ['0 12px 40px rgba(0,0,0,0.28)',  '0 12px 40px rgba(0,0,0,0.10)'],
    shadowGlass: ['0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                  '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)'],
    shadowGlassH:['0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                  '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'],
    // Ensign navy (for themed elements)
    ensignNavy:  ['#0a1222', '#e8e4dc'],
  };

  // ── Apply Theme ─────────────────────────────────────────

  function applyTheme(level) {
    var t = level / 100;
    var root = document.documentElement.style;

    // Hex interpolations
    root.setProperty('--bg',          lerpColor(THEME.bg[0], THEME.bg[1], t));
    root.setProperty('--bg-elevated', lerpColor(THEME.bgElevated[0], THEME.bgElevated[1], t));
    root.setProperty('--bg-dark',     lerpColor(THEME.bgDark[0], THEME.bgDark[1], t));
    root.setProperty('--text-primary',   lerpColor(THEME.textPrimary[0], THEME.textPrimary[1], t));
    root.setProperty('--text-secondary', lerpColor(THEME.textSecondary[0], THEME.textSecondary[1], t));
    root.setProperty('--text-tertiary',  lerpColor(THEME.textTertiary[0], THEME.textTertiary[1], t));
    root.setProperty('--text-quaternary',lerpColor(THEME.textQuaternary[0], THEME.textQuaternary[1], t));
    root.setProperty('--text-light',     lerpColor(THEME.textLight[0], THEME.textLight[1], t));
    root.setProperty('--text-light-muted', lerpColor(THEME.textLightMuted[0], THEME.textLightMuted[1], t));
    root.setProperty('--color-ensign-navy', lerpColor(THEME.ensignNavy[0], THEME.ensignNavy[1], t));

    // RGBA interpolations
    var pairs = [
      ['--bg-card',    THEME.bgCard],
      ['--bg-card-h',  THEME.bgCardH],
      ['--bg-surface', THEME.bgSurface],
      ['--bg-table',   THEME.bgTable],
      ['--border',     THEME.border],
      ['--border-hover',THEME.borderHover],
    ];
    for (var i = 0; i < pairs.length; i++) {
      var d = pairs[i][1][0], l = pairs[i][1][1];
      root.setProperty(pairs[i][0], lerpRGBA(d[0],d[1],d[2],d[3], l[0],l[1],l[2],l[3], t));
    }

    // Shadow interpolations (string blend — use dark below 50, light above)
    var shadowT = t < 0.5 ? 0 : 1;
    root.setProperty('--shadow-sm',      THEME.shadowSm[shadowT]);
    root.setProperty('--shadow-md',      THEME.shadowMd[shadowT]);
    root.setProperty('--shadow-lg',      THEME.shadowLg[shadowT]);
    root.setProperty('--shadow-glass',   THEME.shadowGlass[shadowT]);
    root.setProperty('--shadow-glass-h', THEME.shadowGlassH[shadowT]);

    // Evidence bg opacity adjusts
    var evA = lerp(0.04, 0.08, t);
    root.setProperty('--bg-evidence', 'rgba(185, 28, 28, ' + evA.toFixed(2) + ')');
    root.setProperty('--accent-glow', 'rgba(185, 28, 28, ' + lerp(0.10, 0.15, t).toFixed(2) + ')');

    // Glassmorphism saturation adjusts
    var sat = Math.round(lerp(160, 120, t));
    root.setProperty('--backdrop-card', 'blur(12px) saturate(' + sat + '%)');

    // Body background (direct set for immediate visual)
    document.body.style.backgroundColor = lerpColor(THEME.bg[0], THEME.bg[1], t);
  }

  // ── Init ────────────────────────────────────────────────

  function init() {
    // Inject CSS for the slider
    var style = document.createElement('style');
    style.textContent =
      '.theme-slider-wrap{display:flex;align-items:center;gap:4px;margin-left:8px;}' +
      '.tsl-icon{font-size:13px;color:var(--text-tertiary);line-height:1;user-select:none;}' +
      '#theme-slider{width:56px;height:4px;cursor:pointer;accent-color:var(--accent);' +
      'appearance:auto;-webkit-appearance:auto;opacity:0.7;transition:opacity 0.2s;}' +
      '#theme-slider:hover{opacity:1;}' +
      '@media(max-width:480px){.tsl-icon{display:none;}#theme-slider{width:36px;}}';
    document.head.appendChild(style);

    // Add smooth transition to body
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

    // Find the slider element (injected by nav.js)
    var slider = document.getElementById('theme-slider');
    if (!slider) return;

    // Load saved preference
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

    var level;
    if (saved !== null) {
      level = parseInt(saved, 10);
    } else {
      // Respect OS preference for first-time visitors
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        level = 75;
      } else {
        level = 0;
      }
    }

    slider.value = level;
    applyTheme(level);

    // Real-time update while dragging
    slider.addEventListener('input', function () {
      applyTheme(parseInt(this.value, 10));
    });

    // Save on release
    slider.addEventListener('change', function () {
      try { localStorage.setItem(STORAGE_KEY, this.value); } catch (e) {}
    });
  }

  // ── Early apply (prevent flash) ─────────────────────────
  // Apply saved theme BEFORE DOM is ready for instant colour
  try {
    var earlyLevel = localStorage.getItem(STORAGE_KEY);
    if (earlyLevel !== null) {
      applyTheme(parseInt(earlyLevel, 10));
    }
  } catch (e) {}

  // Full init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
