/* ═══════════════════════════════════════════════════════════════
<<<<<<<< HEAD:js/operational-anim.js
   TENET5 — operational-intel Animator (Cap#217, 2026-04-24)
   ═══════════════════════════════════════════════════════════════
   Powers the css/slates/operational-intel-anim.css motion vocabulary.
========
   TENET5 — TENET5 Animator (Cap#217, 2026-04-24)
   ═══════════════════════════════════════════════════════════════
   Powers the css/slates/motion.css motion vocabulary.
>>>>>>>> 00178cb (Cap#219: neutralize external-brand references; rename motion + ops slate files; wire motion.js to index.html and home.html):js/motion.js

   Boots safely without dependencies. Respects
   prefers-reduced-motion. No-ops gracefully if classes are absent.

     • IntersectionObserver → adds .is-in to .s5-reveal* and
       .s5-stagger blocks; auto-indexes children with --i.
     • Display scramble → first paint of any .s5-display.s5-scramble
       runs a 700ms glyph storm before settling on real text.
     • Ambient canvas → if any .s5-ambient-host has a child
       .s5-ambient-canvas, paints a slow waveform/binary grid
       sympathetic to the hero ink palette.
     • Cursor ring → injected on first mouse move; hidden on
       coarse pointers; grows on links/buttons.
     • Loading scrim → if present, removed on window 'load'.
     • Pip rail → if present, highlights nearest in-view section.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (typeof window === "undefined" || typeof document === "undefined") return;

  var REDUCED = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COARSE  = window.matchMedia &&
                window.matchMedia("(pointer: coarse)").matches;

  // ────────────────────────────────────────────────────────────
  // 1) Scroll reveal + stagger
  // ────────────────────────────────────────────────────────────
  function initReveal() {
    var nodes = document.querySelectorAll(
      ".s5-reveal, .s5-reveal-up, .s5-reveal-left, .s5-reveal-right, .s5-stagger"
    );
    if (!nodes.length) return;

    // Index children for stagger
    document.querySelectorAll(".s5-stagger").forEach(function (s) {
      var i = 0;
      Array.prototype.forEach.call(s.children, function (c) {
        c.style.setProperty("--i", String(i++));
      });
    });

    if (REDUCED || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    nodes.forEach(function (n) { io.observe(n); });
  }

  // ────────────────────────────────────────────────────────────
  // 2) Display scramble (one-shot on first paint)
  // ────────────────────────────────────────────────────────────
  function initScramble() {
    if (REDUCED) return;
    var GLYPHS = "01░▒▓█/\\—|·∙•◇◈".split("");
    document.querySelectorAll(".s5-display.s5-scramble").forEach(function (h) {
      var realHTML = h.innerHTML;
      var realText = h.textContent || "";
      if (!realText.trim()) return;

      // Build per-char span scaffold; preserve spaces and the slash mark
      var chars = realText.split("");
      h.innerHTML = chars.map(function (c) {
        if (c === " " || c === "\u00a0" || c === "\n") return c;
        return '<span class="s5-scramble-char">' + escapeHTML(c) + "</span>";
      }).join("");
      var spans = h.querySelectorAll(".s5-scramble-char");

      var FRAMES = 14;
      var INTERVAL = 38; // ms per frame ≈ 530ms total
      var settled = new Array(spans.length).fill(false);
      var settleAfter = function (i) { return Math.floor(FRAMES * (i / spans.length)); };

      var frame = 0;
      var raw = chars.filter(function (c) {
        return c !== " " && c !== "\u00a0" && c !== "\n";
      });

      var t = setInterval(function () {
        spans.forEach(function (sp, idx) {
          if (settled[idx]) return;
          if (frame >= settleAfter(idx)) {
            sp.textContent = raw[idx] || "";
            settled[idx] = true;
            return;
          }
          sp.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        });
        frame++;
        if (frame > FRAMES + 4) {
          clearInterval(t);
          // Restore real HTML so the .s5-slash etc keep working
          h.innerHTML = realHTML;
        }
      }, INTERVAL);
    });
  }

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ────────────────────────────────────────────────────────────
  // 3) Ambient hero canvas (lightweight 2D, no Three.js)
  //    Paints a slow signal-line + binary dot field on dark ink.
  // ────────────────────────────────────────────────────────────
  function initAmbient() {
    if (REDUCED) return;
    var canvases = document.querySelectorAll(".s5-ambient-canvas");
    if (!canvases.length) return;

    canvases.forEach(function (cv) {
      var ctx = cv.getContext("2d", { alpha: true });
      if (!ctx) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      function resize() {
        var rect = cv.getBoundingClientRect();
        cv.width  = Math.max(1, Math.floor(rect.width  * dpr));
        cv.height = Math.max(1, Math.floor(rect.height * dpr));
      }
      resize();
      window.addEventListener("resize", resize, { passive: true });

      var t0 = performance.now();
      var stop = false;

      // Pre-baked dot grid coords (cheap: regenerate only on resize)
      var dots = [];
      function rebuild() {
        dots = [];
        var W = cv.width, H = cv.height;
        var gx = Math.floor(W / (24 * dpr));
        var gy = Math.floor(H / (24 * dpr));
        for (var y = 0; y <= gy; y++) {
          for (var x = 0; x <= gx; x++) {
            dots.push({ x: x * 24 * dpr, y: y * 24 * dpr,
                        seed: Math.random() });
          }
        }
      }
      rebuild();
      window.addEventListener("resize", rebuild, { passive: true });

      function frame(now) {
        if (stop) return;
        var t = (now - t0) * 0.001;
        var W = cv.width, H = cv.height;
        ctx.clearRect(0, 0, W, H);

        // Dot field — pulses with cosine wave moving across X
        ctx.fillStyle = "rgba(185,185,185,0.45)";
        for (var i = 0, n = dots.length; i < n; i++) {
          var d = dots[i];
          var phase = (d.x / W) * Math.PI * 2 - t * 0.6 + d.seed * 0.3;
          var a = 0.18 + 0.32 * (0.5 + 0.5 * Math.cos(phase));
          ctx.globalAlpha = a;
          ctx.fillRect(d.x, d.y, 1.2 * dpr, 1.2 * dpr);
        }
        ctx.globalAlpha = 1;

        // Signal-line: low-amp sine sweep across mid-band
        ctx.beginPath();
        ctx.lineWidth = 1 * dpr;
        ctx.strokeStyle = "rgba(185,185,185,0.32)";
        var midY = H * 0.62;
        var amp  = H * 0.045;
        var step = Math.max(2, Math.floor(W / 240));
        for (var x2 = 0; x2 <= W; x2 += step) {
          var y2 = midY +
                   Math.sin((x2 / W) * 9 + t * 0.9) * amp +
                   Math.sin((x2 / W) * 21 - t * 1.4) * amp * 0.35;
          if (x2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
        }
        ctx.stroke();

        // Hairline ticks at edges
        ctx.fillStyle = "rgba(185,185,185,0.55)";
        ctx.fillRect(0, midY - 0.5 * dpr, 8 * dpr, 1 * dpr);
        ctx.fillRect(W - 8 * dpr, midY - 0.5 * dpr, 8 * dpr, 1 * dpr);

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      // Pause when offscreen
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { stop = !e.isIntersecting; });
          if (!stop) requestAnimationFrame(frame);
        }, { threshold: 0 });
        io.observe(cv);
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // 4) Cursor ring (desktop only)
  // ────────────────────────────────────────────────────────────
  function initCursor() {
    if (REDUCED || COARSE) return;
    var ring = document.createElement("div");
    ring.className = "s5-cursor";
    document.body.appendChild(ring);

    var x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    function loop() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      ring.style.transform =
        "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!ring.classList.contains("is-active")) {
        ring.classList.add("is-active");
      }
      if (!raf) loop();
    }, { passive: true });

    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      if (t && t.closest && t.closest("a, button, .s5-link-grow, .read-full")) {
        ring.classList.add("is-grow");
      } else {
        ring.classList.remove("is-grow");
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  // 5) Loading scrim removal
  // ────────────────────────────────────────────────────────────
  function initScrim() {
    var scrim = document.querySelector(".s5-loading-scrim");
    if (!scrim) return;
    function done() { scrim.classList.add("is-ready"); }
    if (document.readyState === "complete") {
      setTimeout(done, 220);
    } else {
      window.addEventListener("load", function () { setTimeout(done, 220); });
    }
  }

  // ────────────────────────────────────────────────────────────
  // 6) Pip rail (right-edge active section dot)
  // ────────────────────────────────────────────────────────────
  function initPipRail() {
    var rail = document.querySelector(".s5-pip-rail");
    if (!rail) return;
    var pips = Array.prototype.slice.call(rail.querySelectorAll("a[href^='#']"));
    if (!pips.length) return;
    var targets = pips.map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    }).filter(Boolean);
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) return;

    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) current = e.target;
      });
      pips.forEach(function (a, i) {
        a.classList.toggle("is-active", targets[i] === current);
      });
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  }

  // ────────────────────────────────────────────────────────────
  // Boot
  // ────────────────────────────────────────────────────────────
  function boot() {
    try { initReveal();   } catch (e) { /* noop */ }
    try { initScramble(); } catch (e) { /* noop */ }
    try { initAmbient();  } catch (e) { /* noop */ }
    try { initCursor();   } catch (e) { /* noop */ }
    try { initScrim();    } catch (e) { /* noop */ }
    try { initPipRail();  } catch (e) { /* noop */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
