/* network-analysis.html — force-layout board from OSINT / influence / defence data */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var W = 960, H = 560;
  var CAT = {
    israel: { label: 'Israel lobby track', color: '#d3a625' },
    ccp: { label: 'PRC / UFWD track', color: '#c8102e' },
    cfnis: { label: 'Military justice', color: '#9adbe8' },
    media: { label: 'Media', color: '#a89f90' },
    india: { label: 'India track', color: '#7fbf9a' },
    disinfo: { label: 'Amplification', color: '#c8102e' },
    evidence: { label: 'Evidence', color: '#ece7dc' },
    defence: { label: 'Defence instruments', color: '#9adbe8' },
    authority: { label: 'Authority', color: '#a89f90' },
    air: { label: 'Tactical aviation', color: '#9adbe8' },
    sea: { label: 'Undersea', color: '#7fbf9a' },
    north: { label: 'Northern surveillance', color: '#d3a625' },
    air_isr: { label: 'Airborne ISR', color: '#ece7dc' },
    osint: { label: 'OSINT harvest', color: '#9adbe8' }
  };

  var svg = document.getElementById('net-svg');
  var detail = document.getElementById('net-detail');
  var chipsEl = document.getElementById('net-chips');
  var listEl = document.getElementById('net-list');
  var emptyEl = document.getElementById('net-empty');
  var statsEl = document.getElementById('net-stats');
  var standEl = document.getElementById('net-stand');
  var searchEl = document.getElementById('net-search');
  if (!svg || !detail) return;

  var boards = {
    osint: { nodes: [], edges: [], meta: {} },
    influence: { nodes: [], edges: [], meta: {} },
    defence: { nodes: [], edges: [], meta: {} }
  };
  var state = {
    board: 'osint',
    nodes: [],
    edges: [],
    byId: {},
    filter: null,
    query: '',
    sel: null,
    meta: {}
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function nodeColor(n) {
    var cats = n.categories || [];
    for (var i = 0; i < cats.length; i++) {
      if (CAT[cats[i]]) return CAT[cats[i]].color;
    }
    return '#9adbe8';
  }

  function nodeRadius(n) {
    var t = n.type || '';
    if (t === 'org' || t === 'agency' || t === 'department' || t === 'state') return 9;
    if (t === 'contract' || t === 'program') return 8;
    if (t === 'event' || t === 'evidence') return 7;
    return 6.5;
  }

  function softDetail(s) {
    if (!s) return '';
    s = String(s).replace(/\s+/g, ' ').trim();
    if (s.length > 280) s = s.slice(0, 277) + '…';
    return s;
  }

  function dedupeNodes(nodes) {
    var seen = Object.create(null);
    var out = [];
    nodes.forEach(function (n) {
      if (!n || !n.id) return;
      var key = String(n.id).toLowerCase();
      var lab = String(n.label || n.id).toLowerCase().replace(/\s+/g, ' ');
      if (seen[key] || seen['L:' + lab]) return;
      seen[key] = 1;
      seen['L:' + lab] = 1;
      out.push(n);
    });
    return out;
  }

  function normalizeInfluence(raw) {
    var nodes = dedupeNodes(raw.nodes || []).map(function (n) {
      return {
        id: n.id,
        type: n.type || 'person',
        label: n.label || n.id,
        subtitle: n.subtitle || '',
        detail: softDetail(n.detail || ''),
        link: n.link || '',
        categories: (n.categories || []).filter(function (c) {
          return c && c !== 'person' && c !== 'org';
        }),
        claim_level: n.claim_level || 'BOARD_INDEX'
      };
    });
    var ids = Object.create(null);
    nodes.forEach(function (n) { ids[n.id] = 1; });
    var edges = (raw.threads || raw.edges || []).filter(function (e) {
      return e && ids[e.from] && ids[e.to] && e.from !== e.to;
    }).map(function (e) {
      return {
        from: e.from,
        to: e.to,
        label: e.label || e.rel || 'documented link',
        strength: e.strength || 1,
        claim_level: e.claim_level || 'BOARD_INDEX'
      };
    });
    return { nodes: nodes, edges: edges, meta: raw.meta || {} };
  }

  function normalizeDefence(raw) {
    var layerToCat = {
      authority: 'authority',
      air: 'air',
      sea: 'sea',
      north: 'north',
      air_isr: 'air_isr'
    };
    var nodes = (raw.nodes || []).map(function (n) {
      var cat = layerToCat[n.layer] || 'defence';
      return {
        id: n.id,
        type: n.type || 'program',
        label: n.label || n.id,
        subtitle: (n.type || 'entity') + (n.layer ? ' · ' + n.layer : ''),
        detail: softDetail((raw.legal_standard || '') + ' Node from the defence procurement velocity freezes.'),
        link: n.id === 'glle' || n.id === 'w8475' || n.id === 'bell'
          ? 'griffon-glle-procurement.html'
          : (n.id === 'cpsp' || n.id === 'tkms' ? 'submarine-timeline.html'
            : (n.id === 'aothr' || n.id === 'australia' ? 'arctic-sovereignty.html' : 'dnd-procurement.html')),
        categories: [cat, 'defence'],
        claim_level: 'FACT'
      };
    });
    var edges = (raw.edges || []).map(function (e) {
      return {
        from: e.from,
        to: e.to,
        label: e.rel || e.label || 'link',
        strength: e.claim_level === 'FACT' ? 2 : 1,
        claim_level: e.claim_level || 'FACT',
        source: e.source || ''
      };
    });
    return {
      nodes: nodes,
      edges: edges,
      meta: {
        title: raw.title || 'Defence instruments',
        updated: (raw.generated_at || '').slice(0, 10),
        sources: 'DIA, PSPC, DCB, CanadaBuys freezes'
      }
    };
  }

  function layout(nodes, edges) {
    var n = nodes.length;
    if (!n) return;
    var i, j, e, a, b, dx, dy, dist, f, k, iter;
    var byId = Object.create(null);
    nodes.forEach(function (node, idx) {
      var ang = (2 * Math.PI * idx) / n - Math.PI / 2;
      var ring = 0.28 + 0.12 * (idx % 3);
      node.x = W * 0.5 + Math.cos(ang) * W * ring;
      node.y = H * 0.5 + Math.sin(ang) * H * ring * 0.92;
      node.vx = 0;
      node.vy = 0;
      byId[node.id] = node;
    });
    var links = edges.map(function (ed) {
      return { a: byId[ed.from], b: byId[ed.to], s: ed.strength || 1 };
    }).filter(function (L) { return L.a && L.b; });

    for (iter = 0; iter < 220; iter++) {
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          a = nodes[i]; b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          f = 1400 / (dist * dist);
          dx = (dx / dist) * f; dy = (dy / dist) * f;
          a.vx += dx; a.vy += dy;
          b.vx -= dx; b.vy -= dy;
        }
      }
      for (k = 0; k < links.length; k++) {
        e = links[k]; a = e.a; b = e.b;
        dx = b.x - a.x; dy = b.y - a.y;
        dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        f = (dist - 90 / Math.sqrt(e.s)) * 0.012 * e.s;
        dx = (dx / dist) * f; dy = (dy / dist) * f;
        a.vx += dx; a.vy += dy;
        b.vx -= dx; b.vy -= dy;
      }
      for (i = 0; i < n; i++) {
        a = nodes[i];
        a.vx += (W * 0.5 - a.x) * 0.004;
        a.vy += (H * 0.5 - a.y) * 0.004;
        a.vx *= 0.72; a.vy *= 0.72;
        a.x += a.vx; a.y += a.vy;
        a.x = Math.max(36, Math.min(W - 36, a.x));
        a.y = Math.max(28, Math.min(H - 28, a.y));
      }
    }
  }

  function visibleNodes() {
    var f = state.filter;
    var q = state.query;
    return state.nodes.filter(function (n) {
      if (f && (n.categories || []).indexOf(f) < 0) return false;
      if (q) {
        var hay = (n.label + ' ' + (n.subtitle || '') + ' ' + (n.detail || '')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var vis = visibleNodes();
    var visIds = Object.create(null);
    vis.forEach(function (n) { visIds[n.id] = 1; });
    if (emptyEl) emptyEl.hidden = vis.length > 0;

    state.edges.forEach(function (t) {
      if (!visIds[t.from] || !visIds[t.to]) return;
      var a = state.byId[t.from], b = state.byId[t.to];
      if (!a || !b) return;
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', a.x);
      line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x);
      line.setAttribute('y2', b.y);
      line.setAttribute('stroke-width', Math.min(3.2, 0.9 + (t.strength || 1) * 0.55));
      line.setAttribute('class', 'edge');
      if (state.sel && (t.from === state.sel || t.to === state.sel)) line.classList.add('hot');
      if (t.claim_level === 'REPORTING') line.setAttribute('stroke-dasharray', '4 3');
      svg.appendChild(line);
      t._el = line;
    });

    vis.forEach(function (n) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'node' + (state.sel === n.id ? ' sel' : ''));
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', n.x);
      c.setAttribute('cy', n.y);
      c.setAttribute('r', nodeRadius(n));
      c.setAttribute('fill', nodeColor(n));
      g.appendChild(c);
      var showLabel = state.sel === n.id || vis.length < 48;
      if (showLabel) {
        var tx = document.createElementNS(NS, 'text');
        tx.setAttribute('x', n.x);
        tx.setAttribute('y', n.y - nodeRadius(n) - 6);
        tx.setAttribute('text-anchor', 'middle');
        tx.textContent = n.label.length > 22 ? n.label.slice(0, 20) + '…' : n.label;
        g.appendChild(tx);
      }
      g.addEventListener('click', function (ev) {
        ev.stopPropagation();
        select(n);
      });
      svg.appendChild(g);
      n._el = g;
    });
  }

  function select(n) {
    state.sel = n.id;
    draw();
    while (detail.firstChild) detail.removeChild(detail.firstChild);
    detail.appendChild(el('span', 'kick', (n.type || 'entity').replace(/_/g, ' ')));
    if (n.claim_level) {
      var cl = String(n.claim_level);
      var clLab = 'Index · ' + cl;
      if (cl === 'FACT') clLab = 'FACT · government instrument';
      else if (cl.indexOf('OSINT') === 0) clLab = cl + ' · verify sources';
      else if (cl === 'BOARD_INDEX') clLab = 'Board index · open the case file';
      detail.appendChild(el('div', 'claim', clLab));
    }
    detail.appendChild(el('h3', null, n.label || ''));
    if (n.subtitle) detail.appendChild(el('div', 'sub', n.subtitle));
    if (n.detail) detail.appendChild(el('p', null, n.detail));

    var cons = state.edges.filter(function (t) {
      return t.from === n.id || t.to === n.id;
    });
    if (cons.length) {
      var box = el('div', 'cons');
      box.appendChild(el('h4', null, 'Connections (' + cons.length + ')'));
      cons.slice(0, 14).forEach(function (t) {
        var other = state.byId[t.from === n.id ? t.to : t.from] || {};
        var row = el('div');
        row.appendChild(el('b', null, other.label || '?'));
        row.appendChild(document.createTextNode(' — ' + (t.label || 'link')));
        if (t.claim_level && t.claim_level !== 'BOARD_INDEX') {
          row.appendChild(document.createTextNode(' · ' + t.claim_level));
        }
        box.appendChild(row);
      });
      detail.appendChild(box);
    }
    if (n.link) {
      var a = el('a', 'open', 'Open the file →');
      a.href = n.link;
      detail.appendChild(a);
    }
  }

  function buildChips() {
    while (chipsEl.firstChild) chipsEl.removeChild(chipsEl.firstChild);
    var cats = Object.create(null);
    state.nodes.forEach(function (n) {
      (n.categories || []).forEach(function (c) {
        if (CAT[c]) cats[c] = (cats[c] || 0) + 1;
      });
    });
    function addChip(key, label, active) {
      var b = el('button', 'chip' + (active ? ' on' : ''), label);
      b.type = 'button';
      if (key && CAT[key]) b.style.borderColor = CAT[key].color;
      b.addEventListener('click', function () {
        state.filter = key;
        state.sel = null;
        buildChips();
        draw();
        updateStats();
      });
      chipsEl.appendChild(b);
    }
    addChip(null, 'All', !state.filter);
    Object.keys(cats).sort().forEach(function (c) {
      addChip(c, (CAT[c].label || c) + ' · ' + cats[c], state.filter === c);
    });
  }

  function buildList() {
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    state.nodes.slice().sort(function (a, b) {
      return (a.label || '').localeCompare(b.label || '');
    }).forEach(function (n) {
      var li = el('li');
      if (n.link) {
        var a = el('a', null, n.label);
        a.href = n.link;
        li.appendChild(a);
      } else {
        li.appendChild(document.createTextNode(n.label));
      }
      if (n.subtitle) li.appendChild(el('span', null, n.subtitle));
      listEl.appendChild(li);
    });
  }

  function updateStats() {
    var m = state.meta || {};
    var vis = visibleNodes().length;
    statsEl.innerHTML =
      '<b>' + state.nodes.length + '</b> entities · <b>' + state.edges.length + '</b> edges' +
      (vis !== state.nodes.length ? ' · showing <b>' + vis + '</b>' : '') +
      (m.updated ? ' · updated ' + m.updated : '') +
      (m.sources ? ' · ' + String(m.sources).split(',').length + ' sources' : '');
  }

  function activateBoard(name) {
    state.board = name;
    var pack = boards[name];
    state.nodes = pack.nodes;
    state.edges = pack.edges;
    state.meta = pack.meta || {};
    state.byId = Object.create(null);
    state.nodes.forEach(function (n) { state.byId[n.id] = n; });
    state.filter = null;
    state.sel = null;
    state.query = '';
    if (searchEl) searchEl.value = '';
    layout(state.nodes, state.edges);
    buildChips();
    buildList();
    draw();
    updateStats();
    ['osint', 'influence', 'defence'].forEach(function (k) {
      var btn = document.getElementById('tab-' + k);
      if (!btn) return;
      btn.classList.toggle('on', name === k);
      btn.setAttribute('aria-selected', name === k ? 'true' : 'false');
    });
    if (name === 'defence') {
      standEl.textContent =
        'Defence procurement instruments: contracts, preferred suppliers, and partner paths. Preferred supplier is not a signed multi-hull production contract.';
    } else if (name === 'osint') {
      standEl.textContent =
        'OSINT composite: TENET5 vault scrapes, public social/media pulls, appointment edges, and freezes — filtered for the public board.';
    } else {
      standEl.textContent =
        'Foreign-influence investigation board: people, organizations, votes, and filings from the public record.';
    }
    while (detail.firstChild) detail.removeChild(detail.firstChild);
    detail.appendChild(el('span', 'kick', 'Inspector'));
    detail.appendChild(el('h3', null, 'Select a node'));
    detail.appendChild(el('p', null, 'Edges are documented interactions. Open the case file for full citations.'));
  }

  var tabOsint = document.getElementById('tab-osint');
  var tabInf = document.getElementById('tab-influence');
  var tabDef = document.getElementById('tab-defence');
  if (tabOsint) tabOsint.addEventListener('click', function () { activateBoard('osint'); });
  if (tabInf) tabInf.addEventListener('click', function () { activateBoard('influence'); });
  if (tabDef) tabDef.addEventListener('click', function () { activateBoard('defence'); });
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      state.query = (searchEl.value || '').trim().toLowerCase();
      state.sel = null;
      draw();
      updateStats();
    });
  }
  svg.addEventListener('click', function () {
    state.sel = null;
    draw();
  });

  var DEFENCE_FALLBACK = {
    title: 'Defence procurement velocity cluster',
    generated_at: '2026-07-11',
    legal_standard: 'FACT cites government instruments.',
    nodes: [
      { id: 'dia', label: 'Defence Investment Agency', type: 'agency', layer: 'authority' },
      { id: 'dnd', label: 'National Defence', type: 'department', layer: 'authority' },
      { id: 'pspc', label: 'PSPC', type: 'department', layer: 'authority' },
      { id: 'glle', label: 'GLLE (Griffon)', type: 'program', layer: 'air' },
      { id: 'w8475', label: 'W8475-205391/001/BF', type: 'contract', layer: 'air' },
      { id: 'bell', label: 'Bell Textron Canada', type: 'vendor', layer: 'air' },
      { id: 'ntacs', label: 'Next Tactical Aviation Capability Set', type: 'program', layer: 'air' },
      { id: 'cpsp', label: 'Canadian Patrol Submarine', type: 'program', layer: 'sea' },
      { id: 'tkms', label: 'TKMS (preferred)', type: 'vendor', layer: 'sea' },
      { id: 'hanwha', label: 'Hanwha Ocean (reserve)', type: 'vendor', layer: 'sea' },
      { id: 'aothr', label: 'Arctic OTHR', type: 'program', layer: 'north' },
      { id: 'australia', label: 'Australia', type: 'state', layer: 'north' },
      { id: 'bae_au', label: 'BAE Systems Australia', type: 'vendor', layer: 'north' },
      { id: 'aewc', label: 'AEWC / GlobalEye', type: 'program', layer: 'air_isr' },
      { id: 'saab', label: 'Saab (preferred)', type: 'vendor', layer: 'air_isr' }
    ],
    edges: [
      { from: 'pspc', to: 'w8475', rel: 'announced award', claim_level: 'FACT' },
      { from: 'w8475', to: 'bell', rel: 'contractor ~$797.6M', claim_level: 'FACT' },
      { from: 'w8475', to: 'glle', rel: 'implements', claim_level: 'FACT' },
      { from: 'glle', to: 'ntacs', rel: 'bridges to replacement', claim_level: 'FACT' },
      { from: 'dnd', to: 'glle', rel: 'program owner', claim_level: 'FACT' },
      { from: 'dia', to: 'cpsp', rel: 'advances', claim_level: 'FACT' },
      { from: 'cpsp', to: 'tkms', rel: 'preferred supplier', claim_level: 'FACT' },
      { from: 'cpsp', to: 'hanwha', rel: 'reserve supplier', claim_level: 'FACT' },
      { from: 'dia', to: 'aothr', rel: 'advances', claim_level: 'FACT' },
      { from: 'aothr', to: 'australia', rel: 'G2G $2.5B class', claim_level: 'FACT' },
      { from: 'aothr', to: 'bae_au', rel: 'industry partner', claim_level: 'FACT' },
      { from: 'dia', to: 'aewc', rel: 'preferred path', claim_level: 'FACT' },
      { from: 'aewc', to: 'saab', rel: 'preferred supplier', claim_level: 'FACT' }
    ]
  };

  Promise.all([
    fetch('data/investigation_board.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('board');
      return r.json();
    }),
    fetch('data/analysis/defence_cluster_network.json', { cache: 'no-cache' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).catch(function () { return null; }),
    fetch('data/network_osint_board.json', { cache: 'no-cache' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).catch(function () { return null; })
  ]).then(function (triple) {
    boards.influence = normalizeInfluence(triple[0]);
    boards.defence = normalizeDefence(triple[1] || DEFENCE_FALLBACK);
    boards.osint = triple[2] ? normalizeInfluence(triple[2]) : boards.influence;
    if (triple[2] && triple[2].meta) boards.osint.meta = triple[2].meta;
    activateBoard(triple[2] ? 'osint' : 'influence');
  }).catch(function () {
    boards.defence = normalizeDefence(DEFENCE_FALLBACK);
    boards.influence = boards.defence;
    boards.osint = boards.defence;
    activateBoard('defence');
    standEl.textContent =
      'Primary boards could not load. Showing the defence-instruments network from local freezes.';
    statsEl.textContent = 'Fallback board · defence instruments only';
  });
})();
