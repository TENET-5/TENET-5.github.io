// js/registry-consumer.js
// Shared client for data-spine consumer pages.
// M18: facts-only render. M19: null term_end -> em-dash. M23: textContent only.
(function (global) {
  'use strict';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtTermEnd(v) { return (v == null || v === '') ? '—' : escapeHtml(v); }
  function safeHost(u) {
    try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return u; }
  }
  function sourceLink(src) {
    if (!src || !src.url) return '';
    return '<a href="' + escapeHtml(src.url) + '" target="_blank" rel="noopener noreferrer">[' +
      escapeHtml(src.type || 'src') + '] ' + escapeHtml(safeHost(src.url)) + '</a>';
  }
  function tagsHtml(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(function (t) { return '<span class="reg-tag">' + escapeHtml(t) + '</span>'; }).join('');
  }
  function sourcesHtml(arr) {
    if (!arr || !arr.length) return '';
    return '<span class="src">' + arr.map(sourceLink).join(' ') + '</span>';
  }
  function loadJson(path) {
    return fetch(path, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + path);
      return r.json();
    });
  }
  function loadProvenanceLast(path) {
    return fetch(path, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + path);
      return r.text();
    }).then(function (txt) {
      var lines = txt.split(/\r?\n/).filter(function (l) { return l.trim().length; });
      if (!lines.length) return null;
      try { return JSON.parse(lines[lines.length - 1]); } catch (e) { return null; }
    });
  }
  function showError(el, hint) {
    if (!el) return;
    var msg = hint || 'If opened via file://, browsers block sibling fetches. Run <code>python -m http.server</code> in the repo root and load <code>http://localhost:8000/</code>, or visit the GitHub Pages URL.';
    el.innerHTML = '<div class="reg-err"><strong>Could not load data files.</strong><br>' + msg + '</div>';
  }
  function renderEntities(rows, byId, container, opts) {
    opts = opts || {};
    if (!rows.length) { container.innerHTML = '<p class="reg-lede">No matching officeholders.</p>'; return; }
    var headExtra = opts.showAppointedBy ? '<th>Appointed By</th>' : '';
    var html = '<table class="reg-table"><thead><tr>' +
      '<th>Name / Role</th><th>Office</th><th>Term</th>' + headExtra + '<th>Sources</th>' +
      '</tr></thead><tbody>';
    rows.forEach(function (e) {
      var by = '';
      if (opts.showAppointedBy) {
        var bn = e.appointed_by && byId[e.appointed_by] ? byId[e.appointed_by].name : '—';
        by = '<td class="by">' + escapeHtml(bn) + '</td>';
      }
      html += '<tr>' +
        '<td><div class="name">' + escapeHtml(e.name) + '</div>' +
        '<div class="role">' + escapeHtml(e.role || '') + '</div>' +
        tagsHtml(e.tags) + '</td>' +
        '<td>' + escapeHtml(e.office || '') + '</td>' +
        '<td class="term">' + escapeHtml(e.term_start || '—') + ' → ' + fmtTermEnd(e.term_end) + '</td>' +
        by +
        '<td>' + sourcesHtml(e.sources) + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }
  function renderEvents(events, byId, container) {
    if (!events.length) { container.innerHTML = '<p class="reg-lede">No matching events.</p>'; return; }
    var sorted = events.slice().sort(function (a, b) { return (b.event_date || '').localeCompare(a.event_date || ''); });
    var html = '';
    sorted.forEach(function (ev) {
      var who = byId[ev.entity_id] ? byId[ev.entity_id].name : ev.entity_id;
      var by = ev.appointed_by && byId[ev.appointed_by] ? byId[ev.appointed_by].name : null;
      html += '<div class="reg-event-row">' +
        '<div class="when">' + escapeHtml(ev.event_date || '') + '</div>' +
        '<div class="what"><span class="ev-type">' + escapeHtml(ev.event_type || '') + '</span>' +
        '<strong>' + escapeHtml(who) + '</strong> — ' + escapeHtml(ev.office || '') +
        ' <em style="color:var(--slate-ink-muted)">(' + escapeHtml(ev.body || '') + ')</em>' +
        (by ? '<br><small style="color:var(--slate-ink-muted)">appointed by ' + escapeHtml(by) + '</small>' : '') +
        sourcesHtml(ev.sources) +
        '</div></div>';
    });
    container.innerHTML = html;
  }
  global.RegistryConsumer = {
    escapeHtml: escapeHtml, fmtTermEnd: fmtTermEnd, safeHost: safeHost,
    sourceLink: sourceLink, tagsHtml: tagsHtml, sourcesHtml: sourcesHtml,
    loadJson: loadJson, loadProvenanceLast: loadProvenanceLast,
    showError: showError, renderEntities: renderEntities, renderEvents: renderEvents
  };
})(window);
