/**
 * chat-widget.js — Floating live chat widget injected into every page
 * Canadian Government Accountability Investigation
 *
 * Usage: <script type="module" src="/js/chat-widget.js"></script>
 * Auto-injects the full widget into the page DOM.
 */

import { initAuth, signInWithGoogle, signInWithX, signOut, getCurrentUser,
         getUserDisplayName, getUserAvatar, onAuthChange } from './auth.js';
import { sendMessage, loadHistory, subscribeToChat, formatTime, providerBadge } from './chat.js';

// ── Inject CSS ────────────────────────────────────────────────────────────────
const CSS = `
#t5-chat-fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 9000;
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--accent, #c41e3a); border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(196,30,58,0.4);
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s, box-shadow .2s;
  font-size: 22px; color: #fff;
}
#t5-chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(196,30,58,0.5); }
#t5-chat-fab .t5-badge {
  position: absolute; top: -2px; right: -2px;
  background: #ef4444; color: #fff; border-radius: 50%;
  width: 18px; height: 18px; font-size: 10px; font-weight: 700;
  display: none; align-items: center; justify-content: center;
}

#t5-chat-panel {
  position: fixed; bottom: 92px; right: 24px; z-index: 9000;
  width: 360px; max-height: 560px;
  background: rgba(10,14,22,0.85); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  transform: scale(.9) translateY(20px); opacity: 0; pointer-events: none;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s;
  font-family: 'Inter', sans-serif; overflow: hidden;
}
#t5-chat-panel.open {
  transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
}

.t5-chat-header {
  background: rgba(5,8,16,0.9); color: #fff;
  padding: 14px 16px; display: flex; align-items: center; gap: 10px;
  flex-shrink: 0;
}
.t5-chat-header h3 { margin: 0; font-size: 14px; font-weight: 600; flex: 1; }
.t5-online-count { font-size: 11px; color: rgba(255,255,255,0.6); }
.t5-chat-close {
  background: none; border: none; color: rgba(255,255,255,0.7);
  cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px;
}
.t5-chat-close:hover { color: #fff; background: rgba(255,255,255,0.1); }

.t5-chat-auth {
  padding: 20px 16px; display: flex; flex-direction: column; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.t5-chat-auth p { margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.5); text-align: center; }
.t5-auth-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; border: 1px solid; transition: all .15s;
}
.t5-auth-btn--google {
  background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); color: #e8e8ec;
}
.t5-auth-btn--google:hover { background: rgba(255,255,255,0.12); }
.t5-auth-btn--x {
  background: #000; border-color: #000; color: #fff;
}
.t5-auth-btn--x:hover { background: #111; }
.t5-auth-btn--anon {
  background: none; border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); font-size: 12px;
}
.t5-auth-btn--anon:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.55); }

.t5-chat-user-bar {
  padding: 10px 14px; display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.04); flex-shrink: 0;
}
.t5-user-avatar {
  width: 28px; height: 28px; border-radius: 50%; overflow: hidden;
  background: var(--accent, #c41e3a); display: flex; align-items: center;
  justify-content: center; color: #fff; font-size: 12px; font-weight: 600; flex-shrink: 0;
}
.t5-user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.t5-user-name { font-size: 13px; font-weight: 500; color: #e8e8ec; flex: 1; }
.t5-signout-btn {
  background: none; border: none; font-size: 11px; color: #9ca3af;
  cursor: pointer; padding: 3px 6px; border-radius: 4px;
}
.t5-signout-btn:hover { color: var(--accent, #c41e3a); }

.t5-chat-messages {
  flex: 1; overflow-y: auto; padding: 12px; display: flex;
  flex-direction: column; gap: 10px; min-height: 200px; max-height: 320px;
}
.t5-chat-messages::-webkit-scrollbar { width: 4px; }
.t5-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

.t5-msg { display: flex; gap: 8px; }
.t5-msg-avatar {
  width: 28px; height: 28px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 600;
}
.t5-msg-avatar img { width: 100%; height: 100%; object-fit: cover; }
.t5-msg-body { flex: 1; min-width: 0; }
.t5-msg-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.t5-msg-name { font-size: 12px; font-weight: 600; color: #1a1f36; }
.t5-msg-time { font-size: 10px; color: #9ca3af; }
.t5-msg-text { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.5; word-break: break-word; }

.chat-badge { display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%; font-size: 9px; font-weight: 700; }
.chat-badge--google { background: #4285F4; color: #fff; }
.chat-badge--x { background: #000; color: #fff; }
.chat-badge--anon { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }

.t5-chat-empty {
  text-align: center; color: #9ca3af; font-size: 13px; padding: 24px;
  font-style: italic;
}

.t5-chat-input-area {
  padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; gap: 8px;
  flex-shrink: 0;
}
.t5-chat-input {
  flex: 1; padding: 9px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
  font-size: 13px; font-family: 'Inter', sans-serif; resize: none;
  outline: none; transition: border-color .15s; line-height: 1.4;
  background: rgba(255,255,255,0.05); color: #e8e8ec;
}
.t5-chat-input:focus { border-color: var(--accent, #c41e3a); }
.t5-chat-input::placeholder { color: #9ca3af; }
.t5-send-btn {
  background: var(--accent, #c41e3a); border: none; border-radius: 8px;
  color: #fff; cursor: pointer; padding: 9px 14px; font-size: 14px;
  transition: background .15s; display: flex; align-items: center;
}
.t5-send-btn:hover { background: #a51832; }
.t5-send-btn:disabled { background: rgba(255,255,255,0.1); cursor: not-allowed; }

.t5-chat-error {
  background: rgba(196,30,58,0.15); color: #fca5a5; font-size: 11px; padding: 6px 12px;
  border-top: 1px solid rgba(196,30,58,0.3); text-align: center; display: none;
}

@media (max-width: 420px) {
  #t5-chat-panel { width: calc(100vw - 32px); right: 16px; bottom: 80px; }
  #t5-chat-fab { right: 16px; bottom: 16px; }
}
`;

