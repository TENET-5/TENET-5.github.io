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
        state.pagesVisited.length + '/' + 129 + ' pages';
      document.body.appendChild(status);
    }
  });

})();
