/**
 * TENET5 — Investigation Board OS v3.0
 * 
 * The board IS the operating system. Documents open inside it.
 * Familiar desktop metaphor:
 *   - Board = desktop workspace
 *   - Cards = application icons  
 *   - Clicking = opens document in iframe window panel
 *   - Window panel has titlebar, close, maximize, back-to-board
 *   - Cluster pills = taskbar application groups
 *
 * On index.html: Board auto-opens as the homepage shell
 * On sub-pages: Board available as FAB overlay (backwards compatible)
 *
 * Cognitive Science: Miller's Law, Gestalt, Zeigarnik, Fitts, Method of Loci
 * LIRIL/SATOR: ART×TECHNOLOGY dual gate (AVIVA + KAYAK)
 */
(function() {
  'use strict';

  const IS_HOME = (window.location.pathname.endsWith('/') || 
                   window.location.pathname.endsWith('/index.html') ||
                   window.location.pathname.endsWith('index.html') ||
                   window.location.pathname === '');

  // ── Cluster definitions with spatial anchors (Method of Loci) ──
  const CLUSTERS = [
    {
      id: 'story',
      label: 'THE STORY',
      color: '#60a5fa',
      anchor: { x: 160, y: 400 },
      cards: [
        { id: 'home',    emoji: '🇨🇦', title: 'HOME',      desc: 'The numbers. The math. The proof.',    href: 'index.html',    dx: 0,   dy: 0,   rot: -2 },
        { id: 'story',   emoji: '📖', title: 'MY STORY',    desc: 'Combat veteran. Signals operator.',     href: 'my-story.html', dx: -40, dy: 210, rot: 3 },
        { id: 'history', emoji: '📜', title: 'HISTORY',     desc: '141 years of state violence.',          href: 'history.html',  dx: 60,  dy: 410, rot: -1 },
        { id: 'faq',     emoji: '❓', title: 'FAQ',          desc: 'Common questions answered.',            href: 'faq.html',      dx: -60, dy: 600, rot: 2 },
      ]
    },
    {
      id: 'investigation',
      label: 'INVESTIGATION',
      color: '#f97316',
      anchor: { x: 560, y: 250 },
      cards: [
        { id: 'evidence',    emoji: '🔍', title: 'EVIDENCE',          desc: 'Sourced. Verified. Undeniable.',        href: 'evidence.html',         dx: 0,   dy: 0,   rot: -3 },
        { id: 'hansard',     emoji: '🏛',  title: 'HANSARD RECORDS',   desc: 'Parliamentary record proof.',           href: 'hansard-evidence.html', dx: -20, dy: 200, rot: 1 },
        { id: 't4',          emoji: '⚠',  title: 'THE PATTERN',       desc: 'T4 program comparison.',                href: 't4-comparison.html',    dx: 100, dy: 380, rot: -2 },
        { id: '5gw',         emoji: '⚔',  title: '5GW SUBVERSION',    desc: 'Fifth generation warfare analysis.',    href: '5gw-subversion.html',   dx: -40, dy: 560, rot: 4 },
        { id: 'harm',        emoji: '☠',  title: 'HARM INDEX',         desc: 'Policy changes that kill.',             href: 'harm-index.html',       dx: 200, dy: 80,  rot: -1 },
        { id: 'genocide',    emoji: '💀', title: 'GENOCIDE EVIDENCE',  desc: 'Crimes against humanity case.',         href: 'genocide-evidence.html',dx: 220, dy: 280, rot: 2 },
        { id: 'corruption',  emoji: '🗺',  title: 'CORRUPTION MAP',    desc: 'Every documented scandal mapped.',      href: 'corruption-map.html',   dx: 180, dy: 480, rot: -3 },
        { id: 'infographics',emoji: '📊', title: 'INFOGRAPHICS',       desc: 'Visual data breakdowns.',               href: 'infographics.html',     dx: 40,  dy: 740, rot: 1 },
      ]
    },
    {
      id: 'accountability',
      label: 'ACCOUNTABILITY & LEGAL',
      color: '#ef4444',
      anchor: { x: 1060, y: 200 },
      cards: [
        { id: '504',     emoji: '📋', title: 'THE 504 CHARGES',    desc: '562 confirmed public records.',      href: 'accountability.html',      dx: 0,   dy: 0,   rot: 2,  hot: true },
        { id: 'treason', emoji: '⚖',  title: 'TREASON TRAJECTORY', desc: 'The path to prosecution.',           href: 'treason-trajectory.html',  dx: -40, dy: 200, rot: -2 },
        { id: 'board',   emoji: '🕵',  title: 'THE BOARD',          desc: 'Connection mapping.',                href: 'conspiracy-board.html',    dx: 140, dy: 360, rot: 3 },
        { id: 'foreign',  emoji: '🌐', title: 'FOREIGN INFLUENCE',  desc: 'External interference vectors.',    href: 'foreign-influence.html',   dx: 60,  dy: 540, rot: -1 },
        { id: 'timeline', emoji: '📅', title: 'TIMELINE',           desc: 'Chronological evidence map.',        href: 'timeline.html',            dx: -60, dy: 720, rot: 2 },
        { id: 'cfnis',   emoji: '🎖',  title: 'CFNIS',              desc: 'Military police investigation.',     href: 'cfnis.html',               dx: 200, dy: 140, rot: -3 },
        { id: 'legal',   emoji: '⚖',  title: 'LEGAL PROCEEDINGS',  desc: 'Court filings and framework.',       href: 'legal.html',               dx: 280, dy: 320, rot: 1 },
        { id: 'lawsuit',  emoji: '📜', title: 'PPCLI LAWSUIT',     desc: 'Statement of claim.',                href: 'lawsuit-ppcli.html',       dx: 340, dy: 500, rot: -2 },
      ]
    },
    {
      id: 'military',
      label: 'MILITARY & VETERANS',
      color: '#22c55e',
      anchor: { x: 1700, y: 300 },
      cards: [
        { id: 'veterans',    emoji: '🎖',  title: 'VETERANS',             desc: 'Those who served, betrayed.',      href: 'veterans.html',             dx: 0,   dy: 0,   rot: 2 },
        { id: 'boot',        emoji: '🥾', title: 'THE BOOT',              desc: 'Military culture exposé.',         href: 'the-boot.html',             dx: -40, dy: 200, rot: -1 },
        { id: 'procurement', emoji: '💰', title: 'PROCUREMENT',           desc: '$200B+ documented waste.',         href: 'procurement-registry.html', dx: 160, dy: 120, rot: 3 },
        { id: 'procanalysis', emoji: '📊', title: 'PROCUREMENT ANALYSIS', desc: 'Pattern recognition in spending.', href: 'procurement-analysis.html', dx: 200, dy: 340, rot: -2 },
      ]
    },
    {
      id: 'resources',
      label: 'RESOURCES & TOOLS',
      color: '#a78bfa',
      anchor: { x: 1100, y: 1000 },
      cards: [
        { id: 'letter',    emoji: '📢', title: 'OPEN LETTER',        desc: 'Public declaration.',          href: 'open-letter.html',          dx: 0,   dy: 0,   rot: 1 },
        { id: 'mp',        emoji: '🏛',  title: 'MP BRIEFING',       desc: 'Parliamentary briefing.',       href: 'mp-brief.html',             dx: 200, dy: -40, rot: -2 },
        { id: 'whistle',   emoji: '🛡',  title: 'WHISTLEBLOWER',     desc: 'Protection guide.',             href: 'whistleblower-guide.html',  dx: -60, dy: 180, rot: 3 },
        { id: 'wardoll',   emoji: '🔗', title: 'WARDOLL',            desc: 'The investigation.',            href: 'acelephius-wardoll.html',   dx: -280, dy: 100, rot: -1 },
        { id: 'bloggins',  emoji: '🦝', title: 'CPL BLOGGINS',       desc: 'Military humour & truth.',      href: 'bloggins.html',             dx: 420, dy: 60,  rot: 2 },
        { id: 'reduster',  emoji: '🩸', title: 'RED DUSTER FPS',     desc: 'Play the tactical simulator.',  href: 'red-duster-game.html',      dx: 560, dy: -40, rot: -4, hot: true },
        { id: 'resources', emoji: '📚', title: 'RESOURCES',           desc: 'Further reading.',              href: 'resources.html',            dx: 380, dy: 200, rot: 1 },
        { id: 'osint',     emoji: '📡', title: 'OSINT DASHBOARD',     desc: 'Live intelligence.',            href: 'osint-dashboard.html',      dx: 640, dy: 120, rot: -3 },
      ]
    }
  ];

  const STRINGS = [
    { from: [0,0], to: [0,1], type: 'solid' },
    { from: [0,1], to: [0,2], type: 'solid' },
    { from: [1,0], to: [1,1], type: 'solid' },
    { from: [1,0], to: [1,4], type: 'solid' },
    { from: [1,4], to: [1,5], type: 'solid' },
    { from: [1,5], to: [1,6], type: 'solid' },
    { from: [1,1], to: [1,2], type: 'solid' },
    { from: [1,2], to: [1,3], type: 'solid' },
    { from: [2,0], to: [2,1], type: 'solid' },
    { from: [2,0], to: [2,2], type: 'solid' },
    { from: [2,5], to: [2,6], type: 'solid' },
    { from: [2,6], to: [2,7], type: 'solid' },
    { from: [3,0], to: [3,1], type: 'solid' },
    { from: [3,0], to: [3,2], type: 'solid' },
    { from: [0,0], to: [1,0], type: 'dashed' },
    { from: [0,0], to: [2,0], type: 'dashed' },
    { from: [1,0], to: [2,0], type: 'dashed' },
    { from: [1,3], to: [2,3], type: 'dashed' },
    { from: [2,5], to: [3,0], type: 'dashed' },
    { from: [2,1], to: [2,6], type: 'dashed' },
    { from: [1,6], to: [1,7], type: 'dashed' },
    { from: [4,5], to: [4,7], type: 'dashed' },
  ];

  const IS_MOBILE = window.innerWidth <= 768;
  const IS_TABLET = window.innerWidth <= 1024 && window.innerWidth > 768;
  const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Inject viewport meta if missing (safety for any page)
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  }

  let boardOpen = false;
  let dragState = { active: false, startX: 0, startY: 0 };
  let boardOffset = { x: 0, y: 0 };
  let boardScale = IS_MOBILE ? 0.38 : IS_TABLET ? 0.48 : 0.55;
  let focusedCluster = null;
  let docPanelOpen = false;
  let navHistory = [];

  function getAllCards() {
    const cards = [];
    CLUSTERS.forEach((cluster, ci) => {
      cluster.cards.forEach((card, cardIdx) => {
        cards.push({
          ...card,
          clusterIdx: ci,
          cardIdx: cardIdx,
          absX: cluster.anchor.x + card.dx,
          absY: cluster.anchor.y + card.dy,
          clusterColor: cluster.color,
        });
      });
    });
    return cards;
  }

  function buildBoard() {
    const allCards = getAllCards();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // ── FAB trigger ──
    const fab = document.createElement('button');
    fab.className = 'board-trigger';
    fab.innerHTML = '📌';
    fab.title = 'Open Investigation Board (Ctrl+B)';
    fab.setAttribute('aria-label', 'Toggle investigation board navigation');
    // On home, the FAB is hidden because board auto-opens
    if (IS_HOME) fab.style.display = 'none';
    document.body.appendChild(fab);

    // ── Main overlay ──
    const overlay = document.createElement('div');
    overlay.className = 'board-overlay';
    overlay.id = 'board-overlay';
    // On homepage, the overlay is always-on (becomes the shell)
    if (IS_HOME) overlay.classList.add('board-shell');

    overlay.innerHTML = `
      <div class="board-header">
        <div class="board-title"><span>TENET5 INVESTIGATION</span>The Board</div>
        <div class="board-header-right">
          <div class="board-search">
            <input type="text" class="board-search-input" placeholder="Search files..." id="board-search" autocomplete="off" />
          </div>
          ${IS_HOME ? '' : '<button class="board-close" aria-label="Close board">✕ ESC</button>'}
        </div>
      </div>
      <div class="board-cluster-nav" id="cluster-nav"></div>
      <div class="board-zoom-controls">
        <button class="board-zoom-btn" data-zoom="in" title="Zoom in">+</button>
        <button class="board-zoom-btn" data-zoom="reset" title="Reset view">⊙</button>
        <button class="board-zoom-btn" data-zoom="out" title="Zoom out">−</button>
      </div>
      <div class="board-world" id="board-world">
        <div class="board-surface" id="board-surface"></div>
      </div>
      <div class="board-hint" id="board-hint">${IS_TOUCH ? 'Pinch to zoom • Tap cards to open • Swipe clusters' : 'Scroll to zoom • Click cards to open • 1-5 jump to clusters'}</div>
      <div class="board-doc-panel" id="board-doc-panel">
        <div class="doc-titlebar" id="doc-titlebar">
          <div class="doc-titlebar-left">
            <button class="doc-btn doc-btn-back" id="doc-back" title="Back to Board">◀ Board</button>
            <span class="doc-breadcrumb" id="doc-breadcrumb"></span>
          </div>
          <div class="doc-titlebar-right">
            <button class="doc-btn doc-btn-newwindow" id="doc-newwindow" title="Open in new tab">↗ New Tab</button>
            <button class="doc-btn doc-btn-maximize" id="doc-maximize" title="Toggle fullscreen">⛶</button>
            <button class="doc-btn doc-btn-close" id="doc-close" title="Close document">✕</button>
          </div>
        </div>
        <div class="doc-loading" id="doc-loading">
          <div class="doc-loading-spinner"></div>
          <span>Loading document...</span>
        </div>
        <iframe class="doc-frame" id="doc-frame" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" title="Document viewer"></iframe>
      </div>
    `;
    document.body.appendChild(overlay);

    const surface = document.getElementById('board-surface');
    const world = document.getElementById('board-world');
    const clusterNav = document.getElementById('cluster-nav');
    const docPanel = document.getElementById('board-doc-panel');
    const docFrame = document.getElementById('doc-frame');
    const docBreadcrumb = document.getElementById('doc-breadcrumb');
    const docLoading = document.getElementById('doc-loading');
    const searchInput = document.getElementById('board-search');

    // ── Cluster quick-nav pills ──
    CLUSTERS.forEach((cluster, idx) => {
      const pill = document.createElement('button');
      pill.className = 'board-cluster-pill';
      pill.style.setProperty('--cluster-color', cluster.color);
      pill.innerHTML = `<span class="pill-dot" style="background:${cluster.color}"></span>${cluster.label}`;
      pill.addEventListener('click', () => flyToCluster(idx));
      clusterNav.appendChild(pill);
    });

    // ── Cluster labels + anchor dots ──
    CLUSTERS.forEach(cluster => {
      const lbl = document.createElement('div');
      lbl.className = 'board-cluster-label';
      lbl.textContent = cluster.label;
      lbl.style.left = (cluster.anchor.x - 20) + 'px';
      lbl.style.top = (cluster.anchor.y - 50) + 'px';
      lbl.style.color = cluster.color;
      const dot = document.createElement('div');
      dot.className = 'board-anchor-dot';
      dot.style.background = cluster.color;
      dot.style.left = (cluster.anchor.x + 80) + 'px';
      dot.style.top = (cluster.anchor.y + 30) + 'px';
      surface.appendChild(dot);
      surface.appendChild(lbl);
    });

    // ── SVG strings ──
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'board-strings');
    svg.setAttribute('width', '2800');
    svg.setAttribute('height', '1800');
    svg.style.position = 'absolute';
    svg.style.inset = '0';

    STRINGS.forEach((s) => {
      const fromCard = allCards.find(c => c.clusterIdx === s.from[0] && c.cardIdx === s.from[1]);
      const toCard = allCards.find(c => c.clusterIdx === s.to[0] && c.cardIdx === s.to[1]);
      if (!fromCard || !toCard) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', fromCard.absX + 90);
      line.setAttribute('y1', fromCard.absY + 40);
      line.setAttribute('x2', toCard.absX + 90);
      line.setAttribute('y2', toCard.absY + 40);
      if (s.type === 'dashed') line.classList.add('board-string-dashed');
      if (s.from[0] !== s.to[0]) line.classList.add('board-string-cross');
      svg.appendChild(line);
    });
    surface.appendChild(svg);

    // ── Cards ──
    allCards.forEach((card) => {
      const a = document.createElement('a');
      a.className = 'board-card';
      a.href = card.href;
      a.dataset.cluster = card.clusterIdx;
      a.dataset.href = card.href;
      a.dataset.title = card.title;
      a.dataset.emoji = card.emoji;
      a.style.left = card.absX + 'px';
      a.style.top = card.absY + 'px';
      a.style.setProperty('--rotation', card.rot + 'deg');
      a.style.setProperty('--cluster-color', card.clusterColor);
      a.style.borderTopColor = card.clusterColor;

      if (card.href === currentPage) a.classList.add('board-card-current');
      if (card.hot) a.classList.add('board-card-hot');

      a.innerHTML = `
        <span class="board-card-emoji">${card.emoji}</span>
        <div class="board-card-title">${card.title}</div>
        <div class="board-card-desc">${card.desc}</div>
        <div class="board-card-scent" style="background:${card.clusterColor}20;border-color:${card.clusterColor}40">
          <span class="board-card-scent-arrow" style="color:${card.clusterColor}">→</span>
          <span class="board-card-scent-text">Open</span>
        </div>
      `;

      // ── OS behavior: intercept click → open in doc panel instead of navigating ──
      a.addEventListener('click', (e) => {
        if (IS_HOME || boardOpen) {
          e.preventDefault();
          // index.html → scroll to main content instead of iframe-ing self
          if (card.href === 'index.html') {
            closeDocPanel();
            return;
          }
          openDocPanel(card.href, card.title, card.emoji, card.clusterColor);
        }
        // On sub-pages without board open, normal navigation
      });

      surface.appendChild(a);
    });

    // ══════════════════════════════════════════════
    //  DOCUMENT PANEL (OS Window Manager)
    // ══════════════════════════════════════════════

    function openDocPanel(href, title, emoji, clusterColor) {
      docPanelOpen = true;
      docPanel.classList.add('open');
      docPanel.style.setProperty('--doc-color', clusterColor || 'var(--accent)');
      
      // Loading state
      docLoading.classList.add('active');
      docFrame.style.opacity = '0';
      
      // Breadcrumb
      navHistory.push({ href, title, emoji });
      updateBreadcrumb();
      
      // Load the document in iframe
      docFrame.src = href;
      docFrame.onload = () => {
        docLoading.classList.remove('active');
        docFrame.style.opacity = '1';
        // Inject board-embedded class into iframe body for styling hooks
        try {
          const iframeDoc = docFrame.contentDocument || docFrame.contentWindow.document;
          iframeDoc.body.classList.add('board-embedded');
          // Hide the nav and footer in embedded mode — the board IS the nav
          const nav = iframeDoc.getElementById('site-nav');
          const footer = iframeDoc.getElementById('site-footer');
          const boardTrigger = iframeDoc.querySelector('.board-trigger');
          const boardOverlay = iframeDoc.getElementById('board-overlay');
          if (nav) nav.style.display = 'none';
          if (footer) footer.style.display = 'none';
          if (boardTrigger) boardTrigger.style.display = 'none';
          if (boardOverlay) boardOverlay.style.display = 'none';
          // Intercept internal links to open in the doc panel too
          iframeDoc.querySelectorAll('a[href]').forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref && !linkHref.startsWith('http') && !linkHref.startsWith('#') && !linkHref.startsWith('mailto:') && linkHref.endsWith('.html')) {
              link.addEventListener('click', (ev) => {
                ev.preventDefault();
                const cardInfo = allCards.find(c => c.href === linkHref);
                openDocPanel(
                  linkHref, 
                  cardInfo ? cardInfo.title : linkHref.replace('.html', '').replace(/-/g, ' ').toUpperCase(),
                  cardInfo ? cardInfo.emoji : '📄',
                  cardInfo ? cardInfo.clusterColor : 'var(--accent)'
                );
              });
            }
          });
        } catch (e) { /* cross-origin safety */ }
      };

      // Shift board to the left when panel opens
      world.classList.add('board-shifted');
      
      // Highlight the clicked card
      surface.querySelectorAll('.board-card').forEach(c => {
        c.classList.toggle('board-card-active', c.dataset.href === href);
      });
    }

    function closeDocPanel() {
      docPanelOpen = false;
      docPanel.classList.remove('open');
      docPanel.classList.remove('maximized');
      docFrame.src = 'about:blank';
      world.classList.remove('board-shifted');
      navHistory = [];
      updateBreadcrumb();
      surface.querySelectorAll('.board-card').forEach(c => c.classList.remove('board-card-active'));
    }

    function updateBreadcrumb() {
      if (navHistory.length === 0) {
        docBreadcrumb.innerHTML = '';
        return;
      }
      docBreadcrumb.innerHTML = navHistory.map((item, i) => {
        const isLast = i === navHistory.length - 1;
        return `<span class="crumb${isLast ? ' crumb-active' : ''}" data-idx="${i}">
          ${item.emoji} ${item.title}
        </span>${isLast ? '' : '<span class="crumb-sep">›</span>'}`;
      }).join('');
      // Click breadcrumbs to navigate back
      docBreadcrumb.querySelectorAll('.crumb:not(.crumb-active)').forEach(crumb => {
        crumb.addEventListener('click', () => {
          const idx = parseInt(crumb.dataset.idx);
          const item = navHistory[idx];
          navHistory = navHistory.slice(0, idx);
          openDocPanel(item.href, item.title, item.emoji, docPanel.style.getPropertyValue('--doc-color'));
        });
      });
    }

    // Doc panel buttons
    document.getElementById('doc-back').addEventListener('click', closeDocPanel);
    document.getElementById('doc-close').addEventListener('click', closeDocPanel);
    document.getElementById('doc-maximize').addEventListener('click', () => {
      docPanel.classList.toggle('maximized');
    });
    document.getElementById('doc-newwindow').addEventListener('click', () => {
      if (navHistory.length > 0) {
        window.open(navHistory[navHistory.length - 1].href, '_blank');
      }
    });

    // ── Search filter ──
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      surface.querySelectorAll('.board-card').forEach(card => {
        const title = card.dataset.title.toLowerCase();
        const href = card.dataset.href.toLowerCase();
        const desc = card.querySelector('.board-card-desc')?.textContent.toLowerCase() || '';
        const matches = !q || title.includes(q) || href.includes(q) || desc.includes(q);
        card.style.opacity = matches ? '' : '0.15';
        card.style.filter = matches ? '' : 'grayscale(0.8)';
        card.style.transform = matches ? '' : 'scale(0.85)';
      });
    });

    // ══════════════════════════════════════════════
    //  BOARD OPEN / CLOSE
    // ══════════════════════════════════════════════

    function openBoard() {
      boardOpen = true;
      overlay.classList.add('open');
      fab.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeBoard() {
      if (IS_HOME) return; // Can't close the shell on homepage
      boardOpen = false;
      overlay.classList.remove('open');
      fab.classList.remove('active');
      document.body.style.overflow = '';
      focusedCluster = null;
      closeDocPanel();
    }

    // Auto-open on homepage
    if (IS_HOME) {
      // Board is always-on as the shell; hide the regular page content
      openBoard();
      document.body.classList.add('board-shell-mode');
    }

    fab.addEventListener('click', () => boardOpen ? closeBoard() : openBoard());
    if (overlay.querySelector('.board-close')) {
      overlay.querySelector('.board-close').addEventListener('click', closeBoard);
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (docPanelOpen) { closeDocPanel(); e.preventDefault(); return; }
        if (boardOpen && !IS_HOME) closeBoard();
      }
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); boardOpen ? closeBoard() : openBoard(); }
      if (boardOpen && !docPanelOpen && e.key >= '1' && e.key <= '5') flyToCluster(parseInt(e.key) - 1);
      // Ctrl+F focuses search when board is open
      if (boardOpen && e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    // ── Fly to cluster ──
    function flyToCluster(clusterIdx) {
      const cluster = CLUSTERS[clusterIdx];
      if (!cluster) return;
      focusedCluster = clusterIdx;
      boardScale = 0.85;
      boardOffset.x = -(cluster.anchor.x - window.innerWidth / 2 + 200);
      boardOffset.y = -(cluster.anchor.y - window.innerHeight / 2 + 100);
      updateTransform();
      surface.querySelectorAll('.board-card').forEach(card => {
        const ci = parseInt(card.dataset.cluster);
        card.style.opacity = (ci === clusterIdx) ? '1' : '0.3';
        card.style.filter = (ci === clusterIdx) ? 'none' : 'grayscale(0.6)';
      });
      clusterNav.querySelectorAll('.board-cluster-pill').forEach((pill, i) => {
        pill.classList.toggle('active', i === clusterIdx);
      });
    }

    // Reset focus
    world.addEventListener('dblclick', (e) => {
      if (e.target.closest('.board-card')) return;
      focusedCluster = null;
      boardScale = 0.55;
      boardOffset = { x: 0, y: 0 };
      updateTransform();
      surface.querySelectorAll('.board-card').forEach(card => {
        card.style.opacity = '';
        card.style.filter = '';
        card.style.transform = '';
      });
      clusterNav.querySelectorAll('.board-cluster-pill').forEach(pill => pill.classList.remove('active'));
    });

    // ── Zoom controls ──
    overlay.querySelectorAll('.board-zoom-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.zoom;
        if (action === 'in') boardScale = Math.min(1.5, boardScale + 0.15);
        if (action === 'out') boardScale = Math.max(0.2, boardScale - 0.15);
        if (action === 'reset') {
          boardScale = 0.55;
          boardOffset = { x: 0, y: 0 };
          focusedCluster = null;
          surface.querySelectorAll('.board-card').forEach(c => { c.style.opacity = ''; c.style.filter = ''; c.style.transform = ''; });
        }
        updateTransform();
      });
    });

    // ── Pan ──
    world.addEventListener('mousedown', (e) => {
      if (e.target.closest('.board-card') || e.target.closest('button')) return;
      dragState.active = true;
      dragState.startX = e.clientX - boardOffset.x;
      dragState.startY = e.clientY - boardOffset.y;
      world.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragState.active) return;
      boardOffset.x = e.clientX - dragState.startX;
      boardOffset.y = e.clientY - dragState.startY;
      updateTransform();
    });
    window.addEventListener('mouseup', () => {
      dragState.active = false;
      if (world) world.style.cursor = '';
    });

    // ── Zoom (scroll) ──
    world.addEventListener('wheel', (e) => {
      e.preventDefault();
      boardScale = Math.max(0.2, Math.min(1.5, boardScale - e.deltaY * 0.001));
      updateTransform();
    }, { passive: false });

    function updateTransform() {
      surface.style.transform = `translate(calc(-50% + ${boardOffset.x}px), calc(-50% + ${boardOffset.y}px)) rotateX(8deg) scale(${boardScale})`;
    }

    // ── Touch (improved mobile handling) ──
    let touchStart = null;
    let initialPinchDist = null;
    let initialPinchScale = boardScale;
    let touchMoved = false;

    world.addEventListener('touchstart', (e) => {
      if (e.target.closest('.board-card') || e.target.closest('button')) return;
      touchMoved = false;
      if (e.touches.length === 1) {
        touchStart = { x: e.touches[0].clientX - boardOffset.x, y: e.touches[0].clientY - boardOffset.y };
      }
      if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchScale = boardScale;
      }
    }, { passive: true });

    world.addEventListener('touchmove', (e) => {
      touchMoved = true;
      if (e.touches.length === 1 && touchStart) {
        e.preventDefault();
        boardOffset.x = e.touches[0].clientX - touchStart.x;
        boardOffset.y = e.touches[0].clientY - touchStart.y;
        updateTransform();
      }
      if (e.touches.length === 2 && initialPinchDist) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = dist / initialPinchDist;
        boardScale = Math.max(0.2, Math.min(1.5, initialPinchScale * ratio));
        updateTransform();
      }
    }, { passive: false });

    world.addEventListener('touchend', (e) => {
      touchStart = null;
      initialPinchDist = null;
      // Double-tap to reset on mobile
      if (e.changedTouches.length === 1 && !touchMoved) {
        const now = Date.now();
        if (world._lastTap && (now - world._lastTap) < 300) {
          // Double tap — reset view
          focusedCluster = null;
          boardScale = IS_MOBILE ? 0.38 : 0.55;
          boardOffset = { x: 0, y: 0 };
          updateTransform();
          surface.querySelectorAll('.board-card').forEach(card => {
            card.style.opacity = '';
            card.style.filter = '';
            card.style.transform = '';
          });
          clusterNav.querySelectorAll('.board-cluster-pill').forEach(p => p.classList.remove('active'));
        }
        world._lastTap = now;
      }
    });

    // ── Swipe-to-close on doc panel (mobile) ──
    if (IS_TOUCH) {
      let swipeStartX = 0;
      let swipeStartY = 0;
      docPanel.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          swipeStartX = e.touches[0].clientX;
          swipeStartY = e.touches[0].clientY;
        }
      }, { passive: true });
      docPanel.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const dx = e.changedTouches[0].clientX - swipeStartX;
          const dy = Math.abs(e.changedTouches[0].clientY - swipeStartY);
          // Swipe right to close (> 80px horizontal, < 60px vertical)
          if (dx > 80 && dy < 60 && docPanelOpen) {
            closeDocPanel();
          }
        }
      }, { passive: true });
    }

    // ── Handle orientation changes ──
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        // Auto-adjust scale on orientation change
        if (isMobile && boardScale > 0.5) {
          boardScale = 0.38;
          boardOffset = { x: 0, y: 0 };
          updateTransform();
        }
      }, 200);
    });

    // ── Prevent iOS elastic overscroll on board ──
    overlay.addEventListener('touchmove', (e) => {
      if (!e.target.closest('.doc-frame') && !e.target.closest('.board-cluster-nav')) {
        // Allow scroll inside iframe and cluster nav, block elsewhere
      }
    }, { passive: true });
  }

  // ── Footer ──
  function buildFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    // On homepage in shell mode, hide footer
    if (IS_HOME) { footer.style.display = 'none'; return; }
    footer.innerHTML = `
      <div class="footer-links">
        <a href="index.html">Home</a>
        <a href="evidence.html">Evidence</a>
        <a href="accountability.html">The 504</a>
        <a href="legal.html">Legal</a>
        <a href="timeline.html">Timeline</a>
        <a href="veterans.html">Veterans</a>
        <a href="resources.html">Resources</a>
        <a href="faq.html">FAQ</a>
      </div>
      <p>&copy; 2026 Daniel Perry. Canadian Forces combat veteran. All rights reserved.</p>
      <p>Every statistic is sourced from official Government of Canada publications, 
         Parliamentary testimony, and institutional research. 
         <a href="evidence.html">Verify it yourself</a>.</p>
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { buildBoard(); buildFooter(); });
  } else {
    buildBoard(); buildFooter();
  }
})();
