/* TENET5 Unified Walkthrough — minimal engine for act-N.html scene player.
 *
 * Public API:
 *   window.TENET5UnifiedWalkthrough.start({
 *     host:     '#walkthrough-host',   // CSS selector or Element
 *     manifest: 'data/scenes/act-i.json',
 *     autoplay: true,                  // optional, default false
 *     chrome:   true                   // optional, default true (prev/next + dots)
 *   });
 *
 * Renders one scene at a time based on its `kind`:
 *   chapter | quote | stat | impact
 *
 * Designed to be self-contained — no framework deps, no build step.
 */
(function () {
  'use strict';

  if (window.TENET5UnifiedWalkthrough) return; // idempotent

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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function renderScene(scene, idx, total, manifest) {
    var slide = el('section', {
      cls: 'tunw-slide tunw-kind-' + scene.kind,
      attrs: { 'data-scene-id': scene.id || ('s-' + idx), role: 'group', 'aria-roledescription': 'slide', 'aria-label': 'Scene ' + (idx + 1) + ' of ' + total }
    });
    if (scene.bg) slide.style.background = scene.bg;

    if (scene.kind === 'chapter') {
      slide.appendChild(el('p', { cls: 'tunw-act-tag', text: manifest.act_num + ' · ' + (manifest.rome_article ? 'Article ' + manifest.rome_article : '') }));
      slide.appendChild(el('h2', { cls: 'tunw-headline', text: scene.headline || '' }));
      if (scene.subhead) slide.appendChild(el('p', { cls: 'tunw-subhead', text: scene.subhead }));
    } else if (scene.kind === 'quote') {
      slide.appendChild(el('blockquote', { cls: 'tunw-quote', text: scene.quote || '' }));
      var meta = el('div', { cls: 'tunw-quote-meta' });
      if (scene.speaker) meta.appendChild(el('div', { cls: 'tunw-speaker', text: scene.speaker }));
      if (scene.speaker_meta) meta.appendChild(el('div', { cls: 'tunw-speaker-meta', text: scene.speaker_meta }));
      slide.appendChild(meta);
      if (scene.source_url) {
        var sl = el('a', { cls: 'tunw-source', text: 'Primary source →', attrs: { href: scene.source_url, target: '_blank', rel: 'noopener' } });
        slide.appendChild(sl);
      }
    } else if (scene.kind === 'stat') {
      slide.appendChild(el('div', { cls: 'tunw-stat-value', text: scene.value || '' }));
      if (scene.unit) slide.appendChild(el('div', { cls: 'tunw-stat-unit', text: scene.unit }));
      if (scene.context) slide.appendChild(el('p', { cls: 'tunw-stat-context', text: scene.context }));
      if (scene.source_url) {
        slide.appendChild(el('a', { cls: 'tunw-source', text: 'Primary source →', attrs: { href: scene.source_url, target: '_blank', rel: 'noopener' } }));
      }
    } else if (scene.kind === 'impact') {
      slide.appendChild(el('h2', { cls: 'tunw-impact-headline', text: scene.headline || '' }));
      if (scene.body) slide.appendChild(el('div', { cls: 'tunw-impact-body', html: scene.body }));
    } else {
      // Unknown kind — render as plain JSON for diagnostic visibility instead of hiding it.
      slide.appendChild(el('pre', { cls: 'tunw-unknown', text: JSON.stringify(scene, null, 2) }));
    }
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

    var prev = el('button', { cls: 'tunw-btn tunw-btn-prev', text: '← Prev', attrs: { type: 'button', 'aria-label': 'Previous scene' } });
    prev.addEventListener('click', function () { state.go(state.idx - 1); });

    var counter = el('div', { cls: 'tunw-counter', text: (state.idx + 1) + ' / ' + state.scenes.length });

    var next = el('button', { cls: 'tunw-btn tunw-btn-next', text: 'Next →', attrs: { type: 'button', 'aria-label': 'Next scene' } });
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
    if (document.getElementById('tunw-styles')) return;
    var s = document.createElement('style');
    s.id = 'tunw-styles';
    s.textContent = [
      '.walkthrough-host{display:block;min-height:60vh;margin:1.5rem 0;border:1px solid var(--slate-border,rgba(232,227,214,.16));border-radius:8px;background:rgba(15,18,24,.55);overflow:hidden;position:relative}',
      '.tunw-slide{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 2rem;min-height:60vh;text-align:center;gap:1rem}',
      '.tunw-act-tag{font-family:var(--slate-font-mono,ui-monospace,monospace);font-size:.8rem;letter-spacing:.22em;text-transform:uppercase;color:var(--slate-brass,#b8835a);margin:0}',
      '.tunw-headline{font-size:clamp(1.8rem,4.4vw,3rem);font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:0;color:var(--slate-ink-strong,#f5f1e6)}',
      '.tunw-subhead{font-size:1.1rem;color:var(--slate-ink-dim,#c9c3b3);max-width:54ch;line-height:1.5;margin:0}',
      '.tunw-quote{font-size:clamp(1.2rem,2.4vw,1.7rem);line-height:1.5;color:var(--slate-ink-strong,#f5f1e6);max-width:64ch;margin:0;border-left:3px solid var(--slate-brass,#b8835a);padding-left:1.2rem;text-align:left;font-style:italic}',
      '.tunw-quote-meta{font-family:var(--slate-font-mono,ui-monospace,monospace);font-size:.86rem;color:var(--slate-ink-dim,#c9c3b3);max-width:64ch;text-align:left}',
      '.tunw-speaker{font-weight:700;color:var(--slate-ink,#e8e3d6)}',
      '.tunw-speaker-meta{margin-top:.2rem;font-size:.78rem;letter-spacing:.04em}',
      '.tunw-source{font-family:var(--slate-font-mono,ui-monospace,monospace);font-size:.82rem;color:var(--slate-link,#c89a76);text-decoration:none;border-bottom:1px dashed currentColor}',
      '.tunw-source:hover{color:var(--slate-link-hover,#e0b58c)}',
      '.tunw-stat-value{font-family:var(--slate-font-mono,ui-monospace,monospace);font-size:clamp(2.6rem,7vw,5rem);font-weight:800;color:var(--slate-brass-hi,#e0b58c);line-height:1;margin:0;letter-spacing:-.02em}',
      '.tunw-stat-unit{font-family:var(--slate-font-mono,ui-monospace,monospace);font-size:.95rem;letter-spacing:.12em;text-transform:uppercase;color:var(--slate-ink-dim,#c9c3b3);margin-top:.4rem}',
      '.tunw-stat-context{font-size:1rem;color:var(--slate-ink,#e8e3d6);max-width:60ch;line-height:1.6;margin:0}',
      '.tunw-impact-headline{font-size:clamp(1.5rem,3.2vw,2.2rem);font-weight:700;color:var(--slate-ink-strong,#f5f1e6);margin:0}',
      '.tunw-impact-body{font-size:1rem;line-height:1.7;color:var(--slate-ink,#e8e3d6);max-width:64ch;text-align:left}',
      '.tunw-impact-body p{margin:0 0 .9rem}',
      '.tunw-impact-body p:last-child{margin-bottom:0}',
      '.tunw-chrome{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.8rem 1.2rem;background:rgba(15,18,24,.85);border-top:1px solid var(--slate-border,rgba(232,227,214,.16));font-family:var(--slate-font-mono,ui-monospace,monospace);font-size:.84rem}',
      '.tunw-btn{background:transparent;border:1px solid var(--slate-border,rgba(232,227,214,.2));color:var(--slate-ink,#e8e3d6);padding:.5rem .9rem;border-radius:4px;cursor:pointer;font-family:inherit;font-size:inherit;letter-spacing:.04em}',
      '.tunw-btn:hover:not([disabled]){border-color:var(--slate-brass,#b8835a);color:var(--slate-link-hover,#e0b58c)}',
      '.tunw-btn[disabled]{opacity:.35;cursor:not-allowed}',
      '.tunw-counter{color:var(--slate-ink-dim,#c9c3b3);min-width:5ch;text-align:center}',
      '.tunw-dots{display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center;flex:1}',
      '.tunw-dot{width:.7rem;height:.7rem;border-radius:50%;border:1px solid var(--slate-border,rgba(232,227,214,.3));background:transparent;cursor:pointer;padding:0}',
      '.tunw-dot.is-active{background:var(--slate-brass,#b8835a);border-color:var(--slate-brass-hi,#e0b58c)}',
      '@media (max-width:640px){.tunw-chrome{flex-wrap:wrap}.tunw-counter{order:-1;width:100%;text-align:left;padding-bottom:.4rem;border-bottom:1px solid var(--slate-border,rgba(232,227,214,.1));margin-bottom:.4rem}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function start(opts) {
    opts = opts || {};
    var hostSel = opts.host || '#walkthrough-host';
    var host = (typeof hostSel === 'string') ? document.querySelector(hostSel) : hostSel;
    if (!host) {
      console.warn('[TUNW] host not found:', hostSel);
      return;
    }
    if (!opts.manifest) {
      console.warn('[TUNW] no manifest path supplied');
      return;
    }
    injectStylesOnce();

    fetch(opts.manifest, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('manifest HTTP ' + r.status);
        return r.json();
      })
      .then(function (manifest) {
        var scenes = (manifest && Array.isArray(manifest.scenes)) ? manifest.scenes : [];
        if (scenes.length === 0) {
          host.innerHTML = '<p class="tunw-empty">No scenes in manifest.</p>';
          return;
        }

        host.innerHTML = '';
        var slideContainer = el('div', { cls: 'tunw-slides' });
        host.appendChild(slideContainer);

        var state = { idx: 0, scenes: scenes };

        function renderCurrent() {
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

        // Keyboard navigation
        host.tabIndex = 0;
        host.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); state.go(state.idx + 1); }
          else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); state.go(state.idx - 1); }
          else if (e.key === 'Home') { e.preventDefault(); state.go(0); }
          else if (e.key === 'End') { e.preventDefault(); state.go(scenes.length - 1); }
        });

        renderCurrent();

        if (opts.autoplay) {
          var interval = (opts.intervalMs && opts.intervalMs > 1500) ? opts.intervalMs : 9000;
          var timer = setInterval(function () {
            if (state.idx < scenes.length - 1) state.go(state.idx + 1);
            else clearInterval(timer);
          }, interval);
          // Stop autoplay on first user interaction
          host.addEventListener('click', function () { clearInterval(timer); }, { once: true });
          host.addEventListener('keydown', function () { clearInterval(timer); }, { once: true });
        }

        if (window.console && window.console.info) {
          console.info('[TUNW] act=' + (manifest.act_id || '?') + ' scenes=' + scenes.length + ' rendered');
        }
      })
      .catch(function (err) {
        console.error('[TUNW] manifest load failed:', err);
        host.innerHTML = '<p class="tunw-empty">Walkthrough failed to load: ' + escapeHtml(String(err.message || err)) + '</p>';
      });
  }

  window.TENET5UnifiedWalkthrough = { start: start, version: '1.0.0' };
})();
