/* ═══════════════════════════════════════════════════════
     SHARED NAV — Two-Tier Royal Canadian Header
     Red Ensign stripe → Identity band → Navigation bar
     TENET5 — Powered by LIRIL AI
     ═══════════════════════════════════════════════════════ */
(function() {
  if (window.__TENET5_NAV_LOADED) return;
  window.__TENET5_NAV_LOADED = true;

  /* Heraldic Crest SVG — Crown + Red Shield + Gold Maple Leaf */
  var crestSVG =
    '<svg class="brand-crest" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs><linearGradient id="cap-cg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#dcc175"/><stop offset="100%" stop-color="#a07c30"/>' +
    '</linearGradient></defs>' +
    /* Crown */
    '<path d="M28 30 L33 8 L41 24 L50 2 L59 24 L67 8 L72 30Z" fill="url(#cap-cg)"/>' +
    '<rect x="26" y="30" width="48" height="8" rx="2" fill="url(#cap-cg)"/>' +
    '<circle cx="50" cy="10" r="2.5" fill="#c41e3a"/>' +
    '<circle cx="37" cy="18" r="1.8" fill="#1a3a6b"/><circle cx="63" cy="18" r="1.8" fill="#1a3a6b"/>' +
    /* Red shield */
    '<path d="M18 42 L18 82 Q18 102 50 118 Q82 102 82 82 L82 42Z" fill="#c41e3a" stroke="url(#cap-cg)" stroke-width="3"/>' +
    /* Gold maple leaf */
    '<path d="M50 52 L53 60 L62 56 L57 64 L66 70 L57 69 L55 80 L50 73 L45 80 L43 69 L34 70 L43 64 L38 56 L47 60Z" fill="#c9a84c"/>' +
    '<rect x="48.5" y="78" width="3" height="10" rx="1" fill="#c9a84c"/>' +
    /* Inner shield trace */
    '<path d="M23 46 L23 80 Q23 98 50 112 Q77 98 77 80 L77 46Z" fill="none" stroke="#c9a84c" stroke-width="0.7" opacity="0.35"/>' +
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
