/**
 * enemies.js — Communist Enemy AI
 * Camp guards, road patrols, death squads.
 * State machine: patrol → alert → engage → search → patrol
 * Humanoid soldier mesh: torso, head, helmet, shoulders, arms, legs, rifle prop
 */

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { STATE } from './state.js';
import { getHeight } from './world.js';
import { getPlanetHeight, getSpherePos, PLANET_RADIUS, flatToSphereDir } from './world_sphere.js';
import { triggerDeath } from './state.js';
import { addTracer } from './effects.js';
import { playSound } from './audio.js';
import { Ray } from '@babylonjs/core/Culling/ray.js';
import { throwEnemyGrenade } from './grenades.js';
import { getModelInstance } from './models.js';

const enemies = [];
export function getEnemies() { return enemies; }
const DETECT_RANGE  = 60;   // metres — initial spot range
const ENGAGE_RANGE  = 40;   // metres — open fire
const FIRE_INTERVAL = 1.2;  // seconds between shots
const SEARCH_TIME   = 8.0;  // seconds to search before giving up
const RESPAWN_INTERVAL = 45; // seconds between respawn waves
const MORALE_ROUT   = 25;   // morale threshold for retreat
let _respawnTimer = RESPAWN_INTERVAL;

/**
 * Called by engine.js when a bullet/melee hit lands on an enemy mesh.
 * Drains morale and may trigger the 'retreat' state.
 */
export function notifyEnemyHit(mesh) {
  const e = enemies.find(en => en.mesh === mesh);
  if (!e || !e.mesh.metadata.alive) return;
  // Suppress state — enemy ducks and sprays suppressing fire
  e.suppressTimer = 2.5 + Math.random() * 1.5;
  if (e.state !== 'retreat') e.state = 'suppress';
  // Drain morale proportional to remaining HP
  const hpFrac = Math.max(0, e.mesh.metadata.hp) / 100;
  e.morale = Math.max(0, e.morale - (30 + (1 - hpFrac) * 40));
  if (e.morale <= MORALE_ROUT && e.mesh.metadata.hp > 0) {
    e.state = 'retreat';
    // Pick a retreat point behind the enemy (away from player)
    const dx = e.root.position.x - (window._px ?? 2000);
    const dz = e.root.position.z - (window._pz ?? 2000);
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    e.retreatTarget = {
      x: e.root.position.x + (dx / len) * 35 + (Math.random() - 0.5) * 12,
      z: e.root.position.z + (dz / len) * 35 + (Math.random() - 0.5) * 12,
    };
  }
}

// Camp positions (mirrors world.js CAMPS)
const CAMP_DEFS = [
  { x: 800,  z: 1200 },
  { x: 3000, z: 1000 },
  { x: 1600, z: 3000 },
  { x: 3200, z: 2800 },
  { x: 2000, z: 2000 },
  { x: 1200, z: 600  },
  { x: 3400, z: 1800 },
  { x: 600,  z: 3400 },
];

// ── Spawn Enemies ───────────────────────────────────────────────────────────
export function spawnEnemies(scene, shadowGen) {
  for (const camp of CAMP_DEFS) {
    const guardCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < guardCount; i++) {
      const angle = (i / guardCount) * Math.PI * 2;
      const r = 8 + Math.random() * 15;
      spawnEnemy(scene, shadowGen, {
        x: camp.x + Math.cos(angle) * r,
        z: camp.z + Math.sin(angle) * r,
        type: 'guard',
        patrolRadius: 15,
        patrolCenter: { x: camp.x, z: camp.z },
      });
    }
  }

  // Road patrols (death squads)
  for (let i = 0; i < 8; i++) {
    const x = 100 + Math.random() * 1800;
    const z = 950 + (Math.random() - 0.5) * 100;
    spawnEnemy(scene, shadowGen, {
      x, z, type: 'deathSquad',
      patrolRadius: 80,
      patrolCenter: { x, z },
    });
  }
}

// ── Shared soldier mesh templates (built once, instanced per enemy) ──────────
let _soldierTemplates = null;

