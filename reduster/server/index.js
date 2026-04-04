const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 16;
const TICK_MS = 50; // 20 Hz
const RESPAWN_MS = 10000;

// ── State ──
const players = new Map();
let playerCounter = 0;
const enemies = new Map();
let enemyCounter = 0;
let currentWave = 0;
let waveActive = false;
let gameStarted = false;

// ── Enemy spawn ──
function spawnEnemy(type) {
  const id = `e${enemyCounter++}`;
  const configs = {
    grunt:  { hp: 15, speed: 2.5, damage: 12, score: 10 },
    heavy:  { hp: 40, speed: 1.6, damage: 20, score: 30 },
    ranger: { hp: 10, speed: 2.0, damage:  8, score: 20 },
  };
  const cfg = configs[type] || configs.grunt;
  const angle = Math.random() * Math.PI * 2;
  const radius = 15 + Math.random() * 8;
  const enemy = {
    id, type,
    x: 24 + Math.cos(angle) * radius,
    z: 24 + Math.sin(angle) * radius,
    hp: cfg.hp, maxHp: cfg.hp,
    speed: cfg.speed, damage: cfg.damage, score: cfg.score,
    dead: false, rotation: 0, lastHit: 0,
  };
  enemies.set(id, enemy);
  return enemy;
}

// ── Wave logic ──
function doStartWave() {
  if (players.size === 0) return;
  currentWave++;
  waveActive = true;

  const pc = players.size;
  const mult = 1 + (pc - 1) * 0.3;
  const base = 8 + currentWave * 4;
  const heavies  = currentWave >= 3 ? Math.ceil(currentWave * mult) : 0;
  const rangers  = currentWave >= 2 ? Math.ceil(currentWave * mult) : 0;
  const grunts   = Math.max(1, Math.ceil((base - heavies - rangers) * mult));

  const spawned = [];
  for (let i = 0; i < grunts;  i++) spawned.push(spawnEnemy('grunt'));
  for (let i = 0; i < heavies; i++) spawned.push(spawnEnemy('heavy'));
  for (let i = 0; i < rangers; i++) spawned.push(spawnEnemy('ranger'));
  if (currentWave % 5 === 0) {
    for (let i = 0; i < 3 + Math.floor(currentWave / 5); i++) spawned.push(spawnEnemy('heavy'));
  }

  io.emit('wave_start', { wave: currentWave, enemies: spawned });
}

// ── Enemy AI (server-authoritative) ──
let lastAITick = Date.now();
setInterval(() => {
  if (!waveActive || enemies.size === 0 || players.size === 0) return;
  const now = Date.now();
  const dt = (now - lastAITick) / 1000;
  lastAITick = now;

  const alivePlayers = [...players.values()].filter(p => p.alive);
  if (alivePlayers.length === 0) return;

  enemies.forEach(e => {
    if (e.dead) return;
    // Find nearest player
    let target = null, minDist = Infinity;
    for (const p of alivePlayers) {
      const d = Math.hypot(p.position.x - e.x, p.position.z - e.z);
      if (d < minDist) { minDist = d; target = p; }
    }
    if (!target) return;

    const dx = target.position.x - e.x;
    const dz = target.position.z - e.z;
    const dist = Math.hypot(dx, dz) || 1;

    if (dist > 2.5) {
      e.x += (dx / dist) * e.speed * dt;
      e.z += (dz / dist) * e.speed * dt;
    }
    e.rotation = Math.atan2(dx, dz);

    // Melee damage
    if (dist < 3 && now - e.lastHit > 1200) {
      e.lastHit = now;
      target.health = Math.max(0, target.health - e.damage);
      const sock = io.sockets.sockets.get(target.id);
      if (sock) sock.emit('player_damaged', { amount: e.damage });
      if (target.health <= 0 && target.alive) {
        target.alive = false;
        io.emit('player_died', { id: target.id });
        setTimeout(() => {
          if (!players.has(target.id)) return;
          target.health = 100;
          target.alive = true;
          target.position = { x: 0, y: 1.7, z: 0 };
          io.emit('player_respawned', { id: target.id, position: target.position });
        }, RESPAWN_MS);
      }
    }
  });
}, TICK_MS);

