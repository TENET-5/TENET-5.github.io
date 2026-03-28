// ═══════════════════════════════════════════════════════════
// MooseRacks — Frontend Logic
// [REDACTED_BY_LIRIL]5 · LIRIL AI · SEED=118400
// ═══════════════════════════════════════════════════════════

const { invoke } = window.__TAURI__.core;

// ═══ STATE ═══
let currentStatus = null;
let watchdogInterval = null;
const CIRCUMFERENCE = 2 * Math.PI * 90; // timer ring circumference

// ═══ INITIALIZATION ═══
document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  startClock();
  await refreshStatus();
  await loadCredsUI();
  await loadDashboardStats();
  await loadTenet5Status();
  await loadGridState();

  // Start watchdog polling every 5 seconds
  watchdogInterval = setInterval(async () => {
    await invoke("check_watchdog");
    await refreshStatus();
    await loadTenet5Status();
    await loadGridState();
  }, 5000);

  // Update timer display every second
  setInterval(updateTimerDisplay, 1000);

  addLog("MooseRacks Tauri app initialized", "info");
  addLog(`SEED=118400 · [REDACTED_BY_LIRIL]5 · LIRIL AI`, "info");
  addLog("🧠 TENET5 subkernel online — abcxyz discovery loop active", "info");
});

// ═══ TABS ═══
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const tabId = btn.dataset.tab;
      document.getElementById(`panel-${tabId}`).classList.add("active");
    });
  });
}

