// survival.js — Hunger/thirst/temperature/fatigue/bleed tick loop
// Called every frame from main.js animate()
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';
import { STATE, triggerDeath } from './state.js';
import { playSound } from './audio.js';
import { getWeatherType, getWind } from './weather.js';
import { isWater } from './world.js';
import { transmitSatorEvent } from './telemetry.js';

function hexToColor3(hex) { return new Color3(((hex>>16)&0xFF)/255, ((hex>>8)&0xFF)/255, (hex&0xFF)/255); }

// Drain rates (per second)
const HUNGER_DRAIN   = 0.075;  // Empty in ~22 min real-time
const THIRST_DRAIN   = 0.115;  // Empty in ~14 min
const WARMTH_DRAIN   = 0.05;   // Warmth drops in cold (below 0°C ambient temp)
const FATIGUE_GAIN   = 0.008;  // Fatigue accumulates slowly
const FATIGUE_SPRINT = 0.10;   // Extra fatigue when sprinting

// Damage rates at 0
const STARVATION_DMG  = 0.8;   // HP/s when starving
const DEHYDRATION_DMG = 1.2;   // HP/s when dehydrated
const HYPOTHERMIA_DMG = 1.5;   // HP/s when temp < 0 and warmth < 10
const BLEED_DMG_BASE  = 2.0;   // HP/s per bleed severity

// Temperature simulation (day/night + weather effects)
function getAmbientTemp(dayTime) {
  // Canadian night: −15°C, sunny day: +5°C
  const base = -8;
  const dayBonus = Math.sin(dayTime * Math.PI) * 13;
  let temp = base + dayBonus;
  // Weather modifiers — rain cools, snow freezes, wind chill
  const weather = getWeatherType();
  if (weather === 'rain')     temp -= 3;
  if (weather === 'snow')     temp -= 8;
  if (weather === 'blizzard') temp -= 16;  // blizzard is brutal
  if (weather === 'fog')      temp -= 1;
  // Wind chill: every 1 m/s of wind drops felt temp by ~1.5°C
  const wind = getWind();
  temp -= wind.strength * 1.5;
  return temp;
}

let _prevHealth = 100;
let _lowFoodWarned = false;
let _lowWaterWarned = false;
let _hypothermiaWarned = false;
let _survivalScene = null;
let _waterWarnCooldown = 0;   // seconds until next wading HUD message
let _waterTimer = 0;          // cumulative seconds wading (for cold shock)

const _rayOrigin = new Vector3(0, 0, 0);
const _rayDirection = Vector3.Up();

/** Call once after scene is built to enable shelter raycasting. */
export function initSurvivalScene(scene) { _survivalScene = scene; }

/**
 * isSheltered — returns true if player has a solid roof within 4m above them.
 * Uses a single upward raycast; only tested at ~2Hz in updateSurvival.
 */
export function isSheltered(playerX, playerY, playerZ) {
  if (!_survivalScene) return false;
  try {
    _rayOrigin.set(playerX, playerY + 0.1, playerZ);
    const hit = _survivalScene.pickWithRay(
      { origin: _rayOrigin, direction: _rayDirection, length: 4.0 },
      m => m.checkCollisions && m.isEnabled() && !m.name.startsWith('terrain') && !m.name.startsWith('water')
    );
    return !!(hit?.hit);
  } catch (_) { return false; }
}