function getSoldierTemplates(scene) {
  if (_soldierTemplates) return _soldierTemplates;

  // ── Materials ──
  const odGreen = new PBRMaterial('solODGreen', scene);
  odGreen.albedoColor = new Color3(0.22, 0.28, 0.16);
  odGreen.roughness = 0.92; odGreen.metallic = 0.0;

  const blackUniform = new PBRMaterial('solBlack', scene);
  blackUniform.albedoColor = new Color3(0.10, 0.10, 0.10);
  blackUniform.roughness = 0.88; blackUniform.metallic = 0.05;

  const skinTone = new PBRMaterial('solSkin', scene);
  skinTone.albedoColor = new Color3(0.72, 0.55, 0.42);
  skinTone.roughness = 0.85; skinTone.metallic = 0.0;

  const helmetMat = new PBRMaterial('solHelmet', scene);
  helmetMat.albedoColor = new Color3(0.18, 0.22, 0.13);
  helmetMat.roughness = 0.75; helmetMat.metallic = 0.08;

  const bootMat = new PBRMaterial('solBoot', scene);
  bootMat.albedoColor = new Color3(0.08, 0.07, 0.06);
  bootMat.roughness = 0.9; bootMat.metallic = 0.0;

  const rifleMatSol = new PBRMaterial('solRifle', scene);
  rifleMatSol.albedoColor = new Color3(0.12, 0.12, 0.12);
  rifleMatSol.roughness = 0.4; rifleMatSol.metallic = 0.85;

  const woodStock = new PBRMaterial('solWood', scene);
  woodStock.albedoColor = new Color3(0.38, 0.22, 0.08);
  woodStock.roughness = 0.88; woodStock.metallic = 0.0;

  // ── Guard body parts (shared templates, instanced) ──
  // Torso
  const torso = MeshBuilder.CreateBox('solTorso', { width: 0.42, height: 0.55, depth: 0.22 }, scene);
  torso.material = odGreen; torso.isVisible = false;

  // Pelvis
  const pelvis = MeshBuilder.CreateBox('solPelvis', { width: 0.38, height: 0.2, depth: 0.2 }, scene);
  pelvis.material = odGreen; pelvis.isVisible = false;

  // Head
  const head = MeshBuilder.CreateSphere('solHead', { diameter: 0.28, segments: 8 }, scene);
  head.material = skinTone; head.isVisible = false;

  // Helmet (flattened sphere)
  const helmet = MeshBuilder.CreateSphere('solHelm', { diameter: 0.33, segments: 8 }, scene);
  helmet.scaling.y = 0.72;
  helmet.bakeCurrentTransformIntoVertices();
  helmet.material = helmetMat; helmet.isVisible = false;

  // Neck
  const neck = MeshBuilder.CreateCylinder('solNeck', { height: 0.12, diameter: 0.13, tessellation: 6 }, scene);
  neck.material = skinTone; neck.isVisible = false;

  // Upper arms
  const upperArm = MeshBuilder.CreateCylinder('solUArm', { height: 0.28, diameterTop: 0.1, diameterBottom: 0.09, tessellation: 6 }, scene);
  upperArm.material = odGreen; upperArm.isVisible = false;

  // Forearms
  const forearm = MeshBuilder.CreateCylinder('solFArm', { height: 0.25, diameterTop: 0.085, diameterBottom: 0.075, tessellation: 6 }, scene);
  forearm.material = odGreen; forearm.isVisible = false;

  // Hands
  const hand = MeshBuilder.CreateBox('solHand', { width: 0.08, height: 0.04, depth: 0.09 }, scene);
  hand.material = skinTone; hand.isVisible = false;

  // Thighs
  const thigh = MeshBuilder.CreateCylinder('solThigh', { height: 0.38, diameterTop: 0.14, diameterBottom: 0.12, tessellation: 7 }, scene);
  thigh.material = odGreen; thigh.isVisible = false;

  // Shins
  const shin = MeshBuilder.CreateCylinder('solShin', { height: 0.35, diameterTop: 0.1, diameterBottom: 0.085, tessellation: 7 }, scene);
  shin.material = odGreen; shin.isVisible = false;

  // Boots
  const boot = MeshBuilder.CreateBox('solBoot', { width: 0.1, height: 0.14, depth: 0.22 }, scene);
  boot.material = bootMat; boot.isVisible = false;

  // Shoulder pad (epaulette)
  const shoulder = MeshBuilder.CreateBox('solShld', { width: 0.15, height: 0.06, depth: 0.14 }, scene);
  shoulder.material = odGreen; shoulder.isVisible = false;

  // Chest webbing / plate carrier (thinner box overlay)
  const webbing = MeshBuilder.CreateBox('solWeb', { width: 0.44, height: 0.3, depth: 0.08 }, scene);
  webbing.material = helmetMat; webbing.isVisible = false;

  // Rifle body (AK-pattern, carried at sling)
  const rifleBody = MeshBuilder.CreateBox('solRifleB', { width: 0.04, height: 0.06, depth: 0.52 }, scene);
  rifleBody.material = rifleMatSol; rifleBody.isVisible = false;

  const rifleMag = MeshBuilder.CreateBox('solRifleMag', { width: 0.04, height: 0.14, depth: 0.06 }, scene);
  rifleMag.material = rifleMatSol; rifleMag.isVisible = false;

  const rifleStock = MeshBuilder.CreateBox('solRifleSk', { width: 0.035, height: 0.06, depth: 0.18 }, scene);
  rifleStock.material = woodStock; rifleStock.isVisible = false;

  const rifleBarrel = MeshBuilder.CreateCylinder('solRifleBrl', { height: 0.22, diameter: 0.02, tessellation: 5 }, scene);
  rifleBarrel.material = rifleMatSol; rifleBarrel.isVisible = false;

  _soldierTemplates = {
    torso, pelvis, head, helmet, neck,
    upperArm, forearm, hand,
    thigh, shin, boot,
    shoulder, webbing,
    rifleBody, rifleMag, rifleStock, rifleBarrel,
    mats: { odGreen, blackUniform, skinTone, helmetMat, bootMat, rifleMatSol, woodStock },
  };
  return _soldierTemplates;
}