// ═══ CLOCK ═══
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById("clock").textContent = now.toLocaleTimeString("en-CA", { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

// ═══ STATUS REFRESH ═══
async function refreshStatus() {
  try {
    currentStatus = await invoke("get_status");
    updateUI(currentStatus);
  } catch (e) {
    console.error("Status fetch error:", e);
  }
}

function updateUI(s) {
  // Timer
  updateTimerRing(s);

  // Status bar
  const statusText = document.getElementById("status-text");
  if (!s.enabled) {
    statusText.textContent = "DISARMED";
    statusText.style.color = "var(--text-muted)";
  } else if (s.armed) {
    statusText.textContent = "🔴 TRIGGERED";
    statusText.style.color = "var(--accent-red)";
  } else {
    statusText.textContent = "✅ ARMED";
    statusText.style.color = "var(--accent-green)";
  }

  document.getElementById("status-window").textContent = `${s.checkin_hours}h`;

  if (s.last_checkin) {
    const d = new Date(s.last_checkin);
    document.getElementById("status-checkin").textContent = d.toLocaleString("en-CA", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
    });
  } else {
    document.getElementById("status-checkin").textContent = "Never";
  }

  document.getElementById("status-triggers").textContent = s.trigger_count;

  // Dashboard
  document.getElementById("stat-triggers").textContent = s.trigger_count;
  document.getElementById("stat-images").textContent = s.campaign_images;
  document.getElementById("stat-creds").textContent = s.has_credentials ? "✅" : "❌";
  document.getElementById("info-lirilclaw").textContent = s.lirilclaw_found
    ? `✅ ${s.lirilclaw_path}` : "❌ Not found";
  document.getElementById("info-platforms").textContent = s.platforms.join(", ");

  // Hours input
  document.getElementById("hours-input").value = s.checkin_hours;
}

function updateTimerRing(s) {
  const progress = document.getElementById("timer-progress");
  const countdown = document.getElementById("timer-countdown");
  const label = document.getElementById("timer-label");

  if (!s.enabled) {
    progress.style.strokeDashoffset = CIRCUMFERENCE;
    progress.className = "timer-progress";
    countdown.textContent = "DISARMED";
    countdown.className = "timer-countdown";
    countdown.style.color = "var(--text-muted)";
    countdown.style.fontSize = "20px";
    label.textContent = "NOT ACTIVE";
    return;
  }

  const totalSeconds = s.checkin_hours * 3600;
  const remaining = s.time_remaining_seconds;
  const fraction = remaining / totalSeconds;
  const offset = CIRCUMFERENCE * (1 - fraction);

  progress.style.strokeDashoffset = Math.min(offset, CIRCUMFERENCE);

  countdown.textContent = s.time_remaining_display;
  countdown.style.fontSize = "28px";

  // Color coding
  const pct = (remaining / totalSeconds) * 100;
  if (remaining <= 0) {
    progress.className = "timer-progress expired";
    countdown.className = "timer-countdown expired";
    label.textContent = "⚠️ EXPIRED";
  } else if (pct < 10) {
    progress.className = "timer-progress critical";
    countdown.className = "timer-countdown critical";
    label.textContent = "CRITICAL";
  } else if (pct < 25) {
    progress.className = "timer-progress warning";
    countdown.className = "timer-countdown warning";
    label.textContent = "WARNING";
  } else {
    progress.className = "timer-progress";
    countdown.className = "timer-countdown";
    countdown.style.color = "";
    label.textContent = "REMAINING";
  }
}

// Local countdown between server polls
function updateTimerDisplay() {
  if (!currentStatus || !currentStatus.enabled) return;
  if (currentStatus.time_remaining_seconds > 0) {
    currentStatus.time_remaining_seconds--;
    const s = currentStatus.time_remaining_seconds;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = n => String(n).padStart(2, "0");
    currentStatus.time_remaining_display = h > 0
      ? `${pad(h)}h ${pad(m)}m ${pad(sec)}s`
      : m > 0 ? `${pad(m)}m ${pad(sec)}s` : `${pad(sec)}s`;
    updateTimerRing(currentStatus);
  }
}

// ═══ ACTIONS ═══
async function doCheckin() {
  try {
    currentStatus = await invoke("checkin");
    updateUI(currentStatus);
    addLog("✅ Check-in recorded — timer reset", "checkin");
    showToast("✅ Check-in recorded!", "success");
  } catch (e) {
    addLog(`❌ Check-in failed: ${e}`, "error");
    showToast("Check-in failed", "error");
  }
}

async function doArm() {
  const hours = parseInt(document.getElementById("hours-input").value) || 24;
  try {
    currentStatus = await invoke("arm_switch", { hours });
    updateUI(currentStatus);
    addLog(`🔴 MooseRacks ARMED — ${hours}h window`, "warn");
    showToast(`Armed with ${hours}h window`, "success");
  } catch (e) {
    addLog(`❌ Arm failed: ${e}`, "error");
  }
}

async function doDisarm() {
  try {
    currentStatus = await invoke("disarm_switch");
    updateUI(currentStatus);
    addLog("⬜ MooseRacks DISARMED", "info");
    showToast("Disarmed", "success");
  } catch (e) {
    addLog(`❌ Disarm failed: ${e}`, "error");
  }
}

// ═══ CREDENTIALS ═══
async function loadCredsUI() {
  try {
    const creds = await invoke("load_credentials");
    document.getElementById("cred-ig-user").value = creds.instagram_username || "";
    document.getElementById("cred-ig-pass").value = creds.instagram_password || "";
    document.getElementById("cred-tw-user").value = creds.twitter_username || "";
    document.getElementById("cred-tw-pass").value = creds.twitter_password || "";
    document.getElementById("cred-tw-email").value = creds.twitter_email || "";
    document.getElementById("cred-rd-user").value = creds.reddit_username || "";
    document.getElementById("cred-rd-pass").value = creds.reddit_password || "";
    document.getElementById("cred-em-addr").value = creds.email_address || "";
    document.getElementById("cred-em-pass").value = creds.email_password || "";
    document.getElementById("cred-em-smtp").value = creds.email_smtp || "smtp.gmail.com:587";
  } catch (e) {
    console.error("Load creds error:", e);
  }
}

async function saveCreds() {
  const creds = {
    instagram_username: document.getElementById("cred-ig-user").value,
    instagram_password: document.getElementById("cred-ig-pass").value,
    twitter_username: document.getElementById("cred-tw-user").value,
    twitter_password: document.getElementById("cred-tw-pass").value,
    twitter_email: document.getElementById("cred-tw-email").value,
    reddit_username: document.getElementById("cred-rd-user").value,
    reddit_password: document.getElementById("cred-rd-pass").value,
    email_address: document.getElementById("cred-em-addr").value,
    email_password: document.getElementById("cred-em-pass").value,
    email_smtp: document.getElementById("cred-em-smtp").value || "smtp.gmail.com:587",
  };

  try {
    const ok = await invoke("save_credentials", { creds });
    if (ok) {
      addLog("🔑 Credentials encrypted and saved", "info");
      showToast("Credentials saved!", "success");
      await refreshStatus();
    } else {
      addLog("❌ Failed to save credentials", "error");
      showToast("Save failed", "error");
    }
  } catch (e) {
    addLog(`❌ Credential save error: ${e}`, "error");
    showToast("Save error", "error");
  }
}

// ═══ DASHBOARD ═══
async function loadDashboardStats() {
  try {
    const stats = await invoke("get_lirilclaw_stats");
    document.getElementById("stat-posts").textContent = stats.post_count || 0;
    document.getElementById("info-lastpost").textContent = stats.last_post
      ? new Date(stats.last_post).toLocaleString("en-CA") : "—";
    // Platform status
    document.getElementById("stat-ig").textContent = stats.ig_posted ? "✅" : "❌";
    document.getElementById("stat-tw").textContent = stats.tw_posted ? "✅" : "❌";
    document.getElementById("stat-rd").textContent = stats.rd_posted ? "✅" : "❌";
    // Arrest detections
    document.getElementById("stat-arrests").textContent = stats.arrest_detections || 0;
  } catch (e) {
    console.error("Stats error:", e);
  }
}

async function launchLirilClaw() {
  try {
    const ok = await invoke("launch_lirilclaw");
    if (ok) {
      addLog("🚀 LirilClaw launched", "info");
      showToast("LirilClaw launched!", "success");
    } else {
      addLog("❌ LirilClaw.exe not found", "error");
      showToast("LirilClaw not found", "error");
    }
  } catch (e) {
    addLog(`❌ Launch error: ${e}`, "error");
  }
}

// ═══ LOG ═══
function addLog(msg, type = "info") {
  const container = document.getElementById("log-container");
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  const now = new Date().toLocaleTimeString("en-CA", { hour12: false });
  entry.textContent = `[${now}] ${msg}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

// ═══ TOAST ═══
function showToast(msg, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  });
}

// ═══ TENET5 SUBKERNEL ═══
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function getDaemonColor(status) {
  const s = status.toUpperCase();
  if (s === "ACTIVE" || s === "RUNNING" || s === "FOUND" || s === "SEALED") return "var(--accent-green)";
  if (s === "STANDBY" || s.startsWith("SCORE") || s.startsWith("HANDOFFS") || s.startsWith("IMAGES") || s.startsWith("DETECTIONS")) return "var(--accent-blue)";
  if (s === "MISSING" || s === "STOPPED" || s === "EMPTY") return "var(--accent-red)";
  return "var(--accent-amber)";
}

async function loadTenet5Status() {
  try {
    const t5 = await invoke("get_tenet5_status");

    // Telemetry pills
    document.getElementById("t5-uptime").textContent = formatUptime(t5.kernel_uptime_seconds);
    document.getElementById("t5-abcxyz").textContent = t5.abcxyz_loop_active
      ? `ACTIVE · ${t5.abcxyz_iterations} itr` : "STOPPED";
    document.getElementById("t5-nvnp").textContent = `${t5.nvnp_empirical_score.toFixed(4)} (${t5.nvnp_samples_collected} smp)`;
    document.getElementById("t5-handoffs").textContent = t5.memory_handoff_count;

    // Daemon matrix
    const grid = document.getElementById("daemon-grid");
    grid.innerHTML = "";
    const daemonOrder = [
      "mooseracks_watchdog", "lirilclaw_daemon", "abcxyz_discovery",
      "nvnp_empirical", "millennium_falcon_mem", "credential_vault",
      "arrest_monitor", "campaign_engine"
    ];
    const daemonLabels = {
      "mooseracks_watchdog": "🦌 Watchdog",
      "lirilclaw_daemon": "🔺 LirilClaw",
      "abcxyz_discovery": "🔬 ABCXYZ",
      "nvnp_empirical": "📐 N vs NP",
      "millennium_falcon_mem": "🚀 MF Memory",
      "credential_vault": "🔑 Vault",
      "arrest_monitor": "🚨 Arrests",
      "campaign_engine": "📦 Campaign"
    };
    for (const key of daemonOrder) {
      const status = t5.daemon_status[key] || "UNKNOWN";
      const node = document.createElement("div");
      node.className = "daemon-node";
      node.innerHTML = `
        <div class="daemon-indicator" style="background: ${getDaemonColor(status)};
             box-shadow: 0 0 8px ${getDaemonColor(status)};"></div>
        <div class="daemon-info">
          <div class="daemon-name">${daemonLabels[key] || key}</div>
          <div class="daemon-state">${status}</div>
        </div>
      `;
      grid.appendChild(node);
    }

    // Campaign analytics
    document.getElementById("t5-images").textContent = t5.campaign_total_images;
    document.getElementById("t5-posts").textContent = t5.campaign_total_posts;
    document.getElementById("t5-triggers").textContent = t5.campaign_total_triggers;
    document.getElementById("t5-arrests").textContent = t5.arrest_detections;

    // Discovery log
    updateDiscoveryLog(t5.discovery_log);
  } catch (e) {
    console.error("TENET5 status error:", e);
  }
}

function updateDiscoveryLog(events) {
  const container = document.getElementById("discovery-log-entries");
  if (!events || events.length === 0) {
    container.innerHTML = '<div class="discovery-entry muted">No discovery events yet — run a discovery loop.</div>';
    return;
  }
  container.innerHTML = "";
  // Show most recent first
  const recent = events.slice().reverse().slice(0, 20);
  for (const ev of recent) {
    const entry = document.createElement("div");
    entry.className = "discovery-entry";
    const time = new Date(ev.timestamp).toLocaleTimeString("en-CA", { hour12: false });
    entry.innerHTML = `
      <span class="de-type">[${ev.event_type}]</span>
      <span class="de-time">${time}</span>
      <span class="de-detail">${ev.detail}</span>
      <span class="de-score">${ev.score.toFixed(4)}</span>
    `;
    container.appendChild(entry);
  }
}

async function doRunDiscovery() {
  try {
    const t5 = await invoke("run_discovery_loop");
    await loadTenet5Status();
    addLog(`🔬 Discovery loop #${t5.abcxyz_iterations} — NvNP=${t5.nvnp_empirical_score.toFixed(4)} — Handoff #${t5.memory_handoff_count}`, "info");
    showToast(`Discovery #${t5.abcxyz_iterations} complete`, "success");
  } catch (e) {
    addLog(`❌ Discovery loop error: ${e}`, "error");
    showToast("Discovery failed", "error");
  }
}

