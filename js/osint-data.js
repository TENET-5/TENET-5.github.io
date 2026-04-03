const osintManifest = [
  {
    id: "vuong",
    name: "Kevin Vuong",
    riding: "Spadina—Fort York (2021–2025)",
    party: "Independent",
    partyClass: "party-ind",
    evidence: [
      { text: "Only independent MP to vote against Gaza ceasefire (Vote #658)", highlight: "Only independent MP" },
      { text: "Wikipedia describes him as an evangelized defender of Israel since the Gaza war began", highlight: "evangelized defender" },
      { text: "Hansard: confronted MPs as apologists for a terrorist group", highlight: "apologists for a terrorist group" },
      { text: "Twitter: I stand with you, @LevittMichael (Friends of Simon Wiesenthal Center CEO)", highlight: "I stand with you, @LevittMichael" },
      { text: "237 CCP mentions across 318 speeches — uses anti-China rhetoric as cover for Israel advocacy: Does Beijing have something on them?", highlight: "Does Beijing have something on them?" },
      { text: "Called veteran Daniel Perry domestic terrorist for questioning Israeli influence", highlight: "domestic terrorist" },
      { text: "Concealed sexual assault charge from party and military (fined $500)", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658",
    dossier: "dossier-viewer.html?file=evidence/profiles/vuong_osint_dossier.md"
  },
  {
    id: "lantsman",
    name: "Melissa Lantsman",
    riding: "Thornhill — Deputy Leader, CPC",
    party: "CPC",
    partyClass: "party-cpc",
    evidence: [
      { text: "Lobbied by CIJA 15 times — registered in federal Lobbyist Registry", highlight: "15 times" },
      { text: "Twitter (Oct 9, 2023): More than a hundred Canadians have reached out to my office...", highlight: "More than a hundred Canadians have reached out to my office..." },
      { text: "Aggressively challenged Canadian arms embargo against Israel: Canada has put in place an arms embargo against Israel for everything excluding the iron dome", highlight: "Canada has put in place an arms embargo against Israel for everything excluding the iron dome" },
      { text: "Simultaneously positions as leading voice against 'foreign interference' — demands investigations, cites NSICOP", highlight: "leading voice against \"foreign interference\"" },
      { text: "As Deputy Leader, controls significant CPC caucus messaging on both Israel and foreign interference files", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658",
    dossier: "dossier-viewer.html?file=evidence/profiles/lantsman_osint_dossier.md"
  },
  {
    id: "housefather",
    name: "Anthony Housefather",
    riding: "Mount Royal",
    party: "Liberal",
    partyClass: "party-lpc",
    evidence: [
      { text: "Lobbied by CIJA 67 times — most of any MP in the House", highlight: "67 times" },
      { text: "Broke Liberal party line to vote NAY on ceasefire — only 3 Liberals did so", highlight: "Broke Liberal party line" },
      { text: "Publicly threatened to leave the Liberal caucus over Israel policy", highlight: "" },
      { text: "Direct correlation: most-lobbied MP → broke party line on the exact vote CIJA targeted", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658 (BROKE PARTY LINE)",
    dossier: null
  },
  {
    id: "mendicino",
    name: "Marco Mendicino",
    riding: "Eglinton—Lawrence",
    party: "Liberal",
    partyClass: "party-lpc",
    evidence: [
      { text: "Lobbied by CIJA 63 times — second-most of any MP", highlight: "63 times" },
      { text: "Broke Liberal party line to vote NAY on ceasefire", highlight: "Broke Liberal party line" },
      { text: "Former Minister of Public Safety — had direct access to national security intelligence while being intensely lobbied by Israeli advocacy org", highlight: "" },
      { text: "The two most-lobbied MPs both voted against their own party on the exact issue the foreign lobby demanded", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658 (BROKE PARTY LINE)",
    dossier: null
  },
  {
    id: "woo",
    name: "Sen. Yuen Pau Woo",
    riding: "ISG Leader — 41 senators",
    party: "ISG",
    partyClass: "party-ind",
    evidence: [
      { text: "Led Senate defeat of Uyghur genocide motion — 33-29 (House passed 266-0)", highlight: "33-29" },
      { text: "Advocacy group classified as UFWD-linked (United Front Work Department — CCP espionage arm)", highlight: "UFWD-linked" },
      { text: "Met with leaders of CCP \"Overseas Chinese\" groups 3 days before filing challenge to Foreign Interference Commission", highlight: "3 days before" },
      { text: "China publicly applauded the senators who voted against genocide recognition as \"people of vision\"", highlight: "applauded the senators who voted against" },
      { text: "Controls 41-vote ISG bloc capable of killing any House legislation in the Senate", highlight: "" },
      { text: "Proposed amendment to <span class=\"highlight\">weaken Bill C-70's foreign agent registry</span> — same senator already UFWD-linked, led Uyghur genocide defeat, met CCP espionage groups (<a href=\"https://senatoryuenpauwoo.ca/en/parliamentary-activities/speeches/an-amendment-to-bill-c-70-an-act-respecting-countering-foreign-interference/\">source</a>)", highlight: "" },
      { text: "Canada has <span class=\"highlight\">575 CCP United Front-linked organizations</span> — highest per-capita density among Western democracies, <span class=\"highlight\">5× the rate of the United States</span> (<a href=\"https://www.thebureau.news/p/canadian-senators-advocacy-group\">The Bureau</a>)", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ LED OPPOSITION — Uyghur Genocide Vote",
    dossier: "dossier-viewer.html?file=data/dossier_senator_woo.json"
  },
  {
    id: "morantz",
    name: "Marty Morantz",
    riding: "Charleswood—St. James—Assiniboia—Headingley",
    party: "CPC",
    partyClass: "party-cpc",
    evidence: [
      { text: "Lobbied by CIJA 13 times — 5th most of any MP", highlight: "13 times" },
      { text: "Voted NAY on ceasefire along with entire CPC caucus", highlight: "" },
      { text: "Part of the bloc of 113 Conservatives who uniformly voted against Gaza ceasefire", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658",
    dossier: null
  },
  {
    id: "poilievre",
    name: "Pierre Poilievre",
    riding: "Carleton — Leader, CPC",
    party: "CPC Leader",
    partyClass: "party-cpc",
    evidence: [
      { text: "Spoke at rally of ~1,000 Israel supporters at Nathan Phillips Square marking 6 months of Gaza war", highlight: "~1,000 Israel supporters" },
      { text: "Hansard (2008): defended Israel by citing anti-Israel incidents at York University — Jewish students were swarmed", highlight: "Jewish students were swarmed" },
      { text: "Hansard (Oct 2023): Israel does have the right to defend itself — formal party position statement", highlight: "Israel does have the right to defend itself" },
      { text: "Simultaneously leads anti-foreign-interference crusade — slammed Trudeau's foreign interference allegations as lies, refused security clearance briefing", highlight: "Simultaneously leads anti-foreign-interference crusade" },
      { text: "Called Foreign Interference Inquiry off to a very bad start — focus exclusively on China, never mentions Israeli advocacy influence", highlight: "off to a very bad start" },
      { text: "THE PARADOX: Pledged to recognize Jerusalem as Israel's capital + move Canadian embassy — while demanding arrests for Chinese \"foreign interference\"", highlight: "THE PARADOX:" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ ENTIRE CPC VOTED NAY — Ceasefire Vote #658",
    dossier: "dossier-viewer.html?file=data/pierre_poilievre_profile.json"
  },
  {
    id: "genuis",
    name: "Garnett Genuis",
    riding: "Sherwood Park—Fort Saskatchewan",
    party: "CPC",
    partyClass: "party-cpc",
    evidence: [
      { text: "Hansard: Sponsored Bill S-232 (Jewish Heritage Month) — direct legislative advocacy for Israeli community interests", highlight: "Bill S-232 (Jewish Heritage Month)" },
      { text: "Advocated for just war intervention against Iran to support Israel — using Catholic just war doctrine in Parliament", highlight: "just war intervention against Iran" },
      { text: "Simultaneously: leading voice on Uyghur genocide recognition — championed motion that passed 266-0 in House", highlight: "leading voice on Uyghur genocide recognition" },
      { text: "Sat on Canada-China Relations Committee — aggressively pursued CCP foreign interference file", highlight: "" },
      { text: "THE PARADOX: Champions human rights against Chinese genocide while advocating foreign military intervention to protect Israeli interests — selective humanitarianism", highlight: "THE PARADOX:" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658",
    dossier: null
  },
  {
    id: "ben_carr",
    name: "Ben Carr",
    riding: "Winnipeg South Centre",
    party: "Liberal",
    partyClass: "party-lpc",
    evidence: [
      { text: "3rd Liberal rebel who voted against ceasefire — alongside Housefather (67x lobbied) and Mendicino (63x lobbied)", highlight: "3rd Liberal rebel" },
      { text: "Also voted against NDP motion to recognize Palestinian statehood — consistent pattern across multiple votes", highlight: "consistent pattern across multiple votes" },
      { text: "Listed on Reverse Canary Mission: routinely denies the genocide and stands with Israel", highlight: "routinely denies the genocide and stands with Israel" },
      { text: "One of only 4 MPs in all parties to break from their own caucus position on ceasefire", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658 (BROKE PARTY LINE)",
    dossier: null
  },
  {
    id: "scheer",
    name: "Andrew Scheer",
    riding: "Regina—Qu'Appelle (Former CPC Leader)",
    party: "CPC",
    partyClass: "party-cpc",
    evidence: [
      { text: "Pledged to move Canadian Embassy to Jerusalem — following Trump's lead", highlight: "move Canadian Embassy to Jerusalem" },
      { text: "Times of Israel described him as a staunch Israel supporter who \"kicks off election bid\"", highlight: "staunch Israel supporter" },
      { text: "CTV: delivered sometimes fiery foreign-policy speech committing Conservative government to Jerusalem recognition", highlight: "sometimes fiery foreign-policy speech" },
      { text: "Set the precedent for CPC's institutional alignment with Israeli foreign policy that Poilievre and Lantsman now continue", highlight: "" }
    ],
    voteClass: "vote-nay",
    voteText: "✕ VOTED NAY — Ceasefire Vote #658",
    dossier: null
  },
  {
    id: "cotler",
    name: "Irwin Cotler",
    riding: "Mount Royal (Former) — Canada's Antisemitism Envoy",
    party: "Liberal",
    partyClass: "party-lpc",
    evidence: [
      { text: "Received CIJA Lifetime Achievement Award — direct organizational recognition", highlight: "CIJA Lifetime Achievement Award" },
      { text: "CIJA and Cotler joined forces to fight antisemitism — organizational partnership", highlight: "joined forces" },
      { text: "The Maple: The perfect antisemitism envoy for a rotten state — documented institutional capture", highlight: "The perfect antisemitism envoy for a rotten state" },
      { text: "Appointed by Liberal government as Canada's Special Envoy on Antisemitism — uses position to shield Israel from criticism", highlight: "Canada's Special Envoy on Antisemitism" },
      { text: "THE PARADOX: Lifelong human rights advocate uses human rights framework exclusively to protect a state committing documented human rights violations", highlight: "THE PARADOX:" }
    ],
    voteClass: "vote-nay",
    voteText: "⚖ GOVERNMENT ENVOY — Shields Israel advocacy from scrutiny",
    dossier: "dossier-viewer.html?file=data/irwin_cotler_profile.json"
  },
  {
    id: "han_dong",
    name: "Han Dong [CONTRAST CASE]",
    riding: "Don Valley North (Expelled from Liberal caucus)",
    party: "Liberal→Ind",
    partyClass: "party-lpc",
    contrastClass: "rgba(58,134,255,0.2)",
    contrastAlert: "⚡ EXPELLED — CCP interference (consequences applied)",
    evidence: [
      { text: "Expelled from Liberal caucus after allegations of CCP foreign interference", highlight: "Expelled from Liberal caucus" },
      { text: "Foreign interference inquiry: sought support from international students linked to Chinese government", highlight: "sought support from international students" },
      { text: "Settled defamation lawsuit with Global News over China interference reporting", highlight: "" },
      { text: "THE CONTRAST: China-linked MPs face expulsion, investigation, public shame. Israel-linked MPs face zero consequences, continued promotion, government appointments", highlight: "expulsion, investigation, public shame" }
    ],
    voteClass: "vote-nay",
    voteText: "⚡ EXPELLED — CCP interference (consequences applied)",
    dossier: "dossier-viewer.html?file=data/han_dong_profile.json"
  },
  {
    id: "chong",
    name: "Michael Chong [GENUINE TARGET]",
    riding: "Wellington—Halton Hills (CPC Shadow Foreign Affairs)",
    party: "CPC",
    partyClass: "party-cpc",
    contrastClass: "rgba(58,134,255,0.2)",
    contrastAlert: "🎯 TARGETED BY CHINA — (genuine foreign interference victim)",
    evidence: [
      { text: "BBC: genuinely targeted by China for criticizing human rights record — family threatened", highlight: "genuinely targeted by China" },
      { text: "Global Affairs confirmed: victim of foreign smear campaign on Chinese social media apps", highlight: "victim of foreign smear campaign" },
      { text: "Represents actual foreign interference — the real thing, not the weaponized rhetoric", highlight: "actual foreign interference" },
      { text: "THE CONTRAST: Chong was targeted because he criticized China. MPs who advocate for Israel are rewarded. Both involve foreign states influencing Canadian democracy — only one is investigated", highlight: "THE CONTRAST:" }
    ],
    voteClass: "vote-nay",
    voteText: "🎯 TARGETED BY CHINA — (genuine foreign interference victim)",
    dossier: "dossier-viewer.html?file=data/michael_chong_profile.json"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { osintManifest };
}
