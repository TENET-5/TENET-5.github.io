/* ═══════════════════════════════════════════════════════
   TENET5 Breadcrumbs — A→B oriented trail
   Home · Daily Brief · (optional Paths) · Current page
   QUANTANIUM ice; no neon.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__TENET5_BREADCRUMBS_LOADED) return;
  window.__TENET5_BREADCRUMBS_LOADED = true;

  function slugToTitle(slug) {
    return slug
      .replace(/\.html$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function buildBreadcrumbs() {
    if (document.querySelector('.tnt-breadcrumb')) return;
    if (document.getElementById('content_frame')) return;

    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';
    if (page === 'index.html' || page === 'home.html' || page === 'daily-briefing.html') return;

    var title = slugToTitle(page);
    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) {
      title = h1.textContent.trim().substring(0, 60);
    }

    var sep = '<span class="tnt-bc-sep" aria-hidden="true"> / </span>';
    var html =
      '<a href="index.html">Home</a>' + sep +
      '<a href="daily-briefing.html">Daily Brief</a>' + sep;

    if (page === 'experience.html' || page === 'reading-order.html') {
      html += '<span class="tnt-bc-current">' + title + '</span>';
    } else {
      html +=
        '<a href="experience.html">A to B</a>' + sep +
        '<span class="tnt-bc-current">' + title + '</span>';
    }

    var nav = document.createElement('nav');
    nav.className = 'tnt-breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.innerHTML = html;

    var pillarNav = document.querySelector('.tnt-pillar-nav');
    if (pillarNav && pillarNav.parentNode) {
      pillarNav.parentNode.insertBefore(nav, pillarNav.nextSibling);
    } else {
      var firstSection = document.querySelector('main, article, section, .hero, .content');
      if (firstSection && firstSection.parentNode) {
        firstSection.parentNode.insertBefore(nav, firstSection);
      } else if (document.body) {
        document.body.insertBefore(nav, document.body.firstChild);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildBreadcrumbs);
  } else {
    buildBreadcrumbs();
  }
})();
