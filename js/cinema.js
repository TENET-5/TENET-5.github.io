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

  // ── Alpha liquid overlay — transparent, video-like motion ──
  function injectLiquidOverlayStyles() {
    if (document.getElementById('t5-liquid-overlay-styles')) return;
    var style = document.createElement('style');
    style.id = 't5-liquid-overlay-styles';
    style.textContent = [
      '.t5-liquid-overlay{position:fixed;top:0;left:0;right:0;height:min(22vh,170px);pointer-events:none;z-index:6;overflow:hidden;opacity:.98;}',
      '.t5-liquid-overlay svg{display:block;width:100%;height:100%;}',
      '.t5-liquid-overlay .liquid-sheet{animation:t5LiquidShift 9s ease-in-out infinite;transform-origin:50% 0%;}',
      '.t5-liquid-overlay .liquid-highlight{animation:t5LiquidShift 11s ease-in-out infinite reverse;mix-blend-mode:screen;}',
      '.t5-liquid-overlay .liquid-drop{opacity:.92;transform-box:fill-box;transform-origin:50% 0%;}',
      '.t5-liquid-overlay .liquid-drop--one{animation:t5DropFall1 7.2s ease-in-out infinite .2s;}',
      '.t5-liquid-overlay .liquid-drop--two{animation:t5DropFall2 6.4s ease-in-out infinite 1.1s;}',
      '.t5-liquid-overlay .liquid-drop--three{animation:t5DropFall3 8.1s ease-in-out infinite .7s;}',
      '.t5-liquid-overlay .liquid-drop--four{animation:t5DropFall2 7.6s ease-in-out infinite 1.8s;}',
      '@keyframes t5LiquidShift{0%,100%{transform:translateY(0) scaleY(1);}50%{transform:translateY(4px) scaleY(1.03);}}',
      '@keyframes t5DropFall1{0%,12%{transform:translateY(-8px) scaleY(.94);opacity:0;}20%,65%{opacity:.94;}100%{transform:translateY(88px) scaleY(1.06);opacity:0;}}',
      '@keyframes t5DropFall2{0%,15%{transform:translateY(-6px) scaleY(.96);opacity:0;}22%,70%{opacity:.88;}100%{transform:translateY(102px) scaleY(1.08);opacity:0;}}',
      '@keyframes t5DropFall3{0%,18%{transform:translateY(-4px) scaleY(.96);opacity:0;}26%,68%{opacity:.82;}100%{transform:translateY(76px) scaleY(1.04);opacity:0;}}',
      '@media (prefers-reduced-motion: reduce){.t5-liquid-overlay{display:none!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function initLiquidOverlay() {
    if (document.querySelector('.t5-liquid-overlay')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var page = window.location.pathname.split('/').pop() || '';
    if (page === 'index.html' || page === 'home.html' || page === 'kids-guide.html' || page === 'auth-callback.html' || page === '') return;

    injectLiquidOverlayStyles();

    var overlay = document.createElement('div');
    overlay.className = 't5-liquid-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<svg viewBox="0 0 1440 220" preserveAspectRatio="none" role="presentation">',
      '<defs>',
      '<linearGradient id="t5LiquidGradient" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="rgba(105,0,14,.98)"/>',
      '<stop offset="55%" stop-color="rgba(165,12,28,.92)"/>',
      '<stop offset="100%" stop-color="rgba(60,0,10,.86)"/>',
      '</linearGradient>',
      '<linearGradient id="t5LiquidHighlight" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="rgba(255,255,255,.18)"/>',
      '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>',
      '</linearGradient>',
      '<filter id="t5LiquidGlow" x="-20%" y="-20%" width="140%" height="150%">',
      '<feGaussianBlur stdDeviation="2.4" result="blur"/>',
      '<feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 0.18 0 0 0  0 0 0 0 0  0 0 0 .9 0" result="shadow"/>',
      '<feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>',
      '</filter>',
      '</defs>',
      '<g filter="url(#t5LiquidGlow)">',
      '<path class="liquid-sheet" fill="url(#t5LiquidGradient)" d="M0 0H1440V76c-43 14-77 20-113 13-39-8-61-28-93-22-41 8-49 50-61 85-9 29-28 57-56 62-39 7-64-32-71-69-7-33-6-74-31-96-29-26-73-17-106 2-39 22-72 58-115 59-43 1-69-31-101-56-28-22-63-41-98-29-41 14-54 61-71 101-12 28-34 58-64 63-44 8-76-39-82-83-5-29-1-63-20-86-26-32-78-29-117-16-37 12-67 36-103 47-44 13-87 3-121-24-23-18-42-42-72-51-49-15-98 8-144 17V0Z"/>',
      '<path class="liquid-highlight" fill="url(#t5LiquidHighlight)" d="M0 0H1440V22c-70 14-147 23-227 18-102-6-202-32-304-28-144 6-286 62-430 48C335 52 242 16 148 12 98 10 49 12 0 20V0Z"/>',
      '<ellipse class="liquid-drop liquid-drop--one" cx="286" cy="86" rx="10" ry="22" fill="rgba(144,0,20,.95)"/>',
      '<ellipse class="liquid-drop liquid-drop--two" cx="648" cy="76" rx="12" ry="30" fill="rgba(156,8,24,.94)"/>',
      '<ellipse class="liquid-drop liquid-drop--three" cx="1012" cy="88" rx="9" ry="20" fill="rgba(132,0,18,.92)"/>',
      '<ellipse class="liquid-drop liquid-drop--four" cx="1248" cy="72" rx="11" ry="28" fill="rgba(168,10,26,.92)"/>',
      '</g>',
      '</svg>'
    ].join('');

    document.body.insertBefore(overlay, document.body.firstChild);
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

    // Transparent liquid overlay
    initLiquidOverlay();

    // Cursor glow (Awwwards-tier ambient light)
    initCursorGlow();

    // Hero fade on scroll (Locomotive-inspired depth)
    initHeroFade();
  });

})();
