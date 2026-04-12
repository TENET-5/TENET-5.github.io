import os

css_injection = """

/* ═══════════════════════════════════════════════
   PREMIUM GLASSMORPHISM COMPONENTS (V5.0 AESTHETICS)
   ═══════════════════════════════════════════════ */

/* ── 1. The Media Grid Engine ── */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--s-md);
  margin: var(--s-lg) 0;
  width: 100%;
}

.media-card {
  display: flex !important;
  flex-direction: column !important;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  overflow: hidden;
  text-decoration: none;
  transition: all var(--dur) var(--ease-spring);
  backdrop-filter: var(--backdrop-card);
  -webkit-backdrop-filter: var(--backdrop-card);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.media-card:hover {
  transform: translateY(-6px);
  border-color: var(--border-accent);
  box-shadow: 0 12px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px var(--accent-glow);
}

.media-card img, .media-card iframe {
  width: 100%;
  height: 200px;
  object-fit: cover !important;
  border-bottom: 1px solid var(--border);
  transition: transform var(--dur-slow) var(--ease);
}

.media-card:hover img {
  transform: scale(1.05);
}

.media-card-content {
  padding: var(--s-sm);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.media-card-content h3 {
  margin-bottom: var(--s-2xs);
  color: var(--text-primary);
  font-size: var(--text-lg);
  font-weight: 700;
  transition: color var(--dur-fast) ease;
}

.media-card:hover .media-card-content h3 {
  color: var(--accent-bright);
}

.media-card-content p {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: 0;
}

/* ── 2. Stat Hero Matrix ── */
.stat-hero-banner {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: var(--s-md);
  justify-content: center;
  background: linear-gradient(180deg, rgba(10, 14, 22, 0.8), rgba(5, 8, 16, 0.9));
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: var(--s-lg) var(--s-sm) !important;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  margin-bottom: var(--s-xl);
}

.stat-hero-item {
  flex: 1 1 200px;
  max-width: 300px;
  display: flex !important;
  flex-direction: column !important;
  align-items: center;
  text-align: center;
  padding: var(--s-sm);
}

.stat-hero-num {
  font-family: var(--font-headline);
  font-size: var(--text-5xl);
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
  background: linear-gradient(to bottom right, #ffffff, #888899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.stat-hero-num.blue { background: linear-gradient(to bottom right, #60a5fa, #2563eb); -webkit-background-clip: text; }
.stat-hero-num.amber { background: linear-gradient(to bottom right, #fbbf24, #d97706); -webkit-background-clip: text; }
.stat-hero-num.purple { background: linear-gradient(to bottom right, #c084fc, #9333ea); -webkit-background-clip: text; }
.stat-hero-num.green { background: linear-gradient(to bottom right, #34d399, #059669); -webkit-background-clip: text; }

.stat-hero-label {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.stat-hero-sub {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* ── 3. Intelligence Warning Banners ── */
.credibility-card {
  display: flex !important;
  align-items: center !important;
  gap: var(--s-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-left: 4px solid var(--color-gold);
  padding: var(--s-sm) var(--s-md);
  margin: var(--s-md) auto;
  max-width: var(--max-content);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-sm);
}

.credibility-card-icon {
  font-size: var(--text-3xl);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}

.credibility-card-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: var(--text-lg);
  margin-bottom: 2px;
}

.credibility-card-role {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.4;
  margin-bottom: 4px;
}

.credibility-card-badge {
  display: inline-block;
  background: var(--accent-bright);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 2px 8px;
  border-radius: 12px;
}

.litigation-banner {
  background: rgba(196, 30, 58, 0.1);
  border-top: 2px solid var(--accent);
  border-bottom: 2px solid var(--accent);
  padding: var(--s-md);
  margin: var(--s-md) 0;
  text-align: center;
  position: relative;
}

.litigation-tag {
  display: inline-block;
  background: var(--accent-bright);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 2px;
  animation: pulseRed 2s infinite;
  margin-bottom: var(--s-xs);
}

.litigation-title {
  font-family: var(--font-headline);
  font-size: var(--text-xl);
  color: var(--text-primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--s-xs);
}

.litigation-body {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 800px;
  margin: 0 auto;
}

.litigation-cta {
  display: inline-block;
  margin-top: var(--s-xs);
  color: var(--accent-bright);
  font-weight: 700;
  text-decoration: underline;
}

.pages-banner {
  background: var(--bg-elevated);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--s-md);
}

.pages-banner-link {
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  margin: 0 8px;
  transition: color var(--dur-fast) ease;
}

.pages-banner-red:hover { color: var(--accent-bright); }
.pages-banner-yellow:hover { color: var(--color-gold); }
.pages-banner-purple:hover { color: var(--color-purple); }
.pages-banner-pink:hover { color: #ec4899; }

/* ── 4. CTA Grid ── */
.cta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--s-sm);
  margin-top: var(--s-md);
}

.cta-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  padding: var(--s-md);
  border-radius: var(--r-md);
  transition: all var(--dur) var(--ease);
  text-decoration: none;
  display: block;
}

.cta-card:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

/* Miscellaneous utility missing */
.narrative-intro {
  margin: var(--s-lg) auto;
  max-width: var(--max-content);
  padding: var(--s-sm);
  text-align: left;
}

.share-bar {
  display: flex !important;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--s-sm);
  margin: var(--s-md) 0;
  padding: var(--s-xs);
  background: rgba(255,255,255,0.02);
  border-radius: var(--r-lg);
}

.share-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: white;
  cursor: pointer;
  transition: 0.2s ease;
}

.share-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
}

.live-counter-banner {
  background: rgba(196, 30, 58, 0.1);
  color: var(--text-primary);
  text-align: center;
  padding: 10px;
  border-top: 1px solid var(--accent);
  border-bottom: 1px solid var(--accent);
  margin-bottom: var(--s-md);
}

"""

file_path = "style.css"
with open(file_path, "a", encoding="utf-8") as f:
    f.write(css_injection)
    
print("Premium CSS injected successfully into style.css")
