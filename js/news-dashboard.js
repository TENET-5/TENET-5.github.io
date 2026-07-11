/* news-dashboard.js — High-density AI-generated news intelligence feed */
(function() {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.innerHTML = text;
    return e;
  }

  function initNewsDashboard() {
    var feedEl = document.getElementById('news-feed-container');
    var tickerEl = document.getElementById('news-ticker-text');
    var threatLevelEl = document.getElementById('threat-level-badge');
    
    if (!feedEl) return;

    fetch('data/govt_daily_briefing.json')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (tickerEl && data.one_line) {
          tickerEl.textContent = 'LATEST INTELLIGENCE: ' + data.one_line.toUpperCase();
        }
        if (threatLevelEl && data.threat_level) {
          threatLevelEl.textContent = 'THREAT LEVEL: ' + data.threat_level;
          threatLevelEl.className = 'threat-badge ' + data.threat_level.toLowerCase();
        }

        if (data.happening_now && data.happening_now.length > 0) {
          data.happening_now.forEach(function(item) {
            var card = el('article', 'news-card');
            
            var meta = el('div', 'news-meta');
            meta.appendChild(el('span', 'news-domain', item.domain || 'OSINT'));
            meta.appendChild(el('span', 'news-status ' + (item.severity ? item.severity.toLowerCase() : ''), item.status || 'REPORT'));
            
            var header = el('header', 'news-header');
            header.appendChild(el('h2', 'news-headline', item.headline));
            
            var body = el('p', 'news-body', item.body);
            
            card.appendChild(meta);
            card.appendChild(header);
            card.appendChild(body);
            
            if (item.sources && item.sources.length > 0) {
              var sources = el('div', 'news-sources');
              sources.appendChild(el('strong', '', 'SOURCES: '));
              item.sources.forEach(function(src) {
                var a = el('a', 'news-source-link', src.label);
                a.href = src.url;
                sources.appendChild(a);
              });
              card.appendChild(sources);
            }
            
            feedEl.appendChild(card);
          });
          
          // Wire up the LIRIL reporter persona
          var readBtn = document.getElementById('liril-read-news-btn');
          if (readBtn && window.LIRIL_VOICE) {
            readBtn.addEventListener('click', function() {
              var script = "This is the TENET-5 OSINT Desk. Here is your live intelligence update. " + data.one_line + ". ";
              data.happening_now.forEach(function(item) {
                script += "From the " + item.domain + " desk. " + item.headline + ". " + item.body + ". ";
              });
              script += "This concludes the live report.";
              
              readBtn.textContent = "Reporting...";
              window.LIRIL_VOICE.speak(script, {
                onend: function() {
                  readBtn.textContent = "Listen to Live Report";
                },
                onerror: function() {
                  readBtn.textContent = "Listen to Live Report";
                }
              });
            });
          }
        } else {
          feedEl.appendChild(el('div', 'empty-msg', 'No live intelligence at this hour. Swarm is scanning.'));
        }
      })
      .catch(function(e) {
        console.error('Failed to load daily briefing:', e);
        feedEl.appendChild(el('div', 'empty-msg', 'Failed to connect to local OSINT data vault.'));
      });
  }

  document.addEventListener('DOMContentLoaded', initNewsDashboard);
})();
