/**
 * weapons.js — Weapon definitions + AAA per-weapon viewmodels
 * Each weapon has unique geometry: barrel length, stock shape,
 * magazine curve, hand guard, pistol grip, optic mount.
 */

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { STATE } from './state.js';
import { getModelInstance } from './models.js';

// ── Weapon Database ─────────────────────────────────────────────────────────
export const WEAPONS = {
  c7a2: {
    name: 'C7A2', type: 'rifle', calibre: '5.56x45mm',
    damage: 38, rpm: 700, mag: 30, reloadTime: 2.8,
    recoilV: 2.5, recoilH: 0.8, velocity: 930,
    desc: 'Canadian Forces standard issue. Full-auto capable.',
  },
  sks: {
    name: 'SKS', type: 'rifle', calibre: '7.62x39mm',
    damage: 48, rpm: 40, mag: 10, reloadTime: 3.5,
    recoilV: 4.0, recoilH: 1.2, velocity: 735,
    desc: 'Soviet semi-auto. Common in the backcountry.',
  },
  rem870: {
    name: 'Remington 870', type: 'shotgun', calibre: '12ga',
    damage: 85, rpm: 60, mag: 8, reloadTime: 4.5,
    recoilV: 6.0, recoilH: 2.0, velocity: 400,
    desc: 'Pump-action shotgun. Devastating at close range.',
  },
  glock17: {
    name: 'Glock 17', type: 'pistol', calibre: '9x19mm',
    damage: 24, rpm: 400, mag: 17, reloadTime: 1.8,
    recoilV: 1.5, recoilH: 0.5, velocity: 375,
    desc: 'Reliable sidearm. Fast draw.',
  },
  ar15: {
    name: 'AR-15', type: 'rifle', calibre: '5.56x45mm',
    damage: 36, rpm: 45, mag: 30, reloadTime: 2.5,
    recoilV: 2.2, recoilH: 0.7, velocity: 940,
    desc: 'Civilian semi-auto. Highly modifiable.',
  },
  m14: {
    name: 'M14', type: 'rifle', calibre: '7.62x51mm',
    damage: 62, rpm: 40, mag: 20, reloadTime: 3.0,
    recoilV: 5.0, recoilH: 1.5, velocity: 850,
    desc: 'Battle rifle. Hard-hitting at range.',
  },
  leeEnfield: {
    name: 'Lee-Enfield No.4', type: 'rifle', calibre: '.303 British',
    damage: 72, rpm: 20, mag: 10, reloadTime: 4.0,
    recoilV: 5.5, recoilH: 1.0, velocity: 744,
    desc: 'Bolt-action. Grandfather\'s deer rifle. Deadly accurate.',
  },
};

// ── Weapon slot order (1–6 keys) ────────────────────────────────────────────
export const WEAPON_SLOTS = ['c7a2', 'ar15', 'm14', 'sks', 'rem870', 'glock17', 'leeEnfield'];

// ── Shared weapon materials (created once) ───────────────────────────────────
let _wpnMats = null;
function getWpnMats(scene) {
  if (_wpnMats) return _wpnMats;
  const steel = new PBRMaterial('wpnSteel', scene);
  steel.albedoColor = new Color3(0.12, 0.12, 0.13);
  steel.roughness = 0.38; steel.metallic = 0.92;

  const darkGun = new PBRMaterial('wpnDark', scene);
  darkGun.albedoColor = new Color3(0.09, 0.09, 0.09);
  darkGun.roughness = 0.55; darkGun.metallic = 0.75;

  const wood = new PBRMaterial('wpnWood', scene);
  wood.albedoColor = new Color3(0.36, 0.20, 0.07);
  wood.roughness = 0.82; wood.metallic = 0.0;

  const polymer = new PBRMaterial('wpnPoly', scene);
  polymer.albedoColor = new Color3(0.10, 0.10, 0.08);
  polymer.roughness = 0.78; polymer.metallic = 0.0;

  const brass = new PBRMaterial('wpnBrass', scene);
  brass.albedoColor = new Color3(0.72, 0.55, 0.18);
  brass.roughness = 0.35; brass.metallic = 0.90;

  const grip = new PBRMaterial('wpnGrip', scene);
  grip.albedoColor = new Color3(0.08, 0.08, 0.07);
  grip.roughness = 0.92; grip.metallic = 0.0;

  _wpnMats = { steel, darkGun, wood, polymer, brass, grip };
  return _wpnMats;
}

