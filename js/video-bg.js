/* ═══════════════════════════════════════════════════════
   TENET5 Video Background — Cinematic investigation loops
   Auto-loads matching video per page, falls back to dark atmosphere
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_VIDEOBG_LOADED) return;
  window.__TENET5_VIDEOBG_LOADED = true;

  // Page → video mapping
  var PAGE_VIDEOS = {
    'maid-accountability.html': 'maid_investigation_bg.mp4',
    'maid-voting-record.html': 'maid_investigation_bg.mp4',
    'maid-master-dossier.html': 'maid_investigation_bg.mp4',
    'maid-speech-evidence.html': 'maid_investigation_bg.mp4',
    'maid-policy-evolution.html': 'maid_investigation_bg.mp4',
    'maid-provincial.html': 'maid_investigation_bg.mp4',
    'maid-mental-health.html': 'maid_investigation_bg.mp4',
    'maid-economics.html': 'maid_investigation_bg.mp4',
    'maid-exterminators.html': 'red_pulse_bg.mp4',
    'maid-dossier-index.html': 'maid_investigation_bg.mp4',
    'veterans-maid-cases.html': 'maid_investigation_bg.mp4',
    'disability-genocide.html': 'red_pulse_bg.mp4',
    'foreign-interference.html': 'foreign_interference_bg.mp4',
    'foreign-interference-deep.html': 'foreign_interference_bg.mp4',
    'foreign-influence.html': 'foreign_interference_bg.mp4',
    'cija-lobbying.html': 'foreign_interference_bg.mp4',
    'arrivecan.html': 'arrivecan_scandal_bg.mp4',
    'ethics-violations.html': 'ethics_violations_bg.mp4',
    'ethics-failures.html': 'ethics_violations_bg.mp4',
    'carney-conflicts.html': 'ethics_violations_bg.mp4',
    'conflict-of-interest-registry.html': 'ethics_violations_bg.mp4',
    'phoenix-pay.html': 'phoenix_pay_bg.mp4',
    'cfnis.html': 'dark_atmosphere_bg.mp4',
    'cfnis-proxy.html': 'dark_atmosphere_bg.mp4',
    'cds-accountability.html': 'dark_atmosphere_bg.mp4',
    's504-covey-bae.html': 'red_pulse_bg.mp4',
    's504-court-filing.html': 'red_pulse_bg.mp4',
    'prosecution.html': 'red_pulse_bg.mp4',
    'genocide-evidence.html': 'red_pulse_bg.mp4',
    'institutional-malice.html': 'red_pulse_bg.mp4',
  };

  var DEFAULT_VIDEO = 'dark_atmosphere_bg.mp4';
  var BASE_PATH = 'media/backgrounds/';

  // Skip on pages where video bg doesn't make sense
  var SKIP = ['index.html', 'search.html', 'sitemap.html', 'auth-callback.html',
              'email-campaign.html', 'email-dispatch.html', 'chalkboard.html'];

  function getPageName() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function injectVideo() {
    var page = getPageName();
    if (SKIP.indexOf(page) !== -1) return;

    // Don't duplicate
    if (document.querySelector('.t5-video-bg')) return;

    var videoFile = PAGE_VIDEOS[page] || DEFAULT_VIDEO;
    var videoUrl = BASE_PATH + videoFile;

    // Create video element
    var video = document.createElement('video');
    video.className = 't5-video-bg';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'auto';

    var source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    video.appendChild(source);

    // Insert at the start of body
    document.body.insertBefore(video, document.body.firstChild);

    // Start playback (handle autoplay policy)
    video.play().catch(function() {
      // Autoplay blocked — that's fine, stays as a dark background
    });
  }

  // CSS for video background
  var style = document.createElement('style');
  style.textContent =
    '.t5-video-bg{position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:-1;opacity:0.25;pointer-events:none;filter:brightness(0.4) saturate(0.7)}' +
    '@media(prefers-reduced-motion:reduce){.t5-video-bg{display:none}}' +
    '@media(max-width:768px){.t5-video-bg{opacity:0.15}}';
  document.head.appendChild(style);

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectVideo);
  } else {
    injectVideo();
  }
})();
