/**
 * textures.js — Procedural texture generator
 * Canvas-rendered grass, dirt, rock, bark textures with normal maps.
 * No external files needed — everything generated at runtime.
 */

import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { Engine } from '@babylonjs/core/Engines/engine.js';

const SIZE = 512;

// ── Noise helpers ──
function hash(x, y) {
  let h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return h - Math.floor(h);
}
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx*fx*(3-2*fx), sy = fy*fy*(3-2*fy);
  const a = hash(ix,iy), b = hash(ix+1,iy), c = hash(ix,iy+1), d = hash(ix+1,iy+1);
  return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;
}
function fbm(x, y, oct) {
  let v=0, a=0.5, f=1;
  for (let i=0;i<oct;i++) { v+=a*noise(x*f,y*f); a*=0.5; f*=2; }
  return v;
}

// ── Generate a texture from pixel function ──
function makeTexture(scene, name, pixelFn) {
  const data = new Uint8Array(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = pixelFn(x / SIZE, y / SIZE);
      const i = (y * SIZE + x) * 4;
      data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = 255;
    }
  }
  const tex = RawTexture.CreateRGBATexture(data, SIZE, SIZE, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  tex.name = name;
  tex.wrapU = Texture.WRAP_ADDRESSMODE;
  tex.wrapV = Texture.WRAP_ADDRESSMODE;
  return tex;
}

// ── Normal map from height function ──
function makeNormalMap(scene, name, heightFn) {
  const data = new Uint8Array(SIZE * SIZE * 4);
  const s = 1.0 / SIZE;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const hL = heightFn((x-1)*s, y*s);
      const hR = heightFn((x+1)*s, y*s);
      const hU = heightFn(x*s, (y-1)*s);
      const hD = heightFn(x*s, (y+1)*s);
      // Normal from height differences
      let nx = (hL - hR) * 3.0;
      let ny = (hU - hD) * 3.0;
      let nz = 1.0;
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      nx /= len; ny /= len; nz /= len;
      const i = (y * SIZE + x) * 4;
      data[i]   = ((nx * 0.5 + 0.5) * 255) | 0;
      data[i+1] = ((ny * 0.5 + 0.5) * 255) | 0;
      data[i+2] = ((nz * 0.5 + 0.5) * 255) | 0;
      data[i+3] = 255;
    }
  }
  const tex = RawTexture.CreateRGBATexture(data, SIZE, SIZE, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  tex.name = name;
  tex.wrapU = Texture.WRAP_ADDRESSMODE;
  tex.wrapV = Texture.WRAP_ADDRESSMODE;
  return tex;
}

// ── Grass texture ──
export function createGrassTexture(scene) {
  return makeTexture(scene, 'grassTex', (u, v) => {
    const n = fbm(u * 8, v * 8, 5);
    const blade = Math.abs(Math.sin(u * 120 + n * 5)) * 0.3;
    const r = (40 + n * 30 + blade * 20) | 0;
    const g = (80 + n * 60 + blade * 40) | 0;
    const b = (25 + n * 15) | 0;
    return [r, g, b];
  });
}

export function createGrassNormal(scene) {
  return makeNormalMap(scene, 'grassNorm', (u, v) => {
    return fbm(u * 12, v * 12, 4) + Math.abs(Math.sin(u * 80)) * 0.15;
  });
}

// ── Dirt texture ──
export function createDirtTexture(scene) {
  return makeTexture(scene, 'dirtTex', (u, v) => {
    const n = fbm(u * 10, v * 10, 5);
    const pebble = hash(Math.floor(u*60), Math.floor(v*60)) > 0.85 ? 0.2 : 0;
    const r = (100 + n * 50 + pebble * 40) | 0;
    const g = (80 + n * 40 + pebble * 30) | 0;
    const b = (50 + n * 25 + pebble * 20) | 0;
    return [r, g, b];
  });
}

export function createDirtNormal(scene) {
  return makeNormalMap(scene, 'dirtNorm', (u, v) => {
    const n = fbm(u * 10, v * 10, 4);
    const pebble = hash(Math.floor(u*60), Math.floor(v*60)) > 0.85 ? 0.35 : 0;
    return n + pebble;
  });
}

