/**
 * Persistent Spotify player — auto-injects on every page.
 * Plays anti-government punk (Dead Kennedys + Propagandhi).
 * Sticks to bottom of viewport. Autoplay on first user interaction.
 */
(function() {
  // Anti-government track queue — DK + Propagandhi
  var tracks = [
    '5wga4LOSV23mMOHnRsPK4X', // California Uber Alles — DK
    '1FKrVbPYHJcBMBEON2f48B', // Holiday in Cambodia — DK
    '5MbHKXeFnYaKwMG8JIKPbj', // Kill the Poor — DK
    '4kqBOgIiCAMWd3ZjTGBbYn', // Government Flu — DK
    '3PjTwHBwjxKiPu5nkEjBI5', // Police Truck — DK
    '4qrT9xCo6CIqdvRfD8SJEA', // Stars and Stripes of Corruption — DK
    '3VjpSK56VYgDYzJlm7HMqH', // Dear Coach's Corner — Propagandhi
    '0DjRBPkkuxLv7ZHXL9XFHH', // And We Thought Nation States Were a Bad Idea — Propagandhi
    '6fKQBf4Fh5ITFInVBfV1GE', // Back to the Motor League — Propagandhi
  ];

  var currentTrack = Math.floor(Math.random() * tracks.length);

  // Build the player bar
  var bar = document.createElement('div');
  bar.id = 'spotify-bar';
  bar.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;max-width:900px;margin:0 auto;">' +
      '<span style="color:#1db954;font-size:0.75rem;white-space:nowrap;">NOW PLAYING</span>' +
      '<iframe id="sp-frame" style="border-radius:8px;flex:1;" ' +
        'src="https://open.spotify.com/embed/track/' + tracks[currentTrack] + '?utm_source=generator&theme=0&autoplay=1" ' +
        'width="100%" height="80" frameBorder="0" ' +
        'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="eager"></iframe>' +
      '<button id="sp-next" style="background:#1db954;color:#000;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-weight:bold;font-size:1.1rem;" title="Next track">&#9654;</button>' +
      '<button id="sp-close" style="background:transparent;color:#666;border:1px solid #333;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:0.8rem;" title="Close player">&times;</button>' +
    '</div>';

  bar.style.cssText =
    'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
    'background:#0a0a0a;border-top:1px solid #1db954;' +
    'padding:6px 12px;box-shadow:0 -4px 20px rgba(0,0,0,0.8);';

  document.body.appendChild(bar);
  // Add body padding so content isn't hidden behind player
  document.body.style.paddingBottom = '98px';

  // Next track button
  document.getElementById('sp-next').addEventListener('click', function() {
    currentTrack = (currentTrack + 1) % tracks.length;
    document.getElementById('sp-frame').src =
      'https://open.spotify.com/embed/track/' + tracks[currentTrack] + '?utm_source=generator&theme=0&autoplay=1';
  });

  // Close button
  document.getElementById('sp-close').addEventListener('click', function() {
    bar.remove();
    document.body.style.paddingBottom = '';
  });

  // On first interaction, reload iframe to trigger autoplay
  function triggerPlay() {
    var frame = document.getElementById('sp-frame');
    if (frame) {
      var src = frame.src;
      frame.src = '';
      frame.src = src;
    }
    document.removeEventListener('click', triggerPlay);
    document.removeEventListener('scroll', triggerPlay);
    document.removeEventListener('keydown', triggerPlay);
  }
  document.addEventListener('click', triggerPlay, { once: true });
  document.addEventListener('scroll', triggerPlay, { once: true });
  document.addEventListener('keydown', triggerPlay, { once: true });
})();
