// nvg.js — Night Vision Goggles (N key toggle)
// Green phosphor effect via image processing + grain boost
import { Color4 } from '@babylonjs/core/Maths/math.color.js';
import { STATE } from './state.js';
import { playSound } from './audio.js';

let _active = false;
let _pp = null;  // DefaultRenderingPipeline reference

// Saved normal values
let _savedExposure = 1.05;
let _savedContrast = 1.25;
let _savedGrain = 12;
let _savedVignetteWeight = 2.2;
let _savedVignetteColor = null;
let _savedTintR = 1, _savedTintG = 1, _savedTintB = 1;

export function initNVG(pipeline) {
  _pp = pipeline;
  if (_pp?.imageProcessing) {
    _savedExposure = _pp.imageProcessing.exposure;
    _savedContrast = _pp.imageProcessing.contrast;
    _savedGrain = _pp.grain?.intensity ?? 12;
    _savedVignetteWeight = _pp.imageProcessing.vignetteWeight;
  }
}

export function toggleNVG() {
  if (!_pp) return;
  _active = !_active;
  STATE.nvgActive = _active;

  if (_active) {
    // NVG ON — green phosphor effect
    _pp.imageProcessing.exposure = 3.5;       // massive brightness boost
    _pp.imageProcessing.contrast = 1.8;       // high contrast for edge visibility
    _pp.imageProcessing.vignetteEnabled = true;
    _pp.imageProcessing.vignetteWeight = 6.0;  // heavy tube vignette
    _pp.imageProcessing.vignetteStretch = 0.3;
    _pp.imageProcessing.vignetteColor = new Color4(0, 0.15, 0, 0); // green-tinted edge

    // Green color grading via colorCurves
    if (_pp.imageProcessing.colorCurvesEnabled !== undefined) {
      _pp.imageProcessing.colorCurvesEnabled = true;
      const cc = _pp.imageProcessing.colorCurves;
      if (cc) {
        cc.globalHue = 120;          // shift toward green
        cc.globalSaturation = -50;   // desaturate
        cc.globalDensity = 60;       // strong green push
        cc.highlightsHue = 120;
        cc.highlightsSaturation = -30;
      }
    }

    // Heavy grain — phosphor noise
    if (_pp.grain) {
      _pp.grain.intensity = 45;
    }

    // Bloom boost — light sources glow intensely through NVG
    _pp.bloomWeight = 0.6;
    _pp.bloomThreshold = 0.3;

    playSound('reload'); // click sound for toggle
  } else {
    // NVG OFF — restore normal
    _pp.imageProcessing.exposure = _savedExposure;
    _pp.imageProcessing.contrast = _savedContrast;
    _pp.imageProcessing.vignetteWeight = _savedVignetteWeight;
    _pp.imageProcessing.vignetteStretch = 0.5;
    _pp.imageProcessing.vignetteColor = new Color4(0, 0, 0, 0);

    if (_pp.imageProcessing.colorCurvesEnabled !== undefined) {
      _pp.imageProcessing.colorCurvesEnabled = false;
    }

    if (_pp.grain) {
      _pp.grain.intensity = _savedGrain;
    }

    _pp.bloomWeight = 0.22;
    _pp.bloomThreshold = 0.75;

    playSound('reload');
  }
}

export function isNVGActive() {
  return _active;
}
