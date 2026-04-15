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
    'cfnis.html': 'cfnis_military_bg.mp4',
    'cfnis-proxy.html': 'dark_atmosphere_bg.mp4',
    'cds-accountability.html': 'dark_atmosphere_bg.mp4',
    's504-covey-bae.html': 'red_pulse_bg.mp4',
    's504-court-filing.html': 'red_pulse_bg.mp4',
    'prosecution.html': 'red_pulse_bg.mp4',
    'genocide-evidence.html': 'red_pulse_bg.mp4',
    'institutional-malice.html': 'red_pulse_bg.mp4',
  };

  var DEFAULT_VIDEO = 'dark_atmosphere_bg.mp4';
  var BASE_PATH = '/media/backgrounds/';
  var LOOP_SECONDS = 15;

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
    if (document.querySelector('.t5-video-wrap, .t5-video-bg')) return;

    var videoFile = PAGE_VIDEOS[page] || DEFAULT_VIDEO;
    var videoUrl = BASE_PATH + videoFile;

    var wrap = document.createElement('div');
    wrap.className = 't5-video-wrap';
    wrap.setAttribute('aria-hidden', 'true');

    // Create video element
    var video = document.createElement('video');
    video.className = 't5-video-bg';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.dataset.loopSeconds = String(LOOP_SECONDS);
    video.playsInline = true;
    video.poster = '/media/retro-warroom-poster.jpg';
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'auto';

    video.addEventListener('loadeddata', function() {
      document.body.classList.add('t5-video-ready');
    });

    video.addEventListener('timeupdate', function() {
      if (video.currentTime >= LOOP_SECONDS) {
        video.currentTime = 0.05;
      }
    });

    video.addEventListener('error', function() {
      document.body.classList.add('t5-video-error');
      console.warn('[video-bg] Failed to load background video:', videoUrl);
    });

    var source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    video.appendChild(source);
    wrap.appendChild(video);

    document.body.classList.add('has-t5-video-bg');

    // Insert at the start of body
    document.body.insertBefore(wrap, document.body.firstChild);

    // Start playback (handle autoplay policy)
    video.play().catch(function() {
      // Autoplay blocked — poster/fallback remains visible
    });
  }

  // CSS for video background
  var style = document.createElement('style');
  style.textContent =
    '.t5-video-wrap{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0;background:radial-gradient(circle at center, rgba(15,23,42,0.18), rgba(2,6,23,0.72))}' +
    '.t5-video-bg{position:absolute;top:0;left:0;width:100vw;height:100vh;object-fit:cover;opacity:0.52;pointer-events:none;filter:brightness(0.72) saturate(0.95) contrast(1.05)}' +
    '@media(prefers-reduced-motion:reduce){.t5-video-wrap{display:none}}' +
    '@media(max-width:768px){.t5-video-bg{opacity:0.34;filter:brightness(0.78) saturate(0.9)}}';
  document.head.appendChild(style);

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectVideo);
  } else {
    injectVideo();
  }
})();
