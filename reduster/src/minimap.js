// minimap.js — Tactical minimap (M key toggle, always-on compass variant)
// Shows player position, heading, enemies, loot, campfires on a canvas overlay
import { STATE } from './state.js';

const MAP_SIZE = 180;           // px — minimap canvas size
const MAP_RANGE = 200;          // metres — radius of visible area
const WORLD_SIZE = 4000;        // metres — total world size
let _canvas = null;
let _ctx = null;
let _visible = false;
let _fullMap = false;           // M toggles between mini and full

let _enemies = null;            // reference to enemy array (set via init)

export function initMinimap(getEnemiesFn) {
  _enemies = getEnemiesFn;

  _canvas = document.createElement('canvas');
  _canvas.id = 'minimap';
  _canvas.width = MAP_SIZE;
  _canvas.height = MAP_SIZE;
  _canvas.style.cssText = `
    position:fixed; bottom:16px; right:16px; width:${MAP_SIZE}px; height:${MAP_SIZE}px;
    border:2px solid rgba(255,68,34,0.4); border-radius:50%;
    background:rgba(0,0,0,0.6); z-index:800; pointer-events:none;
    display:none;
  `;
  document.body.appendChild(_canvas);
  _ctx = _canvas.getContext('2d');
}

export function toggleMinimap() {
  if (_fullMap) {
    // Full map → close
    _fullMap = false;
    _visible = false;
    _canvas.style.display = 'none';
    _canvas.style.width = `${MAP_SIZE}px`;
    _canvas.style.height = `${MAP_SIZE}px`;
    _canvas.style.borderRadius = '50%';
    _canvas.style.bottom = '16px';
    _canvas.style.right = '16px';
    _canvas.style.top = '';
    _canvas.style.left = '';
    _canvas.width = MAP_SIZE;
    _canvas.height = MAP_SIZE;
  } else if (_visible) {
    // Mini → full map
    _fullMap = true;
    _canvas.style.width = '500px';
    _canvas.style.height = '500px';
    _canvas.style.borderRadius = '8px';
    _canvas.style.bottom = '';
    _canvas.style.right = '';
    _canvas.style.top = '50%';
    _canvas.style.left = '50%';
    _canvas.style.transform = 'translate(-50%,-50%)';
    _canvas.width = 500;
    _canvas.height = 500;
  } else {
    // Off → mini
    _visible = true;
    _canvas.style.display = 'block';
    _canvas.style.transform = '';
  }
}

export function updateMinimap(playerX, playerZ, playerRotY) {
  if (!_visible || !_ctx) return;

  const size = _canvas.width;
  const range = _fullMap ? WORLD_SIZE / 2 : MAP_RANGE;
  const cx = size / 2;
  const cy = size / 2;

  // Clear
  _ctx.clearRect(0, 0, size, size);

  // Background with grid
  _ctx.fillStyle = 'rgba(10,14,20,0.85)';
  if (_fullMap) {
    _ctx.fillRect(0, 0, size, size);
  } else {
    _ctx.beginPath();
    _ctx.arc(cx, cy, cx - 1, 0, Math.PI * 2);
    _ctx.fill();
  }

  // Grid lines
  _ctx.strokeStyle = 'rgba(255,68,34,0.08)';
  _ctx.lineWidth = 0.5;
  const gridSpacing = _fullMap ? size / 8 : size / 4;
  for (let i = 1; i < (_fullMap ? 8 : 4); i++) {
    _ctx.beginPath();
    _ctx.moveTo(i * gridSpacing, 0);
    _ctx.lineTo(i * gridSpacing, size);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.moveTo(0, i * gridSpacing);
    _ctx.lineTo(size, i * gridSpacing);
    _ctx.stroke();
  }

  // Helper: world coords to minimap coords (rotated to player heading)
  const toMap = (wx, wz) => {
    const dx = wx - playerX;
    const dz = wz - playerZ;
    // Rotate by -playerRotY so map is heading-up
    const cos = Math.cos(-playerRotY);
    const sin = Math.sin(-playerRotY);
    const rx = dx * cos - dz * sin;
    const rz = dx * sin + dz * cos;
    return {
      x: cx + (rx / range) * (size / 2),
      y: cy - (rz / range) * (size / 2),
    };
  };

  // Enemies — red dots
  if (_enemies) {
    const enemyList = typeof _enemies === 'function' ? _enemies() : _enemies;
    for (const e of enemyList) {
      if (!e.alive || !e.root) continue;
      const p = toMap(e.root.position.x, e.root.position.z);
      if (p.x < 0 || p.x > size || p.y < 0 || p.y > size) continue;
      _ctx.fillStyle = '#ff3333';
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, _fullMap ? 4 : 3, 0, Math.PI * 2);
      _ctx.fill();
    }
  }

  // Campfire — orange dot
  if (STATE.activeCampfire) {
    const cf = STATE.activeCampfire;
    const p = toMap(cf.position.x, cf.position.z);
    if (p.x >= 0 && p.x <= size && p.y >= 0 && p.y <= size) {
      _ctx.fillStyle = '#ff8800';
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, _fullMap ? 5 : 4, 0, Math.PI * 2);
      _ctx.fill();
    }
  }

  // Player — white triangle (always center, pointing up)
  _ctx.fillStyle = '#ffffff';
  _ctx.beginPath();
  _ctx.moveTo(cx, cy - 6);
  _ctx.lineTo(cx - 4, cy + 4);
  _ctx.lineTo(cx + 4, cy + 4);
  _ctx.closePath();
  _ctx.fill();

  // Cardinal directions (N/S/E/W)
  _ctx.fillStyle = 'rgba(255,68,34,0.6)';
  _ctx.font = `${_fullMap ? 14 : 10}px monospace`;
  _ctx.textAlign = 'center';
  const nPos = toMap(playerX, playerZ + range * 0.9);
  const sPos = toMap(playerX, playerZ - range * 0.9);
  const ePos = toMap(playerX + range * 0.9, playerZ);
  const wPos = toMap(playerX - range * 0.9, playerZ);
  _ctx.fillText('N', nPos.x, nPos.y);
  _ctx.fillText('S', sPos.x, sPos.y);
  _ctx.fillText('E', ePos.x, ePos.y);
  _ctx.fillText('W', wPos.x, wPos.y);

  // Coordinates (full map only)
  if (_fullMap) {
    _ctx.fillStyle = 'rgba(200,214,229,0.5)';
    _ctx.font = '11px monospace';
    _ctx.textAlign = 'left';
    _ctx.fillText(`${Math.round(playerX)}, ${Math.round(playerZ)}`, 8, size - 8);
  }
}
