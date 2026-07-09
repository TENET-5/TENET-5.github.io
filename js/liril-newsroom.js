// LIRIL Newsroom — investigation feed + filters + modal
// Modified: 2026-04-20 | Cap#12-c3 + Grok Round 6 blueprint
// Populates #feed-grid with investigation cards pulled from a static
// seed list until the automated aggregator lands.
// Each card is a .liril-card.liril-glass with status badge, AI byline
// icons, primary-source chip, and a click-through to the dossier page.
// No deps. Vanilla JS. Graceful fail if DOM missing.

(function LirilNewsroom() {
  'use strict';

  // Seed investigations — Grok-curated from existing site pages.
  // When the automated aggregator ships, this array gets replaced by a fetch
  // to /public/feed.json (same schema).
  const SEED_INVESTIGATIONS = [
    {
      title: "Federal Procurement Anomalies: Benford's Law Violations",
      excerpt: "AI analysis of 2,114 federal contracts reveals extreme " +
               "first-digit violations (χ² = 480.7, 31× threshold). " +
               "Four departments show single vendors capturing >30% of total " +
               "spending. Parliamentary committee referrals recommended.",
      status: "VERIFIED",
      tags: ["political", "financial"],
      url: "intelligence-report-apr2026.html",
      sources: "proactive disclosure",
      when: "April 2026",
      ai: ["LIRIL ✓", "Jules"]
    },
    {
      title: "When the Courts Become the Abuse — Family Justice System",
      excerpt: "First-hand testimony from Canadian detention cross-referenced " +
               "with CanLII case law and 19th-century historical record. " +
               "Non-violent detention, coerced plea deals, domestic-call " +
               "asymmetry, and the 18th-century fiction of crown immunity.",
      status: "EVIDENCE-SEALED",
      tags: ["legal", "political"],
      url: "family-justice-system.html",
      sources: "testimony + canlii + statcan",
      when: "Just published",
      ai: ["LIRIL ✓", "Grok Heavy"]
    },
    {
      title: "The CFNIS War-Arrest Pincer: Military Police + Uttering-Threats Charge",
      excerpt: "A documented pattern where CFNIS investigation and criminal " +
               "charges converge to silence whistleblowers. Primary-source " +
               "timeline, MPCC findings, NDA-era capital punishment history, " +
               "plus Section 9 on detention-conditions accountability gaps.",
      status: "EVIDENCE-SEALED",
      tags: ["military", "legal"],
      url: "geneva-vs-jails.html",
      sources: "80+ primary",
      when: "Lead story",
      ai: ["LIRIL ✓", "Grok Heavy", "Jules"]
    },
    {
      title: "Foreign Interference Mapping: MSS, PRC, NSICOP Trail",
      excerpt: "Bill C-70 trajectory, NSICOP briefings, and the intelligence " +
               "chain of custody. Cross-referenced with public testimony.",
      status: "VERIFIED",
      tags: ["political", "foreign-interference"],
      url: "foreign-influence.html",
      sources: "42 primary",
      when: "Active",
      ai: ["LIRIL ✓", "Grok Heavy"]
    },
    {
      title: "MAID Practitioners: Documented Cases Under Judicial Review",
      excerpt: "102 practitioners, 373 outcomes each. Every name sourced to " +
               "Health Canada or publicly filed court documents. Submitted " +
               "under Criminal Code s.504.",
      status: "EVIDENCE-SEALED",
      tags: ["medical", "legal"],
      url: "maid-accountability.html",
      sources: "primary + court record",
      when: "Under review",
      ai: ["LIRIL ✓", "Grok Heavy", "Jules"]
    },
    {
      title: "MP Accountability Grid: Named, Indexed, Cross-Linked",
      excerpt: "Every Canadian MP with a criminal conviction, ethics " +
               "violation, foreign-interference flag, or caucus expulsion — " +
               "indexed in plain text with primary sources.",
      status: "VERIFIED",
      tags: ["political"],
      url: "mp-accountability-grid.html",
      sources: "continuously updated",
      when: "Live",
      ai: ["LIRIL ✓", "Jules"]
    },
    {
      title: "Open Letter to Parliament: Accountability Demand",
      excerpt: "Public open letter to Canadian Members of Parliament " +
               "demanding accountability on MAID, whistleblower protection, " +
               "and foreign-interference investigations.",
      status: "VERIFIED",
      tags: ["political", "legal"],
      url: "open-letter.html",
      sources: "public record",
      when: "Open",
      ai: ["Grok Heavy", "Jules"]
    },
    {
      title: "Timeline: 80 Years of Canadian Government Actions",
      excerpt: "Every major Canadian government action 1945-2025, filterable " +
               "by decade, category, and impact. Data cross-referenced against " +
               "Hansard and archived government publications.",
      status: "EVIDENCE-SEALED",
      tags: ["political", "legal"],
      url: "timeline.html",
      sources: "1850 citations",
      when: "Archive",
      ai: ["LIRIL ✓", "Grok Heavy", "Jules"]
    },
    {
      title: "Corruption Atlas: Visual Cross-Reference",
      excerpt: "A visual atlas of documented corruption, cross-linked to " +
               "primary-source reports and named individuals.",
      status: "DEVELOPING",
      tags: ["political", "financial"],
      url: "corruption-atlas.html",
      sources: "growing",
      when: "Building",
      ai: ["LIRIL ✓", "Grok Heavy"]
    },
    {
      title: "Bill C-70 Registry: Foreign-Interference Legislation Watch",
      excerpt: "Full timeline of Bill C-70 (foreign-interference registry), " +
               "committee testimony, amendments, and implementation status.",
      status: "VERIFIED",
      tags: ["political", "foreign-interference", "legal"],
      url: "bill-c70-registry.html",
      sources: "parliamentary record",
      when: "Legislation active",
      ai: ["LIRIL ✓", "Grok Heavy"]
    },
    {
      title: "CAF Recruitment Crisis: Root Cause Analysis",
      excerpt: "Data-driven analysis of the Canadian Armed Forces " +
               "recruitment crisis — policy failures, retention gaps, and " +
               "the institutional response to accountability cases.",
      status: "VERIFIED",
      tags: ["military"],
      url: "caf-recruitment-crisis.html",
      sources: "defence committee",
      when: "Ongoing",
      ai: ["Grok Heavy", "Jules"]
    },
    {
      title: "5th Generation Warfare: Information-Space Subversion",
      excerpt: "Mapping 5GW tactics used against Canadian democratic " +
               "institutions — disinformation networks, captured media, " +
               "compromised oversight.",
      status: "DEVELOPING",
      tags: ["foreign-interference", "political"],
      url: "5gw-subversion.html",
      sources: "open-source",
      when: "Mapping",
      ai: ["Grok Heavy"]
    },
    {
      title: "Panama Papers: Canadian Exposure",
      excerpt: "Canadian names, accounts, and entities surfaced by the " +
               "Panama Papers, with follow-up coverage and known prosecutions.",
      status: "EVIDENCE-SEALED",
      tags: ["financial", "legal"],
      url: "panama-papers.html",
      sources: "30+ cross-linked",
      when: "Archive",
      ai: ["LIRIL ✓", "Jules"]
    },
    {
      title: "ArriveCAN: Vendor Accountability",
      excerpt: "ArriveCAN app vendor chain, contract trail, AG findings, " +
               "and parliamentary response.",
      status: "VERIFIED",
      tags: ["political", "financial"],
      url: "arrivecan.html",
      sources: "AG + Hansard",
      when: "Documented",
      ai: ["LIRIL ✓", "Grok Heavy", "Jules"]
    }
  ];

  function makeCard(inv) {
    const card = document.createElement('article');
    card.className = 'liril-card liril-glass';
    card.dataset.status = inv.status;
    card.dataset.tags = inv.tags.join(',');

    const statusSpan = document.createElement('span');
    statusSpan.className = 'status-badge ' + inv.status;
    statusSpan.textContent = inv.status.replace('-', ' ');

    const title = document.createElement('h3');
    title.textContent = inv.title;

    const excerpt = document.createElement('p');
    excerpt.textContent = inv.excerpt;

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    const aiByline = document.createElement('span');
    aiByline.innerHTML = inv.ai.map(a =>
      `<span class="ai-dot" aria-hidden="true"></span>${a}`
    ).join(' ');
    const chip = document.createElement('span');
    chip.className = 'source-chip';
    chip.textContent = inv.sources;
    meta.appendChild(aiByline);
    meta.appendChild(chip);

    card.appendChild(statusSpan);
    card.appendChild(title);
    card.appendChild(excerpt);
    card.appendChild(meta);

    card.addEventListener('click', () => {
      window.location.href = inv.url;
    });
    card.tabIndex = 0;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', inv.title);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); window.location.href = inv.url;
      }
    });

    return card;
  }

  function populate() {
    const grid = document.getElementById('feed-grid');
    if (!grid) return;
    grid.innerHTML = '';
    SEED_INVESTIGATIONS.forEach(inv => grid.appendChild(makeCard(inv)));
  }

  function wireFilters() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.filter;
        const cards = document.querySelectorAll('#feed-grid .liril-card');
        cards.forEach(card => {
          const status = card.dataset.status;
          const tags   = (card.dataset.tags || '').split(',');
          const show = f === 'all'
                    || status === f
                    || tags.includes(f);
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  function debounce(fn, waitMs) {
    var timer = null;
    return function () {
      var args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        fn.apply(null, args);
      }, waitMs);
    };
  }

  function hotkeys() {
    var onHotkey = debounce(function (e) {
      if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        const live = document.getElementById('live');
        if (live) live.style.display = live.style.display === 'none' ? '' : 'none';
      }
    }, 80);
    document.addEventListener('keydown', onHotkey);
  }

  // Progressive enhancement: try fetching real feed first
  async function tryLoadFeed() {
    try {
      const r = await fetch('/public/feed.json', { cache: 'no-cache' });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length) {
          const grid = document.getElementById('feed-grid');
          if (grid) {
            grid.innerHTML = '';
            data.forEach(inv => grid.appendChild(makeCard(inv)));
            return true;
          }
        }
      }
    } catch(e) { /* fallback to seed */ }
    return false;
  }

  function init() {
    tryLoadFeed().then(real => {
      if (!real) populate();
    });
    wireFilters();
    hotkeys();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
