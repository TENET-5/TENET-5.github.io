/* search-suggest.js — Cap#402
 * Live search-suggest dropdown attached to #search-input.
 * Source: /search-index.json (built by tools/build_search_index.py from
 * <title>, <h1>, meta description, and data-narrate attributes across all *.html).
 * Pure-vanilla, no external deps. Idempotent: safe to load multiple times.
 */
(function () {
  'use strict';

  if (window.__tnt_search_suggest_loaded) return;
  window.__tnt_search_suggest_loaded = true;

  var INDEX_URL = 'search-index.json';
  var MAX_RESULTS = 8;
  var MIN_QUERY_LEN = 2;
  var DEBOUNCE_MS = 90;
  var INPUT_ID = 'search-input';

  var input = document.getElementById(INPUT_ID);
  if (!input) return;

  // ── Inject minimal CSS once ──
  var css = ''
    + '.tnt-suggest-wrap{position:relative;width:100%;}'
    + '.tnt-suggest-list{position:absolute;left:0;right:0;top:100%;z-index:9999;'
    + 'background:#0b0f14;border:1px solid #2a3340;border-top:none;'
    + 'max-height:60vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,.55);'
    + 'border-radius:0 0 8px 8px;display:none;font-size:14px;line-height:1.4;}'
    + '.tnt-suggest-list.open{display:block;}'
    + '.tnt-suggest-item{display:block;padding:10px 14px;color:#e6edf3;'
    + 'text-decoration:none;border-bottom:1px solid #1c232c;cursor:pointer;}'
    + '.tnt-suggest-item:last-child{border-bottom:none;}'
    + '.tnt-suggest-item:hover,.tnt-suggest-item.active{background:#142030;color:#7fd1ff;}'
    + '.tnt-suggest-title{font-weight:600;display:block;margin-bottom:2px;}'
    + '.tnt-suggest-snip{font-size:12px;color:#9aa7b4;display:block;'
    + 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    + '.tnt-suggest-mark{color:#ffd76a;font-weight:700;}'
    + '.tnt-suggest-empty{padding:12px 14px;color:#7a8694;font-style:italic;}';
  var style = document.createElement('style');
  style.setAttribute('data-tnt', 'search-suggest');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // ── Wrap input so dropdown anchors correctly ──
  var parent = input.parentNode;
  if (!parent.classList.contains('tnt-suggest-wrap')) {
    var wrap = document.createElement('div');
    wrap.className = 'tnt-suggest-wrap';
    parent.insertBefore(wrap, input);
    wrap.appendChild(input);
    parent = wrap;
  }
  var list = document.createElement('div');
  list.className = 'tnt-suggest-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Search suggestions');
  parent.appendChild(list);

  // ── State ──
  var entries = null;
  var loading = false;
  var loadFailed = false;
  var debounceTimer = null;
  var activeIdx = -1;
  var currentItems = [];

  function ensureIndex() {
    if (entries || loading || loadFailed) return Promise.resolve(entries);
    loading = true;
    return fetch(INDEX_URL, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (j) {
        entries = (j && Array.isArray(j.entries)) ? j.entries : [];
        loading = false;
        return entries;
      })
      .catch(function () {
        loadFailed = true;
        loading = false;
        return null;
      });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function highlight(text, q) {
    var safe = escapeHtml(text);
    if (!q) return safe;
    try {
      var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return safe.replace(re, '<span class="tnt-suggest-mark">$1</span>');
    } catch (e) { return safe; }
  }

  function score(entry, q) {
    var blob = entry.search_text || '';
    var idx = blob.indexOf(q);
    if (idx < 0) return -1;
    // Earlier matches rank higher; title hits boosted.
    var titleHit = (entry.title || '').toLowerCase().indexOf(q) >= 0 ? 100 : 0;
    var headingHit = (entry.heading || '').toLowerCase().indexOf(q) >= 0 ? 50 : 0;
    return 1000 - idx + titleHit + headingHit;
  }

  function search(q) {
    if (!entries) return [];
    var lo = q.toLowerCase();
    var hits = [];
    for (var i = 0; i < entries.length; i++) {
      var s = score(entries[i], lo);
      if (s > 0) hits.push({ s: s, e: entries[i] });
    }
    hits.sort(function (a, b) { return b.s - a.s; });
    return hits.slice(0, MAX_RESULTS).map(function (h) { return h.e; });
  }

  function snippetFor(entry, q) {
    var blob = (entry.narrations && entry.narrations.length)
      ? entry.narrations.join(' • ')
      : (entry.description || '');
    if (!q) return blob.slice(0, 140);
    var lo = blob.toLowerCase();
    var idx = lo.indexOf(q.toLowerCase());
    if (idx < 0) return blob.slice(0, 140);
    var start = Math.max(0, idx - 30);
    var end = Math.min(blob.length, idx + q.length + 90);
    var prefix = start > 0 ? '…' : '';
    var suffix = end < blob.length ? '…' : '';
    return prefix + blob.slice(start, end) + suffix;
  }

  function render(items, q) {
    currentItems = items;
    activeIdx = -1;
    if (!items.length) {
      list.innerHTML = '<div class="tnt-suggest-empty">No matches.</div>';
      list.classList.add('open');
      return;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var e = items[i];
      html += '<a class="tnt-suggest-item" role="option" data-idx="' + i + '"'
        + ' href="' + escapeHtml(e.url) + '">'
        + '<span class="tnt-suggest-title">' + highlight(e.title || e.url, q) + '</span>'
        + '<span class="tnt-suggest-snip">' + highlight(snippetFor(e, q), q) + '</span>'
        + '</a>';
    }
    list.innerHTML = html;
    list.classList.add('open');
  }

  function close() {
    list.classList.remove('open');
    activeIdx = -1;
  }

  function setActive(idx) {
    var nodes = list.querySelectorAll('.tnt-suggest-item');
    if (!nodes.length) return;
    if (idx < 0) idx = nodes.length - 1;
    if (idx >= nodes.length) idx = 0;
    activeIdx = idx;
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.toggle('active', i === idx);
    }
    var n = nodes[idx];
    if (n && n.scrollIntoView) {
      n.scrollIntoView({ block: 'nearest' });
    }
  }

  function runQuery() {
    var q = (input.value || '').trim();
    if (q.length < MIN_QUERY_LEN) { close(); return; }
    ensureIndex().then(function (idx) {
      if (!idx) { close(); return; }
      // Re-read in case user kept typing
      var qNow = (input.value || '').trim();
      if (qNow.length < MIN_QUERY_LEN) { close(); return; }
      render(search(qNow), qNow);
    });
  }

  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runQuery, DEBOUNCE_MS);
  });

  input.addEventListener('focus', function () {
    if ((input.value || '').trim().length >= MIN_QUERY_LEN) runQuery();
  });

  input.addEventListener('keydown', function (ev) {
    if (!list.classList.contains('open')) return;
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setActive(activeIdx + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive(activeIdx - 1); }
    else if (ev.key === 'Enter' && activeIdx >= 0) {
      var nodes = list.querySelectorAll('.tnt-suggest-item');
      if (nodes[activeIdx]) { ev.preventDefault(); window.location.href = nodes[activeIdx].getAttribute('href'); }
    }
    else if (ev.key === 'Escape') { close(); }
  });

  document.addEventListener('click', function (ev) {
    if (ev.target === input) return;
    if (list.contains(ev.target)) return;
    close();
  });

  // Pre-warm the index after a short idle gap so the first keystroke is instant.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function () { ensureIndex(); }, { timeout: 1500 });
  } else {
    setTimeout(ensureIndex, 800);
  }
})();
