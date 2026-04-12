/* ═══════════════════════════════════════════════════════
   TENET5 Voting Visualization — Party breakdown of MAID votes
   Renders into #voting-party-chart container
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var VOTE_DATA = {
    'C-14 (2016)': {
      total_yea: 186,
      total_nay: 137,
      parties: {
        'Liberal': { yea: 172, color: '#dc2626' },
        'Conservative': { yea: 14, color: '#f59e0b' },
      }
    },
    'C-7 (2021)': {
      total_yea: 180,
      total_nay: 149,
      parties: {
        'Liberal': { yea: 144, color: '#dc2626' },
        'Bloc': { yea: 30, color: '#3b82f6' },
        'Independent': { yea: 3, color: '#6b7280' },
        'Green': { yea: 1, color: '#22c55e' },
        'NDP': { yea: 2, color: '#f97316' },
      }
    },
    'Both Bills': {
      total: 109,
      still_serving: 46,
      foreign_born: 31,
    }
  };

  window.TENET5_VOTING_VIZ = {
    data: VOTE_DATA,

    renderPartyBreakdown: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      ['C-14 (2016)', 'C-7 (2021)'].forEach(function(bill) {
        var d = VOTE_DATA[bill];

        var section = document.createElement('div');
        section.className = 'reveal';
        section.style.cssText = 'margin-bottom:1.5rem;';

        var title = document.createElement('div');
        title.style.cssText = 'font-family:Playfair Display,Georgia,serif;font-size:1.1rem;color:var(--text-primary,#e8e4dc);margin-bottom:8px;font-weight:700;';
        title.textContent = bill + ' — ' + d.total_yea + ' YEA / ' + d.total_nay + ' NAY';
        section.appendChild(title);

        // Stacked bar
        var barWrap = document.createElement('div');
        barWrap.style.cssText = 'display:flex;height:36px;border-radius:6px;overflow:hidden;margin-bottom:4px;';

        var totalYea = d.total_yea;
        Object.entries(d.parties).forEach(function(entry) {
          var party = entry[0];
          var info = entry[1];
          var pct = (info.yea / totalYea) * 100;

          var seg = document.createElement('div');
          seg.style.cssText = 'height:100%;background:' + info.color + ';display:flex;align-items:center;justify-content:center;' +
            'width:' + pct + '%;min-width:' + (pct > 5 ? '0' : '20px') + ';transition:width 1s cubic-bezier(0.16,1,0.3,1);';
          seg.title = party + ': ' + info.yea + ' YEA (' + pct.toFixed(0) + '%)';

          if (pct > 8) {
            var label = document.createElement('span');
            label.style.cssText = 'font-size:0.65rem;color:white;font-weight:700;white-space:nowrap;';
            label.textContent = party + ' ' + info.yea;
            seg.appendChild(label);
          }

          barWrap.appendChild(seg);
        });

        // NAY portion
        var nayPct = (d.total_nay / (d.total_yea + d.total_nay)) * 100;
        var naySeg = document.createElement('div');
        naySeg.style.cssText = 'height:100%;background:rgba(255,255,255,0.06);width:' + nayPct + '%;display:flex;align-items:center;justify-content:center;';
        var nayLabel = document.createElement('span');
        nayLabel.style.cssText = 'font-size:0.65rem;color:var(--text-tertiary,#7a776e);font-weight:600;';
        nayLabel.textContent = 'NAY ' + d.total_nay;
        naySeg.appendChild(nayLabel);
        barWrap.appendChild(naySeg);

        section.appendChild(barWrap);
        container.appendChild(section);
      });

      // Both bills summary
      var both = VOTE_DATA['Both Bills'];
      var summary = document.createElement('div');
      summary.className = 'reveal';
      summary.style.cssText = 'display:flex;gap:12px;margin-top:1rem;';

      [
        { num: both.total, label: 'Voted BOTH', color: 'var(--accent,#b91c1c)' },
        { num: both.still_serving, label: 'Still Serving', color: '#f59e0b' },
        { num: both.foreign_born, label: 'Foreign-Born', color: '#3b82f6' },
      ].forEach(function(stat) {
        var card = document.createElement('div');
        card.style.cssText = 'flex:1;text-align:center;background:var(--bg-card,rgba(17,24,39,0.8));border-radius:8px;padding:12px;border-top:3px solid ' + stat.color + ';';
        card.innerHTML = '<div style="font-size:1.5rem;font-weight:900;color:' + stat.color + ';font-family:Playfair Display,serif;">' + stat.num + '</div>' +
          '<div style="font-size:0.65rem;color:var(--text-tertiary,#7a776e);text-transform:uppercase;">' + stat.label + '</div>';
        summary.appendChild(card);
      });

      container.appendChild(summary);

      var src = document.createElement('div');
      src.style.cssText = 'font-size:0.65rem;color:var(--text-quaternary,#504e48);text-align:center;margin-top:8px;font-style:italic;';
      src.textContent = 'Source: ourcommons.ca official vote records. Health Canada 6th Annual Report.';
      container.appendChild(src);
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('voting-party-chart')) {
      window.TENET5_VOTING_VIZ.renderPartyBreakdown('voting-party-chart');
    }
  });
})();
