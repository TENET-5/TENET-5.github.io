(function() {
  'use strict';
  if (window.__TENET5_SITE_CHALK_LOADED) return;
  window.__TENET5_SITE_CHALK_LOADED = true;

  var pagePath = (window.location.pathname.split('/').pop() || 'home.html').toLowerCase();
  if (pagePath === 'auth-callback.html' || pagePath === 'chalkboard.html') return;

  var STORAGE_KEY = 'tenet5-page-chalk-v1:' + pagePath;
  var state = {
    active: false,
    mode: 'draw',
    color: '#f5f2ec',
    size: 4,
    text: 'Add your note',
    marks: [],
    current: null
  };

  var el = {};

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.marks)); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state.marks = JSON.parse(raw) || [];
    } catch (e) {
      state.marks = [];
    }
  }

  function injectStyles() {
    if (document.getElementById('t5-site-chalk-styles')) return;
    var style = document.createElement('style');
    style.id = 't5-site-chalk-styles';
    style.textContent = [
      '.t5-site-chalk-fab{position:fixed;right:18px;bottom:18px;z-index:9998;border:1px solid rgba(201,168,76,.35);background:linear-gradient(180deg,rgba(125,24,39,.96),rgba(79,15,28,.96));color:#fff;border-radius:999px;padding:.7rem .95rem;font-weight:700;letter-spacing:.04em;box-shadow:0 16px 40px rgba(0,0,0,.35);cursor:pointer}',
      '.t5-site-chalk-panel{position:fixed;right:18px;bottom:72px;width:min(92vw,420px);z-index:9999;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:linear-gradient(180deg,rgba(10,14,22,.98),rgba(14,18,28,.98));box-shadow:0 22px 50px rgba(0,0,0,.45);padding:.85rem;display:none}',
      '.t5-site-chalk-panel.active{display:block}',
      '.t5-site-chalk-panel h3{margin:0 0 .65rem;font-size:.92rem;letter-spacing:.12em;text-transform:uppercase;color:#d6c08a}',
      '.t5-site-chalk-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:.55rem}',
      '.t5-site-chalk-btn{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;border-radius:999px;padding:.42rem .7rem;font-size:.78rem;cursor:pointer}',
      '.t5-site-chalk-btn.active{background:rgba(14,165,233,.16);border-color:rgba(14,165,233,.4);color:#bdeeff}',
      '.t5-site-chalk-panel input[type="text"]{flex:1 1 180px;min-width:0;padding:.5rem .7rem;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#fff}',
      '.t5-site-chalk-panel label{font-size:.76rem;color:#c7ced8;display:inline-flex;align-items:center;gap:.35rem}',
      '.t5-site-chalk-hint{font-size:.73rem;line-height:1.45;color:#96a3b5;margin-top:.35rem}',
      '.t5-site-chalk-overlay{position:fixed;inset:0;z-index:9997;pointer-events:none}',
      '.t5-site-chalk-overlay.active{pointer-events:auto}',
      '.t5-site-chalk-canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}',
      '.t5-site-chalk-badge{position:fixed;left:18px;bottom:18px;z-index:9998;background:rgba(10,14,22,.86);border:1px solid rgba(255,255,255,.1);color:#dbe6f4;padding:.4rem .65rem;border-radius:999px;font-size:.72rem;display:none}',
      '.t5-site-chalk-badge.active{display:block}'
    ].join('');
    document.head.appendChild(style);
  }

  function render() {
    if (!el.canvas) return;
    var ctx = el.canvas.getContext('2d');
    ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);

    state.marks.forEach(function(mark) {
      if (mark.kind === 'text') {
        ctx.save();
        ctx.font = '700 ' + (mark.size * 4 + 12) + 'px "Special Elite", serif';
        ctx.fillStyle = mark.color;
        ctx.globalAlpha = 0.9;
        ctx.fillText(mark.text, mark.x * el.canvas.width, mark.y * el.canvas.height);
        ctx.restore();
        return;
      }

      ctx.save();
      if (mark.mode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = mark.size * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = mark.color;
        ctx.lineWidth = mark.size * 1.4;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      (mark.points || []).forEach(function(p, i) {
        var x = p.x * el.canvas.width;
        var y = p.y * el.canvas.height;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    });
  }

  function resizeCanvas() {
    if (!el.canvas) return;
    el.canvas.width = window.innerWidth;
    el.canvas.height = window.innerHeight;
    render();
  }

  function setActive(next) {
    state.active = !!next;
    el.overlay.classList.toggle('active', state.active);
    el.panel.classList.toggle('active', state.active);
    el.badge.classList.toggle('active', state.active);
    el.fab.textContent = state.active ? 'Close Chalk' : 'Write on this page';
  }

  function setMode(mode) {
    state.mode = mode;
    [el.btnDraw, el.btnErase, el.btnText].forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  function pointFromEvent(evt) {
    return {
      x: Math.max(0, Math.min(1, evt.clientX / window.innerWidth)),
      y: Math.max(0, Math.min(1, evt.clientY / window.innerHeight))
    };
  }

  function pointerDown(evt) {
    if (!state.active) return;
    if (evt.target !== el.canvas) return;

    if (state.mode === 'text') {
      var p = pointFromEvent(evt);
      state.marks.push({
        kind: 'text',
        text: (el.text.value || state.text || 'Note').slice(0, 120),
        x: p.x,
        y: p.y,
        color: state.color,
        size: state.size
      });
      save();
      render();
      return;
    }

    state.current = {
      kind: 'stroke',
      mode: state.mode,
      color: state.color,
      size: state.size,
      points: [pointFromEvent(evt)]
    };
    state.marks.push(state.current);
    render();
  }

  function pointerMove(evt) {
    if (!state.current) return;
    state.current.points.push(pointFromEvent(evt));
    render();
  }

  function pointerUp() {
    if (!state.current) return;
    save();
    state.current = null;
  }

  function buildUI() {
    el.fab = document.createElement('button');
    el.fab.className = 't5-site-chalk-fab';
    el.fab.type = 'button';
    el.fab.textContent = 'Write on this page';

    el.badge = document.createElement('div');
    el.badge.className = 't5-site-chalk-badge';
    el.badge.textContent = 'Community chalk mode is active';

    el.panel = document.createElement('div');
    el.panel.className = 't5-site-chalk-panel';
    el.panel.innerHTML = '' +
      '<h3>Community Chalk Layer</h3>' +
      '<div class="t5-site-chalk-row">' +
        '<button type="button" class="t5-site-chalk-btn active" data-mode="draw">Chalk</button>' +
        '<button type="button" class="t5-site-chalk-btn" data-mode="erase">Erase</button>' +
        '<button type="button" class="t5-site-chalk-btn" data-mode="text">Text</button>' +
      '</div>' +
      '<div class="t5-site-chalk-row">' +
        '<label>Size <input type="range" min="2" max="18" value="4"></label>' +
        '<label>Colour <input type="color" value="#f5f2ec"></label>' +
      '</div>' +
      '<div class="t5-site-chalk-row">' +
        '<input type="text" maxlength="120" value="Add your note" aria-label="Note text">' +
      '</div>' +
      '<div class="t5-site-chalk-row">' +
        '<button type="button" class="t5-site-chalk-btn" data-action="clear">Clear page notes</button>' +
      '</div>' +
      '<div class="t5-site-chalk-hint">Draw anywhere on the current page, or switch to text mode and tap to place a chalk note. This layer persists for the page in your local session.</div>';

    el.btnDraw = el.panel.querySelector('[data-mode="draw"]');
    el.btnErase = el.panel.querySelector('[data-mode="erase"]');
    el.btnText = el.panel.querySelector('[data-mode="text"]');
    el.size = el.panel.querySelector('input[type="range"]');
    el.color = el.panel.querySelector('input[type="color"]');
    el.text = el.panel.querySelector('input[type="text"]');
    el.clear = el.panel.querySelector('[data-action="clear"]');

    el.overlay = document.createElement('div');
    el.overlay.className = 't5-site-chalk-overlay';
    el.canvas = document.createElement('canvas');
    el.canvas.className = 't5-site-chalk-canvas';
    el.overlay.appendChild(el.canvas);

    document.body.appendChild(el.overlay);
    document.body.appendChild(el.panel);
    document.body.appendChild(el.badge);
    document.body.appendChild(el.fab);

    el.fab.addEventListener('click', function() { setActive(!state.active); });
    el.btnDraw.addEventListener('click', function() { setMode('draw'); });
    el.btnErase.addEventListener('click', function() { setMode('erase'); });
    el.btnText.addEventListener('click', function() { setMode('text'); });
    el.size.addEventListener('input', function() { state.size = Number(el.size.value || 4); });
    el.color.addEventListener('input', function() { state.color = el.color.value || '#f5f2ec'; });
    el.text.addEventListener('input', function() { state.text = el.text.value || 'Add your note'; });
    el.clear.addEventListener('click', function() {
      state.marks = [];
      save();
      render();
    });

    el.canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
  }

  function init() {
    injectStyles();
    load();
    buildUI();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();