/**
 * player.js — Player controller
 * Head bob, weapon sway, footstep timing, lean, crouch.
 */

import { Vector3 } from '@babylonjs/core/Maths/math.js';
import { STATE } from './state.js';

// ── Bob state ────────────────────────────────────────────────────────────────
let _bobTime    = 0;
let _bobSmooth  = 0;   // smoothed bob amplitude
let _swayX      = 0;   // horizontal weapon sway accumulator
let _swayY      = 0;
let _lastCamY   = 0;
let _footTimer  = 0;   // seconds until next footstep
let _weaponNode = null;
let _prevPx = 0, _prevPz = 0;

// Crouch state
let _crouchTarget = 0;   // 0 = standing, 1 = crouched
let _crouchSmooth = 0;   // smoothed 0→1
const CROUCH_HEIGHT_DELTA = 0.65; // metres camera lowers when crouched
const CROUCH_SPEED_MULT   = 0.45;

// Bob parameters
const BOB_FREQ_WALK   = 1.8;  // Hz
const BOB_FREQ_SPRINT = 2.8;
const BOB_FREQ_CROUCH = 1.1;
const BOB_AMP_WALK    = 0.045;
const BOB_AMP_SPRINT  = 0.08;
const BOB_AMP_CROUCH  = 0.02;
const SWAY_DAMP       = 6.0;  // smoothing speed
const FOOT_INTERVAL_WALK   = 0.55; // seconds between footstep ticks
const FOOT_INTERVAL_SPRINT = 0.32;
const FOOT_INTERVAL_CROUCH = 0.75;

export function createPlayer(scene, camera) {
  STATE.alive   = true;
  STATE.started = true;
  STATE.health  = STATE.maxHealth;
  STATE.hunger  = 100;
  STATE.thirst  = 100;
  STATE.warmth  = 50;
  STATE.stamina = 100;
  STATE.ammo    = 30;
  STATE.reserveAmmo = 120;
  STATE.kills   = 0;
  STATE.gameTime = 0.5;

  _lastCamY = camera.position.y;
  _prevPx   = camera.position.x;
  _prevPz   = camera.position.z;
  _crouchSmooth = 0;
  _crouchTarget = 0;

  return { camera };
}

export function registerWeaponNode(node) {
  _weaponNode = node;
}

/** Toggle crouch state — called from engine.js on C key. */
export function toggleCrouch(camera) {
  _crouchTarget = _crouchTarget > 0.5 ? 0 : 1;
  STATE.crouching = _crouchTarget > 0.5;
  // Update collision ellipsoid so player can fit through smaller gaps
  if (camera) {
    camera.ellipsoid.y = STATE.crouching ? 0.5 : 0.85;
    camera.ellipsoidOffset.y = STATE.crouching ? 0.5 : 0.85;
  }
}

export function updatePlayer(dt, camera) {
  if (!STATE.alive || !STATE.started) return;

  const dx = camera.position.x - _prevPx;
  const dz = camera.position.z - _prevPz;
  const horizSpeed = Math.sqrt(dx * dx + dz * dz) / Math.max(dt, 0.001);
  _prevPx = camera.position.x;
  _prevPz = camera.position.z;

  const isCrouching = _crouchTarget > 0.5;
  const isSprinting = !isCrouching && horizSpeed > 2.8;
  const isMoving    = horizSpeed > 0.4;

  // ── Smooth crouch transition ──
  _crouchSmooth += (_crouchTarget - _crouchSmooth) * Math.min(dt * 10, 1);
  const rawTargetDelta = _crouchTarget - _crouchSmooth;
  const crouchDrop = _crouchSmooth * CROUCH_HEIGHT_DELTA * dt * 10 * (Math.sign(rawTargetDelta) || 0);
  camera.position.subtractInPlace(camera.upVector.scale(crouchDrop));

  // Direct interpolation: store base y separately by adjusting each frame
  const crouchDelta = rawTargetDelta * CROUCH_HEIGHT_DELTA;
  camera.position.addInPlace(camera.upVector.scale(crouchDelta * Math.min(dt * 8, 1)));

  // Expose crouch speed multiplier for engine.js sprint calc
  window._crouchMult = isCrouching ? CROUCH_SPEED_MULT : 1.0;

  // ── Head bob ──
  const bobAmp = isCrouching ? BOB_AMP_CROUCH
               : isSprinting ? BOB_AMP_SPRINT
               : BOB_AMP_WALK;
  const targetAmp = isMoving ? bobAmp : 0;
  _bobSmooth += (targetAmp - _bobSmooth) * Math.min(dt * 8, 1);

  const freq = isCrouching ? BOB_FREQ_CROUCH
             : isSprinting ? BOB_FREQ_SPRINT
             : BOB_FREQ_WALK;
  if (isMoving) _bobTime += dt * freq * Math.PI * 2;

  const bobV = Math.sin(_bobTime) * _bobSmooth;
  const bobH = Math.sin(_bobTime * 0.5) * _bobSmooth * 0.4;

  camera.position.addInPlace(camera.upVector.scale(bobV));
  camera.rotation.z  = bobH * 0.3;

  // ── Weapon sway ──
  if (_weaponNode) {
    const camYDelta = camera.rotation.y - _lastCamY;
    _swayX += (-camYDelta * 0.6 - _swayX) * Math.min(dt * SWAY_DAMP, 1);
    _swayY += (bobV * 0.8 + bobH * 0.4 - _swayY) * Math.min(dt * SWAY_DAMP, 1);

    _weaponNode.position.x = 0.22 + _swayX * 0.12;
    _weaponNode.position.y = -0.18 + _swayY * 0.1 - _crouchSmooth * 0.04;
    _weaponNode.rotation.z = isSprinting ? -0.12 : 0;
  }
  _lastCamY = camera.rotation.y;

  // ── Footstep tick ──
  if (isMoving) {
    _footTimer -= dt;
    if (_footTimer <= 0) {
      _footTimer = isCrouching ? FOOT_INTERVAL_CROUCH
                 : isSprinting ? FOOT_INTERVAL_SPRINT
                 : FOOT_INTERVAL_WALK;
      onFootstep(isSprinting, isCrouching);
    }
  } else {
    _footTimer = 0;
  }
}

function onFootstep(sprinting, crouching) {
  // Visual micro-shake via HUD element — quieter when crouching
  const hud = document.getElementById('hud');
  if (!hud) return;
  const mag = crouching ? 0 : sprinting ? 2 : 1;
  if (mag === 0) return;
  hud.style.transform = `translateY(${mag}px)`;
  setTimeout(() => { hud.style.transform = ''; }, 60);
}
