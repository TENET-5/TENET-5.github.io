/**
 * TENET5 OSINT Dashboard Logic
 * Loads data/intelligence_briefs/latest.json and renders live metrics.
 * Schema-tolerant: supports both the 2026-06 brief shape
 * (investigative_threads / feeds_polled / …) and older shapes
 * (contracts_scanned / anomalies_detected / …).
 *
 * Theme: QUANTANIUM pristine-ice-lake — colour only for severity/data.
 * Supports agentic_seal metrics (max_spec, agentic_acts, theme_contract).
 */

document.addEventListener("DOMContentLoaded", () => {
  fetchDashboardData();
  initNetworkCanvas();
});

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Map threat_level strings → CSS class suffix + display label */
function normalizeThreat(level) {
  const raw = String(level || "UNKNOWN").trim().toUpperCase();
  const map = {
    CRITICAL: "critical",
    HIGH: "high",
    RED: "high",
    AMBER: "amber",
    MEDIUM: "medium",
    YELLOW: "amber",
    LOW: "low",
    GREEN: "green",
    INFO: "low",
  };
  const cls = map[raw] || "amber";
  return { cls, label: raw };
}

function formatMetric(n) {
  const num = Number(n) || 0;
  try {
    return num.toLocaleString("en-CA");
  } catch (_) {
    return String(num);
  }
}

function toneClass(tone) {
  if (tone === "high") return " is-high";
  if (tone === "critical") return " is-critical";
  if (tone === "verified") return " is-verified";
  return "";
}

function renderBriefHtml(data) {
  const parts = [];
  if (data.title) {
    parts.push(`<p class="brief-title rpt-body-title">${escapeHtml(data.title)}</p>`);
  }
  const metaBits = [];
  if (data.date) metaBits.push(escapeHtml(data.date));
  if (data.threat_level) {
    metaBits.push(
      `<span class="rpt-chip ${escapeHtml(String(data.threat_level).toUpperCase())}">` +
        `THREAT ${escapeHtml(String(data.threat_level).toUpperCase())}</span>`
    );
  }
  if (data.agentic_seal) metaBits.push(`<span class="rpt-chip verified">AGENTIC SEAL</span>`);
  if (metaBits.length) {
    parts.push(`<p class="brief-meta rpt-body-meta">${metaBits.join(" ")}</p>`);
  }
  const summary = String(data.summary || "").trim();
  if (!summary) {
    parts.push(`<p class="brief-empty">No summary text in this brief cycle.</p>`);
  } else {
    const paras = summary.split(/\n\s*\n/).filter(Boolean);
    paras.forEach((p) => {
      parts.push(`<p>${escapeHtml(p.replace(/\n/g, " "))}</p>`);
    });
  }
  return parts.join("");
}

function isStale(generatedAt, maxDays) {
  if (!generatedAt) return true;
  const t = Date.parse(generatedAt);
  if (Number.isNaN(t)) return true;
  const ageMs = Date.now() - t;
  return ageMs > (maxDays || 14) * 24 * 60 * 60 * 1000;
}

/** Prefer agentic seal metrics when present (site-health + carry-forward intel) */
function buildMetricCards(metrics, data) {
  if (!metrics || typeof metrics !== "object") return [];
  const m = metrics;
  const seal = data && data.agentic_seal;

  if (seal || m.agentic_acts != null || m.max_spec_score != null) {
    return [
      {
        value: m.max_spec_score ?? m.investigative_threads ?? 0,
        label: "Max Spec / Threads",
        tone: (m.max_spec_score || 0) >= 90 ? "verified" : null,
      },
      {
        value: m.agentic_acts ?? m.high_threads ?? 0,
        label: "Agentic Acts",
        tone: "high",
      },
      {
        value: m.theme_contract ?? m.feeds_polled ?? 0,
        label: "Theme Contract",
        tone: "verified",
      },
      {
        value: m.headlines_reviewed ?? m.unique_stories ?? 0,
        label: "Feed Headlines",
        tone: null,
      },
    ];
  }

  if (
    m.investigative_threads != null ||
    m.headlines_reviewed != null ||
    m.feeds_polled != null
  ) {
    return [
      {
        value: m.investigative_threads ?? 0,
        label: "Investigative Threads",
        tone: null,
      },
      {
        value: m.high_threads ?? m.critical_threads ?? 0,
        label: "High / Critical",
        tone: (m.critical_threads || 0) > 0 ? "critical" : "high",
      },
      {
        value: m.headlines_reviewed ?? m.unique_stories ?? 0,
        label: "Headlines Reviewed",
        tone: null,
      },
      {
        value: m.feeds_polled ?? 0,
        label: "Feeds Polled",
        tone: (m.feeds_blocked || 0) > 0 ? "high" : "verified",
      },
    ];
  }

  return [
    { value: m.contracts_scanned ?? 0, label: "Contracts Scanned", tone: null },
    { value: m.anomalies_detected ?? 0, label: "Anomalies Detected", tone: "high" },
    { value: m.entities_tracked ?? 0, label: "Entities Tracked", tone: null },
    { value: m.evidence_entries ?? 0, label: "Evidence Sealed", tone: "verified" },
  ];
}