// ── Rock texture ──
export function createRockTexture(scene) {
  return makeTexture(scene, 'rockTex', (u, v) => {
    const n = fbm(u * 6, v * 6, 6);
    const crack = Math.abs(Math.sin(u * 30 + n * 10) * Math.sin(v * 25 + n * 8)) < 0.05 ? -0.15 : 0;
    const val = 90 + n * 60 + crack * 40;
    return [val | 0, (val - 5) | 0, (val - 10) | 0];
  });
}

export function createRockNormal(scene) {
  return makeNormalMap(scene, 'rockNorm', (u, v) => {
    return fbm(u * 8, v * 8, 5) + Math.abs(Math.sin(u*30)*Math.sin(v*25)) * 0.1;
  });
}

// ── Bark texture ──
export function createBarkTexture(scene) {
  return makeTexture(scene, 'barkTex', (u, v) => {
    const grain = fbm(u * 3, v * 20, 4);
    const ridge = Math.abs(Math.sin(v * 40 + grain * 5)) * 0.3;
    const r = (65 + grain * 40 + ridge * 30) | 0;
    const g = (45 + grain * 25 + ridge * 15) | 0;
    const b = (25 + grain * 15) | 0;
    return [r, g, b];
  });
}

export function createBarkNormal(scene) {
  return makeNormalMap(scene, 'barkNorm', (u, v) => {
    return fbm(u * 4, v * 24, 4) + Math.abs(Math.sin(v * 38)) * 0.25;
  });
}

/** Single-channel roughness/ao packed map — returns grey (rough bark = 0.88) */
export function createBarkORM(scene) {
  return makeTexture(scene, 'barkORM', (u, v) => {
    const grain = fbm(u * 3, v * 20, 4);
    const ao    = Math.max(0.5, 1.0 - fbm(u * 6, v * 6, 3) * 0.4);
    const rough = 0.78 + grain * 0.18;
    const r = (ao    * 255) | 0;   // AO  in R
    const g = (rough * 255) | 0;   // Roughness in G
    const b = 0;                    // Metallic = 0
    return [r, g, b];
  });
}

// ── Concrete texture — grey aggregate with form-work lines ──
export function createConcreteTexture(scene) {
  return makeTexture(scene, 'concreteTex', (u, v) => {
    const agg  = fbm(u * 14, v * 14, 5);            // aggregate speckle
    const line = Math.abs(Math.sin(v * 22)) < 0.015 ? -0.12 : 0; // formwork seams
    const val  = 0.48 + agg * 0.22 + line;
    const tint = fbm(u * 6, v * 6, 3) * 0.06;
    return [
      Math.max(0, Math.min(255, (val * 255) | 0)),
      Math.max(0, Math.min(255, ((val - tint * 0.5) * 255) | 0)),
      Math.max(0, Math.min(255, ((val - tint) * 255) | 0)),
    ];
  });
}

export function createConcreteORM(scene) {
  return makeTexture(scene, 'concreteORM', (u, v) => {
    const n = fbm(u * 10, v * 10, 4);
    return [(180 + (n * 40)|0), (200 + (n * 30)|0), 0];
  });
}

// ── Asphalt texture — dark tarmac with aggregate and crack lines ──
export function createAsphaltTexture(scene) {
  return makeTexture(scene, 'asphaltTex', (u, v) => {
    const agg   = fbm(u * 18, v * 18, 5);           // coarse aggregate
    const crack = Math.abs(Math.sin(u * 14 + fbm(u * 3, v * 3, 3) * 3)
                           * Math.sin(v * 11 + fbm(u*3+5, v*3+2, 3)*3)) < 0.025 ? -0.18 : 0;
    const age   = fbm(u * 4, v * 4, 3) * 0.12;     // weathering patches
    const val   = 0.12 + agg * 0.14 + crack + age;
    const v8 = Math.max(0, Math.min(255, (val * 255)|0));
    return [v8, v8, v8 + 2];
  });
}

export function createAsphaltORM(scene) {
  return makeTexture(scene, 'asphaltORM', (u, v) => {
    const n = fbm(u * 12, v * 12, 4);
    return [(160 + (n * 40)|0), (210 + (n * 25)|0), 0];
  });
}

