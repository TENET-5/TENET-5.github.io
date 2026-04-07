// models.js — 3D model loader for Red Duster
// Loads .glb files from public/models/ and provides them to other systems
// Falls back to procedural mesh if model file is missing
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import '@babylonjs/loaders/glTF/2.0/index.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';

const MODEL_PATH = './models/';
const _cache = {};
let _loadAttempted = {};

/**
 * Load a .glb model. Returns the root mesh or null if not found.
 * Caches loaded models for instancing.
 */
export async function loadModel(scene, name) {
  // Return cached
  if (_cache[name]) return _cache[name].clone(name + '_instance', null);

  // Don't retry failed loads
  if (_loadAttempted[name] === false) return null;

  try {
    const result = await SceneLoader.ImportMeshAsync('', MODEL_PATH, `${name}.glb`, scene);
    if (result.meshes.length > 0) {
      const root = result.meshes[0];
      root.setEnabled(false); // template — don't render directly
      _cache[name] = root;
      console.log(`[Models] Loaded ${name}.glb (${result.meshes.length} meshes)`);
      return root.clone(name + '_instance', null);
    }
  } catch (e) {
    // Model file doesn't exist — that's OK, fall back to procedural
    _loadAttempted[name] = false;
  }
  return null;
}

/**
 * Check if a model exists in cache (already loaded).
 */
export function hasModel(name) {
  return !!_cache[name];
}

/**
 * Load all game models. Non-blocking — missing models are silently skipped.
 * The game runs fine with procedural meshes; models are enhancements.
 */
export async function preloadModels(scene, onProgress) {
  const models = [
    // Weapons
    'weapon_c7a2', 'weapon_sks', 'weapon_rem870', 'weapon_glock17',
    'weapon_ar15', 'weapon_m14', 'weapon_leeenfield',
    // Enemies
    'soldier_template',
    // Vehicles
    'vehicle_pickup', 'vehicle_suv', 'vehicle_snowmobile',
    // Environment
    'spruce_tree', 'jack_pine', 'white_birch', 'balsam_fir', 'dead_snag',
    'cabin_small', 'cabin_large',
    'tent_military', 'guard_tower', 'sandbag_wall',
    // Props
    'supply_crate', 'campfire', 'sleeping_bag',
    'rock_boulder', 'rock_small',
    // Phase 22: Trellis AI Matrix unified planetary grid
    'planet_map',
  ];

  let loaded = 0;
  for (const name of models) {
    await loadModel(scene, name);
    loaded++;
    if (onProgress) onProgress(loaded / models.length);
  }

  const cached = Object.keys(_cache).length;
  console.log(`[Models] Preload complete: ${cached}/${models.length} models loaded`);
  return cached;
}

/**
 * Get a model instance or null. Use this in systems that have procedural fallback.
 * Example: const mesh = getModelInstance(scene, 'weapon_c7a2') || buildProceduralWeapon();
 */
export function getModelInstance(scene, name) {
  if (!_cache[name]) return null;
  const instance = _cache[name].clone(name + '_' + Date.now(), null);
  instance.setEnabled(true);
  return instance;
}
