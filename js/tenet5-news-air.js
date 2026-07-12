/* TENET5 live desk air — broadcast hits (LIVE bug + lower-third + rundown).
 * Not memorial cinema. playId drives stage + HUD.
 */
(function () {
  'use strict';
  if (window.TENET5_NEWS_AIR && window.TENET5_NEWS_AIR.__v >= 4) return;

  function $(id) { return document.getElementById(id); }

  function lead() {
    return $('news-air-video');
  }

  function setNow(meta) {
    var t = $('news-air-now-tag');
    var h = $('news-air-now-title');
    var p = $('news-air-now-lede');
    var desk = (meta && meta.desk) || 'DESK';
    if (t) t.textContent = 'TENET5 · ' + desk;
    if (h && meta && meta.title) h.textContent = meta.title;
    if (p && meta && meta.lede != null) p.textContent = meta.lede;
    var hudSeg = document.querySelector('.bh-seg');
    if (hudSeg && meta && meta.seg) hudSeg.textContent = meta.seg;
  }

  function tickClock() {
    var el = $('news-air-clock');
    if (!el) return;
    try {
      el.textContent = new Date().toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' ET';
    } catch (e) {
      el.textContent = new Date().toLocaleTimeString() + ' ET';
    }
  }

  function playSrc(src, meta) {
    var v = lead();
    if (!v || !src) return;
    var s = v.querySelector('source') || document.createElement('source');
    s.src = src;
    s.type = 'video/mp4';
    if (!s.parentNode) v.appendChild(s);
    var oldTracks = v.querySelectorAll('track');
    for (var ti = 0; ti < oldTracks.length; ti++) oldTracks[ti].remove();
    if (meta && meta.vtt) {
      var tr = document.createElement('track');
      tr.kind = 'captions';
      tr.srclang = 'en-CA';
      tr.label = 'LIRIL';
      tr.src = meta.vtt;
      tr.default = true;
      v.appendChild(tr);
    }
    v.load();
    v.muted = false;
    try {
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        v.muted = true;
        v.play().catch(function () {});
      });
    } catch (e) { /* */ }
    setNow(meta || {});
    try {
      v.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e2) { /* */ }
  }

  function metaFromCard(card) {
    if (!card) return {};
    var tag = card.querySelector('.news-seg-tag');
    return {
      desk: card.getAttribute('data-desk') || 'DESK',
      title: card.getAttribute('data-title') || (card.querySelector('h3') || {}).textContent || '',
      lede: card.getAttribute('data-lede') || '',
      vtt: card.getAttribute('data-vtt') || '',
      seg: tag ? tag.textContent : ''
    };
  }

  function playId(id) {
    var card = document.querySelector('[data-news-seg="' + id + '"]');
    if (!card) return;
    var src = card.getAttribute('data-video') || '';
    playSrc(src, metaFromCard(card));
    document.querySelectorAll('.news-seg.is-on').forEach(function (el) {
      el.classList.remove('is-on');
    });
    card.classList.add('is-on');
    document.querySelectorAll('.broadcast-rundown li').forEach(function (li) {
      li.classList.toggle('is-on', li.getAttribute('data-run') === id);
    });
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
    tickClock();
    setInterval(tickClock, 1000);

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

    document.querySelectorAll('[data-news-seg]').forEach(function (card) {
      card.addEventListener('click', function () {
        playId(card.getAttribute('data-news-seg'));
      });
    });

    document.querySelectorAll('.broadcast-rundown li').forEach(function (li) {
      li.addEventListener('click', function () {
        var id = li.getAttribute('data-run');
        if (id) playId(id);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  window.TENET5_NEWS_AIR = {
    __v: 4,
    playId: playId,
    playAll: playAll,
    playSrc: playSrc
  };
})();
