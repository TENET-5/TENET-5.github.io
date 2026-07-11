/* TENET5 radio — the owner's Spotify playlist, persistent beside LIRIL.
   The pill lives INSIDE the LIRIL dock (right side, before Voice) so it never
   overlaps the Accessible button or clips the viewport edge; if a page has no
   dock it falls back to a fixed pill. Expanded player floats above the dock.
   Open/closed state persists across pages via localStorage. */
(function () {
  'use strict';
  if (window.__TENET5_RADIO) return;
  window.__TENET5_RADIO = true;

  var PLAYLIST = '4xoVsdgLvChQU8yrI0ISVv';
  var KEY = 'tenet5.radio.open';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var css = document.createElement('style');
    css.textContent =
      /* pill — full Quantanium glass: blur, ice border, white glint */
      '.t5r-pill{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;cursor:pointer;position:relative;overflow:hidden;' +
        'border-radius:999px;border:1px solid rgba(154,219,232,.28);color:#ece7dc;' +
        'font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;' +
        'background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.015) 45%,rgba(154,219,232,.04)),rgba(9,13,16,.55);' +
        'box-shadow:0 10px 30px rgba(3,6,10,.45),inset 0 1px 0 rgba(255,255,255,.16);' +
        'backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%)}' +
      '.t5r-pill::before{content:"";position:absolute;inset:0 0 auto 0;height:1px;pointer-events:none;' +
        'background:linear-gradient(90deg,transparent,rgba(255,255,255,.7) 30%,rgba(255,255,255,.7) 70%,transparent)}' +
      '.t5r-pill:hover{border-color:rgba(255,255,255,.45);box-shadow:0 10px 34px rgba(3,6,10,.55),inset 0 1px 0 rgba(255,255,255,.22)}' +
      '.t5r-dot{width:6px;height:6px;border-radius:50%;background:#9adbe8;box-shadow:0 0 8px rgba(154,219,232,.8)}' +
      /* expanded player — floats above the dock, right-aligned, glass frame */
      '#t5r-frame{position:fixed;right:16px;bottom:64px;z-index:10003;display:none;border-radius:14px;overflow:hidden;' +
        'border:1px solid rgba(154,219,232,.28);box-shadow:0 18px 54px rgba(3,6,10,.65);' +
        'background:rgba(9,13,16,.6);backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%)}' +
      '#t5r-frame.open{display:block}' +
      /* fallback placement when no dock exists */
      '#t5-radio-fallback{position:fixed;right:16px;bottom:16px;z-index:10002}' +
      '@media(max-width:700px){#t5r-frame{right:8px;bottom:130px;max-width:92vw}}';
    document.head.appendChild(css);

    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 't5r-pill';
    pill.id = 't5-radio';
    pill.setAttribute('aria-expanded', 'false');
    pill.title = 'TENET5 radio — the record has a soundtrack';
    pill.innerHTML = '<span class="t5r-dot"></span><span>Radio</span>';

    var frame = document.createElement('div');
    frame.id = 't5r-frame';
    document.body.appendChild(frame);

    // Prefer the dock (right side, before the Voice button); fallback = fixed.
    var dockIn = document.querySelector('#dock .dock-in');
    var voiceBtn = document.getElementById('voice-btn');
    if (dockIn) {
      if (voiceBtn && voiceBtn.parentElement === dockIn) dockIn.insertBefore(pill, voiceBtn);
      else dockIn.appendChild(pill);
    } else {
      var fb = document.createElement('div');
      fb.id = 't5-radio-fallback';
      fb.appendChild(pill);
      document.body.appendChild(fb);
    }

    var loaded = false;
    function setOpen(open) {
      frame.classList.toggle('open', open);
      pill.setAttribute('aria-expanded', String(open));
      if (open && !loaded) {
        loaded = true;
        var f = document.createElement('iframe');
        f.src = 'https://open.spotify.com/embed/playlist/' + PLAYLIST + '?utm_source=generator&theme=0';
        f.width = '320'; f.height = '152';
        f.frameBorder = '0';
        f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        f.loading = 'lazy';
        f.style.display = 'block';
        frame.appendChild(f);
      }
      try { localStorage.setItem(KEY, open ? '1' : '0'); } catch (e) {}
    }

    pill.addEventListener('click', function () { setOpen(!frame.classList.contains('open')); });
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === '1') setOpen(true);
  });
})();