// ── Inject styles ─────────────────────────────────────────────────────────────
const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

// ── State ─────────────────────────────────────────────────────────────────────
let panelOpen = false;
let anonMode  = false;
let unreadCount = 0;

// ── Build widget HTML ─────────────────────────────────────────────────────────
const fab = document.createElement('button');
fab.id = 't5-chat-fab';
fab.setAttribute('aria-label', 'Open live chat');
fab.innerHTML = `💬 <span class="t5-badge" id="t5-chat-badge"></span>`;

const panel = document.createElement('div');
panel.id = 't5-chat-panel';
panel.setAttribute('role', 'dialog');
panel.setAttribute('aria-label', 'Live community chat');
panel.innerHTML = `
  <div class="t5-chat-header">
    <span>🇨🇦</span>
    <h3>Community Chat</h3>
    <span class="t5-online-count" id="t5-online">Live</span>
    <button class="t5-chat-close" id="t5-chat-close" aria-label="Close chat">✕</button>
  </div>

  <div class="t5-chat-auth" id="t5-chat-auth">
    <p>Sign in to join the discussion</p>
    <button class="t5-auth-btn t5-auth-btn--google" id="t5-signin-google">
      <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Continue with Google
    </button>
    <button class="t5-auth-btn t5-auth-btn--x" id="t5-signin-x">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      Continue with 𝕏
    </button>
    <button class="t5-auth-btn t5-auth-btn--anon" id="t5-chat-anon">
      Continue without signing in (read only)
    </button>
  </div>

  <div class="t5-chat-user-bar" id="t5-chat-user-bar" style="display:none">
    <div class="t5-user-avatar" id="t5-user-avatar"></div>
    <span class="t5-user-name" id="t5-user-name"></span>
    <button class="t5-signout-btn" id="t5-signout">Sign out</button>
  </div>

  <div class="t5-chat-messages" id="t5-chat-messages">
    <div class="t5-chat-empty" id="t5-chat-empty">No messages yet. Be the first!</div>
  </div>

  <div class="t5-chat-error" id="t5-chat-error"></div>

  <div class="t5-chat-input-area" id="t5-chat-input-area" style="display:none">
    <textarea class="t5-chat-input" id="t5-chat-input"
      placeholder="Share your thoughts…" rows="1" maxlength="500"></textarea>
    <button class="t5-send-btn" id="t5-send-btn" aria-label="Send">➤</button>
  </div>
`;

document.body.appendChild(fab);
document.body.appendChild(panel);

