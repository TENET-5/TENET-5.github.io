/**
 * TENET5 Shared Navigation Component v5.0
 * Redesigned for easier navigation across 82+ pages.
 * 
 * Features:
 *  - Persistent sidebar mega-menu on desktop (triggered by hamburger)
 *  - Categorized page sections with visual hierarchy
 *  - Breadcrumb-style current page indicator
 *  - Search shortcut
 *  - "You Are Here" active page highlighting
 *  - Smooth slide-in animation
 *  - Full mobile-first responsive
 *  - Inline mega menu search with fuzzy matching
 *  - Recently visited pages (localStorage)
 *  - Reading progress bar
 *  - Keyboard shortcuts (/, ?, Escape, h, j, k)
 *  - LIRIL domain classification badges
 *
 * Include this script in every page: <script src="nav.js?v=9"></script>
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
      domain: 'TECHNOLOGY',
      items: [
        { label: 'Investigation Board', href: 'conspiracy-board.html', desc: 'Node graph of influence networks' },
        { label: 'OSINT Dashboard', href: 'osint-dashboard.html', desc: 'Aggregated intelligence data' },
        { label: 'Entity Profiler', href: 'entity-viewer.html', desc: 'Chronological timeline & documents', hot: true },
        { label: 'Network Analysis', href: 'network-analysis.html', desc: 'Cross-referenced topology', hot: true },
        { label: 'N-vs-NP Matrix', href: 'corruption-map.html#n-vs-np', desc: 'LIRIL Pipeline Convergence', hot: true },
        { label: 'Dossier Viewer', href: 'dossier-viewer.html', desc: 'Generated intelligence dossiers', hot: true },
        { label: 'Evidence Archive', href: 'evidence.html', desc: 'Complete evidence repository' },
        { label: 'Evidence Index', href: 'evidence-index.html', desc: 'Categorized evidence finder' },
        { label: 'Cross-Reference Findings', href: 'findings.html', desc: 'Key investigation findings' },
      ]
    },
    {
      section: 'The Harm',
      icon: '🩸',
      domain: 'ETHICS',
      items: [
        { label: 'The 504 Charges', href: 'accountability.html', desc: 'Criminal accountability database' },
        { label: 'Criminal Code Analysis', href: 'criminal-code-analysis.html', desc: '81 findings mapped to CC sections', hot: true },
        { label: 'Charges Sheet', href: 'charges-sheet.html', desc: '38 officials, 42 charges', hot: true },
        { label: 'Genocide Evidence', href: 'genocide-evidence.html', desc: 'Pattern documentation' },
        { label: 'Policy Harm Index', href: 'harm-index.html', desc: 'Quantified policy damage' },
        { label: 'The Pattern (T4)', href: 't4-comparison.html', desc: 'Historical comparison' },
        { label: 'RCMP Complicity', href: 'rcmp-complicity.html', desc: 'Law enforcement failure analysis', hot: true },
        { label: 'The Boot', href: 'the-boot.html', desc: 'Institutional mechanics' },
        { label: 'MAID Report', href: 'rcmp-maid-accountability.html', desc: 'RCMP commissioners & MAID deaths', hot: true },
        { label: 'Healthcare Collapse', href: 'healthcare-crisis.html', desc: 'Waitlist deaths, budget betrayal, CIHI data', hot: true },
        { label: 'MAID Policy Evolution', href: 'maid-policy-evolution.html', desc: '8-year legislative expansion — Bills C-14, C-7, C-39', hot: true },
        { label: 'Disability & CRPD', href: 'disability-genocide.html', desc: 'UN Convention violations, Section 15 Charter', hot: true },
      ]
    },
    {
      section: 'Follow the Money',
      icon: '💰',
      domain: 'MATHEMATICS',
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
        { label: 'Arms Pipeline', href: 'arms-pipeline.html', desc: 'Canadian arms export tracking' },
        { label: 'Carney Conflicts', href: 'carney-conflicts.html', desc: 'PM conflict-of-interest analysis' },
        { label: 'AG Findings Database', href: 'ag-findings.html', desc: '12 AG reports, $103B+ documented', hot: true },
        { label: 'Phoenix Pay Disaster', href: 'phoenix-pay.html', desc: '$309M→$2.2B, 150K affected', hot: true },
        { label: 'Senate Expenses', href: 'senate-expenses.html', desc: 'Duffy/Wallin/Brazeau — $500K scandal', hot: true },
        { label: 'Elections & Finance', href: 'elections-finance.html', desc: 'Campaign finance, lobbying data', hot: true },
        { label: 'Lobbying Deep Dive', href: 'lobbying-deepdive.html', desc: '359K communications, pharma→MAID pipeline', hot: true },
      ]
    },
    {
      section: 'Parliament',
      icon: '🏛',
      domain: 'ETHICS',
      items: [
        { label: 'Treason Trajectory', href: 'treason-trajectory.html', desc: '81 years of pattern' },
        { label: '5GW Subversion', href: '5gw-subversion.html', desc: 'Fifth-generation warfare' },
        { label: 'Hansard Dashboard', href: 'hansard-dashboard.html', desc: 'Debate analysis' },
        { label: 'Hansard Evidence', href: 'hansard-evidence.html', desc: 'Parliamentary records' },
        { label: 'Voting Records', href: 'voting-records.html', desc: '151 bills, 94 votes analyzed', hot: true },
        { label: 'MP Voting Records', href: 'mp-voting-records.html', desc: 'How key MPs voted on MAID, firearms, censorship', hot: true },
        { label: 'MP Scorecard', href: 'mp-scorecard.html', desc: 'Rate your MP\'s record', hot: true },
        { label: 'Sector Lobbying', href: 'sector-lobbying.html', desc: '359K comms, 12 sectors', hot: true },
        { label: 'Provincial Analysis', href: 'provincial-analysis.html', desc: 'All 10 provinces', hot: true },
        { label: 'Infographics', href: 'infographics.html', desc: 'Visual data presentations' },
      ]
    },
    {
      section: 'Military & Legal',
      icon: '🎖',
      domain: 'ETHICS',
      items: [
        { label: 'DND Procurement', href: 'dnd-procurement.html', desc: '$100B+ betrayal — ships, jets, LAVs', hot: true },
        { label: 'PPCLI Lawsuit', href: 'lawsuit-ppcli.html', desc: 'Active legal proceedings' },
        { label: 'CFNIS Investigation', href: 'cfnis.html', desc: 'Military police misconduct' },
        { label: 'Legal Proceedings', href: 'legal.html', desc: 'Full legal framework' },
        { label: 'Veterans Support', href: 'veterans.html', desc: 'Veteran community resources' },
        { label: 'Whistleblower Guide', href: 'whistleblower-guide.html', desc: 'Protected disclosure' },
        { label: 'Acelephius Report', href: 'acelephius-report.html', desc: 'Intelligence assessment' },
        { label: 'Acelephius Wardoll', href: 'acelephius-wardoll.html', desc: 'Wardoll analysis document' },
        { label: 'Veterans Betrayal', href: 'veterans-betrayal.html', desc: 'VAC failures, MAID offers, lapsed funding', hot: true },
      ]
    },
    {
      section: 'About & Action',
      icon: '📖',
      domain: 'ART',
      items: [
        { label: 'Take Action', href: 'take-action.html', desc: 's.504 prosecution, complaints, contact MPs', hot: true },
        { label: 'My Story', href: 'my-story.html', desc: 'Daniel Perry\'s account' },
        { label: 'Open Letter to MPs', href: 'open-letter.html', desc: 'Direct address to parliament' },
        { label: 'MP Briefing', href: 'mp-brief.html', desc: 'Concise brief for MPs' },
        { label: 'Master Timeline', href: 'timeline.html', desc: '81 years documented' },
        { label: 'About', href: 'about.html', desc: 'About the investigation' },
        { label: 'FAQ & History', href: 'history.html', desc: 'Common questions' },
        { label: 'FAQ', href: 'faq.html', desc: 'Frequently asked questions' },
        { label: 'Email Campaign', href: 'email-campaign.html', desc: 'Write your MP campaign' },
        { label: 'Campaign Generator', href: 'campaign-generator.html', desc: 'Generate campaign materials' },
        { label: 'Campaign Tracker', href: 'campaign-tracker.html', desc: 'Track outreach campaigns' },
        { label: 'Resources', href: 'resources.html', desc: 'External reference links' },
      ]
    },
    {
      section: 'Apps',
      icon: '🎮',
      domain: 'TECHNOLOGY',
      items: [
        { label: 'Red Duster FPS', href: 'red-duster-game.html', desc: 'Tactical simulator', special: 'game' },
        { label: 'Bloggins', href: 'bloggins.html', desc: 'Raccoon intelligence AI', special: 'green' },
        { label: 'LIRIL (AI)', href: 'liril.html', desc: "Daniel Perry's private AI system", hot: true },
        { label: 'Search', href: 'search.html', desc: 'Full-site search' },
        { label: 'Report Generator', href: 'report-generator.html', desc: 'Generate investigation reports' },
        { label: 'AI Research', href: 'ai-research.html', desc: 'AI-powered research tools' },
        { label: 'Architecture', href: 'architecture.html', desc: 'TENET5 system architecture' },
      ]
    },
    {
      section: 'Community',
      icon: '💬',
      domain: 'ART',
      items: [
        { label: 'Live Chat', href: 'chat.html', desc: 'Real-time discussion', hot: true },
        { label: 'AI Research', href: 'chat.html#ai', desc: 'Gemini-powered analysis', hot: true },
        { label: 'News Intelligence', href: 'news.html', desc: 'Canadian news aggregation', hot: true },
        { label: 'Community Hub', href: 'community.html', desc: 'Join the community' },
      ]
    },
    {
      section: 'Municipal',
      icon: '🏛️',
      domain: 'SCIENCE',
      items: [
        { label: 'Municipal Hub', href: 'municipal-accountability.html', desc: 'All municipalities', hot: true },
        { label: 'Ottawa', href: 'ottawa.html', desc: 'LRT scandal, Lansdowne 2.0', hot: true },
        { label: 'Toronto', href: 'toronto.html', desc: 'Eglinton LRT, Gardiner', hot: true },
        { label: 'Vancouver', href: 'vancouver.html', desc: 'Housing, money laundering', hot: true },
        { label: 'Calgary', href: 'calgary.html', desc: 'Green Line, arena deal', hot: true },
        { label: 'Belleville', href: 'belleville.html', desc: 'City of Belleville' },
        { label: 'Quinte West', href: 'quinte-west.html', desc: 'City of Quinte West' },
        { label: 'Canada Map', href: 'canada-map.html', desc: 'Interactive national corruption map', hot: true },
        { label: 'Municipal Intel', href: 'municipal-intelligence.html', desc: 'Municipal intelligence briefs', hot: true },
        { label: 'Kingston', href: 'municipal-accountability.html?city=kingston', desc: 'Third Crossing, housing crisis' },
        { label: 'Peterborough', href: 'municipal-accountability.html?city=peterborough', desc: 'Del Mastro conviction, opioid crisis' },
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
    if (document.getElementById('t5-nav-v5-css')) return;

    var currentPage = getCurrentPage();
    var currentSection = getCurrentSection(currentPage);

    // Inject CSS
    var style = document.createElement('style');
    style.id = 't5-nav-v5-css';
    style.textContent = NAV_CSS;
    document.head.appendChild(style);

    var nav = document.getElementById('site-nav') || document.querySelector('nav');
    if (!nav) return;

    nav.className = 't5-topbar';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    // ── TOP BAR ──
    var html = '';

    // Page count
    var totalPages = 0;
    for (var c = 0; c < SITEMAP.length; c++) totalPages += SITEMAP[c].items.length;

    // Progress bar
    html += '<div class="t5-progress"></div>';
    html += '<a href="index.html" class="t5-brand">TENET5<span class="t5-page-count">' + totalPages + '</span></a>';

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

    // Search box
    html += '<div class="t5-search-box">';
    html += '<input type="text" class="t5-search-input" placeholder="Search ' + totalPages + ' pages... (press /)" autocomplete="off" />';
    html += '<button class="t5-search-clear" aria-label="Clear search">&times;</button>';
    html += '</div>';

    // Recently visited
    html += '<div class="t5-recent" id="t5-recent-section">';
    html += '<div class="t5-recent-heading">⏱ Recently Visited</div>';
    html += '<div class="t5-recent-links"></div>';
    html += '</div>';

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
      html += '<h3 class="t5-mega-heading">' + sec.icon + ' ' + sec.section;
      if (sec.domain) html += '<span class="t5-domain-badge t5-domain-' + sec.domain + '">' + sec.domain + '</span>';
      html += '</h3>';
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

    // No results message
    html += '<div class="t5-no-results" style="display:none;">No results found</div>';

    html += '</div></div>'; // close mega-scroll + mega
    html += '<div class="t5-overlay"></div>';

    nav.innerHTML = html;

    // ── EVENT HANDLERS ──
    var menuBtn = nav.querySelector('.t5-menu-btn');
    var mega = nav.querySelector('.t5-mega');
    var overlay = nav.querySelector('.t5-overlay');
    var isOpen = false;
    var searchInput = nav.querySelector('.t5-search-input');
    var searchClear = nav.querySelector('.t5-search-clear');
    var noResults = nav.querySelector('.t5-no-results');
    var progressBar = nav.querySelector('.t5-progress');

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

    // Close on link click
    mega.querySelectorAll('.t5-mega-link').forEach(function(link) {
      link.addEventListener('click', function() { toggleMenu(true); });
    });

    // ── INLINE SEARCH ──
    function doSearch(query) {
      var term = query.toLowerCase().trim();
      var sections = mega.querySelectorAll('.t5-mega-section');
      var recentEl = document.getElementById('t5-recent-section');
      var anyVisible = false;

      if (!term) {
        mega.querySelectorAll('.t5-mega-link').forEach(function(l) { l.style.display = ''; });
        sections.forEach(function(s) { s.style.display = ''; });
        if (recentEl) recentEl.style.display = '';
        noResults.style.display = 'none';
        return;
      }

      if (recentEl) recentEl.style.display = 'none';

      sections.forEach(function(sec) {
        var links = sec.querySelectorAll('.t5-mega-link');
        var visibleCount = 0;
        links.forEach(function(link) {
          var text = link.textContent.toLowerCase();
          var href = (link.getAttribute('href') || '').toLowerCase();
          if (text.indexOf(term) !== -1 || href.indexOf(term) !== -1) {
            link.style.display = '';
            visibleCount++;
          } else {
            link.style.display = 'none';
          }
        });
        sec.style.display = visibleCount > 0 ? '' : 'none';
        if (visibleCount > 0) anyVisible = true;
      });

      noResults.style.display = anyVisible ? 'none' : '';
    }

    searchInput.addEventListener('keyup', function() { doSearch(this.value); });
    searchInput.addEventListener('input', function() { doSearch(this.value); });
    searchClear.addEventListener('click', function() {
      searchInput.value = '';
      doSearch('');
      searchInput.focus();
    });

    // ── RECENTLY VISITED (localStorage) ──
    (function initRecent() {
      var key = 't5-recent';
      var max = 5;
      var stored = [];
      try { stored = JSON.parse(localStorage.getItem(key)) || []; } catch(e) { stored = []; }

      if (currentPage && currentPage !== 'index.html') {
        stored = stored.filter(function(r) { return r.href !== currentPage; });
        stored.unshift({ href: currentPage, label: getPageLabel(currentPage) });
        if (stored.length > max) stored = stored.slice(0, max);
        try { localStorage.setItem(key, JSON.stringify(stored)); } catch(e) {}
      }

      var container = nav.querySelector('.t5-recent-links');
      var section = document.getElementById('t5-recent-section');
      if (!stored.length) {
        if (section) section.style.display = 'none';
        return;
      }
      var rHtml = '';
      for (var r = 0; r < stored.length; r++) {
        rHtml += '<a href="' + stored[r].href + '" class="t5-recent-link">' + stored[r].label + '</a>';
      }
      container.innerHTML = rHtml;
    })();

    // ── READING PROGRESS BAR ──
    (function initProgress() {
      var ticking = false;
      function updateProgress() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight;
        var winHeight = document.documentElement.clientHeight;

        if (docHeight < winHeight * 2) {
          progressBar.style.display = 'none';
          ticking = false;
          return;
        }
        progressBar.style.display = '';
        var scrollable = docHeight - winHeight;
        var pct = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
        progressBar.style.width = Math.min(pct, 100) + '%';
        ticking = false;
      }

      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(updateProgress);
          ticking = true;
        }
      }, { passive: true });

      updateProgress();
    })();

    // ── KEYBOARD SHORTCUTS ──
    var shortcutsOverlay = null;

    function createShortcutsOverlay() {
      if (shortcutsOverlay) return shortcutsOverlay;
      var el = document.createElement('div');
      el.className = 't5-shortcuts-overlay';
      el.innerHTML = '<div class="t5-shortcuts-modal">' +
        '<h3>\u2328\ufe0f Keyboard Shortcuts</h3>' +
        '<div class="t5-shortcuts-grid">' +
        '<div class="t5-sc"><kbd>/</kbd><span>Search pages</span></div>' +
        '<div class="t5-sc"><kbd>?</kbd><span>Show shortcuts</span></div>' +
        '<div class="t5-sc"><kbd>Esc</kbd><span>Close menu / overlay</span></div>' +
        '<div class="t5-sc"><kbd>h</kbd><span>Go home</span></div>' +
        '<div class="t5-sc"><kbd>j</kbd><span>Next link in menu</span></div>' +
        '<div class="t5-sc"><kbd>k</kbd><span>Previous link in menu</span></div>' +
        '</div>' +
        '<p class="t5-sc-hint">Press <kbd>?</kbd> or <kbd>Esc</kbd> to close</p>' +
        '</div>';
      el.addEventListener('click', function(ev) {
        if (ev.target === el) toggleShortcuts(false);
      });
      document.body.appendChild(el);
      shortcutsOverlay = el;
      return el;
    }

    function toggleShortcuts(show) {
      var ol = createShortcutsOverlay();
      if (typeof show === 'undefined') show = !ol.classList.contains('open');
      ol.classList.toggle('open', show);
    }

    document.addEventListener('keydown', function(e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var isInput = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

      if (e.key === 'Escape') {
        if (shortcutsOverlay && shortcutsOverlay.classList.contains('open')) {
          toggleShortcuts(false);
          e.preventDefault();
          return;
        }
        if (isOpen) {
          toggleMenu(true);
          e.preventDefault();
          return;
        }
      }

      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        if (!isOpen) toggleMenu();
        setTimeout(function() { searchInput.focus(); }, 100);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        toggleShortcuts();
        return;
      }

      if (e.key === 'h') {
        window.location.href = 'index.html';
        return;
      }

      if ((e.key === 'j' || e.key === 'k') && isOpen) {
        var visibleLinks = [];
        mega.querySelectorAll('.t5-mega-link').forEach(function(l) {
          if (l.offsetParent !== null && l.style.display !== 'none') visibleLinks.push(l);
        });
        if (!visibleLinks.length) return;
        var focused = document.activeElement;
        var idx = visibleLinks.indexOf(focused);
        if (e.key === 'j') {
          idx = idx < visibleLinks.length - 1 ? idx + 1 : 0;
        } else {
          idx = idx > 0 ? idx - 1 : visibleLinks.length - 1;
        }
        visibleLinks[idx].focus();
        e.preventDefault();
      }
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
/*  TENET5 NAV V5 — TOPBAR + MEGA MENU          */\
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
\
/* ── PROGRESS BAR ── */\
.t5-progress {\
  position: absolute;\
  top: 0;\
  left: 0;\
  height: 3px;\
  background: #c41e3a;\
  width: 0%;\
  transition: width 0.1s;\
  z-index: 1;\
  pointer-events: none;\
}\
\
/* Page count badge */\
.t5-page-count {\
  font-size: 0.55rem;\
  color: #4a4a52;\
  margin-left: 6px;\
  font-weight: 400;\
}\
\
/* ── INLINE SEARCH ── */\
.t5-search-box {\
  position: relative;\
  margin-bottom: 16px;\
}\
.t5-search-input {\
  width: 100%;\
  background: #111114;\
  border: 1px solid rgba(255,255,255,0.08);\
  border-radius: 8px;\
  padding: 10px 36px 10px 12px;\
  color: #ededed;\
  font-family: inherit;\
  font-size: 0.78rem;\
  outline: none;\
  transition: border-color 0.2s;\
  box-sizing: border-box;\
}\
.t5-search-input::placeholder { color: #4a4a52; }\
.t5-search-input:focus { border-color: #c41e3a; }\
.t5-search-clear {\
  position: absolute;\
  right: 8px;\
  top: 50%;\
  transform: translateY(-50%);\
  background: none;\
  border: none;\
  color: #6e6e76;\
  font-size: 1.1rem;\
  cursor: pointer;\
  padding: 4px 6px;\
  line-height: 1;\
}\
.t5-search-clear:hover { color: #ededed; }\
\
/* No results */\
.t5-no-results {\
  text-align: center;\
  color: #4a4a52;\
  font-size: 0.78rem;\
  padding: 40px 0;\
}\
\
/* ── RECENTLY VISITED ── */\
.t5-recent {\
  margin-bottom: 16px;\
  padding: 10px 12px;\
  background: rgba(255,255,255,0.02);\
  border-radius: 8px;\
  border: 1px solid rgba(255,255,255,0.04);\
}\
.t5-recent-heading {\
  font-size: 0.6rem;\
  text-transform: uppercase;\
  letter-spacing: 1.5px;\
  color: #6e6e76;\
  font-weight: 600;\
  margin-bottom: 6px;\
}\
.t5-recent-links {\
  display: flex;\
  flex-wrap: wrap;\
  gap: 4px;\
}\
.t5-recent-link {\
  font-size: 0.7rem;\
  color: #a0a0a6 !important;\
  text-decoration: none !important;\
  padding: 4px 10px;\
  background: rgba(255,255,255,0.04);\
  border-radius: 6px;\
  transition: all 0.2s;\
}\
.t5-recent-link:hover {\
  color: #ededed !important;\
  background: rgba(255,255,255,0.08);\
}\
\
/* ── DOMAIN BADGES ── */\
.t5-domain-badge {\
  font-size: 0.5rem;\
  padding: 1px 6px;\
  border-radius: 3px;\
  margin-left: 8px;\
  font-weight: 600;\
  letter-spacing: 0.5px;\
  text-transform: uppercase;\
  vertical-align: middle;\
  display: inline-block;\
}\
.t5-domain-ETHICS { background: rgba(196,30,58,0.13); color: #c41e3a; border: 1px solid rgba(196,30,58,0.25); }\
.t5-domain-TECHNOLOGY { background: rgba(59,130,246,0.13); color: #3b82f6; border: 1px solid rgba(59,130,246,0.25); }\
.t5-domain-MATHEMATICS { background: rgba(245,158,11,0.13); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }\
.t5-domain-ART { background: rgba(139,92,246,0.13); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.25); }\
.t5-domain-SCIENCE { background: rgba(6,214,160,0.13); color: #06d6a0; border: 1px solid rgba(6,214,160,0.25); }\
\
/* ── SHORTCUTS OVERLAY ── */\
.t5-shortcuts-overlay {\
  position: fixed;\
  inset: 0;\
  background: rgba(0,0,0,0.7);\
  z-index: 2147483647;\
  display: flex;\
  align-items: center;\
  justify-content: center;\
  opacity: 0;\
  pointer-events: none;\
  transition: opacity 0.25s;\
}\
.t5-shortcuts-overlay.open {\
  opacity: 1;\
  pointer-events: auto;\
}\
.t5-shortcuts-modal {\
  background: #111114;\
  border: 1px solid rgba(255,255,255,0.08);\
  border-radius: 12px;\
  padding: 28px 32px;\
  max-width: 380px;\
  width: 90%;\
}\
.t5-shortcuts-modal h3 {\
  color: #ededed;\
  font-size: 0.9rem;\
  margin: 0 0 16px;\
  font-weight: 600;\
}\
.t5-shortcuts-grid {\
  display: grid;\
  grid-template-columns: 1fr 1fr;\
  gap: 10px;\
}\
.t5-sc {\
  display: flex;\
  align-items: center;\
  gap: 10px;\
}\
.t5-sc kbd {\
  display: inline-flex;\
  align-items: center;\
  justify-content: center;\
  min-width: 28px;\
  height: 24px;\
  background: #1a1a1e;\
  border: 1px solid rgba(255,255,255,0.1);\
  border-radius: 4px;\
  color: #c41e3a;\
  font-size: 0.7rem;\
  font-family: inherit;\
  padding: 0 6px;\
  font-weight: 600;\
}\
.t5-sc span {\
  font-size: 0.72rem;\
  color: #a0a0a6;\
}\
.t5-sc-hint {\
  margin-top: 16px;\
  text-align: center;\
  font-size: 0.65rem;\
  color: #4a4a52;\
}\
.t5-sc-hint kbd {\
  display: inline;\
  background: #1a1a1e;\
  border: 1px solid rgba(255,255,255,0.1);\
  border-radius: 3px;\
  color: #6e6e76;\
  font-size: 0.6rem;\
  padding: 1px 4px;\
  font-family: inherit;\
}\
';

  // ── INIT ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
