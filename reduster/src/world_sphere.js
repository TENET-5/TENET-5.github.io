/**
 * world_sphere.js — Planetary Round World
 * REDUSTER
 *
 * Builds a spherical planet using a subdivided sphere mesh with per-vertex
 * height displacement driven by the same fbm noise as world.js.
 *
 * The sphere has radius PLANET_RADIUS. Player stands on the surface;
 * gravity always points toward the planet centre.
 *
 * Usage:
 *   import { buildPlanet, getPlanetGravity } from './world_sphere.js';
 *   const planet = await buildPlanet(scene, shadowGen);
 *   // In physics/player loop:
 *   const g = getPlanetGravity(playerPos);  // returns Vector3 toward centre
 */

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import '@babylonjs/loaders/glTF/2.0/index.js';
import { getModelInstance } from './models.js';

// ── Planet parameters ──
export const PLANET_RADIUS   = 600;   // metres — visible sphere radius
export const TERRAIN_AMP     = 55;    // metres — max terrain height above radius
export const SNOW_LINE_ANGLE = 0.68;  // fraction of TERRAIN_AMP where snow begins
export const GRAVITY_STRENGTH = 9.81; // m/s² toward centre

// ── Shared noise (same quality as world.js) ──
function hash(x, y) {
  let h = Math.sin(x*12.9898+y*78.233)*43758.5453;
  return h - Math.floor(h);
}
function noise(x, y) {
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  return hash(ix,iy)+(hash(ix+1,iy)-hash(ix,iy))*sx
       +(hash(ix,iy+1)-hash(ix,iy))*sy
       +(hash(ix,iy)-hash(ix+1,iy)-hash(ix,iy+1)+hash(ix+1,iy+1))*sx*sy;
}
function fbm(x,y,oct=5){let v=0,a=0.5,f=1;for(let i=0;i<oct;i++){v+=a*noise(x*f,y*f);a*=0.5;f*=2;}return v;}

/**
 * Sample terrain height at a point on the sphere surface.
 * @param {Vector3} dir  — unit direction from planet centre
 * @returns {number}     — displacement from PLANET_RADIUS in metres
 */
export function getPlanetHeight(dir) {
  // Map sphere direction to 2D fbm domain (spherical UV)
  const u = (Math.atan2(dir.z, dir.x) / (Math.PI * 2) + 0.5) * 8;
  const v = (Math.asin(Math.max(-1, Math.min(1, dir.y))) / Math.PI + 0.5) * 8;

  // Continental shield — broad
  const shield  = fbm(u*0.7, v*0.7, 5) * 45;
  // Mountain ridges (domain-warped)
  const wu = u + fbm(u*0.5+2.1, v*0.5+3.7, 3) * 0.6;
  const wv = v + fbm(u*0.5+7.3, v*0.5+1.2, 3) * 0.6;
  const ridgeBase = fbm(wu*1.1, wv*1.1, 6);
  const ridged = Math.abs(ridgeBase * 2 - 1);
  const peaks = Math.max(0, (1 - ridged) - 0.38) / 0.62;
  const mountain = peaks * peaks * 200;
  // Ocean — basins below 0
  const ocean = fbm(u*0.3+9, v*0.3+5, 4);
  const oceanDepth = ocean < 0.38 ? (0.38 - ocean) * 30 : 0;

  let baseHeight = shield + mountain - oceanDepth;

  // -- Rivers & Streams System --
  // We carve out interconnected valleys using the absolute-value of a lower-frequency fbm
  const riverNoise = Math.abs(fbm(u * 1.5 + 4.2, v * 1.5 + 8.1, 4) * 2 - 1);
  const streamNoise = Math.abs(fbm(u * 3.5 + 1.2, v * 3.5 + 2.1, 4) * 2 - 1);
  
  // Create deep, winding ravines where the noise approaches 0
  let carve = 0;
  if (riverNoise < 0.04) {
    // Main rivers
    carve = Math.pow((0.04 - riverNoise) / 0.04, 1.5) * 40; 
  } else if (streamNoise < 0.02 && baseHeight < 80) {
    // Smaller streams feeding into lakes/rivers (only in lower altitudes)
    carve = Math.pow((0.02 - streamNoise) / 0.02, 1.5) * 15;
  }
  
  // Apply carving logic only where terrain isn't already deeply submerged
  if (baseHeight > -5) {
    baseHeight -= carve;
  }

  return baseHeight;
}

