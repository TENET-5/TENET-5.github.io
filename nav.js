/* ═══════════════════════════════════════════════════════
     SHARED NAV — Two-Tier Royal Canadian Header
     Red Ensign stripe → Identity band → Navigation bar
     TENET5 — Powered by LIRIL AI
     ═══════════════════════════════════════════════════════ */
(function() {
  if (window.__TENET5_NAV_LOADED) return;
  window.__TENET5_NAV_LOADED = true;

  /* Heraldic Crest SVG — Tactical Chess Pawn with Man-Pack Radio
     As requested, the crest has been converted into a pawn with a military radio. */
  var crestSVG =
    '<svg class="brand-crest" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs><linearGradient id="t5-gold" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#dcc175"/><stop offset="100%" stop-color="#a07c30"/>' +
    '</linearGradient></defs>' +
    /* Antenna */
    '<line x1="30" y1="55" x2="20" y2="15" stroke="url(#t5-gold)" stroke-width="2"/>' +
    /* Backpack Radio */
    '<rect x="25" y="55" width="15" height="25" rx="3" fill="#c41e3a" stroke="url(#t5-gold)" stroke-width="2"/>' +
    '<rect x="28" y="52" width="4" height="3" fill="url(#t5-gold)"/>' +
    /* Handset Wire */
    '<path d="M35 60 Q45 65 40 70 T45 80" fill="none" stroke="url(#t5-gold)" stroke-width="1.5" stroke-dasharray="2,1"/>' +
    /* Pawn Base */
    '<path d="M30 110 L70 110 L65 95 L35 95 Z" fill="url(#t5-gold)"/>' +
    /* Red Ring */
    '<path d="M32 95 Q50 100 68 95 L63 90 Q50 95 37 90 Z" fill="#c41e3a"/>' +
    /* Pawn Body */
    '<path d="M37 90 C37 60, 45 45, 50 40 C55 45, 63 60, 63 90 Z" fill="url(#t5-gold)"/>' +
    /* Collar & Head */
    '<rect x="42" y="38" width="16" height="4" rx="2" fill="#c41e3a"/>' +
    '<circle cx="50" cy="26" r="12" fill="url(#t5-gold)"/>' +
    '</svg>';

  var headerHTML =
    '<nav class="site-nav" id="site-nav">' +
      '<div class="nav-ensign-stripe"></div>' +
      '<div class="nav-identity">' +
        '<a href="/index.html" class="brand">' +
          '' +
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
