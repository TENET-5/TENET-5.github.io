// ── Red Duster Save / Load System ──
// Persists player state, inventory, position, time, and kills to localStorage
// SYSTEM_SEED=118400
// Phase 25: Cross-engine parity with Godot SaveSystem.gd v2

import { STATE } from './state.js';
import { transmitSatorEvent, fetchSatorState } from './telemetry.js';
import { serializeMissions, deserializeMissions } from './objectives.js';

const SAVE_KEY = 'redDuster_saveData';
const SAVE_VERSION = 2; // Bumped for Godot parity

/**
 * Serialize the current game state into a compact JSON object.
 * Schema matches Godot SaveSystem.gd save_game() v2 layout.
 */
export function buildSaveData() {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    // ── Player (mirrors Godot SaveSystem.gd "player" block) ──
    player: {
      hp: STATE.health ?? 100,
      hunger: STATE.hunger ?? 100,
      thirst: STATE.thirst ?? 100,
      warmth: STATE.warmth ?? 100,
      temperature: STATE.temperature ?? 37.0,
      fatigue: STATE.fatigue ?? 0,
      stamina: STATE.stamina ?? 100,
      is_bleeding: STATE.isBleeding ?? false,
      is_infected: STATE.isInfected ?? false,
      kill_count: STATE.kills ?? 0,
      position: [
        STATE.playerPos?.x ?? 0,
        STATE.playerPos?.y ?? 0,
        STATE.playerPos?.z ?? 0,
      ],
      rotation_y: STATE.rotationY ?? 0,
    },
    // ── Inventory (slots + hotbar, matches Godot InventoryManager) ──
    inventory: {
      slots: STATE.inventory ? [...STATE.inventory] : [],
      hotbar: STATE.hotbar ?? [-1, -1, -1, -1],
    },
    // ── World (campfires, shelters, time, weather, dead enemies) ──
    world: {
      campfires: STATE.campfires ? [...STATE.campfires] : [],
      shelters: STATE.shelters ? [...STATE.shelters] : [],
      game_time: STATE.gameTime ?? 0.25,
      buildings: STATE.buildings ? [...STATE.buildings] : [],
      enemies_dead: STATE.deadEnemies ? [...STATE.deadEnemies] : [],
      looted_containers: STATE.lootedContainers ? [...STATE.lootedContainers] : [],
      weather: {
        current_weather: STATE.weatherType ?? 'clear',
      },
    },
    // ── Missions (status + objective progress, matches Godot MissionManager) ──
    missions: STATE.missionProgress ?? {},
    // ── Weapon state ──
    currentWeapon: STATE.equippedWeapon ?? 'c7a2',
    ammo: STATE.ammo ?? 30,
    reserveAmmo: STATE.reserveAmmo ?? 120,
    // ── Completed objective IDs (backward compat) ──
    objectivesCompleted: STATE.objectivesCompleted ?? [],
    // ── Phase 26: Full mission serialization (story + tactical) ──
    missionState: serializeMissions(),
  };
}

export function saveGame() {
  try {
    const data = buildSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    console.log('[Save] Game saved successfully', data.timestamp);
    showSaveNotification('GAME SAVED');
    transmitSatorEvent('GAME_SAVED', JSON.stringify({
      timestamp: data.timestamp,
      position: data.player.position,
      kills: data.player.kill_count,
    }));
    return true;
  } catch (e) {
    console.error('[Save] Failed to save:', e);
    showSaveNotification('SAVE FAILED', true);
    return false;
  }
}

/**
 * Load saved game from localStorage or SATOR Telemetry hub.
 * Returns the save data object, or null if no save exists.
 */
export async function loadGame() {
  try {
    // Phase 25/26 Parity: Ping SATOR hub first for Godot save telemetry
    let data = await fetchSatorState();

    if (!data) {
      // Fallback to local browser storage
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) { console.log('[Save] No save data found locally or on SATOR'); return null; }
      data = JSON.parse(raw);
    }
    
    // Accept both v1 and v2 saves
    if (data.version < 1 || data.version > SAVE_VERSION) {
      console.warn('[Save] Save version mismatch, ignoring');
      return null;
    }
    console.log('[Save] Loaded save from', new Date(data.timestamp).toLocaleString());
    return data;
  } catch (e) {
    console.error('[Save] Failed to load:', e);
    return null;
  }
}

/**
 * Apply loaded save data to STATE.
 * Supports both v1 (flat) and v2 (Godot-parity nested) layouts.
 */
