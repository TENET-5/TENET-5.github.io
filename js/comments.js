/**
 * TENET5 Comments — User comments on investigation pages
 * Uses Supabase backend. Auto-injects at bottom of content.
 * IIFE pattern — loaded by shell.js in iframe + direct modes.
 */
(function() {
  'use strict';
  if (window.__TENET5_COMMENTS_LOADED) return;
  window.__TENET5_COMMENTS_LOADED = true;

  var _sb = null;
  var _pagePath = window.location.pathname.split('/').pop() || 'index.html';
  var _container = null;
  var _user = null;

  function getClient() {
    if (_sb) return _sb;
    if (!window.supabase || !window.supabase.createClient) return null;
    var url = window.SUPABASE_URL || '';
    var key = window.SUPABASE_ANON || '';
    if (!url || url.indexOf('YOUR_') !== -1) return null;
    _sb = window.supabase.createClient(url, key);
    return _sb;
  }

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function timeAgo(dateStr) {
    var now = Date.now();
    var then = new Date(dateStr).getTime();
    var diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    return new Date(dateStr).toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderComment(c) {
    var avatar = c.user_avatar ? '<img class="t5-comment-avatar" src="' + escapeHtml(c.user_avatar) + '" alt="" />' : '<div class="t5-comment-avatar" style="background:#333;display:flex;align-items:center;justify-content:center;font-size:0.8rem;color:#999;">?</div>';
    return '<div class="t5-comment" data-comment-id="' + c.id + '">' +
      avatar +
      '<div class="t5-comment-content">' +
        '<div class="t5-comment-meta"><strong>' + escapeHtml(c.user_name || 'Anonymous') + '</strong> &middot; ' + timeAgo(c.created_at) + '</div>' +
        '<div class="t5-comment-body">' + escapeHtml(c.body) + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderCommentList(comments) {
    var list = _container.querySelector('#t5-comment-list');
    if (!list) return;
    if (!comments || comments.length === 0) {
      list.innerHTML = '<p style="color:#6b7280;font-size:0.82rem;font-style:italic;">No comments yet. Be the first to share your thoughts.</p>';
      return;
    }
    list.innerHTML = comments.map(renderComment).join('');
  }

  function updateFormState() {
    var textarea = _container.querySelector('#t5-comment-text');
    var submit = _container.querySelector('#t5-comment-submit');
    var hint = _container.querySelector('#t5-comment-hint');
    if (_user) {
      if (textarea) { textarea.disabled = false; textarea.placeholder = 'Share your thoughts on this investigation...'; }
      if (submit) submit.disabled = false;
      if (hint) hint.textContent = 'Commenting as ' + (_user.user_metadata && _user.user_metadata.full_name ? _user.user_metadata.full_name : _user.email || 'user');
    } else {
      if (textarea) { textarea.disabled = true; textarea.placeholder = 'Sign in to comment'; }
      if (submit) submit.disabled = true;
      if (hint) hint.textContent = 'Sign in with Google to leave a comment';
    }
  }

  function submitComment() {
    var textarea = _container.querySelector('#t5-comment-text');
    if (!textarea || !_user) return;
    var body = textarea.value.trim();
    if (!body || body.length > 2000) return;

    var sb = getClient();
    if (!sb) return;

    var comment = {
      page_path: _pagePath,
      user_id: _user.id,
      user_name: (_user.user_metadata && (_user.user_metadata.full_name || _user.user_metadata.name)) || _user.email || 'Anonymous',
      user_avatar: _user.user_metadata && (_user.user_metadata.avatar_url || _user.user_metadata.picture) || null,
      body: body
    };

    // Optimistic append
    var list = _container.querySelector('#t5-comment-list');
    var noComments = list.querySelector('p[style]');
    if (noComments) noComments.remove();
    var tempComment = Object.assign({ id: 'temp-' + Date.now(), created_at: new Date().toISOString() }, comment);
    list.insertAdjacentHTML('beforeend', renderComment(tempComment));
    textarea.value = '';

    sb.from('comments').insert(comment).then(function(res) {
      if (res.error) console.warn('Comment insert error:', res.error.message);
    });
  }

  function fetchComments() {
    var sb = getClient();
    if (!sb) {
      renderCommentList([]);
      return;
    }
    sb.from('comments').select('*').eq('page_path', _pagePath).order('created_at', { ascending: true }).then(function(res) {
      renderCommentList(res.data || []);
    }).catch(function() {
      renderCommentList([]);
    });
  }

  function init() {
    // Don't add comments to home page or utility pages
    if (_pagePath === 'home.html' || _pagePath === 'index.html' || _pagePath === 'auth-callback.html' || _pagePath === 'sitemap.html') return;

    // Find content container
    var content = document.querySelector('#main[role="main"]') || document.querySelector('.content') || document.querySelector('main');
    if (!content) return;

    // Create comments section
    _container = document.createElement('section');
    _container.id = 't5-comments';
    _container.className = 't5-comments-section';
    _container.innerHTML =
      '<h3>Comments</h3>' +
      '<div id="t5-comment-list"></div>' +
      '<div class="t5-comment-form">' +
        '<textarea id="t5-comment-text" maxlength="2000" disabled placeholder="Sign in to comment"></textarea>' +
        '<button class="t5-comment-submit" id="t5-comment-submit" disabled>Post Comment</button>' +
        '<div class="t5-comment-login-hint" id="t5-comment-hint">Sign in with Google to leave a comment</div>' +
      '</div>';

    // Insert before the footer CTA or at end of content
    var cta = content.parentElement.querySelector('[style*="rgba(220,38,38,0.08)"]');
    if (cta) {
      cta.parentElement.insertBefore(_container, cta);
    } else {
      content.parentElement.insertBefore(_container, content.nextSibling);
    }

    // Submit handler
    var submit = _container.querySelector('#t5-comment-submit');
    if (submit) submit.addEventListener('click', submitComment);

    var textarea = _container.querySelector('#t5-comment-text');
    if (textarea) {
      textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment();
      });
    }

    // Check auth
    var sb = getClient();
    if (sb) {
      sb.auth.getSession().then(function(res) {
        if (res.data && res.data.session) {
          _user = res.data.session.user;
          updateFormState();
        }
      });
      sb.auth.onAuthStateChange(function(event, session) {
        _user = session ? session.user : null;
        updateFormState();
      });
    }

    // Also listen for parent frame auth events
    window.addEventListener('t5-auth-changed', function(e) {
      _user = e.detail ? e.detail.user : null;
      updateFormState();
    });

    // Fetch existing comments
    fetchComments();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 200); });
  } else {
    setTimeout(init, 200);
  }
})();