function buildSoldierInstance(scene, id, isDeathSquad) {
  const root = new TransformNode(`soldier_root_${id}`, scene);

  // Try loading GLB model first
  const soldierModel = getModelInstance(scene, 'soldier_template');
  if (soldierModel) {
    soldierModel.parent = root;
    soldierModel.position = new Vector3(0, 0, 0);
    // Face the model towards +Z since that's what Babylon calculates look rotation for AI
    soldierModel.rotation = new Vector3(0, Math.PI, 0); 
    const allMeshes = soldierModel.getChildMeshes();
    console.log('[Enemy] Using GLB model for soldier', id);
    return { root, head: soldierModel, allMeshes };
  }

  // Fallback: build box primitive soldier
  const T = getSoldierTemplates(scene);
  const M = T.mats;

  const inst = (tmpl, name) => {
    const i = tmpl.createInstance(`${name}_${id}`);
    i.parent = root;
    return i;
  };

  // Use black uniform for death squads
  const uniformOverride = isDeathSquad ? M.blackUniform : null;

  // ── Pelvis (root bone anchor) ──
  const pelvis = inst(T.pelvis, 'pelvis');
  pelvis.position.y = 0;

  // ── Torso ──
  const torso = inst(T.torso, 'torso');
  torso.position.y = 0.375;
  if (uniformOverride) torso.material = uniformOverride;

  // ── Webbing / plate carrier ──
  const webbing = inst(T.webbing, 'webbing');
  webbing.position.y = 0.42;
  webbing.position.z = 0.08;

  // ── Neck ──
  const neck = inst(T.neck, 'neck');
  neck.position.y = 0.7;

  // ── Head ──
  const head = inst(T.head, 'head');
  head.position.y = 0.87;

  // ── Helmet ──
  const helmet = inst(T.helmet, 'helmet');
  helmet.position.y = 0.93;

  // ── Shoulders ──
  const shoulderL = inst(T.shoulder, 'shoulderL');
  shoulderL.position.set(-0.28, 0.62, 0);
  const shoulderR = inst(T.shoulder, 'shoulderR');
  shoulderR.position.set(0.28, 0.62, 0);

  // ── Arms — left ──
  const uArmL = inst(T.upperArm, 'uArmL');
  uArmL.position.set(-0.28, 0.40, 0);
  uArmL.rotation.z = 0.25;
  const fArmL = inst(T.forearm, 'fArmL');
  fArmL.position.set(-0.32, 0.16, 0.06);
  fArmL.rotation.z = 0.35; fArmL.rotation.x = -0.4;
  const handL = inst(T.hand, 'handL');
  handL.position.set(-0.34, -0.02, 0.16);

  // ── Arms — right ──
  const uArmR = inst(T.upperArm, 'uArmR');
  uArmR.position.set(0.28, 0.40, 0);
  uArmR.rotation.z = -0.25;
  const fArmR = inst(T.forearm, 'fArmR');
  fArmR.position.set(0.32, 0.16, 0.06);
  fArmR.rotation.z = -0.35; fArmR.rotation.x = -0.4;
  const handR = inst(T.hand, 'handR');
  handR.position.set(0.34, -0.02, 0.16);

  // ── Legs — left ──
  const thighL = inst(T.thigh, 'thighL');
  thighL.position.set(-0.12, -0.22, 0);
  if (uniformOverride) thighL.material = uniformOverride;
  const shinL = inst(T.shin, 'shinL');
  shinL.position.set(-0.12, -0.55, 0.02);
  if (uniformOverride) shinL.material = uniformOverride;
  const bootL = inst(T.boot, 'bootL');
  bootL.position.set(-0.12, -0.78, 0.05);

  // ── Legs — right ──
  const thighR = inst(T.thigh, 'thighR');
  thighR.position.set(0.12, -0.22, 0);
  if (uniformOverride) thighR.material = uniformOverride;
  const shinR = inst(T.shin, 'shinR');
  shinR.position.set(0.12, -0.55, 0.02);
  if (uniformOverride) shinR.material = uniformOverride;
  const bootR = inst(T.boot, 'bootR');
  bootR.position.set(0.12, -0.78, 0.05);

  // ── Carried rifle (slung at 45°, right side) ──
  const rBody = inst(T.rifleBody, 'rBody');
  rBody.position.set(0.28, 0.22, 0.14);
  rBody.rotation.x = -0.5;
  const rMag = inst(T.rifleMag, 'rMag');
  rMag.position.set(0.28, 0.10, 0.2);
  rMag.rotation.x = -0.5;
  const rStock = inst(T.rifleStock, 'rStock');
  rStock.position.set(0.28, 0.28, -0.06);
  rStock.rotation.x = -0.5;
  const rBarrel = inst(T.rifleBarrel, 'rBarrel');
  rBarrel.position.set(0.28, 0.22, 0.38);
  rBarrel.rotation.x = Math.PI / 2 - 0.5;

  // All child meshes for shadow casting / hit detection
  const allMeshes = root.getChildMeshes();

  return { root, head, allMeshes };
}

