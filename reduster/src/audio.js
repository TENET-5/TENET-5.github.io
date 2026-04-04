// ── Web Audio Engine + LIRIL Voice TTS ──

let audioCtx = null;
let _masterGain = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = audioCtx.createGain();
    _masterGain.gain.value = 0.8;
    _masterGain.connect(dest());
    window._masterGain = _masterGain; // settings slider access
  }
}

/** Connect a node to the master gain bus instead of destination directly. */
function dest() { return _masterGain || audioCtx?.destination; }

export function playSound(type, opts = {}) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') { audioCtx.resume().catch(() => {}); return; }
  const now = audioCtx.currentTime;
  const vol = opts.volume ?? 1.0;

  if (type === 'shoot') {
    // Per-weapon tuning via opts.weaponType
    const wt = opts.weaponType || 'rifle';
    const pitchMult = wt === 'shotgun' ? 0.55 : wt === 'pistol' ? 1.4 : 1.0;
    const noiseDur  = wt === 'shotgun' ? 0.22 : wt === 'pistol' ? 0.08 : 0.14;

    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * noiseDur, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / audioCtx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * (wt === 'shotgun' ? 18 : 30)) * 0.6;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3000 * pitchMult, now);
    lp.frequency.exponentialRampToValueAtTime(300 * pitchMult, now + noiseDur);
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.35 * vol, now);
    ng.gain.exponentialRampToValueAtTime(0.01, now + noiseDur);
    noise.connect(lp); lp.connect(ng); ng.connect(dest());
    noise.start(now);

    const thump = audioCtx.createOscillator();
    const tg = audioCtx.createGain();
    thump.connect(tg); tg.connect(dest());
    thump.frequency.setValueAtTime(140 * pitchMult, now);
    thump.frequency.exponentialRampToValueAtTime(30 * pitchMult, now + 0.09);
    tg.gain.setValueAtTime(0.28 * vol, now);
    tg.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    thump.start(now); thump.stop(now + 0.09);

    if (wt !== 'shotgun') {
      const crack = audioCtx.createOscillator();
      const cg = audioCtx.createGain();
      crack.connect(cg); cg.connect(dest());
      crack.type = 'square';
      crack.frequency.setValueAtTime(2200 * pitchMult, now);
      crack.frequency.exponentialRampToValueAtTime(220 * pitchMult, now + 0.02);
      cg.gain.setValueAtTime(0.15 * vol, now);
      cg.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
      crack.start(now); crack.stop(now + 0.03);
    }

  } else if (type === 'reload') {
    for (let i = 0; i < 3; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(dest());
      osc.frequency.value = 200 + i * 50;
      const t = now + i * 0.15;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
    }

  } else if (type === 'hit') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(dest());
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now); osc.stop(now + 0.05);

  } else if (type === 'headshot') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(dest());
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(3000, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);

  } else if (type === 'death') {
    for (let i = 0; i < 3; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(dest());
      osc.frequency.value = 200 - i * 40;
      const t = now + i * 0.2;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
    }

  } else if (type === 'explosion') {
    [40, 80, 200].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(dest());
      o.type = i === 2 ? 'square' : 'sine';
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.3, now + 0.4);
      g.gain.setValueAtTime(i === 2 ? 0.15 : 0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + i * 0.1);
      o.start(now); o.stop(now + 0.5 + i * 0.1);
    });
    return;
  } else if (type === 'pickup') {
    [500, 700, 900].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(dest());
      osc.frequency.value = freq;
      const t = now + i * 0.06;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t); osc.stop(t + 0.08);
    });

  } else if (type === 'footstep') {
    const o1 = audioCtx.createOscillator();
    const g1 = audioCtx.createGain();
    o1.connect(g1); g1.connect(dest());
    o1.frequency.setValueAtTime(80, now);
    o1.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    g1.gain.setValueAtTime(0.18, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    o1.start(now); o1.stop(now + 0.1);
    return;
  } else if (type === 'drone_buzz') {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const distNode = audioCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = (Math.PI + 300) * x / (Math.PI + 300 * Math.abs(x)); }
    distNode.curve = curve;
    o.connect(distNode); distNode.connect(g); g.connect(dest());
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120 + Math.random() * 20, now);
    o.frequency.linearRampToValueAtTime(110, now + 0.3);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    o.start(now); o.stop(now + 0.3);
    return;
  } else if (type === 'emptyMag') {
    // Dry click — bolt on empty chamber
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(dest());
    o.type = 'square';
    o.frequency.setValueAtTime(2200, now);
    o.frequency.exponentialRampToValueAtTime(800, now + 0.025);
    g.gain.setValueAtTime(0.12 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    o.start(now); o.stop(now + 0.03);
    return;
  } else if (type === 'melee') {
    // Blunt thud impact
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.12, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / audioCtx.sampleRate;
      d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40) * 0.5;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.5 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    src.connect(lp); lp.connect(g); g.connect(dest());
    src.start(now);
    return;
  }
}

