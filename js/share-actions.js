/* ═══════════════════════════════════════════════════════
   TENET5 One-Tap Share Actions
   WhatsApp, Telegram, SMS, Email, X, Facebook, Reddit, Copy
   Personalized prefilled messages for maximum conversion
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';
  if (window.__TENET5_SHARE_LOADED) return;
  window.__TENET5_SHARE_LOADED = true;

  // ── Smart message generator ──
  // Picks the most relevant share text based on the current page
  function getShareText() {
    var title = document.title.replace(' | TENET5', '').trim();
    var desc = '';
    var meta = document.querySelector('meta[property="og:description"]') ||
               document.querySelector('meta[name="description"]');
    if (meta) desc = meta.getAttribute('content') || '';

    // Page-specific hooks (data-share-text attribute on body or main)
    var custom = document.body.dataset.shareText ||
                 (document.querySelector('main') || {}).dataset && document.querySelector('main').dataset.shareText;
    if (custom) return custom;

    // Default: short personal framing (research shows personal > broadcast)
    if (desc.length > 20) {
      return desc.substring(0, 140);
    }
    return title;
  }

  function getShareUrl() {
    // Use canonical URL if available (resolves iframe URLs)
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon && canon.href) return canon.href;
    return window.location.href;
  }

  // ── Share handlers ──

  window.TENET5_SHARE = {

    whatsapp: function() {
      var text = getShareText();
      var url = getShareUrl();
      // Prefilled personal message (research: 2-tap share converts best)
      var msg = encodeURIComponent(text + '\n\n' + url);
      window.open('https://wa.me/?text=' + msg, '_blank');
    },

    telegram: function() {
      var text = getShareText();
      var url = getShareUrl();
      window.open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text), '_blank');
    },

    sms: function() {
      var text = getShareText();
      var url = getShareUrl();
      // SMS URI scheme (works on iOS + Android)
      var body = encodeURIComponent(text + '\n' + url);
      window.open('sms:?body=' + body, '_self');
    },

    email: function() {
      var title = document.title.replace(' | TENET5', '').trim();
      var text = getShareText();
      var url = getShareUrl();
      var subject = encodeURIComponent(title);
      var body = encodeURIComponent(text + '\n\nRead more: ' + url + '\n\nSource: TENET5 — tenet5.github.io');
      window.open('mailto:?subject=' + subject + '&body=' + body, '_self');
    },

    x: function() {
      var text = getShareText();
      var url = getShareUrl();
      // X/Twitter: text + URL separately for better card rendering
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
    },

    facebook: function() {
      var url = getShareUrl();
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
    },

    reddit: function() {
      var title = document.title.replace(' | TENET5', '').trim();
      var url = getShareUrl();
      window.open('https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), '_blank');
    },

    copy: function() {
      var url = getShareUrl();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
          _flashCopied();
        });
      } else {
        // Fallback for older browsers
        var ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        _flashCopied();
      }
    },

    // Native share (mobile) — uses Web Share API
    native: function() {
      if (navigator.share) {
        navigator.share({
          title: document.title.replace(' | TENET5', '').trim(),
          text: getShareText(),
          url: getShareUrl()
        }).catch(function() {});
      } else {
        // Fallback: show share bar
        var bar = document.querySelector('.t5-share-bar');
        if (bar) bar.classList.toggle('open');
      }
    }
  };

  function _flashCopied() {
    document.querySelectorAll('[data-share="copy"]').forEach(function(btn) {
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  }

  // ── Auto-wire share buttons ──
  // Any element with data-share="whatsapp|telegram|x|..." gets wired
  function wireButtons() {
    document.querySelectorAll('[data-share]').forEach(function(el) {
      var action = el.dataset.share;
      if (TENET5_SHARE[action]) {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          TENET5_SHARE[action]();
        });
      }
    });
  }

  // ── Inject floating share bar on pages that don't have one ──
  function injectShareBar() {
    if (document.querySelector('.t5-share-bar')) return;
    // Don't inject on special pages
    var skip = ['index.html', 'search.html', 'auth-callback.html', 'sitemap.html', 'chalkboard.html'];
    var page = window.location.pathname.split('/').pop();
    if (skip.indexOf(page) !== -1) return;

    var bar = document.createElement('div');
    bar.className = 't5-share-bar';
    bar.innerHTML =
      '<button data-share="native" class="t5-share-btn t5-share-native" title="Share" aria-label="Share this page">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>' +
      '</button>' +
      '<button data-share="whatsapp" class="t5-share-btn" title="WhatsApp" aria-label="Share on WhatsApp">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
      '</button>' +
      '<button data-share="telegram" class="t5-share-btn" title="Telegram" aria-label="Share on Telegram">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>' +
      '</button>' +
      '<button data-share="x" class="t5-share-btn" title="X / Twitter" aria-label="Share on X">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
      '</button>' +
      '<button data-share="email" class="t5-share-btn" title="Email" aria-label="Share via email">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>' +
      '</button>' +
      '<button data-share="copy" class="t5-share-btn" title="Copy link" aria-label="Copy link">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>' +
      '</button>';

    document.body.appendChild(bar);
    wireButtons();
  }

  // ── Inject CSS for share bar ──
  var style = document.createElement('style');
  style.textContent =
    '.t5-share-bar{position:fixed;right:12px;bottom:80px;display:flex;flex-direction:column;gap:6px;z-index:8000;opacity:0.85;transition:opacity 0.2s}' +
    '.t5-share-bar:hover{opacity:1}' +
    '.t5-share-btn{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.12);background:rgba(10,15,22,0.9);color:#d4d0c8;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s,transform 0.15s,border-color 0.15s;backdrop-filter:blur(8px)}' +
    '.t5-share-btn:hover{background:rgba(196,30,58,0.25);border-color:rgba(196,30,58,0.4);transform:scale(1.1)}' +
    '.t5-share-native{background:rgba(196,30,58,0.15);border-color:rgba(196,30,58,0.3)}' +
    '@media(max-width:768px){.t5-share-bar{right:8px;bottom:72px;flex-direction:row;gap:4px;max-width:calc(100vw - 16px);overflow-x:auto}.t5-share-btn{width:36px;height:36px;flex:0 0 auto}}';
  document.head.appendChild(style);

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { wireButtons(); injectShareBar(); });
  } else {
    wireButtons();
    injectShareBar();
  }
})();
