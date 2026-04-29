"""Cap#312: Stamp visible 'Last updated: <date>' footer on every HTML page.

Source of truth: `git log -1 --format=%cs -- <file>` (committer date, ISO short).
Falls back to file mtime (UTC date) if the file has no git history yet.

Idempotent: replaces any existing block marked with data-t5-last-updated="auto".
Injects immediately before the closing </body> tag.

Run from repo root:
    python tools/build_last_updated_stamps.py [--dry-run] [--page <file>]

Cron / post-build:
    add to a GitHub Action or pre-push hook so the stamp tracks the latest
    committed change to each page.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Marker so we can find + replace previous injections without touching anything else.
MARKER_OPEN = '<!-- t5:last-updated:auto -->'
MARKER_CLOSE = '<!-- /t5:last-updated:auto -->'

BLOCK_RE = re.compile(
    re.escape(MARKER_OPEN) + r'.*?' + re.escape(MARKER_CLOSE) + r'\s*',
    re.DOTALL,
)
BODY_CLOSE_RE = re.compile(r'</body\s*>', re.IGNORECASE)


def _git_last_date(rel_path: str) -> str | None:
    """Return ISO date (YYYY-MM-DD) of last commit touching rel_path, or None."""
    try:
        out = subprocess.run(
            ['git', 'log', '-1', '--format=%cs', '--', rel_path],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    s = (out.stdout or '').strip()
    return s if s else None


def _build_git_date_index(only: set[str] | None = None) -> dict[str, str]:
    """Build {posix_rel_path: YYYY-MM-DD} for every tracked .html in one pass.

    Walks `git log --name-only --format=%cs HEAD` once and records the FIRST
    (most recent) date seen per file. Massively faster than one `git log` call
    per page (344 calls -> 1 call on this repo).
    """
    try:
        out = subprocess.run(
            ['git', 'log', '--name-only', '--format=__T__%cs', 'HEAD', '--', '*.html'],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return {}

    idx: dict[str, str] = {}
    current_date: str | None = None
    for line in (out.stdout or '').splitlines():
        if line.startswith('__T__'):
            current_date = line[5:].strip()
            continue
        if not line.strip() or current_date is None:
            continue
        # Only top-level *.html (matches main() page selection).
        if '/' in line or not line.endswith('.html'):
            continue
        if only is not None and line not in only:
            continue
        idx.setdefault(line, current_date)
    return idx


def _mtime_date(p: Path) -> str:
    ts = p.stat().st_mtime
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime('%Y-%m-%d')


def _build_block(date_str: str, source: str) -> str:
    # Inline minimal style so the stamp renders even on pages with no site CSS.
    return (
        f'{MARKER_OPEN}\n'
        '<div class="t5-last-updated" '
        'data-t5-last-updated="auto" '
        f'data-source="{source}" '
        'role="contentinfo" '
        'style="margin:1.5rem auto;padding:.5rem 1rem;max-width:960px;'
        'font-size:.85rem;color:#888;text-align:center;'
        'border-top:1px solid rgba(128,128,128,.2);">'
        f'Last updated: <time datetime="{date_str}">{date_str}</time>'
        '</div>\n'
        f'{MARKER_CLOSE}\n'
    )


def stamp_page(
    p: Path,
    dry_run: bool = False,
    git_dates: dict[str, str] | None = None,
) -> tuple[str, str]:
    """Stamp a single page. Returns (status, date_used)."""
    rel = p.relative_to(ROOT).as_posix()
    date: str | None = None
    if git_dates is not None:
        date = git_dates.get(rel)
    if date is None:
        date = _git_last_date(rel)
    source = 'git'
    if not date:
        date = _mtime_date(p)
        source = 'mtime'

    try:
        raw = p.read_bytes()
        text = raw.decode('utf-8')
    except UnicodeDecodeError:
        return ('skip-encoding', date)

    if not BODY_CLOSE_RE.search(text):
        return ('skip-no-body', date)

    block = _build_block(date, source)

    # Strip any previous auto block, then inject before </body>.
    new_text = BLOCK_RE.sub('', text)
    new_text = BODY_CLOSE_RE.sub(lambda m: block + m.group(0), new_text, count=1)

    if new_text == text:
        return ('unchanged', date)

    if dry_run:
        return ('would-update', date)

    # Preserve original line endings: if the file used CRLF, keep CRLF.
    # The injected block uses '\n' internally; convert to match the file.
    if b'\r\n' in raw:
        out_bytes = new_text.replace('\r\n', '\n').replace('\n', '\r\n').encode('utf-8')
    else:
        out_bytes = new_text.encode('utf-8')
    p.write_bytes(out_bytes)
    return ('updated', date)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--page', help='Stamp a single page (relative to repo root)')
    args = ap.parse_args(argv)

    if args.page:
        pages = [ROOT / args.page]
    else:
        pages = sorted(ROOT.glob('*.html'))

    rel_set = {p.relative_to(ROOT).as_posix() for p in pages}
    git_dates = _build_git_date_index(only=rel_set)

    counts: dict[str, int] = {}
    for p in pages:
        if not p.exists():
            print(f'  MISSING {p}')
            continue
        status, date = stamp_page(p, dry_run=args.dry_run, git_dates=git_dates)
        counts[status] = counts.get(status, 0) + 1
        if status in ('updated', 'would-update'):
            print(f'  {status:14s} {date}  {p.name}')

    print('\n=== summary ===')
    for k in sorted(counts):
        print(f'  {k:14s} {counts[k]}')
    print(f'  total          {sum(counts.values())}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