// ── Broadcast player + enemy positions at 20 Hz ──
setInterval(() => {
  if (players.size === 0) return;
  io.emit('players_update', [...players.values()].map(p => ({
    id: p.id, name: p.name,
    position: p.position, rotation: p.rotation,
    health: p.health, alive: p.alive, kills: p.kills,
  })));
  if (enemies.size > 0) {
    const live = [...enemies.values()].filter(e => !e.dead);
    if (live.length > 0) {
      io.emit('enemy_update', live.map(e => ({
        id: e.id, x: e.x, z: e.z, rotation: e.rotation, hp: e.hp,
      })));
    }
  }
}, TICK_MS);

// ── Wave completion check ──
setInterval(() => {
  if (!waveActive || players.size === 0) return;
  if ([...enemies.values()].every(e => e.dead)) {
    waveActive = false;
    io.emit('wave_complete', { wave: currentWave });
    setTimeout(doStartWave, 5000);
  }
}, 1000);

// ── Socket.IO ──
io.on('connection', socket => {
  if (players.size >= MAX_PLAYERS) {
    socket.emit('server_full');
    socket.disconnect();
    return;
  }

  playerCounter++;
  const player = {
    id: socket.id,
    name: `Soldier-${playerCounter}`,
    position: { x: 0, y: 1.7, z: 0 },
    rotation: { y: 0 },
    health: 100, alive: true, kills: 0,
  };
  players.set(socket.id, player);

  // Send full current state to new joiner
  socket.emit('init', {
    id: socket.id,
    name: player.name,
    players: [...players.values()],
    enemies: [...enemies.values()].filter(e => !e.dead),
    wave: currentWave,
    waveActive,
  });
  socket.broadcast.emit('player_joined', player);
  io.emit('player_count', players.size);

  // Client signals game started (clicked "SURVIVAL" or "CAMPAIGN")
  socket.on('player_ready', () => {
    if (!gameStarted) {
      gameStarted = true;
      setTimeout(doStartWave, 4000);
    } else if (waveActive) {
      // Mid-game joiner: resend current wave enemies
      socket.emit('wave_start', {
        wave: currentWave,
        enemies: [...enemies.values()].filter(e => !e.dead),
      });
    }
  });

  socket.on('player_move', data => {
    const p = players.get(socket.id);
    if (!p) return;
    p.position = data.position;
    p.rotation = data.rotation;
  });

  socket.on('kill_enemy', ({ enemyId, damage }) => {
    const e = enemies.get(enemyId);
    if (!e || e.dead) return;
    e.hp -= Math.min(damage || 10, 9999);
    if (e.hp <= 0) {
      e.dead = true;
      enemies.delete(enemyId);
      const p = players.get(socket.id);
      if (p) p.kills++;
      io.emit('enemy_killed', {
        id: enemyId,
        killerId: socket.id,
        killerName: p ? p.name : 'Unknown',
      });
    } else {
      io.emit('enemy_damaged', { id: enemyId, hp: e.hp });
    }
  });

  socket.on('player_damage', ({ amount }) => {
    const p = players.get(socket.id);
    if (!p || !p.alive) return;
    p.health = Math.max(0, p.health - Math.min(amount, 200));
    if (p.health <= 0) {
      p.alive = false;
      io.emit('player_died', { id: socket.id });
      setTimeout(() => {
        if (!players.has(socket.id)) return;
        p.health = 100; p.alive = true;
        p.position = { x: 0, y: 1.7, z: 0 };
        io.emit('player_respawned', { id: socket.id, position: p.position });
      }, RESPAWN_MS);
    }
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('player_left', { id: socket.id });
    io.emit('player_count', players.size);
    if (players.size === 0) {
      enemies.clear();
      currentWave = 0;
      waveActive = false;
      gameStarted = false;
      enemyCounter = 0;
    }
  });
});

app.get('/health', (_, res) =>
  res.json({ ok: true, players: players.size, wave: currentWave, enemies: enemies.size })
);

httpServer.listen(PORT, () => {
  console.log(`[Red Duster] Server on port ${PORT}`);
});
