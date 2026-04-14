/**
 * TENET5 Submarine Dial — Horizontal rotary timeline with starfield
 * Reads events from window.TENET5_TIMELINE (unified-timeline.js)
 * IIFE pattern
 */
(function() {
  'use strict';
  if (window.__TENET5_SUBMARINE_DIAL_LOADED) return;
  window.__TENET5_SUBMARINE_DIAL_LOADED = true;

  var CAT_COLORS = {
    maid: '#dc2626', waste: '#f59e0b', foreign: '#3b82f6',
    cfnis: '#a855f7', charter: '#0ea5e9', military: '#22c55e',
    surveillance: '#8b5cf6', default: '#6b7280'
  };

  var _currentIndex = 0;
  var _events = [];
  var _filter = 'all';
  var _container = null;
  var _track = null;

  // ── Starfield Canvas ────────────────────────────────────────────────────
  function initStarfield(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [];
    var W, H;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      var count = W < 768 ? 150 : 300;
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.5 + 0.3,
          a: Math.random() * 0.7 + 0.1,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.08
        });
      }
    }

    function drawNebula() {
      // Cyan nebula blob
      var g1 = ctx.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, W * 0.3);
      g1.addColorStop(0, 'rgba(34, 211, 238, 0.06)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // Red nebula blob
      var g2 = ctx.createRadialGradient(W * 0.75, H * 0.6, 0, W * 0.75, H * 0.6, W * 0.25);
      g2.addColorStop(0, 'rgba(185, 28, 28, 0.05)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // Gold nebula blob
      var g3 = ctx.createRadialGradient(W * 0.5, H * 0.8, 0, W * 0.5, H * 0.8, W * 0.2);
      g3.addColorStop(0, 'rgba(201, 168, 76, 0.04)');
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, W, H);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      drawNebula();

      stars.forEach(function(s) {
        if (!reduceMotion) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < 0) s.x = W;
          if (s.x > W) s.x = 0;
          if (s.y < 0) s.y = H;
          if (s.y > H) s.y = 0;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + s.a + ')';
        ctx.fill();
      });

      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();
    window.addEventListener('resize', function() { resize(); createStars(); });
  }

  // ── Event Cards ─────────────────────────────────────────────────────────
  function getFilteredEvents() {
    if (_filter === 'all') return _events;
    return _events.filter(function(e) { return e.cat === _filter; });
  }

  function renderCards() {
    if (!_track) return;
    var filtered = getFilteredEvents();
    _track.innerHTML = '';

    filtered.forEach(function(ev, i) {
      var card = document.createElement('a');
      card.className = 'sub-dial-card';
      card.href = ev.link || '#';
      card.setAttribute('data-narrate', ev.title + '. ' + ev.desc);
      card.setAttribute('data-event-index', i);

      var catColor = CAT_COLORS[ev.cat] || CAT_COLORS.default;
      var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var monthStr = ev.month ? monthNames[ev.month - 1] + ' ' : '';

      card.innerHTML =
        '<div class="sub-dial-card-year">' + monthStr + ev.year + '</div>' +
        '<div class="sub-dial-card-cat" style="background:' + catColor + '20;color:' + catColor + ';">' + (ev.cat || 'event').toUpperCase() + '</div>' +
        '<div class="sub-dial-card-title">' + ev.title + '</div>' +
        '<div class="sub-dial-card-desc">' + ev.desc + '</div>' +
        '<span class="sub-dial-card-link">Read investigation &rarr;</span>';

      _track.appendChild(card);
    });

    // Update counter
    var counter = document.getElementById('sub-dial-counter');
    if (counter) counter.textContent = filtered.length + ' events' + (_filter !== 'all' ? ' (' + _filter.toUpperCase() + ')' : '');

    // Highlight first card
    if (filtered.length > 0) updateActive(0);
  }

  function updateActive(index) {
    _currentIndex = index;
    var cards = _track.querySelectorAll('.sub-dial-card');
    cards.forEach(function(c, i) {
      c.classList.toggle('active', i === index);
    });
  }

  function scrollToEvent(index) {
    var cards = _track.querySelectorAll('.sub-dial-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      updateActive(index);
    }
  }

  // ── Scroll Detection ────────────────────────────────────────────────────
  function setupScrollDetection() {
    if (!_container) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          var idx = parseInt(entry.target.getAttribute('data-event-index'));
          if (!isNaN(idx)) updateActive(idx);
        }
      });
    }, { root: _container, threshold: 0.5 });

    _track.querySelectorAll('.sub-dial-card').forEach(function(card) {
      observer.observe(card);
    });
  }

  // ── Filters ─────────────────────────────────────────────────────────────
  function renderFilters() {
    var bar = document.getElementById('sub-dial-filters');
    if (!bar) return;

    var cats = ['all'];
    var seen = {};
    _events.forEach(function(e) {
      if (e.cat && !seen[e.cat]) { seen[e.cat] = true; cats.push(e.cat); }
    });

    bar.innerHTML = cats.map(function(cat) {
      var color = cat === 'all' ? '#22d3ee' : (CAT_COLORS[cat] || CAT_COLORS.default);
      return '<button class="sub-dial-filter-btn' + (cat === _filter ? ' active' : '') + '" data-filter="' + cat + '" style="' + (cat !== 'all' ? 'border-color:' + color + '40;' : '') + '">' + cat.toUpperCase() + '</button>';
    }).join('');

    bar.addEventListener('click', function(e) {
      var btn = e.target.closest('.sub-dial-filter-btn');
      if (!btn) return;
      _filter = btn.getAttribute('data-filter');
      bar.querySelectorAll('.sub-dial-filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderCards();
      setupScrollDetection();
    });
  }

  // ── Keyboard Nav ────────────────────────────────────────────────────────
  function handleKeyboard(e) {
    var filtered = getFilteredEvents();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (_currentIndex < filtered.length - 1) scrollToEvent(_currentIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (_currentIndex > 0) scrollToEvent(_currentIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToEvent(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToEvent(filtered.length - 1);
    }
  }

  // ── LIRIL Walkthrough Integration ───────────────────────────────────────
  function onWalkthroughAdvance(e) {
    if (!e.detail || !e.detail.el) return;
    var card = e.detail.el.closest('.sub-dial-card');
    if (card) {
      var idx = parseInt(card.getAttribute('data-event-index'));
      if (!isNaN(idx)) {
        card.classList.add('narrating');
        scrollToEvent(idx);
        // Remove narrating from others
        _track.querySelectorAll('.sub-dial-card').forEach(function(c) {
          if (c !== card) c.classList.remove('narrating');
        });
      }
    }
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    var root = document.getElementById('submarine-timeline-root');
    if (!root) return;

    // Get events from unified-timeline
    if (window.TENET5_TIMELINE && window.TENET5_TIMELINE.events) {
      _events = window.TENET5_TIMELINE.events;
    } else if (window.TENET5_TIMELINE) {
      // Try to access events array
      try {
        var tl = window.TENET5_TIMELINE;
        if (typeof tl.render === 'function') {
          // Events are internal — create a proxy container to extract them
          var proxy = document.createElement('div');
          proxy.style.display = 'none';
          document.body.appendChild(proxy);
          tl.render(proxy.id || 'proxy-tl');
          var cards = proxy.querySelectorAll('.tl-event');
          cards.forEach(function(c) {
            _events.push({
              year: parseInt(c.querySelector('.tl-year')?.textContent) || 2024,
              month: 1,
              title: c.querySelector('.tl-title')?.textContent || '',
              desc: c.querySelector('.tl-desc')?.textContent || '',
              link: c.querySelector('a')?.href || '#',
              cat: 'default',
              color: '#6b7280'
            });
          });
          proxy.remove();
        }
      } catch(e) {}
    }

    // Fallback: use hardcoded key events if no timeline data
    if (!_events || _events.length === 0) {
      _events = [
        { year: 2015, month: 2, title: 'Carter v. Canada', desc: 'SCC strikes down Criminal Code prohibition on assisted suicide.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
        { year: 2016, month: 6, title: 'Bill C-14 — MAID', desc: 'Medical Assistance in Dying legalized. Track 1: reasonably foreseeable death.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
        { year: 2017, month: 1, title: 'Schwab: "We penetrate the cabinets"', desc: 'Klaus Schwab at Harvard Kennedy School.', link: 'wef-davos.html', cat: 'foreign', color: '#3b82f6' },
        { year: 2018, month: 3, title: 'Vice Admiral Norman charged', desc: 'Breach of trust charges. Career destroyed.', link: 'military-purge.html', cat: 'military', color: '#22c55e' },
        { year: 2019, month: 5, title: 'Norman charges stayed', desc: 'Crown: no reasonable prospect of conviction.', link: 'military-purge.html', cat: 'military', color: '#22c55e' },
        { year: 2019, month: 8, title: 'SNC-Lavalin ethics finding', desc: 'PM violated s.9 Conflict of Interest Act.', link: 'snc-lavalin.html', cat: 'waste', color: '#f59e0b' },
        { year: 2020, month: 5, title: 'Firearms OIC', desc: '1,500 models banned by executive order.', link: 'order-in-council.html', cat: 'charter', color: '#0ea5e9' },
        { year: 2020, month: 8, title: 'WE Charity prorogation', desc: 'Parliament shut down during WE investigation.', link: 'prorogation.html', cat: 'waste', color: '#f59e0b' },
        { year: 2021, month: 3, title: 'Bill C-7 — MAID Track 2', desc: 'MAID expanded: death not reasonably foreseeable.', link: 'maid-economics.html', cat: 'maid', color: '#dc2626' },
        { year: 2022, month: 2, title: 'Emergencies Act invoked', desc: '210+ accounts frozen without court orders.', link: 'emergencies-act.html', cat: 'charter', color: '#0ea5e9' },
        { year: 2022, month: 6, title: 'ArriveCAN costs balloon', desc: '$80K app becomes $59M procurement scandal.', link: 'arrivecan.html', cat: 'waste', color: '#f59e0b' },
        { year: 2023, month: 5, title: 'Bill C-63 introduced', desc: 'Online Harms: Digital Safety Commission + pre-crime.', link: 'bill-c63-online-harms.html', cat: 'surveillance', color: '#8b5cf6' },
        { year: 2024, month: 1, title: 'Emergencies Act ruled unreasonable', desc: 'Federal Court: Charter violations confirmed.', link: 'emergencies-act.html', cat: 'charter', color: '#0ea5e9' },
        { year: 2024, month: 12, title: '76,475 MAID deaths', desc: 'Health Canada 6th Annual Report. Then stopped publishing.', link: 'maid-accountability.html', cat: 'maid', color: '#dc2626' },
        { year: 2025, month: 3, title: 'Carney becomes PM', desc: 'Goldman Sachs → BoC → BoE → Brookfield → PM.', link: 'carney-wef.html', cat: 'foreign', color: '#3b82f6' },
        { year: 2025, month: 4, title: 'US tariffs escalate', desc: '25% tariffs on Canadian goods. 75% export dependence.', link: 'tariff-impact-2025.html', cat: 'waste', color: '#f59e0b' },
        { year: 2025, month: 7, title: 'Bill C-70 — zero registrations', desc: 'Foreign Influence Registry: 650+ days, zero registrations.', link: 'bill-c70-registry.html', cat: 'foreign', color: '#3b82f6' }
      ];
    }

    // Sort by date
    _events.sort(function(a, b) { return (a.year * 100 + (a.month || 0)) - (b.year * 100 + (b.month || 0)); });

    // Build DOM
    root.innerHTML =
      '<div class="sub-dial-reticle"></div>' +
      '<div id="sub-dial-filters" class="sub-dial-filters"></div>' +
      '<div class="sub-dial-container" id="sub-dial-container">' +
        '<div class="sub-dial-track" id="sub-dial-track"></div>' +
      '</div>' +
      '<div class="sub-dial-counter" id="sub-dial-counter"></div>';

    _container = document.getElementById('sub-dial-container');
    _track = document.getElementById('sub-dial-track');

    renderFilters();
    renderCards();
    setupScrollDetection();

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);

    // LIRIL walkthrough integration
    window.addEventListener('liril-walkthrough-advance', onWalkthroughAdvance);

    // Starfield
    initStarfield('starfield-canvas');
  }

  // Expose for external use
  window.TENET5_SUBMARINE_DIAL = {
    scrollToEvent: scrollToEvent,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }
})();