export function startAmbient() {
  if (!audioCtx) return;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.015;
  const src = audioCtx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 400;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.08;
  src.connect(lp); lp.connect(gain); gain.connect(dest());
  src.start();
}

// ── Ambient loop nodes (persistent) ──
let _engineNode = null, _engineGain = null;
let _campfireNode = null, _campfireGain = null;
let _windNode = null, _windGain = null;

export function startVehicleEngine() {
  if (!audioCtx || _engineNode) return;
  const osc = audioCtx.createOscillator();
  const dist = audioCtx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = Math.tanh(x * 8) * 0.6; }
  dist.curve = curve;
  const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
  _engineGain = audioCtx.createGain(); _engineGain.gain.value = 0;
  osc.type = 'sawtooth'; osc.frequency.value = 55;
  osc.connect(dist); dist.connect(lp); lp.connect(_engineGain); _engineGain.connect(dest());
  osc.start();
  _engineNode = osc;
  _engineGain.gain.setTargetAtTime(0.18, audioCtx.currentTime, 0.3);
}

export function stopVehicleEngine() {
  if (!_engineGain || !_engineNode) return;
  _engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
  const n = _engineNode;
  setTimeout(() => { try { n.stop(); } catch(_) {} }, 600);
  _engineNode = null; _engineGain = null;
}

export function setVehicleRPM(speed) {
  if (!_engineNode) return;
  // speed in m/s → engine pitch 55–120 Hz
  _engineNode.frequency.setTargetAtTime(55 + Math.abs(speed) * 3, audioCtx.currentTime, 0.1);
}

export function startCampfireAmbient() {
  if (!audioCtx || _campfireNode) return;
  const len = audioCtx.sampleRate * 2;
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    // Pink-ish noise with slow amplitude envelope → crackling fire
    const t = i / audioCtx.sampleRate;
    d[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.abs(Math.sin(t * 2.3 + Math.random() * 0.5)));
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
  const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
  _campfireGain = audioCtx.createGain(); _campfireGain.gain.value = 0;
  src.connect(hp); hp.connect(lp); lp.connect(_campfireGain); _campfireGain.connect(dest());
  src.start();
  _campfireNode = src;
  _campfireGain.gain.setTargetAtTime(0.06, audioCtx.currentTime, 1.0);
}

export function stopCampfireAmbient() {
  if (!_campfireGain || !_campfireNode) return;
  _campfireGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.8);
  const n = _campfireNode;
  setTimeout(() => { try { n.stop(); } catch(_) {} }, 1500);
  _campfireNode = null; _campfireGain = null;
}

export function startWindAmbient(intensity = 0.5) {
  if (!audioCtx) return;
  if (_windNode) { _windGain.gain.setTargetAtTime(intensity * 0.07, audioCtx.currentTime, 1.0); return; }
  const len = audioCtx.sampleRate * 4;
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = audioCtx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 0.3;
  _windGain = audioCtx.createGain(); _windGain.gain.value = 0;
  src.connect(bp); bp.connect(_windGain); _windGain.connect(dest());
  src.start();
  _windNode = src;
  _windGain.gain.setTargetAtTime(intensity * 0.07, audioCtx.currentTime, 1.5);
}

export function stopWindAmbient() {
  if (!_windGain || !_windNode) return;
  _windGain.gain.setTargetAtTime(0, audioCtx.currentTime, 1.5);
  const n = _windNode;
  setTimeout(() => { try { n.stop(); } catch(_) {} }, 2500);
  _windNode = null; _windGain = null;
}

