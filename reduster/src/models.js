// models.js — Phase 55 LIRIL Proxy Stub
// Loads NOTHING. GLB instancing has been disabled globally.

export async function loadModel(scene, name) {
  return null;
}

export function hasModel(name) {
  return false;
}

export async function preloadModels(scene, onProgress) {
  console.log('[TENET5] preloadModels bypassed. Physical game meshes blocked.');
  if(onProgress) onProgress(1);
  return 0;
}

export function getModelInstance(scene, name) {
  return null;
}
