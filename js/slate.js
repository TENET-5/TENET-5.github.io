/* ═══════════════════════════════════════════════════════
   S.L.A.T.E + HYDROGEN Integration
   Token persistence, context tracking, adaptive navigation
   TENET5 — Powered by LIRIL AI | SEED 118400
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var SEED = 118400;
  var SLATE_KEY = 'tenet5_slate_' + SEED;

  // ── Token Persistence (HYDROGEN) ────────────────────
  // Maintains user context across page visits and generations
  var state = {
    seed: SEED,
    firstVisit: null,
    lastVisit: null,
    visitCount: 0,
    pagesVisited: [],
    lastPage: null,
    theme: 'nature',
    searchHistory: [],
  };

  // Load persisted state
  try {
    var saved = localStorage.getItem(SLATE_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    }
  } catch(e) {}

  // Update state
  state.lastVisit = new Date().toISOString();
  state.visitCount++;
  if (!state.firstVisit) state.firstVisit = state.lastVisit;

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  state.lastPage = currentPage;
  if (state.pagesVisited.indexOf(currentPage) === -1) {
    state.pagesVisited.push(currentPage);
  }
  // Keep only last 50 pages
  if (state.pagesVisited.length > 50) {
    state.pagesVisited = state.pagesVisited.slice(-50);
  }

  // Save state
  try {
    localStorage.setItem(SLATE_KEY, JSON.stringify(state));
  } catch(e) {}

  // ── SLATE Status API ────────────────────────────────
  window.TENET5_SLATE = {
    seed: SEED,
    state: state,
    getVisitCount: function() { return state.visitCount; },
    getPagesVisited: function() { return state.pagesVisited.length; },
    getContext: function() { return JSON.parse(JSON.stringify(state)); },
    clearContext: function() {
      localStorage.removeItem(SLATE_KEY);
      state = { seed: SEED, firstVisit: null, lastVisit: null, visitCount: 0, pagesVisited: [], lastPage: null, theme: 'nature', searchHistory: [] };
    },
  };

  // ── Nature Theme Enhancements ───────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    var presentationMode = document.body.classList.contains('theme-1950s') || document.getElementById('cinematic-engine') || document.querySelector('.news-hero');
    if (presentationMode) {
      return;
    }

    // Add aurora strip to hero sections
    var heroes = document.querySelectorAll('.hero, .page-hero, [class*="hero"]');
    heroes.forEach(function(hero) {
      if (!hero.querySelector('.aurora-strip')) {
        var strip = document.createElement('div');
        strip.className = 'aurora-strip';
        hero.appendChild(strip);
      }
    });

    // Add nature-bg class to body if not already present
    if (!document.body.classList.contains('nature-bg')) {
      document.body.classList.add('nature-bg');
    }

    // Add SLATE status to footer if present
    var footer = document.querySelector('.site-footer, #site-footer-frame');
    if (footer && !footer.querySelector('.slate-status')) {
      var status = document.createElement('div');
      status.className = 'slate-status';
      status.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:999;';
      status.innerHTML = '<span class="dot"></span> SLATE ' +
        state.pagesVisited.length + '/143 pages';
      document.body.appendChild(status);
    }

    // ── HYDROGEN: Investigation-aware recommendations ──
    // Suggest unvisited pages from the core investigation cluster
    var CORE_INVESTIGATIONS = [
      { href: 'follow-the-money.html', label: 'Follow the Money' },
      { href: 'maid-accountability.html', label: 'MAID Investigation' },
      { href: 'carney-conflicts.html', label: 'Carney COI' },
      { href: 'cds-accountability.html', label: 'CDS Accountability' },
      { href: 's504-covey-bae.html', label: 's.504 Charges' },
      { href: 'foreign-interference.html', label: 'Foreign Interference' },
      { href: 'disability-genocide.html', label: 'UN CRPD' },
      { href: 'veterans-betrayal.html', label: 'Veterans' },
      { href: 'arrivecan.html', label: 'ArriveCAN' },
      { href: 'rcmp-commissioners.html', label: 'RCMP' },
    ];

    var unvisited = CORE_INVESTIGATIONS.filter(function(inv) {
      return state.pagesVisited.indexOf(inv.href) === -1;
    });

    // Show recommendation after 2+ page visits if unvisited investigations exist
    if (state.visitCount > 2 && unvisited.length > 0 && unvisited.length < CORE_INVESTIGATIONS.length) {
      var rec = unvisited[Math.floor(Math.random() * unvisited.length)];
      var recEl = document.createElement('div');
      recEl.style.cssText = 'position:fixed;bottom:50px;left:8px;z-index:999;background:var(--bg-card,#1a1f36);border:1px solid var(--border,#333);border-left:3px solid var(--accent,#c41e3a);border-radius:8px;padding:8px 12px;max-width:220px;font-size:0.75rem;color:var(--text-secondary,#aaa);cursor:pointer;transition:opacity 0.3s;';
      recEl.innerHTML = '<strong style="color:var(--accent,#c41e3a);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.05em;">LIRIL suggests:</strong><br><a href="' + rec.href + '" style="color:var(--text-primary,#eee);text-decoration:none;font-weight:600;">' + rec.label + ' &rarr;</a>';
      recEl.addEventListener('click', function() { recEl.style.display = 'none'; });
      setTimeout(function() { document.body.appendChild(recEl); }, 3000);
      setTimeout(function() { if (recEl.parentNode) recEl.style.opacity = '0'; }, 30000);
    }
  });

})();
