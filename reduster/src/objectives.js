// objectives.js — Mission objectives and progression system
// Gives single-player structure: clear camps, survive nights, find intel
import { STATE } from './state.js';
import { addKillFeed } from './hud.js';

let _objectives = [];
let _completed = [];
let _overlay = null;
let _visible = false;

// Mission definitions
const MISSIONS = [
  {
    id: 'survive_first_night',
    title: 'Survive the First Night',
    desc: 'Make it through your first night in the wilderness.',
    check: () => STATE.gameTime > 0 && STATE.gameTime < 0.25 && STATE.alive && _nightsSurvived >= 1,
    reward: { ammo: 30, grenades: 1 },
  },
  {
    id: 'first_blood',
    title: 'First Blood',
    desc: 'Eliminate your first enemy combatant.',
    check: () => STATE.kills >= 1,
    reward: { ammo: 20 },
  },
  {
    id: 'five_kills',
    title: 'Resistance Fighter',
    desc: 'Eliminate 5 enemy combatants.',
    check: () => STATE.kills >= 5,
    reward: { ammo: 40, grenades: 2 },
  },
  {
    id: 'ten_kills',
    title: 'Guerrilla',
    desc: 'Eliminate 10 enemy combatants.',
    check: () => STATE.kills >= 10,
    reward: { ammo: 60, grenades: 3 },
  },
  {
    id: 'twenty_kills',
    title: 'One Man Army',
    desc: 'Eliminate 20 enemy combatants.',
    check: () => STATE.kills >= 20,
    reward: { ammo: 90 },
  },
  {
    id: 'campfire_placed',
    title: 'Base Camp',
    desc: 'Place a campfire to establish a warming station.',
    check: () => !!STATE.activeCampfire,
    reward: {},
  },
  {
    id: 'loot_five',
    title: 'Scavenger',
    desc: 'Loot 5 supply crates or cabins.',
    check: () => (_lootCount >= 5),
    reward: { ammo: 30 },
  },
  {
    id: 'survive_ten_min',
    title: 'Endurance',
    desc: 'Survive for 10 minutes.',
    check: () => _survivalSeconds >= 600,
    reward: { grenades: 2 },
  },
  {
    id: 'survive_thirty_min',
    title: 'Survivalist',
    desc: 'Survive for 30 minutes.',
    check: () => _survivalSeconds >= 1800,
    reward: { ammo: 60, grenades: 3 },
  },
  {
    id: 'vehicle_driven',
    title: 'Road Warrior',
    desc: 'Drive a vehicle for the first time.',
    check: () => _vehicleDriven,
    reward: {},
  },
  {
    id: 'nvg_used',
    title: 'Night Eyes',
    desc: 'Activate night vision goggles.',
    check: () => !!STATE.nvgActive,
    reward: {},
  },
];

let _nightsSurvived = 0;
let _wasNight = false;
let _lootCount = 0;
let _survivalSeconds = 0;
let _vehicleDriven = false;

export function initObjectives() {
  _objectives = MISSIONS.map(m => ({ ...m, done: false }));
  _completed = [];
  _lootCount = 0;
  _survivalSeconds = 0;
  _nightsSurvived = 0;
  _vehicleDriven = false;
}

export function onLoot() {
  _lootCount++;
}

export function onVehicleDriven() {
  _vehicleDriven = true;
}

export function updateObjectives(dt) {
  if (!STATE.alive || !STATE.started) return;

  _survivalSeconds += dt;

  // Track night survival
  const isNight = STATE.gameTime < 0.25 || STATE.gameTime > 0.75;
  if (_wasNight && !isNight) _nightsSurvived++;
  _wasNight = isNight;

  // Track vehicle
  if (STATE.inVehicle) _vehicleDriven = true;

  // Check objectives
  for (const obj of _objectives) {
    if (obj.done) continue;
    try {
      if (obj.check()) {
        obj.done = true;
        _completed.push(obj.id);

        // Apply reward
        if (obj.reward.ammo) STATE.reserveAmmo = Math.min(300, STATE.reserveAmmo + obj.reward.ammo);
        if (obj.reward.grenades) STATE.grenades = Math.min(STATE.maxGrenades, STATE.grenades + obj.reward.grenades);

        // Notify
        addKillFeed(`OBJECTIVE: ${obj.title}`);

        // Flash objective notification
        _showObjectiveComplete(obj.title);
      }
    } catch (e) {}
  }
}

function _showObjectiveComplete(title) {
  let el = document.getElementById('objectiveToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'objectiveToast';
    el.style.cssText = `
      position:fixed; top:80px; left:50%; transform:translateX(-50%);
      background:rgba(0,20,0,0.85); border:1px solid #00ff44; border-radius:6px;
      padding:10px 24px; color:#00ff44; font-family:monospace; font-size:0.85rem;
      z-index:900; opacity:0; transition:opacity 0.5s; pointer-events:none;
    `;
    document.body.appendChild(el);
  }
  el.textContent = `OBJECTIVE COMPLETE: ${title}`;
  el.style.opacity = '1';
  setTimeout(() => el.style.opacity = '0', 3000);
}

export function toggleObjectivesList() {
  _visible = !_visible;
  if (!_overlay) {
    _overlay = document.createElement('div');
    _overlay.id = 'objectivesOverlay';
    _overlay.style.cssText = `
      position:fixed; top:0; right:0; width:320px; height:100%;
      background:rgba(0,0,0,0.85); z-index:8000; padding:20px;
      font-family:monospace; color:#c8d6e5; overflow-y:auto; display:none;
      border-left:1px solid #1e2a3a;
    `;
    document.body.appendChild(_overlay);
  }

  if (_visible) {
    let html = '<h3 style="color:#ff4422;margin-bottom:12px;font-size:0.9rem">OBJECTIVES</h3>';
    for (const obj of _objectives) {
      const color = obj.done ? '#00ff44' : '#778';
      const icon = obj.done ? '[+]' : '[ ]';
      html += `
        <div style="margin:8px 0;padding:8px;background:#131a24;border-radius:4px;border-left:3px solid ${color}">
          <div style="font-size:0.8rem;color:${color}">${icon} ${obj.title}</div>
          <div style="font-size:0.7rem;color:#556;margin-top:2px">${obj.desc}</div>
        </div>`;
    }
    html += `<div style="margin-top:12px;font-size:0.7rem;color:#334">${_completed.length}/${_objectives.length} completed</div>`;
    _overlay.innerHTML = html;
    _overlay.style.display = 'block';
  } else {
    _overlay.style.display = 'none';
  }
}