// Surface-aware footstep: 'snow' | 'concrete' | 'grass' | 'wood'
export function playFootstep(surface = 'grass') {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;
  if (surface === 'snow') {
    // High crunch: short burst of high-freq noise
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.06, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / d.length * 6);
    const src = audioCtx.createBufferSource(); src.buffer = buf;
    const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200;
    const g = audioCtx.createGain(); g.gain.setValueAtTime(0.22, now);
    src.connect(hp); hp.connect(g); g.connect(dest()); src.start(now);
  } else if (surface === 'concrete') {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(dest());
    o.frequency.setValueAtTime(90, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.07);
    g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    o.start(now); o.stop(now + 0.09);
  } else if (surface === 'wood') {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'triangle'; o.connect(g); g.connect(dest());
    o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.05);
    g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    o.start(now); o.stop(now + 0.07);
  } else { // grass / default
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(dest());
    o.frequency.setValueAtTime(80, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    o.start(now); o.stop(now + 0.1);
  }
}

// Sprint panting — plays a rhythmic exhale sound
export function playBreath(intensity = 1.0) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.18, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const t = i / audioCtx.sampleRate;
    d[i] = (Math.random() * 2 - 1) * Math.sin(t * 40) * Math.exp(-t * 12) * intensity;
  }
  const src = audioCtx.createBufferSource(); src.buffer = buf;
  const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.8;
  const g = audioCtx.createGain(); g.gain.setValueAtTime(0.12 * intensity, now);
  src.connect(bp); bp.connect(g); g.connect(dest()); src.start(now);
}

// Play a mission objective completion chime
export function playObjectiveComplete() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'sine'; o.connect(g); g.connect(dest());
    o.frequency.value = freq;
    const t = now + i * 0.12;
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.start(t); o.stop(t + 0.25);
  });
}

export function playMissionFail() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [300, 200, 150].forEach((freq, i) => {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'sawtooth'; o.connect(g); g.connect(dest());
    o.frequency.value = freq;
    const t = now + i * 0.2;
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.start(t); o.stop(t + 0.18);
  });
}

// ═══════════════════════════════════════════════════════════════
// ENVIRONMENTAL AMBIENT SYSTEM — location + time-of-day aware
// Auto-plays contextual sounds: crows, crickets, creaks, water
// ═══════════════════════════════════════════════════════════════
let _envTimers = {};
let _envEnabled = false;

/**
 * Start the environmental ambient system. Call once after game starts.
 * Spawns periodic random sounds based on player location and time.
 */
export function startEnvironmentAmbient() {
  if (_envEnabled) return;
  _envEnabled = true;

  // Crows/ravens — daytime, every 8-20s
  _envTimers.crows = setInterval(() => {
    if (!audioCtx || !_envEnabled) return;
    const dayT = window._dayTime ?? 0.5;
    if (dayT < 0.25 || dayT > 0.75) return; // Only during day
    if (Math.random() > 0.4) return; // 40% chance each tick

    const now = audioCtx.currentTime;
    // Crow caw: short harsh noise burst at 800-1200Hz
    for (let c = 0; c < 2 + Math.floor(Math.random() * 3); c++) {
      const t = now + c * 0.25;
      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(500, t + 0.15);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.03, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1000; bp.Q.value = 2;
      osc.connect(bp); bp.connect(g); g.connect(dest());
      osc.start(t); osc.stop(t + 0.15);
    }
  }, 12000);

  // Crickets — nighttime, continuous chirp
  _envTimers.crickets = setInterval(() => {
    if (!audioCtx || !_envEnabled) return;
    const dayT = window._dayTime ?? 0.5;
    if (dayT > 0.22 && dayT < 0.78) return; // Only at night
    if (Math.random() > 0.5) return;

    const now = audioCtx.currentTime;
    // Cricket: rapid high-frequency pulse
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.08;
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 4500 + Math.random() * 500;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.015, t);
      g.gain.setValueAtTime(0, t + 0.03);
      osc.connect(g); g.connect(dest());
      osc.start(t); osc.stop(t + 0.04);
    }
  }, 5000);

  // Building creak — random, every 15-30s
  _envTimers.creaks = setInterval(() => {
    if (!audioCtx || !_envEnabled) return;
    if (Math.random() > 0.3) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200 + Math.random() * 100, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.02, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(g); g.connect(dest());
    osc.start(now); osc.stop(now + 0.3);
  }, 20000);

  // Distant gunfire — occasional, adds tension
  _envTimers.distantGunfire = setInterval(() => {
    if (!audioCtx || !_envEnabled) return;
    if (Math.random() > 0.25) return;

    const now = audioCtx.currentTime;
    const count = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const t = now + i * (0.08 + Math.random() * 0.12);
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.08, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / d.length * 5);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 600; // Distant = muffled
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.02, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      src.connect(lp); lp.connect(g); g.connect(dest());
      src.start(t);
    }
  }, 30000);
}

