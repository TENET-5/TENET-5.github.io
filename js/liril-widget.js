/**
 * LIRIL Subkernel Communication Widget
 * Injects a floating hacker-style terminal referencing the local LIRIL Vibe API
 */

(function() {
    // 1. Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #liril-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: 'Courier New', Courier, monospace;
        }
        #liril-toggle-btn {
            background-color: #0c0c0c;
            color: #00ff00;
            border: 1px solid #00ff00;
            padding: 10px 15px;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,255,0,0.2);
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        #liril-toggle-btn:hover {
            background-color: #00ff00;
            color: #000;
        }
        #liril-terminal {
            display: none;
            width: 400px;
            height: 500px;
            background-color: rgba(5, 5, 5, 0.95);
            border: 1px solid #33ff33;
            border-radius: 4px;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.15);
            margin-bottom: 10px;
            display: flex; /* Hidden by default via class later */
            flex-direction: column;
        }
        .liril-hidden {
            display: none !important;
        }
        #liril-header {
            background-color: #111;
            color: #ccc;
            padding: 8px;
            border-bottom: 1px solid #33ff33;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
        }
        #liril-log {
            flex-grow: 1;
            padding: 10px;
            overflow-y: auto;
            color: #00dd00;
            font-size: 13px;
        }
        #liril-log p { margin: 5px 0; }
        #liril-log .user-msg { color: #fff; }
        #liril-log pre {
            background-color: #000;
            padding: 8px;
            border-left: 2px solid #0f0;
            overflow-x: auto;
            color: #aaa;
        }
        #liril-input-area {
            display: flex;
            border-top: 1px solid #33ff33;
            padding: 5px;
            background-color: #000;
        }
        #liril-input {
            flex-grow: 1;
            background-color: transparent;
            border: none;
            color: #00ff00;
            font-family: inherit;
            padding: 5px;
            outline: none;
        }
        #liril-status { color: #ff3333; }
        .liril-online { color: #33ff33 !important; }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML
    const container = document.createElement('div');
    container.id = 'liril-widget-container';
    container.innerHTML = `
        <div id="liril-terminal" class="liril-hidden">
            <div id="liril-header">
                <span>TENET-5 // LIRIL MATRIX</span>
                <span id="liril-status">OFFLINE</span>
            </div>
            <div id="liril-log">
                <p>Initializing Subkernel connection...</p>
            </div>
            <form id="liril-input-area">
                <span style="color:#0f0; padding:5px;">></span>
                <input type="text" id="liril-input" autocomplete="off" placeholder="Query Matrix Ledger..." disabled>
            </form>
        </div>
        <button id="liril-toggle-btn">LIRIL SYS</button>
    `;
    document.body.appendChild(container);

    // 3. Logic
    const toggleBtn = document.getElementById('liril-toggle-btn');
    const terminal = document.getElementById('liril-terminal');
    const statusSpan = document.getElementById('liril-status');
    const inputField = document.getElementById('liril-input');
    const logArea = document.getElementById('liril-log');
    const form = document.getElementById('liril-input-area');

    let isOnline = false;

    // Toggle Window
    toggleBtn.addEventListener('click', () => {
        if (terminal.classList.contains('liril-hidden')) {
            terminal.classList.remove('liril-hidden');
            checkHealth();
        } else {
            terminal.classList.add('liril-hidden');
        }
    });

    const appendLog = (text, isUser = false) => {
        const p = document.createElement('div');
        if (isUser) {
            p.className = 'user-msg';
            p.innerText = `> ${text}`;
        } else {
            // Rough markdown parsing for LIRIL
            let parsed = text
                .replace(/```([\\s\\S]*?)```/g, '<pre>$1</pre>')
                .replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>')
                .replace(/\\n/g, '<br>');
            p.innerHTML = parsed;
        }
        logArea.appendChild(p);
        logArea.scrollTop = logArea.scrollHeight;
    };

    // Health check loop
    const checkHealth = async () => {
        try {
            const res = await fetch('http://127.0.0.1:18840/health');
            if (res.ok) {
                if (!isOnline) {
                    statusSpan.innerText = 'ONLINE(118400)';
                    statusSpan.classList.add('liril-online');
                    inputField.disabled = false;
                    inputField.focus();
                    appendLog('[SYSTEM] Connected to Local LIRIL Subkernel.');
                }
                isOnline = true;
            }
        } catch (e) {
            statusSpan.innerText = 'OFFLINE';
            statusSpan.classList.remove('liril-online');
            inputField.disabled = true;
            isOnline = false;
        }
    };

    setInterval(checkHealth, 5000);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = inputField.value.trim();
        if (!msg || !isOnline) return;
        
        appendLog(msg, true);
        inputField.value = '';
        inputField.disabled = true;

        try {
            const res = await fetch('http://127.0.0.1:18840/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            const reply = data.response || data.text || data.error || "[No Data]";
            appendLog(reply);
        } catch (err) {
            appendLog('[ERROR] Connection to Subkernel severed.');
            checkHealth();
        } finally {
            inputField.disabled = false;
            inputField.focus();
        }
    });
})();
