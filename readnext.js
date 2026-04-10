/**
 * TENET5 — "Read Next" Navigation v2.0
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
        { href: 'findings.html', label: 'All 26+ Findings', desc: 'What LIRIL found in the data' },
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
        { href: 'findings.html', label: 'What She Found', desc: '26+ panels from 7M records' },
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
        { href: 'sector-lobbying.html', label: 'Sector Lobbying', desc: '359,251 contacts by industry' },
        { href: 'arms-pipeline.html', label: 'Arms Pipeline', desc: '$229M+ to Israel despite pause' },
        { href: 'mp-scorecard.html', label: 'MP Scorecard', desc: 'Search all 340 MPs' },
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
        { href: 'lawsuit-ppcli.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
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
        { href: 'liril.html', label: 'Meet LIRIL', desc: 'The AI behind the analysis' },
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
        { href: 'red-duster-game.html', label: 'Red Duster Game', desc: 'The interactive investigation game' },
        { href: 'liril.html', label: 'Meet LIRIL', desc: 'The AI behind the project' },
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
    'chat.html': {
      current: 'Chat',
      next: [
        { href: 'community.html', label: 'Community', desc: 'Join the investigation community' },
        { href: 'news.html', label: 'News', desc: 'Latest investigation updates' },
        { href: 'liril.html', label: 'Meet LIRIL', desc: 'The AI behind the analysis' },
      ]
    },
    'community.html': {
      current: 'Community',
      next: [
        { href: 'chat.html', label: 'Chat', desc: 'Live discussion channel' },
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
    'lawsuit-ppcli.html': {
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
        { href: 'chat.html', label: 'Chat', desc: 'Live discussion channel' },
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
        { href: 'rcmp-maid-accountability.html', label: 'RCMP MAID Accountability', desc: 'MAID enforcement oversight' },
        { href: 't4-comparison.html', label: 'T4 Comparison', desc: 'Historical parallels to the T4 program' },
        { href: 'charges-sheet.html', label: 'Charges Sheet', desc: 'Specific charges and evidence mapping' },
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
    'red-duster-game.html': {
      current: 'Red Duster Game',
      next: [
        { href: 'bloggins.html', label: 'Bloggins', desc: 'The story behind the game' },
        { href: 'liril.html', label: 'Meet LIRIL', desc: 'The AI behind the project' },
        { href: 'about.html', label: 'About & Methodology', desc: 'How the data was collected' },
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
      current: 'Veterans',
      next: [
        { href: 'cfnis.html', label: 'CFNIS Investigation', desc: 'Military police accountability' },
        { href: 'lawsuit-ppcli.html', label: 'PPCLI Lawsuit', desc: 'The legal action against the regiment' },
        { href: 'whistleblower-guide.html', label: 'Whistleblower Guide', desc: 'How to safely report wrongdoing' },
      ]
    },
    'whistleblower-guide.html': {
      current: 'Whistleblower Guide',
      next: [
        { href: 'legal.html', label: 'Legal Framework', desc: 'Accountability tools + reform recommendations' },
        { href: 'veterans.html', label: 'Veterans', desc: 'Veterans advocacy and support' },
        { href: 'cfnis.html', label: 'CFNIS Investigation', desc: 'Military police accountability' },
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
      current: 'Healthcare Crisis',
      next: [
        { href: 'maid-policy-evolution.html', label: 'MAID Policy Evolution', desc: '8-year legislative expansion of medical killing' },
        { href: 'disability-genocide.html', label: 'Disability & CRPD', desc: 'UN Convention violations, Charter Section 15' },
        { href: 'rcmp-maid-accountability.html', label: 'RCMP & MAID', desc: 'Commissioner dereliction of duty' },
      ]
    },
    'maid-policy-evolution.html': {
      current: 'MAID Policy Evolution',
      next: [
        { href: 'healthcare-crisis.html', label: 'Healthcare Collapse', desc: 'Waitlist deaths, budget betrayal, CIHI data' },
        { href: 'disability-genocide.html', label: 'Disability & CRPD', desc: 'UN Convention violations against disabled Canadians' },
        { href: 't4-comparison.html', label: 'The Pattern (T4)', desc: 'Historical comparison to Aktion T4' },
      ]
    },
    'disability-genocide.html': {
      current: 'Disability & CRPD Violations',
      next: [
        { href: 'maid-policy-evolution.html', label: 'MAID Policy Evolution', desc: 'How they legislated death over 8 years' },
        { href: 'healthcare-crisis.html', label: 'Healthcare Collapse', desc: 'System collapse feeds the MAID pipeline' },
        { href: 'genocide-evidence.html', label: 'Genocide Evidence', desc: 'Full pattern documentation' },
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
