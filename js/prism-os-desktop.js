/* ═══════════════════════════════════════════════════════
   PRISM OS DESKTOP
   Window Management & Telemetry Simulation
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // --- Window Draggable Logic ---
  let highestZ = 100;
  const windows = document.querySelectorAll('.prism-window');

  windows.forEach(win => {
    const header = win.querySelector('.prism-window-header');
    if (!header) return;

    let isDragging = false;
    let startX, startY, initialX, initialY;

    // Bring to front on click
    win.addEventListener('mousedown', () => {
      windows.forEach(w => w.classList.remove('active'));
      win.classList.add('active');
      highestZ++;
      win.style.zIndex = highestZ;
    });

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('prism-window-btn')) return; // ignore buttons
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = win.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      
      // Reset right/bottom so left/top take over
      win.style.right = 'auto';
      win.style.bottom = 'auto';
      win.style.left = initialX + 'px';
      win.style.top = initialY + 'px';
      
      e.preventDefault(); // prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = (initialX + dx) + 'px';
      win.style.top = (initialY + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Window Buttons
    const closeBtn = header.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        win.style.display = 'none';
      });
    }
  });

  // --- Telemetry Simulation ---
  const gpu0Bar = document.getElementById('gpu0-bar');
  const gpu0Val = document.getElementById('gpu0-val');
  const gpu1Bar = document.getElementById('gpu1-bar');
  const gpu1Val = document.getElementById('gpu1-val');
  const npuBar = document.getElementById('npu-bar');
  const npuVal = document.getElementById('npu-val');

  function updateTelemetry() {
    // GPU 0 fluctuates around 15-35%
    let g0 = Math.floor(15 + Math.random() * 20);
    gpu0Bar.style.width = g0 + '%';
    gpu0Val.textContent = g0 + '%';

    // GPU 1 fluctuates around 40-75%
    let g1 = Math.floor(40 + Math.random() * 35);
    gpu1Bar.style.width = g1 + '%';
    gpu1Val.textContent = g1 + '%';
    
    if (g1 > 65) gpu1Bar.classList.add('high');
    else gpu1Bar.classList.remove('high');

    // NPU is spiky (0 to 12%)
    let n = Math.floor(Math.random() * 12);
    npuBar.style.width = n + '%';
    npuVal.textContent = n + '%';

    setTimeout(updateTelemetry, 1500 + Math.random() * 1000);
  }
  updateTelemetry();

  // --- NATS Firehose Simulation ---
  const natsLog = document.getElementById('nats-log');
  const topics = [
    'tenet5.liril.rag.query',
    'tenet5.system.metrics',
    'tenet5.nemoclaw.dispatch',
    'tenet5.hermes.verify',
    'tenet5.core.heartbeat'
  ];

  function addNatsLog() {
    if (!natsLog) return;
    const d = new Date();
    const ts = d.toISOString().split('T')[1].slice(0,12);
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const size = Math.floor(Math.random() * 400 + 100) + ' bytes';

    const div = document.createElement('div');
    div.innerHTML = `<span class="ts">[${ts}]</span> <span class="topic">${topic}</span> &rarr; OK (${size})`;
    
    natsLog.appendChild(div);
    if (natsLog.childElementCount > 20) {
      natsLog.removeChild(natsLog.firstChild);
    }
    natsLog.scrollTop = natsLog.scrollHeight;

    setTimeout(addNatsLog, 300 + Math.random() * 800);
  }
  addNatsLog();

  // --- LIRIL Input Handle ---
  const input = document.getElementById('liril-input');
  const chatLog = document.getElementById('liril-chat-log');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        const val = input.value.trim();
        input.value = '';
        
        // Add User Message
        const div = document.createElement('div');
        div.className = 'liril-msg';
        div.innerHTML = `<span class="sender" style="color: #E6E2DA">USER</span><span class="text">${val}</span>`;
        chatLog.appendChild(div);
        
        // Fake LIRIL Reply
        setTimeout(() => {
          const rep = document.createElement('div');
          rep.className = 'liril-msg';
          rep.innerHTML = `<span class="sender">LIRIL</span><span class="text">Acknowledged. Routing command <code>${val}</code> through p256 mesh...</span>`;
          chatLog.appendChild(rep);
          chatLog.parentElement.scrollTop = chatLog.parentElement.scrollHeight;
        }, 600);

        chatLog.parentElement.scrollTop = chatLog.parentElement.scrollHeight;
      }
    });
  }

})();
