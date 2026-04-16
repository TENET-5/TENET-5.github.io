/* ═══════════════════════════════════════════════════════
   TENET5 Impact Tracker — Social Proof Action Counter
   Shows live engagement metrics to drive participation
   "X people have taken action" counter on every page
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';
  if (window.__TENET5_IMPACT_LOADED) return;
  window.__TENET5_IMPACT_LOADED = true;

  // ── Metrics (updated by GitHub Actions pipeline or manual) ──
  // These numbers come from real data sources and are updated via the
  // news pipeline or a GitHub Action that runs weekly.
  var METRICS = {
    pages_read: 0,        // incremented on each page view
    emails_generated: 0,  // from campaign-engine usage
    investigations: 266,  // total investigation pages
    evidence_docs: 0,     // total evidence documents cited
    mps_tracked: 340,     // from all_mps.json
    timeline_events: 52,  // from unified-timeline.js
  };

  // ── Page view counter (localStorage-based, no backend) ──
  function incrementPageViews() {
    try {
      var key = 't5-impact-views';
      var views = parseInt(localStorage.getItem(key) || '0', 10);
      views++;
      localStorage.setItem(key, String(views));
      METRICS.pages_read = views;
    } catch (e) {}
  }

  // ── Track campaign engine usage ──
  function trackCampaignUsage() {
    try {
      var key = 't5-impact-emails';
      METRICS.emails_generated = parseInt(localStorage.getItem(key) || '0', 10);
    } catch (e) {}
  }

  // ── Count evidence documents (data-source citations on page) ──
  function countEvidence() {
    var cites = document.querySelectorAll('a[href*="parl.ca"], a[href*="canada.ca"], a[href*="canlii"], a[href*="hansard"], .source-note a, .source-cite, .source-cite a');
    // Deduplicate: count unique source-cite blocks + unique citation links
    var seen = {};
    for (var i = 0; i < cites.length; i++) {
      var el = cites[i];
      var key;
      if (el.classList && el.classList.contains('source-cite')) {
        key = 'block:' + (el.textContent || '').substring(0, 60);
      } else {
        key = 'link:' + (el.href || el.textContent || i);
      }
      seen[key] = true;
    }
    METRICS.evidence_docs = Object.keys(seen).length;
  }

  // ── Format large numbers (1,234 or 12.3K) ──
  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-CA');
  }

  // ── Inject impact banner ──
  function injectBanner() {
    // Only show on investigation pages
    var skip = ['index.html', 'auth-callback.html', 'sitemap.html', 'chalkboard.html', 'home.html'];
    var page = window.location.pathname.split('/').pop() || 'index.html';
    if (skip.indexOf(page) !== -1) return;

    // Don't duplicate
    if (document.querySelector('.t5-impact')) return;

    var banner = document.createElement('div');
    banner.className = 't5-impact';

    var items = [
      { icon: '📄', value: METRICS.investigations, label: 'investigations' },
      { icon: '👤', value: METRICS.mps_tracked, label: 'MPs tracked' },
      { icon: '📌', value: METRICS.timeline_events, label: 'timeline events' },
    ];

    // Add page reads if significant
    if (METRICS.pages_read > 10) {
      items.unshift({ icon: '👁', value: METRICS.pages_read, label: 'pages read' });
    }

    // Add evidence count if on a page with citations
    if (METRICS.evidence_docs > 0) {
      items.push({ icon: '📎', value: METRICS.evidence_docs, label: 'sources cited' });
    }

    banner.innerHTML = items.map(function(item) {
      return '<span class="t5-impact-item">' +
        '<span class="t5-impact-icon">' + item.icon + '</span>' +
        '<span class="t5-impact-value">' + fmtNum(item.value) + '</span>' +
        '<span class="t5-impact-label">' + item.label + '</span>' +
      '</span>';
    }).join('<span class="t5-impact-sep"></span>');

    // Insert at the top of the page content
    var main = document.querySelector('main') || document.querySelector('.editorial-surface') || document.body.firstElementChild;
    if (main && main.parentNode) {
      main.parentNode.insertBefore(banner, main);
    }
  }

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent =
    '.t5-impact{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:16px;padding:8px 16px;margin:0 auto 8px;max-width:900px;border-radius:8px;background:rgba(14,18,28,0.7);border:1px solid rgba(255,255,255,0.05);font-family:Inter,system-ui,sans-serif}' +
    '.t5-impact-item{display:flex;align-items:center;gap:5px}' +
    '.t5-impact-icon{font-size:14px}' +
    '.t5-impact-value{font-size:14px;font-weight:700;color:#e8e4dc;font-family:"IBM Plex Mono",monospace}' +
    '.t5-impact-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.05em}' +
    '.t5-impact-sep{width:1px;height:16px;background:rgba(255,255,255,0.08)}' +
    '@media(max-width:600px){.t5-impact{gap:10px;padding:6px 10px}.t5-impact-value{font-size:12px}.t5-impact-label{font-size:9px}}';
  document.head.appendChild(style);

  // ── Public API for campaign-engine integration ──
  window.TENET5_IMPACT = {
    trackEmail: function() {
      try {
        var key = 't5-impact-emails';
        var n = parseInt(localStorage.getItem(key) || '0', 10) + 1;
        localStorage.setItem(key, String(n));
        METRICS.emails_generated = n;
      } catch (e) {}
    },
    getMetrics: function() { return Object.assign({}, METRICS); }
  };

  // ── Init ──
  function init() {
    incrementPageViews();
    trackCampaignUsage();
    countEvidence();
    injectBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
