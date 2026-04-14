/**
 * TENET5 Canonical Figures — Single Source of Truth
 * Reads data/canonical_figures.json and injects values into elements
 * with data-figure="key" attributes.
 *
 * Usage in HTML:
 *   <span data-figure="maid_confirmed">76,475</span>
 *   <span data-figure="brookfield_aum">$1T+</span>
 *   <span data-figure="doctor_shortage">6.5 million</span>
 *
 * The hardcoded value serves as fallback if JS fails to load.
 * The script replaces it with the canonical value from the JSON file.
 *
 * IIFE pattern — loaded by shell.js
 */
(function() {
  'use strict';
  if (window.__TENET5_FIGURES_LOADED) return;
  window.__TENET5_FIGURES_LOADED = true;

  var FIGURES = null;

  function inject() {
    if (!FIGURES) return;
    var els = document.querySelectorAll('[data-figure]');
    els.forEach(function(el) {
      var key = el.getAttribute('data-figure');
      if (FIGURES[key] && FIGURES[key].value) {
        el.textContent = FIGURES[key].value;
      }
    });
  }

  // Expose for external use
  window.TENET5_FIGURES = {
    get: function(key) { return FIGURES && FIGURES[key] ? FIGURES[key].value : null; },
    getRaw: function(key) { return FIGURES && FIGURES[key] ? FIGURES[key].raw : null; },
    getSource: function(key) { return FIGURES && FIGURES[key] ? FIGURES[key].source : null; },
    all: function() { return FIGURES; }
  };

  // Load and inject
  var base = '';
  if (window.location.pathname.indexOf('/') !== -1) {
    var parts = window.location.pathname.split('/');
    parts.pop();
    base = parts.join('/') + '/';
  }

  fetch(base + 'data/canonical_figures.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      FIGURES = data;
      inject();
      // Re-inject after DOMContentLoaded if loaded early
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
      }
    })
    .catch(function(err) {
      // Fallback: hardcoded values in HTML remain visible
      console.warn('TENET5 figures.js: could not load canonical_figures.json', err);
    });
})();
