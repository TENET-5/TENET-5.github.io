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
let isSprinting = false;
let sprintTime = 0;        // accumulated sprint duration for screen effects
let bobTime = 0;           // head bob accumulator
let prevSpeed = 0;         // for body check detection
const BODYCHECK_THRESHOLD = 380; // units/s to trigger body check
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
let hasChainGun = false;

// Phase 23 Wave Survival — Endless Mode
let currentWave = 1;
const maxWaves = 99; // Effectively endless
let kills = 0;
let enemiesLeft = 0;
let hasPlayedBefore = false;
let healthRegenTimer = 0;
let currentWeaponIdx = 0;
const weaponNames = ['C7 RIFLE', 'SHOTGUN', 'RPG'];
const weaponStats = [
  { fireRate: 120, damage: 25, headDmg: 150, mag: 30, reloadTime: 2500, spread: 0.03, pellets: 1 },
  { fireRate: 600, damage: 15, headDmg: 80, mag: 8, reloadTime: 3000, spread: 0.12, pellets: 8 },
  { fireRate: 1500, damage: 200, headDmg: 500, mag: 1, reloadTime: 4000, spread: 0, pellets: 1, explosive: true }
];

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
    scene.background = new THREE.Color(0x111122);
    scene.fog = new THREE.FogExp2(0x111122, 0.008);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 80);

    // AMBIENT — so you can actually see
    scene.add(new THREE.AmbientLight(0x445566, 0.6));

    // MOONLIGHT — illuminates everything from above
    const moon = new THREE.DirectionalLight(0x8899bb, 1.0);
    moon.position.set(50, 200, 50);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.near = 1; moon.shadow.camera.far = 500;
    moon.shadow.camera.left = -200; moon.shadow.camera.right = 200;
    moon.shadow.camera.top = 200; moon.shadow.camera.bottom = -200;
    scene.add(moon);

    // FLASHLIGHT — brighter, wider cone
    const chestLight = new THREE.SpotLight(0xffffff, 8.0, 250, Math.PI/3, 0.4, 1);
    chestLight.castShadow = true; chestLight.shadow.mapSize.set(1024, 1024);
    camera.add(chestLight); camera.add(chestLight.target); chestLight.target.position.set(0, 0, -1);

    // RED WARNING LIGHTS across the map
    for (let i = 0; i < 8; i++) {
        const rl = new THREE.PointLight(0xff2200, 3, 80, 2);
        rl.position.set((Math.random()-0.5)*300, 15, (Math.random()-0.5)*300);
        scene.add(rl);
    }

    scene.add(camera);

    controls = new THREE.PointerLockControls(camera, document.body);
    const blocker = document.getElementById('fps-instructions');

    blocker.addEventListener('click', () => {
        if(gameState !== "KIA") {
            try {
                controls.lock();
            } catch(e) {
                console.warn('[RED DUSTER] Pointer lock failed, retrying...', e);
                // Fallback — try again after a frame
                requestAnimationFrame(() => {
                    try { controls.lock(); } catch(e2) {
                        console.error('[RED DUSTER] Pointer lock unavailable. Try clicking again or check browser permissions.');
                        blocker.innerHTML = '<div><span style="font-size:1.5em;color:#ff3333;">CLICK AGAIN TO DEPLOY</span><br><br><span style="font-size:0.8em;color:#aaa;">Browser blocked pointer lock. Click directly on this screen.</span></div>';
                    }
                });
            }
        }
    });

    controls.addEventListener('lock', () => {
        console.log('[RED DUSTER] Pointer lock acquired — deploying');
        blocker.style.display = 'none';
        if (gameState === "INTRO") startIntroSequence();
    });
    controls.addEventListener('unlock', () => { if(gameState !== "KIA") blocker.style.display = 'flex'; });

    // Also handle pointer lock errors globally
    document.addEventListener('pointerlockerror', () => {
        console.warn('[RED DUSTER] Pointer lock error — click the game screen directly');
        blocker.innerHTML = '<div><span style="font-size:1.5em;color:#ff3333;">CLICK HERE TO DEPLOY</span><br><br><span style="font-size:0.8em;color:#ffaa00;">⚠ Browser blocked mouse capture. Click directly on this screen.</span></div>';
        blocker.style.display = 'flex';
    });
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
            case 'ShiftLeft': case 'ShiftRight': isSprinting = true; break;
            case 'Digit1': switchWeapon(0); break;
            case 'Digit2': if(currentWave >= 3) switchWeapon(1); break;
            case 'Digit3': if(currentWave >= 6) switchWeapon(2); break;
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
            case 'ShiftLeft': case 'ShiftRight': isSprinting = false; break;
        }
    };

    document.addEventListener('keydown', onKeyDown); document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousedown', () => { isShooting = true; }); document.addEventListener('mouseup', () => { isShooting = false; });
    raycaster = new THREE.Raycaster();

    concTex = generateNoiseTexture('#1a1a1a', ['#111','#222','#0a0a0a'], 2); concTex.repeat.set(10, 10);
    rustTex = generateNoiseTexture('#332222', ['#442222','#221111','#553311'], 1); rustTex.repeat.set(2, 2);
    gridTex = generateNoiseTexture('#050505', ['#220000','#110000','#330000'], 4); gridTex.repeat.set(20, 20);

    buildOpenTown();
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

