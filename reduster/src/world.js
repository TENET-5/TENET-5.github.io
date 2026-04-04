/**
 * world.js — Northern Ontario Boreal Forest
 *
 * Flora: Black spruce, Jack pine, white birch, trembling aspen, balsam fir.
 * Terrain: Canadian Shield granite outcrops, muskeg bogs, boreal lakes,
 *          logging roads, gravel highways.
 * Reference: Timmins-Kapuskasing-Hearst corridor, ~49°N latitude.
 *
 * Graphics: TerrainMaterial splat (grass/dirt/rock), full PBR ORM maps,
 *           subsurface scattering on foliage, clearcoat on roads.
 */

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { Color3, Color4, Vector3, Vector2, Matrix, Quaternion } from '@babylonjs/core/Maths/math.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture.js';
import { TerrainMaterial } from '@babylonjs/materials/terrain/terrainMaterial.js';
import { PBRCustomMaterial } from '@babylonjs/materials/custom/pbrCustomMaterial.js';
import { createGrassTexture, createGrassNormal, createDirtTexture, createDirtNormal, createBarkTexture, createBarkNormal, createBarkORM, createCliffTexture, createCliffNormal, createConcreteTexture, createConcreteORM, createAsphaltTexture, createAsphaltORM, createSnowTexture, createSnowNormal } from './textures.js';

export const WORLD_SIZE = 4000;

// ── LOD tracking — rock formation instances grouped by formation centre ──
const _rockLODGroups = []; // [{cx, cz, instances:[]}]
const ROCK_LOD_DIST = 600; // hide formations beyond this distance (m)

// ── Ground cover — dynamic grass billboards around camera ──
const GRASS_RADIUS   = 55;   // metres around camera to place quads
const GRASS_COUNT    = 480;  // total quad instances in pool
const GRASS_CELL     = 2.8;  // grid spacing
let _grassPool       = null; // thin-instance mesh
let _grassMat        = null; // PBRCustomMaterial with alpha cutout
let _grassLastCam    = null; // last camera position (grid-snapped)

// ── Noise ──
function hash(x, y) {
  let h = Math.sin(x*12.9898+y*78.233)*43758.5453;
  return h - Math.floor(h);
}
function noise(x, y) {
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);
  return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;
}
function fbm(x,y,oct=5){let v=0,a=0.5,f=1;for(let i=0;i<oct;i++){v+=a*noise(x*f,y*f);a*=0.5;f*=2;}return v;}

// ── Northern Ontario terrain + Alpine Peaks ──
// Canadian Shield granite rolling hills in the centre/south.
// Precambrian mountain ridges rise along the north and east edges.
// Elevation range ~250-400m ASL lowlands, peaks to ~650m ASL.
export function getHeight(x, z) {
  // Shield bedrock — broad undulating
  const shield = fbm(x*0.001, z*0.001, 5) * 45;
  // Glacial drumlin ridges
  const drumlin = fbm(x*0.004, z*0.002, 4) * 15;
  // Local boulder/outcrop detail
  const outcrop = fbm(x*0.015, z*0.015, 4) * 5;
  // Micro roughness (moss, roots)
  const micro = fbm(x*0.06, z*0.06, 3) * 0.8;
  // River — meandering through center
  const riverDist = Math.abs(z - 2000 - Math.sin(x*0.002)*200 - Math.sin(x*0.005)*80);
  const river = Math.max(0, 1 - riverDist/60) * 16;
  // Muskeg bog depressions
  const bog = fbm(x*0.003, z*0.003, 3);
  const bogDepth = bog < 0.35 ? (0.35 - bog) * 20 : 0;

  // ── Mountain ridges — Precambrian shield peaks ──
  // Ridge axis runs NW-SE through the map; secondary ridge in the NE quadrant.
  // Uses domain-warped fbm so peaks feel organic, not tiled.
  const wx = x + fbm(x*0.0006, z*0.0006, 3) * 400;  // domain warp
  const wz = z + fbm(x*0.0006+5.2, z*0.0006+1.7, 3) * 400;
  const ridgeBase = fbm(wx*0.00045, wz*0.00045, 6);
  // Ridge mask: sharpen noise toward peaks (ridged multi-fractal style)
  const ridged = Math.abs(ridgeBase * 2 - 1);
  const peaks = Math.max(0, (1 - ridged) - 0.35) / 0.65;  // 0 in valleys, >0 at peaks
  const mountainHeight = peaks * peaks * 220;               // up to +220m (≈ 65-85m relative)

  // Secondary sub-alpine detail on the slopes
  const alpine = fbm(x*0.008, z*0.008, 4) * 8 * Math.min(1, peaks * 3);

  return shield + drumlin + outcrop + micro - river - bogDepth + mountainHeight + alpine;
}

// Snow line — above this height terrain gets snow colouring
export const SNOW_LINE = 60;
// Mountain peak threshold — above this height is exposed rock / cliff
export const CLIFF_LINE = 38;

export function isWater(x, z) { return getHeight(x, z) < -2; }

// ── Wind animation — PBRCustomMaterial with vertex sway ────────────────────
// All foliage canopy meshes share materials from this pool; uniforms are
// updated every frame via updateForestWind().
const _windMats = [];

/**
 * Create a PBRCustomMaterial with sinusoidal vertex wind sway injected.
 * @param {Scene} scene
 * @param {string} name
 * @param {object} cfg  — { color, roughness, translucency, tintColor, swayScale }
 *   swayScale = half-height of the mesh (sway = 0 at bottom, max at top)
 */
function makeWindMat(scene, name, cfg = {}) {
  const mat = new PBRCustomMaterial(name, scene);
  if (cfg.color)        mat.albedoColor = cfg.color;
  if (cfg.albedoTex)  { mat.albedoTexture = cfg.albedoTex; }
  mat.roughness = cfg.roughness ?? 0.9;
  mat.metallic  = cfg.metallic  ?? 0.0;
  if (cfg.translucency) {
    mat.subSurface.isTranslucencyEnabled = true;
    mat.subSurface.translucencyIntensity = cfg.translucency;
    mat.subSurface.tintColor = cfg.tintColor || new Color3(0.05, 0.25, 0.02);
  }

  // Uniforms updated each frame
  mat.AddUniform('uWindTime', 'float', 0.0);
  mat.AddUniform('uWindDir',  'vec2',  { x: 0.0, y: 0.0 });
  mat.AddUniform('uSwayScale', 'float', cfg.swayScale ?? 4.0);

  // Inject wind displacement into vertex shader (modifies local positionUpdated)
  mat.Vertex_Definitions(`
    vec3 calcWindSway(vec3 localPos, mat4 worldMat, float scale) {
      // Per-tree phase from world XZ (thin instances each at different world pos)
      vec3 worldOrig = (worldMat * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      float phase = worldOrig.x * 0.031 + worldOrig.z * 0.047;
      // Height factor — tips sway quadratically more than base
      float hf = clamp((localPos.y / scale) + 0.5, 0.0, 1.0);
      hf = hf * hf;
      // Primary + secondary oscillation for organic feel
      float primary   = sin(uWindTime * 0.75 + phase);
      float secondary = sin(uWindTime * 1.87 + phase * 1.3) * 0.22;
      float sway = (primary + secondary) * hf * 0.55;
      return vec3(uWindDir.x * sway, 0.0, uWindDir.y * sway);
    }
  `);
  mat.Vertex_Before_PositionUpdated(`
    positionUpdated += calcWindSway(position, world, uSwayScale);
  `);

  _windMats.push(mat);
  return mat;
}

/** Call each frame from engine.js game loop. time = elapsed seconds. */
export function updateForestWind(time, windX, windZ) {
  for (const m of _windMats) {
    m.getEffect()?.setFloat('uWindTime', time);
    m.getEffect()?.setFloat2('uWindDir', windX, windZ);
  }
}

/**
 * updateRockLOD — called each frame with camera world-space position.
 * Enables/disables rock formation instance groups based on distance.
 * @param {number} camX - camera X (Babylon world coords, centred at origin)
 * @param {number} camZ - camera Z
 */
export function updateRockLOD(camX, camZ) {
  const d2 = ROCK_LOD_DIST * ROCK_LOD_DIST;
  for (const g of _rockLODGroups) {
    const dx = g.cx - camX, dz = g.cz - camZ;
    const visible = (dx*dx + dz*dz) < d2;
    for (const inst of g.instances) {
      if (inst.isEnabled() !== visible) inst.setEnabled(visible);
    }
  }
}

/**
 * Build the ground cover grass billboard pool.
 * Creates GRASS_COUNT thin-instanced crossed-quad planes with wind sway.
 * Called once from buildWorld(); positions are lazy-updated by updateGroundCover().
 */
