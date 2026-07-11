/* network-analysis.html — neighborhood / cluster / force board (OSINT default = neighborhood) */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var W = 960, H = 600;
  /* Ice-lake tokens only; hue reserved for severity (critical / money track). */
  var ICE = '#9adbe8';
  var IVORY = '#ece7dc';
  var SILVER = '#a89f90';
  var GOLD = '#d3a625';
  var ALERT = '#c8102e';
  var CAT = {
    israel: { label: 'Lobby track', color: GOLD },
    ccp: { label: 'Foreign influence', color: ALERT },
    cfnis: { label: 'Military justice', color: ICE },
    media: { label: 'Media', color: SILVER },
    india: { label: 'Foreign influence', color: ALERT },
    disinfo: { label: 'Amplification', color: ALERT },
    evidence: { label: 'Evidence', color: IVORY },
    defence: { label: 'Defence', color: ICE },
    authority: { label: 'Authority', color: SILVER },
    air: { label: 'Defence', color: ICE },
    sea: { label: 'Defence', color: ICE },
    north: { label: 'Defence', color: ICE },
    air_isr: { label: 'Defence', color: ICE },
    osint: { label: 'Public record', color: ICE }
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
    meta: {},
    loaded: false,
    view: 'neighborhood', /* neighborhood | clusters | force */
    deg: {}
  };
  var hubsEl = document.getElementById('net-hubs');

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
    return ICE;
  }

  function nodeRadius(n) {
    var t = n.type || '';
    /* Slightly quieter than the old “bubble chart” look */
    if (t === 'org' || t === 'agency' || t === 'department' || t === 'state') return 7.5;
    if (t === 'contract' || t === 'program') return 7;
    if (t === 'event' || t === 'evidence') return 6.5;
    return 6;
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
        claim_level: e.claim_level || 'BOARD_INDEX',
        source: e.source || e.source_url || ''
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

  function primaryCat(n) {
    var cats = n.categories || [];
    for (var i = 0; i < cats.length; i++) {
      if (CAT[cats[i]]) return cats[i];
    }
    return 'osint';
  }

  function recomputeDegree() {
    var d = Object.create(null);
    state.edges.forEach(function (t) {
      d[t.from] = (d[t.from] || 0) + 1;
      d[t.to] = (d[t.to] || 0) + 1;
    });
    state.deg = d;
    return d;
  }

  function topHubId(nodes) {
    var best = null, bestD = -1;
    nodes.forEach(function (n) {
      var dd = state.deg[n.id] || 0;
      if (dd > bestD) {
        bestD = dd;
        best = n.id;
      }
    });
    return best;
  }

  /** Stable category columns — no force hairball. */
  function layoutClusters(nodes) {
    var n = nodes.length;
    if (!n) return;
    var groups = Object.create(null);
    var order = [];
    nodes.forEach(function (node) {
      var c = primaryCat(node);
      if (!groups[c]) {
        groups[c] = [];
        order.push(c);
      }
      groups[c].push(node);
    });
    order.sort(function (a, b) {
      return (groups[b].length - groups[a].length) || a.localeCompare(b);
    });
    order.forEach(function (c) {
      groups[c].sort(function (a, b) {
        return (state.deg[b.id] || 0) - (state.deg[a.id] || 0);
      });
    });
    var cols = order.length || 1;
    var colW = (W - 80) / cols;
    order.forEach(function (c, ci) {
      var list = groups[c];
      var cx = 48 + colW * (ci + 0.5);
      list.forEach(function (node, ri) {
        var rows = list.length;
        var yPad = 52;
        var usable = H - yPad * 2;
        var y = rows <= 1
          ? H * 0.5
          : yPad + (usable * ri) / Math.max(1, rows - 1);
        node.x = cx + ((ri % 2) * 10 - 5);
        node.y = y;
        node.vx = 0;
        node.vy = 0;
        node._cluster = c;
      });
    });
  }

  /**
   * Max neighbors on the board (inspector lists all).
   * Hairball research + ProPublica simplicity: fewer marks, clearer near view.
   */
  var MAX_NEIGH_DRAW = 12;

  /** Score a neighbor for draw priority: FACT edges + own degree. */
  function neighborPriority(hubId, node) {
    var score = (state.deg[node.id] || 0);
    state.edges.forEach(function (t) {
      if (!((t.from === hubId && t.to === node.id) || (t.to === hubId && t.from === node.id))) return;
      if (t.claim_level === 'FACT') score += 8;
      else if (t.claim_level && String(t.claim_level).indexOf('OSINT') === 0) score += 3;
      score += (t.strength || 1);
    });
    return score;
  }

  /**
   * Ego graph: hub center + prioritized neighbors on 1–2 rings.
   * nodes = ego set (hub + all neighbors); we may park low-priority ones off-canvas.
   */
  function layoutNeighborhood(nodes, hubId) {
    var n = nodes.length;
    if (!n) return;
    var hub = null;
    var others = [];
    nodes.forEach(function (node) {
      if (node.id === hubId) hub = node;
      else others.push(node);
    });
    if (!hub) {
      hub = nodes[0];
      hubId = hub.id;
      others = nodes.slice(1);
    }
    hub.x = W * 0.5;
    hub.y = H * 0.48;
    hub.vx = 0;
    hub.vy = 0;
    others.sort(function (a, b) {
      var pa = neighborPriority(hubId, a);
      var pb = neighborPriority(hubId, b);
      if (pb !== pa) return pb - pa;
      var ca = primaryCat(a);
      var cb = primaryCat(b);
      if (ca !== cb) return ca.localeCompare(cb);
      return (a.label || '').localeCompare(b.label || '');
    });
    state._neighTotal = others.length;
    state._neighDrawn = Math.min(others.length, MAX_NEIGH_DRAW);
    var draw = others.slice(0, MAX_NEIGH_DRAW);
    var park = others.slice(MAX_NEIGH_DRAW);
    park.forEach(function (node) {
      node.x = -999;
      node.y = -999;
      node.vx = 0;
      node.vy = 0;
      node._parked = true;
    });
    draw.forEach(function (node) { node._parked = false; });
    var m = draw.length;
    var R1 = Math.min(W, H) * 0.30;
    var R2 = Math.min(W, H) * 0.41;
    /* Proximity: same primary category sits on contiguous arc (not random twist) */
    var catOrder = Object.create(null);
    var catSeq = 0;
    draw.forEach(function (node) {
      var c = primaryCat(node);
      if (catOrder[c] == null) catOrder[c] = catSeq++;
    });
    draw.sort(function (a, b) {
      var ca = catOrder[primaryCat(a)] || 0;
      var cb = catOrder[primaryCat(b)] || 0;
      if (ca !== cb) return ca - cb;
      return neighborPriority(hubId, b) - neighborPriority(hubId, a);
    });
    /* Two rings when many: first 8 inner (highest priority), rest outer */
    var innerN = m <= 8 ? m : Math.min(8, Math.ceil(m * 0.55));
    state._neighR1 = R1;
    state._neighR2 = m > innerN ? R2 : R1;
    state._hubXY = { x: hub.x, y: hub.y };
    draw.forEach(function (node, i) {
      var onOuter = i >= innerN;
      var ringLen = onOuter ? (m - innerN) : innerN;
      var ringIdx = onOuter ? (i - innerN) : i;
      var R = onOuter ? R2 : R1;
      if (m <= 6) R = Math.min(W, H) * 0.30;
      /* Even spacing within ring; category sort already groups tracks */
      var ang = (2 * Math.PI * ringIdx) / Math.max(1, ringLen) - Math.PI / 2;
      node.x = hub.x + Math.cos(ang) * R;
      node.y = hub.y + Math.sin(ang) * R * 0.88;
      node.x = Math.max(48, Math.min(W - 48, node.x));
      node.y = Math.max(48, Math.min(H - 44, node.y));
      node.vx = 0;
      node.vy = 0;
      node._labelSide = (Math.cos(ang) >= 0) ? 1 : -1;
      node._ring = onOuter ? 2 : 1;
    });
  }

  /** Soft quadratic curve hub→neighbor (newsroom arcs, not force hairball). */
  function egoEdgePath(ax, ay, bx, by) {
    var mx = (ax + bx) * 0.5;
    var my = (ay + by) * 0.5;
    var dx = bx - ax;
    var dy = by - ay;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    /* Bow outward slightly for readability; scale with span */
    var bow = Math.min(28, len * 0.12);
    var cx = mx - (dy / len) * bow;
    var cy = my + (dx / len) * bow;
    return 'M' + ax + ',' + ay + ' Q' + cx + ',' + cy + ' ' + bx + ',' + by;
  }

  /** Legacy force layout — only for small boards or explicit toggle. */
  function layoutForce(nodes, edges) {
    var n = nodes.length;
    if (!n) return;
    var i, j, e, a, b, dx, dy, dist, f, k, iter;
    var maxIter = 220;
    if (n > 120) maxIter = 80;
    else if (n > 80) maxIter = 100;
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

    for (iter = 0; iter < maxIter; iter++) {
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
      var maxMove = 0;
      for (i = 0; i < n; i++) {
        a = nodes[i];
        a.vx += (W * 0.5 - a.x) * 0.004;
        a.vy += (H * 0.5 - a.y) * 0.004;
        a.vx *= 0.72; a.vy *= 0.72;
        a.x += a.vx; a.y += a.vy;
        a.x = Math.max(36, Math.min(W - 36, a.x));
        a.y = Math.max(28, Math.min(H - 28, a.y));
        var move = Math.abs(a.vx) + Math.abs(a.vy);
        if (move > maxMove) maxMove = move;
      }
      if (iter >= 40 && maxMove < 0.05) break;
    }
  }

  function applyLayout() {
    recomputeDegree();
    var vis = visibleNodes();
    if (state.view === 'neighborhood') {
      var hub = state.sel || topHubId(vis);
      if (hub && !state.sel) state.sel = hub;
      var egoIds = Object.create(null);
      if (hub) {
        egoIds[hub] = 1;
        state.edges.forEach(function (t) {
          if (t.from === hub || t.to === hub) {
            egoIds[t.from] = 1;
            egoIds[t.to] = 1;
          }
        });
      }
      var egoNodes = vis.filter(function (n) { return egoIds[n.id]; });
      if (!egoNodes.length) egoNodes = vis.slice(0, 1);
      layoutNeighborhood(egoNodes, hub);
      /* park non-ego off-canvas so draw can skip */
      vis.forEach(function (n) {
        if (!egoIds[n.id]) {
          n.x = -999;
          n.y = -999;
        }
      });
    } else if (state.view === 'clusters') {
      layoutClusters(vis);
    } else {
      layoutForce(vis, state.edges);
    }
  }

  function visibleNodes() {
    var f = state.filter;
    var q = state.query;
    return state.nodes.filter(function (n) {
      if (f) {
        var cats = n.categories || [];
        var match = false;
        for (var i = 0; i < cats.length; i++) {
          var c = cats[i];
          var lbl = CAT[c] ? (CAT[c].label || c) : c;
          if (lbl === f) {
            match = true;
            break;
          }
        }
        if (!match) return false;
      }
      if (q) {
        var hay = (n.label + ' ' + (n.subtitle || '') + ' ' + (n.detail || '')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  /** Visible nodes + edges between them only. */
  function exportVisibleGraph() {
    var vis = visibleNodes();
    /* Neighborhood export = full ego (all neighbors), not only the capped board ring */
    if (state.view === 'neighborhood' && state.sel) {
      var ego = neighborhoodIds(state.sel);
      vis = vis.filter(function (n) { return ego[n.id]; });
    }
    var visIds = Object.create(null);
    var nodes = vis.map(function (n) {
      visIds[n.id] = 1;
      return {
        id: n.id,
        type: n.type || '',
        label: n.label || n.id,
        subtitle: n.subtitle || '',
        categories: (n.categories || []).slice(),
        claim_level: n.claim_level || '',
        link: n.link || ''
      };
    });
    var edges = state.edges.filter(function (e) {
      return e && visIds[e.from] && visIds[e.to];
    }).map(function (e) {
      return {
        from: e.from,
        to: e.to,
        label: e.label || 'documented link',
        strength: e.strength || 1,
        claim_level: e.claim_level || '',
        source: e.source || ''
      };
    });
    return {
      nodes: nodes,
      edges: edges,
      meta: {
        board: state.board,
        view: state.view,
        hub: state.view === 'neighborhood' ? state.sel : null,
        filter: state.filter || null,
        query: state.query || '',
        exported_at: new Date().toISOString().slice(0, 19) + 'Z',
        node_count: nodes.length,
        edge_count: edges.length,
        title: (state.meta && state.meta.title) || 'TENET5 network',
        note:
          state.view === 'neighborhood'
            ? 'Ego neighborhood export (hub + all neighbors). Centrality is not guilt.'
            : 'Visible slice only. Centrality is concentration of paper, not a verdict.'
      }
    };
  }

  function mermaidId(id) {
    var s = String(id || 'n').replace(/[^A-Za-z0-9_]/g, '_');
    if (!/^[A-Za-z]/.test(s)) s = 'n_' + s;
    return s;
  }

  function mermaidLabel(label) {
    return String(label || '')
      .replace(/["\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 48);
  }

  /**
   * flowchart LR for packs with <=40 nodes.
   * Returns { ok:true, text } or { ok:false, reason }.
   */
  function toMermaid(pack) {
    var nodes = (pack && pack.nodes) || [];
    if (nodes.length > 40) {
      return {
        ok: false,
        reason: 'Too dense for Mermaid — exported JSON only'
      };
    }
    if (!nodes.length) {
      return { ok: false, reason: 'No visible nodes to export' };
    }
    var lines = ['flowchart LR'];
    var seen = Object.create(null);
    nodes.forEach(function (n) {
      var mid = mermaidId(n.id);
      seen[n.id] = mid;
      lines.push('  ' + mid + '["' + mermaidLabel(n.label || n.id) + '"]');
    });
    (pack.edges || []).forEach(function (e) {
      var a = seen[e.from];
      var b = seen[e.to];
      if (!a || !b) return;
      var lab = mermaidLabel(e.label || 'link');
      if (lab) lines.push('  ' + a + ' -->|"' + lab + '"| ' + b);
      else lines.push('  ' + a + ' --> ' + b);
    });
    lines.push('');
    lines.push('%% TENET5 · documented edges only · not a verdict');
    return { ok: true, text: lines.join('\n') };
  }

  function downloadJson(filename, obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'network-visible.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  var standTimer = null;
  var standDefault = '';
  function setStandNote(msg) {
    if (!standEl || !msg) return;
    if (!standDefault) standDefault = standEl.textContent || '';
    standEl.textContent = msg;
    if (standTimer) clearTimeout(standTimer);
    standTimer = setTimeout(function () {
      standTimer = null;
      if (standDefault) standEl.textContent = standDefault;
    }, 2800);
  }

  function degreeMap() {
    return state.deg && Object.keys(state.deg).length ? state.deg : recomputeDegree();
  }

  function neighborhoodIds(hubId) {
    var ego = Object.create(null);
    if (!hubId) return ego;
    ego[hubId] = 1;
    state.edges.forEach(function (t) {
      if (t.from === hubId || t.to === hubId) {
        ego[t.from] = 1;
        ego[t.to] = 1;
      }
    });
    return ego;
  }

  function drawNodesForView(vis) {
    if (state.view !== 'neighborhood' || !state.sel) return vis;
    var ego = neighborhoodIds(state.sel);
    return vis.filter(function (n) { return ego[n.id] && n.x > -500; });
  }

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var visAll = visibleNodes();
    var vis = drawNodesForView(visAll);
    var visIds = Object.create(null);
    vis.forEach(function (n) { visIds[n.id] = 1; });
    if (emptyEl) {
      if (!state.loaded) {
        emptyEl.hidden = false;
        emptyEl.textContent = 'Loading board…';
      } else {
        emptyEl.hidden = vis.length > 0;
        emptyEl.textContent = vis.length
          ? ''
          : (state.nodes.length
            ? 'No entities match this filter or search.'
            : 'Board data did not load. Try Defence instruments or refresh.');
      }
    }

    var deg = degreeMap();

    /* Cluster headers */
    if (state.view === 'clusters' && vis.length) {
      var seenCol = Object.create(null);
      vis.forEach(function (n) {
        var c = n._cluster || primaryCat(n);
        if (seenCol[c]) return;
        seenCol[c] = 1;
        var lab = (CAT[c] && CAT[c].label) || c;
        var tx = document.createElementNS(NS, 'text');
        tx.setAttribute('class', 'cluster-lab');
        tx.setAttribute('x', n.x);
        tx.setAttribute('y', 22);
        tx.setAttribute('text-anchor', 'middle');
        tx.textContent = lab.length > 18 ? lab.slice(0, 16) + '…' : lab;
        svg.appendChild(tx);
      });
    }

    /* Soft guide rings — near view structure without HUD chrome */
    if (state.view === 'neighborhood' && state._hubXY) {
      [state._neighR1, state._neighR2].forEach(function (rr) {
        if (!rr) return;
        var ring = document.createElementNS(NS, 'ellipse');
        ring.setAttribute('class', 'guide-ring');
        ring.setAttribute('cx', state._hubXY.x);
        ring.setAttribute('cy', state._hubXY.y);
        ring.setAttribute('rx', rr);
        ring.setAttribute('ry', rr * 0.88);
        svg.appendChild(ring);
      });
    }

    /* Annotation layer (ProPublica near view) */
    if (state.view === 'neighborhood' && state.sel && state.byId[state.sel]) {
      var hubN = state.byId[state.sel];
      var drawnN = Math.max(0, vis.length - 1);
      var totalN = typeof state._neighTotal === 'number' ? state._neighTotal : drawnN;
      var cap = document.createElementNS(NS, 'text');
      cap.setAttribute('class', 'view-cap view-cap-strong');
      cap.setAttribute('x', 18);
      cap.setAttribute('y', 22);
      cap.setAttribute('text-anchor', 'start');
      cap.textContent = 'Near · ' + (hubN.label || hubN.id);
      svg.appendChild(cap);
      var cap2 = document.createElementNS(NS, 'text');
      cap2.setAttribute('class', 'view-cap');
      cap2.setAttribute('x', 18);
      cap2.setAttribute('y', 38);
      cap2.setAttribute('text-anchor', 'start');
      var capTxt = drawnN + ' neighbors on board';
      if (totalN > drawnN) {
        capTxt += ' · ' + (totalN - drawnN) + ' more in inspector';
      }
      cap2.textContent = capTxt;
      svg.appendChild(cap2);
    }

    var egoDim = null;
    if (state.view !== 'neighborhood' && state.sel) {
      egoDim = neighborhoodIds(state.sel);
    }

    state.edges.forEach(function (t) {
      if (!visIds[t.from] || !visIds[t.to]) return;
      var a = state.byId[t.from], b = state.byId[t.to];
      if (!a || !b) return;
      if (a.x < -500 || b.x < -500) return;
      var isHot = state.sel && (t.from === state.sel || t.to === state.sel);
      var isEgo =
        state.view === 'neighborhood' &&
        state.sel &&
        (t.from === state.sel || t.to === state.sel);
      var elEdge;
      if (isEgo) {
        elEdge = document.createElementNS(NS, 'path');
        elEdge.setAttribute('d', egoEdgePath(a.x, a.y, b.x, b.y));
      } else {
        elEdge = document.createElementNS(NS, 'line');
        elEdge.setAttribute('x1', a.x);
        elEdge.setAttribute('y1', a.y);
        elEdge.setAttribute('x2', b.x);
        elEdge.setAttribute('y2', b.y);
      }
      var sw = Math.min(2.8, 0.75 + (t.strength || 1) * 0.45);
      if (state.view === 'neighborhood') sw = Math.min(2.6, 0.95 + (t.strength || 1) * 0.5);
      elEdge.setAttribute('stroke-width', sw);
      elEdge.setAttribute('class', 'edge');
      if (isHot) {
        elEdge.classList.add('hot');
        if (t.claim_level === 'FACT') elEdge.classList.add('fact-hot');
      } else if (egoDim) elEdge.classList.add('dim');
      if (t.claim_level === 'REPORTING') elEdge.setAttribute('stroke-dasharray', '4 3');
      svg.appendChild(elEdge);
      t._el = elEdge;
    });

    vis.forEach(function (n) {
      if (n.x < -500) return;
      var g = document.createElementNS(NS, 'g');
      var ncls = 'node' + (state.sel === n.id ? ' sel' : '');
      if (state.view === 'neighborhood' && state.sel === n.id) ncls += ' hub';
      if (egoDim && !egoDim[n.id]) ncls += ' dim';
      g.setAttribute('class', ncls);
      g.setAttribute('aria-label', n.label);
      var r = nodeRadius(n);
      if (state.view === 'neighborhood' && state.sel === n.id) r = Math.max(r, 13);
      if (state.view === 'neighborhood' && state.sel === n.id) {
        var halo = document.createElementNS(NS, 'circle');
        halo.setAttribute('class', 'hub-halo');
        halo.setAttribute('cx', n.x);
        halo.setAttribute('cy', n.y);
        halo.setAttribute('r', r + 7);
        g.appendChild(halo);
      }
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', n.x);
      c.setAttribute('cy', n.y);
      c.setAttribute('r', r);
      c.setAttribute('fill', nodeColor(n));
      var tip = document.createElementNS(NS, 'title');
      tip.textContent =
        n.label +
        (n.subtitle ? ' — ' + n.subtitle : '') +
        ' · ' +
        (deg[n.id] || 0) +
        ' edges';
      g.appendChild(tip);
      g.appendChild(c);
      var showLabel =
        state.view === 'neighborhood' ||
        state.sel === n.id ||
        vis.length < 40 ||
        (deg[n.id] || 0) >= 4 ||
        n.claim_level === 'FACT';
      if (showLabel) {
        var tx = document.createElementNS(NS, 'text');
        var maxLen = state.view === 'neighborhood' ? 24 : 16;
        var lab =
          n.label.length > maxLen ? n.label.slice(0, maxLen - 1) + '…' : n.label;
        if (state.view === 'neighborhood' && state.sel !== n.id && n._labelSide) {
          /* Side labels reduce radial pile-up on the ring */
          var side = n._labelSide;
          tx.setAttribute('x', n.x + side * (r + 9));
          tx.setAttribute('y', n.y + 3.5);
          tx.setAttribute('text-anchor', side > 0 ? 'start' : 'end');
        } else {
          tx.setAttribute('x', n.x);
          tx.setAttribute('y', n.y - r - 9);
          tx.setAttribute('text-anchor', 'middle');
        }
        tx.textContent = lab;
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
    if (state.view === 'neighborhood') applyLayout();
    draw();
    buildHubs();
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
    var degLine = 'Documented edges: ' + cons.length;
    if (state.view === 'neighborhood' && typeof state._neighTotal === 'number') {
      var onBoard = typeof state._neighDrawn === 'number' ? state._neighDrawn : 0;
      if (state._neighTotal > onBoard) {
        degLine +=
          ' · board shows top ' + onBoard + ' of ' + state._neighTotal + ' neighbors';
      }
    }
    detail.appendChild(el('div', 'degree', degLine));

    if (cons.length) {
      var box = el('div', 'cons');
      box.appendChild(el('h4', null, 'Connections (' + cons.length + ')'));
      var limit = 18;

      function renderCons(all) {
        while (box.childNodes.length > 1) box.removeChild(box.lastChild);
        var list = all ? cons : cons.slice(0, limit);
        list.forEach(function (t) {
          var otherId = t.from === n.id ? t.to : t.from;
          var other = state.byId[otherId];
          var row = el('div', 'con-row');
          if (other) {
            var btn = el('button', 'con-link', other.label || otherId);
            btn.type = 'button';
            btn.addEventListener('click', function (ev) {
              ev.preventDefault();
              select(other);
            });
            row.appendChild(btn);
          } else {
            row.appendChild(el('b', null, otherId || '?'));
          }
          row.appendChild(document.createTextNode(' — ' + (t.label || 'link')));
          if (t.claim_level && t.claim_level !== 'BOARD_INDEX') {
            row.appendChild(document.createTextNode(' · ' + t.claim_level));
          }
          if (t.source) {
            row.appendChild(document.createTextNode(' · '));
            var src = el('a', 'con-src', 'source');
            src.href = t.source;
            src.target = '_blank';
            src.rel = 'noopener noreferrer';
            row.appendChild(src);
          }
          box.appendChild(row);
        });
        if (!all && cons.length > limit) {
          var more = el('button', 'con-more', 'Show all (' + cons.length + ')');
          more.type = 'button';
          more.addEventListener('click', function () {
            renderCons(true);
          });
          box.appendChild(more);
        }
      }
      renderCons(false);
      detail.appendChild(box);
    }
    if (n.link) {
      var a = el('a', 'open', 'Open the file →');
      a.href = n.link;
      detail.appendChild(a);
    }
    try {
      if (detail && detail.scrollIntoView) {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        detail.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
    } catch (err) { /* ignore */ }
  }

  function buildChips() {
    while (chipsEl.firstChild) chipsEl.removeChild(chipsEl.firstChild);
    var labelCounts = Object.create(null);
    var labelColor = Object.create(null);

    state.nodes.forEach(function (n) {
      var seenLabels = Object.create(null);
      (n.categories || []).forEach(function (c) {
        if (CAT[c]) {
          var lbl = CAT[c].label || c;
          if (!seenLabels[lbl]) {
            labelCounts[lbl] = (labelCounts[lbl] || 0) + 1;
            seenLabels[lbl] = true;
            labelColor[lbl] = CAT[c].color;
          }
        }
      });
    });

    function addChip(lbl, color, text, active) {
      var b = el('button', 'chip' + (active ? ' on' : ''), text);
      b.type = 'button';
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (color) b.style.borderColor = color;
      b.addEventListener('click', function () {
        state.filter = lbl;
        state.sel = null;
        applyLayout();
        buildChips();
        buildHubs();
        buildList();
        draw();
        updateStats();
        /* auto-pick top hub after filter in neighborhood mode */
        if (state.view === 'neighborhood') {
          var hub = topHubId(visibleNodes());
          if (hub && state.byId[hub]) select(state.byId[hub]);
        }
      });
      chipsEl.appendChild(b);
    }
    addChip(null, null, 'All', !state.filter);
    Object.keys(labelCounts).sort().forEach(function (lbl) {
      addChip(lbl, labelColor[lbl], lbl + ' · ' + labelCounts[lbl], state.filter === lbl);
    });
  }

  function buildHubs() {
    if (!hubsEl) return;
    while (hubsEl.firstChild) hubsEl.removeChild(hubsEl.firstChild);
    var deg = degreeMap();
    var ranked = visibleNodes().slice().sort(function (a, b) {
      return (deg[b.id] || 0) - (deg[a.id] || 0);
    });
    var top = ranked.slice(0, 12);
    if (!top.length) return;
    var lab = el('span', 'hubs-lab', 'Most cited');
    hubsEl.appendChild(lab);
    top.forEach(function (n, i) {
      var b = el(
        'button',
        'hub-chip' + (state.sel === n.id ? ' on' : ''),
        (n.label.length > 32 ? n.label.slice(0, 30) + '…' : n.label) +
          ' · ' + (deg[n.id] || 0)
      );
      b.type = 'button';
      b.title = (n.label || n.id) + ' — ' + (deg[n.id] || 0) + ' documented edges';
      b.addEventListener('click', function () {
        if (state.view !== 'neighborhood') setViewMode('neighborhood', true);
        select(n);
      });
      hubsEl.appendChild(b);
    });
  }

  function setViewMode(mode, skipLayout) {
    if (mode !== 'neighborhood' && mode !== 'clusters' && mode !== 'force') mode = 'neighborhood';
    state.view = mode;
    ['neighborhood', 'clusters', 'force'].forEach(function (k) {
      var btn = document.getElementById('view-' + k);
      if (!btn) return;
      btn.classList.toggle('on', mode === k);
      btn.setAttribute('aria-pressed', mode === k ? 'true' : 'false');
    });
    if (!skipLayout) {
      if (mode === 'neighborhood' && !state.sel) {
        var hub = topHubId(visibleNodes());
        if (hub) state.sel = hub;
      }
      applyLayout();
      draw();
      buildHubs();
      updateStats();
      if (mode === 'neighborhood' && state.sel && state.byId[state.sel]) {
        select(state.byId[state.sel]);
      }
    }
  }

  function buildList() {
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    var deg = degreeMap();
    visibleNodes().slice().sort(function (a, b) {
      var da = deg[a.id] || 0;
      var db = deg[b.id] || 0;
      if (db !== da) return db - da;
      return (a.label || '').localeCompare(b.label || '');
    }).forEach(function (n) {
      var li = el('li');
      var lab = el('button', 'list-label', n.label || n.id);
      lab.type = 'button';
      lab.addEventListener('click', function () {
        if (state.view !== 'neighborhood') setViewMode('neighborhood', true);
        select(n);
      });
      li.appendChild(lab);
      var sub = (deg[n.id] || 0) + ' edges';
      if (n.subtitle) sub += ' · ' + n.subtitle;
      li.appendChild(el('span', null, sub));
      if (n.link) {
        var a = el('a', 'list-open', 'Open file');
        a.href = n.link;
        li.appendChild(a);
      }
      listEl.appendChild(li);
    });
  }

  function updateStats() {
    var m = state.meta || {};
    var vis = visibleNodes().length;
    var drawn = drawNodesForView(visibleNodes()).length;
    var viewLab =
      state.view === 'neighborhood' ? 'neighborhood' :
      state.view === 'clusters' ? 'clusters' : 'force';
    var html =
      '<b>' + state.nodes.length + '</b> entities · <b>' + state.edges.length + '</b> edges' +
      ' · view <b>' + viewLab + '</b>' +
      (state.view === 'neighborhood'
        ? ' · drawing <b>' + drawn + '</b> (hub + neighbors)'
        : (vis !== state.nodes.length ? ' · showing <b>' + vis + '</b>' : '')) +
      (m.updated ? ' · updated ' + String(m.updated).slice(0, 16) : '') +
      (m.sources ? ' · ' + String(m.sources).split(',').length + ' sources' : '');
    if (m.raw_nodes || m.capped) {
      var rawN = typeof m.raw_nodes === 'number' ? m.raw_nodes : null;
      html += ' · <span class="capped-note">board capped' +
        (rawN != null && rawN !== state.nodes.length ? ' from ' + rawN + ' raw nodes' : '') +
        '</span>';
    }
    if (m.claim_counts && typeof m.claim_counts === 'object') {
      var parts = [];
      Object.keys(m.claim_counts).forEach(function (k) {
        parts.push(k + ' ' + m.claim_counts[k]);
      });
      if (parts.length) html += ' · claims: ' + parts.join(', ');
    }
    html += ' · Export uses current filter';
    statsEl.innerHTML = html;
  }

  var BOARD_IDS = { osint: 1, influence: 1, defence: 1 };

  function parseBoardDeepLink() {
    var hash = (location.hash || '').replace(/^#/, '').toLowerCase();
    hash = hash.split(/[?&/]/)[0];
    if (BOARD_IDS[hash]) return hash;
    try {
      var params = new URLSearchParams(location.search || '');
      var board = (params.get('board') || '').toLowerCase().trim();
      if (BOARD_IDS[board]) return board;
    } catch (e) { /* ignore */ }
    return null;
  }

  function setBoardDeepLink(name) {
    if (!BOARD_IDS[name]) return;
    var nextHash = '#' + name;
    if ((location.hash || '') === nextHash) return;
    try {
      var url = location.pathname + (location.search || '') + nextHash;
      if (history.replaceState) history.replaceState(null, '', url);
      else location.hash = name;
    } catch (e) {
      try { location.hash = name; } catch (e2) { /* ignore */ }
    }
  }

  function activateBoard(name, opts) {
    if (!BOARD_IDS[name]) name = 'osint';
    opts = opts || {};
    state.board = name;
    var pack = boards[name] || { nodes: [], edges: [], meta: {} };
    state.nodes = pack.nodes || [];
    state.edges = pack.edges || [];
    state.meta = pack.meta || {};
    state.byId = Object.create(null);
    state.nodes.forEach(function (n) { state.byId[n.id] = n; });
    state.filter = null;
    state.sel = null;
    state.query = '';
    state.loaded = true;
    if (searchEl) searchEl.value = '';
    recomputeDegree();
    /* Dense OSINT/influence → neighborhood; small defence → clusters */
    if (name === 'defence' && state.nodes.length <= 40) {
      state.view = 'clusters';
    } else {
      state.view = 'neighborhood';
    }
    setViewMode(state.view, true);
    var hub = topHubId(state.nodes);
    if (hub) state.sel = hub;
    applyLayout();
    buildChips();
    buildHubs();
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
        'Defence instruments from public freezes: contracts, suppliers, and partner paths. A preferred supplier is not a multi-hull production award.';
    } else if (name === 'osint') {
      standEl.textContent =
        'Start with one well-cited entity. Neighbors are documented links only — not a verdict. Open the case file for sources.';
    } else {
      standEl.textContent =
        'Foreign-influence board: people, organizations, and filings from the public record. One hub and its documented edges at a time.';
    }
    standDefault = standEl.textContent || '';
    if (standTimer) {
      clearTimeout(standTimer);
      standTimer = null;
    }
    if (hub && state.byId[hub]) {
      select(state.byId[hub]);
    } else {
      while (detail.firstChild) detail.removeChild(detail.firstChild);
      detail.appendChild(el('span', 'kick', 'Inspector'));
      detail.appendChild(el('h3', null, 'Select a hub'));
      detail.appendChild(el('p', null, 'Edges are documented interactions. Open the case file for full citations.'));
    }
    if (opts.syncUrl !== false) setBoardDeepLink(name);
  }

  var tabOsint = document.getElementById('tab-osint');
  var tabInf = document.getElementById('tab-influence');
  var tabDef = document.getElementById('tab-defence');
  if (tabOsint) tabOsint.addEventListener('click', function () { activateBoard('osint'); });
  if (tabInf) tabInf.addEventListener('click', function () { activateBoard('influence'); });
  if (tabDef) tabDef.addEventListener('click', function () { activateBoard('defence'); });
  ['neighborhood', 'clusters', 'force'].forEach(function (k) {
    var vb = document.getElementById('view-' + k);
    if (vb) {
      vb.addEventListener('click', function () {
        setViewMode(k);
      });
    }
  });
  var searchTimer = null;
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      state.query = (searchEl.value || '').trim().toLowerCase();
      state.sel = null;
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        searchTimer = null;
        applyLayout();
        buildHubs();
        buildList();
        draw();
        updateStats();
        if (state.view === 'neighborhood') {
          var hub = topHubId(visibleNodes());
          if (hub && state.byId[hub]) select(state.byId[hub]);
        }
      }, 120);
    });
  }
  svg.addEventListener('click', function () {
    /* Keep hub selection in neighborhood mode — empty click does not wipe the map. */
    if (state.view === 'neighborhood') return;
    state.sel = null;
    applyLayout();
    draw();
    buildHubs();
    while (detail.firstChild) detail.removeChild(detail.firstChild);
    detail.appendChild(el('span', 'kick', 'Inspector'));
    detail.appendChild(el('h3', null, 'Select a hub'));
    detail.appendChild(el('p', null, 'Edges are documented interactions. Open the case file for full citations.'));
  });

  var btnJson = document.getElementById('btn-export-json');
  var btnMermaid = document.getElementById('btn-export-mermaid');
  if (btnJson) {
    btnJson.addEventListener('click', function () {
      var pack = exportVisibleGraph();
      downloadJson('network-visible.json', pack);
      setStandNote(
        'Exported ' + pack.meta.node_count + ' entities and ' +
        pack.meta.edge_count + ' edges (visible slice).'
      );
    });
  }
  if (btnMermaid) {
    btnMermaid.addEventListener('click', function () {
      var pack = exportVisibleGraph();
      var mer = toMermaid(pack);
      if (!mer.ok) {
        downloadJson('network-visible.json', pack);
        setStandNote(mer.reason || 'Too dense for Mermaid — exported JSON only');
        return;
      }
      copyText(mer.text).then(function () {
        setStandNote(
          'Mermaid flowchart copied (' + pack.meta.node_count +
          ' nodes). Paste into any Mermaid renderer.'
        );
      }).catch(function () {
        downloadJson('network-visible.json', pack);
        setStandNote('Clipboard blocked — downloaded network-visible.json instead.');
      });
    });
  }

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

  function softFetch(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).catch(function () { return null; });
  }

  Promise.all([
    softFetch('data/investigation_board.json'),
    softFetch('data/analysis/defence_cluster_network.json'),
    softFetch('data/network_osint_board.json')
  ]).then(function (triple) {
    var influenceRaw = triple[0];
    var defenceRaw = triple[1];
    var osintRaw = triple[2];

    boards.defence = normalizeDefence(defenceRaw || DEFENCE_FALLBACK);
    boards.influence = influenceRaw
      ? normalizeInfluence(influenceRaw)
      : { nodes: [], edges: [], meta: {} };
    boards.osint = osintRaw
      ? normalizeInfluence(osintRaw)
      : { nodes: [], edges: [], meta: {} };
    if (osintRaw && osintRaw.meta) boards.osint.meta = osintRaw.meta;

    /* Prefer a board that actually has nodes; never let one 404 wipe the rest. */
    var preferred = 'defence';
    if (boards.osint.nodes.length) preferred = 'osint';
    else if (boards.influence.nodes.length) preferred = 'influence';
    else if (boards.defence.nodes.length) preferred = 'defence';
    else {
      boards.defence = normalizeDefence(DEFENCE_FALLBACK);
      preferred = 'defence';
    }

    /* Fill empty boards from the strongest available pack so tabs still work. */
    var fallbackPack = boards[preferred];
    if (!boards.osint.nodes.length) boards.osint = fallbackPack;
    if (!boards.influence.nodes.length) boards.influence = fallbackPack;

    /* Deep-link wins after packs settle: #defence / #osint / #influence or ?board= */
    var deep = parseBoardDeepLink();
    if (deep) preferred = deep;

    activateBoard(preferred);
    /* After activate: honour #defence / loaded defence pack if deep-link or sole board. */
    if (deep === 'defence' && boards.defence.nodes.length && state.board !== 'defence') {
      activateBoard('defence');
    }
    if (!osintRaw && !influenceRaw) {
      standEl.textContent =
        'Primary boards could not load. Showing the defence-instruments network from local freezes.';
    }
  }).catch(function () {
    boards.defence = normalizeDefence(DEFENCE_FALLBACK);
    boards.influence = boards.defence;
    boards.osint = boards.defence;
    var deepFail = parseBoardDeepLink();
    activateBoard(deepFail || 'defence');
    if (deepFail === 'defence' && state.board !== 'defence') activateBoard('defence');
    standEl.textContent =
      'Primary boards could not load. Showing the defence-instruments network from local freezes.';
    statsEl.textContent = 'Fallback board · defence instruments only · Export uses current filter';
  });

  window.addEventListener('hashchange', function () {
    var h = parseBoardDeepLink();
    if (h && h !== state.board && boards[h] && boards[h].nodes && boards[h].nodes.length) {
      activateBoard(h);
    }
  });

  /* Initial empty-state while fetches settle */
  if (emptyEl) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'Loading board…';
  }
})();