async function fetchDashboardData() {
  const briefEl = document.getElementById("brief-content");
  try {
    const res = await fetch(`data/intelligence_briefs/latest.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " loading latest.json");
    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    console.error("OSINT Dashboard error:", err);
    if (briefEl) {
      briefEl.innerHTML =
        `<p class="brief-error">Intelligence brief unavailable (${escapeHtml(err.message)}). ` +
        `Check <code>data/intelligence_briefs/latest.json</code> — LIRIL overnight pipeline may be stalled.</p>`;
    }
    // Keep skeletons from sitting forever
    const metricsContainer = document.getElementById("metrics-container");
    if (metricsContainer && metricsContainer.querySelector(".metric-skeleton")) {
      metricsContainer.innerHTML =
        `<div class="metric-card"><div class="metric-value">—</div>` +
        `<div class="metric-label">Brief offline</div></div>`;
    }
  }
}

function renderDashboard(data) {
  // 1. Threat Level
  const threatEl = document.getElementById("global-threat-level");
  if (threatEl) {
    const { cls, label } = normalizeThreat(data.threat_level);
    threatEl.className = `threat-indicator level-${cls}`;
    const textEl = threatEl.querySelector(".threat-text");
    if (textEl) textEl.textContent = `THREAT: ${label}`;
  }

  // 2. Metrics (schema-tolerant)
  const metricsContainer = document.getElementById("metrics-container");
  if (metricsContainer) {
    const cards = buildMetricCards(data.metrics, data);
    if (cards.length === 0) {
      metricsContainer.innerHTML =
        `<div class="metric-card"><div class="metric-value">—</div>` +
        `<div class="metric-label">No metrics in brief</div></div>`;
    } else {
      metricsContainer.innerHTML = cards
        .map((c) => {
          const tone = c.tone ? ` tone-${escapeHtml(c.tone)}` : "";
          return (
            `<div class="metric-card rpt-metric${tone}">` +
            `<div class="metric-value rpt-metric-value${toneClass(c.tone)}">${formatMetric(c.value)}</div>` +
            `<div class="metric-label rpt-metric-label">${escapeHtml(c.label)}</div>` +
            `</div>`
          );
        })
        .join("");
    }
  }

  // 3. Daily Brief body
  const briefContent = document.getElementById("brief-content");
  if (briefContent) {
    briefContent.innerHTML = renderBriefHtml(data);
  }

  // Feed-stale honesty: agentic seal can be fresh while RSS is not
  const feedsZero = data.metrics && Number(data.metrics.feeds_polled) === 0;
  if (feedsZero || (isStale(data.generated_at, 14) && !data.agentic_seal)) {
    const main = document.querySelector(".dashboard-main");
    if (main && !document.getElementById("brief-stale-banner")) {
      const ban = document.createElement("div");
      ban.id = "brief-stale-banner";
      ban.className = "brief-stale-banner";
      ban.setAttribute("role", "status");
      ban.textContent = feedsZero
        ? "Honest seal: feeds_polled=0 — last full RSS overnight remains 2026-06-28. Research + agentic site work may still be current."
        : "Brief is stale — last sealed " +
          (data.generated_at || data.date || "unknown") +
          ". Overnight LIRIL scan may need a cycle.";
      main.insertBefore(ban, main.firstChild);
    }
  }

  const timestamp = document.getElementById("brief-timestamp");
  if (timestamp) {
    try {
      const d = new Date(data.generated_at || data.date);
      timestamp.textContent =
        (Number.isNaN(d.getTime())
          ? String(data.date || "—")
          : d.toLocaleString("en-CA", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
            })) + " UTC";
    } catch (_) {
      timestamp.textContent = String(data.date || "—");
    }
  }

  // 4. Findings feed (investigation + agentic + carry-forward)
  const anomaliesFeed = document.getElementById("anomalies-feed");
  if (anomaliesFeed) {
    const findings = Array.isArray(data.top_findings) ? data.top_findings : [];
    if (findings.length === 0) {
      anomaliesFeed.innerHTML =
        `<div class="anomaly-item rpt-finding"><span class="a-text">No critical anomalies flagged in the current cycle.</span></div>`;
    } else {
      anomaliesFeed.innerHTML = findings
        .map((f) => {
          const sev = escapeHtml(f.severity || "MEDIUM");
          const cat = escapeHtml(f.category || "SIGNAL");
          const finding = escapeHtml(f.finding || "");
          const catClass = cat === "AGENTIC" ? " AGENTIC" : "";
          return (
            `<article class="anomaly-item rpt-finding ${sev}${catClass}">` +
            `<span class="a-cat rpt-finding-cat"><span class="rpt-chip ${sev}">${sev}</span> ${cat}</span>` +
            `<span class="a-text rpt-finding-text">${finding}</span>` +
            `</article>`
          );
        })
        .join("");
    }
  }

  // 5. Recent Reports — prefer detailed_brief + sealed date over dead links
  const reportList = document.getElementById("report-list");
  if (reportList) {
    const items = [];
    const date = data.date || "";
    // Prefer the structured brief JSON when present
    if (data.detailed_brief) {
      items.push({
        href: data.detailed_brief,
        title: "Structured daily brief (JSON)",
        date: date,
        live: true,
      });
    }
    // Human-readable HTML report if the seal date matches a known file
    if (date) {
      items.push({
        href: `intelligence-report-${date}.html`,
        title: "Daily Intelligence Brief (HTML)",
        date: date,
        live: false,
      });
    }
    items.push({
      href: "data/intelligence_briefs/latest.json",
      title: "latest.json (machine brief)",
      date: date || "live",
      live: true,
    });
    items.push({
      href: "data/intelligence_briefs/fencing_report_20260423.md",
      title: "Public Figure Fencing Report",
      date: "2026-04-23",
      live: false,
    });
    items.push({
      href: "intelligence-report-apr2026.html",
      title: "Procurement Anomaly Investigation",
      date: "2026-04-21",
      live: false,
    });

    // Prefer investigation + agentic pages when present
    if (data.primary_new_dossier || data.agentic_seal) {
      items.unshift({
        href: "griffon-glle-procurement.html",
        title: "Griffon GLLE investigation (active)",
        date: date || "live",
        live: true,
      });
      // (internal systems page removed 2026-07-10 — zero internals on the public site)
    }
    reportList.innerHTML = items
      .map((it) => {
        const live = it.live
          ? `<span class="report-live rpt-list-live">sealed</span>`
          : "";
        return (
          `<li><a href="${escapeHtml(it.href)}">` +
          `<span class="rpt-list-title">${escapeHtml(it.title)}${live}</span>` +
          `<span class="report-date rpt-list-date">${escapeHtml(it.date)}</span>` +
          `</a></li>`
        );
      })
      .join("");
  }
}

// Decorative network canvas — monochrome QUANTANIUM ink, not blue cyber
function initNetworkCanvas() {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = canvas.offsetWidth || 400;
  canvas.height = canvas.offsetHeight || 250;

  const overlay = document.getElementById("network-overlay");
  if (overlay) overlay.style.display = "none";

  const nodes = Array.from({ length: 36 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1,
  }));

  let raf = 0;
  let frames = 0;
  const MAX_FRAMES = 60 * 60; // stop after ~60s idle to save CPU

  function draw() {
    frames += 1;
    if (frames > MAX_FRAMES) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // near-white ink nodes, muted edges
    // glacial ice nodes over abyssal water
    ctx.fillStyle = "rgba(238, 246, 250, 0.72)";
    ctx.strokeStyle = "rgba(160, 200, 230, 0.12)";

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 55) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Static single frame for reduced-motion users
    draw();
    cancelAnimationFrame(raf);
    return;
  }
  draw();
}