// Helper — create a box part parented to a node
function box(scene, name, parent, w, h, d, pos, mat) {
  const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
  m.parent = parent; m.position = pos; m.material = mat;
  m.isPickable = false; return m;
}
function cyl(scene, name, parent, diam, h, tess, pos, mat, rotX) {
  const m = MeshBuilder.CreateCylinder(name, { diameter: diam, height: h, tessellation: tess ?? 8 }, scene);
  m.parent = parent; m.position = pos; m.material = mat;
  if (rotX !== undefined) m.rotation.x = rotX;
  m.isPickable = false; return m;
}

// ── Per-weapon viewmodel builders ────────────────────────────────────────────

function buildC7A2(parent, scene) {
  // C7A2 — Canadian Forces AR, flat-top, polymer furniture, 20" barrel
  const M = getWpnMats(scene);
  const V = new Vector3;
  box(scene,'c7_rcvr',parent, 0.042,0.065,0.42, new Vector3(0,0,0.06), M.darkGun);       // receiver
  box(scene,'c7_hg',  parent, 0.046,0.042,0.20, new Vector3(0,-0.005,-0.14), M.polymer); // handguard
  box(scene,'c7_grip',parent, 0.032,0.10, 0.04, new Vector3(0,-0.07, 0.06), M.polymer);  // pistol grip
  box(scene,'c7_stk', parent, 0.028,0.042,0.21, new Vector3(0,-0.004,-0.25), M.polymer); // collapsible stock
  box(scene,'c7_bfr', parent, 0.030,0.020,0.10, new Vector3(0, 0.042, 0.04), M.darkGun);// top rail
  box(scene,'c7_mag', parent, 0.030,0.10, 0.038,new Vector3(0,-0.10, 0.05), M.polymer);  // 30-rd STANAG
  cyl(scene,'c7_brl', parent, 0.016,0.36, 6,    new Vector3(0, 0.006, 0.28), M.steel, Math.PI/2); // barrel
  cyl(scene,'c7_fs',  parent, 0.022,0.028,5,    new Vector3(0, 0.006, 0.45), M.darkGun, Math.PI/2); // flash hider
}

function buildAR15(parent, scene) {
  // AR-15 — civilian semi, 16" barrel, M-LOK handguard
  const M = getWpnMats(scene);
  box(scene,'ar_rcvr',parent, 0.040,0.060,0.38, new Vector3(0, 0, 0.04), M.darkGun);
  box(scene,'ar_hg',  parent, 0.044,0.038,0.18, new Vector3(0,-0.005,-0.12), M.darkGun);
  box(scene,'ar_grip',parent, 0.030,0.095,0.038,new Vector3(0,-0.065, 0.06), M.polymer);
  box(scene,'ar_stk', parent, 0.026,0.038,0.19, new Vector3(0,-0.002,-0.23), M.polymer);
  box(scene,'ar_mag', parent, 0.028,0.095,0.036,new Vector3(0,-0.095, 0.04), M.polymer);
  box(scene,'ar_rail',parent, 0.028,0.018,0.09, new Vector3(0, 0.040, 0.02), M.darkGun);
  cyl(scene,'ar_brl', parent, 0.016,0.30, 6,    new Vector3(0, 0.005, 0.24), M.steel, Math.PI/2);
  cyl(scene,'ar_muz', parent, 0.020,0.026,5,    new Vector3(0, 0.005, 0.39), M.steel, Math.PI/2);
}

function buildM14(parent, scene) {
  // M14 — battle rifle, walnut stock, 22" barrel
  const M = getWpnMats(scene);
  box(scene,'m14_rcvr',parent, 0.044,0.070,0.44, new Vector3(0, 0, 0.06), M.darkGun);
  box(scene,'m14_stk', parent, 0.044,0.055,0.38, new Vector3(0,-0.028,-0.22), M.wood); // walnut stock
  box(scene,'m14_pistg',parent,0.032,0.085,0.045,new Vector3(0,-0.062, 0.04), M.wood);
  box(scene,'m14_hg',  parent, 0.045,0.040,0.16, new Vector3(0,-0.002,-0.11), M.wood);
  box(scene,'m14_mag', parent, 0.032,0.090,0.040,new Vector3(0,-0.095, 0.05), M.darkGun);
  cyl(scene,'m14_brl', parent, 0.018,0.40, 6,    new Vector3(0, 0.010, 0.30), M.steel, Math.PI/2);
  cyl(scene,'m14_muz', parent, 0.022,0.032,6,    new Vector3(0, 0.010, 0.50), M.steel, Math.PI/2);
}

