/* ═══════════════════════════════════════════════════════════════════════
   TENET5 Presentation System — Performance Optimization Layer
   
   Lazy loads sprites, debounces scroll events, and optimizes detection
   for faster first-paint and smoother 120-page investigation flow.
   ═══════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';
  if (window.__TENET5_PRESENTATION_PERF_LOADED) return;
  window.__TENET5_PRESENTATION_PERF_LOADED = true;

  // Request animation frame debouncing for scroll events
  var scrollTicking = false;
  var scrollTimeout = null;

  function debounceScroll(callback, wait) {
    return function() {
      if (!scrollTicking) {
        scrollTicking = true;
        callback();
        
        scrollTimeout = setTimeout(function() {
          scrollTicking = false;
        }, wait);
      }
    };
  }

  // Lazy-load sprite animations only for visible slides
  function lazyLoadSprites() {
    if (!document.body.classList.contains('pres-active')) return;
    
    var visibleSlides = document.querySelectorAll('.pres-slide.pres-visible');
    visibleSlides.forEach(function(slide) {
      if (!slide.dataset.spritesChecked) {
        slide.dataset.spritesChecked = 'true';
        // Trigger sprite loading only when slide is in viewport
        requestAnimationFrame(function() {
          var type = detectSpriteType(slide);
          if (type && !slide.querySelector('.pres-sprite')) {
            triggerSprites(slide);
          }
        });
      }
    });
  }

  // Performance metrics collection
  window.__TENET5_PRESENTATION_METRICS = {
    slideCount: 0,
    activeSlideIndex: 0,
    averageScrollTime: 0,
    spritesTriggered: 0,
    navigationEvents: 0,
    engagementStats: {}, // Stores dwell time per slide label/narration
    _activeSlideTimestamps: {},

    recordSpriteLoad: function() {
      this.spritesTriggered++;
    },

    recordNavigation: function() {
      this.navigationEvents++;
    },

    report: function() {
      return {
        slides: this.slideCount,
        current: this.activeSlideIndex,
        avgScroll: this.averageScrollTime + 'ms',
        sprites: this.spritesTriggered,
        navigations: this.navigationEvents,
        engagement: this.engagementStats
      };
    },

    // Save analytics locally for empirical sync
    flushToStorage: function() {
      try {
        var existing = JSON.parse(localStorage.getItem('tenet5_analytics') || '{}');
        for (var key in this.engagementStats) {
          existing[key] = (existing[key] || 0) + this.engagementStats[key];
        }
        localStorage.setItem('tenet5_analytics', JSON.stringify(existing));
      } catch (e) {}
    }
  };

  // ── Engagement Tracker (IntersectionObserver) ──
  function initEngagementTracker() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var el = entry.target;
        var slideKey = el.getAttribute('data-narrate') || el.querySelector('h1,h2,h3')?.textContent || 'Untitled Slide';
        // Truncate key for storage efficiency
        slideKey = slideKey.substring(0, 60);

        if (entry.isIntersecting) {
            // Started viewing
            window.__TENET5_PRESENTATION_METRICS._activeSlideTimestamps[slideKey] = Date.now();
        } else {
            // Stopped viewing
            var start = window.__TENET5_PRESENTATION_METRICS._activeSlideTimestamps[slideKey];
            if (start) {
                var dwellTimeMs = Date.now() - start;
                // Only count deliberate engagement > 1.5 seconds
                if (dwellTimeMs > 1500) {
                    var stats = window.__TENET5_PRESENTATION_METRICS.engagementStats;
                    stats[slideKey] = (stats[slideKey] || 0) + (dwellTimeMs / 1000);
                }
                delete window.__TENET5_PRESENTATION_METRICS._activeSlideTimestamps[slideKey];
            }
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.pres-slide, [data-narrate]').forEach(function(el) {
      observer.observe(el);
    });

    window.addEventListener('beforeunload', function() {
      // Flush active viewing sessions
      for (var key in window.__TENET5_PRESENTATION_METRICS._activeSlideTimestamps) {
        var start = window.__TENET5_PRESENTATION_METRICS._activeSlideTimestamps[key];
        var dwellTimeMs = Date.now() - start;
        if (dwellTimeMs > 1500) {
            window.__TENET5_PRESENTATION_METRICS.engagementStats[key] = (window.__TENET5_PRESENTATION_METRICS.engagementStats[key] || 0) + (dwellTimeMs / 1000);
        }
      }
      window.__TENET5_PRESENTATION_METRICS.flushToStorage();
    });
  }

  // Hook into scroll events after presentation loads
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (document.body.classList.contains('pres-active') || document.querySelector('[data-narrate]')) {
        var lazyLoadDebounced = debounceScroll(lazyLoadSprites, 300);
        window.addEventListener('scroll', lazyLoadDebounced, { passive: true });
        initEngagementTracker();
      }
    }, 500);
  });

  // Export metrics for debugging
  window.__TENET5_getPresentationMetrics = function() {
    return window.__TENET5_PRESENTATION_METRICS.report();
  };

  console.log('[TENET5 Presentation] Performance optimization layer loaded');
})();
