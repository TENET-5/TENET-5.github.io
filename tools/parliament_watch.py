#!/usr/bin/env python3
"""parliament_watch.py — daily accountability brief over PUBLIC parliamentary proceedings.

Watches what Parliament actually DID (public votes + debate index from OpenParliament) and
produces a sourced brief with FULL PROVENANCE TRACING. Every line cites its primary source URL.

Compliance (SLATE legal guardrail): this analyses PUBLIC records of PUBLIC officials' PUBLIC
acts. It states facts and sourced observations ("Vote N was a tie; the government lost the
report adoption") — never accusations of crime against individuals. Framing is "the record
shows X", not "MP Y is a criminal". No emailing, no targeting, no dossiers.

Sources (public, documented):
  data/votes_45-1.json          — recorded divisions (result, party breakdown, description, url)
  data/hansard/debates_*.jsonl  — debate sitting index (date, number, url)
Live enrichment (optional, --fetch): openparliament.ca/api/ for speech text (public API).

Output:
  data/parliament_brief_<UTC>.json      — the brief (for the site's news system)
  data/parliament_watch_trace.jsonl     — append-only provenance trace (every step + source)
"""
from __future__ import annotations
import json, glob, sys, re, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OP = "https://openparliament.ca"
API = "https://api.openparliament.ca"
UA = "TENET5-parliament-watch/1.0 (public accountability research; contact: tenet5)"
NOW = datetime.now(timezone.utc)


