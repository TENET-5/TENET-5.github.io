/* ═══════════════════════════════════════════════════════
   TENET5 Unified Timeline — All investigations on one timeline
   Renders into #unified-timeline container
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var EVENTS = [
    { year: 2015, month: 2, title: 'Carter v. Canada', desc: 'Supreme Court strikes down ban on assisted dying', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2016, month: 2, title: 'Phoenix Pay Launches', desc: '$309M payroll system. Within weeks, tens of thousands unpaid.', link: 'phoenix-pay.html', cat: 'waste', color: '#f59e0b' },
    { year: 2016, month: 6, title: 'Bill C-14 Passes', desc: '186 YEA. MAID legalized. 1,018 deaths in first year.', link: 'maid-voting-record.html', cat: 'maid', color: '#dc2626' },
    { year: 2019, month: 9, title: 'Truchon v. AG', desc: 'Quebec court strikes "reasonably foreseeable death" requirement', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2020, month: 4, title: 'ArriveCAN Launches', desc: '$80K estimate. Will cost $93M.', link: 'arrivecan.html', cat: 'waste', color: '#f59e0b' },
    { year: 2021, month: 3, title: 'Bill C-7 Passes', desc: '180 YEA. MAID expanded to non-terminal. Track 2 begins.', link: 'maid-voting-record.html', cat: 'maid', color: '#dc2626' },
    { year: 2022, month: 11, title: 'Veterans Offered MAID', desc: 'Caseworker tells veteran "we can offer you MAID" instead of wheelchair ramp', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2023, month: 1, title: 'Hogue Commission Begins', desc: 'Public inquiry into foreign interference in federal elections', link: 'foreign-interference.html', cat: 'foreign', color: '#3b82f6' },
    { year: 2024, month: 6, title: 'FITAA Passes', desc: 'Foreign influence registry law. Still not active 658+ days later.', link: 'foreign-interference.html', cat: 'foreign', color: '#3b82f6' },
    { year: 2024, month: 0, title: 'ArriveCAN: $93M', desc: 'AG finds cost ballooned. 76% contractors did no work.', link: 'arrivecan.html', cat: 'waste', color: '#f59e0b' },
    { year: 2025, month: 1, title: 'Hogue Final Report', desc: 'PRC most active perpetrator. 51 recommendations. CIJA lobbied 56% of MPs.', link: 'foreign-interference.html', cat: 'foreign', color: '#3b82f6' },
    { year: 2025, month: 1, title: 'CFNIS Evidence Tampering', desc: 'Ontario Superior Court: "misconduct so egregious it shocks the conscience"', link: 'cfnis.html', cat: 'cfnis', color: '#a855f7' },
    { year: 2025, month: 9, title: 'RCMP Closes Police Stations Probe', desc: 'Chinese police stations investigation closed without charges', link: 'foreign-interference.html', cat: 'foreign', color: '#3b82f6' },
    { year: 2025, month: 11, title: '76,707 MAID Deaths', desc: 'Health Canada 6th Report. 16,499 in 2024. 5% of all deaths.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2025, month: 12, title: 'MWO Robar Arrested', desc: '7 charges. CAF intel member leaked to foreign entity.', link: 'cfnis.html', cat: 'cfnis', color: '#a855f7' },
    { year: 2026, month: 3, title: 'Col Smith Charged', desc: 'Commander Task Force Latvia removed from NATO command', link: 'cfnis.html', cat: 'cfnis', color: '#a855f7' },
    { year: 2026, month: 3, title: 'Bill C-25 Introduced', desc: 'Strong and Free Elections Act. Does NOT address military whistleblower protection.', link: 'foreign-interference.html', cat: 'foreign', color: '#3b82f6' },
    { year: 2026, month: 3, title: 'Phoenix: $9.3B Total', desc: 'AG confirms $4.2B replacement cost. 216K transactions backlogged.', link: 'phoenix-pay.html', cat: 'waste', color: '#f59e0b' },
    { year: 2026, month: 4, title: 's.504 Filed: 28 Counts', desc: 'Covey + Bae. Murder, mutiny, hate crime, obstruction.', link: 's504-covey-bae.html', cat: 'cfnis', color: '#a855f7' },
  ];

  var CAT_LABELS = { maid: 'MAID', waste: 'Gov. Waste', foreign: 'Foreign Int.', cfnis: 'CFNIS / 504' };

  window.TENET5_TIMELINE = {
    events: EVENTS,

    render: function(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      // Category filter
      var filterBar = document.createElement('div');
      filterBar.style.cssText = 'display:flex;gap:8px;margin-bottom:1.5rem;flex-wrap:wrap;';
      var activeFilter = 'all';

      function renderEvents() {
        // Clear existing events
        var existing = container.querySelectorAll('.tl-event');
        existing.forEach(function(e) { e.remove(); });

        EVENTS.forEach(function(ev, i) {
          if (activeFilter !== 'all' && ev.cat !== activeFilter) return;

          var item = document.createElement('a');
          item.href = ev.link;
          item.className = 'tl-event reveal';
          item.style.cssText = 'display:flex;gap:12px;text-decoration:none;padding:12px;margin:8px 0;' +
            'background:var(--bg-card,rgba(17,24,39,0.8));border-radius:8px;border-left:4px solid ' + ev.color + ';' +
            'transition:all 0.2s;';

          var date = document.createElement('div');
          date.style.cssText = 'min-width:60px;font-family:JetBrains Mono,monospace;font-size:0.75rem;color:' + ev.color + ';font-weight:700;padding-top:2px;';
          date.textContent = ev.year + (ev.month ? '-' + String(ev.month).padStart(2, '0') : '');

          var content = document.createElement('div');
          content.style.cssText = 'flex:1;';

          var title = document.createElement('div');
          title.style.cssText = 'font-weight:700;color:var(--text-primary,#e8e4dc);font-size:0.9rem;margin-bottom:2px;';
          title.textContent = ev.title;

          var desc = document.createElement('div');
          desc.style.cssText = 'font-size:0.78rem;color:var(--text-secondary,#b8b4aa);line-height:1.5;';
          desc.textContent = ev.desc;

          content.appendChild(title);
          content.appendChild(desc);
          item.appendChild(date);
          item.appendChild(content);
          container.appendChild(item);
        });
      }

      // Filter buttons
      ['all', 'maid', 'waste', 'foreign', 'cfnis'].forEach(function(cat) {
        var btn = document.createElement('button');
        btn.style.cssText = 'background:' + (cat === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent') +
          ';border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:4px 14px;font-size:0.72rem;' +
          'color:var(--text-secondary,#b8b4aa);cursor:pointer;font-family:Inter,sans-serif;transition:all 0.2s;';
        btn.textContent = cat === 'all' ? 'All' : CAT_LABELS[cat];
        btn.addEventListener('click', function() {
          activeFilter = cat;
          filterBar.querySelectorAll('button').forEach(function(b) {
            b.style.background = 'transparent';
          });
          btn.style.background = 'rgba(255,255,255,0.08)';
          renderEvents();
        });
        filterBar.appendChild(btn);
      });

      container.appendChild(filterBar);
      renderEvents();
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('unified-timeline')) {
      window.TENET5_TIMELINE.render('unified-timeline');
    }
  });
})();
