/* ═══════════════════════════════════════════════════════
   TENET5 Presenter — Converts any page into a presentation
   Finds all sections/h2s and creates slide-like navigation
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // Don't run on home.html (has its own scene engine) or index.html (shell)
    var page = window.location.pathname.split('/').pop() || '';
    if (page === 'home.html' || page === 'index.html' || page === '') return;

    // Find all major sections on the page
    var sections = document.querySelectorAll(
      'section, .timeline-section, .glass-panel, [data-chapter], .chapter'
    );
    if (sections.length < 3) return; // Not enough sections to present

    // Create presenter toolbar at bottom of page
    var toolbar = document.createElement('div');
    toolbar.id = 'presenter-toolbar';
    toolbar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:48px;' +
      'background:rgba(9,9,11,0.95);border-top:1px solid rgba(255,255,255,0.06);' +
      'display:flex;align-items:center;justify-content:space-between;padding:0 24px;' +
      'z-index:9998;backdrop-filter:blur(8px);font-family:Inter,sans-serif;' +
      'opacity:0;transition:opacity 0.3s;pointer-events:none;';

    // Progress bar
    var progressBar = document.createElement('div');
    progressBar.style.cssText = 'position:absolute;top:0;left:0;height:2px;' +
      'background:linear-gradient(90deg,#b91c1c,#b8860b);transition:width 0.3s;width:0%;';
    toolbar.appendChild(progressBar);

    // Section counter
    var counter = document.createElement('span');
    counter.style.cssText = 'font-size:0.75rem;color:rgba(255,255,255,0.5);font-family:JetBrains Mono,monospace;';
    counter.textContent = '0 / ' + sections.length;
    toolbar.appendChild(counter);

    // Section dots
    var dots = document.createElement('div');
    dots.style.cssText = 'display:flex;gap:4px;align-items:center;';
    sections.forEach(function(_, i) {
      var dot = document.createElement('div');
      dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.15);' +
        'cursor:pointer;transition:all 0.2s;';
      dot.addEventListener('click', function() {
        sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      dots.appendChild(dot);
    });
    toolbar.appendChild(dots);

    // Keyboard hint
    var hint = document.createElement('span');
    hint.style.cssText = 'font-size:0.65rem;color:rgba(255,255,255,0.3);';
    hint.textContent = 'Scroll to explore';
    toolbar.appendChild(hint);

    document.body.appendChild(toolbar);

    // Show toolbar after first scroll
    var shown = false;
    window.addEventListener('scroll', function() {
      if (!shown && window.scrollY > 100) {
        shown = true;
        toolbar.style.opacity = '1';
        toolbar.style.pointerEvents = 'auto';
      }

      // Update progress and active dot
      var scrollY = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(progress, 100) + '%';

      // Find active section
      var activeDot = -1;
      sections.forEach(function(s, i) {
        var rect = s.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom > 0) {
          activeDot = i;
        }
      });

      // Update dots
      var allDots = dots.children;
      for (var i = 0; i < allDots.length; i++) {
        if (i === activeDot) {
          allDots[i].style.background = '#b91c1c';
          allDots[i].style.transform = 'scale(1.5)';
        } else if (i < activeDot) {
          allDots[i].style.background = 'rgba(185,28,28,0.4)';
          allDots[i].style.transform = 'scale(1)';
        } else {
          allDots[i].style.background = 'rgba(255,255,255,0.15)';
          allDots[i].style.transform = 'scale(1)';
        }
      }

      counter.textContent = (activeDot + 1) + ' / ' + sections.length;
    }, { passive: true });
  });
})();
