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
  var state = {
    strokes: [],
    current: null,
    mode: 'draw',
    color: '#f5f2ec',
    size: 5,
    user: null,
    canDraw: false,
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

  function setStatus(target, message, tone) {
    if (!target) return;
    target.textContent = message;
    target.dataset.tone = tone || 'muted';
  }

  function syncAuthState(user) {
    state.user = user || null;
    var canadian = isCanadianUser(state.user);
    var configured = !!getClient();
    state.canDraw = !!(state.user && canadian && configured);

    if (state.canDraw) {
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
    return { x: x, y: y };
  }

  // ── Chalk texture renderer (dot-stamp for realistic chalk look) ──
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

  function drawStroke(ctx, stroke) {
    if (!stroke || !stroke.points || stroke.points.length === 0) return;
    ctx.save();

    if (stroke.mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = (stroke.size || 5) * 2.2;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      stroke.points.forEach(function(point, index) {
        var px = point.x * state.canvasWidth;
        var py = point.y * state.canvasHeight;
        if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Chalk dot-stamp rendering
    ctx.globalCompositeOperation = 'source-over';
    var baseSize = (stroke.size || 5) * 0.45;
    var color = stroke.color || '#f5f2ec';

    // Fade strokes nearing expiry (last 5 minutes)
    var fadeAlpha = 1.0;
    if (stroke.expires_at) {
      var remaining = new Date(stroke.expires_at).getTime() - Date.now();
      if (remaining < 300000 && remaining > 0) fadeAlpha = remaining / 300000;
    }

    for (var i = 0; i < stroke.points.length; i++) {
      var p = stroke.points[i];
      var px = p.x * state.canvasWidth;
      var py = p.y * state.canvasHeight;

      if (i > 0) {
        // Interpolate between points for continuous chalk texture
        var prev = stroke.points[i - 1];
        var ppx = prev.x * state.canvasWidth;
        var ppy = prev.y * state.canvasHeight;
        var dist = Math.sqrt((px - ppx) * (px - ppx) + (py - ppy) * (py - ppy));
        var steps = Math.max(1, Math.floor(dist / 3));

        for (var s = 0; s <= steps; s++) {
          var t = s / steps;
          var ix = ppx + (px - ppx) * t;
          var iy = ppy + (py - ppy) * t;
          var seed = i * 1000 + s;
          var jx = ix + (seededRandom(seed) - 0.5) * 2.0;
          var jy = iy + (seededRandom(seed + 7) - 0.5) * 2.0;
          var alpha = (0.45 + seededRandom(seed + 13) * 0.4) * fadeAlpha;
          var rad = baseSize * (0.7 + seededRandom(seed + 19) * 0.6);
          drawChalkDot(ctx, jx, jy, rad, color, alpha);
        }
      } else {
        // Single point
        drawChalkDot(ctx, px, py, baseSize, color, 0.7 * fadeAlpha);
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
      if (stroke.mode !== 'draw') return;
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

  function saveStroke(stroke) {
    var sb = getClient();
    if (!sb || !state.user) return Promise.resolve();
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
    state.current = {
      board_key: BOARD_KEY,
      user_id: state.user.id,
      user_name: getUserName(state.user),
      user_email: state.user.email || '',
      user_avatar: (state.user.user_metadata && (state.user.user_metadata.avatar_url || state.user.user_metadata.picture)) || '',
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
    if (!state.current) return;
    evt.preventDefault();
    state.current.points.push(canvasPoint(evt));
    redraw();
  }

  function endStroke(evt) {
    if (!state.current) return;
    evt.preventDefault();
    finishStroke();
  }

  function setMode(mode) {
    state.mode = mode;
    el.toolDraw.classList.toggle('active', mode === 'draw');
    el.toolErase.classList.toggle('active', mode === 'erase');
    el.canvas.style.cursor = mode === 'erase' ? 'cell' : 'crosshair';
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
    el.size.addEventListener('input', function() { state.size = parseInt(el.size.value, 10) || 5; });
    el.color.addEventListener('input', function() { state.color = el.color.value; });

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
    el.lock = $('chalkboard-lock');
    el.status = $('chalkboard-status');
    el.syncStatus = $('chalk-sync-status');
    el.contributors = $('chalkboard-contributors');
    el.signIn = $('chalk-signin');
    el.signInOverlay = $('chalk-signin-overlay');
    el.signOut = $('chalk-signout');
    el.toolDraw = $('tool-draw');
    el.toolErase = $('tool-erase');
    el.size = $('brush-size');
    el.color = $('brush-color');
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
    bindCanvas();
    bindAuth();
    setMode('draw');
    resizeCanvas();
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