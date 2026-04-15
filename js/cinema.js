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

  // ── Text split reveal (Locomotive-style) ─────────────
  // Splits heading into words/chars that animate in with stagger
  function splitReveal(el) {
    var text = el.textContent;
    var words = text.split(/\s+/);
    el.innerHTML = '';
    el.style.overflow = 'hidden';
    words.forEach(function(word, i) {
      var span = document.createElement('span');
      span.textContent = word + ' ';
      span.style.cssText = 'display:inline-block;opacity:0;transform:translateY(100%);' +
        'transition:opacity 0.5s cubic-bezier(0.215,0.61,0.355,1) ' + (i * 0.06) + 's,' +
        'transform 0.6s cubic-bezier(0.215,0.61,0.355,1) ' + (i * 0.06) + 's;';
      el.appendChild(span);
    });
  }

  var splitObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.dataset.split) {
        entry.target.dataset.split = 'true';
        var spans = entry.target.querySelectorAll('span');
        spans.forEach(function(s) {
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
        });
      }
    });
  }, { threshold: 0.3 });

  // ── Smooth parallax with lerp (Locomotive-inspired) ──
  var smoothY = 0;
  var targetY = 0;
  var rafId = null;

  function lerpParallax() {
    targetY = window.scrollY;
    smoothY += (targetY - smoothY) * 0.08; // lerp factor — lower = smoother
    parallaxElements.forEach(function(item) {
      var speed = parseFloat(item.el.dataset.parallax || '0.3');
      var offset = smoothY * speed;
      item.el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
    if (Math.abs(targetY - smoothY) > 0.5 || parallaxElements.length) {
      rafId = requestAnimationFrame(lerpParallax);
    }
  }

  // ── Cursor glow — subtle red light follows mouse ─────
  function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return; // No glow on touch
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    var mx = 0, my = 0, gx = 0, gy = 0;

    document.addEventListener('mousemove', function(e) {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    function updateGlow() {
      gx += (mx - gx) * 0.06;
      gy += (my - gy) * 0.06;
      glow.style.transform = 'translate(' + gx.toFixed(0) + 'px,' + gy.toFixed(0) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(updateGlow);
    }
    updateGlow();
  }

  // ── Scroll-linked hero fade — hero fades as you scroll past ──
  function initHeroFade() {
    var hero = document.querySelector('.page-hero, .hero-vc, .hero-nc, .dossier-hero');
    if (!hero) return;
    window.addEventListener('scroll', function() {
      var rect = hero.getBoundingClientRect();
      var h = hero.offsetHeight;
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var scrolled = Math.max(0, -rect.top / h);
        hero.style.opacity = Math.max(0.15, 1 - scrolled * 1.2);
        hero.style.transform = 'translateY(' + (scrolled * 30).toFixed(1) + 'px)';
      }
    }, { passive: true });
  }

  // ── Init ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    var page = window.location.pathname.split('/').pop() || '';
    if (page === 'index.html' || page === '') return;

    // Reveal animations
    document.querySelectorAll('.reveal, [data-reveal]').forEach(function(el) {
      revealObserver.observe(el);
    });

    // Counter animations
    document.querySelectorAll('.counter, [data-counter]').forEach(function(el) {
      counterObserver.observe(el);
    });

    // Parallax elements — use lerped smooth scrolling
    document.querySelectorAll('[data-parallax]').forEach(function(el) {
      parallaxElements.push({ el: el });
    });
    if (parallaxElements.length) {
      lerpParallax(); // Start smooth parallax loop
    }

    // Typewriter elements
    document.querySelectorAll('[data-typewriter], .typewriter').forEach(function(el) {
      typewriterObserver.observe(el);
    });

    // Text split reveal — hero headings + section headings
    document.querySelectorAll('[data-split], .split-reveal').forEach(function(el) {
      splitReveal(el);
      splitObserver.observe(el);
    });

    // Auto-split: first h1 in hero sections
    var heroH1 = document.querySelector('.page-hero h1, .hero-vc h1, .hero-nc h1, .dossier-hero h1');
    if (heroH1 && !heroH1.dataset.split) {
      splitReveal(heroH1);
      splitObserver.observe(heroH1);
    }

    // Chapter navigation
    createChapterNav();

    // Cursor glow (Awwwards-tier ambient light)
    initCursorGlow();

    // Hero fade on scroll (Locomotive-inspired depth)
    initHeroFade();
  });

})();
