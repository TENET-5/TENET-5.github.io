// inventory.js — TAB inventory overlay
// Phase 28: Godot CraftingManager.gd ↔ web crafting.js parity
import { STATE } from './state.js';
import { WEAPONS } from './weapons.js';
import { transmitSatorEvent } from './telemetry.js';
import { notifyCraft, notifyHarvest } from './objectives.js';

let _visible = false;
let _overlay = null;
let _craftingTab = false;

// ── Extended Item Definitions (Matches Godot) ──
export const ITEMS = {
  // Medical & Survival
  bandage:       { name: 'Bandage',         icon: '🩹', desc: 'Stop bleeding (+10 HP)',   use: () => { STATE.isBleeding = false; STATE.bleedRate = 0; STATE.health = Math.min(STATE.maxHealth, STATE.health + 10); } },
  medkit:        { name: 'IFAK',            icon: '💊', desc: '+40 health',              use: () => { STATE.health = Math.min(STATE.maxHealth, STATE.health + 40); } },
  tourniquet:    { name: 'Tourniquet',      icon: '🧵', desc: 'Stop severe bleeding',    use: () => { STATE.isBleeding = false; STATE.bleedRate = 0; } },
  warm_jacket:   { name: 'Warm Jacket',     icon: '🧥', desc: 'Passive warmth boost',    use: null },
  
  // Food & Drink
  mre:           { name: 'MRE',             icon: '🥫', desc: '+50 hunger',              use: () => { STATE.hunger = Math.min(100, STATE.hunger + 50); } },
  canned_beans:  { name: 'Canned Beans',    icon: '🥫', desc: '+40 hunger',              use: () => { STATE.hunger = Math.min(100, STATE.hunger + 40); } },
  water:         { name: 'Water',           icon: '💧', desc: '+50 thirst',              use: () => { STATE.thirst = Math.min(100, STATE.thirst + 50); } },
  water_bottle:  { name: 'Water Bottle',    icon: '🧊', desc: '+50 thirst',              use: () => { STATE.thirst = Math.min(100, STATE.thirst + 50); } },
  dirty_water:   { name: 'Dirty Water',     icon: '🚱', desc: 'Needs purification',      use: () => { STATE.thirst = Math.min(100, STATE.thirst + 20); STATE.health = Math.max(0, STATE.health - 15); } },
  raw_meat:      { name: 'Raw Meat',        icon: '🥩', desc: 'Cook before eating',      use: () => { STATE.hunger = Math.min(100, STATE.hunger + 20); STATE.health = Math.max(0, STATE.health - 10); } },
  cooked_meat:   { name: 'Cooked Meat',     icon: '🍗', desc: '+60 hunger',              use: () => { STATE.hunger = Math.min(100, STATE.hunger + 60); } },
  rabbit_meat:   { name: 'Raw Rabbit',      icon: '🍖', desc: 'Cook before eating',      use: () => { STATE.hunger = Math.min(100, STATE.hunger + 15); STATE.health = Math.max(0, STATE.health - 10); } },
  raw_fish:      { name: 'Raw Fish',        icon: '🐟', desc: 'Cook before eating',      use: () => { STATE.hunger = Math.min(100, STATE.hunger + 15); STATE.health = Math.max(0, STATE.health - 10); } },
  fish_stew:     { name: 'Fish Stew',       icon: '🍲', desc: '+80 hunger, +20 warmth',  use: () => { STATE.hunger = Math.min(100, STATE.hunger + 80); STATE.warmth = Math.min(100, STATE.warmth + 20); } },
  berries:       { name: 'Berries',         icon: '🫐', desc: '+10 hunger, +5 thirst',   use: () => { STATE.hunger = Math.min(100, STATE.hunger + 10); STATE.thirst = Math.min(100, STATE.thirst + 5); } },
  blueberry:     { name: 'Blueberries',     icon: '🫐', desc: '+10 hunger',              use: () => { STATE.hunger = Math.min(100, STATE.hunger + 10); } },
  pemmican:      { name: 'Pemmican',        icon: '🧆', desc: '+60 hunger, lasts long',  use: () => { STATE.hunger = Math.min(100, STATE.hunger + 60); } },
  cattail_root:  { name: 'Cattail Root',    icon: '🌾', desc: 'Edible if cooked',        use: null },
  cattail_bread: { name: 'Cattail Bread',   icon: '🍞', desc: '+30 hunger',              use: () => { STATE.hunger = Math.min(100, STATE.hunger + 30); } },
  
  // Tactical & Warmth
  ammoBox:       { name: 'Ammo Box',        icon: '📦', desc: '+30 reserve ammo',        use: () => { STATE.reserveAmmo = Math.min(300, STATE.reserveAmmo + 30); } },
  ammo_556:      { name: '5.56x45mm Ammo',  icon: '📎', desc: '+30 reserve ammo',        use: () => { STATE.reserveAmmo = Math.min(300, STATE.reserveAmmo + 30); } },
  grenade:       { name: 'Frag Grenade',    icon: '💣', desc: '+1 grenade',              use: () => { STATE.grenades = Math.min(STATE.maxGrenades, STATE.grenades + 1); } },
  heatPack:      { name: 'Heat Pack',       icon: '🔥', desc: '+30 warmth',              use: () => { STATE.warmth = Math.min(100, STATE.warmth + 30); } },
  torch:         { name: 'Torch',           icon: '🪔', desc: '+15 warmth',              use: () => { STATE.warmth = Math.min(100, STATE.warmth + 15); } },
  ammo_pouch:    { name: 'Ammo Pouch',      icon: '👝', desc: '+60 max reserve ammo',    use: () => { /* Logic to increase max ammo could go here */ } },
  suppressor:    { name: 'Suppressor',      icon: '🔕', desc: 'Tactical stealth',        use: null },
  radio_component: { name: 'Radio Comm',    icon: '📻', desc: 'Mission item',            use: null },
  
  // Teas & Potions
  labrador_tea:  { name: 'Labrador Tea',    icon: '🌿', desc: 'Crafting material',       use: null },
  warm_tea:      { name: 'Warm Tea',        icon: '🍵', desc: '+40 warmth, +20 thirst',  use: () => { STATE.warmth = Math.min(100, STATE.warmth + 40); STATE.thirst = Math.min(100, STATE.thirst + 20); } },
  chaga_mushroom:{ name: 'Chaga Mushroom',  icon: '🍄', desc: 'Crafting material',       use: null },
  chaga_brew:    { name: 'Chaga Brew',      icon: '☕', desc: '+30 health, +20 warmth',  use: () => { STATE.health = Math.min(STATE.maxHealth, STATE.health + 30); STATE.warmth = Math.min(100, STATE.warmth + 20); } },
  wild_mint:     { name: 'Wild Mint',       icon: '🍃', desc: 'Crafting material',       use: null },
  wild_leek:     { name: 'Wild Leek',       icon: '🧅', desc: 'Crafting material',       use: null },
  moss:          { name: 'Moss',            icon: '🌱', desc: 'Crafting material',       use: null },
  herbs:         { name: 'Wild Herbs',      icon: '🌿', desc: 'Generic herbs',           use: null },
  
  // Tools
  hatchet:       { name: 'Hatchet',         icon: '🪓', desc: 'Tool (crafting)',           use: null },
  hunting_knife: { name: 'Hunting Knife',   icon: '🔪', desc: 'Tool (crafting)',           use: null },
  fishing_rod:   { name: 'Fishing Rod',     icon: '🎣', desc: 'Tool (fishing)',            use: null },
  snare:         { name: 'Snare Trap',      icon: '🪤', desc: 'Tool (trapping)',           use: null },
  rope:          { name: 'Rope',            icon: '🪢', desc: 'Crafting material',         use: null },
  cordage:       { name: 'Cordage',         icon: '🧶', desc: 'Crafting material',         use: null },
  
  // Materials
  wood:          { name: 'Wood',            icon: '🪵', desc: 'Crafting material',         use: null },
  scrap_metal:   { name: 'Scrap Metal',     icon: '⚙️', desc: 'Crafting material',         use: null },
  metal:         { name: 'Scrap Metal',     icon: '⚙️', desc: 'Crafting material',         use: null }, // alias
  cloth:         { name: 'Cloth',           icon: '🧵', desc: 'Crafting material',         use: null },
  hide:          { name: 'Animal Hide',     icon: '🐻', desc: 'Crafting material',         use: null },
  electronic_parts: { name: 'Electronics',  icon: '🔌', desc: 'Crafting material',         use: null },
  matches:       { name: 'Matches',         icon: '🔥', desc: 'Firestarter',               use: null },
  stone:         { name: 'Stone',           icon: '🪨', desc: 'Crafting material',         use: null },
  gunpowder:     { name: 'Gunpowder',       icon: '🔶', desc: 'Explosives crafting',       use: null },
  fuel:          { name: 'Fuel Can',        icon: '⛽', desc: 'Vehicle fuel',              use: null },
  enemy_intel:   { name: 'Enemy Intel',     icon: '📁', desc: 'Mission item',              use: null },
  
  // Placed structures (represent building actions)
  campfire:       { name: 'Campfire',       icon: '🔥', desc: 'Provides warmth/cooking',   use: () => { STATE.activeCampfire = true; } },
  shelter:        { name: 'Shelter',        icon: '⛺', desc: 'Protection / Rest area',    use: () => { /* Logic to set safe area */ } },
  medical_kit:    { name: 'Medical Kit',    icon: '🚑', desc: 'Mission item / Heavy heal', use: () => { STATE.health = STATE.maxHealth; } },
};

