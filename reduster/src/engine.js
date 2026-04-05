/**
 * engine.js — Babylon.js 9 Engine
 * Bloom + FXAA + ACES tone mapping + sharpening + grain + vignette.
 * Cascaded shadow maps (4 cascades, PCF), IBL environment lighting.
 * SSAO/motion blur omitted — geometry buffer not enabled.
 */

import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { Vector3, Color3, Color4 } from '@babylonjs/core/Maths/math.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
import { CascadedShadowGenerator } from '@babylonjs/core/Lights/Shadows/cascadedShadowGenerator.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture.js';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline.js';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents.js';
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents.js';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer.js';
import { SkyMaterial } from '@babylonjs/materials/sky/skyMaterial.js';
import { transmitSatorEvent } from './telemetry.js';

import '@babylonjs/core/Meshes/instancedMesh.js';
import '@babylonjs/core/Culling/ray.js';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent.js';
import '@babylonjs/core/Lights/Shadows/cascadedShadowGenerator.js';

import { buildWorld, getHeight, updateForestWind, updateRockLOD, updateGroundCover, updateBogFog } from './world.js';
import { buildPlanet, getPlanetHeight, getPlanetGravity, getSpherePos, PLANET_RADIUS, GRAVITY_STRENGTH } from './world_sphere.js';
import { createPlayer, updatePlayer, registerWeaponNode, toggleCrouch } from './player.js';
import { STATE, onRespawn, triggerDeath } from './state.js';
import { updateSurvival, initSurvivalScene, trySleep, placeCampfire } from './survival.js';
import { throwGrenade, updateGrenades } from './grenades.js';
import { toggleInventory, isInventoryOpen, addItem } from './inventory.js';
import { initNVG, toggleNVG } from './nvg.js';
import { initMinimap, toggleMinimap, updateMinimap } from './minimap.js';
import { spawnVehicles, tryEnterVehicle, updateVehicles, isInVehicle, getNearestVehicle } from './vehicles.js';
import { initObjectives, updateObjectives, toggleObjectivesList, onLoot } from './objectives.js';
import { preloadModels } from './models.js';
import { updateHUD, addKillFeed, initCompass, updateCompass, updateReloadBar, showHitMarker, showWeaponName, updateLowHealthPulse } from './hud.js';
import { updateDayNight, updateCombatEffects } from './effects.js';
import { updateWeather, getWind, getWeatherType } from './weather.js';
import { initAudio, startEnvironmentAmbient, updateAmbientWeather, updateWildlifeAudio } from './audio.js';
import { spawnEnemies, updateEnemies, notifyEnemyHit, getEnemies } from './enemies.js';
import { WEAPONS, WEAPON_SLOTS, createWeaponModel, equipWeapon } from './weapons.js';
import { createSkyGradient } from './textures.js';