export function updateSurvival(dt, dayTime = 0.5, playerX = 0, playerY = 0, playerZ = 0) {
  if (!STATE.alive || !STATE.started) return;

  // ── Hunger ──
  STATE.hunger = Math.max(0, STATE.hunger - HUNGER_DRAIN * dt);
  if (STATE.hunger <= 0) {
    STATE.health -= STARVATION_DMG * dt;
    if (typeof window !== 'undefined') window._survivalWarning = 'STARVING';
  } else if (STATE.hunger < 20 && !_lowFoodWarned) {
    _lowFoodWarned = true;
    transmitSatorEvent('SURVIVAL_CRISIS_STARVATION', JSON.stringify({ threshold: 20, health: STATE.health }));
    if (typeof window !== 'undefined') window._hudMsg = '⚠ NEED FOOD — FIND RATIONS';
  } else if (STATE.hunger > 30) {
    if (_lowFoodWarned) transmitSatorEvent('SURVIVAL_RECOVERY_FOOD', '{"status": "stabilized"}');
    _lowFoodWarned = false;
  }

  // ── Thirst ──
  STATE.thirst = Math.max(0, STATE.thirst - THIRST_DRAIN * dt);
  if (STATE.thirst <= 0) {
    STATE.health -= DEHYDRATION_DMG * dt;
    if (typeof window !== 'undefined') window._survivalWarning = 'DEHYDRATED';
  } else if (STATE.thirst < 20 && !_lowWaterWarned) {
    _lowWaterWarned = true;
    transmitSatorEvent('SURVIVAL_CRISIS_DEHYDRATION', JSON.stringify({ threshold: 20, health: STATE.health }));
    if (typeof window !== 'undefined') window._hudMsg = '⚠ NEED WATER — FIND SUPPLY';
  } else if (STATE.thirst > 30) {
    if (_lowWaterWarned) transmitSatorEvent('SURVIVAL_RECOVERY_WATER', '{"status": "stabilized"}');
    _lowWaterWarned = false;
  }

  // ── Temperature & Warmth ──
  STATE.temperature = getAmbientTemp(dayTime);

  // Shelter check — throttled to avoid raycast every frame (check ~2Hz)
  if (!updateSurvival._shelterTick) updateSurvival._shelterTick = 0;
  updateSurvival._shelterTick += dt;
  if (updateSurvival._shelterTick >= 0.5) {
    updateSurvival._shelterTick = 0;
    STATE.isSheltered = isSheltered(playerX, playerY, playerZ);
  }

  // Shelter halves wind-chill and slows warmth drain
  let effectiveTemp = STATE.temperature;
  if (STATE.isSheltered) {
    const windChill = getWind().strength * 1.5;
    effectiveTemp = STATE.temperature + windChill * 0.85; // cancel most wind-chill
    effectiveTemp = Math.min(effectiveTemp, STATE.temperature + 8); // cap benefit at +8°C
  }

  if (effectiveTemp < 5) {
    const coldRate = Math.max(0, (5 - effectiveTemp) / 35) * WARMTH_DRAIN * (STATE.isSheltered ? 0.5 : 1.0);
    STATE.warmth = Math.max(0, STATE.warmth - coldRate * dt);
  } else {
    STATE.warmth = Math.min(100, STATE.warmth + 0.03 * dt); // Natural recovery in warmth
  }
  // Campfire warmth bonus — radius 4m falloff
  if (STATE.activeCampfire) {
    const cf = STATE.activeCampfire;
    const dist = Math.hypot(cf.position.x - playerX, cf.position.z - playerZ);
    const warmthBonus = dist < 4.0 ? 0.8 * Math.max(0, (4.0 - dist) / 4.0 + 0.5) : 0;
    if (warmthBonus > 0) STATE.warmth = Math.min(100, STATE.warmth + warmthBonus * dt);
  }
  // Hypothermia damage
  if (STATE.temperature < 0 && STATE.warmth < 15) {
    STATE.health -= HYPOTHERMIA_DMG * dt;
    if (!_hypothermiaWarned) {
      _hypothermiaWarned = true;
      transmitSatorEvent('SURVIVAL_CRISIS_HYPOTHERMIA', JSON.stringify({ temp_ambient: STATE.temperature, warmth: STATE.warmth }));
      if (typeof window !== 'undefined') window._hudMsg = '🥶 HYPOTHERMIA — FIND WARMTH';
    }
  } else {
    if (_hypothermiaWarned) transmitSatorEvent('SURVIVAL_RECOVERY_WARMTH', '{"status": "stabilized"}');
    _hypothermiaWarned = false;
  }

  // ── Water / Wading / Drowning ──
  // isWater uses flat (x,z) coords — water plane is at y = -2
  const inWater = isWater(playerX, playerZ);
  if (inWater) {
    _waterTimer += dt;
    _waterWarnCooldown -= dt;
    // Cold water drains warmth 4× faster than air exposure
    const waterChill = Math.max(0, (5 - STATE.temperature) / 35) * WARMTH_DRAIN * 4;
    STATE.warmth = Math.max(0, STATE.warmth - waterChill * dt);
    // Wading — slow thirst offset (drinking from lake/stream)
    STATE.thirst = Math.min(STATE.maxThirst, STATE.thirst + 0.4 * dt);
    // After 8 continuous seconds wading with low warmth — cold shock damage
    if (_waterTimer > 8 && STATE.warmth < 25) {
      STATE.health -= 1.8 * dt;
      if (typeof window !== 'undefined') window._survivalWarning = 'DROWNING';
    }
    // HUD warning (throttled — every 6s)
    if (_waterWarnCooldown <= 0 && typeof window !== 'undefined') {
      transmitSatorEvent('SURVIVAL_ANOMALY_WADING', '{"water_exposure": true, "warmth_drain_factor": 4.0}');
      window._hudMsg = '🌊 WADING — HYPOTHERMIA RISK';
      window._hudMsgTimer = 3.0;
      _waterWarnCooldown = 6.0;
    }
    // Signal to engine for movement penalty
    window._inWater = true;
  } else {
    _waterTimer = 0;
    window._inWater = false;
  }

  // ── Fatigue → Stamina sync ──
  // survival.js models fatigue (0=rested, maxFatigue=exhausted).
  // Engine sprint system uses STATE.stamina (0=depleted, 100=full).
  // Bridge: fatigue passively drains stamina so long-distance travel hurts.
  const fatigueRate = FATIGUE_GAIN;
  STATE.fatigue = Math.min(STATE.maxFatigue, STATE.fatigue + fatigueRate * dt);
  // Resting at campfire recovers fatigue
  if (STATE.activeCampfire) {
    const cf = STATE.activeCampfire;
    const dist = Math.hypot(cf.position.x - playerX, cf.position.z - playerZ);
    if (dist < 4.0) STATE.fatigue = Math.max(0, STATE.fatigue - 0.5 * dt);
  }
  // Fatigue pressure on stamina: high fatigue = slower stamina regen
  // (sprint drain is handled in engine.js; here we apply sustained fatigue drain)
  const fatigueFrac = STATE.fatigue / (STATE.maxFatigue || 100);
  const fatigueDrain = fatigueFrac * 1.5; // max 1.5 stamina/s at full fatigue
  STATE.stamina = Math.max(0, Math.min(100, STATE.stamina - fatigueDrain * dt));
  // Sprint flag sync
  STATE.isSprinting = !!window._isSprinting;

  // ── Bleeding (Milsim Trauma) ──
  if (STATE.trauma && STATE.trauma.chest > 0) {
    // Chest trauma induces massive internal bleeding
    STATE.bleedRate = Math.max(0.2, STATE.trauma.chest * 4.0);
    STATE.isBleeding = true;
  }

  if (STATE.isBleeding) {
    // Ensure bleedRate has a floor if regular bleed
    if (STATE.bleedRate <= 0) STATE.bleedRate = 0.5;
    STATE.health -= STATE.bleedRate * BLEED_DMG_BASE * dt;
  }

  // ── Health floor at 1 (don't insta-kill from survival — warn first) ──
  STATE.health = Math.max(0, Math.min(STATE.maxHealth, STATE.health));

  // ── Slow health regen when full food/water and warm ──
  if (STATE.hunger > 60 && STATE.thirst > 60 && STATE.warmth > 40 && !STATE.isBleeding) {
    if (STATE.health < STATE.maxHealth) {
      STATE.health = Math.min(STATE.maxHealth, STATE.health + 0.5 * dt);
    }
  }

  // ── Death check ──
  if (STATE.health <= 0 && STATE.alive) {
    let cause = 'UNKNOWN';
    if (STATE.isBleeding)         cause = 'BLED OUT';
    else if (STATE.warmth <= 0)   cause = 'HYPOTHERMIA';
    else if (STATE.hunger <= 0)   cause = 'STARVATION';
    else if (STATE.thirst <= 0)   cause = 'DEHYDRATION';
    else if (_waterTimer > 8)     cause = 'DROWNED';
    triggerDeath(cause);
  }

  _prevHealth = STATE.health;
}