/**
 * Return gravity vector for a position in world space (toward planet centre).
 * Planet centre is at Vector3.Zero() by default.
 */
export function getPlanetGravity(position, centre = Vector3.Zero()) {
  const toCenter = centre.subtract(position);
  const dist = toCenter.length();
  if (dist < 0.001) return new Vector3(0, -GRAVITY_STRENGTH, 0);
  return toCenter.normalize().scale(GRAVITY_STRENGTH);
}

/**
 * Map flat (x, z) in [0, WORLD_SIZE] to a unit direction on the sphere.
 * Flat world is mapped to the full sphere via equirectangular projection.
 */
export const WORLD_SIZE = 4000;
export function flatToSphereDir(x, z) {
  const lon = (x / WORLD_SIZE) * Math.PI * 2 - Math.PI;
  const lat = (z / WORLD_SIZE - 0.5) * Math.PI * 0.8; // 0.8 avoids exact poles
  const cosLat = Math.cos(lat);
  return new Vector3(cosLat * Math.sin(lon), Math.sin(lat), cosLat * Math.cos(lon));
}

/**
 * Return 3D world position on sphere surface for flat (x, z) + height offset.
 */
export function getSpherePos(x, z, heightOffset = 0) {
  const dir = flatToSphereDir(x, z);
  const h = getPlanetHeight(dir);
  return dir.scale(PLANET_RADIUS + Math.max(-10, h) + heightOffset);
}

/**
 * Build a rotation quaternion aligning local +Y with the radial direction
 * at a sphere surface point, then yaw around that axis.
 */
export function getSphereRotation(position, yawRadians = 0) {
  const up = position.normalize();
  // Pick a stable "north" tangent (avoid gimbal at poles)
  let north = new Vector3(-up.z, 0, up.x);
  if (north.lengthSquared() < 0.01) north = new Vector3(1, 0, 0);
  north.normalize();
  const east = Vector3.Cross(up, north).normalize();
  // Apply yaw around up
  const sinY = Math.sin(yawRadians), cosY = Math.cos(yawRadians);
  const fwd = north.scale(cosY).add(east.scale(sinY));
  const right = Vector3.Cross(up, fwd).normalize();
  // Build rotation matrix from basis vectors
  const m = Matrix.FromValues(
    right.x, right.y, right.z, 0,
    up.x,    up.y,    up.z,    0,
    fwd.x,   fwd.y,   fwd.z,   0,
    0,       0,       0,       1,
  );
  return Quaternion.FromRotationMatrix(m);
}

/**
 * Build the planet sphere mesh with displaced vertices.
 */
