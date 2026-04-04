// inventory.js — TAB inventory overlay
// Tarkov-inspired grid showing gear, consumables, and quick-use actions
import { STATE } from './state.js';
import { WEAPONS } from './weapons.js';

let _visible = false;
let _overlay = null;

// Item definitions — what can go in inventory
const ITEMS = {
  bandage:   { name: 'Bandage',    icon: '🩹', desc: 'Stop bleeding',      use: () => { STATE.isBleeding = false; STATE.bleedRate = 0; } },
  medkit:    { name: 'IFAK',       icon: '💊', desc: '+40 health',          use: () => { STATE.health = Math.min(STATE.maxHealth, STATE.health + 40); } },
  mre:       { name: 'MRE',        icon: '🥫', desc: '+50 hunger',          use: () => { STATE.hunger = Math.min(100, STATE.hunger + 50); } },
  water:     { name: 'Water',      icon: '💧', desc: '+50 thirst',          use: () => { STATE.thirst = Math.min(100, STATE.thirst + 50); } },
  ammoBox:   { name: 'Ammo Box',   icon: '📦', desc: '+30 reserve ammo',    use: () => { STATE.reserveAmmo = Math.min(300, STATE.reserveAmmo + 30); } },
  grenade:   { name: 'Frag',       icon: '💣', desc: '+1 grenade',          use: () => { STATE.grenades = Math.min(STATE.maxGrenades, STATE.grenades + 1); } },
  heatPack:  { name: 'Heat Pack',  icon: '🔥', desc: '+30 warmth',          use: () => { STATE.warmth = Math.min(100, STATE.warmth + 30); } },
};

// Starting inventory
function _ensureDefaults() {
  if (STATE.inventory.length === 0) {
    STATE.inventory = [
      { id: 'bandage', qty: 2 },
      { id: 'medkit',  qty: 1 },
      { id: 'mre',     qty: 2 },
      { id: 'water',   qty: 2 },
      { id: 'ammoBox', qty: 1 },
    ];
  }
}

function _createOverlay() {
  if (_overlay) return _overlay;

  const el = document.createElement('div');
  el.id = 'inventoryOverlay';
  el.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.85); z-index:9000; display:none;
    font-family:'Courier New',monospace; color:#c8d6e5;
    padding:40px; box-sizing:border-box;
  `;

  el.innerHTML = `
    <div style="max-width:700px;margin:0 auto">
      <h2 style="color:#ff4422;letter-spacing:3px;margin-bottom:8px;font-size:1.2rem">INVENTORY</h2>
      <div style="color:#556;font-size:0.7rem;margin-bottom:20px">TAB to close | Click item to use</div>
      <div id="invGear" style="margin-bottom:20px"></div>
      <div id="invItems" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px"></div>
      <div id="invStatus" style="margin-top:20px;font-size:0.75rem;color:#556"></div>
    </div>
  `;

  document.body.appendChild(el);
  _overlay = el;
  return el;
}

function _render() {
  _ensureDefaults();
  const el = _createOverlay();

  // Gear section — current weapon + ammo + grenades
  const wpn = WEAPONS[STATE.equippedWeapon];
  const gear = el.querySelector('#invGear');
  gear.innerHTML = `
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="background:#131a24;border:1px solid #1e2a3a;border-radius:6px;padding:12px;min-width:200px">
        <div style="color:#ff6644;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Equipped</div>
        <div style="font-size:1rem;color:#fff">${wpn?.name || 'None'}</div>
        <div style="font-size:0.75rem;color:#778">${wpn?.calibre || ''} | ${STATE.ammo}/${wpn?.mag || 0} + ${STATE.reserveAmmo}</div>
      </div>
      <div style="background:#131a24;border:1px solid #1e2a3a;border-radius:6px;padding:12px;min-width:120px">
        <div style="color:#ff6644;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Grenades</div>
        <div style="font-size:1rem;color:#fff">${STATE.grenades} / ${STATE.maxGrenades}</div>
      </div>
      <div style="background:#131a24;border:1px solid #1e2a3a;border-radius:6px;padding:12px;min-width:120px">
        <div style="color:#ff6644;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Vitals</div>
        <div style="font-size:0.75rem;color:#fff">HP ${Math.round(STATE.health)} | Food ${Math.round(STATE.hunger)} | Water ${Math.round(STATE.thirst)}</div>
        <div style="font-size:0.75rem;color:${STATE.isBleeding ? '#ff4444' : '#778'}">${STATE.isBleeding ? 'BLEEDING' : 'Stable'}</div>
      </div>
    </div>
  `;

  // Items grid
  const grid = el.querySelector('#invItems');
  grid.innerHTML = '';
  for (const slot of STATE.inventory) {
    const def = ITEMS[slot.id];
    if (!def || slot.qty <= 0) continue;
    const btn = document.createElement('div');
    btn.style.cssText = `
      background:#131a24;border:1px solid #1e2a3a;border-radius:6px;padding:12px;
      cursor:pointer;text-align:center;transition:border-color 0.2s;
    `;
    btn.innerHTML = `
      <div style="font-size:1.5rem">${def.icon}</div>
      <div style="font-size:0.75rem;color:#fff;margin-top:4px">${def.name}</div>
      <div style="font-size:0.65rem;color:#556">${def.desc}</div>
      <div style="font-size:0.7rem;color:#ff6644;margin-top:4px">x${slot.qty}</div>
    `;
    btn.addEventListener('mouseenter', () => btn.style.borderColor = '#ff6644');
    btn.addEventListener('mouseleave', () => btn.style.borderColor = '#1e2a3a');
    btn.addEventListener('click', () => {
      def.use();
      slot.qty--;
      if (slot.qty <= 0) {
        STATE.inventory = STATE.inventory.filter(s => s.qty > 0);
      }
      _render(); // refresh
    });
    grid.appendChild(btn);
  }

  if (STATE.inventory.filter(s => s.qty > 0).length === 0) {
    grid.innerHTML = '<div style="color:#445;grid-column:span 5;text-align:center;padding:20px">No items</div>';
  }

  // Status
  const status = el.querySelector('#invStatus');
  status.textContent = `Kills: ${STATE.kills} | Time: ${Math.floor(STATE.gameTime * 24)}:${String(Math.floor((STATE.gameTime * 24 * 60) % 60)).padStart(2, '0')}`;
}

export function toggleInventory() {
  _visible = !_visible;
  const el = _createOverlay();
  if (_visible) {
    _render();
    el.style.display = 'block';
    // Release pointer lock so mouse works on UI
    document.exitPointerLock?.();
  } else {
    el.style.display = 'none';
  }
  return _visible;
}

export function isInventoryOpen() {
  return _visible;
}

// Add items to inventory (called when looting)
export function addItem(itemId, qty = 1) {
  _ensureDefaults();
  const existing = STATE.inventory.find(s => s.id === itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    STATE.inventory.push({ id: itemId, qty });
  }
}
