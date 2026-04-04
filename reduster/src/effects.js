import * as BABYLON from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';
import { Scalar } from '@babylonjs/core/Maths/math.scalar.js';
import { Scene } from '@babylonjs/core/scene.js';
import { STATE } from './state.js';

// ── Helpers ──
function hexToColor3(hex) {
  return new Color3(((hex >> 16) & 0xFF) / 255, ((hex >> 8) & 0xFF) / 255, (hex & 0xFF) / 255);
}

// ── Day / Night Cycle ──
export const DAY_LENGTH = 120;
export let dayTime = 0.25;

export const SKY_COLORS = [
  { t: 0.00, sky: hexToColor3(0x000510), fog: hexToColor3(0x000510), ambient: 0.05, sunCol: hexToColor3(0x102030) },
  { t: 0.22, sky: hexToColor3(0x0a0820), fog: hexToColor3(0x0a0820), ambient: 0.1,  sunCol: hexToColor3(0x1a1040) },
  { t: 0.28, sky: hexToColor3(0x4a1a0a), fog: hexToColor3(0x3a1208), ambient: 0.35, sunCol: hexToColor3(0xff6633) },
  { t: 0.35, sky: hexToColor3(0x6699cc), fog: hexToColor3(0x446688), ambient: 0.7,  sunCol: hexToColor3(0xffeebb) },
  { t: 0.50, sky: hexToColor3(0x7aaecc), fog: hexToColor3(0x4488aa), ambient: 1.0,  sunCol: hexToColor3(0xffffff) },
  { t: 0.65, sky: hexToColor3(0x6699cc), fog: hexToColor3(0x446688), ambient: 0.7,  sunCol: hexToColor3(0xffeebb) },
  { t: 0.75, sky: hexToColor3(0x6b2a0a), fog: hexToColor3(0x5a2208), ambient: 0.3,  sunCol: hexToColor3(0xff4422) },
  { t: 0.82, sky: hexToColor3(0x0a0820), fog: hexToColor3(0x0a0818), ambient: 0.1,  sunCol: hexToColor3(0x1a1040) },
  { t: 1.00, sky: hexToColor3(0x000510), fog: hexToColor3(0x000510), ambient: 0.05, sunCol: hexToColor3(0x102030) },
];

export function sampleDayCycle(t) {
  t = ((t % 1) + 1) % 1;
  let a = SKY_COLORS[SKY_COLORS.length - 2], b = SKY_COLORS[SKY_COLORS.length - 1];
  for (let i = 0; i < SKY_COLORS.length - 1; i++) {
    if (t >= SKY_COLORS[i].t && t < SKY_COLORS[i + 1].t) { a = SKY_COLORS[i]; b = SKY_COLORS[i + 1]; break; }
  }
  const f = (t - a.t) / (b.t - a.t + 0.0001);
  return {
    sky: Color3.Lerp(a.sky, b.sky, f),
    fog: Color3.Lerp(a.fog, b.fog, f),
    ambient: a.ambient + (b.ambient - a.ambient) * f,
    sunCol: Color3.Lerp(a.sunCol, b.sunCol, f),
  };
}

export const isNight = () => dayTime < 0.22 || dayTime > 0.78;

// Sleep mechanic time skip hook
window._advanceTime = (delta) => { dayTime = (dayTime + delta) % 1; };

