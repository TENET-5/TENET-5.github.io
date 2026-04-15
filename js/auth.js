/**
 * auth.js — Supabase OAuth2 (Google + X/Twitter) authentication
 * Canadian Government Accountability Investigation
 *
 * Setup: Create a free project at https://supabase.com
 *   1. Enable Google OAuth in Auth → Providers → Google
 *   2. Enable Twitter/X OAuth in Auth → Providers → Twitter
 *   3. Set Site URL to https://tenet5.github.io
 *   4. Add redirect URL: https://tenet5.github.io/auth-callback.html
 *   5. Replace SUPABASE_URL and SUPABASE_ANON_KEY below with your project values
 */

const SUPABASE_URL  = window.SUPABASE_URL  || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = window.SUPABASE_ANON || 'YOUR_ANON_KEY';

// ── Supabase client (loaded via CDN in HTML) ─────────────────────────────────
function getSupabase() {
  if (!window.supabase) throw new Error('Supabase JS not loaded');
  if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return window._supabaseClient;
}

// ── Auth state ───────────────────────────────────────────────────────────────
let _currentUser = null;
const _listeners = [];

export function onAuthChange(cb) {
  _listeners.push(cb);
  if (_currentUser !== null) cb(_currentUser);
}

function _notify(user) {
  _currentUser = user;
  _listeners.forEach(cb => cb(user));
}

// ── Initialize — restore session from localStorage ───────────────────────────
export async function initAuth() {
  try {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    _notify(session?.user ?? null);

    sb.auth.onAuthStateChange((_event, session) => {
      _notify(session?.user ?? null);
    });
  } catch (e) {
    console.warn('[auth] Supabase not configured yet:', e.message);
    _notify(null);
  }
}

// ── Sign in ──────────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${location.origin}/auth-callback.html`,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });
  if (error) throw error;
}

export async function signInWithX() {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'twitter',
    options: { redirectTo: `${location.origin}/auth-callback.html` }
  });
  if (error) throw error;
}

// ── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const sb = getSupabase();
  await sb.auth.signOut();
  _notify(null);
}

// ── User helpers ─────────────────────────────────────────────────────────────
export function getCurrentUser() { return _currentUser; }

export function getUserDisplayName(user) {
  if (!user) return 'Anonymous';
  return user.user_metadata?.full_name
    || user.user_metadata?.user_name
    || user.email?.split('@')[0]
    || 'User';
}

export function getUserAvatar(user) {
  if (!user) return null;
  return user.user_metadata?.avatar_url
    || user.user_metadata?.picture
    || null;
}

export function getUserProvider(user) {
  if (!user) return null;
  return user.app_metadata?.provider || 'email';
}
