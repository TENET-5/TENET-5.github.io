import codecs

with codecs.open(r'E:\ABCXYZ.github.io\red-duster-game.html', 'r', 'utf-8') as f:
    text = f.read()

target = """function buildSoldier(type) {
  const g = new THREE.Group();
  const s = type === 'heavy' ? 1.2 : type === 'ranger' ? 0.9 : 1.0;
  const camoMat = new THREE.MeshStandardMaterial({
    map: type === 'heavy' ? cadpatDarkTex : type === 'ranger' ? rangerCamoTex : cadpatTex,
    roughness: 0.85
  });
  // Boots
  [-0.12, 0.12].forEach(lx => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.16*s, 0.22, 0.22*s), eBootMat);
    b.position.set(lx*s, 0.11, 0); b.castShadow = true; g.add(b);
  });
  // Legs (CADPAT pants)
  [-0.12, 0.12].forEach(lx => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.16*s, 0.5*s, 0.18*s), camoMat);
    l.position.set(lx*s, 0.47*s, 0); l.castShadow = true; g.add(l);
  });
  // Belt
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.46*s, 0.06, 0.22*s), eBeltMat);
  belt.position.set(0, 0.72*s, 0); g.add(belt);
  // Torso (CADPAT jacket)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44*s, 0.55*s, 0.28*s), camoMat);
  torso.position.set(0, 1.02*s, 0); torso.castShadow = true; g.add(torso);
  // Tac vest (grunt + heavy)
  if (type !== 'ranger') {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.48*s, 0.35*s, 0.32*s), eVestMat);
    vest.position.set(0, 1.05*s, 0); g.add(vest);
  }
  // Epaulettes
  [-0.28, 0.28].forEach(ex => {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.1*s, 0.05, 0.16*s), camoMat);
    ep.position.set(ex*s, 1.28*s, 0); g.add(ep);
  });
  // Arms (CADPAT sleeves)
  [-0.3, 0.3].forEach(ax => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.13*s, 0.5*s, 0.13*s), camoMat);
    arm.position.set(ax*s, 0.9*s, 0); arm.castShadow = true; g.add(arm);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1*s, 0.12, 0.1*s), eSkinMat);
    hand.position.set(ax*s, 0.6*s, 0); g.add(hand);
  });
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07*s, 0.08*s, 0.1, 8), eSkinMat);
  neck.position.set(0, 1.33*s, 0); g.add(neck);
  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22*s, 0.24*s, 0.22*s), eSkinMat);
  head.position.set(0, 1.52*s, 0); head.castShadow = true; g.add(head);
  // Eyes
  [-0.055, 0.055].forEach(ex => {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.025*s, 6, 4), eEyeW);
    w.position.set(ex*s, 1.54*s, 0.11*s); g.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.015*s, 4, 4), type === 'heavy' ? eEyeR : eEyeB);
    p.position.set(ex*s, 1.54*s, 0.13*s); g.add(p);
  });
  // Helmet
  const hel = new THREE.Mesh(new THREE.SphereGeometry(0.16*s, 10, 6, 0, Math.PI*2, 0, Math.PI*0.55), eHelmetMat);
  hel.position.set(0, 1.62*s, 0); hel.castShadow = true; g.add(hel);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.17*s, 0.18*s, 0.03, 10), eHelmetMat);
  brim.position.set(0, 1.55*s, 0); g.add(brim);
  // Heavy: shoulder armor plates
  if (type === 'heavy') {
    [-0.32, 0.32].forEach(sx => {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.2), eVestMat);
      plate.position.set(sx*s, 1.22*s, 0); g.add(plate);
    });
  }
  // Ranger: carried rifle
  if (type === 'ranger') {
    const rifle = new THREE.Group();
    const rb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
    const rs = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x553311 }));
    rs.position.z = 0.3; rifle.add(rb, rs);
    rifle.position.set(0.25*s, 0.85*s, 0.15); rifle.rotation.x = -0.2;
    g.add(rifle);
  }
  return g;
}

function spawnEnemy(type = 'grunt') {
  const stats = {
    grunt:  { hp: 100, speed: 2.5, damage: 15, score: 10, ranged: false, scale: 1.0 },
    heavy:  { hp: 300, speed: 1.5, damage: 25, score: 30, ranged: false, scale: 1.2 },
    ranger: { hp: 80,  speed: 2.2, damage: 10, score: 20, ranged: true,  scale: 0.9 }
  };
  const data = stats[type];
  const mesh = buildSoldier(type);
  let sx, sz;
  do {
    sx = Math.random() * (MAP_W - 4) + 2;
    sz = Math.random() * (MAP_H - 4) + 2;
  } while (isColliding(sx, sz, 0.5) || distXZ(sx, sz, yawObj.position.x, yawObj.position.z) < 8);
  mesh.position.set(sx, 0, sz);
  scene.add(mesh);
  STATE.enemies.push({
    mesh, type, hp: data.hp, maxHp: data.hp, speed: data.speed, damage: data.damage, score: data.score,
    x: sx, z: sz, baseScale: data.scale, ranged: data.ranged, shootCooldown: 0, dead: false, deathTime: 0
  });
}

function updateEnemies(dt) {
  const playerX = yawObj.position.x;
  const playerZ = yawObj.position.z;
  const now = performance.now();

  for (let i = STATE.enemies.length - 1; i >= 0; i--) {
    const e = STATE.enemies[i];

    if (e.dead) {
      e.deathTime -= dt;
      // Collapse sideways and sink
      e.mesh.rotation.z = Math.min(Math.PI / 2, e.mesh.rotation.z + dt * 4);
      e.mesh.position.y = Math.max(-0.5, e.mesh.position.y - dt * 0.8);
      if (e.deathTime <= 0) {
        scene.remove(e.mesh);
        STATE.enemies.splice(i, 1);
      }
      continue;
    }

    const dx = playerX - e.x;
    const dz = playerZ - e.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Face the player
    e.mesh.rotation.y = Math.atan2(dx, dz);

    if (e.ranged && dist > 3 && dist < 15) {
      e.shootCooldown -= dt;
      if (e.shootCooldown <= 0) {
        shootProjectile(e.x, e.z, playerX, playerZ);
        e.shootCooldown = 2 + Math.random();
      }
    }

    const stopDist = e.ranged ? 6 : 1.2;
    let isMoving = false;
    if (dist > stopDist) {
      const moveX = (dx / dist) * e.speed * dt;
      const moveZ = (dz / dist) * e.speed * dt;
      const newX = e.x + moveX;
      const newZ = e.z + moveZ;
      if (!isColliding(newX, newZ, 0.4)) {
        e.x = newX;
        e.z = newZ;
        e.mesh.position.x = e.x;
        e.mesh.position.z = e.z;
        isMoving = true;
      }
    } else if (!e.ranged && dist < 1.5) {
      damagePlayer(e.damage * dt);
    }

    // Walk bob
    if (isMoving) {
      e.mesh.position.y = Math.sin(now * 0.008 * e.speed) * 0.06;
    } else {
      e.mesh.position.y = 0;
    }
  }
}"""


