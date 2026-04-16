/* ═══════════════════════════════════════════════════════
   TENET5 MP Accountability Scorecard
   Per-MP grades based on MAID votes, lobbying contacts, and accountability record
   Generates shareable social-media-ready cards
   Research: GovTrack Report Cards — letter grades are 10x more shareable
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';
  if (window.__TENET5_SCORECARD_LOADED) return;
  window.__TENET5_SCORECARD_LOADED = true;

  var mpData = null;
  var voteData = null;
  var lobbyData = null;

  // ── Load data ──
  function loadAllData() {
    return Promise.all([
      fetch('data/all_mps.json').then(function(r) { return r.json(); }),
      fetch('data/maid_accountability_votes.json').then(function(r) { return r.json(); }),
      fetch('data/lobbying_analysis.json').then(function(r) { return r.json(); })
    ]).then(function(results) {
      mpData = results[0].mps || results[0];
      voteData = results[1];
      lobbyData = results[2];
    }).catch(function(err) {
      console.warn('[scorecard] data load failed:', err);
    });
  }

  // ── Score an MP ──
  function scoreMP(mp) {
    var name = mp.name;
    var score = { total: 50, factors: [], grade: 'C', color: '#888' };

    // Factor 1: MAID voting record
    var votedBoth = (voteData.voted_both_c14_c7 || []);
    var votedC14 = (voteData.voted_c14_only || []);
    var votedC7 = (voteData.voted_c7_only || []);

    if (votedBoth.indexOf(name) !== -1) {
      score.total -= 30;
      score.factors.push({ label: 'Voted YEA on both C-14 and C-7', impact: -30, detail: 'Legalized + expanded MAID (76,475+ deaths and counting)' });
    } else if (votedC7.indexOf(name) !== -1) {
      score.total -= 20;
      score.factors.push({ label: 'Voted YEA on C-7 expansion', impact: -20, detail: 'Expanded MAID to non-terminal illness' });
    } else if (votedC14.indexOf(name) !== -1) {
      score.total -= 10;
      score.factors.push({ label: 'Voted YEA on C-14', impact: -10, detail: 'Legalized MAID in 2016' });
    } else {
      score.total += 10;
      score.factors.push({ label: 'Did not vote to expand MAID', impact: +10, detail: 'No recorded YEA vote on C-14 or C-7' });
    }

    // Factor 2: Lobbying contacts (top lobbied = more influenced)
    var topLobbied = (lobbyData.top_lobbied_officials || []);
    var lobbyHits = topLobbied.filter(function(o) {
      return o.name === name || (o.title === 'Member of Parliament' && o.name === name);
    });
    if (lobbyHits.length > 0) {
      var meetings = lobbyHits[0].meetings || 0;
      if (meetings > 500) {
        score.total -= 15;
        score.factors.push({ label: meetings + ' lobbying meetings', impact: -15, detail: 'Heavily lobbied — ' + meetings + ' registered contacts' });
      } else if (meetings > 100) {
        score.total -= 5;
        score.factors.push({ label: meetings + ' lobbying meetings', impact: -5, detail: 'Above-average lobbying contact' });
      }
    }

    // Factor 3: Party accountability (current party record)
    var party = (mp.current_party && mp.current_party.short_name && mp.current_party.short_name.en) || '';
    if (party === 'Liberal') {
      score.total -= 10;
      score.factors.push({ label: 'Governing party — higher accountability standard', impact: -10, detail: 'Liberals hold power and bear primary responsibility for policy outcomes' });
    }

    // Clamp 0-100
    score.total = Math.max(0, Math.min(100, score.total));

    // Grade
    if (score.total >= 80) { score.grade = 'A'; score.color = '#22c55e'; }
    else if (score.total >= 65) { score.grade = 'B'; score.color = '#86efac'; }
    else if (score.total >= 50) { score.grade = 'C'; score.color = '#fbbf24'; }
    else if (score.total >= 35) { score.grade = 'D'; score.color = '#f97316'; }
    else { score.grade = 'F'; score.color = '#ef4444'; }

    return score;
  }

  // ── Render scorecard into a container ──
  function renderScorecard(mp, container) {
    var score = scoreMP(mp);
    var party = (mp.current_party && mp.current_party.short_name && mp.current_party.short_name.en) || 'Independent';
    var riding = (mp.current_riding && mp.current_riding.name && (mp.current_riding.name.en || mp.current_riding.name)) || '';
    var province = (mp.current_riding && mp.current_riding.province) || '';

    var partyColor = '#888';
    var pl = party.toLowerCase();
    if (pl.indexOf('liberal') !== -1) partyColor = '#d71920';
    else if (pl.indexOf('conservative') !== -1) partyColor = '#1a4782';
    else if (pl.indexOf('ndp') !== -1) partyColor = '#f37021';
    else if (pl.indexOf('bloc') !== -1) partyColor = '#33b2cc';
    else if (pl.indexOf('green') !== -1) partyColor = '#3d9b35';

    container.innerHTML =
      '<div class="sc-card">' +
        '<div class="sc-header">' +
          '<div class="sc-grade" style="background:' + score.color + ';color:#000">' + score.grade + '</div>' +
          '<div class="sc-name-block">' +
            '<div class="sc-name">' + esc(mp.name) + '</div>' +
            '<div class="sc-party" style="color:' + partyColor + '">' + esc(party) + '</div>' +
            '<div class="sc-riding">' + esc(riding) + (province ? ', ' + esc(province) : '') + '</div>' +
          '</div>' +
          '<div class="sc-score">' + score.total + '<span>/100</span></div>' +
        '</div>' +
        '<div class="sc-factors">' +
          score.factors.map(function(f) {
            return '<div class="sc-factor">' +
              '<span class="sc-impact" style="color:' + (f.impact < 0 ? '#ef4444' : '#22c55e') + '">' +
                (f.impact > 0 ? '+' : '') + f.impact +
              '</span>' +
              '<span class="sc-label">' + esc(f.label) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="sc-actions">' +
          '<button class="sc-btn" onclick="TENET5_SCORECARD.shareWhatsApp(\'' + esc(mp.name) + '\',' + score.total + ',\'' + score.grade + '\')">WhatsApp</button>' +
          '<button class="sc-btn" onclick="TENET5_SCORECARD.shareX(\'' + esc(mp.name) + '\',' + score.total + ',\'' + score.grade + '\')">Post on X</button>' +
          '<button class="sc-btn sc-btn-primary" onclick="TENET5_SCORECARD.shareCopy(\'' + esc(mp.name) + '\',' + score.total + ',\'' + score.grade + '\')">Copy</button>' +
        '</div>' +
        '<div class="sc-footer">TENET5 Accountability Scorecard — tenet5.github.io — Sources: Health Canada, Hansard, Commissioner of Lobbying</div>' +
      '</div>';
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
  }

  // ── Share functions ──
  var shareMsg = function(name, score, grade) {
    return 'My MP ' + name + ' scored ' + grade + ' (' + score + '/100) on the TENET5 Accountability Scorecard. Check your MP\'s record:';
  };
  var shareUrl = 'https://tenet5.github.io/search.html';

  window.TENET5_SCORECARD = {
    score: scoreMP,
    render: renderScorecard,
    getMP: function(name) {
      if (!mpData) return null;
      var lower = name.toLowerCase();
      return mpData.find(function(mp) { return mp.name.toLowerCase() === lower; }) || null;
    },
    getAllMPs: function() { return mpData || []; },
    shareWhatsApp: function(name, score, grade) {
      var msg = encodeURIComponent(shareMsg(name, score, grade) + '\n' + shareUrl + '?q=' + encodeURIComponent(name));
      window.open('https://wa.me/?text=' + msg, '_blank');
    },
    shareX: function(name, score, grade) {
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareMsg(name, score, grade)) + '&url=' + encodeURIComponent(shareUrl + '?q=' + encodeURIComponent(name)), '_blank');
    },
    shareCopy: function(name, score, grade) {
      var text = shareMsg(name, score, grade) + '\n' + shareUrl + '?q=' + encodeURIComponent(name);
      navigator.clipboard.writeText(text).catch(function() {});
    },
    isLoaded: function() { return !!(mpData && voteData); }
  };

  // ── Inject scorecard on search page ──
  function injectOnSearchPage() {
    var page = window.location.pathname.split('/').pop();
    if (page !== 'search.html') return;

    // Listen for search results that match an MP
    var observer = new MutationObserver(function(mutations) {
      var resultContainer = document.querySelector('.search-results, #search-results, .result-section');
      if (!resultContainer) return;

      // Look for MP name matches in results
      var mpCards = resultContainer.querySelectorAll('.result-card, .mp-card');
      mpCards.forEach(function(card) {
        if (card.dataset.scorecardDone) return;
        card.dataset.scorecardDone = '1';
        var nameEl = card.querySelector('.result-name, .mp-name, h3, strong');
        if (nameEl) {
          var mp = window.TENET5_SCORECARD.getMP(nameEl.textContent.trim());
          if (mp) {
            var sc = document.createElement('div');
            sc.className = 'sc-inline';
            renderScorecard(mp, sc);
            card.appendChild(sc);
          }
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent =
    '.sc-card{border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(14,18,28,0.95);padding:16px;font-family:Inter,system-ui,sans-serif;max-width:480px}' +
    '.sc-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}' +
    '.sc-grade{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;font-family:"IBM Plex Mono",monospace;flex-shrink:0}' +
    '.sc-name-block{flex:1;min-width:0}' +
    '.sc-name{font-size:16px;font-weight:700;color:#e8e4dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.sc-party{font-size:12px;font-weight:600;letter-spacing:0.03em}' +
    '.sc-riding{font-size:11px;color:#888}' +
    '.sc-score{font-size:28px;font-weight:800;color:#e8e4dc;font-family:"IBM Plex Mono",monospace;flex-shrink:0}' +
    '.sc-score span{font-size:14px;color:#666;font-weight:400}' +
    '.sc-factors{display:grid;gap:6px;margin-bottom:12px;padding:10px;border-radius:8px;background:rgba(255,255,255,0.03)}' +
    '.sc-factor{display:flex;gap:8px;font-size:12px;color:#b8b4aa;align-items:baseline}' +
    '.sc-impact{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:13px;min-width:36px;text-align:right}' +
    '.sc-label{flex:1}' +
    '.sc-actions{display:flex;gap:6px;margin-bottom:8px}' +
    '.sc-btn{flex:1;padding:7px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:rgba(255,255,255,0.04);color:#b8b4aa;font-size:12px;cursor:pointer;text-align:center}' +
    '.sc-btn:hover{background:rgba(255,255,255,0.1)}' +
    '.sc-btn-primary{background:rgba(196,30,58,0.12);border-color:rgba(196,30,58,0.3);color:#fca5a5}' +
    '.sc-footer{font-size:9px;color:#555;text-align:center;letter-spacing:0.02em}' +
    '.sc-inline{margin-top:8px}' +
    '@media(max-width:480px){.sc-card{padding:12px}.sc-grade{width:40px;height:40px;font-size:20px}.sc-score{font-size:22px}}';
  document.head.appendChild(style);

  // ── Init ──
  function init() {
    loadAllData().then(function() {
      injectOnSearchPage();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
