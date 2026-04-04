import { STATE } from './state.js';
import { WEAPONS } from './weapons.js';

// ── HUD DOM Updates ──

export function updateHUD() {
  // ── Health bar (barHP / valHP) ──
  const barHP = document.getElementById('barHP');
  const valHP = document.getElementById('valHP');
  if (barHP) {
    const pct = Math.max(0, Math.min(100, STATE.health));
    barHP.style.width = pct + '%';
    barHP.style.background = pct > 60 ? '#cc2200' : pct > 30 ? '#ffcc00' : '#ff3333';
  }
  if (valHP) valHP.textContent = Math.ceil(STATE.health);

  // ── Food bar (barFood / valFood) ──
  const barFood = document.getElementById('barFood');
  const valFood = document.getElementById('valFood');
  if (barFood) barFood.style.width = Math.round(STATE.hunger) + '%';
  if (valFood) valFood.textContent = Math.round(STATE.hunger);

  // ── Water bar (barWater / valWater) ──
  const barWater = document.getElementById('barWater');
  const valWater = document.getElementById('valWater');
  if (barWater) barWater.style.width = Math.round(STATE.thirst) + '%';
  if (valWater) valWater.textContent = Math.round(STATE.thirst);

  // ── Temperature bar (barTemp / valTemp) ──
  const barTemp = document.getElementById('barTemp');
  const valTemp = document.getElementById('valTemp');
  if (barTemp) barTemp.style.width = Math.max(0, Math.min(100, STATE.warmth || 50)) + '%';
  if (valTemp) valTemp.textContent = (STATE.temperature >= 0 ? '+' : '') + Math.round(STATE.temperature || 5) + 'C';

  // ── Stamina bar (barStamina / valStamina) ──
  const barStamina = document.getElementById('barStamina');
  const valStamina = document.getElementById('valStamina');
  if (barStamina) barStamina.style.width = Math.round(STATE.stamina || 100) + '%';
  if (valStamina) valStamina.textContent = Math.round(STATE.stamina || 100);

  // ── Weapon ammo (wpnAmmo / wpnReserve / wpnName) ──
  const wpnAmmo = document.getElementById('wpnAmmo');
  const wpnReserve = document.getElementById('wpnReserve');
  if (wpnAmmo) wpnAmmo.textContent = STATE.ammo;
  if (wpnReserve) wpnReserve.textContent = STATE.reserveAmmo;
  const grenadeEl = document.getElementById('grenadeCount');
  if (grenadeEl) grenadeEl.textContent = STATE.grenades;

  // Vehicle HUD
  const vehEl = document.getElementById('vehicleHUD');
  if (vehEl) {
    if (STATE.inVehicle) {
      vehEl.style.display = 'block';
      vehEl.textContent = `${STATE.vehicleSpeed || 0} km/h | Fuel: ${STATE.vehicleFuel || 0}%`;
    } else {
      vehEl.style.display = 'none';
    }
  }

  const wpnName = document.getElementById('wpnName');
  if (wpnName) {
    const wpn = WEAPONS[STATE.equippedWeapon];
    if (wpn) wpnName.textContent = wpn.name;
  }

  // ── Kills ──
  const killDisplay = document.getElementById('killDisplay');
  if (killDisplay) killDisplay.textContent = STATE.kills;

  // ── HUD message (survival warnings, melee feedback, etc.) ──
  if (window._hudMsgTimer > 0) {
    window._hudMsgTimer -= 0.016;
    const msgEl = document.getElementById('hudMsg');
    if (msgEl && window._hudMsg) {
      msgEl.textContent = window._hudMsg;
      msgEl.style.opacity = Math.min(1, window._hudMsgTimer * 2).toString();
    }
    if (window._hudMsgTimer <= 0) {
      window._hudMsg = '';
      const msgEl = document.getElementById('hudMsg');
      if (msgEl) msgEl.textContent = '';
    }
  }

  // ── Reload ──
  if (STATE.reloading) {
    STATE.reloadTime -= 0.016; // approximate dt
    if (STATE.reloadTime <= 0) {
      const wpn = WEAPONS[STATE.equippedWeapon];
      const needed = (wpn?.mag || 30) - STATE.ammo;
      const available = Math.min(needed, STATE.reserveAmmo);
      STATE.ammo += available;
      STATE.reserveAmmo -= available;
      STATE.reloading = false;
    }
  }
}

export function updateReloadBar(progress) {
  const rb = document.getElementById('reloadBar');
  const rf = document.getElementById('reloadFill');
  if (!rb || !rf) return;
  if (progress < 0) {
    rb.style.display = 'none';
    rf.style.width = '0%';
  } else {
    rb.style.display = 'block';
    rf.style.width = (progress * 100) + '%';
  }
}