function buildGroundCover(scene) {
  const quad = MeshBuilder.CreatePlane('grassBillboard', { width: 0.55, height: 0.65, sideOrientation: Mesh.DOUBLESIDE }, scene);
  quad.isVisible = false;

  // Procedural grass blade texture (256×256 RGBA with alpha cutout)
  const sz = 256;
  const texData = new Uint8Array(sz * sz * 4);
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const i = (y * sz + x) * 4;
      const u = x / sz, v = y / sz;
      const cx = Math.abs(u - 0.5);
      const blade = cx < (0.18 - v * 0.12);
      const cluster = cx < (0.38 - v * 0.18);
      if (!blade && !cluster) { texData[i+3] = 0; continue; }
      const g = 0.18 + v * 0.28 + Math.abs(Math.sin(x * 7.3)) * 0.07;
      texData[i]   = ((0.06 + g * 0.3) * 255) | 0;
      texData[i+1] = (g * 255) | 0;
      texData[i+2] = ((0.03 + g * 0.08) * 255) | 0;
      texData[i+3] = 220;
    }
  }
  const grassAlbedo = RawTexture.CreateRGBATexture(texData, sz, sz, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  grassAlbedo.name = 'grassBladeTex';
  grassAlbedo.hasAlpha = true;

  _grassMat = new PBRCustomMaterial('grassBillMat', scene);
  _grassMat.albedoTexture = grassAlbedo;
  _grassMat.transparencyMode = 1; // ALPHATEST
  _grassMat.alphaCutOff = 0.35;
  _grassMat.roughness = 0.95;
  _grassMat.metallic = 0.0;
  _grassMat.backFaceCulling = false;
  _grassMat.twoSidedLighting = true;

  // Wind sway via PBRCustomMaterial vertex injection
  _grassMat.AddUniform('uWindTime',  'float', 0.0);
  _grassMat.AddUniform('uWindDir',   'vec2',  { x: 0.0, y: 0.0 });
  _grassMat.AddUniform('uGrassWind', 'float', 1.0);
  _grassMat.Vertex_Definitions(`
    float grassSway(vec3 lp, float t, vec2 wd) {
      float hf = clamp(lp.y * 1.6, 0.0, 1.0);
      hf = hf * hf;
      float phase = (world[3][0] * 0.051 + world[3][2] * 0.073);
      float s = sin(t * 2.3 + phase) * 0.7 + sin(t * 5.1 + phase * 1.7) * 0.3;
      return s * hf * 0.18 * uGrassWind;
    }
  `);
  _grassMat.Vertex_Before_PositionUpdated(`
    float gs = grassSway(position, uWindTime, uWindDir);
    positionUpdated.x += uWindDir.x * gs;
    positionUpdated.z += uWindDir.y * gs;
  `);
  _windMats.push(_grassMat);

  quad.material = _grassMat;

  // Pre-allocate thin-instance buffer; filled by first updateGroundCover() call
  const matrices = new Float32Array(GRASS_COUNT * 16);
  // Identity matrices, all translated far below map
  for (let i = 0; i < GRASS_COUNT; i++) {
    const off = i * 16;
    matrices[off]    = 1; matrices[off+5]  = 1; matrices[off+10] = 1; matrices[off+15] = 1;
    matrices[off+13] = -9999;
  }
  quad.thinInstanceSetBuffer('matrix', matrices, 16, false);
  quad.thinInstanceCount = GRASS_COUNT;
  quad.isVisible = true;
  _grassPool = quad;
}

/**
 * Update grass billboard positions to follow camera.
 * Grid-snapped to GRASS_CELL so blades don't swim.
 * Call from engine.js at ~5Hz.
 * @param {number} camX  - camera X in Babylon world space (centred at 0)
 * @param {number} camZ  - camera Z in Babylon world space (centred at 0)
 */
export function updateGroundCover(camX, camZ) {
  if (!_grassPool) return;

  // Snap to grid — avoid re-uploading buffer when camera hasn't moved a cell
  const snX = Math.round(camX / GRASS_CELL) * GRASS_CELL;
  const snZ = Math.round(camZ / GRASS_CELL) * GRASS_CELL;
  if (_grassLastCam && _grassLastCam.x === snX && _grassLastCam.z === snZ) return;
  _grassLastCam = { x: snX, z: snZ };

  const matrices = new Float32Array(GRASS_COUNT * 16);
  let placed = 0;
  const r = GRASS_RADIUS;

  for (let dx = -r; dx <= r && placed < GRASS_COUNT; dx += GRASS_CELL) {
    for (let dz = -r; dz <= r && placed < GRASS_COUNT; dz += GRASS_CELL) {
      if (dx*dx + dz*dz > r*r) continue;
      // Per-cell deterministic jitter
      const jx = (hash(Math.floor((snX+dx)*0.71), Math.floor((snZ+dz)*0.71)) - 0.5) * GRASS_CELL * 0.7;
      const jz = (hash(Math.floor((snX+dx)*0.71)+1, Math.floor((snZ+dz)*0.71)+1) - 0.5) * GRASS_CELL * 0.7;
      const wx = snX + dx + jx;
      const wz = snZ + dz + jz;

      // Convert centred world → terrain sample space
      const tx = wx + WORLD_SIZE / 2;
      const tz = wz + WORLD_SIZE / 2;
      const h = getHeight(tx, tz);
      if (h > SNOW_LINE || h < 0) continue; // skip snow caps + water

      const scale = 0.7 + hash(Math.floor(wx*0.5+3), Math.floor(wz*0.5+7)) * 0.6;
      const yRot  = hash(Math.floor(wx*0.3), Math.floor(wz*0.3)) * Math.PI * 2;
      const cos = Math.cos(yRot), sin = Math.sin(yRot);
      const off = placed * 16;
      // Column-major TRS matrix (scale * rotY * translate)
      matrices[off+0]  =  cos * scale; matrices[off+1]  = 0; matrices[off+2]  = -sin * scale; matrices[off+3]  = 0;
      matrices[off+4]  =  0;           matrices[off+5]  = scale; matrices[off+6]  = 0;            matrices[off+7]  = 0;
      matrices[off+8]  =  sin * scale; matrices[off+9]  = 0; matrices[off+10] =  cos * scale;  matrices[off+11] = 0;
      matrices[off+12] =  wx;          matrices[off+13] = h;  matrices[off+14] =  wz;            matrices[off+15] = 1;
      placed++;
    }
  }

  // Park unused slots far below map
  for (let i = placed; i < GRASS_COUNT; i++) {
    const off = i * 16;
    matrices[off]=1; matrices[off+5]=1; matrices[off+10]=1; matrices[off+15]=1;
    matrices[off+12]=0; matrices[off+13]=-9999; matrices[off+14]=0;
  }

  _grassPool.thinInstanceSetBuffer('matrix', matrices, 16, false);
  _grassPool.thinInstanceCount = placed > 0 ? placed : 1;
}

// ── Zones ──
const ROADS = [
  { x1:0, z1:2000, x2:4000, z2:2000, width:8 }, // Highway 11
  { x1:2000, z1:0, x2:2000, z2:4000, width:6 }, // N-S highway
  { x1:400, z1:700, x2:1600, z2:1500, width:3 },  // Logging road
  { x1:2600, z1:800, x2:3600, z2:1300, width:3 },
  { x1:1000, z1:2800, x2:1800, z2:3700, width:3 },
  { x1:2800, z1:2400, x2:3500, z2:3400, width:3 },
  { x1:600, z1:2200, x2:1400, z2:2600, width:3 },  // New logging roads
  { x1:3000, z1:600, x2:3800, z2:1100, width:3 },
];
const CAMPS = [
  { x:800, z:1200, name:'OUTPOST ALPHA', size:'small' },
  { x:3000, z:1000, name:'SUPPLY DEPOT BRAVO', size:'large' },
  { x:1600, z:3000, name:'CHECKPOINT CHARLIE', size:'small' },
  { x:3200, z:2800, name:'FOB DELTA', size:'large' },
  { x:2000, z:2000, name:'COMMAND POST', size:'large' },
  { x:1200, z:600, name:'LOOKOUT ECHO', size:'small' },
  { x:3400, z:1800, name:'FIREBASE FOXTROT', size:'large' },
  { x:600, z:3400, name:'CHECKPOINT GOLF', size:'small' },
];

function nearRoad(x,z){for(const r of ROADS){const dx=r.x2-r.x1,dz=r.z2-r.z1,l2=dx*dx+dz*dz;const t=Math.max(0,Math.min(1,((x-r.x1)*dx+(z-r.z1)*dz)/l2));if(Math.sqrt((x-r.x1-t*dx)**2+(z-r.z1-t*dz)**2)<r.width+5)return true;}return false;}
function nearCamp(x,z){for(const c of CAMPS)if(Math.sqrt((x-c.x)**2+(z-c.z)**2)<50)return true;return false;}

