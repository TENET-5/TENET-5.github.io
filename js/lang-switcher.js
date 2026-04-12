/* ═══════════════════════════════════════════════════════
   TENET5 Language Switcher — EN / FR / NL (Newfinese)
   Three official language options for the site
   TENET5 — Powered by LIRIL AI | SEED 118400
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var LANG_KEY = 'tenet5_lang';
  var currentLang = localStorage.getItem(LANG_KEY) || 'en';

  // ── Newfinese Dictionary ─────────────────────────
  // Sourced from Dictionary of Newfoundland English (Memorial University)
  // and verified Newfoundland dialect guides
  var NEWFINESE = {
    // Navigation
    'Home': "Home, b'y",
    'MAID Report': "Dey're Killin' Us Report",
    'Follow $': "Where'd Da Money Go",
    'All Pages': "Da Whole Bloody Works",
    'CDS': "Dat Useless General",
    'Scandals': "Dese Crooked Bastards",
    'Search': "Ave a Gander",

    // Common UI
    'Continue the Investigation': "Keep Diggin', b'y — Dey're Buried Deep",
    'The Investigation Continues': "We Ain't Done Wit Dese Crooks Yet",
    'Sources': "Where We Caught Da Bastards",
    'Evidence': "Da Proof Dey Can't Weasel Out Of",
    'Connected Investigations': "More Crooks Over Here, wha",
    'Source': "Where Dat Come From, b'y",

    // Impact phrases
    'Follow the Money': "Follow Da Money — She Stinks Worse Dan a Fish Plant in August",
    'The World Is Watching': "Da Whole Bloody World Knows Now, Ya Crooked Sods",
    'The Accountability Void': "Nobody Got In Trouble — Feed 'Em to Da Fish",
    'Zero': "Not a Blessed One — Trow 'Em Off Da Wharf",

    // LIRIL
    'LIRIL NARRATION': "LIRIL'S HAVIN' A YARN",
    'LIRIL Walkthrough': "LIRIL'll Give Ya Da Dirt",
    'Click to advance': "Give 'Er a Click, b'y",

    // Section headers
    'Key Figures': "Da Big Crooked Numbers",
    'Demands & Sources': "What We Wants or We'll Feed Ya to Da Cod",
    'The Pattern': "Da Same Crooked Ting Every Bloody Time",
    'What Accountability Requires': "Lock 'Em Up or Trow 'Em in Da Harbour",

    // Investigations
    'MAID Deaths': "76,707 Dead — Lard Tunderin' Jesus",
    'ArriveCAN': "ArriveCAN — $93 Million for Frig All",
    'Phoenix Pay': "Phoenix Pay — She's Right Shagged, b'y",
    'Foreign Interference': "Crowd From Away Messin' Wit Our Democracy",
    'Veterans': "Our Vets — Treated Worse Dan Bait Fish",
    'RCMP': "Da Mounties — Useless as Tits on a Bull",
    'Scandals': "Dese Crooks Been At It Since Before Confederation",

    // Common words
    'investigation': "havin' a right good sniff around",
    'accountability': "gettin' yer arse hauled to da wharf",
    'documented': "wrote it all down so da slimy buggers can't deny it",
    'evidence': "da proof, sure as God made little green apples",
    'confirmed': "confirmed — bet yer arse on dat one",
    'unprecedented': "never seen da like since da cod moratorium",
    'systemic': "rotten right trew — like a dory full of holes",
    'comprehensive': "da whole bloody shebang from stern to bow"
  };

  // ── French translations (key UI only) ──────────
  var FRENCH = {
    'Home': 'Accueil',
    'MAID Report': 'Rapport AMM',
    'Follow $': 'Suivre l\'argent',
    'All Pages': 'Toutes les pages',
    'Search': 'Rechercher',
    'Continue the Investigation': 'Poursuivre l\'enqu\u00eate',
    'The Investigation Continues': 'L\'enqu\u00eate continue',
    'Sources': 'Sources',
    'Evidence': 'Preuves',
    'Connected Investigations': 'Enqu\u00eates connexes',
    'Follow the Money': 'Suivre l\'argent',
    'The World Is Watching': 'Le monde regarde',
    'Key Figures': 'Chiffres cl\u00e9s',
    'Veterans': 'V\u00e9t\u00e9rans',
    'RCMP': 'GRC',
    'Scandals': 'Scandales',
    'Foreign Interference': 'Ing\u00e9rence \u00e9trang\u00e8re'
  };

  var DICTS = { en: null, fr: FRENCH, nl: NEWFINESE };

  // ── Language Switcher UI ─────────────────────────
  function createSwitcher() {
    var sw = document.createElement('div');
    sw.id = 'lang-switcher';
    sw.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9999;display:flex;gap:4px;background:rgba(0,0,0,0.7);border-radius:6px;padding:3px;backdrop-filter:blur(8px);';

    var langs = [
      { code: 'en', label: 'EN', title: 'English' },
      { code: 'fr', label: 'FR', title: 'Fran\u00e7ais' },
      { code: 'nl', label: "NL", title: "Newfinese (Newfoundland English)" }
    ];

    langs.forEach(function(l) {
      var btn = document.createElement('button');
      btn.textContent = l.label;
      btn.title = l.title;
      btn.style.cssText = 'background:' + (currentLang === l.code ? 'var(--accent,#c41e3a)' : 'transparent') + ';color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.05em;';
      btn.addEventListener('click', function() {
        currentLang = l.code;
        localStorage.setItem(LANG_KEY, l.code);
        applyLanguage();
        // Update button styles
        sw.querySelectorAll('button').forEach(function(b, i) {
          b.style.background = langs[i].code === currentLang ? 'var(--accent,#c41e3a)' : 'transparent';
        });
      });
      sw.appendChild(btn);
    });

    document.body.appendChild(sw);
  }

  // ── Apply translations ───────────────────────────
  function applyLanguage() {
    var dict = DICTS[currentLang];
    if (!dict) {
      // English — restore originals
      document.querySelectorAll('[data-orig]').forEach(function(el) {
        el.textContent = el.getAttribute('data-orig');
      });
      document.documentElement.lang = 'en-GB';
      return;
    }

    // Store originals and translate
    var textNodes = document.querySelectorAll('h1, h2, h3, h4, a, button, .hero-tag, .lbl, .stat-label, .section-label');
    textNodes.forEach(function(el) {
      if (el.children.length > 1) return; // skip complex elements
      var orig = el.getAttribute('data-orig') || el.textContent.trim();
      if (!el.getAttribute('data-orig')) el.setAttribute('data-orig', orig);

      // Check dictionary
      if (dict[orig]) {
        el.textContent = dict[orig];
      }
    });

    document.documentElement.lang = currentLang === 'fr' ? 'fr-CA' : currentLang === 'nl' ? 'en-CA' : 'en-GB';
  }

  // ── Init ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    createSwitcher();
    if (currentLang !== 'en') applyLanguage();
  });

  window.TENET5_LANG = {
    get: function() { return currentLang; },
    set: function(code) {
      currentLang = code;
      localStorage.setItem(LANG_KEY, code);
      applyLanguage();
    }
  };
})();
