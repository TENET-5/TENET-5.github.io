/**
 * Spotify iFrame API player — Dead Kennedys albums.
 * Plays full albums through. Press play, read the evidence.
 * https://developer.spotify.com/documentation/embeds/references/iframe-api
 */
(function() {
  // Full DK albums — plays through track by track
  var tracks = [
    'spotify:album:2x5IF6C5TgCyp3zasMUYgG', // User's requested album (plays first)
    'spotify:album:39RCMjmOBYGJOdCWe1GSEN', // Fresh Fruit for Rotting Vegetables (1980)
    'spotify:album:6gQKAYf1VhWRCV8gMBBXHq', // Plastic Surgery Disasters (1982)
    'spotify:album:2m7CEzEMpkbCxiJwFBadAn', // Frankenchrist (1985)
    'spotify:album:6VnEKzr2E68eJC8e0n6MHq'  // Bedtime for Democracy (1986)
  ];

  var idx = Math.floor(Math.random() * tracks.length);
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

      // Track playback state
      ctrl.addListener('playback_update', function(e) {
        if (e && e.data) {
          playing = !e.data.isPaused;
          document.getElementById('sp-play').innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
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