// ── Build ──
export async function buildWorld(scene, shadowGen) {
  const world = { terrain:null, trees:[], buildings:[], camps:[], supplyRoutes:[] };

  // ── Terrain — visual mesh (256 subs, NO collision) ──
  const res = 512;
  const terrain = MeshBuilder.CreateGround('terrain', {
    width: WORLD_SIZE, height: WORLD_SIZE, subdivisions: res, updatable: false,
  }, scene);

  const pos = terrain.getVerticesData('position');
  const cols = new Float32Array(pos.length / 3 * 4);

  for (let i = 0; i < pos.length; i += 3) {
    const wx = pos[i] + WORLD_SIZE/2;
    const wz = pos[i+2] + WORLD_SIZE/2;
    const h = getHeight(wx, wz);
    pos[i+1] = h;

    const ci = (i/3)*4;
    const slope = Math.abs(h - getHeight(wx+2,wz)) + Math.abs(h - getHeight(wx,wz+2));
    const n = hash(wx*0.15, wz*0.15);

    if (h < -2) {
      // Water
      cols[ci]=0.04; cols[ci+1]=0.1; cols[ci+2]=0.18; cols[ci+3]=1;
    } else if (h >= SNOW_LINE) {
      // ── Snow cap — blended with rock on steep slopes ──
      const snowBlend = Math.min(1, (h - SNOW_LINE) / 20);
      const slopeRock = Math.min(1, slope / 6);
      const sw = snowBlend * (1 - slopeRock * 0.8);
      const rw = 1 - sw;
      // Snow: near-white with blue tint
      const sr = 0.88 + n*0.06, sg = 0.90 + n*0.04, sb = 0.95 + n*0.03;
      // Exposed granite rock
      const rr = 0.40 + n*0.12, rg = 0.38 + n*0.10, rb = 0.34 + n*0.08;
      cols[ci]   = sr*sw + rr*rw;
      cols[ci+1] = sg*sw + rg*rw;
      cols[ci+2] = sb*sw + rb*rw;
      cols[ci+3] = 1;
    } else if (h >= CLIFF_LINE || slope > 5.5) {
      // ── Exposed cliff / steep rock face ──
      const g = 0.38 + n*0.14;
      cols[ci]=g+0.04; cols[ci+1]=g; cols[ci+2]=g-0.06; cols[ci+3]=1;
    } else if (h < 1) {
      // Shoreline silt / wet mud
      const m = hash(wx*0.2,wz*0.2);
      cols[ci]=0.15+m*0.06; cols[ci+1]=0.18+m*0.08; cols[ci+2]=0.08+m*0.03; cols[ci+3]=1;
    } else if (slope > 4) {
      // Rocky slope (old threshold kept for lower elevations)
      const g = 0.42 + n*0.12;
      cols[ci]=g; cols[ci+1]=g-0.01; cols[ci+2]=g-0.04; cols[ci+3]=1;
    } else {
      const v = hash(wx*0.12, wz*0.12);
      const moisture = fbm(wx*0.005, wz*0.005, 2);
      cols[ci]=0.1+v*0.06+moisture*0.02;
      cols[ci+1]=0.18+v*0.1+moisture*0.05;
      cols[ci+2]=0.05+v*0.03;
      cols[ci+3]=1;
    }
  }
  terrain.updateVerticesData('position', pos);
  terrain.setVerticesData('color', cols, false, 4);
  const norms = terrain.getVerticesData('normal');
  VertexData.ComputeNormals(pos, terrain.getIndices(), norms);
  terrain.updateVerticesData('normal', norms);

  // ── Terrain material — 3-layer splat: grass / dirt / rock ──
  // mixTexture: R=grass, G=dirt, B=cliff — generated procedurally from height+slope.
  // Diffuse and normal textures from our procedural generator (no external files).
  {
    // Build procedural RGBA mix map matching terrain grid
    const MIX = 256;
    const mixData = new Uint8Array(MIX * MIX * 4);
    for (let my = 0; my < MIX; my++) {
      for (let mx = 0; mx < MIX; mx++) {
        const wx = (mx / MIX) * WORLD_SIZE;
        const wz = (my / MIX) * WORLD_SIZE;
        const h  = getHeight(wx, wz);
        // Slope proxy
        const slope = Math.abs(h - getHeight(wx+16, wz)) + Math.abs(h - getHeight(wx, wz+16));

        // grass: low flat terrain
        let rG = Math.max(0, 1.0 - h/20.0 - slope*0.12);
        // dirt: transition zones + road areas
        let rD = Math.max(0, Math.min(1, h/18.0 - 0.1 + slope*0.18));
        // cliff/rock: steep slopes or high elevation
        let rC = Math.max(0, Math.min(1, (slope - 2.5) * 0.35 + (h - 28) * 0.04));

        const total = rG + rD + rC + 0.001;
        rG /= total; rD /= total; rC /= total;

        const i = (my * MIX + mx) * 4;
        mixData[i]   = (rG * 255) | 0;
        mixData[i+1] = (rD * 255) | 0;
        mixData[i+2] = (rC * 255) | 0;
        mixData[i+3] = 255;
      }
    }
    const mixTex = RawTexture.CreateRGBATexture(mixData, MIX, MIX, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
    mixTex.name = 'terrainMix';

    try {
      const tMat = new TerrainMaterial('terrainMat', scene);
      tMat.mixTexture = mixTex;

      // Layer 1 — grass (procedural)
      tMat.diffuseTexture1 = createGrassTexture(scene);
      tMat.diffuseTexture1.uScale = 500; tMat.diffuseTexture1.vScale = 500;
      tMat.bumpTexture1    = createGrassNormal(scene);
      tMat.bumpTexture1.uScale  = 250;  tMat.bumpTexture1.vScale  = 250;

      // Layer 2 — dirt (procedural)
      tMat.diffuseTexture2 = createDirtTexture(scene);
      tMat.diffuseTexture2.uScale = 200; tMat.diffuseTexture2.vScale = 200;
      tMat.bumpTexture2    = createDirtNormal(scene);
      tMat.bumpTexture2.uScale  = 200;  tMat.bumpTexture2.vScale  = 200;

      // Layer 3 — cliff rock (procedural)
      tMat.diffuseTexture3 = createCliffTexture(scene);
      tMat.diffuseTexture3.uScale = 180; tMat.diffuseTexture3.vScale = 180;
      tMat.bumpTexture3    = createCliffNormal(scene);
      tMat.bumpTexture3.uScale  = 180;  tMat.bumpTexture3.vScale  = 180;

      tMat.specularColor = new Color3(0.04, 0.04, 0.04);
      tMat.specularPower = 64;
      terrain.material = tMat;
      console.log('[World] TerrainMaterial: procedural 3-layer splat ready');
    } catch (e) {
      // Fallback to PBR if TerrainMaterial fails
      console.warn('[World] TerrainMaterial failed, using PBR fallback:', e.message);
      const tMat = new PBRMaterial('terrainMat', scene);
      tMat.albedoTexture = createGrassTexture(scene);
      tMat.albedoTexture.uScale = 500; tMat.albedoTexture.vScale = 500;
      tMat.bumpTexture   = createGrassNormal(scene);
      tMat.bumpTexture.uScale = 500; tMat.bumpTexture.vScale = 500;
      tMat.bumpTexture.level = 2.0;
      tMat.roughness = 0.92; tMat.metallic = 0.0;
      terrain.material = tMat;
    }
  }
  terrain.checkCollisions = false; // collision handled by low-res mesh below
  terrain.receiveShadows = true;
  terrain.position = new Vector3(WORLD_SIZE/2, 0, WORLD_SIZE/2);
  world.terrain = terrain;

  // ── Collision terrain (64 subs, invisible — 8k tris vs 131k) ──
  const colRes = 128;
  const colMesh = MeshBuilder.CreateGround('terrainCol', {
    width: WORLD_SIZE, height: WORLD_SIZE, subdivisions: colRes, updatable: false,
  }, scene);
  const cpos = colMesh.getVerticesData('position');
  for (let i = 0; i < cpos.length; i += 3) {
    cpos[i+1] = getHeight(cpos[i] + WORLD_SIZE/2, cpos[i+2] + WORLD_SIZE/2);
  }
  colMesh.updateVerticesData('position', cpos);
  colMesh.isVisible = false;
  colMesh.checkCollisions = true;
  colMesh.isPickable = false;
  colMesh.position = new Vector3(WORLD_SIZE/2, 0, WORLD_SIZE/2);

  // ── Water — boreal lakes with reflections ──
  let water;
  try {
    const { WaterMaterial } = await import('@babylonjs/materials/water/waterMaterial.js');
    water = MeshBuilder.CreateGround('water', { width:WORLD_SIZE, height:WORLD_SIZE, subdivisions:4 }, scene);
    const wMat = new WaterMaterial('waterMat', scene, new Vector2(512, 512));
    wMat.windForce = -5;
    wMat.waveHeight = 0.3;
    wMat.waveLength = 0.15;
    wMat.windDirection = new Vector2(1, 1);
    wMat.waterColor = new Color3(0.02, 0.06, 0.12);
    wMat.colorBlendFactor = 0.4;
    wMat.bumpHeight = 0.12;
    wMat.alpha = 0.92;
    // Add terrain to reflection/refraction
    wMat.addToRenderList(world.terrain);
    water.material = wMat;
    water.position = new Vector3(WORLD_SIZE/2, -2, WORLD_SIZE/2);
    water.isPickable = false;
  } catch (e) {
    // Fallback if WaterMaterial unavailable
    console.warn('[Water]', e.message);
    water = MeshBuilder.CreateGround('water', { width:WORLD_SIZE, height:WORLD_SIZE, subdivisions:1 }, scene);
    const wMat = new PBRMaterial('waterMat', scene);
    wMat.albedoColor = new Color3(0.03, 0.08, 0.15);
    wMat.roughness = 0.02; wMat.metallic = 0.5; wMat.alpha = 0.85;
    water.material = wMat;
    water.position = new Vector3(WORLD_SIZE/2, -2, WORLD_SIZE/2);
    water.isPickable = false;
  }

  // ── Boreal Forest ──
  buildBorealForest(scene, shadowGen, world);
  // ── Understory scatter (boulders, bushes, logs, stumps) ──
  buildUnderstory(scene, shadowGen);
  // ── Grass billboard ground cover ──
  buildGroundCover(scene);
  // ── Rock formations / cliffs ──
  buildRockFormations(scene, shadowGen);
  // ── Roads ──
  buildRoads(scene);
  // ── Muskeg bog ground fog ──
  buildBogFog(scene);
  // ── Camps ──
  buildCamps(scene, shadowGen, world);
  // ── Cabins ──
  buildCabins(scene, shadowGen, world);

  world.supplyRoutes = [{ from:CAMPS[0], to:CAMPS[1] }, { from:CAMPS[1], to:CAMPS[3] }];
  return world;
}

// ── Northern Ontario Boreal Forest ──────────────────────────────────────────
// Species mix: 60% black spruce, 15% jack pine, 10% white birch,
//              10% balsam fir, 5% trembling aspen
function buildBorealForest(scene, shadowGen, world) {
  // ── Black Spruce (narrow, columnar, drooping branches) ──
  const spruceTrunk = MeshBuilder.CreateCylinder('spTr', { height:8, diameterTop:0.08, diameterBottom:0.22, tessellation:8 }, scene);
  const barkMat = new PBRMaterial('barkM', scene);
  barkMat.albedoTexture = createBarkTexture(scene);
  barkMat.bumpTexture   = createBarkNormal(scene);
  barkMat.bumpTexture.level = 2.0;
  const barkORM = createBarkORM(scene);
  barkMat.metallicTexture = barkORM;
  barkMat.useRoughnessFromMetallicTextureGreen = true;
  barkMat.useMetallnessFromMetallicTextureBlue = true;
  barkMat.ambientTexture = barkORM;
  barkMat.ambientTextureStrength = 0.9;
  barkMat.roughness = 1.0; barkMat.metallic = 1.0;
  spruceTrunk.material = barkMat; spruceTrunk.isVisible = false;

  // Spruce canopy layers (6 tiers for dense, realistic boreal silhouette)
  // Wind-animated via PBRCustomMaterial — all tiers share same material
  const spMat = makeWindMat(scene, 'spMat', {
    color: new Color3(0.02, 0.10, 0.02), roughness: 0.92,
    translucency: 0.15, tintColor: new Color3(0.05, 0.25, 0.02), swayScale: 2.0,
  });
  const spC0 = MeshBuilder.CreateCylinder('sp0', { height:2.8, diameterTop:0.5, diameterBottom:3.5, tessellation:7 }, scene);
  spC0.material = spMat; spC0.isVisible = false;
  const spC1 = MeshBuilder.CreateCylinder('sp1', { height:2.4, diameterTop:0.4, diameterBottom:2.8, tessellation:7 }, scene);
  spC1.material = spMat; spC1.isVisible = false;
  const spC2 = MeshBuilder.CreateCylinder('sp2', { height:2.0, diameterTop:0.3, diameterBottom:2.2, tessellation:7 }, scene);
  spC2.material = spMat; spC2.isVisible = false;
  const spC3 = MeshBuilder.CreateCylinder('sp3', { height:1.8, diameterTop:0.2, diameterBottom:1.6, tessellation:6 }, scene);
  spC3.material = spMat; spC3.isVisible = false;
  const spC4 = MeshBuilder.CreateCylinder('sp4', { height:1.4, diameterTop:0.1, diameterBottom:1.1, tessellation:6 }, scene);
  spC4.material = spMat; spC4.isVisible = false;
  const spC5 = MeshBuilder.CreateCylinder('sp5', { height:1.0, diameterTop:0, diameterBottom:0.6, tessellation:5 }, scene);
  spC5.material = spMat; spC5.isVisible = false;

  // ── Jack Pine (twisted, open crown — 3 irregular cone clusters) ──
  const jpMat = makeWindMat(scene, 'jpMat', {
    color: new Color3(0.05, 0.14, 0.03), roughness: 0.88,
    translucency: 0.12, tintColor: new Color3(0.08, 0.3, 0.03), swayScale: 2.5,
  });
  const jpC0 = MeshBuilder.CreateCylinder('jpC0', { height:3.0, diameterTop:0.3, diameterBottom:2.8, tessellation:6 }, scene);
  jpC0.material = jpMat; jpC0.isVisible = false;
  const jpC1 = MeshBuilder.CreateCylinder('jpC1', { height:2.2, diameterTop:0.2, diameterBottom:2.0, tessellation:6 }, scene);
  jpC1.material = jpMat; jpC1.isVisible = false;
  const jpC2 = MeshBuilder.CreateCylinder('jpC2', { height:1.5, diameterTop:0, diameterBottom:1.4, tessellation:5 }, scene);
  jpC2.material = jpMat; jpC2.isVisible = false;

  // ── White Birch (distinctive white bark, ovoid crown) ──
  const birchTrunk = MeshBuilder.CreateCylinder('biTr', { height:9, diameterTop:0.1, diameterBottom:0.18, tessellation:8 }, scene);
  const birchBark = new PBRMaterial('biBark', scene);
  birchBark.albedoColor = new Color3(0.85, 0.82, 0.75); // White bark
  birchBark.roughness = 0.7; birchBark.metallic = 0.05;
  birchTrunk.material = birchBark; birchTrunk.isVisible = false;

  const leafMat = makeWindMat(scene, 'leafM', {
    color: new Color3(0.08, 0.28, 0.04), roughness: 1.0,
    translucency: 0.35, tintColor: new Color3(0.18, 0.55, 0.08), swayScale: 2.0,
  });
  const birchLeaf = MeshBuilder.CreateSphere('biL', { diameter:4, segments:8 }, scene);
  birchLeaf.material = leafMat; birchLeaf.isVisible = false;

  // ── Balsam Fir (dense, symmetrical cone) ──
  const firMat = makeWindMat(scene, 'firMat', {
    color: new Color3(0.02, 0.1, 0.03), roughness: 0.9, swayScale: 3.0,
    translucency: 0.10, tintColor: new Color3(0.04, 0.22, 0.02),
  });
  const firCanopy = MeshBuilder.CreateCylinder('firC', { height:6, diameterTop:0, diameterBottom:3.5, tessellation:8 }, scene);
  firCanopy.material = firMat; firCanopy.isVisible = false;

  const mats = {
    spruceTrunk: [], spC0: [], spC1: [], spC2: [], spC3: [], spC4: [], spC5: [],
    jpC0: [], jpC1: [], jpC2: [], birchTrunk: [], birchLeaf: [], firCanopy: []
  };

  const addM = (arr, p, sx, sy, sz, rx, ry, rz) => {
    const q = Quaternion.FromEulerAngles(rx, ry, rz);
    const m = Matrix.Compose(new Vector3(sx, sy, sz), q, p);
    for (let c = 0; c < 16; c++) arr.push(m.m[c]);
  };

  const treeCount = 20000;
  for (let i = 0; i < treeCount; i++) {
    const x = hash(i,0) * WORLD_SIZE;
    const z = hash(i,1) * WORLD_SIZE;
    const h = getHeight(x, z);
    if (h < 1 || h > 32) continue;
    if (nearRoad(x,z) || nearCamp(x,z)) continue;

    const s = 0.5 + hash(i,2) * 1.0;
    const ry = hash(i,4) * Math.PI * 2;
    const species = hash(i,3);

    // Random trunk lean for organic feel
    const lean = (hash(i,7) - 0.5) * 0.08;

    if (species < 0.60) {
      // Black spruce — 6-tier canopy
      addM(mats.spruceTrunk, new Vector3(x, h+4*s, z), s, s, s, 0, ry, lean);
      addM(mats.spC0, new Vector3(x, h+4*s, z), s, s, s, 0, 0, 0);
      addM(mats.spC1, new Vector3(x, h+6*s, z), s, s, s, 0, 0, 0);
      addM(mats.spC2, new Vector3(x, h+7.8*s, z), s, s, s, 0, 0, 0);
      addM(mats.spC3, new Vector3(x, h+9.2*s, z), s, s, s, 0, 0, 0);
      addM(mats.spC4, new Vector3(x, h+10.4*s, z), s, s, s, 0, 0, 0);
      addM(mats.spC5, new Vector3(x, h+11.4*s, z), s, s, s, 0, 0, 0);
    } else if (species < 0.75) {
      // Jack pine — 3 irregular cone clusters
      addM(mats.spruceTrunk, new Vector3(x, h+4.5*s, z), s*0.8, s*1.2, s*0.8, 0, ry, lean);
      const ox = (hash(i,5) - 0.5) * 1.5 * s;
      const oz = (hash(i,6) - 0.5) * 1.5 * s;
      addM(mats.jpC0, new Vector3(x+ox*0.3, h+6.5*s, z+oz*0.3), s, s, s, 0, ry, 0);
      addM(mats.jpC1, new Vector3(x+ox, h+8*s, z+oz), s*0.9, s*0.9, s*0.9, 0, ry*1.5, 0);
      addM(mats.jpC2, new Vector3(x-ox*0.5, h+9.5*s, z-oz*0.5), s*0.7, s*0.7, s*0.7, 0, ry*2, 0);
    } else if (species < 0.85) {
      // White birch — multiple overlapping leaf clusters
      addM(mats.birchTrunk, new Vector3(x, h+4.5*s, z), s*0.7, s, s*0.7, 0, ry, lean*1.5);
      addM(mats.birchLeaf, new Vector3(x, h+7.5*s, z), s*1.0, s*0.7, s*1.0, 0, 0, 0);
      addM(mats.birchLeaf, new Vector3(x+s*0.5, h+9*s, z+s*0.3), s*0.8, s*0.6, s*0.8, 0, ry, 0);
    } else if (species < 0.95) {
      // Balsam fir — dense symmetrical cone
      addM(mats.spruceTrunk, new Vector3(x, h+3*s, z), s, s*0.8, s, 0, ry, lean*0.5);
      addM(mats.firCanopy, new Vector3(x, h+6.5*s, z), s, s, s, 0, 0, 0);
    } else {
      // Dead standing (snag) — common in boreal, heavy lean
      addM(mats.spruceTrunk, new Vector3(x, h+3*s, z), s*0.6, s*0.7, s*0.6, 0, 0, lean*3);
    }
    world.trees.push({x,z,s});
  }

  // Apply Thin Instances
  if (mats.spruceTrunk.length) spruceTrunk.thinInstanceSetBuffer('matrix', new Float32Array(mats.spruceTrunk), 16);
  if (mats.spC0.length) spC0.thinInstanceSetBuffer('matrix', new Float32Array(mats.spC0), 16);
  if (mats.spC1.length) spC1.thinInstanceSetBuffer('matrix', new Float32Array(mats.spC1), 16);
  if (mats.spC2.length) spC2.thinInstanceSetBuffer('matrix', new Float32Array(mats.spC2), 16);
  if (mats.spC3.length) spC3.thinInstanceSetBuffer('matrix', new Float32Array(mats.spC3), 16);
  if (mats.spC4.length) spC4.thinInstanceSetBuffer('matrix', new Float32Array(mats.spC4), 16);
  if (mats.spC5.length) spC5.thinInstanceSetBuffer('matrix', new Float32Array(mats.spC5), 16);
  if (mats.jpC0.length) jpC0.thinInstanceSetBuffer('matrix', new Float32Array(mats.jpC0), 16);
  if (mats.jpC1.length) jpC1.thinInstanceSetBuffer('matrix', new Float32Array(mats.jpC1), 16);
  if (mats.jpC2.length) jpC2.thinInstanceSetBuffer('matrix', new Float32Array(mats.jpC2), 16);
  if (mats.birchTrunk.length) birchTrunk.thinInstanceSetBuffer('matrix', new Float32Array(mats.birchTrunk), 16);
  if (mats.birchLeaf.length) birchLeaf.thinInstanceSetBuffer('matrix', new Float32Array(mats.birchLeaf), 16);
  if (mats.firCanopy.length) firCanopy.thinInstanceSetBuffer('matrix', new Float32Array(mats.firCanopy), 16);

  if (shadowGen) {
    shadowGen.addShadowCaster(spruceTrunk);
    shadowGen.addShadowCaster(spC0);
    shadowGen.addShadowCaster(jpC0);
    shadowGen.addShadowCaster(birchTrunk);
    shadowGen.addShadowCaster(birchLeaf);
    shadowGen.addShadowCaster(firCanopy);
  }
}

// ── Ground Cover — rocks, deadfall, bushes, stumps ──
function buildUnderstory(scene, shadowGen) {
  rockMat.albedoTexture = createCliffTexture(scene);
  rockMat.bumpTexture   = createCliffNormal(scene);
  rockMat.bumpTexture.level = 2.0;
  const rockORM = createBarkORM(scene); // reuse for AO/rough (no metallic on rock)
  rockMat.metallicTexture = rockORM;
  rockMat.useRoughnessFromMetallicTextureGreen = true;
  rockMat.useMetallnessFromMetallicTextureBlue = true;
  rockMat.ambientTexture = rockORM;
  rockMat.ambientTextureStrength = 0.9;
  rockMat.roughness = 1.0; rockMat.metallic = 1.0;
  // Canadian Shield granite boulders
  const rock = MeshBuilder.CreateSphere('rockT', { diameter:1, segments:5 }, scene);
  rock.material = rockMat; rock.isVisible = false;

  // Low bush (blueberry, Labrador tea — common boreal understory)
  const bushMat = new PBRMaterial('bushM', scene);
  bushMat.albedoColor = new Color3(0.06, 0.16, 0.05);
  bushMat.roughness = 0.88; bushMat.metallic = 0;
  bushMat.subSurface.isTranslucencyEnabled = true;
  bushMat.subSurface.translucencyIntensity = 0.2;
  bushMat.subSurface.tintColor = new Color3(0.12, 0.45, 0.05);
  const bush = MeshBuilder.CreateSphere('bushT', { diameter:1.2, segments:5 }, scene);
  bush.material = bushMat; bush.isVisible = false;

  // Deadfall log
  const logMat = new PBRMaterial('logM', scene);
  logMat.albedoTexture = createBarkTexture(scene);
  const logORM = createBarkORM(scene);
  logMat.metallicTexture = logORM;
  logMat.useRoughnessFromMetallicTextureGreen = true;
  logMat.useMetallnessFromMetallicTextureBlue = true;
  logMat.ambientTexture = logORM;
  logMat.ambientTextureStrength = 0.85;
  logMat.roughness = 1.0; logMat.metallic = 1.0;
  const log = MeshBuilder.CreateCylinder('logT', { height:4, diameter:0.25, tessellation:6 }, scene);
  log.material = logMat; log.isVisible = false;

  // Stump
  const stump = MeshBuilder.CreateCylinder('stumpT', { height:0.6, diameterTop:0.35, diameterBottom:0.45, tessellation:6 }, scene);
  stump.material = logMat; stump.isVisible = false;

  const mats = { rock: [], bush: [], log: [], stump: [] };
  const addM = (arr, p, sx, sy, sz, rx, ry, rz) => {
    const q = Quaternion.FromEulerAngles(rx, ry, rz);
    const m = Matrix.Compose(new Vector3(sx, sy, sz), q, p);
    for (let c = 0; c < 16; c++) arr.push(m.m[c]);
  };

  for (let i = 0; i < 8000; i++) {
    const x = hash(i+60000,0)*WORLD_SIZE;
    const z = hash(i+60000,1)*WORLD_SIZE;
    const h = getHeight(x,z);
    if (h < 0.5 || h > 30) continue;
    if (nearRoad(x,z)) continue;

    const t = hash(i+60000,2);
    const s = 0.3 + hash(i+60000,3) * 1.8;
    if (t < 0.3) {
      // Shield granite boulder
      addM(mats.rock, new Vector3(x, h+s*0.25, z), 
           s*(0.7+hash(i+60000,4)*0.6), s*0.5, s*(0.7+hash(i+60000,5)*0.6), 
           0, hash(i+60000,6)*Math.PI, 0);
    } else if (t < 0.6) {
      // Boreal understory bush
      addM(mats.bush, new Vector3(x, h+s*0.3, z), s*0.8, s*0.5, s*0.8, 0, 0, 0);
    } else if (t < 0.85) {
      // Deadfall
      addM(mats.log, new Vector3(x, h+0.08, z), s*0.5, s, s*0.5, 0, hash(i+60000,4)*Math.PI, Math.PI/2);
    } else {
      // Stump
      addM(mats.stump, new Vector3(x, h+0.3, z), s*0.8, s, s*0.8, 0, 0, 0);
    }
  }

  if (mats.rock.length) rock.thinInstanceSetBuffer('matrix', new Float32Array(mats.rock), 16);
  if (mats.bush.length) bush.thinInstanceSetBuffer('matrix', new Float32Array(mats.bush), 16);
  if (mats.log.length) log.thinInstanceSetBuffer('matrix', new Float32Array(mats.log), 16);
  if (mats.stump.length) stump.thinInstanceSetBuffer('matrix', new Float32Array(mats.stump), 16);

  if (shadowGen) {
    shadowGen.addShadowCaster(log);
    shadowGen.addShadowCaster(stump);
  }
}

// ── Rock Formations — cliff faces and boulder clusters on mountain slopes ──────
// Placed procedurally wherever getHeight() exceeds CLIFF_LINE.
// Each formation is 3-7 irregularly scaled/rotated boxes + sphere caps.
function buildRockFormations(scene, shadowGen) {
  const rockMat = new PBRMaterial('rockFormMat', scene);
  rockMat.albedoTexture = createCliffTexture(scene);
  rockMat.albedoTexture.uScale = 4; rockMat.albedoTexture.vScale = 4;
  rockMat.bumpTexture    = createCliffNormal(scene);
  rockMat.bumpTexture.uScale = 4; rockMat.bumpTexture.vScale = 4;
  rockMat.bumpTexture.level = 1.6;
  rockMat.roughness = 0.92; rockMat.metallic = 0.04;

  const snowMat = new PBRMaterial('snowPatchMat', scene);
  snowMat.albedoTexture = createSnowTexture(scene);
  snowMat.albedoTexture.uScale = 2; snowMat.albedoTexture.vScale = 2;
  snowMat.bumpTexture   = createSnowNormal(scene);
  snowMat.bumpTexture.uScale = 2; snowMat.bumpTexture.vScale = 2;
  snowMat.bumpTexture.level = 0.4;
  snowMat.roughness = 0.55; snowMat.metallic = 0.0;

  // Template meshes (invisible; cloned per formation)
  const slab = MeshBuilder.CreateBox('rockSlab', { width:1, height:1, depth:1 }, scene);
  slab.isVisible = false;
  const cap = MeshBuilder.CreateSphere('rockCap', { diameter:1, segments:5 }, scene);
  cap.isVisible = false;

  const rng = (seed, lo, hi) => {
    const h = Math.abs(Math.sin(seed * 127.1 + 311.7) * 43758.5453);
    return lo + (h - Math.floor(h)) * (hi - lo);
  };

  let formCount = 0;
  // Sample grid — one formation per ~80m cell if elevation is high enough
  const step = 80;
  for (let xi = 0; xi < WORLD_SIZE; xi += step) {
    for (let zi = 0; zi < WORLD_SIZE; zi += step) {
      // Offset within cell
      const seed = xi * 31 + zi * 7;
      const ox = rng(seed, 10, step - 10);
      const oz = rng(seed + 1, 10, step - 10);
      const wx = xi + ox, wz = zi + oz;

      const h = getHeight(wx, wz);
      if (h < CLIFF_LINE) continue;  // Only above cliff line

      // Slope — steeper slope = taller cliff
      const slope = Math.abs(h - getHeight(wx+3, wz)) + Math.abs(h - getHeight(wx, wz+3));
      if (slope < 1.5 && h < CLIFF_LINE + 15) continue; // Skip gentle low slopes

      // Base position
      const baseY = h;
      const ry = rng(seed + 2, 0, Math.PI * 2);

      // Formation LOD group
      const lodGroup = { cx: wx - WORLD_SIZE/2, cz: wz - WORLD_SIZE/2, instances: [] };

      // Number of slab pieces (3-7)
      const pieces = Math.floor(rng(seed + 3, 3, 7.9));
      for (let p = 0; p < pieces; p++) {
        const ps2 = seed + p * 17;
        const px = wx + rng(ps2, -6, 6);
        const pz = wz + rng(ps2+1, -6, 6);
        const ph = getHeight(px, pz);

        const sw = rng(ps2+2, 2.5, 9);
        const sh = rng(ps2+3, 3, 14) * (slope / 3);  // taller on steep slopes
        const sd = rng(ps2+4, 2, 7);
        const tiltX = rng(ps2+5, -0.15, 0.15);
        const tiltZ = rng(ps2+6, -0.15, 0.15);

        const inst = slab.createInstance(`rf_${formCount}_${p}`);
        inst.scaling = new Vector3(sw, sh, sd);
        inst.position = new Vector3(
          px - WORLD_SIZE/2,
          ph + sh * 0.5 - 0.5,  // embed base into ground
          pz - WORLD_SIZE/2
        );
        inst.rotation = new Vector3(tiltX, ry + p * 0.4, tiltZ);
        inst.material = rockMat;
        inst.receiveShadows = true;
        inst.checkCollisions = true;
        if (shadowGen) shadowGen.addShadowCaster(inst, false);
        lodGroup.instances.push(inst);

        // Snow patch on top face of tall slabs above snow line
        if (ph > SNOW_LINE && sh > 5 && rng(ps2+7, 0, 1) > 0.4) {
          const sc = cap.createInstance(`rf_sc_${formCount}_${p}`);
          sc.scaling = new Vector3(sw * 0.85, 0.6, sd * 0.85);
          sc.position = new Vector3(
            px - WORLD_SIZE/2,
            ph + sh - 0.2,
            pz - WORLD_SIZE/2
          );
          sc.material = snowMat;
          sc.receiveShadows = true;
          lodGroup.instances.push(sc);
        }
      }
      _rockLODGroups.push(lodGroup);
      formCount++;
    }
  }
  console.log(`[World] Rock formations: ${formCount} placed`);
  slab.dispose();
  cap.dispose();
}

// ── Muskeg bog ground fog ─────────────────────────────────────────────────────
// Thin semi-transparent planes stacked at bog surface level.
// BOG_FOG_RADIUS controls player-proximity LOD.
const _bogFogPlanes  = [];   // { mesh, wx, wz } each fog patch
const BOG_FOG_RADIUS = 200;

function buildBogFog(scene) {
  const fogMat = new StandardMaterial('bogFogMat', scene);
  fogMat.diffuseColor   = new Color3(0.82, 0.88, 0.90);
  fogMat.emissiveColor  = new Color3(0.55, 0.60, 0.62);
  fogMat.alpha          = 0.0; // drawn at 0 — visibility managed per-patch by updateBogFog
  fogMat.backFaceCulling = false;
  fogMat.disableLighting = true;

  // Sample bog positions: same fbm that drives the height depression
  let placed = 0;
  const step = 160;
  for (let xi = 0; xi < WORLD_SIZE && placed < 60; xi += step) {
    for (let zi = 0; zi < WORLD_SIZE && placed < 60; zi += step) {
      const wx = xi + hash(xi*7, zi*3) * step * 0.5;
      const wz = zi + hash(xi*5, zi*9) * step * 0.5;
      const h = getHeight(wx, wz);
      if (h > 1.5) continue; // only in actual bog depressions

      // Stack 3 translucent planes at slightly different heights
      for (let layer = 0; layer < 3; layer++) {
        const size = 35 + hash(wx+layer, wz+layer) * 30;
        const plane = MeshBuilder.CreateGround(`bogFog_${placed}_${layer}`, { width: size, height: size }, scene);
        plane.material = fogMat.clone(`bogFogMat_${placed}_${layer}`);
        plane.material.alpha = 0.0;
        plane.position = new Vector3(wx - WORLD_SIZE/2, h + 0.3 + layer * 0.6, wz - WORLD_SIZE/2);
        plane.isPickable = false;
        plane.receiveShadows = false;
        _bogFogPlanes.push({ mesh: plane, wx: wx - WORLD_SIZE/2, wz: wz - WORLD_SIZE/2, layer });
      }
      placed++;
    }
  }
  console.log(`[World] Bog fog patches: ${placed}`);
}

/**
 * updateBogFog — fade in/out fog plane opacity based on camera proximity.
 * Call at ~2Hz from engine loop.
 */
export function updateBogFog(camX, camZ, weatherType) {
  const baseAlpha = weatherType === 'fog' ? 0.28 : weatherType === 'rain' ? 0.18 : 0.12;
  const r2 = BOG_FOG_RADIUS * BOG_FOG_RADIUS;
  for (const p of _bogFogPlanes) {
    const dx = p.wx - camX, dz = p.wz - camZ;
    const dist2 = dx*dx + dz*dz;
    const visible = dist2 < r2;
    const targetAlpha = visible ? baseAlpha * (1 - p.layer * 0.25) : 0;
    const mat = p.mesh.material;
    if (Math.abs((mat.alpha ?? 0) - targetAlpha) > 0.005) {
      mat.alpha += (targetAlpha - mat.alpha) * 0.12; // smooth lerp
    }
  }
}

// ── Roads (terrain-following ribbons) ──
function buildRoads(scene) {
  for (const r of ROADS) {
    const dx = r.x2 - r.x1, dz = r.z2 - r.z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const steps = Math.max(4, Math.floor(len / 5)); // Sample every 5m
    const nx = dx / len, nz = dz / len; // road direction
    const px = -nz, pz = nx; // perpendicular (road width direction)
    const hw = r.width / 2; // half width

    // Build two parallel paths (left and right edges)
    const pathLeft = [], pathRight = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = r.x1 + dx * t;
      const cz = r.z1 + dz * t;
      const lx = cx + px * hw, lz = cz + pz * hw;
      const rx = cx - px * hw, rz = cz - pz * hw;
      pathLeft.push(new Vector3(lx, getHeight(lx, lz) + 0.15, lz));
      pathRight.push(new Vector3(rx, getHeight(rx, rz) + 0.15, rz));
    }

    const road = MeshBuilder.CreateRibbon('road', { pathArray: [pathLeft, pathRight], sideOrientation: Mesh.DOUBLESIDE }, scene);

    const mat = new PBRMaterial('roadM', scene);
    if (r.width >= 6) {
      // Highway — asphalt procedural
      mat.albedoTexture = createAsphaltTexture(scene);
      mat.albedoTexture.uScale = len / 8; mat.albedoTexture.vScale = 1;
      const aspORM = createAsphaltORM(scene);
      aspORM.uScale = len / 8; aspORM.vScale = 1;
      mat.metallicTexture = aspORM;
      mat.useRoughnessFromMetallicTextureGreen = true;
      mat.useMetallnessFromMetallicTextureBlue = true;
      mat.ambientTexture = aspORM;
      mat.ambientTextureStrength = 0.8;
      mat.roughness = 1.0; mat.metallic = 1.0;
      mat.clearCoat.isEnabled = true;
      mat.clearCoat.intensity = 0.45;
      mat.clearCoat.roughness = 0.12;
    } else {
      // Logging road — procedural dirt
      mat.albedoTexture = createDirtTexture(scene);
      mat.albedoTexture.uScale = len / 4; mat.albedoTexture.vScale = 1;
      mat.roughness = 0.96; mat.metallic = 0.0;
    }
    road.material = mat;
    road.checkCollisions = true; road.receiveShadows = true; road.isPickable = false;
  }
}

