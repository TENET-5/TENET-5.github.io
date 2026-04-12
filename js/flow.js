/* ═══════════════════════════════════════════════════════
   Investigation Flow — Continuous navigation between pages
   TENET5 — The investigation never ends
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var INVESTIGATIONS = [
    { href: 'maid-accountability.html', num: '76,707', label: 'MAID Deaths' },
    { href: 's504-covey-bae.html', num: '28', label: 's.504 Counts' },
    { href: 'carney-conflicts.html', num: '$6.8M', label: 'Carney COI' },
    { href: 'foreign-interference.html', num: 'Hogue', label: 'Foreign Interference' },
    { href: 'arrivecan.html', num: '$93M', label: 'ArriveCAN' },
    { href: 'phoenix-pay.html', num: '$9.3B', label: 'Phoenix Pay' },
    { href: 'disability-genocide.html', num: 'CRPD', label: 'UN Convention' },
    { href: 'veterans-betrayal.html', num: 'VAC', label: 'Veterans' },
    { href: 'maid-voting-record.html', num: '173', label: 'MPs Who Voted' },
    { href: 'cfnis.html', num: 'CFNIS', label: 'Military Police' },
    { href: 'rcmp-commissioners.html', num: '4', label: 'RCMP Chiefs' },
    { href: 'follow-the-money.html', num: '$1.3T', label: 'Follow the Money' },
    { href: 'scandals.html', num: '11', label: 'Scandals' },
  ];

  document.addEventListener('DOMContentLoaded', function() {
    // Don't add to home.html (it has its own flow) or index.html (shell)
    var page = window.location.pathname.split('/').pop() || '';
    if (page === 'home.html' || page === 'index.html' || page === '') return;

    // Find the main content area
    var main = document.querySelector('main, .content, .container, article');
    if (!main) return;

    // Don't duplicate
    if (document.querySelector('.next-investigation')) return;

    // Build the flow section
    var section = document.createElement('div');
    section.className = 'next-investigation reveal';

    var h3 = document.createElement('h3');
    h3.textContent = 'Continue the Investigation';
    section.appendChild(h3);

    var grid = document.createElement('div');
    grid.className = 'flow-grid';

    // Filter out current page
    var currentPage = page;
    INVESTIGATIONS.forEach(function(inv) {
      if (inv.href === currentPage) return;

      var card = document.createElement('a');
      card.href = inv.href;
      card.className = 'flow-card';
      card.innerHTML = '<div class="flow-num">' + inv.num + '</div>' +
                       '<div class="flow-label">' + inv.label + '</div>';
      grid.appendChild(card);
    });

    section.appendChild(grid);

    // Insert before footer or at end of main
    var footer = document.querySelector('#site-footer-frame, .site-footer, #read-next');
    if (footer) {
      footer.parentNode.insertBefore(section, footer);
    } else {
      main.appendChild(section);
    }
  });
})();