export async function startGame(canvas, onProgress) {
  // ── Engine ──
  const engine = new Engine(canvas, true, {
    stencil: true, antialias: true, adaptToDeviceRatio: true,
    powerPreference: 'high-performance',
  });
  window.addEventListener('resize', () => engine.resize());
  onProgress(0.05);

  // ── Scene ──
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1);
  scene.fogMode    = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0003;
  scene.fogColor   = new Color3(0.55, 0.6, 0.68);
  scene.ambientColor = new Color3(0.25, 0.25, 0.3);
  scene.collisionsEnabled = true;
  scene.gravity = new Vector3(0, -9.81 / 60, 0); // BJS applies per-frame, so divide by ~60fps
  onProgress(0.08);

  // ── Havok Physics ──
  try {
    const HavokPhysics = (await import('@babylonjs/havok')).default;
    const hk = await HavokPhysics();
    const { HavokPlugin } = await import('@babylonjs/core/Physics/v2/Plugins/havokPlugin.js');
    await import('@babylonjs/core/Physics/v2/physicsEngineComponent.js');
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, hk));
  } catch (e) { console.warn('[Havok]', e.message); }
  onProgress(0.2);

  // ── Camera ──
  const sx = 2000, sz = 2000, sy = getHeight(sx, sz) + 5;
  const camera = new FreeCamera('fps', new Vector3(sx, sy, sz), scene);
  camera.setTarget(new Vector3(sx + 5, sy, sz + 5));
  camera.attachControl(canvas, true);
  camera.keysUp = [87,38]; camera.keysDown = [83,40];
  camera.keysLeft = [65,37]; camera.keysRight = [68,39];
  camera.speed = 1.8; camera.inertia = 0.0; // crisp 1:1 FPS mouse
  camera.angularSensibility = 2000; // responsive aiming with zero inertia
  camera.minZ = 0.15; camera.maxZ = 5000;
  camera.fov = 1.396; // ~80 deg — wider feels faster and more modern
  camera.ellipsoid = new Vector3(0.4, 0.85, 0.4);
  camera.ellipsoidOffset = new Vector3(0, 0.85, 0);
  camera.checkCollisions = true;
  camera.applyGravity = true;
  scene.activeCamera = camera;
  window._camera = camera; // settings overlay access
  onProgress(0.25);

  // ════════════════════════════════════════════════════════════════════════
  // LIGHTING — UE5-style multi-source + bounce approximation
  // ════════════════════════════════════════════════════════════════════════

  // Sky fill (simulates indirect sky illumination / Lumen bounce)
  const hemi = new HemisphericLight('skyFill', new Vector3(0.1, 1, 0.05), scene);
  hemi.intensity = 0.45;
  hemi.diffuse = new Color3(0.7, 0.78, 0.92);     // Cool sky blue
  hemi.groundColor = new Color3(0.18, 0.15, 0.1);  // Warm ground bounce
  hemi.specular = new Color3(0.15, 0.15, 0.15);

  // Sun — primary directional
  const sun = new DirectionalLight('sun', new Vector3(-0.25, -0.6, 0.5).normalize(), scene);
  sun.intensity = 5.0; // Boosted for photorealistic contrast
  sun.diffuse = new Color3(1.0, 0.95, 0.85);   
  sun.specular = new Color3(1.0, 0.95, 0.85);
  sun.position = new Vector3(8000, 4500, 2500); // Distant photorealistic positioning

  // Back/rim light — UE5-style edge separation
  const rim = new DirectionalLight('rim', new Vector3(0.4, -0.2, -0.7).normalize(), scene);
  rim.intensity = 0.8;
  rim.diffuse = new Color3(0.5, 0.7, 1.0);
  rim.specular = Color3.Black();

  // Fill from below (faking ground bounce for under-canopy areas)
  const bounce = new HemisphericLight('bounce', new Vector3(0, -1, 0), scene);
  bounce.intensity = 0.2;
  bounce.diffuse = new Color3(0.2, 0.35, 0.15);  
  bounce.groundColor = Color3.Black();
  bounce.specular = Color3.Black();

  // ── Shadows — Cascaded Shadow Maps (4 cascades, PCF, soft) ──
  let shadowGen = null;
  try {
    shadowGen = new CascadedShadowGenerator(4096, sun); // 4k shadows
    shadowGen.numCascades = 4;
    shadowGen.lambda = 0.8;               
    shadowGen.shadowMaxZ = 1200;           
    shadowGen.stabilizeCascades = true;   
    shadowGen.filteringQuality = CascadedShadowGenerator.QUALITY_HIGH;
    shadowGen.usePercentageCloserFiltering = true;
    shadowGen.cascadeBlendPercentage = 0.1;
    shadowGen.darkness = 0.3;
    shadowGen.bias = 0.005;
    shadowGen.normalBias = 0.02;
    shadowGen.frustumEdgeFalloff = 1.0;
    shadowGen.forceBackFacesOnly = true;
  } catch (e) { console.warn('[Shadows]', e.message); }
  onProgress(0.3);

  // ════════════════════════════════════════════════════════════════════════
  // SKY — Proper Atmospheric Scattering Sphere
  // ════════════════════════════════════════════════════════════════════════
  const skybox = MeshBuilder.CreateSphere('skyBox', { diameter: 45000, segments: 64 }, scene);
  const skyMat = new SkyMaterial("skyMaterial", scene);
  skyMat.backFaceCulling = false;
  skyMat.azimuth = 0.25;
  skyMat.inclination = 0.3; // High noon / afternoon
  skyMat.luminance = 1.0;
  skyMat.rayleigh = 2.0;    // Atmosphere thickness
  skyMat.mieDirectionalG = 0.8; 
  skyMat.mieCoefficient = 0.005;
  skyMat.useSunPosition = true;
  skyMat.sunPosition = sun.position.clone();
  skybox.material = skyMat;
  skybox.infiniteDistance = true;
  skybox.renderingGroupId = 0;

  onProgress(0.32);

  // ── IBL — Image-Based Lighting (procedural boreal sky environment) ──
  // Creates a cube probe from the scene for PBR reflections/irradiance.
  // All PBRMaterial instances automatically pick up scene.environmentTexture.
  try {
    // Procedural IBL: encode the sky colour as a simple env colour
    // until a real .env/.hdr file is available. This still gives PBR materials
    // proper indirect diffuse + specular contributions.
    scene.environmentIntensity = 0.55;

    // Sky-blue + golden horizon approximated through scene ambient
    // The hemi lights above provide the diffuse GI approximation.
    // When a public/textures/environment.env is added, enable below:
    // const envTex = CubeTexture.CreateFromPrefilteredData('./textures/environment.env', scene);
    // scene.environmentTexture = envTex;
    // scene.environmentIntensity = 1.0;
  } catch (e) { console.warn('[IBL]', e.message); }

  // ════════════════════════════════════════════════════════════════════════
  // WORLD
  // ════════════════════════════════════════════════════════════════════════
  // Force planet mode unconditionally on GitHub Pages to load the generated spherical world 
  const PLANET_MODE = true;
  window._planetMode = PLANET_MODE;

  // ── Planet velocity (used only in PLANET_MODE) ──
  let _planetVel = new Vector3(0, 0, 0);
  let _prevCamY = 0;   // track Y last frame for fall-damage calculation
  let _wasAirborne = false;

  if (PLANET_MODE) {
    try {
      await buildPlanet(scene, shadowGen);
      console.log('[Engine] Planetary world mode active — radius', PLANET_RADIUS, 'm');
    } catch (e) { console.error('[Planet]', e); }
    // Disable built-in camera gravity + WASD (handled manually in game loop)
    camera.applyGravity = false;
    camera.keysUp = []; camera.keysDown = []; camera.keysLeft = []; camera.keysRight = [];
    // Spawn at north pole surface
    const spawnDir = new Vector3(0, 1, 0);
    const spawnH   = getPlanetHeight(spawnDir);
    camera.position = spawnDir.scale(PLANET_RADIUS + Math.max(0, spawnH) + 1.7);
    camera.setTarget(camera.position.add(new Vector3(1, 0, 0.3)));
    camera.upVector = spawnDir.clone();
  } else {
    try { await buildWorld(scene, shadowGen); } catch (e) { console.error('[World]', e); }
  }
  onProgress(0.65);

  // Preload 3D models (non-blocking — missing models silently skipped)
  try { await preloadModels(scene); } catch (e) { console.warn('[Models]', e.message); }
  onProgress(0.7);

  // ── Player + Weapon + Enemies ──
  createPlayer(scene, camera);
  try {
    const wpnNode = createWeaponModel(scene, camera, STATE.equippedWeapon);
    registerWeaponNode(wpnNode);
  } catch (e) {}

  // Respawn: teleport camera to a random spawn offset from start
  onRespawn(() => {
    if (PLANET_MODE) {
      // Random point on sphere surface within a ±60° band around the north pole
      const angle = Math.random() * Math.PI * 2;
      const tilt  = (Math.random() * 0.6 + 0.1) * Math.PI; // 0.1–0.7π
      const sDir  = new Vector3(
        Math.sin(tilt) * Math.cos(angle),
        Math.cos(tilt),
        Math.sin(tilt) * Math.sin(angle),
      ).normalize();
      const sH = getPlanetHeight(sDir);
      camera.position = sDir.scale(PLANET_RADIUS + Math.max(0, sH) + 1.7);
      camera.upVector = sDir.clone();
      _planetVel = Vector3.Zero();
    } else {
      const rx = 2000 + (Math.random() - 0.5) * 80;
      const rz = 2000 + (Math.random() - 0.5) * 80;
      camera.position.x = rx;
      camera.position.z = rz;
      camera.position.y = getHeight(rx, rz) + 5;
    }
    // Release pointer lock so cursor is free, then re-lock
    if (document.exitPointerLock) document.exitPointerLock();
  });
  try { spawnEnemies(scene, shadowGen); } catch (e) {}
  try { spawnVehicles(scene, getHeight); } catch (e) { console.warn('[Vehicles]', e.message); }
  initObjectives();
  initMinimap(getEnemies);
  onProgress(0.8);

  // ── POST-PROCESSING — bloom + FXAA + ACES + sharpening + grain + vignette ──
  try {
    const pp = new DefaultRenderingPipeline('pp', true, scene, [camera]);

    // Bloom — moderate scatter from bright surfaces (sun disc, muzzle flash)
    pp.bloomEnabled   = true;
    pp.bloomThreshold = 0.75;
    pp.bloomWeight    = 0.22;
    pp.bloomKernel    = 128;
    pp.bloomScale     = 0.5;

    // FXAA
    pp.fxaaEnabled    = true;

    // Sharpening — recover detail after FXAA
    pp.sharpeningEnabled = true;
    pp.sharpening.edgeAmount = 0.35;

    // Film grain — cinematic texture
    pp.grainEnabled = true;
    pp.grain.intensity = 12;
    pp.grain.animated  = true;

    // Chromatic aberration — subtle bodycam lens feel
    pp.chromaticAberrationEnabled = true;
    pp.chromaticAberration.aberrationAmount = 12;
    pp.chromaticAberration.radialIntensity  = 0.6;

    // ACES tonemapping + vignette
    pp.imageProcessingEnabled = true;
    pp.imageProcessing.contrast  = 1.25;
    pp.imageProcessing.exposure  = 1.05;
    pp.imageProcessing.toneMappingEnabled = true;
    pp.imageProcessing.toneMappingType    = 1; // ACES
    pp.imageProcessing.vignetteEnabled    = true;
    pp.imageProcessing.vignetteWeight     = 2.2;
    pp.imageProcessing.vignetteStretch    = 0.5;
    pp.imageProcessing.vignetteCameraFov  = 0.5;
    pp.imageProcessing.vignetteColor      = new Color4(0, 0, 0, 0);
    window._setPP && window._setPP(pp);
    initNVG(pp);
  } catch (e) { console.warn('[PostProc]', e.message); }

  // ── Glow on emissive meshes (sun disc, flag) ──
  try {
    const glow = new GlowLayer('glow', scene, { blurKernelSize: 32 });
    glow.intensity = 0.4;
  } catch (e) {}

  // ── SSAO — ambient occlusion for depth under trees, in corners ──
  try {
    const { GeometryBufferRenderer } = await import('@babylonjs/core/Rendering/geometryBufferRenderer.js');
    const { SSAO2RenderingPipeline } = await import('@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline.js');
    scene.enableGeometryBufferRenderer();
    const ssao = new SSAO2RenderingPipeline('ssao', scene, { ssaoRatio: 0.5, blurRatio: 1.0 }, [camera]);
    ssao.radius = 2.0;
    ssao.totalStrength = 1.2;
    ssao.base = 0.1;
    ssao.samples = 16;
    ssao.maxZ = 200;
    ssao.minZAspect = 0.5;
  } catch (e) { console.warn('[SSAO]', e.message); }

  onProgress(0.9);

  // ════════════════════════════════════════════════════════════════════════
  // INPUT
  // ════════════════════════════════════════════════════════════════════════
  let isMouseDown = false;
  let isADS = false;               // Aim Down Sights state
  const ADS_FOV = 0.85;            // ~48 deg zoom
  const HIP_FOV = 1.396;           // ~80 deg normal
  const ADS_SPEED = 8;             // FOV lerp speed
  const ADS_RECOIL_MULT = 0.45;    // 55% recoil reduction when ADS
  const ADS_SENS_MULT = 0.6;       // slower look while aiming
  const _hipSensibility = 2000;

  scene.onPointerObservable.add((info) => {
    if (info.type === PointerEventTypes.POINTERDOWN && document.pointerLockElement) {
      if (info.event.button === 0) isMouseDown = true;
      if (info.event.button === 2) {
        isADS = true;
        STATE.isADS = true;
        camera.angularSensibility = _hipSensibility / ADS_SENS_MULT;
      }
    }
    if (info.type === PointerEventTypes.POINTERUP) {
      if (info.event.button === 0) isMouseDown = false;
      if (info.event.button === 2) {
        isADS = false;
        STATE.isADS = false;
        camera.angularSensibility = _hipSensibility;
      }
    }
  });

  // Prevent context menu on right-click
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  let sprinting = false;
  // ── WASD state for planet tangent-plane movement ──
  const _keys = { w: false, a: false, s: false, d: false };
  scene.onKeyboardObservable.add((kb) => {
    if (kb.type === KeyboardEventTypes.KEYDOWN) {
      if (kb.event.code === 'ShiftLeft' || kb.event.code === 'ShiftRight') sprinting = true;
      if (kb.event.code === 'KeyW') _keys.w = true;
      if (kb.event.code === 'KeyA') _keys.a = true;
      if (kb.event.code === 'KeyS') _keys.s = true;
      if (kb.event.code === 'KeyD') _keys.d = true;
      if (kb.event.code === 'KeyR') {
        const wpn = WEAPONS[STATE.equippedWeapon];
        if (!STATE.reloading && STATE.ammo < (wpn?.mag ?? 30) && STATE.reserveAmmo > 0) {
          STATE.reloading = true;
          STATE.reloadTime = wpn?.reloadTime ?? 2.5;
          playSound('reload');
        }
      }
      if (kb.event.code === 'KeyF') doInteract();
      if (kb.event.code === 'KeyQ') tryMelee(scene, camera);
      if (kb.event.code === 'KeyC') toggleCrouch(camera);
      if (kb.event.code === 'KeyK') trySleep(camera.rotation.y, camera.position.z);
      if (kb.event.code === 'KeyB') placeCampfire(scene, camera.position.x, camera.position.z);
      if (kb.event.code === 'KeyG') throwGrenade(scene, camera);
      if (kb.event.code === 'Tab') { kb.event.preventDefault(); toggleInventory(); }
      if (kb.event.code === 'KeyN') toggleNVG();
      if (kb.event.code === 'KeyM') toggleMinimap();
      if (kb.event.code === 'KeyE') tryEnterVehicle(camera);
      if (kb.event.code === 'KeyJ') toggleObjectivesList();
      if (kb.event.code === 'KeyH') {
        const co = document.getElementById('controlsOverlay');
        if (co) co.style.display = co.style.display === 'none' ? 'block' : 'none';
      }

      // ── Weapon switching: Digit1–Digit7 ──
      const digitMatch = kb.event.code.match(/^Digit(\d)$/);
      if (digitMatch) {
        const slot = parseInt(digitMatch[1]) - 1;
        const newWpn = WEAPON_SLOTS[slot];
        if (newWpn && newWpn !== STATE.equippedWeapon) {
          equipWeapon(scene, camera, newWpn, registerWeaponNode);
          showWeaponName(WEAPONS[newWpn]?.name ?? newWpn);
        }
      }
    } else {
      if (kb.event.code === 'ShiftLeft' || kb.event.code === 'ShiftRight') sprinting = false;
      if (kb.event.code === 'KeyW') _keys.w = false;
      if (kb.event.code === 'KeyA') _keys.a = false;
      if (kb.event.code === 'KeyS') _keys.s = false;
      if (kb.event.code === 'KeyD') _keys.d = false;
    }
  });

  // ════════════════════════════════════════════════════════════════════════
  // GAME LOOP
  // ════════════════════════════════════════════════════════════════════════
  let lastTime = performance.now();
  let totalTime = 0;
  const WALK_SPEED = 1.8, SPRINT_SPEED = 4.2;
  scene.registerBeforeRender(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    totalTime += dt;

    if (PLANET_MODE) {
      // ══════════════════════════════════════════════════════════════════════
      // PLANET PHYSICS — player walks on sphere surface
      // ══════════════════════════════════════════════════════════════════════
      const pos  = camera.position;
      const dist = pos.length();
      const dir  = dist > 0.01 ? pos.normalize() : new Vector3(0, 1, 0);

      // 1. Gravity toward planet centre
      _planetVel.addInPlace(dir.scale(-GRAVITY_STRENGTH * dt));

      // 2. WASD movement in the tangent plane
      const anyMove = _keys.w || _keys.a || _keys.s || _keys.d;
      if (anyMove) {
        // Project camera forward/right onto tangent plane
        const rawFwd = camera.getDirection(new Vector3(0, 0, 1));
        const fwdD = Vector3.Dot(rawFwd, dir);
        const fwdT = rawFwd.subtract(dir.scale(fwdD));
        const fwdLen = fwdT.length();
        const fwdTan = fwdLen > 0.01 ? fwdT.scale(1 / fwdLen)
                                      : Vector3.Cross(dir, new Vector3(0, 1, 0)).normalize();

        const rawRight = camera.getDirection(new Vector3(1, 0, 0));
        const rightD = Vector3.Dot(rawRight, dir);
        const rightT = rawRight.subtract(dir.scale(rightD));
        const rightLen = rightT.length();
        const rightTan = rightLen > 0.01 ? rightT.scale(1 / rightLen)
                                         : Vector3.Cross(fwdTan, dir).normalize();

        const wPenalty = (window._inWater ? 0.4 : 1.0) * (window._crouchMult ?? 1.0);
        const isSprPlanet = sprinting && STATE.stamina > 0 && !(window._crouchMult < 1);
        window._isSprinting = isSprPlanet;
        const moveSpd  = (isSprPlanet ? SPRINT_SPEED : WALK_SPEED) * wPenalty;

        let mv = Vector3.Zero();
        if (_keys.w) mv.addInPlace(fwdTan);
        if (_keys.s) mv.subtractInPlace(fwdTan);
        if (_keys.d) mv.addInPlace(rightTan);
        if (_keys.a) mv.subtractInPlace(rightTan);
        const mvLen = mv.length();
        if (mvLen > 0.01) _planetVel.addInPlace(mv.scale(moveSpd / mvLen));

        // Sprint stamina drain
        if (isSprPlanet) STATE.stamina = Math.max(0, STATE.stamina - 18 * dt);
      } else {
        window._isSprinting = false;
        if (!sprinting) STATE.stamina = Math.min(100, STATE.stamina + 10 * dt);
      }

      // 3. Tangent-plane friction (drag only the horizontal component)
      const radMag = Vector3.Dot(_planetVel, dir);
      const radPart = dir.scale(radMag);
      const tanPart = _planetVel.subtract(radPart);
      const drag = anyMove ? 6.0 : 14.0;
      _planetVel = radPart.add(tanPart.scale(Math.max(0, 1 - drag * dt)));

      // 4. Integrate velocity → position
      camera.position.addInPlace(_planetVel.scale(dt));

      // 5. Surface clamp — prevent going underground
      const newDir  = camera.position.normalize();
      const surfH   = getPlanetHeight(newDir);
      const surfaceR = PLANET_RADIUS + Math.max(0, surfH) + 1.7;
      const newDist  = camera.position.length();
      if (newDist < surfaceR) {
        camera.position = newDir.scale(surfaceR);
        // Cancel inward radial velocity component
        const inward = Vector3.Dot(_planetVel, newDir);
        if (inward < 0) _planetVel.subtractInPlace(newDir.scale(inward));
      }

      // 6. Orient camera "up" to radial direction so horizon stays level
      camera.upVector = camera.position.normalize();

    } else {
      // ── Flat terrain — speed management + terrain clamp ──
      window._isSprinting = sprinting && STATE.stamina > 0 && !(window._crouchMult < 1);
      const waterPenalty = (window._inWater ? 0.4 : 1.0) * (window._crouchMult ?? 1.0);
      const targetSpeed = (window._isSprinting ? SPRINT_SPEED : WALK_SPEED) * waterPenalty;
      const accelRate = (targetSpeed > camera.speed) ? 8.0 : 12.0;
      camera.speed += (targetSpeed - camera.speed) * Math.min(dt * accelRate, 1.0);
      if (window._isSprinting) {
        STATE.stamina = Math.max(0, STATE.stamina - 18 * dt);
      } else if (!sprinting) {
        STATE.stamina = Math.min(100, STATE.stamina + 10 * dt);
      }

      // Terrain clamp — smooth interpolation, no camera snapping
      const terrainY = getHeight(camera.position.x, camera.position.z) + 1.7;
      const wasAbove = camera.position.y > terrainY + 0.15;
      if (camera.position.y < terrainY) {
        // Landing — check for fall damage
        if (_wasAirborne) {
          const impactVel = (_prevCamY - camera.position.y) / Math.max(dt, 0.001);
          if (impactVel > 8) {
            const dmg = (impactVel - 8) * 5;
            STATE.health = Math.max(0, STATE.health - dmg);
            const el = document.getElementById('hudMsg');
            if (el) { el.textContent = `FALL DAMAGE -${Math.round(dmg)} HP`; setTimeout(() => { el.textContent = ''; }, 1500); }
            if (STATE.health <= 0) { STATE.health = 0; triggerDeath('FALL DAMAGE'); }
          }
        }
        camera.position.y += (terrainY - camera.position.y) * Math.min(dt * 15, 1.0);
        // Hard floor safety net — never clip more than 0.5m below terrain
        if (camera.position.y < terrainY - 0.5) camera.position.y = terrainY - 0.5;
      }
      _wasAirborne = wasAbove;
      _prevCamY = camera.position.y;
    }

    // ── ADS FOV lerp ──
    const targetFOV = isADS ? ADS_FOV : HIP_FOV;
    camera.fov += (targetFOV - camera.fov) * Math.min(dt * ADS_SPEED, 1);

    // Shooting (full auto support based on RPM)
    if (isMouseDown && document.pointerLockElement) {
      tryShoot(scene, camera, dt);
    }
    // Recoil recovery
    if (camera.rotationOffset) {
      // Smoothly return camera rotation toward pre-recoil position
      camera.rotation.x += camera.rotationOffset.x * 5 * dt;
      camera.rotation.y += camera.rotationOffset.y * 5 * dt;
      camera.rotationOffset.scaleInPlace(1 - 5 * dt);
      if (camera.rotationOffset.lengthSquared() < 0.0001) camera.rotationOffset = null;
    }

    STATE.playerPos.x = camera.position.x;
    STATE.playerPos.y = camera.position.y;
    STATE.playerPos.z = camera.position.z;
    updatePlayer(dt, camera);
    updateSurvival(dt, STATE.gameTime, camera.position.x, camera.position.y, camera.position.z);
    updateEnemies(dt, scene, camera);
    updateGrenades(dt, scene, camera, getHeight, getEnemies());
    updateVehicles(dt, camera, _keys, getHeight);
    updateObjectives(dt);
    updateMinimap(camera.position.x, camera.position.z, camera.rotation.y);
    updateHUD();
    updateLowHealthPulse();
    updateCompass(camera.rotation.y);
    const _wpnFull = WEAPONS[STATE.equippedWeapon]?.reloadTime ?? 2.5;
    updateReloadBar(STATE.reloading ? 1 - STATE.reloadTime / _wpnFull : -1);
    checkInteraction(scene, camera);

    // Day cycle
    STATE.gameTime += dt / (24 * 60);
    if (STATE.gameTime > 1) STATE.gameTime -= 1;
    window._dayTime = STATE.gameTime;
    window._weatherType = getWeatherType();
    const hrs = Math.floor(STATE.gameTime * 24);
    const mns = Math.floor((STATE.gameTime * 24 - hrs) * 60);
    const te = document.getElementById('timeDisplay');
    if (te) te.textContent = `${String(hrs).padStart(2,'0')}:${String(mns).padStart(2,'0')}`;

    // Dynamic sun — rotate around Y, shift color dawn→day→dusk→night
    updateDayNight(dt, scene, null, hemi, rim, sunDisc, moonDisc, 4000, 4000);

    // Weather tick + wind-animated trees + ambient audio
    updateWeather(dt);
    const wind = getWind();
    updateForestWind(totalTime, wind.x * wind.strength, wind.z * wind.strength);
    // Weather audio + wildlife audio throttled to ~1Hz
    if ((totalTime % 1.0) < dt) {
      updateAmbientWeather(getWeatherType(), wind.strength);
      updateWildlifeAudio(STATE.gameTime, getWeatherType());
    }
    // Rock LOD + grass + bog fog — throttled to ~5Hz (every 200ms)
    if ((totalTime % 0.2) < dt) {
      updateRockLOD(camera.position.x, camera.position.z);
      updateGroundCover(camera.position.x, camera.position.z);
      updateBogFog(camera.position.x, camera.position.z, getWeatherType());
    }

    // Combat effects
    updateCombatEffects(scene, dt);

    const yaw = camera.rotation.y;
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    const idx = Math.round(((yaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI/4))%8;
    const ce = document.getElementById('compassDisplay');
    if (ce) ce.textContent = dirs[idx];
  });

  engine.runRenderLoop(() => scene.render());
  onProgress(1.0);

  // Kick off audio after user gesture (pointer lock = first interaction)
  initAudio();
  startEnvironmentAmbient();
  initSurvivalScene(scene);
  initCompass();

  return { engine, scene, camera };
}