// Place campfire at player position — warming station
export function placeCampfire(scene, x, z) {
  if (!scene) return null;
  const s = scene;
  const group = new TransformNode("campfire", s);

  // Stones ring
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const stone = MeshBuilder.CreateSphere("stone", {diameter:0.24, segments:6}, s);
    const stMat = new PBRMaterial("stoneMat", s); stMat.albedoColor = hexToColor3(0x666666); stMat.roughness = 0.95;
    stone.material = stMat;
    stone.position.set(Math.cos(ang) * 0.5, 0.05, Math.sin(ang) * 0.5);
    stone.parent = group;
  }

  // Logs
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2;
    const log = MeshBuilder.CreateCylinder("log", {diameterTop:0.12, diameterBottom:0.14, height:0.9, tessellation:6}, s);
    const lgMat = new PBRMaterial("logMat", s); lgMat.albedoColor = hexToColor3(0x5a3010); lgMat.roughness = 0.9;
    log.material = lgMat;
    log.rotation.z = Math.PI / 2;
    log.rotation.y = ang;
    log.position.set(Math.cos(ang) * 0.22, 0.06, Math.sin(ang) * 0.22);
    log.parent = group;
  }

  // Fire glow light
  const fireLight = new PointLight("fireLight", new Vector3(0, 0.6, 0), s);
  fireLight.diffuse = hexToColor3(0xff6600); fireLight.intensity = 3.0; fireLight.range = 8;
  fireLight.parent = group;

  // Emissive flame cone
  const flame = MeshBuilder.CreateCylinder("flame", {diameterTop:0, diameterBottom:0.30, height:0.5, tessellation:8}, s);
  const flameMat = new StandardMaterial("flameMat", s); flameMat.emissiveColor = hexToColor3(0xff4400); flameMat.disableLighting = true; flameMat.alpha = 0.85;
  flame.material = flameMat;
  flame.position.y = 0.45;
  flame.parent = group;

  group.position.set(x, 0, z);
  group.metadata = { isCampfire: true, fireLight, flame };

  STATE.activeCampfire = group;
  return group;
}

