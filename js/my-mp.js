/* ═══════════════════════════════════════════════════════
   TENET5 "My MP" Postal Code Lookup Widget
   Enter your postal code → see your MP's record → one-tap share
   Uses OpenParliament.ca Represent API for postal code → riding lookup
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';
  if (window.__TENET5_MYMP_LOADED) return;
  window.__TENET5_MYMP_LOADED = true;

  var API_BASE = 'https://represent.opennorth.ca';
  var MP_DATA = null;  // loaded from data/all_mps.json
  var cachedPostal = null;
  var cachedMP = null;

  // ── Load MP data ──
  function loadMPData() {
    return fetch('data/all_mps.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { MP_DATA = d.mps || d; })
      .catch(function() { MP_DATA = []; });
  }

  // ── Postal code → Riding via Represent API ──
  function lookupPostalCode(postal) {
    postal = postal.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(postal)) {
      return Promise.reject('Enter a valid Canadian postal code (e.g., K1A 0A6)');
    }
    return fetch(API_BASE + '/postcodes/' + postal + '/?format=json')
      .then(function(r) {
        if (!r.ok) throw new Error('Postal code not found');
        return r.json();
      })
      .then(function(data) {
        // Find the federal representative
        var reps = data.representatives_centroid || data.representatives || [];
        var federal = reps.filter(function(r) {
          return r.elected_office === 'MP' || r.representative_set_name === 'House of Commons';
        });
        if (federal.length > 0) return federal[0];
        // Fallback: match by riding name against our data
        var boundaries = data.boundaries_centroid || data.boundaries || [];
        var fedBoundary = boundaries.filter(function(b) {
          return b.boundary_set_name === 'Federal electoral district';
        });
        if (fedBoundary.length > 0) {
          var ridingName = fedBoundary[0].name;
          return matchMPByRiding(ridingName);
        }
        throw new Error('No federal MP found for this postal code');
      });
  }

  // ── Match MP by riding name from local data ──
  function matchMPByRiding(ridingName) {
    if (!MP_DATA || !MP_DATA.length) return null;
    var lower = ridingName.toLowerCase();
    for (var i = 0; i < MP_DATA.length; i++) {
      var mp = MP_DATA[i];
      var riding = (mp.current_riding && mp.current_riding.name &&
                    (mp.current_riding.name.en || mp.current_riding.name)) || '';
      if (riding.toLowerCase() === lower) {
        return {
          name: mp.name,
          party_name: (mp.current_party && mp.current_party.short_name &&
                       mp.current_party.short_name.en) || 'Unknown',
          district_name: riding,
          province: (mp.current_riding && mp.current_riding.province) || '',
          photo_url: mp.image || '',
          url: mp.url || ''
        };
      }
    }
    return null;
  }

  // ── Render MP card ──
  function renderMP(mp, container) {
    var party = mp.party_name || mp.elected_office || '';
    var name = mp.name || '';
    var riding = mp.district_name || '';
    var province = mp.province || '';
    var photo = mp.photo_url || '';

    var partyColor = '#888';
    var pl = party.toLowerCase();
    if (pl.indexOf('liberal') !== -1) partyColor = '#d71920';
    else if (pl.indexOf('conservative') !== -1) partyColor = '#1a4782';
    else if (pl.indexOf('ndp') !== -1 || pl.indexOf('new democrat') !== -1) partyColor = '#f37021';
    else if (pl.indexOf('bloc') !== -1) partyColor = '#33b2cc';
    else if (pl.indexOf('green') !== -1) partyColor = '#3d9b35';

    container.innerHTML =
      '<div class="mymp-card">' +
        (photo ? '<img class="mymp-photo" src="' + escHtml(photo) + '" alt="' + escHtml(name) + '" onerror="this.style.display=\'none\'">' : '') +
        '<div class="mymp-info">' +
          '<div class="mymp-name">' + escHtml(name) + '</div>' +
          '<div class="mymp-party" style="color:' + partyColor + '">' + escHtml(party) + '</div>' +
          '<div class="mymp-riding">' + escHtml(riding) + (province ? ', ' + escHtml(province) : '') + '</div>' +
        '</div>' +
        '<div class="mymp-actions">' +
          '<button class="mymp-action" data-share="whatsapp" title="Share on WhatsApp">WhatsApp</button>' +
          '<button class="mymp-action" data-share="x" title="Share on X">Post</button>' +
          '<button class="mymp-action mymp-action-primary" onclick="window.location.href=\'search.html?q=' + encodeURIComponent(name) + '\'">Full Record</button>' +
        '</div>' +
      '</div>';

    // Wire share buttons with MP-specific message
    container.querySelectorAll('[data-share]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var action = btn.dataset.share;
        var msg = 'My MP ' + name + ' (' + party + ', ' + riding + ') — check their full record on TENET5';
        var url = 'https://tenet5.github.io/search.html?q=' + encodeURIComponent(name);
        if (action === 'whatsapp') {
          window.open('https://wa.me/?text=' + encodeURIComponent(msg + '\n' + url), '_blank');
        } else if (action === 'x') {
          window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(msg) + '&url=' + encodeURIComponent(url), '_blank');
        }
      });
    });

    // Cache for this session
    try {
      sessionStorage.setItem('t5-mymp', JSON.stringify(mp));
      sessionStorage.setItem('t5-postal', cachedPostal);
    } catch (e) {}
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Inject the widget ──
  function injectWidget() {
    // Only inject on investigation pages (not special pages)
    var skip = ['index.html', 'auth-callback.html', 'sitemap.html', 'chalkboard.html'];
    var page = window.location.pathname.split('/').pop() || 'index.html';
    if (skip.indexOf(page) !== -1) return;

    // Don't duplicate
    if (document.querySelector('.mymp-widget')) return;

    var widget = document.createElement('div');
    widget.className = 'mymp-widget';
    widget.innerHTML =
      '<div class="mymp-header">' +
        '<span class="mymp-title">My MP</span>' +
        '<button class="mymp-toggle" aria-label="Toggle My MP widget" id="mymp-toggle-btn">&#9660;</button>' +
      '</div>' +
      '<div class="mymp-body" id="mymp-body">' +
        '<div class="mymp-input-row">' +
          '<input type="text" class="mymp-input" id="mymp-postal" placeholder="Postal code (e.g. K1A 0A6)" maxlength="7" autocomplete="postal-code">' +
          '<button class="mymp-go" id="mymp-go">Find</button>' +
        '</div>' +
        '<div class="mymp-result" id="mymp-result"></div>' +
      '</div>';

    document.body.appendChild(widget);

    // Toggle
    var body = document.getElementById('mymp-body');
    var toggle = document.getElementById('mymp-toggle-btn');
    var collapsed = false;
    toggle.addEventListener('click', function() {
      collapsed = !collapsed;
      body.style.display = collapsed ? 'none' : 'block';
      toggle.textContent = collapsed ? '\u25B6' : '\u25BC';
    });

    // Search handler
    var input = document.getElementById('mymp-postal');
    var goBtn = document.getElementById('mymp-go');
    var result = document.getElementById('mymp-result');

    function doLookup() {
      var postal = input.value.trim();
      if (!postal) return;
      cachedPostal = postal;
      result.innerHTML = '<div class="mymp-loading">Looking up...</div>';
      lookupPostalCode(postal).then(function(mp) {
        if (mp) {
          cachedMP = mp;
          renderMP(mp, result);
        } else {
          result.innerHTML = '<div class="mymp-error">No MP found for this postal code.</div>';
        }
      }).catch(function(err) {
        result.innerHTML = '<div class="mymp-error">' + escHtml(String(err)) + '</div>';
      });
    }

    goBtn.addEventListener('click', doLookup);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doLookup();
    });

    // Auto-format postal code (A1A 1A1)
    input.addEventListener('input', function() {
      var v = input.value.replace(/\s/g, '').toUpperCase();
      if (v.length > 3) v = v.substring(0, 3) + ' ' + v.substring(3);
      input.value = v.substring(0, 7);
    });

    // Restore cached MP from session
    try {
      var saved = sessionStorage.getItem('t5-mymp');
      var savedPostal = sessionStorage.getItem('t5-postal');
      if (saved && savedPostal) {
        cachedMP = JSON.parse(saved);
        cachedPostal = savedPostal;
        input.value = savedPostal;
        renderMP(cachedMP, result);
      }
    } catch (e) {}
  }

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent =
    '.mymp-widget{position:fixed;left:12px;bottom:80px;width:280px;background:rgba(10,15,22,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:12px;z-index:8000;font-family:Inter,system-ui,sans-serif;backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}' +
    '.mymp-header{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer}' +
    '.mymp-title{font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8fbc8f;font-weight:600}' +
    '.mymp-toggle{background:none;border:none;color:#888;font-size:10px;cursor:pointer;padding:2px 4px}' +
    '.mymp-body{padding:10px 12px}' +
    '.mymp-input-row{display:flex;gap:6px}' +
    '.mymp-input{flex:1;padding:7px 10px;border:1px solid rgba(255,255,255,0.12);border-radius:6px;background:rgba(255,255,255,0.05);color:#e8e4dc;font-size:13px;font-family:IBM Plex Mono,monospace;outline:none}' +
    '.mymp-input:focus{border-color:rgba(196,30,58,0.4)}' +
    '.mymp-input::placeholder{color:#666}' +
    '.mymp-go{padding:7px 14px;border:1px solid rgba(196,30,58,0.3);border-radius:6px;background:rgba(196,30,58,0.12);color:#fca5a5;font-size:12px;cursor:pointer;font-weight:600}' +
    '.mymp-go:hover{background:rgba(196,30,58,0.25)}' +
    '.mymp-result{margin-top:10px}' +
    '.mymp-card{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '.mymp-photo{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.1)}' +
    '.mymp-info{flex:1;min-width:120px}' +
    '.mymp-name{font-size:14px;font-weight:600;color:#e8e4dc}' +
    '.mymp-party{font-size:11px;font-weight:600;letter-spacing:0.05em}' +
    '.mymp-riding{font-size:11px;color:#888;margin-top:1px}' +
    '.mymp-actions{display:flex;gap:4px;width:100%;margin-top:6px}' +
    '.mymp-action{flex:1;padding:5px 8px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:rgba(255,255,255,0.04);color:#b8b4aa;font-size:11px;cursor:pointer;text-align:center}' +
    '.mymp-action:hover{background:rgba(255,255,255,0.1)}' +
    '.mymp-action-primary{background:rgba(196,30,58,0.12);border-color:rgba(196,30,58,0.3);color:#fca5a5}' +
    '.mymp-loading{color:#888;font-size:12px;font-style:italic}' +
    '.mymp-error{color:#e87474;font-size:12px}' +
    '@media(max-width:768px){.mymp-widget{left:8px;bottom:60px;width:260px;font-size:12px}}' +
    '@media(max-width:480px){.mymp-widget{left:4px;right:4px;width:auto;bottom:56px}}';
  document.head.appendChild(style);

  // ── Init ──
  function init() {
    loadMPData().then(injectWidget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
