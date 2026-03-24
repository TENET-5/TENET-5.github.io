/**
 * LirilClaw Storage — client-side persistence for GitHub Pages.
 * API key in localStorage, campaign data in sessionStorage.
 * SEED=118400
 */

const KEY_PREFIX = 'lirilclaw_';

// ── localStorage (persists across sessions) ──

export function getApiKey() {
  return localStorage.getItem(KEY_PREFIX + 'gemini_key') || '';
}

export function setApiKey(key) {
  localStorage.setItem(KEY_PREFIX + 'gemini_key', key);
}

export function clearApiKey() {
  localStorage.removeItem(KEY_PREFIX + 'gemini_key');
}

export function getPreference(name, defaultVal = '') {
  return localStorage.getItem(KEY_PREFIX + 'pref_' + name) || defaultVal;
}

export function setPreference(name, value) {
  localStorage.setItem(KEY_PREFIX + 'pref_' + name, value);
}

// ── sessionStorage (current session only) ──

export function getNarrative() {
  const raw = sessionStorage.getItem(KEY_PREFIX + 'narrative');
  return raw ? JSON.parse(raw) : null;
}

export function setNarrative(data) {
  sessionStorage.setItem(KEY_PREFIX + 'narrative', JSON.stringify(data));
}

export function getPosts() {
  const raw = sessionStorage.getItem(KEY_PREFIX + 'posts');
  return raw ? JSON.parse(raw) : [];
}

export function addPost(post) {
  const posts = getPosts();
  posts.push({ ...post, ts: Date.now() });
  sessionStorage.setItem(KEY_PREFIX + 'posts', JSON.stringify(posts));
}

export function getFormData() {
  const raw = sessionStorage.getItem(KEY_PREFIX + 'form');
  return raw ? JSON.parse(raw) : {};
}

export function setFormData(data) {
  sessionStorage.setItem(KEY_PREFIX + 'form', JSON.stringify(data));
}

// ── Export / Import ──

export function exportAll() {
  const data = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    seed: 118400,
    narrative: getNarrative(),
    posts: getPosts(),
    form: getFormData(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lirilclaw_campaign_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(jsonString) {
  const data = JSON.parse(jsonString);
  if (data.narrative) setNarrative(data.narrative);
  if (data.posts) sessionStorage.setItem(KEY_PREFIX + 'posts', JSON.stringify(data.posts));
  if (data.form) setFormData(data.form);
  return data;
}