export async function buildPlanet(scene, shadowGen) {
  const segments = 200; // vertex resolution — higher = smoother peaks

  // Phase 22: Unify planetary voxel load grids (Trellis)
  let sphere = getModelInstance(scene, 'planet_map');

  if (sphere) {
    console.log("[Planet] Static Trellis AI voxel grid found. Bypassing procedural mesh mapping.");
    // Scale the unit GLB grid block up to our system bounds
    sphere.scaling = new Vector3(PLANET_RADIUS, PLANET_RADIUS, PLANET_RADIUS);
    sphere.receiveShadows = true;
    sphere.checkCollisions = true;
  } else {
    // ── Base procedural sphere fallback ──
    sphere = MeshBuilder.CreateSphere('planet', {
      diameter: PLANET_RADIUS * 2,
      segments,
      updatable: true,
    }, scene);

    // ── Displace vertices by terrain height ──
    const positions = sphere.getVerticesData('position');
  const normals   = sphere.getVerticesData('normal');
  const colors    = new Float32Array(positions.length / 3 * 4);

  for (let i = 0; i < positions.length; i += 3) {
    const nx = positions[i], ny = positions[i+1], nz = positions[i+2];
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    const dir = new Vector3(nx/len, ny/len, nz/len);

    const h = getPlanetHeight(dir);
    const r = PLANET_RADIUS + Math.max(-20, h);  // clamp ocean floor

    positions[i]   = dir.x * r;
    positions[i+1] = dir.y * r;
    positions[i+2] = dir.z * r;

    // ── Vertex colouring ──
    const ci = (i/3)*4;

    if (h < -8) {
      // Deep ocean / River bed
      colors[ci]=0.10; colors[ci+1]=0.20; colors[ci+2]=0.30; colors[ci+3]=1;
    } else if (h < 2) {
      // Shallow water / River banks (Sandy)
      colors[ci]=0.85; colors[ci+1]=0.82; colors[ci+2]=0.70; colors[ci+3]=1;
    } else if (h > TERRAIN_AMP * SNOW_LINE_ANGLE) {
      // Snow cap
      const sf = Math.min(1, (h - TERRAIN_AMP * SNOW_LINE_ANGLE) / 18);
      colors[ci]   = 1.0;
      colors[ci+1] = 1.0;
      colors[ci+2] = 1.0;
      colors[ci+3] = 1;
    } else if (h > TERRAIN_AMP * 0.42) {
      // Mountain rocks (Slightly greyed to look stony)
      colors[ci] = 0.70; colors[ci+1] = 0.70; colors[ci+2] = 0.70; colors[ci+3]=1;
    } else {
      // Forest / Grassland (Pure white to allow the 4K photorealistic grass to shine!)
      colors[ci]   = 1.0;
      colors[ci+1] = 1.0;
      colors[ci+2] = 1.0;
      colors[ci+3] = 1.0;
    }
  }

  // Recompute normals after displacement
  VertexData.ComputeNormals(positions, sphere.getIndices(), normals);
  sphere.updateVerticesData('position', positions);
  sphere.updateVerticesData('normal', normals);
  sphere.setVerticesData('color', colors, false, 4);

    // ── Material — Standard with vertex colours ──
    const mat = new StandardMaterial('planetMat', scene);
    // Remove PBR specific roughness/metallic properties
    mat.specularPower = 32;
    mat.specularColor = new Color3(0.05, 0.05, 0.05); // slight sheen rather than blazing reflections
    mat.disableLighting = false; // default
    sphere.material = mat;
    sphere.receiveShadows = true;
    sphere.checkCollisions = true;
  }

  // ── Atmosphere — thin additive sphere slightly larger ──
  const atmo = MeshBuilder.CreateSphere('atmosphere', {
    diameter: PLANET_RADIUS * 2 + 30,
    segments: 32,
  }, scene);
  const atmoMat = new StandardMaterial('atmoMat', scene);
  atmoMat.emissiveColor = new Color3(0.10, 0.25, 0.55);
  atmoMat.alpha = 0.12;
  atmoMat.backFaceCulling = false;
  atmo.material = atmoMat;
  atmo.isPickable = false;

  // ── Ocean surface ──
  const ocean = MeshBuilder.CreateSphere('ocean', {
    diameter: PLANET_RADIUS * 2 - 15,
    segments: 48,
  }, scene);
  const oceanMat = new PBRMaterial('oceanMat', scene);
  oceanMat.albedoColor = new Color3(0.03, 0.12, 0.28);
  oceanMat.roughness = 0.05;
  oceanMat.metallic  = 0.2;
  oceanMat.alpha     = 0.88;
  oceanMat.backFaceCulling = true;
  ocean.material = oceanMat;
  ocean.isPickable = false;

  console.log(`[Planet] Built sphere — radius=${PLANET_RADIUS}m, segments=${segments}`);

  const trees = await buildSphericalForest(scene, shadowGen);

  // Deploy massive photorealistic sprite bio-density across the valid terrain
  const sprites = buildBiomassSprites(scene);

  return { sphere, ocean, atmosphere: atmo, trees, sprites };
}

/**
 * Loads .glb trees and thin-instances them across the spherical terrain.
 */
