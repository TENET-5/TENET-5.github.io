/* ═══════════════════════════════════════════════════════════════════════
   reading-mode.js — accessible reading toggle (Atkinson Hyperlegible)

   Sets [data-reading="accessible"] on <html> and persists the choice
   in localStorage as "tnt-reading". Default = "default" (Inter primary).

   The toggle button appears in the bottom-right corner. Clicking it
   cycles default ↔ accessible. Keyboard: Alt+R toggles too.

   Design contract: see /css/tokens.css §5 ACCESSIBLE READING MODE
   and §7 READING-MODE TOGGLE WIDGET.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var KEY = "tnt-reading";
  var ATTR = "data-reading";
  var html = document.documentElement;

  function load() {
    try { return localStorage.getItem(KEY) || "default"; }
    catch (_) { return "default"; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (_) {}
  }
  function apply(mode) {
    if (mode === "accessible") html.setAttribute(ATTR, "accessible");
    else html.removeAttribute(ATTR);
  }
  function current() {
    return html.getAttribute(ATTR) === "accessible"
      ? "accessible" : "default";
  }
  function toggle() {
    var next = current() === "accessible" ? "default" : "accessible";
    apply(next);
    save(next);
    button && updateButton(next);
  }
  var button;
  function updateButton(mode) {
    if (!button) return;
    var label = mode === "accessible"
      ? "Reading mode: accessible"
      : "Reading mode: default";
    button.setAttribute("aria-pressed",
      mode === "accessible" ? "true" : "false");
    button.setAttribute("aria-label", label);
    button.title = label + " — Alt+R to toggle";
    button.dataset.mode = mode;
    var span = button.querySelector(".reading-mode-label");
    if (span) span.textContent =
      mode === "accessible" ? "Standard" : "Accessible";
  }
  function makeButton() {
    if (document.querySelector(".reading-mode-toggle")) return;
    button = document.createElement("button");
    button.type = "button";
    button.className = "reading-mode-toggle";
    button.innerHTML = '<span class="reading-mode-label">Accessible</span>';
    button.addEventListener("click", toggle);
    document.body.appendChild(button);
    updateButton(current());
  }
  function init() {
    apply(load());
    if (document.body) makeButton();
    else document.addEventListener("DOMContentLoaded", makeButton);
    document.addEventListener("keydown", function (e) {
      if (e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        toggle();
      }
    });
  }
  // Apply BEFORE DOMContentLoaded so the right font lands on first paint.
  apply(load());
  init();
})();
