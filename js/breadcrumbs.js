/* ═══════════════════════════════════════════════════════
   TENET5 Breadcrumbs — Auto-generate breadcrumb trail
   from page title and URL structure.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_BREADCRUMBS_LOADED) return;
  window.__TENET5_BREADCRUMBS_LOADED = true;

  function slugToTitle(slug) {
    return slug
      .replace(/\.html$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
  }

  function buildBreadcrumbs() {
    /* Don't inject if already present */
    if (document.querySelector('.tnt-breadcrumb')) return;
    /* Don't inject on frame-shell (index.html) */
    if (document.getElementById('content_frame')) return;

    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';
    if (page === 'index.html' || page === 'home.html') return;

    var title = slugToTitle(page);
    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) {
      title = h1.textContent.trim().substring(0, 60);
    }

    var nav = document.createElement('nav');
    nav.className = 'tnt-breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.innerHTML =
      '<a href="index.html">Home</a>' +
      '<span class="tnt-bc-sep"> / </span>' +
      '<span class="tnt-bc-current">' + title + '</span>';

    /* Insert after pillar nav or at top of body */
    var pillarNav = document.querySelector('.tnt-pillar-nav');
    if (pillarNav && pillarNav.nextSibling) {
      pillarNav.parentNode.insertBefore(nav, pillarNav.nextSibling);
    } else {
      var firstSection = document.querySelector('main, article, section, .hero, .content');
      if (firstSection) {
        firstSection.parentNode.insertBefore(nav, firstSection);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildBreadcrumbs);
  } else {
    buildBreadcrumbs();
  }

  console.log('[breadcrumbs] Breadcrumb trail injected.');
})();
