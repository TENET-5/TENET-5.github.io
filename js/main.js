// TENET-5 GitHub Pages — Interactive Enhancements
// Scroll progress, animated counters, reveal-on-scroll, mobile nav, back-to-top

(function () {
  'use strict';

  // ── Scroll Progress Bar ──────────────────────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // ── Back to Top Button ───────────────────────────────────────────────────
  const topBtn = document.createElement('button');
  topBtn.className = 'back-to-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '&#8593;';
  document.body.appendChild(topBtn);

  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function updateTopBtn() {
    topBtn.classList.toggle('visible', window.scrollY > 400);
  }

  // ── Scroll handler (throttled) ───────────────────────────────────────────
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgress();
        updateTopBtn();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── Scroll Reveal ────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll(
    'section, .stat-callout, .formula-box, .cta-card, .chart-container, ' +
    '.corruption-entry, .record, .verdict-box, .purchase-callout, ' +
    '.meme-card, .hero-section, .section-title'
  );
  revealEls.forEach(function (el) {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
      el.classList.add('visible');
    });
  }

  // ── Animated Counters ────────────────────────────────────────────────────
  var counterEls = document.querySelectorAll('.big-number, [data-count]');
  function animateCounter(el) {
    var text = el.textContent.trim();
    // Match numbers like 76,475 or 1 in 20 or 6
    var match = text.match(/^([\d,]+)/);
    if (!match) return;
    var target = parseInt(match[1].replace(/,/g, ''), 10);
    if (isNaN(target) || target === 0) return;
    var suffix = text.slice(match[0].length);
    var duration = Math.min(2000, Math.max(800, target / 20));
    var start = null;
    el.dataset.animated = '1';

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { counterObs.observe(el); });
  }

  // ── Mobile Navigation ────────────────────────────────────────────────────
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.setAttribute('aria-label', 'Toggle navigation');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    // Insert after brand link
    var brand = nav.querySelector('.brand');
    if (brand && brand.nextSibling) {
      nav.insertBefore(hamburger, brand.nextSibling);
    } else {
      nav.prepend(hamburger);
    }

    hamburger.addEventListener('click', function () {
      nav.classList.toggle('open');
      hamburger.classList.toggle('active');
    });

    // Close on link click (mobile)
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && !e.target.classList.contains('brand')) {
        nav.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  }

  // ── Sticky Nav Shadow ────────────────────────────────────────────────────
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Table Row Hover Enhancement (subtle highlight) ──────────────────────
  document.querySelectorAll('.data-table tbody tr').forEach(function (row) {
    row.addEventListener('mouseenter', function () {
      this.style.transition = 'background 0.2s';
    });
  });

  // ── s.504 Action Banner ─────────────────────────────────────────────────
  var s504Banner = document.createElement('div');
  s504Banner.id = 's504-action-banner';
  s504Banner.style.cssText = 'position:fixed;bottom:70px;right:20px;z-index:99998;background:rgba(196,30,58,0.95);backdrop-filter:blur(12px);border:1px solid #ff4444;border-radius:10px;padding:14px 18px;max-width:320px;box-shadow:0 8px 32px rgba(0,0,0,0.5);font-family:Inter,sans-serif;';
  s504Banner.innerHTML = '<div style="color:#fff;font-size:0.82rem;font-weight:700;margin-bottom:8px;">⚖️ s.504 FILING — 29 COUNTS</div>' +
    '<div style="color:#ffccd5;font-size:0.72rem;line-height:1.5;margin-bottom:10px;">Send this formal criminal filing to the Canadian Forces chain of command and print a copy for your records.</div>' +
    '<button onclick="s504Action()" style="background:#fff;color:#c41e3a;border:none;padding:8px 16px;border-radius:6px;font-weight:700;font-size:0.8rem;cursor:pointer;width:100%;margin-bottom:6px;">📧 Send to chain of command & print</button>' +
    '<button onclick="document.getElementById(\'s504-action-banner\').style.display=\'none\'" style="background:transparent;color:#ffccd5;border:1px solid rgba(255,255,255,0.2);padding:5px 12px;border-radius:6px;font-size:0.7rem;cursor:pointer;width:100%;">Dismiss</button>';
  document.body.appendChild(s504Banner);

  // ── Init ─────────────────────────────────────────────────────────────────
  updateProgress();
  updateTopBtn();
})();


// ── Share Functions ───────────────────────────────────────────────────────
function shareTwitter() {
  var url = encodeURIComponent(window.location.href);
  var text = encodeURIComponent('76,475 Canadians killed under MAID since 2016. Every number comes from Health Canada\'s own reports. Read it yourself.');
  window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
}
function shareFacebook() {
  var url = encodeURIComponent(window.location.href);
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank');
}
function shareReddit() {
  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent('76,475 Canadians killed under MAID — government\'s own numbers');
  window.open('https://www.reddit.com/submit?url=' + url + '&title=' + title, '_blank');
}
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(function() {
    ['copy-btn', 'copy-btn-bar'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function(){ btn.textContent = '📋 Copy Link'; }, 2000); }
    });
  });
}

// ── s.504 mailto + print action ──────────────────────────────────────────
function s504Action() {
  var recipients = 'commission@mpcc-cppm.gc.ca,information@forces.gc.ca,mnd-mdn@forces.gc.ca';
  var subject = encodeURIComponent('FORMAL s.504 NOTIFICATION — 29 Criminal Counts — Capt. Rebecca Covey (CFNIS)');
  var body = encodeURIComponent(
    'FORMAL NOTIFICATION UNDER SECTION 504 OF THE CRIMINAL CODE OF CANADA\n\n' +
    'Form 2 Information — 29 Counts\n' +
    'Against: Captain Rebecca Covey (CFNIS) and others\n\n' +
    'Under NDA s.83, s.124, and s.129, military police are OBLIGATED to investigate.\n' +
    'Failure to investigate constitutes dereliction of duty (NDA s.124),\n' +
    'obstruction of justice (s.139), and party to offence (s.21).\n\n' +
    'Full filing: https://tenet-5.github.io/legal.html#s504\n' +
    'Full accountability database (608+ records): https://tenet-5.github.io/accountability.html\n\n' +
    'Daniel Perry — Canadian Forces Combat Veteran — Former Signals Operator — Afghanistan'
  );
  window.open('mailto:' + recipients + '?subject=' + subject + '&body=' + body);
  setTimeout(function() { window.print(); }, 1500);
}

// ── Live MAID Counter ─────────────────────────────────────────────────────
(function() {
  var el = document.getElementById('live-counter');
  var elapsed = document.getElementById('elapsed-time');
  if (!el) return;
  // 16,499 deaths in 2024 (365 days) = 45.2/day = 0.0005231/second
  var deathsPerSecond = 16499 / (365 * 24 * 3600);
  var baseDate = new Date('2024-01-01T00:00:00Z');
  function update() {
    var now = new Date();
    var seconds = (now - baseDate) / 1000;
    var count = Math.floor(seconds * deathsPerSecond);
    el.textContent = count.toLocaleString('en-CA');
    // Elapsed time in 2024 context
    var days = Math.floor((now - baseDate) / 86400000);
    if (elapsed) elapsed.textContent = days.toLocaleString('en-CA') + ' days since Jan 1 2024';
  }
  update();
  setInterval(update, 1000);
})();
