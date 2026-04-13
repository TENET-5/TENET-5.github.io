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

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    'maid-accountability.html': 'MAID \u2014 ~98,000 Deaths, Zero Accountability',
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
    'acelephius-report.html': 'ACELEPHIUS \u2014 LIRIL OSINT Engine',
    'acelephius-wardoll.html': 'ACELEPHIUS \u2014 War Doll Intelligence',
    'omniverse-viewer.html': 'Omniverse Viewer \u2014 3D USD Viewport',
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
      'AI & Research': ['ai-research.html', 'liril-analysis.html', 'acelephius-report.html', 'acelephius-wardoll.html', 'omniverse-viewer.html'],
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
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', getSlideLabel(el) || ('Slide ' + (idx + 1)));
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
    rail.setAttribute('role', 'tablist');
    rail.setAttribute('aria-label', 'Slide navigation');

    slides.forEach(function (sl, i) {
      if (sl.classList.contains('pres-slide--compact')) return;
      var label = getSlideLabel(sl);
      var dot = document.createElement('div');
      dot.className = 'pres-dot';
      dot.setAttribute('data-label', label);
      dot.setAttribute('data-idx', i);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', label || ('Slide ' + (i + 1)));
      dot.addEventListener('click', function () {
        sl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
      dot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
      });
      rail.appendChild(dot);
    });

    document.body.appendChild(rail);

    var progress = document.createElement('div');
    progress.className = 'pres-progress';
    document.body.appendChild(progress);

    var hint = document.createElement('div');
    hint.className = 'pres-keyhint';
    hint.textContent = '\u2191\u2193 arrows \u00b7 space \u00b7 \u2190\u2192 page \u00b7 N narrate \u00b7 G go to \u00b7 ? help';
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

  function markNarratableDots(ui, slides) {
    ui.dots.forEach(function (dot) {
      var dotIdx = parseInt(dot.getAttribute('data-idx'), 10);
      var slide = slides[dotIdx];
      var hasNarration = slide ? !!getNarrationText(slide) : false;
      dot.classList.toggle('pres-dot-narratable', hasNarration);
    });
  }

  function getResumeKey() {
    return 'pres-resume:' + getCurrentPage();
  }

  function saveSlidePosition(idx) {
    try { sessionStorage.setItem(getResumeKey(), String(idx)); } catch (e) { /* quota */ }
  }

  function updateSlideHash(idx) {
    if (idx === 0) {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    var tag = '#slide-' + (idx + 1);
    if (location.hash !== tag) history.replaceState(null, '', tag);
  }

  function restoreSlidePosition(slides) {
    // Hash fragment takes priority (e.g. #slide-3 = third slide)
    var hashMatch = location.hash.match(/^#slide-(\d+)$/);
    if (hashMatch) {
      var hIdx = parseInt(hashMatch[1], 10) - 1;
      if (hIdx >= 0 && hIdx < slides.length && hIdx !== 0) {
        setTimeout(function () {
          slides[hIdx].scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 80);
        return;
      }
    }
    // Fall back to sessionStorage resume
    try {
      var saved = sessionStorage.getItem(getResumeKey());
      if (saved === null) return;
      var idx = parseInt(saved, 10);
      if (isNaN(idx) || idx < 0 || idx >= slides.length || idx === 0) return;
      setTimeout(function () {
        slides[idx].scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 80);
    } catch (e) { /* private browsing */ }
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 5b: Slide table-of-contents overlay
     ═══════════════════════════════════════════════════════════════════ */

  function getTocOverlay() {
    return document.querySelector('.pres-toc-overlay');
  }

  function closeToc() {
    var existing = getTocOverlay();
    if (existing) existing.remove();
  }

  function toggleTOC(slides, tracker) {
    if (getTocOverlay()) { closeToc(); return; }

    var activeIdx = tracker.getActive();
    var overlay = document.createElement('div');
    overlay.className = 'pres-toc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Slide overview');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);' +
      'display:flex;align-items:center;justify-content:center;z-index:9998;backdrop-filter:blur(8px);';

    var panel = document.createElement('div');
    panel.style.cssText = 'background:rgba(6,10,22,0.95);color:#e8e4dc;padding:1.5rem 2rem;' +
      'border-radius:6px;border:1px solid rgba(14,165,233,0.15);max-width:480px;width:90vw;' +
      'max-height:70vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 1px rgba(14,165,233,0.2);';
    panel.innerHTML = '<h3 style="margin:0 0 1rem;font-size:1.1rem;font-family:Rajdhani,Space Grotesk,sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:#0ea5e9;">Slide Overview</h3>';

    var list = document.createElement('ol');
    list.style.cssText = 'list-style:none;margin:0;padding:0;';

    slides.forEach(function (sl, i) {
      if (sl.classList.contains('pres-slide--compact')) return;
      var label = getSlideLabel(sl);
      var li = document.createElement('li');
      li.style.cssText = 'padding:0.35rem 0.5rem;border-radius:3px;cursor:pointer;' +
        'font-size:0.9rem;margin-bottom:2px;transition:background 0.15s ease;' +
        (i === activeIdx ? 'background:rgba(14,165,233,0.15);color:#22d3ee;font-weight:bold;border-left:2px solid #0ea5e9;padding-left:0.6rem;' : '');
      li.textContent = (i + 1) + '. ' + label;
      li.addEventListener('click', function () {
        closeToc();
        sl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
      list.appendChild(li);
    });

    panel.appendChild(list);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeToc();
    });

    // Scroll the active item into view within the panel
    var activeLi = list.children[activeIdx];
    if (activeLi) activeLi.scrollIntoView({ block: 'center' });
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 5c: "Go to page" quick-search overlay
     ═══════════════════════════════════════════════════════════════════ */

  function getGoToOverlay() {
    return document.querySelector('.pres-goto-overlay');
  }

  function closeGoTo() {
    var existing = getGoToOverlay();
    if (existing) existing.remove();
  }

  function openGoToPage() {
    if (getGoToOverlay()) { closeGoTo(); return; }

    var currentPage = getCurrentPage();
    var overlay = document.createElement('div');
    overlay.className = 'pres-goto-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Go to page');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);' +
      'display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;z-index:9998;backdrop-filter:blur(8px);';

    var panel = document.createElement('div');
    panel.style.cssText = 'background:rgba(6,10,22,0.95);color:#e8e4dc;padding:1.2rem 1.5rem;' +
      'border-radius:6px;border:1px solid rgba(14,165,233,0.15);max-width:520px;width:92vw;' +
      'max-height:65vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 1px rgba(14,165,233,0.2);';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search 136 investigation pages\u2026';
    input.setAttribute('aria-label', 'Search pages');
    input.style.cssText = 'width:100%;padding:0.6rem 0.8rem;font-size:1rem;' +
      'background:rgba(8,14,28,0.9);color:#e8e4dc;border:1px solid rgba(14,165,233,0.15);border-radius:4px;' +
      'outline:none;margin-bottom:0.8rem;box-sizing:border-box;font-family:Inter,system-ui,sans-serif;';

    var resultsDiv = document.createElement('div');
    resultsDiv.style.cssText = 'overflow-y:auto;flex:1;';

    panel.appendChild(input);
    panel.appendChild(resultsDiv);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Build page entries grouped by section
    var entries = [];
    PAGE_SEQUENCE.forEach(function (page, i) {
      var title = PAGE_TITLES[page] || page.replace('.html', '').replace(/-/g, ' ');
      var group = SECTION_GROUPS[page] || '';
      entries.push({ page: page, title: title, group: group, idx: i });
    });

    function renderResults(filter) {
      resultsDiv.innerHTML = '';
      var lowerFilter = (filter || '').toLowerCase();
      var lastGroup = '';
      var count = 0;

      entries.forEach(function (entry) {
        if (lowerFilter) {
          var haystack = (entry.title + ' ' + entry.group + ' ' + entry.page).toLowerCase();
          if (haystack.indexOf(lowerFilter) === -1) return;
        }

        if (entry.group !== lastGroup) {
          lastGroup = entry.group;
          var groupEl = document.createElement('div');
          groupEl.style.cssText = 'font-size:0.7rem;color:#0ea5e9;padding:0.5rem 0.3rem 0.15rem;' +
            'text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid rgba(14,165,233,0.1);margin-top:0.3rem;font-family:Rajdhani,Space Grotesk,sans-serif;';
          groupEl.textContent = entry.group;
          resultsDiv.appendChild(groupEl);
        }

        var row = document.createElement('div');
        var isCurrent = entry.page === currentPage;
        row.style.cssText = 'padding:0.35rem 0.5rem;border-radius:3px;cursor:pointer;' +
          'font-size:0.88rem;margin-bottom:1px;transition:background 0.15s ease;' +
          (isCurrent ? 'background:rgba(14,165,233,0.12);color:#22d3ee;border-left:2px solid #0ea5e9;padding-left:0.6rem;' : '');
        row.textContent = (entry.idx + 1) + '. ' + entry.title;
        row.addEventListener('click', function () {
          closeGoTo();
          navigatePage(0, entry.page);
        });
        row.addEventListener('mouseenter', function () {
          if (!isCurrent) this.style.background = 'rgba(255,255,255,0.06)';
        });
        row.addEventListener('mouseleave', function () {
          this.style.background = isCurrent ? 'rgba(14,165,233,0.12)' : '';
        });
        resultsDiv.appendChild(row);
        count++;
      });

      if (count === 0) {
        var empty = document.createElement('div');
        empty.style.cssText = 'padding:1rem;color:#666;text-align:center;font-size:0.9rem;';
        empty.textContent = 'No pages match \u201c' + filter + '\u201d';
        resultsDiv.appendChild(empty);
      }
    }

    renderResults('');

    input.addEventListener('input', function () {
      renderResults(input.value.trim());
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeGoTo(); }
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeGoTo();
    });

    // Focus the search box
    setTimeout(function () { input.focus(); }, 50);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 6: Keyboard + touch navigation
     ═══════════════════════════════════════════════════════════════════ */

  function initKeyboardNav(slides, tracker) {
    // Add keyboard help modal
    function getKeyboardHelpModal() {
      return document.querySelector('.pres-keyboard-help');
    }

    function closeKeyboardHelp() {
      var existing = getKeyboardHelpModal();
      if (existing) existing.remove();
    }

    function showKeyboardHelp() {
      if (getKeyboardHelpModal()) return;

      var modal = document.createElement('div');
      modal.className = 'pres-keyboard-help';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Keyboard shortcuts');
      modal.innerHTML = '<div class="pres-keyboard-help-inner">' +
        '<h3>Navigation Shortcuts</h3>' +
        '<div class="pres-keyboard-shortcuts">' +
        '<p><kbd>\u2191</kbd> <kbd>\u2193</kbd> \u2014 Step through slides</p>' +
        '<p><kbd>Space</kbd> \u2014 Next slide</p>' +
        '<p><kbd>\u2190</kbd> <kbd>\u2192</kbd> \u2014 Previous/Next page</p>' +
        '<p><kbd>Home</kbd> / <kbd>End</kbd> \u2014 First/Last slide</p>' +
        '<p><kbd>N</kbd> \u2014 Narrate current slide (LIRIL)</p>' +
        '<p><kbd>Shift+N</kbd> \u2014 Narrate all slides (hands-free)</p>' +
        '<p><kbd>A</kbd> \u2014 Toggle auto-narrate on slide change</p>' +
        '<p><kbd>S</kbd> \u2014 Cycle speech rate (slow/normal/fast)</p>' +
        '<p><kbd>T</kbd> \u2014 Slide table of contents</p>' +
        '<p><kbd>Esc</kbd> \u2014 Stop narration / close panels</p>' +
        '<p><kbd>?</kbd> \u2014 Show this help</p>' +
        '</div>' +
        '<button aria-label="Close keyboard shortcuts" onclick="this.closest(\'.pres-keyboard-help\').remove()">Close</button>' +
        '</div>';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
      modal.querySelector('.pres-keyboard-help-inner').style.cssText = 'background:#0a0e1a;color:#e8e4dc;padding:2rem;border-radius:8px;border:1px solid #333;max-width:400px;';
      document.body.appendChild(modal);
      modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
      });
    }

    document.addEventListener('keydown', function (e) {
      var targetEl = e.target;
      var isEditing = !!(
        targetEl &&
        (targetEl.tagName === 'INPUT' ||
         targetEl.tagName === 'TEXTAREA' ||
         targetEl.tagName === 'SELECT' ||
         targetEl.isContentEditable)
      );
      if (isEditing) return;

      var helpOpen = !!getKeyboardHelpModal();
      var tocOpen = !!getTocOverlay();
      var gotoOpen = !!getGoToOverlay();
      if (helpOpen || tocOpen || gotoOpen) {
        if (e.key === 'Escape' || e.key === '?') {
          e.preventDefault();
          if (e.key === 'Escape') { closeKeyboardHelp(); closeToc(); closeGoTo(); }
          return;
        }
        if (tocOpen && e.key === 't' || e.key === 'T') {
          e.preventDefault();
          closeToc();
          return;
        }
        return;
      }

      var cur = tracker.getActive();
      var target = null;

      if (e.key === '?') {
        e.preventDefault();
        showKeyboardHelp();
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (e.shiftKey) {
          if (window.__TENET5_LIRIL_NARRATE_ALL) window.__TENET5_LIRIL_NARRATE_ALL();
        } else {
          if (window.__TENET5_LIRIL_NARRATE) window.__TENET5_LIRIL_NARRATE();
        }
        return;
      }

      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (window.__TENET5_LIRIL_CYCLE_RATE) window.__TENET5_LIRIL_CYCLE_RATE();
        return;
      }

      if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (window.__TENET5_LIRIL_TOGGLE_AUTO) window.__TENET5_LIRIL_TOGGLE_AUTO();
        return;
      }

      if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleTOC(slides, tracker);
        return;
      }

      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openGoToPage();
        return;
      }

      if (e.key === 'Escape') {
        if (getKeyboardHelpModal()) {
          e.preventDefault();
          closeKeyboardHelp();
          return;
        }
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
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  function initTouchNav() {
    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;

    document.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (e.changedTouches.length !== 1) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      var dt = Date.now() - touchStartTime;

      // Only count quick, deliberate horizontal swipes
      if (dt > 600 || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;

      navigatePage(dx < 0 ? 1 : -1);
    }, { passive: true });
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
    var colors = ['#dc2626', '#0ea5e9', '#3b82f6', '#a855f7', '#22c55e', '#f97316'];

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

  function navigatePage(direction, targetPage) {
    var nextPage;
    if (targetPage) {
      nextPage = targetPage;
    } else {
      var current = getCurrentPage();
      var idx = getPageIndex(current);
      if (idx === -1) return;
      var nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= PAGE_SEQUENCE.length) return;
      nextPage = PAGE_SEQUENCE[nextIdx];
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'pres-navigate',
        page: nextPage
      }, '*');
    } else {
      window.location.href = nextPage;
    }
  }

  function prefetchAdjacentPages() {
    var current = getCurrentPage();
    var idx = getPageIndex(current);
    if (idx === -1) return;

    var pages = [];
    if (idx + 1 < PAGE_SEQUENCE.length) pages.push(PAGE_SEQUENCE[idx + 1]);
    if (idx - 1 >= 0) pages.push(PAGE_SEQUENCE[idx - 1]);

    pages.forEach(function (page) {
      if (document.querySelector('link[rel="prefetch"][href="' + page + '"]')) return;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      link.as = 'document';
      document.head.appendChild(link);
    });
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
    indicator.setAttribute('role', 'navigation');
    indicator.setAttribute('aria-label', 'Page navigation');
    indicator.innerHTML =
      '<button class="pres-page-nav pres-page-prev" title="Previous page" aria-label="Previous page">\u2190</button>' +
      '<button class="pres-page-nav pres-page-narrate" title="Narrate current slide">N</button>' +
      '<span class="pres-page-info">' +
        '<strong>' + (idx + 1) + '/' + PAGE_SEQUENCE.length + '</strong>' +
        ' \u00b7 ' + escHTML(group) +
      '</span>' +
      '<span class="pres-narration-badge" aria-live="polite"></span>' +
      '<button class="pres-page-nav pres-page-next" title="Next page" aria-label="Next page">\u2192</button>';

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

  window.__TENET5_NEXT_PAGE = function() { navigatePage(1); };
  window.__TENET5_STOP_AUTOWALK = function() { try { sessionStorage.removeItem('liril-autowalk'); } catch(e){} };

  var SPEECH_RATES = [
    { label: 'Slow', value: 0.8 },
    { label: 'Normal', value: 0.95 },
    { label: 'Fast', value: 1.2 }
  ];

  var RATE_STORAGE_KEY = 'liril-rate-idx';
  var AUTO_NARRATE_KEY = 'liril-auto-narrate';

  /* Restore rate + auto-narrate from sessionStorage */
  var savedRate = 1;
  var savedAuto = false;
  try {
    var sr = sessionStorage.getItem(RATE_STORAGE_KEY);
    if (sr !== null) { var ri = parseInt(sr, 10); if (ri >= 0 && ri < SPEECH_RATES.length) savedRate = ri; }
    savedAuto = sessionStorage.getItem(AUTO_NARRATE_KEY) === 'true';
  } catch (e) { /* private browsing */ }

  var lirilNarration = {
    button: null,
    speaking: false,
    activeSlide: null,
    keepaliveTimer: null,
    token: 0,
    subtitle: null,
    rateIdx: savedRate,
    autoNarrate: savedAuto,
    narrateAllActive: false,
    narrateAllSlides: null,
    narrateAllTracker: null,
    badge: null
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

  /* Voice persistence + preferred en-GB female voice names across browsers/OSes */
  var VOICE_STORAGE_KEY = 'liril-voice-name';
  var PREFERRED_VOICES = [
    'hazel', 'libby', 'sonia', 'amy', 'emma', 'kate',
    'microsoft hazel', 'microsoft libby', 'google uk english female'
  ];
  var cachedVoice = null;
  var voicesReady = false;

  function storeVoiceName(v) {
    if (!v || !v.name) return;
    try { sessionStorage.setItem(VOICE_STORAGE_KEY, v.name); } catch (e) { /* quota */ }
  }

  function resolveNarrationVoice() {
    if (cachedVoice) return cachedVoice;
    var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;

    voicesReady = true;

    /* 0. Restore the exact voice used on the previous page (sessionStorage) */
    /* FIXED: validate restored voice is NOT male before trusting it */
    var BANNED_MALE_P = ['david','mark','james','george','daniel','ryan','guy','thomas','richard','rishi','sean','oliver','liam','christopher','eric','andrew','brian','roger','malcolm','connor'];
    function isMaleP(v) { var n = (v.name||'').toLowerCase(); return BANNED_MALE_P.some(function(m){ return n.indexOf(m)>=0; }); }
    try {
      var saved = sessionStorage.getItem(VOICE_STORAGE_KEY);
      if (saved) {
        var restored = voices.find(function (v) { return v.name === saved; });
        if (restored && !isMaleP(restored)) { cachedVoice = restored; return cachedVoice; }
      }
    } catch (e) { /* private browsing */ }

    /* 0.5 STRICT PRIORITY: Natural High Quality Voices */
    var naturalVoice = voices.find(function (v) {
      return v.lang && v.lang.indexOf('en-GB') === 0 && /(natural|online|neural)/i.test(v.name) && /female/i.test(v.name);
    });
    // Fallback if the 'female' tag isn't explicit but it matches our known natural profile
    if (!naturalVoice) {
      naturalVoice = voices.find(function (v) {
        return v.lang && v.lang.indexOf('en-GB') === 0 && /(natural|online|neural)/i.test(v.name) && !/male/i.test(v.name);
      });
    }
    // High Quality English (Natural/Online) even if not GB
    if (!naturalVoice) {
      naturalVoice = voices.find(function (v) {
        return v.lang && v.lang.indexOf('en') === 0 && /(natural|online|neural)/i.test(v.name) && /female/i.test(v.name);
      });
    }

    if (naturalVoice) {
      cachedVoice = naturalVoice;
      storeVoiceName(naturalVoice);
      return cachedVoice;
    }

    /* 1. Exact match on a known LIRIL-like female en-GB name */
    var preferred = null;
    PREFERRED_VOICES.some(function (pref) {
      preferred = voices.find(function (v) {
        return v.lang && v.lang.indexOf('en-GB') === 0 &&
          (v.name || '').toLowerCase().indexOf(pref) !== -1;
      });
      return !!preferred;
    });
    if (preferred) { cachedVoice = preferred; storeVoiceName(preferred); return cachedVoice; }

    /* 2. Any en-GB voice labelled female (or NOT labelled male) */
    var enGBFemale = voices.find(function (v) {
      return v.lang && v.lang.indexOf('en-GB') === 0 && /female/i.test(v.name || '');
    });
    if (enGBFemale) { cachedVoice = enGBFemale; storeVoiceName(enGBFemale); return cachedVoice; }

    var enGBNonMale = voices.find(function (v) {
      return v.lang && v.lang.indexOf('en-GB') === 0 && !isMaleP(v);
    });
    if (enGBNonMale) { cachedVoice = enGBNonMale; storeVoiceName(enGBNonMale); return cachedVoice; }

    /* 3. Any en female / non-male voice */
    var enFemale = voices.find(function (v) {
      return v.lang && v.lang.indexOf('en') === 0 && /female/i.test(v.name || '');
    });
    if (enFemale) { cachedVoice = enFemale; storeVoiceName(enFemale); return cachedVoice; }

    var enNonMale = voices.find(function (v) {
      return v.lang && v.lang.indexOf('en') === 0 && !/male/i.test(v.name || '');
    });
    if (enNonMale) { cachedVoice = enNonMale; storeVoiceName(enNonMale); return cachedVoice; }

    /* 4. Absolute fallback */
    cachedVoice = voices.find(function (v) {
      return v.lang && v.lang.indexOf('en') === 0;
    }) || null;
    if (cachedVoice) storeVoiceName(cachedVoice);
    return cachedVoice;
  }

  /* Re-resolve when browser finishes loading voice list (Chrome fires this async) */
  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', function () {
      cachedVoice = null;
      resolveNarrationVoice();
    });
    /* Prime the cache immediately if voices are already loaded */
    resolveNarrationVoice();
  }

  function updateNarrationButton() {
    if (!lirilNarration.button) return;
    var text = getNarrationText(lirilNarration.activeSlide);
    lirilNarration.button.disabled = !text;
    lirilNarration.button.classList.toggle('pres-page-nav-active', lirilNarration.speaking);
    lirilNarration.button.setAttribute('aria-pressed', lirilNarration.speaking ? 'true' : 'false');
    lirilNarration.button.setAttribute('aria-disabled', (!text).toString());
    lirilNarration.button.title = text ? 'Narrate current slide' : 'No narration available for this slide';
    updateNarrationBadge();
  }

  function updateNarrationBadge() {
    if (!lirilNarration.badge) return;
    var parts = [];

    // Voice name (short)
    var v = cachedVoice;
    if (v && v.name) {
      var short = v.name.replace(/Microsoft\s+/i, '').replace(/Online\s*\(Natural\)/i, '').trim();
      if (short.length > 18) short = short.substring(0, 16) + '\u2026';
      parts.push(short);
    }

    // Rate
    var rate = SPEECH_RATES[lirilNarration.rateIdx];
    if (rate && rate.label !== 'Normal') parts.push(rate.value + '\u00d7');

    // Modes
    if (lirilNarration.narrateAllActive) parts.push('\u25b6 ALL');
    else if (lirilNarration.autoNarrate) parts.push('AUTO');

    lirilNarration.badge.textContent = parts.join(' \u00b7 ');
    lirilNarration.badge.style.display = parts.length ? '' : 'none';
  }

  function getSubtitleEl() {
    if (lirilNarration.subtitle) return lirilNarration.subtitle;
    var el = document.createElement('div');
    el.className = 'pres-narration-subtitle';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);' +
      'max-width:80vw;padding:0.7rem 1.4rem;background:rgba(5,5,10,0.94);' +
      'color:#e0ddd6;font-size:0.9rem;line-height:1.5;border-radius:4px;' +
      'border:1px solid rgba(14,165,233,0.18);z-index:9990;' +
      'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
      'pointer-events:none;opacity:0;transition:opacity 0.3s ease;' +
      'text-align:center;font-family:Inter,-apple-system,sans-serif;' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.4);letter-spacing:0.01em;';
    document.body.appendChild(el);
    lirilNarration.subtitle = el;
    return el;
  }

  function showSubtitle(text) {
    var el = getSubtitleEl();
    el.textContent = text;
    el.style.opacity = '1';
  }

  function hideSubtitle() {
    if (!lirilNarration.subtitle) return;
    lirilNarration.subtitle.style.opacity = '0';
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
    stopNarrateAll();
    hideSubtitle();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    lirilNarration.speaking = false;
    updateNarrationButton();
  }

  function speakNarrationChunks(chunks, voice, token, chunkIdx, totalChunks, retries) {
    if (!chunks.length || token !== lirilNarration.token) {
      lirilNarration.speaking = false;
      stopNarrationKeepalive();
      hideSubtitle();
      updateNarrationButton();
      return;
    }

    var chunk = chunks.shift();
    var idx = chunkIdx || 0;
    var total = totalChunks || (idx + 1 + chunks.length);
    var retryCount = retries || 0;
    var u = new SpeechSynthesisUtterance(chunk);
    u.lang = getPageLang();
    u.rate = SPEECH_RATES[lirilNarration.rateIdx].value;
    u.pitch = 1.0;
    if (voice) u.voice = voice;

    u.onstart = function () {
      lirilNarration.speaking = true;
      var prefix = total > 1 ? '[' + (idx + 1) + '/' + total + '] ' : '';
      showSubtitle(prefix + chunk);
      updateNarrationButton();
    };
    u.onend = function () {
      if (token !== lirilNarration.token) return;
      setTimeout(function () {
        speakNarrationChunks(chunks, voice, token, idx + 1, total);
      }, 120);
    };
    u.onerror = function (ev) {
      if (token !== lirilNarration.token) return;
      // Retry once on transient errors (network TTS, interrupted)
      if (retryCount < 1) {
        chunks.unshift(chunk);
        setTimeout(function () {
          speakNarrationChunks(chunks, voice, token, idx, total, retryCount + 1);
        }, 300);
        return;
      }
      lirilNarration.speaking = false;
      stopNarrationKeepalive();
      showSubtitle('Narration error — speech unavailable');
      setTimeout(hideSubtitle, 3000);
      updateNarrationButton();
    };

    window.speechSynthesis.speak(u);
  }

  function narrateCurrentSlide() {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;

    var text = getNarrationText(lirilNarration.activeSlide);
    if (!text) return;

    var voice = resolveNarrationVoice();

    /* If voices haven't loaded yet (Chrome async), wait up to 2 s */
    if (!voice && !voicesReady) {
      var waitToken = ++lirilNarration.token;
      var waited = 0;
      var poll = setInterval(function () {
        waited += 100;
        voice = resolveNarrationVoice();
        if (voice || waited >= 2000) {
          clearInterval(poll);
          if (waitToken !== lirilNarration.token) return; // user cancelled
          doNarrate(text, voice);
        }
      }, 100);
      return;
    }

    doNarrate(text, voice);
  }

  function doNarrate(text, voice) {
    stopNarration();
    var chunks = splitNarrationChunks(text);
    var total = chunks.length;
    lirilNarration.token++;
    startNarrationKeepalive();
    speakNarrationChunks(chunks, voice, lirilNarration.token, 0, total);
  }

  /* ── Narrate All: continuous narration through all remaining slides ── */

  function stopNarrateAll() {
    lirilNarration.narrateAllActive = false;
    lirilNarration.narrateAllSlides = null;
    lirilNarration.narrateAllTracker = null;
    updateNarrationBadge();
  }

  function narrateAllFrom(slides, tracker) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;

    if (lirilNarration.narrateAllActive) {
      // Already running — stop it
      stopNarrateAll();
      stopNarration();
      showSubtitle('Narrate All: OFF');
      setTimeout(function () { if (!lirilNarration.speaking) hideSubtitle(); }, 1500);
      return;
    }

    lirilNarration.narrateAllActive = true;
    lirilNarration.narrateAllSlides = slides;
    lirilNarration.narrateAllTracker = tracker;
    showSubtitle('Narrate All: ON — Shift+N or Esc to stop');
    updateNarrationBadge();
    setTimeout(function () { if (!lirilNarration.speaking) hideSubtitle(); }, 2000);
    narrateAllStep(slides, tracker);
  }

  function narrateAllStep(slides, tracker) {
    if (!lirilNarration.narrateAllActive) return;

    var cur = tracker.getActive();
    var slide = slides[cur];
    if (!slide) { stopNarrateAll(); return; }

    lirilNarration.activeSlide = slide;
    var text = getNarrationText(slide);

    if (!text) {
      // No narration for this slide — skip to next
      narrateAllAdvance(slides, tracker, cur);
      return;
    }

    var voice = resolveNarrationVoice();
    stopNarration(); // cancel any in-flight speech

    var chunks = splitNarrationChunks(text);
    var total = chunks.length;
    lirilNarration.token++;
    var myToken = lirilNarration.token;
    startNarrationKeepalive();

    speakNarrationAllChunks(chunks, voice, myToken, 0, total, function () {
      // Called when all chunks for this slide are done
      if (!lirilNarration.narrateAllActive || myToken !== lirilNarration.token) return;
      narrateAllAdvance(slides, tracker, cur);
    });
  }

  function narrateAllAdvance(slides, tracker, cur) {
    if (!lirilNarration.narrateAllActive) return;

    if (cur >= slides.length - 1) {
      // Reached last slide — stop narrate-all
      showSubtitle('Narrate All: complete');
      setTimeout(function () { hideSubtitle(); }, 2000);
      stopNarrateAll();
      return;
    }

    // Scroll to next slide, then narrate after a brief pause
    var next = slides[cur + 1];
    if (next) {
      next.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    setTimeout(function () {
      narrateAllStep(slides, tracker);
    }, 600);
  }

  function speakNarrationAllChunks(chunks, voice, token, chunkIdx, totalChunks, onAllDone) {
    if (!chunks.length || token !== lirilNarration.token) {
      lirilNarration.speaking = false;
      stopNarrationKeepalive();
      hideSubtitle();
      updateNarrationButton();
      if (typeof onAllDone === 'function') onAllDone();
      return;
    }

    var chunk = chunks.shift();
    var idx = chunkIdx || 0;
    var total = totalChunks || (idx + 1 + chunks.length);
    var u = new SpeechSynthesisUtterance(chunk);
    u.lang = getPageLang();
    u.rate = SPEECH_RATES[lirilNarration.rateIdx].value;
    u.pitch = 1.0;
    if (voice) u.voice = voice;

    u.onstart = function () {
      lirilNarration.speaking = true;
      var prefix = total > 1 ? '[' + (idx + 1) + '/' + total + '] ' : '';
      showSubtitle(prefix + chunk);
      updateNarrationButton();
    };
    u.onend = function () {
      if (token !== lirilNarration.token) return;
      setTimeout(function () {
        speakNarrationAllChunks(chunks, voice, token, idx + 1, total, onAllDone);
      }, 120);
    };
    u.onerror = function () {
      if (token !== lirilNarration.token) return;
      lirilNarration.speaking = false;
      stopNarrationKeepalive();
      showSubtitle('Narration error \u2014 speech unavailable');
      setTimeout(hideSubtitle, 3000);
      updateNarrationButton();
      if (typeof onAllDone === 'function') onAllDone();
    };

    window.speechSynthesis.speak(u);
  }

  function initNarrationControls(slides, pageIndicator, activeIdx) {
    if (!pageIndicator) return;
    lirilNarration.button = pageIndicator.querySelector('.pres-page-narrate');
    lirilNarration.activeSlide = slides[activeIdx || 0] || null;

    if (!lirilNarration.button) return;

    lirilNarration.button.setAttribute('aria-label', 'Narrate current slide');
    lirilNarration.button.setAttribute('aria-pressed', 'false');

    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      lirilNarration.button.disabled = true;
      lirilNarration.button.title = 'Narration unavailable in this browser';
      lirilNarration.button.setAttribute('aria-disabled', 'true');
      window.__TENET5_LIRIL_NARRATE = function () {};
      window.__TENET5_LIRIL_STOP = function () {};
      return;
    }

    lirilNarration.button.addEventListener('click', function () {
      narrateCurrentSlide();
    });

    window.__TENET5_LIRIL_NARRATE = narrateCurrentSlide;
    window.__TENET5_LIRIL_STOP = stopNarration;
    window.__TENET5_LIRIL_NARRATE_ALL = function () {
      var fakeTracker = { getActive: function () {
        var attr = lirilNarration.activeSlide && lirilNarration.activeSlide.getAttribute('data-slide-idx');
        return parseInt(attr || '0', 10);
      }};
      narrateAllFrom(slides, fakeTracker);
    };
    window.__TENET5_LIRIL_CYCLE_RATE = function () {
      lirilNarration.rateIdx = (lirilNarration.rateIdx + 1) % SPEECH_RATES.length;
      try { sessionStorage.setItem(RATE_STORAGE_KEY, String(lirilNarration.rateIdx)); } catch (e) {}
      var preset = SPEECH_RATES[lirilNarration.rateIdx];
      showSubtitle('Speed: ' + preset.label + ' (' + preset.value + '×)');
      updateNarrationBadge();
      setTimeout(function () {
        if (!lirilNarration.speaking) hideSubtitle();
      }, 1500);
    };
    window.__TENET5_LIRIL_TOGGLE_AUTO = function () {
      lirilNarration.autoNarrate = !lirilNarration.autoNarrate;
      try { sessionStorage.setItem(AUTO_NARRATE_KEY, String(lirilNarration.autoNarrate)); } catch (e) {}
      showSubtitle('Auto-narrate: ' + (lirilNarration.autoNarrate ? 'ON' : 'OFF'));
      updateNarrationBadge();
      setTimeout(function () {
        if (!lirilNarration.speaking) hideSubtitle();
      }, 1500);
      if (lirilNarration.autoNarrate) narrateCurrentSlide();
    };

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
          if (prefersReducedMotion) return; // skip auto-advance for reduced-motion users
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
        if (lirilNarration.speaking && !lirilNarration.narrateAllActive) stopNarration();
        updateNarrationButton();
        saveSlidePosition(idx);
        updateSlideHash(idx);
        if (lirilNarration.autoNarrate && !lirilNarration.narrateAllActive) {
          setTimeout(function () { narrateCurrentSlide(); }, 300);
        }
      });
      initKeyboardNav(slides, tracker);
      initTouchNav();
      observeContinueSlide(continueSlide);
      initNarrationControls(slides, pageIndicator, 0);
      lirilNarration.badge = pageIndicator ? pageIndicator.querySelector('.pres-narration-badge') : null;
      if (lirilNarration.badge) {
        lirilNarration.badge.style.cssText = 'font-size:0.7rem;color:#22d3ee;opacity:0.8;' +
          'white-space:nowrap;margin:0 0.3rem;display:none;';
      }
      updateNarrationBadge();
      prefetchAdjacentPages();

      // Mark dots that have narration (re-run after index loads)
      markNarratableDots(ui, slides);
      loadNarrationIndex().then(function () {
        markNarratableDots(ui, slides);
      });

      if (slides[0]) {
        slides[0].classList.add('pres-visible');
        triggerSprites(slides[0]);
        lirilNarration.activeSlide = slides[0];
        updateNarrationButton();
      }

      // Resume at last-viewed slide if returning to this page
      restoreSlidePosition(slides);
         });
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION: EVIDENCE PERMALINKS — Deep links to evidence blocks
     Auto-generates IDs, scroll+highlight on hash, copy-link on hover
     ═══════════════════════════════════════════════════════════════════ */
  var PERMALINK_SELECTORS = '.evidence-block, .card, .charge-card, ' +
    '.timeline-entry, .stat-tile, [data-narrate], section, article';
  var PERMALINK_HIGHLIGHT_CLASS = 'permalink-highlight';
  var PERMALINK_DURATION = 3000;

  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  function generatePermalinkIds() {
    var els = document.querySelectorAll(PERMALINK_SELECTORS);
    var usedIds = {};
    for (var i = 0; i < els.length; i++) {
      if (els[i].id) { usedIds[els[i].id] = true; continue; }
      var heading = els[i].querySelector('h1, h2, h3, h4, .evidence-label, .card-title, strong');
      var text = heading ? heading.textContent : (els[i].textContent || '');
      var slug = slugify(text.substring(0, 80));
      if (!slug) slug = 'ev-' + i;
      // Ensure unique
      var base = slug;
      var n = 1;
      while (usedIds[slug]) { slug = base + '-' + (++n); }
      usedIds[slug] = true;
      els[i].id = slug;
    }
  }

  function highlightPermalink(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add(PERMALINK_HIGHLIGHT_CLASS);
    setTimeout(function () {
      el.classList.remove(PERMALINK_HIGHLIGHT_CLASS);
    }, PERMALINK_DURATION);
  }

  function handlePermalinkHash() {
    var hash = location.hash.replace('#', '');
    if (hash) highlightPermalink(hash);
  }

  function addPermalinkCopyButtons() {
    var els = document.querySelectorAll(PERMALINK_SELECTORS);
    for (var i = 0; i < els.length; i++) {
      if (!els[i].id) continue;
      if (els[i].querySelector('.permalink-copy')) continue;
      var btn = document.createElement('button');
      btn.className = 'permalink-copy';
      btn.setAttribute('aria-label', 'Copy permalink');
      btn.setAttribute('title', 'Copy link to this section');
      btn.textContent = '\uD83D\uDD17';
      btn.dataset.targetId = els[i].id;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var url = location.origin + location.pathname + '#' + this.dataset.targetId;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
        this.textContent = '\u2705';
        var self = this;
        setTimeout(function () { self.textContent = '\uD83D\uDD17'; }, 1500);
      });
      els[i].style.position = els[i].style.position || 'relative';
      els[i].appendChild(btn);
    }
  }

  function initPermalinks() {
    generatePermalinkIds();
    addPermalinkCopyButtons();
    handlePermalinkHash();
    window.addEventListener('hashchange', handlePermalinkHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPermalinks);
  } else {
    // Delay slightly to ensure DOM is fully rendered
    setTimeout(initPermalinks, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