function spawnEnemy(scene, shadowGen, opts) {
  const id = enemies.length;
  const isDeathSquad = opts.type === 'deathSquad';
  const { root, head, allMeshes } = buildSoldierInstance(scene, id, isDeathSquad);

  if (window._planetMode) {
    const sPos = getSpherePos(opts.x, opts.z, 0.85);
    root.position = sPos;
  } else {
    const spawnY = getHeight(opts.x, opts.z) + 0.85;
    root.position = new Vector3(opts.x, spawnY, opts.z);
  }

  // Hitbox cylinder (invisible, handles collision + picking)
  const hitbox = MeshBuilder.CreateCylinder(`enemy_${id}`, {
    height: 1.85, diameter: 0.5, tessellation: 8,
  }, scene);
  hitbox.parent = root;
  hitbox.position.y = 0.08;
  hitbox.isVisible = false;
  hitbox.isPickable = true;
  hitbox.checkCollisions = false;
  hitbox.metadata = { type: 'enemy', hp: 100, alive: true, enemyType: opts.type };

  if (shadowGen) {
    allMeshes.forEach(m => { if (m.isVisible !== false) shadowGen.addShadowCaster(m); });
    shadowGen.addShadowCaster(hitbox);
  }

  // Marching animation state
  let walkPhase = Math.random() * Math.PI * 2;

  enemies.push({
    mesh: hitbox,       // keep .mesh for backward compat (hit detection + metadata)
    root,               // TransformNode — position/rotation target
    head,
    allMeshes,
    walkPhase,
    state: 'patrol',
    type: opts.type,
    patrolCenter: opts.patrolCenter,
    patrolRadius: opts.patrolRadius,
    patrolAngle: Math.random() * Math.PI * 2,
    fireTimer: 0,
    alertTimer: 0,
    speed: opts.type === 'deathSquad' ? 3.5 : 2.0,
    morale: 100,        // 0-100; retreat below MORALE_ROUT
    suppressTimer: 0,   // seconds of suppression fire remaining
    retreatTarget: null,// {x,z} run-to point when routing
    grenadeCooldown: Math.random() * 5, // Stagger initial cooldowns
    campingTimer: 0,
    flankDir: Math.random() < 0.5 ? 1 : -1
  });
}

