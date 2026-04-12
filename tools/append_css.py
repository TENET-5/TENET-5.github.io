import os

css_path = r"e:\TENET-5.github.io\style.css"

new_css = """
/* ═══════════════════════════════════════════════
   GLOBAL NAV & APP SHELL STRUCTURAL RESTORATION
   ═══════════════════════════════════════════════ */
.site-header {
  position: sticky;
  top: 0; left: 0; right: 0;
  height: var(--nav-h);
  background: rgba(5, 8, 16, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  display: flex !important;
  justify-content: center;
  z-index: 1000;
}
.header-inner {
  width: 100%;
  max-width: var(--max-wide);
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--s-md);
  margin: 0 auto;
}
.site-logo {
  display: flex !important;
  align-items: center;
  gap: 12px;
  font-family: var(--font-headline);
  font-weight: 800;
  color: var(--text-primary) !important;
  text-decoration: none;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
.logo-sub {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
@media (max-width: 768px) { .logo-sub { display: none !important; } }

.site-nav {
  display: flex !important;
  gap: var(--s-sm);
  align-items: center;
}
.site-nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--r-sm);
  transition: all var(--dur-fast) var(--ease);
}
.site-nav a:hover, .site-nav a.active {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
.liril-status-pill {
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  background: rgba(0, 255, 128, 0.05) !important;
  border: 1px solid rgba(0, 255, 128, 0.2) !important;
  color: #10b981 !important;
  padding: 4px 12px !important;
  border-radius: 12px !important;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-left: var(--s-md);
}
.liril-status-pill .dot {
  width: 6px; height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

.menu-toggle {
  display: none;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 1.2rem;
}
@media (max-width: 1024px) {
  .site-nav { display: none !important; }
  .menu-toggle { display: block !important; }
}

/* HORIZONTAL GRID RECORD FOR ACCOUNTABILITY.HTML */
#records {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)) !important;
  gap: var(--s-md) !important;
  margin-top: var(--s-lg);
  width: 100% !important;
}

/* Fix missing backdrop variable if it was gone */
:root {
  --backdrop-card: blur(12px) saturate(160%);
}

.record {
  border-left: 3px solid var(--border);
  padding: 1.25rem !important;
  background: var(--bg-card) !important;
  backdrop-filter: var(--backdrop-card) !important;
  -webkit-backdrop-filter: var(--backdrop-card) !important;
  border-radius: 0 var(--r-md) var(--r-md) 0 !important;
  transition: all var(--dur-fast) var(--ease) !important;
  box-shadow: var(--shadow-sm) !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 0 !important;
}
.record:hover {
  border-left-color: var(--accent) !important;
  background: var(--bg-card-h) !important;
  transform: translateY(-2px) !important;
  box-shadow: var(--shadow-glass-h) !important;
}

.db-controls, #records {
  max-width: var(--max-wide) !important;
  width: 100% !important;
  margin-left: auto;
  margin-right: auto;
}

.hero-logo {
  max-width: 320px;
  height: auto;
  margin-bottom: var(--s-md);
  filter: drop-shadow(0 0 16px rgba(255,255,255,0.1));
}
"""

try:
    with open(css_path, "a", encoding="utf-8") as f:
        f.write(new_css)
    print("Successfully appended global structure CSS.")
except Exception as e:
    print("Error:", e)