async function doForceHandoff() {
  try {
    // Run discovery loop which includes a handoff
    const t5 = await invoke("run_discovery_loop");
    await loadTenet5Status();
    addLog(`🚀 Millennium Falcon memory handoff #${t5.memory_handoff_count} forced`, "checkin");
    showToast(`Memory handoff #${t5.memory_handoff_count}`, "success");
  } catch (e) {
    addLog(`❌ Handoff error: ${e}`, "error");
    showToast("Handoff failed", "error");
  }
}

// ═══ TENET5 GRID STATE (NATS / Convergence / Gastown) ═══
async function loadGridState() {
  try {
    const g = await invoke("get_tenet5_grid_state");

    // NATS Streaming Grid
    const nats = g.nats || {};
    const natsInd = document.getElementById("nats-status-indicator");
    const natsConn = document.getElementById("nats-conn-status");
    if (nats.connected) {
      natsInd.style.background = "var(--accent-green, #00cc66)";
      natsInd.style.boxShadow = "0 0 8px var(--accent-green, #00cc66)";
      natsConn.textContent = "CONNECTED";
    } else {
      natsInd.style.background = "var(--accent-red, #ff4444)";
      natsInd.style.boxShadow = "0 0 8px var(--accent-red, #ff4444)";
      natsConn.textContent = "OFFLINE";
    }
    document.getElementById("nats-in-msgs").textContent = (nats.in_msgs || 0).toLocaleString();
    document.getElementById("nats-out-msgs").textContent = (nats.out_msgs || 0).toLocaleString();
    document.getElementById("nats-connections").textContent = nats.connections || 0;
    document.getElementById("nats-memory").textContent = `${(nats.mem_mb || 0).toFixed(1)} MB`;

    // Convergence Monitor
    const conv = g.convergence || {};
    const convScore = document.getElementById("conv-score");
    if (conv.converged) {
      convScore.textContent = `${conv.passed}/${conv.total} CONVERGED`;
      convScore.style.color = "var(--accent-green, #00cc66)";
    } else {
      convScore.textContent = `${conv.passed || 0}/${conv.total || 0}`;
      convScore.style.color = "var(--accent-amber, #ffa500)";
    }

    const convGrid = document.getElementById("convergence-grid");
    convGrid.innerHTML = "";
    const checks = conv.checks || [];
    for (const chk of checks) {
      const node = document.createElement("div");
      node.className = "conv-check";
      node.innerHTML = `
        <span class="conv-icon">${chk.pass ? "✅" : "❌"}</span>
        <span class="conv-name">${chk.name}</span>
        <span class="conv-info">${chk.info}</span>
      `;
      convGrid.appendChild(node);
    }

    // Sator Z-Bands
    const bands = g.z_bands || [];
    const bandsEl = document.getElementById("sator-bands");
    bandsEl.innerHTML = "";
    const perf = g.perf_score || {};
    const dims = perf.dimensions || {};
    for (const band of bands) {
      const score = dims[band.name] || 0;
      const bar = document.createElement("div");
      bar.className = "zband-bar";
      bar.innerHTML = `
        <span class="zband-name" style="color:${band.color}">${band.name}</span>
        <div class="zband-track">
          <div class="zband-fill" style="width:${score}%;background:${band.color}"></div>
        </div>
        <span class="zband-score">${score.toFixed(1)}</span>
        <span class="zband-hw">${band.hw}</span>
      `;
      bandsEl.appendChild(bar);
    }

    // Gastown Factory Matrix
    const gasPerf = document.getElementById("gastown-perf");
    gasPerf.textContent = `${(perf.overall || 0).toFixed(1)} ${perf.tier || "OFFLINE"}`;
    gasPerf.style.color = perf.tier === "OPERATIONAL" ?
      "var(--accent-green, #00cc66)" : "var(--accent-amber, #ffa500)";

    const gasGrid = document.getElementById("gastown-grid");
    gasGrid.innerHTML = "";
    const factories = g.gastown || [];
    for (const f of factories) {
      const card = document.createElement("div");
      card.className = "gastown-card";
      card.innerHTML = `
        <div class="gastown-card-header">
          <span class="gastown-online">${f.online ? "🟢" : "🔴"}</span>
          <strong>${f.name}</strong>
        </div>
        <div class="gastown-departments">
          ${(f.departments || []).map(d => `<span class="gastown-dept">${d}</span>`).join("")}
        </div>
      `;
      gasGrid.appendChild(card);
    }

  } catch (e) {
    console.debug("Grid state fetch:", e);
  }
}

