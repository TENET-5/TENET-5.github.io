/* TENET5 radio — the owner's Spotify playlist, persistent beside LIRIL.
   A small glass pill above the dock; click to expand the Spotify embed.
   Collapsed by default so it never fights the reading experience.
   State (open/closed) persists across pages via localStorage. */
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
      '#t5-radio{position:fixed;right:14px;bottom:72px;z-index:10001;font-family:"IBM Plex Mono",ui-monospace,monospace}' +
      '#t5-radio .t5r-pill{display:flex;align-items:center;gap:8px;padding:8px 14px;cursor:pointer;' +
        'border-radius:999px;border:1px solid rgba(154,219,232,.25);color:#ece7dc;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;' +
        'background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(154,219,232,.03)),rgba(9,13,16,.72);' +
        'box-shadow:0 10px 30px rgba(3,6,10,.5),inset 0 1px 0 rgba(255,255,255,.14);' +
        'backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%)}' +
      '#t5-radio .t5r-pill:hover{border-color:rgba(255,255,255,.4)}' +
      '#t5-radio .t5r-dot{width:6px;height:6px;border-radius:50%;background:#9adbe8;box-shadow:0 0 8px rgba(154,219,232,.8)}' +
      '#t5-radio .t5r-frame{display:none;margin-top:10px;border-radius:14px;overflow:hidden;' +
        'border:1px solid rgba(154,219,232,.25);box-shadow:0 14px 44px rgba(3,6,10,.6)}' +
      '#t5-radio.open .t5r-frame{display:block}' +
      '@media(max-width:700px){#t5-radio{bottom:118px;right:10px}}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 't5-radio';
    box.innerHTML =
      '<div class="t5r-pill" role="button" aria-expanded="false" title="TENET5 radio — the record has a soundtrack">' +
      '<span class="t5r-dot"></span><span>Radio</span></div>' +
      '<div class="t5r-frame"></div>';
    document.body.appendChild(box);

    var pill = box.querySelector('.t5r-pill');
    var frame = box.querySelector('.t5r-frame');
    var loaded = false;

    function setOpen(open) {
      box.classList.toggle('open', open);
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

    pill.addEventListener('click', function () { setOpen(!box.classList.contains('open')); });
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === '1') setOpen(true);
  });
})();