function buildSKS(parent, scene) {
  // SKS — Soviet semi, integral 10-rd mag, wood stock, spike bayonet
  const M = getWpnMats(scene);
  box(scene,'sks_rcvr',parent, 0.042,0.065,0.40, new Vector3(0, 0, 0.04), M.darkGun);
  box(scene,'sks_stk', parent, 0.044,0.060,0.36, new Vector3(0,-0.030,-0.21), M.wood);
  box(scene,'sks_hg',  parent, 0.046,0.042,0.18, new Vector3(0, 0.004,-0.11), M.wood);
  box(scene,'sks_mag', parent, 0.034,0.060,0.042,new Vector3(0,-0.072, 0.03), M.darkGun); // integral mag
  box(scene,'sks_pgrp',parent, 0.030,0.080,0.042,new Vector3(0,-0.060, 0.05), M.wood);
  cyl(scene,'sks_brl', parent, 0.018,0.42, 6,    new Vector3(0, 0.009, 0.29), M.steel, Math.PI/2);
  // Spike bayonet (folded under)
  box(scene,'sks_bay', parent, 0.008,0.008,0.28, new Vector3(0,-0.025, 0.16), M.steel);
}

function buildRem870(parent, scene) {
  // Remington 870 — pump-action shotgun, wood furniture, 18" barrel
  const M = getWpnMats(scene);
  box(scene,'r870_rcvr',parent, 0.050,0.068,0.32, new Vector3(0, 0, 0.02), M.darkGun);
  box(scene,'r870_stk', parent, 0.046,0.060,0.28, new Vector3(0,-0.022,-0.20), M.wood);
  box(scene,'r870_fore',parent, 0.056,0.045,0.20, new Vector3(0,-0.010,-0.10), M.wood); // pump forend
  box(scene,'r870_tube',parent, 0.028,0.028,0.30, new Vector3(0,-0.022, 0.16), M.steel); // mag tube
  box(scene,'r870_pgrp',parent, 0.034,0.090,0.044,new Vector3(0,-0.065, 0.02), M.wood);
  cyl(scene,'r870_brl', parent, 0.022,0.34, 7,    new Vector3(0, 0.012, 0.22), M.steel, Math.PI/2);
  cyl(scene,'r870_muz', parent, 0.030,0.025,6,    new Vector3(0, 0.012, 0.39), M.steel, Math.PI/2);
}

function buildGlock17(parent, scene) {
  // Glock 17 — polymer pistol, 4.5" barrel
  const M = getWpnMats(scene);
  box(scene,'g17_slide',parent, 0.034,0.042,0.20, new Vector3(0, 0.012, 0.06), M.darkGun); // slide
  box(scene,'g17_frame',parent, 0.034,0.055,0.16, new Vector3(0,-0.015, 0.04), M.polymer); // frame
  box(scene,'g17_grip', parent, 0.034,0.115,0.038,new Vector3(0,-0.072,-0.02), M.polymer); // grip
  box(scene,'g17_mag',  parent, 0.030,0.100,0.030,new Vector3(0,-0.065,-0.015),M.darkGun); // 17-rd mag
  box(scene,'g17_trig', parent, 0.008,0.025,0.020,new Vector3(0,-0.028, 0.01), M.polymer); // trigger
  cyl(scene,'g17_brl',  parent, 0.014,0.18, 6,    new Vector3(0, 0.018, 0.12), M.steel, Math.PI/2);
}