async function buildSphericalForest(scene, shadowGen) {
  const treeModels = [
    'balsam_fir.glb',
    'jack_pine.glb',
    'spruce_tree.glb',
    'white_birch.glb'
  ];
  
  const treeMeshes = [];
  
  for (let model of treeModels) {
    try {
      const result = await SceneLoader.ImportMeshAsync("", "./models/", model, scene);
      const root = result.meshes[0];
      root.position.y = -9999; 
      
      // Merge into a single mesh for thin instancing if possible, or instance the first valid child
      let targetMesh = null;
      for (let m of result.meshes) {
        if (m.getTotalVertices() > 0) {
          targetMesh = m;
          break;
        }
      }
      
      if (targetMesh) {
        targetMesh.position = Vector3.Zero();
        targetMesh.rotationQuaternion = Quaternion.Identity();
        treeMeshes.push(targetMesh);
      }
    } catch (e) {
      console.warn('[World] Failed to load tree GLB:', model, e);
    }
  }

  if (treeMeshes.length === 0) return [];

  const mats = Array.from({ length: treeMeshes.length }, () => []);
  const treeCount = 8000;
  
  for (let i = 0; i < treeCount; i++) {
    const x = hash(i, 0) * WORLD_SIZE;
    const z = hash(i, 1) * WORLD_SIZE;
    const dir = flatToSphereDir(x, z);
    const h = getPlanetHeight(dir);
    
    // Don't place in deep ocean or high peaks
    if (h < 1 || h > TERRAIN_AMP * 0.42) continue;
    
    // Pick a random tree mesh
    const tp = Math.floor(hash(i, 2) * treeMeshes.length);
    const scale = 0.6 + hash(i, 3) * 0.6;
    
    const pos = getSpherePos(x, z, -0.5); // sink slightly into the ground
    const yaw = hash(i, 4) * Math.PI * 2;
    const rot = getSphereRotation(pos, yaw);
    
    const m = Matrix.Compose(new Vector3(scale, scale, scale), rot, pos);
    mats[tp].push(...m.m);
  }
  
  for (let i = 0; i < treeMeshes.length; i++) {
    if (mats[i].length > 0) {
      treeMeshes[i].thinInstanceSetBuffer('matrix', new Float32Array(mats[i]), 16);
      if (shadowGen) shadowGen.addShadowCaster(treeMeshes[i]);
    }
  }
  
  console.log(`[Planet] Built Spherical Forest with ${treeCount} potential trees.`);
  return treeMeshes;
}

/**
 * Procedural Sprite Population Engine
 * Spawns over 28,000 instance of regional flora dynamically using golden ratio spherical coverage.
 * Automatically aligns with actual getPlanetHeight() mapping, hiding those that fall underwater.
 */
import { SpriteManager } from '@babylonjs/core/Sprites/spriteManager.js';
import { Sprite } from '@babylonjs/core/Sprites/sprite.js';

export function buildBiomassSprites(scene) {
  const assets = [
    { name: 'morels',      url: './textures/biomass/morel_mushroom_1775348744190.png', count: 1800, scale: 0.15 },
    { name: 'fiddleheads', url: './textures/biomass/fiddleheads_1775348756116.png', count: 8000, scale: 0.45 },
    { name: 'boreal_pine', url: './textures/biomass/boreal_pine_tree_1775331173550.png', count: 15400, scale: 18.0 },
    { name: 'moose',       url: './textures/biomass/moose_1775348799594.png', count: 200, scale: 2.2 }
  ];

  const managers = {};
  
  assets.forEach((asset, idx) => {
    const manager = new SpriteManager(
      'mgr_' + asset.name, 
      asset.url, 
      asset.count, 
      1024, 
      scene
    );
    manager.isPickable = false;
    manager.fogEnabled = true;
    managers[asset.name] = manager;

    // Golden Ratio Spiraling Strategy (Fibonacci Sphere subset mapped onto our local forest boundary)
    const phi = Math.PI * (3 - Math.sqrt(5));  // golden angle in radians

    for (let i = 0; i < asset.count; i++) {
        const sprite = new Sprite('s_' + asset.name + '_' + i, manager);
        
        // Use hash properties scattered across the 4000x4000 world flat space layout
        const t = i / asset.count;
        const radiusXZ = Math.sqrt(t) * 2000;
        const theta = i * phi + (idx * 0.5); // Unique phase shift per asset class
        
        const x = Math.cos(theta) * radiusXZ;
        const z = Math.sin(theta) * radiusXZ;
        
        const origin = new Vector3(x, 0, z);
        const up = origin.normalizeToNew();
        
        // Dynamically query our generated planet spherical height map using 'up'
        const h = getPlanetHeight(up);
        const elevation = PLANET_RADIUS + h;
        
        // Forest limits: keep out of ocean / deep rivers and off the mountain ridges
        if (h > -4 && h < TERRAIN_AMP * 0.38) {
          sprite.position = up.scale(elevation + (asset.scale / 2));
          sprite.size = asset.scale * (0.8 + Math.random() * 0.4); 
        } else {
          sprite.position = new Vector3(0, -99999, 0); // Hide them off-screen safely
        }
    }
  });

  return managers;
}
