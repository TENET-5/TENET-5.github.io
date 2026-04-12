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
        navigations: this.navigationEvents
      };
    }
  };

  // Hook into scroll events after presentation loads
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (document.body.classList.contains('pres-active')) {
        var lazyLoadDebounced = debounceScroll(lazyLoadSprites, 300);
        window.addEventListener('scroll', lazyLoadDebounced, { passive: true });
      }
    }, 500);
  });

  // Export metrics for debugging
  window.__TENET5_getPresentationMetrics = function() {
    return window.__TENET5_PRESENTATION_METRICS.report();
  };

  console.log('[TENET5 Presentation] Performance optimization layer loaded');
})();
