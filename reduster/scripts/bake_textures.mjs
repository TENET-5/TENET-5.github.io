/**
 * bake_textures.mjs — Generate all game textures as static PNGs
 * Run: node scripts/bake_textures.mjs
 * Output: public/textures/*.png
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'textures');
mkdirSync(OUT, { recursive: true });

const SIZE = 1024;

// ── Noise ──
function hash(x, y) {
  let h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return h - Math.floor(h);
}
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx*fx*(3-2*fx), sy = fy*fy*(3-2*fy);
  const a=hash(ix,iy), b=hash(ix+1,iy), c=hash(ix,iy+1), d=hash(ix+1,iy+1);
  return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;
}
function fbm(x, y, oct=5) {
  let v=0, a=0.5, f=1;
  for (let i=0;i<oct;i++){v+=a*noise(x*f,y*f);a*=0.5;f*=2;}
  return v;
}

function generate(name, pixelFn) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = pixelFn(x / SIZE, y / SIZE);
      const i = (y * SIZE + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, r));
      img.data[i+1] = Math.max(0, Math.min(255, g));
      img.data[i+2] = Math.max(0, Math.min(255, b));
      img.data[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const path = join(OUT, `${name}.png`);
  writeFileSync(path, canvas.toBuffer('image/png'));
  console.log(`  ✓ ${name}.png (${SIZE}x${SIZE})`);
}

function generateNormal(name, heightFn) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(SIZE, SIZE);
  const s = 1.0 / SIZE;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const hL = heightFn((x-1)*s, y*s);
      const hR = heightFn((x+1)*s, y*s);
      const hU = heightFn(x*s, (y-1)*s);
      const hD = heightFn(x*s, (y+1)*s);
      let nx = (hL - hR) * 4.0;
      let ny = (hU - hD) * 4.0;
      let nz = 1.0;
      const len = Math.sqrt(nx*nx+ny*ny+nz*nz);
      nx/=len; ny/=len; nz/=len;
      const i = (y * SIZE + x) * 4;
      img.data[i]   = ((nx*0.5+0.5)*255)|0;
      img.data[i+1] = ((ny*0.5+0.5)*255)|0;
      img.data[i+2] = ((nz*0.5+0.5)*255)|0;
      img.data[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const path = join(OUT, `${name}.png`);
  writeFileSync(path, canvas.toBuffer('image/png'));
  console.log(`  ✓ ${name}.png (${SIZE}x${SIZE}) [normal]`);
}

console.log('Baking textures...\n');

// ── Grass albedo ──
generate('grass_albedo', (u, v) => {
  const n = fbm(u*8, v*8, 6);
  const blade = Math.abs(Math.sin(u*150 + n*6)) * 0.25;
  const patch = fbm(u*3, v*3, 3) * 0.2;
  return [
    35 + n*35 + blade*20 + patch*15,
    70 + n*65 + blade*45 + patch*25,
    20 + n*15 + patch*10
  ];
});

// ── Grass normal ──
generateNormal('grass_normal', (u, v) => {
  return fbm(u*14, v*14, 5) + Math.abs(Math.sin(u*100))*0.12;
});

// ── Dirt albedo ──
generate('dirt_albedo', (u, v) => {
  const n = fbm(u*10, v*10, 6);
  const pebble = hash(Math.floor(u*80), Math.floor(v*80)) > 0.88 ? 0.15 : 0;
  const crack = Math.abs(Math.sin(u*50+n*8)*Math.sin(v*45+n*6)) < 0.03 ? -0.1 : 0;
  return [
    95 + n*55 + pebble*40 + crack*30,
    75 + n*45 + pebble*30 + crack*25,
    45 + n*30 + pebble*20 + crack*15
  ];
});

// ── Dirt normal ──
generateNormal('dirt_normal', (u, v) => {
  return fbm(u*12, v*12, 5) + (hash(Math.floor(u*80),Math.floor(v*80))>0.88?0.2:0);
});

// ── Rock albedo ──
generate('rock_albedo', (u, v) => {
  const n = fbm(u*6, v*6, 7);
  const crack = Math.abs(Math.sin(u*35+n*12)*Math.sin(v*30+n*10)) < 0.04 ? -0.12 : 0;
  const lichen = fbm(u*20, v*20, 3) > 0.55 ? 0.08 : 0;
  const val = 85 + n*65 + crack*40;
  return [val, val-5+lichen*30, val-12+lichen*20];
});

// ── Rock normal ──
generateNormal('rock_normal', (u, v) => {
  return fbm(u*8, v*8, 6) + Math.abs(Math.sin(u*35)*Math.sin(v*30))*0.08;
});

// ── Bark albedo ──
generate('bark_albedo', (u, v) => {
  const grain = fbm(u*4, v*25, 5);
  const ridge = Math.abs(Math.sin(v*50 + grain*6)) * 0.3;
  const moss = fbm(u*15, v*15, 3) > 0.6 ? 0.1 : 0;
  return [
    55 + grain*45 + ridge*30,
    38 + grain*30 + ridge*15 + moss*40,
    20 + grain*15 + moss*15
  ];
});

// ── Bark normal ──
generateNormal('bark_normal', (u, v) => {
  return fbm(u*4, v*25, 5) + Math.abs(Math.sin(v*50))*0.25;
});

// ── Leaf albedo (for deciduous canopy) ──
generate('leaf_albedo', (u, v) => {
  const n = fbm(u*12, v*12, 5);
  const vein = Math.abs(Math.sin(u*40+n*4)*Math.sin(v*35+n*3)) < 0.08 ? 0.1 : 0;
  return [
    20 + n*30 + vein*15,
    55 + n*70 + vein*20,
    12 + n*15
  ];
});

// ── Asphalt albedo ──
generate('asphalt_albedo', (u, v) => {
  const n = fbm(u*15, v*15, 5);
  const line = (v > 0.48 && v < 0.52) ? 40 : 0; // Center line
  const val = 42 + n*25;
  return [val+line*0.8, val+line, val+line*0.2];
});

// ── Sky gradient (hemisphere) ──
generate('sky_gradient', (u, v) => {
  // v=0 is top (zenith), v=1 is horizon
  const zenith = [60, 100, 180];
  const horizon = [160, 175, 200];
  const t = Math.pow(v, 0.6);
  // Clouds
  const cloud = fbm(u*4+0.3, v*6, 5);
  const cloudMask = Math.max(0, cloud - 0.45) * 3.0;
  return [
    zenith[0]*(1-t) + horizon[0]*t + cloudMask*90,
    zenith[1]*(1-t) + horizon[1]*t + cloudMask*85,
    zenith[2]*(1-t) + horizon[2]*t + cloudMask*75,
  ];
});

console.log('\nDone! All textures saved to public/textures/');