export function updateEnemies(dt, scene, camera) {
  const px = camera.position.x;
  const pz = camera.position.z;

  for (const e of enemies) {
    if (!e.mesh.metadata.alive) continue;

    const ex = e.root.position.x;
    const ez = e.root.position.z;
    const dist = Math.sqrt((px - ex) ** 2 + (pz - ez) ** 2);

    // ── State transitions ──
    const crouchMult = window._crouchMult ?? 1.0;
    const effectiveDetect = DETECT_RANGE * (crouchMult < 1 ? 0.65 : 1.0);
    if (e.state === 'patrol' && dist < effectiveDetect) {
      const rayDir = new Vector3(px - ex, (camera.position.y - 0.5) - (e.root.position.y + 1.5), pz - ez).normalize();
      const ray = new Ray(new Vector3(ex, e.root.position.y + 1.5, ez), rayDir, effectiveDetect);
      const hit = scene.pickWithRay(ray, m => m.name.includes("terrain") || m.name.includes("ground") || m.name.includes("bld"));
      if (!hit.hit || hit.distance > dist) {
        e.state = 'alert';
        e.alertTimer = 1.5;
      }
    }
    if (e.state === 'alert' && dist < ENGAGE_RANGE) {
      e.state = 'engage';
    }
    if (e.state === 'engage' && dist > effectiveDetect * 1.5) {
      e.state = 'search';
      e.searchTimer = SEARCH_TIME;
      e.searchTarget = { x: px + (Math.random() - 0.5) * 20, z: pz + (Math.random() - 0.5) * 20 };
    }
    if (e.state === 'search') {
      e.searchTimer -= dt;
      if (e.searchTimer <= 0) e.state = 'patrol';
      if (dist < ENGAGE_RANGE) e.state = 'engage';
    }
    // Morale recovers slowly over time (not while routing)
    if (e.state !== 'retreat') {
      e.morale = Math.min(100, e.morale + 2 * dt);
    }
    // Cache player position globally for notifyEnemyHit
    window._px = px; window._pz = pz;

    // ── Behavior ──
    switch (e.state) {
      case 'patrol': {
        e.patrolAngle += dt * 0.3;
        const tx = e.patrolCenter.x + Math.cos(e.patrolAngle) * e.patrolRadius;
        const tz = e.patrolCenter.z + Math.sin(e.patrolAngle) * e.patrolRadius;
        moveToward(e, tx, tz, e.speed * 0.5, dt);
        break;
      }
      case 'alert': {
        facePlayer(e, px, pz);
        e.alertTimer -= dt;
        if (e.alertTimer <= 0) e.state = 'engage';
        break;
      }
      case 'engage': {
        facePlayer(e, px, pz);
        let targetX = px;
        let targetZ = pz;
        
        // Death squads flank to the left or right of the player
        if (e.type === 'deathSquad') {
            const angleToPlayer = Math.atan2(pz - ez, px - ex);
            const flankAngle = angleToPlayer + (Math.PI / 4) * e.flankDir;
            targetX = px - Math.cos(flankAngle) * 12;
            targetZ = pz - Math.sin(flankAngle) * 12;
        }

        if (dist > 12) {
          moveToward(e, targetX, targetZ, e.speed, dt);
        } else {
          const strafeAngle = Math.atan2(pz - ez, px - ex) + Math.PI / 2;
          const sx = ex + Math.cos(strafeAngle) * e.speed * dt;
          const sz = ez + Math.sin(strafeAngle) * e.speed * dt;
          if (window._planetMode) {
            const sDir = new Vector3(sx, e.root.position.y, sz).normalize();
            const sh = getPlanetHeight(sDir);
            e.root.position = sDir.scale(PLANET_RADIUS + Math.max(0, sh) + 0.85);
          } else {
          e.root.position.x = sx;
          e.root.position.z = sz;
          e.root.position.y = getHeight(sx, sz) + 0.85;
          }
        }
        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && dist < ENGAGE_RANGE) {
          fireAtPlayer(e, dist, scene);
          e.fireTimer = FIRE_INTERVAL + Math.random() * 0.5;
        }
        
        // AI Grenade Logic
        e.grenadeCooldown -= dt;
        if (e.type === 'deathSquad' && e.grenadeCooldown <= 0 && dist < 35) {
            const pVelY = STATE.velocity ? STATE.velocity.y : 0;
            if (pVelY < 0.1 && pVelY > -0.1) {
              e.campingTimer += dt;
            } else {
              e.campingTimer = Math.max(0, e.campingTimer - dt * 2);
            }
            if (e.campingTimer > 4.0) {
                e.campingTimer = 0;
                e.grenadeCooldown = 20.0;
                throwEnemyGrenade(scene, e.root.position, camera.position);
            }
        }
        
        break;
      }
      case 'suppress': {
        // Crouch in place, spray inaccurate suppression fire, then re-engage
        facePlayer(e, px, pz);
        e.suppressTimer -= dt;
        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && dist < ENGAGE_RANGE * 1.3) {
          fireAtPlayer(e, dist * 1.8, scene); // 1.8× virtual dist = worse aim
          e.fireTimer = FIRE_INTERVAL * 0.6;  // faster but inaccurate
        }
        if (e.suppressTimer <= 0) {
          e.state = e.morale > MORALE_ROUT ? 'engage' : 'retreat';
          if (e.state === 'retreat') {
            const bdx = ex - px, bdz = ez - pz;
            const blen = Math.sqrt(bdx * bdx + bdz * bdz) || 1;
            e.retreatTarget = {
              x: ex + (bdx / blen) * 30 + (Math.random() - 0.5) * 10,
              z: ez + (bdz / blen) * 30 + (Math.random() - 0.5) * 10,
            };
          }
        }
        break;
      }
      case 'retreat': {
        // Run away; fire a panicked shot back occasionally
        if (!e.retreatTarget) {
          e.state = 'search';
          e.searchTimer = SEARCH_TIME;
          e.searchTarget = { x: ex + (Math.random() - 0.5) * 40, z: ez + (Math.random() - 0.5) * 40 };
          break;
        }
        const rdx = e.retreatTarget.x - ex, rdz = e.retreatTarget.z - ez;
        const rdist = Math.sqrt(rdx * rdx + rdz * rdz);
        if (rdist < 4) {
          // Reached retreat point — rally and re-evaluate
          e.retreatTarget = null;
          e.morale = 60;
          e.state = dist < ENGAGE_RANGE ? 'suppress' : 'search';
          e.suppressTimer = 3.0;
          e.searchTimer = SEARCH_TIME;
          e.searchTarget = { x: ex + (Math.random() - 0.5) * 20, z: ez + (Math.random() - 0.5) * 20 };
        } else {
          moveToward(e, e.retreatTarget.x, e.retreatTarget.z, e.speed * 1.6, dt);
          // Panic fire (inaccurate) while fleeing
          e.fireTimer -= dt;
          if (e.fireTimer <= 0 && dist < ENGAGE_RANGE * 0.8) {
            fireAtPlayer(e, dist * 3, scene);
            e.fireTimer = FIRE_INTERVAL * 2.5;
          }
        }
        break;
      }
      case 'search': {
        const st = e.searchTarget;
        const sdx = st.x - ex, sdz = st.z - ez;
        if (Math.sqrt(sdx * sdx + sdz * sdz) > 3) {
          moveToward(e, st.x, st.z, e.speed * 0.7, dt);
        } else {
          e.searchTarget = {
            x: st.x + (Math.random() - 0.5) * 30,
            z: st.z + (Math.random() - 0.5) * 30,
          };
        }
        break;
      }
    }
  }

  // ── Respawn waves — interval shrinks as kill count rises ──
  _respawnTimer -= dt;
  // Every 10 kills shaves 5s off interval (floor: 20s)
  const threatLevel = Math.floor(STATE.kills / 10);
  const effectiveInterval = Math.max(20, RESPAWN_INTERVAL - threatLevel * 5);
  if (_respawnTimer <= 0) {
    _respawnTimer = effectiveInterval;
    respawnWave(scene);
  }
}