def _api_get(path: str) -> dict:
    req = urllib.request.Request(API + path,
                                 headers={"Accept": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def _strip_html(h: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h or "")).strip()


# Factual, check-worthy patterns — numbers/superlatives/absolutes are where spin hides.
_CHECKWORTHY = re.compile(
    r"\b\d[\d,.]*\s*(?:%|per cent|percent|billion|million|thousand|dollars|jobs|deaths|homes)\b"
    r"|\b(?:highest|lowest|largest|record|never|always|every|no other|first time|unprecedented)\b",
    re.I)


def fetch_speeches(limit: int, traces: list) -> list[dict]:
    """Pull recent PUBLIC Hansard speeches from OpenParliament; quarantine raw; index them."""
    out, offset = [], 0
    raw_dir = ROOT / "data" / "parliament_fetch"
    raw_dir.mkdir(exist_ok=True)
    while len(out) < limit:
        try:
            page = _api_get(f"/speeches/?limit=50&offset={offset}&format=json")
        except (urllib.error.URLError, TimeoutError) as e:
            traces.append(trace("fetch_error", API + "/speeches/", str(e)[:120]))
            break
        objs = page.get("objects", [])
        if not objs:
            break
        for o in objs:
            speaker = (o.get("attribution") or {}).get("en", "")
            text = _strip_html((o.get("content") or {}).get("en", ""))
            if len(text) < 80:
                continue
            claims = _CHECKWORTHY.findall(text)
            out.append({
                "speaker": speaker,
                "text": text[:1200],
                "checkworthy": bool(claims),
                "source": OP + (o.get("url") or o.get("document_url") or ""),
                "time": o.get("time"),
            })
            if len(out) >= limit:
                break
        offset += 50
    # quarantine the raw index (not published; curate first)
    stamp = NOW.strftime("%Y%m%dT%H%M%SZ")
    (raw_dir / f"speeches_{stamp}.json").write_text(
        json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
    traces.append(trace("fetch", API + "/speeches/", f"{len(out)} speeches pulled, quarantined"))
    return out


def trace(step: str, source: str, detail: str) -> dict:
    """One provenance record — the agentic tracing spine."""
    return {"ts": NOW.isoformat(), "step": step, "source": source, "detail": detail}


def load_votes() -> list[dict]:
    p = ROOT / "data" / "votes_45-1.json"
    if not p.exists():
        return []
    return json.loads(p.read_text(encoding="utf-8"))


def latest_debate_index() -> list[dict]:
    files = sorted(glob.glob(str(ROOT / "data" / "hansard" / "debates_*.jsonl")))
    if not files:
        return []
    rows = []
    for line in Path(files[-1]).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            try:
                rows.append(json.loads(line))
            except Exception:
                pass
    return rows, files[-1]


def analyse_votes(votes: list[dict], traces: list) -> list[dict]:
    """Sourced accountability observations — factual, each tied to its division URL."""
    items = []
    for v in votes:
        desc = (v.get("description") or {}).get("en") or f"Vote {v.get('number')}"
        yea, nay = v.get("yea_total", 0), v.get("nay_total", 0)
        result = v.get("result", "")
        url = OP + (v.get("url") or "")
        total = yea + nay
        margin = abs(yea - nay)
        flags = []
        # Grounded, defensible "worth noting" signals — NOT accusations.
        if result == "Tie" or margin <= 3:
            flags.append(f"razor-thin: {yea}-{nay} ({result})")
        # party-line break: a party split its own vote
        for pb in v.get("party_breakdown", []):
            if pb.get("disagreement", 0) and pb["disagreement"] > 0:
                nm = ((pb.get("party") or {}).get("short_name") or {}).get("en", "?")
                flags.append(f"{nm} split its own caucus")
        if flags:
            items.append({
                "kind": "division",
                "date": v.get("date"),
                "headline": desc[:120],
                "record": f"{yea} yea / {nay} nay — {result}",
                "flags": flags,
                "source": url,
            })
            traces.append(trace("analyse_vote", url, f"flagged: {'; '.join(flags)}"))
    return items


def main() -> int:
    traces: list[dict] = []
    votes = load_votes()
    traces.append(trace("load", "data/votes_45-1.json", f"{len(votes)} recorded divisions"))
    dbg = latest_debate_index()
    debates, dfile = (dbg if isinstance(dbg, tuple) else (dbg, ""))
    traces.append(trace("load", dfile, f"{len(debates)} sitting-day index rows"))

    findings = analyse_votes(votes, traces)
    findings.sort(key=lambda x: x.get("date", ""), reverse=True)

    # --fetch N : pull live speech text for the "what they SAID" layer (check-worthy claims)
    speeches = []
    if "--fetch" in sys.argv:
        i = sys.argv.index("--fetch")
        n = int(sys.argv[i + 1]) if i + 1 < len(sys.argv) and sys.argv[i + 1].isdigit() else 60
        speeches = fetch_speeches(n, traces)
        cw = [s for s in speeches if s["checkworthy"]]
        print(f"[fetch] {len(speeches)} speeches, {len(cw)} carry check-worthy factual claims")
        for s in cw[:6]:
            print(f"  {s['speaker'][:34]:34} <- {s['source']}")
            print(f"     \"{s['text'][:110]}...\"")

    brief = {
        "generated": NOW.isoformat(),
        "title": "Parliament Watch — the record of what was decided",
        "compliance": "public officials' public acts; sourced facts only; no accusations of crime",
        "counts": {"divisions_reviewed": len(votes), "flagged": len(findings),
                   "sitting_days_indexed": len(debates)},
        "findings": findings[:40],
        "sources": {"votes": "openparliament.ca /votes/45-1/", "debates": OP + "/debates/"},
        "trace_ref": "data/parliament_watch_trace.jsonl",
    }
    stamp = NOW.strftime("%Y%m%dT%H%M%SZ")
    (ROOT / "data" / f"parliament_brief_{stamp}.json").write_text(
        json.dumps(brief, indent=1, ensure_ascii=False), encoding="utf-8")
    # append-only provenance trace
    with (ROOT / "data" / "parliament_watch_trace.jsonl").open("a", encoding="utf-8") as f:
        for t in traces:
            f.write(json.dumps(t, ensure_ascii=False) + "\n")

    print(f"[parliament_watch] {len(votes)} divisions, {len(findings)} flagged, "
          f"{len(debates)} sitting days indexed")
    for it in findings[:6]:
        print(f"  {it['date']}  {it['record']:24}  {it['headline'][:60]}")
        print(f"     flags: {'; '.join(it['flags'])}  <- {it['source']}")
    print(f"trace: {len(traces)} provenance records -> data/parliament_watch_trace.jsonl")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