export function applySaveData(data, camera) {
  if (!data) return false;

  if (data.version >= 2 && data.player) {
    // ── V2 Godot-parity format ──
    const pd = data.player;
    STATE.health = pd.hp ?? 100;
    STATE.hunger = pd.hunger ?? 100;
    STATE.thirst = pd.thirst ?? 100;
    STATE.warmth = pd.warmth ?? 100;
    STATE.temperature = pd.temperature ?? 37.0;
    STATE.fatigue = pd.fatigue ?? 0;
    STATE.stamina = pd.stamina ?? 100;
    STATE.isBleeding = pd.is_bleeding ?? false;
    STATE.isInfected = pd.is_infected ?? false;
    STATE.kills = pd.kill_count ?? 0;
    STATE.alive = true;

    if (camera && pd.position && pd.position.length === 3) {
      camera.position.x = pd.position[0];
      camera.position.y = pd.position[1];
      camera.position.z = pd.position[2];
    }
    if (pd.rotation_y !== undefined) {
      STATE.rotationY = pd.rotation_y;
      if (camera) camera.rotation.y = pd.rotation_y;
    }

    // World
    const wd = data.world ?? {};
    STATE.gameTime = wd.game_time ?? 0.25;
    STATE.campfires = wd.campfires ?? [];
    STATE.shelters = wd.shelters ?? [];
    STATE.buildings = wd.buildings ?? [];
    STATE.deadEnemies = wd.enemies_dead ?? [];
    STATE.lootedContainers = wd.looted_containers ?? [];
    if (wd.weather) {
      STATE.weatherType = wd.weather.current_weather ?? 'clear';
    }

    // Inventory
    const inv = data.inventory ?? {};
    if (inv.slots && STATE.inventory) {
      STATE.inventory.length = 0;
      inv.slots.forEach(item => STATE.inventory.push(item));
    }
    if (inv.hotbar) {
      STATE.hotbar = [...inv.hotbar];
    }

    // Missions — Phase 26: full mission state restore
    if (data.missionState) {
      deserializeMissions(data.missionState);
    }
  } else {
    // ── V1 flat format (backward compat) ──
    STATE.health = data.health ?? 100;
    STATE.hunger = data.hunger ?? 100;
    STATE.thirst = data.thirst ?? 100;
    STATE.stamina = data.stamina ?? 100;
    STATE.kills = data.kills ?? 0;
    STATE.alive = data.alive ?? true;
    STATE.gameTime = data.gameTime ?? 0.25;
    STATE.isBleeding = data.isBleeding ?? false;

    if (camera && data.position) {
      camera.position.x = data.position.x;
      camera.position.y = data.position.y;
      camera.position.z = data.position.z;
    }

    if (data.inventory && STATE.inventory) {
      STATE.inventory.length = 0;
      data.inventory.forEach(item => STATE.inventory.push(item));
    }
    if (data.ammo) STATE.ammo = data.ammo;
    if (data.currentWeapon !== undefined) STATE.currentWeapon = data.currentWeapon;
    if (data.objectivesCompleted) STATE.objectivesCompleted = [...data.objectivesCompleted];
    if (data.buildings) STATE.buildings = [...data.buildings];
    if (data.deadEnemies) STATE.deadEnemies = [...data.deadEnemies];
  }

  // Weapon (shared across both versions)
  STATE.equippedWeapon = data.currentWeapon ?? STATE.equippedWeapon ?? 'c7a2';
  STATE.ammo = data.ammo ?? STATE.ammo ?? 30;
  STATE.reserveAmmo = data.reserveAmmo ?? STATE.reserveAmmo ?? 120;
  if (data.objectivesCompleted) STATE.objectivesCompleted = [...data.objectivesCompleted];

  console.log('[Save] State restored successfully (v%d)', data.version);
  showSaveNotification('GAME LOADED');
  transmitSatorEvent('GAME_LOADED', JSON.stringify({
    timestamp: data.timestamp,
    position: data.player?.position ?? [0,0,0],
  }));
  return true;
}

/**
 * Delete saved game.
 */
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
  console.log('[Save] Save data deleted');
}

/**
 * Check if a save exists.
 */
export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Brief on-screen notification for save/load events.
 */
function showSaveNotification(text, isError = false) {
  let el = document.getElementById('saveNotification');
  if (!el) {
    el = document.createElement('div');
    el.id = 'saveNotification';
    el.style.cssText = `
      position: fixed; top: 80px; right: 20px; z-index: 600;
      font-family: 'Rajdhani', sans-serif; font-size: 0.9rem;
      font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
      padding: 8px 18px; border-radius: 2px;
      pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
    `;
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.color = isError ? '#ff4444' : '#66cc66';
  el.style.background = isError ? 'rgba(60,0,0,0.85)' : 'rgba(0,40,0,0.85)';
  el.style.border = `1px solid ${isError ? '#cc2200' : '#228822'}`;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

// ── Auto-save every 5 minutes (matches Godot AUTOSAVE_INTERVAL=300.0) ──
let _autoSaveTimer = 300; // 5 minutes
export function updateAutoSave(dt) {
  _autoSaveTimer -= dt;
  if (_autoSaveTimer <= 0) {
    _autoSaveTimer = 300;
    if (STATE.alive && STATE.started) {
      saveGame();
      console.log('[Save] Auto-save triggered');
    }
  }
}
