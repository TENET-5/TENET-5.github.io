/**
 * TENET5 Shared Navigation Component v4.0
 * Redesigned for easier navigation across 35+ pages.
 * 
 * Features:
 *  - Persistent sidebar mega-menu on desktop (triggered by hamburger)
 *  - Categorized page sections with visual hierarchy
 *  - Breadcrumb-style current page indicator
 *  - Search shortcut
 *  - "You Are Here" active page highlighting
 *  - Smooth slide-in animation
 *  - Full mobile-first responsive
 *
 * Include this script in every page: <script src="nav.js?v=7"></script>
 * Place a <nav id="site-nav"></nav> element where the nav should appear.
 *
 * LIRIL/SATOR: BUFFER gate — navigational routing for all content
 */
(function () {
  'use strict';

  // ── COMPLETE SITE MAP ──
  const SITEMAP = [
    {
      section: 'Core Investigation',
      icon: '🕵',
      items: [
        { label: 'Investigation Board', href: 'conspiracy-board.html', desc: 'Node graph of influence networks' },
        { label: 'OSINT Dashboard', href: 'osint-dashboard.html', desc: 'Aggregated intelligence data' },
        { label: 'Network Analysis', href: 'network-analysis.html', desc: 'Cross-referenced topology', hot: true },
        { label: 'Dossier Viewer', href: 'dossier-viewer.html', desc: 'Generated intelligence dossiers', hot: true },
        { label: 'Evidence Archive', href: 'evidence.html', desc: 'Complete evidence repository' },
      ]
    },
    {
      section: 'The Harm',
      icon: '🩸',
      items: [
        { label: 'The 504 Charges', href: 'accountability.html', desc: 'Criminal accountability database' },
        { label: 'Criminal Code Analysis', href: 'criminal-code-analysis.html', desc: '50 findings mapped to CC sections', hot: true },
        { label: 'Genocide Evidence', href: 'genocide-evidence.html', desc: 'Pattern documentation' },
        { label: 'Policy Harm Index', href: 'harm-index.html', desc: 'Quantified policy damage' },
        { label: 'The Pattern (T4)', href: 't4-comparison.html', desc: 'Historical comparison' },
        { label: 'The Boot', href: 'the-boot.html', desc: 'Institutional mechanics' },
      ]
    },
    {
      section: 'Follow the Money',
      icon: '💰',
      items: [
        { label: 'Cross-Reference Engine', href: 'cross-reference.html', desc: 'Lobbying vs. voting correlation' },
        { label: 'Foreign Influence', href: 'foreign-influence.html', desc: 'CIJA, CCP, UFWD pipelines' },
        { label: 'Procurement Analysis', href: 'procurement-analysis.html', desc: 'Contract anomalies' },
        { label: 'Procurement Deep Dive', href: 'procurement-deep-dive.html', desc: '1.26M contracts, 70K anomalies', hot: true },
        { label: 'Procurement Registry', href: 'procurement-registry.html', desc: 'Full contract database' },
        { label: 'Contributions Tracker', href: 'contributions-tracker.html', desc: 'Political donations' },
        { label: 'Lobbying Tracker', href: 'lobbying-tracker.html', desc: 'Registered lobbying data' },
        { label: 'Corruption Map', href: 'corruption-map.html', desc: 'Documented failures' },
        { label: 'Charity Pipeline', href: 'charity-pipeline.html', desc: 'Charity fund routing' },
      ]
    },
    {
      section: 'Parliament',
      icon: '🏛',
      items: [
        { label: 'Treason Trajectory', href: 'treason-trajectory.html', desc: '81 years of pattern' },
        { label: '5GW Subversion', href: '5gw-subversion.html', desc: 'Fifth-generation warfare' },
        { label: 'Hansard Dashboard', href: 'hansard-dashboard.html', desc: 'Debate analysis' },
        { label: 'Hansard Evidence', href: 'hansard-evidence.html', desc: 'Parliamentary records' },
        { label: 'Voting Records', href: 'voting-records.html', desc: 'MP voting patterns' },
        { label: 'Infographics', href: 'infographics.html', desc: 'Visual data presentations' },
      ]
    },
    {
      section: 'Military & Legal',
      icon: '🎖',
      items: [
        { label: 'PPCLI Lawsuit', href: 'lawsuit-ppcli.html', desc: 'Active legal proceedings' },
        { label: 'CFNIS Investigation', href: 'cfnis.html', desc: 'Military police misconduct' },
        { label: 'Legal Proceedings', href: 'legal.html', desc: 'Full legal framework' },
        { label: 'Veterans Support', href: 'veterans.html', desc: 'Veteran community resources' },
        { label: 'Whistleblower Guide', href: 'whistleblower-guide.html', desc: 'Protected disclosure' },
        { label: 'Acelephius Report', href: 'acelephius-report.html', desc: 'Intelligence assessment' },
      ]
    },
    {
      section: 'About & Action',
      icon: '📖',
      items: [
        { label: 'My Story', href: 'my-story.html', desc: 'Daniel Perry\'s account' },
        { label: 'Open Letter to MPs', href: 'open-letter.html', desc: 'Direct address to parliament' },
        { label: 'MP Briefing', href: 'mp-brief.html', desc: 'Concise brief for MPs' },
        { label: 'Master Timeline', href: 'timeline.html', desc: '81 years documented' },
        { label: 'FAQ & History', href: 'history.html', desc: 'Common questions' },
        { label: 'Resources', href: 'resources.html', desc: 'External reference links' },
      ]
    },
    {
      section: 'Apps',
      icon: '🎮',
      items: [
        { label: 'Red Duster FPS', href: 'red-duster-game.html', desc: 'Tactical simulator', special: 'game' },
        { label: 'Bloggins', href: 'bloggins.html', desc: 'Raccoon intelligence AI', special: 'green' },
        { label: 'LIRIL (AI)', href: 'liril.html', desc: "Daniel Perry's private AI system", hot: true },
        { label: 'Search', href: 'search.html', desc: 'Full-site search' },
      ]
    },
    {
      section: 'Community',
      icon: '💬',
      items: [
        { label: 'Live Chat', href: 'chat.html', desc: 'Real-time discussion', hot: true },
        { label: 'AI Research', href: 'chat.html#ai', desc: 'Gemini-powered analysis', hot: true },
        { label: 'News Intelligence', href: 'news.html', desc: 'Canadian news aggregation', hot: true },
      ]
    },
    {
      section: 'Municipal',
      icon: '🏛️',
      items: [
        { label: 'Municipal Hub', href: 'municipal-accountability.html', desc: 'All municipalities', hot: true },
        { label: 'Ottawa', href: 'ottawa.html', desc: 'LRT scandal, Lansdowne 2.0', hot: true },
        { label: 'Toronto', href: 'toronto.html', desc: 'Eglinton LRT, Gardiner', hot: true },
        { label: 'Vancouver', href: 'vancouver.html', desc: 'Housing, money laundering', hot: true },
        { label: 'Calgary', href: 'calgary.html', desc: 'Green Line, arena deal', hot: true },
        { label: 'Belleville', href: 'municipal-accountability.html?city=belleville', desc: 'City of Belleville' },
        { label: 'Quinte West', href: 'municipal-accountability.html?city=quinte-west', desc: 'City of Quinte West' },
      ]
    },
  ];

  function getCurrentPage() {
    var path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
  }

  function getCurrentSection(page) {
    for (var i = 0; i < SITEMAP.length; i++) {
      for (var j = 0; j < SITEMAP[i].items.length; j++) {
        if (SITEMAP[i].items[j].href === page) {
          return SITEMAP[i].section;
        }
      }
    }
    return null;
  }

  function buildNav() {
    // Prevent double-init
    if (document.getElementById('t5-nav-v4-css')) return;

    var currentPage = getCurrentPage();
    var currentSection = getCurrentSection(currentPage);

    // Inject CSS
    var style = document.createElement('style');
    style.id = 't5-nav-v4-css';
    style.textContent = NAV_CSS;
    document.head.appendChild(style);

    var nav = document.getElementById('site-nav') || document.querySelector('nav');
    if (!nav) return;

    nav.className = 't5-topbar';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    // ── TOP BAR ──
    var html = '';
    html += '<a href="index.html" class="t5-brand">TENET5</a>';

    // Quick links (visible on desktop)
    html += '<div class="t5-quick">';
    html += '<a href="conspiracy-board.html"' + (currentPage === 'conspiracy-board.html' ? ' class="active"' : '') + '>Investigation</a>';
    html += '<a href="osint-dashboard.html"' + (currentPage === 'osint-dashboard.html' ? ' class="active"' : '') + '>OSINT</a>';
    html += '<a href="evidence.html"' + (currentPage === 'evidence.html' ? ' class="active"' : '') + '>Evidence</a>';
    html += '<a href="foreign-influence.html"' + (currentPage === 'foreign-influence.html' ? ' class="active"' : '') + '>Influence</a>';
    html += '<a href="my-story.html"' + (currentPage === 'my-story.html' ? ' class="active"' : '') + '>My Story</a>';
    html += '</div>';

    // Auth container (populated by auth-ui.js)
    html += '<div id="auth-container" class="t5-auth"></div>';

    // Right side: search + menu button
    html += '<div class="t5-right">';
    html += '<a href="search.html" class="t5-search-btn" title="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></a>';
    html += '<button class="t5-menu-btn" aria-label="Open site menu" aria-expanded="false">';
    html += '<span></span><span></span><span></span>';
    html += '</button>';
    html += '</div>';

    // ── SLIDE-OUT MEGA MENU ──
    html += '<div class="t5-mega" aria-hidden="true">';
    html += '<div class="t5-mega-scroll">';

    // Current page indicator
    if (currentSection) {
      html += '<div class="t5-youarehere">';
      html += '<span class="t5-yah-label">You are here</span>';
      html += '<span class="t5-yah-crumb">' + currentSection + ' → <strong>' + getPageLabel(currentPage) + '</strong></span>';
      html += '</div>';
    }

    // Sections
    for (var s = 0; s < SITEMAP.length; s++) {
      var sec = SITEMAP[s];
      html += '<div class="t5-mega-section">';
      html += '<h3 class="t5-mega-heading">' + sec.icon + ' ' + sec.section + '</h3>';
      html += '<div class="t5-mega-items">';
      for (var i = 0; i < sec.items.length; i++) {
        var item = sec.items[i];
        var cls = 't5-mega-link';
        if (item.href === currentPage) cls += ' active';
        if (item.hot) cls += ' hot';
        if (item.special === 'game') cls += ' game';
        if (item.special === 'green') cls += ' green';
        html += '<a href="' + item.href + '" class="' + cls + '">';
        html += '<span class="t5-ml-name">' + item.label + '</span>';
        html += '<span class="t5-ml-desc">' + item.desc + '</span>';
        html += '</a>';
      }
      html += '</div></div>';
    }

    html += '</div></div>'; // close mega-scroll + mega
    html += '<div class="t5-overlay"></div>';

    nav.innerHTML = html;

    // ── EVENT HANDLERS ──
    var menuBtn = nav.querySelector('.t5-menu-btn');
    var mega = nav.querySelector('.t5-mega');
    var overlay = nav.querySelector('.t5-overlay');
    var isOpen = false;

    function toggleMenu(forceClose) {
      isOpen = forceClose ? false : !isOpen;
      mega.classList.toggle('open', isOpen);
      overlay.classList.toggle('open', isOpen);
      menuBtn.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen);
      mega.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    menuBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleMenu(); });
    overlay.addEventListener('click', function() { toggleMenu(true); });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) toggleMenu(true);
    });

    // Close on link click
    mega.querySelectorAll('.t5-mega-link').forEach(function(link) {
      link.addEventListener('click', function() { toggleMenu(true); });
    });
  }

  function getPageLabel(page) {
    for (var s = 0; s < SITEMAP.length; s++) {
      for (var i = 0; i < SITEMAP[s].items.length; i++) {
        if (SITEMAP[s].items[i].href === page) return SITEMAP[s].items[i].label;
      }
    }
    return page.replace('.html', '').replace(/-/g, ' ');
  }

  // ── STYLES ──
  var NAV_CSS = '\
/* ══════════════════════════════════════════════ */\
/*  TENET5 NAV V4 — TOPBAR + MEGA MENU          */\
/* ══════════════════════════════════════════════ */\
\
.t5-topbar {\
  position: sticky;\
  top: 0;\
  z-index: 2147483647;\
  background: rgba(5,5,6,0.92);\
  backdrop-filter: blur(20px);\
  -webkit-backdrop-filter: blur(20px);\
  border-bottom: 1px solid rgba(255,255,255,0.06);\
  display: flex;\
  align-items: center;\
  justify-content: space-between;\
  padding: 0 clamp(16px, 3vw, 40px);\
  height: 56px;\
  font-family: "JetBrains Mono", "SF Mono", monospace;\
  font-size: 0.78rem;\
  box-sizing: border-box;\
}\
.t5-topbar *, .t5-topbar *::before, .t5-topbar *::after { box-sizing: border-box; }\
\
/* Brand */\
.t5-brand {\
  font-weight: 800;\
  color: #c41e3a !important;\
  text-decoration: none !important;\
  font-size: 1rem;\
  letter-spacing: 3px;\
  text-transform: uppercase;\
  flex-shrink: 0;\
  transition: color 0.2s;\
}\
.t5-brand:hover { color: #e53555 !important; }\
\
/* Quick links – desktop only */\
.t5-quick {\
  display: flex;\
  align-items: center;\
  gap: 2px;\
  margin-left: clamp(16px, 3vw, 40px);\
}\
.t5-quick a {\
  color: #6e6e76 !important;\
  text-decoration: none !important;\
  padding: 6px 12px;\
  border-radius: 6px;\
  font-size: 0.76rem;\
  font-weight: 500;\
  transition: all 0.2s;\
  white-space: nowrap;\
}\
.t5-quick a:hover { color: #ededed !important; background: rgba(255,255,255,0.06); }\
.t5-quick a.active { color: #ededed !important; background: rgba(196,30,58,0.12); }\
\
/* Right side */\
.t5-auth {\
  display: flex;\
  align-items: center;\
  margin-left: auto;\
  margin-right: 8px;\
}\
.auth-user { display:flex; align-items:center; gap:8px; }\
.auth-avatar { width:28px; height:28px; border-radius:50%; object-fit:cover; border:2px solid rgba(196,30,58,0.4); }\
.auth-avatar-initial { display:flex; align-items:center; justify-content:center; background:rgba(196,30,58,0.2); color:#c41e3a; font-size:0.72rem; font-weight:700; }\
.auth-name { font-size:0.72rem; color:#c8c8cc; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\
.auth-btn { border:none; border-radius:4px; padding:5px 10px; font-size:0.68rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }\
.auth-btn-google { background:#c41e3a; color:#fff; }\
.auth-btn-google:hover { background:#d42a45; }\
.auth-btn-twitter { background:#1a1a24; color:#fff; border:1px solid #333; }\
.auth-btn-twitter:hover { border-color:#c41e3a; }\
.auth-btn-logout { background:transparent; color:#6e6e76; border:1px solid #333; }\
.auth-btn-logout:hover { color:#fff; border-color:#c41e3a; }\
.auth-login-buttons { display:flex; gap:6px; }\
.auth-offline-label { font-size:0.65rem; color:#6e6e76; }\
@media(max-width:700px) { .t5-auth { display:none; } }\
\
.t5-right {\
  display: flex;\
  align-items: center;\
  gap: 8px;\
}\
\
/* Search button */\
.t5-search-btn {\
  color: #6e6e76 !important;\
  text-decoration: none !important;\
  padding: 8px;\
  border-radius: 6px;\
  transition: all 0.2s;\
  display: flex;\
  align-items: center;\
}\
.t5-search-btn:hover { color: #ededed !important; background: rgba(255,255,255,0.06); }\
.t5-search-btn svg { display: block; }\
\
/* Menu Button */\
.t5-menu-btn {\
  display: flex;\
  flex-direction: column;\
  gap: 4px;\
  background: none;\
  border: 1px solid rgba(255,255,255,0.08);\
  border-radius: 6px;\
  padding: 10px 9px;\
  cursor: pointer;\
  transition: all 0.25s;\
}\
.t5-menu-btn:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }\
.t5-menu-btn span {\
  display: block;\
  width: 18px;\
  height: 2px;\
  background: #a0a0a6;\
  border-radius: 2px;\
  transition: all 0.3s cubic-bezier(0.16,1,0.3,1);\
}\
.t5-menu-btn.open span:nth-child(1) { transform: rotate(45deg) translate(3.5px, 3.5px); }\
.t5-menu-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }\
.t5-menu-btn.open span:nth-child(3) { transform: rotate(-45deg) translate(3.5px, -3.5px); }\
.t5-menu-btn.open { border-color: rgba(196,30,58,0.3); }\
\
/* Overlay */\
.t5-overlay {\
  position: fixed;\
  inset: 0;\
  background: rgba(0,0,0,0.6);\
  z-index: 2147483645;\
  opacity: 0;\
  pointer-events: none;\
  transition: opacity 0.35s;\
}\
.t5-overlay.open { opacity: 1; pointer-events: auto; }\
\
/* ── MEGA MENU ── */\
.t5-mega {\
  position: fixed;\
  top: 0;\
  right: -420px;\
  width: 400px;\
  max-width: calc(100vw - 20px);\
  height: 100vh;\
  height: 100dvh;\
  background: #0a0a0c;\
  border-left: 1px solid rgba(255,255,255,0.06);\
  z-index: 2147483646;\
  transition: right 0.35s cubic-bezier(0.16,1,0.3,1);\
  display: flex;\
  flex-direction: column;\
}\
.t5-mega.open { right: 0; }\
\
.t5-mega-scroll {\
  flex: 1;\
  overflow-y: auto;\
  padding: 24px 24px 40px;\
  scrollbar-width: thin;\
  scrollbar-color: #2a2a2e transparent;\
}\
.t5-mega-scroll::-webkit-scrollbar { width: 4px; }\
.t5-mega-scroll::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 2px; }\
\
/* You Are Here */\
.t5-youarehere {\
  background: rgba(196,30,58,0.08);\
  border: 1px solid rgba(196,30,58,0.15);\
  border-radius: 8px;\
  padding: 12px 16px;\
  margin-bottom: 24px;\
}\
.t5-yah-label {\
  display: block;\
  font-size: 0.6rem;\
  text-transform: uppercase;\
  letter-spacing: 1.5px;\
  color: #c41e3a;\
  margin-bottom: 4px;\
  font-weight: 600;\
}\
.t5-yah-crumb {\
  font-size: 0.78rem;\
  color: #a0a0a6;\
}\
.t5-yah-crumb strong { color: #ededed; }\
\
/* Section headings */\
.t5-mega-section {\
  margin-bottom: 20px;\
}\
.t5-mega-heading {\
  font-size: 0.65rem;\
  text-transform: uppercase;\
  letter-spacing: 1.5px;\
  color: #6e6e76;\
  font-weight: 600;\
  padding: 0 4px 8px;\
  border-bottom: 1px solid rgba(255,255,255,0.04);\
  margin-bottom: 6px;\
}\
\
/* Page links */\
.t5-mega-items {\
  display: flex;\
  flex-direction: column;\
  gap: 2px;\
}\
.t5-mega-link {\
  display: flex;\
  flex-direction: column;\
  gap: 1px;\
  padding: 10px 12px;\
  border-radius: 8px;\
  text-decoration: none !important;\
  transition: all 0.2s;\
  border-left: 2px solid transparent;\
}\
.t5-mega-link:hover {\
  background: rgba(255,255,255,0.04);\
  border-left-color: rgba(255,255,255,0.15);\
}\
.t5-mega-link.active {\
  background: rgba(196,30,58,0.1);\
  border-left-color: #c41e3a;\
}\
.t5-mega-link.hot .t5-ml-name::after {\
  content: "NEW";\
  font-size: 0.5rem;\
  background: #c41e3a;\
  color: #fff;\
  padding: 1px 5px;\
  border-radius: 3px;\
  margin-left: 8px;\
  font-weight: 700;\
  vertical-align: middle;\
  letter-spacing: 0.5px;\
}\
.t5-mega-link.game .t5-ml-name { color: #ff6b6b !important; }\
.t5-mega-link.green .t5-ml-name { color: #06d6a0 !important; }\
\
.t5-ml-name {\
  font-size: 0.82rem;\
  font-weight: 500;\
  color: #c8c8cc !important;\
  transition: color 0.2s;\
}\
.t5-mega-link:hover .t5-ml-name { color: #fff !important; }\
.t5-mega-link.active .t5-ml-name { color: #ededed !important; font-weight: 600; }\
\
.t5-ml-desc {\
  font-size: 0.68rem;\
  color: #4a4a52 !important;\
  line-height: 1.3;\
}\
.t5-mega-link:hover .t5-ml-desc { color: #6e6e76 !important; }\
\
/* ── MOBILE ── */\
@media (max-width: 768px) {\
  .t5-quick { display: none; }\
  .t5-mega { width: 100%; max-width: 100vw; right: -100%; }\
  .t5-topbar { height: 50px; }\
}\
\
@media (min-width: 769px) and (max-width: 1100px) {\
  .t5-quick a:nth-child(n+4) { display: none; }\
}\
';

  // ── INIT ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
