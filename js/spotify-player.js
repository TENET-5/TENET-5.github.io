/**
 * Spotify iFrame API player — Classical Villain playlist.
 * The soundtrack to 1,005 records of government failure.
 * https://developer.spotify.com/documentation/embeds/references/iframe-api
 */
(function() {
  // Classical Villain playlist — ominous orchestral
  var tracks = [
    'spotify:playlist:4xoVsdgLvChQU8yrI0ISVv'  // Classical Villain playlist
  ];

  var idx = 0;
  var ctrl = null;
  var playing = false;

  // Create sticky bar
  var bar = document.createElement('div');
  bar.id = 'spotify-bar';
  bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0a0a0a;border-top:2px solid #1db954;padding:8px 12px;box-shadow:0 -4px 20px rgba(0,0,0,0.8);';

  bar.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;max-width:920px;margin:0 auto;">' +
      '<button id="sp-play" style="background:#1db954;color:#000;border:none;border-radius:50%;width:48px;height:48px;cursor:pointer;font-size:22px;flex-shrink:0;">&#9654;</button>' +
      '<div id="sp-embed" style="flex:1;min-width:0;border-radius:12px;overflow:hidden;"></div>' +
      '<button id="sp-skip" style="background:none;color:#1db954;border:1px solid #1db954;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;flex-shrink:0;">&#9197;</button>' +
      '<button id="sp-x" style="background:none;color:#666;border:1px solid #333;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:14px;flex-shrink:0;">&times;</button>' +
    '</div>';

  document.body.appendChild(bar);
  document.body.style.paddingBottom = '100px';

  // Load Spotify iFrame API
  var sc = document.createElement('script');
  sc.src = 'https://open.spotify.com/embed/iframe-api/v1';
  sc.async = true;
  document.head.appendChild(sc);

  // API ready callback
  window.onSpotifyIframeApiReady = function(IFrameAPI) {
    var el = document.getElementById('sp-embed');
    if (!el) return;

    // Options — width and height as STRINGS per API docs
    IFrameAPI.createController(el, {
      uri: tracks[idx],
      width: '100%',
      height: '80'
    }, function(EmbedController) {
      ctrl = EmbedController;

      // Autoplay — try immediately, then on first user interaction as fallback
      var started = false;
      function tryAutoplay() {
        if (started || !ctrl) return;
        ctrl.play();
        started = true;
      }
      // Attempt immediate autoplay
      tryAutoplay();
      // Fallback: start on first click/scroll/keypress anywhere on page
      var fallback = function() {
        tryAutoplay();
        document.removeEventListener('click', fallback);
        document.removeEventListener('scroll', fallback);
        document.removeEventListener('keydown', fallback);
      };
      document.addEventListener('click', fallback, {once: false});
      document.addEventListener('scroll', fallback, {once: false});
      document.addEventListener('keydown', fallback, {once: false});

      // Track playback state
      ctrl.addListener('playback_update', function(e) {
        if (e && e.data) {
          playing = !e.data.isPaused;
          document.getElementById('sp-play').innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
          if (!e.data.isPaused) started = true;
        }
      });

      // PLAY button — uses play()/pause() for reliability
      document.getElementById('sp-play').addEventListener('click', function() {
        if (!ctrl) return;
        if (playing) {
          ctrl.pause();
        } else {
          ctrl.resume();
        }
      });

      // SKIP button
      document.getElementById('sp-skip').addEventListener('click', function() {
        if (!ctrl) return;
        idx = (idx + 1) % tracks.length;
        ctrl.loadUri(tracks[idx]);
        // loadUri starts playback automatically
        playing = true;
        document.getElementById('sp-play').innerHTML = '&#10074;&#10074;';
      });

      // CLOSE button
      document.getElementById('sp-x').addEventListener('click', function() {
        if (ctrl && playing) ctrl.pause();
        bar.remove();
        document.body.style.paddingBottom = '';
      });
    });
  };
})();
