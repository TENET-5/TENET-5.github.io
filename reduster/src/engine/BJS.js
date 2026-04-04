/**
 * BJS.js — Babylon.js 9 Engine Singleton
 * WebGPU-first with WebGL2 fallback.
 * All game modules import from here — single engine, single scene.
 * SYSTEM_SEED=118400
 */

import { Engine } from '@babylonjs/core/Engines/engine.js';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine.js';
import { Scene } from '@babylonjs/core/scene.js';

let _engine = null;
let _scene = null;
let _canvas = null;
let _isWebGPU = false;

/**
 * Initialize the Babylon.js engine with WebGPU/WebGL fallback.
 * Must be called once before any other BJS operations.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Engine>}
 */
export async function initEngine(canvas) {
  _canvas = canvas;

  // Try WebGPU first
  const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
  if (webGPUSupported) {
    _engine = new WebGPUEngine(canvas, {
      adaptToDeviceRatio: true,
      antialias: true,
      stencil: true,
      powerPreference: 'high-performance',
    });
    await _engine.initAsync();
    _isWebGPU = true;
    console.log('[BJS] WebGPU engine initialized');
  } else {
    _engine = new Engine(canvas, true, {
      adaptToDeviceRatio: true,
      stencil: true,
      powerPreference: 'high-performance',
    });
    _isWebGPU = false;
    console.log('[BJS] WebGL2 engine initialized (WebGPU not available)');
  }

  // Handle resize
  window.addEventListener('resize', () => _engine.resize());

  return _engine;
}

/**
 * Create the main game scene. Call once after initEngine.
 * @returns {Scene}
 */
export function createScene() {
  _scene = new Scene(_engine);
  _scene.collisionsEnabled = false; // We use Havok, not BJS collisions
  _scene.autoClear = true;
  _scene.autoClearDepthAndStencil = true;
  return _scene;
}

/** @returns {Engine|WebGPUEngine} */
export function getEngine() { return _engine; }

/** @returns {Scene} */
export function getScene() { return _scene; }

/** @returns {HTMLCanvasElement} */
export function getCanvas() { return _canvas; }

/** @returns {boolean} */
export function isWebGPU() { return _isWebGPU; }

/**
 * Dispose engine and scene. Call on shutdown.
 */
export function disposeEngine() {
  if (_scene) { _scene.dispose(); _scene = null; }
  if (_engine) { _engine.dispose(); _engine = null; }
  _canvas = null;
}
