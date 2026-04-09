/**
 * state.js — Game State + Survival Systems
 * Hunger, thirst, temperature, stamina, health, bleeding.
 * Tarkov-style injury system.
 */
import { transmitSatorEvent } from './telemetry.js';

// ── Global Game State ───────────────────────────────────────────────────────
export const STATE = {
  // Player vitals
  health:    100,
  maxHealth: 100,
  hunger:    100,
  thirst:    100,
  warmth:    50,
  temperature: 5,  // Celsius
  stamina:   100,
  fatigue:   0,
  radiation: 0,

  // Injury system (Tarkov-style)
  isBleeding: false,
  bleedRate:  0,
  injuries: [],  // { limb: 'left_arm', type: 'fracture'|'bleed'|'wound', severity: 0-1 }
  painLevel: 0,

  // Combat
  alive:   true,
  started: false,
  kills:   0,
  score:   0,

  // Weapons
  equippedWeapon: 'c7a2',
  ammo:     30,
  maxAmmo:  30,
  reserveAmmo: 120,
  reloading: false,
  reloadTime: 0,

  // Grenades
  grenades: 3,
  maxGrenades: 6,
  grenadeTimer: 0,  // cooldown

  // Inventory (Tarkov grid — 10 wide x 6 tall)
  inventory: [],
  inventoryWidth:  10,
  inventoryHeight: 6,

  // Player position (updated by engine)
  playerPos: { x: 500, y: 8, z: 500 },
  mouse: { x: 0, y: 0 },

  // Time (0-1, wraps every 24 game-minutes)
  gameTime: 0.5, // Start at noon
  dayLength: 24 * 60, // 24 real minutes = 1 game day

  // Paused
  paused: false,

  // Physics
  gravity: 9.81,

  // Survival caps
  maxFatigue: 100,
  maxHunger:  100,
  maxThirst:  100,

  // Campfire / sleep
  activeCampfire: null,
  campPos: null,
  isSprinting: false,

  // Trauma system
  trauma: { chest: 0, head: 0, limbs: 0 },

  // FX arrays (managed by effects.js)
  particles: [],
  tracers: [],
  shells: [],
  sparks: [],
  dynamicLights: [],
  corpses: [],
  bloodDecals: [],
  damageNumbers: [],

  // Character Sync Phase 21
  operatorId: 'char_vanguard',
  callsign: 'ECHO-1'
};

// Bootstrap Godot Character Payload
try {
  const payloadStr = localStorage.getItem('red_duster_character');
  if (payloadStr) {
    const p = JSON.parse(payloadStr);
    STATE.operatorId = p.model_id || 'char_vanguard';
    STATE.callsign = p.callsign || 'ECHO-1';
    
    if (p.stats) {
      STATE.maxHealth = 50 + ((p.stats.Endurance || 5) * 10);
      STATE.health = STATE.maxHealth;
      
      // Phase 25 Parity: Link missing survival boundary caps
      STATE.maxHunger = 60 + ((p.stats.Endurance || 5) * 8);
      STATE.hunger = STATE.maxHunger;
      
      STATE.maxThirst = 60 + ((p.stats.Endurance || 5) * 8);
      STATE.thirst = STATE.maxThirst;
      
      // Stamina derived from Agility
      STATE.stamina = 50 + ((p.stats.Agility || 5) * 10);
      
      // Loadout derived from Strength
      STATE.maxAmmo = ((p.stats.Strength || 5) > 7) ? 40 : 30; // Better handling allows drum mags
      STATE.reserveAmmo = ((p.stats.Strength || 5) * 15);
    }
  }
} catch (e) {
  console.warn("Failed to load generic character payload from SATOR bridge", e);
}

// ── Survival Drain Rates (per second) ───────────────────────────────────────
const HUNGER_DRAIN   = 0.07;   // Empty in ~24 min
const THIRST_DRAIN   = 0.11;   // Empty in ~15 min
const WARMTH_DRAIN   = 0.04;   // Drops in cold
const FATIGUE_GAIN   = 0.006;
const FATIGUE_SPRINT = 0.08;
const BLEED_DMG      = 2.0;    // HP/s per severity
const STARVATION_DMG = 0.8;    // HP/s when starving
const DEHYDRATION_DMG = 1.2;   // HP/s when dehydrated
const HYPOTHERMIA_DMG = 1.5;

// ── Ambient Temperature (day/night + season) ────────────────────────────────
function getAmbientTemp(gameTime) {
  // Canadian spring: night -10C, day +10C
  const base = -2;
  const dayBonus = Math.sin(gameTime * Math.PI) * 12;
  return base + dayBonus;
}

// ── Update Survival moved to survival.js ──
// ── Death + Respawn ──────────────────────────────────────────────────────────
let _respawnCallback = null;
let _survivalStart = performance.now();
let _lastDeathCause = 'ENEMY FIRE';

export function onRespawn(cb) { _respawnCallback = cb; }

export function triggerDeath(cause = 'ENEMY FIRE') {
  STATE.alive = false;
  const el = document.getElementById('deathScreen');
  if (!el) return;

  // Populate stats
  const survived = _survivalStart ? Math.floor((performance.now() - _survivalStart) / 1000) : 0;
  const mins = Math.floor(survived / 60), secs = survived % 60;
  const setText = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  setText('deathKills', STATE.kills);
  setText('deathTime',  `${mins}:${String(secs).padStart(2,'0')}`);
  setText('deathCause', cause);

  transmitSatorEvent('SURVIVAL_DEATH', JSON.stringify({ cause: cause, survived_seconds: survived }));

  // Show with animation
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('visible'));

  document.getElementById('btnRespawn')?.addEventListener('click', () => {
    el.classList.remove('visible');
    setTimeout(() => { el.style.display = 'none'; _doRespawn(); }, 600);
  }, { once: true });

  document.getElementById('btnDeathMenu')?.addEventListener('click', () => {
    el.classList.remove('visible');
    setTimeout(() => {
      el.style.display = 'none';
      document.getElementById('hud').style.display = 'none';
      document.getElementById('mainMenu').style.display = 'flex';
      STATE.started = false;
    }, 600);
  }, { once: true });
}

function _doRespawn() {
  // Reset vitals
  STATE.alive       = true;
  STATE.health      = STATE.maxHealth;
  STATE.hunger      = 80;
  STATE.thirst      = 80;
  STATE.warmth      = 50;
  STATE.stamina     = 100;
  STATE.isBleeding  = false;
  STATE.bleedRate   = 0;
  STATE.injuries    = [];
  STATE.painLevel   = 0;
  STATE.ammo        = 30;
  STATE.reserveAmmo = 90; // penalty — less ammo on respawn
  STATE.reloading   = false;
  _survivalStart    = performance.now();
  _lastDeathCause   = 'ENEMY FIRE';

  if (_respawnCallback) _respawnCallback();
}

// Weapon stats reference for reload
const WEAPON_STATS = {
  c7a2:       { mag: 30 },
  sks:        { mag: 10 },
  rem870:     { mag: 8  },
  glock17:    { mag: 17 },
  ar15:       { mag: 30 },
  m14:        { mag: 20 },
  leeEnfield: { mag: 10 },
};

// ── Update HUD moved to hud.js ──
