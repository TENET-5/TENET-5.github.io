/* ═══════════════════════════════════════════════════════
     SHARED NAV — Two-Tier Royal Canadian Header
     Red Ensign stripe → Identity band → Navigation bar
     TENET5 — Powered by LIRIL AI
     ═══════════════════════════════════════════════════════ */
(function() {
  if (window.__TENET5_NAV_LOADED) return;
  window.__TENET5_NAV_LOADED = true;

  /* Brand Monogram — T5 in a clean rounded square */
  var crestSVG =
    '<svg class="brand-crest" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs><linearGradient id="t5-gold" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#dcc175"/><stop offset="100%" stop-color="#a07c30"/>' +
    '</linearGradient></defs>' +
    '<rect x="4" y="4" width="72" height="72" rx="14" ry="14" fill="none" stroke="url(#t5-gold)" stroke-width="3"/>' +
    '<rect x="16" y="4" width="48" height="3" rx="1.5" fill="#b91c1c"/>' +
    '<text x="28" y="56" font-family="Space Grotesk,Inter,system-ui,sans-serif" font-size="38" font-weight="700" fill="url(#t5-gold)" letter-spacing="-1">T</text>' +
    '<text x="54" y="38" font-family="IBM Plex Mono,monospace" font-size="18" font-weight="700" fill="#b91c1c">5</text>' +
    '</svg>';

  var headerHTML =
    '<nav class="site-nav" id="site-nav">' +
      '<div class="nav-ensign-stripe"></div>' +
      '<div class="nav-identity">' +
        '<a href="/index.html" class="brand">' +
          '' +
          '<div class="brand-text">' +
            '<span class="brand-title">TENET<sup>5</sup></span>' +
            '<span class="brand-subtitle">Powered by LIRIL AI \u2022 NVIDIA \u2022 Intel</span>' +
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
            '<a href="/institutional-malice.html" id="nav-malice" style="color: #dc2626;">Malice Doctrine</a>' +
            '<a href="/publications.html" id="nav-publications">Publications</a>' +
            '<a href="/ppcli-lawsuit.html" id="nav-kitshop">Kit Shop</a>' +
            '<a href="/kids-guide.html" id="nav-kids" style="color: #facc15;">Simple Guide</a>' +
            '<a href="/cds-accountability.html" id="nav-cds">CDS</a>' +
            '<a href="/follow-the-money.html" id="nav-money" style="color: #facc15;">Follow $</a>' +
            '<a href="/sitemap.html" id="nav-sitemap">All Pages</a>' +
          '</div>' +
          '<div class="nav-group nav-lang" style="margin-left: auto;">' +
            '<select id="lang-selector" onchange="window.setSiteLanguage(this.value)" style="background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border); border-radius: 4px; padding: 0.2rem; font-size: 0.85rem;">' +
              '<option value="en">English</option>' +
              '<option value="fr">Français</option>' +
              '<option value="nf">Newfie</option>' +
            '</select>' +
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
        /* Position dropdown right below the nav bar */
        if (navContent.classList.contains('nav-open')) {
          var siteNav = document.getElementById('site-nav');
          if (siteNav) {
            navContent.style.top = siteNav.getBoundingClientRect().bottom + 'px';
          }
        }
      });
      /* Close mobile nav when any link is tapped */
      navContent.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          hamburger.classList.remove('open');
          navContent.classList.remove('nav-open');
        }
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
