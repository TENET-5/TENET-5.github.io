/* ═══════════════════════════════════════════════════════
   TENET5 Share Actions — Social Sharing Handlers
   Provides click handlers for share buttons injected
   by share.js. Platform: Twitter/X, Facebook, LinkedIn,
   Reddit, email, and copy-link.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_SHARE_ACTIONS_LOADED) return;
  window.__TENET5_SHARE_ACTIONS_LOADED = true;

  var SITE_NAME = 'TENET5';
  var HASHTAGS = 'TENET5,accountability';

  function getPageInfo() {
    return {
      url: encodeURIComponent(window.location.href),
      title: encodeURIComponent(document.title || SITE_NAME),
      desc: encodeURIComponent(
        (document.querySelector('meta[name="description"]') || {}).content ||
        'Operational Intelligence for Public Accountability'
      )
    };
  }

  function openShare(url) {
    window.open(url, '_blank', 'width=600,height=500,scrollbars=yes');
  }

  window.__TENET5_SHARE = {
    twitter: function() {
      var p = getPageInfo();
      openShare('https://twitter.com/intent/tweet?text=' + p.title + '&url=' + p.url + '&hashtags=' + HASHTAGS);
    },
    facebook: function() {
      var p = getPageInfo();
      openShare('https://www.facebook.com/sharer/sharer.php?u=' + p.url);
    },
    linkedin: function() {
      var p = getPageInfo();
      openShare('https://www.linkedin.com/shareArticle?mini=true&url=' + p.url + '&title=' + p.title);
    },
    reddit: function() {
      var p = getPageInfo();
      openShare('https://reddit.com/submit?url=' + p.url + '&title=' + decodeURIComponent(p.title));
    },
    email: function() {
      var p = getPageInfo();
      window.location.href = 'mailto:?subject=' + p.title + '&body=' + p.desc + '%0A%0A' + p.url;
    },
    copy: function() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function() {
          showToast('Link copied to clipboard');
        });
      } else {
        /* Fallback */
        var ta = document.createElement('textarea');
        ta.value = window.location.href;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Link copied');
      }
    }
  };

  function showToast(msg) {
    var el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;' +
      'background:rgba(0,0,0,0.9);color:#e8e3d6;padding:12px 24px;border-radius:6px;' +
      'font-size:14px;font-weight:600;border:1px solid rgba(232,227,214,0.2);' +
      'transition:opacity 0.5s;pointer-events:none;';
    document.body.appendChild(el);
    setTimeout(function() { el.style.opacity = '0'; }, 2000);
    setTimeout(function() { el.remove(); }, 2800);
  }

  /* Wire up any existing share buttons */
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-share]');
    if (!btn) return;
    var platform = btn.getAttribute('data-share');
    if (window.__TENET5_SHARE[platform]) {
      e.preventDefault();
      window.__TENET5_SHARE[platform]();
    }
  });

  console.log('[share-actions] Share handlers registered.');
})();
