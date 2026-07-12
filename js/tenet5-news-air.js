/* TENET5 news air — play live desk segments (not canned atmosphere loops).
 * Lead player + per-segment Play buttons. Presentation can call TENET5_NEWS_AIR.playId.
 */
(function () {
  'use strict';
  if (window.TENET5_NEWS_AIR && window.TENET5_NEWS_AIR.__v >= 1) return;

  function $(id) { return document.getElementById(id); }

  function lead() {
    return $('news-air-video');
  }

  function setNow(tag, title, lede) {
    var t = $('news-air-now-tag');
    var h = $('news-air-now-title');
    var p = $('news-air-now-lede');
    if (t && tag) t.textContent = tag;
    if (h && title) h.textContent = title;
    if (p && lede != null) p.textContent = lede;
  }

  function playSrc(src, meta) {
    var v = lead();
    if (!v || !src) return;
    var s = v.querySelector('source') || document.createElement('source');
    s.src = src;
    s.type = 'video/mp4';
    if (!s.parentNode) v.appendChild(s);
    v.load();
    v.muted = false;
    try {
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        v.muted = true;
        v.play().catch(function () {});
      });
    } catch (e) { /* */ }
    if (meta) {
      setNow(meta.tag || 'NOW', meta.title || '', meta.lede || '');
    }
    try {
      v.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e2) { /* */ }
  }

  function playId(id) {
    var card = document.querySelector('[data-news-seg="' + id + '"]');
    if (!card) return;
    var src = card.getAttribute('data-video') || '';
    var titleEl = card.querySelector('h3');
    var ledeEl = card.querySelector('p');
    var tagEl = card.querySelector('.news-seg-tag');
    playSrc(src, {
      tag: tagEl ? tagEl.textContent : 'NOW',
      title: titleEl ? titleEl.textContent : '',
      lede: ledeEl ? ledeEl.textContent : ''
    });
    document.querySelectorAll('.news-seg.is-on').forEach(function (el) {
      el.classList.remove('is-on');
    });
    card.classList.add('is-on');
  }

  function playAll() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-news-seg]'));
    if (!cards.length) return;
    var i = 0;
    function next() {
      if (i >= cards.length) return;
      var c = cards[i++];
      playId(c.getAttribute('data-news-seg'));
      var v = lead();
      if (!v) return;
      var onEnd = function () {
        v.removeEventListener('ended', onEnd);
        next();
      };
      v.addEventListener('ended', onEnd);
    }
    next();
  }

  function bind() {
    var leadBtn = $('news-air-play-lead');
    if (leadBtn) {
      leadBtn.addEventListener('click', function () {
        var first = document.querySelector('[data-news-seg]');
        if (first) playId(first.getAttribute('data-news-seg'));
        else {
          var v = lead();
          if (v) v.play().catch(function () {});
        }
      });
    }
    var allBtn = $('news-air-play-all');
    if (allBtn) allBtn.addEventListener('click', playAll);

    document.querySelectorAll('.news-seg-play').forEach(function (btn) {
      btn.addEventListener('click', function () {
        playId(btn.getAttribute('data-play'));
      });
    });

    document.querySelectorAll('[data-news-seg]').forEach(function (card) {
      card.addEventListener('click', function (ev) {
        if (ev.target.closest('a,button')) return;
        playId(card.getAttribute('data-news-seg'));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  window.TENET5_NEWS_AIR = {
    __v: 1,
    playId: playId,
    playAll: playAll,
    playSrc: playSrc
  };
})();
