/**
 * TENET5 Chat Engine
 * 
 * Firebase Realtime Database chat with rooms, presence,
 * moderation, and real-time message sync.
 * 
 * Depends on: js/firebase-config.js (window.tenet5Firebase)
 * 
 * LIRIL/SATOR: OR gate — community signal aggregation
 */
(function () {
  'use strict';

  const ROOMS = {
    general: { name: 'General', icon: '💬', desc: 'Open discussion' },
    evidence: { name: 'Evidence', icon: '📋', desc: 'Evidence analysis' },
    belleville: { name: 'Belleville', icon: '🏛️', desc: 'Belleville/Quinte West OSINT' },
    osint: { name: 'OSINT', icon: '🔍', desc: 'Research methodology' }
  };

  const MAX_MSG_LENGTH = 2000;
  const RATE_LIMIT_MS = 3000;
  const PAGE_SIZE = 50;

  let currentRoom = 'general';
  let messageListener = null;
  let lastSendTime = 0;
  let messageCallbacks = [];
  let presenceCallbacks = [];

  // ── Message Methods ──────────────────────────────────────────
  async function sendMessage(text) {
    const fb = window.tenet5Firebase;
    if (!fb || !fb.currentUser || !fb.db) {
      return { error: 'Not authenticated' };
    }

    // Rate limit
    const now = Date.now();
    if (now - lastSendTime < RATE_LIMIT_MS) {
      return { error: 'Please wait a moment before sending another message' };
    }

    // Validate
    text = (text || '').trim();
    if (!text) return { error: 'Empty message' };
    if (text.length > MAX_MSG_LENGTH) return { error: 'Message too long (max ' + MAX_MSG_LENGTH + ' chars)' };

    const user = fb.currentUser;
    const msg = {
      text: text,
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      edited: false,
      room: currentRoom
    };

    try {
      const ref = fb.db.ref('chat/' + currentRoom).push();
      await ref.set(msg);
      lastSendTime = Date.now();
      return { success: true, key: ref.key };
    } catch (e) {
      console.error('[Chat] Send error:', e);
      return { error: 'Failed to send message' };
    }
  }

  async function editMessage(messageKey, newText) {
    const fb = window.tenet5Firebase;
    if (!fb || !fb.currentUser || !fb.db) return { error: 'Not authenticated' };

    newText = (newText || '').trim();
    if (!newText) return { error: 'Empty message' };

    try {
      const ref = fb.db.ref('chat/' + currentRoom + '/' + messageKey);
      const snapshot = await ref.once('value');
      const msg = snapshot.val();

      if (!msg || msg.uid !== fb.currentUser.uid) {
        return { error: 'Can only edit your own messages' };
      }

      await ref.update({ text: newText, edited: true, editedAt: firebase.database.ServerValue.TIMESTAMP });
      return { success: true };
    } catch (e) {
      return { error: 'Edit failed' };
    }
  }

  async function deleteMessage(messageKey) {
    const fb = window.tenet5Firebase;
    if (!fb || !fb.currentUser || !fb.db) return { error: 'Not authenticated' };

    try {
      const ref = fb.db.ref('chat/' + currentRoom + '/' + messageKey);
      const snapshot = await ref.once('value');
      const msg = snapshot.val();

      if (!msg || msg.uid !== fb.currentUser.uid) {
        return { error: 'Can only delete your own messages' };
      }

      await ref.update({
        text: '[Message deleted]',
        deleted: true,
        deletedAt: firebase.database.ServerValue.TIMESTAMP
      });
      return { success: true };
    } catch (e) {
      return { error: 'Delete failed' };
    }
  }

  // ── Room Management ──────────────────────────────────────────
  function switchRoom(roomId) {
    if (!ROOMS[roomId]) return;
    if (messageListener) {
      const fb = window.tenet5Firebase;
      if (fb && fb.db) {
        fb.db.ref('chat/' + currentRoom).off('child_added', messageListener);
      }
    }
    currentRoom = roomId;
    listenForMessages();
  }

  function getCurrentRoom() { return currentRoom; }
  function getRooms() { return { ...ROOMS }; }

  // ── Real-time Listener ───────────────────────────────────────
  function listenForMessages() {
    const fb = window.tenet5Firebase;
    if (!fb || !fb.db) return;

    const ref = fb.db.ref('chat/' + currentRoom)
      .orderByChild('timestamp')
      .limitToLast(PAGE_SIZE);

    messageListener = ref.on('child_added', function (snapshot) {
      const msg = snapshot.val();
      msg.key = snapshot.key;
      messageCallbacks.forEach(function (cb) {
        try { cb(msg); } catch (e) { /* silent */ }
      });
    });
  }

  function onMessage(callback) {
    messageCallbacks.push(callback);
  }

  // ── Presence ─────────────────────────────────────────────────
  function listenPresence() {
    const fb = window.tenet5Firebase;
    if (!fb || !fb.db) return;

    fb.db.ref('presence').on('value', function (snapshot) {
      const users = [];
      snapshot.forEach(function (child) {
        const data = child.val();
        if (data.online) {
          users.push({
            uid: child.key,
            displayName: data.displayName,
            photoURL: data.photoURL
          });
        }
      });
      presenceCallbacks.forEach(function (cb) {
        try { cb(users); } catch (e) { /* silent */ }
      });
    });
  }

  function onPresenceChange(callback) {
    presenceCallbacks.push(callback);
  }

  // ── Load History ─────────────────────────────────────────────
  async function loadHistory(beforeTimestamp) {
    const fb = window.tenet5Firebase;
    if (!fb || !fb.db) return [];

    const ref = fb.db.ref('chat/' + currentRoom)
      .orderByChild('timestamp')
      .endAt(beforeTimestamp - 1)
      .limitToLast(PAGE_SIZE);

    const snapshot = await ref.once('value');
    const messages = [];
    snapshot.forEach(function (child) {
      const msg = child.val();
      msg.key = child.key;
      messages.push(msg);
    });
    return messages;
  }

  // ── Report Message ───────────────────────────────────────────
  async function reportMessage(messageKey, reason) {
    const fb = window.tenet5Firebase;
    if (!fb || !fb.currentUser || !fb.db) return { error: 'Not authenticated' };

    try {
      await fb.db.ref('reports/' + currentRoom + '/' + messageKey).push({
        reportedBy: fb.currentUser.uid,
        reason: reason || 'Inappropriate content',
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      return { success: true };
    } catch (e) {
      return { error: 'Report failed' };
    }
  }

  // ── Expose Global API ────────────────────────────────────────
  window.tenet5Chat = {
    sendMessage: sendMessage,
    editMessage: editMessage,
    deleteMessage: deleteMessage,
    switchRoom: switchRoom,
    getCurrentRoom: getCurrentRoom,
    getRooms: getRooms,
    onMessage: onMessage,
    onPresenceChange: onPresenceChange,
    loadHistory: loadHistory,
    reportMessage: reportMessage,
    listenForMessages: listenForMessages,
    listenPresence: listenPresence
  };
})();