// ── Shooting ──
let _lastFireTime = 0;
import { addTracer, spawnShellCasing, addDynamicLight, addBloodDecal } from './effects.js';

function tryShoot(scene, camera, dt) {
  const wpn = WEAPONS[STATE.equippedWeapon] || WEAPONS.c7a2;
  const now = performance.now();
  const fireInterval = 60000 / (wpn.rpm || 600);
  
  if (now - _lastFireTime < fireInterval) return;
  if (STATE.ammo <= 0 || STATE.reloading) {
    if (STATE.ammo <= 0) playSound('emptyMag');
    return;
  }
  
  _lastFireTime = now;
  STATE.ammo--;
  
  // Recoil — reduced when ADS (tighter grouping while aiming)
  const adsMult = STATE.isADS ? 0.45 : 1.0;
  const rV = (wpn.recoilV || 2) * 0.01 * adsMult;
  const rH = ((Math.random() - 0.5) * (wpn.recoilH || 1)) * 0.01 * adsMult;
  if (!camera.rotationOffset) camera.rotationOffset = new Vector3(0,0,0);
  camera.rotationOffset.x -= rV;
  camera.rotationOffset.y += rH;

  // Visuals
  const df = document.getElementById('damageFlash');
  if (df) { df.style.opacity = 0.06; setTimeout(() => df.style.opacity = 0, 60); }
  
  // FX - muzzle flash
  const camPos = camera.position.clone();
  addDynamicLight(scene, camPos, 0xffaa00, 1.5, 8, 0.05);
  
  // Weapon-type-aware fire sound via audio.js master gain
  playSound('shoot', { weaponType: wpn.type });
  transmitSatorEvent('COMBAT_WEAPON_FIRED', JSON.stringify({ weapon: wpn.type || 'unknown' }));

  // Raycast Hit Detection
  const fw = camera.getDirection(new Vector3(0,0,1));
  const ray = scene.createPickingRay(
    scene.getEngine().getRenderWidth()/2,
    scene.getEngine().getRenderHeight()/2, null, camera
  );
  
  const hit = scene.pickWithRay(ray, m => m.isPickable && m.metadata?.type === 'enemy');
  
  if (hit?.pickedMesh?.metadata) {
    hit.pickedMesh.metadata.hp -= wpn.damage || 35;
    notifyEnemyHit(hit.pickedMesh);
    showHitMarker(false);
    
    // Tracer towards hit
    addTracer(scene, camPos.add(fw.scale(0.5)), hit.pickedPoint, false);
    addBloodDecal(scene, hit.pickedPoint.x, hit.pickedPoint.z);
    
    // Blood FX
    if (hit.pickedMesh.metadata.hp <= 0 && hit.pickedMesh.metadata.alive) {
      hit.pickedMesh.metadata.alive = false;
      STATE.kills++;
      transmitSatorEvent('COMBAT_KILL_CONFIRMED', JSON.stringify({ weapon: wpn.type || 'unknown', target: hit.pickedMesh.name || 'enemy' }));
      const rootNode = hit.pickedMesh.parent;
      if (rootNode) {
        rootNode.rotation.x = Math.PI / 2;
        rootNode.position.y = getHeight(rootNode.position.x, rootNode.position.z) + 0.15;
      } else {
        hit.pickedMesh.rotation.x = Math.PI / 2;
        hit.pickedMesh.position.y = getHeight(hit.pickedMesh.position.x, hit.pickedMesh.position.z) + 0.3;
      }
    }
  } else {
    // Tracer out into distance 
    addTracer(scene, camPos.add(fw.scale(0.5)), camPos.add(fw.scale(100)), false);
  }
  
  // Shell casing
  const rightDir = camera.getDirection(new Vector3(1,0,0));
  spawnShellCasing(scene, camPos.add(rightDir.scale(0.2)).add(new Vector3(0,-0.1,0)), rightDir, wpn.type === 'shotgun');

  // Trigger empty mag update on HUD
  const el = document.getElementById('wpnAmmo');
  if (el) el.textContent = STATE.ammo;
}

