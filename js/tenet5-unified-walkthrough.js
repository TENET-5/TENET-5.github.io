/* TENET5 Unified Walkthrough — cinema-capable scene player for act-N.html.
 *
 * Public API:
 *   window.TENET5UnifiedWalkthrough.start({
 *     host:     '#walkthrough-host',
 *     manifest: 'data/scenes/act-i.json',
 *     autoplay: true,
 *     chrome:   true,
 *     intervalMs: 10000
 *   });
 *
 * Scene kinds: chapter | quote | stat | impact
 * Optional per-scene media: still, video, tag
 * Optional manifest.cinema: page_bg, page_poster (applied by page HTML)
 *
 * v3 — ice-lake media layers (LTX video + Flux stills) behind content.
 */
(function () {
  'use strict';

  if (window.TENET5UnifiedWalkthrough && window.TENET5UnifiedWalkthrough.__v >= 3) return;

  function el(tag, opts) {
    var n = document.createElement(tag);
    if (!opts) return n;
    if (opts.cls) n.className = opts.cls;
    if (opts.text != null) n.textContent = opts.text;
    if (opts.html != null) n.innerHTML = opts.html;
    if (opts.attrs) for (var k in opts.attrs) n.setAttribute(k, opts.attrs[k]);
    if (opts.style) for (var s in opts.style) n.style[s] = opts.style[s];
    return n;
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function attachMediaLayer(slide, scene) {
    var still = scene.still || '';
    var video = scene.video || '';
    if (!still && !video) return;

    var media = el('div', { cls: 'tunw-media', attrs: { 'aria-hidden': 'true' } });

    if (video && !reducedMotion()) {
      var v = document.createElement('video');
      v.className = 'tunw-media-bg';
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('muted', '');
      v.setAttribute('autoplay', '');
      if (still) v.setAttribute('poster', still);
      var src = el('source', { attrs: { src: video, type: 'video/mp4' } });
      v.appendChild(src);
      media.appendChild(v);
      // Play when visible
      try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* autoplay optional */ }
    } else if (still) {
      media.appendChild(el('img', {
        cls: 'tunw-media-bg',
        attrs: { src: still, alt: '', loading: 'eager' }
      }));
    }

    media.appendChild(el('div', { cls: 'tunw-media-veil' }));
    slide.appendChild(media);

    // Optional small foreground still (when both video + still and still is a chart)
    if (video && still && /\.(png|jpg|webp)$/i.test(still) && /charts|generated/i.test(still)) {
      var fg = el('div', { cls: 'tunw-media-fg' });
      fg.appendChild(el('img', {
        attrs: { src: still, alt: '', loading: 'lazy' }
      }));
      slide.appendChild(fg);
    }
  }

  function renderScene(scene, idx, total, manifest) {
    var slide = el('section', {
      cls: 'tunw-slide tunw-kind-' + (scene.kind || 'chapter') + (scene.video || scene.still ? ' has-media' : ''),
      attrs: {
        'data-scene-id': scene.id || ('s-' + idx),
        role: 'group',
        'aria-roledescription': 'slide',
        'aria-label': 'Scene ' + (idx + 1) + ' of ' + total
      }
    });

    attachMediaLayer(slide, scene);

    var content = el('div', { cls: 'tunw-content' });

    if (scene.tag || manifest.act_num) {
      var tagLine = (manifest.act_num || '') +
        (manifest.rome_article ? ' · Article ' + manifest.rome_article : '') +
        (scene.tag ? ' · ' + scene.tag : '');
      content.appendChild(el('p', { cls: 'tunw-act-tag', text: tagLine }));
    }

    if (scene.kind === 'chapter') {
      content.appendChild(el('h2', { cls: 'tunw-headline', text: scene.headline || '' }));
      if (scene.subhead) content.appendChild(el('p', { cls: 'tunw-subhead', text: scene.subhead }));
    } else if (scene.kind === 'quote') {
      content.appendChild(el('blockquote', { cls: 'tunw-quote', text: scene.quote || '' }));
      var meta = el('div', { cls: 'tunw-quote-meta' });
      if (scene.speaker) meta.appendChild(el('div', { cls: 'tunw-speaker', text: scene.speaker }));
      if (scene.speaker_meta) meta.appendChild(el('div', { cls: 'tunw-speaker-meta', text: scene.speaker_meta }));
      content.appendChild(meta);
      if (scene.source_url) {
        content.appendChild(el('a', {
          cls: 'tunw-source',
          text: 'Primary source →',
          attrs: { href: scene.source_url, target: '_blank', rel: 'noopener' }
        }));
      }
    } else if (scene.kind === 'stat') {
      content.appendChild(el('div', { cls: 'tunw-stat-value', text: scene.value || '' }));
      if (scene.unit) content.appendChild(el('div', { cls: 'tunw-stat-unit', text: scene.unit }));
      if (scene.context) content.appendChild(el('p', { cls: 'tunw-stat-context', text: scene.context }));
      if (scene.source_url) {
        content.appendChild(el('a', {
          cls: 'tunw-source',
          text: 'Primary source →',
          attrs: { href: scene.source_url, target: '_blank', rel: 'noopener' }
        }));
      }
    } else if (scene.kind === 'impact') {
      content.appendChild(el('h2', { cls: 'tunw-impact-headline', text: scene.headline || '' }));
      if (scene.body) content.appendChild(el('div', { cls: 'tunw-impact-body', html: scene.body }));
    } else {
      content.appendChild(el('pre', { cls: 'tunw-unknown', text: JSON.stringify(scene, null, 2) }));
    }

    slide.appendChild(content);
    return slide;
  }

  function renderChrome(state) {
    var chrome = el('div', { cls: 'tunw-chrome', attrs: { role: 'group', 'aria-label': 'Walkthrough controls' } });

    var dots = el('div', { cls: 'tunw-dots' });
    state.scenes.forEach(function (_, i) {
      var d = el('button', {
        cls: 'tunw-dot' + (i === state.idx ? ' is-active' : ''),
        attrs: { type: 'button', 'aria-label': 'Go to scene ' + (i + 1), 'data-i': String(i) }
      });
      d.addEventListener('click', function () { state.go(i); });
      dots.appendChild(d);
    });

    var prev = el('button', {
      cls: 'tunw-btn tunw-btn-prev',
      text: '← Prev',
      attrs: { type: 'button', 'aria-label': 'Previous scene' }
    });
    prev.addEventListener('click', function () { state.go(state.idx - 1); });

    var counter = el('div', { cls: 'tunw-counter', text: (state.idx + 1) + ' / ' + state.scenes.length });

    var next = el('button', {
      cls: 'tunw-btn tunw-btn-next',
      text: 'Next →',
      attrs: { type: 'button', 'aria-label': 'Next scene' }
    });
    next.addEventListener('click', function () { state.go(state.idx + 1); });

    chrome.appendChild(prev);
    chrome.appendChild(counter);
    chrome.appendChild(dots);
    chrome.appendChild(next);

    state.dots = dots;
    state.counter = counter;
    state.prevBtn = prev;
    state.nextBtn = next;
    return chrome;
  }

  function injectStylesOnce() {
    if (document.getElementById('tunw-styles')) {
      var old = document.getElementById('tunw-styles');
      if (old.getAttribute('data-v') === '3') return;
      old.parentNode.removeChild(old);
    }
    var s = document.createElement('style');
    s.id = 'tunw-styles';
    s.setAttribute('data-v', '3');
    s.textContent = [
      /* Host — cinema stage */
      '.walkthrough-host{display:block;min-height:min(72vh,640px);margin:1.5rem 0 2rem;border:1px solid rgba(154,219,232,.16);border-radius:10px;background:var(--void,#050708);overflow:hidden;position:relative;isolation:isolate}',
      '.tunw-slides{position:relative;z-index:1}',
      /* Slide + media layers */
      '.tunw-slide{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(2rem,5vw,3.5rem) clamp(1.2rem,3vw,2.5rem);min-height:min(68vh,600px);text-align:center;gap:1rem;overflow:hidden}',
      '.tunw-media{position:absolute;inset:0;z-index:0;pointer-events:none}',
      '.tunw-media-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(.2) brightness(.42) contrast(1.08) saturate(.9)}',
      '.tunw-media-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,8,.55) 0%,rgba(5,7,8,.72) 45%,rgba(5,7,8,.88) 100%),radial-gradient(80% 60% at 50% 20%,rgba(63,124,140,.12),transparent 65%)}',
      '.tunw-media-fg{position:absolute;right:clamp(12px,3vw,28px);bottom:clamp(56px,10vh,90px);z-index:2;width:min(38%,280px);border:1px solid rgba(154,219,232,.2);border-radius:8px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.55);background:var(--ink,#0b0e10)}',
      '.tunw-media-fg img{display:block;width:100%;height:auto;filter:grayscale(.1) brightness(.95)}',
      '@media(max-width:700px){.tunw-media-fg{display:none}}',
      '.tunw-content{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:1rem;max-width:min(720px,100%)}',
      /* Type — ice lake (not brass cosplay) */
      '.tunw-act-tag{font-family:var(--mono,"IBM Plex Mono",monospace);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--ice,#9adbe8);margin:0}',
      '.tunw-headline{font-family:var(--serif,Fraunces,Georgia,serif);font-size:clamp(1.75rem,4.2vw,2.85rem);font-weight:400;letter-spacing:-.02em;line-height:1.12;margin:0;color:var(--ivory,#ece7dc)}',
      '.tunw-subhead{font-size:1.05rem;color:var(--ivory-dim,#a89f90);max-width:54ch;line-height:1.55;margin:0;font-weight:300}',
      '.tunw-quote{font-family:var(--serif,Fraunces,Georgia,serif);font-size:clamp(1.15rem,2.2vw,1.55rem);line-height:1.5;color:var(--ivory,#ece7dc);max-width:62ch;margin:0;border-left:2px solid var(--ice,#9adbe8);padding-left:1.15rem;text-align:left;font-style:italic;font-weight:300}',
      '.tunw-quote-meta{font-family:var(--mono,"IBM Plex Mono",monospace);font-size:.8rem;color:var(--ivory-faint,#827a6d);max-width:62ch;text-align:left;width:100%}',
      '.tunw-speaker{font-weight:600;color:var(--ivory,#ece7dc);letter-spacing:.02em}',
      '.tunw-speaker-meta{margin-top:.25rem;font-size:.72rem;letter-spacing:.04em}',
      '.tunw-source{font-family:var(--mono,"IBM Plex Mono",monospace);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ice,#9adbe8);text-decoration:none;border-bottom:1px solid rgba(154,219,232,.35)}',
      '.tunw-source:hover{color:var(--ivory,#ece7dc);border-color:var(--ice,#9adbe8)}',
      '.tunw-stat-value{font-family:var(--serif,Fraunces,Georgia,serif);font-size:clamp(2.4rem,6.5vw,4.4rem);font-weight:300;color:var(--ice,#9adbe8);line-height:1;margin:0;letter-spacing:-.02em}',
      '.tunw-stat-unit{font-family:var(--mono,"IBM Plex Mono",monospace);font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ivory-dim,#a89f90);margin-top:.35rem}',
      '.tunw-stat-context{font-size:.98rem;color:var(--ivory-dim,#a89f90);max-width:58ch;line-height:1.65;margin:0;font-weight:300}',
      '.tunw-impact-headline{font-family:var(--serif,Fraunces,Georgia,serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:400;color:var(--ivory,#ece7dc);margin:0;letter-spacing:-.015em}',
      '.tunw-impact-body{font-size:.98rem;line-height:1.7;color:var(--ivory-dim,#a89f90);max-width:62ch;text-align:left;font-weight:300}',
      '.tunw-impact-body p{margin:0 0 .9rem}',
      '.tunw-impact-body p:last-child{margin-bottom:0}',
      /* Chrome */
      '.tunw-chrome{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.75rem 1.1rem;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(5,7,8,.92));border-top:1px solid rgba(154,219,232,.14);font-family:var(--mono,"IBM Plex Mono",monospace);font-size:.78rem;position:relative;z-index:5}',
      '.tunw-btn{background:transparent;border:1px solid rgba(255,255,255,.2);color:var(--ivory,#ece7dc);padding:.45rem .85rem;border-radius:3px;cursor:pointer;font-family:inherit;font-size:inherit;letter-spacing:.1em;text-transform:uppercase}',
      '.tunw-btn:hover:not([disabled]){border-color:var(--ice,#9adbe8);color:var(--ice,#9adbe8)}',
      '.tunw-btn[disabled]{opacity:.35;cursor:not-allowed}',
      '.tunw-counter{color:var(--ivory-faint,#827a6d);min-width:5ch;text-align:center;letter-spacing:.08em}',
      '.tunw-dots{display:flex;gap:.35rem;flex-wrap:wrap;justify-content:center;flex:1}',
      '.tunw-dot{width:.55rem;height:.55rem;border-radius:50%;border:1px solid rgba(154,219,232,.35);background:transparent;cursor:pointer;padding:0}',
      '.tunw-dot.is-active{background:var(--ice,#9adbe8);border-color:var(--ice,#9adbe8)}',
      '.tunw-empty{padding:2rem;color:var(--ivory-dim);text-align:center}',
      '@media (max-width:640px){.tunw-chrome{flex-wrap:wrap}.tunw-counter{order:-1;width:100%;text-align:left;padding-bottom:.4rem;border-bottom:1px solid rgba(154,219,232,.1);margin-bottom:.4rem}}',
      '@media (prefers-reduced-motion:reduce){.tunw-media-bg{filter:grayscale(.25) brightness(.5)}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function start(opts) {
    opts = opts || {};
    var hostSel = opts.host || '#walkthrough-host';
    var host = (typeof hostSel === 'string') ? document.querySelector(hostSel) : hostSel;
    if (!host) {
      console.warn('[TUNW] host not found:', hostSel);
      return null;
    }
    if (!opts.manifest) {
      console.warn('[TUNW] no manifest path supplied');
      return null;
    }
    injectStylesOnce();

    fetch(opts.manifest, { credentials: 'same-origin', cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('manifest HTTP ' + r.status);
        return r.json();
      })
      .then(function (manifest) {
        var scenes = (manifest && Array.isArray(manifest.scenes)) ? manifest.scenes : [];
        if (scenes.length === 0) {
          host.innerHTML = '<p class="tunw-empty">No scenes in this act manifest.</p>';
          return;
        }

        host.innerHTML = '';
        host.classList.add('act-cinema-host');
        var slideContainer = el('div', { cls: 'tunw-slides' });
        host.appendChild(slideContainer);

        var state = { idx: 0, scenes: scenes, manifest: manifest };

        function renderCurrent() {
          // Pause previous videos
          [].forEach.call(slideContainer.querySelectorAll('video'), function (v) {
            try { v.pause(); } catch (e) { /* */ }
          });
          slideContainer.innerHTML = '';
          slideContainer.appendChild(renderScene(scenes[state.idx], state.idx, scenes.length, manifest));
          if (state.dots) {
            [].forEach.call(state.dots.children, function (d, i) {
              d.classList.toggle('is-active', i === state.idx);
            });
          }
          if (state.counter) state.counter.textContent = (state.idx + 1) + ' / ' + scenes.length;
          if (state.prevBtn) state.prevBtn.disabled = (state.idx === 0);
          if (state.nextBtn) state.nextBtn.disabled = (state.idx === scenes.length - 1);
          if (window.LIRIL_voiceNarrate && typeof window.LIRIL_voiceNarrate === 'function') {
            try { window.LIRIL_voiceNarrate(slideContainer); } catch (e) { /* voice optional */ }
          }
        }

        state.go = function (i) {
          if (i < 0 || i >= scenes.length) return;
          state.idx = i;
          renderCurrent();
        };

        if (opts.chrome !== false) {
          host.appendChild(renderChrome(state));
        }

        host.tabIndex = 0;
        host.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); state.go(state.idx + 1); }
          else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); state.go(state.idx - 1); }
          else if (e.key === 'Home') { e.preventDefault(); state.go(0); }
          else if (e.key === 'End') { e.preventDefault(); state.go(scenes.length - 1); }
        });

        renderCurrent();

        if (opts.autoplay && !reducedMotion()) {
          var interval = (opts.intervalMs && opts.intervalMs > 2000) ? opts.intervalMs : 11000;
          var timer = setInterval(function () {
            if (state.idx < scenes.length - 1) state.go(state.idx + 1);
            else clearInterval(timer);
          }, interval);
          function stop() { clearInterval(timer); }
          host.addEventListener('pointerdown', stop, { once: true });
          host.addEventListener('keydown', stop, { once: true });
        }

        // Expose for page chrome
        host._tunw = state;
        if (manifest.cinema) {
          try {
            window.dispatchEvent(new CustomEvent('tunw:manifest', { detail: manifest }));
          } catch (e) { /* */ }
        }
      })
      .catch(function (err) {
        host.innerHTML = '<p class="tunw-empty">Walkthrough failed to load. <a href="maid-accountability.html">Open the MAID file</a> instead.</p>';
        console.warn('[TUNW]', err);
      });
  }

  window.TENET5UnifiedWalkthrough = { start: start, __v: 3 };
})();
