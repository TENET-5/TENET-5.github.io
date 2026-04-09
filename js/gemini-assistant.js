/**
 * TENET5 Gemini AI Research Assistant
 * 
 * BYOK (Bring Your Own Key) Gemini integration for
 * AI-assisted OSINT research on the website.
 * 
 * Users provide their own Google AI API key (stored in
 * localStorage, never transmitted to TENET5 servers).
 * 
 * LIRIL/SATOR: TRI gate — multi-domain analysis routing
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'tenet5_gemini_key';
  const HISTORY_KEY = 'tenet5_gemini_history';
  const MODEL = 'gemini-2.5-flash';
  const MAX_HISTORY = 50;

  let apiKey = null;
  let conversationHistory = [];
  let panelEl = null;
  let isOpen = false;

  // ── Key Management ───────────────────────────────────────────
  function getStoredKey() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setKey(key) {
    apiKey = key;
    try { localStorage.setItem(STORAGE_KEY, key); } catch (e) { /* silent */ }
  }

  function clearKey() {
    apiKey = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* silent */ }
  }

  function hasKey() {
    return !!(apiKey || getStoredKey());
  }

  // ── Gemini API Call ──────────────────────────────────────────
  async function generateContent(prompt, context) {
    const key = apiKey || getStoredKey();
    if (!key) throw new Error('No API key. Set your Gemini key in settings.');

    // Build system instruction
    const systemInstruction = [
      'You are a research assistant for TENET5, a Canadian OSINT investigation platform.',
      'You help users analyze government data, lobbying records, procurement contracts, and parliamentary records.',
      'Always cite sources when possible. Be factual and evidence-based.',
      'You are analyzing content from tenet-5.github.io.',
      context ? 'Current page context: ' + context : ''
    ].filter(Boolean).join(' ');

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        topP: 0.95
      }
    };

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + key;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(function () { return {}; });
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Check your Gemini API key in settings.');
      }
      throw new Error(err.error?.message || 'Gemini API error: ' + response.status);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    // Save to history
    _addToHistory({ role: 'user', text: prompt, timestamp: Date.now() });
    _addToHistory({ role: 'assistant', text: text, timestamp: Date.now() });

    return text;
  }

  // ── Pre-built Research Prompts ───────────────────────────────
  const RESEARCH_PROMPTS = [
    {
      label: '📊 Analyze this page',
      prompt: 'Analyze the evidence presented on this page. Identify key claims, assess their strength, and note any gaps in the data.',
      needsContext: true
    },
    {
      label: '🔎 Lobbying analysis',
      prompt: 'Based on the TENET5 lobbying data showing 2,156 CIJA contacts to 993 officials, explain the significance of this level of lobbying activity and compare it to typical lobbying volumes in Canadian politics.',
      needsContext: false
    },
    {
      label: '📈 MAID statistics',
      prompt: 'The MAID program has resulted in 76,475 deaths since 2016, with 45 per day in 2024 (1 in 20 Canadian deaths). Analyze these statistics in context: What do international comparisons show? What are the policy implications?',
      needsContext: false
    },
    {
      label: '🏛️ Procurement analysis',
      prompt: 'Explain how government procurement anomalies (sole-source contracts, vendor concentration) can indicate corruption. What should investigators look for in Canadian municipal procurement data?',
      needsContext: false
    },
    {
      label: '🗳️ Municipal governance',
      prompt: 'What are the key transparency requirements for Ontario municipalities under the Municipal Act? What mechanisms exist for public accountability of municipal councils?',
      needsContext: false
    }
  ];

  // ── History Management ───────────────────────────────────────
  function _addToHistory(entry) {
    conversationHistory.push(entry);
    if (conversationHistory.length > MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory));
    } catch (e) { /* silent */ }
  }

  function _loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) conversationHistory = JSON.parse(raw);
    } catch (e) {
      conversationHistory = [];
    }
  }

  function clearHistory() {
    conversationHistory = [];
    try { localStorage.removeItem(HISTORY_KEY); } catch (e) { /* silent */ }
  }

  // ── Simple Markdown Rendering ────────────────────────────────
  function renderMarkdown(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  // ── Build Assistant Panel ────────────────────────────────────
  function buildPanel() {
    if (panelEl) return;

    panelEl = document.createElement('div');
    panelEl.className = 'gemini-panel';
    panelEl.id = 'gemini-panel';
    panelEl.innerHTML = `
      <div class="gemini-panel-header">
        <div class="gemini-panel-title">
          <span style="font-size:1.2rem;">✨</span>
          <span>AI Research Assistant</span>
        </div>
        <div class="gemini-panel-actions">
          <button class="gemini-btn-icon" id="gemini-settings-btn" title="API Key Settings">⚙️</button>
          <button class="gemini-btn-icon" id="gemini-clear-btn" title="Clear History">🗑️</button>
          <button class="gemini-btn-icon" id="gemini-close-btn" title="Close">&times;</button>
        </div>
      </div>

      <div class="gemini-panel-body" id="gemini-body">
        <div class="gemini-welcome" id="gemini-welcome">
          <h3>TENET5 AI Research</h3>
          <p>Use Google's Gemini AI to analyze evidence, cross-reference data, and conduct research.</p>
          <div class="gemini-key-setup" id="gemini-key-setup">
            <label>Enter your Gemini API key:</label>
            <div style="display:flex;gap:6px;margin-top:4px;">
              <input type="password" class="gemini-key-input" id="gemini-key-input"
                     placeholder="AIza..." autocomplete="off" />
              <button class="gemini-btn-sm" id="gemini-key-save">Save</button>
            </div>
            <p class="gemini-key-note">Get a free key at <a href="https://aistudio.google.com/" target="_blank" rel="noopener" style="color:var(--accent-bright)">aistudio.google.com</a>. Stored locally only.</p>
          </div>
          <div class="gemini-prompts" id="gemini-prompts">
            <p style="font-size:0.75rem;color:var(--text-quaternary);margin-bottom:8px;">Quick research prompts:</p>
            ${RESEARCH_PROMPTS.map(function (p, i) {
              return '<button class="gemini-prompt-btn" data-idx="' + i + '">' + p.label + '</button>';
            }).join('')}
          </div>
        </div>
        <div class="gemini-messages" id="gemini-messages"></div>
      </div>

      <div class="gemini-panel-input">
        <textarea class="gemini-input" id="gemini-input"
                  placeholder="Ask about the evidence, data, or investigations..."
                  rows="2"></textarea>
        <button class="gemini-send-btn" id="gemini-send-btn" title="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>

      <div class="gemini-settings-panel" id="gemini-settings-panel">
        <h4>Settings</h4>
        <label>Gemini API Key</label>
        <input type="password" id="gemini-settings-key" class="gemini-key-input" placeholder="AIza..." />
        <button class="gemini-btn-sm" id="gemini-settings-save" style="margin-top:4px;">Save Key</button>
        <button class="gemini-btn-sm" id="gemini-settings-clear" style="background:var(--color-critical);margin-top:4px;">Remove Key</button>
        <p class="gemini-key-note">Your key is stored in localStorage only. Never sent to TENET5.</p>
      </div>
    `;

    document.body.appendChild(panelEl);

    // ── Build floating trigger button ────────────────────────
    const trigger = document.createElement('button');
    trigger.className = 'gemini-trigger';
    trigger.id = 'gemini-trigger';
    trigger.title = 'AI Research Assistant';
    trigger.innerHTML = '✨';
    document.body.appendChild(trigger);

    // ── Event Binding ────────────────────────────────────────
    trigger.addEventListener('click', togglePanel);
    panelEl.querySelector('#gemini-close-btn').addEventListener('click', closePanel);

    // Key setup
    panelEl.querySelector('#gemini-key-save').addEventListener('click', function () {
      const val = panelEl.querySelector('#gemini-key-input').value.trim();
      if (val) {
        setKey(val);
        panelEl.querySelector('#gemini-key-setup').style.display = 'none';
        panelEl.querySelector('#gemini-prompts').style.display = 'block';
      }
    });

    // Quick prompts
    panelEl.querySelectorAll('.gemini-prompt-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.dataset.idx);
        const prompt = RESEARCH_PROMPTS[idx];
        const context = prompt.needsContext ? _getPageContext() : '';
        _handleSend(prompt.prompt, context);
      });
    });

    // Send
    panelEl.querySelector('#gemini-send-btn').addEventListener('click', function () {
      const input = panelEl.querySelector('#gemini-input');
      if (input.value.trim()) {
        _handleSend(input.value.trim(), _getPageContext());
        input.value = '';
      }
    });

    // Enter key
    panelEl.querySelector('#gemini-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        panelEl.querySelector('#gemini-send-btn').click();
      }
    });

    // Settings
    panelEl.querySelector('#gemini-settings-btn').addEventListener('click', function () {
      const sp = panelEl.querySelector('#gemini-settings-panel');
      sp.classList.toggle('visible');
      if (sp.classList.contains('visible')) {
        panelEl.querySelector('#gemini-settings-key').value = getStoredKey() || '';
      }
    });

    panelEl.querySelector('#gemini-settings-save').addEventListener('click', function () {
      const val = panelEl.querySelector('#gemini-settings-key').value.trim();
      if (val) setKey(val);
      panelEl.querySelector('#gemini-settings-panel').classList.remove('visible');
    });

    panelEl.querySelector('#gemini-settings-clear').addEventListener('click', function () {
      clearKey();
      panelEl.querySelector('#gemini-settings-key').value = '';
      panelEl.querySelector('#gemini-settings-panel').classList.remove('visible');
    });

    // Clear history
    panelEl.querySelector('#gemini-clear-btn').addEventListener('click', function () {
      clearHistory();
      panelEl.querySelector('#gemini-messages').innerHTML = '';
      panelEl.querySelector('#gemini-welcome').style.display = 'block';
    });

    // Update key setup visibility
    if (hasKey()) {
      panelEl.querySelector('#gemini-key-setup').style.display = 'none';
    }
  }

  // ── Send Handler ─────────────────────────────────────────────
  async function _handleSend(prompt, context) {
    const messagesEl = panelEl.querySelector('#gemini-messages');
    panelEl.querySelector('#gemini-welcome').style.display = 'none';

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'gemini-msg gemini-msg-user';
    userMsg.textContent = prompt;
    messagesEl.appendChild(userMsg);

    // Add loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'gemini-msg gemini-msg-ai gemini-loading';
    loadingMsg.innerHTML = '<span class="gemini-dots"><span>.</span><span>.</span><span>.</span></span> Analyzing...';
    messagesEl.appendChild(loadingMsg);

    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const response = await generateContent(prompt, context);
      loadingMsg.remove();

      const aiMsg = document.createElement('div');
      aiMsg.className = 'gemini-msg gemini-msg-ai';
      aiMsg.innerHTML = renderMarkdown(response);
      messagesEl.appendChild(aiMsg);
    } catch (err) {
      loadingMsg.remove();
      const errMsg = document.createElement('div');
      errMsg.className = 'gemini-msg gemini-msg-error';
      errMsg.textContent = '⚠️ ' + err.message;
      messagesEl.appendChild(errMsg);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Page Context ─────────────────────────────────────────────
  function _getPageContext() {
    const title = document.title || '';
    const h1 = document.querySelector('h1')?.textContent || '';
    const meta = document.querySelector('meta[name="description"]')?.content || '';
    return [title, h1, meta].filter(Boolean).join(' | ');
  }

  // ── Panel Toggle ─────────────────────────────────────────────
  function togglePanel() {
    buildPanel();
    isOpen = !isOpen;
    panelEl.classList.toggle('open', isOpen);
    document.getElementById('gemini-trigger').classList.toggle('active', isOpen);
  }

  function closePanel() {
    isOpen = false;
    if (panelEl) panelEl.classList.remove('open');
    document.getElementById('gemini-trigger')?.classList.remove('active');
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    apiKey = getStoredKey();
    _loadHistory();

    // Build the trigger button immediately
    buildPanel();
  }

  window.tenet5Gemini = {
    generateContent: generateContent,
    setKey: setKey,
    clearKey: clearKey,
    hasKey: hasKey,
    togglePanel: togglePanel,
    clearHistory: clearHistory,
    RESEARCH_PROMPTS: RESEARCH_PROMPTS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }
})();
