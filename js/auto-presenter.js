/* ═══════════════════════════════════════════════════════════════════════
   TENET⁵ Auto Presenter — Cinematic Audio/Visual Sync Engine
   Coordinates generated TTS audio, VTT subtitles, and scroll-snapping slides.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  if (window.__TENET5_AUTO_PRESENTER) return;
  window.__TENET5_AUTO_PRESENTER = true;

  var currentAudio = null;
  var currentSubtitles = [];
  var isPlaying = false;
  var slideshowActive = false;
  
  var pageSlug = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

  // Create UI
  var overlay = document.createElement('div');
  overlay.className = 'cinematic-subs';
  document.body.appendChild(overlay);

  var playBtnContainer = document.createElement('div');
  playBtnContainer.className = 'global-play-toggle';
  playBtnContainer.innerHTML = '<button id="btn-play-pres">▶ Play Cinematic Presentation</button>';
  document.body.appendChild(playBtnContainer);

  document.getElementById('btn-play-pres').addEventListener('click', togglePresentation);

  // VTT Parser
  function parseVTT(vttText) {
    var lines = vttText.split('\n');
    var entries = [];
    var currentEntry = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.includes('-->')) {
            var parts = line.split(' --> ');
            currentEntry = {
                start: timeToSec(parts[0]),
                end: timeToSec(parts[1]),
                text: ''
            };
        } else if (line !== '' && line !== 'WEBVTT' && currentEntry) {
            currentEntry.text += line + ' ';
        } else if (line === '' && currentEntry) {
            currentEntry.text = currentEntry.text.trim();
            entries.push(currentEntry);
            currentEntry = null;
        }
    }
    if (currentEntry) entries.push(currentEntry);
    return entries;
  }

  function timeToSec(timeStr) {
      if (!timeStr) return 0;
      var p = timeStr.split(':');
      var s = 0;
      if (p.length === 3) {
          s = parseFloat(p[0]) * 3600 + parseFloat(p[1]) * 60 + parseFloat(p[2]);
      } else if (p.length === 2) {
          s = parseFloat(p[0]) * 60 + parseFloat(p[1]);
      } else {
          s = parseFloat(p[0]);
      }
      return parseFloat(s.toFixed(3));
  }

  // Audio lifecycle
  function playSlideAudio(slideEl, onComplete) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    overlay.textContent = '';
    overlay.classList.remove('active');

    var narrateText = slideEl.getAttribute('data-narrate');
    if (!narrateText) return onComplete();

    var slideId = slideEl.getAttribute('id');
    if (!slideId) {
      // Find the first child with an ID if slide wrapper doesn't have it
      var innerNarrate = slideEl.querySelector('[data-narrate][id]');
      if (innerNarrate) slideId = innerNarrate.getAttribute('id');
      else return onComplete();
    }

    var audioUrl = 'audio/dossiers/' + pageSlug + '-' + slideId + '.mp3';
    var vttUrl = 'audio/dossiers/' + pageSlug + '-' + slideId + '.vtt';

    // Fetch subtitles
    fetch(vttUrl).then(function(res) {
        if (!res.ok) throw new Error('No VTT');
        return res.text();
    }).then(function(text) {
        currentSubtitles = parseVTT(text);
    }).catch(function() {
        currentSubtitles = [];
    });

    currentAudio = new Audio(audioUrl);
    
    currentAudio.addEventListener('timeupdate', function() {
        var t = currentAudio.currentTime;
        var activeSub = currentSubtitles.find(function(sub) {
            return t >= sub.start && t <= sub.end;
        });
        if (activeSub) {
            overlay.textContent = activeSub.text;
            overlay.classList.add('active');
        } else {
            overlay.textContent = '';
            overlay.classList.remove('active');
        }
    });

    currentAudio.addEventListener('ended', function() {
        overlay.classList.remove('active');
        onComplete();
    });

    currentAudio.addEventListener('error', function() {
        // Fallback: If audio is missing, just wait 3 seconds and skip
        setTimeout(onComplete, 3000);
    });

    var playPromise = currentAudio.play();
    if (playPromise !== undefined) {
        playPromise.catch(function(e) {
            console.warn('Playback prevented', e);
            onComplete();
        });
    }
  }

  function advanceSequence(slides, currentIndex) {
      if (!slideshowActive) return;

      var currentSlide = slides[currentIndex];
      if (currentSlide) {
          currentSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Wait for smooth scroll to finish before talking
          setTimeout(function() {
              if (!slideshowActive) return;
              playSlideAudio(currentSlide, function() {
                  if (currentIndex + 1 < slides.length) {
                      advanceSequence(slides, currentIndex + 1);
                  } else {
                      togglePresentation(); // Finish
                  }
              });
          }, 800);
      }
  }

  function togglePresentation() {
      var btn = document.getElementById('btn-play-pres');
      
      if (slideshowActive) {
          slideshowActive = false;
          if (currentAudio) {
              currentAudio.pause();
          }
          overlay.classList.remove('active');
          document.body.classList.remove('cinematic-lock');
          btn.innerHTML = '▶ Play Cinematic Presentation';
          btn.classList.remove('active');
      } else {
          // Start sequence
          var slides = [];
          
          // First pass: locate `.pres-slide` containing `data-narrate`
          var presSlides = Array.from(document.querySelectorAll('.pres-slide')).filter(function(el) {
              return el.hasAttribute('data-narrate') || el.querySelector('[data-narrate]');
          });
          
          // Second pass: gather all `[data-narrate]` tags directly
          document.querySelectorAll('[data-narrate]').forEach(function(narrEl) {
              var parentSlide = presSlides.find(function(s) { return s.contains(narrEl) || s === narrEl; });
              if (parentSlide) {
                  if (slides.indexOf(parentSlide) === -1) slides.push(parentSlide);
              } else {
                  slides.push(narrEl);
              }
          });

          if (slides.length === 0) {
              btn.innerHTML = 'No Narration Available';
              setTimeout(function() { btn.innerHTML = '▶ Play Cinematic Presentation'; }, 2000);
              return;
          }

          slideshowActive = true;
          document.body.classList.add('cinematic-lock');
          btn.innerHTML = '⬛ Stop Presentation';
          btn.classList.add('active');
          
          // Jump to first narrated slide
          advanceSequence(slides, 0);
      }
  }

  // Hide button if no narration data exists on page
  document.addEventListener('DOMContentLoaded', function() {
      if (!document.querySelector('[data-narrate]')) {
          playBtnContainer.style.display = 'none';
      }
  });

})();
