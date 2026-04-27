/* ═══════════════════════════════════════════════════════════════════════
   sprite-loader.js — auto-inject the QUANTANIUM SVG sprite atlas

   Fetches /img/sprites/quantanium-atlas.svg once on page load and inlines
   it as the first child of <body> with display:none. After this runs,
   any <use href="#sprite-id"> on the page resolves without a path.

   Without inlining, browsers treat <use href="atlas.svg#id"> as a
   cross-document reference which silently fails in some build modes
   and adds a fetch round-trip per icon. Single inline fetch is fastest.

   Cache: served by GitHub Pages with whatever cache-control GitHub
   chooses; sprite atlas changes are versioned via ?v= cache-bust.

   Design contract: see /css/sprites.css.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var ATLAS_URL = "/img/sprites/quantanium-atlas.svg?v=1";
  var INJECTED_ATTR = "data-q-sprites";

  function inject(svgText) {
    if (document.querySelector("[" + INJECTED_ATTR + "]")) return;
    var wrap = document.createElement("div");
    wrap.setAttribute(INJECTED_ATTR, "1");
    wrap.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;";
    wrap.innerHTML = svgText;
    var first = document.body.firstChild;
    if (first) document.body.insertBefore(wrap, first);
    else document.body.appendChild(wrap);
  }

  function load() {
    if (typeof fetch !== "function") return;
    fetch(ATLAS_URL, { cache: "force-cache" })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (txt) { if (txt) inject(txt); })
      .catch(function () { /* silent — falls back to direct href usage */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
