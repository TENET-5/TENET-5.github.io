/* ═══════════════════════════════════════════════════════
   LIRIL Walkthrough Enhancements
   Non-destructive layer on top of liril-walkthrough.js + presentation.js.
   Adds:
     1. Session resume — remember last page / section; offer "resume" on return
     2. Keyboard controls — Space pause, ←/→ prev/next, Esc stop, S speed, ? help
     3. Speed control — 0.75× / 1× / 1.25× / 1.5× persistent
     4. Within-page section progress bar
     5. Help overlay (? key or click the Help pill)
   Modified: 2026-04-17
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';

  if (window.__LIRIL_WT_ENHANCEMENTS_LOADED) return;
  window.__LIRIL_WT_ENHANCEMENTS_LOADED = true;

  var LS_POSITION_KEY = 'tenet5_walkthrough_position';
  var LS_SPEED_KEY    = 'tenet5_narration_speed';
  var LS_HINT_KEY     = 'tenet5_wt_hint_shown';       // first-run keyboard hint
  var LS_TRANSCRIPT_KEY = 'tenet5_wt_transcript_open'; // remember panel state
  var LS_CC_KEY       = 'tenet5_wt_cc_on';             // closed captions toggle
  var LS_AUTOPLAY_KEY = 'tenet5_wt_autoplay';          // auto-advance to next page
  var LS_SCROLLPAUSE_KEY = 'tenet5_wt_scrollpause';    // pause on manual scroll
  var LS_VOLUME_KEY   = 'tenet5_wt_volume';            // 0.0 — 1.0 narration volume
  var LS_RESUME_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

  // Average words-per-minute for rate=1.0 (measured empirically on the LIRIL
  // voice presets). Scales inversely with the current speed multiplier.
  var BASE_WPM = 170;

  var SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];
  var DEFAULT_SPEED = 1.0;

  // ── Inject CSS ───────────────────────────────────────────────────────────
  var css = [
    '.wt-enhance-bar {',
    '  position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%);',
    '  background: rgba(10,14,22,0.92); border: 1px solid rgba(168,85,247,0.4);',
    '  border-radius: 10px; padding: 8px 16px; display: flex; gap: 12px;',
    '  align-items: center; z-index: 99998; font-family: \'Inter\', system-ui, sans-serif;',
    '  font-size: 0.78rem; color: #d8d8e0; backdrop-filter: blur(12px);',
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.15);',
    '  opacity: 0; pointer-events: none; transition: opacity 0.25s;',
    '}',
    '.wt-enhance-bar.active { opacity: 1; pointer-events: auto; }',
    '.wt-enhance-bar .wt-section-prog {',
    '  display: flex; align-items: center; gap: 6px;',
    '}',
    '.wt-enhance-bar .wt-section-track {',
    '  width: 120px; height: 4px; background: rgba(255,255,255,0.08);',
    '  border-radius: 2px; overflow: hidden;',
    '}',
    '.wt-enhance-bar .wt-section-fill {',
    '  height: 100%; background: linear-gradient(90deg, #a855f7, #c084fc);',
    '  width: 0%; transition: width 0.35s;',
    '}',
    '.wt-enhance-bar .wt-count {',
    '  font-family: \'IBM Plex Mono\', monospace; font-size: 0.72rem;',
    '  color: #a0a0b8; white-space: nowrap;',
    '}',
    '.wt-enhance-bar .wt-sep {',
    '  width: 1px; height: 20px; background: rgba(255,255,255,0.1);',
    '}',
    '.wt-enhance-bar button {',
    '  background: transparent; border: 1px solid rgba(255,255,255,0.14);',
    '  color: #d0d0e0; border-radius: 6px; padding: 3px 10px; font-size: 0.72rem;',
    '  cursor: pointer; font-family: inherit; transition: all 0.15s;',
    '}',
    '.wt-enhance-bar button:hover { border-color: #a855f7; color: #c4b5fd; }',
    '.wt-enhance-bar button.active { border-color: #a855f7; color: #c4b5fd; background: rgba(168,85,247,0.15); }',
    '.wt-enhance-bar .wt-kbd {',
    '  font-family: \'IBM Plex Mono\', monospace; font-size: 0.65rem;',
    '  color: #7a7a8c; padding: 2px 5px; border: 1px solid rgba(255,255,255,0.1);',
    '  border-radius: 3px; margin: 0 2px;',
    '}',

    '.wt-resume-banner {',
    '  position: fixed; top: 80px; right: 12px; max-width: 320px;',
    '  background: linear-gradient(135deg, rgba(10,14,22,0.95), rgba(20,14,30,0.95));',
    '  border: 1px solid #a855f7; border-radius: 10px; padding: 14px 16px;',
    '  z-index: 99997; font-family: \'Inter\', system-ui, sans-serif;',
    '  color: #d8d8e0; box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.2);',
    '  animation: wt-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);',
    '}',
    '@keyframes wt-slide-in { from { transform: translateX(360px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }',
    '.wt-resume-banner h4 {',
    '  margin: 0 0 6px 0; font-size: 0.85rem; color: #c4b5fd;',
    '  text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;',
    '}',
    '.wt-resume-banner p { margin: 0 0 10px 0; font-size: 0.82rem; line-height: 1.5; color: #b0b0c4; }',
    '.wt-resume-banner .wt-resume-where { color: #f0f0f0; font-weight: 600; }',
    '.wt-resume-banner button {',
    '  background: linear-gradient(135deg, #a855f7, #7e22ce); border: none;',
    '  color: #fff; padding: 6px 12px; font-size: 0.78rem; font-weight: 600;',
    '  border-radius: 6px; cursor: pointer; margin-right: 8px;',
    '}',
    '.wt-resume-banner .wt-dismiss {',
    '  background: transparent; border: 1px solid rgba(255,255,255,0.14);',
    '  color: #a0a0b8; font-weight: 400;',
    '}',

    '.wt-help-overlay {',
    '  position: fixed; inset: 0; background: rgba(5,5,12,0.85);',
    '  backdrop-filter: blur(8px); display: none; z-index: 99999;',
    '  align-items: center; justify-content: center; padding: 20px;',
    '  font-family: \'Inter\', system-ui, sans-serif;',
    '}',
    '.wt-help-overlay.active { display: flex; }',
    '.wt-help-card {',
    '  background: #0a0e1a; border: 1px solid rgba(168,85,247,0.4);',
    '  border-radius: 12px; padding: 2rem 2.5rem; max-width: 480px;',
    '  color: #d8d8e0; box-shadow: 0 20px 60px rgba(0,0,0,0.7);',
    '}',
    '.wt-help-card h3 { margin: 0 0 1rem 0; color: #c4b5fd; font-size: 1.2rem; }',
    '.wt-help-card .wt-help-row { display: flex; margin: 0.4rem 0; font-size: 0.88rem; }',
    '.wt-help-card .wt-help-key { min-width: 110px; font-family: \'IBM Plex Mono\', monospace; color: #a855f7; }',
    '.wt-help-card .wt-help-desc { color: #b0b0c4; }',
    '.wt-help-card .wt-close {',
    '  margin-top: 1rem; background: transparent; border: 1px solid rgba(255,255,255,0.14);',
    '  color: #c0c0d0; padding: 5px 14px; border-radius: 6px; cursor: pointer;',
    '  font-family: inherit; font-size: 0.8rem;',
    '}',
    '.wt-help-card .wt-close:hover { border-color: #a855f7; color: #c4b5fd; }',

    '.wt-hint {',
    '  position: fixed; bottom: 72px; left: 50%; transform: translateX(-50%);',
    '  background: rgba(10,14,22,0.96); border: 1px solid rgba(192,132,252,0.55);',
    '  border-radius: 8px; padding: 10px 14px; z-index: 99996; max-width: 380px;',
    '  font-family: \'Inter\', system-ui, sans-serif; font-size: 0.78rem;',
    '  color: #d8d8e0; box-shadow: 0 6px 24px rgba(0,0,0,0.45), 0 0 16px rgba(168,85,247,0.18);',
    '  animation: wt-hint-in 0.35s ease-out;',
    '}',
    '@keyframes wt-hint-in { from { transform: translate(-50%, 14px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }',
    '.wt-hint b { color: #c4b5fd; }',
    '.wt-hint button {',
    '  background: transparent; border: none; color: #a0a0b8; cursor: pointer;',
    '  font-size: 1.1rem; padding: 0 4px; margin-left: 8px; line-height: 1;',
    '}',

    '.wt-transcript {',
    '  position: fixed; top: 68px; right: 12px; width: 340px; max-height: 60vh;',
    '  background: rgba(10,14,22,0.95); border: 1px solid rgba(168,85,247,0.35);',
    '  border-radius: 10px; z-index: 99995; display: none; flex-direction: column;',
    '  font-family: \'Inter\', system-ui, sans-serif;',
    '  backdrop-filter: blur(12px); color: #d0d0e0;',
    '  box-shadow: 0 10px 40px rgba(0,0,0,0.55);',
    '}',
    '.wt-transcript.active { display: flex; }',
    '.wt-transcript-header {',
    '  padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08);',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  font-size: 0.78rem; color: #c4b5fd; text-transform: uppercase; letter-spacing: 0.05em;',
    '}',
    '.wt-transcript-header button {',
    '  background: transparent; border: none; color: #a0a0b8; cursor: pointer;',
    '  font-size: 1.1rem; padding: 0 4px;',
    '}',
    '.wt-transcript-body { overflow-y: auto; padding: 10px 12px; font-size: 0.83rem; line-height: 1.55; }',
    '.wt-transcript-body p { margin: 0 0 8px 0; color: #b0b0c4; cursor: pointer; border-left: 2px solid transparent; padding-left: 8px; transition: all 0.15s; }',
    '.wt-transcript-body p:hover { color: #e0e0f0; border-left-color: #a855f7; }',
    '.wt-transcript-body p.active { color: #f0f0f0; border-left-color: #c4b5fd; background: rgba(168,85,247,0.08); }',

    '.wt-cc {',
    '  position: fixed; left: 50%; transform: translateX(-50%);',
    '  bottom: 72px; max-width: min(760px, 92vw); min-width: 240px;',
    '  padding: 14px 22px; font-family: \'Inter\', system-ui, sans-serif;',
    '  font-size: 1.05rem; line-height: 1.45; text-align: center; color: #f4f4fa;',
    '  background: rgba(5,8,14,0.88); border: 1px solid rgba(168,85,247,0.35);',
    '  border-radius: 10px; backdrop-filter: blur(8px); z-index: 99994;',
    '  display: none; pointer-events: none;',
    '  box-shadow: 0 8px 28px rgba(0,0,0,0.55);',
    '}',
    '.wt-cc.active { display: block; }',
    '.wt-cc .wt-cc-text { text-shadow: 0 2px 8px rgba(0,0,0,0.8); }',

    '.wt-time-pill {',
    '  font-family: \'IBM Plex Mono\', monospace; font-size: 0.72rem;',
    '  color: #a0a0b8; white-space: nowrap; padding-left: 4px;',
    '}',

    '.wt-share-toast {',
    '  position: fixed; top: 84px; left: 50%; transform: translateX(-50%);',
    '  background: rgba(10,14,22,0.95); color: #c4b5fd;',
    '  padding: 8px 14px; border-radius: 8px; font-size: 0.82rem;',
    '  font-family: \'Inter\', system-ui, sans-serif; z-index: 99994;',
    '  border: 1px solid rgba(168,85,247,0.4); pointer-events: none;',
    '  animation: wt-toast-in 0.2s ease-out;',
    '}',
    '@keyframes wt-toast-in { from { transform: translate(-50%, -8px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }',

    '.wt-volume-slider {',
    '  -webkit-appearance: none; appearance: none; width: 70px; height: 4px;',
    '  background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;',
    '  cursor: pointer; margin: 0 2px;',
    '}',
    '.wt-volume-slider::-webkit-slider-thumb {',
    '  -webkit-appearance: none; appearance: none; width: 12px; height: 12px;',
    '  border-radius: 50%; background: #c4b5fd; cursor: pointer;',
    '  box-shadow: 0 0 6px rgba(168,85,247,0.5);',
    '}',
    '.wt-volume-slider::-moz-range-thumb {',
    '  width: 12px; height: 12px; border-radius: 50%; background: #c4b5fd;',
    '  cursor: pointer; border: none;',
    '}',

    '@media (max-width: 640px) {',
    '  .wt-enhance-bar { left: 6px; right: 6px; transform: none; padding: 6px 10px; gap: 6px; font-size: 0.7rem; flex-wrap: wrap; justify-content: center; }',
    '  .wt-enhance-bar .wt-section-track { width: 80px; }',
    '  .wt-enhance-bar .wt-sep { display: none; }',
    '  .wt-resume-banner { right: 6px; left: 6px; max-width: none; }',
    '  .wt-transcript { right: 6px; left: 6px; width: auto; top: 56px; max-height: 50vh; }',
    '  .wt-hint { left: 6px; right: 6px; transform: none; max-width: none; }',
    '  @keyframes wt-hint-in { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
    '}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── State ────────────────────────────────────────────────────────────────
  var speed = DEFAULT_SPEED;
  try {
    var stored = parseFloat(localStorage.getItem(LS_SPEED_KEY));
    if (SPEED_OPTIONS.indexOf(stored) !== -1) speed = stored;
  } catch (e) {}

  var totalSections = 0;
  var currentSection = 0;
  var bar = null;
  var helpOverlay = null;

  // ── Count narration-targeted sections on this page ───────────────────────
  function countSections() {
    try {
      var sects = document.querySelectorAll('[data-narrate]');
      totalSections = sects.length;
    } catch (e) { totalSections = 0; }
  }

  // ── Build the bottom bar ─────────────────────────────────────────────────
  function buildBar() {
    if (bar) return;
    bar = document.createElement('div');
    bar.className = 'wt-enhance-bar';
    bar.innerHTML =
      '<div class="wt-section-prog">' +
        '<span class="wt-count" id="wt-count">sect —/—</span>' +
        '<div class="wt-section-track"><div class="wt-section-fill" id="wt-fill"></div></div>' +
      '</div>' +
      '<div class="wt-sep"></div>' +
      '<button id="wt-sp-0" data-spd="0.75">0.75×</button>' +
      '<button id="wt-sp-1" data-spd="1">1×</button>' +
      '<button id="wt-sp-2" data-spd="1.25">1.25×</button>' +
      '<button id="wt-sp-3" data-spd="1.5">1.5×</button>' +
      '<div class="wt-sep"></div>' +
      '<button id="wt-mute-btn" title="Mute / unmute (V)">🔊</button>' +
      '<input type="range" id="wt-vol-slider" class="wt-volume-slider" min="0" max="1" step="0.05" title="Volume">' +
      '<div class="wt-sep"></div>' +
      '<button id="wt-auto-btn" title="Autoplay — advance to next page (A)">▶▶</button>' +
      '<button id="wt-cc-btn" title="Closed captions (C)">CC</button>' +
      '<button id="wt-transcript-btn" title="Show transcript (T)">☰ Text</button>' +
      '<button id="wt-export-btn" title="Download transcript .txt (D)">⤓</button>' +
      '<button id="wt-share-btn" title="Copy shareable link (M)">🔗</button>' +
      '<button id="wt-help-btn" title="Show help">? Help</button>' +
      '<span class="wt-time-pill" id="wt-time-pill"></span>';
    document.body.appendChild(bar);
    // Speed buttons
    Array.prototype.forEach.call(bar.querySelectorAll('button[data-spd]'), function(b) {
      b.addEventListener('click', function() { setSpeed(parseFloat(b.getAttribute('data-spd'))); });
    });
    bar.querySelector('#wt-help-btn').addEventListener('click', showHelp);
    bar.querySelector('#wt-transcript-btn').addEventListener('click', toggleTranscript);
    bar.querySelector('#wt-cc-btn').addEventListener('click', toggleCC);
    bar.querySelector('#wt-auto-btn').addEventListener('click', toggleAutoplay);
    bar.querySelector('#wt-share-btn').addEventListener('click', shareWalkthrough);
    bar.querySelector('#wt-mute-btn').addEventListener('click', toggleMute);
    bar.querySelector('#wt-export-btn').addEventListener('click', exportTranscript);
    var vs = bar.querySelector('#wt-vol-slider');
    vs.value = String(volume);
    vs.addEventListener('input', function() { setVolume(parseFloat(vs.value)); });
    markActiveSpeedBtn();
    markCCBtn();
    markAutoplayBtn();
    // Ensure volume is actually written to LIRIL_VOICE.params on mount
    setVolume(volume);
  }

  function markActiveSpeedBtn() {
    if (!bar) return;
    Array.prototype.forEach.call(bar.querySelectorAll('button[data-spd]'), function(b) {
      if (Math.abs(parseFloat(b.getAttribute('data-spd')) - speed) < 0.01) b.classList.add('active');
      else b.classList.remove('active');
    });
  }

  function showBar() {
    if (!bar) buildBar();
    bar.classList.add('active');
    updateSectionProgress();
  }

  function hideBar() {
    if (bar) bar.classList.remove('active');
  }

  function updateSectionProgress(n) {
    if (!bar) return;
    if (typeof n === 'number') currentSection = n;
    countSections();
    var fill = bar.querySelector('#wt-fill');
    var count = bar.querySelector('#wt-count');
    if (totalSections > 0) {
      var pct = Math.min(100, Math.round((currentSection / totalSections) * 100));
      if (fill) fill.style.width = pct + '%';
      if (count) count.textContent = 'sect ' + currentSection + '/' + totalSections;
    } else {
      if (fill) fill.style.width = '0%';
      if (count) count.textContent = 'sect —/—';
    }
    updateTimePill();
  }

  // ── Speed control ────────────────────────────────────────────────────────
  // Captures the original voiceParams.rate as a baseline so repeated setSpeed()
  // calls compound around a stable center instead of drifting.
  var BASELINE_VOICE_RATE = null;
  function captureBaseline() {
    if (BASELINE_VOICE_RATE !== null) return;
    try {
      if (window.LIRIL_VOICE && window.LIRIL_VOICE.params && typeof window.LIRIL_VOICE.params.rate === 'number') {
        BASELINE_VOICE_RATE = window.LIRIL_VOICE.params.rate;
      } else {
        BASELINE_VOICE_RATE = 1.08; // matches presentation.js fallback
      }
    } catch (e) { BASELINE_VOICE_RATE = 1.08; }
  }

  function setSpeed(s) {
    speed = s;
    try { localStorage.setItem(LS_SPEED_KEY, String(s)); } catch (e) {}
    markActiveSpeedBtn();
    captureBaseline();
    // Contract: presentation.js reads window.LIRIL_VOICE.params.rate on each new
    // utterance. By writing back base * factor we influence playback without
    // touching the 2588-line presentation.js.
    try {
      if (!window.LIRIL_VOICE) window.LIRIL_VOICE = { params: {} };
      if (!window.LIRIL_VOICE.params) window.LIRIL_VOICE.params = {};
      window.LIRIL_VOICE.params.rate = BASELINE_VOICE_RATE * s;
      // Also expose as a simple number some scripts may prefer
      window.__TENET5_NARRATION_RATE = s;
    } catch (e) {}
    // Nudge the engine to pick up the new rate on next utterance. We don't
    // cancel mid-sentence (jarring); the multiplier applies from the next one.
    updateTimePill();
  }

  // ── Session resume ───────────────────────────────────────────────────────
  function savePosition() {
    try {
      var pos = {
        page: window.location.pathname.split('/').pop() || 'index.html',
        section: currentSection,
        total: totalSections,
        ts: Date.now(),
      };
      localStorage.setItem(LS_POSITION_KEY, JSON.stringify(pos));
    } catch (e) {}
  }

  function loadPosition() {
    try {
      var raw = localStorage.getItem(LS_POSITION_KEY);
      if (!raw) return null;
      var pos = JSON.parse(raw);
      if (!pos || !pos.ts) return null;
      if (Date.now() - pos.ts > LS_RESUME_MAX_AGE_MS) {
        localStorage.removeItem(LS_POSITION_KEY);
        return null;
      }
      return pos;
    } catch (e) { return null; }
  }

  function clearPosition() {
    try { localStorage.removeItem(LS_POSITION_KEY); } catch (e) {}
  }

  function offerResume() {
    var pos = loadPosition();
    if (!pos) return;
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (pos.page === currentPage && pos.section === 0) return; // same page, beginning

    var banner = document.createElement('div');
    banner.className = 'wt-resume-banner';
    banner.innerHTML =
      '<h4>▶ Walkthrough in progress</h4>' +
      '<p>You were at <span class="wt-resume-where">' + escapeHTML(pos.page) +
        (pos.section > 0 ? ' section ' + pos.section + '/' + pos.total : '') +
      '</span>. Continue?</p>' +
      '<button id="wt-resume-btn">Resume →</button>' +
      '<button class="wt-dismiss" id="wt-dismiss-btn">Dismiss</button>';
    document.body.appendChild(banner);

    banner.querySelector('#wt-resume-btn').addEventListener('click', function() {
      banner.remove();
      if (pos.page !== currentPage) {
        // Set autopilot flag so walkthrough auto-starts on arrival
        try {
          sessionStorage.setItem('liril_autopilot', JSON.stringify({
            autostart: true, startedAt: Date.now(), resume: true
          }));
        } catch(e) {}
        window.location.href = pos.page;
        return;
      }
      // Same page: trigger the walkthrough start button if present
      var startBtn = document.getElementById('liril-start-walkthrough');
      if (startBtn) startBtn.click();
    });
    banner.querySelector('#wt-dismiss-btn').addEventListener('click', function() {
      clearPosition();
      banner.remove();
    });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  // ── Help overlay ─────────────────────────────────────────────────────────
  function buildHelpOverlay() {
    if (helpOverlay) return;
    helpOverlay = document.createElement('div');
    helpOverlay.className = 'wt-help-overlay';
    helpOverlay.innerHTML =
      '<div class="wt-help-card">' +
        '<h3>Walkthrough controls</h3>' +
        '<div class="wt-help-row"><span class="wt-help-key">Space</span><span class="wt-help-desc">Pause / resume narration</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">→  or  N</span><span class="wt-help-desc">Next section</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">←  or  P</span><span class="wt-help-desc">Previous section</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">Esc</span><span class="wt-help-desc">Stop walkthrough</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">S</span><span class="wt-help-desc">Cycle narration speed (0.75× → 1× → 1.25× → 1.5×)</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">T</span><span class="wt-help-desc">Toggle transcript panel</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">C</span><span class="wt-help-desc">Toggle closed captions</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">A</span><span class="wt-help-desc">Toggle autoplay (auto-advance to next page)</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">V</span><span class="wt-help-desc">Mute / unmute narration</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">D</span><span class="wt-help-desc">Download transcript as .txt file</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">M</span><span class="wt-help-desc">Copy shareable walkthrough link</span></div>' +
        '<div class="wt-help-row"><span class="wt-help-key">?  or  H</span><span class="wt-help-desc">Show / hide this help</span></div>' +
        '<div class="wt-help-row" style="margin-top:0.8rem;padding-top:0.4rem;border-top:1px solid rgba(255,255,255,0.08);"><span class="wt-help-key" style="color:#7a7a8c;">URL</span><span class="wt-help-desc" style="font-family:\'IBM Plex Mono\',monospace;font-size:0.78rem;">?wt=1&amp;section=5&amp;speed=1.25</span></div>' +
        '<button class="wt-close" id="wt-close-help">Close</button>' +
      '</div>';
    document.body.appendChild(helpOverlay);
    helpOverlay.querySelector('#wt-close-help').addEventListener('click', hideHelp);
    helpOverlay.addEventListener('click', function(e) {
      if (e.target === helpOverlay) hideHelp();
    });
  }

  function showHelp() {
    if (!helpOverlay) buildHelpOverlay();
    helpOverlay.classList.add('active');
  }
  function hideHelp() {
    if (helpOverlay) helpOverlay.classList.remove('active');
  }

  // ── First-run keyboard hint ──────────────────────────────────────────────
  // Shown once per user on their first walkthrough start, then suppressed.
  function maybeShowHint() {
    try {
      if (localStorage.getItem(LS_HINT_KEY) === '1') return;
    } catch (e) {}
    var hint = document.createElement('div');
    hint.className = 'wt-hint';
    hint.innerHTML =
      '<b>Tip:</b> Press <kbd>Space</kbd> to pause, <kbd>←/→</kbd> to step, ' +
      '<kbd>S</kbd> for speed, <kbd>?</kbd> for all shortcuts.' +
      '<button title="Got it" aria-label="Dismiss">×</button>';
    document.body.appendChild(hint);
    var dismiss = function() {
      try { localStorage.setItem(LS_HINT_KEY, '1'); } catch (e) {}
      if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
    };
    hint.querySelector('button').addEventListener('click', dismiss);
    // Auto-dismiss after 12 s
    setTimeout(dismiss, 12000);
  }

  // ── Transcript panel ─────────────────────────────────────────────────────
  // Collects every [data-narrate] block's text so users who can't hear the
  // narration can read along. Click a paragraph to jump to that section.
  var transcriptEl = null;
  function buildTranscript() {
    if (transcriptEl) return;
    transcriptEl = document.createElement('div');
    transcriptEl.className = 'wt-transcript';
    transcriptEl.innerHTML =
      '<div class="wt-transcript-header">' +
        '<span>Transcript</span>' +
        '<button id="wt-transcript-close" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="wt-transcript-body" id="wt-transcript-body"></div>';
    document.body.appendChild(transcriptEl);
    transcriptEl.querySelector('#wt-transcript-close').addEventListener('click', hideTranscript);
    populateTranscript();
  }
  function populateTranscript() {
    if (!transcriptEl) return;
    var body = transcriptEl.querySelector('#wt-transcript-body');
    if (!body) return;
    body.innerHTML = '';
    var sects = document.querySelectorAll('[data-narrate]');
    Array.prototype.forEach.call(sects, function(s, i) {
      var text = (s.getAttribute('data-narrate') || s.textContent || '').trim();
      if (!text) return;
      // Clip very long section text — the full text is still narrated.
      var display = text.length > 320 ? text.slice(0, 320) + '…' : text;
      var p = document.createElement('p');
      p.textContent = display;
      p.setAttribute('data-sect-idx', String(i));
      p.addEventListener('click', function() {
        scrollToSection(i);
      });
      body.appendChild(p);
    });
  }
  function highlightActiveTranscript() {
    if (!transcriptEl) return;
    var body = transcriptEl.querySelector('#wt-transcript-body');
    if (!body) return;
    Array.prototype.forEach.call(body.querySelectorAll('p'), function(p) {
      var idx = parseInt(p.getAttribute('data-sect-idx'), 10);
      if (idx + 1 === currentSection) {
        if (!p.classList.contains('active')) {
          p.classList.add('active');
          // Scroll into view within panel
          try { p.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
        }
      } else {
        p.classList.remove('active');
      }
    });
  }
  function showTranscript() {
    if (!transcriptEl) buildTranscript();
    transcriptEl.classList.add('active');
    highlightActiveTranscript();
    try { localStorage.setItem(LS_TRANSCRIPT_KEY, '1'); } catch (e) {}
  }
  function hideTranscript() {
    if (transcriptEl) transcriptEl.classList.remove('active');
    try { localStorage.setItem(LS_TRANSCRIPT_KEY, '0'); } catch (e) {}
  }
  function toggleTranscript() {
    if (transcriptEl && transcriptEl.classList.contains('active')) hideTranscript();
    else showTranscript();
  }

  // ── Closed captions ──────────────────────────────────────────────────────
  // Non-invasive hook: wrap speechSynthesis.speak() so any utterance that
  // passes through gets 'start', 'boundary', and 'end' listeners attached.
  // presentation.js builds utterances with u.onstart/u.onend already set;
  // addEventListener is additive and doesn't displace those existing handlers.
  var ccEl = null;
  var ccEnabled = false;
  try { ccEnabled = localStorage.getItem(LS_CC_KEY) === '1'; } catch (e) {}
  var ccCurrentText = '';
  var ccCurrentSentenceStart = 0;

  function buildCC() {
    if (ccEl) return;
    ccEl = document.createElement('div');
    ccEl.className = 'wt-cc';
    ccEl.innerHTML = '<span class="wt-cc-text"></span>';
    ccEl.setAttribute('aria-live', 'polite');
    ccEl.setAttribute('role', 'status');
    document.body.appendChild(ccEl);
  }
  function showCCText(txt) {
    if (!ccEnabled) return;
    if (!ccEl) buildCC();
    var span = ccEl.querySelector('.wt-cc-text');
    if (span) span.textContent = txt || '';
    if (txt) ccEl.classList.add('active');
  }
  function hideCC() {
    if (ccEl) ccEl.classList.remove('active');
  }
  function toggleCC() {
    ccEnabled = !ccEnabled;
    try { localStorage.setItem(LS_CC_KEY, ccEnabled ? '1' : '0'); } catch (e) {}
    if (!ccEnabled) hideCC();
    markCCBtn();
  }
  function markCCBtn() {
    if (!bar) return;
    var btn = bar.querySelector('#wt-cc-btn');
    if (!btn) return;
    if (ccEnabled) btn.classList.add('active'); else btn.classList.remove('active');
  }

  // Split utterance text into sentences for cleaner CC cadence.
  function splitSentences(text) {
    if (!text) return [];
    // Keep trailing punctuation with each sentence. Handle Mr./Mrs./etc later.
    return text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/g).filter(Boolean);
  }

  function installSpeechHook() {
    try {
      if (!window.speechSynthesis || window.__TENET5_CC_HOOK_INSTALLED) return;
      window.__TENET5_CC_HOOK_INSTALLED = true;

      var origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
      window.speechSynthesis.speak = function(u) {
        try {
          if (u && !u.__tenet5_cc_hooked) {
            u.__tenet5_cc_hooked = true;
            ccCurrentText = String(u.text || '');
            u.addEventListener('start', function() {
              ccCurrentSentenceStart = 0;
              // Show first sentence immediately (boundary may lag)
              var first = splitSentences(ccCurrentText)[0] || ccCurrentText;
              showCCText(first);
            });
            u.addEventListener('boundary', function(ev) {
              // ev.charIndex is the start of the current word in the text.
              // Find the sentence that contains charIndex and show it.
              if (typeof ev.charIndex !== 'number') return;
              var txt = ccCurrentText;
              var sents = splitSentences(txt);
              var cursor = 0;
              for (var i = 0; i < sents.length; i++) {
                var end = cursor + sents[i].length;
                if (ev.charIndex <= end) {
                  showCCText(sents[i]);
                  return;
                }
                // advance over any whitespace between sentences
                cursor = end + 1;
              }
              // Fallback: just show the current word region
              showCCText(txt.slice(Math.max(0, ev.charIndex - 40), ev.charIndex + 80));
            });
            u.addEventListener('end', function() {
              // Clear after a short delay so the last sentence stays readable.
              setTimeout(hideCC, 900);
            });
            u.addEventListener('error', function() { hideCC(); });
          }
        } catch (err) {}
        return origSpeak(u);
      };
    } catch (e) {}
  }
  // Run immediately so we catch the first utterance.
  installSpeechHook();

  // ── Reading time estimate ───────────────────────────────────────────────
  // Word count across all [data-narrate] elements on this page, scaled by
  // the effective speech rate. Updates when speed changes.
  var cachedWordCount = null;
  function countPageWords() {
    if (cachedWordCount !== null) return cachedWordCount;
    try {
      var sects = document.querySelectorAll('[data-narrate]');
      var total = 0;
      Array.prototype.forEach.call(sects, function(s) {
        var txt = (s.getAttribute('data-narrate') || s.textContent || '').trim();
        if (!txt) return;
        total += txt.split(/\s+/).length;
      });
      cachedWordCount = total;
    } catch (e) { cachedWordCount = 0; }
    return cachedWordCount;
  }
  function estimateTimeRemaining() {
    var words = countPageWords();
    if (!words) return '';
    var effectiveWpm = BASE_WPM * speed;
    var remainingWords = Math.max(0, words * (1 - (currentSection / Math.max(1, totalSections))));
    var seconds = Math.round(remainingWords / effectiveWpm * 60);
    if (seconds < 1) return 'done';
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m > 0 ? m + ':' + (s < 10 ? '0' : '') + s : seconds + 's';
  }
  function updateTimePill() {
    if (!bar) return;
    var pill = bar.querySelector('#wt-time-pill');
    if (!pill) return;
    var txt = estimateTimeRemaining();
    pill.textContent = txt ? '~' + txt + ' left' : '';
  }

  // ── Autoplay / Podcast mode ──────────────────────────────────────────────
  // When this page's walkthrough finishes and autoplay is on, advance to
  // the next page in PAGE_SEQUENCE and auto-start the walkthrough there.
  // The page chain is owned by presentation.js (window.__TENET5_NEXT_PAGE);
  // we set sessionStorage.liril_autopilot so the next page boots into a
  // running walkthrough without a click.
  var autoplayEnabled = false;
  try { autoplayEnabled = localStorage.getItem(LS_AUTOPLAY_KEY) === '1'; } catch (e) {}

  function setAutoplay(on) {
    autoplayEnabled = !!on;
    try { localStorage.setItem(LS_AUTOPLAY_KEY, on ? '1' : '0'); } catch (e) {}
    markAutoplayBtn();
  }
  function toggleAutoplay() { setAutoplay(!autoplayEnabled); }
  function markAutoplayBtn() {
    if (!bar) return;
    var btn = bar.querySelector('#wt-auto-btn');
    if (!btn) return;
    if (autoplayEnabled) btn.classList.add('active'); else btn.classList.remove('active');
    btn.title = autoplayEnabled ? 'Autoplay ON — Pause auto-advance' : 'Autoplay OFF — Click to auto-advance to next page';
  }

  function maybeAutoAdvance() {
    if (!autoplayEnabled) return;
    // Only advance if we actually reached the last section (prevents
    // false triggers when the user stops mid-page).
    if (totalSections > 0 && currentSection < totalSections) return;
    try {
      sessionStorage.setItem('liril_autopilot', JSON.stringify({
        autostart: true, startedAt: Date.now(), resume: false, autoplay: true,
      }));
    } catch (e) {}
    if (typeof window.__TENET5_NEXT_PAGE === 'function') {
      // Short delay so the user sees the final section finish before jump.
      setTimeout(function() { window.__TENET5_NEXT_PAGE(); }, 1800);
    }
  }

  // ── Share current walkthrough position ───────────────────────────────────
  // Builds a ?wt=1&section=N&speed=S URL, copies to clipboard, shows toast.
  function buildShareURL() {
    var path = window.location.pathname + window.location.hash;
    var qs = new URLSearchParams();
    qs.set('wt', '1');
    if (currentSection > 0) qs.set('section', String(currentSection));
    if (Math.abs(speed - 1.0) > 0.01) qs.set('speed', String(speed));
    var base = window.location.origin + (window.location.pathname === '/' ? '' : window.location.pathname);
    // For the iframe-based shell, prefer the ?load=page.html pattern
    try {
      if (window.top !== window && window.location.pathname.endsWith('.html')) {
        var page = window.location.pathname.split('/').pop();
        return window.top.location.origin + '/?load=' + page + '&' + qs.toString();
      }
    } catch (e) {}
    return base + '?' + qs.toString();
  }
  function showShareToast(msg, color) {
    var t = document.createElement('div');
    t.className = 'wt-share-toast';
    t.textContent = msg;
    if (color) t.style.color = color;
    document.body.appendChild(t);
    setTimeout(function() { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; }, 1600);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2200);
  }
  function shareWalkthrough() {
    var url = buildShareURL();
    var done = function(ok) {
      if (ok) showShareToast('✓ Link copied — section ' + currentSection + ' · ' + speed + '×');
      else showShareToast('Copy failed — URL in console', '#facc15');
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() { done(true); }, function() { done(false); console.log(url); });
        return;
      }
    } catch (e) {}
    // Fallback via execCommand
    try {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed'; ta.style.top = '-2000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      done(ok);
    } catch (e) { done(false); console.log(url); }
  }

  // ── Volume control ───────────────────────────────────────────────────────
  // Writes window.LIRIL_VOICE.params.volume; presentation.js reads that on
  // each new utterance (same contract used by setSpeed).
  var volume = 1.0;
  try {
    var stored = parseFloat(localStorage.getItem(LS_VOLUME_KEY));
    if (!isNaN(stored) && stored >= 0 && stored <= 1) volume = stored;
  } catch (e) {}
  var preMuteVolume = 1.0;

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    try { localStorage.setItem(LS_VOLUME_KEY, String(volume)); } catch (e) {}
    try {
      if (!window.LIRIL_VOICE) window.LIRIL_VOICE = { params: {} };
      if (!window.LIRIL_VOICE.params) window.LIRIL_VOICE.params = {};
      window.LIRIL_VOICE.params.volume = volume;
    } catch (e) {}
    // Update slider + icon if visible
    if (bar) {
      var sl = bar.querySelector('#wt-vol-slider');
      if (sl) sl.value = String(volume);
      var mute = bar.querySelector('#wt-mute-btn');
      if (mute) mute.textContent = volume === 0 ? '🔇' : (volume < 0.5 ? '🔉' : '🔊');
    }
  }
  function toggleMute() {
    if (volume > 0) {
      preMuteVolume = volume;
      setVolume(0);
      showShareToast('🔇 Narration muted');
    } else {
      setVolume(preMuteVolume > 0 ? preMuteVolume : 1.0);
      showShareToast('🔊 Narration unmuted');
    }
  }

  // ── Export transcript (.txt download) ────────────────────────────────────
  // Collects every [data-narrate] block on the page into a clean text file
  // with a header citing the page URL + SYSTEM_SEED so users can share
  // archived text of the investigation.
  function exportTranscript() {
    try {
      var sects = document.querySelectorAll('[data-narrate]');
      if (!sects.length) { showShareToast('No narration on this page', '#facc15'); return; }
      var title = (document.title || 'TENET5 narration').replace(/\s*\|\s*TENET5\s*$/i, '');
      var url = (function() {
        try {
          if (window.top !== window) {
            var page = window.location.pathname.split('/').pop();
            return window.top.location.origin + '/?load=' + page;
          }
        } catch (e) {}
        return window.location.href;
      })();

      var lines = [];
      lines.push('TENET5 — Narration Transcript');
      lines.push('Title: ' + title);
      lines.push('Source: ' + url);
      lines.push('Generated: ' + new Date().toISOString());
      lines.push('SYSTEM_SEED: 118400');
      lines.push('Sections: ' + sects.length);
      lines.push('═'.repeat(48));
      lines.push('');

      Array.prototype.forEach.call(sects, function(s, i) {
        var txt = (s.getAttribute('data-narrate') || s.textContent || '').trim();
        if (!txt) return;
        lines.push('[§ ' + (i + 1) + ']');
        lines.push(txt);
        lines.push('');
      });

      lines.push('─'.repeat(48));
      lines.push('Licensed: EOSL-2.0 · Daniel Perry © 2024-2026');
      lines.push('LIRIL AI · TENET5 · Canadian Accountability Investigation');

      var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      var href = URL.createObjectURL(blob);
      var fname = (window.location.pathname.split('/').pop() || 'page').replace('.html', '') + '-transcript.txt';

      var a = document.createElement('a');
      a.href = href;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(href); }, 2000);

      showShareToast('✓ Transcript downloaded — ' + sects.length + ' sections');
    } catch (e) {
      showShareToast('Download failed — see console', '#facc15');
      console.error('[tenet5] transcript export error:', e);
    }
  }

  // ── Pause on manual scroll ───────────────────────────────────────────────
  // When the user scrolls mid-narration we pause speechSynthesis so they
  // can read without the voice racing ahead. Resumes after 2 s of calm.
  var scrollPauseEnabled = true;
  try { scrollPauseEnabled = localStorage.getItem(LS_SCROLLPAUSE_KEY) !== '0'; } catch (e) {}
  var lastUserScroll = 0;
  var scrollPauseTimer = null;
  var autoPausedByScroll = false;

  function onUserScroll() {
    if (!scrollPauseEnabled) return;
    lastUserScroll = Date.now();
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        autoPausedByScroll = true;
      }
    } catch (e) {}
    if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
    scrollPauseTimer = setTimeout(function() {
      try {
        if (autoPausedByScroll && window.speechSynthesis && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          autoPausedByScroll = false;
        }
      } catch (e) {}
    }, 2200);
  }
  // Use wheel/touchmove rather than scroll so programmatic scrollIntoView
  // (from our own next/prev buttons) doesn't trigger a false pause.
  window.addEventListener('wheel', onUserScroll, { passive: true });
  window.addEventListener('touchmove', onUserScroll, { passive: true });
  window.addEventListener('keydown', function(e) {
    // Spacebar-as-scroll, PageDown, PageUp also count as user scroll intent
    if (e.key === 'PageDown' || e.key === 'PageUp' || e.key === 'Home' || e.key === 'End') {
      onUserScroll();
    }
  });

  // ── Deep-link resume via URL params ─────────────────────────────────────
  // Supported:  ?wt=1        auto-start walkthrough on load
  //             ?section=N   scroll to section N (1-based) after start
  //             ?speed=1.25  set narration speed
  function honorURLParams() {
    try {
      var qs = new URLSearchParams(window.location.search);
      var speedStr = qs.get('speed');
      if (speedStr) {
        var sp = parseFloat(speedStr);
        if (SPEED_OPTIONS.indexOf(sp) !== -1) setSpeed(sp);
      }
      var sec = parseInt(qs.get('section') || '', 10);
      var autostart = qs.get('wt') === '1';
      if (!autostart && !sec) return;
      // Wait up to 4 s for walkthrough button, then trigger
      var tries = 0;
      var iv = setInterval(function() {
        tries++;
        var btn = document.getElementById('liril-start-walkthrough');
        if (btn || tries > 16) {
          clearInterval(iv);
          if (btn && autostart && !btn.classList.contains('liril-active')) btn.click();
          if (sec && sec > 0) {
            setTimeout(function() { scrollToSection(sec - 1); }, 800);
          }
        }
      }, 250);
    } catch (e) {}
  }

  // ── Section navigation (scrolls between [data-narrate] blocks) ──────────
  function scrollToSection(idx) {
    try {
      var sects = document.querySelectorAll('[data-narrate]');
      if (!sects.length) return false;
      var bounded = Math.max(0, Math.min(sects.length - 1, idx));
      var target = sects[bounded];
      if (!target) return false;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      currentSection = bounded + 1;
      updateSectionProgress();
      savePosition();
      return true;
    } catch (e) { return false; }
  }

  // Expose for keyboard bindings + any other caller. We prefer upstream
  // walkthrough functions if they exist, but fall back to scrollIntoView so
  // the arrow keys are always useful.
  window.__TENET5_NEXT_SECTION = window.__TENET5_NEXT_SECTION || function() {
    return scrollToSection(currentSection); // 0-based index = 1-based count
  };
  window.__TENET5_PREV_SECTION = window.__TENET5_PREV_SECTION || function() {
    return scrollToSection(Math.max(0, currentSection - 2));
  };

  // ── Keyboard controls ────────────────────────────────────────────────────
  function isTypingTarget(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
  }

  document.addEventListener('keydown', function(e) {
    if (isTypingTarget(e.target)) return;
    // Don't interfere with modifier-key shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var key = e.key;
    // Space = pause/resume
    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      try {
        if (window.speechSynthesis) {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
          } else if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }
      } catch (err) {}
      return;
    }
    // Next / Previous
    if (key === 'ArrowRight' || key === 'n' || key === 'N') {
      if (window.__TENET5_NEXT_SECTION) { e.preventDefault(); window.__TENET5_NEXT_SECTION(); return; }
    }
    if (key === 'ArrowLeft' || key === 'p' || key === 'P') {
      if (window.__TENET5_PREV_SECTION) { e.preventDefault(); window.__TENET5_PREV_SECTION(); return; }
    }
    // Stop
    if (key === 'Escape') {
      if (helpOverlay && helpOverlay.classList.contains('active')) { hideHelp(); return; }
      if (window.__LIRIL_WALKTHROUGH_STOP) { e.preventDefault(); window.__LIRIL_WALKTHROUGH_STOP(); }
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch(err) {}
      clearPosition();
      hideBar();
      return;
    }
    // Speed cycle
    if (key === 's' || key === 'S') {
      e.preventDefault();
      var idx = SPEED_OPTIONS.indexOf(speed);
      var next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
      setSpeed(next);
      return;
    }
    // Transcript toggle
    if (key === 't' || key === 'T') {
      e.preventDefault();
      toggleTranscript();
      return;
    }
    // Closed captions toggle
    if (key === 'c' || key === 'C') {
      e.preventDefault();
      toggleCC();
      return;
    }
    // Share current position
    if (key === 'm' || key === 'M') {
      e.preventDefault();
      shareWalkthrough();
      return;
    }
    // Autoplay toggle
    if (key === 'a' || key === 'A') {
      e.preventDefault();
      toggleAutoplay();
      showShareToast(autoplayEnabled ? '▶▶ Autoplay ON' : '⏸ Autoplay OFF');
      return;
    }
    // Volume mute / unmute
    if (key === 'v' || key === 'V') {
      e.preventDefault();
      toggleMute();
      return;
    }
    // Download transcript
    if (key === 'd' || key === 'D') {
      e.preventDefault();
      exportTranscript();
      return;
    }
    // Help
    if (key === '?' || key === 'h' || key === 'H') {
      e.preventDefault();
      if (helpOverlay && helpOverlay.classList.contains('active')) hideHelp();
      else showHelp();
      return;
    }
  });

  // ── Hook: watch for walkthrough start / stop ─────────────────────────────
  // We can't modify the walkthrough script, but we can observe the button state.
  function installHooks() {
    var startBtn = document.getElementById('liril-start-walkthrough');
    if (!startBtn) return;
    // Observe class changes to detect start/stop
    var wasActive = startBtn.classList.contains('liril-active');
    var observer = new MutationObserver(function() {
      var isActive = startBtn.classList.contains('liril-active');
      if (isActive) {
        showBar();
        countSections();
        updateSectionProgress();
        maybeShowHint();
        // Re-open transcript if user had it open before
        try {
          if (localStorage.getItem(LS_TRANSCRIPT_KEY) === '1') {
            showTranscript();
          }
        } catch (e) {}
      } else {
        hideBar();
        // Transitioned active → inactive: if autoplay is on, advance.
        if (wasActive) maybeAutoAdvance();
      }
      wasActive = isActive;
    });
    observer.observe(startBtn, { attributes: true, attributeFilter: ['class'] });
    return true;
  }

  // ── Hook: observe active narration section to drive progress ────────────
  // The walkthrough/presentation engines scroll through data-narrate sections;
  // a common hook is that they add a class like .narrating or set focus.
  // We poll with MutationObserver over the body to detect which [data-narrate]
  // is currently scrolled into view.
  function installSectionObserver() {
    var seen = new Set();
    try {
      var sects = Array.prototype.slice.call(document.querySelectorAll('[data-narrate]'));
      if (!sects.length) return;
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(ent) {
          if (ent.isIntersecting && ent.intersectionRatio > 0.5) {
            var idx = sects.indexOf(ent.target);
            if (idx !== -1) {
              currentSection = idx + 1;
              updateSectionProgress();
              savePosition();
              highlightActiveTranscript();
            }
          }
        });
      }, { threshold: [0.5] });
      sects.forEach(function(s) { io.observe(s); });
    } catch (e) {}
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    countSections();
    buildBar();
    buildCC(); // prebuild CC overlay so first utterance has a target
    // Try to install the button hook; retry if button isn't mounted yet
    var tries = 0;
    var iv = setInterval(function() {
      tries++;
      if (installHooks() || tries > 20) clearInterval(iv);
    }, 250);
    installSectionObserver();
    // Re-install speech hook in case our first attempt ran before
    // speechSynthesis was ready (some browsers lazy-initialize it).
    installSpeechHook();
    // Auto-offer resume if applicable
    setTimeout(offerResume, 800);
    // Honor ?wt=1&section=N&speed=1.25 deep links
    setTimeout(honorURLParams, 400);
    // Save position on unload so resume works on reload
    window.addEventListener('beforeunload', savePosition);
    // Seed the time-pill
    updateTimePill();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose tiny API for other scripts
  window.__TENET5_WT_ENHANCE = {
    setSpeed: setSpeed,
    getSpeed: function() { return speed; },
    showHelp: showHelp,
    hideHelp: hideHelp,
    showTranscript: showTranscript,
    hideTranscript: hideTranscript,
    toggleTranscript: toggleTranscript,
    toggleCC: toggleCC,
    ccEnabled: function() { return ccEnabled; },
    estimateTimeRemaining: estimateTimeRemaining,
    honorURLParams: honorURLParams,
    toggleAutoplay: toggleAutoplay,
    autoplayEnabled: function() { return autoplayEnabled; },
    shareWalkthrough: shareWalkthrough,
    buildShareURL: buildShareURL,
    setVolume: setVolume,
    getVolume: function() { return volume; },
    toggleMute: toggleMute,
    exportTranscript: exportTranscript,
    showHint: maybeShowHint,
    clearResume: clearPosition,
    nextSection: function() { return window.__TENET5_NEXT_SECTION && window.__TENET5_NEXT_SECTION(); },
    prevSection: function() { return window.__TENET5_PREV_SECTION && window.__TENET5_PREV_SECTION(); },
    currentSection: function() { return currentSection; },
    totalSections: function() { return totalSections; },
  };
})();