replacement = """function buildSoldier(type) {
  const g = new THREE.Group();
  g.userData.limbs = {};
  const s = type === 'heavy' ? 1.2 : type === 'ranger' ? 0.9 : 1.0;
  const camoMat = new THREE.MeshStandardMaterial({
    map: type === 'heavy' ? cadpatDarkTex : type === 'ranger' ? rangerCamoTex : cadpatTex,
    roughness: 0.85
  });
  // Boots
  [-0.12, 0.12].forEach(lx => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.16*s, 0.22, 0.22*s), eBootMat);
    b.position.set(lx*s, 0.11, 0); b.castShadow = true; g.add(b);
  });
  // Legs (CADPAT pants) // PIVOT AT HIP NOW
  [-0.12, 0.12].forEach(lx => {
    const legGeo = new THREE.BoxGeometry(0.16*s, 0.5*s, 0.18*s);
    legGeo.translate(0, -0.25*s, 0); 
    const l = new THREE.Mesh(legGeo, camoMat);
    l.position.set(lx*s, 0.72*s, 0); l.castShadow = true; 
    l.name = lx < 0 ? 'lLeg' : 'rLeg'; g.userData.limbs[l.name] = l;
    g.add(l);
  });
  // Belt
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.46*s, 0.06, 0.22*s), eBeltMat);
  belt.position.set(0, 0.72*s, 0); g.add(belt);
  // Torso (CADPAT jacket)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44*s, 0.55*s, 0.28*s), camoMat);
  torso.position.set(0, 1.02*s, 0); torso.castShadow = true; g.add(torso);
  // Tac vest (grunt + heavy)
  if (type !== 'ranger') {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.48*s, 0.35*s, 0.32*s), eVestMat);
    vest.position.set(0, 1.05*s, 0); g.add(vest);
  }
  // Epaulettes
  [-0.28, 0.28].forEach(ex => {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.1*s, 0.05, 0.16*s), camoMat);
    ep.position.set(ex*s, 1.28*s, 0); g.add(ep);
  });
  // Arms (CADPAT sleeves) PIVOT AT SHOULDER
  [-0.3, 0.3].forEach(ax => {
    const armGeo = new THREE.BoxGeometry(0.13*s, 0.5*s, 0.13*s);
    armGeo.translate(0, -0.25*s, 0);
    const arm = new THREE.Mesh(armGeo, camoMat);
    arm.position.set(ax*s, 1.15*s, 0); arm.castShadow = true; 
    arm.name = ax < 0 ? 'lArm' : 'rArm'; g.userData.limbs[arm.name] = arm;
    g.add(arm);
    
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1*s, 0.12, 0.1*s), eSkinMat);
    hand.position.set(0, -0.55*s, 0); 
    hand.name = ax < 0 ? 'lHand' : 'rHand'; g.userData.limbs[hand.name] = hand;
    arm.add(hand);
  });
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07*s, 0.08*s, 0.1, 8), eSkinMat);
  neck.position.set(0, 1.33*s, 0); g.add(neck);
  
  // Head
  const headTexLoader = new THREE.TextureLoader();
  const commieFaceTex = headTexLoader.load('img/red-duster/rd_enemy_commie_2.png');
  const cfnisFaceTex = headTexLoader.load('img/red-duster/rd_enemy_cfnis_2.png');
  const faceMap = type === 'heavy' ? cfnisFaceTex : commieFaceTex;
  const faceMat = new THREE.MeshStandardMaterial({ map: faceMap, roughness: 0.6 });
  const headMats = [eSkinMat, eSkinMat, eSkinMat, eSkinMat, faceMat, eSkinMat];
  
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22*s, 0.24*s, 0.22*s), headMats);
  head.position.set(0, 1.52*s, 0); head.castShadow = true; g.add(head);
  g.userData.limbs['head'] = head;
  
  // Helmet
  const hel = new THREE.Mesh(new THREE.SphereGeometry(0.16*s, 10, 6, 0, Math.PI*2, 0, Math.PI*0.55), eHelmetMat);
  hel.position.set(0, 1.62*s, 0); hel.castShadow = true; g.add(hel);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.17*s, 0.18*s, 0.03, 10), eHelmetMat);
  brim.position.set(0, 1.55*s, 0); g.add(brim);
  // Heavy: shoulder armor plates
  if (type === 'heavy') {
    [-0.32, 0.32].forEach(sx => {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.2), eVestMat);
      plate.position.set(sx*s, 1.22*s, 0); g.add(plate);
    });
  }
  // Ranger: carried rifle
  if (type === 'ranger') {
    const rifle = new THREE.Group();
    const rb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
    const rs = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x553311 }));
    rs.position.z = 0.3; rifle.add(rb, rs);
    rifle.position.set(0.15*s, -0.3*s, 0.2*s); rifle.rotation.x = -1.5;
    g.userData.limbs['rArm'].add(rifle);
  }
  return g;
}

function spawnEnemy(type = 'grunt') {
  const stats = {
    grunt:  { hp: 100, speed: 2.5, damage: 15, score: 10, ranged: false, scale: 1.0 },
    heavy:  { hp: 300, speed: 1.5, damage: 25, score: 30, ranged: false, scale: 1.2 },
    ranger: { hp: 80,  speed: 2.2, damage: 10, score: 20, ranged: true,  scale: 0.9 }
  };
  const data = stats[type];
  const mesh = buildSoldier(type);
  let sx, sz;
  do {
    sx = Math.random() * (MAP_W - 4) + 2;
    sz = Math.random() * (MAP_H - 4) + 2;
  } while (isColliding(sx, sz, 0.5) || distXZ(sx, sz, yawObj.position.x, yawObj.position.z) < 8);
  mesh.position.set(sx, 0, sz);
  scene.add(mesh);
  STATE.enemies.push({
    mesh, type, hp: data.hp, maxHp: data.hp, speed: data.speed, damage: data.damage, score: data.score,
    x: sx, z: sz, baseScale: data.scale, ranged: data.ranged, shootCooldown: 0, dead: false, deathTime: 0
  });
}

function updateEnemies(dt) {
  const playerX = yawObj.position.x;
  const playerZ = yawObj.position.z;
  const now = performance.now();

  for (let i = STATE.enemies.length - 1; i >= 0; i--) {
    const e = STATE.enemies[i];

    if (e.dead) {
      e.deathTime -= dt;
      // Collapse backward and rigid
      e.mesh.rotation.x = Math.max(-Math.PI / 2, e.mesh.rotation.x - dt * 4);
      e.mesh.position.y = Math.max(-0.5, e.mesh.position.y - dt * 1.5);
      if (e.deathTime <= 0) {
        scene.remove(e.mesh);
        STATE.enemies.splice(i, 1);
      }
      continue;
    }

    const dx = playerX - e.x;
    const dz = playerZ - e.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Face the player
    e.mesh.rotation.y = Math.atan2(dx, dz);

    if (e.ranged && dist > 3 && dist < 15) {
      e.shootCooldown -= dt;
      if (e.shootCooldown <= 0) {
        shootProjectile(e.x, e.z, playerX, playerZ);
        e.shootCooldown = 2 + Math.random();
        // Attack anim point
        if(e.mesh.userData.limbs && e.mesh.userData.limbs.rArm) e.mesh.userData.limbs.rArm.rotation.x = -Math.PI / 2.5;
      }
    }

    const stopDist = e.ranged ? 6 : 1.2;
    let isMoving = false;
    if (dist > stopDist) {
      const moveX = (dx / dist) * e.speed * dt;
      const moveZ = (dz / dist) * e.speed * dt;
      const newX = e.x + moveX;
      const newZ = e.z + moveZ;
      if (!isColliding(newX, newZ, 0.4)) {
        e.x = newX;
        e.z = newZ;
        e.mesh.position.x = e.x;
        e.mesh.position.z = e.z;
        isMoving = true;
      }
    } else if (!e.ranged && dist < 1.5) {
      damagePlayer(e.damage * dt);
      if(e.mesh.userData.limbs && e.mesh.userData.limbs.rArm) e.mesh.userData.limbs.rArm.rotation.x = -Math.PI / 2.5;
    }

    // Walk bob & 3D Limb Kinematics
    if (isMoving) {
      const swing = Math.sin(now * 0.012 * e.speed);
      e.mesh.position.y = Math.abs(swing) * 0.08;
      const limbs = e.mesh.userData.limbs;
      const armLerp = e.ranged && dist > 3 && dist < 15 ? 0.05 : 0.3;
      if (limbs) {
        if(limbs.lArm) limbs.lArm.rotation.x += (swing * 0.8 - limbs.lArm.rotation.x) * armLerp;
        if(limbs.rArm) limbs.rArm.rotation.x += (-swing * 0.8 - limbs.rArm.rotation.x) * armLerp;
        if(limbs.lLeg) limbs.lLeg.rotation.x = -swing * 0.6;
        if(limbs.rLeg) limbs.rLeg.rotation.x = swing * 0.6;
        if(limbs.head) limbs.head.rotation.y = Math.sin(now * 0.005 * e.speed) * 0.2;
      }
    } else {
      e.mesh.position.y = 0;
      const limbs = e.mesh.userData.limbs;
      if (limbs) {
        if(limbs.lArm) limbs.lArm.rotation.x *= 0.8;
        if(limbs.rArm) limbs.rArm.rotation.x *= 0.8;
        if(limbs.lLeg) limbs.lLeg.rotation.x *= 0.8;
        if(limbs.rLeg) limbs.rLeg.rotation.x *= 0.8;
      }
    }
  }
}"""

old_code = text.replace('\\r\\n', '\\n')
target = target.replace('\\r\\n', '\\n')
replacement = replacement.replace('\\r\\n', '\\n')

if target in old_code:
    new_code = old_code.replace(target, replacement)
    with codecs.open(r'E:\ABCXYZ.github.io\red-duster-game.html', 'w', 'utf-8') as f:
        f.write(new_code)
    print('UPDATE SUCCESSFUL')
else:
    print('TARGET NOT FOUND')
    
    # Let's print out the start and end of target to help debug
    print("TARGET STARTS WITH:", repr(target[:100]))
    print("CODE STARTS WITH:", repr(old_code[old_code.find('function buildSoldier(type)'):old_code.find('function buildSoldier(type)')+100]))