// ── Sky gradient — Rayleigh scattering baked onto a 1×256 vertical strip ──
// Mapped onto the interior of the sky sphere (u = longitude, v = latitude).
// Deep blue zenith → warm horizon → dark ground band.
export function createSkyGradient(scene) {
  const W = 4, H = 256;
  const data = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    // v = 0 at top of sphere (zenith), 1 at equator / horizon
    const v = y / (H - 1);
    // Zenith: deep Rayleigh blue
    // Horizon: pale warm haze
    // Below horizon: dark ground tint
    let r, g, b;
    if (v < 0.45) {
      // Upper sky — deep blue fading to mid blue
      const t = v / 0.45;
      r = ((10  + t * 100) | 0);
      g = ((40  + t * 110) | 0);
      b = ((140 + t * 80)  | 0);
    } else if (v < 0.52) {
      // Horizon glow — warm peach/yellow band
      const t = (v - 0.45) / 0.07;
      r = ((110 + t * 100) | 0);
      g = ((150 + t * 60)  | 0);
      b = ((220 - t * 60)  | 0);
    } else {
      // Below horizon (ground side of sphere) — dark blue-grey
      const t = Math.min(1, (v - 0.52) / 0.48);
      r = ((210 - t * 170) | 0);
      g = ((210 - t * 170) | 0);
      b = ((160 - t * 130) | 0);
    }
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = 255;
    }
  }
  const tex = RawTexture.CreateRGBATexture(data, W, H, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  tex.name = 'skyGradient';
  tex.wrapU = Texture.WRAP_ADDRESSMODE;
  tex.wrapV = Texture.CLAMP_ADDRESSMODE;
  return tex;
}

// ── Skybox as 6-face cube texture from canvas ──
export function createSnowTexture(scene) {
  return makeTexture(scene, 'snowTex', (u, v) => {
    const crystal = fbm(u * 18, v * 18, 4);           // surface crystal variation
    const sparkle = hash(Math.floor(u*200), Math.floor(v*200)) > 0.92 ? 1.0 : 0.0;
    const drift   = fbm(u * 5, v * 5, 3) * 0.12;     // large drifts
    const base    = 0.88 + crystal * 0.08 + drift;
    const r = Math.min(255, (base * 238 + sparkle * 17) | 0);
    const g = Math.min(255, (base * 242 + sparkle * 13) | 0);
    const b = Math.min(255, (base * 255 + sparkle * 0)  | 0);
    return [r, g, b];
  });
}

export function createSnowNormal(scene) {
  return makeNormalMap(scene, 'snowNorm', (u, v) => {
    // Gentle bumps mimicking packed crystal layers
    return fbm(u * 20, v * 20, 3) * 0.5 + fbm(u * 6, v * 6, 2) * 0.5;
  });
}

// ── Cliff texture — Canadian Shield granite: grey + feldspar veins + cracks ──
export function createCliffTexture(scene) {
  return makeTexture(scene, 'cliffTex', (u, v) => {
    const base   = fbm(u * 7, v * 7, 6);              // broad granite grain
    const fine   = fbm(u * 22, v * 22, 4) * 0.35;    // fine mineral variation
    // Feldspar pink-white veins — thin sinuous bands
    const veinN  = fbm(u * 4 + 1.3, v * 12 + 2.7, 3);
    const vein   = Math.max(0, 1.0 - Math.abs(Math.sin(v * 18 + veinN * 6)) * 12) * 0.18;
    // Fracture lines — near-vertical cracks
    const crackN = fbm(u * 2, v * 6 + 5, 3);
    const crack  = Math.abs(Math.sin(u * 28 + crackN * 4) * Math.sin(v * 9 + crackN * 2)) < 0.04 ? -0.25 : 0.0;
    const val    = (base * 0.55 + fine + vein + crack);
    const r = Math.max(0, Math.min(255, (75 + val * 95)  | 0));
    const g = Math.max(0, Math.min(255, (70 + val * 88)  | 0));
    const b = Math.max(0, Math.min(255, (68 + val * 82)  | 0));
    return [r, g, b];
  });
}

export function createCliffNormal(scene) {
  return makeNormalMap(scene, 'cliffNorm', (u, v) => {
    const crack = fbm(u * 25, v * 10, 5);
    return crack + fbm(u * 8, v * 8, 4) * 0.4;
  });
}

// ── Skybox as 6-face cube texture from canvas ──
export function createProceduralSkybox(scene) {
  // We'll use a hemisphere gradient on a large sphere instead
  // (CubeTexture from raw data is complex — sphere skybox is simpler and looks great)
  return null; // Handled in engine.js via sky sphere
}