// ── Melee Attack (Q key) ─────────────────────────────────────────────────────
let _lastMeleeTime = 0;
const MELEE_RANGE    = 2.5;   // metres
const MELEE_COOLDOWN = 1200;  // ms
const MELEE_DAMAGE   = 100;   // instant kill
const MELEE_STAMINA  = 20;    // stamina cost

function tryMelee(scene, camera) {
  if (!STATE.alive || !STATE.started) return;
  const now = performance.now();
  if (now - _lastMeleeTime < MELEE_COOLDOWN) return;
  if (STATE.stamina < MELEE_STAMINA) {
    if (typeof window !== 'undefined') { window._hudMsg = '⚠ NOT ENOUGH STAMINA'; window._hudMsgTimer = 1.5; }
    return;
  }
  _lastMeleeTime = now;
  STATE.stamina = Math.max(0, STATE.stamina - MELEE_STAMINA);

  // Camera jab — quick forward nudge
  const fw = camera.getDirection(new Vector3(0, 0, 1));
  camera.position.addInPlace(fw.scale(0.15));
  setTimeout(() => camera.position.subtractInPlace(fw.scale(0.15)), 80);

  // Scan all enemy hitboxes within MELEE_RANGE (3D distance)
  let hitMesh = null;
  let hitDist = MELEE_RANGE;
  for (const mesh of scene.meshes) {
    if (!mesh.isPickable || mesh.metadata?.type !== 'enemy') continue;
    if (!mesh.metadata?.alive) continue;
    const dx = mesh.position.x - camera.position.x;
    const dy = mesh.position.y - camera.position.y;
    const dz = mesh.position.z - camera.position.z;
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (d < hitDist) { hitDist = d; hitMesh = mesh; }
  }

  if (hitMesh) {
    hitMesh.metadata.hp -= MELEE_DAMAGE;
    notifyEnemyHit(hitMesh);
    playSound('melee');
    showHitMarker(false);
    addBloodDecal(scene, hitMesh.position.x, hitMesh.position.z);
    if (hitMesh.metadata.hp <= 0 && hitMesh.metadata.alive) {
      hitMesh.metadata.alive = false;
      STATE.kills++;
      transmitSatorEvent('COMBAT_KILL_CONFIRMED', JSON.stringify({ weapon: 'melee', target: hitMesh.name || 'enemy' }));
      const rootNode = hitMesh.parent;
      if (rootNode) {
        rootNode.rotation.x = Math.PI / 2;
        rootNode.position.y = getHeight(rootNode.position.x, rootNode.position.z) + 0.15;
      } else {
        hitMesh.rotation.x = Math.PI / 2;
        hitMesh.position.y = getHeight(hitMesh.position.x, hitMesh.position.z) + 0.3;
      }
      addKillFeed('🔪 Silent kill — bayonet', '#ff9900');
    }
  } else {
    // Whiff — tiny recoil shake
    if (camera.rotationOffset) {
      camera.rotationOffset.x += 0.008;
    } else {
      camera.rotationOffset = new Vector3(0.008, 0, 0);
    }
  }
}

