// ── TENET5 Weather System ──
// Rain, fog, snow, wind — affects visibility and ballistics
// SYSTEM_SEED=118400

import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture.js';
import { Vector3, Color4, Color3 } from '@babylonjs/core/Maths/math.js';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';

const WEATHER_TYPES = ['clear', 'rain', 'fog', 'snow', 'blizzard'];

let _state = {
  type: 'clear',
  targetType: 'clear',
  transition: 1.0,
  wind: { x: 0, z: 0, strength: 0 },
  targetWind: { x: 0, z: 0, strength: 0 },
};

// ── Fog density targets per weather type ──
const FOG_DENSITY = { clear: 0.015, rain: 0.035, fog: 0.07, snow: 0.04, blizzard: 0.065 };

// ── Active particle systems ──
let _rainPS = null;
let _snowPS = null;
let _scene = null;
let _camera = null;

// ── Create a 4×4 white dot texture procedurally (no external file needed) ──
function _makeParticleTexture(scene) {
  const size = 16;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x - size/2 + 0.5, cy = y - size/2 + 0.5;
      const d = Math.sqrt(cx*cx + cy*cy) / (size/2);
      const a = Math.max(0, 1 - d) * 255;
      const i = (y*size+x)*4;
      data[i]=255; data[i+1]=255; data[i+2]=255; data[i+3]=a;
    }
  }
  const tex = RawTexture.CreateRGBATexture(data, size, size, scene, false, false);
  return tex;
}

function _buildRainSystem(scene) {
  const ps = new ParticleSystem('rain', 4000, scene);
  ps.particleTexture = _makeParticleTexture(scene);

  // Emitter box follows camera — streaks fall from above
  ps.emitter = Vector3.Zero();  // updated every frame
  ps.minEmitBox = new Vector3(-40, 20, -40);
  ps.maxEmitBox = new Vector3( 40, 25,  40);

  // Raindrop = thin vertical line via billboard scale
  ps.minSize = 0.04;  ps.maxSize = 0.08;
  ps.minScaleX = 0.04; ps.maxScaleX = 0.07;
  ps.minScaleY = 1.2;  ps.maxScaleY = 2.2;

  // Fast downward velocity + wind deflection applied in updateFunction
  ps.gravity = new Vector3(0, -28, 0);
  ps.minEmitPower = 1;  ps.maxEmitPower = 2;
  ps.direction1 = new Vector3(-0.1, -1, -0.1);
  ps.direction2 = new Vector3( 0.1, -1,  0.1);

  ps.minLifeTime = 0.6;  ps.maxLifeTime = 1.2;
  ps.emitRate = 1800;

  // Semi-transparent blue-white streaks
  ps.color1 = new Color4(0.72, 0.82, 0.95, 0.55);
  ps.color2 = new Color4(0.60, 0.72, 0.90, 0.40);
  ps.colorDead = new Color4(0.5, 0.6, 0.8, 0);

  ps.blendMode = ParticleSystem.BLENDMODE_ADD;
  ps.isBillboardBased = true;

  // Apply wind each tick
  ps.updateFunction = function(particles) {
    const wind = getWind();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += this._scaledUpdateSpeed;
      if (p.age >= p.lifeTime) { this.recycleParticle(p); continue; }
      p.velocity.x += wind.x * wind.strength * 0.4 * this._scaledUpdateSpeed;
      p.velocity.z += wind.z * wind.strength * 0.4 * this._scaledUpdateSpeed;
      p.position.addInPlaceFromFloats(
        p.velocity.x * this._scaledUpdateSpeed,
        p.velocity.y * this._scaledUpdateSpeed,
        p.velocity.z * this._scaledUpdateSpeed
      );
      p.color.a = Math.max(0, (1 - p.age / p.lifeTime) * 0.55);
    }
  };

  return ps;
}

