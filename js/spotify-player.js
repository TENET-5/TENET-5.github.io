/**
 * Spotify iFrame API player — official createController + togglePlay.
 * Anti-government punk (Dead Kennedys + Propagandhi).
 * One-click play from sticky bottom bar.
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
    'spotify:track:6fKQBf4Fh5ITFInVBfV1GE', // Back to the Motor League — Propagandhi
  ];

  var currentTrack = Math.floor(Math.random() * tracks.length);
  var controller = null;
  var isPlaying = false;

  // Build the sticky bar
  var bar = document.createElement('div');
  bar.id = 'spotify-bar';
  bar.style.cssText =
    'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
    'background:#0a0a0a;border-top:2px solid #1db954;' +
    'padding:8px 16px;box-shadow:0 -4px 20px rgba(0,0,0,0.8);';
  bar.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;max-width:900px;margin:0 auto;">' +
      '<button id="sp-play" style="background:#1db954;color:#000;border:none;border-radius:50%;width:48px;height:48px;cursor:pointer;font-size:1.5rem;font-weight:bold;flex-shrink:0;line-height:48px;text-align:center;" title="Play">\u25B6</button>' +
      '<div id="embed-iframe" style="flex:1;min-width:0;border-radius:8px;overflow:hidden;"></div>' +
      '<button id="sp-next" style="background:transparent;color:#1db954;border:1px solid #1db954;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1rem;flex-shrink:0;" title="Next track">\u23ED</button>' +
      '<button id="sp-close" style="background:transparent;color:#555;border:1px solid #333;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:0.8rem;flex-shrink:0;" title="Close player">\u00D7</button>' +
    '</div>';
  document.body.appendChild(bar);
  document.body.style.paddingBottom = '100px';

  var playBtn = bar.querySelector('#sp-play');
  var nextBtn = bar.querySelector('#sp-next');
  var closeBtn = bar.querySelector('#sp-close');

  function updatePlayBtn() {
    playBtn.textContent = isPlaying ? '\u23F8' : '\u25B6';
  }

  // Load Spotify iFrame API script
  var s = document.createElement('script');
  s.src = 'https://open.spotify.com/embed/iframe-api/v1';
  s.async = true;
  document.head.appendChild(s);

  window.onSpotifyIframeApiReady = function(IFrameAPI) {
    var el = document.getElementById('embed-iframe');
    if (!el) return;

    IFrameAPI.createController(el, {
      uri: tracks[currentTrack],
      width: '100%',
      height: 80,
      theme: 0
    }, function(EmbedController) {
      controller = EmbedController;

      // Listen for playback state changes
      controller.addListener('playback_update', function(e) {
        isPlaying = !e.data.isPaused;
        updatePlayBtn();
      });

      // Play/Pause
      playBtn.addEventListener('click', function() {
        if (controller) {
          controller.togglePlay();
        }
      });

      // Next track
      nextBtn.addEventListener('click', function() {
        if (controller) {
          currentTrack = (currentTrack + 1) % tracks.length;
          controller.loadUri(tracks[currentTrack]);
          // loadUri auto-plays when loading a new track
          isPlaying = true;
          updatePlayBtn();
        }
      });

      // Close
      closeBtn.addEventListener('click', function() {
        if (controller && isPlaying) {
          controller.togglePlay();
        }
        bar.remove();
        document.body.style.paddingBottom = '';
      });
    });
  };
})();
