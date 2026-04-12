/* ═══════════════════════════════════════════════════════════════════════
   TENET⁵ Presentation Engine v2 — Full-Site Continuous Investigation Flow

   Auto-detects section boundaries across ALL page structures, wraps them
   into full-viewport slides with scroll-snap, dot indicators, keyboard nav,
   sprite animations, and continuous cross-page flow through 120+ pages.

   Features:
   - Broad slide detection for every page layout variant on the site
   - Dot navigation + progress bar + keyboard/touch nav
   - PAGE_SEQUENCE: curated 120-page investigation reading order
   - Continue slide at end of each page with countdown auto-advance
   - Page position indicator showing progress through full investigation
   - Cross-page left/right keyboard navigation via postMessage
   - Sprite animation system for data visualization overlays

   Loaded via shell.js inside iframe context.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__TENET5_PRESENTATION_LOADED) return;
  window.__TENET5_PRESENTATION_LOADED = true;

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 0: PAGE_SEQUENCE — Curated investigation reading order
     ═══════════════════════════════════════════════════════════════════ */

  var PAGE_SEQUENCE = [
    // ── OPENING ──
    'home.html',

    // ── THE INVESTIGATION ──
    'findings.html',
    'evidence-index.html',
    'evidence.html',
    'convergence-matrix.html',
    'conspiracy-board.html',
    'timeline.html',

    // ── MAID & GENOCIDE ──
    'maid-accountability.html',
    'maid-policy-evolution.html',
    'maid-voting-record.html',
    'maid-exterminators.html',
    'disability-genocide.html',
    'genocide-evidence.html',
    'cija-maid-pipeline.html',
    't4-comparison.html',

    // ── MILITARY & VETERANS ──
    'veterans.html',
    'veterans-betrayal.html',
    'ppcli-lawsuit.html',
    'caf-recruitment.html',
    'caf-recruitment-crisis.html',
    'dnd-procurement.html',
    'arms-pipeline.html',
    'arms-exports.html',
    's504-covey-bae.html',
    'the-boot.html',
    'bloggins.html',

    // ── RCMP & LAW ENFORCEMENT ──
    'rcmp-commissioners.html',
    'rcmp-complicity.html',
    'rcmp-maid-accountability.html',
    'rcmp-reform.html',
    'cfnis.html',
    'cfnis-proxy.html',
    'charges-sheet.html',
    'criminal-code-analysis.html',
    'mp-brief.html',

    // ── GOVERNMENT CORRUPTION ──
    'accountability.html',
    'scandals.html',
    'corruption-map.html',
    'crown-corporations.html',
    'senate-expenses.html',
    'procurement-analysis.html',
    'procurement-deep-dive.html',
    'procurement-registry.html',
    'phoenix-pay.html',
    'debt-fiscal.html',
    'ag-findings.html',

    // ── DEMOCRACY & ELECTIONS ──
    'elections-finance.html',
    'voting-records.html',
    'mp-voting-records.html',
    'mp-scorecard.html',
    'mp-analysis.html',
    'appointments.html',
    'judicial-appointments.html',

    // ── FOREIGN INFLUENCE ──
    'foreign-interference.html',
    'foreign-interference-deep.html',
    'foreign-influence.html',
    'influence-target-alpha.html',
    'wef-davos.html',
    'treason-trajectory.html',
    '5gw-subversion.html',

    // ── LOBBYING & SPECIAL INTERESTS ──
    'lobbying-tracker.html',
    'lobbying-deepdive.html',
    'sector-lobbying.html',
    'cija-lobbying.html',
    'contributions-tracker.html',
    'charity-pipeline.html',
    'carney-conflicts.html',

    // ── SOCIAL CRISIS ──
    'healthcare-crisis.html',
    'housing-crisis.html',
    'opioid-crisis.html',
    'immigration-policy.html',
    'telecom-oligopoly.html',
    'infrastructure-deficit.html',
    'privacy-surveillance.html',
    'tfw-abuse.html',
    'media-concentration.html',
    'environment-climate.html',
    'cra-enforcement.html',

    // ── INTERNATIONAL CONNECTIONS ──
    'epstein-canadian-connections.html',
    'epstein-maxwell.html',

    // ── COVID & ARRIVECAN ──
    'covid-accountability.html',
    'arrivecan.html',

    // ── WHISTLEBLOWERS ──
    'whistleblower-failures.html',
    'whistleblower-guide.html',

    // ── PROVINCIAL & MUNICIPAL ──
    'provincial-analysis.html',
    'municipal-accountability.html',
    'municipal-intelligence.html',
    'indigenous-accountability.html',
    'belleville.html',
    'quinte-west.html',
    'ottawa.html',
    'toronto.html',
    'calgary.html',
    'vancouver.html',

    // ── AI & RESEARCH ──
    'ai-research.html',
    'liril-analysis.html',
    'acelephius-report.html',
    'acelephius-wardoll.html',

    // ── TOOLS & REFERENCE ──
    'hansard-dashboard.html',
    'hansard-evidence.html',
    'network-analysis.html',
    'osint-dashboard.html',
    'entity-viewer.html',
    'dossier-viewer.html',
    'harm-index.html',
    'cross-reference.html',
    'ledger-book.html',
    'infographics.html',
    'canada-map.html',
    'records.html',
    'search.html',

    // ── TAKE ACTION ──
    'take-action.html',
    'open-letter.html',
    'email-campaign.html',
    'email-dispatch.html',
    's504-court-filing.html',
    'campaign-generator.html',
    'campaign-tracker.html',
    'report-generator.html',
    'kids-guide.html',

    // ── ABOUT & CONTEXT ──
    'my-story.html',
    'history.html',
    'about.html',
    'faq.html',
    'news.html',
    'publications.html',
    'resources.html',
    'legal.html'
  ];

  /* Friendly titles for continue-slide display */
  var PAGE_TITLES = {
    'home.html': 'TENET5 \u2014 State Accountability Investigation',
    'findings.html': 'Cross-Reference Findings',
    'evidence-index.html': 'Evidence Index \u2014 Complete Data Catalog',
    'evidence.html': 'The Evidence \u2014 What They Said vs. What They Did',
    'convergence-matrix.html': 'Triple Threat Convergence',
    'conspiracy-board.html': 'Investigation Board',
    'timeline.html': 'Timeline \u2014 80 Years of Government Actions',
    'maid-accountability.html': 'MAID \u2014 60,167 Deaths, Zero Accountability',
    'maid-policy-evolution.html': 'How They Legislated Death',
    'maid-voting-record.html': 'MAID Voting Record \u2014 173 MPs',
    'maid-exterminators.html': 'MAID Exterminator Tracing',
    'disability-genocide.html': 'Canada\u2019s War on the Disabled',
    'genocide-evidence.html': 'Genocide Evidence \u2014 Legal Analysis',
    'cija-maid-pipeline.html': 'The CIJA-IHRA-MAID Pipeline',
    't4-comparison.html': 'How State-Sanctioned Killing Programs Expand',
    'veterans.html': 'How Canada Treats Its Veterans',
    'veterans-betrayal.html': 'Lest We Forget \u2014 Veterans Betrayed',
    'ppcli-lawsuit.html': 'PPCLI \u2014 Experimenting on Soldiers',
    'caf-recruitment.html': 'CAF Recruitment Degradation',
    'caf-recruitment-crisis.html': 'CAF Recruitment Collapse',
    'dnd-procurement.html': 'The $100 Billion Betrayal',
    'arms-pipeline.html': 'The Arms Pipeline \u2014 Canada to Israel',
    'arms-exports.html': 'Arms Exports',
    's504-covey-bae.html': 's.504 Private Prosecution \u2014 Covey & Bae',
    'the-boot.html': 'The Boot \u2014 Institutional Power Crushes Accountability',
    'bloggins.html': 'The Bloggins Files',
    'rcmp-commissioners.html': 'RCMP Commissioners \u2014 Systemic Failures',
    'rcmp-complicity.html': 'The Architecture of State Complicity',
    'rcmp-maid-accountability.html': 'RCMP & MAID \u2014 Dereliction of Duty',
    'rcmp-reform.html': 'RCMP Reform',
    'cfnis.html': 'CFNIS \u2014 Military Police Complaint Record',
    'cfnis-proxy.html': 'CFNIS Proxy Node',
    'charges-sheet.html': '271 Officials, 314 Charges',
    'criminal-code-analysis.html': 'Criminal Code & Rome Statute Analysis',
    'mp-brief.html': 'Notice to Military Police \u2014 s.504 Filing',
    'accountability.html': 'Government Accountability Database',
    'scandals.html': 'Political Scandals',
    'corruption-map.html': 'Corruption & Influence Map',
    'crown-corporations.html': 'Crown Corporations Burned Billions',
    'senate-expenses.html': 'Senate Expense Scandal',
    'procurement-analysis.html': 'Procurement Anomaly Detector',
    'procurement-deep-dive.html': '1.26M Contracts \u2014 70,270 Anomalies',
    'procurement-registry.html': 'Federal Procurement Failures',
    'phoenix-pay.html': 'Phoenix Pay \u2014 $2.2B Payroll Disaster',
    'debt-fiscal.html': '$1.2 Trillion National Debt',
    'ag-findings.html': 'Auditor General Findings 2015\u20132024',
    'elections-finance.html': 'Campaign Finance Disclosures',
    'voting-records.html': 'Parliamentary Voting Records',
    'mp-voting-records.html': 'How They Voted',
    'mp-scorecard.html': 'MP Scorecard \u2014 All 340 Members',
    'mp-analysis.html': 'MP Analysis \u2014 LIRIL Intelligence Report',
    'appointments.html': 'The Patronage Machine',
    'judicial-appointments.html': 'Judicial Appointments & Justice System',
    'foreign-interference.html': 'Foreign Interference in Democracy',
    'foreign-interference-deep.html': 'Foreign Interference Deep Dive',
    'foreign-influence.html': 'Foreign Influence \u2014 Evidence-Based',
    'influence-target-alpha.html': 'Foreign Influence Target Alpha',
    'wef-davos.html': 'WEF & Davos Connections',
    'treason-trajectory.html': 'The Trajectory of Treason',
    '5gw-subversion.html': 'The War On You \u2014 A Veteran\u2019s Warning',
    'lobbying-tracker.html': 'Who\u2019s Lobbying Canadian Politicians',
    'lobbying-deepdive.html': '359,000 Calls \u2014 How Lobbyists Bought Policy',
    'sector-lobbying.html': 'Sector Lobbying Dashboard',
    'cija-lobbying.html': 'CIJA Lobbying Pipeline',
    'contributions-tracker.html': 'Who\u2019s Funding Canadian Politics',
    'charity-pipeline.html': '$276M Charity Pipeline to Israel',
    'carney-conflicts.html': 'Carney\u2013Brookfield Conflicts',
    'healthcare-crisis.html': 'Healthcare Collapse \u2014 The Killing Fields',
    'housing-crisis.html': 'The Engineered Housing Crisis',
    'opioid-crisis.html': 'Opioid Crisis',
    'immigration-policy.html': 'Open Borders, Closed Services',
    'telecom-oligopoly.html': 'Canada\u2019s Wireless Cartel',
    'infrastructure-deficit.html': '$357 Billion Infrastructure Betrayal',
    'privacy-surveillance.html': 'Privacy & Surveillance',
    'tfw-abuse.html': 'TFW Program Abuse',
    'media-concentration.html': 'Canada\u2019s Media Concentration Crisis',
    'environment-climate.html': 'Environment & Climate Accountability',
    'cra-enforcement.html': 'Two-Tier Tax Justice',
    'epstein-canadian-connections.html': 'Canadian Political Entanglement',
    'epstein-maxwell.html': 'Epstein & Maxwell Network',
    'covid-accountability.html': 'Pandemic Profiteers \u2014 $500B, Zero Accountability',
    'arrivecan.html': 'ArriveCAN \u2014 $59.5M for a Questionnaire',
    'whistleblower-failures.html': 'Whistleblower Failures',
    'whistleblower-guide.html': 'How to Report \u2014 Whistleblower Guide',
    'provincial-analysis.html': 'Provincial Accountability \u2014 All 10 Provinces',
    'municipal-accountability.html': 'Municipal Accountability',
    'municipal-intelligence.html': 'Municipal Intelligence Hub',
    'indigenous-accountability.html': 'Indigenous Accountability',
    'belleville.html': 'Belleville \u2014 Municipal Intelligence',
    'quinte-west.html': 'Quinte West \u2014 Municipal Intelligence',
    'ottawa.html': 'Ottawa \u2014 Municipal Intelligence',
    'toronto.html': 'Toronto \u2014 Municipal Intelligence',
    'calgary.html': 'Calgary \u2014 Municipal Intelligence',
    'vancouver.html': 'Vancouver \u2014 Municipal Intelligence',
    'ai-research.html': 'Research Methodology',
    'liril-analysis.html': 'LIRIL Analysis',
    'acelephius-report.html': 'ACELEPHIUS \u2014 Palantir OSINT Nexus',
    'acelephius-wardoll.html': 'ACELEPHIUS \u2014 War Doll Intelligence',
    'hansard-dashboard.html': 'Hansard Dashboard \u2014 Parliament 45-1',
    'hansard-evidence.html': 'Hansard \u2014 Institutional Dismissal of 76,707 Deaths',
    'network-analysis.html': 'Network Analysis',
    'osint-dashboard.html': 'OSINT Intelligence Dashboard',
    'entity-viewer.html': 'Entity Profiler & Document Viewer',
    'dossier-viewer.html': 'OSINT Dossier Viewer',
    'harm-index.html': 'Policy Harm Index',
    'cross-reference.html': 'Follow the Money',
    'ledger-book.html': 'The Accountability Ledger',
    'infographics.html': 'MAID Infographics \u2014 The Math in Pictures',
    'canada-map.html': 'National Corruption Map',
    'records.html': 'Records Database',
    'search.html': 'OSINT Search',
    'take-action.html': 'What You Can Do Right Now',
    'open-letter.html': 'Open Letter to Parliament',
    'email-campaign.html': 'MP Email Campaign',
    'email-dispatch.html': 'Daily Evidence Dispatch',
    's504-court-filing.html': 's.504 Court Filing Dispatch',
    'campaign-generator.html': 'Campaign Launch Dashboard',
    'campaign-tracker.html': 'Campaign Tracker',
    'report-generator.html': 'MP Report Generator',
    'kids-guide.html': 'A Story of Accountability',
    'my-story.html': 'My Story \u2014 Daniel Perry',
    'history.html': 'Historical Patterns',
    'about.html': 'About This Project',
    'faq.html': 'FAQ \u2014 Answering the Objections',
    'news.html': 'News & Intelligence',
    'publications.html': 'Publications & Reports',
    'resources.html': 'Resources',
    'legal.html': 'The Legal Framework'
  };

  /* Section group labels for the page indicator */
  var SECTION_GROUPS = {};
  (function () {
    var groups = {
      'Opening': ['home.html'],
      'The Investigation': ['findings.html', 'evidence-index.html', 'evidence.html', 'convergence-matrix.html', 'conspiracy-board.html', 'timeline.html'],
      'MAID & Genocide': ['maid-accountability.html', 'maid-policy-evolution.html', 'maid-voting-record.html', 'maid-exterminators.html', 'disability-genocide.html', 'genocide-evidence.html', 'cija-maid-pipeline.html', 't4-comparison.html'],
      'Military & Veterans': ['veterans.html', 'veterans-betrayal.html', 'ppcli-lawsuit.html', 'caf-recruitment.html', 'caf-recruitment-crisis.html', 'dnd-procurement.html', 'arms-pipeline.html', 'arms-exports.html', 's504-covey-bae.html', 'the-boot.html', 'bloggins.html'],
      'RCMP & Law Enforcement': ['rcmp-commissioners.html', 'rcmp-complicity.html', 'rcmp-maid-accountability.html', 'rcmp-reform.html', 'cfnis.html', 'cfnis-proxy.html', 'charges-sheet.html', 'criminal-code-analysis.html', 'mp-brief.html'],
      'Government Corruption': ['accountability.html', 'scandals.html', 'corruption-map.html', 'crown-corporations.html', 'senate-expenses.html', 'procurement-analysis.html', 'procurement-deep-dive.html', 'procurement-registry.html', 'phoenix-pay.html', 'debt-fiscal.html', 'ag-findings.html'],
      'Democracy & Elections': ['elections-finance.html', 'voting-records.html', 'mp-voting-records.html', 'mp-scorecard.html', 'mp-analysis.html', 'appointments.html', 'judicial-appointments.html'],
      'Foreign Influence': ['foreign-interference.html', 'foreign-interference-deep.html', 'foreign-influence.html', 'influence-target-alpha.html', 'wef-davos.html', 'treason-trajectory.html', '5gw-subversion.html'],
      'Lobbying & Special Interests': ['lobbying-tracker.html', 'lobbying-deepdive.html', 'sector-lobbying.html', 'cija-lobbying.html', 'contributions-tracker.html', 'charity-pipeline.html', 'carney-conflicts.html'],
      'Social Crisis': ['healthcare-crisis.html', 'housing-crisis.html', 'opioid-crisis.html', 'immigration-policy.html', 'telecom-oligopoly.html', 'infrastructure-deficit.html', 'privacy-surveillance.html', 'tfw-abuse.html', 'media-concentration.html', 'environment-climate.html', 'cra-enforcement.html'],
      'International Connections': ['epstein-canadian-connections.html', 'epstein-maxwell.html'],
      'COVID & ArriveCan': ['covid-accountability.html', 'arrivecan.html'],
      'Whistleblowers': ['whistleblower-failures.html', 'whistleblower-guide.html'],
      'Provincial & Municipal': ['provincial-analysis.html', 'municipal-accountability.html', 'municipal-intelligence.html', 'indigenous-accountability.html', 'belleville.html', 'quinte-west.html', 'ottawa.html', 'toronto.html', 'calgary.html', 'vancouver.html'],
      'AI & Research': ['ai-research.html', 'liril-analysis.html', 'acelephius-report.html', 'acelephius-wardoll.html'],
      'Tools & Reference': ['hansard-dashboard.html', 'hansard-evidence.html', 'network-analysis.html', 'osint-dashboard.html', 'entity-viewer.html', 'dossier-viewer.html', 'harm-index.html', 'cross-reference.html', 'ledger-book.html', 'infographics.html', 'canada-map.html', 'records.html', 'search.html'],
      'Take Action': ['take-action.html', 'open-letter.html', 'email-campaign.html', 'email-dispatch.html', 's504-court-filing.html', 'campaign-generator.html', 'campaign-tracker.html', 'report-generator.html', 'kids-guide.html'],
      'About & Context': ['my-story.html', 'history.html', 'about.html', 'faq.html', 'news.html', 'publications.html', 'resources.html', 'legal.html']
    };
    Object.keys(groups).forEach(function (g) {
      groups[g].forEach(function (p) { SECTION_GROUPS[p] = g; });
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 1: Auto-detect slide boundaries
     ═══════════════════════════════════════════════════════════════════ */

  var SLIDE_SELECTORS = [
    // ── Heroes (all variants) ──
    '.tl-hero', '.page-hero', '.stat-hero-banner', '.hero',
    '.bloggins-hero', '.cca-hero', '.cm-hero', '.conv-hero',
    '.cra-hero', '.crown-hero', '.debt-hero', '.ge-hero',
    '.imm-hero', '.infra-hero', '.news-hero', '.pattern-hero',
    '.pdd-hero', '.prov-hero', '.records-hero', '.ta-hero', '.vr-hero',

    // ── Narrative / Content blocks ──
    '.narrative-intro', '.credibility-card', '.case-card', '.person-card', '.country-card',

    // ── Financial & accountability ──
    '.purchase-callout', '.record', '.crpd-card', '.crpd-cards',

    // ── Timelines (all variants) ──
    '.tl-timeline', '.timeline', '.timeline-v4', '.timeline-entry', '.un-timeline',
    '.dnd-timeline', '.fi-timeline', '.ja-timeline',
    '.ph-timeline', '.se-timeline', '.vb-timeline',
    '.law-timeline', '.layoff-timeline',
    '.backlog-timeline', '.policy-timeline',

    // ── Named sections (all variants) ──
    '.timeline-section', '.hero-section',
    '.dnd-section', '.cc-section', '.cg-section', '.ge-section',
    '.ph-section', '.se-section', '.ta-section', '.war-section',
    '.charge-section', '.corp-section', '.data-section',
    '.entity-section', '.networks-section', '.pattern-section',
    '.pie-section', '.venn-section', '.section-block',

    // ── Stat grids & data panels ──
    '.inv-stat-grid', '.tl-quicknav', '.mpa-stats',
    '.dash-grid',
    '.media-grid', '.cat-grid', '.category-grid',
    '.breakdown-grid', '.budget-grid', '.bill-cards',
    '.cc-cards', '.cc-grid',

    // ── Evidence & findings ──
    '.evidence-box', '.finding-card', '.verdict-box', '.finding-box',
    '.alert-card', '.anomaly-card',

    // ── Military & institutional analysis ──
    '.institutional-timeline', '.policy-comparison',

    // ── Section headings (structural dividers) ──
    '.section-head',

    // ── Any narrated element ──
    '[data-narration]', '[data-narrate]',

    // ── Generic sections (fallback) ──
    'section'
  ];

  var COMPACT_SELECTORS = [
    '.source-cite',
    '.tnt-style-356',
    '.skip-link',
    '#site-header-frame',
    '.section-divider',
    '.section-nav',
    '.deep-section-label'
  ];

  function isCompact(el) {
    for (var i = 0; i < COMPACT_SELECTORS.length; i++) {
      if (el.matches && el.matches(COMPACT_SELECTORS[i])) return true;
    }
    if (el.textContent && el.textContent.trim().length < 60 &&
        !el.querySelector('img, svg, table, canvas')) return true;
    return false;
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 2: Slide wrapping engine
     ═══════════════════════════════════════════════════════════════════ */

  function detectSlides() {
    var slides = [];
    var seen = new Set();

    var allSel = SLIDE_SELECTORS.join(',');
    var candidates = document.querySelectorAll(allSel);

    candidates.forEach(function (el) {
      if (seen.has(el)) return;
      var dominated = false;
      seen.forEach(function (s) {
        if (s.contains(el) && s !== el) dominated = true;
      });
      if (dominated) return;
      seen.add(el);
      slides.push(el);
    });

    // Fallback: top-level children of .content or body
    if (slides.length < 2) {
      var container = document.querySelector('.content') || document.body;
      var children = container.children;
      slides = [];
      for (var i = 0; i < children.length; i++) {
        var ch = children[i];
        if (ch.id === 'site-header-frame' ||
            ch.id === 'site-footer-frame' ||
            ch.tagName === 'SCRIPT' ||
            ch.tagName === 'LINK' ||
            ch.tagName === 'STYLE') continue;
        if (ch.textContent && ch.textContent.trim().length < 20 &&
            !ch.querySelector('img, svg, table')) continue;
        slides.push(ch);
      }
    }

    return slides;
  }

  function wrapSlides(elements) {
    var slides = [];

    elements.forEach(function (el, idx) {
      if (el.classList.contains('pres-slide')) {
        slides.push(el);
        return;
      }

      var compact = isCompact(el);
      el.classList.add('pres-slide');
      if (compact) el.classList.add('pres-slide--compact');
      el.setAttribute('data-slide-num', 'SLIDE ' + (idx + 1) + ' / ' + elements.length);
      el.setAttribute('data-slide-idx', idx);
      slides.push(el);
    });

    return slides;
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 3: Slide label extractor (for dot nav)
     ═══════════════════════════════════════════════════════════════════ */

  function getSlideLabel(el) {
    // Priority 1: Explicit data-narrate attribute (first 50 chars)
    var narr = el.getAttribute('data-narrate');
    if (narr) {
      var text = narr.trim();
      return text.length > 50 ? text.substring(0, 50) + '\u2026' : text;
    }
    
    // Priority 2: Legacy data-narration attribute
    narr = el.getAttribute('data-narration');
    if (narr) return narr.charAt(0).toUpperCase() + narr.slice(1);
    
    // Priority 3: Heading text
    var h = el.querySelector('h1, h2, h3, h4');
    if (h) {
      var text = h.textContent.trim();
      return text.length > 40 ? text.substring(0, 40) + '\u2026' : text;
    }
    
    // Priority 4: data-chapter or class-based hints
    var chapter = el.getAttribute('data-chapter');
    if (chapter) return chapter;
    
    if (el.classList.contains('stat-hero-banner')) return 'Key Statistics';
    if (el.classList.contains('inv-stat-grid')) return 'Statistics';
    if (el.classList.contains('media-grid')) return 'Evidence Grid';
    if (el.classList.contains('tl-quicknav')) return 'Navigation';
    if (el.classList.contains('credibility-card')) return 'Investigator';
    if (el.classList.contains('purchase-callout')) return 'Financial Analysis';
    if (el.classList.contains('crpd-cards')) return 'CRPD Framework';
    if (el.className && el.className.match && el.className.match(/hero/i)) return 'Overview';
    if (el.className && el.className.match && el.className.match(/timeline/i)) return 'Timeline';
    if (el.className && el.className.match && el.className.match(/stat/i)) return 'Statistics';
    if (el.className && el.className.match && el.className.match(/card/i)) return 'Evidence';
    
    return 'Slide ' + ((parseInt(el.getAttribute('data-slide-idx'), 10) || 0) + 1);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4: Dot indicator rail
     ═══════════════════════════════════════════════════════════════════ */

  function buildIndicator(slides) {
    var rail = document.createElement('div');
    rail.className = 'pres-indicator';

    slides.forEach(function (sl, i) {
      if (sl.classList.contains('pres-slide--compact')) return;
      var dot = document.createElement('div');
      dot.className = 'pres-dot';
      dot.setAttribute('data-label', getSlideLabel(sl));
      dot.setAttribute('data-idx', i);
      dot.addEventListener('click', function () {
        sl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      rail.appendChild(dot);
    });

    document.body.appendChild(rail);

    var progress = document.createElement('div');
    progress.className = 'pres-progress';
    document.body.appendChild(progress);

    var hint = document.createElement('div');
    hint.className = 'pres-keyhint';
    hint.textContent = '\u2191\u2193 arrows \u00b7 space \u00b7 \u2190\u2192 page \u00b7 N narrate \u00b7 ? help';
    document.body.appendChild(hint);
    setTimeout(function () { hint.classList.add('pres-keyhint-fade'); }, 6000);

    return { rail: rail, progress: progress, dots: rail.querySelectorAll('.pres-dot') };
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 5: Scroll observation + active slide tracking
     ═══════════════════════════════════════════════════════════════════ */

  function observeSlides(slides, ui, onActiveChange) {
    var activeIdx = 0;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var idx = parseInt(entry.target.getAttribute('data-slide-idx'), 10);

        if (entry.isIntersecting) {
          entry.target.classList.add('pres-visible');
          triggerSprites(entry.target);
        }

        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          activeIdx = idx;
          updateIndicator(ui, slides, idx);
          if (typeof onActiveChange === 'function') onActiveChange(idx);
        }
      });
    }, {
      threshold: [0.1, 0.3, 0.5],
      rootMargin: '-5% 0px -5% 0px'
    });

    slides.forEach(function (sl) { observer.observe(sl); });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
          ui.progress.style.width = pct + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    return { getActive: function () { return activeIdx; } };
  }

  function updateIndicator(ui, slides, activeIdx) {
    ui.dots.forEach(function (dot) {
      var dotIdx = parseInt(dot.getAttribute('data-idx'), 10);
      dot.classList.toggle('pres-dot-active', dotIdx === activeIdx);
    });
    ui.rail.classList.add('pres-indicator-visible');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 6: Keyboard + touch navigation
     ═══════════════════════════════════════════════════════════════════ */

  function initKeyboardNav(slides, tracker) {
    // Add keyboard help modal
    function showKeyboardHelp() {
      var modal = document.createElement('div');
      modal.className = 'pres-keyboard-help';
      modal.innerHTML = '<div class="pres-keyboard-help-inner">' +
        '<h3>Navigation Shortcuts</h3>' +
        '<div class="pres-keyboard-shortcuts">' +
        '<p><kbd>↑</kbd> <kbd>↓</kbd> — Step through slides</p>' +
        '<p><kbd>Space</kbd> — Next slide</p>' +
        '<p><kbd>←</kbd> <kbd>→</kbd> — Previous/Next page</p>' +
        '<p><kbd>Home</kbd> / <kbd>End</kbd> — First/Last slide</p>' +
        '<p><kbd>N</kbd> — Narrate current slide (LIRIL)</p>' +
        '<p><kbd>Esc</kbd> — Stop narration</p>' +
        '<p><kbd>?</kbd> — Show this help</p>' +
        '</div>' +
        '<button onclick="this.closest(\'.pres-keyboard-help\').remove()">Close</button>' +
        '</div>';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
      modal.querySelector('.pres-keyboard-help-inner').style.cssText = 'background:#0a0e1a;color:#e8e4dc;padding:2rem;border-radius:8px;border:1px solid #333;max-width:400px;';
      document.body.appendChild(modal);
      modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
      });
    }

    document.addEventListener('keydown', function (e) {
      var cur = tracker.getActive();
      var target = null;

      if (e.key === '?') {
        e.preventDefault();
        showKeyboardHelp();
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (window.__TENET5_LIRIL_NARRATE) window.__TENET5_LIRIL_NARRATE();
        return;
      }

      if (e.key === 'Escape') {
        if (window.__TENET5_LIRIL_STOP) window.__TENET5_LIRIL_STOP();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (cur >= slides.length - 1) {
          // At last slide — advance to next page
          navigatePage(1);
          return;
        }
        target = slides[Math.min(cur + 1, slides.length - 1)];
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (cur <= 0) {
          navigatePage(-1);
          return;
        }
        target = slides[Math.max(cur - 1, 0)];
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigatePage(1);
        return;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePage(-1);
        return;
      } else if (e.key === 'Home') {
        e.preventDefault();
        target = slides[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        target = slides[slides.length - 1];
      }

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 7: SPRITE ANIMATION ENGINE
     ═══════════════════════════════════════════════════════════════════ */

  function triggerSprites(slideEl) {
    if (slideEl.dataset.spriteTriggered) return;
    slideEl.dataset.spriteTriggered = 'true';

    var type = detectSpriteType(slideEl);
    if (!type) return;

    var container = document.createElement('div');
    container.className = 'pres-sprite';
    slideEl.insertBefore(container, slideEl.firstChild);

    switch (type) {
      case 'death':    spawnDeathRain(container); break;
      case 'money':    spawnMoneyFlow(container); break;
      case 'network':  spawnNetwork(container); break;
      case 'bars':     spawnBars(container, slideEl); break;
      case 'danger':   spawnDanger(container); break;
      case 'scan':     spawnScan(container); break;
    }
  }

  function detectSpriteType(el) {
    var explicit = el.getAttribute('data-sprite');
    if (explicit) return explicit;

    var text = (el.textContent || '').toLowerCase();
    var hasTable = el.querySelector('table');
    var hasStats = el.querySelector('.inv-stat-grid, .inv-stat, .stat-hero-item, [class*="stat-grid"], [class*="stat-card"]');

    if (/\b(death|killed|maid|dead|die[ds]?|76.?475|60.?167|15.?343|16.?265|genocide|exterminator)\b/.test(text)) {
      return 'death';
    }
    if (/\b(\$|billion|million|1\.2b|donation|lobbying|money|finance|contract|procurement|budget)\b/.test(text)) {
      return 'money';
    }
    if (/\b(connection|network|lobby|contact|350.?000|pipeline|entity|cija|influence|foreign)\b/.test(text)) {
      return 'network';
    }
    if (hasTable || hasStats) {
      return 'bars';
    }
    if (/\b(finding|warning|concern|oversight|gap|failure|misconduct|tampering|scandal|corruption)\b/.test(text)) {
      return 'danger';
    }
    if (/\b(evidence|investigation|cross-reference|source|data|record|database|osint|intelligence)\b/.test(text)) {
      return 'scan';
    }
    return null;
  }

  function spawnDeathRain(container) {
    container.classList.add('sprite-death-rain');
    for (var i = 0; i < 30; i++) {
      var drop = document.createElement('div');
      drop.className = 'spr-drop';
      drop.style.left = (Math.random() * 100) + '%';
      drop.style.animationDuration = (3 + Math.random() * 5) + 's';
      drop.style.animationDelay = (Math.random() * 4) + 's';
      drop.style.width = (2 + Math.random() * 3) + 'px';
      drop.style.height = drop.style.width;
      container.appendChild(drop);
    }
  }

  function spawnMoneyFlow(container) {
    container.classList.add('sprite-money-flow');
    for (var i = 0; i < 20; i++) {
      var coin = document.createElement('div');
      coin.className = 'spr-coin';
      coin.style.top = (10 + Math.random() * 80) + '%';
      coin.style.left = '-20px';
      coin.style.animationDuration = (4 + Math.random() * 6) + 's';
      coin.style.animationDelay = (Math.random() * 5) + 's';
      coin.style.width = (4 + Math.random() * 5) + 'px';
      coin.style.height = coin.style.width;
      container.appendChild(coin);
    }
  }

  function spawnNetwork(container) {
    container.classList.add('sprite-network');
    for (var i = 0; i < 5; i++) {
      var ring = document.createElement('div');
      ring.className = 'spr-ring';
      ring.style.left = (15 + Math.random() * 70) + '%';
      ring.style.top = (15 + Math.random() * 70) + '%';
      ring.style.animationDelay = (i * 0.8) + 's';
      container.appendChild(ring);
    }
    for (var j = 0; j < 8; j++) {
      var line = document.createElement('div');
      line.className = 'spr-line';
      line.style.top = (10 + Math.random() * 80) + '%';
      line.style.left = (Math.random() * 40) + '%';
      line.style.width = (20 + Math.random() * 40) + '%';
      line.style.transform = 'rotate(' + (-15 + Math.random() * 30) + 'deg)';
      line.style.animationDelay = (0.5 + j * 0.3) + 's';
      container.appendChild(line);
    }
  }

  function spawnBars(container, slideEl) {
    container.classList.add('sprite-bars');
    var rows = slideEl.querySelectorAll('tr, .inv-stat, .stat-hero-item, [class*="stat-card"]');
    var count = Math.min(Math.max(rows.length || 6, 4), 12);
    var colors = ['#dc2626', '#c9a84c', '#3b82f6', '#a855f7', '#22c55e', '#f97316'];

    for (var i = 0; i < count; i++) {
      var bar = document.createElement('div');
      bar.className = 'spr-bar';
      bar.style.height = (15 + Math.random() * 60) + '%';
      bar.style.background = colors[i % colors.length];
      bar.style.animationDelay = (i * 0.1) + 's';
      container.appendChild(bar);
    }
  }

  function spawnDanger(container) {
    container.classList.add('sprite-danger');
    for (var i = 0; i < 3; i++) {
      var pulse = document.createElement('div');
      pulse.className = 'spr-pulse';
      pulse.style.left = (20 + Math.random() * 60) + '%';
      pulse.style.top = (20 + Math.random() * 60) + '%';
      pulse.style.animationDelay = (i * 0.8) + 's';
      container.appendChild(pulse);
    }
  }

  function spawnScan(container) {
    container.classList.add('sprite-scan');
    var line = document.createElement('div');
    line.className = 'spr-scanline';
    container.appendChild(line);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 8: Load CSS dependency
     ═══════════════════════════════════════════════════════════════════ */

  function loadCSS(href) {
    if (document.querySelector('link[href*="' + href.split('?')[0] + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 9: Cross-page navigation helpers
     ═══════════════════════════════════════════════════════════════════ */

  function getCurrentPage() {
    var path = window.location.pathname.split('/').pop() || 'home.html';
    if (!path || path === '' || path === '/') path = 'home.html';
    return path;
  }

  function getPageIndex(page) {
    for (var i = 0; i < PAGE_SEQUENCE.length; i++) {
      if (PAGE_SEQUENCE[i] === page) return i;
    }
    return -1;
  }

  function navigatePage(direction) {
    var current = getCurrentPage();
    var idx = getPageIndex(current);
    if (idx === -1) return;

    var nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= PAGE_SEQUENCE.length) return;

    var nextPage = PAGE_SEQUENCE[nextIdx];

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'pres-navigate',
        page: nextPage
      }, '*');
    } else {
      window.location.href = nextPage;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 10: Continue slide — auto-advance at end of each page
     ═══════════════════════════════════════════════════════════════════ */

  function escHTML(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function buildContinueSlide() {
    var current = getCurrentPage();
    var idx = getPageIndex(current);
    if (idx === -1 || idx >= PAGE_SEQUENCE.length - 1) return null;

    var nextPage = PAGE_SEQUENCE[idx + 1];
    var nextTitle = PAGE_TITLES[nextPage] || nextPage.replace('.html', '').replace(/-/g, ' ');
    var nextGroup = SECTION_GROUPS[nextPage] || '';
    var currentGroup = SECTION_GROUPS[current] || '';
    var isNewSection = nextGroup !== currentGroup;

    var slide = document.createElement('div');
    slide.className = 'pres-slide pres-continue-slide';
    slide.setAttribute('data-slide-idx', '999');
    slide.setAttribute('data-slide-num', 'CONTINUE');

    slide.innerHTML =
      '<div class="pres-continue-inner">' +
        (isNewSection
          ? '<div class="pres-continue-section-tag">ENTERING: ' + escHTML(nextGroup.toUpperCase()) + '</div>'
          : '') +
        '<div class="pres-continue-eyebrow">UP NEXT</div>' +
        '<div class="pres-continue-title">' + escHTML(nextTitle) + '</div>' +
        '<div class="pres-continue-meta">' +
          '<span class="pres-continue-pos">' + (idx + 2) + ' / ' + PAGE_SEQUENCE.length + '</span>' +
        '</div>' +
        '<div class="pres-continue-progress-track">' +
          '<div class="pres-continue-progress-fill"></div>' +
        '</div>' +
        '<button class="pres-continue-btn">Continue \u2192</button>' +
        '<div class="pres-continue-hint">Auto-advancing in <span class="pres-countdown">8</span>s \u00b7 Press any key to skip</div>' +
      '</div>';

    document.body.appendChild(slide);

    var btn = slide.querySelector('.pres-continue-btn');
    btn.addEventListener('click', function () {
      clearCountdown();
      navigatePage(1);
    });

    return slide;
  }

  var countdownTimer = null;
  var countdownVal = 8;

  function startCountdown(slide) {
    if (!slide) return;
    countdownVal = 8;
    var fill = slide.querySelector('.pres-continue-progress-fill');
    var num = slide.querySelector('.pres-countdown');

    if (fill) {
      fill.style.transition = 'width 8s linear';
      fill.style.width = '100%';
    }

    countdownTimer = setInterval(function () {
      countdownVal--;
      if (num) num.textContent = countdownVal;
      if (countdownVal <= 0) {
        clearCountdown();
        navigatePage(1);
      }
    }, 1000);
  }

  function clearCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 11: Page position indicator
     ═══════════════════════════════════════════════════════════════════ */

  function buildPageIndicator() {
    var current = getCurrentPage();
    var idx = getPageIndex(current);
    if (idx === -1) return;

    var group = SECTION_GROUPS[current] || '';

    var indicator = document.createElement('div');
    indicator.className = 'pres-page-indicator';
    indicator.innerHTML =
      '<button class="pres-page-nav pres-page-prev" title="Previous page">\u2190</button>' +
      '<button class="pres-page-nav pres-page-narrate" title="Narrate current slide">N</button>' +
      '<span class="pres-page-info">' +
        '<strong>' + (idx + 1) + '/' + PAGE_SEQUENCE.length + '</strong>' +
        ' \u00b7 ' + escHTML(group) +
      '</span>' +
      '<button class="pres-page-nav pres-page-next" title="Next page">\u2192</button>';

    document.body.appendChild(indicator);

    indicator.querySelector('.pres-page-prev').addEventListener('click', function () {
      navigatePage(-1);
    });
    indicator.querySelector('.pres-page-next').addEventListener('click', function () {
      navigatePage(1);
    });

    if (idx <= 0) indicator.querySelector('.pres-page-prev').disabled = true;
    if (idx >= PAGE_SEQUENCE.length - 1) indicator.querySelector('.pres-page-next').disabled = true;

    return indicator;
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 12: LIRIL narration controls
     ═══════════════════════════════════════════════════════════════════ */

  var lirilNarration = {
    button: null,
    speaking: false,
    activeSlide: null,
    keepaliveTimer: null,
    token: 0
  };
  var narrationIndexByPage = null;
  var narrationIndexPromise = null;

  function loadNarrationIndex() {
    if (narrationIndexByPage) return Promise.resolve(narrationIndexByPage);
    if (narrationIndexPromise) return narrationIndexPromise;

    narrationIndexPromise = fetch('data/narration_index.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('narration index unavailable');
        return r.json();
      })
      .then(function (payload) {
        var map = {};
        var list = payload && payload.narrations ? payload.narrations : [];
        list.forEach(function (item) {
          if (!item || !item.page) return;
          if (!map[item.page]) map[item.page] = [];
          map[item.page].push(cleanNarrationText(item.narration || ''));
        });
        narrationIndexByPage = map;
        return map;
      })
      .catch(function () {
        narrationIndexByPage = {};
        return narrationIndexByPage;
      });

    return narrationIndexPromise;
  }

  function cleanNarrationText(text) {
    if (!text) return '';
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, ' - ')
      .replace(/&ndash;/g, ' - ');
    return text
      .replace(/\s+/g, ' ')
      .replace(/^[\s.,;:!?\-]+/, '')
      .trim();
  }

  function splitNarrationChunks(text) {
    if (!text) return [];
    if (text.length <= 180) return [text];

    var sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
    var chunks = [];
    var current = '';

    sentences.forEach(function (s) {
      s = s.trim();
      if (!s) return;

      if (current.length + s.length + 1 <= 180) {
        current += (current ? ' ' : '') + s;
        return;
      }

      if (current) chunks.push(current);

      if (s.length <= 180) {
        current = s;
        return;
      }

      var parts = s.split(/,\s*/);
      var sub = '';
      parts.forEach(function (p) {
        if (sub.length + p.length + 2 <= 180) {
          sub += (sub ? ', ' : '') + p;
        } else {
          if (sub) chunks.push(sub);
          sub = p;
        }
      });
      if (sub) chunks.push(sub);
      current = '';
    });

    if (current) chunks.push(current);
    return chunks.length ? chunks : [text.substring(0, 180)];
  }

  function tokenizeForMatch(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(function (t) { return t.length > 2; });
  }

  function scoreNarrationMatch(slideText, candidateText) {
    var slideTokens = tokenizeForMatch(slideText);
    var candTokens = tokenizeForMatch(candidateText);
    if (!slideTokens.length || !candTokens.length) return 0;

    var candSet = {};
    candTokens.forEach(function (t) { candSet[t] = true; });

    var hit = 0;
    slideTokens.forEach(function (t) {
      if (candSet[t]) hit++;
    });

    return hit;
  }

  function getIndexedNarration(slide) {
    if (!slide || !narrationIndexByPage) return '';
    var page = getCurrentPage();
    var pageList = narrationIndexByPage[page];
    if (!pageList || !pageList.length) return '';

    var idx = parseInt(slide.getAttribute('data-slide-idx'), 10);
    if (!isNaN(idx) && idx >= 0 && idx < pageList.length) {
      var indexed = cleanNarrationText(pageList[idx] || '');
      if (indexed) return indexed;
    }

    // If slide indexing drifts from source narration order, match by heading text.
    var heading = slide.querySelector('h1, h2, h3');
    if (!heading) return '';
    var headingText = cleanNarrationText(heading.textContent || '');
    if (!headingText) return '';

    var best = '';
    var bestScore = 0;
    pageList.forEach(function (candidate) {
      var score = scoreNarrationMatch(headingText, candidate);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    });

    return bestScore >= 2 ? cleanNarrationText(best) : '';
  }

  function getNarrationText(slide) {
    if (!slide) return '';

    var explicit = cleanNarrationText(slide.getAttribute('data-narrate') || '');
    if (explicit) return explicit;

    var legacy = cleanNarrationText(slide.getAttribute('data-narration') || '');
    if (legacy) return legacy;

    var narratedChild = slide.querySelector('[data-narrate], [data-narration]');
    if (narratedChild) {
      var childText = cleanNarrationText(
        narratedChild.getAttribute('data-narrate') ||
        narratedChild.getAttribute('data-narration') || ''
      );
      if (childText) return childText;
    }

    var indexed = getIndexedNarration(slide);
    if (indexed) return indexed;

    var heading = slide.querySelector('h1, h2, h3');
    if (heading) {
      var p = slide.querySelector('p');
      var text = heading.textContent.trim();
      if (p) text += '. ' + p.textContent.trim().substring(0, 180);
      return cleanNarrationText(text);
    }

    return '';
  }

  function resolveNarrationVoice() {
    var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    return voices.find(function (v) {
      return v.lang && v.lang.indexOf('en-GB') === 0 && /female/i.test(v.name || '');
    }) || voices.find(function (v) {
      return v.lang && v.lang.indexOf('en-GB') === 0;
    }) || voices.find(function (v) {
      return v.lang && v.lang.indexOf('en') === 0;
    }) || null;
  }

  function updateNarrationButton() {
    if (!lirilNarration.button) return;
    var text = getNarrationText(lirilNarration.activeSlide);
    lirilNarration.button.disabled = !text;
    lirilNarration.button.classList.toggle('pres-page-nav-active', lirilNarration.speaking);
    lirilNarration.button.title = text ? 'Narrate current slide' : 'No narration available for this slide';
  }

  function startNarrationKeepalive() {
    stopNarrationKeepalive();
    lirilNarration.keepaliveTimer = setInterval(function () {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  function stopNarrationKeepalive() {
    if (lirilNarration.keepaliveTimer) {
      clearInterval(lirilNarration.keepaliveTimer);
      lirilNarration.keepaliveTimer = null;
    }
  }

  function stopNarration() {
    lirilNarration.token++;
    stopNarrationKeepalive();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    lirilNarration.speaking = false;
    updateNarrationButton();
  }

  function speakNarrationChunks(chunks, voice, token) {
    if (!chunks.length || token !== lirilNarration.token) {
      lirilNarration.speaking = false;
      stopNarrationKeepalive();
      updateNarrationButton();
      return;
    }

    var chunk = chunks.shift();
    var u = new SpeechSynthesisUtterance(chunk);
    u.lang = 'en-GB';
    u.rate = 0.95;
    u.pitch = 1.0;
    if (voice) u.voice = voice;

    u.onstart = function () {
      lirilNarration.speaking = true;
      updateNarrationButton();
    };
    u.onend = function () {
      if (token !== lirilNarration.token) return;
      setTimeout(function () {
        speakNarrationChunks(chunks, voice, token);
      }, 120);
    };
    u.onerror = function () {
      if (token !== lirilNarration.token) return;
      lirilNarration.speaking = false;
      stopNarrationKeepalive();
      updateNarrationButton();
    };

    window.speechSynthesis.speak(u);
  }

  function narrateCurrentSlide() {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;

    var text = getNarrationText(lirilNarration.activeSlide);
    if (!text) return;

    stopNarration();
    var chunks = splitNarrationChunks(text);
    var voice = resolveNarrationVoice();
    lirilNarration.token++;
    startNarrationKeepalive();
    speakNarrationChunks(chunks, voice, lirilNarration.token);
  }

  function initNarrationControls(slides, pageIndicator, activeIdx) {
    if (!pageIndicator) return;
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;

    lirilNarration.button = pageIndicator.querySelector('.pres-page-narrate');
    lirilNarration.activeSlide = slides[activeIdx || 0] || null;

    if (!lirilNarration.button) return;

    lirilNarration.button.addEventListener('click', function () {
      narrateCurrentSlide();
    });

    window.__TENET5_LIRIL_NARRATE = narrateCurrentSlide;
    window.__TENET5_LIRIL_STOP = stopNarration;

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopNarration();
    });

    window.addEventListener('beforeunload', function () {
      stopNarration();
    });

    updateNarrationButton();
    loadNarrationIndex().then(function () {
      updateNarrationButton();
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 13: Continue-slide observation
     ═══════════════════════════════════════════════════════════════════ */

  function observeContinueSlide(continueSlide) {
    if (!continueSlide) return;

    var triggered = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          continueSlide.classList.add('pres-visible');
          startCountdown(continueSlide);
        }
        if (!entry.isIntersecting && triggered) {
          triggered = false;
          clearCountdown();
          var fill = continueSlide.querySelector('.pres-continue-progress-fill');
          if (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
          }
          var num = continueSlide.querySelector('.pres-countdown');
          if (num) num.textContent = '8';
        }
      });
    }, { threshold: 0.5 });

    observer.observe(continueSlide);

    document.addEventListener('keydown', function cancelHandler(e) {
      if (triggered && countdownTimer) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          clearCountdown();
          navigatePage(1);
          document.removeEventListener('keydown', cancelHandler);
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
      SECTION 14: Init — wire everything together
     ═══════════════════════════════════════════════════════════════════ */

  function init() {
    loadCSS('css/presentation.css?v=2');

    requestAnimationFrame(function () {
      var elements = detectSlides();
      if (elements.length < 1) return;

      var slides = wrapSlides(elements);
      document.body.classList.add('pres-active');

      var continueSlide = buildContinueSlide();

      var ui = buildIndicator(slides);
      var pageIndicator = buildPageIndicator();
      var tracker = observeSlides(slides, ui, function (idx) {
        lirilNarration.activeSlide = slides[idx] || null;
        if (lirilNarration.speaking) stopNarration();
        updateNarrationButton();
      });
      initKeyboardNav(slides, tracker);
      observeContinueSlide(continueSlide);
      initNarrationControls(slides, pageIndicator, 0);

      if (slides[0]) {
        slides[0].classList.add('pres-visible');
        triggerSprites(slides[0]);
        lirilNarration.activeSlide = slides[0];
        updateNarrationButton();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
