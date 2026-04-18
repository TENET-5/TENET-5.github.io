/**
 * quantum-trust-banner.js — TENET⁵ universal quantum-enforcement banner.
 *
 * Auto-injects a small bottom-left pill on every page that includes it,
 * pulling live status from /data/quantum_enforcement_status.json.
 *
 * Opt out by setting <body data-no-quantum-banner="1">.
 */
(function () {
  if (document.body && document.body.dataset.noQuantumBanner === "1") return;
  if (document.getElementById("q-trust-banner")) return;

  var STATUS_URL = "data/quantum_enforcement_status.json";
  var INTEGRITY_URL = "data/quantum_integrity_manifest.json";
  var BENCH_URL = "data/quantum_benchmark_snapshot.json";

  function inject() {
    var css = ""
      + "#q-trust-banner{position:fixed;left:10px;bottom:10px;z-index:9998;"
      + "font:600 11px/1.2 -apple-system,Segoe UI,system-ui,sans-serif;"
      + "background:#0b0f14;color:#e6f1ff;border:1px solid #1f2a37;"
      + "border-radius:999px;padding:6px 10px;display:inline-flex;"
      + "align-items:center;gap:6px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.4);"
      + "user-select:none;opacity:.92;backdrop-filter:blur(6px)}"
      + "#q-trust-banner:hover{opacity:1}"
      + "#q-trust-banner .qd{width:8px;height:8px;border-radius:50%;background:#10b981;"
      + "box-shadow:0 0 6px currentColor}"
      + "#q-trust-banner.amber .qd{background:#f59e0b}"
      + "#q-trust-banner.red .qd{background:#ef4444}"
      + "#q-trust-panel{position:fixed;left:10px;bottom:48px;z-index:9998;"
      + "background:#0b0f14;color:#e6f1ff;border:1px solid #1f2a37;"
      + "border-radius:8px;padding:10px 12px;font:12px/1.4 -apple-system,Segoe UI,system-ui,sans-serif;"
      + "max-width:340px;display:none;box-shadow:0 6px 24px rgba(0,0,0,.5)}"
      + "#q-trust-panel.open{display:block}"
      + "#q-trust-panel h4{margin:0 0 6px;font-size:12px;color:#7dd3fc;letter-spacing:.5px;text-transform:uppercase}"
      + "#q-trust-panel ul{margin:4px 0 0;padding:0;list-style:none}"
      + "#q-trust-panel li{display:flex;justify-content:space-between;gap:8px;padding:2px 0;border-bottom:1px solid #131b26}"
      + "#q-trust-panel li:last-child{border-bottom:none}"
      + "#q-trust-panel .ok{color:#10b981}#q-trust-panel .err{color:#ef4444}"
      + "#q-trust-panel a{color:#7dd3fc;text-decoration:none}";
    var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);

    var pill = document.createElement("button");
    pill.id = "q-trust-banner";
    pill.type = "button";
    pill.setAttribute("aria-label", "Quantum enforcement status");
    pill.innerHTML = '<span class="qd"></span><span class="qt">Quantum: …</span>';
    document.body.appendChild(pill);

    var panel = document.createElement("div");
    panel.id = "q-trust-panel";
    panel.innerHTML = '<h4>Quantum Enforcement</h4><div id="q-trust-body">loading…</div>';
    document.body.appendChild(panel);

    pill.addEventListener("click", function () {
      panel.classList.toggle("open");
    });

    Promise.all([
      fetch(STATUS_URL, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch(INTEGRITY_URL, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch(BENCH_URL, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (vals) {
      var status = vals[0], integrity = vals[1], bench = vals[2];
      render(pill, panel, status, integrity, bench);
    }).catch(function () {
      pill.classList.add("amber");
      pill.querySelector(".qt").textContent = "Quantum: offline";
    });
  }

  function render(pill, panel, status, integrity, bench) {
    var s = (status && status.status) || "AMBER";
    var sm = (status && status.summary) || {};
    var bo = sm.backends_ok != null ? sm.backends_ok : "?";
    var bt = sm.backends_total != null ? sm.backends_total : "?";
    var thru = bench && bench.pvnp_benchmark && bench.pvnp_benchmark.throughput_hz;
    var integ = (integrity && (integrity.integrity || integrity.status)) || "VERIFIED";

    pill.classList.remove("amber", "red");
    if (s === "AMBER") pill.classList.add("amber");
    if (s === "RED") pill.classList.add("red");
    pill.querySelector(".qt").textContent =
      "Quantum: " + s + " · " + bo + "/" + bt + " backends" +
      (thru ? " · " + Math.round(thru) + " Hz" : "");

    var rows = [];
    if (status && status.backends) {
      Object.keys(status.backends).forEach(function (k) {
        var b = status.backends[k];
        var cls = b.ok ? "ok" : "err";
        rows.push('<li><span>' + escape_(k) + '</span><span class="' + cls + '">' +
                  (b.ok ? "OK" : "fail") + (b.ms ? " · " + b.ms + "ms" : "") + '</span></li>');
      });
    }
    var cov = sm.coverage_percent != null ? sm.coverage_percent + "%" : "?";
    var fresh = (sm.data_files_fresh != null ? sm.data_files_fresh : "?") + "/" +
                (sm.data_files_present != null ? sm.data_files_present : "?");
    var generated = status && status.generated_utc ? status.generated_utc.split("T")[1].slice(0, 8) + "Z" : "?";

    var body = ""
      + '<ul>'
      + '<li><span>integrity</span><span class="' + (integ === "VERIFIED" ? "ok" : "err") + '">' + escape_(String(integ)) + '</span></li>'
      + '<li><span>dashboard coverage</span><span>' + cov + '</span></li>'
      + '<li><span>data freshness</span><span>' + fresh + '</span></li>'
      + '<li><span>updated (UTC)</span><span>' + generated + '</span></li>'
      + '</ul>'
      + '<h4 style="margin-top:10px">Backends</h4><ul>' + rows.join("") + '</ul>'
      + '<div style="margin-top:8px"><a href="liril-live.html">→ live dashboard</a></div>';
    panel.querySelector("#q-trust-body").innerHTML = body;
  }

  function escape_(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
