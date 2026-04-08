/**
 * TENET5 Shared Footer v4.0 — Stanford Credibility Design
 *
 * Generates a consistent, professional footer across all pages.
 * Implements Stanford Web Credibility Guidelines #2, #4, #5, #8:
 *   #2 — Real organization/person behind the site
 *   #4 — Honest, trustworthy person stands behind it
 *   #5 — Easy to contact
 *   #8 — Shows when content was last updated
 *
 * Place <footer id="site-footer"></footer> in every page.
 */
(function() {
  'use strict';

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
          { label: 'Meet LIRIL (AI)', href: 'liril.html' },
          { label: 'About This Project', href: 'about.html' },
          { label: 'FAQ & History', href: 'history.html' },
        ]
      }
    ],
    dataSources: [
      { label: 'Commissioner of Lobbying', href: 'https://lobbycanada.gc.ca/en/open-data/' },
      { label: 'Elections Canada', href: 'https://www.elections.ca/content.aspx?section=fin&dir=oda&document=index&lang=e' },
      { label: 'OpenParliament.ca', href: 'https://openparliament.ca/api/' },
      { label: 'open.canada.ca', href: 'https://open.canada.ca/data/en/dataset?q=contracts' },
      { label: 'Auditor General', href: 'https://www.oag-bvg.gc.ca' },
    ]
  };

  function buildFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;

    var year = new Date().getFullYear();
    var html = '';

    // Main footer grid
    html += '<div class="credibility-footer">';
    html += '<div style="max-width:1100px;margin:0 auto;">';

    // Link columns
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2rem;margin-bottom:2.5rem;">';
    FOOTER.columns.forEach(function(col) {
      html += '<div>';
      html += '<h4>' + col.heading + '</h4>';
      col.links.forEach(function(link) {
        html += '<a href="' + link.href + '" style="display:block;font-size:0.82rem;margin-bottom:0.4rem;color:#d1d5db;text-decoration:none;">' + link.label + '</a>';
      });
      html += '</div>';
    });
    html += '</div>';

    // Data sources bar
    html += '<div style="padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.1);margin-bottom:1.5rem;">';
    html += '<p style="font-size:0.7rem;color:#6b7280;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.1em;">Data Sources</p>';
    html += '<p style="font-size:0.75rem;color:#9ca3af;">';
    FOOTER.dataSources.forEach(function(src, i) {
      if (i > 0) html += ' &nbsp;|&nbsp; ';
      html += '<a href="' + src.href + '" target="_blank" rel="noopener" style="color:#93c5fd;text-decoration:none;">' + src.label + '</a>';
    });
    html += '</p>';
    html += '</div>';

    // Credibility line (Stanford #2, #4)
    html += '<div style="padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.1);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">';
    html += '<div>';
    html += '<p style="font-size:0.82rem;color:#f3f4f6;font-weight:600;">' + FOOTER.author.name + '</p>';
    html += '<p style="font-size:0.72rem;color:#9ca3af;">' + FOOTER.author.title + '</p>';
    html += '<p style="font-size:0.68rem;color:#6b7280;">' + FOOTER.author.role + '</p>';
    html += '</div>';
    html += '<div style="text-align:right;">';
    html += '<p style="font-size:0.72rem;color:#9ca3af;">&copy; ' + year + ' Daniel Perry. All rights reserved.</p>';
    html += '<p style="font-size:0.65rem;color:#6b7280;">Every statistic sourced from official Government of Canada publications.</p>';
    html += '<p style="font-size:0.65rem;color:#6b7280;">All lobbying data from the Commissioner of Lobbying. All contributions from Elections Canada.</p>';
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
