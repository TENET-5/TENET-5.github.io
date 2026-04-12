/**
 * Auth UI — Canadian Accountability Project Login/Logout Component
 * Renders login button or user avatar in nav. Google + Twitter/X via Firebase.
 */
import { auth, db, googleProvider, twitterProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, isConfigured } from './firebase-config.js';

var currentUser = null;

function initAuthUI() {
  if (!isConfigured()) { renderOfflineMode(); return; }
  onAuthStateChanged(auth, function(user) {
    currentUser = user;
    user ? renderLoggedIn(user) : renderLoggedOut();
    if (user) saveUserProfile(user);
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user: user } }));
  });
}

async function signInWithGoogle() {
  if (!isConfigured()) return showSetupMessage();
  try { await signInWithPopup(auth, googleProvider); } catch(e) { if (e.code !== 'auth/popup-closed-by-user') console.error(e); }
}
async function signInWithTwitter() {
  if (!isConfigured()) return showSetupMessage();
  try { await signInWithPopup(auth, twitterProvider); } catch(e) { if (e.code !== 'auth/popup-closed-by-user') console.error(e); }
}
async function handleSignOut() { try { await signOut(auth); } catch(e) { console.error(e); } }

async function saveUserProfile(user) {
  if (!isConfigured()) return;
  try {
    var ref = doc(db, 'users', user.uid);
    var snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { displayName: user.displayName||'Anonymous', email: user.email||'', photoURL: user.photoURL||'', provider: (user.providerData[0]||{}).providerId||'unknown', createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() });
    } else {
      await setDoc(ref, { lastLogin: new Date().toISOString() }, { merge: true });
    }
  } catch(e) { /* Firestore not ready */ }
}

function esc(s) { var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

function renderLoggedIn(user) {
  var c = document.getElementById('auth-container'); if (!c) return;
  var photo = user.photoURL||'', name = user.displayName||'User', ini = name.charAt(0).toUpperCase();
  c.innerHTML = '<div class="auth-user">' + (photo ? '<img src="'+photo+'" alt="" class="auth-avatar" referrerpolicy="no-referrer">' : '<div class="auth-avatar auth-avatar-initial">'+ini+'</div>') + '<span class="auth-name">'+esc(name)+'</span><button class="auth-btn auth-btn-logout" onclick="window._t5signOut()">Sign Out</button></div>';
}
function renderLoggedOut() {
  var c = document.getElementById('auth-container'); if (!c) return;
  c.innerHTML = '<div class="auth-login-buttons"><button class="auth-btn auth-btn-google" onclick="window._t5signInGoogle()"><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Google</button><button class="auth-btn auth-btn-twitter" onclick="window._t5signInTwitter()"><svg width="12" height="12" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;fill:#fff;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>X</button></div>';
}
function renderOfflineMode() {
  var c = document.getElementById('auth-container'); if (!c) return;
  c.innerHTML = '<div class="auth-offline"><span class="auth-offline-label">Login coming soon</span></div>';
}
function showSetupMessage() { alert('Firebase is being configured. Check back soon.'); }

window._t5signInGoogle = signInWithGoogle;
window._t5signInTwitter = signInWithTwitter;
window._t5signOut = handleSignOut;

function getCurrentUser() { return currentUser; }
export { initAuthUI, getCurrentUser, currentUser };