function moveToward(e, tx, tz, speed, dt) {
  if (window._planetMode) {
    // Move along the sphere surface toward target flat coords
    const targetDir = flatToSphereDir(tx, tz);
    const eDir = e.root.position.normalize();
    const toDot = Vector3.Dot(targetDir, eDir);
    if (toDot > 0.9999) return; // already at target
    // Tangent direction from current pos toward target
    const tangent = targetDir.subtract(eDir.scale(toDot)).normalize();
    const angStep = (speed * dt) / PLANET_RADIUS;
    // Spherical lerp by angle step
    const newDir = eDir.scale(Math.cos(angStep)).add(tangent.scale(Math.sin(angStep))).normalize();
    const h = getPlanetHeight(newDir);
    e.root.position = newDir.scale(PLANET_RADIUS + Math.max(0, h) + 0.85);
    // Face direction of movement (yaw relative to radial up)
    const mvFlat = new Vector3(tangent.x, 0, tangent.z);
    e.root.rotation.y = Math.atan2(mvFlat.x, mvFlat.z);
    e.walkPhase += dt * 6.0;
  } else {
  const dx = tx - e.root.position.x;
  const dz = tz - e.root.position.z;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 1) return;
  const nx = e.root.position.x + (dx / len) * speed * dt;
  const nz = e.root.position.z + (dz / len) * speed * dt;
  e.root.position.x = nx;
  e.root.position.z = nz;
  e.root.position.y = getHeight(nx, nz) + 0.85;
  e.root.rotation.y = Math.atan2(dx, dz);
  e.walkPhase += dt * 6.0; // walk cycle
  }

  // ── Walk animation — swing legs and arms ──
  const phase = e.walkPhase;
  const children = e.allMeshes;
  let isProcedural = false;
  
  for (const m of children) {
    const n = m.name;
    if (n.includes('thighL')) { isProcedural = true; m.rotation.x = Math.sin(phase) * 0.4; }
    else if (n.includes('thighR')) m.rotation.x = Math.sin(phase + Math.PI) * 0.4;
    else if (n.includes('shinL')) m.rotation.x = Math.max(0, Math.sin(phase + 0.8)) * 0.35;
    else if (n.includes('shinR')) m.rotation.x = Math.max(0, Math.sin(phase + Math.PI + 0.8)) * 0.35;
    else if (n.includes('uArmL')) m.rotation.x = Math.sin(phase + Math.PI) * 0.3;
    else if (n.includes('uArmR')) m.rotation.x = Math.sin(phase) * 0.3;
  }
  
  if (!isProcedural && e.head) {
    e.head.rotation.z = Math.sin(phase) * 0.08;
    e.head.rotation.x = Math.abs(Math.cos(phase)) * 0.05;
  }
}