export function showHitMarker(isHeadshot) {
  const hm = document.getElementById('hitMarker');
  if (!hm) return;
  hm.style.display = 'block';
  hm.style.color = isHeadshot ? '#ffff00' : '#ff3333';
  hm.textContent = isHeadshot ? '☠' : '✕';
  setTimeout(() => { hm.style.display = 'none'; }, 150);
}

export function showDamageFlash() {
  const df = document.getElementById('damageFlash');
  if (df) df.style.opacity = '0.6';
}

export function addKillFeed(text, color) {
  const feed = document.getElementById('killFeed');
  if (!feed) return;
  const entry = document.createElement('div');
  entry.className = 'killFeedEntry';
  entry.textContent = text;

  // Color-coded left border by message type
  let borderColor = '#ff3333';
  if (/^🛸|^⚡/.test(text))            borderColor = '#ff8800'; // drone/EMP
  else if (/^✅|^❤️|^🏥/.test(text))   borderColor = '#33ff99'; // zone cap / health
  else if (/^📦|^🔫/.test(text))        borderColor = '#ffcc00'; // pickups
  else if (/^⏱|^💙/.test(text))        borderColor = '#44aaff'; // net/system
  else if (/^☭/.test(text))            borderColor = '#ff2222'; // commissar
  else if (/^⚠/.test(text))            borderColor = '#ff6600'; // warnings
  else if (color)                       borderColor = color;
  entry.style.borderLeftColor = borderColor;
  if (color) entry.style.color = color;

  // Newest entry at top
  feed.insertBefore(entry, feed.firstChild);

  // Fade out then remove
  const removeDelay = 3500;
  setTimeout(() => {
    entry.style.transition = 'opacity 0.4s, transform 0.4s';
    entry.style.opacity = '0';
    entry.style.transform = 'translateX(30px)';
    setTimeout(() => entry.remove(), 420);
  }, removeDelay);

  // Keep max 8 entries
  while (feed.children.length > 8) feed.removeChild(feed.lastChild);
}

export function showWeaponName(name) {
  const el = document.getElementById('weaponName');
  if (!el) return;
  el.textContent = name;
  el.style.display = 'block';
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 1500);
  setTimeout(() => { el.style.display = 'none'; }, 1800);
}

export function updateLowHealthPulse() {
  const el = document.getElementById('lowHealthPulse');
  if (!el) return;
  const pct = STATE.health / STATE.maxHealth;
  el.style.opacity = pct < 0.3 ? (0.3 - pct) / 0.3 * 0.7 : '0';
}

export function showComboText(combo) {
  // removed for milsim
}

export function updateHeartbeat() {
  // heartbeat audio logic removed for web audio migration
}


// ── Compass Heading Bar (top-center, military-style) ──
let _compassEl = null;
const _COMPASS_DIRS = ['N','NE','E','SE','S','SW','W','NW'];

export function initCompass() {
  _compassEl = document.getElementById('compassDisplay');
  if (!_compassEl) return;
  _compassEl.style.cssText =
    'font-family:"Rajdhani",sans-serif;font-size:11px;letter-spacing:0.12em;' +
    'color:#aaa;min-width:180px;text-align:center;overflow:hidden;white-space:nowrap;' +
    'user-select:none;pointer-events:none;';
}

export function updateCompass(yawRadians) {
  if (!_compassEl) return;
  // yawRadians: camera.rotation.y (BJS FreeCamera, 0=south, π=north typical)
  // Normalise to 0–360°
  let deg = ((yawRadians * 180 / Math.PI) % 360 + 360) % 360;

  // Cardinal label
  const cardIdx = Math.round(deg / 45) % 8;
  const cardinal = _COMPASS_DIRS[cardIdx];

  // Build a sliding tape: show ±90° window with markers every 15°
  const chars = [];
  for (let offset = -60; offset <= 60; offset += 15) {
    const d = ((deg + offset) % 360 + 360) % 360;
    const markIdx = Math.round(d / 45) % 8;
    const onCard = Math.abs(d % 45) < 7.5;
    if (onCard) {
      chars.push(`<span style="color:${markIdx === 0 ? '#cc2200' : '#ccc'}">${_COMPASS_DIRS[markIdx]}</span>`);
    } else {
      chars.push('<span style="color:#444">·</span>');
    }
  }

  _compassEl.innerHTML =
    `${chars.join(' ')} <span style="color:#cc8866;font-size:10px">${Math.round(deg)}° ${cardinal}</span>`;
}

export function updateSurvivalHUD() {
  // Immersive mode — only critical context cues
  const bleedEl = document.getElementById('bleedIndicator');
  if (bleedEl) bleedEl.style.display = STATE.isBleeding ? 'block' : 'none';
}
