/* ═══════════════════════════════════════════════════════
   TENET5 V2 Engine — Three.js Backdrop Renderer
   Initialises a subtle animated particle-field background
   on content pages (non-frame-shell only).
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  if (window.__TENET5_V2_ENGINE_LOADED) return;
  window.__TENET5_V2_ENGINE_LOADED = true;

  /* Ensure Three.js is available */
  if (typeof THREE === 'undefined') {
    console.warn('[v2-engine] THREE.js not loaded — skipping backdrop.');
    return;
  }

  var container = document.createElement('div');
  container.id = 'v2-backdrop';
  container.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;' +
    'pointer-events:none;opacity:0.12;';
  document.body.appendChild(container);

  try {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    /* Particle field */
    var count = 800;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var material = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xe8e3d6,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    var particles = new THREE.Points(geometry, material);
    scene.add(particles);

    var clock = new THREE.Clock();
    var animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      particles.rotation.y = t * 0.02;
      particles.rotation.x = Math.sin(t * 0.01) * 0.1;
      renderer.render(scene, camera);
    }
    animate();

    /* Resize handler */
    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* Cleanup on page unload */
    window.addEventListener('beforeunload', function() {
      cancelAnimationFrame(animId);
      renderer.dispose();
    });

    console.log('[v2-engine] Backdrop initialised — ' + count + ' particles.');
  } catch(e) {
    console.warn('[v2-engine] Init failed:', e.message);
  }
})();