// ── 24 Godot-Parity Crafting Recipes ──
export const RECIPES = [
  // Survival Essentials
  { id: 'build_campfire', name: 'Build Campfire', result: 'campfire', qty: 1, ingredients: [{ id: 'wood', qty: 3 }, { id: 'matches', qty: 1 }], needs_fire: false, needs_tool: '' },
  { id: 'craft_bandage', name: 'Craft Bandage', result: 'bandage', qty: 2, ingredients: [{ id: 'cloth', qty: 2 }], needs_fire: false, needs_tool: '' },
  { id: 'craft_rope', name: 'Craft Rope', result: 'rope', qty: 1, ingredients: [{ id: 'cloth', qty: 4 }], needs_fire: false, needs_tool: '' },
  
  // Campfire Cooking (needs_fire: true)
  { id: 'cook_meat', name: 'Cook Meat', result: 'cooked_meat', qty: 1, ingredients: [{ id: 'raw_meat', qty: 1 }], needs_fire: true, needs_tool: '' },
  { id: 'purify_water', name: 'Purify Water', result: 'water_bottle', qty: 1, ingredients: [{ id: 'dirty_water', qty: 1 }], needs_fire: true, needs_tool: '' },
  { id: 'cook_berries', name: 'Cook Berries', result: 'canned_beans', qty: 1, ingredients: [{ id: 'berries', qty: 4 }], needs_fire: true, needs_tool: '' },
  
  // Tool Crafting
  { id: 'craft_hatchet', name: 'Craft Hatchet', result: 'hatchet', qty: 1, ingredients: [{ id: 'wood', qty: 2 }, { id: 'scrap_metal', qty: 2 }], needs_fire: false, needs_tool: '' },
  { id: 'craft_hunting_knife', name: 'Craft Hunting Knife', result: 'hunting_knife', qty: 1, ingredients: [{ id: 'scrap_metal', qty: 1 }, { id: 'cloth', qty: 1 }], needs_fire: false, needs_tool: '' },
  
  // Clothing & Shelter
  { id: 'craft_warm_jacket', name: 'Craft Warm Jacket', result: 'warm_jacket', qty: 1, ingredients: [{ id: 'hide', qty: 2 }, { id: 'cloth', qty: 3 }], needs_fire: false, needs_tool: 'hunting_knife' },
  { id: 'build_shelter', name: 'Build Shelter', result: 'shelter', qty: 1, ingredients: [{ id: 'wood', qty: 5 }, { id: 'rope', qty: 2 }], needs_fire: false, needs_tool: 'hatchet' },
  
  // Medical & Trapping
  { id: 'craft_tourniquet', name: 'Craft Tourniquet', result: 'tourniquet', qty: 1, ingredients: [{ id: 'cloth', qty: 3 }], needs_fire: false, needs_tool: '' },
  { id: 'craft_fishing_rod', name: 'Craft Fishing Rod', result: 'fishing_rod', qty: 1, ingredients: [{ id: 'wood', qty: 2 }, { id: 'rope', qty: 1 }], needs_fire: false, needs_tool: 'hunting_knife' },
  { id: 'craft_snare_trap', name: 'Craft Snare Trap', result: 'snare', qty: 1, ingredients: [{ id: 'wood', qty: 2 }, { id: 'rope', qty: 1 }], needs_fire: false, needs_tool: '' },
  { id: 'cook_rabbit', name: 'Cook Rabbit', result: 'cooked_meat', qty: 1, ingredients: [{ id: 'rabbit_meat', qty: 1 }], needs_fire: true, needs_tool: '' },
  { id: 'tan_hide', name: 'Tan Hide', result: 'hide', qty: 1, ingredients: [{ id: 'hide', qty: 1 }], needs_fire: true, needs_tool: 'hunting_knife' },
  
  // Biome Foraging & Teas
  { id: 'labrador_tea', name: 'Labrador Tea', result: 'warm_tea', qty: 1, ingredients: [{ id: 'labrador_tea', qty: 2 }, { id: 'water_bottle', qty: 1 }], needs_fire: true, needs_tool: '' },
  { id: 'chaga_brew', name: 'Chaga Brew', result: 'chaga_brew', qty: 1, ingredients: [{ id: 'chaga_mushroom', qty: 1 }, { id: 'water_bottle', qty: 1 }], needs_fire: true, needs_tool: '' },
  { id: 'berry_pemmican', name: 'Berry Pemmican', result: 'pemmican', qty: 2, ingredients: [{ id: 'blueberry', qty: 5 }, { id: 'cooked_meat', qty: 1 }], needs_fire: false, needs_tool: 'hunting_knife' },
  { id: 'cattail_bread', name: 'Cattail Bread', result: 'cattail_bread', qty: 2, ingredients: [{ id: 'cattail_root', qty: 3 }], needs_fire: true, needs_tool: '' },
  { id: 'herbal_poultice', name: 'Herbal Poultice', result: 'bandage', qty: 3, ingredients: [{ id: 'wild_mint', qty: 2 }, { id: 'moss', qty: 1 }], needs_fire: false, needs_tool: '' },
  { id: 'fish_stew', name: 'Fish Stew', result: 'fish_stew', qty: 1, ingredients: [{ id: 'raw_fish', qty: 1 }, { id: 'wild_leek', qty: 1 }, { id: 'water_bottle', qty: 1 }], needs_fire: true, needs_tool: '' },
  
  // Tactical & Misc
  { id: 'craft_torch', name: 'Craft Torch', result: 'torch', qty: 1, ingredients: [{ id: 'wood', qty: 1 }, { id: 'cloth', qty: 1 }], needs_fire: false, needs_tool: '' },
  { id: 'cordage', name: 'Cordage', result: 'cordage', qty: 2, ingredients: [{ id: 'cloth', qty: 1 }], needs_fire: false, needs_tool: '' },
  { id: 'ammo_pouch', name: 'Ammo Pouch', result: 'ammo_pouch', qty: 1, ingredients: [{ id: 'cordage', qty: 2 }, { id: 'hide', qty: 1 }], needs_fire: false, needs_tool: 'hunting_knife' },
  { id: 'improvised_suppressor', name: 'Improvised Suppressor', result: 'suppressor', qty: 1, ingredients: [{ id: 'scrap_metal', qty: 2 }, { id: 'water_bottle', qty: 1 }, { id: 'cloth', qty: 1 }], needs_fire: false, needs_tool: 'hunting_knife' },
  { id: 'radio_repair_kit', name: 'Radio Repair Kit', result: 'radio_component', qty: 1, ingredients: [{ id: 'electronic_parts', qty: 2 }, { id: 'scrap_metal', qty: 1 }], needs_fire: false, needs_tool: '' },
  { id: 'craft_medkit', name: 'Craft IFAK (Basic)', result: 'medkit', qty: 1, ingredients: [{ id: 'bandage', qty: 2 }, { id: 'herbs', qty: 1 }], needs_fire: false, needs_tool: '' },
  { id: 'craft_ammo', name: 'Craft Ammo (Basic)', result: 'ammoBox', qty: 1, ingredients: [{ id: 'scrap_metal', qty: 2 }, { id: 'gunpowder', qty: 1 }], needs_fire: false, needs_tool: '' },
];

