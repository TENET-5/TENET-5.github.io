import re
import codecs

with codecs.open(r'E:\ABCXYZ.github.io\red-duster-game.html', 'r', 'utf-8') as f:
    text = f.read()

# 1. Update WEAPONS object
weapons_replacement = """const WEAPONS = {
  rifle: { name: 'ASSAULT RIFLE', mag: 30, damage: 25, fireRate: 100, reloadTime: 1500, spread: 0.01, pellets: 1, color: 0x333333 },
  shotgun: { name: 'SHOTGUN', mag: 8, damage: 15, fireRate: 600, reloadTime: 2000, spread: 0.08, pellets: 6, color: 0x664422 },
  pistol: { name: 'PISTOL', mag: 12, damage: 18, fireRate: 200, reloadTime: 1000, spread: 0.015, pellets: 1, color: 0x223344 },
  sniper: { name: 'SNIPER RIFLE', mag: 5, damage: 150, fireRate: 1200, reloadTime: 2500, spread: 0.002, pellets: 1, color: 0x2a2a2a },
  lmg: { name: 'LIGHT MG', mag: 100, damage: 18, fireRate: 70, reloadTime: 3500, spread: 0.025, pellets: 1, color: 0x444433 },
  flamethrower: { name: 'FLAMETHROWER', mag: 250, damage: 6, fireRate: 50, reloadTime: 4000, spread: 0.25, pellets: 1, color: 0xff4400 },
  chainsaw: { name: 'CHAINSAW', mag: 999, damage: 35, fireRate: 80, reloadTime: 100, spread: 0.1, pellets: 1, color: 0xaa1111 }
};"""
text = re.sub(r'const WEAPONS = \{.*?\n\};', weapons_replacement, text, flags=re.DOTALL)


# 2. Add Flamethrower / Chainsaw bindings
keybinds_replacement = """  if (e.key === '1') switchWeapon('rifle');
  if (e.key === '2') switchWeapon('shotgun');
  if (e.key === '3') switchWeapon('pistol');
  if (e.key === '4') switchWeapon('sniper');
  if (e.key === '5') switchWeapon('lmg');
  if (e.key === '6') switchWeapon('flamethrower');
  if (e.key === '7') switchWeapon('chainsaw');"""
text = re.sub(r'if \(e\.key === \'1\'\).*?if \(e\.key === \'5\'\) switchWeapon\(\'lmg\'\);', keybinds_replacement, text, flags=re.DOTALL)


# 3. Update SHOOT logic for Flamethrower and Chainsaw
shoot_code_addition = """
    // ── HEAVY ARSENAL OVERRIDES ──
    if (STATE.weapon === 'flamethrower') {
      const fFire = new THREE.PointLight(0xff6600, 2, 8);
      const startP = yawObj.position.clone();
      fFire.position.copy(startP);
      scene.add(fFire);
      
      const fMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshBasicMaterial({color: 0xff4400, transparent: true, opacity: 0.8}));
      fMesh.position.copy(startP);
      scene.add(fMesh);
      
      const fireDir = dir.clone().multiplyScalar(20);
      STATE.particles.push({ mesh: fMesh, light: fFire, vx: fireDir.x, vy: fireDir.y, vz: fireDir.z, life: 0.6, isFire: true });
      
      const hits = raycaster.intersectObjects(STATE.enemies.map(e => e.mesh), true);
      if (hits.length > 0 && hits[0].distance < 12) {
        const hitObj = hits[0].object;
        const enemy = STATE.enemies.find(e => {
          let p = hitObj;
          while (p) { if (p === e.mesh) return true; p = p.parent; }
          return false;
        });
        if (enemy && !enemy.dead) {
          enemy.hp -= w.damage;
          enemy.onFire = true;
          addParticle(enemy.x, 1.5, enemy.z, 0xff3300);
          if (enemy.hp <= 0) killEnemy(enemy, false, dir.clone());
        }
      }
      continue;
    }
    
    if (STATE.weapon === 'chainsaw') {
      yawObj.position.x += (Math.random()-0.5)*0.03;
      yawObj.position.z += (Math.random()-0.5)*0.03;
      const hits = raycaster.intersectObjects(STATE.enemies.map(e => e.mesh), true);
      if (hits.length > 0 && hits[0].distance < 3.0) {
        const enemy = STATE.enemies.find(e => {
          let p = hits[0].object;
          while (p) { if (p === e.mesh) return true; p = p.parent; }
          return false;
        });
        if (enemy && !enemy.dead) {
          enemy.hp -= w.damage;
          playSound('hit');
          for(let i=0; i<15; i++) addParticle(enemy.x, 1.3, enemy.z, 0xaa0000);
          document.getElementById('dmgFlash').style.background = 'radial-gradient(ellipse, transparent 20%, rgba(150,0,0,0.8))';
          document.getElementById('dmgFlash').style.opacity = '1';
          setTimeout(()=> document.getElementById('dmgFlash').style.opacity=0, 50);
          if (enemy.hp <= 0) killEnemy(enemy, true, dir.clone().multiplyScalar(3));
        }
      }
      continue;
    }
"""

