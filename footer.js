/**
 * Canadian Accountability Project Shared Footer v5.1 — A+ Stanford Credibility Design
 * Loaded by shell.js → injects into #site-footer-frame or #site-footer
 */
(function() {
  'use strict';

  // Guard: prevent double execution
  if (window.__TENET5_FOOTER_LOADED) return;
  window.__TENET5_FOOTER_LOADED = true;

  var FOOTER = {
    author: {
      name: 'Daniel Perry',
      title: 'Canadian Forces Combat Veteran, Afghanistan',
      role: 'Former Signals Operator, Princess Patricia\'s Canadian Light Infantry',
    },
    columns: [
      {
        heading: 'Investigation',
        links: [
          { label: 'The 504 Database', href: 'accountability.html' },
          { label: 'Investigation Board', href: 'conspiracy-board.html' },
          { label: 'Cross-Reference Findings', href: 'findings.html' },
          { label: 'Arms Pipeline', href: 'arms-pipeline.html' },
          { label: 'Evidence Archive', href: 'evidence.html' },
          { label: 'Evidence Index', href: 'evidence-index.html' },
          { label: 'Criminal Code Analysis', href: 'criminal-code-analysis.html' },
        ]
      },
      {
        heading: 'OSINT Tools',
        links: [
          { label: 'OSINT Dashboard', href: 'osint-dashboard.html' },
          { label: 'Network Analysis', href: 'network-analysis.html' },
          { label: 'Dossier Viewer', href: 'dossier-viewer.html' },
          { label: 'MP Scorecard', href: 'mp-scorecard.html' },
          { label: 'Voting Records', href: 'voting-records.html' },
          { label: 'Charity Pipeline', href: 'charity-pipeline.html' },
        ]
      },
      {
        heading: 'Follow the Money',
        links: [
          { label: 'Sector Lobbying', href: 'sector-lobbying.html' },
          { label: 'Lobbying Tracker', href: 'lobbying-tracker.html' },
          { label: 'Contributions Tracker', href: 'contributions-tracker.html' },
          { label: 'Carney Conflicts', href: 'carney-conflicts.html' },
          { label: 'Corruption Map', href: 'corruption-map.html' },
          { label: 'Procurement Analysis', href: 'procurement-analysis.html' },
          { label: 'Foreign Influence', href: 'foreign-influence.html' },
        ]
      },
      {
        heading: 'About',
        links: [
          { label: 'My Story', href: 'my-story.html' },
          { label: 'Legal Framework', href: 'legal.html' },
          { label: 'Whistleblower Guide', href: 'whistleblower-guide.html' },
          { label: 'Open Letter to MPs', href: 'open-letter.html' },
          { label: 'Research Methodology', href: 'ai-research.html' },
          { label: 'About This Project', href: 'about.html' },
          { label: 'FAQ & History', href: 'history.html' },
        ]
      }
    ],
    dataSources: [
      { label: 'Commissioner of Lobbying', href: 'https://lobbycanada.gc.ca/en/open-data/' },
      { label: 'Elections Canada', href: 'https://www.elections.ca/content.aspx?section=fin&dir=oda&document=index&lang=e' },
      { label: 'Health Canada', href: 'https://www.canada.ca/en/health-canada.html' },
      { label: 'Auditor General', href: 'https://www.oag-bvg.gc.ca' },
      { label: 'OpenParliament.ca', href: 'https://openparliament.ca/api/' },
      { label: 'open.canada.ca', href: 'https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b' },
    ]
  };

  function buildFooter() {
    var el = document.getElementById('site-footer-frame') ||
             document.getElementById('site-footer');
    if (!el) return;

    var year = new Date().getFullYear();
    var html = '';

    html += '<div class="credibility-footer">';
    html += '<div style="max-width:1100px;margin:0 auto;">';

    // Link columns
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2rem;margin-bottom:2.5rem;">';
    FOOTER.columns.forEach(function(col) {
      html += '<div>';
      html += '<h4 style="font-size:0.9rem;margin-bottom:0.8rem;color:#f3f4f6;letter-spacing:0.05em;text-transform:uppercase;">' + col.heading + '</h4>';
      col.links.forEach(function(link) {
        html += '<a href="' + link.href + '" style="display:block;font-size:0.85rem;margin-bottom:0.5rem;color:#d1d5db;text-decoration:none;transition:color 0.2s;">' + link.label + '</a>';
      });
      html += '</div>';
    });
    html += '</div>';

    // Contact section (Stanford #5)
    html += '<div style="padding:1.5rem;border:1px solid rgba(255,255,255,0.1);border-radius:8px;margin-bottom:2rem;display:flex;flex-wrap:wrap;gap:2rem;align-items:center;justify-content:space-between;">';
    html += '<div>';
    html += '<p style="font-size:0.9rem;color:#f3f4f6;font-weight:600;margin:0 0 4px;">Have evidence? Know something?</p>';
    html += '<p style="font-size:0.82rem;color:#9ca3af;margin:0;">Tips, corrections, and source documents are welcome. Whistleblower protections apply.</p>';
    html += '</div>';
    html += '<div style="display:flex;gap:1rem;flex-wrap:wrap;">';
    html += '<a href="whistleblower-guide.html" style="display:inline-block;padding:0.5rem 1.2rem;background:#c41e3a;color:#fff;border-radius:6px;font-size:0.82rem;font-weight:600;text-decoration:none;">Submit a Tip</a>';
    html += '<a href="tenet5-evidence-archive.zip" download style="display:inline-block;padding:0.5rem 1.2rem;border:1px solid rgba(255,255,255,0.2);color:#d1d5db;border-radius:6px;font-size:0.82rem;text-decoration:none;" title="Download complete evidence archive (ZIP, ~127 MB)">&#x1F4E6; Download Archive</a>';
    html += '<a href="about.html" style="display:inline-block;padding:0.5rem 1.2rem;border:1px solid rgba(255,255,255,0.2);color:#d1d5db;border-radius:6px;font-size:0.82rem;text-decoration:none;">Contact</a>';
    html += '</div>';
    html += '</div>';

    // Data sources bar
    html += '<div style="padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.1);margin-bottom:1.5rem;">';
    html += '<p style="font-size:0.75rem;color:#6b7280;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Primary Data Sources</p>';
    html += '<p style="font-size:0.8rem;color:#9ca3af;line-height:1.8;">';
    FOOTER.dataSources.forEach(function(src, i) {
      if (i > 0) html += ' &nbsp;&bull;&nbsp; ';
      html += '<a href="' + src.href + '" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;">' + src.label + '</a>';
    });
    html += '</p>';
    html += '</div>';

    // Credibility line (Stanford #2, #4)
    html += '<div style="padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.1);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">';
    html += '<div>';
    html += '<p style="font-size:0.9rem;color:#f3f4f6;font-weight:700;margin:0 0 2px;">' + FOOTER.author.name + '</p>';
    html += '<p style="font-size:0.8rem;color:#9ca3af;margin:0 0 2px;">' + FOOTER.author.title + '</p>';
    html += '<p style="font-size:0.75rem;color:#6b7280;margin:0;">' + FOOTER.author.role + '</p>';
    html += '</div>';
    html += '<div style="text-align:right;">';
    html += '<p style="font-size:0.8rem;color:#9ca3af;margin:0 0 4px;">&copy; ' + year + ' Daniel Perry. All rights reserved.</p>';
    html += '<p style="font-size:0.72rem;color:#6b7280;margin:0;">Every statistic sourced from official Government of Canada publications.</p>';
    html += '<p style="font-size:0.72rem;color:#6b7280;margin:0;">Lobbying data: Commissioner of Lobbying &bull; Contributions: Elections Canada &bull; Deaths: Health Canada</p>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // max-width wrapper
    html += '</div>'; // credibility-footer

    el.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildFooter);
  } else {
    buildFooter();
  }
})();