// ── Shared camp materials ─────────────────────────────────────────────────────
let _campMats = null;
function getCampMats(scene) {
  if (_campMats) return _campMats;
  const concM = new PBRMaterial('concM', scene);
  concM.albedoTexture = createConcreteTexture(scene);
  const concORM = createConcreteORM(scene);
  concM.metallicTexture = concORM;
  concM.useRoughnessFromMetallicTextureGreen = true;
  concM.useMetallnessFromMetallicTextureBlue = true;
  concM.ambientTexture = concORM; concM.ambientTextureStrength = 0.85;
  concM.roughness = 1.0; concM.metallic = 1.0;

  const tentM = new PBRMaterial('tentM', scene);
  tentM.albedoColor = new Color3(0.20, 0.26, 0.16); tentM.roughness = 0.92; tentM.metallic = 0;

  const sandM = new PBRMaterial('sandM', scene);
  sandM.albedoColor = new Color3(0.56, 0.50, 0.34); sandM.roughness = 0.95; sandM.metallic = 0;

  const steelM = new PBRMaterial('steelM', scene);
  steelM.albedoColor = new Color3(0.18, 0.18, 0.18); steelM.roughness = 0.45; steelM.metallic = 0.88;

  const woodM = new PBRMaterial('campWoodM', scene);
  woodM.albedoTexture = createBarkTexture(scene);
  const bORM = createBarkORM(scene);
  woodM.metallicTexture = bORM; woodM.ambientTexture = bORM;
  woodM.useRoughnessFromMetallicTextureGreen = true;
  woodM.useMetallnessFromMetallicTextureBlue = true;
  woodM.ambientTextureStrength = 0.9; woodM.roughness = 1.0; woodM.metallic = 1.0;

  const crateM = new PBRMaterial('crateM', scene);
  crateM.albedoColor = new Color3(0.38, 0.28, 0.12); crateM.roughness = 0.9; crateM.metallic = 0;

  const wireM = new PBRMaterial('wireM', scene);
  wireM.albedoColor = new Color3(0.55, 0.50, 0.38); wireM.roughness = 0.4; wireM.metallic = 0.85;

  _campMats = { concM, tentM, sandM, steelM, woodM, crateM, wireM };
  return _campMats;
}

