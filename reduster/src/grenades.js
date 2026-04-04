// grenades.js — Frag grenade system
// G key to throw, 3s fuse, 8m kill radius, physics arc
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';
import { STATE } from './state.js';
import { playSound } from './audio.js';
import { addKillFeed } from './hud.js';

const FUSE_TIME = 3.0;        // seconds
const KILL_RADIUS = 8;         // metres — instant kill
const DAMAGE_RADIUS = 15;      // metres — falloff damage
const THROW_SPEED = 18;        // m/s forward velocity
const THROW_ARC = 8;           // m/s upward velocity
const GRAVITY = 9.81;
const COOLDOWN = 1.0;          // seconds between throws
const BOUNCE_DAMPING = 0.4;    // velocity retained on bounce

const _activeGrenades = [];

export function throwGrenade(scene, camera) {
  if (STATE.grenades <= 0 || STATE.grenadeTimer > 0) return;

  STATE.grenades--;
  STATE.grenadeTimer = COOLDOWN;

  // Create grenade mesh — small dark green sphere
  const mesh = MeshBuilder.CreateSphere('grenade', { diameter: 0.08 }, scene);
  const mat = new StandardMaterial('grenadeMat', scene);
  mat.diffuseColor = new Color3(0.15, 0.22, 0.12);
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  mesh.material = mat;

  // Spawn at camera position
  const pos = camera.position.clone();
  pos.y -= 0.3; // slightly below eye level
  mesh.position = pos;

  // Throw direction = camera forward + upward arc
  const forward = camera.getDirection(new Vector3(0, 0, 1)).normalize();
  const vel = forward.scale(THROW_SPEED);
  vel.y += THROW_ARC;

  playSound('reload'); // placeholder throw sound

  _activeGrenades.push({
    mesh,
    velocity: vel,
    fuse: FUSE_TIME,
    bounced: false,
  });
}

export function throwEnemyGrenade(scene, startPos, targetPos) {
  // Create grenade mesh
  const mesh = MeshBuilder.CreateSphere('enemyGrenade', { diameter: 0.08 }, scene);
  const mat = new StandardMaterial('enemyGrenadeMat', scene);
  mat.diffuseColor = new Color3(0.1, 0.15, 0.1);
  mesh.material = mat;

  mesh.position = startPos.clone();
  mesh.position.y += 1.2; // roughly hand/shoulder height

  // Arc physics to reach targetPos (roughly)
  const dx = targetPos.x - startPos.x;
  const dz = targetPos.z - startPos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  
  // Predict horizontal velocity to cover distance in 1.5s
  const flightTime = 1.5;
  const vx = dx / flightTime;
  const vz = dz / flightTime;
  
  // Need to counteract gravity to stay airborne
  const vy = (GRAVITY * flightTime) / 2;

  const vel = new Vector3(vx, vy + 2.0, vz); // slightly higher arc

  playSound('reload', { volume: 0.5 }); // faint clink when thrown

  _activeGrenades.push({
    mesh,
    velocity: vel,
    fuse: FUSE_TIME + 0.5, // slightly longer fuse to give player react time
    bounced: false,
    isEnemy: true
  });
}

export function updateGrenades(dt, scene, camera, getHeight, enemies) {
  // Cooldown tick
  if (STATE.grenadeTimer > 0) {
    STATE.grenadeTimer = Math.max(0, STATE.grenadeTimer - dt);
  }

  for (let i = _activeGrenades.length - 1; i >= 0; i--) {
    const g = _activeGrenades[i];
    g.fuse -= dt;

    // Physics — simple ballistic arc with ground bounce
    g.velocity.y -= GRAVITY * dt;
    g.mesh.position.addInPlace(g.velocity.scale(dt));

    // Ground collision
    if (getHeight) {
      const groundY = getHeight(g.mesh.position.x, g.mesh.position.z) + 0.05;
      if (g.mesh.position.y < groundY) {
        g.mesh.position.y = groundY;
        g.velocity.y = Math.abs(g.velocity.y) * BOUNCE_DAMPING;
        g.velocity.x *= 0.7;
        g.velocity.z *= 0.7;
        if (!g.bounced) {
          g.bounced = true;
          playSound('footstep'); // bounce thud
        }
      }
    }

    // Spin the grenade
    g.mesh.rotation.x += dt * 12;
    g.mesh.rotation.z += dt * 8;

    // Detonate on fuse expiry
    if (g.fuse <= 0) {
      _detonate(g, scene, camera, enemies);
      g.mesh.dispose();
      _activeGrenades.splice(i, 1);
    }
  }
}

