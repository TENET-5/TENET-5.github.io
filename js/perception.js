/* ═══════════════════════════════════════════════════════
   TENET5 Perception Engine — Viewport & Engagement Tracking
   Tracks which sections users actually read, how far they
   scroll, and engagement time per slide.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_PERCEPTION_LOADED) return;
  window.__TENET5_PERCEPTION_LOADED = true;

  var metrics = {
    page: (window.location.pathname.split('/').pop() || 'index.html'),
    sessionStart: Date.now(),
    maxScrollDepth: 0,
    sectionsViewed: [],
    engagementMs: 0,
    slideViews: {}
  };

  /* Track scroll depth */
  var scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      requestAnimationFrame(function() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var depth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        if (depth > metrics.maxScrollDepth) {
          metrics.maxScrollDepth = depth;
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  /* Track section visibility */
  try {
    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id || entry.target.className.split(' ')[0] || 'unnamed';
          if (metrics.sectionsViewed.indexOf(id) === -1) {
            metrics.sectionsViewed.push(id);
          }
        }
      });
    }, { threshold: 0.25 });

    document.querySelectorAll('section, article, [data-narrate]').forEach(function(el) {
      sectionObserver.observe(el);
    });
  } catch(e) {}

  /* Track engagement time */
  var lastActive = Date.now();
  var IDLE_THRESHOLD = 30000; /* 30s */
  ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(function(evt) {
    document.addEventListener(evt, function() {
      var now = Date.now();
      if (now - lastActive < IDLE_THRESHOLD) {
        metrics.engagementMs += (now - lastActive);
      }
      lastActive = now;
    }, { passive: true });
  });

  /* Public API */
  window.__TENET5_PERCEPTION = {
    getMetrics: function() {
      return Object.assign({}, metrics, {
        totalTimeMs: Date.now() - metrics.sessionStart,
        engagementSeconds: Math.round(metrics.engagementMs / 1000)
      });
    }
  };

  console.log('[perception] Engagement tracking active.');
})();
