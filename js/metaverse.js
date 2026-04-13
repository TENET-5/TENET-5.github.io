/* ═══════════════════════════════════════════════════════
   TENET5 Metaverse Layer — NVIDIA Omniverse Integration
   Holographic UI, neural particle effects, power badges
   LIRIL AI — Dual RTX 5070 Ti + Intel Arrow Lake NPU
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Inject metaverse CSS ─────────────────────────
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/metaverse.css';
  document.head.appendChild(link);

  document.addEventListener('DOMContentLoaded', function() {

    // ── Holographic Grid ─────────────────────────────
    var grid = document.createElement('div');
    grid.className = 'metaverse-grid';
    document.body.insertBefore(grid, document.body.firstChild);

    // ── Neural Particle Background ───────────────────
    var particles = document.createElement('div');
    particles.className = 'neural-particles';
    document.body.insertBefore(particles, document.body.firstChild);

    // ── Scan Line ────────────────────────────────────
    var scan = document.createElement('div');
    scan.className = 'scan-line';
    document.body.appendChild(scan);

    // ── Data Stream ──────────────────────────────────
    var stream = document.createElement('div');
    stream.className = 'data-stream';
    document.body.appendChild(stream);

    // ── NVIDIA + Intel Power Badge ───────────────────
    var badge = document.createElement('div');
    badge.className = 'power-badge';
    badge.innerHTML =
      '<div class="nv-badge" title="LIRIL runs on dual NVIDIA RTX 5070 Ti GPUs (32GB VRAM)">' +
        '&#9889; NVIDIA RTX 5070 Ti &times;2' +
      '</div>' +
      '<div class="intel-badge" title="LIRIL NPU classifier runs on Intel Arrow Lake 285K">' +
        '&#9881; Intel NPU &bull; Arrow Lake' +
      '</div>';
    document.body.appendChild(badge);

    // ── Apply holo-card effect to investigation cards ─
    var cards = document.querySelectorAll(
      '.finding-box, .evidence-card, .pipeline-card, .charge-card, .testimony-card'
    );
    cards.forEach(function(card) {
      card.classList.add('holo-card');
    });

    // ── Apply glow to impact numbers ─────────────────
    var impactNums = document.querySelectorAll('.the-number, .num-red, .num-gold');
    impactNums.forEach(function(num) {
      if (num.textContent.includes('$') || num.textContent.includes('%')) {
        num.classList.add('glow-green');
      }
    });

    // ── Console branding ─────────────────────────────
    console.log(
      '%c TENET5 %c LIRIL AI %c Powered by NVIDIA RTX 5070 Ti × 2 + Intel Arrow Lake NPU ',
      'background:#76b900;color:#000;font-weight:bold;padding:4px 8px;',
      'background:#c41e3a;color:#fff;font-weight:bold;padding:4px 8px;',
      'background:#0071c5;color:#fff;padding:4px 8px;'
    );
    console.log(
      '%c SEED 118400 | CUDA 13.1 | 32GB VRAM | NATS 4223 ',
      'background:#1a1f36;color:#76b900;padding:2px 8px;font-family:monospace;'
    );
  });
})();
