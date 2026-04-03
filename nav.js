/**
 * TENET5 Shared Navigation Component v3.0
 * Single source of truth for site navigation across all 34 pages.
 * Include this script in every page: <script src="nav.js?v=3"></script>
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

  const NAV_CSS = `
/* ── TENET5 NAV V3 INJECTED STYLES ── */
.site-nav-v3 {
  position: sticky;
  top: 0;
  z-index: 2147483647; /* Maximum possible z-index to stay above everything */
  background: rgba(5, 5, 6, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 2px solid rgba(196, 30, 58, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  box-sizing: border-box;
}

.site-nav-v3 * {
  box-sizing: border-box;
}

.site-nav-v3 .brand {
  font-weight: 900;
  color: #c41e3a !important;
  text-decoration: none;
  font-size: 1.1rem;
  letter-spacing: 2px;
  flex-shrink: 0;
  text-transform: uppercase;
}

.site-nav-v3 .nav-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: flex-end;
  height: 100%;
}

.site-nav-v3 .nav-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
}

.site-nav-v3 .nav-primary {
  margin-right: 1rem;
  border-right: 1px solid rgba(255,255,255,0.1);
  padding-right: 1rem;
}

.site-nav-v3 .nav-tools {
  margin-left: 1rem;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding-left: 1rem;
}

.site-nav-v3 a, .site-nav-v3 .nav-more-btn {
  color: #a0a0a6;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.site-nav-v3 a:hover, .site-nav-v3 .nav-more-btn:hover, .site-nav-v3 .nav-dropdown-group:hover .nav-more-btn {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.site-nav-v3 a.active, .site-nav-v3 .active-section {
  color: #fff;
  background: rgba(196, 30, 58, 0.2);
}

.site-nav-v3 .nav-hot { color: #ff6b6b !important; }
.site-nav-v3 .nav-green { color: #06d6a0 !important; }

/* Dropdown Logic - Native Hover for Desktop */
.site-nav-v3 .nav-dropdown-group {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.site-nav-v3 .nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0;
  background: #0a0c10;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid #c41e3a;
  border-radius: 0 0 4px 4px;
  display: none;
  flex-direction: column;
  min-width: 240px;
  padding: 0.5rem 0;
  box-shadow: 0 12px 40px rgba(0,0,0,0.9);
}

/* Hover activates dropdown securely on desktop */
@media (min-width: 1101px) {
  .site-nav-v3 .nav-dropdown-group:hover .nav-dropdown {
    display: flex;
  }
}

.site-nav-v3 .nav-more-btn[aria-expanded="true"] + .nav-dropdown {
  display: flex;
}

.site-nav-v3 .nav-dropdown a {
  padding: 0.75rem 1.2rem;
  border-radius: 0;
  width: 100%;
  justify-content: flex-start;
}

.site-nav-v3 .nav-dropdown a:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  padding-left: 1.5rem; /* Slide effect */
}

/* Mobile Hamburger */
.site-nav-v3 .nav-hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  width: 26px;
  height: 20px;
  padding: 0;
}

.site-nav-v3 .nav-hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background: #ededed;
  border-radius: 2px;
  transition: all 0.3s;
}

/* Mobile View */
@media (max-width: 1100px) {
  .site-nav-v3 .nav-hamburger {
    display: flex;
  }
  .site-nav-v3 .nav-content {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: #050506;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 2rem;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    height: auto;
  }
  .site-nav-v3 .nav-content.nav-open {
    display: flex;
  }
  .site-nav-v3 .nav-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin: 0 !important;
    border: none !important;
    padding: 0.5rem 0 !important;
    height: auto;
  }
  .site-nav-v3 .nav-dropdown {
    position: static;
    margin-top: 0;
    width: 100%;
    box-shadow: none;
    border: none;
    border-left: 2px solid rgba(255,255,255,0.1);
    background: transparent;
  }
  .site-nav-v3 .nav-more-btn {
    width: 100%;
    justify-content: space-between;
  }
  .site-nav-v3 a {
    width: 100%;
  }
}
  `;

  function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
  }

  function injectCSS() {
    if (document.getElementById('tenet5-nav-v3-css')) return;
    const style = document.createElement('style');
    style.id = 'tenet5-nav-v3-css';
    style.textContent = NAV_CSS;
    document.head.appendChild(style);
  }

  function buildNav() {
    injectCSS();

    const currentPage = getCurrentPage();
    const nav = document.getElementById('site-nav') || document.querySelector('nav.site-nav') || document.querySelector('nav.site-nav-v3');
    if (!nav) return;

    nav.className = 'site-nav-v3';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    let html = '';

    // Brand
    html += `<a href="${NAV_STRUCTURE.brand.href}" class="brand">${NAV_STRUCTURE.brand.label}</a>`;

    // Mobile hamburger
    html += '<button class="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false">';
    html += '<span></span><span></span><span></span>';
    html += '</button>';

    // Nav content wrapper
    html += '<div class="nav-content">';

    // Primary Links
    html += '<div class="nav-group nav-primary">';
    NAV_STRUCTURE.primary.forEach(item => {
      const active = currentPage === item.href ? ' active' : '';
      const cls = item.class ? ` ${item.class}` : '';
      html += `<a href="${item.href}" class="${cls}${active}">${item.label}</a>`;
    });
    html += '</div>';

    // Dropdowns
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
    html += '</div>'; // close .nav-content

    nav.innerHTML = html;

    // Mobile & Click Handlers
    nav.querySelectorAll('.nav-more-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        if (window.innerWidth > 1100) return; // Desktop uses CSS hover
        e.stopPropagation();
        const expanded = this.getAttribute('aria-expanded') === 'true';
        nav.querySelectorAll('.nav-more-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
        this.setAttribute('aria-expanded', !expanded);
      });
    });

    const hamburger = nav.querySelector('.nav-hamburger');
    const navContent = nav.querySelector('.nav-content');
    if (hamburger && navContent) {
      hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        navContent.classList.toggle('nav-open', !expanded);
        this.classList.toggle('open', !expanded);
      });
    }

    document.addEventListener('click', () => {
      nav.querySelectorAll('.nav-more-btn').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    });
  }

  // Load Nav
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
