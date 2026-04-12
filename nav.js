/* ═══════════════════════════════════════════════════════
     SHARED NAV — Two-Tier Royal Canadian Header
     Red Ensign stripe → Identity band → Navigation bar
     TENET5 — Powered by LIRIL AI
     ═══════════════════════════════════════════════════════ */
(function() {
  if (window.__TENET5_NAV_LOADED) return;
  window.__TENET5_NAV_LOADED = true;

  /* Caduceus SVG — Staff of Mercury with dual serpents + wings
     Mercury = NATS message bus (mercury.infer)
     Two serpents = dual RTX 5070 Ti GPUs
     Wings = speed of inference
     Staff = SATOR central axis */
  var crestSVG =
    '<svg class="brand-crest" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs>' +
    '<linearGradient id="t5-gold" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#dcc175"/><stop offset="100%" stop-color="#a07c30"/>' +
    '</linearGradient>' +
    '<linearGradient id="t5-red" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#dc2626"/><stop offset="100%" stop-color="#991b1b"/>' +
    '</linearGradient>' +
    '</defs>' +
    /* Staff — central vertical axis (SATOR column) */
    '<rect x="38" y="18" width="4" height="95" rx="2" fill="url(#t5-gold)"/>' +
    '<circle cx="40" cy="14" r="6" fill="url(#t5-gold)" stroke="#a07c30" stroke-width="1"/>' +
    /* Left serpent (GPU0) — sinuous S-curve */
    '<path d="M40 90 C20 82 58 70 28 60 C58 50 20 40 40 32" fill="none" stroke="url(#t5-red)" stroke-width="3" stroke-linecap="round"/>' +
    /* Right serpent (GPU1) — mirror S-curve */
    '<path d="M40 90 C60 82 22 70 52 60 C22 50 60 40 40 32" fill="none" stroke="url(#t5-red)" stroke-width="3" stroke-linecap="round"/>' +
    /* Serpent heads */
    '<circle cx="35" cy="30" r="3" fill="#dc2626"/>' +
    '<circle cx="45" cy="30" r="3" fill="#dc2626"/>' +
    /* Wings — left */
    '<path d="M30 28 C18 20 8 24 4 18 C10 22 16 18 24 22 C16 14 6 16 2 8 C10 14 18 12 26 20Z" fill="url(#t5-gold)" opacity="0.7"/>' +
    /* Wings — right */
    '<path d="M50 28 C62 20 72 24 76 18 C70 22 64 18 56 22 C64 14 74 16 78 8 C70 14 62 12 54 20Z" fill="url(#t5-gold)" opacity="0.7"/>' +
    /* Base — small orb */
    '<circle cx="40" cy="113" r="4" fill="url(#t5-gold)" stroke="#a07c30" stroke-width="0.5"/>' +
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