// ── Toggle ────────────────────────────────────────────────────────────────────
function openPanel() {
  panelOpen = true;
  panel.classList.add('open');
  fab.setAttribute('aria-expanded', 'true');
  unreadCount = 0;
  const badge = document.getElementById('t5-chat-badge');
  if (badge) badge.style.display = 'none';
}
function closePanel() {
  panelOpen = false;
  panel.classList.remove('open');
  fab.setAttribute('aria-expanded', 'false');
}

fab.addEventListener('click', () => panelOpen ? closePanel() : openPanel());
document.getElementById('t5-chat-close').addEventListener('click', closePanel);

// ── Auth UI ───────────────────────────────────────────────────────────────────
function showError(msg) {
  const el = document.getElementById('t5-chat-error');
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

document.getElementById('t5-signin-google').addEventListener('click', async () => {
  try { await signInWithGoogle(); } catch(e) { showError('Google sign-in failed: ' + e.message); }
});
document.getElementById('t5-signin-x').addEventListener('click', async () => {
  try { await signInWithX(); } catch(e) { showError('X sign-in failed: ' + e.message); }
});
document.getElementById('t5-chat-anon').addEventListener('click', () => {
  anonMode = true;
  document.getElementById('t5-chat-auth').style.display = 'none';
});
document.getElementById('t5-signout').addEventListener('click', async () => {
  await signOut();
  anonMode = false;
});

function updateUserBar(user) {
  const authEl   = document.getElementById('t5-chat-auth');
  const userBar  = document.getElementById('t5-chat-user-bar');
  const inputArea = document.getElementById('t5-chat-input-area');
  const nameEl   = document.getElementById('t5-user-name');
  const avatarEl = document.getElementById('t5-user-avatar');

  if (user) {
    authEl.style.display   = 'none';
    userBar.style.display  = 'flex';
    inputArea.style.display = 'flex';
    nameEl.textContent = getUserDisplayName(user);
    const avatarUrl = getUserAvatar(user);
    avatarEl.innerHTML = avatarUrl
      ? `<img src="${avatarUrl}" alt="" loading="lazy">`
      : getUserDisplayName(user).charAt(0).toUpperCase();
  } else if (anonMode) {
    authEl.style.display    = 'none';
    userBar.style.display   = 'none';
    inputArea.style.display = 'none';
  } else {
    authEl.style.display    = 'flex';
    userBar.style.display   = 'none';
    inputArea.style.display = 'none';
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────
function renderMessage(msg) {
  const empty = document.getElementById('t5-chat-empty');
  if (empty) empty.remove();

  const container = document.getElementById('t5-chat-messages');
  const el = document.createElement('div');
  el.className = 't5-msg';
  el.dataset.id = msg.id;

  const initials = (msg.display_name || '?').charAt(0).toUpperCase();
  const avatarHtml = msg.avatar_url
    ? `<img src="${msg.avatar_url}" alt="" loading="lazy">`
    : initials;

  el.innerHTML = `
    <div class="t5-msg-avatar">${avatarHtml}</div>
    <div class="t5-msg-body">
      <div class="t5-msg-meta">
        <span class="t5-msg-name">${escHtml(msg.display_name || 'Anonymous')}</span>
        ${providerBadge(msg.provider)}
        <span class="t5-msg-time">${formatTime(msg.created_at)}</span>
      </div>
      <div class="t5-msg-text">${escHtml(msg.content)}</div>
    </div>
  `;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;

  if (!panelOpen) {
    unreadCount++;
    const badge = document.getElementById('t5-chat-badge');
    if (badge) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'flex';
    }
  }
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Send ──────────────────────────────────────────────────────────────────────
const input = document.getElementById('t5-chat-input');
const sendBtn = document.getElementById('t5-send-btn');

async function doSend() {
  const text = input.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  try {
    await sendMessage(text);
    input.value = '';
    input.style.height = 'auto';
  } catch(e) {
    showError('Failed to send: ' + e.message);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

sendBtn.addEventListener('click', doSend);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
});
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 80) + 'px';
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  await initAuth();

  onAuthChange(user => updateUserBar(user));

  // Load history
  try {
    const history = await loadHistory();
    history.forEach(renderMessage);
  } catch(e) {
    console.warn('[chat] Could not load history:', e.message);
  }

  // Realtime subscription
  try {
    subscribeToChat(renderMessage);
  } catch(e) {
    console.warn('[chat] Realtime not available:', e.message);
  }
}

boot();
