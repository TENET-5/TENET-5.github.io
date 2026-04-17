/* ═══════════════════════════════════════════════════════
     SHARED NAV — Two-Tier Royal Canadian Header
     Red Ensign stripe → Identity band → Navigation bar
     TENET5 — Powered by LIRIL AI

     ⚠️  DO NOT RE-ADD: FLAG button, language selector, theme slider,
         or any other interactive widget. Site is READ-ONLY.
         Rule established 2026-04-15. See CLAUDE.md.

     Modified: 2026-04-17 — Remove flag/lang/theme interactive widgets
                            per "0 interactions from user" directive.
                            Compact nav to 15 links to prevent overflow.
     ═══════════════════════════════════════════════════════ */
(function() {
  if (window.__TENET5_NAV_LOADED) return;
  window.__TENET5_NAV_LOADED = true;

  var headerHTML =
    '<nav class="site-nav" id="site-nav">' +
      '<div class="nav-ensign-stripe"></div>' +
      '<div class="nav-identity">' +
        '<a href="/index.html" class="brand">' +
          '<div class="brand-text">' +
            '<span class="brand-title">TENET<sup>5</sup></span>' +
            '<span class="brand-subtitle">Powered by LIRIL AI \u2022 NVIDIA \u2022 Intel</span>' +
          '</div>' +
        '</a>' +
        '<div class="nav-status-stack" aria-label="Platform status">' +
          '<span class="nav-status-pill" style="color:#22d3ee;border-color:rgba(34,211,238,0.4);font-weight:700;">[AI]</span>' +
          '<span class="nav-status-pill nav-status-live">Live OSINT</span>' +
          '<span class="nav-status-pill">LIRIL narration</span>' +
          '<span class="nav-status-pill" style="color:#a855f7;border-color:rgba(168,85,247,0.3);">[NV-QUANTUM]</span>' +
        '</div>' +
      '</div>' +
      '<div class="nav-bar">' +
        '<div class="nav-content">' +
          '<div class="nav-group nav-primary">' +
            '<a href="/index.html" id="nav-home">Home</a>' +
            '<a href="/search.html" id="nav-search">Search</a>' +
            '<a href="/records.html" id="nav-records">Records</a>' +
            '<a href="/findings.html" id="nav-findings">Findings</a>' +
          '</div>' +
          '<div class="nav-group">' +
            '<a href="/maid-accountability.html" id="nav-maid">MAID</a>' +
            '<a href="/geneva-vs-jails.html" id="nav-geneva" style="color:#c9a84c;">Geneva vs Jails</a>' +
            '<a href="/genocide-evidence.html" id="nav-genocide" style="color:#ef4444;">Genocide</a>' +
            '<a href="/disability-genocide.html" id="nav-disability">Disability</a>' +
          '</div>' +
          '<div class="nav-group">' +
            '<a href="/foreign-interference.html" id="nav-foreign">Foreign</a>' +
            '<a href="/follow-the-money.html" id="nav-money" style="color:#facc15;">Follow $</a>' +
            '<a href="/cfnis.html" id="nav-cfnis">CFNIS</a>' +
            '<a href="/corruption.html" id="nav-corruption" style="color:#c9a84c;">Corruption</a>' +
          '</div>' +
          '<div class="nav-group nav-tools">' +
            '<a href="/accountability.html" id="nav-504">504</a>' +
            '<a href="/network-analysis.html" id="nav-network">Network</a>' +
            '<a href="/sitemap.html" id="nav-sitemap" style="color:#22d3ee;">All Pages</a>' +
          '</div>' +
          '<div class="nav-auth" id="nav-auth"></div>' +
        '</div>' +
        '<button class="nav-hamburger" id="nav-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</nav>';

  /* Flag-button stub: if anything on the page still calls the old FLAG handler,
     route it to a no-op so no broken interactions leak. */
  if (!window.__TENET5_FLAG_BUG) {
    window.__TENET5_FLAG_BUG = function() { return false; };
  }
  /* Lang setter stub: same reason, so legacy code doesn't throw. */
  if (!window.setSiteLanguage) {
    window.setSiteLanguage = function() { return false; };
  }

  function initNav() {
    var frame = document.getElementById('site-header-frame') ||
                document.getElementById('page-header-placeholder');
    if (frame) {
      frame.outerHTML = headerHTML;
    } else {
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    /* Hamburger toggle */
    var hamburger = document.getElementById('nav-hamburger');
    var navContent = document.querySelector('.site-nav .nav-content');
    if (hamburger && navContent) {
      hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('open');
        navContent.classList.toggle('nav-open');
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

    /* Wheel-to-horizontal-scroll on nav — for the rare overflow case */
    if (navContent) {
      navContent.addEventListener('wheel', function(e) {
        if (navContent.classList.contains('nav-open')) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        if (navContent.scrollWidth <= navContent.clientWidth) return;
        e.preventDefault();
        navContent.scrollLeft += e.deltaY;
      }, { passive: false });
    }

    /* Active link highlight + frame-shell target rewiring */
    var isFrameShell = !!document.getElementById('content_frame');
    var isInIframe = window !== window.top;
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
      }
      if (isFrameShell || isInIframe) {
        if (a.getAttribute('href').replace(/^\//, '') === 'index.html') {
          a.setAttribute('href', 'home.html');
        }
      }
      var linkPage = a.getAttribute('href').replace(/^\//, '');
      if (linkPage === activePage) a.classList.add('active');
    });

    /* Brand link: in frame context, point to home.html */
    var brandLink = document.querySelector('.site-nav .brand');
    if (brandLink && (isFrameShell || isInIframe)) {
      if (isFrameShell) brandLink.setAttribute('target', 'content_frame');
      brandLink.setAttribute('href', 'home.html');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