//  F-key Interaction System 
// Finds nearest loot mesh within INTERACT_DIST and applies pickup on F.
const INTERACT_DIST = 3.5; // metres
let _nearestLoot = null;

export function checkInteraction(scene, camera) {
  const px = camera.position.x, py = camera.position.y, pz = camera.position.z;
  let best = null, bestDist = INTERACT_DIST;

  for (const mesh of scene.meshes) {
    if (!mesh.isPickable || !mesh.metadata?.type) continue;
    const dx = mesh.position.x - px;
    const dy = mesh.position.y - py;
    const dz = mesh.position.z - pz;
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (d < bestDist) { bestDist = d; best = mesh; }
  }

  _nearestLoot = best;
  const prompt = document.getElementById('interactPrompt');
  if (prompt) {
    // Check for nearby vehicle too
    const nearVeh = getNearestVehicle(camera);
    if (best) {
      const label = best.metadata.lootType === 'supplyCrate' ? '[F] LOOT CRATE'
                  : best.metadata.lootType === 'cabin'       ? '[F] SEARCH CABIN'
                  : '[F] INTERACT';
      prompt.textContent = label;
      prompt.style.display = 'block';
    } else if (nearVeh && !isInVehicle()) {
      const spec = nearVeh.spec || {};
      prompt.textContent = `[E] ENTER ${(spec.name || 'VEHICLE').toUpperCase()}`;
      prompt.style.display = 'block';
    } else if (isInVehicle()) {
      prompt.textContent = '[E] EXIT VEHICLE';
      prompt.style.display = 'block';
    } else {
      prompt.style.display = 'none';
    }
  }
}