// ── Enemy Camps ──────────────────────────────────────────────────────────────
function buildCamps(scene, sg, world) {
  const M = getCampMats(scene);

  for (const camp of CAMPS) {
    const h = getHeight(camp.x, camp.z);
    const rad = camp.size === 'large' ? 30 : 18;
    const isLarge = camp.size === 'large';

    // ── Guard tower — concrete legs, wooden platform, railing ──
    const twX = camp.x + rad * 0.7, twZ = camp.z + rad * 0.7;
    const twH = getHeight(twX, twZ);

    // Four corner legs
    for (let cl = 0; cl < 4; cl++) {
      const cx = twX + (cl < 2 ? -0.9 : 0.9);
      const cz = twZ + (cl % 2 === 0 ? -0.9 : 0.9);
      const leg = MeshBuilder.CreateBox(`twleg_${camp.name}_${cl}`, { width: 0.22, height: 7.5, depth: 0.22 }, scene);
      leg.position = new Vector3(cx, twH + 3.75, cz);
      leg.material = M.woodM; leg.checkCollisions = true;
      if (sg) sg.addShadowCaster(leg);
    }
    // Platform floor
    const plat = MeshBuilder.CreateBox(`twplat_${camp.name}`, { width: 3.0, height: 0.18, depth: 3.0 }, scene);
    plat.position = new Vector3(twX, twH + 7.6, twZ);
    plat.material = M.woodM; plat.checkCollisions = true;
    if (sg) sg.addShadowCaster(plat);

    // Railings (4 sides)
    const railDirs = [[0,1.35,0],[0,-1.35,0],[1.35,0,0],[-1.35,0,0]];
    const railRots = [0, 0, Math.PI/2, Math.PI/2];
    for (let ri = 0; ri < 4; ri++) {
      const rail = MeshBuilder.CreateBox(`twrail_${camp.name}_${ri}`, { width: 2.6, height: 0.06, depth: 0.05 }, scene);
      rail.position = new Vector3(twX + railDirs[ri][0], twH + 8.2, twZ + railDirs[ri][1]);
      rail.rotation.y = railRots[ri];
      rail.material = M.woodM;
    }
    // Ladder (vertical box + rungs)
    const ladder = MeshBuilder.CreateBox(`twladr_${camp.name}`, { width: 0.5, height: 7.2, depth: 0.06 }, scene);
    ladder.position = new Vector3(twX - 1.3, twH + 3.8, twZ);
    ladder.material = M.woodM;
    for (let rung = 0; rung < 8; rung++) {
      const r = MeshBuilder.CreateBox(`twrung_${camp.name}_${rung}`, { width: 0.5, height: 0.04, depth: 0.08 }, scene);
      r.position = new Vector3(twX - 1.3, twH + 0.5 + rung * 0.9, twZ);
      r.material = M.steelM;
    }

    // ── Tents (with ridge roof) ──
    const tentCount = isLarge ? 5 : 2;
    for (let t = 0; t < tentCount; t++) {
      const a = (t / tentCount) * Math.PI * 2;
      const tx = camp.x + Math.cos(a) * rad * 0.5;
      const tz = camp.z + Math.sin(a) * rad * 0.5;
      const th = getHeight(tx, tz);
      // Tent walls
      const tent = MeshBuilder.CreateBox(`tent_${camp.name}_${t}`, { width: 3.8, height: 2.2, depth: 4.8 }, scene);
      tent.position = new Vector3(tx, th + 1.1, tz); tent.rotation.y = a;
      tent.material = M.tentM; tent.checkCollisions = true;
      if (sg) sg.addShadowCaster(tent);
      // Ridge roof (pyramid approximation with scaled cylinder)
      const roof = MeshBuilder.CreateCylinder(`tentroof_${camp.name}_${t}`, { height: 1.4, diameterTop: 0.1, diameterBottom: 5.6, tessellation: 4 }, scene);
      roof.position = new Vector3(tx, th + 2.9, tz); roof.rotation.y = a + Math.PI / 4;
      roof.scaling.z = 0.9;
      roof.material = M.tentM; if (sg) sg.addShadowCaster(roof);
    }

    // ── Sandbag barriers (stacked boxes, earth tones) ──
    const wallCount = isLarge ? 14 : 8;
    for (let w = 0; w < wallCount; w++) {
      if (w === 0 || w === Math.floor(wallCount / 2)) continue; // entrances
      const a = (w / wallCount) * Math.PI * 2;
      const wx = camp.x + Math.cos(a) * rad, wz = camp.z + Math.sin(a) * rad;
      const wh = getHeight(wx, wz);
      // Lower sandbag row
      const sb1 = MeshBuilder.CreateBox(`sb1_${camp.name}_${w}`, { width: 4.5, height: 0.55, depth: 0.65 }, scene);
      sb1.position = new Vector3(wx, wh + 0.275, wz); sb1.rotation.y = a + Math.PI / 2;
      sb1.material = M.sandM; sb1.checkCollisions = true;
      // Upper row (slightly narrower)
      const sb2 = MeshBuilder.CreateBox(`sb2_${camp.name}_${w}`, { width: 4.0, height: 0.45, depth: 0.60 }, scene);
      sb2.position = new Vector3(wx, wh + 0.725, wz); sb2.rotation.y = a + Math.PI / 2;
      sb2.material = M.sandM; sb2.checkCollisions = true;
    }

    // ── Supply crates (stacked, with planks on top) ──
    const crateCount = isLarge ? 8 : 3;
    for (let c = 0; c < crateCount; c++) {
      const cx = camp.x + (hash(c, camp.x) - 0.5) * rad * 0.8;
      const cz = camp.z + (hash(c, camp.z) - 0.5) * rad * 0.8;
      const ch = getHeight(cx, cz);
      const stack = Math.floor(hash(c + 7, camp.x) * 2) + 1; // 1–2 high
      for (let cs = 0; cs < stack; cs++) {
        const crate = MeshBuilder.CreateBox(`crate_${camp.name}_${c}_${cs}`, { width: 1.1, height: 0.75, depth: 1.1 }, scene);
        crate.position = new Vector3(cx, ch + 0.375 + cs * 0.78, cz);
        crate.rotation.y = hash(c, camp.z) * Math.PI;
        crate.material = M.crateM;
        if (cs === stack - 1) {  // top crate is lootable
          crate.isPickable = true;
          crate.metadata = { type: 'loot', lootType: 'supplyCrate', camp: camp.name };
        }
        crate.checkCollisions = true;
        if (sg) sg.addShadowCaster(crate);
      }
    }

    // ── Barbed wire coils (along perimeter gaps) ──
    for (let bw = 0; bw < 3; bw++) {
      const a = (bw / 3) * Math.PI * 2 + 0.3;
      const bx = camp.x + Math.cos(a) * (rad - 3);
      const bz = camp.z + Math.sin(a) * (rad - 3);
      const bwire = MeshBuilder.CreateTorus(`bwire_${camp.name}_${bw}`, { diameter: 1.0, thickness: 0.06, tessellation: 10 }, scene);
      bwire.position = new Vector3(bx, getHeight(bx, bz) + 0.3, bz);
      bwire.rotation.x = Math.PI / 2;
      bwire.material = M.wireM;
    }

    // ── Flagpole ──
    const pole = MeshBuilder.CreateCylinder(`pole_${camp.name}`, { height: 8, diameter: 0.07, tessellation: 6 }, scene);
    pole.position = new Vector3(camp.x, h + 4, camp.z);
    pole.material = M.steelM;
    const flag = MeshBuilder.CreatePlane(`flag_${camp.name}`, { width: 2.4, height: 1.4 }, scene);
    flag.position = new Vector3(camp.x + 1.2, h + 7.2, camp.z);
    const fM = new StandardMaterial(`flagM_${camp.name}`, scene);
    fM.diffuseColor = new Color3(0.85, 0.05, 0.05);
    fM.emissiveColor = new Color3(0.10, 0, 0); fM.backFaceCulling = false;
    flag.material = fM;

    // ── Sign board ──
    const sign = MeshBuilder.CreateBox(`sign_${camp.name}`, { width: 2.5, height: 0.6, depth: 0.06 }, scene);
    sign.position = new Vector3(camp.x, h + 2.2, camp.z + rad * 0.5);
    const signM = new PBRMaterial(`signM_${camp.name}`, scene);
    signM.albedoColor = new Color3(0.08, 0.08, 0.06); signM.roughness = 0.6; signM.metallic = 0.7;
    sign.material = signM;

    world.camps.push({ ...camp, h });
  }
}

