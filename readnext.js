/**
 * Canadian Accountability Project — "Read Next" Navigation v2.0
 *
 * Adds a guided "What to read next" section at the bottom of investigation pages.
 * The investigation has a logical flow: understand the problem → see the evidence →
 * follow the money → take action. This component guides visitors through that flow.
 *
 * v2.0 — Full 82-page FLOW map coverage (up from 25 in v1.0).
 *
 * Place <div id="read-next"></div> in pages that should show navigation.
 * If no element exists, the script does nothing.
 */
(function() {
  'use strict';

  // Guard: prevent double execution
  if (window.__TENET5_READNEXT_LOADED) return;
  window.__TENET5_READNEXT_LOADED = true;

  // Investigation flow — each page knows what comes next
  var FLOW = {
    'index.html': {
      current: 'The Numbers',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M government records' },
        { href: 'arms-pipeline.html', label: 'The Arms Pipeline', desc: '$229M+ flowing to Israel despite the "pause"' },
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
        { href: 'charity-pipeline.html', label: 'Charity Pipeline', desc: '12 CRA revocations, $276M annual flow' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP' },
        { href: 'findings.html', label: 'All 26+ Findings', desc: 'The complete cross-reference analysis' },
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
        { href: 'epstein-maxwell.html', label: 'Epstein & Maxwell Network', desc: 'Elite trafficking, Nygard conviction, Canadian political donations' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'See all the patterns we found' },
        { href: 'voting-records.html', label: 'Voting Records', desc: 'How every party voted on every bill' },
      ]
    },
    'epstein-maxwell.html': {
      current: 'Epstein & Maxwell Network',
      next: [
        { href: 'epstein-canadian-connections.html', label: 'Canadian Political Entanglement', desc: 'SDNY records mapping deeper Canadian institutional intersections' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'How lobbying translates to systemic decay' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Browse the unsealed records' },
      ]
    },
    'epstein-canadian-connections.html': {
      current: 'Canadian Political Entanglement',
      next: [
        { href: 'epstein-maxwell.html', label: 'Epstein & Maxwell Network', desc: 'The elite global trafficking structure' },
        { href: 'accountability.html', label: 'The 504 Database', desc: 'Review the actual accountability tracking database' },
        { href: 'dossier-viewer.html', label: 'Intelligence Dossiers', desc: 'Browse the remaining 12 OSINT targets' },
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
        { href: 'findings.html', label: 'All 26+ Findings', desc: 'What CAP OSINT found in the data' },
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
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '21 investigation panels' },
      ]
    },

    'cfnis.html': {
      current: 'CFNIS Investigation',
      next: [
        { href: 's504-covey-bae.html', label: 's.504 Prosecution: Covey & Bae', desc: 'Information filed against CFNIS under Criminal Code s.504' },
        { href: 'ppcli-lawsuit.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
      ]
    },
    's504-covey-bae.html': {
      current: 's.504 Prosecution — Covey & Bae',
      next: [
        { href: 'cfnis.html', label: 'CFNIS Investigation', desc: 'Military police accountability' },
        { href: 'ppcli-lawsuit.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
      ]
    },
    'voting-records.html': {
      current: 'Voting Records',
      next: [
        { href: 'mp-voting-records.html', label: 'MP Voting Records', desc: 'How 25 key MPs voted on MAID, firearms, censorship' },
        { href: 'hansard-dashboard.html', label: 'Hansard Dashboard', desc: '151 bills tracked in Parliament' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'How lobbying connects to votes' },
      ]
    },
    'mp-voting-records.html': {
      current: 'MP Voting Records',
      next: [
        { href: 'voting-records.html', label: 'Full Voting Records', desc: '151 bills, 94 divisions — complete Parliament tracker' },
        { href: 'mp-scorecard.html', label: 'MP Scorecard', desc: 'All 340 MPs scored against lobbying and CIJA data' },
        { href: 'hansard-dashboard.html', label: 'Hansard Dashboard', desc: 'Deep dive into Hansard division records' },
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
        { href: 'findings.html', label: 'All 26+ Findings', desc: 'Cross-reference analysis' },
      ]
    },
    'procurement-analysis.html': {
      current: 'Procurement Analysis',
      next: [
        { href: 'corruption-map.html', label: 'Corruption Map', desc: '37 documented scandals' },
        { href: 'arms-pipeline.html', label: 'Arms Pipeline', desc: '$229M+ to Israel despite pause' },
        { href: 'findings.html', label: 'All 26+ Findings', desc: 'What the data reveals' },
      ]
    },
    'mp-scorecard.html': {
      current: 'MP Scorecard',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '21 patterns from 7M records' },
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals' },
        { href: 'legal.html', label: 'Legal Framework', desc: 'Accountability tools + reform recommendations' },
      ]
    },
    'carney-conflicts.html': {
      current: 'Carney Conflicts',
      next: [
        { href: 'panama-papers.html', label: '8 Offshore Leaks', desc: '268,488 entities, $76M unpaid taxes, 0 prosecutions' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The MAID-Brookfield-FINTRAC fiscal pipeline' },
        { href: 'sector-lobbying.html', label: 'Sector Lobbying', desc: '359,251 contacts by industry' },
      ]
    },
    'panama-papers.html': {
      current: '8 Offshore Leaks',
      next: [
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$6.8M Brookfield options, FINTRAC defunded' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The complete fiscal pipeline' },
        { href: 'conflict-of-interest-registry.html', label: 'COI Registry', desc: 'Every documented conflict of interest' },
      ]
    },
    'sector-lobbying.html': {
      current: 'Sector Lobbying',
      next: [
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'Israel 2,176 vs China 93 (23:1 ratio)' },
        { href: 'mp-scorecard.html', label: 'MP Scorecard', desc: 'Which MPs are most lobbied' },
      ]
    },
    'lobbying-tracker.html': {
      current: 'Lobbying Tracker',
      next: [
        { href: 'sector-lobbying.html', label: 'Sector Lobbying', desc: '359,251 contacts broken down by industry' },
        { href: 'contributions-tracker.html', label: 'Contributions', desc: '6.2M donation records since 2004' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'What the lobbying data reveals' },
      ]
    },
    'contributions-tracker.html': {
      current: 'Contributions Tracker',
      next: [
        { href: 'lobbying-tracker.html', label: 'Lobbying Tracker', desc: 'Who meets with whom' },
        { href: 'mp-scorecard.html', label: 'MP Scorecard', desc: 'All 340 MPs scored' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'Follow the money patterns' },
      ]
    },
    'evidence-index.html': {
      current: 'Evidence Index',
      next: [
        { href: 'about.html', label: 'About & Methodology', desc: 'How to verify every claim' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'What the data reveals' },
        { href: 'legal.html', label: 'Legal Framework', desc: 'Accountability tools + reform recommendations' },
      ]
    },
    'legal.html': {
      current: 'Legal Framework',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: 'The evidence that supports action' },
        { href: 'mp-scorecard.html', label: 'MP Scorecard', desc: 'Which MPs should champion reform' },
        { href: 'about.html', label: 'About & Methodology', desc: 'How the data was collected' },
      ]
    },
    '5gw-subversion.html': {
      current: '5GW Subversion',
      next: [
        { href: 'treason-trajectory.html', label: 'Treason Trajectory', desc: 'Pattern of policy decisions against national interest' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP' },
        { href: 'history.html', label: 'History', desc: 'Historical context behind the subversion' },
      ]
    },
    'acelephius-report.html': {
      current: 'Acelephius Report',
      next: [
        { href: 'acelephius-wardoll.html', label: 'Acelephius Wardoll', desc: 'Follow-up analysis on the Acelephius case' },
        { href: 'network-analysis.html', label: 'Network Analysis', desc: '94 nodes, 169 connections mapped' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search the source data yourself' },
      ]
    },
    'acelephius-wardoll.html': {
      current: 'Acelephius Wardoll',
      next: [
        { href: 'acelephius-report.html', label: 'Acelephius Report', desc: 'The initial Acelephius investigation' },
        { href: 'cfnis.html', label: 'CFNIS Investigation', desc: 'Military police accountability' },
        { href: 'ppcli-lawsuit.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
      ]
    },
    'ag-findings.html': {
      current: 'AG Findings',
      next: [
        { href: 'phoenix-pay.html', label: 'Phoenix Pay', desc: 'The Phoenix pay system debacle' },
        { href: 'procurement-deep-dive.html', label: 'Procurement Deep Dive', desc: 'Detailed procurement failure analysis' },
        { href: 'elections-finance.html', label: 'Elections Finance', desc: 'Political financing and election data' },
      ]
    },
    'ai-research.html': {
      current: 'AI Research',
      next: [
        { href: 'search.html', label: 'Search', desc: 'Search across the full dataset' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search 6.8M records yourself' },
      ]
    },
    'belleville.html': {
      current: 'Belleville',
      next: [
        { href: 'quinte-west.html', label: 'Quinte West', desc: 'Neighbouring municipality accountability' },
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
        { href: 'ottawa.html', label: 'Ottawa', desc: 'Capital city municipal analysis' },
      ]
    },
    'bloggins.html': {
      current: 'Bloggins',
      next: [
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Look at the data and take action' },
        { href: 'about.html', label: 'About & Methodology', desc: 'How the data was collected' },
      ]
    },
    'calgary.html': {
      current: 'Calgary',
      next: [
        { href: 'vancouver.html', label: 'Vancouver', desc: 'West coast municipal analysis' },
        { href: 'toronto.html', label: 'Toronto', desc: 'GTA municipal analysis' },
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
      ]
    },
    'campaign-generator.html': {
      current: 'Campaign Generator',
      next: [
        { href: 'campaign-tracker.html', label: 'Campaign Tracker', desc: 'Track your campaign progress' },
        { href: 'email-campaign.html', label: 'Email Campaign', desc: 'Pre-built email templates for MPs' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
      ]
    },
    'campaign-tracker.html': {
      current: 'Campaign Tracker',
      next: [
        { href: 'campaign-generator.html', label: 'Campaign Generator', desc: 'Create new campaign materials' },
        { href: 'email-campaign.html', label: 'Email Campaign', desc: 'Pre-built email templates for MPs' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
      ]
    },
    'canada-map.html': {
      current: 'Canada Map',
      next: [
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
        { href: 'provincial-analysis.html', label: 'Provincial Analysis', desc: 'Province-by-province breakdown' },
        { href: 'corruption-map.html', label: 'Corruption Map', desc: '37 documented procurement scandals' },
      ]
    },
    'charges-sheet.html': {
      current: 'Charges Sheet',
      next: [
        { href: 'criminal-code-analysis.html', label: 'Criminal Code Analysis', desc: 'Applicable Criminal Code sections' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
        { href: 'genocide-evidence.html', label: 'Genocide Evidence', desc: 'Documented evidence of complicity' },
      ]
    },
    'community.html': {
      current: 'Community',
      next: [
        { href: 'news.html', label: 'News', desc: 'Latest investigation updates' },
        { href: 'news.html', label: 'News', desc: 'Latest investigation updates' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
      ]
    },
    'conspiracy-board.html': {
      current: 'Conspiracy Board',
      next: [
        { href: 'network-analysis.html', label: 'Network Analysis', desc: '94 nodes, 169 connections mapped' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search the source data yourself' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP' },
      ]
    },
    'criminal-code-analysis.html': {
      current: 'Criminal Code Analysis',
      next: [
        { href: 'charges-sheet.html', label: 'Charges Sheet', desc: 'Specific charges and evidence mapping' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
        { href: 'legal.html', label: 'Legal Framework', desc: 'Accountability tools + reform recommendations' },
      ]
    },
    'cross-reference.html': {
      current: 'Cross-Reference',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M records' },
        { href: 'lobbying-tracker.html', label: 'Lobbying Tracker', desc: 'Who meets with whom' },
        { href: 'contributions-tracker.html', label: 'Contributions Tracker', desc: '6.2M donation records since 2004' },
      ]
    },
    'elections-finance.html': {
      current: 'Elections Finance',
      next: [
        { href: 'contributions-tracker.html', label: 'Contributions Tracker', desc: '6.2M donation records since 2004' },
        { href: 'lobbying-tracker.html', label: 'Lobbying Tracker', desc: 'Who meets with whom' },
        { href: 'mp-voting-records.html', label: 'MP Voting Records', desc: 'How 25 key MPs voted on key bills' },
      ]
    },
    'email-campaign.html': {
      current: 'Email Campaign',
      next: [
        { href: 'campaign-generator.html', label: 'Campaign Generator', desc: 'Create new campaign materials' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
        { href: 'mp-brief.html', label: 'MP Brief', desc: 'Brief your MP with the evidence' },
      ]
    },
    'entity-viewer.html': {
      current: 'Entity Viewer',
      next: [
        { href: 'dossier-viewer.html', label: 'Intelligence Dossiers', desc: '12 profiles on persons of interest' },
        { href: 'network-analysis.html', label: 'Network Analysis', desc: '94 nodes, 169 connections mapped' },
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search 6.8M records yourself' },
      ]
    },
    'evidence.html': {
      current: 'Evidence',
      next: [
        { href: 'evidence-index.html', label: 'Evidence Index', desc: 'Full index of sourced evidence' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M records' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
      ]
    },
    'faq.html': {
      current: 'FAQ',
      next: [
        { href: 'about.html', label: 'About & Methodology', desc: 'How the data was collected' },
        { href: 'history.html', label: 'History', desc: 'Historical context and background' },
        { href: 'resources.html', label: 'Resources', desc: 'Tools and reference materials' },
      ]
    },
    'genocide-evidence.html': {
      current: 'Genocide Evidence',
      next: [
        { href: 't4-comparison.html', label: 'T4 Comparison', desc: 'Historical parallels to the T4 program' },
        { href: 'harm-index.html', label: 'Harm Index', desc: 'Quantified harm across populations' },
        { href: 'rcmp-complicity.html', label: 'RCMP Complicity', desc: 'Documented law enforcement failures' },
      ]
    },
    'hansard-dashboard.html': {
      current: 'Hansard Dashboard',
      next: [
        { href: 'hansard-evidence.html', label: 'Hansard Evidence', desc: 'Parliamentary record evidence base' },
        { href: 'voting-records.html', label: 'Voting Records', desc: '151 bills, 94 divisions tracked' },
        { href: 'mp-voting-records.html', label: 'MP Voting Records', desc: 'How 25 key MPs voted on key bills' },
      ]
    },
    'hansard-evidence.html': {
      current: 'Hansard Evidence',
      next: [
        { href: 'hansard-dashboard.html', label: 'Hansard Dashboard', desc: '151 bills tracked in Parliament' },
        { href: 'voting-records.html', label: 'Voting Records', desc: 'How every party voted on every bill' },
        { href: 'rcmp-maid-accountability.html', label: 'RCMP MAID Accountability', desc: 'MAID enforcement oversight' },
      ]
    },
    'harm-index.html': {
      current: 'Harm Index',
      next: [
        { href: 't4-comparison.html', label: 'T4 Comparison', desc: 'Historical parallels to the T4 program' },
        { href: 'genocide-evidence.html', label: 'Genocide Evidence', desc: 'Documented evidence of complicity' },
        { href: 'rcmp-complicity.html', label: 'RCMP Complicity', desc: 'Documented law enforcement failures' },
      ]
    },
    'history.html': {
      current: 'History',
      next: [
        { href: 'timeline.html', label: 'Timeline', desc: 'Visual chronology of key events' },
        { href: 't4-comparison.html', label: 'T4 Comparison', desc: 'Historical parallels to the T4 program' },
        { href: '5gw-subversion.html', label: '5GW Subversion', desc: 'Fifth-generation warfare analysis' },
      ]
    },
    'infographics.html': {
      current: 'Infographics',
      next: [
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M records' },
        { href: 'harm-index.html', label: 'Harm Index', desc: 'Quantified harm across populations' },
        { href: 'ag-findings.html', label: 'AG Findings', desc: 'Auditor General investigation results' },
      ]
    },
    'ppcli-lawsuit.html': {
      current: 'PPCLI Lawsuit',
      next: [
        { href: 'cfnis.html', label: 'CFNIS Investigation', desc: 'Military police accountability' },
        { href: 'legal.html', label: 'Legal Framework', desc: 'Accountability tools + reform recommendations' },
        { href: 'veterans.html', label: 'Veterans', desc: 'Veterans advocacy and support' },
      ]
    },
    'mp-brief.html': {
      current: 'MP Brief',
      next: [
        { href: 'open-letter.html', label: 'Open Letter', desc: 'Public letter to elected officials' },
        { href: 'email-campaign.html', label: 'Email Campaign', desc: 'Pre-built email templates for MPs' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
      ]
    },
    'municipal-accountability.html': {
      current: 'Municipal Accountability',
      next: [
        { href: 'canada-map.html', label: 'Canada Map', desc: 'Geographic data visualization' },
        { href: 'municipal-intelligence.html', label: 'Municipal Intelligence', desc: 'Deep-dive municipal data analysis' },
        { href: 'ottawa.html', label: 'Ottawa', desc: 'Capital city municipal analysis' },
      ]
    },
    'municipal-intelligence.html': {
      current: 'Municipal Intelligence',
      next: [
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
        { href: 'canada-map.html', label: 'Canada Map', desc: 'Geographic data visualization' },
        { href: 'provincial-analysis.html', label: 'Provincial Analysis', desc: 'Province-by-province breakdown' },
      ]
    },
    'network-analysis.html': {
      current: 'Network Analysis',
      next: [
        { href: 'conspiracy-board.html', label: 'Conspiracy Board', desc: 'Visual connection mapping' },
        { href: 'entity-viewer.html', label: 'Entity Viewer', desc: 'Detailed entity profiles and links' },
        { href: 'dossier-viewer.html', label: 'Intelligence Dossiers', desc: '12 profiles on persons of interest' },
      ]
    },
    'news.html': {
      current: 'News',
      next: [
        { href: 'community.html', label: 'Community', desc: 'Join the investigation community' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
        { href: 'index.html', label: 'The Evidence', desc: '76,475 deaths — the numbers that prove it' },
      ]
    },
    'open-letter.html': {
      current: 'Open Letter',
      next: [
        { href: 'mp-brief.html', label: 'MP Brief', desc: 'Brief your MP with the evidence' },
        { href: 'email-campaign.html', label: 'Email Campaign', desc: 'Pre-built email templates for MPs' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
      ]
    },
    'ottawa.html': {
      current: 'Ottawa',
      next: [
        { href: 'toronto.html', label: 'Toronto', desc: 'GTA municipal analysis' },
        { href: 'belleville.html', label: 'Belleville', desc: 'Regional municipal analysis' },
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
      ]
    },
    'phoenix-pay.html': {
      current: 'Phoenix Pay',
      next: [
        { href: 'ag-findings.html', label: 'AG Findings', desc: 'Auditor General investigation results' },
        { href: 'procurement-deep-dive.html', label: 'Procurement Deep Dive', desc: 'Detailed procurement failure analysis' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
      ]
    },
    'procurement-deep-dive.html': {
      current: 'Procurement Deep Dive',
      next: [
        { href: 'procurement-registry.html', label: 'Procurement Registry', desc: 'Full registry of procurement records' },
        { href: 'procurement-analysis.html', label: 'Procurement Analysis', desc: '$191B in documented waste' },
        { href: 'ag-findings.html', label: 'AG Findings', desc: 'Auditor General investigation results' },
      ]
    },
    'procurement-registry.html': {
      current: 'Procurement Registry',
      next: [
        { href: 'procurement-deep-dive.html', label: 'Procurement Deep Dive', desc: 'Detailed procurement failure analysis' },
        { href: 'procurement-analysis.html', label: 'Procurement Analysis', desc: '$191B in documented waste' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M records' },
      ]
    },
    'provincial-analysis.html': {
      current: 'Provincial Analysis',
      next: [
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
        { href: 'canada-map.html', label: 'Canada Map', desc: 'Geographic data visualization' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M records' },
      ]
    },
    'quinte-west.html': {
      current: 'Quinte West',
      next: [
        { href: 'belleville.html', label: 'Belleville', desc: 'Neighbouring municipality analysis' },
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
        { href: 'ottawa.html', label: 'Ottawa', desc: 'Capital city municipal analysis' },
      ]
    },
    'rcmp-complicity.html': {
      current: 'RCMP Complicity',
      next: [
        { href: 'rcmp-reform.html', label: 'RCMP Reform', desc: 'Institutional failures and the case for fundamental reform' },
        { href: 'rcmp-maid-accountability.html', label: 'RCMP MAID Accountability', desc: 'MAID enforcement oversight' },
        { href: 't4-comparison.html', label: 'T4 Comparison', desc: 'Historical parallels to the T4 program' },
      ]
    },
    'rcmp-reform.html': {
      current: 'RCMP Reform',
      next: [
        { href: 'rcmp-complicity.html', label: 'RCMP Complicity', desc: 'Documented law enforcement failures' },
        { href: 'whistleblower-failures.html', label: 'Whistleblower Failures', desc: 'How Canada silences those who speak up' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'Foreign interference in Canadian democracy' },
      ]
    },
    'rcmp-maid-accountability.html': {
      current: 'RCMP MAID Accountability',
      next: [
        { href: 'rcmp-complicity.html', label: 'RCMP Complicity', desc: 'Documented law enforcement failures' },
        { href: 't4-comparison.html', label: 'T4 Comparison', desc: 'Historical parallels to the T4 program' },
        { href: 'mp-voting-records.html', label: 'MP Voting Records', desc: 'How 25 key MPs voted on MAID bills' },
      ]
    },

    'report-generator.html': {
      current: 'Report Generator',
      next: [
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search 6.8M records yourself' },
        { href: 'dossier-viewer.html', label: 'Intelligence Dossiers', desc: '12 profiles on persons of interest' },
        { href: 'search.html', label: 'Search', desc: 'Search across the full dataset' },
      ]
    },
    'resources.html': {
      current: 'Resources',
      next: [
        { href: 'faq.html', label: 'FAQ', desc: 'Frequently asked questions' },
        { href: 'about.html', label: 'About & Methodology', desc: 'How the data was collected' },
        { href: 'take-action.html', label: 'Take Action', desc: 'All the ways you can make a difference' },
      ]
    },
    'search.html': {
      current: 'Search',
      next: [
        { href: 'osint-dashboard.html', label: 'OSINT Dashboard', desc: 'Search 6.8M records yourself' },
        { href: 'evidence-index.html', label: 'Evidence Index', desc: 'Full index of sourced evidence' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M records' },
      ]
    },
    't4-comparison.html': {
      current: 'T4 Comparison',
      next: [
        { href: 'rcmp-maid-accountability.html', label: 'RCMP MAID Accountability', desc: 'MAID enforcement oversight' },
        { href: 'genocide-evidence.html', label: 'Genocide Evidence', desc: 'Documented evidence of complicity' },
        { href: 'harm-index.html', label: 'Harm Index', desc: 'Quantified harm across populations' },
      ]
    },
    'tfw-abuse.html': {
      current: 'TFW Abuse',
      next: [
        { href: 'demographics-to-death.html', label: 'Demographics-to-Death', desc: 'How immigration feeds the MAID pipeline' },
        { href: 'institutional-capture.html', label: 'Institutional Capture', desc: 'Connecting the exploitation nodes' },
        { href: 'network-analysis.html', label: 'Network Analysis', desc: 'Explore the full corruption graph' },
      ]
    },
    'demographics-to-death.html': {
      current: 'Demographics-to-Death Pipeline',
      next: [
        { href: 'institutional-capture.html', label: 'Institutional Capture', desc: 'Understanding the overarching system' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'Tracking the financial incentives' },
        { href: 's504-court-filing.html', label: 's.504 Legal Filing', desc: 'Execute criminal complaints directly' },
      ]
    },
    'take-action.html': {
      current: 'Take Action',
      next: [
        { href: 'email-campaign.html', label: 'Email Campaign', desc: 'Pre-built email templates for MPs' },
        { href: 'mp-brief.html', label: 'MP Brief', desc: 'Brief your MP with the evidence' },
        { href: 'open-letter.html', label: 'Open Letter', desc: 'Public letter to elected officials' },
      ]
    },
    'the-boot.html': {
      current: 'The Boot',
      next: [
        { href: 'rcmp-complicity.html', label: 'RCMP Complicity', desc: 'Documented law enforcement failures' },
        { href: 't4-comparison.html', label: 'T4 Comparison', desc: 'Historical parallels to the T4 program' },
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of misconduct' },
      ]
    },
    'timeline.html': {
      current: 'Timeline',
      next: [
        { href: 'history.html', label: 'History', desc: 'Historical context and background' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M records' },
        { href: 'index.html', label: 'The Evidence', desc: '76,475 deaths — the numbers that prove it' },
      ]
    },
    'toronto.html': {
      current: 'Toronto',
      next: [
        { href: 'ottawa.html', label: 'Ottawa', desc: 'Capital city municipal analysis' },
        { href: 'vancouver.html', label: 'Vancouver', desc: 'West coast municipal analysis' },
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
      ]
    },
    'treason-trajectory.html': {
      current: 'Treason Trajectory',
      next: [
        { href: '5gw-subversion.html', label: '5GW Subversion', desc: 'Fifth-generation warfare analysis' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP' },
        { href: 'history.html', label: 'History', desc: 'Historical context and background' },
      ]
    },
    'vancouver.html': {
      current: 'Vancouver',
      next: [
        { href: 'toronto.html', label: 'Toronto', desc: 'GTA municipal analysis' },
        { href: 'calgary.html', label: 'Calgary', desc: 'Alberta municipal analysis' },
        { href: 'municipal-accountability.html', label: 'Municipal Accountability', desc: 'Local government oversight tracker' },
      ]
    },
    'veterans.html': {
      current: 'How Canada Treats Its Veterans',
      next: [
        { href: 'ppcli-lawsuit.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
        { href: 'cds-accountability.html', label: 'CDS Accountability', desc: 'Chief of the Defence Staff record of failure' },
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
      ]
    },
    'whistleblower-guide.html': {
      current: 'Whistleblower Guide',
      next: [
        { href: 'whistleblower-failures.html', label: 'Whistleblower Failures', desc: 'How Canada punishes truth-tellers — PSDPA, PSIC, and systemic retaliation' },
        { href: 'legal.html', label: 'Legal Framework', desc: 'Accountability tools + reform recommendations' },
        { href: 'veterans.html', label: 'Veterans', desc: 'Veterans advocacy and support' },
      ]
    },
    'whistleblower-failures.html': {
      current: 'Whistleblower Failures',
      next: [
        { href: 'prosecution.html', label: 'Prosecution Framework', desc: 'ICC and domestic legal escalation paths' },
        { href: 'ethics-failures.html', label: 'Ethics Failures', desc: 'Violations found, zero consequences enforced' },
        { href: 'institutional-malice.html', label: 'Institutional Malice', desc: 'The doctrine of deliberate institutional harm' },
      ]
    },
        'dnd-procurement.html': {
      current: 'DND Procurement',
      next: [
        { href: 'phoenix-pay.html', label: 'Phoenix Pay Disaster', desc: 'Same pattern — $309M became $2.2B' },
        { href: 'ag-findings.html', label: 'AG Findings Database', desc: '12 AG reports, $103B+ documented waste' },
        { href: 'procurement-deep-dive.html', label: 'Procurement Deep Dive', desc: '1.26M contracts, 70K anomalies' },
      ]
    },
        'senate-expenses.html': {
      current: 'Senate Expenses',
      next: [
        { href: 'charges-sheet.html', label: 'Charges Sheet', desc: '38 officials, 42 charges documented' },
        { href: 'elections-finance.html', label: 'Elections & Finance', desc: 'Campaign finance disclosures' },
        { href: 'ag-findings.html', label: 'AG Findings', desc: '12 AG reports, $103B+ documented' },
      ]
    },
    'healthcare-crisis.html': {
      current: 'The Killing Fields of Neglect: Canada\'s Healthcare Collapse',
      next: [
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
        { href: 'disability-genocide.html', label: 'Disability & CRPD Violations', desc: 'UN Convention violations against disabled Canadians' },
        { href: 'maid-economics.html', label: 'The Economics of MAID', desc: 'Cost per death vs. cost of care — the fiscal pipeline' },
      ]
    },
    'opioid-crisis.html': {
      current: 'Opioid Crisis',
      next: [
        { href: 'healthcare-crisis.html', label: 'Healthcare Collapse', desc: 'Waitlist deaths, budget betrayal, CIHI data' },
        { href: 'maid-policy-evolution.html', label: 'MAID Policy Evolution', desc: '8-year legislative expansion of medical killing' },
        { href: 'disability-genocide.html', label: 'Disability & CRPD', desc: 'UN Convention violations against disabled Canadians' },
      ]
    },
    'media-concentration.html': {
      current: 'Media Concentration',
      next: [
        { href: 'telecom-oligopoly.html', label: 'Telecom Oligopoly', desc: 'Big Three control 87% of wireless — highest OECD prices, CRTC captured' },
        { href: 'privacy-surveillance.html', label: 'Privacy & Surveillance', desc: 'C-11 content regulation connects to media control' },
        { href: 'lobbying-deepdive.html', label: 'Lobbying Deep Dive', desc: 'Who lobbies for media subsidies and C-18 deals' },
      ]
    },
    'telecom-oligopoly.html': {
      current: 'Telecom Oligopoly',
      next: [
        { href: 'media-concentration.html', label: 'Media Concentration', desc: 'Same conglomerates own the news that covers telecom — Rogers, Bell, TELUS' },
        { href: 'lobbying-deepdive.html', label: 'Lobbying Deep Dive', desc: '1,400+ lobbying contacts — who writes the CRTC rules' },
        { href: 'privacy-surveillance.html', label: 'Privacy & Surveillance', desc: 'C-26 gives telecom carriers warrantless surveillance powers' },
      ]
    },
    'arms-exports.html': {
      current: 'Arms Exports',
      next: [
        { href: 'dnd-procurement.html', label: 'Defence Procurement', desc: '$100B military procurement — where the money goes' },
        { href: 'lobbying-deepdive.html', label: 'Lobbying Deep Dive', desc: 'Defence industry lobbying contacts' },
        { href: 'veterans-betrayal.html', label: 'Veterans Betrayal', desc: 'Canada sells weapons abroad, neglects its own soldiers' },
      ]
    },
    'maid-policy-evolution.html': {
      current: 'MAID Policy Evolution',
      next: [
        { href: 'maid-voting-record.html', label: 'MAID Voting Record', desc: '173 MPs — how every member voted on medical killing' },
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
        { href: 'disability-genocide.html', label: 'Disability & CRPD', desc: 'UN Convention violations against disabled Canadians' },
      ]
    },
    'disability-genocide.html': {
      current: 'Disability & CRPD Violations',
      next: [
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
        { href: 'genocide-evidence.html', label: 'Genocide Evidence', desc: 'Full pattern documentation across populations' },
        { href: 'who-is-harmed.html', label: 'Who Is Harmed', desc: 'Every affected population mapped' },
      ]
    },
    'lobbying-deepdive.html': {
      current: 'Lobbying Deep Dive',
      next: [
        { href: 'elections-finance.html', label: 'Elections & Finance', desc: 'Campaign contributions and lobbying data' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, UFWD pipelines' },
        { href: 'maid-policy-evolution.html', label: 'MAID Policy Evolution', desc: 'How pharma lobbying connects to MAID expansion' },
      ]
    },
    'veterans-betrayal.html': {
      current: 'Veterans Betrayal',
      next: [
        { href: 'dnd-procurement.html', label: 'DND Procurement', desc: '$100B+ in military procurement betrayals' },
        { href: 'rcmp-maid-accountability.html', label: 'RCMP & MAID', desc: 'Commissioner dereliction of duty' },
        { href: 'phoenix-pay.html', label: 'Phoenix Pay Disaster', desc: '$309M→$2.2B payroll catastrophe' },
      ]
    },
    'housing-crisis.html': {
      current: 'Housing Crisis',
      next: [
        { href: 'covid-accountability.html', label: 'COVID Accountability', desc: 'ArriveCAN, CERB fraud, $500B pandemic spending' },
        { href: 'crown-corporations.html', label: 'Crown Corporations', desc: 'Canada Post, CBC, Via Rail — $7B+ burned' },
        { href: 'lobbying-deepdive.html', label: 'Lobbying Deep Dive', desc: 'How lobbyists shaped housing policy' },
      ]
    },
    'crown-corporations.html': {
      current: 'Crown Corporations',
      next: [
        { href: 'ag-findings.html', label: 'AG Findings Database', desc: '12 AG reports, $103B+ documented failures' },
        { href: 'phoenix-pay.html', label: 'Phoenix Pay Disaster', desc: '$309M→$2.2B — the payroll catastrophe' },
        { href: 'senate-expenses.html', label: 'Senate Expenses', desc: 'Duffy/Wallin/Brazeau — $500K scandal' },
      ]
    },
    'covid-accountability.html': {
      current: 'COVID Accountability',
      next: [
        { href: 'crown-corporations.html', label: 'Crown Corporations', desc: 'State enterprises burning billions' },
        { href: 'housing-crisis.html', label: 'Housing Crisis', desc: 'Engineered affordability collapse' },
        { href: 'lobbying-deepdive.html', label: 'Lobbying Deep Dive', desc: 'Who profited from pandemic contracts' },
      ]
    },
    'indigenous-accountability.html': {
      current: 'Indigenous Accountability',
      next: [
        { href: 'disability-genocide.html', label: 'Disability & CRPD', desc: 'UN Convention violations against disabled Canadians' },
        { href: 'covid-accountability.html', label: 'COVID Accountability', desc: 'ArriveCAN, CERB fraud, $500B pandemic spending' },
        { href: 'healthcare-crisis.html', label: 'Healthcare Collapse', desc: 'Waitlist deaths, budget betrayal, CIHI data' },
      ]
    },
    'privacy-surveillance.html': {
      current: 'Privacy & Surveillance',
      next: [
        { href: 'bill-c63-online-harms.html', label: 'Bill C-63 Online Harms Act', desc: 'Censorship framework with life imprisonment for speech' },
        { href: 'bill-c22-surveillance.html', label: 'Bill C-22 Surveillance', desc: 'State surveillance expansion under lawful access' },
        { href: 'digital-identity.html', label: 'Digital Identity', desc: 'From ArriveCAN to national digital ID' },
      ]
    },
    'judicial-appointments.html': {
      current: 'Judicial Appointments',
      next: [
        { href: 'privacy-surveillance.html', label: 'Privacy & Surveillance', desc: 'C-26, C-11, C-63 — the laws judges will interpret' },
        { href: 'rcmp-maid-accountability.html', label: 'RCMP & MAID', desc: 'Law enforcement that failed to enforce the law' },
        { href: 'disability-genocide.html', label: 'Disability & CRPD', desc: 'Carter v Canada — the SCC decision that started MAID' },
      ]
    },
    'immigration-policy.html': {
      current: 'Immigration Policy',
      next: [
        { href: 'tfw-abuse.html', label: 'TFW Program Abuse', desc: '239K+ tied workers, LMIA fraud, wage suppression machine' },
        { href: 'housing-crisis.html', label: 'Housing Crisis', desc: 'Immigration-housing gap documented by CMHC' },
        { href: 'healthcare-crisis.html', label: 'Healthcare Collapse', desc: 'System capacity vs. population growth' },
      ]
    },
    'tfw-abuse.html': {
      current: 'TFW Program Abuse',
      next: [
        { href: 'immigration-policy.html', label: 'Immigration Policy', desc: 'IRCC backlogs, capacity collapse, broken system' },
        { href: 'housing-crisis.html', label: 'Housing Crisis', desc: 'Population surge without housing to match' },
        { href: 'healthcare-crisis.html', label: 'Healthcare Collapse', desc: 'Workforce exploitation meets system collapse' },
      ]
    },
    'infrastructure-deficit.html': {
      current: 'Infrastructure Deficit',
      next: [
        { href: 'housing-crisis.html', label: 'Housing Crisis', desc: 'Where the infrastructure money should have gone' },
        { href: 'crown-corporations.html', label: 'Crown Corporations', desc: 'State enterprises burning billions' },
        { href: 'covid-accountability.html', label: 'COVID Accountability', desc: '$500B spent, infrastructure ignored' },
      ]
    },
    'cra-enforcement.html': {
      current: 'CRA Enforcement',
      next: [
        { href: 'lobbying-deepdive.html', label: 'Lobbying Deep Dive', desc: 'Who lobbies CRA for lenient enforcement' },
        { href: 'elections-finance.html', label: 'Elections & Finance', desc: 'Campaign finance — follow the donor money' },
        { href: 'crown-corporations.html', label: 'Crown Corporations', desc: 'Where lost tax revenue should have gone' },
      ]
    },
    'environment-climate.html': {
      current: 'Environment & Climate',
      next: [
        { href: 'infrastructure-deficit.html', label: 'Infrastructure Deficit', desc: 'Where climate infrastructure money should have gone' },
        { href: 'indigenous-accountability.html', label: 'Indigenous Accountability', desc: 'Contaminated sites on First Nations land' },
        { href: 'arms-exports.html', label: 'Arms Exports', desc: 'Selling oil AND weapons while preaching green' },
      ]
    },
    'debt-fiscal.html': {
      current: 'National Debt Crisis',
      next: [
        { href: 'cra-enforcement.html', label: 'CRA Enforcement', desc: 'Two-tier tax collection while debt explodes' },
        { href: 'crown-corporations.html', label: 'Crown Corporations', desc: 'State enterprises burning billions we borrow' },
        { href: 'environment-climate.html', label: 'Environment & Climate', desc: 'Trans Mountain $34B — borrowed against the future' },
      ]
    },
    'wef-davos.html': {
      current: 'WEF & Davos Connections',
      next: [
        { href: 'epstein-maxwell.html', label: 'Epstein & Maxwell Network', desc: 'Elite trafficking — same circles, same impunity' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, UFWD — the full influence investigation' },
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, WEF Board member, 100+ recusals' },
      ]
    },
    'foreign-interference-deep.html': {
      current: 'Foreign Interference Deep Dive',
      next: [
        { href: 'epstein-maxwell.html', label: 'Epstein & Maxwell Network', desc: 'Elite trafficking networks — the Canadian parallel with Peter Nygard' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP — the broader picture' },
        { href: 'treason-trajectory.html', label: 'Treason Trajectory', desc: 'The pattern of betrayal mapped across decades' },
      ]
    },
    'epstein-maxwell.html': {
      current: 'Epstein & Maxwell Network',
      next: [
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'How elite networks purchase Canadian policy' },
        { href: 'wef-davos.html', label: 'WEF & Davos Connections', desc: 'The same elite circles — Carney, Brookfield, Davos' },
        { href: 'lobbying-deepdive.html', label: 'Lobbying Deep Dive', desc: 'How political donations translate to policy' },
      ]
    },
    'arrivecan.html': {
      current: 'ArriveCAN — $59.5M for a COVID Questionnaire',
      next: [
        { href: 'procurement-registry.html', label: 'Procurement Registry', desc: 'Full registry of government procurement records' },
        { href: 'phoenix-pay.html', label: 'Phoenix Pay', desc: '$309M became $2.2B — same procurement pattern' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The complete fiscal pipeline from spending to MAID' },
      ]
    },
    'cds-accountability.html': {
      current: 'CDS Accountability — Defence Staff Record',
      next: [
        { href: 'cfnis.html', label: 'CFNIS Investigation', desc: 'Military police accountability failures' },
        { href: 'ppcli-lawsuit.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
        { href: 'military-procurement-failures.html', label: 'Military Procurement Failures', desc: 'Decades late, billions over budget' },
      ]
    },
    'complete-thesis.html': {
      current: 'The Complete Thesis — What 267 Pages Prove',
      next: [
        { href: 'system-architecture.html', label: 'System Architecture', desc: 'How institutional capture works at every level' },
        { href: 'who-is-harmed.html', label: 'Who Is Harmed', desc: 'Every affected population mapped with data' },
        { href: 'reading-order.html', label: 'Reading Order', desc: 'How to navigate all 267 investigation pages' },
      ]
    },
    'bill-c63-online-harms.html': {
      current: 'Bill C-63 Online Harms Act',
      next: [
        { href: 'bill-c22-surveillance.html', label: 'Bill C-22 Surveillance', desc: 'State surveillance expansion under lawful access' },
        { href: 'privacy-surveillance.html', label: 'Privacy & Surveillance', desc: 'C-26, C-11, C-63 and civil liberties erosion' },
        { href: 'digital-identity.html', label: 'Digital Identity', desc: 'From ArriveCAN to national digital ID' },
      ]
    },
    'bill-c70-registry.html': {
      current: 'Bill C-70 — Zero Compliance After 650 Days',
      next: [
        { href: 'foreign-interference.html', label: 'Foreign Interference', desc: 'Foreign interference in Canadian democracy' },
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP' },
        { href: 'treason-trajectory.html', label: 'Treason Trajectory', desc: 'Pattern of policy decisions against national interest' },
      ]
    },
    'brookfield-maid.html': {
      current: 'Brookfield & MAID — The Financial Convergence',
      next: [
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals, FINTRAC defunded' },
        { href: 'panama-papers.html', label: '8 Offshore Leaks', desc: '268,488 entities, $76M unpaid taxes, 0 prosecutions' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The MAID-Brookfield-FINTRAC fiscal pipeline' },
      ]
    },
    'cija-lobbying.html': {
      current: 'CIJA Lobbying Pipeline',
      next: [
        { href: 'foreign-influence.html', label: 'Foreign Influence', desc: 'CIJA, CCP, media ownership, NSICOP' },
        { href: 'charity-pipeline.html', label: 'Charity Pipeline', desc: '$276M from Canadian charities to Israel' },
        { href: 'arms-pipeline.html', label: 'Arms Pipeline', desc: '$229M+ flowing to Israel despite the pause' },
      ]
    },
    'conflict-of-interest-registry.html': {
      current: 'Conflict of Interest Registry',
      next: [
        { href: 'ethics-failures.html', label: 'Ethics Failures', desc: 'Violations found, zero consequences enforced' },
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals documented' },
        { href: 'regulatory-capture.html', label: 'Regulatory Capture', desc: 'When regulators serve industry over the public' },
      ]
    },
    'failure-timeline.html': {
      current: 'The Decade of Institutional Failure',
      next: [
        { href: 'system-architecture.html', label: 'System Architecture', desc: 'How institutional capture works at every level' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M government records' },
        { href: 'prosecution.html', label: 'Prosecution Framework', desc: 'ICC and domestic legal escalation paths' },
      ]
    },
    'institutional-malice.html': {
      current: 'The Institutional Malice Doctrine',
      next: [
        { href: 'prosecution.html', label: 'Prosecution Framework', desc: 'ICC and domestic legal escalation paths' },
        { href: 's504-covey-bae.html', label: 's.504 Prosecution', desc: 'Criminal Code s.504 information against CFNIS' },
        { href: 'institutional-capture.html', label: 'Institutional Capture', desc: 'How every system was compromised' },
      ]
    },
    'maid-economics.html': {
      current: 'The Economics of MAID',
      next: [
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
        { href: 'brookfield-maid.html', label: 'Brookfield & MAID', desc: 'The financial convergence behind medical killing' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'Cost per death vs. cost of care — the fiscal pipeline' },
      ]
    },

    // ── MAID thread (batch 2025-04-15) ──────────────────────────
    'maid-exterminators.html': {
      current: 'MAID Exterminator Tracing',
      next: [
        { href: 'maid-voting-record.html', label: 'MAID Voting Record', desc: '173 MPs — how every member voted on medical killing' },
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
        { href: 'maid-master-dossier.html', label: 'MAID Still-Sitting MP Dossier', desc: 'Complete evidence chain on still-sitting MPs' },
      ]
    },
    'maid-dossier-index.html': {
      current: 'MAID Dossier Index',
      next: [
        { href: 'maid-master-dossier.html', label: 'MAID Still-Sitting MP Dossier', desc: 'Complete evidence chain on still-sitting MPs' },
        { href: 'maid-speech-evidence.html', label: 'MAID Speech Evidence', desc: 'What still-sitting MPs said on the record' },
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
      ]
    },
    'immigration-maid-pipeline.html': {
      current: 'The Immigration-to-MAID Pipeline',
      next: [
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
        { href: 'disability-genocide.html', label: 'Disability & CRPD Violations', desc: 'UN Convention violations against disabled Canadians' },
        { href: 'who-is-harmed.html', label: 'Who Is Harmed', desc: 'Every affected population mapped with data' },
      ]
    },
    'maid-hansard-record.html': {
      current: 'MAID Hansard Record',
      next: [
        { href: 'maid-speech-evidence.html', label: 'MAID Speech Evidence', desc: 'What still-sitting MPs said on the record' },
        { href: 'maid-voting-record.html', label: 'MAID Voting Record', desc: '173 MPs — how every member voted on medical killing' },
        { href: 'maid-policy-evolution.html', label: 'MAID Policy Evolution', desc: '8-year legislative expansion of medical killing' },
      ]
    },
    'veterans-maid-cases.html': {
      current: 'Veterans Offered MAID',
      next: [
        { href: 'veterans.html', label: 'How Canada Treats Its Veterans', desc: 'Veterans advocacy and the full betrayal record' },
        { href: 'maid-accountability.html', label: 'MAID Accountability', desc: '~98,000 deaths and zero prosecutions' },
        { href: 's504-covey-bae.html', label: 's.504 Prosecution', desc: 'Criminal Code s.504 information against CFNIS' },
      ]
    },

    // ── Financial thread (batch 2025-04-15) ─────────────────────
    'bank-of-canada.html': {
      current: 'Bank of Canada Independence',
      next: [
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals, FINTRAC defunded' },
        { href: 'panama-papers.html', label: '8 Offshore Leaks', desc: '268,488 entities, $76M unpaid taxes, 0 prosecutions' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The MAID-Brookfield-FINTRAC fiscal pipeline' },
      ]
    },
    'budget-2025-analysis.html': {
      current: 'Budget 2025 Analysis',
      next: [
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The MAID-Brookfield-FINTRAC fiscal pipeline' },
        { href: 'carbon-tax.html', label: 'Carbon Tax', desc: 'Policy analysis and economic impact' },
        { href: 'maid-economics.html', label: 'The Economics of MAID', desc: 'Cost per death vs. cost of care' },
      ]
    },
    'carbon-tax.html': {
      current: 'Carbon Tax',
      next: [
        { href: 'budget-2025-analysis.html', label: 'Budget 2025 Analysis', desc: 'Where $585.9 billion goes' },
        { href: 'environment-climate.html', label: 'Environment & Climate', desc: 'Climate infrastructure and broken promises' },
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The MAID-Brookfield-FINTRAC fiscal pipeline' },
      ]
    },
    'infrastructure-bank.html': {
      current: 'Canada Infrastructure Bank',
      next: [
        { href: 'follow-the-money.html', label: 'Follow the Money', desc: 'The MAID-Brookfield-FINTRAC fiscal pipeline' },
        { href: 'procurement-deep-dive.html', label: 'Procurement Deep Dive', desc: 'Detailed procurement failure analysis' },
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals documented' },
      ]
    },
    'pension-fund-conflicts.html': {
      current: 'Pension Fund Conflicts',
      next: [
        { href: 'panama-papers.html', label: '8 Offshore Leaks', desc: '268,488 entities, $76M unpaid taxes, 0 prosecutions' },
        { href: 'brookfield-maid.html', label: 'Brookfield & MAID', desc: 'The financial convergence behind medical killing' },
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals documented' },
      ]
    },

    // ── Governance thread (batch 2025-04-15) ────────────────────
    'accountability-scorecard.html': {
      current: 'Accountability Scorecard',
      next: [
        { href: 'accountability.html', label: 'The 504 Database', desc: '1,105 records of government misconduct' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M government records' },
        { href: 'evidence-index.html', label: 'Evidence Index', desc: 'Full index of sourced evidence' },
      ]
    },
    'crown-immunity.html': {
      current: 'Crown Immunity',
      next: [
        { href: 'institutional-malice.html', label: 'Institutional Malice', desc: 'The doctrine of deliberate institutional harm' },
        { href: 'prosecution.html', label: 'Prosecution Framework', desc: 'ICC and domestic legal escalation paths' },
        { href: 'ethics-failures.html', label: 'Ethics Failures', desc: 'Violations found, zero consequences enforced' },
      ]
    },
    'cabinet-confidence.html': {
      current: 'Cabinet Confidence',
      next: [
        { href: 'system-architecture.html', label: 'System Architecture', desc: 'How institutional capture works at every level' },
        { href: 'institutional-capture.html', label: 'Institutional Capture', desc: 'How every system was compromised' },
        { href: 'ag-findings.html', label: 'AG Findings', desc: 'Auditor General investigation results' },
      ]
    },
    'regulatory-capture.html': {
      current: 'Regulatory Capture',
      next: [
        { href: 'conflict-of-interest-registry.html', label: 'Conflict of Interest Registry', desc: 'Every documented conflict of interest' },
        { href: 'carney-conflicts.html', label: 'Carney Conflicts', desc: '$50B Brookfield, 100+ recusals documented' },
        { href: 'sector-lobbying.html', label: 'Sector Lobbying', desc: '359,251 contacts by industry' },
      ]
    },

    // ── Other key pages (batch 2025-04-15) ──────────────────────
    'rogue-state.html': {
      current: 'Rogue State Declaration',
      next: [
        { href: 'genocide-evidence.html', label: 'Genocide Evidence', desc: 'Documented evidence of complicity' },
        { href: 'institutional-malice.html', label: 'Institutional Malice', desc: 'The doctrine of deliberate institutional harm' },
        { href: 'prosecution.html', label: 'Prosecution Framework', desc: 'ICC and domestic legal escalation paths' },
      ]
    },
    'digital-identity.html': {
      current: 'Digital Identity',
      next: [
        { href: 'privacy-surveillance.html', label: 'Privacy & Surveillance', desc: 'C-26, C-11, C-63 and civil liberties erosion' },
        { href: 'bill-c63-online-harms.html', label: 'Bill C-63 Online Harms Act', desc: 'Censorship framework with life imprisonment for speech' },
        { href: 'arrivecan.html', label: 'ArriveCAN', desc: '$59.5M for a COVID questionnaire' },
      ]
    },
    'housing-crisis-by-city.html': {
      current: 'Housing Crisis by City',
      next: [
        { href: 'who-is-harmed.html', label: 'Who Is Harmed', desc: 'Every affected population mapped with data' },
        { href: 'canada-map.html', label: 'Canada Map', desc: 'Geographic data visualization' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M government records' },
      ]
    },
    'opioid-crisis-accountability.html': {
      current: 'Opioid Crisis Accountability',
      next: [
        { href: 'who-is-harmed.html', label: 'Who Is Harmed', desc: 'Every affected population mapped with data' },
        { href: 'healthcare-crisis.html', label: 'Healthcare Crisis', desc: 'Waitlist deaths, budget betrayal, CIHI data' },
        { href: 'findings.html', label: 'Cross-Reference Findings', desc: '26+ findings from 7M government records' },
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
