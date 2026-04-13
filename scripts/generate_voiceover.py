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

# AvaMultilingual is Microsoft's flagship neural voice — natural breathing,
# human prosody, emotional range. Dramatically less robotic than ClaraNeural.
VOICE = "en-US-AvaMultilingualNeural"
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
            "Since 2016... seventy-six thousand, four hundred and seventy-five Canadians have been killed under their government's Medical Assistance in Dying program. That number comes from Health Canada's own annual reports. Not from us. From them.",
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