// Animate campfire flicker (call in animate loop)
export function updateCampfire(dt) {
  const cf = STATE.activeCampfire;
  if (!cf || !cf.metadata) return;
  const now = performance.now() / 1000;
  cf.metadata.fireLight.intensity = 2.5 + Math.sin(now * 8.3) * 0.8 + Math.sin(now * 13.7) * 0.4;
  cf.metadata.flame.scaling.y = 0.9 + Math.sin(now * 9.1) * 0.15;
  cf.metadata.flame.position.y = 0.4 + Math.sin(now * 7.4) * 0.05;
}

// Place sleeping bag (respawn point) — adds a visible mesh to scene
let _sleepingBagMesh = null;
export function placeSleepingBag(scene, x, z) {
  STATE.campPos = { x, z };
  if (_sleepingBagMesh) { _sleepingBagMesh.dispose(); _sleepingBagMesh = null; }
  const s = scene;
  if (s) {
    const g = new TransformNode("sleepingBag", s);
    // Bag body
    const body = MeshBuilder.CreateCylinder("bagBody", {diameterTop:0.36, diameterBottom:0.44, height:0.7, tessellation:10}, s);
    const bodyMat = new PBRMaterial("bagMat", s); bodyMat.albedoColor = hexToColor3(0x336633); bodyMat.roughness = 0.8;
    body.material = bodyMat;
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.18;
    body.parent = g;
    // Straps
    const strapMat = new PBRMaterial("strapMat", s); strapMat.albedoColor = hexToColor3(0x886622); strapMat.roughness = 0.9;
    for (let i = -1; i <= 1; i += 2) {
      const strap = MeshBuilder.CreateTorus("strap", {diameter:0.4, thickness:0.05, tessellation:12}, s);
      strap.material = strapMat;
      strap.rotation.y = Math.PI / 2;
      strap.position.set(i * 0.2, 0.18, 0);
      strap.parent = g;
    }
    g.position.set(x, 0, z);
    _sleepingBagMesh = g;
  }
  if (typeof window !== 'undefined') {
    window._hudMsg = '🛏 RESPAWN POINT SET';
    window._hudMsgTimer = 3.0;
  }
}

