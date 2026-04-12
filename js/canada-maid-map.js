/* ═══════════════════════════════════════════════════════
   TENET5 Canada MAID Map — Interactive provincial death rates
   Hover/click provinces to see MAID statistics
   SEED 118400 | Data: Health Canada 6th Annual Report
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var PROVINCES = {
    'QC': { name: 'Quebec', deaths: 5998, pct: 36.4, rate: 67, color: '#dc2626' },
    'ON': { name: 'Ontario', deaths: 4944, pct: 30.0, rate: 0, color: '#ef4444' },
    'BC': { name: 'British Columbia', deaths: 2997, pct: 18.2, rate: 53, color: '#f87171' },
    'AB': { name: 'Alberta', deaths: 1100, pct: 6.7, rate: 24, color: '#fca5a5' },
    'NS': { name: 'Nova Scotia', deaths: 450, pct: 2.7, rate: 41, color: '#f87171' },
    'MB': { name: 'Manitoba', deaths: 280, pct: 1.7, rate: 19, color: '#fecaca' },
    'SK': { name: 'Saskatchewan', deaths: 250, pct: 1.5, rate: 21, color: '#fecaca' },
    'NB': { name: 'New Brunswick', deaths: 220, pct: 1.3, rate: 26, color: '#fecaca' },
    'NL': { name: 'Newfoundland', deaths: 130, pct: 0.8, rate: 25, color: '#fecaca' },
    'PE': { name: 'PEI', deaths: 40, pct: 0.2, rate: 24, color: '#fee2e2' },
  };

  window.TENET5_MAID_MAP = {
    provinces: PROVINCES,
    total: 76707,
    year: 2024,
    source: 'Health Canada 6th Annual Report (Nov 2025)',

    // Render a simple bar chart into a container
    renderBars: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';
      container.style.cssText = 'max-width:700px;margin:0 auto;';

      var sorted = Object.entries(PROVINCES).sort(function(a, b) {
        return b[1].deaths - a[1].deaths;
      });

      var maxDeaths = sorted[0][1].deaths;

      sorted.forEach(function(entry) {
        var code = entry[0];
        var prov = entry[1];
        var pct = (prov.deaths / maxDeaths) * 100;

        var row = document.createElement('div');
        row.className = 'reveal';
        row.style.cssText = 'display:flex;align-items:center;gap:8px;margin:6px 0;cursor:pointer;';
        row.title = prov.name + ': ' + prov.deaths.toLocaleString() + ' deaths (' + prov.pct + '%)' +
                    (prov.rate ? ' — ' + prov.rate + ' per 100,000' : '');

        var label = document.createElement('span');
        label.style.cssText = 'width:30px;font-size:0.75rem;color:var(--text-tertiary,#7a776e);text-align:right;font-family:JetBrains Mono,monospace;';
        label.textContent = code;

        var barWrap = document.createElement('div');
        barWrap.style.cssText = 'flex:1;background:var(--bg-card,rgba(17,24,39,0.8));border-radius:4px;overflow:hidden;height:28px;';

        var bar = document.createElement('div');
        bar.style.cssText = 'width:' + pct + '%;height:100%;background:' + prov.color +
          ';border-radius:4px;display:flex;align-items:center;padding-left:8px;transition:width 1s cubic-bezier(0.16,1,0.3,1);';

        var barText = document.createElement('span');
        barText.style.cssText = 'font-size:0.7rem;color:white;font-weight:700;white-space:nowrap;';
        barText.textContent = prov.deaths.toLocaleString() + ' (' + prov.pct + '%)';

        var rateSpan = document.createElement('span');
        rateSpan.style.cssText = 'font-size:0.65rem;color:var(--text-quaternary,#504e48);margin-left:auto;padding-right:8px;';
        rateSpan.textContent = prov.rate ? prov.rate + '/100K' : '';

        bar.appendChild(barText);
        barWrap.appendChild(bar);
        row.appendChild(label);
        row.appendChild(barWrap);
        row.appendChild(rateSpan);
        container.appendChild(row);
      });

      // Source
      var src = document.createElement('div');
      src.style.cssText = 'font-size:0.65rem;color:var(--text-quaternary,#504e48);text-align:center;margin-top:8px;font-style:italic;';
      src.textContent = 'Source: Health Canada 6th Annual Report on MAID (Nov 2025). Approximate provincial breakdown.';
      container.appendChild(src);
    }
  };

  // Auto-render if a container exists
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('maid-province-chart')) {
      window.TENET5_MAID_MAP.renderBars('maid-province-chart');
    }
  });
})();
