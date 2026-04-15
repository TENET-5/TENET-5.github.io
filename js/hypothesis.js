/* ═══════════════════════════════════════════════════════
   TENET5 Hypothesis.is Integration
   Adds collaborative document annotation to all investigation pages
   Users can highlight text, add comments, and discuss evidence inline
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';
  if (window.__TENET5_HYPOTHESIS_LOADED) return;
  window.__TENET5_HYPOTHESIS_LOADED = true;

  // Skip on pages where annotation doesn't make sense
  var skip = ['index.html', 'search.html', 'auth-callback.html', 'sitemap.html',
              'chalkboard.html', 'home.html', 'reading-order.html'];
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (skip.indexOf(page) !== -1) return;

  // Hypothesis configuration
  // See: https://h.readthedocs.io/projects/client/en/latest/publishers/config/
  window.hypothesisConfig = function() {
    return {
      // Sidebar opens manually (not auto-open)
      openSidebar: false,
      // Focus on the canonical URL so annotations persist across iframe/direct access
      showHighlights: 'whenSidebarOpen',
      // Branding
      branding: {
        appBackgroundColor: '#0c1220',
        ctaBackgroundColor: '#c41e3a',
        ctaTextColor: '#ffffff',
        selectionFontFamily: 'Inter, system-ui, sans-serif'
      },
      // Enable experimental features
      enableExperimentalNewNoteButton: true,
      // Focus mode: show annotations for current page only
      focus: {
        user: {
          groups: ['__world__']  // public group by default
        }
      }
    };
  };

  // Load Hypothesis client from CDN
  var script = document.createElement('script');
  script.src = 'https://hypothes.is/embed.js';
  script.async = true;
  document.head.appendChild(script);

  // Add a subtle "Annotate" hint on first visit
  if (!sessionStorage.getItem('t5-hyp-seen')) {
    script.onload = function() {
      sessionStorage.setItem('t5-hyp-seen', '1');
      // Show a brief tooltip near the Hypothesis sidebar toggle
      setTimeout(function() {
        var hint = document.createElement('div');
        hint.style.cssText =
          'position:fixed;right:48px;top:80px;padding:8px 14px;background:rgba(196,30,58,0.9);' +
          'color:#fff;font-family:Inter,sans-serif;font-size:13px;border-radius:8px;z-index:100000;' +
          'pointer-events:none;opacity:0;transition:opacity 0.4s;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
        hint.textContent = 'Highlight any text to annotate';
        document.body.appendChild(hint);
        requestAnimationFrame(function() { hint.style.opacity = '1'; });
        setTimeout(function() {
          hint.style.opacity = '0';
          setTimeout(function() { hint.remove(); }, 500);
        }, 4000);
      }, 2000);
    };
  }
})();
