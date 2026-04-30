/* ═══════════════════════════════════════════════════════
   TENET5 Impact Tracker — Page View & Engagement Counter
   Stores lightweight page-view metrics in localStorage.
   No external analytics — privacy-first.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_IMPACT_LOADED) return;
  window.__TENET5_IMPACT_LOADED = true;

  var STORAGE_KEY = 'tenet5_impact';
  var page = (window.location.pathname.split('/').pop() || 'index.html');

  function getImpact() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch(e) { return {}; }
  }

  function saveImpact(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
  }

  /* Record page view */
  var impact = getImpact();
  if (!impact.views) impact.views = {};
  if (!impact.sessions) impact.sessions = 0;
  if (!impact.firstVisit) impact.firstVisit = new Date().toISOString();

  impact.views[page] = (impact.views[page] || 0) + 1;
  impact.lastVisit = new Date().toISOString();
  impact.totalViews = Object.values(impact.views).reduce(function(a, b) { return a + b; }, 0);

  /* Session tracking */
  if (!sessionStorage.getItem('tenet5_session_counted')) {
    impact.sessions++;
    sessionStorage.setItem('tenet5_session_counted', '1');
  }

  saveImpact(impact);

  /* Public API */
  window.__TENET5_IMPACT = {
    getStats: function() { return getImpact(); },
    getPageViews: function(p) { return (getImpact().views || {})[p || page] || 0; },
    getTotalViews: function() { return getImpact().totalViews || 0; },
    getSessions: function() { return getImpact().sessions || 0; }
  };

  /* Inject view counter if placeholder exists */
  var counter = document.getElementById('impact-counter');
  if (counter) {
    counter.textContent = impact.totalViews + ' pages viewed across ' + impact.sessions + ' sessions';
  }

  console.log('[impact] Page view recorded: ' + page + ' (' + impact.views[page] + ' views)');
})();