// ═══ OSINT GEOFENCING MAP ═══
let osintMap = null;
let targetMarkers = [];
let targetZones = [];

// Initialize map if it doesn't exist
function initOsintMap() {
  if (osintMap) return;
  // Initialize Leaflet targeting Ottawa Parliament area
  osintMap = L.map('osintMap').setView([45.4215, -75.6972], 13);
  
  // Use a dark-themed open street map variant or default OSM inverted for aesthetics
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
  }).addTo(osintMap);
  
  // Custom marker icons
  window.customIcons = {
    politician: L.divIcon({ className: 'custom-icon-pol', html: '🏛️', iconSize: [24, 24] }),
    gang: L.divIcon({ className: 'custom-icon-gang', html: '💀', iconSize: [24, 24] }),
    cops: L.divIcon({ className: 'custom-icon-cop', html: '🚓', iconSize: [24, 24] }),
    spy: L.divIcon({ className: 'custom-icon-spy', html: '👁️', iconSize: [24, 24] }),
    discord: L.divIcon({ className: 'custom-icon-discord', html: '🎧', iconSize: [24, 24] }),
    steam: L.divIcon({ className: 'custom-icon-steam', html: '🎮', iconSize: [24, 24] }),
    insta: L.divIcon({ className: 'custom-icon-insta', html: '📷', iconSize: [24, 24] }),
    sigint: L.divIcon({ className: 'custom-icon-sigint', html: '📡', iconSize: [28, 28] }),
    crypto: L.divIcon({ className: 'custom-icon-crypto', html: '💰', iconSize: [24, 24] }),
    imint: L.divIcon({ className: 'custom-icon-imint', html: '📸', iconSize: [28, 28] }),
    cybint: L.divIcon({ className: 'custom-icon-cybint', html: '🌐', iconSize: [28, 28] })
  };
}

