/**
 * TENET5 Reactions — Emoji reaction bars on investigation sections
 * Uses Supabase backend. Auto-injects on sections with id or data-narrate.
 * IIFE pattern — loaded by shell.js in iframe + direct modes.
 */
(function() {
  'use strict';
  if (window.__TENET5_REACTIONS_LOADED) return;
  window.__TENET5_REACTIONS_LOADED = true;

  var EMOJIS = [
    { key: 'thumbsup', icon: '\ud83d\udc4d' },
    { key: 'heart',    icon: '\u2764\ufe0f' },
    { key: 'fire',     icon: '\ud83d\udd25' },
    { key: 'angry',    icon: '\ud83d\ude21' },
    { key: 'skull',    icon: '\ud83d\udc80' }
  ];

  var _sb = null;
  var _pagePath = window.location.pathname.split('/').pop() || 'index.html';
  var _user = null;
  var _userReactions = {}; // { sectionId: { emoji: true } }
  var _counts = {};        // { sectionId: { emoji: count } }

  function getClient() {
    if (_sb) return _sb;
    if (!window.supabase || !window.supabase.createClient) return null;
    var url = window.SUPABASE_URL || '';
    var key = window.SUPABASE_ANON || '';
    if (!url || url.indexOf('YOUR_') !== -1) return null;
    _sb = window.supabase.createClient(url, key);
    return _sb;
  }

  function findReactableSections() {
    var sections = [];
    var els = document.querySelectorAll('[data-narrate][id], section[id], h2[id], .pattern-box[data-narrate], .evidence-box[data-narrate]');
    var seen = {};
    els.forEach(function(el) {
      var id = el.id;
      if (!id) {
        id = 's-' + Math.random().toString(36).substr(2, 8);
        el.id = id;
      }
      if (!seen[id]) {
        seen[id] = true;
        sections.push({ el: el, sectionId: id });
      }
    });
    return sections;
  }

  function renderBar(sectionEl, sectionId) {
    var bar = document.createElement('div');
    bar.className = 't5-reaction-bar';
    bar.setAttribute('data-section-id', sectionId);

    EMOJIS.forEach(function(emoji) {
      var btn = document.createElement('button');
      btn.className = 't5-reaction-btn';
      btn.setAttribute('data-emoji', emoji.key);
      btn.setAttribute('data-section', sectionId);
      btn.disabled = !_user;

      var count = (_counts[sectionId] && _counts[sectionId][emoji.key]) || 0;
      var isActive = _userReactions[sectionId] && _userReactions[sectionId][emoji.key];

      btn.innerHTML = emoji.icon + ' <span class="t5-reaction-count">' + (count > 0 ? count : '') + '</span>';
      if (isActive) btn.classList.add('active');

      btn.addEventListener('click', function() { toggleReaction(sectionId, emoji.key, btn); });
      bar.appendChild(btn);
    });

    // Insert after the section element
    if (sectionEl.nextSibling) {
      sectionEl.parentNode.insertBefore(bar, sectionEl.nextSibling);
    } else {
      sectionEl.parentNode.appendChild(bar);
    }
  }

  function toggleReaction(sectionId, emoji, btn) {
    if (!_user) return;
    var sb = getClient();
    if (!sb) return;

    var isActive = _userReactions[sectionId] && _userReactions[sectionId][emoji];

    if (isActive) {
      // Remove reaction
      sb.from('reactions').delete()
        .eq('page_path', _pagePath)
        .eq('section_id', sectionId)
        .eq('user_id', _user.id)
        .eq('emoji', emoji)
        .then(function() {});

      if (_userReactions[sectionId]) delete _userReactions[sectionId][emoji];
      if (_counts[sectionId] && _counts[sectionId][emoji]) _counts[sectionId][emoji]--;
      btn.classList.remove('active');
    } else {
      // Add reaction
      sb.from('reactions').insert({
        page_path: _pagePath,
        section_id: sectionId,
        user_id: _user.id,
        emoji: emoji
      }).then(function(res) {
        if (res.error) console.warn('Reaction insert error:', res.error.message);
      });

      if (!_userReactions[sectionId]) _userReactions[sectionId] = {};
      _userReactions[sectionId][emoji] = true;
      if (!_counts[sectionId]) _counts[sectionId] = {};
      _counts[sectionId][emoji] = (_counts[sectionId][emoji] || 0) + 1;
      btn.classList.add('active');
    }

    // Update count display
    var countEl = btn.querySelector('.t5-reaction-count');
    var c = (_counts[sectionId] && _counts[sectionId][emoji]) || 0;
    if (countEl) countEl.textContent = c > 0 ? c : '';
  }

  function fetchCounts() {
    var sb = getClient();
    if (!sb) return Promise.resolve();

    return sb.from('reactions').select('section_id, emoji').eq('page_path', _pagePath).then(function(res) {
      if (!res.data) return;
      res.data.forEach(function(r) {
        if (!_counts[r.section_id]) _counts[r.section_id] = {};
        _counts[r.section_id][r.emoji] = (_counts[r.section_id][r.emoji] || 0) + 1;
      });
    }).catch(function() {});
  }

  function fetchUserReactions() {
    if (!_user) return Promise.resolve();
    var sb = getClient();
    if (!sb) return Promise.resolve();

    return sb.from('reactions').select('section_id, emoji').eq('page_path', _pagePath).eq('user_id', _user.id).then(function(res) {
      if (!res.data) return;
      res.data.forEach(function(r) {
        if (!_userReactions[r.section_id]) _userReactions[r.section_id] = {};
        _userReactions[r.section_id][r.emoji] = true;
      });
    }).catch(function() {});
  }

  function updateAllButtons() {
    document.querySelectorAll('.t5-reaction-btn').forEach(function(btn) {
      btn.disabled = !_user;
      var sectionId = btn.getAttribute('data-section');
      var emoji = btn.getAttribute('data-emoji');
      var isActive = _userReactions[sectionId] && _userReactions[sectionId][emoji];
      var count = (_counts[sectionId] && _counts[sectionId][emoji]) || 0;
      btn.classList.toggle('active', !!isActive);
      var countEl = btn.querySelector('.t5-reaction-count');
      if (countEl) countEl.textContent = count > 0 ? count : '';
    });
  }

  function init() {
    // Skip utility pages
    if (_pagePath === 'home.html' || _pagePath === 'index.html' || _pagePath === 'auth-callback.html' || _pagePath === 'sitemap.html') return;

    var sb = getClient();

    // Check auth
    if (sb) {
      sb.auth.getSession().then(function(res) {
        if (res.data && res.data.session) _user = res.data.session.user;
      });
      sb.auth.onAuthStateChange(function(event, session) {
        _user = session ? session.user : null;
        fetchUserReactions().then(updateAllButtons);
      });
    }

    window.addEventListener('t5-auth-changed', function(e) {
      _user = e.detail ? e.detail.user : null;
      updateAllButtons();
    });

    // Fetch counts then render bars
    fetchCounts().then(function() {
      return _user ? fetchUserReactions() : Promise.resolve();
    }).then(function() {
      var sections = findReactableSections();
      // Stagger injection to avoid blocking paint
      sections.forEach(function(s, i) {
        setTimeout(function() { renderBar(s.el, s.sectionId); }, i * 30);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 300); });
  } else {
    setTimeout(init, 300);
  }
})();