function _ensureDefaults() {
  if (STATE.inventory.length === 0) {
    STATE.inventory = [
      { id: 'bandage', qty: 2 },
      { id: 'hatchet', qty: 1 },
      { id: 'hunting_knife', qty: 1 },
      { id: 'medkit',  qty: 1 },
      { id: 'mre',     qty: 2 },
      { id: 'water_bottle', qty: 1 },
      { id: 'wood', qty: 10 },
      { id: 'matches', qty: 5 },
      { id: 'cloth', qty: 8 },
      { id: 'scrap_metal', qty: 4 },
      { id: 'raw_meat', qty: 2 },
      { id: 'dirty_water', qty: 2 },
      { id: 'berries', qty: 10 },
      { id: 'hide', qty: 3 }
    ];
  }
}

function _createOverlay() {
  if (_overlay) return _overlay;

  const el = document.createElement('div');
  el.id = 'inventoryOverlay';
  el.style.cssText = `
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.88); z-index:9000; display:none;
    font-family:'Courier New',monospace; color:#c8d6e5;
    padding:40px; box-sizing:border-box; overflow-y:auto;
    backdrop-filter:blur(4px);
  `;

  document.body.appendChild(el);
  _overlay = el;
  return el;
}

export function hasItem(itemId, qty = 1) {
  const slot = STATE.inventory.find(i => i.id === itemId || (itemId === 'metal' && i.id === 'scrap_metal'));
  return slot && slot.qty >= qty;
}

