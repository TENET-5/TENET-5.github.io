/* ═══════════════════════════════════════════════════════
   LIRIL Voice + Chat Interface
   TENET5 — Powered by LIRIL AI | SEED 118400

   Features:
   - Floating chat button (bottom-right)
   - Text input with LIRIL response
   - Voice input via Web Speech API
   - Routes through local GPU inference or NATS
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var SEED = 118400;
  var LIRIL_API = 'http://127.0.0.1:18840';
  var GPU_API = 'http://127.0.0.1:8082';

  // ── Create floating chat button ──────────────────────
  document.addEventListener('DOMContentLoaded', function() {

    // Chat toggle button
    var btn = document.createElement('button');
    btn.id = 'liril-chat-btn';
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    btn.title = 'Talk to LIRIL';
    btn.setAttribute('aria-label', 'Open LIRIL chat');
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:52px;height:52px;' +
      'background:#b91c1c;color:white;border:none;border-radius:50%;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;z-index:9999;' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:all 0.2s ease;';
    document.body.appendChild(btn);

    // Chat panel
    var panel = document.createElement('div');
    panel.id = 'liril-chat-panel';
    panel.style.cssText = 'position:fixed;bottom:84px;right:24px;width:360px;max-height:480px;' +
      'background:#111827;border:1px solid rgba(185,28,28,0.2);border-radius:12px;' +
      'display:none;flex-direction:column;z-index:9999;overflow:hidden;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.5);font-family:Inter,sans-serif;';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'padding:12px 16px;background:#0c1220;border-bottom:1px solid rgba(255,255,255,0.06);' +
      'display:flex;align-items:center;gap:8px;';
    header.innerHTML = '<div style="width:8px;height:8px;background:#22c55e;border-radius:50%;"></div>' +
      '<span style="font-size:0.85rem;font-weight:600;color:#e8e4dc;">LIRIL</span>' +
      '<span style="font-size:0.65rem;color:#7a776e;margin-left:auto;">SEED ' + SEED + '</span>';
    panel.appendChild(header);

    // Messages area
    var messages = document.createElement('div');
    messages.id = 'liril-messages';
    messages.style.cssText = 'flex:1;overflow-y:auto;padding:12px 16px;min-height:200px;max-height:340px;';
    messages.innerHTML = '<div style="font-size:0.82rem;color:#7a776e;text-align:center;padding:2rem 0;">' +
      'Ask LIRIL about any investigation on this site.</div>';
    panel.appendChild(messages);

    // Input area
    var inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'padding:8px 12px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask LIRIL...';
    input.style.cssText = 'flex:1;background:#0c1220;border:1px solid rgba(255,255,255,0.1);border-radius:8px;' +
      'padding:8px 12px;color:#e8e4dc;font-size:0.85rem;outline:none;font-family:inherit;';

    var micBtn = document.createElement('button');
    micBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>';
    micBtn.title = 'Voice input';
    micBtn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.1);border-radius:8px;' +
      'color:#7a776e;padding:6px 8px;cursor:pointer;display:flex;align-items:center;';

    var sendBtn = document.createElement('button');
    sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    sendBtn.style.cssText = 'background:#b91c1c;border:none;border-radius:8px;' +
      'color:white;padding:6px 10px;cursor:pointer;display:flex;align-items:center;';

    inputWrap.appendChild(input);
    inputWrap.appendChild(micBtn);
    inputWrap.appendChild(sendBtn);
    panel.appendChild(inputWrap);
    document.body.appendChild(panel);

    // ── Toggle ──────────────────────────────────────
    var isOpen = false;
    btn.addEventListener('click', function() {
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'flex' : 'none';
      if (isOpen) input.focus();
    });

    // ── Send message ────────────────────────────────
    function addMessage(text, isUser) {
      var msg = document.createElement('div');
      msg.style.cssText = 'margin:8px 0;padding:8px 12px;border-radius:8px;font-size:0.82rem;line-height:1.5;' +
        (isUser
          ? 'background:rgba(185,28,28,0.1);color:#e8e4dc;text-align:right;margin-left:40px;'
          : 'background:rgba(255,255,255,0.03);color:#b8b4aa;margin-right:40px;border-left:2px solid #b91c1c;');
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    function sendMessage() {
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMessage(text, true);

      // Try local LIRIL API first
      var payload = JSON.stringify({ prompt: text, max_tokens: 256 });
      fetch(GPU_API + '/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: '[INST] You are LIRIL, the AI assistant for TENET5 — a Canadian government accountability project. ' +
            'Answer questions about MAID deaths, foreign interference, CFNIS misconduct, and the 504 prosecution. ' +
            'Be concise and cite sources. SEED=' + SEED + '. Question: ' + text + ' [/INST]',
          n_predict: 256,
          temperature: 0.3,
        }),
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        addMessage(data.content || data.response || 'No response from GPU.', false);
      })
      .catch(function() {
        // Fallback: provide static context-aware responses
        var lower = text.toLowerCase();
        var response = 'I cannot reach the GPU inference server right now. ';
        if (lower.includes('maid') || lower.includes('death')) {
          response += '76,475 Canadians have been killed by MAID (2016-2024). 109 MPs voted for both C-14 and C-7. See maid-voting-record.html for the full list.';
        } else if (lower.includes('504') || lower.includes('covey') || lower.includes('bae')) {
          response += '28 counts filed against Captain Rebecca Covey (CFNIS) and Vicky Jahye Bae (Crown prosecutor). See s504-covey-bae.html.';
        } else if (lower.includes('cfnis') || lower.includes('military police')) {
          response += 'CFNIS has 5 documented cases of misconduct. Ontario Superior Court: evidence tampering shocks the conscience. See cfnis.html.';
        } else if (lower.includes('foreign') || lower.includes('interference') || lower.includes('hogue')) {
          response += 'Hogue Commission (Jan 2025): PRC is the most active perpetrator of foreign interference in Canada. 51 recommendations. See foreign-interference.html.';
        } else {
          response += 'Try asking about MAID, the 504 prosecution, CFNIS, or foreign interference. All data from official government records.';
        }
        addMessage(response, false);
      });
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendMessage();
    });

    // ── Voice input via Web Speech API ──────────────
    var recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-CA';

      recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        input.value = transcript;
        micBtn.style.color = '#7a776e';
        sendMessage();
      };

      recognition.onerror = function() {
        micBtn.style.color = '#7a776e';
      };

      micBtn.addEventListener('click', function() {
        micBtn.style.color = '#dc2626';
        recognition.start();
      });
    } else {
      micBtn.style.display = 'none';
    }
  });
})();
