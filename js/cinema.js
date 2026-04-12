/* ═══════════════════════════════════════════════════════
   TENET5 Cinematic Engine — Scroll-Driven Storytelling
   Hollywood-grade scroll animations + parallax + reveals
   SEED 118400 | Powered by LIRIL AI
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Intersection Observer for scroll reveals ─────────
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stagger children
        var children = entry.target.querySelectorAll('.stagger-child');
        children.forEach(function(child, i) {
          child.style.transitionDelay = (i * 0.08) + 's';
          child.classList.add('revealed');
        });
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  // ── Counter animation ────────────────────────────────
  function animateCounter(el, target, duration) {
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        var target = parseInt(entry.target.dataset.target || entry.target.textContent.replace(/,/g, ''));
        var duration = parseInt(entry.target.dataset.duration || '2000');
        animateCounter(entry.target, target, duration);
      }
    });
  }, { threshold: 0.5 });

  // ── Parallax scroll ──────────────────────────────────
  var parallaxElements = [];
  function updateParallax() {
    var scrollY = window.scrollY;
    parallaxElements.forEach(function(item) {
      var speed = parseFloat(item.el.dataset.parallax || '0.3');
      var offset = scrollY * speed;
      item.el.style.transform = 'translateY(' + offset + 'px)';
    });
  }

  // ── Typewriter effect ────────────────────────────────
  function typewriter(el, text, speed) {
    var i = 0;
    el.textContent = '';
    el.style.borderRight = '2px solid var(--accent, #b91c1c)';
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed || 30);
      } else {
        // Blink cursor then remove
        setTimeout(function() { el.style.borderRight = 'none'; }, 2000);
      }
    }
    type();
  }

  var typewriterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        entry.target.dataset.typed = 'true';
        var text = entry.target.dataset.typetext || entry.target.textContent;
        typewriter(entry.target, text, parseInt(entry.target.dataset.typespeed || '30'));
      }
    });
  }, { threshold: 0.5 });

  // ── Progress chapters (sticky navigation dots) ───────
  function createChapterNav() {
    var chapters = document.querySelectorAll('[data-chapter]');
    if (chapters.length < 2) return;

    var nav = document.createElement('div');
    nav.className = 'chapter-nav';
    nav.style.cssText = 'position:fixed;right:20px;top:50%;transform:translateY(-50%);z-index:998;display:flex;flex-direction:column;gap:12px;';

    chapters.forEach(function(ch, i) {
      var dot = document.createElement('button');
      dot.className = 'chapter-dot';
      dot.dataset.index = i;
      dot.title = ch.dataset.chapter || 'Chapter ' + (i + 1);
      dot.style.cssText = 'width:10px;height:10px;border-radius:50%;border:2px solid rgba(185,28,28,0.4);background:transparent;cursor:pointer;transition:all 0.3s;padding:0;';
      dot.addEventListener('click', function() {
        ch.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      nav.appendChild(dot);
    });
    document.body.appendChild(nav);

    // Update active dot on scroll
    var chapterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var idx = Array.from(chapters).indexOf(entry.target);
          nav.querySelectorAll('.chapter-dot').forEach(function(d, i) {
            if (i === idx) {
              d.style.background = '#b91c1c';
              d.style.borderColor = '#b91c1c';
              d.style.transform = 'scale(1.3)';
            } else {
              d.style.background = 'transparent';
              d.style.borderColor = 'rgba(185,28,28,0.4)';
              d.style.transform = 'scale(1)';
            }
          });
        }
      });
    }, { threshold: 0.3 });
    chapters.forEach(function(ch) { chapterObserver.observe(ch); });
  }

  // ── Init ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    // Reveal animations
    document.querySelectorAll('.reveal, [data-reveal]').forEach(function(el) {
      revealObserver.observe(el);
    });

    // Counter animations
    document.querySelectorAll('.counter, [data-counter]').forEach(function(el) {
      counterObserver.observe(el);
    });

    // Parallax elements
    document.querySelectorAll('[data-parallax]').forEach(function(el) {
      parallaxElements.push({ el: el });
    });
    if (parallaxElements.length) {
      window.addEventListener('scroll', updateParallax, { passive: true });
    }

    // Typewriter elements
    document.querySelectorAll('[data-typewriter], .typewriter').forEach(function(el) {
      typewriterObserver.observe(el);
    });

    // Chapter navigation
    createChapterNav();
  });

})();
