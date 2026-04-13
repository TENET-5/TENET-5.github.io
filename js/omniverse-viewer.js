/* ═══════════════════════════════════════════════════════════════
   TENET⁵ Omniverse USD Viewer — Three.js WebGL engine
   NVIDIA Omniverse-style 3D viewport for GLB / GLTF / USDZ
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const NV_GREEN  = 0x76b900;
  const NV_DARK   = 0x0a0a0a;
  const GRID_CLR  = 0x1a1a2e;
  const GRID_FADE = 0x0d0d16;
  const ACCENT    = 0xdc2626; // TENET⁵ red

  /* ── Utility ──────────────────────────────────────────────── */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ── OmniverseViewer ─────────────────────────────────────── */
  class OmniverseViewer {
    constructor(container, opts = {}) {
      this.container = typeof container === 'string'
        ? document.getElementById(container)
        : container;
      if (!this.container) throw new Error('[OV] container not found');

      this.opts = Object.assign({
        antialias:   true,
        pixelRatio:  Math.min(window.devicePixelRatio, 2),
        gridSize:    40,
        gridDiv:     40,
        showStats:   true,
        bloom:       !this._isMobile(),
        envIntensity: 0.8,
        accentColor: ACCENT,
        bgColor:     NV_DARK,
      }, opts);

      this._clock       = new THREE.Clock();
      this._mixers      = [];
      this._currentModel = null;
      this._particles   = null;
      this._frameId     = null;
      this._disposed    = false;

      this._initRenderer();
      this._initScene();
      this._initCamera();
      this._initControls();
      this._initLights();
      this._initGrid();
      this._initParticles();
      if (this.opts.bloom) this._initBloom();
      this._initResize();
      this._animate();

      this._fire('ready');
    }

    /* ── Renderer ───────────────────────────────────────────── */
    _initRenderer() {
      const r = new THREE.WebGLRenderer({
        antialias: this.opts.antialias,
        alpha: false,
        powerPreference: 'high-performance',
      });
      r.setPixelRatio(this.opts.pixelRatio);
      r.setSize(this.container.clientWidth, this.container.clientHeight);
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.2;
      r.shadowMap.enabled = true;
      r.shadowMap.type = THREE.PCFSoftShadowMap;
      r.domElement.classList.add('ov-canvas');
      this.container.appendChild(r.domElement);
      this.renderer = r;
    }

    /* ── Scene ──────────────────────────────────────────────── */
    _initScene() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.opts.bgColor);
      this.scene.fog = new THREE.FogExp2(this.opts.bgColor, 0.015);
    }

    /* ── Camera ─────────────────────────────────────────────── */
    _initCamera() {
      const aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
      this.camera.position.set(5, 3, 8);
      this.camera.lookAt(0, 0.5, 0);
    }

    /* ── OrbitControls ──────────────────────────────────────── */
    _initControls() {
      if (!THREE.OrbitControls) return;
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance   = 1;
      this.controls.maxDistance   = 100;
      this.controls.maxPolarAngle = Math.PI * 0.48;
      this.controls.target.set(0, 0.5, 0);
    }

    /* ── Lights ─────────────────────────────────────────────── */
    _initLights() {
      // ambient
      const amb = new THREE.AmbientLight(0xffffff, 0.3);
      this.scene.add(amb);

      // key light (NVIDIA green tint)
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(5, 8, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 50;
      key.shadow.camera.left = -10;
      key.shadow.camera.right = 10;
      key.shadow.camera.top = 10;
      key.shadow.camera.bottom = -10;
      this.scene.add(key);
      this._keyLight = key;

      // fill (accent red)
      const fill = new THREE.DirectionalLight(this.opts.accentColor, 0.3);
      fill.position.set(-3, 4, -5);
      this.scene.add(fill);

      // rim (NVIDIA green)
      const rim = new THREE.PointLight(NV_GREEN, 0.4, 30);
      rim.position.set(0, 5, -5);
      this.scene.add(rim);

      // hemisphere
      const hemi = new THREE.HemisphereLight(0x404060, 0x0a0a0a, 0.4);
      this.scene.add(hemi);
    }

    /* ── Infinite Grid ──────────────────────────────────────── */
    _initGrid() {
      const gs = this.opts.gridSize;
      const gd = this.opts.gridDiv;

      // Major grid
      const major = new THREE.GridHelper(gs, gd, GRID_CLR, GRID_FADE);
      major.material.transparent = true;
      major.material.opacity = 0.5;
      major.material.depthWrite = false;
      this.scene.add(major);

      // Minor grid
      const minor = new THREE.GridHelper(gs, gd * 4, GRID_CLR, GRID_FADE);
      minor.material.transparent = true;
      minor.material.opacity = 0.15;
      minor.material.depthWrite = false;
      this.scene.add(minor);

      // ground plane for shadows
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(gs, gs),
        new THREE.ShadowMaterial({ opacity: 0.25 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);
    }

    /* ── Ambient Particles ──────────────────────────────────── */
    _initParticles() {
      const count = this._isMobile() ? 500 : 2000;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 30;
        pos[i * 3 + 1] = Math.random() * 15;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
        vel[i * 3]     = (Math.random() - 0.5) * 0.002;
        vel[i * 3 + 1] = Math.random() * 0.003 + 0.001;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this._particleVel = vel;

      const mat = new THREE.PointsMaterial({
        color: NV_GREEN,
        size: 0.04,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this._particles = new THREE.Points(geo, mat);
      this.scene.add(this._particles);
    }

    /* ── Post-Processing (Bloom) ────────────────────────────── */
    _initBloom() {
      if (!THREE.EffectComposer || !THREE.UnrealBloomPass) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this._composer = new THREE.EffectComposer(this.renderer);
      this._composer.addPass(new THREE.RenderPass(this.scene, this.camera));
      const bloom = new THREE.UnrealBloomPass(
        new THREE.Vector2(w, h), 0.4, 0.6, 0.85
      );
      this._composer.addPass(bloom);
      this._bloomPass = bloom;
    }

    /* ── Resize Handler ─────────────────────────────────────── */
    _initResize() {
      const ro = new ResizeObserver(() => {
        if (this._disposed) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        if (this._composer) this._composer.setSize(w, h);
      });
      ro.observe(this.container);
      this._ro = ro;
    }

    /* ── Animation Loop ─────────────────────────────────────── */
    _animate() {
      if (this._disposed) return;
      this._frameId = requestAnimationFrame(() => this._animate());
      const dt = this._clock.getDelta();
      const t  = this._clock.getElapsedTime();

      // update controls
      if (this.controls) this.controls.update();

      // update animation mixers
      this._mixers.forEach(m => m.update(dt));

      // update particles
      if (this._particles) {
        const pos = this._particles.geometry.attributes.position.array;
        const vel = this._particleVel;
        for (let i = 0; i < pos.length / 3; i++) {
          pos[i * 3]     += vel[i * 3];
          pos[i * 3 + 1] += vel[i * 3 + 1];
          pos[i * 3 + 2] += vel[i * 3 + 2];
          if (pos[i * 3 + 1] > 15) {
            pos[i * 3]     = (Math.random() - 0.5) * 30;
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
          }
        }
        this._particles.geometry.attributes.position.needsUpdate = true;
        this._particles.rotation.y = t * 0.01;
      }

      // render
      if (this._composer) {
        this._composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    }

    /* ── Load GLB / GLTF ────────────────────────────────────── */
    loadModel(url, opts = {}) {
      return new Promise((resolve, reject) => {
        if (!THREE.GLTFLoader) {
          reject(new Error('GLTFLoader not available'));
          return;
        }
        this._fire('loading', { url });

        const loader = new THREE.GLTFLoader();
        if (THREE.DRACOLoader) {
          const draco = new THREE.DRACOLoader();
          draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
          loader.setDRACOLoader(draco);
        }

        loader.load(url,
          (gltf) => {
            // remove previous model
            if (this._currentModel) {
              this.scene.remove(this._currentModel);
              this._disposeObject(this._currentModel);
            }
            this._mixers.length = 0;

            const model = gltf.scene;
            // auto-center and scale
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetSize = opts.targetSize || 3;
            const scale = targetSize / maxDim;
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            model.position.y += (size.y * scale) / 2;

            // enable shadows
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            this.scene.add(model);
            this._currentModel = model;

            // animations
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(model);
              gltf.animations.forEach(clip => {
                mixer.clipAction(clip).play();
              });
              this._mixers.push(mixer);
            }

            // auto-frame camera
            this._frameTo(model, opts.animate !== false);

            // stats
            const stats = this._getModelStats(model);
            this._fire('loaded', { url, stats, gltf });
            resolve({ model, gltf, stats });
          },
          (progress) => {
            if (progress.total > 0) {
              const pct = Math.round((progress.loaded / progress.total) * 100);
              this._fire('progress', { url, percent: pct });
            }
          },
          (err) => {
            this._fire('error', { url, error: err });
            reject(err);
          }
        );
      });
    }

    /* ── Frame Camera to Object ─────────────────────────────── */
    _frameTo(obj, animate) {
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const dist = maxDim * 2;

      const target = center.clone();
      const position = new THREE.Vector3(
        center.x + dist * 0.6,
        center.y + dist * 0.4,
        center.z + dist * 0.8
      );

      if (this.controls) {
        this.controls.target.copy(target);
      }
      this.camera.position.copy(position);
      this.camera.lookAt(target);
    }

    /* ── Model Stats ────────────────────────────────────────── */
    _getModelStats(model) {
      let vertices = 0, faces = 0, materials = new Set(), meshes = 0;
      model.traverse(child => {
        if (child.isMesh) {
          meshes++;
          const geo = child.geometry;
          vertices += geo.attributes.position ? geo.attributes.position.count : 0;
          faces += geo.index ? geo.index.count / 3 : vertices / 3;
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => materials.add(m.name || m.uuid));
          }
        }
      });
      return { vertices, faces: Math.floor(faces), materials: materials.size, meshes };
    }

    /* ── Reset View ─────────────────────────────────────────── */
    resetView() {
      if (this._currentModel) {
        this._frameTo(this._currentModel, true);
      } else {
        this.camera.position.set(5, 3, 8);
        if (this.controls) this.controls.target.set(0, 0.5, 0);
      }
    }

    /* ── Toggle Wireframe ───────────────────────────────────── */
    toggleWireframe() {
      if (!this._currentModel) return;
      this._wireframe = !this._wireframe;
      this._currentModel.traverse(child => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => { m.wireframe = this._wireframe; });
        }
      });
      return this._wireframe;
    }

    /* ── Toggle Grid ────────────────────────────────────────── */
    toggleGrid() {
      this.scene.children.forEach(c => {
        if (c.isGridHelper) c.visible = !c.visible;
      });
    }

    /* ── Set Environment ────────────────────────────────────── */
    setBackground(hex) {
      this.scene.background = new THREE.Color(hex);
      this.scene.fog.color = new THREE.Color(hex);
    }

    /* ── Screenshot ─────────────────────────────────────────── */
    screenshot() {
      this.renderer.render(this.scene, this.camera);
      return this.renderer.domElement.toDataURL('image/png');
    }

    /* ── Dispose ────────────────────────────────────────────── */
    dispose() {
      this._disposed = true;
      if (this._frameId) cancelAnimationFrame(this._frameId);
      if (this._ro) this._ro.disconnect();
      if (this._currentModel) this._disposeObject(this._currentModel);
      if (this._particles) this._disposeObject(this._particles);
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    _disposeObject(obj) {
      obj.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => {
            Object.values(m).forEach(v => {
              if (v && v.isTexture) v.dispose();
            });
            m.dispose();
          });
        }
      });
    }

    /* ── Event Emitter ──────────────────────────────────────── */
    _listeners = {};
    on(evt, fn)  { (this._listeners[evt] = this._listeners[evt] || []).push(fn); }
    off(evt, fn) { const a = this._listeners[evt]; if (a) this._listeners[evt] = a.filter(f => f !== fn); }
    _fire(evt, data) { (this._listeners[evt] || []).forEach(fn => fn(data)); }

    /* ── Helpers ────────────────────────────────────────────── */
    _isMobile() {
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    }
  }

  /* ── Expose globally ──────────────────────────────────────── */
  window.OmniverseViewer = OmniverseViewer;
})();
