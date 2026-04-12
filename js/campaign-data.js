// campaign-data.js — CAP Campaign Contact Database
// All contacts sourced from public Canadian government records
const CAMPAIGN_CONTACTS = {

  senators: [
    // === FLAGGED SENATORS ===
    { name: 'Mike Duffy', org: 'Senate of Canada', email: '', role: 'Senator (expired)', category: 'senate', province: 'PEI', flagScore: 9, flags: ['expenses fraud', 'resigned under pressure'], notes: 'PEI senator appointed 2009, resigned 2015 after expenses scandal. $90K payment from Nigel Wright. Charges stayed 2016 but conduct findings by Senate Ethics Officer remain public record.' },
    { name: 'Pamela Wallin', org: 'Senate of Canada', email: 'pamela.wallin@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Saskatchewan', flagScore: 8, flags: ['expenses scandal', 'suspended without pay'], notes: 'CPC senator. Senate suspended her without pay Nov 2013 for $138,969 in improper expenses. Deloitte audit, Ethics Commissioner review. Source: Senate of Canada records.' },
    { name: 'Patrick Brazeau', org: 'Senate of Canada', email: 'patrick.brazeau@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Quebec', flagScore: 9, flags: ['assault conviction', 'cocaine possession', 'expenses scandal', 'domestic violence charge'], notes: 'CPC senator (formerly expelled, reappointed). Convicted assault 2014, cocaine possession 2014. Expenses scandal - suspended without pay 2013. Source: court records, Senate Ethics Officer.' },
    { name: 'Lynn Beyak', org: 'Senate of Canada', email: '', role: 'Senator (retired 2021)', category: 'senate', province: 'Ontario', flagScore: 7, flags: ['racist letters posted to Senate website', 'suspended'], notes: 'CPC senator. Posted racist letters defending residential schools on her Senate website. Suspended twice. Retired 2021. Source: Senate Ethics Officer report 2017-2019.' },
    { name: 'Don Meredith', org: 'Senate of Canada', email: '', role: 'Senator (resigned 2017)', category: 'senate', province: 'Ontario', flagScore: 10, flags: ['sexual misconduct with minor', 'expelled recommendation'], notes: 'ISG senator. Senate Ethics Officer found he had sexual relationship with teenage girl. Recommendation for expulsion. Resigned May 2017 before expulsion vote. Source: Senate Ethics Officer Inquiry Report 2017.' },

    // === ISG — INDEPENDENT SENATORS GROUP ===
    { name: 'Marc Gold', org: 'Senate of Canada', email: 'marc.gold@sen.parl.gc.ca', role: 'Government Representative in the Senate', category: 'senate', province: 'Quebec', flagScore: 0, flags: [], notes: 'ISG. Government Representative since 2020. Former law professor. Appointed 2018.' },
    { name: 'Yuen Pau Woo', org: 'Senate of Canada', email: 'yuen.woo@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'British Columbia', flagScore: 3, flags: ['foreign interference concerns', 'advocated against NSICOP investigation', 'questioned CSIS assessments'], notes: 'ISG. Former Canada China Business Council president. Vocal critic of foreign interference investigations. Source: NSICOP hearings, Senate Hansard.' },
    { name: 'Ratna Omidvar', org: 'Senate of Canada', email: 'ratna.omidvar@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG. Immigration and refugee rights expert. Appointed 2016.' },
    { name: 'Marty Klyne', org: 'Senate of Canada', email: 'marty.klyne@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Saskatchewan', flagScore: 0, flags: [], notes: 'ISG. Former CEO Manitoba Metis Federation. Appointed 2018.' },
    { name: 'Kim Pate', org: 'Senate of Canada', email: 'kim.pate@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG. Criminal justice reform advocate. Former head of Canadian Association of Elizabeth Fry Societies. Appointed 2016.' },
    { name: 'Peter Harder', org: 'Senate of Canada', email: 'peter.harder@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG. Former Government Representative in Senate 2016-2020. Former Secretary of State for Foreign Affairs.' },
    { name: 'Murray Sinclair', org: 'Senate of Canada', email: '', role: 'Senator (retired 2021)', category: 'senate', province: 'Manitoba', flagScore: 0, flags: [], notes: 'ISG. TRC Chair. Appointed 2016. Retired Jan 2021. Clean record.' },
    { name: 'Marilou McPhedran', org: 'Senate of Canada', email: 'marilou.mcphedran@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Manitoba', flagScore: 0, flags: [], notes: 'Non-affiliated (formerly ISG). Human rights lawyer. Appointed 2016.' },
    { name: 'Gwen Boniface', org: 'Senate of Canada', email: 'gwen.boniface@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG. Former Commissioner Ontario Provincial Police. Appointed 2016.' },
    { name: 'Tony Dean', org: 'Senate of Canada', email: 'tony.dean@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG. Former head Ontario Public Service. Appointed 2016.' },
    { name: 'Rosemary Moodie', org: 'Senate of Canada', email: 'rosemary.moodie@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG. Paediatric physician. Appointed 2018.' },
    { name: 'Mary Coyle', org: 'Senate of Canada', email: 'mary.coyle@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Nova Scotia', flagScore: 0, flags: [], notes: 'ISG. Former Coady Institute director. Appointed 2018.' },
    { name: 'Wanda Thomas Bernard', org: 'Senate of Canada', email: 'wanda.bernard@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Nova Scotia', flagScore: 0, flags: [], notes: 'ISG. First Black woman senator from Nova Scotia. Social work professor. Appointed 2016.' },
    { name: 'Frances Lankin', org: 'Senate of Canada', email: 'frances.lankin@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG (formerly NDP Ontario). Former Ontario cabinet minister. Appointed 2017.' },

    // === CSG — CONSERVATIVE SENATE GROUP ===
    { name: 'Don Plett', org: 'Senate of Canada', email: 'don.plett@sen.parl.gc.ca', role: 'Leader of the Opposition in the Senate', category: 'senate', province: 'Manitoba', flagScore: 1, flags: ['partisan conduct concerns'], notes: 'CSG. Opposition Senate Leader. Former CPC Party President.' },
    { name: 'David Wells', org: 'Senate of Canada', email: 'david.wells@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Newfoundland', flagScore: 0, flags: [], notes: 'CSG. Appointed 2011.' },
    { name: 'Leo Housakos', org: 'Senate of Canada', email: 'leo.housakos@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Quebec', flagScore: 2, flags: ['expenses irregularities investigated'], notes: 'CSG. Former Speaker of the Senate. CPC supporter. Expenses investigated 2015 (cleared).' },
    { name: 'Denise Batters', org: 'Senate of Canada', email: 'denise.batters@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Saskatchewan', flagScore: 1, flags: ['removed from CPC caucus for petition against Otoole'], notes: 'CSG. Launched petition against CPC leader 2021, removed from caucus. Appointed 2012.' },
    { name: 'Claude Carignan', org: 'Senate of Canada', email: 'claude.carignan@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Quebec', flagScore: 0, flags: [], notes: 'CSG. Former Opposition Senate Leader. Municipal lawyer. Appointed 2009.' },

    // === PSG / ISG — PROGRESSIVE / CANADIAN SENATORS GROUP ===
    { name: 'Jane Cordy', org: 'Senate of Canada', email: 'jane.cordy@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Nova Scotia', flagScore: 0, flags: [], notes: 'PSG (formerly Liberal). Former teacher. Appointed 2000.' },
    { name: 'Mobina Jaffer', org: 'Senate of Canada', email: 'mobina.jaffer@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'British Columbia', flagScore: 0, flags: [], notes: 'PSG (formerly Liberal). First Muslim senator. Human rights focus. Appointed 2001.' },
    { name: 'Pierre Dalphond', org: 'Senate of Canada', email: 'pierre.dalphond@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Quebec', flagScore: 0, flags: [], notes: 'PSG. Former Quebec Court of Appeal judge. Appointed 2018.' },
    { name: 'Colin Deacon', org: 'Senate of Canada', email: 'colin.deacon@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Nova Scotia', flagScore: 0, flags: [], notes: 'ISG. Tech entrepreneur. Appointed 2018.' },
    { name: 'Stan Kutcher', org: 'Senate of Canada', email: 'stan.kutcher@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Nova Scotia', flagScore: 0, flags: [], notes: 'ISG. Mental health expert/psychiatrist. Appointed 2018.' },
    { name: 'Amina Gerba', org: 'Senate of Canada', email: 'amina.gerba@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Quebec', flagScore: 0, flags: [], notes: 'ISG. Entrepreneur, African-Canadian advocate. Appointed 2021.' },
    { name: 'Hassan Yussuff', org: 'Senate of Canada', email: 'hassan.yussuff@sen.parl.gc.ca', role: 'Senator', category: 'senate', province: 'Ontario', flagScore: 0, flags: [], notes: 'ISG. Former President Canadian Labour Congress. Appointed 2021.' }
  ],

  media: [
    { name: 'CBC News National Desk', org: 'CBC/Radio-Canada', email: 'haveyoursay@cbc.ca', role: 'News Tip Line', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Mainstream public broadcaster. National tip line.', mediaType: 'mainstream' },
    { name: 'The Globe and Mail Investigations', org: 'The Globe and Mail', email: 'investigations@globeandmail.com', role: 'Investigative Desk', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'National newspaper. Investigation team.', mediaType: 'investigative' },
    { name: 'Toronto Star Tips', org: 'Toronto Star', email: 'tips@thestar.ca', role: 'News Desk', category: 'media', province: 'Ontario', flagScore: 0, flags: [], notes: 'Liberal-leaning national daily.', mediaType: 'mainstream' },
    { name: 'National Post Letters', org: 'National Post', email: 'letters@nationalpost.com', role: 'Letters/Opinion', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Conservative-leaning national daily.', mediaType: 'right' },
    { name: 'The Narwhal', org: 'The Narwhal', email: 'hello@thenarwhal.ca', role: 'Editorial', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Independent environmental/accountability journalism.', mediaType: 'investigative' },
    { name: 'The Breach', org: 'The Breach', email: 'tips@breachmedia.ca', role: 'Tips', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Independent left-leaning investigative media.', mediaType: 'investigative' },
    { name: 'Canadaland', org: 'Canadaland', email: 'tips@canadaland.com', role: 'Tips', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Media criticism and investigative journalism.', mediaType: 'investigative' },
    { name: 'APTN National News', org: 'Aboriginal Peoples Television Network', email: 'newsroom@aptn.ca', role: 'Newsroom', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Indigenous-focused national broadcaster.', mediaType: 'indigenous' },
    { name: 'iPolitics', org: 'iPolitics', email: 'tips@ipolitics.ca', role: 'Tips', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Parliamentary/political news.', mediaType: 'investigative' },
    { name: 'The Tyee', org: 'The Tyee', email: 'submissions@thetyee.ca', role: 'Submissions', category: 'media', province: 'British Columbia', flagScore: 0, flags: [], notes: 'Independent left-leaning BC-based outlet.', mediaType: 'left' },
    { name: "Blacklock's Reporter", org: "Blacklock's Reporter", email: 'tom@blacklocks.ca', role: 'Editor', category: 'media', province: 'National', flagScore: 0, flags: [], notes: "Parliamentary news service. Focus on federal government.", mediaType: 'investigative' },
    { name: 'The Hill Times', org: 'The Hill Times', email: 'editor@hilltimes.com', role: 'Editor', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Ottawa-focused political newspaper.', mediaType: 'mainstream' },
    { name: 'CTV News W5', org: 'CTV News', email: 'w5@ctv.ca', role: 'W5 Investigates', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Mainstream investigative TV program.', mediaType: 'investigative' },
    { name: 'Global News Investigations', org: 'Global News', email: 'investigations@globalnews.ca', role: 'Investigative Desk', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Mainstream national broadcaster.', mediaType: 'investigative' },
    { name: 'Ricochet Media', org: 'Ricochet Media', email: 'tips@ricochet.media', role: 'Tips', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Progressive independent media.', mediaType: 'left' },
    { name: 'Press Progress', org: 'Press Progress', email: 'tips@pressprogress.ca', role: 'Tips', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Left-leaning accountability journalism.', mediaType: 'left' },
    { name: 'True North Centre', org: 'True North', email: 'info@tnc.news', role: 'Editorial', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Conservative-leaning independent media.', mediaType: 'right' },
    { name: 'Western Standard', org: 'Western Standard', email: 'news@westernstandard.ca', role: 'News Desk', category: 'media', province: 'Alberta', flagScore: 0, flags: [], notes: 'Western Canada conservative media.', mediaType: 'right' },
    { name: 'Epoch Times Canada', org: 'Epoch Times', email: 'canada@epochtimes.com', role: 'Canada Desk', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Anti-CCP focus. Wide Canadian readership.', mediaType: 'right' },
    { name: 'Vice Canada', org: 'Vice Media', email: 'canada@vice.com', role: 'Canada Desk', category: 'media', province: 'National', flagScore: 0, flags: [], notes: 'Youth-focused investigative media.', mediaType: 'mainstream' }
  ],

  thinkTanks: [
    { name: 'MacDonald-Laurier Institute', org: 'MacDonald-Laurier Institute', email: 'info@macdonaldlaurier.ca', role: 'Policy Research', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Centre-right think tank. Ottawa-based. Focus on national security, federalism.' },
    { name: 'Fraser Institute', org: 'Fraser Institute', email: 'info@fraserinstitute.org', role: 'Policy Research', category: 'thinkTank', province: 'British Columbia', flagScore: 0, flags: [], notes: 'Conservative/libertarian economics think tank. Vancouver.' },
    { name: 'C.D. Howe Institute', org: 'C.D. Howe Institute', email: 'cdhowe@cdhowe.org', role: 'Policy Research', category: 'thinkTank', province: 'Ontario', flagScore: 0, flags: [], notes: 'Centre-right economic policy. Toronto.' },
    { name: 'Pembina Institute', org: 'Pembina Institute', email: 'info@pembina.org', role: 'Policy Research', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Environmental/energy policy. Calgary.' },
    { name: 'Canadian Centre for Policy Alternatives', org: 'CCPA', email: 'ccpa@policyalternatives.ca', role: 'Policy Research', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Progressive economic think tank. Ottawa.' },
    { name: 'Policy Options (IRPP)', org: 'Institute for Research on Public Policy', email: 'editor@irpp.org', role: 'Policy Journal', category: 'thinkTank', province: 'Quebec', flagScore: 0, flags: [], notes: 'Public policy research. Montreal.' },
    { name: 'Canadian Taxpayers Federation', org: 'Canadian Taxpayers Federation', email: 'info@taxpayer.com', role: 'Advocacy', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Fiscal accountability watchdog. Highly vocal on government waste.' },
    { name: 'Democracy Watch', org: 'Democracy Watch', email: 'dwatch@web.ca', role: 'Accountability Advocacy', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Non-partisan democracy watchdog. Has filed numerous ethics complaints. Ottawa.' },
    { name: 'Transparency International Canada', org: 'Transparency International Canada', email: 'info@transparencycanada.ca', role: 'Anti-Corruption Research', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Anti-corruption advocacy. TI affiliate.' },
    { name: 'Canadian Civil Liberties Association', org: 'CCLA', email: 'mail@ccla.org', role: 'Legal Advocacy', category: 'thinkTank', province: 'Ontario', flagScore: 0, flags: [], notes: 'Civil liberties defence. Charter rights focus.' },
    { name: 'Centre for Law and Democracy', org: 'Centre for Law and Democracy', email: 'info@law-democracy.org', role: 'Policy Research', category: 'thinkTank', province: 'Nova Scotia', flagScore: 0, flags: [], notes: 'Freedom of expression, access to information rights.' },
    { name: 'Office of the Auditor General', org: 'Office of the Auditor General of Canada', email: 'oag.reports@oag-bvg.gc.ca', role: 'Federal Audit', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Independent Officer of Parliament. Audits federal spending. Reports are public and cited in our evidence.' },
    { name: 'Office of the Ethics Commissioner', org: 'Office of the Conflict of Interest and Ethics Commissioner', email: 'ciec-ccie@parl.gc.ca', role: 'Federal Ethics Oversight', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Independent federal ethics regulator. Findings are public record and cited throughout this campaign.' },
    { name: 'Office of the Commissioner of Lobbying', org: 'Office of the Commissioner of Lobbying of Canada', email: 'info@lobbycanada.gc.ca', role: 'Federal Lobbying Oversight', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Regulates federal lobbyists. Raw CSV data from registry is source for our lobbying analysis.' },
    { name: 'Veterans Ombudsman', org: 'Office of the Veterans Ombudsman', email: 'ombudsman@ombudsman-veterans.gc.ca', role: 'Veterans Oversight', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Investigates veterans complaints. Relevant to CAF issues.' },
    { name: 'Military Police Complaints Commission', org: 'MPCC', email: 'mpcc@mpcc-cppm.gc.ca', role: 'Military Police Oversight', category: 'thinkTank', province: 'National', flagScore: 0, flags: [], notes: 'Oversees CFNIS and military police. Central to our military accountability evidence.' },
    { name: 'Criminal Lawyers Association', org: 'Criminal Lawyers Association', email: 'info@criminallawyers.ca', role: 'Legal Association', category: 'thinkTank', province: 'Ontario', flagScore: 0, flags: [], notes: 'Represents criminal defence lawyers. s.504 private prosecution expertise.' }
  ],

  premiers: [
    { name: 'Doug Ford', org: 'Government of Ontario', email: 'doug.ford@pc.ola.org', role: 'Premier of Ontario', category: 'premier', province: 'Ontario', flagScore: 2, flags: ['Greenbelt scandal', 'housing developer connections'], notes: 'Ontario PC Premier. Greenbelt land scandal (developers profited ~$8.3B). Ethics Commissioner found violation July 2023. Some reversals made.' },
    { name: 'Marit Stiles', org: 'Ontario NDP', email: 'mstiles-co@ndp.on.ca', role: 'Ontario NDP Leader', category: 'premier', province: 'Ontario', flagScore: 0, flags: [], notes: 'Ontario NDP Opposition Leader. Clean record.' },
    { name: 'David Eby', org: 'Government of British Columbia', email: 'premier@gov.bc.ca', role: 'Premier of British Columbia', category: 'premier', province: 'British Columbia', flagScore: 0, flags: [], notes: 'BC NDP Premier. Former housing minister and BCCLA director. No significant ethics violations.' },
    { name: 'John Rustad', org: 'BC Conservatives', email: 'john.rustad.mla@leg.bc.ca', role: 'BC Conservative Leader', category: 'premier', province: 'British Columbia', flagScore: 0, flags: [], notes: 'BC Conservative Opposition Leader.' },
    { name: 'Danielle Smith', org: 'Government of Alberta', email: 'premier@gov.ab.ca', role: 'Premier of Alberta', category: 'premier', province: 'Alberta', flagScore: 3, flags: ['judicial interference concerns', 'Sovereignty Act', 'communications with Artur Pawlowski during convoy'], notes: 'Alberta UCP Premier. RCMP investigated re conversations with AG. Sovereignty Act federal jurisdiction challenges. Source: CBC, Globe investigations 2023.' },
    { name: 'Naheed Nenshi', org: 'Alberta NDP', email: 'naheed.nenshi@abndp.ca', role: 'Alberta NDP Leader', category: 'premier', province: 'Alberta', flagScore: 0, flags: [], notes: 'Alberta NDP Opposition Leader. Former Calgary Mayor.' },
    { name: 'François Legault', org: 'Government of Quebec', email: 'premier@cabinet.gouv.qc.ca', role: 'Premier of Quebec', category: 'premier', province: 'Quebec', flagScore: 1, flags: ['language law constitutional challenges'], notes: 'CAQ Premier. Bills 21 and 96 face Charter challenges. Elected 2018, re-elected 2022.' },
    { name: 'Wab Kinew', org: 'Government of Manitoba', email: 'premier@leg.gov.mb.ca', role: 'Premier of Manitoba', category: 'premier', province: 'Manitoba', flagScore: 0, flags: [], notes: 'Manitoba NDP Premier. First First Nations Premier in Manitoba. Elected Oct 2023.' },
    { name: 'Scott Moe', org: 'Government of Saskatchewan', email: 'premier@gov.sk.ca', role: 'Premier of Saskatchewan', category: 'premier', province: 'Saskatchewan', flagScore: 1, flags: ['pronoun notification policy dispute'], notes: 'Saskatchewan Party Premier. Federal jurisdiction disputes. Pronoun notification policy overturned by court.' },
    { name: 'Tim Houston', org: 'Government of Nova Scotia', email: 'premier@gov.ns.ca', role: 'Premier of Nova Scotia', category: 'premier', province: 'Nova Scotia', flagScore: 0, flags: [], notes: 'Nova Scotia PC Premier. Elected 2021.' },
    { name: 'Susan Holt', org: 'Government of New Brunswick', email: 'premier@gnb.ca', role: 'Premier of New Brunswick', category: 'premier', province: 'New Brunswick', flagScore: 0, flags: [], notes: 'New Brunswick Liberal Premier. Elected Oct 2024.' },
    { name: 'Dennis King', org: 'Government of Prince Edward Island', email: 'premier@gov.pe.ca', role: 'Premier of PEI', category: 'premier', province: 'Prince Edward Island', flagScore: 0, flags: [], notes: 'PEI PC Premier. Elected 2019.' },
    { name: 'Andrew Furey', org: 'Government of Newfoundland and Labrador', email: 'premier@gov.nl.ca', role: 'Premier of NL', category: 'premier', province: 'Newfoundland', flagScore: 0, flags: [], notes: 'NL Liberal Premier. Elected 2021.' },
    { name: 'Ranj Pillai', org: 'Government of Yukon', email: 'premier@gov.yk.ca', role: 'Premier of Yukon', category: 'premier', province: 'Yukon', flagScore: 0, flags: [], notes: 'Yukon Liberal Premier. Appointed 2023.' },
    { name: 'RJ Simpson', org: 'Government of Northwest Territories', email: 'premier@gov.nt.ca', role: 'Premier of Northwest Territories', category: 'premier', province: 'Northwest Territories', flagScore: 0, flags: [], notes: 'NWT consensus Premier. Elected 2023.' },
    { name: 'P.J. Akeeagok', org: 'Government of Nunavut', email: 'premier@gov.nu.ca', role: 'Premier of Nunavut', category: 'premier', province: 'Nunavut', flagScore: 0, flags: [], notes: 'Nunavut consensus Premier. Elected 2021.' }
  ],

  military: [
    { name: 'Chief of the Defence Staff', org: 'Canadian Armed Forces', email: 'cds@forces.gc.ca', role: 'Chief of Defence Staff', category: 'military', province: 'National', flagScore: 0, flags: [], notes: 'Head of the Canadian Armed Forces. Accountability: MPCC findings, chain of command oversight.' },
    { name: 'Canadian Forces Ombudsman', org: 'Office of the CF Ombudsman', email: 'ombudsman@ombudsman-forces.ca', role: 'Military Ombudsman', category: 'military', province: 'National', flagScore: 0, flags: [], notes: 'Investigates complaints from military personnel and families.' },
    { name: 'Judge Advocate General', org: 'Office of the JAG', email: 'jag@forces.gc.ca', role: 'Judge Advocate General', category: 'military', province: 'National', flagScore: 0, flags: [], notes: 'Chief legal officer of the Canadian Forces. Relevant to military justice issues.' },
    { name: 'Military Police Complaints Commission', org: 'MPCC', email: 'mpcc@mpcc-cppm.gc.ca', role: 'Military Police Oversight', category: 'military', province: 'National', flagScore: 0, flags: [], notes: 'Civilian oversight of CFNIS. Has found repeated CFNIS failures. Relevant to our CFNIS accountability evidence.' }
  ],

  courts: [
    { name: 'Federal Court of Canada Registry', org: 'Federal Court of Canada', email: 'registry@fct-cf.gc.ca', role: 'Court Registry', category: 'court', province: 'National', flagScore: 0, flags: [], notes: 'Files for judicial review of federal decisions.' },
    { name: 'Supreme Court of Canada Registry', org: 'Supreme Court of Canada', email: 'registrar@scc-csc.ca', role: 'Registrar', category: 'court', province: 'National', flagScore: 0, flags: [], notes: 'Highest court. Leave applications, constitutional references.' },
    { name: 'Department of Justice Canada', org: 'Department of Justice', email: 'webadmin@justice.gc.ca', role: 'Federal Justice', category: 'court', province: 'National', flagScore: 0, flags: [], notes: "Attorney General's department. s.504 private prosecution submissions." },
    { name: 'Law Society of Ontario', org: 'Law Society of Ontario', email: 'lawsociety@lso.ca', role: 'Lawyer Regulator', category: 'court', province: 'Ontario', flagScore: 0, flags: [], notes: 'Regulates Ontario lawyers and paralegals. For complaints about legal misconduct.' },
    { name: 'RCMP National Division', org: 'Royal Canadian Mounted Police', email: 'rcmpnationaldivision@rcmp-grc.gc.ca', role: 'Federal Police', category: 'court', province: 'National', flagScore: 0, flags: [], notes: 's.504 Criminal Code complaints can be filed with RCMP. Tip line: 1-800-420-5805.' }
  ]

};

// Flat array of all contacts for iteration
CAMPAIGN_CONTACTS.all = [
  ...CAMPAIGN_CONTACTS.senators,
  ...CAMPAIGN_CONTACTS.media,
  ...CAMPAIGN_CONTACTS.thinkTanks,
  ...CAMPAIGN_CONTACTS.premiers,
  ...CAMPAIGN_CONTACTS.military,
  ...CAMPAIGN_CONTACTS.courts
];

// Stats
CAMPAIGN_CONTACTS.stats = {
  senators: CAMPAIGN_CONTACTS.senators.length,
  media: CAMPAIGN_CONTACTS.media.length,
  thinkTanks: CAMPAIGN_CONTACTS.thinkTanks.length,
  premiers: CAMPAIGN_CONTACTS.premiers.length,
  military: CAMPAIGN_CONTACTS.military.length,
  courts: CAMPAIGN_CONTACTS.courts.length,
  total: CAMPAIGN_CONTACTS.all.length
};
