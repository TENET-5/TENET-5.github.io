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
            
            // Check for Swarm-generated documentary
            if (item.documentary_video) {
              var docContainer = el('div', 'news-doc-container');
              docContainer.style.position = 'relative';
              docContainer.style.marginTop = 'var(--space-4)';
              
              var vid = el('video', '');
              vid.src = item.documentary_video;
              vid.controls = true;
              vid.style.width = '100%';
              vid.style.border = '1px solid var(--bd-dim)';
              
              var overlay = el('div', 'cinema-text-overlay');
              overlay.style.position = 'absolute';
              overlay.style.bottom = '10%';
              overlay.style.left = '5%';
              overlay.style.right = '5%';
              overlay.style.pointerEvents = 'none';
              
              docContainer.appendChild(vid);
              docContainer.appendChild(overlay);
              card.appendChild(docContainer);
              
              if (item.documentary_manifest) {
                // Fetch the manifest and hook up the sync engine locally to this video
                (function(v, ov, manifestUrl) {
                  fetch(manifestUrl)
                    .then(function(res) { return res.json(); })
                    .then(function(manifest) {
                      var activeBeatId = null;
                      v.addEventListener('timeupdate', function() {
                        var t = v.currentTime;
                        var currentBeat = null;
                        for (var i = 0; i < manifest.length; i++) {
                          if (t >= manifest[i].start_time && t < manifest[i].end_time) {
                            currentBeat = manifest[i]; break;
                          }
                        }
                        if (currentBeat) {
                          if (currentBeat.beat_id !== activeBeatId) {
                            activeBeatId = currentBeat.beat_id;
                            ov.innerHTML = '<span class="kinetic-text" style="font-size:clamp(1rem, 2vw, 1.5rem);">' + currentBeat.narration + '</span>';
                          }
                        } else {
                          if (activeBeatId !== null) { ov.innerHTML = ''; activeBeatId = null; }
                        }
                      });
                    })
                    .catch(function(e) { console.warn('Missing documentary manifest:', manifestUrl); });
                })(vid, overlay, item.documentary_manifest);
              }
            }
            
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