function buildOpenTown() {
    // Massive Open Town Floor
    const floorGeo = new THREE.PlaneGeometry(1500, 1500, 100, 100); floorGeo.rotateX(-Math.PI / 2);
    let pos = floorGeo.attributes.position; for (let i = 0; i < pos.count; i++) { pos.setY(i, Math.random() * 0.4); } 
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: gridTex, wireframe: false, roughness: 0.9 }));
    floor.receiveShadow = true; scene.add(floor);

    // Procedural Urban Grid Generation
    const buildingMat = new THREE.MeshStandardMaterial({ map: concTex, roughness: 1.0 });
    const rustMat = new THREE.MeshStandardMaterial({ map: rustTex, roughness: 0.8 });
    
    for (let x = -600; x <= 600; x += 150) {
        for (let z = -600; z <= 600; z += 150) {
            // Keep the center starting area relatively clear
            if (Math.abs(x) < 200 && Math.abs(z) < 200) continue;
            
            // Randomly skip some blocks to form open plazas or intersections
            if (Math.random() < 0.25) continue;
            
            // Town Building Block
            const bWidth = 50 + Math.random() * 40;
            const bDepth = 50 + Math.random() * 40;
            const bHeight = 30 + Math.random() * 60;
            const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            const building = new THREE.Mesh(bGeo, buildingMat);
            building.position.set(x + (Math.random()-0.5)*20, bHeight/2, z + (Math.random()-0.5)*20);
            building.castShadow = true; building.receiveShadow = true;
            scene.add(building); objects.push(building);
            
            // Street Cover & Barricades around buildings
            for(let c=0; c<3; c++) {
                if (Math.random() < 0.5) {
                    const cGeo = new THREE.BoxGeometry(10, 10, 25);
                    const container = new THREE.Mesh(cGeo, rustMat); 
                    container.castShadow = true; container.receiveShadow = true;
                    container.position.set(building.position.x + (Math.random() - 0.5) * 80, 5, building.position.z + (Math.random() - 0.5) * 80);
                    container.rotation.y = Math.random() * Math.PI;
                    scene.add(container); objects.push(container);
                }
            }
        }
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
    // Vastly increased spawn dispersion to match open 1500x1500 town bounds
    enemy.position.copy(forcePos || new THREE.Vector3((Math.random() - 0.5) * 1200, 0, (Math.random() - 0.5) * 1200));
    
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
    currentWave = waveNum;
    triggerQuote(`WAVE ${currentWave} — HOSTILES INBOUND`, "#ff0000");

    // Scale: 6 + wave*3 enemies, capped at 40 for performance
    const numEnemies = Math.min(40, 6 + waveNum * 3);
    // Enemy HP scales with waves
    const hpScale = 1 + (waveNum - 1) * 0.15;
    enemiesLeft = numEnemies + (waveNum % 5 === 0 ? 1 : 0);

    const spawnRadius = Math.min(400, 150 + waveNum * 20);
    for(let i=0; i<numEnemies; i++) {
        const e = spawnSingleEnemy(new THREE.Vector3((Math.random()-0.5)*spawnRadius, 0, (Math.random()-0.5)*spawnRadius));
        e.userData.health = Math.round(40 * hpScale);
    }

    // Boss every 5 waves
    if(waveNum % 5 === 0) {
        triggerQuote('BOSS WAVE — HEAVY CONTACT', '#ffaa00');
        const commander = spawnSingleEnemy(new THREE.Vector3((Math.random()-0.5)*100, 5, (Math.random()-0.5)*100));
        commander.userData.health = Math.round(250 * hpScale);
        commander.children[0].material.color.setHex(0xaa0000);
        commander.children[0].scale.set(1.5, 1.5, 1.5);
    }

    // Health pack every 3 waves
    if(waveNum > 1 && waveNum % 3 === 0) {
        playerHealth = Math.min(100, playerHealth + 30);
        triggerQuote('MEDKIT ACQUIRED +30HP', '#00ff00');
    }

    // Unlock weapons at certain waves
    if(waveNum === 3 && currentWeaponIdx === 0) triggerQuote('SHOTGUN UNLOCKED — Press 2', '#ffaa00');
    if(waveNum === 6 && currentWeaponIdx < 2) triggerQuote('RPG UNLOCKED — Press 3', '#ffaa00');

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
    // SKIP INTRO — go straight to combat. Nobody wants to wait 20 seconds.
    gameState = "COMBAT";
    hasPlayedBefore = true;
    hasChainGun = true;
    triggerQuote("HOSTILES DETECTED — WEAPONS FREE", "#ff3333");
    startWave(1);
}

