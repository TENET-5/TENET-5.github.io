// objectives.js — Mission objectives and progression system
// Phase 26: Full parity with Godot MissionManager.gd
// Story campaign (8 missions, 3 acts) + Tactical missions (7 ops)
import { STATE } from './state.js';
import { addKillFeed } from './hud.js';
import { transmitSatorEvent } from './telemetry.js';

let _overlay = null;
let _visible = false;
let _nightsSurvived = 0;
let _wasNight = false;
let _lootCount = 0;
let _survivalSeconds = 0;
let _vehicleDriven = false;

// ── MissionStatus enum (matches Godot MissionManager.gd line 11) ──
const MissionStatus = { IN_PROGRESS: 1, COMPLETED: 2, FAILED: 3 };
const ObjType = { HARVEST: 0, CRAFT: 1, SURVIVE: 2, ELIMINATE: 3, REACH: 4 };

// ── Story Campaign (matches Godot MissionManager._load_initial_missions) ──
const STORY_MISSIONS = [
  {
    id: 1, name: 'Establish a Base Camp', act: 'ACT I: SURVIVAL',
    desc: 'You\'ve been dropped into the Canadian Shield with nothing. Find wood and build a fire before hypothermia sets in.',
    objectives: [
      { id: 1, type: ObjType.HARVEST, target_id: 'wood', target_count: 5, current_count: 0, description: 'Harvest Wood', is_completed: false },
      { id: 2, type: ObjType.CRAFT, target_id: 'campfire', target_count: 1, current_count: 0, description: 'Craft a Campfire', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
  {
    id: 2, name: 'Surviving the Wilderness', act: 'ACT I: SURVIVAL',
    desc: 'Fire alone won\'t keep you alive. Set traps to catch small game before your energy runs out.',
    objectives: [
      { id: 1, type: ObjType.HARVEST, target_id: 'stone', target_count: 5, current_count: 0, description: 'Harvest Stone', is_completed: false },
      { id: 2, type: ObjType.CRAFT, target_id: 'snare', target_count: 1, current_count: 0, description: 'Craft a Snare Trap', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
  {
    id: 3, name: 'First Light', act: 'ACT I: SURVIVAL',
    desc: 'Night falls fast in the boreal. Build a shelter and survive until dawn — the forest comes alive after dark.',
    objectives: [
      { id: 1, type: ObjType.HARVEST, target_id: 'wood', target_count: 8, current_count: 0, description: 'Gather Shelter Materials', is_completed: false },
      { id: 2, type: ObjType.CRAFT, target_id: 'shelter', target_count: 1, current_count: 0, description: 'Build a Shelter', is_completed: false },
      { id: 3, type: ObjType.SURVIVE, target_id: 'night', target_count: 1, current_count: 0, description: 'Survive Until Dawn', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
  {
    id: 4, name: 'Hunter\'s Mark', act: 'ACT I: SURVIVAL',
    desc: 'Snares catch rabbits, but you need real protein. Track and harvest a deer — and learn to treat your wounds.',
    objectives: [
      { id: 1, type: ObjType.HARVEST, target_id: 'raw_venison', target_count: 1, current_count: 0, description: 'Harvest a Deer', is_completed: false },
      { id: 2, type: ObjType.CRAFT, target_id: 'bandage', target_count: 2, current_count: 0, description: 'Craft Bandages', is_completed: false },
      { id: 3, type: ObjType.CRAFT, target_id: 'pemmican', target_count: 1, current_count: 0, description: 'Craft Pemmican', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
  {
    id: 5, name: 'The Radio Signal', act: 'ACT II: DISCOVERY',
    desc: 'A faint transmission crackles through the static — someone else is out here. Find radio components and tune in.',
    objectives: [
      { id: 1, type: ObjType.HARVEST, target_id: 'electronic_parts', target_count: 3, current_count: 0, description: 'Salvage Electronic Parts', is_completed: false },
      { id: 2, type: ObjType.CRAFT, target_id: 'torch', target_count: 2, current_count: 0, description: 'Craft Torches for Night Travel', is_completed: false },
      { id: 3, type: ObjType.HARVEST, target_id: 'radio_component', target_count: 1, current_count: 0, description: 'Find a Radio Transceiver', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
  {
    id: 6, name: 'Supply Run', act: 'ACT II: DISCOVERY',
    desc: 'The resistance cache coordinates came through. Navigate to the drop point and secure supplies before the occupiers find it.',
    objectives: [
      { id: 1, type: ObjType.HARVEST, target_id: 'ammo_556', target_count: 1, current_count: 0, description: 'Recover 5.56mm Ammunition', is_completed: false },
      { id: 2, type: ObjType.HARVEST, target_id: 'medical_kit', target_count: 1, current_count: 0, description: 'Recover Medical Kit', is_completed: false },
      { id: 3, type: ObjType.CRAFT, target_id: 'ammo_pouch', target_count: 1, current_count: 0, description: 'Craft an Ammo Pouch', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
  {
    id: 7, name: 'First Blood', act: 'ACT III: RESISTANCE',
    desc: 'An enemy recon patrol is probing the forest edge. They\'ll find the resistance camp if you don\'t stop them.',
    objectives: [
      { id: 1, type: ObjType.ELIMINATE, target_id: 'enemy', target_count: 3, current_count: 0, description: 'Neutralize Enemy Patrol', is_completed: false },
      { id: 2, type: ObjType.HARVEST, target_id: 'enemy_intel', target_count: 1, current_count: 0, description: 'Recover Enemy Intelligence', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
  {
    id: 8, name: 'Red Duster', act: 'ACT III: RESISTANCE',
    desc: 'The resistance needs a symbol. Raise the Red Duster over the recaptured ranger station and defend it through three nights. Canada endures.',
    objectives: [
      { id: 1, type: ObjType.CRAFT, target_id: 'shelter', target_count: 1, current_count: 0, description: 'Fortify the Ranger Station', is_completed: false },
      { id: 2, type: ObjType.SURVIVE, target_id: 'night', target_count: 3, current_count: 0, description: 'Defend Through Three Nights', is_completed: false },
      { id: 3, type: ObjType.ELIMINATE, target_id: 'enemy', target_count: 8, current_count: 0, description: 'Repel the Counterattack', is_completed: false },
    ],
    status: MissionStatus.IN_PROGRESS,
  },
];

// ── Tactical Missions (matches Godot MissionManager._load_tactical_missions) ──
const TACTICAL_MISSIONS = {
  patrol_alpha: {
    id: 'patrol_alpha', name: 'PATROL ROUTE ALPHA',
    brief: 'Secure the northern logging road. Enemy recon unit spotted at grid 4-7.',
    objectives: [
      { id: 'wp1', type: 'reach', label: 'Reach checkpoint A', position: [200, 0, -150], done: false },
      { id: 'wp2', type: 'reach', label: 'Reach checkpoint B', position: [400, 0, -300], done: false },
      { id: 'elim', type: 'eliminate', label: 'Neutralize recon squad (0/3)', count: 0, target: 3, done: false },
    ],
    reward_xp: 150, active: false, completed: false,
  },
  cache_bravo: {
    id: 'cache_bravo', name: 'SECURE CACHE BRAVO',
    brief: 'Intel reports a hidden supply cache near the old mill. Two hostiles guarding the location.',
    objectives: [
      { id: 'find_cache', type: 'reach', label: 'Locate hidden cache', position: [-180, 0, 220], done: false },
      { id: 'elim_guards', type: 'eliminate', label: 'Eliminate cache guards (0/2)', count: 0, target: 2, done: false },
      { id: 'secure_cache', type: 'reach', label: 'Secure the cache', position: [-175, 0, 225], done: false },
    ],
    reward_xp: 120, active: false, completed: false,
  },
  extract_charlie: {
    id: 'extract_charlie', name: 'EXTRACT CIVILIAN',
    brief: 'A civilian is stranded at an abandoned ranger station. Escort them to the extraction LZ under enemy observation.',
    objectives: [
      { id: 'reach_civilian', type: 'reach', label: 'Reach ranger station', position: [320, 0, 180], done: false },
      { id: 'escort_lz', type: 'reach', label: 'Escort civilian to extraction LZ', position: [500, 0, -80], done: false },
      { id: 'clear_lz', type: 'eliminate', label: 'Clear LZ perimeter (0/2)', count: 0, target: 2, done: false },
    ],
    reward_xp: 200, active: false, completed: false,
  },
  ambush_delta: {
    id: 'ambush_delta', name: 'AMBUSH SUPPLY CONVOY',
    brief: 'Enemy supply trucks use the Trans-Canada corridor at dawn. Set up on the ridge and hit them before they reach the FOB.',
    objectives: [
      { id: 'overwatch', type: 'reach', label: 'Reach overwatch position on ridge', position: [-350, 0, -420], done: false },
      { id: 'disable_lead', type: 'eliminate', label: 'Disable lead vehicle (0/1)', count: 0, target: 1, done: false },
      { id: 'elim_escort', type: 'eliminate', label: 'Neutralize escort squad (0/4)', count: 0, target: 4, done: false },
      { id: 'loot_convoy', type: 'reach', label: 'Loot supply truck', position: [-340, 0, -400], done: false },
    ],
    reward_xp: 250, active: false, completed: false,
  },
  sabotage_echo: {
    id: 'sabotage_echo', name: 'SABOTAGE RADIO TOWER',
    brief: 'Enemy comms relay on Jackpine Hill coordinates their patrols across the sector. Destroy the antenna array and exfil before QRF arrives.',
    objectives: [
      { id: 'approach', type: 'reach', label: 'Approach radio tower compound', position: [480, 0, 320], done: false },
      { id: 'elim_guards', type: 'eliminate', label: 'Eliminate tower guards (0/3)', count: 0, target: 3, done: false },
      { id: 'destroy', type: 'reach', label: 'Place charges on antenna array', position: [485, 0, 325], done: false },
      { id: 'exfil', type: 'reach', label: 'Exfil to treeline before QRF', position: [380, 0, 280], done: false },
    ],
    reward_xp: 300, active: false, completed: false,
  },
  rescue_foxtrot: {
    id: 'rescue_foxtrot', name: 'RESCUE DETAINED CIVILIANS',
    brief: 'Occupiers are holding three trappers at the old Hudson Bay post. Get them out before the morning transport arrives.',
    objectives: [
      { id: 'recon', type: 'reach', label: 'Recon the detention site', position: [-220, 0, 380], done: false },
      { id: 'elim_sentries', type: 'eliminate', label: 'Eliminate sentries (0/3)', count: 0, target: 3, done: false },
      { id: 'free_prisoners', type: 'reach', label: 'Free detained civilians', position: [-215, 0, 385], done: false },
      { id: 'escort_safe', type: 'reach', label: 'Escort civilians to safe house', position: [-100, 0, 300], done: false },
    ],
    reward_xp: 280, active: false, completed: false,
  },
  bridge_golf: {
    id: 'bridge_golf', name: 'HOLD THE BRIDGE',
    brief: 'The railway bridge at Moose Creek is the only crossing for 40 klicks. Take it and hold it against two counter-assault waves.',
    objectives: [
      { id: 'approach_bridge', type: 'reach', label: 'Reach the railway bridge', position: [100, 0, -500], done: false },
      { id: 'clear_bridge', type: 'eliminate', label: 'Clear bridge garrison (0/4)', count: 0, target: 4, done: false },
      { id: 'hold_wave1', type: 'eliminate', label: 'Repel first counter-assault (0/5)', count: 0, target: 5, done: false },
      { id: 'hold_wave2', type: 'eliminate', label: 'Repel second counter-assault (0/6)', count: 0, target: 6, done: false },
    ],
    reward_xp: 400, active: false, completed: false,
  },
};

// ── Milestone Achievements (original simple objectives) ──
const MILESTONES = [
  { id: 'first_blood', title: 'First Blood', desc: 'Eliminate your first enemy combatant.', check: () => STATE.kills >= 1, done: false },
  { id: 'five_kills', title: 'Resistance Fighter', desc: 'Eliminate 5 enemy combatants.', check: () => STATE.kills >= 5, done: false },
  { id: 'ten_kills', title: 'Guerrilla', desc: 'Eliminate 10 enemy combatants.', check: () => STATE.kills >= 10, done: false },
  { id: 'twenty_kills', title: 'One Man Army', desc: 'Eliminate 20 enemy combatants.', check: () => STATE.kills >= 20, done: false },
  { id: 'survive_ten_min', title: 'Endurance', desc: 'Survive for 10 minutes.', check: () => _survivalSeconds >= 600, done: false },
  { id: 'survive_thirty_min', title: 'Survivalist', desc: 'Survive for 30 minutes.', check: () => _survivalSeconds >= 1800, done: false },
  { id: 'loot_five', title: 'Scavenger', desc: 'Loot 5 supply crates or cabins.', check: () => _lootCount >= 5, done: false },
  { id: 'nvg_used', title: 'Night Eyes', desc: 'Activate night vision goggles.', check: () => !!STATE.nvgActive, done: false },
  { id: 'vehicle_driven', title: 'Road Warrior', desc: 'Drive a vehicle for the first time.', check: () => _vehicleDriven, done: false },
];

// ── State ──
let _storyMissions = [];
let _tacticalMissions = {};
let _milestones = [];
let _sandboxMode = true;
let _curMissionIdx = -1; // -1 = sandbox (no story tracking)
let _completedMilestones = [];

export function initObjectives() {
  // Deep clone so restarts are clean
  _storyMissions = JSON.parse(JSON.stringify(STORY_MISSIONS));
  _tacticalMissions = JSON.parse(JSON.stringify(TACTICAL_MISSIONS));
  _milestones = MILESTONES.map(m => ({ ...m }));
  _completedMilestones = [];
  _lootCount = 0;
  _survivalSeconds = 0;
  _nightsSurvived = 0;
  _vehicleDriven = false;
  _sandboxMode = true;
  _curMissionIdx = -1;
}

// ── Campaign API (mirrors MissionManager.start_campaign) ──
export function startCampaign() {
  _sandboxMode = false;
  _curMissionIdx = 0; // first mission index
  addKillFeed('CAMPAIGN STARTED — ACT I');
  transmitSatorEvent('CAMPAIGN_STARTED', JSON.stringify({ mission_id: 1 }));
}

export function getCurrentMission() {
  if (_sandboxMode || _curMissionIdx < 0 || _curMissionIdx >= _storyMissions.length) return null;
  const m = _storyMissions[_curMissionIdx];
  return m.status === MissionStatus.IN_PROGRESS ? m : null;
}

// ── Tactical API (mirrors MissionManager.start_mission) ──
export function startTacticalMission(id) {
  if (!_tacticalMissions[id]) return;
  _tacticalMissions[id].active = true;
  addKillFeed(`TACTICAL: ${_tacticalMissions[id].name}`);
  transmitSatorEvent('TACTICAL_MISSION_STARTED', JSON.stringify({ mission_id: id }));
}

export function getActiveTacticalMissions() {
  return Object.values(_tacticalMissions).filter(m => m.active && !m.completed);
}

// ── Notify hooks (match MissionManager.notify_*) ──
export function notifyHarvest(itemId, amount = 1) {
  _checkStoryObjective(ObjType.HARVEST, itemId, amount);
}

export function notifyCraft(itemId) {
  _checkStoryObjective(ObjType.CRAFT, itemId, 1);
}

export function notifySurvivedNight() {
  _nightsSurvived++;
  _checkStoryObjective(ObjType.SURVIVE, 'night', 1);
}

export function notifyEliminate() {
  _checkStoryObjective(ObjType.ELIMINATE, 'enemy', 1);
  // Also update tactical missions
  for (const id in _tacticalMissions) {
    const m = _tacticalMissions[id];
    if (!m.active || m.completed) continue;
    for (const obj of m.objectives) {
      if (obj.done || obj.type !== 'eliminate') continue;
      obj.count++;
      const baseLabel = obj.label.split('(')[0].trim();
      obj.label = `${baseLabel} (${obj.count}/${obj.target})`;
      if (obj.count >= obj.target) {
        obj.done = true;
        obj.label = '✓ ' + obj.label;
      }
      _checkTacticalComplete(id);
    }
  }
}

export function checkPlayerPosition(pos) {
  for (const id in _tacticalMissions) {
    const m = _tacticalMissions[id];
    if (!m.active || m.completed) continue;
    for (const obj of m.objectives) {
      if (obj.done || obj.type !== 'reach') continue;
      const dx = pos.x - obj.position[0];
      const dz = pos.z - obj.position[2];
      if (Math.sqrt(dx * dx + dz * dz) <= 15.0) {
        obj.done = true;
        obj.label = '✓ ' + obj.label;
        _checkTacticalComplete(id);
      }
    }
  }
}

export function onLoot() { _lootCount++; }
export function onVehicleDriven() { _vehicleDriven = true; }

// ── Core update loop ──
export function updateObjectives(dt) {
  if (!STATE.alive || !STATE.started) return;
  _survivalSeconds += dt;

  // Track night survival
  const isNight = STATE.gameTime < 0.25 || STATE.gameTime > 0.75;
  if (_wasNight && !isNight) notifySurvivedNight();
  _wasNight = isNight;

  // Track vehicle
  if (STATE.inVehicle) _vehicleDriven = true;

  // Check milestones
  for (const ms of _milestones) {
    if (ms.done) continue;
    try {
      if (ms.check()) {
        ms.done = true;
        _completedMilestones.push(ms.id);
        addKillFeed(`MILESTONE: ${ms.title}`);
        _showObjectiveComplete(ms.title);
        transmitSatorEvent('MILESTONE_COMPLETED', JSON.stringify({ id: ms.id, title: ms.title }));
      }
    } catch (e) {}
  }

  // Check player proximity to tactical waypoints
  if (STATE.playerPos) {
    checkPlayerPosition(STATE.playerPos);
  }
}

// ── Internal: story objective checker (mirrors MissionManager._check_objective) ──
function _checkStoryObjective(type, targetId, amount) {
  const m = getCurrentMission();
  if (!m) return;
  let updated = false;
  let allDone = true;

  for (const obj of m.objectives) {
    if (obj.type === type && obj.target_id === targetId && !obj.is_completed) {
      obj.current_count += amount;
      updated = true;
      if (obj.current_count >= obj.target_count) {
        obj.current_count = obj.target_count;
        obj.is_completed = true;
        addKillFeed(`✓ ${obj.description}`);
      }
    }
    if (!obj.is_completed) allDone = false;
  }

  if (allDone && updated) {
    m.status = MissionStatus.COMPLETED;
    _showObjectiveComplete(m.name);
    transmitSatorEvent('STORY_MISSION_COMPLETED', JSON.stringify({ mission_id: m.id, name: m.name }));
    // Advance to next mission (matches Godot line 369)
    _curMissionIdx++;
    if (_curMissionIdx < _storyMissions.length) {
      setTimeout(() => {
        addKillFeed(`NEW MISSION: ${_storyMissions[_curMissionIdx].name}`);
      }, 2000);
    }
  }
}

function _checkTacticalComplete(missionId) {
  const m = _tacticalMissions[missionId];
  for (const obj of m.objectives) {
    if (!obj.done) return;
  }
  m.completed = true;
  m.active = false;
  _showObjectiveComplete(m.name);
  transmitSatorEvent('TACTICAL_MISSION_COMPLETED', JSON.stringify({ mission_id: missionId, name: m.name, reward_xp: m.reward_xp }));
}

// ── Serialization for save/load (mirrors SaveSystem._save_missions / _load_missions) ──
export function serializeMissions() {
  const result = {};
  // Story
  for (const m of _storyMissions) {
    const objProgress = {};
    for (const obj of m.objectives) {
      objProgress[obj.id] = obj.current_count;
    }
    result[m.id] = { status: m.status, objectives: objProgress };
  }
  // Tactical
  for (const id in _tacticalMissions) {
    const m = _tacticalMissions[id];
    const objState = {};
    for (const obj of m.objectives) {
      objState[obj.id] = { done: obj.done, count: obj.count ?? 0 };
    }
    result['tac_' + id] = { active: m.active, completed: m.completed, objectives: objState };
  }
  return result;
}

export function deserializeMissions(data) {
  if (!data) return;
  // Story
  for (const m of _storyMissions) {
    const md = data[m.id];
    if (!md) continue;
    m.status = md.status ?? MissionStatus.IN_PROGRESS;
    if (md.objectives) {
      for (const obj of m.objectives) {
        if (md.objectives[obj.id] !== undefined) {
          obj.current_count = md.objectives[obj.id];
          if (obj.current_count >= obj.target_count) obj.is_completed = true;
        }
      }
    }
  }
  // Find current mission index
  _curMissionIdx = _storyMissions.findIndex(m => m.status === MissionStatus.IN_PROGRESS);
  _sandboxMode = _curMissionIdx < 0;

  // Tactical
  for (const id in _tacticalMissions) {
    const md = data['tac_' + id];
    if (!md) continue;
    _tacticalMissions[id].active = md.active ?? false;
    _tacticalMissions[id].completed = md.completed ?? false;
    if (md.objectives) {
      for (const obj of _tacticalMissions[id].objectives) {
        const od = md.objectives[obj.id];
        if (od) {
          obj.done = od.done ?? false;
          if (obj.count !== undefined) obj.count = od.count ?? 0;
        }
      }
    }
  }
}

// ── UI ──
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
      position:fixed; top:0; right:0; width:360px; height:100%;
      background:rgba(0,0,0,0.92); z-index:8000; padding:20px;
      font-family:monospace; color:#c8d6e5; overflow-y:auto; display:none;
      border-left:1px solid #1e2a3a;
    `;
    document.body.appendChild(_overlay);
  }

  if (_visible) {
    let html = '';

    // Story Campaign
    const cur = getCurrentMission();
    if (cur) {
      html += `<div style="margin-bottom:16px">
        <div style="font-size:0.65rem;color:#556;letter-spacing:1px;margin-bottom:4px">${cur.act}</div>
        <h3 style="color:#ff4422;margin-bottom:6px;font-size:0.9rem">${cur.name}</h3>
        <div style="font-size:0.7rem;color:#778;margin-bottom:10px">${cur.desc}</div>`;
      for (const obj of cur.objectives) {
        const color = obj.is_completed ? '#00ff44' : '#aab';
        const icon = obj.is_completed ? '✓' : '○';
        const progress = obj.target_count > 1 ? ` (${obj.current_count}/${obj.target_count})` : '';
        html += `<div style="margin:4px 0;padding:6px 8px;background:#0d1117;border-radius:3px;border-left:3px solid ${color};font-size:0.78rem;color:${color}">
          ${icon} ${obj.description}${progress}
        </div>`;
      }
      html += '</div>';
    } else if (_sandboxMode) {
      html += `<div style="font-size:0.75rem;color:#556;margin-bottom:16px;padding:8px;background:#0d1117;border-radius:4px;border:1px dashed #333">
        SANDBOX MODE — Press [C] to start campaign
      </div>`;
    }

    // Tactical Missions
    const activeTac = getActiveTacticalMissions();
    if (activeTac.length > 0) {
      html += '<div style="border-top:1px solid #1e2a3a;padding-top:12px;margin-top:8px"><div style="font-size:0.7rem;color:#facc15;letter-spacing:1px;margin-bottom:8px">TACTICAL OPS</div>';
      for (const m of activeTac) {
        html += `<div style="margin-bottom:10px"><div style="font-size:0.8rem;color:#60a5fa;margin-bottom:4px">${m.name}</div>`;
        for (const obj of m.objectives) {
          const c = obj.done ? '#00ff44' : '#778';
          html += `<div style="margin:2px 0;font-size:0.72rem;color:${c};padding-left:8px">${obj.label}</div>`;
        }
        html += '</div>';
      }
      html += '</div>';
    }

    // Milestones
    const doneCount = _milestones.filter(m => m.done).length;
    html += `<div style="border-top:1px solid #1e2a3a;padding-top:12px;margin-top:8px">
      <div style="font-size:0.7rem;color:#556;letter-spacing:1px;margin-bottom:8px">MILESTONES (${doneCount}/${_milestones.length})</div>`;
    for (const ms of _milestones) {
      const color = ms.done ? '#00ff44' : '#445';
      const icon = ms.done ? '[+]' : '[ ]';
      html += `<div style="margin:4px 0;padding:5px 8px;background:#0d1117;border-radius:3px;border-left:3px solid ${color}">
        <div style="font-size:0.75rem;color:${color}">${icon} ${ms.title}</div>
        <div style="font-size:0.65rem;color:#334;margin-top:1px">${ms.desc}</div>
      </div>`;
    }
    html += '</div>';

    _overlay.innerHTML = html;
    _overlay.style.display = 'block';
  } else {
    _overlay.style.display = 'none';
  }
}