export function stopEnvironmentAmbient() {
  _envEnabled = false;
  for (const key of Object.keys(_envTimers)) {
    clearInterval(_envTimers[key]);
  }
  _envTimers = {};
}

// ── Weather-driven ambient audio ─────────────────────────────────────────────
// Call each frame (or on weather change) from engine.js.
// type: 'clear' | 'rain' | 'fog' | 'snow' | 'blizzard'
// windStrength: 0–1 from getWind().strength

let _rainNode = null, _rainGain = null;
let _lastWeatherType = 'clear';

export function updateAmbientWeather(type, windStrength = 0) {
  if (!audioCtx) return;

  // ── Wind howl ──
  const targetWind = (type === 'blizzard') ? 0.9
                   : (type === 'snow')     ? 0.5
                   : (type === 'rain')     ? 0.3
                   : windStrength * 0.6;
  if (targetWind > 0.05) {
    startWindAmbient(targetWind);
  } else {
    if (_windNode) stopWindAmbient();
  }

  // ── Rain loop — filtered noise pitched to a steady patter ──
  const wantRain = (type === 'rain' || type === 'blizzard');
  if (wantRain && !_rainNode) {
    const len = audioCtx.sampleRate * 3;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    // White noise shaped into rain patter — amplitude envelope with micro-pulses
    for (let i = 0; i < len; i++) {
      const t = i / audioCtx.sampleRate;
      const pulse = Math.pow(Math.abs(Math.sin(t * 1800 + Math.random() * 0.1)), 14);
      d[i] = (Math.random() * 2 - 1) * (0.4 + pulse * 0.6);
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf; src.loop = true;
    // HP to remove rumble, LP to remove hiss — leaves mid-freq patter
    const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200;
    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = 8000;
    _rainGain = audioCtx.createGain(); _rainGain.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(_rainGain);
    _rainGain.connect(dest());
    src.start();
    _rainNode = src;
    const vol = type === 'blizzard' ? 0.055 : 0.038;
    _rainGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 1.2);
  } else if (!wantRain && _rainNode) {
    _rainGain.gain.setTargetAtTime(0, audioCtx.currentTime, 1.5);
    const n = _rainNode;
    setTimeout(() => { try { n.stop(); } catch(_) {} }, 2500);
    _rainNode = null; _rainGain = null;
  } else if (wantRain && _rainNode && type !== _lastWeatherType) {
    // Adjust volume for blizzard vs normal rain
    const vol = type === 'blizzard' ? 0.055 : 0.038;
    _rainGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 1.0);
  }

  _lastWeatherType = type;
}


// ═══════════════════════════════════════════════════════════════
// WILDLIFE + BOREAL AMBIENT — needles wind, loon calls, wolves
// ═══════════════════════════════════════════════════════════════
let _needlesNode = null, _needlesGain = null;
let _wildlifeTimers = {};
let _wildlifeActive = false;
let _lastWildlifeWeather = '';

/**
 * updateWildlifeAudio — call ~1Hz from engine loop.
 * @param {number} gameTime  — 0..1 fraction of 24h day (0=midnight, 0.5=noon)
 * @param {string} weather   — 'clear'|'rain'|'snow'|'fog'|'blizzard'
 */