function facePlayer(e, px, pz) {
  const dx = px - e.root.position.x;
  const dz = pz - e.root.position.z;
  e.root.rotation.y = Math.atan2(dx, dz);
}

function fireAtPlayer(e, dist, scene) {
  const baseAccuracy = e.type === 'deathSquad' ? 0.7 : 0.4;
  const distPenalty = Math.max(0, (dist - 10) * 0.01);
  const hitChance = baseAccuracy - distPenalty;
  
  // Add tracer effect from enemy to player (or near player if miss)
  const px = STATE.playerPos.x;
  const py = STATE.playerPos.y;
  const pz = STATE.playerPos.z;
  const ex = e.root.position.x;
  const ey = e.root.position.y + 1.2; // rifle height
  const ez = e.root.position.z;
  
  if (Math.random() < hitChance) {
    if (STATE.alive) {
      // Direct hit
      addTracer(scene, new Vector3(ex, ey, ez), new Vector3(px, py - 0.5, pz), true);
      playSound('shoot', { weaponType: 'rifle', volume: 0.35 });

      const dmg = 8 + Math.random() * 12;
      STATE.health -= dmg;
      
      // Hit induces bleeding
      STATE.isBleeding = true;
      STATE.bleedRate = Math.min(2.0, STATE.bleedRate + 0.3);
      
      const el = document.getElementById('damageFlash');
      if (el) {
        el.style.opacity = 0.4;
        setTimeout(() => { el.style.opacity = 0; }, 200);
      }
      if (STATE.health <= 0) {
        STATE.health = 0;
        triggerDeath(e.type === 'deathSquad' ? 'DEATH SQUAD' : 'ENEMY FIRE');
      }
    }
  } else {
    // Miss — fire tracer near the player
    const mx = px + (Math.random() - 0.5) * 4;
    const my = py + Math.random() * 2;
    const mz = pz + (Math.random() - 0.5) * 4;
    addTracer(scene, new Vector3(ex, ey, ez), new Vector3(mx, my, mz), true);
    playSound('shoot', { weaponType: 'rifle', volume: 0.25 });
  }
}

