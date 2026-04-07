/**
 * TENET5 — "Read Next" Navigation v1.0
 *
 * Adds a guided "What to read next" section at the bottom of investigation pages.
 * The investigation has a logical flow: understand the problem → see the evidence →
 * follow the money → take action. This component guides visitors through that flow.
 *
 * Place <div id="read-next"></div> in pages that should show navigation.
 * If no element exists, the script does nothing.
 */
(function() {
  'use strict';

  // Investigation flow — each page knows what comes next
  var FLOW = {
    'index.html': {
      current: 'The Numbers',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '21 patterns from 7M government records' },
        { href: 'arms-pipeline.html', label: 'The Arms Pipeline', desc: '$210M+ flowing to Israel despite the "pause"' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 confirmed records of government misconduct' },
      ]
    },
    'findings.html': {
      current: 'Cross-Reference Findings',
      next: [
        { href: 'arms-pipeline.html', label: 'The Arms Pipeline', desc: 'See where the weapons money goes' },
        { href: 'charity-pipeline.html', label: 'Charity Pipeline', desc: '$276M from Canadian charities to Israel' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search 6.8M records yourself' },
      ]
    },
    'arms-pipeline.html': {
      current: 'Arms Pipeline',
      next: [
        { href: 'charity-pipeline.html', label: 'Charity Pipeline', desc: '7 CRA revocations, $276M annual flow' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP' },
        { href: 'findings.html', label: 'All 21 Findings', desc: 'The complete cross-reference analysis' },
      ]
    },
    'charity-pipeline.html': {
      current: 'Charity Pipeline',
      next: [
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'How lobbying translates to policy' },
        { href: 'arms-pipeline.html', label: 'Arms Pipeline', desc: 'The weapons side of the equation' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of who did what' },
      ]
    },
    'foreign-influence.html': {
      current: 'Foreign Influence',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'See all the patterns we found' },
        { href: 'voting-records.html', label: 'Voting Records', desc: 'How every party voted on every bill' },
        { href: 'liril.html', label: 'Meet LIRIL', desc: 'The AI that found all of this' },
      ]
    },
    'accountability.html': {
      current: 'The 504 Database',
      next: [
        { href: 'corruption-map.html', label: 'Corruption Map', desc: 'Documented procurement failures' },
        { href: 'procurement-analysis.html', label: 'Procurement Analysis', desc: '$191B in documented waste' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'What the data reveals' },
      ]
    },
    'osint-dashboard.html': {
      current: 'OSINT Dashboard',
      next: [
        { href: 'dossier-viewer.html', label: 'Intelligence Dossiers', desc: '12 profiles on persons of interest' },
        { href: 'network-analysis.html', label: 'Network Analysis', desc: '94 nodes, 169 connections mapped' },
        { href: 'findings.html', label: 'All 21 Findings', desc: 'What LIRIL found in the data' },
      ]
    },
    'my-story.html': {
      current: 'My Story',
      next: [
        { href: 'index.html', label: 'The Evidence', desc: '76,475 deaths — the numbers that prove it' },
        { href: 'cfnis.html', label: 'CFNIS Investigation', desc: 'Military police accountability' },
        { href: 'about.html', label: 'About & Methodology', desc: 'How the data was collected' },
      ]
    },
    'about.html': {
      current: 'About & Methodology',
      next: [
        { href: 'index.html', label: 'The Evidence', desc: 'Start with the numbers' },
        { href: 'liril.html', label: 'Meet LIRIL', desc: 'The AI behind the analysis' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '21 investigation panels' },
      ]
    },
    'liril.html': {
      current: 'Meet LIRIL',
      next: [
        { href: 'findings.html', label: 'What She Found', desc: '21 panels from 7M records' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search the data yourself' },
        { href: 'about.html', label: 'About & Methodology', desc: 'How it all works' },
      ]
    },
    'cfnis.html': {
      current: 'CFNIS Investigation',
      next: [
        { href: 'lawsuit-ppcli.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
        { href: 'my-story.html', label: 'My Story', desc: 'Six years of institutional retaliation' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
      ]
    },
    'voting-records.html': {
      current: 'Voting Records',
      next: [
        { href: 'hansard-dashboard.html', label: 'Hansard Dashboard', desc: '151 bills tracked in Parliament' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'What the voting patterns reveal' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'How lobbying connects to votes' },
      ]
    },
    'dossier-viewer.html': {
      current: 'Intelligence Dossiers',
      next: [
        { href: 'network-analysis.html', label: 'Network Analysis', desc: '94 nodes, 169 connections' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'The full influence investigation' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search the source data' },
      ]
    },
    'corruption-map.html': {
      current: 'Corruption Map',
      next: [
        { href: 'procurement-analysis.html', label: 'Procurement Analysis', desc: '$191B in documented waste' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of who did what' },
        { href: 'findings.html', label: 'All 21 Findings', desc: 'Cross-reference analysis' },
      ]
    },
    'procurement-analysis.html': {
      current: 'Procurement Analysis',
      next: [
        { href: 'corruption-map.html', label: 'Corruption Map', desc: '37 documented scandals' },
        { href: 'arms-pipeline.html', label: 'Arms Pipeline', desc: '$210M+ to Israel despite pause' },
        { href: 'findings.html', label: 'All 21 Findings', desc: 'What the data reveals' },
      ]
    },
    'mp-scorecard.html': {
      current: 'MP Scorecard',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '21 patterns from 7M records' },
        { href: 'voting-records.html', label: 'Voting Records', desc: 'How every party voted' },
        { href: 'legal.html', label: 'Legal Framework + Magnitsky', desc: 'Freeze their assets' },
      ]
    },
  };

  function getCurrentPage() {
    var path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
  }

  function build() {
    var el = document.getElementById('read-next');
    if (!el) return;

    var page = getCurrentPage();
    var flow = FLOW[page];
    if (!flow) return;

    var html = '<div style="max-width:var(--max-data);margin:0 auto;padding:var(--s-xl) var(--s-md);border-top:2px solid var(--border);">';
    html += '<h3 style="font-family:var(--font-headline);font-size:var(--text-2xl);color:var(--text-primary);margin-bottom:var(--s-md);text-align:center;">What to Read Next</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:var(--s-sm);">';

    flow.next.forEach(function(item) {
      html += '<a href="' + item.href + '" style="display:block;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--s-md);text-decoration:none;transition:all 0.2s ease;"';
      html += ' onmouseover="this.style.borderColor=\'var(--accent)\';this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'var(--shadow-md)\'"';
      html += ' onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'none\';this.style.boxShadow=\'none\'">';
      html += '<div style="font-weight:700;color:var(--text-primary);font-size:var(--text-base);margin-bottom:4px;">' + item.label + ' &rarr;</div>';
      html += '<div style="color:var(--text-tertiary);font-size:var(--text-sm);line-height:1.5;">' + item.desc + '</div>';
      html += '</a>';
    });

    html += '</div></div>';
    el.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