export function updateWildlifeAudio(gameTime, weather) {
  if (!audioCtx) return;

  // ── Wind-through-needles continuous layer ──
  const needlesVol = (weather === 'blizzard') ? 0.05
                   : (weather === 'snow' || weather === 'rain') ? 0.03
                   : 0.018;

  if (!_needlesNode) {
    const len = audioCtx.sampleRate * 6;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf; src.loop = true;
    // Narrow bandpass at ~900Hz — soft sibilant needle rustle
    const bp1 = audioCtx.createBiquadFilter(); bp1.type = 'bandpass'; bp1.frequency.value = 900; bp1.Q.value = 0.8;
    const bp2 = audioCtx.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 1400; bp2.Q.value = 1.2;
    _needlesGain = audioCtx.createGain(); _needlesGain.gain.value = 0;
    src.connect(bp1); bp1.connect(bp2); bp2.connect(_needlesGain); _needlesGain.connect(dest());
    src.start();
    _needlesNode = src;
  }
  _needlesGain.gain.setTargetAtTime(needlesVol, audioCtx.currentTime, 2.0);

  // ── Periodic wildlife sounds ──
  if (!_wildlifeActive) {
    _wildlifeActive = true;

    // Loon call — dawn/dusk only, every 40-90s (iconic Canadian lake)
    _wildlifeTimers.loon = setInterval(() => {
      if (!audioCtx) return;
      const t = window._dayTime ?? gameTime;
      const isDawnDusk = (t > 0.18 && t < 0.32) || (t > 0.68 && t < 0.82);
      if (!isDawnDusk || Math.random() > 0.45) return;
      const now = audioCtx.currentTime;
      // Loon: descending tremolo wail ~600→400Hz with vibrato
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(560, now + 0.2);
      osc.frequency.setValueAtTime(480, now + 0.5);
      osc.frequency.setValueAtTime(420, now + 0.9);
      osc.frequency.exponentialRampToValueAtTime(380, now + 1.6);
      // LFO vibrato: ±12Hz at 6Hz
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 6; lfo.type = 'sine';
      const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 12;
      lfo.connect(lfoGain); lfoGain.connect(osc.detune);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.04, now + 0.15);
      g.gain.setValueAtTime(0.04, now + 1.2);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000;
      osc.connect(lp); lp.connect(g); g.connect(dest());
      lfo.start(now); osc.start(now); lfo.stop(now + 1.8); osc.stop(now + 1.8);
    }, 45000);

    // Raven — daytime, every 15-30s, 2-4 harsh caws
    _wildlifeTimers.raven = setInterval(() => {
      if (!audioCtx) return;
      const t = window._dayTime ?? gameTime;
      if (t < 0.2 || t > 0.8) return;
      const wt = window._weatherType ?? weather;
      if (wt === 'blizzard') return;
      if (Math.random() > 0.5) return;
      const now = audioCtx.currentTime;
      const caws = 2 + Math.floor(Math.random() * 3);
      for (let c = 0; c < caws; c++) {
        const ct = now + c * (0.3 + Math.random() * 0.2);
        const n = audioCtx.createBufferSource();
        const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.18, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          const progress = i / d.length;
          d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(progress * Math.PI), 0.5);
        }
        n.buffer = buf;
        const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 3;
        const g = audioCtx.createGain(); g.gain.setValueAtTime(0.025, ct); g.gain.exponentialRampToValueAtTime(0.001, ct+0.18);
        n.connect(bp); bp.connect(g); g.connect(dest());
        n.start(ct);
      }
    }, 18000);

    // Distant wolf howl — night only, rare (every 120s, 20% chance)
    _wildlifeTimers.wolf = setInterval(() => {
      if (!audioCtx) return;
      const t = window._dayTime ?? gameTime;
      if (t > 0.25 && t < 0.75) return; // night only
      if (Math.random() > 0.2) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.4);
      osc.frequency.linearRampToValueAtTime(480, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(280, now + 2.5);
      const vib = audioCtx.createOscillator(); vib.frequency.value = 4.5;
      const vibG = audioCtx.createGain(); vibG.gain.value = 8;
      vib.connect(vibG); vibG.connect(osc.detune);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.035, now + 0.3);
      g.gain.setValueAtTime(0.035, now + 1.8);
      g.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
      osc.connect(lp); lp.connect(g); g.connect(dest());
      vib.start(now); osc.start(now); vib.stop(now+2.8); osc.stop(now+2.8);
    }, 120000);
  }
}

