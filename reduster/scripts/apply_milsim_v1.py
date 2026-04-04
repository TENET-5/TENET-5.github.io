import codecs

file_path = r'E:\ABCXYZ.github.io\red-duster-game.html'
with codecs.open(file_path, 'r', 'utf-8') as f:
    html = f.read()

# 1. Environment & Lighting
html = html.replace("scene.background = new THREE.Color(0x110000);", "scene.background = new THREE.Color(0x050508);")
html = html.replace("scene.fog = new THREE.FogExp2(0x110000, 0.05);", "scene.fog = new THREE.FogExp2(0x050508, 0.04);")

# Add flashlight spotlight after moonLight logic
moon_target = "scene.add(moonLight);"
moon_replace = """scene.add(moonLight);
const flashLight = new THREE.SpotLight(0xccddff, 10, 40, Math.PI/7, 0.8, 1);
flashLight.position.set(0.1, -0.2, 0);
flashLight.target.position.set(0, 0, -1);
camera.add(flashLight);
camera.add(flashLight.target);"""
html = html.replace(moon_target, moon_replace)

# 2. Remove DOOM Crosshair & Arcade Elements
hud_target = "document.getElementById('crosshair').style.display = 'block';"
hud_replace = "// document.getElementById('crosshair').style.display = 'none'; // ARCADE UI NUKED"
html = html.replace(hud_target, hud_replace)
html = html.replace("document.getElementById('crosshair').style.display = 'none';", "")

# 3. Input Hooks (Context Menu block + ADS)
input_target = "window.addEventListener('click', () => {"
input_replace = """window.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('mousedown', e => {
  if (e.button === 2) STATE.aiming = true;
});
window.addEventListener('mouseup', e => {
  if (e.button === 2) STATE.aiming = false;
});
window.addEventListener('click', () => {"""
html = html.replace(input_target, input_replace)

# 4. Engine Variables for Aiming
state_target = "comboTimer: 0,"
state_replace = "comboTimer: 0, aiming: false,"
html = html.replace(state_target, state_replace)

# 5. Weapon Sway & Aim-Down-Sights Interpolation
fov_target = """    // Weapon sway
    weapon.position.y = -0.14 + Math.sin(bobTime) * 0.012;
    weapon.position.x = (STATE.weapon === 'pistol' ? 0.14 : 0.18) + Math.cos(bobTime * 0.5) * 0.006;
    weapon.rotation.z = Math.sin(bobTime * 0.5) * 0.015;"""
fov_replace = """    // True ADS Kinematics
    const targetX = STATE.aiming ? 0 : (STATE.weapon === 'pistol' ? 0.14 : 0.18);
    const targetY = STATE.aiming ? -0.06 : -0.14;
    const targetZ = STATE.aiming ? -0.15 : -0.3;
    
    weapon.position.x += (targetX - weapon.position.x) * dt * 15;
    weapon.position.y += (targetY - weapon.position.y) * dt * 15;
    weapon.position.z += (targetZ - weapon.position.z) * dt * 15;
    
    if (STATE.aiming) {
        STATE.targetFov = 40;
        weapon.rotation.z = 0;
    } else {
        STATE.targetFov = STATE.sprinting ? 82 : 75;
        weapon.rotation.z = Math.sin(bobTime * 0.5) * 0.015;
        weapon.position.y += Math.sin(bobTime) * 0.012;
        weapon.position.x += Math.cos(bobTime * 0.5) * 0.006;
    }"""
html = html.replace(fov_target, fov_replace)

# 6. Muzzle Rise & Spread Mechanics
shoot_target = "STATE.shootCooldown = w.fireRate; STATE.shake = 0.4;"
shoot_replace = """STATE.shootCooldown = w.fireRate; 
  // Muzzle Rise Recoil
  pitchObj.rotation.x += STATE.weapon === 'shotgun' ? 0.12 : 0.04 + Math.random()*0.02;
  STATE.shake = 0.05;"""
html = html.replace(shoot_target, shoot_replace)

# Apply massive spread penalty if hip-firing
spread_target = "const spreadX = (Math.random() - 0.5) * w.spread;"
spread_replace = "const trueSpread = STATE.aiming ? (w.spread * 0.2) : (w.spread * 4.0);\n    const spreadX = (Math.random() - 0.5) * trueSpread;"
html = html.replace(spread_target, spread_replace)
html = html.replace("const spreadY = (Math.random() - 0.5) * w.spread;", "const spreadY = (Math.random() - 0.5) * trueSpread;")

# 7. Low TTK (MilSim lethality)
# Reduce enemy health to 30, speeds down to tactical walk speeds
html = html.replace("grunt:  { hp: 100, speed: 7.5,", "grunt:  { hp: 40, speed: 2.2,")
html = html.replace("heavy:  { hp: 300, speed: 4.5,", "heavy:  { hp: 100, speed: 1.5,")
html = html.replace("ranger: { hp: 80,  speed: 6.6,", "ranger: { hp: 30,  speed: 1.8,")
# Speed down player speeds
html = html.replace("const speed = STATE.sprinting ? 14 : 7;", "const speed = STATE.sprinting ? 7 : 3.5;")

with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(html)
print("MIL-SIM PROTOCOLS APPLIED. TRUE ADS, RECOIL, LOW TTK DEPLOYED.")
