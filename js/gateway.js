/* TENET5 gateway live stats */
(function () {
  'use strict';
  function set(id, t) {
    var n = document.getElementById(id);
    if (n) n.textContent = t;
  }
  function load() {
    fetch('data/documentary_chapters.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        var t = j.totals || {};
        set('m-film', t.duration_label || '—');
        set('m-beats', (t.segments || (j.chapters && j.chapters.length) || '—') + ' beats');
      })
      .catch(function () {
        set('m-film', '—');
        set('m-beats', 'catalog offline');
      });

    fetch('data/govt_daily_briefing.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        set('m-threat', j.threat_level || '—');
        set('m-date', j.date ? ('sheet ' + j.date) : 'daily sheet');
      })
      .catch(function () {
        set('m-threat', '—');
        set('m-date', 'brief offline');
      });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