export function stopWildlifeAudio() {
  _wildlifeActive = false;
  for (const k of Object.keys(_wildlifeTimers)) clearInterval(_wildlifeTimers[k]);
  _wildlifeTimers = {};
  if (_needlesGain) _needlesGain.gain.setTargetAtTime(0, audioCtx?.currentTime ?? 0, 1.0);
  if (_needlesNode) {
    const n = _needlesNode;
    setTimeout(() => { try { n.stop(); } catch(_) {} }, 2000);
    _needlesNode = null; _needlesGain = null;
  }
}


// Uses Web Audio PannerNode with HRTF for directional sound
let _listenerRef = null; // Three.js camera ref

export function setAudioListener(camera) {
  _listenerRef = camera;
}

export function updateAudioListener() {
  if (!audioCtx || !_listenerRef) return;
  const listener = audioCtx.listener;
  const cam = _listenerRef;
  // Get world position of camera
  const parent = cam.parent?.parent; // yawObj
  if (!parent) return;
  const px = parent.position.x, py = parent.position.y + 1.6, pz = parent.position.z;
  if (listener.positionX) {
    listener.positionX.value = px;
    listener.positionY.value = py;
    listener.positionZ.value = pz;
  } else {
    listener.setPosition(px, py, pz);
  }
}

/**
 * Play a sound at a 3D world position with distance attenuation.
 * @param {string} type - sound type ('shoot','explosion','footstep','hit')
 * @param {number} x - world X
 * @param {number} y - world Y
 * @param {number} z - world Z
 * @param {number} volume - 0-1 (default 1)
 */
export function playSpatialSound(type, x, y, z, volume = 1.0) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') return;

  const panner = audioCtx.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 100;
  panner.rolloffFactor = 1.5;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 360;
  panner.setPosition(x, y, z);

  const gain = audioCtx.createGain();
  gain.gain.value = volume;

  const now = audioCtx.currentTime;

  if (type === 'shoot' || type === 'enemy_shoot') {
    // Distant gunshot: noise burst + thump
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.12, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / audioCtx.sampleRate;
      d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.5;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2000;
    src.connect(lp); lp.connect(gain); gain.connect(panner); panner.connect(dest());
    src.start(now);
  } else if (type === 'explosion') {
    // Low rumble + crack
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(oscGain); oscGain.connect(gain); gain.connect(panner); panner.connect(dest());
    osc.start(now); osc.stop(now + 0.5);
  } else if (type === 'footstep') {
    // Quick tap
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 100 + Math.random() * 60;
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(oscGain); oscGain.connect(gain); gain.connect(panner); panner.connect(dest());
    osc.start(now); osc.stop(now + 0.05);
  }
}

// ── LIRIL AI Voice — British Female Tactical Callouts ──
export const lirilVoice = {
  synth: window.speechSynthesis,
  voice: null,
  lastSpoke: 0,
  minInterval: 3000,

  init() {
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.voice =
        voices.find(v => v.lang.startsWith('en-GB') && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang.startsWith('en-GB') && (v.name.includes('Hazel') || v.name.includes('Sonia') || v.name.includes('Amy'))) ||
        voices.find(v => v.lang.startsWith('en-GB')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
      if (this.voice) console.log('[LIRIL Voice]', this.voice.name, this.voice.lang);
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) this.synth.onvoiceschanged = loadVoices;
  },

  speak(text, priority = false) {
    const now = Date.now();
    if (!priority && now - this.lastSpoke < this.minInterval) return;
    if (!this.voice) return;
    this.synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.voice = this.voice;
    utt.rate = 1.1;
    utt.pitch = 1.05;
    utt.volume = 0.8;
    this.synth.speak(utt);
    this.lastSpoke = now;
  }
};

