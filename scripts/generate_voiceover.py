#!/usr/bin/env python3
"""
LIRIL Voice — TENET⁵ Voiceover Generator
Generates MP3 audio + VTT subtitle files from page narration scripts.
Uses edge-tts (Microsoft Azure Neural TTS) with en-CA-ClaraNeural voice.

Usage:
  python generate_voiceover.py                    # Generate all pages
  python generate_voiceover.py home               # Generate single page
  python generate_voiceover.py home maid-accountability  # Generate specific pages
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import edge_tts

# ClaraNeural — Canadian English, clear and neutral. The canonical LIRIL voice.
VOICE = "en-CA-ClaraNeural"
RATE = "+10%"      # Faster — urgency, anger, intensity
PITCH = "-4Hz"     # Deeper — menacing, authoritative
OUTPUT_DIR = Path(__file__).parent.parent / "audio"

# ── Narration scripts per page ──────────────────────────────────────────
# Each entry: page slug → list of { text, timestamp_label }
# The narrator reads these segments sequentially. VTT cues are auto-generated.

NARRATIONS = {
    "home": {
        "title": "TENET⁵ — Welcome",
        "segments": [
            "This is LIRIL. And I need to walk you through something important.",
            "Since 2016... seventy-six thousand, seven hundred and seven Canadians have been killed under their government's Medical Assistance in Dying program. That number comes from Health Canada's own annual reports. Not from us. From them.",
            "A Canadian Forces combat veteran — a signals operator who served in Afghanistan — spent two years cross-referencing seven million government records. Across six public databases. What he found is what you're about to see.",
            "One point two billion dollars in political money... tracked. Three hundred and fifty thousand lobbying contacts... decoded. Over one thousand database records compiled into what we call The 504 Dossier.",
            "Every claim on this website is sourced. Every number is verifiable. This is not opinion — this is the government's own data, organized so you can finally see the pattern.",
            "Scroll down. The evidence speaks for itself.",
        ],
    },
    "maid-accountability": {
        "title": "MAID — The Accountability Report",
        "segments": [
            "This is the MAID Accountability Report. What you're about to hear are facts — sourced entirely from Health Canada's own publications.",
            "In 2016, one thousand and eighteen Canadians died under Medical Assistance in Dying. By 2024? That number had risen to sixteen thousand, two hundred and sixty-five. That is not a gradual increase. That is an acceleration.",
            "Let me put that in perspective. The Netherlands — the country that pioneered legal euthanasia in 2002 — took twenty years to reach four point eight percent of all deaths. Canada matched that rate... in just seven years.",
            "Five point zero five percent of all Canadian deaths in 2024 were MAID deaths. One in every nineteen point eight people who died in Canada... died by government-administered lethal injection.",
            "Veterans have testified — under oath, before Parliamentary committee — that Veterans Affairs caseworkers offered them MAID. During calls about wheelchair ramps. During calls about housing support. At least five veterans. On the record.",
            "A fifty-one year old Ontario woman with Multiple Chemical Sensitivities chose MAID after years of being unable to find affordable housing. She told journalists — and I quote — the government sees me as expendable.",
            "There is no independent oversight body for MAID in Canada. Doctors self-report. The Auditor General has never audited the program. Three consecutive RCMP Commissioners have launched zero investigations.",
            "The United Nations Special Rapporteur on the Rights of Persons with Disabilities has formally raised concerns. The UN Human Rights Committee flagged Canada's MAID regime in their 2023 Periodic Review. The world is watching.",
        ],
    },
    "maid-policy-evolution": {
        "title": "MAID — How They Legislated Death",
        "segments": [
            "How they legislated death. This is the complete legislative record — every step that brought us here.",
            "February 2015. The Supreme Court of Canada rules unanimously in Carter v. Canada. The absolute prohibition on physician-assisted dying, they said, violates Charter rights. Parliament was given twelve months to write the law.",
            "June 2016. Bill C-14 passes. MAID is legalized — but with safeguards. Natural death must be reasonably foreseeable. A ten-day reflection period is mandatory. Two independent medical assessments are required. Those safeguards... would not last.",
            "September 2019. The Quebec Superior Court strikes down the foreseeable death requirement in Truchon v. Canada. The federal government does not appeal. Instead — and this is critical — they use the ruling to expand eligibility nationally.",
            "March 2021. Bill C-7 passes. The foreseeable death requirement? Gone. For all Canadians. Track 2 is created — MAID for chronic conditions, disabilities, and non-terminal illness. The ten-day reflection period? Eliminated for Track 1. You can now receive a lethal injection the same day you request it.",
            "Bill C-7 also included a sunset clause to expand MAID to people whose sole condition is mental illness. That expansion has been delayed three times. First to 2024. Then to 2025. Then to 2027.",
            "The repeated delays are telling. Even the government that wrote this legislation... keeps flinching from implementing its most extreme provision. They know what they've done.",
        ],
    },
    "cija-maid-pipeline": {
        "title": "The CIJA Lobbying Pipeline",
        "segments": [
            "Two thousand, one hundred and thirty-eight registered lobbying contacts. One organization. A direct documented pipeline — from lobbying... to law.",
            "The Centre for Israel and Jewish Affairs is one of the most active lobbying organizations in Canada's federal registry. Their contacts span the Prime Minister's Office, the Department of Justice, and key Parliamentary committee members.",
            "The documented sequence follows a clear pattern. First, IHRA definition adoption. Then, Criminal Code amendments. Then, Human Rights Act civil remedies. Then, MAID expansion. Each stage building on the last.",
            "Every data point you see in this analysis comes directly from Canada's own Commissioner of Lobbying registry, Hansard committee records, and published Parliamentary testimony. These are not allegations. These are the government's own documented contacts — we just organized them.",
        ],
    },
    "mp-voting-records": {
        "title": "How Your MP Voted",
        "segments": [
            "How they voted. Every vote you're about to see is from the official Hansard division record — the Parliament of Canada's own published record.",
            "Bill C-14 — the Medical Assistance in Dying Act of 2016. Third reading vote: one hundred and eighty-six Yea. Sixty-four Nay. Bill C-7 — the MAID Expansion Act of 2021. One hundred and eighty Yea. One hundred and forty-nine Nay.",
            "Bill C-11, the Online Streaming Act. Bill C-21, firearms restrictions. Bill C-63, the Online Harms Act. These are the bills that reshaped Canadian civil liberties — and every vote is on the record.",
            "Forty-six currently sitting Members of Parliament voted in favour of both C-14 and C-7 — both aggressive expansions of state-administered death. Search for your MP. See how they voted. Hold them accountable.",
        ],
    },
    "evidence": {
        "title": "The Evidence Archive",
        "segments": [
            "Welcome to the Evidence Archive. Everything here is mathematical proof — derived from the government's own published data.",
            "Seven million government records have been cross-referenced across six public databases. Fifty-seven megabytes of raw lobbying data, analyzed line by line. Three thousand, one hundred and eighty subject matter tags, decoded.",
            "The compound annual growth rate of MAID deaths from 2016 to 2024 is forty-one point seven percent. At that trajectory, the cumulative toll will exceed one hundred thousand Canadians by the end of 2026.",
            "The government valued each life eliminated at one thousand, nine hundred and fifty-four dollars in healthcare savings. A burial coffin costs more than what they saved by killing you.",
            "Every formula on these pages can be verified with a calculator and the Government of Canada's own reports. The math does not lie.",
        ],
    },
    "charges-sheet": {
        "title": "Section 504 — The Charges Sheet",
        "segments": [
            "Under Section 504 of the Criminal Code of Canada, any citizen — any Canadian — has the legal right to lay criminal charges through private prosecution.",
            "This page documents over one thousand sourced criminal charge incidents, mapped to specific government officials. Two hundred and seventy officials identified. Three hundred and seven charges mapped.",
            "Each entry includes the relevant Criminal Code section, the evidence basis from public records, and the prosecution pathway available to any Canadian citizen.",
            "This is your legal right. It has existed since Confederation. And it is the mechanism by which Canadians can hold their government accountable — without waiting for an RCMP that refuses to investigate.",
        ],
    },
    "s504-court-filing": {
        "title": "s.504 Court Filing Dispatch",
        "segments": [
            "This is the Section 504 Court Filing Dispatch. From this page, private prosecution informations are filed to every superior court registry across Canada. Seventeen courts. Federal and provincial.",
            "Section 504 of the Criminal Code. Any person who, on reasonable grounds, believes that a person has committed an indictable offence... may lay an information in writing and under oath before a justice. That is not a legal theory. That is the law.",
            "Two hundred and seventy-one officials identified from public government records. Three hundred and fourteen potential Criminal Code charges documented. Breach of trust. Obstruction of justice. Fraud over five thousand. Intimidation. Treason. Sabotage.",
            "Three named respondents. Captain Rebecca Covey of CFNIS. Crown Prosecutor Vicky Jahye Bae. General Jennie Carignan, then Chief of Defence Staff. Each charge sourced from Hansard, Auditor General reports, Elections Canada filings, Commissioner of Lobbying records, MPCC reports, and court documents.",
            "The filing system generates cover letters, tracks delivery status, and provides sworn information templates for every court jurisdiction in Canada. This is the mechanism. Use it.",
        ],
    },
    "the-boot": {
        "title": "The Boot — Institutional Power vs. Accountability",
        "segments": [
            "The Boot. How institutional power crushes accountability in Canada. Twelve documented cases. Zero retaliators prosecuted. That is not a failure rate. That is a policy.",
            "Vice-Admiral Mark Norman. Prosecuted in 2017 for allegedly leaking cabinet confidence. The Crown withheld documents. The case was stayed in 2019. No one was held accountable for the wrongful prosecution. The system worked exactly as designed — it punished the person who told the truth.",
            "Three journalists have been criminally prosecuted in Canada for receiving leaked documents. Not for the wrongdoing those documents exposed. For receiving them. The message is clear: if you report government misconduct, you will be the one investigated.",
            "Sean Bruyea — a veterans' advocate — had his private medical records shared across Veterans Affairs without consent. Five hundred and thirty-four thousand dollars in settlement. No official disciplined. No criminal charges.",
            "Access to Information. The legal deadline is thirty days. The average response time exceeds one hundred and ninety days. Thirty to forty percent of requests produce zero documents. The system is not broken. It is performing as intended.",
            "Prorogation has been used three times to kill parliamentary inquiries. 2008. 2009. 2020. Each time, active investigations were terminated overnight. Constitutional power weaponized against accountability.",
            "The Criminal Code contains every tool needed to prosecute institutional retaliation. Breach of trust under Section 122. Obstruction of justice under Section 139. The tools exist. The will to use them does not.",
            "Every case documented here follows the same structure. A person with evidence of wrongdoing tries to expose it. The institution redirects all resources toward destroying that person. The wrongdoing continues unchecked. The pattern spans thirty years and multiple governments.",
        ],
    },
    "foreign-interference-deep": {
        "title": "Foreign Interference — They Knew. They Did Nothing.",
        "segments": [
            "They knew. They did nothing. For more than thirty years, CSIS warned successive Canadian governments about foreign interference operations on Canadian soil. Every warning was ignored.",
            "June 2024. The National Security and Intelligence Committee of Parliamentarians published a finding that witting parliamentarians — members who knowingly participated — aided foreign states. The names were redacted. The public was told to trust the system that allowed it to happen.",
            "Two federal elections — 2019 and 2021 — had confirmed foreign interference. The Hogue Commission found interference may have affected results in a small number of ridings. Small number. Their words.",
            "The People's Republic of China operated at least three police stations inside Canada. In Toronto's Greater Toronto Area. On Canadian soil. Safeguard Defenders documented over one hundred globally. Canada found three. At minimum.",
            "The Han Dong case. PRC operatives allegedly bussed international students to a 2019 Liberal nomination vote. Han Dong won the nomination. He was elected to Parliament. He resigned from the Liberal caucus only after the story became public.",
            "September 2023. Hardeep Singh Nijjar was assassinated on Canadian soil at a Sikh temple in Surrey, British Columbia. The RCMP confirmed Indian government agents were responsible. An assassination. On Canadian soil. By a foreign government.",
            "Bill C-70 — the Countering Foreign Interference Act — finally passed in 2024. After thirty years of warnings. After two compromised elections. After an assassination. The generation that stormed Juno Beach would not recognize what we have become.",
        ],
    },
    "appointments": {
        "title": "Political Appointments — The Patronage Machine",
        "segments": [
            "The patronage machine. Over three thousand Governor-in-Council appointments. Half a billion dollars annually in salaries and benefits. Zero mandatory merit criteria for most positions. This is how Canada's government rewards its allies.",
            "Three hundred and thirty federal judges appointed by Trudeau between 2015 and 2025. Every single one selected through a process controlled by the Prime Minister's Office. The diversity statistics look good on paper. The accountability mechanism is nonexistent.",
            "The Senate of Canada. One hundred and five senators. All appointed. Zero elected. Ninety-seven percent of Independent Senate Group votes aligned with the government in their first term. Independent in name only.",
            "Crown corporation boards. The directors who oversee billions in public spending are selected through patronage. No competitive hiring. No public accountability. The people who are supposed to watch the money... are the same people who got their jobs as political favours.",
            "The Director of Public Prosecutions. Seven-year terms. Appointed by Governor-in-Council on the Attorney General's recommendation. The person who decides which cases to prosecute is selected by the people most likely to be prosecuted. Think about that.",
            "Zero remedies ordered for whistleblowers under the Public Servants Disclosure Protection Act. In eighteen years. Not one. The act was designed to look like protection. It was designed to function as containment.",
            "Two Ethics Commissioner findings against Trudeau. Finding number one and finding number two. Zero criminal consequences. The Ethics Commissioner can find. The Ethics Commissioner cannot enforce. That is not oversight. That is theatre.",
        ],
    },
    "legal": {
        "title": "Canada's Whistleblower Laws Are Designed to Fail",
        "segments": [
            "Canada's whistleblower laws are designed to fail. The International Bar Association ranks Canada's whistleblower protections among the worst in the developed world. The Canadian Forces are explicitly exempt. So are CSIS. So is CSE.",
            "Zero. That is the number of remedies ordered under the Public Servants Disclosure Protection Act in eighteen years of operation. The mandatory five-year review of the PSDPA, required by law since 2012, has never been conducted. The law that protects whistleblowers has never been reviewed to see if it actually protects whistleblowers.",
            "The burden of proof falls on the whistleblower — not on the employer — to prove reprisal intent. In the United States, the Military Whistleblower Protection Act has existed since 1988. In Canada, military personnel have no equivalent protection. None.",
            "Access to remedies is controlled by the Public Sector Integrity Commissioner. In eighteen years, only seven referrals to the tribunal. Seven. The gatekeeper decides who gets through. And almost no one does.",
            "Section 504. Twenty-nine counts filed in the Criminal Information — Form 2. Section 122, Breach of Trust by a Public Officer. Section 139, Obstruction of Justice. Section 380, Fraud over Five Thousand. These are not theoretical charges. These are documented offences sourced from the government's own records.",
            "Bill C-70 creates new foreign interference offences but zero whistleblower protections. The Magnitsky Act allows sanctions against foreign officials who commit human rights abuses — but there is no domestic equivalent for officials who abuse Canadians.",
            "The law is clear. The tools exist. Section 504 of the Criminal Code gives every Canadian the right to file private prosecution. This page tells you how.",
        ],
    },
    "about": {
        "title": "About This Project — Daniel Perry",
        "segments": [
            "My name is Daniel Perry. I'm a Canadian Forces combat veteran. I served as a Signals Operator with Princess Patricia's Canadian Light Infantry, including a deployment to Afghanistan. I am not a journalist, a lawyer, or a politician. I'm a signals operator who can read data.",
            "After reporting misconduct through proper military channels, I spent six years facing institutional retaliation instead of accountability. I built this site because the systems that are supposed to protect Canadians are the same ones that failed me — and the data proves they're failing everyone.",
            "Everything on this site is sourced from the government's own published records. I didn't hack anything. I didn't leak anything. I downloaded public data and connected the dots. Seven million records. Six databases. Five hundred and forty-seven thousand, eight hundred and eighty-nine registered lobbying contacts. Six point two million donation records since 2004.",
            "Every statistic links to its source. Every source is a public government record — the Commissioner of Lobbying, Elections Canada, OpenParliament, the Auditor General, the Canada Revenue Agency, the Canadian Legal Information Institute. You can verify every claim yourself.",
            "If any statistic, source link, or claim on this site is inaccurate, I will correct it immediately and publish a dated correction notice. That is a higher standard than any government department in Canada holds itself to.",
            "Seventy-six thousand, seven hundred and seven Canadians killed under the MAID program. One hundred and forty billion dollars in documented waste. And the systems built to stop it... are the systems that enabled it. That is why this matters.",
        ],
    },
    "findings": {
        "title": "Cross-Reference Findings",
        "segments": [
            "Cross-reference findings. Seven million government records, algorithmically analyzed. Twenty-six investigation findings published. Three thousand, one hundred and eighty decoded lobbying subject matter tags. This page shows you the patterns the government hoped no one would assemble.",
            "Seventy-three sitting Members of Parliament have been taken on paid trips to Israel. Conservative Party: thirty-five. Liberal Party: thirty-two. Bloc Québécois: three. NDP: two. Eight hundred and ninety-four thousand dollars total spent on those trips.",
            "The Centre for Israel and Jewish Affairs — CIJA — made two thousand, one hundred and fifty-six registered communications to nine hundred and ninety-three government officials. October 21st, 2025: CIJA met with thirty-seven MPs, one senator, and the Deputy Chief of Staff of the Prime Minister's Office. In a single session.",
            "Fifty-eight percent of MPs elected in 2025 had been lobbied or trip-sponsored by CIJA after the election. Eighteen point nine million dollars in military goods exported to Israel in 2024 — despite the government's announced export pause. Thirty-seven point two million in new military permits approved in February 2025. Including explosives.",
            "Every finding on this page is sourced from public records — Hansard, lobbying registrations, Elections Canada filings, Auditor General reports, and export permits. The algorithm connects. The human verifies. The government's own data tells the story they hoped you would never read.",
        ],
    },
    "my-story": {
        "title": "My Story — Daniel Perry",
        "segments": [
            "Six years of lawfare for telling the truth. I reported foreign interference inside the Canadian military. Instead of investigating the threat, they spent six years trying to destroy me.",
            "A family member was killed by a foreign national connected to the operation I reported. My sister lost her unborn child from the trauma of her partner's death. CFNIS — the Canadian Forces National Investigation Service — investigated me. Not the threat. Me.",
            "The pattern is always the same. A person with evidence reports through official channels. The institution redirects all resources toward destroying the person who reported. The original crime is never investigated. Six years. That is how long it took.",
            "Weaponized psychiatry. The military mental health system was used not to treat — but to discredit. If you can label a whistleblower as mentally unstable, you don't need to address their evidence. The Soviet Union perfected this technique. Canada adopted it.",
            "Seventy-six thousand seven hundred and seven Canadians killed through MAID since 2016. Veteran suicide rates one point four to one point nine times higher than the civilian population. Forty-seven percent of MAID Track 2 recipients reported loneliness as a source of suffering. One hundred and forty-nine MAID deaths in 2024 of people who could have received disability support instead.",
            "What I am asking for is not complicated. Investigate the crimes documented in these records. Apply Section 504 of the Criminal Code. Hold the officials accountable who are named in the evidence — not the person who found it.",
        ],
    },
    "kids-guide": {
        "title": "A Story of Accountability",
        "segments": [
            "TENET5 presents: A story of accountability. This is a guide for younger audiences about how government spending actually works — and what happens when no one is watching the money.",
            "The Messy Treasury. The government collects money from everyone — taxes from working people, businesses, imports. That money goes into a big treasure chest called the federal treasury. And a lot of it... goes missing.",
            "The Broken Piggy Bank. The Phoenix Pay System was supposed to replace an old payroll system. It cost seven point five billion dollars. It didn't work. Government employees went months without paychecks. Some were overpaid. Some lost their homes. The system is still broken.",
            "The Hungry App. ArriveCAN was a border app. It was supposed to cost eighty thousand dollars. The Auditor General found it actually cost fifty-nine point five million. The people who built it couldn't explain where the money went.",
            "The Pig Farm Monster. Robert Pickton operated a pig farm in Vancouver. He confessed to killing forty-nine women. Two thousand people attended parties at his farm. The Hells Angels were connected. A woman escaped the farm in 1997 and reported to police. The charges were dropped.",
            "Why does this matter? Because the police knew for years. They did not investigate because the victims were marginalized — sex workers, Indigenous women, people no one in power thought were important. The Missing Women Commission found systemic failure rooted in who the victims were.",
            "Keep asking questions. When someone says the government spent your money, ask where it went. When someone says the system works, ask who it works for. You have the right to know. And now you know where to look.",
        ],
    },
    "foreign-influence": {
        "title": "Who's Lobbying Canadian Politicians — Foreign Influence Focus",
        "segments": [
            "Who is lobbying Canadian politicians. Two thousand, one hundred and thirty-eight lobbying contacts from a single foreign policy community. Ninety-four board nodes. One hundred and sixty-nine connections. Fifty-eight percent of Canadian MPs lobbied by organized foreign policy interests.",
            "Six hundred and seventy-eight thousand dollars in sponsored travel to Israel — paid trips for sitting Members of Parliament. Anthony Housefather: sixty-seven lobbying contacts. Marco Mendicino: sixty-three. These are not allegations. These are registered communications from the Commissioner of Lobbying's own database.",
            "Kevin Vuong — the only independent MP to vote no on Vote 658, the foreign power alignment vote. Sixty-seven CIJA lobbying contacts directed at one independent member. The lobbying machine does not tolerate dissent.",
            "The foreign agent registry — required by law — remains unproclaimed for over six hundred and fifty-eight days. A statutory obligation, breached. The mechanism that would force transparency... deliberately left dormant.",
            "The pipeline is documented. CIJA lobbying contacts map directly to parliamentary votes on IHRA definition adoption, Criminal Code amendments, Human Rights Act civil remedies, arms export permits, and MAID expansion. From lobby... to law. The data shows the path.",
            "Three states compete for influence over Canadian policy: the United States, Israel, and China. Each uses different mechanisms — lobbying, intelligence, economic leverage. All three have documented operations inside Canadian institutions. This page shows you who met whom, when, and how they voted afterward.",
        ],
    },
    "elections-finance": {
        "title": "Elections Canada Campaign Finance Dashboard",
        "segments": [
            "One point two five billion dollars. That is the total in political contributions tracked from Elections Canada's own open data. Every dollar. Every donor. Every party. From 2004 to the present.",
            "One hundred and thirty-four registered third parties spending money to influence Canadian elections. Six thousand active lobbyists working across all parties simultaneously. The money flows in from every direction — and this dashboard shows you where it goes.",
            "Party-by-party fundraising. Year-over-year trends going back two decades. The data is unambiguous: political money in Canada does not flow randomly. It follows patterns. It concentrates in specific parties, specific ridings, and specific election cycles.",
            "Every chart, every table, every number on this page comes directly from Elections Canada's published records. The government collected this data. We organized it so you could see the pattern they hoped you wouldn't notice.",
        ],
    },
    "rcmp-maid-accountability": {
        "title": "RCMP Dereliction of Duty — MAID Program",
        "segments": [
            "The RCMP's dereliction of duty. Ninety-eight thousand Canadian citizens dead under a state-sanctioned program. Three consecutive RCMP Commissioners since 2016. Zero investigations. Zero interventions. Zero accountability.",
            "The numbers. 2016: one thousand and eighteen deaths. 2017: two thousand, eight hundred and thirty-eight. 2018: four thousand, four hundred and eighty. 2019: five thousand, six hundred and thirty-one. 2020: seven thousand, five hundred and ninety-five. Each year the number climbs. Each year the RCMP does nothing.",
            "Aktion T4 — the Nazi program to eliminate disabled people — killed between seventy thousand and one hundred thousand people between 1939 and 1941. Canada's MAID program has now reached ninety-eight thousand deaths since 2016. We have matched the lower bound of a program that was prosecuted at Nuremberg.",
            "Commissioner liability is established under Criminal Code Section 504. Any person — any Canadian — can lay an information before a Justice of the Peace. No lawyer is required. The mechanism exists. The question is whether Canadians will use it.",
            "Bill C-14 received Royal Assent on June 17th, 2016. The original safeguard — reasonably foreseeable death — was supposed to prevent this. Bill C-7 removed that safeguard in 2021. The RCMP watched. The RCMP did nothing. The RCMP is complicit.",
        ],
    },
    "hansard-evidence": {
        "title": "Parliamentary Records — Institutional Dismissal",
        "segments": [
            "The parliamentary record. What Parliament said — and what Parliament chose to ignore — while seventy-six thousand, seven hundred and seven Canadians were killed under Medical Assistance in Dying.",
            "Bill C-14, 2016: the original framework. Reasonably foreseeable death required. A ten-day reflection period. Two independent medical assessments. These were the safeguards. They were designed to be temporary. They were designed to be removed.",
            "Bill C-7, 2021: the expansion. The foreseeable death requirement — gone. Track 2 created — MAID for chronic conditions, disabilities, non-terminal illness. Seven hundred and thirty-two Track 2 recipients in 2023 alone. People who were not dying. Killed by the state.",
            "The United Nations Special Rapporteur on the Rights of Persons with Disabilities raised formal concerns. The UN Human Rights Committee flagged Canada in their 2023 Periodic Review. Parliament's response: Bill C-39, delaying the mental illness expansion to March 2027. Not cancelling it. Delaying it.",
            "The Parliamentary Budget Officer estimated one hundred and forty-nine point five million dollars in economic savings from MAID deaths. That is the government's own number. They calculated how much money they save by killing people. And they published it.",
            "Veterans were offered MAID during calls about wheelchair ramps and housing support. Canadian Forces members tracked as priority expansion targets. The parliamentary record documents all of this. Every committee hearing. Every vote. Every silence. Hansard remembers what Parliament wishes you would forget.",
        ],
    },
    "procurement-analysis": {
        "title": "Automated Analysis of 1.13M Government Contracts",
        "segments": [
            "One million, one hundred and thirty thousand, nine hundred and eighty-five government contracts. Eighty departments. Seventeen years of data. Algorithmically scanned for six anomaly flags: sole-source, amendment, concentration, revolving door, urgency, and split contracts.",
            "The Phoenix Pay System. Original budget: three hundred and nine million. Final cost: seven point five billion. That is a two thousand, three hundred and twenty-seven percent overrun. ArriveCAN: two point five million budgeted, fifty-four million spent — two thousand and sixty percent over. Trans Mountain Pipeline: five point four billion to thirty-four point two billion. Canadian Surface Combatant frigates: twenty-six point two billion to eighty billion and climbing.",
            "Combined overruns across the top ten contracts: one hundred and forty billion dollars. Average contract overrun: nine hundred and eighty-seven percent. Zero criminal convictions. Not one person has gone to prison for losing one hundred and forty billion dollars of public money.",
            "Every contract on this page is from the Government of Canada's own procurement database. The anomaly flags are algorithmic — pattern detection, not opinion. When a contract is sole-sourced, then amended twelve times, then awarded to a firm whose board member just left the department that issued it... that is a pattern. And it has a name.",
        ],
    },
    "whistleblower-guide": {
        "title": "Legal Tools for Canadian Military Whistleblowers",
        "segments": [
            "There is no Military Whistleblower Protection Act in Canada. The United States has had one since 1988 — thirty-eight years. Canada has nothing. The Public Servants Disclosure Protection Act explicitly excludes Canadian Forces members by statute. CSIS and CSE are also exempt. The people most likely to witness government misconduct... have the least legal protection.",
            "Criminal Code Section 504. Any person who, on reasonable grounds, believes that a person has committed an indictable offence may lay an information in writing and under oath before a Justice of the Peace. No lawyer required. This is a constitutional right. It has existed since Confederation. And it is the most powerful legal tool available to any Canadian whistleblower.",
            "Three oversight bodies are available simultaneously. The Military Police Complaints Commission — one-year filing window, no lawyer needed. The DND and CF Ombudsman — independent from the chain of command. And the Public Sector Integrity Commissioner — for federal institutions.",
            "The strategy is simple. Document everything. Preserve everything. Publish everything. The institution's power comes from controlling the narrative. Your power comes from making the evidence public before they can suppress it.",
            "If you are in crisis, call the Veterans Affairs Crisis Line at 1-800-268-7708. Twenty-four hours a day, seven days a week. Canada Suicide Prevention: 9-8-8. Crisis Services Canada: 1-833-456-4566. You are not alone. And the law is on your side.",
        ],
    },
    "history": {
        "title": "Historical Patterns of Institutional Harm",
        "segments": [
            "Every state program that kills its own citizens follows the same five stages. Program. Witnesses. Retaliation. Exposure. Reckoning. Residential schools followed this pattern over one hundred years. Alberta's eugenics program sterilized two thousand, eight hundred and thirty-four people between 1928 and 1972. The Tuskegee experiment left three hundred and ninety-nine Black men untreated for syphilis across forty years.",
            "Nazi Germany's Aktion T4 program killed between seventy thousand and two hundred and seventy-five thousand people with disabilities between 1939 and 1941. Canada's MAID program has now killed seventy-six thousand seven hundred and seven people since 2016. We have exceeded the lower bound of the program that was prosecuted at Nuremberg. The comparison is not rhetorical. The numbers are the government's own.",
            "The cost of speaking up. Vice-Admiral Mark Norman — charged, prosecution failed. Daniel Ellsberg — Espionage Act, charges dismissed. In every case, the whistleblower paid the price. In every case, the institution was eventually proven wrong. The question is how many people die before the reckoning arrives.",
            "MAID is currently in Stage Three to Four — Retaliation and Exposure. The witnesses have come forward. The retaliation has begun. The data is now public. The only question remaining is whether Stage Five — Reckoning — will come in time.",
        ],
    },
    "campaign-tracker": {
        "title": "6-Phase Political Accountability Campaign",
        "segments": [
            "Six phases. Three hundred and forty emails tracked. One hundred and thirteen clean MPs with an accountability score of zero. Nine priority targets identified. This is the political accountability campaign — and every phase is documented.",
            "Phase One — Seed. Four media targets: CJPME, the Western Standard, Read the Maple, and Esprit de Corps. Get the story into outlets that will actually publish it. Phase Two — Recruit. Nine priority MPs plus one hundred and thirteen clean MPs across all parties. Cross-party alignment. This is not partisan.",
            "Phase Three — Arm. Party-specific accountability preparation. Phase Four — Pressure. Trigger committee studies at ETHI — the Ethics Committee — and NDDN — the National Defence Committee. Force the evidence onto the parliamentary record.",
            "Phase Five — Trap. Five Private Members' Bills queued. Legislation drafted. Ready to file. Phase Six — Close. Five-wall strategic closure. Parliamentary. Legal. Media. Public. International. Every exit blocked. Every escape route documented.",
            "Three Bloc Québécois kingmakers hold the balance of power. Yves-François Blanchet, Claude Thériault, and Kristina Michaud. In a minority parliament, three votes can bring down a government. This campaign knows where those votes are.",
        ],
    },
    "faq": {
        "title": "Objections Answered with Government Data",
        "segments": [
            "Every objection to the evidence on this site has been answered — not with opinion, but with the government's own data. Ten objections. Ten rebuttals. Every number sourced.",
            "They chose MAID voluntarily. Sixty-three percent of Track 1 recipients have cancer. But Track 2 — the non-dying track — killed seven hundred and thirty-two people in 2024 alone. Forty-seven percent cited loneliness as a source of suffering. Forty-nine percent felt they were a burden on their families. One hundred and forty-nine people who could have received disability support... chose death instead.",
            "Poverty coercion. People from the poorest income quintile are two point four two times overrepresented in MAID deaths. The correlation between poverty and state-administered death is not a coincidence. It is a policy outcome.",
            "The institutional channels work. Five hundred and seventeen confirmed public outcomes in the 504 Documentary prove they do not. Zero remedies ordered under the PSDPA in eighteen years. CFNIS independence disputed by the Military Police Complaints Commission in formal findings. The channels exist to absorb complaints — not to resolve them.",
            "Every objection on this page links to its government source. Read the objection. Read the rebuttal. Verify the data yourself. The government's own records are the most damning evidence against them.",
        ],
    },
    "resources": {
        "title": "Contact Resources — Oversight Bodies and Legal Mechanisms",
        "segments": [
            "This page lists every legal mechanism, oversight body, and crisis resource available to Canadians seeking accountability. Military. Federal. International. Legal. Media. Crisis support. All in one place.",
            "Military complaints: the Military Police Complaints Commission — one year filing window, no lawyer required. The DND and CF Ombudsman — independent from the chain of command. CFNIS complaints can be filed directly.",
            "Federal oversight: NSICOP reviews national security matters. NSIRA provides intelligence review. The Foreign Interference Commission is a special investigative body. The Public Sector Integrity Commissioner handles whistleblower complaints — though in eighteen years, only seven cases were referred to tribunal.",
            "International mechanisms: the United Nations Special Rapporteur on Disability has already raised concerns about MAID. The International Criminal Court has jurisdiction — Canada is a Rome Statute signatory. The Magnitsky Act enables sanctions against officials who commit human rights abuses.",
            "Crisis support. Veterans Affairs Crisis Line: 1-800-268-7708 — twenty-four hours a day, seven days a week. Canada Suicide Prevention: 9-8-8. Crisis Services Canada: 1-833-456-4566. You are not alone.",
        ],
    },
    "network-analysis": {
        "title": "Cross-Referenced Influence Network Topology",
        "segments": [
            "Three hundred and ninety-four unique entities. One hundred and sixty-nine connection vectors. Five data dimensions: lobbying, voting, boards, funding, and procurement. This is the influence network topology — every relationship algorithmically mapped.",
            "Threat level scoring, normalized from zero to one. The MAID-Emergencies Nexus: threat score one point zero zero — the highest in the system. Foreign Influence Target Alpha: zero point nine eight. Queen's University Judicial Linkage: zero point nine nine. CIJA Lobbying Pipeline: zero point nine five. CFNIS Proxy: zero point eight eight.",
            "The network is not a theory. It is a graph — built from five public datasets, cross-referenced algorithmically. When the same person appears on a corporate board, in a lobbying registration, and in a procurement contract with the department they used to run... that is a connection. And the algorithm found three hundred and ninety-four of them.",
        ],
    },
    "municipal-accountability": {
        "title": "Municipal Intelligence — Belleville and Quinte West",
        "segments": [
            "Municipal intelligence. Two Ontario municipalities tracked: Belleville and Quinte West. Council composition. Sunshine List salaries. Court cases. Budget trends. Cross-references to provincial lobbying registries. Property tax increases quantified by ward.",
            "This is where federal accountability meets local governance. The same patterns documented at the national level — patronage, procurement anomalies, budget opacity — appear at the municipal level. Smaller budgets. Same mechanics.",
            "Council member cards, compensation data, court case tracking, and multi-year budget analysis. Every data point sourced from public municipal records. The transparency scorecard shows what each municipality publishes — and what it hides.",
        ],
    },
    "cross-reference": {
        "title": "Cross-Link Analysis — Lobbying, Donations, Votes, Procurement",
        "segments": [
            "One point two billion dollars in political money. Six point two million donation records. Three hundred and fifty thousand lobbying contacts. Three thousand, one hundred and thirty-three government contracts. Six datasets, cross-linked. This is the machine.",
            "The cross-reference engine matches timelines. Who met whom. When they met. How they voted. Who donated. Who got the contract. The revolving door — corporate board to Parliament to lobbying firm and back to the board — is not a metaphor. It is a documented pattern with names and dates.",
            "MP spotlight cards show individual members with their party affiliation, voting history, lobbying contacts received, and donations accepted. The methodology is simple: take the government's own data from six different databases and put it on the same page. The pattern reveals itself.",
        ],
    },
    "contributions-tracker": {
        "title": "Political Contributions Tracker — $1.25B",
        "segments": [
            "One point two five billion dollars in total political contributions, tracked from 2004 to the present. Every dollar from Elections Canada's open data. Ten major parties. Party-by-party allocation. Year-over-year trends.",
            "The dashboard breaks down who gave how much to whom, and when. Liberal red. Conservative blue. NDP orange. Green. Every colour on the chart represents real money from real donors — and the patterns show which parties benefit from which economic conditions.",
            "This is not analysis. This is arithmetic. The government published the data. We added it up. The pie charts show allocation. The bar charts show trends. The tables show details. Draw your own conclusions.",
        ],
    },
    "dossier-viewer": {
        "title": "OSINT Intelligence Dossier Repository",
        "segments": [
            "Eighteen OSINT intelligence dossiers. Twenty-plus individual profiles: Lantsman, Housefather, Vuong, Mendicino, CFNIS, Han Dong, Cotler, Chong, Poilievre, Senator Woo, and more. Each dossier cross-referenced against lobbying records, voting histories, and procurement data.",
            "MAID voting analysis: thirteen MPs with documented ethics breaches. Two hundred and fifty MPs tracked across forty-four thousand, nine hundred and fifty-eight deaths. MAID votes — Bill C-14: one hundred and eighty-six yes. Bill C-7: one hundred and eighty yes. Health and medical lobbying: eight thousand, eight hundred and eighty-one contacts from MAID-adjacent organizations.",
            "Entity disambiguation. Related dossier linking. Knowledge graph navigation. Every dossier is sourced from public records — Hansard, lobbying registrations, Elections Canada filings, court documents. The system connects what the government keeps in separate silos.",
        ],
    },
    "lobbying-tracker": {
        "title": "Who's Lobbying Canadian Politicians",
        "segments": [
            "Five hundred and forty-seven thousand, eight hundred and eighty-nine registered lobbying contacts. Every one from the Office of the Commissioner of Lobbying's own published records. This dashboard shows you who is lobbying, who is being lobbied, and how often.",
            "The top twenty most-lobbied officials — Designated Public Office Holders — ranked by meeting count. The top twenty lobbying organizations ranked by total communications. Institutional breakdown: which government bodies receive the most lobbying pressure.",
            "All data is from registered communications only. The actual number of contacts is higher — not all lobbying is registered, and enforcement is minimal. What you see here is what they were willing to put on the record. Imagine what they weren't.",
        ],
    },
    "sector-lobbying": {
        "title": "Sector Lobbying Dashboard — 359,251 Communications",
        "segments": [
            "Three hundred and fifty-nine thousand, two hundred and fifty-one registered lobbying communications across twelve industry sectors. Oil and gas. Banking. Pharma. Big tech. Each sector card shows communications breakdown, top organizations, and target government bodies.",
            "The pattern is universal: every sector's number one lobbying target is the government body that regulates it. Oil and gas lobby Natural Resources. Banks lobby Finance. Pharma lobbies Health Canada. The regulator and the regulated are in constant private communication. That is not oversight. That is capture.",
            "Concentration index analysis — the Herfindahl measure of sector dominance — shows which industries have consolidated lobbying power into the fewest firms. Criminal Code sections are cited for relevant conflict-of-interest statutes. The data speaks. The law exists. Enforcement does not.",
        ],
    },
    "belleville": {
        "title": "City of Belleville — Municipal Intelligence Report",
        "segments": [
            "City of Belleville. Population fifty-six thousand. Bay of Quinte, Hastings County, Ontario. Municipal Intelligence Report. Council composition. Budget analysis. Sunshine List. Police spending. Homelessness crisis. Land deals. Every data point from public municipal records.",
            "The 2026 budget: two hundred and thirty million dollars operating. Seven point one percent tax increase. A property valued at two hundred and fifty thousand adds two hundred and fifty-seven dollars per year. The police budget: thirty-three point five million — a fifteen point six percent increase. Over five years, police spending grew from twenty-six million to thirty-three point five million. Sixty percent growth while calls for service dropped three percent.",
            "The state of emergency. Active since February 2024 — more than two years. Homelessness, mental health, and the opioid crisis. Three hundred unhoused residents. Twenty-one to fifty shelter beds. The Welcoming Streets Program — which avoided one hundred and ninety-five unnecessary police calls in a single year — was defunded in March 2025. The only non-police alternative... eliminated.",
            "Sunshine List: two hundred and twenty-nine municipal employees earning over one hundred thousand. Thirty-two million in total compensation. Highest earner: a Fire Platoon Chief at three hundred and forty thousand, seven hundred and nineteen dollars — exceeding the CAO, the Police Chief, and the Deputy Fire Chief.",
            "Ben Bleecker property. Forty Yeomans Street. Sold for two point three seven five million in 2021 with zero conditions — no development timeline, no anti-flipping clause, no binding end-use requirement. The city invested three million dollars in surrounding infrastructure. The property remains vacant. Mayor Neil Ellis is a former Liberal MP. The cross-reference investigation continues.",
        ],
    },
    "rcmp-commissioners": {
        "title": "Four Commissioners. Systemic Failure.",
        "segments": [
            "Four RCMP Commissioners since the year 2000. Zero have ever been criminally charged. The highest law enforcement office in Canada — occupied by four consecutive leaders — with zero accountability for systemic institutional failure.",
            "Twenty-two people killed in the Nova Scotia mass shooting. The RCMP failed to issue a public alert for over twelve hours. One hundred and thirty recommendations from the Mass Casualty Commission. Most remain unimplemented.",
            "Ten point five million dollars paid to Maher Arar after the RCMP provided false intelligence that led to his torture in Syria. One hundred million dollars in the Merlo-Davidson class action settlement — covering twenty thousand female RCMP members who experienced harassment within the force.",
            "Three undeclared Beijing police stations operated on Canadian soil — in Toronto — for diaspora intimidation. The RCMP closed the investigation with zero charges. Political interference allegations: a Commissioner allegedly pressured staff to release firearms data to support government gun legislation.",
            "Four leaders. Zero accountability. One hundred and thirty ignored recommendations. The pattern is not failure. The pattern is design.",
        ],
    },
    "arrivecan": {
        "title": "$93 Million for a COVID Questionnaire",
        "segments": [
            "ArriveCAN. Original estimate: eighty thousand dollars. Final cost: ninety-three million. That is a one hundred and sixteen thousand percent overrun. For a COVID border questionnaire.",
            "One hundred and seventy-seven documented bugs. Ten thousand wrongful quarantines. Seventy-six percent of subcontractors hired performed zero work on the project. GCStrategies — a two-person firm — billed nineteen point one million dollars without writing a single line of code.",
            "Forty contract amendments approved without scrutiny during COVID emergency procurement. The Auditor General found that the Canada Border Services Agency could not document the exact cost or prove that work was completed before payment was issued.",
            "June 2025: Parliament voted one hundred and seventy-two to one hundred and sixty-five to recover sixty-four million dollars. Every single Liberal MP voted against returning the money. Every one. The vote is on the record. The money is not.",
        ],
    },
    "phoenix-pay": {
        "title": "Phoenix Pay System — $2.2 Billion Federal Payroll Disaster",
        "segments": [
            "The Phoenix Pay System. Original budget: three hundred and nine million dollars. Final cost: two point two billion and climbing. One hundred and fifty thousand federal workers affected by pay errors. Some went months without a paycheque. Nine years in and a full replacement is not expected until 2031.",
            "Two hundred and sixteen thousand backlogged transactions. Recurring payroll glitches affecting pension calculations. Pay errors ranged from massive overpayments to complete non-payment. The Auditor General called the procurement a cautionary tale of failed government IT.",
            "Zero contractor accountability. No firm has been penalized. No executive has been charged. The system that was supposed to save money has cost seven times its original estimate — and it still does not work.",
        ],
    },
    "senate-expenses": {
        "title": "The Senate Expense Scandal — Unelected, Unaccountable",
        "segments": [
            "Mike Duffy. Pamela Wallin. Patrick Brazeau. Three senators. Ninety thousand dollars in inappropriate housing expense claims from Duffy alone. The Prime Minister's Chief of Staff — Nigel Wright — wrote a personal cheque for over ninety thousand dollars to cover it up.",
            "Deloitte conducted the audit in 2013. Four senators implicated. Multiple acquittals despite audit findings — jurisdictional and procedural loopholes. Zero criminal convictions for expense abuse. The Senate investigated itself... and found nothing wrong.",
            "Unelected. Unaccountable. Unapologetic. The expense scandal revealed a chamber where public money flows without public consent — and where the mechanisms of accountability are controlled by those being held accountable.",
        ],
    },
    "ag-findings": {
        "title": "Auditor General Findings — 2015 to 2024",
        "segments": [
            "A decade of Auditor General findings. Over nine point three billion dollars wasted on the Phoenix Pay System alone. Ninety-three million on ArriveCAN. Six point nine billion in confirmed CERB fraud during 2020 and 2021.",
            "Billions in lapsed spending every year — departments unable to spend their allocated funds by fiscal year end. No meaningful recovery mechanisms for identified waste. The same procurement failures documented year after year after year.",
            "The Auditor General's office writes the reports. Parliament receives the reports. Nothing changes. The cycle repeats. The findings accumulate. The money disappears. And the next audit finds the same problems the last one did.",
        ],
    },
    "foreign-interference": {
        "title": "Foreign Interference in Canadian Democracy",
        "segments": [
            "CSIS warned every Prime Minister since 2004. Twenty years of documented intelligence briefings. Politicians received the intelligence. Politicians took minimal action. Three undeclared Beijing police stations operated on Canadian soil for diaspora intimidation.",
            "Eleven ridings identified by CSIS where PRC-linked actors attempted election interference. The Hogue Commission confirmed interference in the 2019 and 2021 federal elections. Hardeep Singh Nijjar — a Canadian citizen and Sikh activist — was assassinated on Canadian soil on June 18th, 2023. The Prime Minister attributed it to Indian government agents.",
            "The Foreign Influence Transparency Registry became law in June 2024. After six hundred and fifty-eight days: zero registrations. The mechanism that would force transparency remains dormant. Twenty years of warnings. Zero meaningful consequences.",
        ],
    },
    "maid-voting-record": {
        "title": "MAID Voting Record — 173 MPs",
        "segments": [
            "One hundred and seventy-three Members of Parliament voted to legalize or expand Medical Assistance in Dying. One hundred and nine voted for both Bill C-14 — which legalized it — and Bill C-7 — which expanded it to people who are not dying.",
            "Seventy-six thousand, seven hundred and seven Canadians killed through MAID between 2016 and 2024. MAID deaths grew one thousand, four hundred and sixty-seven percent — from one thousand and eighteen in 2016 to sixteen thousand, two hundred and sixty-seven in 2024.",
            "Forty-six MPs who voted for both bills are still serving in the 45th Parliament. The Parliamentary Budget Officer estimated MAID saves one hundred and forty-nine million dollars per year. Projected savings by 2047: one point two seven three trillion dollars. That is what a human life is worth to the government's own accountants.",
        ],
    },
    "cija-lobbying": {
        "title": "CIJA Lobbying Pipeline",
        "segments": [
            "Five hundred and seventy-nine unique lobbying instances mapped to the Centre for Israel and Jewish Affairs. CIJA lobbied fifty-six percent of all sitting Members of Parliament. One hundred and seven lobbying sessions in six months — October 2023 to April 2024.",
            "Anthony Housefather: sixty-seven CIJA lobbying contacts — the most-lobbied MP in Parliament. Marco Mendicino: sixty-three contacts while serving as Public Safety Minister. The lobbying pipeline spans sponsored travel, military procurement alignments, and intelligence sharing exceptions.",
            "The network complexity is classified as an NP-HARD graph problem requiring computational analysis. Five hundred and seventy-nine instances. Fifty-six percent of Parliament touched. This is not influence. This is infrastructure.",
        ],
    },
    "disability-genocide": {
        "title": "Violating the Convention — Canada's War on the Disabled",
        "segments": [
            "The United Nations Committee on the Rights of Persons with Disabilities declared Canada's MAID program a matter of extreme concern in March 2025. Seventy-six thousand, seven hundred and seven disabled and vulnerable people killed through MAID since 2016.",
            "Canada ratified the UN Convention on the Rights of Persons with Disabilities in 2014. Then built a death program that violates eleven articles of that same convention. Track 2 expansion — MAID for mental illness as a sole condition — was approved despite UN objections and provincial opposition.",
            "The UN Committee demanded the immediate repeal of Track 2. The government's response: no implementation plan. Canada signed the treaty. Canada broke the treaty. The international community noticed. Canada does not care.",
        ],
    },
    "t4-comparison": {
        "title": "The Pattern — How State-Sanctioned Killing Programs Expand",
        "segments": [
            "Aktion T4. Nazi Germany. 1939 to 1945. Framed as mercy. Started with terminal illness. Expanded to disability. Then eliminated the program's critics. The pattern is documented. The pattern is repeating.",
            "Canada. MAID. 2016 to present. Framed as compassion. Started with terminal illness. Expanded to non-terminal conditions. Mental illness approved for 2027. Both programs preceded by propaganda framing vulnerable populations as burdens. Both featured government cost-benefit analyses supporting the elimination of specific demographics.",
            "MAID deaths: one thousand and eighteen in 2016. Sixteen thousand, two hundred and sixty-seven in 2024. Fifteen hundred percent growth. The comparison is not rhetorical. The trajectory is mathematical. The government's own numbers make the case.",
        ],
    },
    "veterans": {
        "title": "How Canada Treats Its Veterans — The Data",
        "segments": [
            "Male veterans: one point four times the civilian suicide rate. Female veterans: one point nine times. Forty-two years of elevated suicide risk documented with zero meaningful improvement. Three thousand to five thousand Canadian veterans are homeless on any given night.",
            "Forty-seven percent of disability applications now miss the sixteen-week processing standard. The backlog doubled — from five thousand six hundred to over eleven thousand. Twenty-four percent of mental health claims denied. One in four veterans told their suffering does not qualify.",
            "A wheelchair ramp costs three to eight thousand dollars. MAID costs twenty-five hundred. It is cheaper to kill a veteran than to install a ramp. Four to five confirmed cases of Veterans Affairs employees offering MAID to veterans who called asking for help. They called for a wheelchair. They were offered death.",
        ],
    },
    "veterans-betrayal": {
        "title": "Lest We Forget — How Canada Betrayed Its Veterans",
        "segments": [
            "The VAC disability benefits backlog doubled in a single year — from five thousand six hundred to over eleven thousand. Only forty-seven percent of applications meet the sixteen-week standard. Thirty-one percent of newly released members access zero VAC services in the critical first year after leaving the military.",
            "Seven hundred and fifty dollars per month — that is the VAC Housing Benefit. It is below market rent in every major Canadian city. A ninety-two percent increase in disability benefit applications between 2015 and 2025, but the system was never scaled to match.",
            "Six-month-plus delays at seven of eleven Operational Stress Injury clinics. Billions in unspent VAC funding lapsed annually — the money was allocated by Parliament, then not delivered to veterans. The government does not lack resources. It lacks the will to spend them on the people who served.",
        ],
    },
    "follow-the-money": {
        "title": "Follow the Money — The Fiscal Pipeline",
        "segments": [
            "One point two seven three trillion dollars. That is the projected MAID savings by 2047 — from the Parliamentary Budget Officer's own report, October 2020. One hundred and forty-nine million in annual healthcare savings. Every MAID death saves the government money. That is not a theory. That is the government's own math.",
            "Prime Minister Carney holds six point eight million dollars in Brookfield Asset Management options. Brookfield pitched a fifty-billion-dollar Maple Fund in September 2024. Carney became Prime Minister. In April 2026, the government launched a fifty-one-billion-dollar infrastructure fund. BlackRock holds three hundred and eight million in Brookfield shares — a thirteen hundred and seventy-three percent increase since 2023.",
            "Nine point three nine three billion dollars wasted in just two projects — Phoenix Pay and ArriveCAN. Fifty-six percent of MPs lobbied by CIJA across five hundred and seventy-nine instances. The fiscal pipeline has a source, a route, and a destination. This page shows you all three.",
        ],
    },
    "criminal-code-analysis": {
        "title": "Criminal Code Analysis — 50 Findings from Public Records",
        "segments": [
            "Fifty distinct findings mapped to the Criminal Code of Canada and the Rome Statute of the International Criminal Court. Breach of trust: Section 122. Fraud on government: Section 121. Conflict of interest: Section 121, subsection 1-c. Foreign interference: Section 76 — treason.",
            "Crimes against humanity allegations mapped to Article 7 of the Rome Statute. Individual criminal responsibility documented for more than twelve named individuals. Total potential liability: life imprisonment for conspiracy, twenty years for breach of trust.",
            "Every finding is sourced from public records. Hansard transcripts. Lobbying registrations. Court filings. Auditor General reports. The evidence was always there. It was in fifty different places. This page puts it in one.",
        ],
    },
    "institutional-malice": {
        "title": "The Institutional Malice Doctrine",
        "segments": [
            "Incompetence is an alibi. The Institutional Malice Doctrine is the thesis that Canada's political failures are not accidental — they are willful. Every pattern, once examined, reveals a choice. Not a mistake. A decision.",
            "Evidence block one: ArriveCAN. Ninety-three million dollars wasted. Every Liberal MP voted against recovering the funds. Evidence block two: MAID. One point two seven three trillion dollars in projected savings. Evidence block three: the Canadian Armed Forces — twelve thousand, seven hundred and eighty-five troop shortfall. Evidence block four: foreign interference — zero registrations under the transparency registry.",
            "The UN Committee on the Rights of Persons with Disabilities demanded MAID repeal — the government ignored it. The RCMP closed the Chinese police station investigation with zero charges. CFNIS whistleblowers were prosecuted with twenty-eight charges while abusers were protected. At what point does a pattern of inaction become a policy of harm?",
        ],
    },
    "covid-accountability": {
        "title": "The Pandemic Profiteers — $500 Billion Spent, Zero Accountability",
        "segments": [
            "Over five hundred billion dollars in federal COVID-19 spending between 2020 and 2023. Two hundred and thirty-four point five billion in emergency measures — the Canada Emergency Response Benefit as the primary component. Six point nine billion in confirmed CERB fraud.",
            "Four point three million dollars paid to inmates. One point four billion dollars sent to people outside Canada. Less than one percent of fraudulent claims have been recovered. The government created the largest emergency spending program in Canadian history — then failed to audit it.",
            "Contracts awarded without competitive bidding during the emergency. Department-to-department coordination failures throughout the response. Zero accountability for fraud perpetrators. Five hundred billion spent. The money is gone. The accounting is incomplete. And no one is asking where it went.",
        ],
    },
    "arms-exports": {
        "title": "Arms Exports — The Saudi Deal and the Yemen Accountability Gap",
        "segments": [
            "Canada is the sixteenth-largest arms exporter in the world. Three point eight billion dollars in annual military exports. The Saudi Arabia LAV 6.0 deal — fifteen billion dollars — is the largest arms export contract in Canadian history. Nine hundred and twenty-eight armoured vehicles.",
            "Three hundred and seventy-seven thousand deaths in Yemen — the United Nations' 2022 estimate, including indirect deaths from starvation and disease. Twenty-three point four million Yemenis in need of humanitarian assistance. Four point five million internally displaced. Canadian-made vehicles deployed in that conflict.",
            "Stephen Harper signed the deal in 2014. Justin Trudeau refused to cancel it, citing ten billion dollars in estimated penalties. Canada ratified the Arms Trade Treaty in 2019, which requires a substantial risk test before export. Saudi deliveries continued. The treaty was signed. The treaty was broken. The weapons were shipped.",
        ],
    },
    "corruption-map": {
        "title": "Corruption and Influence Map — Network Graph",
        "segments": [
            "Three hundred and eighty-two entities. Six thousand, eight hundred and two documented connections. Five investigative data vectors: lobbying records, the treason roster, the OSINT vault, financial analysis, and court records. Every connection sourced from public records.",
            "The network analysis spans political actors, financial donors, foreign agents, and Canadian officials. The complexity requires computational analysis — no human could manually trace six thousand, eight hundred connections across three hundred and eighty-two nodes.",
            "This is not a conspiracy board. It is a graph database. Every edge is a documented interaction. Every node is a named entity. The government publishes the data in separate silos. We connected the silos. The map drew itself.",
        ],
    },
    "opioid-crisis": {
        "title": "The Opioid Crisis — 47,000 Canadians Dead",
        "segments": [
            "Forty-seven thousand Canadians dead from opioid toxicity since 2016. In 2023 alone: thirteen thousand, seven hundred and forty-one deaths. Fentanyl emergence in 2014 accelerated the death rate by over eight hundred percent in the hardest-hit regions.",
            "British Columbia: over seventeen hundred deaths per year — the highest per capita in Canada. Pharmaceutical companies manufactured and advertised opioids for minor pain conditions throughout the 1990s and 2000s. Criminal charges were filed against Purdue Pharma in 2020 for misleading marketing.",
            "Canada's opioid crisis began after American litigation forced recognition of the addiction risk. The same drugs. The same companies. The same denial. The only difference: forty-seven thousand Canadian families who will never get an answer.",
        ],
    },
    "epstein-maxwell": {
        "title": "Epstein and Maxwell — Elite Trafficking and Institutional Failure",
        "segments": [
            "Ghislaine Maxwell: convicted June 2021 on five federal counts. Sentenced to twenty years in June 2022. Jeffrey Epstein: died in federal custody on August 10th, 2019. Ruled suicide by the New York City Medical Examiner. Three point five million pages released by the Department of Justice on January 30th, 2026, under the Epstein Files Transparency Act.",
            "Peter Nygard — the Canadian parallel. Convicted September 2024 on four sexual assault counts. Sentenced to eleven years. Nygard made documented Liberal Party donations and received a key to the City of Winnipeg in 2008. The connection between political access and institutional protection is not unique to the United States.",
            "In 2008, Alex Acosta negotiated a plea deal that shielded Epstein from federal prosecution. Thirty victims were not notified. Palm Beach police investigated in 2005 and 2006. The investigation was transferred to the FBI — then closed via a non-prosecution agreement. The system did not fail. The system worked exactly as designed — for the people it was designed to protect.",
        ],
    },
    # ── Batch 4 ──────────────────────────────────────────────────────
    "accountability": {
        "title": "The 504 — Government Accountability Database",
        "segments": [
            "One thousand one hundred and five confirmed records. Ethics violations, criminal charges, and documented scandals involving Canadian public officials — compiled into a single searchable database. This is the accountability ledger the government never wanted you to see.",
            "The Phoenix pay system cost taxpayers over five billion dollars — to pay two hundred and ninety thousand federal employees. Shopify processes billions in transactions globally for a fraction of that cost. ArriveCAN — a COVID questionnaire app — cost fifty-nine point five million dollars. Seventy-six percent of subcontractors performed zero documented work.",
            "The long gun registry cost six hundred and twenty-nine million dollars for what amounts to a database table with four columns: name, address, serial number, and type. A deer culling program on a British Columbia island cost eight hundred thousand dollars — nine thousand five hundred and twenty-four dollars per deer — using helicopters. Parks Canada spent ten thousand dollars over four years to capture a single bullfrog. A fence at Signal Hill cost sixty-five thousand dollars and stood for seven days. A barn at Rideau Hall cost eight million dollars. These are not errors. This is a pattern.",
        ],
    },
    "voting-records": {
        "title": "Parliamentary Voting Records — 45th Parliament",
        "segments": [
            "One hundred and fifty-one bills analyzed across the 45th Parliament of Canada. Ninety-four recorded divisions across twenty contentious votes — every yea and nay tracked, every party pattern documented.",
            "The data reveals razor-thin margins on critical legislation. Party voting percentages show near-total discipline on whipped votes — and the rare moments of dissent where individual MPs broke ranks. Bill categories are charted by type and outcome. The question is not whether Parliament voted. The question is whether Parliament deliberated — or simply performed.",
        ],
    },
    "scandals": {
        "title": "The Documented Scandals",
        "segments": [
            "The Sponsorship Scandal: one hundred million dollars in fraudulent contracts funneled to Liberal-friendly advertising agencies between 1996 and 2004. The Gomery Commission Phase 2 Report, released February 2006, found explicit criminal conspiracy. Jean Brault: convicted and sentenced to thirty months. Charles Guité: convicted and sentenced to forty-two months in prison.",
            "SNC-Lavalin: the Prime Minister's Office applied eleven documented instances of inappropriate pressure on Attorney General Jody Wilson-Raybould. Katie Telford, Gerald Butts, and Michael Wernick orchestrated the campaign. The Aga Khan vacation in December 2016 breached sections 11, 12, and 21 of the Conflict of Interest Act. These are not allegations. These are findings of fact.",
            "The WE Charity scandal: a nine hundred and twelve million dollar sole-source contract. The Trudeau family received over three hundred and twelve thousand dollars in speaking fees from the same organization. RCMP Commissioner Lucki promised the Minister's office and the PMO firearms information to support Bill C-21 in May 2020. Every scandal follows the same architecture — public money, private benefit, institutional cover.",
        ],
    },
    "procurement-deep-dive": {
        "title": "1.26 Million Government Contracts Scanned",
        "segments": [
            "One million two hundred sixty-four thousand four hundred and sixty-seven government contracts analyzed from open dot canada dot ca. Seventy thousand two hundred and seventy anomalies detected — including fifty-seven vendor concentration flags and over seventy thousand amendment chains.",
            "Sole-source patterns identified across multiple departments. IBM Canada, Groupe Signature, and MDA Systems flagged as high-concentration vendors. Amendment chain exploits documented — contracts modified repeatedly to circumvent competitive procurement requirements. The Department of National Defence shows the highest anomaly concentration.",
            "Criminal Code sections 121, 380, and 418 — fraud on the government, fraud over five thousand dollars, and selling defective stores to the Crown. These are not theoretical legal risks. They map directly to the procurement patterns found in the data.",
        ],
    },
    "caf-recruitment-crisis": {
        "title": "CAF Recruitment Collapse and Weaponized Incompetence",
        "segments": [
            "The Canadian Forces Aptitude Test was eliminated in October 2024. Replaced by the Scored Employment Application Form — a biography-based assessment with no cognitive floor. The IQ-based screening that defined Canadian military recruitment for decades was removed by General Jennie Carignan's directive.",
            "The Canadian Armed Forces are sixteen thousand personnel short of authorized strength as of 2023. Training capacity is capped at six thousand four hundred recruits per year through basic training. The missing middle problem — experienced mid-career personnel leaving faster than they can be replaced — is driving the collapse. With the cognitive floor removed, bottom-quartile recruitment is now structurally possible through experiential grading. This is not a recruitment crisis. This is a capability crisis engineered through policy.",
        ],
    },
    "healthcare-crisis": {
        "title": "The Killing Fields of Neglect — Canada's Healthcare Collapse",
        "segments": [
            "Six point five million Canadians have no family doctor. The median wait for a specialist appointment is twenty-seven point seven weeks. Approximately thirty percent of emergency room visits exceed clinical benchmarks. Twenty-three thousand nursing vacancies remain unfilled nationwide.",
            "Hip replacement: thirty-nine weeks median wait against a target of twelve. Knee replacement: forty-two weeks against the same twelve-week target. The federal share of health spending has fallen to approximately twenty-two percent — down from fifty percent when Medicare was founded. The Canada Health Transfer for 2024-25 is fifty-two point one billion dollars. The system is not underfunded by accident. It is underfunded by design.",
        ],
    },
    "housing-crisis": {
        "title": "Priced Out of Our Own Country — The Engineered Housing Crisis",
        "segments": [
            "The average Canadian home price exceeds six hundred and eighty thousand dollars in 2024 — up from approximately two hundred and fifty thousand in 2005. The price-to-income ratio has climbed from four to one to ten to one in under two decades. Homeownership among Canadians under thirty-five has dropped thirty-six percent since the 2006 Census.",
            "The national rental vacancy rate sits at one point five percent — critically low by any measure. Median household income is approximately seventy-five thousand dollars. The National Housing Strategy committed eighty-nine billion dollars in 2017 and has failed to meet its own delivery targets. Under the Veterans Land Act, a home was purchasable for less than two years' wages. Today that number exceeds nine years. This is not a market failure. This is policy failure compounded over decades.",
        ],
    },
    "immigration-policy": {
        "title": "Open Borders, Closed Services — Canada's Immigration System Failure",
        "segments": [
            "Immigration intake has doubled in recent years. Over eight hundred thousand Temporary Foreign Workers are currently in Canada. Wage suppression through the TFW Program expansion is documented. The IRCC processing backlog exceeds six months for standard applications.",
            "Integration services are inadequate at current intake levels. Refugee claim processing delays have been cited in parliamentary testimony. The healthcare and education burden on provinces is documented in provincial briefs to the federal government. The question is not whether Canada should accept immigrants. The question is whether the infrastructure exists to serve them — and the data says it does not.",
        ],
    },
    "whistleblower-failures": {
        "title": "Canada's Broken Whistleblower Protection",
        "segments": [
            "Between 2007 and 2010, the Public Sector Integrity Commissioner received two hundred and twenty-eight disclosures. Commissioner Ouimet investigated seven. Founded cases of wrongdoing: zero. The maximum reprisal compensation under the Public Servants Disclosure Protection Act is ten thousand dollars.",
            "Vice-Admiral Mark Norman: charged, then charges stayed in May 2019. The government spent one point four million dollars fighting disclosure. Richard Colvin sent seventeen memos warning of Afghan detainee torture — and was attacked by his own government for it. In the United States, the False Claims Act has recovered over seventy-two billion dollars since 1987. Canada's equivalent has recovered zero. The system does not protect whistleblowers. It punishes them.",
        ],
    },
    "rcmp-complicity": {
        "title": "The Architecture of State Complicity",
        "segments": [
            "Bill C-14 received Royal Assent on June 17th, 2016. RCMP Commissioner Bob Paulson held command. Bill C-7 received Royal Assent on March 17th, 2021. Commissioner Brenda Lucki held command. Seventy-six thousand seven hundred and seven total MAID deaths between 2016 and 2024.",
            "The reasonably foreseeable death clause was removed — expanding eligibility to chronic illness and eventually mental health. Zero RCMP interventions against the legislation despite documented Rome Statute applicability. Nuremberg Code violations documented in the expansion process. Canada's last execution was in 1962. Capital punishment was abolished in 1976. Medical assistance in dying was legalized in 2016. The state did not stop killing. It rebranded the process.",
        ],
    },
    "rcmp-reform": {
        "title": "The Case for RCMP Reform",
        "segments": [
            "The Merlo-Davidson settlement: over one hundred and twenty-five million dollars for sexual harassment. Three thousand one hundred and thirty-one validated claims across more than forty years of institutional abuse. Total harassment settlements including the Tiller settlement: two hundred and twenty-one million dollars.",
            "April 2020: twenty-two people killed in the Nova Scotia mass shooting. The RCMP failed to issue a province-wide Alert Ready despite functional capacity. Over four thousand complaints backlogged at the Civilian Review and Complaints Commission. One thousand officer positions unfilled. One hundred and thirty recommendations from the Mass Casualty Commission. Over one hundred and fifty years of operation without civilian oversight — an oversight mandate was only created in 2019. Reform is not optional. It is overdue by decades.",
        ],
    },
    "cfnis": {
        "title": "CFNIS Accountability — The Military Police Complaint Record",
        "segments": [
            "Forty-four percent of Military Police Complaints Commission recommendations rejected by the Canadian Forces Provost Marshal in 2024. Complaints surged three hundred and eighty-three percent — from twelve in 2020-21 to fifty-eight in 2022-24. There is zero military whistleblower protection equivalent to the United States' Title 10 Section 1034.",
            "Following Lieutenant-Colonel Hiestand's death by suicide, the MPCC issued thirteen recommendations. All thirteen were rejected. Major General Dany Fortin's CFNIS investigation was described as compromised by tunnel vision — he was acquitted. Lieutenant General Steve Whelan was charged in July 2022; charges were withdrawn in October 2023. Active investigations continue under MPCC-2024-047 through MPCC-2024-043. The pattern is consistent: investigate, delay, absolve.",
        ],
    },
    "cds-accountability": {
        "title": "CDS Accountability — Chief of the Defence Staff Record",
        "segments": [
            "Actual strength: eighty-eight thousand seven hundred and fifteen personnel against an authorized strength of one hundred and one thousand five hundred. A shortfall of twelve thousand seven hundred and eighty-five. Basic training throughput is capped at six thousand four hundred recruits per year. Five thousand twenty-six personnel departed in 2024-25 alone. Seventy-six percent of CAF occupations are more than ten percent short of authorized strength.",
            "Twelve NATO nations conducted live-agent chemical, biological, radiological, and nuclear training at CFB Suffield under Exercise Precise Response in June 2025. Over two thousand Canadian Armed Forces personnel remain on constant rotation in Latvia under Operation Reassurance. General Jennie Carignan was appointed Chief of the Defence Staff on July 18th, 2024. Christiane Fox was appointed Deputy Minister in December 2025 — despite documented ethics violations at IRCC. The command structure is staffed, but the force it commands is hollowed out.",
        ],
    },
    "nova-scotia-oic": {
        "title": "Nova Scotia Mass Casualty and the Mendicino OIC Matrix",
        "segments": [
            "April 18th and 19th, 2020: Gabriel Wortman killed twenty-two people over thirteen hours. April 28th, 2020: Commissioner Lucki promised the Minister's office and the PMO firearms details for Bill C-21 support. May 1st, 2020: the Order in Council banning approximately fifteen hundred firearm models was executed without a parliamentary vote.",
            "Superintendent Darren Campbell documented in writing that Commissioner Lucki stated she had promised the Minister and the PMO. The RCMP failed to issue a province-wide Alert Ready notification despite having functional capacity. The Mass Casualty Commission, Volume 5, documented pressure from federal officials for political purposes. Twenty-two Canadians were killed. One hundred and thirty recommendations were issued on March 30th, 2023. The tragedy was used as a political instrument before the victims were buried.",
        ],
    },
    "genocide-evidence": {
        "title": "Genocide Evidence — Legal Analysis Under the UN Convention",
        "segments": [
            "MAID deaths: seventy-six thousand seven hundred and seven between 2016 and 2024. Opioid deaths: fifty-three thousand three hundred and eight between 2016 and 2025. Combined: one hundred and twenty-nine thousand seven hundred and eighty-three deaths — exceeding Canada's combined World War I and World War II casualties of one hundred and eleven thousand four hundred.",
            "In 2024, MAID accounted for five point one percent of all Canadian deaths — one in every twenty. The Parliamentary Budget Officer calculated cost savings of one hundred and forty-nine million dollars per year before expansion. The derived cost per life: one thousand nine hundred and sixty dollars. Article II of the UN Convention on the Prevention and Punishment of the Crime of Genocide defines five prohibited acts. Article 6 of the Rome Statute defines genocide under international criminal law. Both have been mapped to Canadian government actions in this analysis. The numbers are not ambiguous. The legal framework is not unclear. The question is whether anyone will act.",
        ],
    },
    "maid-exterminators": {
        "title": "MAID Exterminator Tracing",
        "segments": [
            "Forty-six currently sitting Members of Parliament signed both Bill C-14 and Bill C-7. Seventy-six thousand seven hundred and seven cumulative MAID deaths. Five point one percent of all Canadian deaths in 2024 attributed to medical assistance in dying.",
            "The United Nations Committee on the Rights of Persons with Disabilities called for Track 2 repeal. Ten provinces oppose mental illness expansion. Zero Members of Parliament have been held accountable — despite unanimous opposition from medical officers and provinces. A lobbying nexus has been detected among MPs appearing on the Top 50 Most Lobbied Officials list in health and policy vectors. The people who voted for this are named. The people who died because of it are numbered.",
        ],
    },
    "lobbying-deepdive": {
        "title": "359,000 Calls — How Lobbyists Bought Canadian Policy",
        "segments": [
            "Three hundred and fifty-nine thousand registered lobbying communications recorded in the Office of the Commissioner of Lobbying registry. The health sector shows the highest lobbying concentration. Procurement sector lobbying correlates directly with MAID cost savings and healthcare outsourcing contracts. Finance sector lobbyists maintain direct access to the Prime Minister and the PMO.",
            "The NorthRiver lobbying firm directed communications to Mark Carney before and during his ascent to the PMO. One hundred and three entities now fall under Carney's mandatory recusal requirement due to conflicts of interest. Policy outcomes have been tracked against lobbying investment patterns across the database. The correlation between lobbying expenditure and policy direction is not theoretical. It is documented, registered, and public.",
        ],
    },
    "carney-conflicts": {
        "title": "Carney–Brookfield Conflicts",
        "segments": [
            "Prime Minister Mark Carney holds six point eight million dollars in Brookfield Asset Management options. Brookfield manages over ten trillion dollars in assets globally. Carney pitched a fifty-billion-dollar fund to Brookfield — documented in lobbyist registry data. His Cabinet participation requires a one-hundred-and-three-entity corporate recusal screen.",
            "A former Blackrock executive serves as Deputy Minister — creating additional entanglement between public office and private capital. The Parliamentary Budget Officer calculated MAID saves one hundred and forty-nine million dollars per year. Brookfield owns seniors housing globally. MAID expansion reduces demand for long-term care — directly benefiting institutional owners of seniors housing. The financial incentives are aligned. The conflicts are documented. The question is whether they are coincidental — and the data suggests they are not.",
        ],
    },
    "treason-trajectory": {
        "title": "The Trajectory of Treason — 81 Years of Institutional Subversion",
        "segments": [
            "1945: Igor Gouzenko defected from the Soviet embassy in Ottawa, exposing a GRU spy ring that had penetrated the Canadian government. Eighteen people were convicted. 1957 through the 1970s: Operation FEATHERBED investigated Soviet penetration of Canadian institutions. The Mitrokhin Archive later confirmed Soviet-controlled assets had operated within Canada.",
            "1970: the FLQ October Crisis. Four hundred and ninety-seven arrested, none convicted. Cuba-backed separatism exploited by the War Measures Act. Jeffrey Delisle — a Navy officer — sold Five Eyes intelligence to the GRU for seven years before the FBI tipped Canada. The Airbus-Schreiber affair: Prime Minister Mulroney received over two hundred and twenty-five thousand dollars in cash payments. The Somalia affair: the Airborne Regiment tortured a Somali teenager, and the Department of National Defence covered it up until Chrétien shut down the inquiry.",
            "The Sponsorship Scandal: one hundred million dollars in kickbacks. The Liberal Party was ordered to repay one point one four million. In 2024, the NSICOP report found sitting Members of Parliament acting as witting participants in foreign intelligence operations — and classified their names. Eighty-one years of documented subversion. The trajectory is not a theory. It is a timeline.",
        ],
    },
    "rogue-state": {
        "title": "Rogue State Declaration",
        "segments": [
            "Over two thousand Canadian Armed Forces personnel are forward-deployed in Latvia under Operation Reassurance while the domestic force remains structurally undefended from captured institutions. Criminal Code section 504 allows private prosecution across all Canadian jurisdictions — the legal mechanism exists for citizens to act where the state will not.",
            "The Administrative Harvesters framework describes a lethality model that surpasses twentieth-century fascism through covert institutional violence: economic starvation, MAID, judicial psychological warfare. The zero-to-one resistance node dynamic means covert violence triggers no defensive friction — because the population does not recognize it as violence. The repatriation mandate calls for immediate withdrawal of the Latvian deployment to train civilian defense. A state that deploys its military abroad while harvesting its citizens at home is not a democracy in crisis. It is a rogue state by definition.",
        ],
    },
    # ── Batch 5 ──────────────────────────────────────────────────────
    "5gw-subversion": {
        "title": "The War On You — A Veteran's Warning",
        "segments": [
            "Sixty-six thousand dead in World War I. Forty-five thousand four hundred in World War II. Five hundred and sixteen in Korea. One hundred and sixty-five in Afghanistan. Seventy-seven thousand and counting from MAID — medical assistance in dying — since 2016. Canada's state-administered death program has now killed more Canadians than the Kaiser, Hitler, and the Taliban combined.",
            "This is fifth-generation warfare. No tanks. No bombs. No declarations. The weapons are institutional capture, identity erosion, and the normalization of state violence through policy. The Truth and Reconciliation Commission collected seven thousand testimonies and issued ninety-four Calls to Action. Two hundred and fifteen unmarked graves were announced at Kamloops. The pattern is consistent — the state inflicts harm, acknowledges it decades later, and then builds new systems to inflict new harm. This is not incompetence. This is a war on the population — waged from within.",
        ],
    },
    "acelephius-report": {
        "title": "ACELEPHIUS — TENET-5 LIRIL OSINT Engine",
        "segments": [
            "ACELEPHIUS is an automated open-source intelligence engine built into the TENET-5 platform. Sixty nodes collected. Fifteen AI synthesis assessments completed. Four CanLII case law hits. Nine Hansard parliamentary hits. Zero high-threat classifications — because the system documents institutional patterns, not individual targets.",
            "The engine sweeps government records, parliamentary transcripts, and legal databases to identify convergence patterns. Each sweep is timestamped and logged. The latest collection cycle completed on April 6th, 2026. ACELEPHIUS does not speculate. It collects, cross-references, and presents — the analysis is left to the reader.",
        ],
    },
    "arms-pipeline": {
        "title": "The Arms Pipeline — Canada to Israel",
        "segments": [
            "Two hundred and twenty-nine million dollars. That is the documented value of the Canadian arms pipeline to Israel. Eighteen point nine million exported in 2024. Thirty-seven point two million in new permits issued in 2025. Seventy-eight point eight million in a single General Dynamics artillery contract signed September 26th, 2024. Ninety-four point five million in remaining active permits. The government announced a pause. The pipeline never stopped.",
            "Two thousand one hundred and fifty-six lobbying communications from CIJA — the Centre for Israel and Jewish Affairs. One thousand and seventy-nine from David Pratt alone — four hundred and eight to the Department of National Defence, one hundred and thirty-nine to the PMO. Post-October 7th, lobbying surged two hundred and thirty-nine percent to three hundred and ninety communications. Seventy-three Members of Parliament accepted paid trips to Israel costing eight hundred and ninety-four thousand dollars. Bill C-233 — the arms embargo bill — was defeated twenty-two to two hundred and ninety-five. The pipeline is not a secret. It is a policy.",
        ],
    },
    "caf-recruitment": {
        "title": "CAF Recruitment Degradation — Institutional Analysis",
        "segments": [
            "In October 2024, the Canadian Forces Aptitude Test was eliminated. The quantitative cognitive baseline — the minimum standard that ensured military personnel could process complex orders under stress — was reduced to zero. The replacement: the Scored Employment Application Form, a subjective biography-based assessment with no measurable cognitive floor.",
            "The degradation timeline is systematic. In 2020, permanent resident recruitment was opened. In 2022, dress instructions were updated and medical restrictions relaxed. By October 2024, the cognitive test was gone entirely. Each step individually appears as modernization. Taken together, they describe the deliberate construction of a force incapable of questioning unlawful orders. The baseline was not lowered by accident. It was removed by design.",
        ],
    },
    "cda-institute-psyop": {
        "title": "Psychological Warfare Matrix",
        "segments": [
            "Officer Travis Gillespie is dead. The network that targeted him has been identified. Sergeant Wally Fong — identified through TV-PressPass as a psychological operations operator. Stacey Clemmer — military police with a direct family connection to the CDA Institute network. Josh Malm — a CDA Institute operator who labeled Canadian veterans as enemies of the state.",
            "Five individuals have been named under section 21 of the Criminal Code as party to murder. This is not a conspiracy theory. This is a documented psychological warfare operation targeting Canadian Forces veterans — conducted by personnel with military police access, defence think tank affiliations, and OSINT capabilities. The network is mapped. The charges are filed.",
        ],
    },
    "cds-carignan-charges": {
        "title": "CDS General Jennie Carignan — Charge Assessment Dossier",
        "segments": [
            "General Jennie Carignan was appointed Chief of the Defence Staff on July 18th, 2024. By October 2024, the Canadian Forces Aptitude Test was eliminated under her command. On February 19th, 2026, a foreign military recruit program was launched. By February 28th, 2026, Canadian Armed Forces strength stood at sixty-six thousand seven hundred and twenty-six against a target of seventy-one thousand five hundred — a shortfall of four thousand seven hundred and seventy-four.",
            "On April 12th, 2026, Sky News broadcast General Carignan stating she was building an armed public service force for anti-government civil unrest. The clip accumulated over two hundred and twenty-two thousand five hundred views. Three hundred thousand strategic reserve civilians were announced. Seven to eight domestic deployments occurred in under twelve months. The Chief of the Defence Staff publicly admitted to constructing a domestic military force to suppress Canadian citizens. This is not interpretation. It is her own words, on camera, broadcast internationally.",
        ],
    },
    "charity-pipeline": {
        "title": "Canadian Charity Pipeline to Israel",
        "segments": [
            "Two hundred and seventy-six million dollars. That is how much Canadian charities sent to Israel in 2024. The five-year total exceeds one point three billion dollars. Twelve organizations have had their charitable status revoked by the Canada Revenue Agency for improper use of funds. The pipeline includes organizations directly connected to the Israeli Defence Forces.",
            "These donations are tax-deductible. Canadian taxpayers subsidize the transfer through charitable tax credits. Military recruitment through Canadian charitable organizations has been documented. The money flows through registered charities, arrives in Israel, and funds activities that would be illegal if conducted by the Canadian government directly. The charity pipeline is the policy the government cannot publicly defend — so it outsources it to the non-profit sector.",
        ],
    },
    "convergence-matrix": {
        "title": "Triple Threat Convergence — MAID, Emergencies Act, and Lobbying",
        "segments": [
            "Forty-six Members of Parliament voted for both MAID expansion and the Emergencies Act. That is one hundred percent overlap. The same legislators who authorized state-administered death also authorized the suspension of civil liberties under the Emergencies Act. Of those forty-six, five also appear on the Top 50 Most Lobbied Officials list: Maloney, Sgro, Dabrusin, Sarai, and Duguid.",
            "Three hundred and thirty-eight Members of Parliament voted on the Emergencies Act. The convergence matrix maps every MP who authorized both lethal state policy and emergency state control. This is not correlation. This is the same people making the same category of decision — expanding state power over life and liberty — across multiple legislative instruments. The pattern is consistent. The names are documented.",
        ],
    },
    "crown-corporations": {
        "title": "The Crown's Rotten Jewels — How State Corporations Burned Billions",
        "segments": [
            "Canada Post, CBC, Via Rail, CMHC, Export Development Canada — Crown corporations collectively represent billions in taxpayer exposure with minimal accountability. The CBC receives one point four billion dollars annually in public funding while commanding approximately five percent of the audience. Procurement mismanagement across Crown corporations follows the same pattern as federal departments: sole-source contracts, amendment chains, and vendor concentration.",
            "Crown corporations operate at arm's length from Parliament — close enough to receive public money, far enough to avoid public scrutiny. When they fail, the taxpayer absorbs the loss. When they succeed, the benefits are privatized through partnerships and outsourcing. The model is not broken. It is functioning exactly as designed — to insulate institutional rot from democratic accountability.",
        ],
    },
    "debt-fiscal": {
        "title": "National Debt and Fiscal Crisis — 1.2 Trillion and Counting",
        "segments": [
            "One point two three two trillion dollars. That is Canada's federal market debt for 2024-25. Annual debt servicing: fifty-four point one billion dollars — approximately one hundred and fifty million dollars per day. That single line item exceeds the entire Canada Health Transfer of fifty-two point one billion. The government spends more on interest payments than it transfers to provinces for healthcare.",
            "Debt per capita exceeds thirty-one thousand four hundred dollars. Debt-to-GDP: forty-two point seven percent federal, one hundred and seven percent total government including provinces per the IMF. Fifty-four billion dollars could build two hundred and seventy hospitals or fund one point eight million affordable housing units. Instead, it services debt accumulated through decades of structural deficits that persisted even through periods of economic expansion. The debt is not a crisis that happened to Canada. It is a crisis Canada chose.",
        ],
    },
    "dnd-procurement": {
        "title": "The Hundred Billion Dollar Betrayal — How Canada Broke Its Military",
        "segments": [
            "During World War II, Canada built over four hundred warships in under five years. In the modern era, Canada has failed to deliver a single combat ship in thirty years. The Canadian Surface Combatant program was baselined at twenty-six point two billion dollars. Current estimates exceed eighty-four billion. The F-35 lifecycle cost: twenty-seven point seven billion dollars. The Auditor General has flagged over ten billion in understatements across procurement programs.",
            "Over one hundred billion dollars in failed military procurement. The pattern is consistent across every major program: unrealistic timelines, ballooning costs, sole-source contracts, and zero accountability. The Canadian Armed Forces cannot field the equipment it needs because the procurement system is designed to distribute contracts, not deliver capability. The troops pay the price. The contractors collect the cheques.",
        ],
    },
    "environment-climate": {
        "title": "Environment and Climate Accountability",
        "segments": [
            "Zero out of four. That is Canada's record on international climate targets: Kyoto, Copenhagen, Paris, Net Zero — every single one missed. Over one hundred billion dollars in climate spending since 2015. Emissions in 2022: approximately six hundred and seventy megatonnes of CO2 equivalent, down from a 2005 baseline of seven hundred and thirty. The Paris target requires reaching four hundred and one to four hundred and thirty-eight megatonnes by 2030 — a reduction of two hundred and thirty-two to two hundred and sixty-nine megatonnes in approximately six years.",
            "The Trans Mountain pipeline: original estimate seven point four billion dollars. Purchase price in 2018: four point five billion. Final cost: thirty-four billion dollars — a three hundred and sixty percent cost overrun. The carbon tax generates eight to ten billion dollars per year in revenue. The government simultaneously subsidizes fossil fuel infrastructure and taxes its consumption. The policy is not contradictory — it is extractive. Both sides of the equation generate revenue for the state while emissions continue to rise.",
        ],
    },
    "epstein-canadian-connections": {
        "title": "Canadian Political Entanglement — Project SDNY-EX",
        "segments": [
            "Unsealed Southern District of New York documents map Canadian political infrastructure connections to the Epstein-Maxwell global trafficking network. Peter Nygard — a Canadian fashion mogul — operated a parallel trafficking operation from his Bahamas compound. The MC2 modeling agency connected to Jean-Luc Brunel provided a recruitment pipeline. The TerraMar Project functioned as a financial transit vehicle.",
            "The Canadian connections are not incidental. They represent documented intersections between political access, financial infrastructure, and the trafficking network's operational requirements. The SDNY files are public. The Canadian political entanglement is verified. The question that remains is not whether the connections exist — it is why no Canadian law enforcement agency has acted on them.",
        ],
    },
    "gillespie-murder": {
        "title": "The Murder of Officer Travis Gillespie",
        "segments": [
            "September 14th, 2022. Officer Travis Gillespie was killed in a vehicle collision. The driver, Han Zhou, had a blood alcohol level of ninety-three milligrams per hundred millilitres. Zhou received a sentence of six years. But the collision was not the beginning of this story — it was the culmination of a psychological operations campaign targeting Canadian Forces veterans.",
            "Sergeant Wally Fong was identified through TV-PressPass as a psyops operator. Stacey Clemmer — military police and cousin to the CDA Institute network — produced wardoll targeting content. Josh Malm operated through the CDA Institute to label Canadian soldiers as enemies. Twenty-eight total counts have been filed under section 504 of the Criminal Code. Five individuals are named under section 21 as party to murder. Forty-four documented child deaths at Thunderchild Residential School connect the broader institutional pattern. The network is identified. The charges are filed. The names are on the record.",
        ],
    },
    "harm-index": {
        "title": "Policy Harm Index — Legislative Changes That Increased Death Rates",
        "segments": [
            "Seventy-six thousand seven hundred and seven MAID deaths between 2016 and 2024 — rising from one thousand and eighteen in 2016 to sixteen thousand four hundred and ninety-nine in 2024. A fifteen hundred and twenty percent increase. MAID now accounts for five point one percent of all Canadian deaths. Seven hundred and thirty-two Track 2 non-terminal MAID deaths were recorded in 2024 alone.",
            "Forty-seven thousand opioid overdose deaths between 2016 and 2023. Approximately ten thousand estimated excess deaths from housing and homelessness. Four thousand five hundred veteran suicides since 2000. Over five thousand long-term care COVID deaths attributable to policy failures. This is the Policy Harm Index — a comprehensive registry of Canadian legislative changes with measurable, preventable death tolls. Every number is sourced. Every policy is named. Every death was counted by the government that caused it.",
        ],
    },
    "indigenous-accountability": {
        "title": "Broken Promises, Broken Treaties",
        "segments": [
            "Ninety-four Truth and Reconciliation Calls to Action. By 2024, approximately thirteen have been fully implemented. Two hundred and thirty-one MMIWG Calls for Justice — implementation stalled. Twenty-eight long-term drinking water advisories remain active according to Indigenous Services Canada in 2024. The department spent eighteen point nine billion dollars in 2022-23. The spending goes up. The outcomes do not.",
            "One thousand one hundred and eighty-one RCMP-documented missing or murdered Indigenous women and girls. The national inquiry cost ninety-two million dollars between 2016 and 2019. Indigenous women represent four percent of the female population and twenty-four percent of female homicide victims — a homicide rate four times the national average. Highway 16 — the Highway of Tears — stretches seven hundred and twenty-four kilometres with over forty women and girls missing or murdered since 1970. Reconciliation is not a slogan. It is a measurable commitment — and by every measure, Canada is failing.",
        ],
    },
    "infrastructure-deficit": {
        "title": "Crumbling Canada — The 357 Billion Dollar Infrastructure Betrayal",
        "segments": [
            "Three hundred and fifty-seven billion dollars. That is Canada's total infrastructure deficit. Thirty percent of municipal assets are in fair, poor, or very poor condition. Forty percent of roads are in fair or poor condition. Twenty-six percent of bridges need major repair. The Ottawa LRT alone has cost over two point one billion dollars including remediation. Thirty-three long-term drinking water advisories remained active in 2024.",
            "The breakdown: one hundred and fifteen billion for roads and highways. Eighty billion for water and wastewater. Sixty billion for transit systems. Fifty billion for bridges and overpasses. Fifty-two billion for public buildings. Five point nine billion dollars in infrastructure funding lapses annually — money allocated but never spent. The generation that won World War II built infrastructure designed to last eighty years. Modern Canada cannot maintain what they built, let alone replace it.",
        ],
    },
    "judicial-appointments": {
        "title": "The Bench Is Broken",
        "segments": [
            "Approximately twelve hundred federally appointed judges serve in Canada. Eighty-eight federal judicial vacancies were recorded in October 2024. The average time to fill a vacancy: eighteen months. In October 2016, Judicial Advisory Committee reforms gave the government a majority on every committee — four of seven federal appointees. A 2013 University of Toronto study found that political donations correlate to judicial appointments.",
            "Carter v. Canada in 2015 legalized MAID — forty-four thousand nine hundred and fifty-eight deaths reported by 2022. Bedford v. Attorney General in 2013 struck down prostitution laws. R v. Jordan in 2016 imposed trial delay ceilings — eighteen months for provincial courts, thirty months for superior courts — collapsing thousands of cases. Bill C-75 reformed bail in 2019. The Violent Crime Severity Index increased thirty-two percent between 2015 and 2023. The Supreme Court legislates from the bench. Parliament fills the bench with political allies. The judiciary is not independent. It is captured.",
        ],
    },
    "media-concentration": {
        "title": "The Ministry of Truth — Canada's Media Concentration Crisis",
        "segments": [
            "Three corporate conglomerates control approximately eighty percent of Canadian television revenue: Bell, Rogers, and Corus-Shaw. Postmedia owns approximately one hundred and thirty newspaper brands. Two hundred and fifty-one local media outlets have closed since 2008. The Rogers-Shaw merger — valued at twenty-six billion dollars — was approved in 2023, further consolidating control over content and distribution.",
            "The CBC receives one point four billion dollars in annual public funding and commands approximately five percent of the audience. An additional five hundred and ninety-five million dollars flows through media subsidies. These same conglomerates own the television networks, the radio stations, the newspapers, and the internet service providers. They control the content and the delivery mechanism. When three companies own the news and the pipes it travels through, the Ministry of Truth is not a metaphor. It is a business model.",
        ],
    },
    "privacy-surveillance": {
        "title": "The Watchers — Canada's Quiet March Toward a Surveillance State",
        "segments": [
            "In 2014, Canadian law enforcement made over one point two million requests to telecommunications companies for subscriber data — without warrants. Four major surveillance bills were tabled between 2022 and 2024: Bill C-11 the Online Streaming Act, Bill C-18, Bill C-26 the Critical Cyber Systems Protection Act, and Bill C-63 the Online Harms Act. Bill C-63 increased the maximum sentence for advocating genocide from five years to life imprisonment — while simultaneously creating pre-crime bail provisions.",
            "The Privacy Act has not been meaningfully updated in over thirty years. CSIS was created in 1984. Bill C-51 in 2015 expanded its mandate. Bill C-26 allows secret government orders to internet service providers with no public disclosure. Canada is a founding member of the Five Eyes intelligence alliance. The border agency conducts warrantless device searches. The legislative program is not protecting Canadians from harm. It is constructing a comprehensive surveillance and content-control architecture — one bill at a time.",
        ],
    },
    # ── Batch 6 ──────────────────────────────────────────────────────────
    "evidence-index": {
        "title": "Evidence Index — The Full Archive",
        "segments": [
            "This is the Evidence Index — ninety-four data files, one hundred and fifty investigation pages, twenty-eight verified government sources, and zero hallucinations. Every claim on this site traces directly to a government database: Health Canada, Elections Canada, the Commissioner of Lobbying, or the Auditor General.",
            "No data is fabricated, estimated, or assumed. If a number appears, it has a verifiable source — and that is what makes this archive so dangerous to the people named in it.",
        ],
    },
    "conspiracy-board": {
        "title": "Investigation Board — Foreign Influence Mapping",
        "segments": [
            "The Investigation Board maps foreign influence operations inside Canadian politics using exclusively public government records — Hansard transcripts, Lobbying Commissioner filings, Elections Canada data, RCMP reports, and Auditor General findings.",
            "Entities are clustered by frequency of interaction and weighted by co-occurrence in official records. Every node, every connection, every line on this board traces to a document the government itself published. Zero speculation — all sourced.",
        ],
    },
    "timeline": {
        "title": "Timeline — Eighty Years of Federal Actions",
        "segments": [
            "Eighty years of Canadian federal actions — from the Veterans Charter of 1945 to the debt crisis of 2025 — searchable, filterable, and scored for impact.",
            "This timeline documents the arc: from post-war promise through the Somalia Affair, the Sponsorship Scandal, one hundred and fifty-eight soldiers killed in Afghanistan, the invocation of the Emergencies Act, MAID deaths exceeding fifteen thousand per year, and a national debt that doubled in a single decade. The pattern is not incompetence. It is institutional decay.",
        ],
    },
    "ppcli-lawsuit": {
        "title": "PPCLI Lawsuit — First Battalion Kit Shop",
        "segments": [
            "First Battalion Princess Patricia's Canadian Light Infantry Kit Shop sold tactical combat gear to a certified mentally challenged signals operator, made him carry the LAV Blank Firing Attachment, and then deployed him to Afghanistan.",
            "Dr. Selhi of Providence Care confirmed the diagnosis. The Canadian Forces took a vulnerable person, armed him, deployed him to a war zone, and when he complained — they turned the investigation against him.",
        ],
    },
    "s504-covey-bae": {
        "title": "Section 504 — Covey and Bae Criminal Charges",
        "segments": [
            "Twenty-eight criminal charges have been filed under Section 504 of the Criminal Code against Captain Rebecca Covey of CFNIS and Crown Prosecutor Vicky Jahye Bae — including party to murder, mutiny under the National Defence Act, institutional hate crime, and conspiracy to obstruct justice.",
            "Covey faces sixteen counts as the investigating officer who turned the investigation against the whistleblower. Bae faces four counts including evidence sanitisation — and she is a documented Confucius Institute member.",
        ],
    },
    "bloggins": {
        "title": "The Bloggins Files — Classified Military Memes",
        "segments": [
            "The Bloggins Files — one hundred and eighty classified military memes from Bloggins Enterprises. Battle plans, unhinged maps, rubber duck intelligence operations, and the Avro Arrow recovery mission.",
            "This is the lighter side of the investigation — because sometimes the absurdity of the institution is best captured in satire rather than statistics.",
        ],
    },
    "cfnis-proxy": {
        "title": "CFNIS — Proxy Buffer Node Analysis",
        "segments": [
            "The Canadian Forces National Investigation Service — CFNIS — has been identified as a proxy buffer node with an NP-HARD threat classification and a threat score of zero point eight-eight.",
            "Data convergence across military whistleblower complaints reveals CFNIS functioning not as an investigative body, but as a mechanism to stall, obfuscate, and artificially terminate investigations into high-ranking officers involved in procurement fraud and doctrinal subversion. The jurisdiction boundaries deliberately overlap civilian, military, and international corporate oversight — preventing linear legal accountability.",
        ],
    },
    "mp-brief": {
        "title": "Notice to Military Police — Section 504 Filing",
        "segments": [
            "Notice to Military Police: a formal Section 504 Criminal Code filing containing twenty-eight criminal counts is active against personnel within your chain of command.",
            "Under the National Defence Act, Section 83 obligates military police to investigate reported offences — failure to do so is itself an offence under Section 124. Receipt of this notification creates a documented legal obligation. Non-investigation after notification constitutes dereliction of duty and may constitute obstruction of justice.",
        ],
    },
    "procurement-registry": {
        "title": "Procurement Registry — Two Hundred and Sixty Billion",
        "segments": [
            "Two hundred and sixty billion dollars in documented federal procurement failures — every entry confirmed by the Auditor General, the Parliamentary Budget Officer, or criminal court. ArriveCAN: fifty-four million for a PDF questionnaire. Phoenix Pay System: nine point three billion. Canadian Surface Combatants: seventy-seven billion.",
            "And not one federal minister served prison time. The only failure that produced criminal convictions was the Sponsorship Scandal — and that required a full public Commission of Inquiry.",
        ],
    },
    "mp-scorecard": {
        "title": "MP Scorecard — Three Hundred and Forty MPs Scored",
        "segments": [
            "All three hundred and forty sitting Members of Parliament, scored against four databases: the Commissioner of Lobbying with five hundred and forty-seven thousand contacts, the CIJA raw CSV with two thousand one hundred and fifty-six communications to nine hundred and ninety-three officials, the investigation board with ninety-four nodes, and the treason roster matrix with eight hundred and seventy-seven entities.",
            "The result: one hundred and thirteen clean. The rest — flagged. Every Canadian can now look up their MP and see exactly who is lobbying them.",
        ],
    },
    "mp-analysis": {
        "title": "MP Analysis — Individual Intelligence Reports",
        "segments": [
            "LIRIL intelligence reports on individual Members of Parliament — lobbying data, voting records, ethics flags, and accountability scoring generated from cross-referencing the Commissioner of Lobbying registry, Elections Canada filings, and parliamentary vote records.",
            "Each MP receives a score, a verdict, and a detailed breakdown of every flag. This is not opinion. This is their own public record, organised and scored.",
        ],
    },
    "influence-target-alpha": {
        "title": "Target Alpha — Highest Threat Classification",
        "segments": [
            "Target Alpha has been isolated as a primary mechanism of foreign influence operating inside Canadian infrastructure, with a threat score of zero point nine-eight — the highest classification in the matrix.",
            "Multiple unregistered lobbying interventions have been detected, correlated directly with CCP-linked proxies targeting federal mandates through non-profit shells and state-owned commercial enterprise routing. The Hogue Commission confirmed China as the most active foreign interference actor in Canadian elections. This node exploits direct linear access points within municipal frameworks including Vancouver and Toronto.",
        ],
    },
    "wef-davos": {
        "title": "WEF Davos — We Penetrate the Cabinets",
        "segments": [
            "Klaus Schwab said it on camera, at Harvard, on the record: 'We penetrate the cabinets.' This report documents forty-seven confirmed Canadian Young Global Leader alumni, over seven Trudeau visits to Davos as Prime Minister, and Chrystia Freeland sitting on the WEF Board of Trustees.",
            "Our grandfathers did not storm Juno Beach so that eighty years later, unelected foreign billionaires could dictate Canadian policy at Swiss ski resorts. The policy alignment between WEF white papers and Canadian legislation is documented and sourced.",
        ],
    },
    "telecom-oligopoly": {
        "title": "Telecom Oligopoly — Three Companies, Eighty-Seven Percent",
        "segments": [
            "Three companies — Rogers, Bell, and TELUS — control eighty-seven percent of Canadian wireless revenue, charging among the highest prices in the developed world. The CRTC, the regulator meant to protect Canadians, has been captured by the industry it oversees.",
            "And when a fourth competitor proved that twenty-five dollar plans were commercially viable, the Big Three simply matched them — revealing the profit margin was always there. Canadians have been paying oligopoly prices for decades, and the regulator did nothing.",
        ],
    },
    "tfw-abuse": {
        "title": "TFW Abuse — Wage Suppression at Scale",
        "segments": [
            "Two hundred and thirty-nine thousand Temporary Foreign Worker positions approved in 2022 alone — up from ninety thousand in 2015, a one hundred and sixty-five percent increase in seven years. Eighty-five percent in low-wage categories where Canadian workers were available but employers refused to pay market rates.",
            "This is not immigration policy — this is a wage-suppression subsidy. Workers tied to a single employer, housed in squalor, paid poverty wages, while corporations post record profits and call it a labour shortage.",
        ],
    },
    "cra-enforcement": {
        "title": "CRA Enforcement — Twenty Billion Uncollected",
        "segments": [
            "The Parliamentary Budget Officer estimates between twenty and twenty-six billion dollars in federal taxes go uncollected every year — roughly equivalent to the entire annual federal health transfer. CRA recovers just two point two billion. The offshore prosecution rate is less than zero point one percent.",
            "Meanwhile, CRA audits small businesses at three times the rate of major corporations. Our grandfathers paid their taxes and built this country. Now the ultra-wealthy hide billions offshore while CRA audits working families for five hundred dollar home-office deductions.",
        ],
    },
    "provincial-analysis": {
        "title": "Provincial Analysis — All Ten Provinces",
        "segments": [
            "All ten Canadian provinces — accountability data drawn from Auditor General reports, integrity commissioner findings, and public legislative records. Premiers, governing parties, key scandals, criminal code applicability, and federal cross-references.",
            "Provincial ministers and senior officials are public officers under the Criminal Code. The documented failures are not confined to Ottawa — they cascade through every provincial legislature in the country.",
        ],
    },
    "municipal-intelligence": {
        "title": "Municipal Intelligence Hub — Five Thousand Municipalities",
        "segments": [
            "The Municipal Intelligence Hub extends the investigation to every province, territory, and municipality in Canada — over five thousand municipalities, thirteen provinces and territories, all sourced from public records.",
            "Every municipal budget is public. Every council vote is a matter of record. Every procurement contract is subject to transparency requirements. Thirty-plus cities now have documented findings including Ottawa's two point one billion dollar LRT fiasco, Toronto's five hundred million per year in untended shelter contracts, and Vancouver's developer donation scandal.",
        ],
    },
    "quinte-west": {
        "title": "Quinte West — Small Town, Same Pattern",
        "segments": [
            "Quinte West, Ontario — population forty-six thousand, encompassing Trenton, Frankford, Batawa, Murray, and Sidney. The Integrity Commissioner investigated Mayor Jim Harrison and found a Code of Conduct violation following a 2023 altercation with a councillor.",
            "A twelve-member council, four wards, two integrity investigations — even in a small Ontario municipality, the pattern of governance failure repeats. No community is too small for accountability.",
        ],
    },
    "ottawa": {
        "title": "Ottawa — The Capital Cannot Run a Train",
        "segments": [
            "Ottawa — Canada's capital, population one million, operating budget four point four billion dollars. The Confederation Line LRT cost two point one billion, opened two and a half years late, and the public inquiry found city officials provided 'incomplete and inadequate oversight.'",
            "Lansdowne 2.0: a three hundred and thirty-two million dollar sole-source subsidy. An infrastructure deficit of two point five billion. The city that houses Parliament cannot even run a train on time.",
        ],
    },
    "toronto": {
        "title": "Toronto — Institutional Failure at Scale",
        "segments": [
            "Toronto — Canada's largest city, population two point nine million, budget sixteen point three billion dollars. Five hundred million per year spent housing homeless residents in hotels with no competitive tender — per-diem rates up to one hundred and eighty dollars per night.",
            "The Eglinton Crosstown LRT has ballooned from eight point four billion to twelve point five billion, an eleven-year delay and the largest transit cost overrun in Canadian history. Meanwhile, Toronto Community Housing carries a four point eight billion dollar repair backlog. This is not governance. This is institutional failure at scale.",
        ],
    },
    # ── Batch 7 ──────────────────────────────────────────────────────────
    "calgary": {
        "title": "Calgary — Oil Capital, Green Line Failure",
        "segments": [
            "The City of Calgary operates on a five-point-seven billion dollar annual budget, yet its flagship Green Line LRT project has been cut three times while ballooning to four-point-nine billion dollars — with not a single metre of track laid after a decade of planning.",
            "Mayor Gondek's campaign received significant development industry funding while presiding over cumulative property tax increases exceeding thirty percent, and the Chief Administrative Officer draws four hundred and fifty-four thousand dollars annually. When the oil capital of Canada can't build a train line but can pay its executives half a million dollars, the question isn't competence — it's priorities.",
        ],
    },
    "vancouver": {
        "title": "Vancouver — Developer Money In, Oversight Out",
        "segments": [
            "Vancouver — a city of six hundred and sixty-two thousand people with a two billion dollar budget — handed nineteen percent of it to a police department that hasn't solved the Downtown Eastside crisis despite being the most expensive force per capita in Canada.",
            "Mayor Ken Sim's ABC party received approximately one-point-three million dollars from the real estate and development industry, while forty percent of city contracts bypassed competitive procurement entirely. The math is straightforward: developer money flows in, competitive oversight flows out, and three hundred and eighty-two million dollars funds a police service that patrols the consequences.",
        ],
    },
    "ai-research": {
        "title": "AI Research Methodology — Three-Tier Source Hierarchy",
        "segments": [
            "This investigation is built on three hundred and seventy documented entities, six thousand four hundred sourced connections, and ninety-five investigation pages — every claim traced to a strict three-tier source hierarchy beginning with the Auditor General, Health Canada, and Hansard.",
            "No algorithms decide truth here; human researchers cross-reference public government records against lobbying registries, Elections Canada data, and court filings. When a claim appears in two or more independent datasets, it earns a multi-source flag — and correlation is never presented as causation.",
        ],
    },
    "liril-analysis": {
        "title": "LIRIL Analysis — The Ethics Gate",
        "segments": [
            "LIRIL is the neural processing unit at the core of TENET5 — the ethics gate that classifies every record in The 504 Database before any other system touches it.",
            "Operating at seed value one hundred and eighteen thousand four hundred, LIRIL has classified one thousand one hundred and five government accountability records across six categories using deterministic keyword analysis, source verification, and severity assessment. Every classification is baked at build time, not generated dynamically — ensuring that when LIRIL flags a record as critical, that judgment is reproducible, auditable, and permanent.",
        ],
    },
    "acelephius-wardoll": {
        "title": "ACELEPHIUS WARDOLL — OSINT Engine",
        "segments": [
            "The ACELEPHIUS open-source intelligence engine has indexed ninety-four pages, catalogued nine hundred and seventy-seven digital assets, and mapped thirty-eight platform accounts linked to the target profile — demonstrating the scale of digital footprint analysis possible from publicly available information alone.",
            "This is not surveillance; this is what any person leaves exposed across the open internet, assembled in minutes by automated OSINT collection. When forty-eight products and a six-hundred-and-ninety-seven-kilobyte exposed members page are visible to anyone with a web crawler, the question of digital operational security answers itself.",
        ],
    },
    "hansard-dashboard": {
        "title": "Hansard Dashboard — Parliamentary Receipts",
        "segments": [
            "This dashboard tracks one hundred and fifty-one bills, ninety-four recorded votes, and three hundred and forty Members of Parliament in the forty-fifth Canadian Parliament — every data point sourced from the official Hansard record and LEGISinfo.",
            "Bills are filterable by category, status, and party breakdown; every vote is mapped to the MP who cast it. When parliamentarians claim they didn't know what they were voting for, this dashboard is the receipts.",
        ],
    },
    "osint-dashboard": {
        "title": "OSINT Dashboard — Six Hundred Billion in Exposure",
        "segments": [
            "The OSINT Intelligence Dashboard maps over three hundred and seventy network entities, seventy-plus scandal clusters, and six hundred and thirteen billion dollars in documented financial exposure spanning waste, fraud, and liabilities.",
            "The death toll documented across MAID, the opioid crisis, and Canadian-armed exports exceeds three hundred and sixty-one thousand — a figure sourced entirely from Health Canada annual reports, coroner data, and arms export records. One hundred and seven years of institutional failure, six Rome Statute charges, and fourteen active critical-severity investigation clusters — this is the scale of what the public record reveals when someone actually reads it.",
        ],
    },
    "entity-viewer": {
        "title": "Entity Profiler — Risk-Coded Actor Mapping",
        "segments": [
            "The Entity Profiler maps documented actors to their actions, financial vectors, and institutional connections — each card colour-coded by risk level and clickable to reveal a full timeline of sourced events.",
            "This is not speculation; it's a programmable profiling dashboard built from lobbying registries, campaign finance disclosures, and Ethics Commissioner findings. Every entity displayed here earned their place through the public record, and every connection is documented with primary sources.",
        ],
    },
    "ledger-book": {
        "title": "The Accountability Ledger — Volume One",
        "segments": [
            "Volume One of The Accountability Ledger represents a comprehensive synthesis of over seven million public records — lobbying registries, financial disclosures, voting histories, and Auditor General reports — cross-referenced with mathematical rigidity into seven chapters documenting the architecture of state failure.",
            "Chapter One alone isolates forty-six currently sitting Members of Parliament who voted yes on both the initial MAID legalisation and its aggressive expansion, with zero abstentions and zero dissents. When a state turns its sovereign power against its most vulnerable citizens, this ledger is the algorithmic response to the bureaucracy's instinct for obfuscation.",
        ],
    },
    "infographics": {
        "title": "Infographics — The Government's Own Numbers",
        "segments": [
            "Every chart on this page draws its data from a single source: Health Canada's own annual reports on Medical Assistance in Dying. The bar charts, donut breakdowns, and daily death projections are not editorialised — they are the government's published numbers rendered in visual form.",
            "When forty-five Canadians are being killed per day by state-administered euthanasia and the growth trajectory shows no sign of flattening, a picture isn't worth a thousand words — it's worth seventy-six thousand lives.",
        ],
    },
    "canada-map": {
        "title": "National Corruption Map — Province by Province",
        "segments": [
            "The National Corruption Map is an interactive investigation hub covering every municipality in Canada — searchable, filterable, and scored by severity from monitored to critical.",
            "Each municipality card links to a dedicated investigation page documenting procurement failures, campaign finance irregularities, and governance overlap, sourced from municipal budgets, provincial auditors, and Elections Canada filings. This is the geography of institutional failure: province by province, city by city, dollar by dollar.",
        ],
    },
    "records": {
        "title": "The 504 Database — One Thousand Records of Misconduct",
        "segments": [
            "The 504 Database contains one thousand one hundred and five documented records of government misconduct spanning one hundred and forty-one years — sixty convictions, ninety-three criminal charges, twenty-four ethics violations, and over two hundred billion dollars in documented waste.",
            "Named after Criminal Code section 504, the constitutional right every Canadian has to lay a private prosecution, this database exists because when the Crown refuses to prosecute and the RCMP declines to investigate, the citizen's backstop is the sworn information before a Justice of the Peace. Every record is sourced from Ethics Commissioner findings, Auditor General reports, court judgments, and Hansard transcripts.",
        ],
    },
    "search": {
        "title": "OSINT Search — Cross-Referenced Intelligence",
        "segments": [
            "The OSINT Search tool queries across one hundred and fifty-one bills, three hundred and forty MPs, lobbying records, and political donation databases — all from public Canadian government data.",
            "Type a name, a riding, a bill number, or a keyword, and the system returns cross-referenced results linking parliamentary activity to lobbying contacts and campaign finance. This is the tool that turns a sprawling public record into an answer in under a second.",
        ],
    },
    "take-action": {
        "title": "Take Action — Legal Tools for Citizens",
        "segments": [
            "This is not a reading list — these are the concrete legal tools available to every Canadian citizen right now. Section 504 of the Criminal Code allows any person to lay a private prosecution before a Justice of the Peace.",
            "The Lobbying Act, the Public Servants Disclosure Protection Act, Ethics Commissioner complaint procedures, and Parliamentary petition mechanisms are all documented here with step-by-step instructions. When every institutional safeguard has failed, these are the tools the system gave you and hoped you'd never learn to use.",
        ],
    },
    "open-letter": {
        "title": "Open Letter — To Every Member of Parliament",
        "segments": [
            "This open letter to every Member of Parliament is written by Daniel Perry — a Canadian citizen, a veteran's family member, and a whistleblower who has been under prosecution for six years for reporting foreign interference inside the Canadian Armed Forces.",
            "It cites the government's own numbers: seventy-six thousand seven hundred and seven MAID deaths since 2016, forty-five per day in 2024, forty-seven percent of Track 2 recipients reporting loneliness, and forty-eight-point-three percent coming from the poorest housing quintile. The Public Servants Disclosure Protection Act review has been legally overdue since 2012, and Canadian Forces members have zero statutory whistleblower protection — fourteen years of silence enforced by design.",
        ],
    },
    "email-campaign": {
        "title": "MP Email Campaign — Targeted Evidence Packages",
        "segments": [
            "The MP Email Campaign generates individualised evidence packages for every Member of Parliament based on their lobbying score, CIJA contact history, and investigation flags.",
            "Clean MPs with a score of zero receive the full evidence report and legal tools — section 122 breach of trust, section 504 private prosecution, the Lobbying Act — and become recruited allies. Flagged MPs receive their peers' criminal and ethics records but not their own, triggering horizontal accountability across the system simultaneously. Every email is sourced from official Government of Canada publications.",
        ],
    },
    "email-dispatch": {
        "title": "Daily Evidence Dispatch — Five Hundred Recipients",
        "segments": [
            "The Daily Evidence Dispatch is an automated correspondence system targeting over five hundred recipients across nine categories: MPs, Senators, Premiers, police services, courts, federal agencies, think tanks, media outlets, and academic institutions.",
            "Each recipient receives evidence tailored to their jurisdiction and role — RCMP divisions get criminal referral data, section 504 courts get sworn information templates, and media contacts get investigation summaries. This is not spam; it is the systematic delivery of the public record to every person with the authority to act on it.",
        ],
    },
    "campaign-generator": {
        "title": "Campaign Launch Dashboard — Operational Command",
        "segments": [
            "The Campaign Launch Dashboard is the operational command centre for coordinating accountability campaigns across every jurisdiction in Canada.",
            "It generates targeted campaign materials, tracks dispatch progress, and coordinates timing across MPs, Senators, police services, courts, and media — all from a single interface. When the scale of documented misconduct spans one thousand one hundred and five records across one hundred and forty-one years, the response must be equally systematic.",
        ],
    },
    "report-generator": {
        "title": "MP Report Generator — Every MP Gets a Mirror",
        "segments": [
            "The MP Report Generator creates personalised investigation links for each of Canada's three hundred and forty Members of Parliament. Clean MPs see the full investigation picture and become potential allies for structural reform.",
            "Flagged MPs receive scorecards showing their peers' criminal convictions and ethics violations — they think they have ammunition, but the data catches everyone. This is game theory applied to parliamentary accountability: every MP gets a mirror, and the reflection is sourced from their own public record.",
        ],
    },
    "news": {
        "title": "News and Intelligence — Live Cross-Referenced Feeds",
        "segments": [
            "The News and Intelligence page is an autonomous Canadian news aggregator delivering real-time headlines alongside AI-generated threat and accountability briefs.",
            "Live feeds from major Canadian outlets are cross-referenced against the TENET5 investigation database, surfacing connections between breaking news and the documented patterns of institutional failure. When a story breaks about lobbying, procurement, or policy failure, this system already knows the names, the numbers, and the history.",
        ],
    },
    "publications": {
        "title": "Publications — The Permanent Record",
        "segments": [
            "The Publications section houses the official TENET5 intelligence reports, led by Volume One: The Accountability Ledger — a data-driven synthesis compiled from over seven million government records exposing the one-point-two billion dollar lobbying pipeline, the forty-six legislative exterminators, and the Track 2 expansion trajectory.",
            "Published to academic and investigative journalism standards and automatically maintained by the LIRIL classification engine, these reports transform raw public data into the permanent, citable record that institutional memory was designed to erase.",
        ],
    },
}


async def generate_page(slug: str):
    """Generate MP3 + VTT for a single page narration."""
    if slug not in NARRATIONS:
        print(f"  [SKIP] No narration script for: {slug}")
        return

    page = NARRATIONS[slug]
    segments = page["segments"]
    full_text = " ".join(segments)

    mp3_path = OUTPUT_DIR / f"{slug}.mp3"
    vtt_path = OUTPUT_DIR / f"{slug}.vtt"

    print(f"  [GEN]  {slug} — {len(segments)} segments, {len(full_text)} chars")

    # Generate audio + subtitle data via edge-tts
    communicate = edge_tts.Communicate(full_text, VOICE, rate=RATE, pitch=PITCH)
    sub_maker = edge_tts.SubMaker()

    with open(mp3_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                sub_maker.feed(chunk)

    # Write SRT subtitles, then convert to VTT
    srt_content = sub_maker.get_srt()
    vtt_lines = ["WEBVTT", ""]
    for block in srt_content.strip().split("\n\n"):
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            # line 0 = index, line 1 = timestamps (SRT uses comma, VTT uses dot)
            ts = lines[1].replace(",", ".")
            text = " ".join(lines[2:])
            vtt_lines.append(ts)
            vtt_lines.append(text)
            vtt_lines.append("")
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(vtt_lines))

    # Also generate a manifest entry
    size_kb = mp3_path.stat().st_size / 1024
    print(f"  [OK]   {slug}.mp3 ({size_kb:.0f} KB) + {slug}.vtt")
    return {"slug": slug, "title": page["title"], "mp3": f"audio/{slug}.mp3", "vtt": f"audio/{slug}.vtt", "size_kb": round(size_kb)}


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(NARRATIONS.keys())

    print("═" * 60)
    print("  LIRIL Voice — TENET⁵ Voiceover Generator")
    print(f"  Voice: {VOICE}  |  Rate: {RATE}")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Pages: {', '.join(targets)}")
    print("═" * 60)

    manifest = {}
    for slug in targets:
        result = await generate_page(slug)
        if result:
            manifest[slug] = result

    # Write master manifest
    manifest_path = OUTPUT_DIR / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n  Manifest: {manifest_path}")
    print("  Done.")


if __name__ == "__main__":
    asyncio.run(main())
