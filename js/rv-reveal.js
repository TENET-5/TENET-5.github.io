/* TENET5 reveal — fades in .rv / .glass on scroll AND on late DOM insert.
 *
 * liril-home-guide.js / html.js set <html class="js">, which activates:
 *   .js .rv{opacity:0}  and  .js .glass:not(.in){opacity:0}
 * Something MUST add .in or content stays invisible forever.
 *
 * Daily briefing (and any fetch-injected cards) create .glass AFTER first paint.
 * IntersectionObserver on initial querySelectorAll misses those nodes — MutationObserver
 * + public reveal() API fix that permanently.
 */
(function () {
  'use strict';
  if (window.__TENET5_RV_REVEAL) return;
  window.__TENET5_RV_REVEAL = true;

  var obs = null;
  var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

  function isRevealTarget(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.classList.contains('rv')) return true;
    if (el.classList.contains('glass')) return true;
    return false;
  }

  function reveal(el) {
    if (!el || !el.classList) return;
    el.classList.add('in');
    if (seen) seen.add(el);
    if (obs) {
      try { obs.unobserve(el); } catch (e) { /* ignore */ }
    }
  }

  function watch(el) {
    if (!el || !el.classList) return;
    if (seen && seen.has(el)) return;
    if (el.classList.contains('in')) {
      if (seen) seen.add(el);
      return;
    }
    // already in viewport → show now
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      reveal(el);
      return;
    }
    if (obs) {
      obs.observe(el);
    } else {
      reveal(el);
    }
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var els = scope.querySelectorAll
      ? scope.querySelectorAll('.rv, .glass')
      : [];
    // if root itself is a target
    if (root && root.nodeType === 1 && isRevealTarget(root)) {
      watch(root);
    }
    for (var i = 0; i < els.length; i++) watch(els[i]);
  }

  // Public: call after any dynamic inject (briefing, boards, etc.)
  window.TENET5_reveal = function (root) {
    scan(root || document);
  };

  function run() {
    if ('IntersectionObserver' in window) {
      obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) reveal(e.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    }

    scan(document);

    // Late DOM: catch fetch-injected .glass / .rv (daily briefing, etc.)
    if (typeof MutationObserver !== 'undefined' && document.body) {
      var mo = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n.nodeType !== 1) continue;
            if (isRevealTarget(n)) watch(n);
            if (n.querySelectorAll) {
              var kids = n.querySelectorAll('.rv, .glass');
              for (var k = 0; k < kids.length; k++) watch(kids[k]);
            }
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    // Safety net: force-reveal stragglers
    setTimeout(function () { scan(document); }, 800);
    setTimeout(function () {
      var all = document.querySelectorAll('.rv:not(.in), .glass:not(.in)');
      for (var i = 0; i < all.length; i++) reveal(all[i]);
    }, 2500);
    window.addEventListener('load', function () {
      scan(document);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