// ── Respawn Wave — reinforce camps that lost guards ──────────────────────────
let _scene = null;
function respawnWave(scene) {
  _scene = scene;
  // Threat tier scales with kills: 0=0-9, 1=10-24, 2=25-49, 3=50+
  const kills = STATE.kills;
  const tier = kills >= 50 ? 3 : kills >= 25 ? 2 : kills >= 10 ? 1 : 0;
  const minGuards = 2 + tier; // 2 / 3 / 4 / 5

  // Count live enemies per camp (rough proximity check)
  for (const camp of CAMP_DEFS) {
    const liveNearby = enemies.filter(e => {
      if (!e.mesh.metadata.alive) return false;
      const dx = e.root.position.x - camp.x;
      const dz = e.root.position.z - camp.z;
      return Math.sqrt(dx*dx + dz*dz) < 80 && e.type === 'guard';
    }).length;

    // Reinforce if below minimum
    if (liveNearby < minGuards) {
      const toSpawn = minGuards - liveNearby + Math.floor(Math.random() * 2);
      for (let i = 0; i < toSpawn; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 10 + Math.random() * 20;
        spawnEnemy(scene, null, {
          x: camp.x + Math.cos(angle) * r,
          z: camp.z + Math.sin(angle) * r,
          type: 'guard',
          patrolRadius: 15,
          patrolCenter: { x: camp.x, z: camp.z },
        });
      }
    }
  }

  // Tier 1+: send death squad patrols toward player position
  if (tier >= 1) {
    const px = STATE.playerPos.x;
    const pz = STATE.playerPos.z;
    for (let i = 0; i < tier; i++) {
      const angle = (i / tier) * Math.PI * 2 + Math.random() * 0.5;
      const r = 60 + Math.random() * 80;
      spawnEnemy(scene, null, {
        x: px + Math.cos(angle) * r,
        z: pz + Math.sin(angle) * r,
        type: 'deathSquad',
        patrolRadius: 80,
        patrolCenter: { x: px + Math.cos(angle) * 30, z: pz + Math.sin(angle) * 30 },
      });
    }
  }
}
