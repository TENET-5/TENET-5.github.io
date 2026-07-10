/* Wire daily-briefing.html to live govt_daily_briefing.json */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function srcLinks(sources) {
    if (!sources || !sources.length) return '';
    return '<div class="happen-src">' + sources.slice(0, 4).map(function (s) {
      var u = s.url || '#';
      var lab = esc(s.label || u);
      var ext = /^https?:/i.test(u);
      return '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + lab + '</a>';
    }).join(' · ') + '</div>';
  }

  function renderHappening(items) {
    var box = document.getElementById('happening-now');
    if (!box) return;
    if (!items || !items.length) {
      box.innerHTML = '<p style="color:#6a7f8c;font-size:14px">No active files in briefing JSON.</p>';
      return;
    }
    box.innerHTML = items.map(function (h) {
      var href = h.page || '#';
      return (
        '<a class="happen-card" href="' + esc(href) + '">' +
          '<div class="happen-domain">' + esc(h.domain || 'FILE') + '</div>' +
          '<div>' +
            '<h3>' + esc(h.headline || '') + '</h3>' +
            '<p>' + esc(h.body || '') + '</p>' +
            srcLinks(h.sources) +
          '</div>' +
          '<div class="happen-sev">' + esc(h.severity || h.status || '') + '</div>' +
        '</a>'
      );
    }).join('');
  }

  function renderMetrics(metrics) {
    var box = document.getElementById('brief-metrics-live');
    if (!box || !metrics || !metrics.length) return;
    box.innerHTML = metrics.map(function (m) {
      return (
        '<div class="metric-card visible" data-anim="card">' +
          '<div class="metric-label">' + esc(m.label || '') + '</div>' +
          '<div class="metric-value" style="font-size:clamp(22px,3vw,36px)">' + esc(m.value || '') + '</div>' +
          '<span class="metric-delta flat">' + esc(m.unit || '') + '</span>' +
          '<div class="metric-source">' + esc(m.note || '') + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderFuture(plans) {
    var box = document.getElementById('future-plans-detail');
    if (!box || !plans || !plans.length) return;
    box.innerHTML = plans.map(function (p) {
      var items = (p.items || []).map(function (it) {
        return '<li style="margin:6px 0;color:#a8bcc8">' + esc(it) + '</li>';
      }).join('');
      return (
        '<div style="border:1px solid rgba(168,188,200,0.12);border-radius:8px;padding:16px;background:rgba(12,18,25,0.45)">' +
          '<div style="font-family:IBM Plex Mono,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#eef6fa;margin-bottom:10px">' +
            esc(p.horizon || 'HORIZON') +
          '</div>' +
          '<ul style="margin:0;padding-left:1.1em">' + items + '</ul>' +
        '</div>'
      );
    }).join('');
  }

  function boot() {
    fetch('data/govt_daily_briefing.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('briefing ' + r.status);
        return r.json();
      })
      .then(function (j) {
        var title = document.getElementById('brief-title');
        var one = document.getElementById('brief-oneline');
        var threat = document.getElementById('threat-pill');
        var dateEl = document.getElementById('briefing-date');
        if (title && j.title) title.textContent = j.title;
        if (one && j.one_line) one.textContent = j.one_line;
        if (threat) threat.textContent = 'Threat ' + (j.threat_level || '—');
        if (dateEl && j.date) dateEl.textContent = j.date + (j.generated_at ? ' · ' + j.generated_at.slice(11, 16) + 'Z' : '');
        renderHappening(j.happening_now || []);
        renderMetrics(j.metrics || []);
        renderFuture(j.future_plans_summary || []);
      })
      .catch(function (err) {
        var box = document.getElementById('happening-now');
        if (box) {
          box.innerHTML =
            '<p style="color:#b0544a;font-size:14px">Briefing JSON failed to load. ' +
            esc(String(err && err.message || err)) +
            ' — open <a href="data/govt_daily_briefing.json" style="color:#eef6fa">data/govt_daily_briefing.json</a> directly.</p>';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