function buildLeeEnfield(parent, scene) {
  // Lee-Enfield No.4 — bolt-action .303, long wooden stock, 25" barrel
  const M = getWpnMats(scene);
  box(scene,'le_rcvr',parent, 0.042,0.062,0.38, new Vector3(0, 0.002, 0.05), M.darkGun);
  box(scene,'le_stk', parent, 0.044,0.058,0.50, new Vector3(0,-0.028,-0.22), M.wood);   // full-length stock
  box(scene,'le_hg',  parent, 0.046,0.042,0.22, new Vector3(0, 0.003,-0.13), M.wood);
  box(scene,'le_mag', parent, 0.032,0.065,0.038,new Vector3(0,-0.070, 0.04), M.darkGun); // 10-rd detachable
  box(scene,'le_bolt',parent, 0.018,0.018,0.10, new Vector3(0.032, 0.032, 0.01), M.steel); // bolt handle
  box(scene,'le_bhdl',parent, 0.014,0.040,0.014,new Vector3(0.044, 0.016, 0.01), M.steel); // bolt knob
  cyl(scene,'le_brl', parent, 0.018,0.50, 6,    new Vector3(0, 0.010, 0.32), M.steel, Math.PI/2);
  // Nose cap / muzzle
  box(scene,'le_nc',  parent, 0.048,0.048,0.03, new Vector3(0, 0.010, 0.57), M.darkGun);
}

const _BUILDERS = { c7a2: buildC7A2, ar15: buildAR15, m14: buildM14, sks: buildSKS, rem870: buildRem870, glock17: buildGlock17, leeEnfield: buildLeeEnfield };

// ── Weapon Viewmodel — first-person, camera-parented ────────────────────────
let _activeWeaponNode = null;

export function createWeaponModel(scene, camera, weaponId) {
  const wpn = WEAPONS[weaponId] || WEAPONS.c7a2;
  const parent = new TransformNode('weaponParent', scene);
  parent.parent = camera;

  // Per-weapon offset so it feels naturally held
  const offsets = {
    c7a2:       [0.22, -0.20, 0.35],
    ar15:       [0.22, -0.20, 0.35],
    m14:        [0.24, -0.21, 0.36],
    sks:        [0.23, -0.20, 0.34],
    rem870:     [0.24, -0.22, 0.32],
    glock17:    [0.18, -0.20, 0.28],
    leeEnfield: [0.24, -0.21, 0.38],
  };
  const [ox, oy, oz] = offsets[weaponId] || [0.22, -0.20, 0.35];
  parent.position = new Vector3(ox, oy, oz);

  // Try loading GLB model first
  const baseName = weaponId.toLowerCase();
  const wIdStr = 'weapon_' + baseName;
  const glbModel = getModelInstance(scene, wIdStr + '_detailed') || getModelInstance(scene, wIdStr);
  
  if (glbModel) {
    glbModel.parent = parent;
    glbModel.position = Vector3.Zero();
    console.log('[Weapons] Using GLB model for', weaponId);
  } else {
    // Fallback: Build procedural weapon-specific geometry
    const builder = _BUILDERS[weaponId] || buildC7A2;
    builder(parent, scene);
  }

  // Update HUD
  const nameEl = document.getElementById('wpnName');
  if (nameEl) nameEl.textContent = wpn.name;

  _activeWeaponNode = parent;
  return parent;
}

// ── Equip weapon by ID — tears down old viewmodel, builds new ───────────────
export function equipWeapon(scene, camera, weaponId, registerFn) {
  if (!WEAPONS[weaponId]) return;
  if (STATE.reloading) return; // can't switch while reloading

  // Dispose old viewmodel
  if (_activeWeaponNode) {
    _activeWeaponNode.getChildMeshes().forEach(m => m.dispose());
    _activeWeaponNode.dispose();
    _activeWeaponNode = null;
  }

  // Switch state
  STATE.equippedWeapon = weaponId;
  const wpn = WEAPONS[weaponId];
  STATE.ammo        = Math.min(STATE.ammo, wpn.mag); // keep current ammo, cap to new mag
  STATE.reloading   = false;

  // Build new viewmodel
  const node = createWeaponModel(scene, camera, weaponId);
  if (registerFn) registerFn(node);

  // HUD
  const ammoEl = document.getElementById('wpnAmmo');
  if (ammoEl) ammoEl.textContent = STATE.ammo;
  const resEl = document.getElementById('wpnReserve');
  if (resEl) resEl.textContent = STATE.reserveAmmo;

  // Draw animation — slide weapon up from below
  node.position.y = -0.6;
  let t = 0;
  const anim = setInterval(() => {
    t += 0.08;
    node.position.y = -0.6 + 0.42 * Math.min(t, 1);
    if (t >= 1) clearInterval(anim);
  }, 16);
}
