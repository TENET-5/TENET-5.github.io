// The Red Duster Bodycam & Squad Realism Simulator (Phase 21)
// Player: Bloggins (Insane Cold War Holdout)
// Setting: Sector 4 'New Ruskya' Compound

let camera, scene, renderer, controls, composer;
let objects = [];
let enemies = [];
const tracers = [];
let raycaster;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let leanLeft = false, leanRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Acoustics & Analytics
let audioCtx;
let playerHealth = 100;
let activeWeapon; 
let muzzleFlash;
let muzzlePointLight;
let isShooting = false;
let ammo = 30;
let fireRate = 120;
let lastFireTime = 0;
let isReloading = false;
let lastStepTime = 0;

// Phase 22 Visual Upgrades
const particles = [];
let chainGunBarrels;

// Phase 23 Wave Survival
let currentWave = 1;
const maxWaves = 3;
let kills = 0;
let enemiesLeft = 0;

function generateNoiseTexture(baseColor, noiseColors, scale=1) {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = baseColor; ctx.fillRect(0, 0, 512, 512);
    for (let i=0; i<40000; i++) {
        ctx.fillStyle = noiseColors[Math.floor(Math.random() * noiseColors.length)];
        ctx.fillRect(Math.random()*512, Math.random()*512, scale, scale);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; return tex;
}
let concTex, rustTex, gridTex;

// Bodycam Shader Definition
const BodycamShader = {
    uniforms: { "tDiffuse": { value: null }, "amount": { value: 0.9 }, "time": { value: 0.0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse; uniform float amount; uniform float time; varying vec2 vUv;
        void main() {
            vec2 c = vUv - 0.5; float distance = length(c);
            float distortion = 1.0 + distance * distance * amount; vec2 uv = c * distortion + 0.5;
            float r = texture2D(tDiffuse, uv + vec2(0.005 * distance, 0.0)).r;
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, uv - vec2(0.005 * distance, 0.0)).b;
            float vignette = smoothstep(1.3, 0.3, distance * 1.5);
            gl_FragColor = vec4(vec3(r, g, b) * vignette, 1.0);
        }
    `
};

let customPass;
let gameState = "INTRO"; // INTRO, ACQUIRE_WEAPON, COMBAT, KIA

const introDialogue = [
  { time: 1000, text: "COMMANDER: Attention, 7th Vanguard Brigade!" },
  { time: 3000, text: "COMMANDER: Total containment of Sector 4 is mandatory." },
  { time: 6000, text: "COMMANDER: We begin the liquidation of the civilian population at 0400 hours." },
  { time: 9000, text: "VANGUARD TROOPER: Hey! You! The guy with the Red Ensign!" },
  { time: 11000, text: "VANGUARD TROOPER: That flag is BANNED! Take that Duster down or you'll be liquidated too!" },
  { time: 14000, text: "BLOGGINS: *Flips them the middle finger*" },
  { time: 16000, text: "BLOGGINS: ...liquidation?" },
  { time: 18000, text: "BLOGGINS: THEY'RE LIQUIDATING THE TIM HORTONS?! NO!!" }
];

const combatQuotes = [
  "EAT LEAD, YOU COMMIE FUCKS!", "GET OFF MY LAWN!", "THE RED DUSTER NEVER SLEEPS!",
  "I'VE BEEN WAITING FOR THIS SINCE '89!", "QUACK QUACK, MOTHERFUCKERS!"
];

function playCombatAcoustic(type) {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    if(type === 'chain_gun') {
        osc.type = 'square';
        filter.type = 'lowpass'; filter.frequency.value = 800;
        osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        gain.gain.setValueAtTime(0.8, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'incoming_crack') {
        osc.type = 'sawtooth';
        filter.type = 'highpass'; filter.frequency.value = 2000;
        osc.frequency.setValueAtTime(4000, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'damage') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, now); osc.frequency.linearRampToValueAtTime(20, now + 0.3);
        gain.gain.setValueAtTime(1.0, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'headshot') {
        osc.type = 'triangle';
        filter.type = 'highpass'; filter.frequency.value = 1000;
        osc.frequency.setValueAtTime(3000, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(1.0, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'footstep') {
        osc.type = 'triangle';
        filter.type = 'lowpass'; filter.frequency.value = 150;
        osc.frequency.setValueAtTime(80, now); osc.frequency.exponentialRampToValueAtTime(20, now + 0.15);
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    }
}

function initFPS() {
    const container = document.getElementById('fps-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); 
    scene.fog = new THREE.FogExp2(0x000000, 0.06); 

    camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 80);

    const chestLight = new THREE.SpotLight(0xffffff, 5.0, 180, Math.PI/4, 0.5, 1);
    chestLight.castShadow = true; chestLight.shadow.mapSize.width = 1024; chestLight.shadow.mapSize.height = 1024;
    camera.add(chestLight); camera.add(chestLight.target); chestLight.target.position.set(0, 0, -1);
    scene.add(camera);

    controls = new THREE.PointerLockControls(camera, document.body);
    const blocker = document.getElementById('fps-instructions');
    blocker.addEventListener('click', () => { if(gameState !== "KIA") controls.lock(); });

    controls.addEventListener('lock', () => {
        blocker.style.display = 'none';
        if (gameState === "INTRO") startIntroSequence();
    });
    controls.addEventListener('unlock', () => { if(gameState !== "KIA") blocker.style.display = 'flex'; });
    scene.add(controls.getObject());

    const onKeyDown = (e) => {
        if (gameState !== "COMBAT") return;
        switch (e.code) {
            case 'ArrowUp': case 'KeyW': moveForward = true; break;
            case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
            case 'ArrowDown': case 'KeyS': moveBackward = true; break;
            case 'ArrowRight': case 'KeyD': moveRight = true; break;
            case 'KeyQ': leanLeft = true; break;
            case 'KeyE': leanRight = true; break;
            case 'KeyR': handleReload(); break;
        }
    };
    const onKeyUp = (e) => {
        if (gameState !== "COMBAT") return;
        switch (e.code) {
            case 'ArrowUp': case 'KeyW': moveForward = false; break;
            case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
            case 'ArrowDown': case 'KeyS': moveBackward = false; break;
            case 'ArrowRight': case 'KeyD': moveRight = false; break;
            case 'KeyQ': leanLeft = false; break;
            case 'KeyE': leanRight = false; break;
        }
    };

    document.addEventListener('keydown', onKeyDown); document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousedown', () => { isShooting = true; }); document.addEventListener('mouseup', () => { isShooting = false; });
    raycaster = new THREE.Raycaster();

    concTex = generateNoiseTexture('#1a1a1a', ['#111','#222','#0a0a0a'], 2); concTex.repeat.set(10, 10);
    rustTex = generateNoiseTexture('#332222', ['#442222','#221111','#553311'], 1); rustTex.repeat.set(2, 2);
    gridTex = generateNoiseTexture('#050505', ['#220000','#110000','#330000'], 4); gridTex.repeat.set(20, 20);

    buildSector4Compound();
    createC7Rifle();
    // Do not spawn enemies here, handled by INTRO -> COMBAT state

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio); renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    customPass = new THREE.ShaderPass(BodycamShader);
    customPass.renderToScreen = true; composer.addPass(customPass);

    window.addEventListener('resize', onWindowResize);
    setInterval(() => { const ts = document.getElementById('bc-timestamp'); if(ts) ts.innerText = new Date().toLocaleString() + ' EST'; }, 1000);

    animate();
}

function buildSector4Compound() {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(500, 500, 50, 50); floorGeo.rotateX(-Math.PI / 2);
    let pos = floorGeo.attributes.position; for (let i = 0; i < pos.count; i++) { pos.setY(i, Math.random() * 0.4); } 
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: gridTex, wireframe: false, roughness: 0.9 }));
    floor.receiveShadow = true; scene.add(floor);

    // Perimeter Walls
    const wallGeo = new THREE.BoxGeometry(300, 40, 10);
    const wallMat = new THREE.MeshStandardMaterial({ map: concTex, roughness: 1.0 });
    const w1 = new THREE.Mesh(wallGeo, wallMat); w1.position.set(0, 20, -150); w1.receiveShadow = true; scene.add(w1); objects.push(w1);
    const w2 = new THREE.Mesh(wallGeo, wallMat); w2.position.set(0, 20, 150); w2.receiveShadow = true; scene.add(w2); objects.push(w2);
    const w3 = new THREE.Mesh(wallGeo, wallMat); w3.position.set(-150, 20, 0); w3.rotation.y = Math.PI/2; w3.receiveShadow = true; scene.add(w3); objects.push(w3);
    const w4 = new THREE.Mesh(wallGeo, wallMat); w4.position.set(150, 20, 0); w4.rotation.y = Math.PI/2; w4.receiveShadow = true; scene.add(w4); objects.push(w4);

    // Shipping Containers for Cover
    for(let i=0; i<15; i++) {
        const cGeo = new THREE.BoxGeometry(10, 10, 25);
        const cMat = new THREE.MeshStandardMaterial({ map: rustTex, roughness: 0.8 });
        const container = new THREE.Mesh(cGeo, cMat); container.castShadow = true; container.receiveShadow = true;
        container.position.set((Math.random() - 0.5) * 200, 5, (Math.random() - 0.5) * 200);
        container.rotation.y = Math.random() * Math.PI;
        scene.add(container); objects.push(container);
    }

    const podium = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 10), new THREE.MeshStandardMaterial({ color: 0x330000, roughness: 1.0 }));
    podium.position.set(0, 2.5, -40); podium.castShadow = true; podium.receiveShadow = true; scene.add(podium); objects.push(podium);
    const table = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    table.position.set(0, 3, 70); table.castShadow = true; table.receiveShadow = true; scene.add(table); objects.push(table);
}

function createC7Rifle() {
    activeWeapon = new THREE.Group();
    activeWeapon.position.set(0, 7, 70); 
    
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3, 12), new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.8}));
    receiver.position.set(1.5, -1, -5); receiver.castShadow = true; activeWeapon.add(receiver);
    
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8), new THREE.MeshStandardMaterial({color: 0x222222, roughness: 0.2}));
    barrel.position.set(1.5, -0.5, -14); barrel.rotation.x = Math.PI/2;
    barrel.castShadow = true; activeWeapon.add(barrel);
    
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4, 2), new THREE.MeshStandardMaterial({color: 0x333333, roughness: 0.9}));
    mag.position.set(1.5, -4, -3); mag.castShadow = true; mag.name = "magazine"; activeWeapon.add(mag);
    
    muzzleFlash = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0 }));
    muzzleFlash.position.set(1.5, -0.5, -18); activeWeapon.add(muzzleFlash); 
    
    muzzlePointLight = new THREE.PointLight(0xffaa00, 0, 100, 2);
    muzzlePointLight.position.set(1.5, -0.5, -18); muzzlePointLight.castShadow = true; muzzlePointLight.shadow.mapSize.width = 1024; muzzlePointLight.shadow.mapSize.height = 1024;
    activeWeapon.add(muzzlePointLight);
    
    const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.5, -1.0, -11), new THREE.Vector3(1.5, -1.0, -250)]);
    const laserBeam = new THREE.Line(laserGeo, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, transparent: true, opacity: 0.6 }));
    activeWeapon.add(laserBeam);
    
    scene.add(activeWeapon);
}

function spawnSingleEnemy(forcePos) {
    const enemy = new THREE.Group();
    enemy.position.copy(forcePos || new THREE.Vector3((Math.random() - 0.5) * 200, 0, (Math.random() - 0.5) * 200));
    
    const torso = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 3), new THREE.MeshStandardMaterial({ color: 0x660000, roughness: 0.9 }));
    torso.position.y = 3.5; torso.castShadow = true; torso.receiveShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }));
    head.position.y = 8.5; head.castShadow = true; head.receiveShadow = true;
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x050505 }));
    gun.position.set(1.5, 4.5, 3); gun.castShadow = true;
    
    enemy.add(torso, head, gun);
    
    const hitbox = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 5), new THREE.MeshBasicMaterial({visible: false}));
    hitbox.position.y = 5; hitbox.userData = { isEnemy: true, parentRef: enemy }; enemy.add(hitbox);
    
    enemy.userData = { isEnemy: true, health: 40, active: forcePos ? false : true, lastFire: 0 }; 
    scene.add(enemy); enemies.push(enemy); objects.push(hitbox);
    return enemy;
}

function startWave(waveNum) {
    if(waveNum > maxWaves) {
        gameState = "KIA"; // Borrow KIA lock
        document.getElementById('victory-overlay').style.display = 'flex';
        controls.unlock();
        return;
    }
    currentWave = waveNum;
    document.getElementById('wave-counter').innerText = `[ WAVE ${currentWave} / ${maxWaves} ]`;
    triggerQuote(`WAVE ${currentWave} INBOUND`, "#ff0000");
    
    const numEnemies = waveNum === 1 ? 8 : (waveNum === 2 ? 15 : 25);
    enemiesLeft = numEnemies + (waveNum === 3 ? 1 : 0);
    
    for(let i=0; i<numEnemies; i++) {
        spawnSingleEnemy(new THREE.Vector3((Math.random()-0.5)*200, 0, (Math.random()-0.5)*200));
    }
    
    if(waveNum === 3) {
        const commander = spawnSingleEnemy(new THREE.Vector3(0, 5, -40));
        commander.userData.health = 250; 
        commander.children[0].material.color.setHex(0xaa0000); // Unique color
    }
    
    enemies.forEach(e => e.userData.active = true);
}

// Particle Engine
function spawnBlood(pos, isHeadshot) {
    const count = isHeadshot ? 25 : 8;
    for(let i=0; i<count; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,0.4), new THREE.MeshBasicMaterial({color: 0xaa0000}));
        p.position.copy(pos);
        p.userData = { vel: new THREE.Vector3((Math.random()-0.5)*30, Math.random()*30, (Math.random()-0.5)*30), life: 1.0, isBlood: true };
        scene.add(p); particles.push(p);
    }
}
function spawnSpark(pos) {
    for(let i=0; i<3; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), new THREE.MeshBasicMaterial({color: 0xffaa00}));
        p.position.copy(pos);
        p.userData = { vel: new THREE.Vector3((Math.random()-0.5)*40, Math.random()*40, (Math.random()-0.5)*40), life: 0.5, isBlood: false };
        scene.add(p); particles.push(p);
    }
}
function spawnDecal(pos) {
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(8,8), new THREE.MeshBasicMaterial({color: 0x440000, transparent: true, opacity: 0.8}));
    decal.position.set(pos.x, 0.1, pos.z); decal.rotation.x = -Math.PI/2;
    scene.add(decal);
}

function startIntroSequence() {
    if (gameState !== "INTRO") return;
    introDialogue.forEach(diag => { setTimeout(() => triggerQuote(diag.text, diag.text.includes("BLOGGINS") ? '#ffaa00' : '#ff0000'), diag.time); });
    setTimeout(() => { gameState = "ACQUIRE_WEAPON"; triggerQuote("CLICK TO SEIZE THE CHAIN GUN", "#ffffff"); }, 20000);
}

document.addEventListener('mousedown', () => {
    if (gameState === "ACQUIRE_WEAPON" && controls.isLocked) {
        hasChainGun = true; gameState = "COMBAT";
        document.getElementById('ammo-counter').style.display = 'block';
        document.getElementById('wave-counter').style.display = 'block';
        document.getElementById('kill-feed').style.display = 'block';
        startWave(1);
    }
});

function handleReload() {
    if(isReloading || ammo === 30 || gameState !== "COMBAT") return;
    isReloading = true;
    document.getElementById('reloading-text').style.display = 'block';
    
    // Animate weapon down
    activeWeapon.position.y -= 3;
    activeWeapon.rotation.x += 0.5;
    
    setTimeout(() => {
        ammo = 30;
        document.getElementById('bc-mag').innerText = 'MAG: 30';
        document.getElementById('reloading-text').style.display = 'none';
        activeWeapon.position.y += 3;
        activeWeapon.rotation.x -= 0.5;
        isReloading = false;
    }, 2500);
}

function handleShooting(time) {
    if (gameState !== "COMBAT" || !isShooting || isReloading || time - lastFireTime < fireRate) return;
    if (ammo <= 0) { 
        playCombatAcoustic("damage"); // Dry fire click 
        isShooting = false; return; 
    }
    
    lastFireTime = time; ammo--;
    document.getElementById('bc-mag').innerText = `MAG: ${ammo}`;
    playCombatAcoustic("incoming_crack"); // Rifle blast mapping
    
    // Brutal Recoil & Pitch
    camera.rotation.x += (Math.random() * 0.05) + 0.03; // Massive climb
    camera.rotation.y += (Math.random() - 0.5) * 0.03;
    
    muzzleFlash.material.opacity = 0.8 + Math.random() * 0.2; activeWeapon.position.z += 2.0;
    muzzlePointLight.intensity = 15.0;
    setTimeout(() => { muzzleFlash.material.opacity = 0; muzzlePointLight.intensity = 0; }, 40);
    
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(objects);
    
    if (intersects.length > 0) {
        const hitData = intersects[0];
        if (hitData.object.userData.isEnemy) {
            const isHeadshot = hitData.object.geometry && hitData.object.geometry.type === "SphereGeometry";
            const dmg = isHeadshot ? 150 : 25; 
            
            const t = hitData.object.userData.parentRef; t.userData.health -= dmg;
            t.children.forEach(c => { if(c.material && c.material.color) c.material.color.setHex(0xffffff); }); 
            setTimeout(() => { if(t) t.children.forEach(c => { if(c.material && c.material.color) c.material.color.setHex(t.userData.health > 100 ? 0xaa0000 : 0x660000); }); }, 50);
            
            if(isHeadshot) {
                playCombatAcoustic("headshot"); spawnBlood(hitData.point, true);
            } else {
                spawnBlood(hitData.point, false);
            }
            
            if (t.userData.health <= 0) {
                t.userData.active = false;
                t.rotation.x = -Math.PI / 2; t.position.y = 1;
                
                const hitboxIndex = objects.indexOf(hitData.object);
                if(hitboxIndex > -1) objects.splice(hitboxIndex, 1);
                
                enemies.splice(enemies.indexOf(t), 1);
                spawnDecal(t.position);
                kills++; enemiesLeft--;
                
                if (Math.random() > 0.85) triggerQuote(combatQuotes[Math.floor(Math.random() * combatQuotes.length)], "#ff3333");
                if (enemiesLeft <= 0) setTimeout(() => startWave(currentWave + 1), 4000);
            }
        } else {
            spawnSpark(hitData.point);
        }
    }
}

function enemyFire(enemy, time) {
    if(time - enemy.userData.lastFire < 2000 + Math.random() * 2000) return; // Fire rate limitation
    enemy.userData.lastFire = time;
    playCombatAcoustic("incoming_crack");

    // Tracer Visuals
    const material = new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8 });
    const points = [];
    const startPos = enemy.position.clone(); startPos.y += 3;
    const bulletDir = new THREE.Vector3().subVectors(camera.position, startPos).normalize();
    bulletDir.x += (Math.random() - 0.5) * 0.1; bulletDir.y += (Math.random() - 0.5) * 0.1; // Inaccuracy
    
    points.push(startPos);
    const endPos = startPos.clone().add(bulletDir.clone().multiplyScalar(10));
    points.push(endPos);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const tracer = new THREE.Line(geometry, material);
    scene.add(tracer);
    tracers.push({ mesh: tracer, dir: bulletDir, birth: time });
}

function triggerQuote(text, color = '#ff0000') {
    const q = document.getElementById('bloggins-quote'); if (!q) return;
    q.innerText = text; q.style.color = color; q.style.opacity = 1;
    clearTimeout(q.fadeTimeout); q.fadeTimeout = setTimeout(() => q.style.opacity = 0, 3000);
}

function showHitMarker() {
    const hm = document.getElementById('hit-marker');
    if(hm) { hm.style.opacity = 1; hm.style.transform = "translate(-50%, -50%) scale(2)"; setTimeout(() => { hm.style.opacity = 0; hm.style.transform = "translate(-50%, -50%) scale(1)"; }, 50); }
}

function onWindowResize() {
    const container = document.getElementById('fps-container'); if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight); composer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    if (customPass) customPass.uniforms["time"].value = time * 0.001;

    let delta = Math.min((time - prevTime) / 1000, 0.1);

    // Particle Loops
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        p.position.addScaledVector(p.userData.vel, delta || 0.016);
        p.userData.vel.y -= 80 * (delta || 0.016);
        p.userData.life -= (delta || 0.016);
        if(p.userData.life <= 0 || p.position.y < 0) { scene.remove(p); particles.splice(i,1); }
    }

    // Process Tracers
    for(let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i];
        t.mesh.position.add(t.dir.clone().multiplyScalar(4.0));
        if(t.mesh.position.distanceTo(camera.position) < 5) {
            playerHealth -= 10;
            camera.rotation.x += (Math.random() - 0.5) * 0.4; camera.rotation.y += (Math.random() - 0.5) * 0.4; // Flinch
            velocity.x *= 0.1; velocity.z *= 0.1; // Halt Momentum
            scene.remove(t.mesh); tracers.splice(i, 1);
            playCombatAcoustic("damage");
            const dmg = document.getElementById('damage-overlay'); dmg.style.opacity = 0.9; setTimeout(() => dmg.style.opacity = 0, 150);
            customPass.uniforms["amount"].value = 1.3; setTimeout(() => customPass.uniforms["amount"].value = 0.9, 200);
            
            if(playerHealth <= 0 && gameState !== "KIA") {
                gameState = "KIA";
                controls.unlock();
                document.getElementById('kia-overlay').style.display = 'flex';
            }
        } else if (time - t.birth > 1000) {
            scene.remove(t.mesh); tracers.splice(i, 1);
        }
    }

    handleShooting(time);
    
    if (controls.isLocked === true && gameState === "COMBAT") {
        velocity.x -= velocity.x * 8.0 * delta; velocity.z -= velocity.z * 8.0 * delta; velocity.y -= 9.8 * 120.0 * delta;
        direction.z = Number(moveForward) - Number(moveBackward); direction.x = Number(moveRight) - Number(moveLeft); direction.normalize(); 

        const speed = 250.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
        
        if ((moveForward || moveBackward || moveLeft || moveRight) && !leanLeft && !leanRight) {
            if (time - lastStepTime > 450) { playCombatAcoustic("footstep"); lastStepTime = time; }
        }

        controls.moveRight(-velocity.x * delta); controls.moveForward(-velocity.z * delta); controls.getObject().position.y += (velocity.y * delta);
        if (controls.getObject().position.y < 10) { velocity.y = 0; controls.getObject().position.y = 10; }

        let targetZ = 0, targetX = 0;
        if (leanLeft) { targetZ = 0.25; targetX = -2; } else if (leanRight) { targetZ = -0.25; targetX = 2; }
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetZ, 0.1);
        scene.children[scene.children.indexOf(camera) - 1].position.copy(camera.position); 

        const gunTargetPos = camera.position.clone();
        const gunOffset = new THREE.Vector3(2.5 + targetX, -2.5, -5); gunOffset.applyQuaternion(camera.quaternion);
        gunTargetPos.add(gunOffset);
        if (moveForward || moveBackward || moveLeft || moveRight) gunTargetPos.y += Math.sin(time * 0.01) * 0.3;
        activeWeapon.position.lerp(gunTargetPos, 0.15); activeWeapon.quaternion.slerp(camera.quaternion, 0.2);

        // Tactical Cover AI Algorithm
        enemies.forEach(en => {
            if(!en.userData.active) return;
            
            if(!en.userData.cover) {
                let nearestContainer = null; let minD = 150;
                objects.forEach(obj => {
                    if(obj.geometry && obj.geometry.type === 'BoxGeometry' && obj.geometry.parameters.depth === 25) {
                        const d = en.position.distanceTo(obj.position);
                        if(d < minD) { minD = d; nearestContainer = obj; }
                    }
                });
                en.userData.cover = nearestContainer;
                en.userData.isPeeking = false;
                en.userData.peekTimer = time;
            }
            
            const dist = en.position.distanceTo(camera.position);
            en.lookAt(camera.position);
            
            if(en.userData.cover && dist > 30) {
                const coverDist = en.position.distanceTo(en.userData.cover.position);
                if (coverDist > 10) {
                    const dir = new THREE.Vector3().subVectors(en.userData.cover.position, en.position).normalize();
                    en.position.add(dir.multiplyScalar(0.25));
                } else {
                    if (time - en.userData.peekTimer > 3000 + Math.random()*3000) {
                        en.userData.isPeeking = !en.userData.isPeeking; en.userData.peekTimer = time;
                    }
                    const strafeDir = new THREE.Vector3(1, 0, 0).applyQuaternion(en.userData.cover.quaternion);
                    const targetPos = en.userData.cover.position.clone();
                    if (en.userData.isPeeking) targetPos.add(strafeDir.multiplyScalar(8));
                    en.position.lerp(targetPos, 0.1);
                    
                    if(en.userData.isPeeking && Math.random() < 0.05) enemyFire(en, time);
                }
            } else {
                if(dist > 50) {
                    const dir = new THREE.Vector3().subVectors(camera.position, en.position).normalize();
                    en.position.add(dir.multiplyScalar(0.15));
                } else {
                    if(Math.random() < 0.03) enemyFire(en, time);
                }
            }
        });
    }
    prevTime = time;
    composer.render();
}

document.addEventListener("DOMContentLoaded", () => {
    const targetTabBtn = document.getElementById('tab-fps');
    if(targetTabBtn) targetTabBtn.addEventListener('click', () => { if(!renderer) initFPS(); });
});