text = text.replace('raycaster.set(yawObj.position, dir);', 'raycaster.set(yawObj.position, dir);' + shoot_code_addition)


# 4. Update killEnemy to spawn explicit Limbs for True Ragdoll
kill_enemy = """function killEnemy(enemy, headshot = false, hitDir = null) {
  if (enemy.dead) return;
  const scoreAdd = enemy.score * (headshot ? 3 : 1) * Math.max(1, STATE.combo);
  STATE.score += scoreAdd;
  STATE.kills++;

  const now = performance.now();
  if (now - STATE.lastKillTime < 2000) {
    STATE.combo = Math.min(STATE.combo + 1, 4);
  } else {
    STATE.combo = 1;
  }
  STATE.lastKillTime = now;
  STATE.comboTimer = 2;

  enemy.dead = true;
  
  // BLOOD SPLAT
  for (let i = 0; i < 30; i++) {
    addParticle(enemy.x, 1.2, enemy.z, 0x880000);
  }
  
  // ── TRUE KINEMATIC RAGDOLL ──
  const baseDir = hitDir ? hitDir.normalize() : new THREE.Vector3((Math.random()-0.5), 0, -1).normalize();
  
  if (enemy.mesh && enemy.mesh.userData && enemy.mesh.userData.limbs) {
    Object.values(enemy.mesh.userData.limbs).forEach(limb => {
      // Detach limb while keeping world transform
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      limb.getWorldPosition(worldPos);
      limb.getWorldQuaternion(worldQuat);
      
      scene.add(limb);
      limb.position.copy(worldPos);
      limb.quaternion.copy(worldQuat);
      
      // Calculate dynamic kinetic force
      const upwardForce = Math.random() * 6 + 2; // Throw them up slightly
      const backForce = headshot ? 8 : 4;
      const throwVel = new THREE.Vector3(
        baseDir.x * backForce + (Math.random()-0.5)*4,
        upwardForce,
        baseDir.z * backForce + (Math.random()-0.5)*4
      );
      
      const rotVel = new THREE.Vector3(
        (Math.random()-0.5)*10,
        (Math.random()-0.5)*10,
        (Math.random()-0.5)*10
      );
      
      STATE.corpses.push({
        mesh: limb,
        vx: throwVel.x, vy: throwVel.y, vz: throwVel.z,
        rx: rotVel.x, ry: rotVel.y, rz: rotVel.z,
        life: 15.0 // Lay on ground for 15s instead of tumbling down immediately
      });
    });
  }
  
  // Improvised Dismemberment cleanup
  if (enemy.healthBar) scene.remove(enemy.healthBar);
  if (enemy.healthBarBg) scene.remove(enemy.healthBarBg);
  scene.remove(enemy.mesh);
}"""

# Replace the existing killEnemy
text = re.sub(r'function killEnemy\(enemy, headshot.*?\}\n', kill_enemy + '\n', text, flags=re.DOTALL)


# 5. Fix updateEnemies to instantly drop dead enemies since killEnemy removes the mesh
update_enemies_fix = """if (e.dead) {
      STATE.enemies.splice(i, 1);
      continue;
    }"""
text = re.sub(r'if \(e\.dead\) \{.*?continue;\n\s*\}', update_enemies_fix, text, flags=re.DOTALL)


# 6. Add updateCorpses function and call it in animate()
update_corpses_fn = """
function updateCorpses(dt) {
  for (let i = STATE.corpses.length - 1; i >= 0; i--) {
    const c = STATE.corpses[i];
    c.life -= dt;
    if (c.life <= 0) {
      scene.remove(c.mesh);
      STATE.corpses.splice(i, 1);
      continue;
    }
    
    // Apply gravity
    c.vy -= STATE.gravity * dt;
    
    // Apply velocity
    c.mesh.position.x += c.vx * dt;
    c.mesh.position.y += c.vy * dt;
    c.mesh.position.z += c.vz * dt;
    
    // Apply rotational velocity
    c.mesh.rotation.x += c.rx * dt;
    c.mesh.rotation.y += c.ry * dt;
    c.mesh.rotation.z += c.rz * dt;
    
    // Floor collision
    if (c.mesh.position.y < 0.1) {
      c.mesh.position.y = 0.1;
      c.vy = 0;
      c.vx *= 0.5; // Friction
      c.vz *= 0.5;
      c.rx *= 0.8;
      c.ry *= 0.8;
      c.rz *= 0.8;
    }
  }
}
"""
text = text.replace('function animate() {', update_corpses_fn + '\nfunction animate() {')
text = text.replace('updateParticles(dt);', 'updateParticles(dt);\n  updateCorpses(dt);')


with codecs.open(r'E:\ABCXYZ.github.io\red-duster-game.html', 'w', 'utf-8') as f:
    f.write(text)

print("PHASE 71 (RAGDOLLS & HEAVY ARSENAL) OVERRIDE COMPLETE")
