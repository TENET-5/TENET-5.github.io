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

  // ── s.504 Modal Popup ───────────────────────────────────────────────────
  if (!sessionStorage.getItem('s504_dismissed')) {
    var overlay = document.createElement('div');
    overlay.id = 's504-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:#0c0c0e;border:2px solid #c41e3a;border-radius:16px;padding:2rem;max-width:480px;width:90%;box-shadow:0 16px 64px rgba(196,30,58,0.3),0 4px 20px rgba(0,0,0,0.6);text-align:center;animation:fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both;position:relative;';
    modal.innerHTML =
      '<button onclick="document.getElementById(\'s504-overlay\').style.display=\'none\';sessionStorage.setItem(\'s504_dismissed\',\'1\')" style="position:absolute;top:12px;right:14px;background:none;border:none;color:#6e6e76;font-size:1.4rem;cursor:pointer;line-height:1;padding:4px 8px;" aria-label="Close">&times;</button>' +
      '<div style="font-size:2.5rem;margin-bottom:0.8rem;">⚖️</div>' +
      '<h2 style="color:#fff;font-size:1.4rem;font-weight:800;margin-bottom:0.6rem;font-family:Playfair Display,serif;">SECTION 504 FILING</h2>' +
      '<div style="color:#ff6b6b;font-size:0.9rem;font-weight:700;margin-bottom:1rem;">29 Criminal Counts — Captain Rebecca Covey (CFNIS)</div>' +
      '<p style="color:#a0a0a6;font-size:0.82rem;line-height:1.7;margin-bottom:1.5rem;">This website documents the political prosecution of a Canadian Forces combat veteran. You can send this formal criminal filing to the Canadian Forces chain of command and print a copy.</p>' +
      '<button onclick="s504Action();document.getElementById(\'s504-overlay\').style.display=\'none\';sessionStorage.setItem(\'s504_dismissed\',\'1\')" style="background:#c41e3a;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:0.95rem;cursor:pointer;width:100%;margin-bottom:8px;transition:all 0.2s;">Send & Print</button>' +
      '<button onclick="s504Download()" style="background:transparent;color:#ededed;border:1px solid rgba(255,255,255,0.15);padding:8px 16px;border-radius:8px;font-size:0.82rem;cursor:pointer;width:100%;">💾 Download filing</button>';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

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

// ── s.504 mailto + print + download action ───────────────────────────────
var _S504_TEXT =
  'FORMAL NOTIFICATION UNDER SECTION 504 OF THE CRIMINAL CODE OF CANADA\n\n' +
  'Form 2 Information — 29 Counts\n' +
  'Filed by: Daniel Perry, Canadian Forces Combat Veteran, Former Signals Operator\n' +
  'Date: ' + new Date().toISOString().slice(0,16) + ' UTC\n\n' +
  'Against: Captain Rebecca Covey (CFNIS) and others\n\n' +
  '═══════════════════════════════════════════════════\n' +
  'NOTICE OF LEGAL OBLIGATION — NATIONAL DEFENCE ACT\n' +
  '═══════════════════════════════════════════════════\n\n' +
  'Under NDA s.83, s.124, and s.129, military police are OBLIGATED\n' +
  'to investigate reported criminal offences. Failure to investigate\n' +
  'constitutes dereliction of duty (NDA s.124), obstruction of\n' +
  'justice (s.139), and party to offence (s.21).\n\n' +
  '29 COUNTS:\n' +
  ' 1. Accessory after the fact to murder\n' +
  ' 2. Criminal negligence causing death\n' +
  ' 3. Breach of trust (s.122)\n' +
  ' 4. Fabricating evidence (s.137)\n' +
  ' 5. Fraud on the court\n' +
  ' 6. Attempted murder (s.239)\n' +
  ' 7. Criminal harassment (s.264)\n' +
  ' 8. Aggravated assault (s.268)\n' +
  ' 9. Forcible confinement (s.279)\n' +
  '10. Torture (s.269.1)\n' +
  '11. High treason / sedition\n' +
  '12. Intimidation of justice system participant (s.423.1)\n' +
  '13. Hacking & destruction of business accounts\n' +
  '14. Targeting of employment\n' +
  '15. Political suppression as economic warfare\n' +
  '16. s.21 party to offence — murder of Travis\n' +
  '17. Conspiracy to obstruct justice (s.139)\n' +
  '18. Institutional hate crime\n' +
  '19. Withholding disclosure (Stinchcombe violation)\n' +
  '20. Evidence sanitization (Vicky Bae)\n' +
  '21. Medical record falsification (Dr. Zoe Selhi)\n' +
  '22. Forced psychiatric confinement and medication\n' +
  '23. NDA s.92 — ill-treatment of subordinate\n' +
  '24. NDA s.95 — cruelty/disgraceful conduct\n' +
  '25. NDA s.119 — scandalous conduct by officer\n' +
  '26. NDA s.124 — negligent performance of duty\n' +
  '27. NDA s.125 — prejudice to good order/discipline\n' +
  '28. NDA s.129 — service offence (Criminal Code)\n' +
  '29. NDA s.130 — service offence committed in Canada\n\n' +
  's.21 (party to offence) applies IN TOTALITY across all 29 counts.\n\n' +
  'Full filing: https://tenet-5.github.io/legal.html#s504\n' +
  'Accountability database (608+ records): https://tenet-5.github.io/accountability.html\n\n' +
  'Daniel Perry — Canadian Forces Combat Veteran\n' +
  'Former Signals Operator — Afghanistan\n';

function s504Action() {
  var recipients = 'commission@mpcc-cppm.gc.ca,information@forces.gc.ca,mnd-mdn@forces.gc.ca';
  var subject = encodeURIComponent('FORMAL s.504 NOTIFICATION — 29 Criminal Counts — Capt. Rebecca Covey (CFNIS)');
  var body = encodeURIComponent(_S504_TEXT);
  window.open('mailto:' + recipients + '?subject=' + subject + '&body=' + body);
  setTimeout(function() { window.print(); }, 1500);
}

function s504Download() {
  var blob = new Blob([_S504_TEXT], {type: 'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 's504_filing_29_counts_covey_' + new Date().toISOString().slice(0,10) + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
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
