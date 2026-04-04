import re
import codecs

with codecs.open(r'E:\ABCXYZ.github.io\red-duster-game.html', 'r', 'utf-8') as f:
    html = f.read()

pbr_function = """function buildWeaponModel(type) {
  const g = new THREE.Group();
  
  // Tactical Gunmetal & Polymer Materials
  const mBarrel = new THREE.MeshStandardMaterial({color: 0x222222, metalness: 0.9, roughness: 0.2});
  const mPolymer = new THREE.MeshStandardMaterial({color: 0x1a1a1a, metalness: 0.2, roughness: 0.8});
  const mRecv = new THREE.MeshStandardMaterial({color: 0x282828, metalness: 0.85, roughness: 0.35});
  const mFDE = new THREE.MeshStandardMaterial({color: 0x4a4338, metalness: 0.3, roughness: 0.9});
  
  if (type === 'rifle') {
    // C8 SFW / M4A1 Suppressed
    const supp = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 16), new THREE.MeshStandardMaterial({color: 0x111111, metalness: 0.7, roughness: 0.4}));
    supp.rotation.x = Math.PI/2; supp.position.set(0, 0.02, -0.45); g.add(supp);
    
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.15, 12), mBarrel);
    barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0.02, -0.28); g.add(barrel);
    
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.25), mRecv);
    rail.position.set(0, 0.02, -0.15); g.add(rail);
    
    const peq = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.08), mFDE); // PEQ-15 Laser
    peq.position.set(0, 0.05, -0.18); g.add(peq);
    
    const recv = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.075, 0.2), mRecv);
    recv.position.set(0, 0.005, 0.05); g.add(recv);
    
    // EOTech Holographic Sight
    const eotechBase = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.08), mPolymer);
    eotechBase.position.set(0, 0.05, 0.02); g.add(eotechBase);
    const eotechHood = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.06), mRecv);
    eotechHood.position.set(0, 0.08, 0.02); g.add(eotechHood);
    // EOTech Reticle (Red Dot)
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.03), new THREE.MeshBasicMaterial({color: 0x88ccff, transparent: true, opacity: 0.1, side: THREE.DoubleSide}));
    glass.position.set(0, 0.08, 0.01); g.add(glass);
    const reticle = new THREE.Mesh(new THREE.RingGeometry(0.003, 0.004, 16), new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.9}));
    reticle.position.set(0, 0.08, 0.011); g.add(reticle);
    const centerDot = new THREE.Mesh(new THREE.CircleGeometry(0.0015, 8), new THREE.MeshBasicMaterial({color: 0xff0000}));
    centerDot.position.set(0, 0.08, 0.011); g.add(centerDot);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.12, 0.06), mPolymer);
    mag.position.set(0, -0.09, 0.08); mag.rotation.x = 0.1; g.add(mag);
    
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.08, 0.04), mPolymer);
    grip.position.set(0, -0.07, 0.18); grip.rotation.x = 0.3; g.add(grip);
    
    const stockTube = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8), mBarrel);
    stockTube.rotation.x = Math.PI/2; stockTube.position.set(0, 0.02, 0.22); g.add(stockTube);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), mPolymer);
    stock.position.set(0, 0.01, 0.28); g.add(stock);
    
  } else if (type === 'shotgun') {
    // Remington 870 Tactical
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.45, 12), mBarrel);
    barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0.02, -0.25); g.add(barrel);
    const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.4, 12), mBarrel);
    magTube.rotation.x = Math.PI/2; magTube.position.set(0, -0.01, -0.22); g.add(magTube);
    
    const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.15, 12), mPolymer);
    pump.rotation.x = Math.PI/2; pump.position.set(0, -0.01, -0.15); g.add(pump);
    
    const recv = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.18), mRecv);
    recv.position.set(0, 0.005, 0.05); g.add(recv);
    
    const ghostRing = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.002, 4, 12), mRecv);
    ghostRing.position.set(0, 0.045, 0.02); g.add(ghostRing);
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.01, 0.004), mRecv);
    frontSight.position.set(0, 0.04, -0.45); g.add(frontSight);
    
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.06, 0.2), mPolymer);
    stock.position.set(0, -0.01, 0.22); g.add(stock);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.04), mPolymer);
    grip.position.set(0, -0.06, 0.15); grip.rotation.x = 0.25; g.add(grip);

  } else if (type === 'pistol') {
    // Sig P320 / Glock 19X (FDE Polymer)
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.15), mRecv);
    slide.position.set(0, 0.025, -0.05); g.add(slide);
    
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.15, 12), mBarrel);
    barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0.02, -0.05); g.add(barrel);
    
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.025, 0.15), mFDE);
    frame.position.set(0, 0.0, -0.05); g.add(frame);
    
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.08, 0.045), mFDE);
    grip.position.set(0, -0.04, 0.01); grip.rotation.x = 0.2; g.add(grip);
    
    // Trijicon RMR Mini Red Dot
    const rmrBase = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.01, 0.03), mPolymer);
    rmrBase.position.set(0, 0.045, 0.01); g.add(rmrBase);
    const rmrGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.015), new THREE.MeshBasicMaterial({color: 0x88ccff, transparent: true, opacity: 0.1, side: THREE.DoubleSide}));
    rmrGlass.position.set(0, 0.055, -0.004); g.add(rmrGlass);
    const rmrDot = new THREE.Mesh(new THREE.CircleGeometry(0.001, 8), new THREE.MeshBasicMaterial({color: 0xff0000}));
    rmrDot.position.set(0, 0.055, -0.003); g.add(rmrDot);
    
  } else if (type === 'sniper') {
    // Arctic Warfare Magnum (AWM)
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.55, 12), mBarrel);
    barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0.025, -0.45); g.add(barrel);
    const supp = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.15, 16), mPolymer);
    supp.rotation.x = Math.PI/2; supp.position.set(0, 0.025, -0.75); g.add(supp);
    
    const recv = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.065, 0.25), mRecv);
    recv.position.set(0, 0, -0.05); g.add(recv);
    
    // scope
    const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 12), mPolymer);
    scopeBody.rotation.x = Math.PI/2; scopeBody.position.set(0, 0.06, -0.1); g.add(scopeBody);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.016, 12), new THREE.MeshBasicMaterial({color: 0x3366ff, transparent: true, opacity: 0.4}));
    lens.position.set(0, 0.06, -0.19); g.add(lens);
    const crossHairScope = new THREE.Mesh(new THREE.RingGeometry(0.001, 0.002, 8), new THREE.MeshBasicMaterial({color: 0xff0000}));
    crossHairScope.position.set(0, 0.06, -0.185); g.add(crossHairScope);
    
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.3), mPolymer);
    stock.position.set(0, -0.01, 0.25); g.add(stock);
  } else if (type === 'lmg') {
    // M249 SAW
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.45, 12), mBarrel);
    barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0.02, -0.35); g.add(barrel);
    
    const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.2), mPolymer);
    shroud.position.set(0, 0.01, -0.2); g.add(shroud);
    
    const recv = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.075, 0.22), mRecv);
    recv.position.set(0, 0, 0.02); g.add(recv);
    
    const ammoBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), new THREE.MeshStandardMaterial({color: 0x223322, roughness: 0.8})); // Green box
    ammoBox.position.set(-0.02, -0.08, 0.05); g.add(ammoBox);
    
    const eotechBase = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.08), mPolymer);
    eotechBase.position.set(0, 0.05, 0.02); g.add(eotechBase);
    const reticle = new THREE.Mesh(new THREE.RingGeometry(0.003, 0.004, 16), new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.9}));
    reticle.position.set(0, 0.08, 0.011); g.add(reticle);
  }
  return g;
}"""

# Use regex to replace the entire buildWeaponModel function
pattern = re.compile(r'function buildWeaponModel\(type\) \{.*?\n\}', re.DOTALL)
new_html = pattern.sub(pbr_function, html)

with codecs.open(r'E:\ABCXYZ.github.io\red-duster-game.html', 'w', 'utf-8') as f:
    f.write(new_html)

print("PHASE 70 PBR WEAPONS BUILT OVERRIDE SUCCESSFUL")
