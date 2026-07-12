/**
 * TENET5 Press Charts — site-wide code chart runtime
 * Renders SVG line/bar/spark charts inside [data-press-chart] mounts.
 * Matches homepage glass-chart tokens (ice stroke, ivory labels, void fill).
 *
 * Usage:
 *   <div class="nr-figure is-code glass"
 *        data-press-chart="line"
 *        data-series="16499,15343,13241,10064,7603,5433,2838"
 *        data-labels="2024,2023,2022,2021,2020,2019,2018"
 *        data-title="MAID provisions (federal annual)"
 *        data-source="Health Canada annual reports"></div>
 *
 * Also auto-upgrades <table data-press-chart="bar"> into a bar chart
 * (first numeric column series; first text column labels).
 */
(function () {
  'use strict';
  if (window.__TENET5_PRESS_CHARTS) return;
  window.__TENET5_PRESS_CHARTS = true;

  var ICE = '#9adbe8';
  var GOLD = '#d3a625';
  var RED = '#c8102e';
  var IVORY_DIM = '#a89f90';
  var GRID = 'rgba(154,219,232,0.08)';

  function parseSeries(raw) {
    if (!raw) return [];
    return String(raw)
      .split(/[,|\s]+/)
      .map(function (x) { return parseFloat(x); })
      .filter(function (n) { return isFinite(n); });
  }

  function parseLabels(raw, n) {
    if (!raw) {
      var out = [];
      for (var i = 0; i < n; i++) out.push(String(i + 1));
      return out;
    }
    return String(raw).split(/[,|]/).map(function (s) { return s.trim(); }).slice(0, n);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function strokeFor(tone) {
    if (tone === 'warn' || tone === 'gold') return GOLD;
    if (tone === 'critical' || tone === 'red') return RED;
    return ICE;
  }

  function buildLine(series, labels, tone, w, h) {
    var padL = 40, padR = 12, padT = 18, padB = 32;
    var max = Math.max.apply(null, series.concat([1]));
    var min = Math.min.apply(null, series.concat([0]));
    if (min > 0) min = 0;
    var span = max - min || 1;
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var pts = series.map(function (v, i) {
      var x = padL + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
      var y = padT + innerH - ((v - min) / span) * innerH;
      return { x: x, y: y, v: v };
    });
    var path = pts.map(function (p, i) {
      return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
    }).join(' ');
    var area = path + ' L' + pts[pts.length - 1].x.toFixed(1) + ',' + (padT + innerH)
      + ' L' + pts[0].x.toFixed(1) + ',' + (padT + innerH) + ' Z';
    var stroke = strokeFor(tone);
    var grid = '';
    for (var g = 0; g < 4; g++) {
      var gy = padT + (innerH * g) / 3;
      grid += '<line class="glass-chart-grid" x1="' + padL + '" y1="' + gy + '" x2="' + (w - padR) + '" y2="' + gy + '"/>';
    }
    var dots = pts.map(function (p) {
      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3.2" fill="' + stroke + '"/>';
    }).join('');
    var lab = pts.map(function (p, i) {
      var lb = labels[i] || '';
      if (!lb) return '';
      return '<text class="glass-chart-text" x="' + p.x.toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle">' + esc(lb) + '</text>';
    }).join('');
    var yMax = '<text class="glass-chart-text" x="4" y="' + (padT + 4) + '">' + esc(String(Math.round(max))) + '</text>';
    return grid
      + '<path class="glass-chart-fill' + (tone === 'warn' ? '-warn' : '') + '" d="' + area + '"/>'
      + '<path class="glass-chart-line' + (tone === 'warn' ? ' glass-chart-warn' : '') + '" d="' + path + '" stroke="' + stroke + '"/>'
      + dots + lab + yMax;
  }

  function buildBar(series, labels, tone, w, h) {
    var padL = 40, padR = 12, padT = 18, padB = 32;
    var max = Math.max.apply(null, series.concat([1]));
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var gap = 6;
    var bw = Math.max(6, (innerW / series.length) - gap);
    var stroke = strokeFor(tone);
    var bars = series.map(function (v, i) {
      var bh = (v / max) * innerH;
      var x = padL + i * (bw + gap);
      var y = padT + innerH - bh;
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1)
        + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, bh).toFixed(1)
        + '" rx="2" fill="' + stroke + '" opacity="0.85"/>'
        + '<text class="glass-chart-text" x="' + (x + bw / 2).toFixed(1) + '" y="' + (h - 10)
        + '" text-anchor="middle">' + esc(labels[i] || '') + '</text>';
    }).join('');
    return bars;
  }

  function buildSpark(series, tone, w, h) {
    var max = Math.max.apply(null, series.concat([1]));
    var min = Math.min.apply(null, series);
    var span = max - min || 1;
    var pts = series.map(function (v, i) {
      var x = (series.length === 1 ? w / 2 : (i / (series.length - 1)) * w);
      var y = 4 + (h - 8) - ((v - min) / span) * (h - 8);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<polyline fill="none" stroke="' + strokeFor(tone) + '" stroke-width="2" points="' + pts + '"/>';
  }

  function captionHtml(el) {
    var title = el.getAttribute('data-title') || '';
    var source = el.getAttribute('data-source') || '';
    if (!title && !source) return '';
    var html = '<figcaption class="nr-cap">';
    if (title) html += '<b>' + esc(title) + '</b>';
    if (source) html += '<span class="nr-src">Source · ' + esc(source) + '</span>';
    html += '</figcaption>';
    return html;
  }

  function renderMount(el) {
    if (el.getAttribute('data-chart-ready') === '1') return;
    var kind = (el.getAttribute('data-press-chart') || 'line').toLowerCase();
    var series = parseSeries(el.getAttribute('data-series'));
    if (!series.length) return;
    var labels = parseLabels(el.getAttribute('data-labels'), series.length);
    var tone = el.getAttribute('data-tone') || 'ice';
    var w = parseInt(el.getAttribute('data-width') || '640', 10);
    var h = parseInt(el.getAttribute('data-height') || (kind === 'spark' ? '48' : '280'), 10);
    if (!isFinite(w) || w < 120) w = 640;
    if (!isFinite(h) || h < 32) h = 280;

    var inner = '';
    if (kind === 'bar') inner = buildBar(series, labels, tone, w, h);
    else if (kind === 'spark') inner = buildSpark(series, tone, w, h);
    else inner = buildLine(series, labels, tone, w, h);

    var svg = '<div class="nr-frame"><svg class="glass-chart" viewBox="0 0 ' + w + ' ' + h
      + '" role="img" aria-label="' + esc(el.getAttribute('data-title') || 'Chart')
      + '" preserveAspectRatio="xMidYMid meet">' + inner + '</svg></div>';

    var tag = el.tagName.toLowerCase() === 'figure' ? '' : '';
    el.classList.add('nr-figure', 'is-code', 'glass');
    el.innerHTML = svg + captionHtml(el);
    el.setAttribute('data-chart-ready', '1');
  }

  function tableToChart(table) {
    if (table.getAttribute('data-chart-ready') === '1') return;
    var kind = (table.getAttribute('data-press-chart') || 'bar').toLowerCase();
    var rows = table.querySelectorAll('tr');
    var series = [];
    var labels = [];
    rows.forEach(function (tr, idx) {
      var cells = tr.querySelectorAll('th,td');
      if (cells.length < 2) return;
      if (idx === 0 && /[a-zA-Z]/.test(cells[1].textContent) && !/\d/.test(cells[1].textContent)) return;
      var lab = (cells[0].textContent || '').trim();
      var num = parseFloat(String(cells[1].textContent || '').replace(/[,$%\s]/g, ''));
      if (!isFinite(num)) return;
      labels.push(lab);
      series.push(num);
    });
    if (series.length < 2) return;
    var host = document.createElement('figure');
    host.className = 'nr-figure is-code glass';
    host.setAttribute('data-press-chart', kind);
    host.setAttribute('data-series', series.join(','));
    host.setAttribute('data-labels', labels.join(','));
    host.setAttribute('data-title', table.getAttribute('data-title') || table.getAttribute('aria-label') || 'Data chart');
    host.setAttribute('data-source', table.getAttribute('data-source') || '');
    host.setAttribute('data-tone', table.getAttribute('data-tone') || 'ice');
    table.parentNode.insertBefore(host, table);
    table.setAttribute('data-chart-ready', '1');
    table.classList.add('nr-table-source');
    renderMount(host);
  }

  function run() {
    document.querySelectorAll('[data-press-chart]:not(table)').forEach(renderMount);
    document.querySelectorAll('table[data-press-chart]').forEach(tableToChart);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Late injects (briefing / swarm)
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function () {
      run();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.TENET5_PRESS_CHARTS = { render: run, renderMount: renderMount };
})();