// ACQUIRE_WEAPON state removed — game goes straight to combat

function handleReload() {
    const w = weaponStats[currentWeaponIdx];
    if(isReloading || ammo === w.mag || gameState !== "COMBAT") return;
    isReloading = true;
    document.getElementById('reloading-text').style.display = 'block';

    // Animate weapon down
    activeWeapon.position.y -= 3;
    activeWeapon.rotation.x += 0.5;

    setTimeout(() => {
        ammo = w.mag;
        document.getElementById('bc-mag').innerText = `${weaponNames[currentWeaponIdx]}: ${ammo} | KILLS: ${kills}`;
        document.getElementById('reloading-text').style.display = 'none';
        activeWeapon.position.y += 3;
        activeWeapon.rotation.x -= 0.5;
        isReloading = false;
    }, w.reloadTime);
}

function handleShooting(time) {
    const w = weaponStats[currentWeaponIdx];
    if (gameState !== "COMBAT" || !isShooting || isReloading || time - lastFireTime < w.fireRate) return;
    if (ammo <= 0) {
        playCombatAcoustic("damage"); // Dry fire click
        handleReload(); return;
    }

    lastFireTime = time; ammo--;
    document.getElementById('bc-mag').innerText = `${weaponNames[currentWeaponIdx]}: ${ammo} | KILLS: ${kills}`;
    playCombatAcoustic(currentWeaponIdx === 1 ? "chain_gun" : "incoming_crack");

    // Weapon-specific recoil
    const recoilUp = currentWeaponIdx === 1 ? 0.08 : (currentWeaponIdx === 2 ? 0.15 : 0.04);
    camera.rotation.x += (Math.random() * recoilUp) + recoilUp;
    camera.rotation.y += (Math.random() - 0.5) * (recoilUp * 0.6);
    
    muzzleFlash.material.opacity = 0.8 + Math.random() * 0.2; activeWeapon.position.z += 2.0;
    muzzlePointLight.intensity = 15.0;
    setTimeout(() => { muzzleFlash.material.opacity = 0; muzzlePointLight.intensity = 0; }, 40);
    
    // Fire pellets (shotgun fires 8, others fire 1)
    for(let pellet = 0; pellet < w.pellets; pellet++) {
    const spreadVec = new THREE.Vector2(
        (Math.random()-0.5) * w.spread,
        (Math.random()-0.5) * w.spread
    );
    raycaster.setFromCamera(spreadVec, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        const hitData = intersects[0];
        if (hitData.object.userData.isEnemy) {
            const isHeadshot = hitData.object.geometry && hitData.object.geometry.type === "SphereGeometry";
            const dmg = isHeadshot ? w.headDmg : w.damage;
            
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

                const hitboxIndex = objects.indexOf(hitData.object);
                if(hitboxIndex > -1) objects.splice(hitboxIndex, 1);

                enemies.splice(enemies.indexOf(t), 1);
                spawnDecal(t.position);
                gibEnemy(t); // EXPLODE into chunks
                kills++; enemiesLeft--;

                // Update HUD kill counter
                const magEl = document.getElementById('bc-mag');
                if(magEl) magEl.innerText = `${weaponNames[currentWeaponIdx]}: ${ammo} | KILLS: ${kills}`;

                if (Math.random() > 0.7) triggerQuote(combatQuotes[Math.floor(Math.random() * combatQuotes.length)], "#ff3333");
                if (enemiesLeft <= 0) setTimeout(() => startWave(currentWave + 1), 3000);
            }
        } else {
            spawnSpark(hitData.point);
        }
    }
    } // end pellet loop
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

