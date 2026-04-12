/* ═══════════════════════════════════════════════════════
     SHARED NAV — Two-Tier Royal Canadian Header
     Red Ensign stripe → Identity band → Navigation bar
     TENET5 — Powered by LIRIL AI
     ═══════════════════════════════════════════════════════ */
(function() {
  if (window.__TENET5_NAV_LOADED) return;
  window.__TENET5_NAV_LOADED = true;

  /* Heraldic Crest SVG — Crown + Red Shield + Gold Maple Leaf
     Crown = authority / sovereignty
     Shield = protection / accountability
     Maple Leaf = Canada
     Gold = truth / integrity */
  var crestSVG =
    '<svg class="brand-crest" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs>' +
    '<linearGradient id="t5-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0d478"/><stop offset="50%" stop-color="#c9a84c"/><stop offset="100%" stop-color="#8b6914"/></linearGradient>' +
    '<linearGradient id="t5-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e82040"/><stop offset="100%" stop-color="#8b1225"/></linearGradient>' +
    '<linearGradient id="t5-navy" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a3a6b"/><stop offset="100%" stop-color="#0d1f3c"/></linearGradient>' +
    '<radialGradient id="t5-jewel" cx="50%" cy="30%" r="50%"><stop offset="0%" stop-color="#ff4060"/><stop offset="100%" stop-color="#8b1225"/></radialGradient>' +
    '</defs>' +
    /* Crown base band */
    '<rect x="52" y="56" width="96" height="14" rx="3" fill="url(#t5-gold)" stroke="#8b6914" stroke-width="0.8"/>' +
    '<rect x="56" y="58" width="88" height="10" rx="2" fill="none" stroke="rgba(240,212,120,0.3)" stroke-width="0.5"/>' +
    /* Crown points */
    '<path d="M56 56 L62 18 L76 44 L100 4 L124 44 L138 18 L144 56Z" fill="url(#t5-gold)" stroke="#8b6914" stroke-width="1"/>' +
    /* Crown arches */
    '<path d="M66 56 Q78 36 90 56" fill="none" stroke="rgba(139,105,20,0.5)" stroke-width="0.8"/>' +
    '<path d="M90 56 Q100 32 110 56" fill="none" stroke="rgba(139,105,20,0.5)" stroke-width="0.8"/>' +
    '<path d="M110 56 Q122 36 134 56" fill="none" stroke="rgba(139,105,20,0.5)" stroke-width="0.8"/>' +
    /* Crown jewels */
    '<circle cx="100" cy="14" r="5" fill="url(#t5-jewel)" stroke="#f0d478" stroke-width="1"/>' +
    '<circle cx="100" cy="14" r="2" fill="rgba(255,255,255,0.3)"/>' +
    '<circle cx="74" cy="32" r="3.5" fill="url(#t5-navy)" stroke="#f0d478" stroke-width="0.8"/>' +
    '<circle cx="126" cy="32" r="3.5" fill="url(#t5-navy)" stroke="#f0d478" stroke-width="0.8"/>' +
    '<circle cx="62" cy="24" r="2.5" fill="#c41e3a" stroke="#f0d478" stroke-width="0.6"/>' +
    '<circle cx="138" cy="24" r="2.5" fill="#c41e3a" stroke="#f0d478" stroke-width="0.6"/>' +
    /* Shield body */
    '<path d="M36 78 L36 168 Q36 210 100 244 Q164 210 164 168 L164 78Z" fill="url(#t5-red)" stroke="url(#t5-gold)" stroke-width="4"/>' +
    /* Shield inner border */
    '<path d="M44 84 L44 166 Q44 204 100 234 Q156 204 156 166 L156 84Z" fill="none" stroke="rgba(201,168,76,0.25)" stroke-width="1.2"/>' +
    /* Shield chief band */
    '<path d="M44 84 L156 84 L156 104 L44 104Z" fill="rgba(0,0,0,0.12)"/>' +
    /* Maple leaf */
    '<g transform="translate(100,158) scale(1.1)">' +
    '<path d="M0-42 L3.5-30 L14-34 L9.5-22 L22-18 L14-12 L18-2 L8-6 L5.5 8 L0 2 L-5.5 8 L-8-6 L-18-2 L-14-12 L-22-18 L-9.5-22 L-14-34 L-3.5-30Z" fill="#c9a84c" stroke="#a07c30" stroke-width="0.8"/>' +
    '<line x1="0" y1="-38" x2="0" y2="8" stroke="rgba(139,105,20,0.5)" stroke-width="0.8"/>' +
    '<rect x="-2" y="6" width="4" height="16" rx="1.5" fill="#c9a84c" stroke="#a07c30" stroke-width="0.5"/>' +
    '</g>' +
    /* VERITAS text */
    '<text x="100" y="98" text-anchor="middle" fill="rgba(201,168,76,0.5)" font-family="Georgia,serif" font-size="11" font-weight="700" letter-spacing="4">VERITAS</text>' +
    /* Motto scroll */
    '<path d="M48 238 Q58 228 80 232 L100 230 L120 232 Q142 228 152 238 L148 244 Q130 236 120 238 L100 240 L80 238 Q70 236 52 244Z" fill="url(#t5-gold)" stroke="#8b6914" stroke-width="0.8"/>' +
    '<path d="M52 244 L46 248 L52 246Z M148 244 L154 248 L148 246Z" fill="url(#t5-gold)" stroke="#8b6914" stroke-width="0.5"/>' +
    '<text x="100" y="240" text-anchor="middle" fill="#1a1a2e" font-family="Georgia,serif" font-size="7.5" font-weight="700" letter-spacing="1.5">ACCOUNTABILITY</text>' +
    '</svg>';

  var headerHTML =
    '<nav class="site-nav" id="site-nav">' +
      '<div class="nav-ensign-stripe"></div>' +
      '<div class="nav-identity">' +
        '<a href="/index.html" class="brand">' +
          crestSVG +
          '<div class="brand-text">' +
            '<span class="brand-title">TENET<sup>5</sup></span>' +
            '<span class="brand-subtitle">Powered by LIRIL AI \u2022 OSINT Platform</span>' +
          '</div>' +
        '</a>' +
      '</div>' +
      '<div class="nav-bar">' +
        '<div class="nav-content">' +
          '<div class="nav-group nav-primary">' +
            '<a href="/index.html" id="nav-home">Home</a>' +
            '<a href="/records.html" id="nav-records">Records DB</a>' +
            '<a href="/maid-accountability.html" id="nav-maid">MAID Report</a>' +
            '<a href="/rcmp-commissioners.html" id="nav-rcmp">RCMP</a>' +
          '</div>' +
          '<div class="nav-group">' +
            '<a href="/arrivecan.html" id="nav-arrivecan">ArriveCAN</a>' +
            '<a href="/senate-expenses.html" id="nav-senate">Senate</a>' +
            '<a href="/ag-findings.html" id="nav-ag">AG Findings</a>' +
            '<a href="/phoenix-pay.html" id="nav-phoenix">Phoenix Pay</a>' +
            '<a href="/foreign-interference.html" id="nav-foreign">Foreign Interference</a>' +
          '</div>' +
          '<div class="nav-group nav-tools">' +
            '<a href="/s504-covey-bae.html" id="nav-504">s.504</a>' +
            '<a href="/publications.html" id="nav-publications">Publications</a>' +
            '<a href="/ppcli-lawsuit.html" id="nav-kitshop">Kit Shop</a>' +
            '<a href="/kids-guide.html" id="nav-kids" style="color: #facc15;">Simple Guide</a>' +
          '</div>' +
        '</div>' +
        '<button class="nav-hamburger" id="nav-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</nav>';

  function initNav() {
    var frame = document.getElementById('site-header-frame') ||
                document.getElementById('page-header-placeholder');
    if (frame) {
      frame.outerHTML = headerHTML;
    } else {
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    /* Hamburger toggle — single clean listener */
    var hamburger = document.getElementById('nav-hamburger');
    var navContent = document.querySelector('.site-nav .nav-content');
    if (hamburger && navContent) {
      hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('open');
        navContent.classList.toggle('nav-open');
      });
    }

    /* Highlight active nav link + set target for frame shell */
    var isFrameShell = !!document.getElementById('content_frame');
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var activePage = path;
    if (isFrameShell) {
      try {
        var iframe = document.getElementById('content_frame');
        if (iframe && iframe.contentWindow) {
          activePage = iframe.contentWindow.location.pathname.split('/').pop() || 'home.html';
        }
      } catch(e) {}
    }

    document.querySelectorAll('.site-nav a:not(.brand)').forEach(function(a) {
      if (isFrameShell) {
        a.setAttribute('target', 'content_frame');
        if (a.getAttribute('href').replace(/^\//, '') === 'index.html') {
          a.setAttribute('href', 'home.html');
        }
      }
      var linkPage = a.getAttribute('href').replace(/^\//, '');
      if (linkPage === activePage) a.classList.add('active');
    });

    /* Brand link: in frame shell, load home.html into iframe */
    var brandLink = document.querySelector('.site-nav .brand');
    if (brandLink && isFrameShell) {
      brandLink.setAttribute('target', 'content_frame');
      brandLink.setAttribute('href', 'home.html');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
