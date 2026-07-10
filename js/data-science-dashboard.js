/**
 * TENET5 - Cinematic Intelligence Tour
 * Powered by Anime.js for scroll-linked and autoplay documentarian progression.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNodes();
  initTimeline();
  initControls();
});

let masterTimeline;
let isPlaying = false;

/* ── 1. GENERATE SCENE ELEMENTS ── */
function initNodes() {
  const graphContainer = document.getElementById('graph-container');
  const predContainer = document.getElementById('prediction-container');
  
  if (!graphContainer || !predContainer) return;

  // Scene 2 Nodes
  for (let i = 0; i < 40; i++) {
    const node = document.createElement('div');
    node.className = 'pred-node scene2-node';
    node.style.left = `${Math.random() * 80 + 10}vw`;
    node.style.top = `${Math.random() * 80 + 10}vh`;
    graphContainer.appendChild(node);
  }

  // Scene 3 Prediction Lines
  for (let i = 0; i < 15; i++) {
    const line = document.createElement('div');
    line.className = 'pred-line scene3-line';
    line.style.left = '10vw';
    line.style.top = `${Math.random() * 80 + 10}vh`;
    line.style.width = `${Math.random() * 60 + 20}vw`;
    predContainer.appendChild(line);
  }
}

/* ── 2. ANIME.JS TIMELINE ── */
function initTimeline() {
  // We use autoplay: false because we want to scrub it via scroll or custom play button
  masterTimeline = anime.timeline({
    autoplay: false,
    duration: 10000, // Total documentary length if played straight (10s)
    easing: 'easeInOutSine',
    update: function(anim) {
      updateScrubber(anim.progress);
    }
  });

  // --- SCENE 1: Intro ---
  masterTimeline
    .add({
      targets: '#scene-1',
      opacity: [0, 1],
      duration: 1000,
      begin: () => { document.getElementById('scene-1').classList.add('active'); }
    })
    .add({
      targets: '#scene-1 .scene-title, #scene-1 .scene-subtitle',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(200)
    }, '-=800')
    .add({
      targets: '#scene-1',
      opacity: [1, 0],
      duration: 1000,
      complete: () => { document.getElementById('scene-1').classList.remove('active'); }
    }, '+=1500'); // Hold scene 1

  // --- SCENE 2: Accountability Graph ---
  masterTimeline
    .add({
      targets: '#scene-2',
      opacity: [0, 1],
      duration: 1000,
      begin: () => { document.getElementById('scene-2').classList.add('active'); }
    }, '-=500')
    .add({
      targets: '#scene-2 .scene-title, #scene-2 .scene-subtitle',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(200)
    }, '-=800')
    .add({
      targets: '.scene2-node',
      scale: [0, 1],
      opacity: [0, 1],
      delay: anime.stagger(50, {grid: [10, 4], from: 'center'})
    }, '-=500')
    .add({
      targets: '#scene-2',
      opacity: [1, 0],
      duration: 1000,
      complete: () => { document.getElementById('scene-2').classList.remove('active'); }
    }, '+=1500'); // Hold scene 2

  // --- SCENE 3: Future Predictions ---
  masterTimeline
    .add({
      targets: '#scene-3',
      opacity: [0, 1],
      duration: 1000,
      begin: () => { document.getElementById('scene-3').classList.add('active'); }
    }, '-=500')
    .add({
      targets: '#scene-3 .scene-title, #scene-3 .scene-subtitle',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(200)
    }, '-=800')
    .add({
      targets: '.scene3-line',
      scaleX: [0, 1],
      opacity: [0, 1],
      delay: anime.stagger(100)
    }, '-=500');
}

/* ── 3. CONTROLS & SCROLL JACKING ── */
function initControls() {
  const playBtn = document.getElementById('btn-play');
  const scrollContainer = document.getElementById('scroll-container');
  const scrubberTrack = document.getElementById('scrubber-track');

  // Play / Pause Toggle
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      masterTimeline.pause();
      playBtn.innerHTML = '<svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L17 10L1 19V1Z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>';
    } else {
      masterTimeline.play();
      playBtn.innerHTML = '<svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="4" height="18" fill="white"/><rect x="9" y="1" width="4" height="18" fill="white"/></svg>';
    }
    isPlaying = !isPlaying;
  });

  // Scroll Jacking (Link scroll position to timeline progress)
  window.addEventListener('scroll', () => {
    if (isPlaying) return; // Let autoplay win if active
    
    // Calculate scroll percentage
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    
    // Seek timeline
    masterTimeline.seek(masterTimeline.duration * scrollPercent);
  });

  // Scrubber Clicking
  scrubberTrack.addEventListener('click', (e) => {
    const rect = scrubberTrack.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    // Auto-scroll the page to match the scrub position
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * percent);
    
    if (!isPlaying) {
      masterTimeline.seek(masterTimeline.duration * percent);
    }
  });

  // Audio Toggle (Stub for LIRIL Voiceover)
  const audioBtn = document.getElementById('btn-audio');
  let audioOn = false;
  audioBtn.addEventListener('click', () => {
    audioOn = !audioOn;
    audioBtn.innerText = audioOn ? "VOICEOVER: ON" : "VOICEOVER: OFF";
    audioBtn.style.color = audioOn ? "#38bdf8" : "rgba(255,255,255,0.5)";
  });
}

function updateScrubber(progress) {
  document.getElementById('scrubber-fill').style.width = progress + '%';
  document.getElementById('scrubber-thumb').style.left = progress + '%';
}