function _buildSnowSystem(scene) {
  const ps = new ParticleSystem('snow', 2500, scene);
  ps.particleTexture = _makeParticleTexture(scene);

  ps.emitter = Vector3.Zero();
  ps.minEmitBox = new Vector3(-50, 15, -50);
  ps.maxEmitBox = new Vector3( 50, 22,  50);

  // Fluffy snowflakes — slow, drifting
  ps.minSize = 0.15;  ps.maxSize = 0.38;

  ps.gravity = new Vector3(0, -2.5, 0);
  ps.minEmitPower = 0.1;  ps.maxEmitPower = 0.4;
  ps.direction1 = new Vector3(-0.3, -0.8, -0.3);
  ps.direction2 = new Vector3( 0.3, -0.8,  0.3);

  ps.minLifeTime = 4;  ps.maxLifeTime = 8;
  ps.emitRate = 400;

  ps.color1 = new Color4(0.95, 0.97, 1.0, 0.85);
  ps.color2 = new Color4(0.88, 0.92, 1.0, 0.70);
  ps.colorDead = new Color4(0.9, 0.95, 1.0, 0);

  ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;

  ps.updateFunction = function(particles) {
    const wind = getWind();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += this._scaledUpdateSpeed;
      if (p.age >= p.lifeTime) { this.recycleParticle(p); continue; }
      // Gentle swirl
      const t = p.age * 1.4;
      p.velocity.x += (Math.sin(t + p.id) * 0.06 + wind.x * wind.strength * 0.15) * this._scaledUpdateSpeed;
      p.velocity.z += (Math.cos(t + p.id) * 0.06 + wind.z * wind.strength * 0.15) * this._scaledUpdateSpeed;
      p.position.addInPlaceFromFloats(
        p.velocity.x * this._scaledUpdateSpeed,
        p.velocity.y * this._scaledUpdateSpeed,
        p.velocity.z * this._scaledUpdateSpeed
      );
    }
  };

  return ps;
}

function _applyFog(scene, type) {
  if (!scene) return;
  const target = FOG_DENSITY[type] ?? 0.015;
  scene.fogMode = 3; // FOGMODE_EXP2
  scene.fogDensity = target;
  if (type === 'clear') {
    scene.fogColor = new Color3(0.62, 0.70, 0.80);
  } else if (type === 'rain') {
    scene.fogColor = new Color3(0.38, 0.42, 0.46);
  } else if (type === 'fog') {
    scene.fogColor = new Color3(0.72, 0.74, 0.76);
  } else if (type === 'snow' || type === 'blizzard') {
    scene.fogColor = new Color3(0.82, 0.86, 0.90);
  }
}

function _activateParticles(type) {
  if (!_scene) return;

  // Stop all first
  if (_rainPS) { _rainPS.stop(); }
  if (_snowPS) { _snowPS.stop(); }

  if (type === 'rain') {
    if (!_rainPS) _rainPS = _buildRainSystem(_scene);
    _rainPS.emitRate = 1800;
    _rainPS.start();
  } else if (type === 'blizzard') {
    if (!_rainPS) _rainPS = _buildRainSystem(_scene);
    _rainPS.emitRate = 3200;  // heavy
    _rainPS.start();
    if (!_snowPS) _snowPS = _buildSnowSystem(_scene);
    _snowPS.emitRate = 900;
    _snowPS.start();
  } else if (type === 'snow') {
    if (!_snowPS) _snowPS = _buildSnowSystem(_scene);
    _snowPS.emitRate = 400;
    _snowPS.start();
  }
}

export function initWeather(scene, camera) {
  _scene = scene;
  _camera = camera;
  _applyFog(scene, 'clear');
}

export function setWeather(type) {
  if (!WEATHER_TYPES.includes(type)) return;
  _state.targetType = type;
  _state.transition = 0;
  _state.targetWind = {
    x: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2,
    strength: type === 'clear' ? 0.2 : type === 'rain' ? 1.5 : type === 'snow' ? 0.8 : type === 'blizzard' ? 3.5 : 0.3,
  };
  // Activate particles immediately on type change
  _activateParticles(type);
  _applyFog(_scene, type);
}

export function getWind() {
  return { x: _state.wind.x, z: _state.wind.z, strength: _state.wind.strength };
}

export function getWeatherType() { return _state.type; }

export function updateWeather(dt) {
  // ── Transition blend ──
  if (_state.transition < 1.0) {
    _state.transition = Math.min(1.0, _state.transition + dt * 0.3);
    if (_state.transition >= 1.0) _state.type = _state.targetType;
  }

  // ── Wind interpolation ──
  const wl = 0.02;
  _state.wind.x += (_state.targetWind.x - _state.wind.x) * wl;
  _state.wind.z += (_state.targetWind.z - _state.wind.z) * wl;
  _state.wind.strength += (_state.targetWind.strength - _state.wind.strength) * wl;

  // ── Move particle emitters to follow camera ──
  if (_camera) {
    const cp = _camera.position;
    if (_rainPS && _rainPS.isStarted()) _rainPS.emitter = new Vector3(cp.x, cp.y, cp.z);
    if (_snowPS && _snowPS.isStarted()) _snowPS.emitter = new Vector3(cp.x, cp.y, cp.z);
  }
}

/**
 * Pick a random weather type (weighted toward clear).
 */
export function randomWeather() {
  // Canadian winter biased — more snow & blizzard
  const r = Math.random();
  if (r < 0.20) return 'clear';
  if (r < 0.35) return 'fog';
  if (r < 0.50) return 'rain';
  if (r < 0.75) return 'snow';
  return 'blizzard';
}
