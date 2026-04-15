/**
 * TENET5 Chalkboard
 * Collaborative public board with Google auth, Canadian context gate, and one-hour persistence.
 *
 * Suggested Supabase schema:
 * create table if not exists public.chalkboard_marks (
 *   id uuid primary key default gen_random_uuid(),
 *   board_key text not null default 'tenet5-public',
 *   user_id text not null,
 *   user_name text,
 *   user_email text,
 *   user_avatar text,
 *   mode text not null check (mode in ('draw','erase')),
 *   color text not null default '#f5f2ec',
 *   size integer not null default 5,
 *   points jsonb not null,
 *   created_at timestamptz not null default now(),
 *   expires_at timestamptz not null default (now() + interval '1 hour')
 * );
 */
(function() {
  'use strict';
  if (window.__TENET5_CHALKBOARD_LOADED) return;
  window.__TENET5_CHALKBOARD_LOADED = true;

  var BOARD_KEY = 'tenet5-public';
  var MAX_AGE_MS = 60 * 60 * 1000;
  var POLL_MS = 15000;
  var PREVIEW_STORAGE_KEY = 'tenet5-chalkboard-preview-v3';
  var SPEAKER_POS_KEY = 'tenet5-speaker-pos-v1';

  var state = {
    strokes: [],
    current: null,
    mode: 'draw',
    color: '#f5f2ec',
    size: 5,
    text: 'Truth matters',
    user: null,
    canDraw: false,
    previewMode: false,
    draggingTextId: null,
    dragOffset: null,
    selectedTextId: null,
    cameraStream: null,
    speakerVisible: false,
    speakerDrag: null,
    speakerPos: { x: 16, y: 16 },
    sb: null,
    lastRemoteSync: 0,
    canvasWidth: 0,
    canvasHeight: 0
  };

  var el = {};

  function $(id) { return document.getElementById(id); }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function getClient() {
    if (state.sb) return state.sb;
    if (!window.supabase || !window.supabase.createClient) return null;
    var url = window.SUPABASE_URL || '';
    var key = window.SUPABASE_ANON || '';
    if (!url || url.indexOf('YOUR_') !== -1 || !key || key.indexOf('YOUR_') !== -1) return null;
    state.sb = window.supabase.createClient(url, key);
    return state.sb;
  }

  function isCanadianUser(user) {
    if (!user) return false;
    var meta = user.user_metadata || {};
    var email = String(user.email || '').toLowerCase();
    var locale = String(meta.locale || '').toLowerCase();
    var lang = String(navigator.language || '').toLowerCase();
    var tz = String((Intl.DateTimeFormat().resolvedOptions().timeZone || '')).toLowerCase();
    var canadianZones = ['toronto', 'vancouver', 'edmonton', 'winnipeg', 'halifax', 'st_johns', 'regina', 'whitehorse', 'yellowknife', 'iqaluit', 'moncton'];
    return (
      email.indexOf('@canada.ca') !== -1 ||
      email.indexOf('@gc.ca') !== -1 ||
      /\.ca$/.test(email) ||
      locale.indexOf('ca') !== -1 ||
      lang.indexOf('-ca') !== -1 ||
      canadianZones.some(function(zone) { return tz.indexOf(zone) !== -1; })
    );
  }

  function getUserName(user) {
    if (!user) return 'Anonymous';
    var meta = user.user_metadata || {};
    return meta.full_name || meta.name || user.email || 'Anonymous';
  }

  function shouldEnablePreviewMode() {
    var host = String(window.location.hostname || '').toLowerCase();
    return !getClient() && (
      window.location.protocol === 'file:' ||
      host === '127.0.0.1' ||
      host === 'localhost'
    );
  }

  function setStatus(target, message, tone) {
    if (!target) return;
    target.textContent = message;
    target.dataset.tone = tone || 'muted';
  }

  function setPromptText(message) {
    state.text = message;
    if (el.textInput) {
      el.textInput.value = message;
      el.textInput.focus();
    }
    setMode('text');
    setStatus(el.syncStatus, 'LIRIL loaded a board prompt. Tap the board to place it.', 'good');
  }

  function speakCurrentText() {
    var text = String((el.textInput && el.textInput.value) || state.text || '').trim();
    if (!text) {
      setStatus(el.syncStatus, 'Type a message first, then ask LIRIL to speak it.', 'warn');
      return;
    }
    if (!('speechSynthesis' in window)) {
      setStatus(el.syncStatus, 'Speech synthesis is unavailable in this browser.', 'warn');
      return;
    }

    var premiumVoice = window.LIRIL_VOICE && window.LIRIL_VOICE.get ? window.LIRIL_VOICE.get() : null;
    var safeVoice = !!(premiumVoice && (!window.LIRIL_VOICE || (
      window.LIRIL_VOICE.isFemale(premiumVoice) &&
      !window.LIRIL_VOICE.isMale(premiumVoice) &&
      !window.LIRIL_VOICE.isDesktop(premiumVoice) &&
      window.LIRIL_VOICE.isNeural(premiumVoice)
    )));

    if (!safeVoice) {
      window.speechSynthesis.cancel();
      setStatus(el.syncStatus, 'Premium voice is unavailable here, so LIRIL stays muted rather than using a robotic fallback.', 'warn');
      return;
    }

    var utterance = new SpeechSynthesisUtterance(text);
    var params = (window.LIRIL_VOICE && window.LIRIL_VOICE.params) || { rate: 0.9, pitch: 1.1, volume: 1 };
    utterance.voice = premiumVoice;
    utterance.lang = premiumVoice.lang || 'en-GB';
    utterance.rate = params.rate;
    utterance.pitch = params.pitch;
    utterance.volume = params.volume;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setStatus(el.syncStatus, 'LIRIL is voicing the current chalk message with the premium voice lock.', 'good');
  }

  function syncAuthState(user) {
    state.user = user || null;
    var canadian = isCanadianUser(state.user);
    var configured = !!getClient();
    state.previewMode = shouldEnablePreviewMode() && !state.user;
    state.canDraw = !!((state.user && canadian && configured) || state.previewMode);

    if (state.previewMode) {
      el.lock.classList.add('hidden');
      setStatus(el.status, 'Local preview mode active. Chalk physics are unlocked for testing.', 'good');
      setStatus(el.syncStatus, 'Preview chalk mode is live on this local build. Public posting still requires Google auth.', 'good');
    } else if (state.canDraw) {
      el.lock.classList.add('hidden');
      setStatus(el.status, 'Signed in as ' + getUserName(state.user) + '. Canadian account accepted.', 'good');
      setStatus(el.syncStatus, 'Live board ready. Marks expire automatically after one hour.', 'good');
    } else if (state.user && !canadian) {
      el.lock.classList.remove('hidden');
      setStatus(el.status, 'Canadian account context is required to write on this board.', 'warn');
      setStatus(el.syncStatus, 'Signed in, but write access is limited to Canada-only context.', 'warn');
    } else if (!configured) {
      el.lock.classList.remove('hidden');
      setStatus(el.status, 'Google board auth will activate when Supabase credentials are configured.', 'warn');
      setStatus(el.syncStatus, 'Board is in secure read-only mode until auth is configured.', 'warn');
    } else {
      el.lock.classList.remove('hidden');
      setStatus(el.status, 'Sign in with Google to draw or wipe marks.', 'muted');
      setStatus(el.syncStatus, 'View-only mode. Sign in to participate.', 'muted');
    }
  }

  function bindAuth() {
    function signin() {
      var sb = getClient();
      if (!sb) {
        syncAuthState(state.user);
        return;
      }
      try { sessionStorage.setItem('t5-auth-return', window.location.origin + window.location.pathname); } catch (e) {}
      sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth-callback.html',
          queryParams: { prompt: 'select_account' }
        }
      });
    }

    function signout() {
      var sb = getClient();
      if (sb) sb.auth.signOut();
      syncAuthState(null);
    }

    [el.signIn, el.signInOverlay].forEach(function(node) {
      if (node) node.addEventListener('click', signin);
    });
    if (el.signOut) el.signOut.addEventListener('click', signout);

    if (window.TENET5_AUTH && window.TENET5_AUTH.onAuthChange) {
      window.TENET5_AUTH.onAuthChange(syncAuthState);
    }

    var sb = getClient();
    if (sb) {
      sb.auth.getSession().then(function(res) {
        syncAuthState(res && res.data && res.data.session ? res.data.session.user : null);
      });
      sb.auth.onAuthStateChange(function(event, session) {
        syncAuthState(session ? session.user : null);
      });
    } else {
      syncAuthState(null);
    }
  }

  function resizeCanvas() {
    var rect = el.canvas.getBoundingClientRect();
    state.canvasWidth = Math.max(1, Math.floor(rect.width));
    state.canvasHeight = Math.max(1, Math.floor(rect.height));
    el.canvas.width = state.canvasWidth;
    el.canvas.height = state.canvasHeight;
    redraw();
  }

  function canvasPoint(evt) {
    var rect = el.canvas.getBoundingClientRect();
    var x = clamp((evt.clientX - rect.left) / rect.width, 0, 1);
    var y = clamp((evt.clientY - rect.top) / rect.height, 0, 1);
    var pressure = (typeof evt.pressure === 'number' && evt.pressure > 0) ? evt.pressure : 0.55;
    return { x: x, y: y, p: pressure };
  }

  // ── Chalk texture renderer (layered powder + edge breakup) ──
  function drawChalkDot(ctx, px, py, radius, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function seededRandom(seed) {
    var x = Math.sin(seed) * 43758.5453;
    return x - Math.floor(x);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function drawSegmentDust(ctx, x, y, nx, ny, spread, density, color, alpha, seedBase) {
    for (var d = 0; d < density; d++) {
      var seed = seedBase + d * 13;
      var drift = (seededRandom(seed) - 0.5) * spread;
      var offset = seededRandom(seed + 7) * spread * 0.55;
      var rad = 0.25 + seededRandom(seed + 11) * 0.85;
      drawChalkDot(ctx, x + nx * drift, y + ny * drift + offset, rad, color, alpha * (0.35 + seededRandom(seed + 17) * 0.65));
    }
  }

  function drawTextMark(ctx, stroke) {
    if (!stroke || !stroke.text || !stroke.points || !stroke.points.length) return;
    var p = stroke.points[0];
    var px = p.x * state.canvasWidth;
    var py = p.y * state.canvasHeight;
    var size = Math.max(16, Math.min(42, 12 + (stroke.size || 5) * 2));
    var text = String(stroke.text || '').slice(0, 120);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(((stroke.rotation || 0) * Math.PI) / 180);
    ctx.font = '700 ' + size + 'px "Special Elite", "Courier Prime", serif';
    ctx.textBaseline = 'top';
    ctx.fillStyle = stroke.color || '#f5f2ec';
    ctx.globalAlpha = 0.18;
    ctx.fillText(text, 1.4, 1.2);
    ctx.globalAlpha = 0.90;
    ctx.fillText(text, 0, 0);
    for (var c = 0; c < text.length * 2; c++) {
      var seed = (stroke.created_at ? new Date(stroke.created_at).getTime() : 1) + c * 17;
      var ox = (seededRandom(seed) - 0.5) * 1.6;
      var oy = (seededRandom(seed + 9) - 0.5) * 1.2;
      drawChalkDot(ctx, ox + seededRandom(seed + 13) * Math.max(40, size * text.length * 0.45), oy + size * 0.55, 0.35 + seededRandom(seed + 21) * 0.8, stroke.color || '#f5f2ec', 0.05);
    }
    if (state.selectedTextId === strokeKey(stroke)) {
      var width = ctx.measureText(text).width;
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1;
      ctx.strokeRect(-5, -5, width + 10, size + 10);
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function drawStroke(ctx, stroke) {
    if (!stroke || !stroke.points || stroke.points.length === 0) return;
    if (stroke.mode === 'text') {
      drawTextMark(ctx, stroke);
      return;
    }
    ctx.save();

    if (stroke.mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = (stroke.size || 5) * 2.8;
      ctx.strokeStyle = 'rgba(0,0,0,0.95)';
      ctx.shadowBlur = (stroke.size || 5) * 1.2;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      stroke.points.forEach(function(point, index) {
        var px = point.x * state.canvasWidth;
        var py = point.y * state.canvasHeight;
        if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      stroke.points.forEach(function(point, index) {
        var px = point.x * state.canvasWidth;
        var py = point.y * state.canvasHeight;
        drawChalkDot(ctx, px, py, (stroke.size || 5) * 0.18, 'rgba(230, 225, 214, 1)', 0.04 + (index % 3) * 0.01);
      });
      ctx.restore();
      return;
    }

    ctx.globalCompositeOperation = 'source-over';
    var baseSize = (stroke.size || 5) * 0.42;
    var color = stroke.color || '#f5f2ec';

    var fadeAlpha = 1.0;
    if (stroke.expires_at) {
      var remaining = new Date(stroke.expires_at).getTime() - Date.now();
      if (remaining < 300000 && remaining > 0) fadeAlpha = remaining / 300000;
    }

    if (stroke.points.length > 1) {
      ctx.beginPath();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = (stroke.size || 5) * 1.22;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.07 * fadeAlpha;
      ctx.shadowBlur = (stroke.size || 5) * 0.9;
      ctx.shadowColor = 'rgba(255,255,255,0.22)';
      stroke.points.forEach(function(point, index) {
        var px = point.x * state.canvasWidth;
        var py = point.y * state.canvasHeight;
        if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    for (var i = 0; i < stroke.points.length; i++) {
      var p = stroke.points[i];
      var px = p.x * state.canvasWidth;
      var py = p.y * state.canvasHeight;

      if (i > 0) {
        var prev = stroke.points[i - 1];
        var ppx = prev.x * state.canvasWidth;
        var ppy = prev.y * state.canvasHeight;
        var dist = Math.sqrt((px - ppx) * (px - ppx) + (py - ppy) * (py - ppy));
        var steps = Math.max(2, Math.floor(dist / 1.8));
        var dx = px - ppx;
        var dy = py - ppy;
        var segLen = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        var nx = -dy / segLen;
        var ny = dx / segLen;

        for (var s = 0; s <= steps; s++) {
          var t = s / steps;
          var ix = lerp(ppx, px, t);
          var iy = lerp(ppy, py, t);
          var pressure = lerp(prev.p || 0.55, p.p || 0.55, t);
          var slowFactor = clamp(1.2 - (dist / 22), 0.65, 1.15);
          var density = Math.max(5, Math.floor((stroke.size || 5) * 1.3));
          var seed = i * 1000 + s;

          for (var k = 0; k < density; k++) {
            var jitter = (seededRandom(seed + k) - 0.5) * (stroke.size || 5) * 0.28;
            var grain = baseSize * (0.35 + seededRandom(seed + k + 19) * 0.95) * (0.75 + pressure * 0.6);
            var alpha = (0.12 + seededRandom(seed + k + 31) * 0.24) * slowFactor * fadeAlpha;
            drawChalkDot(ctx, ix + nx * jitter, iy + ny * jitter, grain, color, alpha);
          }

          drawSegmentDust(ctx, ix, iy, nx, ny, (stroke.size || 5) * 0.7, Math.max(2, Math.floor((stroke.size || 5) / 2)), color, 0.045 * fadeAlpha, seed + 300);
        }
      } else {
        drawChalkDot(ctx, px, py, baseSize, color, 0.42 * fadeAlpha);
      }
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  // ── Ramer-Douglas-Peucker simplification ──
  function rdpSimplify(points, epsilon) {
    if (points.length <= 2) return points;
    var dmax = 0, index = 0;
    var first = points[0], last = points[points.length - 1];
    for (var i = 1; i < points.length - 1; i++) {
      var d = perpDist(points[i], first, last);
      if (d > dmax) { dmax = d; index = i; }
    }
    if (dmax > epsilon) {
      var left = rdpSimplify(points.slice(0, index + 1), epsilon);
      var right = rdpSimplify(points.slice(index), epsilon);
      return left.slice(0, -1).concat(right);
    }
    return [first, last];
  }

  function perpDist(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.sqrt((p.x - a.x) * (p.x - a.x) + (p.y - a.y) * (p.y - a.y));
    var t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = clamp(t, 0, 1);
    var nx = a.x + t * dx, ny = a.y + t * dy;
    return Math.sqrt((p.x - nx) * (p.x - nx) + (p.y - ny) * (p.y - ny));
  }

  function pruneExpired() {
    var cutoff = Date.now();
    state.strokes = state.strokes.filter(function(stroke) {
      return new Date(stroke.expires_at || stroke.created_at).getTime() > cutoff;
    });
  }

  function drawBoardTexture(ctx) {
    var seedBase = state.canvasWidth * 1.37 + state.canvasHeight * 0.91;
    ctx.save();

    for (var i = 0; i < 18; i++) {
      var y = state.canvasHeight * (0.04 + i * 0.053) + (seededRandom(seedBase + i) - 0.5) * 8;
      ctx.strokeStyle = 'rgba(255,255,255,0.018)';
      ctx.lineWidth = 6 + seededRandom(seedBase + i + 9) * 12;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(state.canvasWidth * 0.3, y + 6, state.canvasWidth * 0.7, y - 6, state.canvasWidth, y + 2);
      ctx.stroke();
    }

    for (var d = 0; d < 180; d++) {
      var dustX = seededRandom(seedBase + d * 11) * state.canvasWidth;
      var dustY = state.canvasHeight * 0.88 + seededRandom(seedBase + d * 17) * state.canvasHeight * 0.12;
      var alpha = 0.015 + seededRandom(seedBase + d * 23) * 0.03;
      var radius = 0.4 + seededRandom(seedBase + d * 29) * 1.2;
      drawChalkDot(ctx, dustX, dustY, radius, '#f1ede2', alpha);
    }
    ctx.restore();
  }

  // ── Timeline background (faint chalk text from research events) ──
  function drawTimelineBackground(ctx) {
    var events = (window.TENET5_TIMELINE && window.TENET5_TIMELINE.events) || [];
    if (!events.length) return;

    // Sort by date
    var sorted = events.slice().sort(function(a, b) {
      return (a.year * 100 + (a.month || 0)) - (b.year * 100 + (b.month || 0));
    });

    var cols = state.canvasWidth > 600 ? 4 : 2;
    var rows = Math.ceil(sorted.length / cols);
    var cellW = state.canvasWidth / cols;
    var cellH = Math.max(state.canvasHeight / rows, 46);

    ctx.save();
    ctx.textBaseline = 'top';

    for (var i = 0; i < sorted.length; i++) {
      var ev = sorted[i];
      var col = i % cols;
      var row = Math.floor(i / cols);
      var x = col * cellW + 14;
      var y = row * cellH + 8;

      if (y > state.canvasHeight - 20) break;

      // Year — large faint text
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = ev.color || '#888';
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillText(ev.year + (ev.month ? '/' + String(ev.month).padStart(2, '0') : ''), x, y);

      // Title — smaller, even fainter
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#e8e4dc';
      ctx.font = '10px "Inter", sans-serif';
      var title = ev.title || '';
      if (title.length > 28) title = title.substring(0, 26) + '..';
      ctx.fillText(title, x, y + 14);
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  function redraw() {
    if (!el.canvas) return;
    var ctx = el.canvas.getContext('2d');
    ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    drawBoardTexture(ctx);
    drawTimelineBackground(ctx);
    pruneExpired();
    state.strokes.forEach(function(stroke) { drawStroke(ctx, stroke); });
    if (state.current) drawStroke(ctx, state.current);
    renderContributors();
  }

  function renderContributors() {
    if (!el.contributors) return;
    var counts = {};
    state.strokes.forEach(function(stroke) {
      if (stroke.mode === 'erase') return;
      var key = stroke.user_name || stroke.user_email || 'Anonymous';
      counts[key] = (counts[key] || 0) + 1;
    });
    var entries = Object.keys(counts);
    if (!entries.length) {
      el.contributors.innerHTML = '<span class="chalk-pill">No marks yet</span>';
      return;
    }
    el.contributors.innerHTML = entries.slice(0, 12).map(function(name) {
      return '<span class="chalk-pill"><strong>' + escapeHtml(name) + '</strong><span>' + counts[name] + ' marks</span></span>';
    }).join('');
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function strokeKey(stroke) {
    return String(stroke.id || stroke.created_at || ((stroke.user_id || 'anon') + ':' + (stroke.text || '') + ':' + (stroke.mode || 'draw')));
  }

  function findStrokeByKey(key) {
    for (var i = 0; i < state.strokes.length; i++) {
      if (strokeKey(state.strokes[i]) === key) return state.strokes[i];
    }
    return null;
  }

  function persistPreviewBoard() {
    if (!state.previewMode) return;
    try { localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(state.strokes)); } catch (e) {}
  }

  function loadPreviewBoard() {
    if (!shouldEnablePreviewMode()) return;
    try {
      var saved = localStorage.getItem(PREVIEW_STORAGE_KEY);
      if (saved) state.strokes = JSON.parse(saved) || [];
    } catch (e) {}
  }

  function getTextBounds(stroke) {
    if (!stroke || stroke.mode !== 'text' || !stroke.points || !stroke.points.length || !el.canvas) return null;
    var ctx = el.canvas.getContext('2d');
    var size = Math.max(16, Math.min(42, 12 + (stroke.size || 5) * 2));
    ctx.save();
    ctx.font = '700 ' + size + 'px "Special Elite", "Courier Prime", serif';
    var width = ctx.measureText(String(stroke.text || '')).width;
    ctx.restore();
    var px = stroke.points[0].x * state.canvasWidth;
    var py = stroke.points[0].y * state.canvasHeight;
    return { left: px - 8, top: py - 8, right: px + width + 8, bottom: py + size + 10 };
  }

  function findTextMarkAt(evt) {
    var point = canvasPoint(evt);
    var px = point.x * state.canvasWidth;
    var py = point.y * state.canvasHeight;
    for (var i = state.strokes.length - 1; i >= 0; i--) {
      var stroke = state.strokes[i];
      var box = getTextBounds(stroke);
      if (!box) continue;
      if (px >= box.left && px <= box.right && py >= box.top && py <= box.bottom) {
        return { stroke: stroke, point: point };
      }
    }
    return null;
  }

  function persistStrokeUpdate(stroke) {
    if (!stroke) return Promise.resolve();
    if (state.previewMode || !getClient() || !stroke.id) {
      persistPreviewBoard();
      return Promise.resolve();
    }
    return state.sb.from('chalkboard_marks')
      .update({ points: stroke.points, text: stroke.text || null, size: stroke.size, rotation: stroke.rotation || 0 })
      .eq('id', stroke.id)
      .then(function() { return null; })
      .catch(function() { return null; });
  }

  function setSpeakerVisible(visible) {
    state.speakerVisible = !!visible;
    if (!el.speakerCorner) return;
    el.speakerCorner.classList.toggle('hidden', !visible);
  }

  function moveSpeakerFrame(x, y) {
    if (!el.speakerCorner || !el.surface) return;
    var maxX = Math.max(8, el.surface.clientWidth - el.speakerCorner.offsetWidth - 8);
    var maxY = Math.max(8, el.surface.clientHeight - el.speakerCorner.offsetHeight - 8);
    state.speakerPos = { x: clamp(x, 8, maxX), y: clamp(y, 8, maxY) };
    el.speakerCorner.style.left = state.speakerPos.x + 'px';
    el.speakerCorner.style.top = state.speakerPos.y + 'px';
  }

  function restoreSpeakerPosition() {
    if (!el.speakerCorner) return;
    try {
      var saved = JSON.parse(localStorage.getItem(SPEAKER_POS_KEY) || 'null');
      if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
        moveSpeakerFrame(saved.x, saved.y);
        return;
      }
    } catch (e) {}
    moveSpeakerFrame(16, 16);
  }

  function storeSpeakerPosition() {
    try { localStorage.setItem(SPEAKER_POS_KEY, JSON.stringify(state.speakerPos)); } catch (e) {}
  }

  function stopSpeakerCamera() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(function(track) { track.stop(); });
      state.cameraStream = null;
    }
    if (el.speakerVideo) el.speakerVideo.srcObject = null;
    if (el.speakerPlaceholder) el.speakerPlaceholder.style.display = 'flex';
    if (el.speakerStart) {
      el.speakerStart.classList.remove('live');
      el.speakerStart.textContent = 'Start Camera';
    }
    setSpeakerVisible(false);
    if (el.speakerStatus) setStatus(el.speakerStatus, 'Camera is off. Start it to place yourself on the chalkboard while you write.', 'muted');
  }

  function startSpeakerCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (el.speakerStatus) setStatus(el.speakerStatus, 'This browser does not expose camera access.', 'warn');
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== '127.0.0.1' && window.location.hostname !== 'localhost') {
      if (el.speakerStatus) setStatus(el.speakerStatus, 'Camera access requires HTTPS or local preview.', 'warn');
      return;
    }
    if (state.cameraStream) {
      setSpeakerVisible(true);
      restoreSpeakerPosition();
      if (el.speakerStatus) setStatus(el.speakerStatus, 'Live camera is already on the board.', 'good');
      return;
    }
    if (el.speakerStatus) setStatus(el.speakerStatus, 'Requesting camera access for Speakers\' Corner…', 'muted');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      .then(function(stream) {
        state.cameraStream = stream;
        if (el.speakerVideo) el.speakerVideo.srcObject = stream;
        if (el.speakerPlaceholder) el.speakerPlaceholder.style.display = 'none';
        if (el.speakerName) el.speakerName.textContent = state.user ? getUserName(state.user) : 'Local preview';
        if (el.speakerStart) {
          el.speakerStart.classList.add('live');
          el.speakerStart.textContent = 'Camera Live';
        }
        setSpeakerVisible(true);
        restoreSpeakerPosition();
        if (el.speakerStatus) setStatus(el.speakerStatus, 'Live camera is on the board. Drag the frame while you write.', 'good');
      })
      .catch(function(err) {
        if (el.speakerPlaceholder) {
          el.speakerPlaceholder.style.display = 'flex';
          el.speakerPlaceholder.textContent = 'Camera access was blocked or unavailable. Allow permission to appear on the board.';
        }
        if (el.speakerStatus) setStatus(el.speakerStatus, 'Camera access failed: ' + (err && err.name ? err.name : 'unavailable'), 'warn');
      });
  }

  function bindSpeakerDrag() {
    if (!el.speakerHandle || !el.speakerCorner || !el.surface) return;

    el.speakerHandle.addEventListener('pointerdown', function(evt) {
      evt.preventDefault();
      if (!state.speakerVisible) return;
      var rect = el.speakerCorner.getBoundingClientRect();
      state.speakerDrag = { pointerId: evt.pointerId, offsetX: evt.clientX - rect.left, offsetY: evt.clientY - rect.top };
      el.speakerHandle.setPointerCapture(evt.pointerId);
    });

    window.addEventListener('pointermove', function(evt) {
      if (!state.speakerDrag || !el.surface) return;
      var surfaceRect = el.surface.getBoundingClientRect();
      moveSpeakerFrame(evt.clientX - surfaceRect.left - state.speakerDrag.offsetX, evt.clientY - surfaceRect.top - state.speakerDrag.offsetY);
    });

    function endDrag() {
      if (!state.speakerDrag) return;
      state.speakerDrag = null;
      storeSpeakerPosition();
    }

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  function saveStroke(stroke) {
    var sb = getClient();
    if (!sb || !state.user) {
      persistPreviewBoard();
      return Promise.resolve();
    }
    return sb.from('chalkboard_marks').insert(stroke).then(function(res) {
      if (res.error) {
        setStatus(el.syncStatus, 'Saved locally, but remote sync reported: ' + res.error.message, 'warn');
      } else {
        setStatus(el.syncStatus, 'Board synced at ' + new Date().toLocaleTimeString('en-CA'), 'good');
      }
    }).catch(function(err) {
      setStatus(el.syncStatus, 'Board sync failed: ' + err.message, 'bad');
    });
  }

  function finishStroke() {
    if (!state.current || !state.current.points.length) return;
    // Simplify before storing (reduces payload 5-10x)
    if (state.current.points.length > 3) {
      state.current.points = rdpSimplify(state.current.points, 0.002);
    }
    state.strokes.push(state.current);
    var complete = state.current;
    state.current = null;
    redraw();
    saveStroke(complete);
  }

  function startStroke(evt) {
    if (!state.canDraw) return;
    evt.preventDefault();
    el.canvas.setPointerCapture(evt.pointerId);

    if (state.mode === 'text') {
      var hit = findTextMarkAt(evt);
      if (hit && hit.stroke) {
        state.selectedTextId = strokeKey(hit.stroke);
        state.draggingTextId = state.selectedTextId;
        state.dragOffset = {
          x: hit.point.x - hit.stroke.points[0].x,
          y: hit.point.y - hit.stroke.points[0].y
        };
        redraw();
        setStatus(el.syncStatus, 'Dragging chalk note…', 'muted');
        return;
      }

      var message = String((el.textInput && el.textInput.value) || state.text || '').trim();
      if (!message) {
        setStatus(el.syncStatus, 'Type a chalk message first, then tap the board to place it.', 'warn');
        return;
      }
      var note = {
        board_key: BOARD_KEY,
        user_id: state.user ? state.user.id : 'local-preview',
        user_name: state.user ? getUserName(state.user) : 'Local preview',
        user_email: state.user ? (state.user.email || '') : '',
        user_avatar: (state.user && state.user.user_metadata && (state.user.user_metadata.avatar_url || state.user.user_metadata.picture)) || '',
        mode: 'text',
        text: message,
        rotation: Math.round((seededRandom(Date.now()) - 0.5) * 6),
        color: state.color,
        size: state.size,
        points: [canvasPoint(evt)],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + MAX_AGE_MS).toISOString()
      };
      state.selectedTextId = strokeKey(note);
      state.strokes.push(note);
      redraw();
      saveStroke(note);
      setStatus(el.syncStatus, 'Chalk note placed on the board.', 'good');
      return;
    }

    state.selectedTextId = null;
    state.current = {
      board_key: BOARD_KEY,
      user_id: state.user ? state.user.id : 'local-preview',
      user_name: state.user ? getUserName(state.user) : 'Local preview',
      user_email: state.user ? (state.user.email || '') : '',
      user_avatar: (state.user && state.user.user_metadata && (state.user.user_metadata.avatar_url || state.user.user_metadata.picture)) || '',
      mode: state.mode,
      color: state.color,
      size: state.size,
      points: [canvasPoint(evt)],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + MAX_AGE_MS).toISOString()
    };
    redraw();
  }

  function moveStroke(evt) {
    if (state.draggingTextId) {
      evt.preventDefault();
      var target = findStrokeByKey(state.draggingTextId);
      if (!target || !target.points || !target.points.length) return;
      var point = canvasPoint(evt);
      target.points[0] = {
        x: clamp(point.x - (state.dragOffset ? state.dragOffset.x : 0), 0.02, 0.94),
        y: clamp(point.y - (state.dragOffset ? state.dragOffset.y : 0), 0.02, 0.94),
        p: point.p
      };
      redraw();
      return;
    }
    if (!state.current) return;
    evt.preventDefault();
    state.current.points.push(canvasPoint(evt));
    redraw();
  }

  function endStroke(evt) {
    if (state.draggingTextId) {
      if (evt) evt.preventDefault();
      var moved = findStrokeByKey(state.draggingTextId);
      state.draggingTextId = null;
      state.dragOffset = null;
      persistStrokeUpdate(moved);
      redraw();
      setStatus(el.syncStatus, 'Chalk note moved.', 'good');
      return;
    }
    if (!state.current) return;
    evt.preventDefault();
    finishStroke();
  }

  function setMode(mode) {
    state.mode = mode;
    el.toolDraw.classList.toggle('active', mode === 'draw');
    el.toolErase.classList.toggle('active', mode === 'erase');
    if (el.toolText) el.toolText.classList.toggle('active', mode === 'text');
    el.canvas.style.cursor = mode === 'erase' ? 'cell' : (mode === 'text' ? 'text' : 'crosshair');
    if (mode === 'text' && el.textInput) el.textInput.focus();
  }

  function fetchRemoteStrokes() {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    var now = new Date().toISOString();
    return sb.from('chalkboard_marks')
      .select('*')
      .eq('board_key', BOARD_KEY)
      .gt('expires_at', now)
      .order('created_at', { ascending: true })
      .limit(800)
      .then(function(res) {
        if (res.error) {
          setStatus(el.syncStatus, 'Remote board unavailable: ' + res.error.message, 'warn');
          return;
        }
        state.strokes = res.data || [];
        state.lastRemoteSync = Date.now();
        redraw();
        setStatus(el.syncStatus, 'Board refreshed at ' + new Date().toLocaleTimeString('en-CA'), 'good');
      })
      .catch(function(err) {
        setStatus(el.syncStatus, 'Board refresh failed: ' + err.message, 'bad');
      });
  }

  function bindCanvas() {
    el.toolDraw.addEventListener('click', function() { setMode('draw'); });
    el.toolErase.addEventListener('click', function() { setMode('erase'); });
    if (el.toolText) el.toolText.addEventListener('click', function() { setMode('text'); });
    el.size.addEventListener('input', function() {
      state.size = parseInt(el.size.value, 10) || 5;
      var selected = state.selectedTextId ? findStrokeByKey(state.selectedTextId) : null;
      if (selected && selected.mode === 'text') {
        selected.size = state.size;
        redraw();
        persistStrokeUpdate(selected);
      }
    });
    el.color.addEventListener('input', function() { state.color = el.color.value; });
    if (el.textInput) {
      el.textInput.addEventListener('input', function() { state.text = el.textInput.value || ''; });
      el.textInput.addEventListener('keydown', function(evt) {
        if (evt.key === 'Enter') {
          evt.preventDefault();
          setMode('text');
        }
      });
    }
    if (el.lirilSpeak) el.lirilSpeak.addEventListener('click', speakCurrentText);
    if (el.seedWitness) el.seedWitness.addEventListener('click', function() { setPromptText('I am adding a witness note to the TENET5 board.'); });
    if (el.seedQuestion) el.seedQuestion.addEventListener('click', function() { setPromptText('Why has this evidence not been answered publicly?'); });
    if (el.seedEvidence) el.seedEvidence.addEventListener('click', function() { setPromptText('Follow the evidence chain and preserve the record.'); });
    if (el.speakerStart) el.speakerStart.addEventListener('click', startSpeakerCamera);
    if (el.speakerStop) el.speakerStop.addEventListener('click', stopSpeakerCamera);
    bindSpeakerDrag();

    el.canvas.addEventListener('pointerdown', startStroke);
    el.canvas.addEventListener('pointermove', moveStroke);
    el.canvas.addEventListener('pointerup', endStroke);
    el.canvas.addEventListener('pointercancel', endStroke);
    el.canvas.addEventListener('pointerleave', endStroke);
    window.addEventListener('resize', resizeCanvas);
  }

  function initElements() {
    el.canvas = $('chalkboard-canvas');
    if (!el.canvas) return false;
    el.surface = document.querySelector('.chalk-surface');
    el.lock = $('chalkboard-lock');
    el.status = $('chalkboard-status');
    el.syncStatus = $('chalk-sync-status');
    el.speakerStatus = $('speaker-status');
    el.contributors = $('chalkboard-contributors');
    el.signIn = $('chalk-signin');
    el.signInOverlay = $('chalk-signin-overlay');
    el.signOut = $('chalk-signout');
    el.toolDraw = $('tool-draw');
    el.toolErase = $('tool-erase');
    el.toolText = $('tool-text');
    el.size = $('brush-size');
    el.color = $('brush-color');
    el.textInput = $('chalk-text-input');
    el.lirilSpeak = $('liril-speak');
    el.seedWitness = $('liril-seed-witness');
    el.seedQuestion = $('liril-seed-question');
    el.seedEvidence = $('liril-seed-evidence');
    el.speakerStart = $('speaker-start');
    el.speakerStop = $('speaker-stop');
    el.speakerCorner = $('speaker-corner');
    el.speakerHandle = $('speaker-handle');
    el.speakerVideo = $('speaker-video');
    el.speakerPlaceholder = $('speaker-placeholder');
    el.speakerName = $('speaker-name');
    if (el.textInput) el.textInput.value = state.text;
    return true;
  }

  // ── Supabase Realtime subscription (live sync) ──
  function subscribeRealtime() {
    var sb = getClient();
    if (!sb) return;
    try {
      sb.channel('chalkboard-live')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chalkboard_marks',
          filter: 'board_key=eq.' + BOARD_KEY
        }, function(payload) {
          if (!payload.new) return;
          // Skip our own strokes (already rendered optimistically)
          if (state.user && payload.new.user_id === state.user.id) {
            var recent = state.strokes.some(function(s) {
              return s.created_at === payload.new.created_at && s.user_id === payload.new.user_id;
            });
            if (recent) return;
          }
          state.strokes.push(payload.new);
          redraw();
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'chalkboard_marks'
        }, function(payload) {
          state.strokes = state.strokes.filter(function(s) {
            return s.id !== (payload.old && payload.old.id);
          });
          redraw();
        })
        .subscribe(function(status) {
          if (status === 'SUBSCRIBED') {
            setStatus(el.syncStatus, 'Live board connected — real-time sync active.', 'good');
          }
        });
    } catch (e) {
      // Realtime not available, fall back to polling
    }
  }

  function init() {
    if (!initElements()) return;
    loadPreviewBoard();
    bindCanvas();
    bindAuth();
    setMode('draw');
    resizeCanvas();
    restoreSpeakerPosition();
    fetchRemoteStrokes();
    subscribeRealtime();
    // Fallback polling (in case Realtime is unavailable)
    setInterval(fetchRemoteStrokes, POLL_MS);
    // Periodic redraw for expiry fade-out
    setInterval(redraw, 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();