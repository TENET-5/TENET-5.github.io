/**
 * TENET5 Daily Briefing renderer
 * Loads govt_daily_briefing.json + govt_future_plans_map.json
 * Organized cinematic displays for "what govt is doing" + future map.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toneClass(t) {
    if (t === 'critical') return ' is-critical';
    if (t === 'high') return ' is-high';
    if (t === 'verified') return ' is-verified';
    return '';
  }

  function revealOnScroll() {
    var nodes = document.querySelectorAll('.cin-reveal');
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function renderMetrics(metrics) {
    var root = document.getElementById('brief-metrics');
    if (!root || !metrics) return;
    root.innerHTML = metrics.map(function (m) {
      return (
        '<div class="cin-metric cin-reveal' + toneClass(m.tone) + '">' +
        '<div class="m-label">' + esc(m.label) + '</div>' +
        '<div class="m-value">' + esc(m.value) + '</div>' +
        '<div class="m-unit">' + esc(m.unit || '') + '</div>' +
        '<div class="m-note">' + esc(m.note || '') + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderNow(items) {
    var root = document.getElementById('brief-now');
    if (!root || !items) return;
    root.innerHTML = items.map(function (it) {
      var href = it.page ? ('?load=' + encodeURIComponent(it.page)) : '#';
      if (window.location.pathname && window.location.pathname.indexOf('index.html') === -1 &&
          window === window.top) {
        href = it.page || '#';
      }
      var src = (it.sources || []).slice(0, 2).map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>';
      }).join(' · ');
      return (
        '<a class="cin-event cin-reveal" href="' + esc(href) + '">' +
        '<div class="ev-domain">' + esc(it.domain) + '</div>' +
        '<div>' +
        '<h3 class="ev-head">' + esc(it.headline) + '</h3>' +
        '<p class="ev-body">' + esc(it.body) + '</p>' +
        (src ? '<p class="cin-sources" style="margin-top:8px">' + src + '</p>' : '') +
        '</div>' +
        '<span class="ev-sev ' + esc(it.severity || '') + '">' + esc(it.severity || it.status || '') + '</span>' +
        '</a>'
      );
    }).join('');
  }

  function renderFuture(summary) {
    var root = document.getElementById('brief-future');
    if (!root || !summary) return;
    root.innerHTML = summary.map(function (h) {
      var lis = (h.items || []).map(function (i) {
        return '<li>' + esc(i) + '</li>';
      }).join('');
      return (
        '<div class="cin-horizon cin-reveal">' +
        '<div class="hz-label">' + esc(h.horizon) + '</div>' +
        '<ul>' + lis + '</ul>' +
        '</div>'
      );
    }).join('');
  }

  function renderCluster(cluster) {
    var root = document.getElementById('cluster-map');
    if (!root || !cluster) return;
    var points = cluster.points || [];
    root.innerHTML = points.map(function (p) {
      var primary = (p.status || '').toUpperCase() === 'PRIMARY';
      return (
        '<div class="cin-node cin-reveal' + (primary ? ' is-primary' : '') + '">' +
        '<div class="n-status">' + esc(p.status || 'OPEN') + '</div>' +
        '<div class="n-label">' + esc(p.label) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderPlansDetail(plans) {
    var root = document.getElementById('plans-detail');
    if (!root || !plans) return;
    var stated = plans.stated_plans || [];
    var inf = plans.inferred_trajectories || [];
    var html = '<div class="cin-stagger">';
    stated.forEach(function (p) {
      html +=
        '<article class="cin-sheet cin-reveal" style="margin-bottom:14px">' +
        '<div class="cin-kicker">' + esc(p.confidence) + ' · STATED</div>' +
        '<h3 class="cin-title" style="font-size:1.15rem">' + esc(p.label) + '</h3>' +
        '<p class="cin-deck" style="max-width:none;font-size:0.92rem"><strong>Near:</strong> ' + esc(p.near) + '</p>' +
        '<p class="cin-deck" style="max-width:none;font-size:0.92rem;margin-top:8px"><strong>Mid:</strong> ' + esc(p.mid) + '</p>' +
        '<p class="cin-deck" style="max-width:none;font-size:0.92rem;margin-top:8px"><strong>Long:</strong> ' + esc(p.long) + '</p>' +
        '<p class="cin-honest" style="margin-top:12px">Watch: ' + esc(p.watch || '') + '</p>' +
        '</article>';
    });
    inf.forEach(function (p) {
      html +=
        '<article class="cin-sheet cin-reveal" style="margin-bottom:14px;border-style:dashed">' +
        '<div class="cin-kicker">' + esc(p.confidence) + ' · INFERENCE</div>' +
        '<h3 class="cin-title" style="font-size:1.15rem">' + esc(p.label) + '</h3>' +
        '<p class="cin-deck" style="max-width:none;font-size:0.92rem">' + esc(p.claim) + '</p>' +
        '<p class="cin-deck" style="max-width:none;font-size:0.88rem;margin-top:8px"><strong>If true:</strong> ' + esc(p.if_true_then) + '</p>' +
        '<p class="cin-deck" style="max-width:none;font-size:0.88rem;margin-top:6px"><strong>Falsifiable by:</strong> ' + esc(p.falsifiable_by) + '</p>' +
        '</article>';
    });
    html += '</div>';
    root.innerHTML = html;
  }

  function setHero(data) {
    var t = document.getElementById('brief-title');
    var s = document.getElementById('brief-subtitle');
    var o = document.getElementById('brief-oneline');
    var th = document.getElementById('brief-threat');
    var d = document.getElementById('brief-date');
    if (t) t.textContent = data.title || 'Daily briefing';
    if (s) s.textContent = data.subtitle || '';
    if (o) o.textContent = data.one_line || '';
    if (th) th.textContent = 'Threat ' + (data.threat_level || '—');
    if (d) d.textContent = data.date || '';
    var note = document.getElementById('brief-honest');
    if (note && data.honest_note) note.textContent = data.honest_note;
  }

  function boot() {
    Promise.all([
      fetch('/data/govt_daily_briefing.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
      fetch('/data/govt_future_plans_map.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (pair) {
      var brief = pair[0];
      var plans = pair[1];
      setHero(brief);
      renderMetrics(brief.metrics);
      renderNow(brief.happening_now);
      renderFuture(brief.future_plans_summary);
      renderCluster(brief.cluster_map);
      if (plans) renderPlansDetail(plans);
      revealOnScroll();
    }).catch(function (err) {
      var root = document.getElementById('brief-now');
      if (root) {
        root.innerHTML = '<p class="cin-deck">Could not load briefing data. Check /data/govt_daily_briefing.json</p>';
      }
      console.warn('[daily-briefing]', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