export function updateDayNight(dt, scene, stars, ambientLight, moonLight, sunMesh, moonMesh, MAP_W, MAP_H) {
  if (!STATE.started) return;
  dayTime = (dayTime + dt / DAY_LENGTH) % 1;

  const { sky, fog, ambient, sunCol } = sampleDayCycle(dayTime);
  scene.clearColor = new Color4(sky.r, sky.g, sky.b, 1);
  scene.fogColor = fog;
  ambientLight.intensity = ambient;
  moonLight.diffuse = sunCol;
  moonLight.intensity = 0.4 + ambient * 1.2;

  const angle = dayTime * Math.PI * 2;
  const cx = MAP_W / 2, cz = MAP_H / 2, radius = 45, height = 30;
  sunMesh.position.set(cx + Math.cos(angle) * radius, height * Math.sin(angle), cz + Math.sin(angle) * 5);
  moonMesh.position.set(cx - Math.cos(angle) * radius, height * Math.sin(angle + Math.PI), cz - Math.sin(angle) * 5);
  moonLight.position = sunMesh.position.clone();

  sunMesh.isVisible  = dayTime > 0.2 && dayTime < 0.8;
  moonMesh.isVisible = dayTime < 0.2 || dayTime > 0.8;

  if (stars) {
    stars.material.alpha = dayTime < 0.25 || dayTime > 0.75
      ? 0.8 : Math.max(0, 1 - Math.abs(dayTime - 0.5) * 8);
  }

  // ── House interior lights — on at night, off during day ──
  let lightIntensityMul = 0;
  if (dayTime < 0.22 || dayTime > 0.78) lightIntensityMul = 1.0;
  else if (dayTime < 0.28) lightIntensityMul = 1.0 - (dayTime - 0.22) / 0.06;
  else if (dayTime > 0.72) lightIntensityMul = (dayTime - 0.72) / 0.06;

  if (typeof window !== 'undefined' && window._activeChunks) {
    if (!window._lightFrame) window._lightFrame = 0;
    window._lightFrame++;
    if (window._lightFrame % 30 === 0) {
      const t = performance.now() * 0.001;
      for (const [, chunkGroup] of window._activeChunks) {
        const children = chunkGroup.getChildMeshes ? chunkGroup.getChildMeshes(false) : [];
        const lights = chunkGroup.getChildTransformNodes ? chunkGroup.getChildTransformNodes(false).filter(n => n instanceof PointLight) : [];
        // Also check direct light children
        const allNodes = [...children, ...lights];
        if (chunkGroup instanceof PointLight) allNodes.push(chunkGroup);
        for (const child of allNodes) {
          if (child instanceof PointLight && child.metadata && child.metadata.isHouseLight) {
            let mul = lightIntensityMul;
            if (child.metadata.flicker && mul > 0) {
              const flick = 0.7 + 0.3 * Math.sin(t * 8.3 + child.position.x) * Math.sin(t * 3.1 + child.position.z);
              mul *= flick;
            }
            child.intensity = child.metadata.baseIntensity * mul;
          }
          if (child.material && child.material.metadata && child.material.metadata.isWindowGlow) {
            child.material.alpha = child.material.metadata.baseOpacity * lightIntensityMul;
            child.isVisible = lightIntensityMul > 0.01;
          }
        }
      }
    }
  }
  // Export for window glow effects
  window._nightLightMul = lightIntensityMul;

  // Flashlight auto-dim: full power at night, dim during day
  if (typeof window !== 'undefined' && window._flashLight) {
    window._flashLight.intensity = lightIntensityMul > 0.5 ? 30 : 5;
  }

  const hour = Math.floor(dayTime * 24);
  const mins = Math.floor((dayTime * 24 - hour) * 60);
  const label = dayTime < 0.22 || dayTime > 0.78 ? '🌙 NIGHT' :
                dayTime < 0.28 ? '🌅 DAWN' :
                dayTime < 0.72 ? '☀ DAY' : '🌇 DUSK';
  const todEl = document.getElementById('timeOfDay');
  if (todEl) todEl.textContent = `${label}  ${String(hour).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
}

// ── Particle System ──
export function addParticle(scene, x, y, z, color, velOverride) {
  const mat = new StandardMaterial("particleMat", scene);
  mat.emissiveColor = hexToColor3(color || 0xff0000);
  mat.disableLighting = true;
  const mesh = MeshBuilder.CreateSphere("particle", { diameter: 0.06 + Math.random() * 0.06, segments: 4 }, scene);
  mesh.material = mat;
  mesh.position.set(x, y, z);
  const vel = velOverride || {
    x: (Math.random() - 0.5) * 4,
    y: 1 + Math.random() * 3,
    z: (Math.random() - 0.5) * 4,
  };
  STATE.particles.push({
    mesh, x, y, z,
    vx: vel.x || vel.x, vy: vel.y || vel.y, vz: vel.z || vel.z,
    life: 0.5 + Math.random() * 0.5, isGib: false,
  });
}

export function addBloodDecal(scene, x, z) {
  const size = 0.2 + Math.random() * 0.4;
  const mat = new StandardMaterial("bloodMat", scene);
  mat.diffuseColor = hexToColor3(0x660000);
  mat.alpha = 0.7;
  mat.disableDepthWrite = true;
  mat.roughness = 1;
  const decal = MeshBuilder.CreateDisc("bloodDecal", { radius: size, tessellation: 8 }, scene);
  decal.material = mat;
  decal.rotation.x = Math.PI / 2;
  decal.position.set(x, 0.01, z);
  STATE.bloodDecals.push(decal);
  while (STATE.bloodDecals.length > 50) {
    const old = STATE.bloodDecals.shift();
    old.dispose();
  }
}

export function updateParticles(scene, dt) {
  for (let i = STATE.particles.length - 1; i >= 0; i--) {
    const p = STATE.particles[i];

    if (p.mesh) {
      // GIB object (has metadata.vel)
      if (p.isGib && p.mesh.metadata && p.mesh.metadata.vel) {
        const vel = p.mesh.metadata.vel;
        p.mesh.position.x += vel.x * dt;
        p.mesh.position.y += vel.y * dt;
        p.mesh.position.z += vel.z * dt;
        vel.y -= 30 * dt;
        if (p.mesh.metadata.spin) {
          p.mesh.rotation.x += p.mesh.metadata.spin.x * dt;
          p.mesh.rotation.y += p.mesh.metadata.spin.y * dt;
          p.mesh.rotation.z += p.mesh.metadata.spin.z * dt;
        }
        if (p.mesh.position.y < 0.5) {
          p.mesh.position.y = 0.5;
          vel.y = Math.abs(vel.y) * 0.25;
          vel.x *= 0.5;
          vel.z *= 0.5;
        }
        p.life -= dt;
        if (p.life <= 0) { p.mesh.dispose(); STATE.particles.splice(i, 1); }
        continue;
      }

      // Regular particle
      p.x += p.vx * dt;
      p.vy -= 12 * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.mesh.position.set(p.x, p.y, p.z);
    }

    p.life -= dt;
    if (p.life <= 0 || (p.y !== undefined && p.y < -1)) {
      if (p.mesh) p.mesh.dispose();
      STATE.particles.splice(i, 1);
    }
  }
}

// ── Visceral Combat Suite FX ──

export function addTracer(scene, startPos, endPos, isEnemy = false) {
  const color = isEnemy ? 0xff0000 : 0xffffaa;
  const dir = endPos.subtract(startPos);
  const dist = dir.length();

  if (dist < 0.1) return;

  const len = Math.min(dist, 4.0);
  const mat = new StandardMaterial("tracerMat", scene);
  mat.emissiveColor = hexToColor3(color);
  mat.disableLighting = true;
  mat.alpha = 0.8;
  mat.alphaMode = BABYLON.Constants.ALPHA_ADD;
  mat.disableDepthWrite = true;

  const mesh = MeshBuilder.CreateCylinder("tracer", { diameterTop: 0.024, diameterBottom: 0.024, height: len, tessellation: 4 }, scene);
  mesh.material = mat;

  // Position at start, look toward end
  const midPoint = Vector3.Lerp(startPos, endPos, len / (2 * dist));
  mesh.position = midPoint;
  mesh.lookAt(endPos);
  // Cylinder is Y-up by default in BJS, rotate to align with lookAt direction
  mesh.rotation.x += Math.PI / 2;

  STATE.tracers.push({ mesh, mat, life: 0.05 });
}

export function spawnShellCasing(scene, pos, dir, isShotgun = false) {
  const isRed = isShotgun;
  const radius = isShotgun ? 0.012 : 0.008;
  const length = isShotgun ? 0.050 : 0.035;

  const mat = new StandardMaterial("shellMat", scene);
  mat.diffuseColor = hexToColor3(isRed ? 0xaa0000 : 0xd4af37);
  mat.specularPower = isRed ? 10 : 80;

  const mesh = MeshBuilder.CreateCylinder("shell", { diameter: radius * 2, height: length, tessellation: 6 }, scene);
  mesh.material = mat;
  mesh.position = pos.clone();
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

  const rightDir = Vector3.Cross(dir, new Vector3(0, 1, 0)).normalize();
  const upDir = new Vector3(0, 1, 0);

  const vel = new Vector3(0, 0, 0);
  vel.addInPlace(rightDir.scale(1.0 + Math.random() * 2.0));
  vel.addInPlace(upDir.scale(1.5 + Math.random() * 2.0));
  vel.addInPlace(dir.scale(-1.0 + Math.random() * 2.0));

  STATE.shells.push({
    mesh, vel,
    rotVel: new Vector3((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20),
    life: 3.0
  });
}

export function addSpark(scene, pos, normal) {
  const count = 3 + Math.floor(Math.random() * 4);
  for (let idx = 0; idx < count; idx++) {
    const mat = new StandardMaterial("sparkMat", scene);
    mat.emissiveColor = hexToColor3(0xffaa00);
    mat.disableLighting = true;
    mat.alpha = 1.0;
    mat.alphaMode = BABYLON.Constants.ALPHA_ADD;

    const mesh = MeshBuilder.CreateBox("spark", { size: 0.02 }, scene);
    mesh.material = mat;
    mesh.position = pos.clone();

    const vel = new Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5)
      .normalize()
      .add(normal)
      .normalize()
      .scale(3 + Math.random()*5);

    STATE.sparks.push({ mesh, mat, vel, life: 0.2 + Math.random() * 0.2 });
  }
}

export function updateCombatEffects(scene, dt) {
  for (let i = STATE.tracers.length - 1; i >= 0; i--) {
    const t = STATE.tracers[i];
    t.life -= dt;
    if (t.life <= 0) {
      t.mesh.dispose();
      STATE.tracers.splice(i, 1);
    } else {
      t.mat.alpha = t.life / 0.05;
    }
  }

  for (let i = STATE.shells.length - 1; i >= 0; i--) {
    const s = STATE.shells[i];
    s.life -= dt;
    if (s.life <= 0) {
      s.mesh.dispose();
      STATE.shells.splice(i, 1);
      continue;
    }

    s.vel.y -= STATE.gravity * 0.5 * dt;
    s.mesh.position.addInPlace(s.vel.scale(dt));

    if (s.mesh.position.y < 0.05) {
      s.mesh.position.y = 0.05;
      s.vel.y = Math.abs(s.vel.y) * 0.3;
      s.vel.x *= 0.7;
      s.vel.z *= 0.7;
      s.rotVel.scaleInPlace(0.6);
    } else {
      s.mesh.rotation.x += s.rotVel.x * dt;
      s.mesh.rotation.y += s.rotVel.y * dt;
      s.mesh.rotation.z += s.rotVel.z * dt;
    }
  }

  for (let i = STATE.sparks.length - 1; i >= 0; i--) {
    const sp = STATE.sparks[i];
    sp.life -= dt;
    if (sp.life <= 0) {
      sp.mesh.dispose();
      STATE.sparks.splice(i, 1);
    } else {
      sp.vel.y -= STATE.gravity * dt;
      sp.mesh.position.addInPlace(sp.vel.scale(dt));
      sp.mat.alpha = sp.life / 0.3;
    }
  }

  // ── Dynamic lights (pooled — reuse instead of create/destroy) ──
  for (let i = STATE.dynamicLights.length - 1; i >= 0; i--) {
    const dl = STATE.dynamicLights[i];
    dl.elapsed += dt;
    if (dl.elapsed >= dl.duration) {
      dl.light.setEnabled(false);
      dl.light.intensity = 0;
      dl.active = false;
      STATE.dynamicLights.splice(i, 1);
    } else {
      dl.light.intensity = dl.maxIntensity * (1 - dl.elapsed / dl.duration);
    }
  }
}

/**
 * Spawn a temporary point light for combat effects.
 * Uses a pool of 8 reusable lights to avoid per-shot allocation.
 */
const _lightPool = [];
const _LIGHT_POOL_SIZE = 8;

function _getPooledLight(scene) {
  // Try to find an inactive pooled light
  for (const entry of _lightPool) {
    if (!entry.active) {
      entry.active = true;
      entry.light.setEnabled(true);
      return entry;
    }
  }
  // Pool full? Steal the oldest active light
  if (_lightPool.length >= _LIGHT_POOL_SIZE) {
    const oldest = _lightPool.reduce((a, b) => a.elapsed > b.elapsed ? a : b);
    oldest.active = true;
    oldest.light.setEnabled(true);
    return oldest;
  }
  // Create a new pooled light
  const light = new PointLight("pooledLight_" + _lightPool.length, Vector3.Zero(), scene);
  light.diffuse = new Color3(1, 1, 1);
  light.intensity = 0;
  light.range = 10;
  const entry = { light, active: false, elapsed: 0, duration: 0, maxIntensity: 0 };
  _lightPool.push(entry);
  entry.active = true;
  entry.light.setEnabled(true);
  return entry;
}

export function addDynamicLight(scene, pos, color, intensity, radius, duration) {
  const entry = _getPooledLight(scene);
  entry.light.diffuse = hexToColor3(color);
  entry.light.intensity = intensity;
  entry.light.range = radius;
  entry.light.position = new Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
  entry.maxIntensity = intensity;
  entry.duration = duration;
  entry.elapsed = 0;
}

export function updateCorpses(scene, dt) {
  for (let i = STATE.corpses.length - 1; i >= 0; i--) {
    const c = STATE.corpses[i];
    c.deathTime -= dt;
    if (c.deathTime <= 0) { c.mesh.dispose(); STATE.corpses.splice(i, 1); continue; }

    c.vy = (c.vy || 0) - STATE.gravity * dt;
    c.mesh.position.x += (c.vx || 0) * dt;
    c.mesh.position.y += c.vy * dt;
    c.mesh.position.z += (c.vz || 0) * dt;
    c.mesh.rotation.x += (c.rx || 0) * dt;
    c.mesh.rotation.y += (c.ry || 0) * dt;
    c.mesh.rotation.z += (c.rz || 0) * dt;

    if (c.mesh.position.y < 0.1) {
      c.mesh.position.y = 0.1;
      c.vy = 0;
      c.vx = (c.vx || 0) * 0.5;
      c.vz = (c.vz || 0) * 0.5;
    }
  }
}

export function updateDustParticles(dustPositions, dustVelocities, dustGeo, MAP_W, MAP_H, dt = 0.016) {
  const arr = dustPositions;
  for (let i = 0; i < dustVelocities.length; i++) {
    const v = dustVelocities[i];
    arr[i * 3]     += v.vx * dt;
    arr[i * 3 + 1] += v.vy * dt;
    arr[i * 3 + 2] += v.vz * dt;
    if (arr[i * 3]     < 0)     { arr[i * 3]     = MAP_W; }
    if (arr[i * 3]     > MAP_W) { arr[i * 3]     = 0; }
    if (arr[i * 3 + 1] > 3)    { arr[i * 3 + 1] = 0; }
    if (arr[i * 3 + 2] < 0)     { arr[i * 3 + 2] = MAP_H; }
    if (arr[i * 3 + 2] > MAP_H) { arr[i * 3 + 2] = 0; }
  }
  dustGeo.updateVerticesData(BABYLON.VertexBuffer.PositionKind, arr);
}

// ── Damage Numbers ──
export function addDamageNumber(scene, x, y, z, damage, isHeadshot) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = isHeadshot ? '#ffff00' : '#ff4444';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(damage).toString(), 32, 24);

  const tex = new BABYLON.DynamicTexture("dmgTex", { width: 64, height: 32 }, scene, false);
  const texCtx = tex.getContext();
  texCtx.drawImage(canvas, 0, 0);
  tex.update();

  const mat = new StandardMaterial("dmgMat", scene);
  mat.diffuseTexture = tex;
  mat.emissiveTexture = tex;
  mat.disableLighting = true;
  mat.alpha = 1.0;
  mat.useAlphaFromDiffuseTexture = true;
  mat.disableDepthWrite = true;

  const plane = MeshBuilder.CreatePlane("dmgNum", { width: 0.4, height: 0.2 }, scene);
  plane.material = mat;
  plane.position.set(x + (Math.random() - 0.5) * 0.3, y + 1.8, z + (Math.random() - 0.5) * 0.3);
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  plane.renderingGroupId = 3;

  STATE.damageNumbers.push({ sprite: plane, life: 1.0, vy: 1.5 });
}

export function updateDamageNumbers(scene, dt) {
  for (let i = STATE.damageNumbers.length - 1; i >= 0; i--) {
    const d = STATE.damageNumbers[i];
    d.life -= dt;
    d.sprite.position.y += d.vy * dt;
    d.sprite.material.alpha = d.life;
    if (d.life <= 0) { d.sprite.dispose(); STATE.damageNumbers.splice(i, 1); }
  }
}


// ── Physics Barrel Update ─────────────────────────────────────────────────
// explosionCb is triggerBarrelExplosion from weapons.js, passed in by main.js
let _barrelExplosionCb = null;
export function setBarrelExplosionCb(cb) { _barrelExplosionCb = cb; }

export function updatePhysicsBarrels(scene, dt) {
  if (typeof window === 'undefined' || !window._activeChunks) return;
  for (const [id, chunk] of window._activeChunks.entries()) {
    if (!chunk.metadata || !chunk.metadata.barrels) continue;
    for (const b of chunk.metadata.barrels) {
      if (b.hasExploded || b.grounded) continue;

      // Gravity
      b.vy -= STATE.gravity * dt;

      const nx = b.x + b.vx * dt;
      const nz = b.z + b.vz * dt;
      const ny = b.mesh.position.y + b.vy * dt;
      const baseY = (b.mesh.metadata && b.mesh.metadata.baseY) || 0.45;

      // Wall/floor hit detection (simple bounds + floor)
      const MAP_W = 10000, MAP_H = 10000;
      const wallHit = nx <= 0.6 || nx >= MAP_W - 0.6 || nz <= 0.6 || nz >= MAP_H - 0.6;
      const floorHit = ny <= baseY;

      if (floorHit || wallHit) {
        const hardImpact = Math.abs(b.vy) > 5 || (wallHit && (Math.abs(b.vx) + Math.abs(b.vz) > 8));
        if (hardImpact && _barrelExplosionCb && !b.hasExploded) {
          _barrelExplosionCb(b.mesh, scene);
          b.hasExploded = true;
          continue;
        }
        // Soft bounce
        b.mesh.position.y = baseY;
        b.vy = -b.vy * 0.3;
        b.vx *= 0.55; b.vz *= 0.55;
        if (Math.abs(b.vy) < 0.8 && Math.abs(b.vx) < 1 && Math.abs(b.vz) < 1) {
          b.grounded = true;
          b.vy = 0; b.vx = 0; b.vz = 0; b.spinning = false;
          b.x = Math.max(0.6, Math.min(MAP_W - 0.6, nx));
          b.z = Math.max(0.6, Math.min(MAP_H - 0.6, nz));
          b.mesh.position.x = b.x; b.mesh.position.z = b.z;
          continue;
        }
        if (wallHit) { b.vx *= -0.5; b.vz *= -0.5; }
      }

      // Update position
      const clampX = Math.max(0.6, Math.min(MAP_W - 0.6, nx));
      const clampZ = Math.max(0.6, Math.min(MAP_H - 0.6, nz));
      b.x = clampX; b.z = clampZ;
      b.mesh.position.x = clampX;
      b.mesh.position.y = Math.max(baseY, ny);
      b.mesh.position.z = clampZ;

      // Spin while airborne
      if (b.spinning) {
        b.mesh.rotation.x += (b._rx || 4) * dt;
        b.mesh.rotation.z += (b._rz || 4) * dt;
      }
    }
  }
}