// ── Cabins ───────────────────────────────────────────────────────────────────
function buildCabins(scene, sg, world) {
  const spots = [
    {x:400,z:400},{x:3600,z:600},{x:600,z:3400},{x:3400,z:3600},
    {x:1800,z:1200},{x:1200,z:2400},{x:2800,z:1600},{x:2200,z:3200},
    {x:700,z:1800},{x:3100,z:2200},{x:1500,z:700},{x:2600,z:3000},
    {x:1000,z:3800},{x:3800,z:800},{x:2400,z:400},{x:1600,z:2800},
  ];

  const cM = new PBRMaterial('cabinWallM', scene);
  cM.albedoTexture = createBarkTexture(scene);
  cM.bumpTexture   = createBarkNormal(scene);
  cM.bumpTexture.level = 1.8;
  const cabORM = createBarkORM(scene);
  cM.metallicTexture = cabORM; cM.ambientTexture = cabORM;
  cM.useRoughnessFromMetallicTextureGreen = true;
  cM.useMetallnessFromMetallicTextureBlue = true;
  cM.ambientTextureStrength = 0.9; cM.roughness = 1.0; cM.metallic = 1.0;

  const rM = new PBRMaterial('cabinRoofM', scene);
  rM.albedoColor = new Color3(0.12, 0.08, 0.05); rM.roughness = 0.88; rM.metallic = 0;

  const chimM = new PBRMaterial('chimM', scene);
  chimM.albedoTexture = createConcreteTexture(scene);
  chimM.roughness = 0.95; chimM.metallic = 0;

  const windowM = new StandardMaterial('winM', scene);
  windowM.diffuseColor = new Color3(0.55, 0.70, 0.82);
  windowM.emissiveColor = new Color3(0.08, 0.12, 0.10);
  windowM.alpha = 0.65;

  const doorM = new PBRMaterial('doorM', scene);
  doorM.albedoColor = new Color3(0.28, 0.16, 0.06); doorM.roughness = 0.85; doorM.metallic = 0;

  for (const p of spots) {
    const h = getHeight(p.x, p.z); if (h < 0.5) continue;

    const cabin = MeshBuilder.CreateBox(`cab_${p.x}`, { width: 6, height: 3.5, depth: 8 }, scene);
    cabin.position = new Vector3(p.x, h + 1.75, p.z);
    cabin.material = cM; cabin.checkCollisions = true; cabin.receiveShadows = true;
    cabin.isPickable = true; cabin.metadata = { type: 'loot', lootType: 'cabin' };
    if (sg) sg.addShadowCaster(cabin);

    const roof = MeshBuilder.CreateCylinder(`roof_${p.x}`, { height: 9.5, diameterTop: 0, diameterBottom: 9, tessellation: 4 }, scene);
    roof.position = new Vector3(p.x, h + 4.6, p.z);
    roof.rotation.y = Math.PI / 4; roof.scaling = new Vector3(0.72, 0.32, 1.0);
    roof.material = rM; if (sg) sg.addShadowCaster(roof);

    const chim = MeshBuilder.CreateBox(`chim_${p.x}`, { width: 0.6, height: 3.0, depth: 0.6 }, scene);
    chim.position = new Vector3(p.x - 1.8, h + 4.8, p.z + 2.5);
    chim.material = chimM; if (sg) sg.addShadowCaster(chim);

    const winPositions = [
      new Vector3(p.x - 1.5, h + 2.0, p.z + 4.02),
      new Vector3(p.x + 1.5, h + 2.0, p.z + 4.02),
      new Vector3(p.x - 1.5, h + 2.0, p.z - 4.02),
      new Vector3(p.x + 1.5, h + 2.0, p.z - 4.02),
      new Vector3(p.x + 3.02, h + 2.0, p.z),
      new Vector3(p.x - 3.02, h + 2.0, p.z),
    ];
    const winRots = [0, 0, 0, 0, Math.PI/2, Math.PI/2];
    for (let wi = 0; wi < winPositions.length; wi++) {
      const win = MeshBuilder.CreatePlane(`win_${p.x}_${wi}`, { width: 0.9, height: 0.85 }, scene);
      win.position = winPositions[wi]; win.rotation.y = winRots[wi];
      win.material = windowM; win.isPickable = false;
    }

    const door = MeshBuilder.CreateBox(`door_${p.x}`, { width: 0.9, height: 2.1, depth: 0.08 }, scene);
    door.position = new Vector3(p.x, h + 1.05, p.z + 4.02);
    door.material = doorM; door.checkCollisions = true;

    const step = MeshBuilder.CreateBox(`step_${p.x}`, { width: 1.8, height: 0.18, depth: 0.6 }, scene);
    step.position = new Vector3(p.x, h + 0.09, p.z + 4.4);
    step.material = rM; step.checkCollisions = true;

    world.buildings.push({ x: p.x, z: p.z, h });
  }
}
