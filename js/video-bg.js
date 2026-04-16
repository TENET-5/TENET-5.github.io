/* ═══════════════════════════════════════════════════════
   TENET5 Video Background — RE-ENABLED 2026-04-16
   Per-page investigation video backgrounds.
   CSS-safe: no position overrides on child elements.
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // Page → video mapping — COMPREHENSIVE: every page mapped by investigation domain
  var PAGE_VIDEOS = {
    // ── MAID / Medical euthanasia investigation ──
    'maid-accountability.html':       'maid_investigation_bg.mp4',
    'maid-voting-record.html':        'maid_investigation_bg.mp4',
    'maid-master-dossier.html':       'maid_investigation_bg.mp4',
    'maid-speech-evidence.html':      'maid_investigation_bg.mp4',
    'maid-policy-evolution.html':     'maid_investigation_bg.mp4',
    'maid-provincial.html':           'maid_investigation_bg.mp4',
    'maid-mental-health.html':        'maid_investigation_bg.mp4',
    'maid-economics.html':            'maid_investigation_bg.mp4',
    'maid-exterminators.html':        'red_pulse_bg.mp4',
    'maid-dossier-index.html':        'maid_investigation_bg.mp4',
    'maid-hansard-record.html':       'maid_investigation_bg.mp4',
    'veterans-maid-cases.html':       'maid_investigation_bg.mp4',
    'disability-genocide.html':       'red_pulse_bg.mp4',
    'immigration-maid-pipeline.html': 'maid_investigation_bg.mp4',
    'cija-maid-pipeline.html':        'maid_investigation_bg.mp4',
    'rcmp-maid-accountability.html':  'maid_investigation_bg.mp4',
    'demographics-to-death.html':     'maid_investigation_bg.mp4',
    'disability-benefit.html':        'maid_investigation_bg.mp4',
    'mental-health-funding-gap.html': 'maid_investigation_bg.mp4',
    'who-is-harmed.html':             'red_pulse_bg.mp4',
    'veteran-suicide.html':           'maid_investigation_bg.mp4',

    // ── Veterans / Military ──
    'veterans.html':                  'cfnis_military_bg.mp4',
    'veterans-betrayal.html':         'cfnis_military_bg.mp4',
    'cfnis.html':                     'cfnis_military_bg.mp4',
    'cfnis-proxy.html':               'cfnis_military_bg.mp4',
    'cds-accountability.html':        'cfnis_military_bg.mp4',
    'cds-carignan-charges.html':      'cfnis_military_bg.mp4',
    'ppcli-lawsuit.html':             'cfnis_military_bg.mp4',
    'military-housing.html':          'cfnis_military_bg.mp4',
    'military-procurement-failures.html': 'cfnis_military_bg.mp4',
    'military-purge.html':            'cfnis_military_bg.mp4',
    'caf-recruitment.html':           'cfnis_military_bg.mp4',
    'caf-recruitment-crisis.html':    'cfnis_military_bg.mp4',
    'dnd-procurement.html':           'cfnis_military_bg.mp4',
    'submarine-timeline.html':        'cfnis_military_bg.mp4',
    'belleville.html':                'cfnis_military_bg.mp4',
    'gillespie-murder.html':          'red_pulse_bg.mp4',

    // ── Foreign interference / influence ──
    'foreign-interference.html':      'foreign_interference_bg.mp4',
    'foreign-interference-deep.html': 'foreign_interference_bg.mp4',
    'foreign-influence.html':         'foreign_interference_bg.mp4',
    'foreign-influence-alpha.html':   'foreign_interference_bg.mp4',
    'influence-target-alpha.html':    'foreign_interference_bg.mp4',
    'cija-lobbying.html':             'foreign_interference_bg.mp4',
    'bill-c70-registry.html':         'foreign_interference_bg.mp4',
    'cda-institute-psyop.html':       'foreign_interference_bg.mp4',
    '5gw-subversion.html':            'foreign_interference_bg.mp4',
    'epstein-canadian-connections.html': 'foreign_interference_bg.mp4',
    'epstein-maxwell.html':           'foreign_interference_bg.mp4',
    'wef-corridor.html':              'foreign_interference_bg.mp4',
    'wef-davos.html':                 'foreign_interference_bg.mp4',

    // ── Ethics / conflicts of interest ──
    'ethics-failures.html':           'ethics_violations_bg.mp4',
    'carney-conflicts.html':          'ethics_violations_bg.mp4',
    'carney-wef.html':                'ethics_violations_bg.mp4',
    'brookfield-maid.html':           'ethics_violations_bg.mp4',
    'conflict-of-interest-registry.html': 'ethics_violations_bg.mp4',
    'regulatory-capture.html':        'ethics_violations_bg.mp4',
    'senate-expenses.html':           'ethics_violations_bg.mp4',
    'senate-accountability.html':     'ethics_violations_bg.mp4',
    'ag-findings.html':               'ethics_violations_bg.mp4',
    'institutional-capture.html':     'ethics_violations_bg.mp4',
    'institutional-malice.html':      'red_pulse_bg.mp4',
    'cabinet-confidence.html':        'ethics_violations_bg.mp4',
    'parliamentary-privilege.html':   'ethics_violations_bg.mp4',
    'prorogation.html':               'ethics_violations_bg.mp4',
    'judicial-appointments.html':     'ethics_violations_bg.mp4',
    'judicial-independence.html':     'ethics_violations_bg.mp4',
    'crown-immunity.html':            'ethics_violations_bg.mp4',
    'appointments.html':              'ethics_violations_bg.mp4',
    'democratic-deficit.html':        'ethics_violations_bg.mp4',

    // ── Financial / procurement ──
    'follow-the-money.html':          'lobbying_concentration_bg.mp4',
    'corruption-map.html':            'lobbying_concentration_bg.mp4',
    'bank-of-canada.html':            'lobbying_concentration_bg.mp4',
    'pension-fund-conflicts.html':    'lobbying_concentration_bg.mp4',
    'sector-lobbying.html':           'lobbying_concentration_bg.mp4',
    'lobbying-tracker.html':          'lobbying_concentration_bg.mp4',
    'lobbying-deepdive.html':         'lobbying_concentration_bg.mp4',
    'lobbying-industrial-complex.html': 'lobbying_concentration_bg.mp4',
    'lobbying-threshold-2026.html':   'lobbying_concentration_bg.mp4',
    'corporate-welfare.html':         'lobbying_concentration_bg.mp4',
    'contributions-tracker.html':     'lobbying_concentration_bg.mp4',
    'political-donation-system.html': 'lobbying_concentration_bg.mp4',
    'elections-finance.html':         'lobbying_concentration_bg.mp4',
    'debt-fiscal.html':               'lobbying_concentration_bg.mp4',
    'debt-servicing.html':            'lobbying_concentration_bg.mp4',
    'federal-contract-waste.html':    'lobbying_concentration_bg.mp4',
    'infrastructure-bank.html':       'lobbying_concentration_bg.mp4',
    'telecom-oligopoly.html':         'lobbying_concentration_bg.mp4',
    'privatization-timeline.html':    'lobbying_concentration_bg.mp4',
    'housing-financialization.html':  'lobbying_concentration_bg.mp4',
    'snc-lavalin.html':               'lobbying_concentration_bg.mp4',
    'tariff-impact-2025.html':        'lobbying_concentration_bg.mp4',
    'carbon-tax.html':                'lobbying_concentration_bg.mp4',
    'tax-policy.html':                'lobbying_concentration_bg.mp4',

    // ── Procurement scandals ──
    'arrivecan.html':                 'arrivecan_scandal_bg.mp4',
    'procurement-deep-dive.html':     'arrivecan_scandal_bg.mp4',
    'procurement-registry.html':      'arrivecan_scandal_bg.mp4',
    'procurement-analysis.html':      'arrivecan_scandal_bg.mp4',
    'indigenous-procurement-fraud.html': 'arrivecan_scandal_bg.mp4',

    // ── Panama Papers ──
    'panama-papers.html':             'panama_papers_bg.mp4',

    // ── Phoenix Pay ──
    'phoenix-pay.html':               'phoenix_pay_bg.mp4',

    // ── Legal / s.504 / prosecution ──
    's504-covey-bae.html':            's504_charges_bg.mp4',
    's504-court-filing.html':         's504_charges_bg.mp4',
    's504-tracker.html':              's504_charges_bg.mp4',
    'prosecution.html':               's504_charges_bg.mp4',
    'charges-sheet.html':             's504_charges_bg.mp4',
    'criminal-code-analysis.html':    's504_charges_bg.mp4',
    'class-action-guide.html':        's504_charges_bg.mp4',
    'legislation.html':               's504_charges_bg.mp4',
    'legal.html':                     's504_charges_bg.mp4',

    // ── Genocide / harm / crisis ──
    'genocide-evidence.html':         'red_pulse_bg.mp4',
    'rogue-state.html':               'red_pulse_bg.mp4',
    'treason-trajectory.html':        'red_pulse_bg.mp4',
    't4-comparison.html':             'red_pulse_bg.mp4',
    'cost-of-failure.html':           'red_pulse_bg.mp4',
    'harm-index.html':                'red_pulse_bg.mp4',
    'opioid-crisis.html':             'red_pulse_bg.mp4',
    'opioid-crisis-accountability.html': 'red_pulse_bg.mp4',
    'pharmaceutical-dependence.html': 'red_pulse_bg.mp4',
    'healthcare-crisis.html':         'red_pulse_bg.mp4',
    'healthcare-privatization.html':  'red_pulse_bg.mp4',
    'nursing-crisis.html':            'red_pulse_bg.mp4',
    'long-term-care-failures.html':   'red_pulse_bg.mp4',
    'homelessness-crisis.html':       'red_pulse_bg.mp4',
    'housing-crisis.html':            'red_pulse_bg.mp4',
    'housing-crisis-by-city.html':    'red_pulse_bg.mp4',
    'water-crisis.html':              'red_pulse_bg.mp4',
    'water-sovereignty.html':         'red_pulse_bg.mp4',
    'food-security-sovereignty.html': 'red_pulse_bg.mp4',
    'food-supply-concentration.html': 'red_pulse_bg.mp4',
    'child-welfare-crisis.html':      'red_pulse_bg.mp4',
    'passport-crisis.html':           'red_pulse_bg.mp4',
    'energy-sovereignty.html':        'red_pulse_bg.mp4',

    // ── Surveillance / security ──
    'phac-mandates-s6.html':          'dark_atmosphere_bg.mp4',
    'bill-c63-online-harms.html':     'dark_atmosphere_bg.mp4',
    'bill-c22-surveillance.html':     'dark_atmosphere_bg.mp4',
    'privacy-surveillance.html':      'dark_atmosphere_bg.mp4',
    'digital-identity.html':          'dark_atmosphere_bg.mp4',
    'data-sovereignty.html':          'dark_atmosphere_bg.mp4',
    'cyber-security-failures.html':   'dark_atmosphere_bg.mp4',
    'csis-oversight.html':            'dark_atmosphere_bg.mp4',
    'national-security-state.html':   'dark_atmosphere_bg.mp4',
    'police-militarization.html':     'dark_atmosphere_bg.mp4',
    'emergencies-act.html':           'dark_atmosphere_bg.mp4',
    'supply-chain-vulnerability.html':'dark_atmosphere_bg.mp4',

    // ── Indigenous / human rights ──
    'indigenous-accountability.html': 'maid_investigation_bg.mp4',
    'indigenous-treaty-violations.html': 'maid_investigation_bg.mp4',
    'charity-pipeline.html':          'ethics_violations_bg.mp4',

    // ── RCMP / policing ──
    'rcmp-commissioners.html':        'cfnis_military_bg.mp4',
    'rcmp-reform.html':               'cfnis_military_bg.mp4',
    'rcmp-complicity.html':           'cfnis_military_bg.mp4',
    'rcmp-non-enforcement.html':      'cfnis_military_bg.mp4',

    // ── Immigration ──
    'immigration-exploitation.html':  'foreign_interference_bg.mp4',
    'immigration-policy.html':        'foreign_interference_bg.mp4',
    'immigration-pathway-comparison.html': 'foreign_interference_bg.mp4',
    'credential-exploitation-data.html': 'foreign_interference_bg.mp4',
    'tfw-abuse.html':                 'foreign_interference_bg.mp4',

    // ── COVID / pandemic ──
    'covid-accountability.html':      'arrivecan_scandal_bg.mp4',
    'pandemic-response-audit.html':   'arrivecan_scandal_bg.mp4',
    'pharmacare.html':                'arrivecan_scandal_bg.mp4',
    'dental-care.html':               'arrivecan_scandal_bg.mp4',
    'childcare.html':                 'arrivecan_scandal_bg.mp4',

    // ── Analysis / dashboard / tools ──
    'network-analysis.html':          'dark_atmosphere_bg.mp4',
    'cross-reference.html':           'dark_atmosphere_bg.mp4',
    'convergence-matrix.html':        'dark_atmosphere_bg.mp4',
    'investigation-matrix.html':      'dark_atmosphere_bg.mp4',
    'osint-dashboard.html':           'dark_atmosphere_bg.mp4',
    'dossier-viewer.html':            'dark_atmosphere_bg.mp4',
    'entity-viewer.html':             'dark_atmosphere_bg.mp4',
    'conspiracy-board.html':          'dark_atmosphere_bg.mp4',
    'liril-analysis.html':            'dark_atmosphere_bg.mp4',
    'system-architecture.html':       'dark_atmosphere_bg.mp4',
    'complete-thesis.html':           'dark_atmosphere_bg.mp4',
    'failure-timeline.html':          'dark_atmosphere_bg.mp4',
    'timeline.html':                  'dark_atmosphere_bg.mp4',
    'findings.html':                  'dark_atmosphere_bg.mp4',
    'evidence.html':                  'dark_atmosphere_bg.mp4',
    'evidence-index.html':            'dark_atmosphere_bg.mp4',
    'report-generator.html':          'dark_atmosphere_bg.mp4',
    'hansard-dashboard.html':         'dark_atmosphere_bg.mp4',
    'hansard-evidence.html':          'dark_atmosphere_bg.mp4',
    'master-index.html':              'dark_atmosphere_bg.mp4',
    'records.html':                   'dark_atmosphere_bg.mp4',
    'campaign-tracker.html':          'dark_atmosphere_bg.mp4',

    // ── MP / voting / election ──
    'mp-voting-records.html':         'ethics_violations_bg.mp4',
    'mp-scorecard.html':              'ethics_violations_bg.mp4',
    'mp-analysis.html':               'ethics_violations_bg.mp4',
    'mp-brief.html':                  'ethics_violations_bg.mp4',
    'voting-records.html':            'ethics_violations_bg.mp4',
    'maid-voting-record.html':        'maid_investigation_bg.mp4',
    'election-2025.html':             'ethics_violations_bg.mp4',
    'promise-tracker.html':           'ethics_violations_bg.mp4',
    'budget-2025-analysis.html':      'lobbying_concentration_bg.mp4',
    'accountability-scorecard.html':  'ethics_violations_bg.mp4',
    'accountability-reform-history.html': 'ethics_violations_bg.mp4',

    // ── Regional / municipal ──
    'municipal-accountability.html':  'dark_atmosphere_bg.mp4',
    'municipal-intelligence.html':    'dark_atmosphere_bg.mp4',
    'provincial-analysis.html':       'dark_atmosphere_bg.mp4',
    'toronto.html':                   'dark_atmosphere_bg.mp4',
    'vancouver.html':                 'dark_atmosphere_bg.mp4',
    'calgary.html':                   'dark_atmosphere_bg.mp4',
    'ottawa.html':                    'dark_atmosphere_bg.mp4',
    'quinte-west.html':               'cfnis_military_bg.mp4',
    'nova-scotia-oic.html':           'dark_atmosphere_bg.mp4',
    'evidence-ns-oic.html':           'dark_atmosphere_bg.mp4',

    // ── Whistleblower ──
    'whistleblower-act.html':         'ethics_violations_bg.mp4',
    'whistleblower-failures.html':    'ethics_violations_bg.mp4',
    'whistleblower-guide.html':       'ethics_violations_bg.mp4',
    'whistleblower-protection-failure.html': 'ethics_violations_bg.mp4',

    // ── Action / engagement ──
    'take-action.html':               'red_pulse_bg.mp4',
    'open-letter.html':               'red_pulse_bg.mp4',
    'citizens-toolkit.html':          'red_pulse_bg.mp4',
    'what-reform-looks-like.html':    'ethics_violations_bg.mp4',
    'petitions.html':                 'ethics_violations_bg.mp4',
    'community.html':                 'dark_atmosphere_bg.mp4',

    // ── About / info ──
    'about.html':                     'dark_atmosphere_bg.mp4',
    'my-story.html':                  'cfnis_military_bg.mp4',
    'history.html':                   'dark_atmosphere_bg.mp4',
    'faq.html':                       'dark_atmosphere_bg.mp4',
    'resources.html':                 'dark_atmosphere_bg.mp4',
    'methodology-transparency.html':  'dark_atmosphere_bg.mp4',
    'publications.html':              'dark_atmosphere_bg.mp4',
    'ai-research.html':               'dark_atmosphere_bg.mp4',
    'site-changelog.html':            'dark_atmosphere_bg.mp4',

    // ── Sovereignty / defense ──
    'arctic-sovereignty.html':        'cfnis_military_bg.mp4',
    'sovereignty-summary.html':       'cfnis_military_bg.mp4',
    'arms-exports.html':              'cfnis_military_bg.mp4',
    'arms-pipeline.html':             'cfnis_military_bg.mp4',

    // ── Crown / CRA ──
    'crown-corporations.html':        'ethics_violations_bg.mp4',
    'crown-corporation-oversight.html': 'ethics_violations_bg.mp4',
    'cra-enforcement.html':           'lobbying_concentration_bg.mp4',
    'cra-enforcement-gap.html':       'lobbying_concentration_bg.mp4',

    // ── Misc special pages ──
    'accountability.html':            's504_charges_bg.mp4',
    'acelephius-report.html':         'dark_atmosphere_bg.mp4',
    'acelephius-wardoll.html':        'dark_atmosphere_bg.mp4',
    'before-and-after-2015.html':     'ethics_violations_bg.mp4',
    'bloggins.html':                  'cfnis_military_bg.mp4',
    'the-boot.html':                  'cfnis_military_bg.mp4',
    'campaign-generator.html':        'dark_atmosphere_bg.mp4',
    'atip-backlog.html':              'ethics_violations_bg.mp4',
    'scandals.html':                  'red_pulse_bg.mp4',
    'order-in-council.html':          'ethics_violations_bg.mp4',
    'doctor-shortage-by-province.html': 'red_pulse_bg.mp4',
    'infrastructure-deficit.html':    'arrivecan_scandal_bg.mp4',
    'media-capture.html':             'foreign_interference_bg.mp4',
    'media-concentration.html':       'foreign_interference_bg.mp4',
    'media-coverage-gaps.html':       'foreign_interference_bg.mp4',
    'infographics.html':              'dark_atmosphere_bg.mp4',
    'ledger-book.html':               'lobbying_concentration_bg.mp4',
    'share-pack.html':                'dark_atmosphere_bg.mp4',
    'press-kit.html':                 'dark_atmosphere_bg.mp4',
    'key-facts.html':                 'red_pulse_bg.mp4',
    'reading-order.html':             'dark_atmosphere_bg.mp4',
    'canada-map.html':                'dark_atmosphere_bg.mp4',
    'canada-vs-world.html':           'dark_atmosphere_bg.mp4',
    'environment-climate.html':       'dark_atmosphere_bg.mp4',
    'news.html':                      'dark_atmosphere_bg.mp4',
    'permalink.html':                 'dark_atmosphere_bg.mp4',
    '404.html':                       'red_pulse_bg.mp4',
  };

  var DEFAULT_VIDEO = 'red_pulse_bg.mp4';
  var BASE_PATH = '/media/backgrounds/';
  var LOOP_SECONDS = 15;

  // Skip on pages where video bg doesn't make sense
  var SKIP = ['index.html', 'search.html', 'sitemap.html', 'auth-callback.html',
              'email-campaign.html', 'email-dispatch.html', 'chalkboard.html'];

  function getPageName() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function injectVideo() {
    var page = getPageName();
    if (SKIP.indexOf(page) !== -1) return;

    // Don't duplicate
    if (document.querySelector('.t5-video-wrap, .t5-video-bg')) return;

    var videoFile = PAGE_VIDEOS[page] || DEFAULT_VIDEO;
    var videoUrl = BASE_PATH + videoFile;

    var wrap = document.createElement('div');
    wrap.className = 't5-video-wrap';
    wrap.setAttribute('aria-hidden', 'true');

    // Create video element
    var video = document.createElement('video');
    video.className = 't5-video-bg';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.dataset.loopSeconds = String(LOOP_SECONDS);
    video.playsInline = true;
    video.poster = '/media/retro-warroom-poster.jpg';
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'auto';

    video.addEventListener('loadeddata', function() {
      document.body.classList.add('t5-video-ready');
    });

    video.addEventListener('timeupdate', function() {
      if (video.currentTime >= LOOP_SECONDS) {
        video.currentTime = 0.05;
      }
    });

    video.addEventListener('error', function() {
      document.body.classList.add('t5-video-error');
      console.warn('[video-bg] Failed to load background video:', videoUrl);
    });

    var source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    video.appendChild(source);
    wrap.appendChild(video);

    document.body.classList.add('has-t5-video-bg');

    // Hide the retro-film-bg backdrop when video is active
    var retroBg = document.querySelector('.retro-film-bg');
    if (retroBg) retroBg.style.display = 'none';

    // Insert at the start of body
    document.body.insertBefore(wrap, document.body.firstChild);

    // Start playback (handle autoplay policy)
    video.play().catch(function() {
      // Autoplay blocked — poster/fallback remains visible
    });
  }

  // CSS for video background — z-index:-1 ensures content is ALWAYS above video
  var style = document.createElement('style');
  style.textContent =
    '.t5-video-wrap{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:-1;background:radial-gradient(circle at center, rgba(15,23,42,0.18), rgba(2,6,23,0.72))}' +
    '.t5-video-bg{position:absolute;top:0;left:0;width:100vw;height:100vh;object-fit:cover;opacity:0.52;pointer-events:none;filter:brightness(0.72) saturate(0.95) contrast(1.05)}' +
    /* Ensure all page content renders above the video layer */
    'main,.content,.presentation-container,section,article,.container,.page-content,.glass-panel,.record-card,.stat-grid,.stat-hero-banner,.evidence-cinematic,[data-chapter]{position:relative;z-index:1}' +
    '@media(prefers-reduced-motion:reduce){.t5-video-wrap{display:none}}' +
    '@media(max-width:768px){.t5-video-bg{opacity:0.34;filter:brightness(0.78) saturate(0.9)}}';
  document.head.appendChild(style);

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectVideo);
  } else {
    injectVideo();
  }
})();
