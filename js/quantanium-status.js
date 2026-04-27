/* ═══════════════════════════════════════════════════════════════════════
   quantanium-status.js — live QUANTANIUM substrate widget

   Reads /data/quantanium-status.json (written by the LIRIL daemon on
   each dispatch) and renders the engine + pvnp tier + bench telemetry
   into any <div class="quantanium-status"> element on the page.

   Pages OPT IN by including:
     <div class="quantanium-status"></div>

   The script populates it. If no element is on the page, the script
   does nothing (silent no-op). On fetch failure it leaves the element
   in its static placeholder state — never throws into the page.

   Design contract: see /css/tokens.css §4 QUANTANIUM PIPELINE TOKENS
   and §6 QUANTANIUM STATUS WIDGET. The DOM markup the renderer
   produces matches the contract block in §6.

   Status JSON shape:
     {
       "ts":          1777318...,
       "engine":      "ising_local",
       "pvnp":        "solvable" | "np_exposed" | "loom_break" | "unknown",
       "decode_ms":   12.3,
       "tensor_ms":    4.1,
       "compose_ms":  18.7,
       "throughput":  4.2,        // dispatches/min
       "rev":         "1.0.0-2026-04-27"
     }
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var STATUS_URL = "/data/quantanium-status.json";
  var POLL_MS = 30000; // 30s — site is static, daemon writes every dispatch

  function fmtMs(v) {
    if (v == null || isNaN(v)) return "—";
    if (v >= 100) return Math.round(v) + "ms";
    return (Math.round(v * 10) / 10) + "ms";
  }
  function render(el, s) {
    var engine    = (s && s.engine)    || "ising_local";
    var pvnp      = (s && s.pvnp)      || "unknown";
    var decode_ms = s && s.decode_ms;
    var tensor_ms = s && s.tensor_ms;
    el.dataset.engine = engine;
    el.dataset.pvnp = pvnp;
    el.innerHTML =
      '<span class="quantanium-pulse" aria-hidden="true"></span>'
      + '<span class="quantanium-engine">' + engine + '</span>'
      + '<span class="quantanium-tier">' + pvnp.replace("_", " ") + '</span>'
      + '<span class="quantanium-bench" '
      +   'title="ising_decode / tensor_project">'
      +   fmtMs(decode_ms) + ' / ' + fmtMs(tensor_ms) + '</span>';
    el.setAttribute("aria-label",
      "QUANTANIUM substrate: engine " + engine + ", tier " + pvnp);
  }
  function renderUnknown(el) {
    render(el, { engine: "—", pvnp: "unknown" });
  }
  function poll() {
    var nodes = document.querySelectorAll(".quantanium-status");
    if (!nodes.length) return;
    var url = STATUS_URL + "?_=" + Date.now();
    var p = (typeof fetch === "function")
      ? fetch(url, { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json() : null; })
      : Promise.resolve(null);
    p.then(function (s) {
      nodes.forEach(function (el) {
        if (s) render(el, s);
        else if (!el.dataset.engine) renderUnknown(el);
      });
    }).catch(function () {
      nodes.forEach(function (el) {
        if (!el.dataset.engine) renderUnknown(el);
      });
    });
  }
  function init() {
    poll();
    setInterval(poll, POLL_MS);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
