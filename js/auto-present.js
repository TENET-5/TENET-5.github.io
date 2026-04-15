/* ═══════════════════════════════════════════════════════
   TENET5 Auto-Presenter — Converts ANY page into animated presentation
   Automatically finds sections, headings, cards, tables, quotes
   and adds scroll-driven reveal animations + chapter navigation.
   No per-page configuration needed.
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var page = window.location.pathname.split('/').pop() || '';
    if (page === 'index.html' || page === '') return;

    // ── Auto-detect and animate ALL content blocks ──────
    var selectors = [
      'section',
      'h1', 'h2', 'h3',
      '.glass-panel',
      '.formula-box',
      '.hansard-quote',
      '.record-card',
      '.stat-grid', '.stat-hero-banner',
      '.timeline-section',
      '.evidence-cinematic',
      '.testimony-card',
      '.human-scale',
      '.impact-number',
      'table',
      'blockquote',
      '.card', '.ext-card',
      '.cta-card',
      '.tldr',
      'details',
      '[data-chapter]',
      'ul:not(nav ul)', 'ol',
      '.source-cite', '.sources',
    ];

    var animated = 0;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ap-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        // Skip if already has reveal or is inside nav/header/footer
        if (el.classList.contains('ap-animated')) return;
        if (el.closest('nav, header, footer, .site-nav, #hud-controls, .presenter-toolbar, #site-header-frame')) return;
        if (el.closest('.grain-overlay, .vignette')) return;

        el.classList.add('ap-animated');
        observer.observe(el);
        animated++;
      });
    });

    // ── Inject animation styles ──────────────────────────
    if (animated > 0) {
      var style = document.createElement('style');
      style.textContent =
        '.ap-animated {' +
        '  opacity: 0;' +
        '  transform: translateY(24px);' +
        '  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), ' +
        '              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);' +
        '}' +
        '.ap-animated.ap-visible {' +
        '  opacity: 1;' +
        '  transform: translateY(0);' +
        '}' +
        /* Stagger: alternate elements slide from different directions */
        '.ap-animated:nth-child(even) {' +
        '  transform: translateY(24px) translateX(-12px);' +
        '}' +
        '.ap-animated:nth-child(even).ap-visible {' +
        '  transform: translateY(0) translateX(0);' +
        '}' +
        /* Tables and large blocks scale up */
        'table.ap-animated, .stat-grid.ap-animated, .stat-hero-banner.ap-animated {' +
        '  transform: scale(0.96) translateY(16px);' +
        '}' +
        'table.ap-animated.ap-visible, .stat-grid.ap-animated.ap-visible, .stat-hero-banner.ap-animated.ap-visible {' +
        '  transform: scale(1) translateY(0);' +
        '}' +
        /* Headings: subtle left slide */
        'h1.ap-animated, h2.ap-animated, h3.ap-animated {' +
        '  transform: translateX(-20px);' +
        '  transition-duration: 0.6s;' +
        '}' +
        'h1.ap-animated.ap-visible, h2.ap-animated.ap-visible, h3.ap-animated.ap-visible {' +
        '  transform: translateX(0);' +
        '}' +
        /* Quotes: fade + scale from center */
        'blockquote.ap-animated, .testimony-card.ap-animated, .hansard-quote.ap-animated {' +
        '  transform: scale(0.95);' +
        '  transition-duration: 0.9s;' +
        '}' +
        'blockquote.ap-animated.ap-visible, .testimony-card.ap-animated.ap-visible, .hansard-quote.ap-animated.ap-visible {' +
        '  transform: scale(1);' +
        '}' +
        /* Pipeline cards: slide from bottom with red border flash */
        '.pipeline-card.ap-animated, .case-card.ap-animated, .crisis-card.ap-animated {' +
        '  transform: translateY(30px);' +
        '  border-left-color: transparent;' +
        '  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), border-left-color 0.5s ease 0.4s;' +
        '}' +
        '.pipeline-card.ap-animated.ap-visible, .case-card.ap-animated.ap-visible, .crisis-card.ap-animated.ap-visible {' +
        '  border-left-color: rgba(196, 30, 58, 0.5);' +
        '}' +
        /* Film projector brightness pulse on reveal */
        '.ap-animated.ap-visible {' +
        '  animation: apRevealPulse 0.6s ease-out;' +
        '}' +
        '@keyframes apRevealPulse {' +
        '  0% { filter: brightness(1.3) contrast(0.85); }' +
        '  40% { filter: brightness(1.05); }' +
        '  100% { filter: brightness(1) contrast(1); }' +
        '}' +
        /* Evidence label on glass cards */
        '.glass-card.ap-visible::before, .glass-panel.ap-visible::before {' +
        '  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;' +
        '  background: linear-gradient(90deg, transparent, rgba(196,30,58,0.3), transparent);' +
        '  animation: evidenceScanLine 3s ease-in-out;' +
        '}' +
        '@keyframes evidenceScanLine {' +
        '  0% { opacity: 0; transform: scaleX(0); }' +
        '  50% { opacity: 1; transform: scaleX(1); }' +
        '  100% { opacity: 0; transform: scaleX(0); }' +
        '}';
      document.head.appendChild(style);
    }
  });
})();