export function removeItem(itemId, qty = 1) {
  const targetId = itemId === 'metal' ? 'scrap_metal' : itemId;
  const slot = STATE.inventory.find(i => i.id === targetId);
  if (!slot) return false;
  slot.qty -= qty;
  if (slot.qty <= 0) {
    STATE.inventory = STATE.inventory.filter(i => i.qty > 0);
  }
  return true;
}

// Add items to inventory (called when looting/crafting)
export function addItem(itemId, qty = 1) {
  _ensureDefaults();
  const targetId = itemId === 'metal' ? 'scrap_metal' : itemId;
  const existing = STATE.inventory.find(s => s.id === targetId);
  if (existing) {
    existing.qty += qty;
  } else {
    STATE.inventory.push({ id: targetId, qty });
  }
  
  // Mission Tracking Hook
  if (typeof notifyHarvest === 'function') {
    notifyHarvest(targetId, qty);
  }
}

export function canCraft(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;
  
  // Proximity & Requirements Check (Godot parity)
  const isNearCampfire = !!STATE.activeCampfire;
  if (recipe.needs_fire && !isNearCampfire) return false;
  if (recipe.needs_tool !== '' && !hasItem(recipe.needs_tool, 1)) return false;
  
  return recipe.ingredients.every(ing => hasItem(ing.id, ing.qty));
}

