/**
 * TENET5 Error Reporter — logs 404s and broken navigation
 * Runs on every page. Reports errors to console and optionally
 * to a Supabase table (if configured). Also validates that
 * all linked pages exist by checking fetch status.
 *
 * IIFE pattern — loaded by shell.js
 */
(function() {
  'use strict';
  if (window.__TENET5_ERROR_REPORTER_LOADED) return;
  window.__TENET5_ERROR_REPORTER_LOADED = true;

  var STORAGE_KEY = 'tenet5_404_log';
  var pagePath = window.location.pathname.split('/').pop() || 'index.html';

  // ── Log to localStorage for CEO review ──────────────────────
  function log404(brokenUrl, referrer) {
    var entry = {
      url: brokenUrl,
      referrer: referrer || pagePath,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 80)
    };

    try {
      var logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      // Cap at 100 entries
      if (logs.length >= 100) logs.shift();
      logs.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch(e) {}

    console.warn('[TENET5-404] Broken link detected:', brokenUrl, 'from:', referrer);
  }

  // ── Check all internal links on current page ────────────────
  function auditCurrentPage() {
    if (pagePath === 'index.html' || pagePath === '404.html') return;
    try {
      if (window.self !== window.top) return;
    } catch (e) {
      return;
    }

    var links = document.querySelectorAll('a[href]');
    var checked = {};

    links.forEach(function(a) {
      var href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#') || href.startsWith('javascript')) return;
      if (href.startsWith('/')) return; // absolute paths handled by server

      // Extract just the filename for .html links
      var target = href.split('?')[0].split('#')[0];
      if (!target.endsWith('.html')) return;
      if (checked[target]) return;
      checked[target] = true;

      // Quick HEAD check (only for same-origin)
      fetch(target, { method: 'HEAD' }).then(function(res) {
        if (!res.ok) {
          log404(target, pagePath);
          // Mark the link visually
          a.style.outline = '2px solid #dc2626';
          a.style.outlineOffset = '2px';
          a.title = '404 — This page does not exist: ' + target;
        }
      }).catch(function() {
        // Network error — link might be broken
        log404(target + ' (fetch failed)', pagePath);
      });
    });
  }

  // ── Public API for CEO to check errors ──────────────────────
  window.TENET5_ERRORS = {
    getLog: function() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
      catch(e) { return []; }
    },
    clearLog: function() {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[TENET5-404] Log cleared');
    },
    printLog: function() {
      var logs = this.getLog();
      if (logs.length === 0) {
        console.log('[TENET5-404] No errors logged');
        return;
      }
      console.table(logs);
      console.log('[TENET5-404] Total errors:', logs.length);
    }
  };

  // Run audit after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(auditCurrentPage, 2000); // Delay to avoid blocking page load
    });
  } else {
    setTimeout(auditCurrentPage, 2000);
  }
})();
