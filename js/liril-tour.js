/**
 * LIRIL GLOBAL CINEMATIC TOUR ENGINE
 * Injects a cinematic overlay and orchestrates a data documentary.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject the floating trigger button
  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'tour-trigger-btn';
  triggerBtn.innerHTML = `
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
      <path d="M1 1L13 8L1 15V1Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
    PLAY DAILY BRIEF
  `;
  document.body.appendChild(triggerBtn);

  triggerBtn.addEventListener('click', startTour);
});

let tourTimeline;
let isTourPlaying = false;

async function startTour() {
  document.body.classList.add('tour-active');
  
  // 1. Fetch the daily brief
  let briefData;
  try {
    const res = await fetch('daily_brief.json');
    briefData = await res.json();
  } catch (e) {
    console.error("Failed to load daily brief:", e);
    return;
  }

  // 2. Build the Overlay UI
  buildOverlay();

  // 3. Orchestrate Anime.js Timeline
  buildTimeline(briefData);
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'liril-tour-overlay';
  overlay.innerHTML = `
    <div class="tour-narrative-container">
      <h1 class="tour-title" id="tour-title">Initializing...</h1>
      <p class="tour-subtitle" id="tour-subtitle"></p>
    </div>
    <div class="tour-controls">
      <div class="tour-timeline-container">
        <button class="tour-btn-play" id="tour-btn-play">
          <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor"><rect x="1" y="1" width="4" height="18" fill="white"/><rect x="9" y="1" width="4" height="18" fill="white"/></svg>
        </button>
        <div class="tour-scrubber-track" id="tour-scrubber-track">
          <div class="tour-scrubber-fill" id="tour-scrubber-fill"></div>
          <div class="tour-scrubber-thumb" id="tour-scrubber-thumb"></div>
        </div>
        <button class="tour-btn-close" id="tour-btn-close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M1 1L15 15M15 1L1 15" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Bind close
  document.getElementById('tour-btn-close').addEventListener('click', endTour);
}

function buildTimeline(data) {
  const overlay = document.getElementById('liril-tour-overlay');
  overlay.classList.add('active');

  tourTimeline = anime.timeline({
    autoplay: true,
    update: function(anim) {
      document.getElementById('tour-scrubber-fill').style.width = anim.progress + '%';
      document.getElementById('tour-scrubber-thumb').style.left = anim.progress + '%';
    }
  });
  isTourPlaying = true;

  // Fade in overlay
  tourTimeline.add({
    targets: overlay,
    opacity: [0, 1],
    duration: 800,
    easing: 'easeInOutQuad'
  });

  // Build scenes from JSON
  data.scenes.forEach(scene => {
    
    // Animate text injection
    tourTimeline.add({
      targets: '#tour-title',
      opacity: 0,
      translateY: 20,
      duration: 300,
      complete: () => {
        document.getElementById('tour-title').innerText = scene.title;
        document.getElementById('tour-subtitle').innerText = scene.text;
      }
    });

    tourTimeline.add({
      targets: ['.tour-title', '.tour-subtitle'],
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: anime.stagger(200)
    });

    // Spotlight elements if provided
    if (scene.spotlightSelector) {
      tourTimeline.add({
        targets: scene.spotlightSelector,
        duration: 800,
        begin: () => {
          const el = document.querySelector(scene.spotlightSelector);
          if(el) {
            el.classList.add('tour-spotlight');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        },
        complete: () => {
          // Remove spotlight after scene duration if needed, or keep it.
        }
      }, '-=800');
    }

    // Hold scene
    tourTimeline.add({
      duration: scene.duration || 3000
    });

    // Clean up spotlight before next scene
    if (scene.spotlightSelector) {
       tourTimeline.add({
         duration: 100,
         begin: () => {
           const el = document.querySelector(scene.spotlightSelector);
           if(el) el.classList.remove('tour-spotlight');
         }
       });
    }
  });
  
  // End sequence
  tourTimeline.add({
    targets: overlay,
    opacity: [1, 0],
    duration: 800,
    complete: endTour
  });

  // Bind Play/Pause
  const playBtn = document.getElementById('tour-btn-play');
  playBtn.addEventListener('click', () => {
    if (isTourPlaying) {
      tourTimeline.pause();
      playBtn.innerHTML = '<svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor"><path d="M1 1L17 10L1 19V1Z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>';
    } else {
      tourTimeline.play();
      playBtn.innerHTML = '<svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor"><rect x="1" y="1" width="4" height="18" fill="white"/><rect x="9" y="1" width="4" height="18" fill="white"/></svg>';
    }
    isTourPlaying = !isTourPlaying;
  });
}

function endTour() {
  document.body.classList.remove('tour-active');
  const overlay = document.getElementById('liril-tour-overlay');
  if (overlay) overlay.remove();
  
  // Clean up any stray spotlights
  document.querySelectorAll('.tour-spotlight').forEach(el => el.classList.remove('tour-spotlight'));
}
