/* ═══════════════════════════════════════════════════════
     SHARED NAV COMPONENT — include in every page via JS
     Canadian Accountability Project — ABCXYZ.github.io
     ═══════════════════════════════════════════════════════ */
(function() {
  // Site configuration
  window.SITE_DATA = {
    updated: "2026-04-11",
    source: "official government records"
  };

  const headerHTML = `
<header class="site-header" id="site-header">
  <div class="header-inner">
    <a href="/index.html" class="site-logo">
      🍁 <span>CAP</span>
      <span class="logo-sub">Canadian Accountability Project</span>
    </a>
    <nav class="site-nav" id="site-nav">
      <a href="/index.html"                      id="nav-home">Home</a>
      <a href="/records.html"                    id="nav-records">Records DB</a>
      <a href="/maid-accountability.html"        id="nav-maid">MAID Report</a>
      <a href="/rcmp-commissioners.html"         id="nav-rcmp">RCMP</a>
      <a href="/arrivecan.html"                  id="nav-arrivecan">ArriveCAN</a>
      <a href="/senate-expenses.html"            id="nav-senate">Senate</a>
      <a href="/ag-findings.html"                id="nav-ag">AG Findings</a>
      <a href="/phoenix-pay.html"                id="nav-phoenix">Phoenix Pay</a>
      <a href="/foreign-interference.html"       id="nav-foreign">Foreign Interference</a>
      <a href="/s504-covey-bae.html"             id="nav-504" style="color:#ef4444;">s.504</a>
      <a href="/liril-analysis.html"             id="nav-liril">Analysis</a>
    </nav>
    <div class="liril-status-pill" title="Canadian Accountability Project">
      <div class="dot"></div>
      Canadian Accountability Project
    </div>
    <button class="menu-toggle" id="menu-toggle" aria-label="Menu">☰</button>
  </div>
</header>`;

  const footerHTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <h4>Canadian Accountability Project</h4>
      <ul>
        <li><a href="/index.html">Home</a></li>
        <li><a href="/records.html">Records Database</a></li>
        <li><a href="/maid-accountability.html">MAID Report</a></li>
        <li><a href="/rcmp-commissioners.html">RCMP Commissioners</a></li>
      </ul>
    </div>
    <div>
      <h4>Investigations</h4>
      <ul>
        <li><a href="/arrivecan.html">ArriveCAN — $59.5M App</a></li>
        <li><a href="/senate-expenses.html">Senate Expenses Scandal</a></li>
        <li><a href="/ag-findings.html">Auditor General Findings</a></li>
        <li><a href="/phoenix-pay.html">Phoenix Pay Disaster</a></li>
        <li><a href="/foreign-interference.html">Foreign Interference</a></li>
        <li><a href="/s504-covey-bae.html" style="color:#ef4444;">s.504 Covey &amp; Bae</a></li>
      </ul>
    </div>
    <div>
      <h4>AI Analysis</h4>
      <ul>
        <li><a href="/liril-analysis.html">Analysis Dashboard</a></li>
        <li><a href="/cicd-status.html">CI/CD Status</a></li>
        <li><a href="/about.html">About This Project</a></li>
      </ul>
    </div>
    <div>
      <h4>About</h4>
      <ul>
        <li><span style="color:rgba(255,255,255,0.45)">All analysis performed locally</span></li>
        <li><span style="color:rgba(255,255,255,0.45)">No external APIs or trackers</span></li>
        <li><span style="color:rgba(255,255,255,0.45)">Sources: official records only</span></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 Canadian Accountability Project. All records sourced from official government, parliamentary, and court documents.</span>
    <span class="footer-liril-sig">
      <span class="dot"></span>
      Canadian Accountability Project
    </span>
  </div>
</footer>`;

  document.addEventListener('DOMContentLoaded', function() {
    const ph = document.getElementById('page-header-placeholder');
    if (ph) ph.outerHTML = headerHTML;
    else document.body.insertAdjacentHTML('afterbegin', headerHTML);

    const pf = document.getElementById('page-footer-placeholder');
    if (pf) pf.outerHTML = footerHTML;
    else document.body.insertAdjacentHTML('beforeend', footerHTML);

    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a').forEach(a => {
      if (a.getAttribute('href').includes(path)) a.classList.add('active');
    });

    const toggle = document.getElementById('menu-toggle');
    const nav    = document.getElementById('site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }
  });
})();
