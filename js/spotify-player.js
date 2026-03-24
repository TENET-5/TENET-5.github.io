/**
 * Spotify iFrame API player — uses official createController + togglePlay.
 * Anti-government punk playlist (DK + Propagandhi).
 * Big green PLAY button triggers playback on click.
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

  // Inject the player bar
  var bar = document.createElement('div');
  bar.id = 'spotify-bar';
  bar.style.cssText =
    'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
    'background:#0a0a0a;border-top:2px solid #1db954;' +
    'padding:8px 16px;box-shadow:0 -4px 20px rgba(0,0,0,0.8);';
  bar.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;max-width:900px;margin:0 auto;">' +
      '<button id="sp-play" style="background:#1db954;color:#000;border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;font-size:1.4rem;font-weight:bold;flex-shrink:0;" title="Play">&#9654;</button>' +
      '<div id="embed-iframe" style="flex:1;min-width:0;"></div>' +
      '<button id="sp-next" style="background:transparent;color:#1db954;border:1px solid #1db954;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:0.9rem;flex-shrink:0;" title="Next">&#9197;</button>' +
      '<button id="sp-close" style="background:transparent;color:#555;border:1px solid #333;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:0.8rem;flex-shrink:0;" title="Close">&times;</button>' +
    '</div>';
  document.body.appendChild(bar);
  document.body.style.paddingBottom = '100px';

  // Load Spotify iFrame API
  var script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  document.head.appendChild(script);

  // Initialize when API loads
  window.onSpotifyIframeApiReady = function(IFrameAPI) {
    var element = document.getElementById('embed-iframe');
    var options = {
      uri: tracks[currentTrack],
      width: '100%',
      height: 80,
      theme: 0
    };

    IFrameAPI.createController(element, options, function(EmbedController) {
      controller = EmbedController;

      // PLAY button — triggers on user click (satisfies browser autoplay policy)
      document.getElementById('sp-play').addEventListener('click', function() {
        controller.togglePlay();
        this.innerHTML = '&#10074;&#10074;'; // Pause icon
        this.onclick = function() {
          controller.togglePlay();
          // Toggle icon
          if (this.innerHTML === '&#9654;') {
            this.innerHTML = '&#10074;&#10074;';
          } else {
            this.innerHTML = '&#9654;';
          }
        };
      });

      // NEXT button
      document.getElementById('sp-next').addEventListener('click', function() {
        currentTrack = (currentTrack + 1) % tracks.length;
        controller.loadUri(tracks[currentTrack]);
        controller.togglePlay();
        document.getElementById('sp-play').innerHTML = '&#10074;&#10074;';
      });

      // CLOSE button
      document.getElementById('sp-close').addEventListener('click', function() {
        controller.togglePlay();
        bar.remove();
        document.body.style.paddingBottom = '';
      });
    });
  };
})();
