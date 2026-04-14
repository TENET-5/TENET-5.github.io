/**
 * TENET5 Auth Nav — Google Sign-In UI in Navigation
 * Supabase OAuth2 integration for the nav bar
 * IIFE pattern — loaded by shell.js after nav.js
 */
(function() {
  'use strict';
  if (window.__TENET5_AUTH_NAV_LOADED) return;
  window.__TENET5_AUTH_NAV_LOADED = true;

  var _user = null;
  var _listeners = [];
  var _sb = null;

  // ── Public API ──────────────────────────────────────────────────────────
  window.TENET5_AUTH = {
    getCurrentUser: function() { return _user; },
    isSignedIn: function() { return !!_user; },
    onAuthChange: function(cb) { _listeners.push(cb); if (_user) cb(_user); }
  };

  function notify(user) {
    _user = user;
    _listeners.forEach(function(cb) { try { cb(user); } catch(e) { console.warn('auth-nav listener error', e); } });
    window.dispatchEvent(new CustomEvent('t5-auth-changed', { detail: { user: user } }));
  }

  // ── Supabase Client ─────────────────────────────────────────────────────
  function getClient() {
    if (_sb) return _sb;
    if (!window.supabase || !window.supabase.createClient) return null;
    var url = window.SUPABASE_URL || '';
    var key = window.SUPABASE_ANON || '';
    if (!url || url.indexOf('YOUR_') !== -1) return null;
    _sb = window.supabase.createClient(url, key);
    return _sb;
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function renderSignedOut(container) {
    container.innerHTML =
      '<button class="nav-auth-btn" id="nav-auth-google" title="Sign in with Google">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:4px;">' +
          '<path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>' +
          '<path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
          '<path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
          '<path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
        '</svg>' +
        'Sign In' +
      '</button>';
    var btn = document.getElementById('nav-auth-google');
    if (btn) {
      btn.addEventListener('click', function() {
        var sb = getClient();
        if (!sb) { alert('Authentication not configured yet. Check back soon.'); return; }
        // Store current page for return after auth
        try { sessionStorage.setItem('t5-auth-return', window.location.href); } catch(e) {}
        sb.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin + '/auth-callback.html' }
        });
      });
    }
  }

  function renderSignedIn(container, user) {
    var name = '';
    var avatar = '';
    if (user.user_metadata) {
      name = user.user_metadata.full_name || user.user_metadata.name || user.email || '';
      avatar = user.user_metadata.avatar_url || user.user_metadata.picture || '';
    }
    var firstName = name.split(' ')[0] || 'User';

    container.innerHTML =
      (avatar ? '<img class="nav-auth-avatar" src="' + avatar + '" alt="" />' : '') +
      '<span class="nav-auth-name">' + firstName + '</span>' +
      '<button class="nav-auth-signout" id="nav-auth-signout" title="Sign Out">Sign Out</button>';

    var btn = document.getElementById('nav-auth-signout');
    if (btn) {
      btn.addEventListener('click', function() {
        var sb = getClient();
        if (sb) sb.auth.signOut();
        notify(null);
        renderSignedOut(container);
      });
    }
  }

  function renderDisabled(container) {
    container.innerHTML =
      '<span class="nav-auth-btn" style="opacity:0.4;cursor:default;" title="Coming soon">Sign In</span>';
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    var container = document.getElementById('nav-auth');
    if (!container) return;

    // Check if Supabase is ready
    var config = window.TENET5_CONFIG || {};
    if (!config.supabaseReady && !config.authEnabled) {
      renderDisabled(container);
      return;
    }

    var sb = getClient();
    if (!sb) {
      renderDisabled(container);
      return;
    }

    // Check existing session
    sb.auth.getSession().then(function(res) {
      if (res.data && res.data.session && res.data.session.user) {
        notify(res.data.session.user);
        renderSignedIn(container, res.data.session.user);
      } else {
        renderSignedOut(container);
      }
    }).catch(function() {
      renderSignedOut(container);
    });

    // Listen for auth changes
    sb.auth.onAuthStateChange(function(event, session) {
      if (session && session.user) {
        notify(session.user);
        renderSignedIn(container, session.user);
      } else {
        notify(null);
        renderSignedOut(container);
      }
    });
  }

  // Wait for DOM + nav to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();
