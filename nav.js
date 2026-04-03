/**
 * TENET5 Shared Navigation Component v2.0
 * Single source of truth for site navigation across all 34 pages.
 * Include this script in every page: <script src="nav.js"></script>
 * Place a <nav id="site-nav"></nav> element where the nav should appear.
 * 
 * LIRIL/SATOR: BUFFER gate — navigational routing for all content
 */
(function () {
  'use strict';

  const NAV_STRUCTURE = {
    brand: { label: 'TENET5', href: 'index.html' },
    primary: [
      { label: 'My Story', href: 'my-story.html' },
      { label: 'Evidence', href: 'evidence.html', class: 'nav-hot' }
    ],
    dropdowns: [
      {
        label: '🔍 Investigation',
        items: [
          { label: '🏛 Hansard Records', href: 'hansard-evidence.html' },
          { label: '⚠ The Pattern', href: 't4-comparison.html' },
          { label: '⚔ 5GW Subversion', href: '5gw-subversion.html' },
          { label: '☠ Harm Index', href: 'harm-index.html' },
          { label: '☠ Genocide Evidence', href: 'genocide-evidence.html' },
          { label: '🔍 Corruption Map', href: 'corruption-map.html' },
          { label: '🛰 OSINT Dashboard', href: 'osint-dashboard.html' },
          { label: '📊 Infographics', href: 'infographics.html' }
        ]
      },
      {
        label: '⚖ Accountability',
        items: [
          { label: '📋 The 504 Charges', href: 'accountability.html' },
          { label: '🏛 Treason Trajectory', href: 'treason-trajectory.html' },
          { label: '🕵 Investigation Board', href: 'conspiracy-board.html' },
          { label: '🗺 Foreign Influence', href: 'foreign-influence.html' },
          { label: '📅 Timeline', href: 'timeline.html' },
          { label: '🎖 CFNIS Investigation', href: 'cfnis.html' }
        ]
      },
      {
        label: '🎖 Military & Legal',
        items: [
          { label: '⚖ Legal Proceedings', href: 'legal.html' },
          { label: '⚔ Combat Law', href: 'combat-law.html' },
          { label: '🎖 Veterans', href: 'veterans.html' },
          { label: '📜 PPCLI Lawsuit', href: 'lawsuit-ppcli.html' },
          { label: '💰 Procurement Registry', href: 'procurement-registry.html' },
          { label: '📊 Procurement Analysis', href: 'procurement-analysis.html' },
          { label: '🥾 The Boot', href: 'the-boot.html' }
        ]
      },
      {
        label: '📚 Resources',
        items: [
          { label: '📢 Open Letter', href: 'open-letter.html' },
          { label: '📋 MP Briefing', href: 'mp-brief.html' },
          { label: '🛡 Whistleblower Guide', href: 'whistleblower-guide.html' },
          { label: '🔗 Wardoll Investigation', href: 'acelephius-wardoll.html' },
          { label: '📖 History', href: 'history.html' },
          { label: '❓ FAQ', href: 'faq.html' },
          { label: '📚 Resources', href: 'resources.html' }
        ]
      }
    ],
    tools: [
      { label: '🩸 PLAY FPS', href: 'red-duster-game.html', class: 'nav-hot', style: 'text-shadow:0 0 5px #ff2a2a;' },
      { label: '🦝 Bloggins', href: 'bloggins.html', class: 'nav-green' }
    ]
  };

  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  }

  function buildNav() {
    const currentPage = getCurrentPage();
    const nav = document.getElementById('site-nav') || document.querySelector('nav.site-nav');
    if (!nav) return;

    nav.className = 'site-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    let html = '';

    // Skip link
    html += '<a href="#main" class="skip-link">Skip to content</a>';
    
    // Brand
    html += `<a href="${NAV_STRUCTURE.brand.href}" class="brand">${NAV_STRUCTURE.brand.label}</a>`;

    // Mobile hamburger
    html += '<button class="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false">';
    html += '<span></span><span></span><span></span>';
    html += '</button>';

    // Nav content wrapper (for mobile collapse)
    html += '<div class="nav-content">';

    // Primary links
    html += '<div class="nav-group nav-primary">';
    NAV_STRUCTURE.primary.forEach(item => {
      const active = currentPage === item.href ? ' active' : '';
      const cls = item.class ? ` ${item.class}` : '';
      html += `<a href="${item.href}" class="${cls}${active}">${item.label}</a>`;
    });
    html += '</div>';

    // Dropdown groups
    NAV_STRUCTURE.dropdowns.forEach(dropdown => {
      const hasActivePage = dropdown.items.some(i => i.href === currentPage);
      html += '<div class="nav-group nav-dropdown-group">';
      html += `<button class="nav-more-btn${hasActivePage ? ' active-section' : ''}" aria-expanded="false" aria-haspopup="true">`;
      html += `${dropdown.label} <span class="chevron">▾</span></button>`;
      html += '<div class="nav-dropdown">';
      dropdown.items.forEach(item => {
        const active = currentPage === item.href ? ' class="active"' : '';
        html += `<a href="${item.href}"${active}>${item.label}</a>`;
      });
      html += '</div></div>';
    });

    // Tools
    html += '<div class="nav-group nav-tools">';
    NAV_STRUCTURE.tools.forEach(item => {
      const active = currentPage === item.href ? ' active' : '';
      const cls = item.class ? ` ${item.class}` : '';
      const style = item.style ? ` style="${item.style}"` : '';
      html += `<a href="${item.href}" class="${cls}${active}"${style}>${item.label}</a>`;
    });
    html += '</div>';

    html += '</div>'; // close nav-content

    nav.innerHTML = html;

    // Wire up dropdown toggles
    nav.querySelectorAll('.nav-more-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const expanded = this.getAttribute('aria-expanded') === 'true';
        
        // Close all other dropdowns
        nav.querySelectorAll('.nav-more-btn').forEach(b => {
          b.setAttribute('aria-expanded', 'false');
        });
        
        this.setAttribute('aria-expanded', !expanded);
      });
    });

    // Wire up hamburger
    const hamburger = nav.querySelector('.nav-hamburger');
    const navContent = nav.querySelector('.nav-content');
    if (hamburger && navContent) {
      hamburger.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        navContent.classList.toggle('nav-open', !expanded);
        this.classList.toggle('open', !expanded);
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      nav.querySelectorAll('.nav-more-btn').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
      });
    });

  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