export const LIRIL_CALLOUTS = {
  waveStart: [
    'Contacts ahead. Stay sharp.',
    'Hostiles inbound. Weapons free.',
    'New wave. Keep your head down.',
    'Movement detected. Engage at will.',
    'Here they come. Give them nothing.',
  ],
  bossWave: [
    'Heavy armour incoming. Use explosives.',
    'Boss wave. This is going to be loud.',
    'Armoured targets. Aim for the head.',
  ],
  kill: ['Target down.', 'Hostile eliminated.', 'Good kill.', 'Scratch one.'],
  headshot: ['Headshot. Clean.', 'Right between the eyes.', 'Perfect shot.', 'That one felt personal.'],
  multiKill: ['Multiple contacts down. Impressive.', 'Double kill. Keep it up.', 'You are on fire.'],
  lowHealth: ['You are hit. Find cover.', 'Taking damage. Get behind something.', 'Medic. You need to heal.'],
  reload: ['Reloading. Cover me.', 'Mag change.', 'Going dry. Reloading.'],
  airstrike: ['Avro Arrow inbound. Danger close.', 'Airstrike confirmed. Get clear.', 'Arrow on station. Bombs away.'],
  grenade: ['Quack quack. Duck out.', 'Rubber duck deployed.', 'Duck grenade. Fire in the hole.'],
  pickup: ['Supplies acquired.', 'Health pack. Good.', 'Ammo resupply.'],
  death: ['Soldier down. We will remember you.', 'K I A. Rest now.'],
  highCombo: ['Killstreak. You are unstoppable.', 'Combo multiplier active. Keep pushing.'],
};

export function lirilSay(category) {
  const lines = LIRIL_CALLOUTS[category];
  if (!lines || !lines.length) return;
  lirilVoice.speak(lines[Math.floor(Math.random() * lines.length)], category === 'death' || category === 'bossWave');
}

// ── Cpl Bloggins AI Voice — Nvidia Voice Systems (Routed through LirilClaw) ──
export const blogginsVoice = {
  lastSpoke: 0,
  minInterval: 4000,

  init() {
    console.log('[Bloggins Voice] Nvidia Voice Systems remote TTS initialized over Localhost.');
  },

  async speak(text, priority = false) {
    const now = Date.now();
    if (!priority && now - this.lastSpoke < this.minInterval) return;
    this.lastSpoke = now;

    try {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      
      const res = await fetch('http://127.0.0.1:8091/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text, 
          voice: 'action_hero_male' 
        })
      });
      
      if (!res.ok) {
        throw new Error('TTS Bridge responded with ' + res.status);
      }
      
      const arrayBuffer = await res.arrayBuffer();
      // Use standard callback signature for compatibility
      audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(dest());
        source.start(0);
      }, function(e) { console.error("Error decoding TTS audio:", e); });

    } catch (e) {
      console.warn("Nvidia Voice Systems failed, fallback to silent:", e);
    }
  }
};

export const BLOGGINS_CALLOUTS = {
  pickup: [
    "Come get some.",
    "Groovy.",
    "Locked and loaded, eh?",
    "Looks like it's time to kick ass.",
    "Ooh, that's gotta hurt them."
  ],
  communist_kill: [
    "Better dead than red, asshole.",
    "Drop the hammer and sickle, bitch.",
    "Welcome to the free market, hoser.",
    "Canada forever, commie scum.",
    "Marx ain't gonna save you now."
  ],
  cannibal_kill: [
    "Eat lead, you sick freak.",
    "Go back to the Purge, buddy.",
    "Cannibalize THIS.",
    "Stay away from my maple syrup, psycho.",
    "Not today, Hannibal."
  ],
  civilian_kill: [
    "What the fuck is wrong with you?",
    "Friendly fire, you idiot!",
    "We are supposed to SAVE them... maybe.",
    "Oops. My bad eh.",
    "Collateral damage."
  ],
  rescue: [
    "Get to the chopper!",
    "You're safe now.",
    "Move it, civilian!",
    "Come with me if you want to live.",
    "Canada provides!"
  ],
  headshot: [
    "Damn, I'm good.",
    "Right between the eyes, eh?",
    "Brain salad.",
    "Hail to the king, baby."
  ],
  kick: [
    "My boot, your face.",
    "Size 10, straight to the jaw.",
    "Have a seat.",
    "Take that, hoser."
  ]
};

export function playBlogginsQuote(category) {
  const lines = BLOGGINS_CALLOUTS[category];
  if (!lines || !lines.length) return;
  const quote = lines[Math.floor(Math.random() * lines.length)];
  blogginsVoice.speak(quote, true);
  // Also visually show the combat quote on screen!
  import('./hud.js').then(m => {
    if (m.triggerCombatQuote) m.triggerCombatQuote(`"${quote.toUpperCase()}"`, '#ffcc00');
  });
}