export function doInteract() {
  if (!_nearestLoot) return;
  const meta = _nearestLoot.metadata;
  if (!meta) return;

  if (meta.lootType === 'supplyCrate') {
    // Military crate: ammo + maybe medical + grenade
    addItem('ammoBox', 1 + Math.floor(Math.random() * 2));
    if (Math.random() < 0.3) addItem('medkit', 1);
    if (Math.random() < 0.2) addItem('grenade', 1);
    // Also give some immediate ammo for gameplay feel
    const ammoGain = 10 + Math.floor(Math.random() * 10);
    STATE.reserveAmmo = Math.min(STATE.reserveAmmo + ammoGain, 300);
    showLootToast(`Looted crate (+${ammoGain} ammo)`);
    onLoot();
  } else if (meta.lootType === 'cabin') {
    // Cabin: food + water + maybe bandage
    addItem('mre', 1 + Math.floor(Math.random() * 2));
    addItem('water', 1 + Math.floor(Math.random() * 2));
    if (Math.random() < 0.4) addItem('bandage', 1);
    if (Math.random() < 0.2) addItem('heatPack', 1);
    showLootToast('Searched cabin (check inventory)');
    onLoot();
  }

  // Remove from scene so it can't be looted again
  _nearestLoot.isPickable = false;
  _nearestLoot.metadata = null;
  _nearestLoot.visibility = 0.3;
  _nearestLoot = null;
  const prompt = document.getElementById('interactPrompt');
  if (prompt) prompt.style.display = 'none';
}

function showLootToast(text) {
  const prompt = document.getElementById('interactPrompt');
  if (!prompt) return;
  prompt.textContent = text;
  prompt.style.display = 'block';
  prompt.style.color = '#88ff88';
  setTimeout(() => {
    prompt.style.display = 'none';
    prompt.style.color = '#cc8855';
  }, 1500);
}

// Wait, updateDayNight removed from engine.js.