export function getSurvivalStatus() {
  return {
    hunger:      STATE.hunger,
    thirst:      STATE.thirst,
    temperature: STATE.temperature,
    warmth:      STATE.warmth,
    fatigue:     STATE.fatigue,
    isBleeding:  STATE.isBleeding,
    bleedRate:   STATE.bleedRate,
    painLevel:   STATE.painLevel,
  };
}

// ─── Sleep mechanic ────────────────────────────────────────────────────────
// Called from main.js when player presses K near their sleeping bag.
// Triggers a 3-second black screen, restores vitals, advances time ~6 hours.
let _sleeping = false;
let _sleepTimer = 0;

export function trySleep(yawX, yawZ) {
  if (_sleeping) return;
  if (!STATE.campPos) {
    if (typeof window !== 'undefined') { window._hudMsg = '❌ NO SLEEPING BAG PLACED'; window._hudMsgTimer = 3.0; }
    return;
  }
  const dist = Math.hypot(yawX - STATE.campPos.x, yawZ - STATE.campPos.z);
  if (dist > 3.0) {
    if (typeof window !== 'undefined') { window._hudMsg = '🛏 TOO FAR FROM SLEEPING BAG'; window._hudMsgTimer = 3.0; }
    return;
  }
  _sleeping = true;
  _sleepTimer = 3.0;
  // Fade screen to black
  const veil = document.getElementById('sleepVeil');
  if (veil) { veil.style.opacity = '1'; }
  if (typeof window !== 'undefined') { window._hudMsg = '💤 SLEEPING...'; window._hudMsgTimer = 3.5; }
}

export function updateSleep(dt) {
  if (!_sleeping) return;
  _sleepTimer -= dt;
  if (_sleepTimer <= 0) {
    _sleeping = false;
    transmitSatorEvent('SURVIVAL_RECOVERY_SLEEP', JSON.stringify({ fatigue_recovered: 70, duration_hours: 6 }));
    // Restore vitals
    STATE.hunger  = Math.min(STATE.maxHunger,  STATE.hunger  + 40);
    STATE.thirst  = Math.min(STATE.maxThirst,  STATE.thirst  + 30);
    STATE.warmth  = Math.min(100, STATE.warmth + 50);
    STATE.fatigue = Math.max(0,   STATE.fatigue - 70);
    STATE.painLevel = Math.max(0, STATE.painLevel - 30);
    // Advance day time by ~6 hours (0.25 of day cycle)
    if (typeof window !== 'undefined' && window._advanceTime) window._advanceTime(0.25);
    // Fade back in
    const veil = document.getElementById('sleepVeil');
    if (veil) { veil.style.opacity = '0'; }
    if (typeof window !== 'undefined') { window._hudMsg = '☀ RESTED — VITALS RESTORED'; window._hudMsgTimer = 4.0; }
  }
}

export function isSleeping() { return _sleeping; }

export function getSleepPrompt(playerX, playerZ) {
  if (!STATE.campPos || _sleeping) return null;
  return Math.hypot(playerX - STATE.campPos.x, playerZ - STATE.campPos.z) < 3.0
    ? '[K] Sleep' : null;
}
