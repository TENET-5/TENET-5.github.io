/**
 * world.js — Phase 55 LIRIL Proxy Stub
 *
 * All procedural tree generation, Canadian Shield geometry meshes, 
 * and wind/LOD trackers have been eradicated.
 */

export const WORLD_SIZE = 4000;
export const SNOW_LINE = 60;
export const CLIFF_LINE = 38;

export function getHeight(x, z) { return 0; }
export function isWater(x, z) { return false; }

export function updateForestWind(time, windX, windZ) {}
export function updateRockLOD(camX, camZ) {}
export function updateGroundCover(camX, camZ) {}

export async function buildWorld(scene, shadowGen) {
  console.log("[TENET5] Procedural world generation bypassed. ZERO-ORPHAN Enacted.");
  const world = { terrain:null, trees:[], buildings:[], camps:[], supplyRoutes:[] };
  return world;
}
