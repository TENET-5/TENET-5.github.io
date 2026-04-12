/**
 * Live Chat — Canadian Accountability Project Community Discussion
 *
 * Firestore-backed realtime chat. Requires Firebase Auth.
 * Works entirely client-side on GitHub Pages.
 */

import {
  db, collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp, isConfigured
} from './firebase-config.js';
import { getCurrentUser } from './auth-ui.js';

var unsubscribe = null;
var lastSendTime = 0;
var RATE_LIMIT_MS = 3000;
var MESSAGE_LIMIT = 100;

// ── Initialize Chat ──
function initChat(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!isConfigured()) {
    container.innerHTML = '<div class="chat-offline"><p>Live chat is being configured. Check back soon.</p></div>';
    return;
  }

  // Listen for auth changes
  window.addEventListener('auth-state-changed', function(e) {
    renderChat(container, e.detail.user);
  });

  // Check current auth state
  var user = getCurrentUser();
  renderChat(container, user);
}

function renderChat(container, user) {
  if (!user) {
    container.innerHTML =
      '<div class="chat-login-prompt">' +
        '<h3>Join the Discussion</h3>' +
        '<p>Sign in with Google or X to participate in live chat.</p>' +
        '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">' +
          '<button class="auth-btn auth-btn-google" onclick="window._t5signInGoogle()">Sign in with Google</button>' +
          '<button class="auth-btn auth-btn-twitter" onclick="window._t5signInTwitter()">Sign in with X</button>' +
        '</div>' +
      '</div>';
    return;
  }

  container.innerHTML =
    '<div class="chat-messages" id="chat-messages"></div>' +
    '<div class="chat-input-bar" style="flex-wrap: wrap;">' +
      '<input type="text" id="chat-input" class="chat-input" placeholder="Type a message..." maxlength="500" autocomplete="off">' +
      '<button id="chat-send" class="chat-send-btn">Send</button>' +
      '<button id="chat-ai-summary" class="chat-send-btn" style="background:var(--bg-surface);color:var(--text-primary);border:1px solid var(--border);" title="Generate Intelligence Summary of Chat">&#10024; AI Summary</button>' +
    '</div>';

  // Wire send button
  var input = document.getElementById('chat-input');
  var sendBtn = document.getElementById('chat-send');
  sendBtn.addEventListener('click', function() { sendMessage(input); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  });
  
  var summaryBtn = document.getElementById('chat-ai-summary');
  if (summaryBtn) {
    summaryBtn.addEventListener('click', generateChatSummary);
  }

  // Start listening for messages
  startListening();
}

async function generateChatSummary() {
  if (!window._t5firebaseVertexAI) {
    alert("Firebase Vertex AI is configuring or offline. Cannot generate summary.");
    return;
  }
  
  var btn = document.getElementById('chat-ai-summary');
  var prevHtml = btn.innerHTML;
  btn.innerHTML = '&#9203; Analyzing...';
  btn.disabled = true;

  try {
    var msgs = Array.from(document.querySelectorAll('.chat-msg-text')).map(el => el.textContent).join('\\n');
    if (!msgs || msgs.length < 10) throw new Error("Not enough chat content to summarize.");
    
    var model = window._t5firebaseVertexAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    var prompt = "Summarize the following community investigation chat. Identify key themes, facts, or anomalies mentioned. Keep it brief and structured:\\n" + msgs;
    
    var result = await model.generateContent(prompt);
    var text = result.response.text();
    
    alert("INTELLIGENCE SUMMARY:\\n\\n" + text);
  } catch (err) {
    console.error("AI Summary error:", err);
    alert("Error generating summary: " + err.message);
  } finally {
    btn.innerHTML = prevHtml;
    btn.disabled = false;
  }
}

function startListening() {
  if (unsubscribe) unsubscribe();
  if (!isConfigured()) return;

  var q = query(
    collection(db, 'chats', 'public', 'messages'),
    orderBy('timestamp', 'desc'),
    limit(MESSAGE_LIMIT)
  );

  unsubscribe = onSnapshot(q, function(snapshot) {
    var messages = [];
    snapshot.forEach(function(doc) {
      messages.push(Object.assign({ id: doc.id }, doc.data()));
    });
    messages.reverse();
    renderMessages(messages);
  }, function(err) {
    console.error('Chat listener error:', err);
  });
}

function renderMessages(messages) {
  var container = document.getElementById('chat-messages');
  if (!container) return;

  var html = '';
  var prevUid = '';
  messages.forEach(function(msg) {
    var isGrouped = msg.uid === prevUid;
    var time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    var photo = msg.photoURL || '';
    var name = msg.displayName || 'Anonymous';
    var initial = name.charAt(0).toUpperCase();

    if (!isGrouped) {
      html += '<div class="chat-msg">';
      html += '<div class="chat-msg-header">';
      html += photo
        ? '<img src="' + escHtml(photo) + '" alt="" class="chat-avatar" referrerpolicy="no-referrer">'
        : '<div class="chat-avatar chat-avatar-initial">' + initial + '</div>';
      html += '<span class="chat-msg-name">' + escHtml(name) + '</span>';
      html += '<span class="chat-msg-time">' + time + '</span>';
      html += '</div>';
    }
    html += '<div class="chat-msg-text">' + escHtml(msg.text || '') + '</div>';
    if (!isGrouped) html += '</div>';
    prevUid = msg.uid;
  });

  if (messages.length === 0) {
    html = '<div class="chat-empty">No messages yet. Be the first to start the conversation.</div>';
  }

  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

async function sendMessage(input) {
  var text = (input.value || '').trim();
  if (!text) return;

  var user = getCurrentUser();
  if (!user) return;

  // Rate limit
  var now = Date.now();
  if (now - lastSendTime < RATE_LIMIT_MS) return;
  lastSendTime = now;

  input.value = '';
  input.focus();

  try {
    await addDoc(collection(db, 'chats', 'public', 'messages'), {
      text: text,
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error('Send message error:', err);
    input.value = text; // Restore on failure
  }
}

function escHtml(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ── Floating Chat Widget ──
function initChatWidget() {
  if (document.getElementById('chat-widget')) return;

  var widget = document.createElement('div');
  widget.id = 'chat-widget';
  widget.className = 'chat-widget';
  widget.innerHTML =
    '<button class="chat-widget-toggle" onclick="window._t5toggleChat()" aria-label="Open chat">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' +
    '</button>' +
    '<div class="chat-widget-panel" id="chat-widget-panel" style="display:none;">' +
      '<div class="chat-widget-header">' +
        '<span>Community Chat</span>' +
        '<button onclick="window._t5toggleChat()" class="chat-widget-close">&times;</button>' +
      '</div>' +
      '<div id="chat-widget-body" class="chat-widget-body"></div>' +
    '</div>';
  document.body.appendChild(widget);
}

window._t5toggleChat = function() {
  var panel = document.getElementById('chat-widget-panel');
  if (!panel) return;
  var isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) {
    initChat('chat-widget-body');
  }
};

export { initChat, initChatWidget };
