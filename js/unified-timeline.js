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
    { year: 2025, month: 3, title: 'PM Carney Takes Office', desc: '500+ companies in blind trust. $6.8M Brookfield options. Democracy Watch: as many conflicts as Trump.', link: 'carney-conflicts.html', cat: 'waste', color: '#f59e0b' },
    { year: 2025, month: 6, title: 'ArriveCAN $64M Recovery Vote', desc: 'Parliament votes 172-165 to recover money. Every Liberal MP votes AGAINST.', link: 'arrivecan.html', cat: 'waste', color: '#f59e0b' },
    { year: 2020, month: 10, title: 'PBO: MAID Saves $149M/Year', desc: 'Parliamentary Budget Officer publishes cost estimate BEFORE C-7 expansion vote. Projected $1.273 TRILLION by 2047.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2025, month: 7, title: 'Carney Assets: 500+ Companies', desc: 'Ethics commissioner reveals PM holds 500+ companies in blind trust. $6.8M Brookfield options. Brookfield owns seniors housing globally.', link: 'carney-conflicts.html', cat: 'waste', color: '#f59e0b' },
    { year: 2025, month: 3, title: 'UN: Repeal Track 2', desc: 'UN Committee on Rights of Persons with Disabilities calls on Canada to repeal Track 2 entirely. "Extreme concern." Canada: no plans to act.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2026, month: 1, title: 'Charter Challenge: Religious Hospitals', desc: 'B.C. Supreme Court hears challenge to Catholic hospitals refusing MAID. Sam O\'Neill (34, terminal) forced to transfer from St. Paul\'s.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2026, month: 3, title: 'Alberta Bill 18: Block MAID Expansion', desc: 'Alberta legislates to prohibit MAID for mental illness. Limits eligibility to patients likely to die within 12 months.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2026, month: 3, title: 'Bill C-218: Permanent Block', desc: 'Conservative MP Ed Fast introduces bill to permanently block MAID expansion to mental illness. 10 provinces oppose expansion.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2026, month: 4, title: '$51B Build Communities Strong', desc: 'PM Carney launches $51B infrastructure fund covering same sectors as Brookfield\'s Maple Fund pitch. No direct allocation to Brookfield identified.', link: 'carney-conflicts.html', cat: 'waste', color: '#f59e0b' },
    { year: 2025, month: 1, title: 'Hogue Final Report: 51 Recommendations', desc: 'Foreign Interference Commission: govt acted "too slowly", "insufficiently transparent". No traitors but "troubling" conduct. One-year progress report required.', link: 'foreign-interference.html', cat: 'foreign', color: '#60a5fa' },
    { year: 2025, month: 9, title: 'RCMP Closes Chinese Police Stations Case', desc: 'Montreal investigation closed WITHOUT charges. Community orgs file $4.9M defamation lawsuit against RCMP. Lost 70% of funding.', link: 'foreign-interference.html', cat: 'foreign', color: '#60a5fa' },
    { year: 2025, month: 4, title: 'Quebec: 7.9% MAID Rate — World Record', desc: 'Over 6,000 MAID deaths in one year. 7.9% of all Quebec deaths. Instructed prosecutors not to charge for advance requests — ahead of federal law.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2024, month: 1, title: '10 Provinces Demand MAID Pause', desc: 'BC, ON, AB, SK, NB, PEI, NS, NU, NT, YT sign joint letter. Quebec, Manitoba, NL refuse. Federal government sets March 2027 regardless.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
    { year: 2026, month: 4, title: 'Fox Ethics Breach — Then Promoted by Carney', desc: 'Ethics Commissioner finds DM Christiane Fox breached COI Act at IRCC. Carney already appointed her top DND civilian role in Dec 2025.', link: 'carney-conflicts.html', cat: 'waste', color: '#f59e0b' },
    { year: 2026, month: 3, title: 'Indigenous Procurement Fraud Exposed', desc: 'Procurement Ombudsman: non-Indigenous businesses using Indigenous shell companies to access set-aside contracts. Reform delayed to 2028.', link: 'scandals.html', cat: 'waste', color: '#f59e0b' },
    { year: 2026, month: 3, title: 'Nijjar: Indian Consular Staff Assisted', desc: 'Globe and Mail: Indian consular staff in Vancouver supplied information assisting Nijjar assassination. Carney visits Modi, draws Sikh backlash.', link: 'foreign-interference.html', cat: 'foreign', color: '#60a5fa' },
    { year: 2024, month: 7, title: 'CDS Carignan Appointed', desc: 'Gen Jennie Carignan becomes first female CDS. CAF at lowest strength in decades. AG flags recruiting failures. DM Fox (COI breach) appointed Dec 2025.', link: 'cds-accountability.html', cat: 'cfnis', color: '#a855f7' },
    { year: 2026, month: 4, title: 'CDS Accountability Investigation Opened', desc: 'TENET5 investigation into CDS record: recruitment crisis, digital battle space surrender, foreign military access, compromised DND command chain. Criminal Code + NDA charges framework documented.', link: 'cds-accountability.html', cat: 'cfnis', color: '#a855f7' },
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
