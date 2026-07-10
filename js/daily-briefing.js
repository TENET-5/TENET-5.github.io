/**
 * TENET5 Daily Briefing — live data engine v3
 * Loads govt_daily_briefing.json + govt_future_plans_map.json
 * Renders §00 Happening Now, live metrics strip, threat pill, honest note.
 * Complements static scorecard/charts already in daily-briefing.html.
 */
(function () {
  'use strict';
  if (window.__TENET5_DAILY_BRIEFING_V3) return;
  window.__TENET5_DAILY_BRIEFING_V3 = true;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pageHref(page) {
    if (!page) return '#';
    /* Direct pages — product gateway index is NOT a ?load= shell anymore */
    return page;
  }

  function toneClass(t) {
    if (t === 'critical') return ' up';
    if (t === 'high') return ' flat';
    if (t === 'verified') return ' down';
    return ' flat';
  }

  function renderHappening(items) {
    var root = document.getElementById('happening-now');
    if (!root) return;
    if (!items || !items.length) {
      root.innerHTML = '<p style="color:#6a7f8c">No happening-now items in briefing data.</p>';
      return;
    }
    root.innerHTML = items.map(function (it) {
      var href = pageHref(it.page);
      var src = (it.sources || []).slice(0, 2).map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>';
      }).join(' · ');
      return (
        '<a class="happen-card" href="' + esc(href) + '">' +
          '<div class="happen-domain">' + esc(it.domain || '') + '</div>' +
          '<div>' +
            '<h3>' + esc(it.headline || '') + '</h3>' +
            '<p>' + esc(it.body || '') + '</p>' +
            (src ? '<div class="happen-src">' + src + '</div>' : '') +
          '</div>' +
          '<span class="happen-sev">' + esc(it.severity || it.status || '') + '</span>' +
        '</a>'
      );
    }).join('');
  }

  function renderLiveMetrics(metrics) {
    var root = document.getElementById('brief-metrics-live');
    if (!root || !metrics || !metrics.length) return;
    root.innerHTML = metrics.map(function (m) {
      return (
        '<div class="metric-card visible" data-anim="card">' +
          '<div class="metric-label">' + esc(m.label) + '</div>' +
          '<div class="metric-value" style="font-size:clamp(22px,3vw,34px)">' + esc(m.value) + '</div>' +
          '<span class="metric-delta' + toneClass(m.tone) + '">' + esc(m.unit || '') + '</span>' +
          '<div class="metric-source">' + esc(m.note || '') + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderFutureDetail(plans) {
    var host = document.getElementById('future-plans-detail');
    if (!host || !plans) return;
    var stated = plans.stated_plans || [];
    var inf = plans.inferred_trajectories || [];
    var html = '';
    stated.forEach(function (p) {
      html +=
        '<div class="conn-card visible" style="opacity:1;transform:none">' +
          '<div class="conn-label">STATED · ' + esc(p.confidence || '') + '</div>' +
          '<div class="conn-chain">' + esc(p.label) + '</div>' +
          '<div class="conn-detail"><strong>Near:</strong> ' + esc(p.near) + '</div>' +
          '<div class="conn-detail" style="margin-top:6px"><strong>Mid:</strong> ' + esc(p.mid) + '</div>' +
          '<div class="conn-detail" style="margin-top:6px"><strong>Long:</strong> ' + esc(p.long) + '</div>' +
          '<div class="conn-detail" style="margin-top:8px;color:#6a7f8c">Watch: ' + esc(p.watch || '') + '</div>' +
        '</div>';
    });
    inf.forEach(function (p) {
      html +=
        '<div class="conn-card visible" style="opacity:1;transform:none;border-style:dashed">' +
          '<div class="conn-label">INFERENCE · ' + esc(p.confidence || '') + '</div>' +
          '<div class="conn-chain">' + esc(p.label) + '</div>' +
          '<div class="conn-detail">' + esc(p.claim) + '</div>' +
          '<div class="conn-detail" style="margin-top:6px"><strong>If true:</strong> ' + esc(p.if_true_then) + '</div>' +
          '<div class="conn-detail" style="margin-top:6px"><strong>Falsifiable by:</strong> ' + esc(p.falsifiable_by) + '</div>' +
        '</div>';
    });
    host.innerHTML = html || '';
  }

  function applyHero(brief) {
    var t = document.getElementById('brief-title');
    var o = document.getElementById('brief-oneline');
    var h = document.getElementById('brief-honest');
    var thr = document.getElementById('threat-pill');
    if (t && brief.title) t.textContent = brief.title;
    if (o && brief.one_line) o.textContent = brief.one_line;
    if (h && brief.honest_note) h.textContent = brief.honest_note;
    if (thr && brief.threat_level) thr.textContent = 'Threat ' + String(brief.threat_level).toUpperCase();
  }

  function boot() {
    Promise.all([
      fetch('/data/govt_daily_briefing.json', { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('brief ' + r.status);
        return r.json();
      }),
      fetch('/data/govt_future_plans_map.json', { cache: 'no-cache' }).then(function (r) {
        return r.ok ? r.json() : null;
      }).catch(function () { return null; })
    ]).then(function (pair) {
      var brief = pair[0];
      var plans = pair[1];
      applyHero(brief);
      renderHappening(brief.happening_now);
      renderLiveMetrics(brief.metrics);
      if (plans) renderFutureDetail(plans);
    }).catch(function (err) {
      var root = document.getElementById('happening-now');
      if (root) {
        root.innerHTML =
          '<p style="color:#b0544a;font-size:14px">Could not load /data/govt_daily_briefing.json — static sections below still render. (' +
          esc(String(err && err.message || err)) + ')</p>';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