function switchWeapon(idx) {
    if(idx === currentWeaponIdx || isReloading) return;
    currentWeaponIdx = idx;
    const w = weaponStats[idx];
    fireRate = w.fireRate;
    ammo = w.mag;
    document.getElementById('bc-mag').innerText = `${weaponNames[idx]}: ${ammo}`;
    triggerQuote(weaponNames[idx] + ' EQUIPPED', '#ffaa00');
}

function gibEnemy(enemy) {
    // Explode enemy into chunks
    const pos = enemy.position.clone();
    pos.y += 5;
    for(let i = 0; i < 10; i++) {
        const size = 0.5 + Math.random() * 1.5;
        const gib = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshStandardMaterial({color: i < 5 ? 0xaa0000 : 0x440000, roughness: 0.9})
        );
        gib.position.copy(pos);
        gib.position.x += (Math.random()-0.5) * 2;
        gib.position.z += (Math.random()-0.5) * 2;
        gib.castShadow = true;
        gib.userData = {
            vel: new THREE.Vector3((Math.random()-0.5)*25, 10 + Math.random()*20, (Math.random()-0.5)*25),
            life: 3 + Math.random()*3,
            spin: new THREE.Vector3((Math.random()-0.5)*8, (Math.random()-0.5)*8, (Math.random()-0.5)*8),
            isGib: true
        };
        scene.add(gib);
        particles.push(gib);
    }
    // Remove original mesh
    scene.remove(enemy);
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

    // Particle Loops (blood + gibs)
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        const dt2 = delta || 0.016;
        p.position.addScaledVector(p.userData.vel, dt2);
        p.userData.vel.y -= (p.userData.isGib ? 30 : 80) * dt2; // Gibs fall slower for visibility
        p.userData.life -= dt2;
        // Gib spin
        if(p.userData.spin) {
            p.rotation.x += p.userData.spin.x * dt2;
            p.rotation.y += p.userData.spin.y * dt2;
            p.rotation.z += p.userData.spin.z * dt2;
        }
        // Floor bounce for gibs
        if(p.userData.isGib && p.position.y < 0.5) {
            p.position.y = 0.5;
            p.userData.vel.y = Math.abs(p.userData.vel.y) * 0.25;
            p.userData.vel.x *= 0.5;
            p.userData.vel.z *= 0.5;
        }
        if(p.userData.life <= 0 || (!p.userData.isGib && p.position.y < 0)) { scene.remove(p); particles.splice(i,1); }
    }

    // Health regen — slow regen after 5 seconds without damage
    if(gameState === 'COMBAT' && playerHealth < 100 && playerHealth > 0) {
        healthRegenTimer += delta;
        if(healthRegenTimer > 5.0) {
            playerHealth = Math.min(100, playerHealth + 5 * delta);
        }
    }

    // Process Tracers
    for(let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i];
        t.mesh.position.add(t.dir.clone().multiplyScalar(4.0));
        if(t.mesh.position.distanceTo(camera.position) < 5) {
            playerHealth -= 10;
            healthRegenTimer = 0; // Reset regen on damage
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

        const isMoving = moveForward || moveBackward || moveLeft || moveRight;
        const speed = isSprinting ? 520.0 : 250.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

        // ── PROCEDURAL MOVEMENT ──────────────────────────────────────────────
        const lateralSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        prevSpeed = lateralSpeed;

        if (isMoving) {
            const bobFreq  = isSprinting ? 14.0 : 7.0;   // sprint bobs faster
            const bobAmtY  = isSprinting ? 1.2 : 0.45;   // vertical head bob
            const bobAmtX  = isSprinting ? 0.6 : 0.18;   // side sway
            bobTime += delta * bobFreq;
            // camera bob (applied via camera offset, restored each frame)
            const bobY = Math.sin(bobTime)         * bobAmtY;
            const bobX = Math.sin(bobTime * 0.5)   * bobAmtX;
            controls.getObject().position.y = 10 + bobY;

            // Footstep timing — faster when sprinting
            const stepInterval = isSprinting ? 260 : 450;
            if (time - lastStepTime > stepInterval) { playCombatAcoustic("footstep"); lastStepTime = time; }

            // Sprint: lean forward + slight barrel roll
            if (isSprinting) {
                sprintTime += delta;
                // Lean camera forward
                camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, -0.08, 0.12);
                // Breathing sway while sprinting
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, Math.sin(bobTime * 0.5) * 0.03, 0.15);
                // Vignette pump (bodycam lens compress)
                if(customPass) customPass.uniforms["amount"].value = 0.95 + Math.abs(Math.sin(bobTime)) * 0.08;
            } else {
                sprintTime = 0;
                if(customPass) customPass.uniforms["amount"].value = THREE.MathUtils.lerp(customPass.uniforms["amount"].value, 0.9, 0.08);
            }
        } else {
            bobTime *= 0.85; // decay bob smoothly when stopping
            sprintTime = 0;
            isSprinting = false;
            controls.getObject().position.y = THREE.MathUtils.lerp(controls.getObject().position.y, 10, 0.15);
            if(customPass) customPass.uniforms["amount"].value = THREE.MathUtils.lerp(customPass.uniforms["amount"].value, 0.9, 0.08);
        }

        // ── BODY CHECK ───────────────────────────────────────────────────────
        if (isSprinting && lateralSpeed > BODYCHECK_THRESHOLD) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const en = enemies[i];
                if (!en.userData.active) continue;
                const dist = controls.getObject().position.distanceTo(en.position);
                if (dist < 8) {
                    // BODY CHECK — Bloggins ragdolls enemy into gibs
                    triggerQuote("BODY CHECK! CANADA'S STILL STANDING!", "#ff6600");
                    playCombatAcoustic("headshot");
                    // Launch enemy backward in player's forward direction
                    const launch = new THREE.Vector3();
                    controls.getObject().getWorldDirection(launch);
                    launch.y = 0.6;
                    launch.normalize().multiplyScalar(35);
                    // Spawn a big blood burst at impact then gib
                    spawnBlood(en.position.clone().add(new THREE.Vector3(0,5,0)), true);
                    spawnBlood(en.position.clone().add(new THREE.Vector3(0,5,0)), true);
                    // Gib the enemy (launched gibs)
                    const pos = en.position.clone(); pos.y += 5;
                    for (let g = 0; g < 15; g++) {
                        const size = 0.6 + Math.random() * 1.8;
                        const gib = new THREE.Mesh(
                            new THREE.BoxGeometry(size, size, size),
                            new THREE.MeshStandardMaterial({color: g < 8 ? 0xaa0000 : 0x660000, roughness: 0.9})
                        );
                        gib.position.copy(pos);
                        gib.userData = {
                            vel: new THREE.Vector3(
                                launch.x * (0.5 + Math.random()) + (Math.random()-0.5)*20,
                                launch.y * (8 + Math.random()*12),
                                launch.z * (0.5 + Math.random()) + (Math.random()-0.5)*20
                            ),
                            life: 4 + Math.random()*3,
                            spin: new THREE.Vector3((Math.random()-0.5)*12,(Math.random()-0.5)*12,(Math.random()-0.5)*12),
                            isGib: true
                        };
                        scene.add(gib); particles.push(gib);
                    }
                    // Remove enemy
                    const hitboxIdx = objects.findIndex(o => o.userData.parentRef === en);
                    if (hitboxIdx > -1) objects.splice(hitboxIdx, 1);
                    scene.remove(en);
                    enemies.splice(i, 1);
                    kills++; enemiesLeft--;
                    const magEl = document.getElementById('bc-mag');
                    if(magEl) magEl.innerText = `${weaponNames[currentWeaponIdx]}: ${ammo} | KILLS: ${kills}`;
                    if (enemiesLeft <= 0) setTimeout(() => startWave(currentWave + 1), 3000);
                    // Knockback camera (impact shake)
                    camera.rotation.x += (Math.random()-0.5) * 0.25;
                    camera.rotation.y += (Math.random()-0.5) * 0.12;
                }
            }
        }

        controls.moveRight(-velocity.x * delta); controls.moveForward(-velocity.z * delta);
        if (controls.getObject().position.y < 10) { velocity.y = 0; controls.getObject().position.y = 10; }

        let targetZ = 0, targetX = 0;
        if (leanLeft) { targetZ = 0.25; targetX = -2; } else if (leanRight) { targetZ = -0.25; targetX = 2; }
        if (!isSprinting) camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetZ, 0.1);

        // Gun — bob and sway procedurally
        const gunTargetPos = camera.position.clone();
        const gunOffset = new THREE.Vector3(2.5 + targetX, -2.5, -5); gunOffset.applyQuaternion(camera.quaternion);
        gunTargetPos.add(gunOffset);
        if (isMoving) {
            const gunBobAmt = isSprinting ? 1.2 : 0.3;
            gunTargetPos.y += Math.sin(bobTime) * gunBobAmt;
            gunTargetPos.x += Math.sin(bobTime * 0.5) * gunBobAmt * 0.5;
            if (isSprinting) {
                // Gun holstered low when sprinting
                gunTargetPos.y -= 1.5;
                gunTargetPos.x += 0.8;
            }
        }
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