function _detonate(grenade, scene, camera, enemies) {
  const pos = grenade.mesh.position;

  // Explosion flash light
  const light = new PointLight('grenadeFlash', pos.clone(), scene);
  light.diffuse = new Color3(1.0, 0.7, 0.3);
  light.intensity = 30;
  light.range = DAMAGE_RADIUS * 2;
  setTimeout(() => { light.intensity = 0; setTimeout(() => light.dispose(), 100); }, 150);

  // Explosion particle burst — simple expanding ring of small spheres
  for (let j = 0; j < 12; j++) {
    const shard = MeshBuilder.CreateSphere('shard', { diameter: 0.06 }, scene);
    shard.position = pos.clone();
    const angle = (j / 12) * Math.PI * 2;
    const dir = new Vector3(Math.cos(angle), 0.5 + Math.random(), Math.sin(angle));
    const shardVel = dir.scale(8 + Math.random() * 6);
    const mat = new StandardMaterial('shardMat', scene);
    mat.diffuseColor = new Color3(0.8, 0.4 + Math.random() * 0.3, 0.1);
    mat.emissiveColor = new Color3(0.6, 0.3, 0.0);
    shard.material = mat;

    let age = 0;
    const obs = scene.onBeforeRenderObservable.add(() => {
      age += scene.getEngine().getDeltaTime() / 1000;
      shardVel.y -= 12 * (scene.getEngine().getDeltaTime() / 1000);
      shard.position.addInPlace(shardVel.scale(scene.getEngine().getDeltaTime() / 1000));
      shard.scaling.setAll(Math.max(0, 1 - age * 2));
      if (age > 0.6) {
        scene.onBeforeRenderObservable.remove(obs);
        shard.dispose();
        mat.dispose();
      }
    });
  }

  // Screen shake if player is close
  const playerDist = Vector3.Distance(pos, camera.position);
  if (playerDist < DAMAGE_RADIUS * 2) {
    const shake = Math.max(0, 1 - playerDist / (DAMAGE_RADIUS * 2)) * 0.08;
    camera.rotation.x += (Math.random() - 0.5) * shake;
    camera.rotation.y += (Math.random() - 0.5) * shake;
  }

  // Player self-damage
  if (playerDist < KILL_RADIUS) {
    const dmg = 80 * (1 - playerDist / KILL_RADIUS);
    STATE.health = Math.max(0, STATE.health - dmg);
  } else if (playerDist < DAMAGE_RADIUS) {
    const dmg = 40 * (1 - playerDist / DAMAGE_RADIUS);
    STATE.health = Math.max(0, STATE.health - dmg);
  }

  // Enemy damage
  if (enemies && enemies.length) {
    for (const enemy of enemies) {
      if (!enemy.alive || !enemy.root) continue;
      const enemyPos = enemy.root.position;
      const dist = Vector3.Distance(pos, enemyPos);
      if (dist < KILL_RADIUS) {
        enemy.hp = 0;
        enemy.alive = false;
        STATE.kills++;
        addKillFeed('Frag grenade');
      } else if (dist < DAMAGE_RADIUS) {
        const dmg = 60 * (1 - dist / DAMAGE_RADIUS);
        enemy.hp -= dmg;
        if (enemy.hp <= 0) {
          enemy.alive = false;
          STATE.kills++;
          addKillFeed('Grenade shrapnel');
        }
      }
    }
  }

  // Explosion sound
  playSound('shoot', { weaponType: 'shotgun' }); // deep boom
}
