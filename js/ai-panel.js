/**
 * AI Research Panel — TENET5
 *
 * Slide-out panel that lets users interact with Google Gemini AI
 * to analyze page content, find connections, and do research.
 * Uses visitor's own Google AI access (zero API key from us).
 */

(function() {
  'use strict';

  var panelOpen = false;
  var chatHistory = [];
  var pageContext = '';

  // ── System prompt for the AI ──
  var SYSTEM_PROMPT = [
    'You are an investigative research assistant for a Canadian government accountability database.',
    'The database tracks lobbying contacts, political donations, parliamentary votes, procurement contracts, and corporate connections.',
    'Help users analyze patterns, find connections between entities, and understand the significance of public records.',
    'Always cite that data comes from public government records.',
    'Be factual and measured. Correlation does not imply causation.',
    'If the user provides page context, analyze it and highlight notable patterns.'
  ].join(' ');

  // ── Quick prompts ──
  var QUICK_PROMPTS = [
    { label: 'Summarize this page', prompt: 'Summarize the key findings on this page. What are the most significant data points?' },
    { label: 'Find connections', prompt: 'Based on the data on this page, what connections or patterns stand out? Are there any entities that appear across multiple datasets?' },
    { label: 'Explain the data', prompt: 'Explain what this data means for a general audience. Why should Canadians care about these findings?' },
    { label: 'Who benefits?', prompt: 'Based on the lobbying, donation, and voting data visible on this page, who appears to benefit most from the current arrangements?' }
  ];

  // ── Create the AI panel DOM ──
  function createPanel() {
    if (document.getElementById('ai-panel')) return;

    var panel = document.createElement('div');
    panel.id = 'ai-panel';
    panel.className = 'ai-panel';
    panel.innerHTML =
      '<div class="ai-panel-header">' +
        '<span class="ai-panel-title">AI Research Assistant</span>' +
        '<button class="ai-panel-close" onclick="window._t5toggleAI()" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="ai-panel-info">' +
        '<p>Powered by <strong style="color:var(--accent);">TENET5 OpenNatwork</strong> (Offline Inference). Ask questions about the data on this page securely.</p>' +
      '</div>' +
      '<div class="ai-panel-quick">' +
        QUICK_PROMPTS.map(function(qp) {
          return '<button class="ai-quick-btn" onclick="window._t5aiQuick(\'' + qp.prompt.replace(/'/g, "\\'") + '\')">' + qp.label + '</button>';
        }).join('') +
      '</div>' +
      '<div class="ai-panel-messages" id="ai-messages"></div>' +
      '<div class="ai-panel-input-bar">' +
        '<input type="text" id="ai-input" class="ai-input" placeholder="Ask about this data..." maxlength="1000" autocomplete="off">' +
        '<button id="ai-send" class="ai-send-btn" onclick="window._t5aiSend()">Ask</button>' +
      '</div>';

    document.body.appendChild(panel);

    // Wire enter key
    document.getElementById('ai-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window._t5aiSend();
      }
    });

    // Create toggle button
    var toggle = document.createElement('button');
    toggle.id = 'ai-toggle';
    toggle.className = 'ai-toggle-btn';
    toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> AI Research';
    toggle.setAttribute('onclick', 'window._t5toggleAI()');
    document.body.appendChild(toggle);
  }

  // ── Toggle panel ──
  window._t5toggleAI = function() {
    var panel = document.getElementById('ai-panel');
    if (!panel) return;
    panelOpen = !panelOpen;
    panel.classList.toggle('ai-panel-open', panelOpen);
    if (panelOpen) {
      capturePageContext();
      document.getElementById('ai-input').focus();
    }
  };

  // ── Capture current page context ──
  function capturePageContext() {
    // Grab visible text content from main content area
    var main = document.querySelector('.dash-wrap, .container, main, [role="main"], #main');
    if (main) {
      var text = main.textContent || '';
      // Truncate to ~2000 chars for prompt
      pageContext = text.replace(/\s+/g, ' ').trim().substring(0, 2000);
    }
  }

  // ── Send message ──
  window._t5aiSend = function() {
    var input = document.getElementById('ai-input');
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    processMessage(text);
  };

  window._t5aiQuick = function(prompt) {
    processMessage(prompt);
  };

  function processMessage(userText) {
    // Add user message to chat
    chatHistory.push({ role: 'user', text: userText });
    renderAIMessages();

    // Build prompt with context
    var fullPrompt = SYSTEM_PROMPT + '\n\n';
    if (pageContext) {
      fullPrompt += 'PAGE CONTEXT (current page data the user is looking at):\n' + pageContext + '\n\n';
    }
    fullPrompt += 'USER QUESTION: ' + userText;

    // Add thinking indicator
    chatHistory.push({ role: 'assistant', text: '...', thinking: true });
    renderAIMessages();

    // Call Gemini API
    callGemini(fullPrompt).then(function(response) {
      // Remove thinking indicator and add real response
      chatHistory = chatHistory.filter(function(m) { return !m.thinking; });
      chatHistory.push({ role: 'assistant', text: response });
      renderAIMessages();
    }).catch(function(err) {
      chatHistory = chatHistory.filter(function(m) { return !m.thinking; });
      chatHistory.push({ role: 'assistant', text: 'AI is not available right now. To use this feature, sign in with your Google account. Error: ' + err.message });
      renderAIMessages();
    });
  }

  // ── Call OpenNatwork (Local TENET5 AI) ──
  async function callGemini(prompt) {
    try {
      const response = await fetch('http://127.0.0.1:9222/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer tenet5-native'
        },
        body: JSON.stringify({
          model: 'opennatwork-local',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      });
      
      if (!response.ok) {
        throw new Error('Local inference is currently OFFLINE on port 9222.');
      }
      
      const data = await response.json();
      return data.choices && data.choices[0] && data.choices[0].message.content 
        ? data.choices[0].message.content 
        : 'Received empty response from the local inference node.';
    } catch (e) {
      throw new Error('TENET5 Local AI mesh could not be reached. Ensure OpenNatwork is running on the host. (' + e.message + ')');
    }
  }

  // ── Render messages ──
  function renderAIMessages() {
    var container = document.getElementById('ai-messages');
    if (!container) return;

    var html = '';
    chatHistory.forEach(function(msg) {
      var cls = msg.role === 'user' ? 'ai-msg-user' : 'ai-msg-assistant';
      if (msg.thinking) cls += ' ai-msg-thinking';
      html += '<div class="ai-msg ' + cls + '">';
      html += '<div class="ai-msg-role">' + (msg.role === 'user' ? 'You' : 'AI') + '</div>';
      html += '<div class="ai-msg-text">' + formatResponse(msg.text) + '</div>';
      html += '</div>';
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  function formatResponse(text) {
    // Basic markdown-like formatting
    return escHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── Inject CSS ──
  function injectStyles() {
    if (document.getElementById('ai-panel-styles')) return;
    var style = document.createElement('style');
    style.id = 'ai-panel-styles';
    style.textContent = [
      '.ai-panel { position:fixed; top:0; right:-420px; width:400px; height:100vh; background:var(--bg-surface,#13131a); border-left:1px solid var(--border,#2a2a35); z-index:10000; display:flex; flex-direction:column; transition:right 0.3s ease; box-shadow:-4px 0 20px rgba(0,0,0,0.3); }',
      '.ai-panel-open { right:0; }',
      '.ai-panel-header { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-bottom:1px solid var(--border,#2a2a35); background:rgba(196,30,58,0.08); }',
      '.ai-panel-title { font-family:"Playfair Display",serif; font-size:1rem; font-weight:700; color:var(--text-primary,#e8e8ec); }',
      '.ai-panel-close { background:none; border:none; color:var(--text-tertiary,#6e6e76); font-size:1.4rem; cursor:pointer; padding:4px 8px; }',
      '.ai-panel-close:hover { color:#fff; }',
      '.ai-panel-info { padding:10px 16px; font-size:0.7rem; color:var(--text-tertiary,#6e6e76); border-bottom:1px solid var(--border,#2a2a35); line-height:1.5; }',
      '.ai-panel-quick { display:flex; flex-wrap:wrap; gap:6px; padding:10px 16px; border-bottom:1px solid var(--border,#2a2a35); }',
      '.ai-quick-btn { background:var(--bg-card,#1a1a24); border:1px solid var(--border,#2a2a35); border-radius:16px; padding:5px 12px; font-size:0.68rem; color:var(--text-tertiary,#6e6e76); cursor:pointer; font-family:inherit; transition:all 0.2s; }',
      '.ai-quick-btn:hover { border-color:rgba(196,30,58,0.4); color:var(--accent,#c41e3a); }',
      '.ai-panel-messages { flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:10px; }',
      '.ai-msg { padding:10px 12px; border-radius:8px; font-size:0.78rem; line-height:1.6; }',
      '.ai-msg-user { background:rgba(196,30,58,0.1); border:1px solid rgba(196,30,58,0.2); align-self:flex-end; max-width:85%; }',
      '.ai-msg-assistant { background:var(--bg-card,#1a1a24); border:1px solid var(--border,#2a2a35); max-width:90%; }',
      '.ai-msg-thinking { opacity:0.5; animation:pulse 1.5s infinite; }',
      '@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:0.2} }',
      '.ai-msg-role { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-tertiary,#6e6e76); margin-bottom:4px; }',
      '.ai-msg-text { color:var(--text-primary,#e8e8ec); }',
      '.ai-msg-text strong { color:var(--accent,#c41e3a); }',
      '.ai-panel-input-bar { display:flex; gap:8px; padding:12px 16px; border-top:1px solid var(--border,#2a2a35); }',
      '.ai-input { flex:1; background:var(--bg-card,#1a1a24); border:1px solid var(--border,#2a2a35); border-radius:6px; padding:8px 12px; color:var(--text-primary,#e8e8ec); font-size:0.8rem; font-family:inherit; outline:none; }',
      '.ai-input:focus { border-color:rgba(196,30,58,0.5); }',
      '.ai-send-btn { background:var(--accent,#c41e3a); color:#fff; border:none; border-radius:6px; padding:8px 16px; font-size:0.78rem; font-weight:600; cursor:pointer; font-family:inherit; }',
      '.ai-send-btn:hover { background:#d42a45; }',
      '.ai-toggle-btn { position:fixed; bottom:80px; right:20px; background:var(--accent,#c41e3a); color:#fff; border:none; border-radius:24px; padding:10px 18px; font-size:0.78rem; font-weight:600; cursor:pointer; z-index:9999; box-shadow:0 4px 16px rgba(196,30,58,0.3); display:flex; align-items:center; gap:6px; font-family:inherit; transition:transform 0.2s; }',
      '.ai-toggle-btn:hover { transform:scale(1.05); }',
      '@media(max-width:500px) { .ai-panel { width:100%; right:-100%; } .ai-panel-open { right:0; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Auto-initialize on pages with data ──
  function init() {
    injectStyles();
    createPanel();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
