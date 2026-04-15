(function () {
  'use strict';

  async function initNvidiaModelWatch() {
    var grid = document.getElementById('nvidia-model-watch-grid');
    var summary = document.getElementById('nvidia-model-watch-summary');
    if (!grid) return;

    try {
      var res = await fetch('data/ai_expansions/nvidia_model_watch.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load NVIDIA watch data');
      var items = await res.json();
      if (!Array.isArray(items)) throw new Error('Invalid NVIDIA watch payload');

      var order = { active: 0, evaluate: 1, tracked: 2, deferred: 3 };
      items.sort(function (a, b) {
        return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
      });

      if (summary) {
        var active = items.filter(function (item) { return item.priority === 'active'; }).length;
        var evaluate = items.filter(function (item) { return item.priority === 'evaluate'; }).length;
        summary.textContent = items.length + ' NVIDIA families tracked • ' + active + ' active fit • ' + evaluate + ' under evaluation';
      }

      grid.innerHTML = items.map(function (item) {
        var badge = String(item.priority || 'tracked').toUpperCase();
        var examples = Array.isArray(item.examples) ? item.examples.slice(0, 3).join(' • ') : '';
        return [
          '<article class="card nvidia-watch-card">',
          '  <div class="nvidia-watch-top">',
          '    <span class="nvidia-watch-badge nvidia-watch-' + String(item.priority || 'tracked') + '">' + badge + '</span>',
          '    <span class="nvidia-watch-domain">' + String(item.domain || '') + '</span>',
          '  </div>',
          '  <h3><a href="' + String(item.url || '#') + '" target="_blank" rel="noopener">' + String(item.family || 'NVIDIA family') + '</a></h3>',
          '  <p>' + String(item.summary || '') + '</p>',
          '  <p class="nvidia-watch-fit"><strong>TENET5 fit:</strong> ' + String(item.tenet5_fit || '') + '</p>',
          examples ? '  <div class="nvidia-watch-examples">Examples: ' + examples + '</div>' : '',
          '</article>'
        ].join('');
      }).join('');
    } catch (err) {
      grid.innerHTML = '<div class="card"><h3>NVIDIA model watch offline</h3><p>The research integration could not be loaded right now.</p></div>';
      if (summary) summary.textContent = 'Watch data unavailable';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNvidiaModelWatch);
  } else {
    initNvidiaModelWatch();
  }
})();
