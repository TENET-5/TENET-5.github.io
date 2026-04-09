/**
 * chat.js — Live chat via Supabase Realtime
 * TENET5 Canadian Government Accountability Investigation
 * SEED=118400
 *
 * Supabase setup:
 *   Run this SQL in your Supabase SQL editor:
 *
 *   CREATE TABLE chat_messages (
 *     id          BIGSERIAL PRIMARY KEY,
 *     user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
 *     display_name TEXT NOT NULL DEFAULT 'Anonymous',
 *     avatar_url  TEXT,
 *     provider    TEXT DEFAULT 'anonymous',
 *     content     TEXT NOT NULL,
 *     created_at  TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Anyone can read chat" ON chat_messages FOR SELECT USING (true);
 *   CREATE POLICY "Auth users can insert" ON chat_messages FOR INSERT
 *     WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
 *   ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
 */

import { getCurrentUser, getUserDisplayName, getUserAvatar, getUserProvider } from './auth.js';

const MAX_MSG_LENGTH = 500;
const MAX_HISTORY    = 100;
let _channel = null;
let _onMessage = null;

function getSupabase() {
  return window._supabaseClient;
}

// ── Send a message ────────────────────────────────────────────────────────────
export async function sendMessage(content) {
  const text = content.trim().slice(0, MAX_MSG_LENGTH);
  if (!text) return;

  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const user = getCurrentUser();
  const { error } = await sb.from('chat_messages').insert({
    user_id:      user?.id ?? null,
    display_name: getUserDisplayName(user),
    avatar_url:   getUserAvatar(user),
    provider:     user ? getUserProvider(user) : 'anonymous',
    content:      text,
  });
  if (error) throw error;
}

// ── Load message history ──────────────────────────────────────────────────────
export async function loadHistory() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(MAX_HISTORY);
  if (error) { console.error('[chat] history error:', error); return []; }
  return data || [];
}

// ── Subscribe to realtime messages ───────────────────────────────────────────
export function subscribeToChat(onMessage) {
  const sb = getSupabase();
  if (!sb) return;
  _onMessage = onMessage;

  _channel = sb
    .channel('public:chat_messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages'
    }, payload => {
      if (_onMessage) _onMessage(payload.new);
    })
    .subscribe();
}

export function unsubscribeFromChat() {
  if (_channel) {
    getSupabase()?.removeChannel(_channel);
    _channel = null;
  }
}

// ── Format timestamp ──────────────────────────────────────────────────────────
export function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
}

// ── Provider badge HTML ───────────────────────────────────────────────────────
export function providerBadge(provider) {
  if (provider === 'google')  return '<span class="chat-badge chat-badge--google">G</span>';
  if (provider === 'twitter') return '<span class="chat-badge chat-badge--x">𝕏</span>';
  return '<span class="chat-badge chat-badge--anon">?</span>';
}
