/**
 * TENET5 infosec network map — hardened for file:// and live
 * Embed: window.TENET5_INFOSEC_NETWORK or #net-data JSON
 */
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function status(msg, isErr) {
    var el = $("map-status");
    if (!el) return;
    el.textContent = msg;
    el.style.color = isErr ? "#e6b35a" : "#8fd3a0";
  }

  function showError(err) {
    var b = $("map-error");
    if (b) {
      b.style.display = "block";
      b.textContent = "BOARD ERROR: " + (err && err.message ? err.message : String(err));
    }
    status("BOARD ERROR — see banner", true);
    console.error(err);
  }

  var CAT_COL = {
    infosec_reporter: "#8fd3a0",
    method_org: "#5dade2",
    contractor_history: "#7f8c8d",
    document_source: "#a29bfe",
    diagolon_orbit: "#e74c3c",
    public_order: "#f1c40f",
    institution: "#74b9ff",
    coutts_accused: "#e67e22",
    press: "#55efc4",
    monitor_org: "#fd79a8",
    federal_politics: "#74b9ff",
    infosec_history: "#636e72",
    independent_media: "#fab1a0",
    platform: "#b2bec3"
  };

  function catColor(c) {
    return CAT_COL[c] || "#95a5a6";
  }

  function edgeColor(t) {
    t = t || "";
    if (/diagolon|founded_associated|public_adjacency|charged/i.test(t)) return "rgba(231,76,60,0.75)";
    if (/collab|identity|org_affiliation|founded$/i.test(t)) return "rgba(46,204,113,0.7)";
    if (/coverage|critique|guest/i.test(t)) return "rgba(241,196,15,0.55)";
    if (/distribution|platform/i.test(t)) return "rgba(162,155,254,0.55)";
    if (/political|party|candidacy/i.test(t)) return "rgba(116,185,255,0.7)";
    if (/discourse|method_bridge/i.test(t)) return "rgba(155,89,182,0.4)";
    if (/commission|reviewed|investigated/i.test(t)) return "rgba(93,173,226,0.7)";
    return "rgba(160,180,200,0.35)";
  }

  function loadData() {
    if (window.TENET5_INFOSEC_NETWORK && window.TENET5_INFOSEC_NETWORK.nodes) {
      return window.TENET5_INFOSEC_NETWORK;
    }
    var el = $("net-data");
    if (el && el.textContent) {
      return JSON.parse(el.textContent);
    }
    throw new Error("No network data (embed missing)");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSources(DATA) {
    var el = $("source-list");
    if (!el) return;
    el.innerHTML = (DATA.sources || [])
      .map(function (s) {
        return (
          "<li><a href=\"" +
          escapeHtml(s.url) +
          "\" rel=\"noopener noreferrer\" target=\"_blank\">" +
          escapeHtml(s.label) +
          "</a> <span class=\"muted\">· " +
          escapeHtml(s.kind) +
          "</span></li>"
        );
      })
      .join("");
  }

  function renderFindings(DATA) {
    var el = $("findings");
    if (!el) return;
    el.innerHTML = (DATA.findings || [])
      .map(function (f) {
        var badge = f.status === "INFERRED" ? "inferred" : "stated";
        return (
          '<article class="find-card glass">' +
          '<div class="find-head"><span class="chip ' +
          badge +
          '">' +
          escapeHtml(f.status) +
          "</span> <strong>" +
          escapeHtml(f.title) +
          "</strong></div><p>" +
          escapeHtml(f.body) +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderPrompts(DATA) {
    var el = $("analysis-prompts");
    if (!el) return;
    el.innerHTML = (DATA.analysis_prompts || [])
      .map(function (p) {
        return "<li>" + escapeHtml(p) + "</li>";
      })
      .join("");
  }

  function bootMap(DATA) {
    var canvas = $("net-canvas");
    if (!canvas) throw new Error("canvas #net-canvas missing");
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    var wrap = canvas.parentElement;
    if (!wrap) throw new Error("canvas parent missing");

    var rawNodes = DATA.nodes || [];
    var rawEdges = DATA.edges || [];
    if (!rawNodes.length) throw new Error("zero nodes in data");

    var nodes = rawNodes.map(function (n, i) {
      var ang = (i / Math.max(1, rawNodes.length)) * Math.PI * 2;
      var r = 80 + (n.score || 40) * 0.9 + (i % 7) * 12;
      return {
        id: n.id,
        label: n.label || n.id,
        category: n.category || "?",
        note: n.note || "",
        score: +n.score || 0,
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        vx: 0,
        vy: 0
      };
    });

    var nmap = {};
    nodes.forEach(function (n) {
      nmap[n.id] = n;
    });

    var links = rawEdges
      .map(function (e) {
        return {
          a: nmap[e.source],
          b: nmap[e.target],
          type: e.type || "default",
          weight: +e.weight || 1,
          note: e.note || ""
        };
      })
      .filter(function (e) {
        return e.a && e.b;
      });

    var state = {
      W: 0,
      H: 0,
      scale: 1,
      ox: 0,
      oy: 0,
      alpha: 1,
      drag: null,
      pan: false,
      lx: 0,
      ly: 0,
      selected: null,
      filter: "all"
    };

    var vivaSet = null;
    var packASet = null;
    if (DATA.subgraphs && DATA.subgraphs.thevivafrei && DATA.subgraphs.thevivafrei.include_node_ids) {
      vivaSet = {};
      DATA.subgraphs.thevivafrei.include_node_ids.forEach(function (id) {
        vivaSet[id] = 1;
      });
    }
    if (DATA.subgraphs && DATA.subgraphs.diagolon_coutts && DATA.subgraphs.diagolon_coutts.include_node_ids) {
      packASet = {};
      DATA.subgraphs.diagolon_coutts.include_node_ids.forEach(function (id) {
        packASet[id] = 1;
      });
    }

    function visible(n) {
      if (state.filter === "all") return true;
      if (state.filter === "canada")
        return /diagolon|public_order|coutts|institution|federal|press|monitor|independent_media|platform/i.test(
          n.category
        );
      if (state.filter === "method")
        return /infosec|method|contractor|document|history/i.test(n.category);
      if (state.filter === "diagolon") {
        // Pack A: prefer explicit subgraph; else category heuristic
        if (packASet) return !!packASet[n.id];
        return /diagolon|coutts|public_order|institution|press|federal/i.test(n.category);
      }
      if (state.filter === "viva") {
        if (vivaSet) return !!vivaSet[n.id];
        return n.id === "thevivafrei" || n.id === "david_freiheit";
      }
      return true;
    }

    function resize() {
      var b = wrap.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      // Force usable size even if CSS collapsed
      state.W = Math.max(320, b.width || wrap.clientWidth || 800);
      state.H = Math.max(420, b.height || wrap.clientHeight || 520);
      canvas.width = Math.floor(state.W * dpr);
      canvas.height = Math.floor(state.H * dpr);
      canvas.style.width = state.W + "px";
      canvas.style.height = state.H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function sim() {
      var N = nodes.length;
      var a = state.alpha;
      if (!N || a < 0.01) return;
      // scale repulsion with graph size so ~90–120 node boards stay readable
      var rep = (2200 + Math.min(1800, N * 18)) * a;
      var soft = N > 80 ? 48 : 40;
      var i, j, e, n, dx, dy, d2, d, f, dist, ideal, ks, force;

      for (i = 0; i < N; i++) {
        if (!visible(nodes[i])) continue;
        for (j = i + 1; j < N; j++) {
          if (!visible(nodes[j])) continue;
          dx = nodes[j].x - nodes[i].x;
          dy = nodes[j].y - nodes[i].y;
          d2 = dx * dx + dy * dy;
          if (d2 < 1) d2 = 1;
          d = Math.sqrt(d2);
          if (d > 480) continue;
          if (d < soft) {
            dx = dx / d || 0.01;
            dy = dy / d || 0.01;
            d = soft;
            d2 = soft * soft;
          } else {
            dx /= d;
            dy /= d;
          }
          f = Math.min(10, rep / d2);
          nodes[i].vx -= f * dx;
          nodes[i].vy -= f * dy;
          nodes[j].vx += f * dx;
          nodes[j].vy += f * dy;
        }
      }

      for (i = 0; i < links.length; i++) {
        e = links[i];
        if (!visible(e.a) || !visible(e.b)) continue;
        dx = e.b.x - e.a.x;
        dy = e.b.y - e.a.y;
        dist = Math.sqrt(dx * dx + dy * dy) || 1;
        ideal = /method_bridge|discourse/i.test(e.type) ? 180 : 70 + (10 - Math.min(10, e.weight)) * 6;
        ks = /method_bridge|discourse/i.test(e.type) ? 0.003 : 0.01 + e.weight * 0.0008;
        force = (dist - ideal) * ks * a;
        if (force > 2) force = 2;
        if (force < -2) force = -2;
        dx /= dist;
        dy /= dist;
        e.a.vx += force * dx;
        e.a.vy += force * dy;
        e.b.vx -= force * dx;
        e.b.vy -= force * dy;
      }

      for (i = 0; i < N; i++) {
        n = nodes[i];
        if (!visible(n)) continue;
        n.vx += (0 - n.x) * 0.001 * a;
        n.vy += (0 - n.y) * 0.001 * a;
        n.vx *= 0.86;
        n.vy *= 0.86;
        if (n !== state.drag) {
          n.x += n.vx;
          n.y += n.vy;
        }
      }
      if (state.alpha > 0.02) state.alpha *= 0.992;
    }

    function draw() {
      var W = state.W;
      var H = state.H;
      var s = state.scale;
      if (W < 10 || H < 10) return;
      ctx.clearRect(0, 0, W, H);

      // subtle grid so user sees canvas is alive
      ctx.save();
      ctx.strokeStyle = "rgba(154,219,232,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 + state.ox, H / 2 + state.oy);
      ctx.scale(s, s);

      var sel = state.selected;
      var neigh = {};
      if (sel) {
        neigh[sel.id] = 1;
        for (var li = 0; li < links.length; li++) {
          var le = links[li];
          if (le.a.id === sel.id) neigh[le.b.id] = 1;
          if (le.b.id === sel.id) neigh[le.a.id] = 1;
        }
      }

      for (var i = 0; i < links.length; i++) {
        var e = links[i];
        if (!visible(e.a) || !visible(e.b)) continue;
        var isSel = sel && (e.a.id === sel.id || e.b.id === sel.id);
        if (sel && !isSel) {
          ctx.strokeStyle = "rgba(80,100,120,0.08)";
          ctx.lineWidth = 0.5 / s;
        } else {
          ctx.strokeStyle = edgeColor(e.type);
          ctx.lineWidth = (isSel ? 1.8 : 0.6 + e.weight * 0.06) / s;
        }
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.stroke();
      }

      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (!visible(n)) continue;
        var r = 5 + Math.min(12, (n.score || 30) / 14);
        var dim = sel && !neigh[n.id];
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dim ? "rgba(60,75,90,0.28)" : catColor(n.category);
        ctx.fill();
        if (sel && n.id === sel.id) {
          ctx.strokeStyle = "#eef5fa";
          ctx.lineWidth = 2 / s;
          ctx.stroke();
        }
        if (!dim && (s > 0.45 || (n.score || 0) > 65 || (sel && neigh[n.id]))) {
          ctx.fillStyle = "#eef5fa";
          ctx.font = Math.max(9, 11 / s) + "px Segoe UI, system-ui, sans-serif";
          ctx.fillText(String(n.label).slice(0, 42), n.x + r + 4, n.y + 3);
        }
      }
      ctx.restore();
    }

    function fit() {
      var minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity,
        any = false;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!visible(n)) continue;
        any = true;
        if (n.x < minX) minX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.x > maxX) maxX = n.x;
        if (n.y > maxY) maxY = n.y;
      }
      if (!any) {
        state.scale = 1;
        state.ox = 0;
        state.oy = 0;
        return;
      }
      var bw = Math.max(200, maxX - minX + 100);
      var bh = Math.max(200, maxY - minY + 100);
      var side = Math.min(state.W, state.H) - 48;
      state.scale = Math.min(1.6, Math.max(0.12, side / Math.max(bw, bh)));
      var cx = (minX + maxX) / 2;
      var cy = (minY + maxY) / 2;
      state.ox = -cx * state.scale;
      state.oy = -cy * state.scale;
    }

    function showSel(n) {
      state.selected = n;
      var box = $("sel-detail");
      if (!box) return;
      if (!n) {
        box.innerHTML =
          '<p class="muted">Click a node — edges light up. Path is not friendship.</p>';
        return;
      }
      var edges = links.filter(function (e) {
        return e.a.id === n.id || e.b.id === n.id;
      });
      var h =
        "<div><strong>" +
        escapeHtml(n.label) +
        '</strong> <span class="chip">' +
        escapeHtml(n.category) +
        "</span></div>";
      h += '<p class="muted">' + escapeHtml(n.note) + "</p>";
      h += '<p class="ok">' + edges.length + " public edges</p><ul class=\"edge-list\">";
      edges.forEach(function (e) {
        var other = e.a.id === n.id ? e.b : e.a;
        h +=
          "<li><b style=\"color:" +
          edgeColor(e.type) +
          "\">●</b> " +
          escapeHtml(other.label) +
          ' <span class="chip">' +
          escapeHtml(e.type) +
          "</span>" +
          (e.note
            ? '<br/><span class="warn" style="font-size:11px">' + escapeHtml(e.note) + "</span>"
            : "") +
          "</li>";
      });
      h += "</ul>";
      box.innerHTML = h;
    }

    function hit(mx, my) {
      var p = {
        x: (mx - state.W / 2 - state.ox) / state.scale,
        y: (my - state.H / 2 - state.oy) / state.scale
      };
      var best = null;
      var bd = 1e9;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!visible(n)) continue;
        var d = Math.hypot(n.x - p.x, n.y - p.y);
        var r = 10 + Math.min(14, (n.score || 30) / 12);
        if (d < r + 8 && d < bd) {
          bd = d;
          best = n;
        }
      }
      return best;
    }

    function renderHubs() {
      var deg = {};
      links.forEach(function (e) {
        if (!visible(e.a) || !visible(e.b)) return;
        deg[e.a.id] = (deg[e.a.id] || 0) + 1;
        deg[e.b.id] = (deg[e.b.id] || 0) + 1;
      });
      var ranked = nodes
        .filter(visible)
        .map(function (n) {
          return { n: n, d: deg[n.id] || 0 };
        })
        .sort(function (a, b) {
          return b.d - a.d || b.n.score - a.n.score;
        })
        .slice(0, 14);
      var el = $("hub-list");
      if (!el) return;
      el.innerHTML = ranked
        .map(function (r, i) {
          return (
            '<div class="hub-row" data-id="' +
            escapeHtml(r.n.id) +
            '"><span>#' +
            (i + 1) +
            " " +
            escapeHtml(r.n.label) +
            '</span><span class="muted">' +
            r.d +
            "e · " +
            escapeHtml(r.n.category) +
            "</span></div>"
          );
        })
        .join("");
      el.querySelectorAll(".hub-row").forEach(function (row) {
        row.onclick = function () {
          var id = row.getAttribute("data-id");
          var n = nmap[id];
          if (!n) return;
          showSel(n);
          state.ox = -n.x * state.scale;
          state.oy = -n.y * state.scale;
        };
      });
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      fit();
    });

    // settle then draw
    state.alpha = 1;
    for (var pre = 0; pre < 100; pre++) sim();
    state.alpha = 0.4;
    fit();
    renderHubs();

    canvas.onmousedown = function (ev) {
      var r = canvas.getBoundingClientRect();
      var mx = ev.clientX - r.left;
      var my = ev.clientY - r.top;
      var n = hit(mx, my);
      if (n) {
        state.drag = n;
        showSel(n);
      } else {
        showSel(null);
        state.pan = true;
        state.lx = mx;
        state.ly = my;
      }
    };
    canvas.onmousemove = function (ev) {
      var r = canvas.getBoundingClientRect();
      var mx = ev.clientX - r.left;
      var my = ev.clientY - r.top;
      if (state.drag) {
        state.drag.x = (mx - state.W / 2 - state.ox) / state.scale;
        state.drag.y = (my - state.H / 2 - state.oy) / state.scale;
        state.drag.vx = 0;
        state.drag.vy = 0;
      } else if (state.pan) {
        state.ox += mx - state.lx;
        state.oy += my - state.ly;
        state.lx = mx;
        state.ly = my;
      }
    };
    canvas.onmouseup = canvas.onmouseleave = function () {
      state.drag = null;
      state.pan = false;
    };
    canvas.onwheel = function (ev) {
      ev.preventDefault();
      state.scale = Math.max(0.1, Math.min(5, state.scale * (ev.deltaY < 0 ? 1.12 : 0.9)));
    };

    document.querySelectorAll("[data-net-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-net-filter]").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        state.filter = btn.getAttribute("data-net-filter") || "all";
        state.alpha = 0.85;
        fit();
        renderHubs();
        if (state.filter === "viva" && nmap.thevivafrei) {
          showSel(nmap.thevivafrei);
          state.ox = -nmap.thevivafrei.x * state.scale;
          state.oy = -nmap.thevivafrei.y * state.scale;
        }
      });
    });

    var fitBtn = $("fit-map");
    if (fitBtn) fitBtn.onclick = function () { fit(); };
    var reheat = $("reheat-map");
    if (reheat)
      reheat.onclick = function () {
        state.alpha = 1;
      };

    if ($("stats-nodes")) $("stats-nodes").textContent = String(nodes.length);
    if ($("stats-edges")) $("stats-edges").textContent = String(links.length);
    if ($("stats-sources")) $("stats-sources").textContent = String((DATA.sources || []).length);

    function loop() {
      try {
        sim();
        draw();
      } catch (err) {
        showError(err);
        return;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    status(
      "BOARD LIVE · " +
        nodes.length +
        "n / " +
        links.length +
        "e · filters: All / Canada / Diagolon / Method / @thevivafrei · drag pan · wheel zoom"
    );
  }

  function main() {
    try {
      var DATA = loadData();
      renderSources(DATA);
      renderFindings(DATA);
      renderPrompts(DATA);
      bootMap(DATA);
      var err = $("map-error");
      if (err) err.style.display = "none";
    } catch (e) {
      showError(e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
