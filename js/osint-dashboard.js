/**
 * TENET5 OSINT Dashboard Logic
 * Loads latest.json intelligence brief and renders live metrics.
 */

document.addEventListener("DOMContentLoaded", () => {
  fetchDashboardData();
  initNetworkCanvas();
});

async function fetchDashboardData() {
  try {
    // Add cache buster
    const res = await fetch(`data/intelligence_briefs/latest.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("Failed to load latest.json");
    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    console.error("OSINT Dashboard error:", err);
    document.getElementById("brief-content").innerHTML = 
      `<p style="color:var(--osint-red)">Error loading intelligence brief. Ensure data pipeline is running.</p>`;
  }
}

function renderDashboard(data) {
  // 1. Threat Level
  const threatEl = document.getElementById("global-threat-level");
  if (threatEl) {
    threatEl.className = `threat-indicator level-${data.threat_level.toLowerCase()}`;
    threatEl.querySelector(".threat-text").textContent = `THREAT: ${data.threat_level}`;
  }

  // 2. Metrics
  const metricsContainer = document.getElementById("metrics-container");
  if (metricsContainer && data.metrics) {
    metricsContainer.innerHTML = `
      <div class="metric-card">
        <div class="metric-value">${data.metrics.contracts_scanned.toLocaleString()}</div>
        <div class="metric-label">Contracts Scanned</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color:var(--osint-amber)">${data.metrics.anomalies_detected.toLocaleString()}</div>
        <div class="metric-label">Anomalies Detected</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.entities_tracked.toLocaleString()}</div>
        <div class="metric-label">Entities Tracked</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${data.metrics.evidence_entries.toLocaleString()}</div>
        <div class="metric-label">Evidence Sealed</div>
      </div>
    `;
  }

  // 3. Daily Brief
  const briefContent = document.getElementById("brief-content");
  if (briefContent) {
    // Basic markdown-to-html for paragraphs
    const htmlText = data.summary.split('\n\n').map(p => `<p>${p}</p>`).join('');
    briefContent.innerHTML = htmlText;
  }
  
  const timestamp = document.getElementById("brief-timestamp");
  if (timestamp) {
    timestamp.textContent = new Date(data.generated_at).toLocaleString('en-CA', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + " UTC";
  }

  // 4. Anomalies Feed (using top_findings)
  const anomaliesFeed = document.getElementById("anomalies-feed");
  if (anomaliesFeed && data.top_findings) {
    anomaliesFeed.innerHTML = data.top_findings.map(f => `
      <div class="anomaly-item ${f.severity}">
        <span class="a-cat">[${f.severity}] ${f.category}</span>
        <span class="a-text">${f.finding}</span>
      </div>
    `).join('');
    if (data.top_findings.length === 0) {
      anomaliesFeed.innerHTML = `<div class="anomaly-item"><span class="a-text">No critical anomalies flagged in the current cycle.</span></div>`;
    }
  }

  // 5. Recent Reports List
  const reportList = document.getElementById("report-list");
  if (reportList) {
    reportList.innerHTML = `
      <li>
        <a href="intelligence-report-${data.date}.html">
          Daily Intelligence Brief
          <span class="report-date">${data.date}</span>
        </a>
      </li>
      <li>
        <a href="data/intelligence_briefs/fencing_report_20260423.md">
          Public Figure Fencing Report
          <span class="report-date">2026-04-23</span>
        </a>
      </li>
      <li>
        <a href="intelligence-report-apr2026.html">
          Procurement Anomaly Investigation
          <span class="report-date">2026-04-21</span>
        </a>
      </li>
    `;
  }
}

// Simple decorative network canvas
function initNetworkCanvas() {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  // Set internal canvas size to match display
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  document.getElementById("network-overlay").style.display = "none";
  
  // Generate random nodes
  const nodes = Array.from({length: 40}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 1
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
    ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
    
    // Update and draw nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 60) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(draw);
  }
  
  draw();
}
