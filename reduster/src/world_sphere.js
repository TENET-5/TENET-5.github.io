/**
 * world_sphere.js — Planetary Round World
 * SYSTEM_SEED=118400
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

  return shield + mountain - oceanDepth;
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

  // ── Base sphere ──
  const sphere = MeshBuilder.CreateSphere('planet', {
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
    const noise01 = hash(dir.x*31, dir.z*47);

    if (h < -8) {
      // Deep ocean — dark blue
      colors[ci]=0.02; colors[ci+1]=0.07; colors[ci+2]=0.20; colors[ci+3]=1;
    } else if (h < 2) {
      // Shallow water / beach
      colors[ci]=0.25+noise01*0.08; colors[ci+1]=0.32+noise01*0.08; colors[ci+2]=0.18+noise01*0.05; colors[ci+3]=1;
    } else if (h > TERRAIN_AMP * SNOW_LINE_ANGLE) {
      // Snow cap
      const sf = Math.min(1, (h - TERRAIN_AMP * SNOW_LINE_ANGLE) / 18);
      const gr = 0.36 + noise01*0.12;
      colors[ci]   = gr + sf*(0.92-gr);
      colors[ci+1] = gr + sf*(0.94-gr);
      colors[ci+2] = gr + sf*(0.98-gr);
      colors[ci+3] = 1;
    } else if (h > TERRAIN_AMP * 0.42) {
      // High rock / cliff
      const g = 0.33 + noise01*0.14;
      colors[ci]=g+0.05; colors[ci+1]=g; colors[ci+2]=g-0.06; colors[ci+3]=1;
    } else {
      // Forest / grassland
      const v = noise01;
      colors[ci]   = 0.10+v*0.07;
      colors[ci+1] = 0.20+v*0.12;
      colors[ci+2] = 0.04+v*0.03;
      colors[ci+3] = 1;
    }
  }

  // Recompute normals after displacement
  VertexData.ComputeNormals(positions, sphere.getIndices(), normals);
  sphere.updateVerticesData('position', positions);
  sphere.updateVerticesData('normal', normals);
  sphere.setVerticesData('color', colors, false, 4);

  // ── Material — PBR with vertex colours ──
  const mat = new PBRMaterial('planetMat', scene);
  mat.roughness = 0.88;
  mat.metallic  = 0.02;
  mat.useVertexColors = true;
  sphere.material = mat;
  sphere.receiveShadows = true;
  sphere.checkCollisions = true;

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

  return { sphere, ocean, atmosphere: atmo, trees };
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

