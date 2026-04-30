/* ═══════════════════════════════════════════════════════
   TENET5 Video Background — Ambient Video Layer
   Handles autoplay video backgrounds on pages that
   include a .video-bg-container element.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_VIDEO_BG_LOADED) return;
  window.__TENET5_VIDEO_BG_LOADED = true;

  function initVideoBg() {
    var containers = document.querySelectorAll('.video-bg-container, [data-video-bg]');
    if (!containers.length) return;

    containers.forEach(function(container) {
      var src = container.getAttribute('data-video-bg') || container.getAttribute('data-src');
      if (!src) return;

      /* Check if video already exists */
      if (container.querySelector('video.vbg')) return;

      var video = document.createElement('video');
      video.className = 'vbg';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;' +
        'object-fit:cover;z-index:0;opacity:0.15;pointer-events:none;';

      var source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);

      /* Graceful failure — don't break page if video fails */
      video.addEventListener('error', function() {
        video.style.display = 'none';
        console.warn('[video-bg] Failed to load:', src);
      });

      container.style.position = container.style.position || 'relative';
      container.insertBefore(video, container.firstChild);

      /* Respect reduced motion preference */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause();
        video.style.display = 'none';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoBg);
  } else {
    initVideoBg();
  }

  console.log('[video-bg] Video background handler loaded.');
})();
