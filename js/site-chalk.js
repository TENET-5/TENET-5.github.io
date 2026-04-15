(function() {
  'use strict';
  if (window.__TENET5_SITE_CHALK_LOADED) return;
  window.__TENET5_SITE_CHALK_LOADED = true;

  var pagePath = (window.location.pathname.split('/').pop() || 'home.html').toLowerCase();
  if (pagePath === 'auth-callback.html' || pagePath === 'chalkboard.html') return;

  var BOARD_KEY = 'page:' + pagePath;
  var STORAGE_KEY = 'tenet5-page-chalk-v2:' + pagePath;
  var PIN_KEY = 'tenet5-page-chalk-pin-v1:' + pagePath;
  var MAX_AGE_MS = 60 * 60 * 1000;

  var state = {
    active: false,
    mode: 'draw',
    color: '#f5f2ec',
    size: 4,
    text: 'Add your note',
    marks: [],
    current: null,
    sb: null,
    user: null,
    canDraw: false,
    previewMode: false,
    pinnedNoteId: ''
  };

  var el = {};

  function nowIso() { return new Date().toISOString(); }

  function getClient() {
    if (state.sb) return state.sb;
    if (!window.supabase || !window.supabase.createClient) return null;
    var url = window.SUPABASE_URL || '';
    var key = window.SUPABASE_ANON || '';
    if (!url || url.indexOf('YOUR_') !== -1 || !key || key.indexOf('YOUR_') !== -1) return null;
    state.sb = window.supabase.createClient(url, key);
    return state.sb;
  }

  function shouldEnablePreviewMode() {
    var host = String(window.location.hostname || '').toLowerCase();
    return !getClient() && (window.location.protocol === 'file:' || host === '127.0.0.1' || host === 'localhost');
  }

  function isCanadianUser(user) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var email = String(user.email || '').toLowerCase();
    var locale = String(meta.locale || '').toLowerCase();
    var lang = String(navigator.language || '').toLowerCase();
    var tz = String((Intl.DateTimeFormat().resolvedOptions().timeZone || '')).toLowerCase();
    var canadianZones = ['toronto', 'vancouver', 'edmonton', 'winnipeg', 'halifax', 'st_johns', 'regina', 'whitehorse', 'yellowknife', 'iqaluit', 'moncton'];
    return email.indexOf('@canada.ca') !== -1 || email.indexOf('@gc.ca') !== -1 || /\.ca$/.test(email) || locale.indexOf('ca') !== -1 || lang.indexOf('-ca') !== -1 || canadianZones.some(function(zone) { return tz.indexOf(zone) !== -1; });
  }

  function pruneMarks(marks) {
    var now = Date.now();
    return (marks || []).filter(function(mark) {
      if (!mark) return false;
      var expires = mark.expires_at ? new Date(mark.expires_at).getTime() : 0;
      var created = mark.created_at ? new Date(mark.created_at).getTime() : now;
      if (!expires) expires = created + MAX_AGE_MS;
      return expires > now;
    });
  }

  function save() {
    state.marks = pruneMarks(state.marks);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.marks)); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state.marks = pruneMarks(JSON.parse(raw) || []);
    } catch (e) {
      state.marks = [];
    }
    try {
      state.pinnedNoteId = localStorage.getItem(PIN_KEY) || '';
    } catch (e2) {
      state.pinnedNoteId = '';
    }
  }

  function markId(mark) {
    return String((mark && (mark.id || mark.created_at || 'mark')) + ':' + ((mark && mark.text) || '') + ':' + ((mark && mark.x) || 0) + ':' + ((mark && mark.y) || 0));
  }

  function savePinned() {
    try { localStorage.setItem(PIN_KEY, state.pinnedNoteId || ''); } catch (e) {}
  }

  function timeAgo(dateStr) {
    if (!dateStr) return 'now';
    var now = Date.now();
    var then = new Date(dateStr).getTime();
    var diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    return Math.floor(diff / 3600) + 'h ago';
  }

  function getRecentTextMarks() {
    return pruneMarks(state.marks)
      .filter(function(mark) { return mark && mark.kind === 'text' && mark.text; })
      .sort(function(a, b) { return new Date(b.created_at || 0) - new Date(a.created_at || 0); })
      .slice(0, 6);
  }

  function renderCommunityFeed() {
    if (!el.feed || !el.pin) return;
    var notes = getRecentTextMarks();
    var pinned = null;
    if (state.pinnedNoteId) {
      pinned = notes.find(function(note) { return markId(note) === state.pinnedNoteId; }) || null;
    }
    if (!pinned && notes.length) pinned = notes[0];

    el.pin.innerHTML = pinned
      ? '<div style="font-weight:700;color:#fff;margin-bottom:.18rem;">“' + String(pinned.text).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '”</div><div style="font-size:.7rem;color:#94a3b8;">Pinned from this page · ' + timeAgo(pinned.created_at) + '</div>'
      : '<div style="color:#94a3b8;">No pinned note yet. Place a text note and pin it.</div>';

    el.feed.innerHTML = notes.length
      ? notes.map(function(note) {
          var id = markId(note);
          var active = id === state.pinnedNoteId;
          return '<button type="button" class="t5-site-chalk-feed-item' + (active ? ' active' : '') + '" data-pin-id="' + id.replace(/"/g, '&quot;') + '"><span class="t5-site-chalk-feed-text">' + String(note.text).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span><span class="t5-site-chalk-feed-meta">' + timeAgo(note.created_at) + (active ? ' · pinned' : '') + '</span></button>';
        }).join('')
      : '<div style="color:#94a3b8;font-size:.74rem;">No public notes on this page yet.</div>';
  }

  function syncAccess(user) {
    state.user = user || null;
    state.previewMode = shouldEnablePreviewMode() && !state.user;
    state.canDraw = !!((state.user && isCanadianUser(state.user) && getClient()) || state.previewMode);
    updateHint();
  }

  function updateHint() {
    if (!el.hint) return;
    if (state.previewMode) {
      el.hint.textContent = 'Local preview is active. You can leave public notes on this page and they roll off after one hour.';
    } else if (state.canDraw) {
      el.hint.textContent = 'Signed in and ready. Add a public note, pin a lead, or mark up this page.';
    } else if (getClient()) {
      el.hint.textContent = 'Sign in with a Canadian Google context to participate on this page.';
    } else {
      el.hint.textContent = 'Viewing mode only until live participation is configured.';
    }
  }

  function fetchRemote() {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return sb.from('chalkboard_marks').select('*').eq('board_key', BOARD_KEY).order('created_at', { ascending: true }).then(function(res) {
      if (!res || !res.data) return;
      state.marks = pruneMarks(res.data.map(function(row) {
        return {
          id: row.id,
          kind: row.text ? 'text' : 'stroke',
          text: row.text || '',
          x: row.points && row.points[0] ? row.points[0].x : 0,
          y: row.points && row.points[0] ? row.points[0].y : 0,
          mode: row.mode || 'draw',
          color: row.color || '#f5f2ec',
          size: row.size || 4,
          points: row.points || [],
          created_at: row.created_at || nowIso(),
          expires_at: row.expires_at || new Date(Date.now() + MAX_AGE_MS).toISOString()
        };
      }));
      save();
      render();
    }).catch(function() {});
  }

  function persistRemote(mark) {
    var sb = getClient();
    if (!sb || !state.user || !state.canDraw || state.previewMode) return;

    sb.from('chalkboard_marks').insert({
      board_key: BOARD_KEY,
      user_id: state.user.id,
      user_name: (state.user.user_metadata && (state.user.user_metadata.full_name || state.user.user_metadata.name)) || state.user.email || 'Anonymous',
      user_email: state.user.email || '',
      user_avatar: (state.user.user_metadata && (state.user.user_metadata.avatar_url || state.user.user_metadata.picture)) || '',
      mode: mark.mode || 'draw',
      text: mark.text || null,
      color: mark.color || '#f5f2ec',
      size: mark.size || 4,
      points: mark.kind === 'text' ? [{ x: mark.x, y: mark.y }] : (mark.points || []),
      created_at: mark.created_at || nowIso(),
      expires_at: mark.expires_at || new Date(Date.now() + MAX_AGE_MS).toISOString()
    }).then(function() {}).catch(function() {});
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
      '.t5-site-chalk-btn:disabled{opacity:.45;cursor:not-allowed}',
      '.t5-site-chalk-panel input[type="text"]{flex:1 1 180px;min-width:0;padding:.5rem .7rem;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#fff}',
      '.t5-site-chalk-panel label{font-size:.76rem;color:#c7ced8;display:inline-flex;align-items:center;gap:.35rem}',
      '.t5-site-chalk-hint{font-size:.73rem;line-height:1.45;color:#96a3b5;margin-top:.35rem}',
      '.t5-site-chalk-feed-title{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#cbd5e1;margin:.5rem 0 .35rem}',
      '.t5-site-chalk-pinbox{border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.04);padding:.6rem .7rem;margin-bottom:.5rem}',
      '.t5-site-chalk-feed{display:grid;gap:.35rem;max-height:180px;overflow:auto}',
      '.t5-site-chalk-feed-item{display:block;width:100%;text-align:left;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.03);padding:.5rem .6rem;color:#fff;cursor:pointer}',
      '.t5-site-chalk-feed-item.active{border-color:rgba(201,168,76,.45);background:rgba(201,168,76,.08)}',
      '.t5-site-chalk-feed-text{display:block;font-size:.8rem;line-height:1.35;margin-bottom:.18rem}',
      '.t5-site-chalk-feed-meta{display:block;font-size:.68rem;color:#94a3b8}',
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
    state.marks = pruneMarks(state.marks);
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

    renderCommunityFeed();
  }

  function resizeCanvas() {
    if (!el.canvas) return;
    el.canvas.width = window.innerWidth;
    el.canvas.height = window.innerHeight;
    render();
  }

  function setActive(next) {
    state.active = !!next;
    el.overlay.classList.toggle('active', state.active && state.canDraw);
    el.panel.classList.toggle('active', state.active);
    el.badge.classList.toggle('active', state.active && state.canDraw);
    el.fab.textContent = state.active ? 'Close Community Hub' : 'Open Community Hub';
    updateHint();
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
    if (!state.active || !state.canDraw) return;
    if (evt.target !== el.canvas) return;

    if (state.mode === 'text') {
      var p = pointFromEvent(evt);
      var mark = {
        kind: 'text',
        text: (el.text.value || state.text || 'Note').slice(0, 120),
        x: p.x,
        y: p.y,
        color: state.color,
        size: state.size,
        created_at: nowIso(),
        expires_at: new Date(Date.now() + MAX_AGE_MS).toISOString()
      };
      state.marks.push(mark);
      save();
      persistRemote(mark);
      render();
      return;
    }

    state.current = {
      kind: 'stroke',
      mode: state.mode,
      color: state.color,
      size: state.size,
      points: [pointFromEvent(evt)],
      created_at: nowIso(),
      expires_at: new Date(Date.now() + MAX_AGE_MS).toISOString()
    };
    state.marks.push(state.current);
    render();
  }

  function pointerMove(evt) {
    if (!state.current || !state.canDraw) return;
    state.current.points.push(pointFromEvent(evt));
    render();
  }

  function pointerUp() {
    if (!state.current) return;
    save();
    persistRemote(state.current);
    state.current = null;
  }

  function buildUI() {
    el.fab = document.createElement('button');
    el.fab.className = 't5-site-chalk-fab';
    el.fab.type = 'button';
    el.fab.textContent = 'Open Community Hub';

    el.badge = document.createElement('div');
    el.badge.className = 't5-site-chalk-badge';
    el.badge.textContent = 'Public input mode is active';

    el.panel = document.createElement('div');
    el.panel.className = 't5-site-chalk-panel';
    el.panel.innerHTML = '' +
      '<h3>Public Input Hub</h3>' +
      '<div class="t5-site-chalk-row">' +
        '<button type="button" class="t5-site-chalk-btn active" data-mode="draw">Draw note</button>' +
        '<button type="button" class="t5-site-chalk-btn" data-mode="erase">Wipe</button>' +
        '<button type="button" class="t5-site-chalk-btn" data-mode="text">Text note</button>' +
      '</div>' +
      '<div class="t5-site-chalk-row">' +
        '<label>Size <input type="range" min="2" max="18" value="4"></label>' +
        '<label>Colour <input type="color" value="#f5f2ec"></label>' +
      '</div>' +
      '<div class="t5-site-chalk-row">' +
        '<input type="text" maxlength="120" value="Add your note" aria-label="Note text">' +
      '</div>' +
      '<div class="t5-site-chalk-row">' +
        '<button type="button" class="t5-site-chalk-btn" data-action="pin-latest">Pin latest note</button>' +
        '<button type="button" class="t5-site-chalk-btn" data-action="clear">Clear page notes</button>' +
      '</div>' +
      '<div class="t5-site-chalk-feed-title">Pinned community note</div>' +
      '<div class="t5-site-chalk-pinbox" id="t5-site-chalk-pinbox"></div>' +
      '<div class="t5-site-chalk-feed-title">Recent notes on this page</div>' +
      '<div class="t5-site-chalk-feed" id="t5-site-chalk-feed"></div>' +
      '<div class="t5-site-chalk-hint"></div>';

    el.btnDraw = el.panel.querySelector('[data-mode="draw"]');
    el.btnErase = el.panel.querySelector('[data-mode="erase"]');
    el.btnText = el.panel.querySelector('[data-mode="text"]');
    el.size = el.panel.querySelector('input[type="range"]');
    el.color = el.panel.querySelector('input[type="color"]');
    el.text = el.panel.querySelector('input[type="text"]');
    el.pinLatest = el.panel.querySelector('[data-action="pin-latest"]');
    el.clear = el.panel.querySelector('[data-action="clear"]');
    el.pin = el.panel.querySelector('#t5-site-chalk-pinbox');
    el.feed = el.panel.querySelector('#t5-site-chalk-feed');
    el.hint = el.panel.querySelector('.t5-site-chalk-hint');

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
    el.pinLatest.addEventListener('click', function() {
      var notes = getRecentTextMarks();
      if (!notes.length) return;
      state.pinnedNoteId = markId(notes[0]);
      savePinned();
      renderCommunityFeed();
    });
    el.clear.addEventListener('click', function() {
      state.marks = [];
      state.pinnedNoteId = '';
      savePinned();
      save();
      render();
    });
    el.feed.addEventListener('click', function(evt) {
      var target = evt.target.closest('[data-pin-id]');
      if (!target) return;
      state.pinnedNoteId = target.getAttribute('data-pin-id') || '';
      savePinned();
      renderCommunityFeed();
    });

    el.canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    updateHint();
  }

  function initAuth() {
    var sb = getClient();
    if (!sb) {
      syncAccess(null);
      return;
    }

    sb.auth.getSession().then(function(res) {
      syncAccess(res && res.data && res.data.session ? res.data.session.user : null);
    }).catch(function() { syncAccess(null); });

    sb.auth.onAuthStateChange(function(event, session) {
      syncAccess(session ? session.user : null);
      fetchRemote();
    });

    window.addEventListener('t5-auth-changed', function(e) {
      syncAccess(e.detail ? e.detail.user : null);
    });
  }

  function init() {
    injectStyles();
    load();
    buildUI();
    initAuth();
    fetchRemote();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();