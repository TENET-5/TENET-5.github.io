import codecs
import re

file_path = r'E:\ABCXYZ.github.io\red-duster-game.html'
with codecs.open(file_path, 'r', 'utf-8') as f:
    html = f.read()

# 1. Renderer Upgrades
html = html.replace("antialias: false", "antialias: true, powerPreference: 'high-performance'")
html = html.replace("renderer.shadowMap.type = THREE.BasicShadowMap;", 
"""renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;"""
)

# 2. Atmospheric Environment
html = html.replace("scene.background = new THREE.Color(0x88bbff);", "scene.background = new THREE.Color(0x110000);")
html = html.replace("scene.fog = new THREE.Fog(0x88bbff, 10, 40);", "scene.fog = new THREE.FogExp2(0x110000, 0.05);")

# 3. Increase Particle Array Size / Velocity & add Gravity
html = html.replace(
"""function addParticle(x, y, z, color) {
  const maxParts = 100;""",
"""function addParticle(x, y, z, color) {
  const maxParts = 2000;"""
)
html = html.replace(
"""const vx = (Math.random() - 0.5) * 4;
  const vy = Math.random() * 4;
  const vz = (Math.random() - 0.5) * 4;""",
"""const vx = (Math.random() - 0.5) * 8;
  const vy = Math.random() * 8;
  const vz = (Math.random() - 0.5) * 8;"""
)

# Replace updateParticles logic to add intense gravity and floor pooling
pt_update_old = """    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    p.mesh.position.set(p.x, p.y, p.z);"""
pt_update_new = """    p.vy -= 18.8 * dt; // High gravity
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    if (p.y <= 0.03) { p.y = 0.03; p.vy = 0; p.vx *= 0.5; p.vz *= 0.5; p.mesh.scale.set(2, 0.1, 2); } // Blood pooling
    p.mesh.position.set(p.x, p.y, p.z);"""
html = html.replace(pt_update_old, pt_update_new)

# 4. Extreme Gore Multiplier & Shake in killEnemy
ke_old = """for (let i = 0; i < 15; i++) {
    addParticle(enemy.x, enemy.mesh.position.y + 1, enemy.z, 0xff0000);
  }"""
ke_new = """STATE.shake = 0.3; // Execution shake
  for (let i = 0; i < 300; i++) {
    addParticle(enemy.x, enemy.mesh.position.y + 1, enemy.z, 0xff0000);
  }"""
html = html.replace(ke_old, ke_new)

# 5. Screen Shake array injection into STATE
html = html.replace("fov: 75,", "fov: 75, shake: 0,")

# Add Shake computation to animate loop right after weapon visuals
anim_old = "updateWeaponVisuals();"
anim_new = """updateWeaponVisuals();
    if (STATE.shake > 0) {
      STATE.shake -= dt * 3;
      if (STATE.shake < 0) STATE.shake = 0;
      camera.position.x = (Math.random() - 0.5) * STATE.shake;
      camera.position.y = (Math.random() - 0.5) * STATE.shake;
    } else {
      camera.position.x = 0;
      camera.position.y = 0;
    }"""
html = html.replace(anim_old, anim_new)

# 6. Add Shake to shoot and damagePlayer
html = html.replace("STATE.shootCooldown = w.fireRate;", "STATE.shootCooldown = w.fireRate; STATE.shake = 0.4;")
html = html.replace("STATE.hp -= amount;", "STATE.hp -= amount; STATE.shake = 0.8;")

# 7. Triplicate Enemy Speed
html = html.replace("grunt:  { hp: 100, speed: 2.5,", "grunt:  { hp: 100, speed: 7.5,")
html = html.replace("heavy:  { hp: 300, speed: 1.5,", "heavy:  { hp: 300, speed: 4.5,")
html = html.replace("ranger: { hp: 80,  speed: 2.2,", "ranger: { hp: 80,  speed: 6.6,")

# 8. Projectile PointLights
def_proj_old = "mesh.position.set(fromX, 1, fromZ);"
def_proj_new = "mesh.position.set(fromX, 1, fromZ);\n  const pLight = new THREE.PointLight(0xff3333, 2, 5);\n  mesh.add(pLight);"
html = html.replace(def_proj_old, def_proj_new)

# Save
with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(html)
print("SPEC x 100000000 APPLIED. HELLSCAPE ARRAY SYNTHESIZED.")