async function loadOsintData() {
  initOsintMap();
  
  try {
    const response = await fetch('data/osint_targets.json');
    if (!response.ok) throw new Error("Could not load osint_targets.json");
    const data = await response.json();
    
    // Clear old markers
    targetMarkers.forEach(m => osintMap.removeLayer(m));
    targetZones.forEach(z => osintMap.removeLayer(z));
    targetMarkers = [];
    targetZones = [];
    
    // Filter toggles
    const showPol = document.getElementById('filter-politicians').checked;
    const showGang = document.getElementById('filter-gangs').checked;
    const showCop = document.getElementById('filter-cops').checked;
    const showSpy = document.getElementById('filter-spies').checked;
    const showDiscord = document.getElementById('filter-discord') ? document.getElementById('filter-discord').checked : true;
    const showSteam = document.getElementById('filter-steam') ? document.getElementById('filter-steam').checked : true;
    const showInsta = document.getElementById('filter-insta') ? document.getElementById('filter-insta').checked : true;
    const showSigint = document.getElementById('filter-sigint') ? document.getElementById('filter-sigint').checked : true;
    const showFinint = document.getElementById('filter-finint') ? document.getElementById('filter-finint').checked : true;
    const showImint = document.getElementById('filter-imint') ? document.getElementById('filter-imint').checked : true;
    const showCybint = document.getElementById('filter-cybint') ? document.getElementById('filter-cybint').checked : true;
    
    let plotted = 0;
    let zones = 0;
    
    data.targets.forEach(t => {
      let isVisible = false;
      let color = '#fff';
      let icon = window.customIcons.politician;
      
      if (t.type === 'politician') { isVisible = showPol; color = '#ff3333'; icon = window.customIcons.politician; }
      else if (t.type === 'gang') { isVisible = showGang; color = '#6600cc'; icon = window.customIcons.gang; }
      else if (t.type === 'cops') { isVisible = showCop; color = '#0066ff'; icon = window.customIcons.cops; }
      else if (t.type === 'foreign_agent') { isVisible = showSpy; color = '#39ff14'; icon = window.customIcons.spy; }
      else if (t.type === 'discord_node') { isVisible = showDiscord; color = '#5865F2'; icon = window.customIcons.discord; }
      else if (t.type === 'steam_footprint') { isVisible = showSteam; color = '#00adee'; icon = window.customIcons.steam; }
      else if (t.type === 'instagram_op') { isVisible = showInsta; color = '#E1306C'; icon = window.customIcons.insta; }
      else if (t.type === 'sigint_intercept') { isVisible = showSigint; color = '#ffaa00'; icon = window.customIcons.sigint; }
      else if (t.type === 'crypto_wallet') { isVisible = showFinint; color = '#ffd700'; icon = window.customIcons.crypto; }
      else if (t.type === 'imint_exif') { isVisible = showImint; color = '#ff3333'; icon = window.customIcons.imint; }
      else if (t.type === 'cybint_onion') { isVisible = showCybint; color = '#ff00ff'; icon = window.customIcons.cybint; }
      
      if (!isVisible) return;
      
      // Draw Geofence radius
      if (t.radius_m) {
        const zone = L.circle([t.lat, t.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.1,
          radius: t.radius_m,
          dashArray: '5, 5'
        }).addTo(osintMap);
        targetZones.push(zone);
        zones++;
      }
      
      // Draw Marker
      const marker = L.marker([t.lat, t.lng], { icon: icon }).addTo(osintMap);
      // Attach the internal ID so we can look it up for drawing edges
      marker._osintId = t.id;
      
      const popupHtml = `
        <div style="font-family:'JetBrains Mono'; padding:5px;">
          <strong style="color:${color}; font-size:1.1rem; border-bottom:1px solid ${color}; display:block; margin-bottom:5px;">${t.name}</strong>
          <div style="color:#aaa; font-size:0.8rem; margin-bottom:8px;">[ID: ${t.id}] | TYPE: ${t.type.toUpperCase()}</div>
          <div style="color:#eee; font-size:0.9rem;">${t.intel}</div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      targetMarkers.push(marker);
      plotted++;
    });
    
    // Draw Edges (Polylines) to visualize network cross-interactions
    if (data.edges) {
      data.edges.forEach(edge => {
        const sourceMarker = targetMarkers.find(m => m._osintId === edge.source);
        const targetMarker = targetMarkers.find(m => m._osintId === edge.target);
        if (sourceMarker && targetMarker) {
          const sLatLng = sourceMarker.getLatLng();
          const tLatLng = targetMarker.getLatLng();
          
          let edgeColor = '#39ff14'; // default spy-green
          if (edge.type.includes('Discord') || edge.type.includes('VoIP')) edgeColor = '#5865F2';
          if (edge.type.includes('Steam') || edge.type.includes('Alias Wash')) edgeColor = '#00adee';
          if (edge.type.includes('Insta') || edge.type.includes('Social Drop')) edgeColor = '#E1306C';
          if (edge.type.includes('Radiating Broadcast')) edgeColor = '#ffaa00';
          if (edge.type.includes('Dark Web Finance')) edgeColor = '#ffd700';
          if (edge.type.includes('Physical Location Track')) edgeColor = '#ff3333';
          if (edge.type.includes('Tor Routing Hop')) edgeColor = '#ff00ff';
          
          // Draw a glowing laser line
          const polyline = L.polyline([sLatLng, tLatLng], {
            color: edgeColor, 
            weight: edge.weight || 2,
            opacity: 0.6,
            className: 'animate-neon-line'
          }).addTo(osintMap);
          
          polyline.bindPopup(`<strong style="color:${edgeColor};">Interaction:</strong> ${edge.type}`);
          targetZones.push(polyline); // Push to zones array so it clears cleanly on reload
        }
      });
    }
    
    document.getElementById('stat-total-targets').textContent = plotted;
    document.getElementById('stat-active-zones').textContent = zones;
    showToast(`OSINT Grid Updated: ${plotted} Targets Mapped`, "info");
    
  } catch(e) {
    console.error("OSINT map error:", e);
    showToast("Failed to sync OSINT data", "error");
  }
}

// Bind event listeners to filters to reload map on toggle
document.addEventListener("DOMContentLoaded", () => {
  ['filter-politicians', 'filter-gangs', 'filter-cops', 'filter-spies', 'filter-discord', 'filter-steam', 'filter-insta', 'filter-sigint', 'filter-finint', 'filter-imint', 'filter-cybint'].forEach(id => {
    const el = document.getElementById(id);
    if(el) { el.addEventListener('change', loadOsintData); }
  });
  
  // Specifically trigger map resize when panel becomes active 
  // (Leaflet needs invalidateSize() if initialized while hidden)
  document.getElementById('tab-geofence').addEventListener('click', () => {
    setTimeout(() => {
      initOsintMap();
      osintMap.invalidateSize();
      loadOsintData();
    }, 100);
  });
});