export function craft(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe || !canCraft(recipeId)) return false;
  
  for (const ing of recipe.ingredients) {
    removeItem(ing.id, ing.qty);
  }
  
  // Some recipes drop world items vs inv items
  if (recipe.result === 'campfire') {
    STATE.activeCampfire = true; // Could spawn physical object in full web port
  } else {
    addItem(recipe.result, recipe.qty);
  }
  
  // Mission Tracking Hook
  if (typeof notifyCraft === 'function') {
    notifyCraft(recipe.result);
  }
  
  // Transmit OSINT telemetry tracing the crafted tactical gear
  if (typeof transmitSatorEvent === 'function') {
    transmitSatorEvent('SURVIVAL_CRAFT', JSON.stringify({ recipe: recipe.name, yield: recipe.qty }));
  }
  
  return true;
}

function _render() {
  _ensureDefaults();
  const el = _createOverlay();
  const wpn = WEAPONS[STATE.equippedWeapon];
  const isNearCampfire = !!STATE.activeCampfire;

  let html = \`
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="color:#ff4422;letter-spacing:3px;font-size:1.3rem;margin:0">INVENTORY</h2>
        <div style="display:flex;gap:8px">
          <button id="invTabItems" style="background:\${!_craftingTab ? '#ff4422' : 'transparent'};border:1px solid #ff4422;color:#fff;padding:6px 16px;font-family:inherit;font-size:0.8rem;cursor:pointer;letter-spacing:0.1em">ITEMS</button>
          <button id="invTabCraft" style="background:\${_craftingTab ? '#ff4422' : 'transparent'};border:1px solid #ff4422;color:#fff;padding:6px 16px;font-family:inherit;font-size:0.8rem;cursor:pointer;letter-spacing:0.1em">CRAFTING</button>
        </div>
      </div>
      <div style="color:#556;font-size:0.7rem;margin-bottom:20px">TAB to close | Click item to use</div>

      <!-- Gear Section -->
      <div id="invGear" style="margin-bottom:20px; display:flex;gap:16px;flex-wrap:wrap">
        <div style="background:#131a24;border:1px solid #1e2a3a;border-radius:6px;padding:12px;min-width:200px">
          <div style="color:#ff6644;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Equipped</div>
          <div style="font-size:1rem;color:#fff">\${wpn?.name || 'None'}</div>
          <div style="font-size:0.75rem;color:#778">\${wpn?.calibre || ''} | \${STATE.ammo}/\${wpn?.mag || 0} + \${STATE.reserveAmmo}</div>
        </div>
        <div style="background:#131a24;border:1px solid #1e2a3a;border-radius:6px;padding:12px;min-width:120px">
          <div style="color:#ff6644;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Grenades</div>
          <div style="font-size:1rem;color:#fff">\${STATE.grenades} / \${STATE.maxGrenades}</div>
        </div>
        <div style="background:#131a24;border:1px solid #1e2a3a;border-radius:6px;padding:12px;min-width:200px">
          <div style="color:#ff6644;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Vitals</div>
          <div style="font-size:0.75rem;color:#fff;display:flex;gap:8px">
            <span style="color:#ff4444">HP \${Math.round(STATE.health)}</span>
            <span style="color:#44ff66">Food \${Math.round(STATE.hunger)}</span>
            <span style="color:#44aaff">Water \${Math.round(STATE.thirst)}</span>
            <span style="color:#ffaa44">Temp \${Math.round(STATE.warmth)}</span>
          </div>
          <div style="font-size:0.75rem;color:\${STATE.isBleeding ? '#ff4444' : '#778'}">\${STATE.isBleeding ? 'BLEEDING' : 'Stable'}</div>
        </div>
      </div>
  \`;

  if (!_craftingTab) {
    // Items Grid
    html += \`<div id="invItems" style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px">\`;
    for (const slot of STATE.inventory) {
      const def = ITEMS[slot.id];
      if (!def || slot.qty <= 0) continue;
      const usable = def.use ? 'cursor:pointer' : 'cursor:default;opacity:0.7';
      html += \`
        <div class="inv-item" data-item="\${slot.id}" style="
          background:rgba(19,26,36,0.9);border:1px solid #1e2a3a;border-radius:8px;padding:14px;
          text-align:center;transition:all 0.2s;\${usable}
        ">
          <div style="font-size:2rem">\${def.icon}</div>
          <div style="font-size:0.75rem;color:#fff;margin-top:6px;line-height:1.2">\${def.name}</div>
          <div style="font-size:0.6rem;color:#556;margin-top:4px">\${def.desc}</div>
          <div style="font-size:0.8rem;color:#ff6644;margin-top:6px;font-weight:700">x\${slot.qty}</div>
        </div>
      \`;
    }
    if (STATE.inventory.filter(i => i.qty > 0).length === 0) {
      html += \`<div style="color:#445;grid-column:span 6;text-align:center;padding:30px;font-size:0.9rem">Empty — loot crates and cabins to find supplies</div>\`;
    }
    html += \`</div>\`;
  } else {
    // Crafting Grid - Godot Parity
    html += \`
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:0.75rem;color:#778;align-items:center;">
        <span>CRAFTING BENCH</span>
        <span style="padding:4px 8px;border-radius:4px;background:\${isNearCampfire ? 'rgba(255,100,50,0.2)' : 'rgba(0,0,0,0.5)'};color:\${isNearCampfire ? '#ffaa44' : '#556'}">
          \${isNearCampfire ? '🔥 Campfire Active' : '❄️ No Campfire'}
        </span>
      </div>
      <div id="craftItems" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
    \`;
    for (const recipe of RECIPES) {
      const available = canCraft(recipe.id);
      const resultDef = ITEMS[recipe.result];
      
      let reqs = '';
      if (recipe.needs_fire) reqs += \`<span style="margin-right:6px;color:\${isNearCampfire ? '#ffaa44' : '#ff4444'}">[🔥]</span>\`;
      if (recipe.needs_tool !== '') {
        const hasTool = hasItem(recipe.needs_tool, 1);
        reqs += \`<span style="color:\${hasTool ? '#aab' : '#ff4444'}">[⚒️ \${ITEMS[recipe.needs_tool]?.name.split(' ')[0]}]</span>\`;
      }
      
      html += \`
        <div class="craft-item" data-recipe="\${recipe.id}" style="
          background:rgba(19,26,36,0.9);border:1px solid \${available ? '#22aa44' : '#1e2a3a'};
          border-radius:8px;padding:12px;text-align:center;
          cursor:\${available ? 'pointer' : 'default'};opacity:\${available ? '1' : '0.45'};
          transition:all 0.2s; position:relative;
        ">
          <div style="font-size:2rem">\${resultDef?.icon ?? '?'}</div>
          <div style="font-size:0.75rem;color:#fff;margin-top:6px;font-weight:700">\${recipe.name}</div>
          <div style="font-size:0.6rem;color:#556;margin-top:4px">
            \${recipe.ingredients.map(i => \`\${ITEMS[i.id]?.icon ?? ''}\${i.qty}\`).join(' + ')} → \${resultDef?.icon ?? ''}x\${recipe.qty}
          </div>
          \${reqs ? \`<div style="font-size:0.65rem;margin-top:6px">\${reqs}</div>\` : ''}
          <div style="font-size:0.65rem;color:\${available ? '#22aa44' : '#ff4444'};margin-top:6px;font-weight:700">
            \${available ? 'CRAFT' : 'MISSING REQUIREMENTS'}
          </div>
        </div>
      \`;
    }
    html += \`</div>\`;
  }

  // Footer status
  html += \`
    <div style="margin-top:24px;padding:12px;background:rgba(19,26,36,0.7);border-radius:6px;display:flex;gap:20px;font-size:0.75rem;color:#778">
      <span>Time: \${Math.floor(STATE.gameTime * 24)}:\${String(Math.floor((STATE.gameTime * 24 * 60) % 60)).padStart(2, '0')}</span>
      <span style="margin-left:auto">Kills: \${STATE.kills}</span>
    </div>
  </div>\`;

  el.innerHTML = html;

  // Bind Events for Tabs
  el.querySelector('#invTabItems')?.addEventListener('click', () => { _craftingTab = false; _render(); });
  el.querySelector('#invTabCraft')?.addEventListener('click', () => { _craftingTab = true; _render(); });

  // Bind Events for Items
  el.querySelectorAll('.inv-item').forEach(item => {
    const itemId = item.dataset.item;
    item.addEventListener('mouseenter', () => item.style.borderColor = '#ff6644');
    item.addEventListener('mouseleave', () => item.style.borderColor = '#1e2a3a');
    item.addEventListener('click', () => {
      const def = ITEMS[itemId];
      if (def && def.use) {
        def.use();
        removeItem(itemId, 1);
        
        // Remove active campfire logic check if using campfire item
        if (itemId === 'campfire') {
          // Additional immediate render to show campfire badge active
          STATE.activeCampfire = true;
        }

        _render(); // Refresh UI instantly
      }
    });
  });

  // Bind Events for Crafting
  el.querySelectorAll('.craft-item').forEach(item => {
    const recipeId = item.dataset.recipe;
    item.addEventListener('mouseenter', () => {
      if (canCraft(recipeId)) item.style.borderColor = '#44ff66';
    });
    item.addEventListener('mouseleave', () => {
      item.style.borderColor = canCraft(recipeId) ? '#22aa44' : '#1e2a3a';
    });
    item.addEventListener('click', () => {
      if (craft(recipeId)) _render();
    });
  });
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
