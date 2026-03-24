/**
 * Spotify iFrame API player — official API reference implementation.
 * Dead Kennedys + Propagandhi anti-government tracks.
 * https://developer.spotify.com/documentation/embeds/references/iframe-api
 */
(function() {
  var tracks = [
    'spotify:track:5wga4LOSV23mMOHnRsPK4X', // California Uber Alles — DK
    'spotify:track:1FKrVbPYHJcBMBEON2f48B', // Holiday in Cambodia — DK
    'spotify:track:5MbHKXeFnYaKwMG8JIKPbj', // Kill the Poor — DK
    'spotify:track:4kqBOgIiCAMWd3ZjTGBbYn', // Government Flu — DK
    'spotify:track:3PjTwHBwjxKiPu5nkEjBI5', // Police Truck — DK
    'spotify:track:4qrT9xCo6CIqdvRfD8SJEA', // Stars and Stripes of Corruption — DK
    'spotify:track:3VjpSK56VYgDYzJlm7HMqH', // Dear Coach's Corner — Propagandhi
    'spotify:track:0DjRBPkkuxLv7ZHXL9XFHH', // And We Thought Nation States Were a Bad Idea — Propagandhi
    'spotify:track:6fKQBf4Fh5ITFInVBfV1GE'  // Back to the Motor League — Propagandhi
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
