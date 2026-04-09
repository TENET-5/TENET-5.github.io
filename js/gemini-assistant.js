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

  const STORAGE_KEY = 'tenet5_gemini_token';
  const HISTORY_KEY = 'tenet5_gemini_history';
  const MODEL = 'gemini-2.5-flash';
  const MAX_HISTORY = 50;
  
  // ── 0-Auth Client Provisioning ───────────────────────────────
  const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
  let tokenClient;

  let oAuthToken = null;
  let conversationHistory = [];
  let panelEl = null;
  let isOpen = false;

  // ── Dynamic Script Injection ──────────────────────────────────
  function loadGSI() {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/generative-language.retriever',
        callback: (response) => {
          if (response.error !== undefined) {
            console.error('OAuth Error:', response.error);
            return;
          }
          setToken(response.access_token);
          // Hide login UI, show prompts
          if (panelEl) {
            panelEl.querySelector('#gemini-key-setup').style.display = 'none';
            panelEl.querySelector('#gemini-prompts').style.display = 'block';
          }
        },
      });
    };
    document.head.appendChild(script);
  }

  // ── Key Management ───────────────────────────────────────────
  function getStoredToken() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setToken(token) {
    oAuthToken = token;
    try { localStorage.setItem(STORAGE_KEY, token); } catch (e) { /* silent */ }
  }

  function clearToken() {
    oAuthToken = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* silent */ }
  }

  function hasToken() {
    return !!(oAuthToken || getStoredToken());
  }

  function triggerOAuthLogin() {
    if (!tokenClient) {
      alert("Google Identity Services failed to load.");
      return;
    }
    // Requests a fresh access token from Google
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  async function generateContent(prompt, context) {
    const systemInstruction = [
      'You are a research assistant for TENET5, a Canadian OSINT investigation platform.',
      'You help users analyze government data, lobbying records, procurement contracts, and parliamentary records.',
      'Always cite sources when possible. Be factual and evidence-based.',
      'You are analyzing content from tenet-5.github.io.',
      context ? 'Current page context: ' + context : ''
    ].filter(Boolean).join(' ');

    const token = oAuthToken || getStoredToken();
    
    // Check if cloud token is missing, attempt to use FREE built-in browser AI
    if (!token) {
        if ('ai' in window && 'languageModel' in window.ai) {
            try {
                const capabilities = await window.ai.languageModel.capabilities();
                if (capabilities.available !== 'no') {
                    const session = await window.ai.languageModel.create({
                        systemPrompt: systemInstruction
                    });
                    const text = await session.prompt(prompt);
                    _addToHistory({ role: 'user', text: prompt, timestamp: Date.now() });
                    _addToHistory({ role: 'assistant', text: text + '\n\n*(Generated locally via Chrome Built-in AI)*', timestamp: Date.now() });
                    return text;
                }
            } catch (err) {
                console.warn("Local AI failed:", err);
            }
        }
        throw new Error('No Local AI found. Please Sign In with Google or use Chrome 127+ with AI enabled.');
    }

    try {
      const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");
      
      // Monkey-patch fetch to force Authorization: Bearer if the SDK overrides it
      const customFetch = (url, options) => {
          options = options || {};
          options.headers = options.headers || new Headers();
          // Remove the ?key= query string if the SDK appends it blindly
          if (typeof url === 'string') {
              url = url.split('?key=')[0];
          }
          if (options.headers instanceof Headers) {
              options.headers.set('Authorization', `Bearer ${token}`);
          } else {
              options.headers['Authorization'] = `Bearer ${token}`;
          }
          return fetch(url, options);
      };

      // Pass token as dummy key so SDK doesn't complain
      const genAI = new GoogleGenerativeAI(token);
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topP: 0.95
        }
      }, { apiClient: "tenet5-assistant", customFetch: customFetch });

      const result = await model.generateContent(prompt);
      const text = result.response.text() || 'No response generated.';

      // Save to history
      _addToHistory({ role: 'user', text: prompt, timestamp: Date.now() });
      _addToHistory({ role: 'assistant', text: text, timestamp: Date.now() });

      return text;
    } catch (err) {
      if (err.message && err.message.includes('API key not valid')) {
        throw new Error('Invalid API key. Check your Gemini API key in settings.');
      }
      throw err;
    }
  }

  // ── Gemini Embeddings Call ───────────────────────────────────
  async function generateEmbeddings(text) {
    const token = oAuthToken || getStoredToken();
    if (!token) throw new Error('Not authenticated. Please sign in with Google.');
    
    try {
      const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");
      
      const customFetch = (url, options) => {
          options = options || {};
          options.headers = options.headers || new Headers();
          if (typeof url === 'string') url = url.split('?key=')[0];
          if (options.headers instanceof Headers) {
              options.headers.set('Authorization', `Bearer ${token}`);
          } else {
              options.headers['Authorization'] = `Bearer ${token}`;
          }
          return fetch(url, options);
      };

      const genAI = new GoogleGenerativeAI(token);
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" }, { customFetch: customFetch });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      throw err;
    }
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
          <div class="gemini-key-setup" id="gemini-key-setup" style="text-align: center; margin: 15px 0;">
            <div id="local-ai-status" style="margin-bottom: 12px; padding: 8px; background: var(--bg-surface); border-radius: 4px; border: 1px solid var(--border); font-size: 0.85em; display: none;">
                <span style="color:var(--color-green)">✅ Local built-in Browser AI active.</span><br/>Zero setup required. Just chat!
            </div>
            <p style="font-size: 0.9em; margin-bottom: 10px;">Or sign in to Cloud AI for advanced models & telemetry:</p>
            <button class="gemini-btn-sm" id="gemini-oauth-btn" style="width: 100%; padding: 10px; background: white; color: black; border: 1px solid #ccc; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
              Sign in with Google
            </button>
            <p class="gemini-key-note" style="margin-top: 8px;">Zero-Auth Token Gateway (Delegation scopes required)</p>
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
        <h4>Authentication</h4>
        <button class="gemini-btn-sm" id="gemini-settings-clear" style="background:var(--color-critical);margin-top:4px;">Sign Out</button>
        <p class="gemini-key-note">Removes the OAuth token from local storage.</p>
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

    // Key setup (replaced by OAuth logic)
    panelEl.querySelector('#gemini-oauth-btn').addEventListener('click', function () {
      triggerOAuthLogin();
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
    });

    panelEl.querySelector('#gemini-settings-clear').addEventListener('click', function () {
      clearToken();
      panelEl.querySelector('#gemini-settings-panel').classList.remove('visible');
      panelEl.querySelector('#gemini-key-setup').style.display = 'block';
      panelEl.querySelector('#gemini-prompts').style.display = 'none';
    });

    // Clear history
    panelEl.querySelector('#gemini-clear-btn').addEventListener('click', function () {
      clearHistory();
      panelEl.querySelector('#gemini-messages').innerHTML = '';
      panelEl.querySelector('#gemini-welcome').style.display = 'block';
    });

    // Update key setup visibility
    if (hasToken()) {
      panelEl.querySelector('#gemini-key-setup').style.display = 'none';
      panelEl.querySelector('#gemini-prompts').style.display = 'block';
    } else {
      panelEl.querySelector('#gemini-prompts').style.display = 'none';
      
      // Auto-detect Local browser AI
      if ('ai' in window && 'languageModel' in window.ai) {
          window.ai.languageModel.capabilities().then(cap => {
              if (cap.available !== 'no') {
                  const localMsg = panelEl.querySelector('#local-ai-status');
                  if (localMsg) localMsg.style.display = 'block';
                  // Force show prompts because local AI works!
                  panelEl.querySelector('#gemini-prompts').style.display = 'block';
              }
          }).catch(console.error);
      }
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
    loadGSI(); // Inject zero-auth SDK
    oAuthToken = getStoredToken();
    _loadHistory();

    // Build the trigger button immediately
    buildPanel();
  }

  window.tenet5Gemini = {
    generateContent: generateContent,
    generateEmbeddings: generateEmbeddings,
    setToken: setToken,
    clearToken: clearToken,
    hasToken: hasToken,
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
