#!/usr/bin/env python3
"""
Strip generic AI filler from data-narrate attributes.

Pattern: 'Some heading. This section introduces/provides/covers/...'
Fix:     Remove the 'This section ...' sentence, keep the heading prefix,
         then pull real content from the next <p> or the parent element's text.
"""
import re, os, sys, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILLER_RE = re.compile(
    r'(?<=\.)\s*This section \w+\b[^"]*',
    re.IGNORECASE
)

# Match data-narrate="..." with surrounding context for replacements
ATTR_RE = re.compile(r'(data-narrate=")(.*?)(")', re.DOTALL)

# Find the next <p ...>text</p> after the current position
NEXT_P_RE = re.compile(r'<p[^>]*>(.*?)</p>', re.DOTALL | re.IGNORECASE)

def clean_html(s):
    """Strip HTML tags and decode entities."""
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def truncate_sentence(text, maxlen=300):
    """Truncate at sentence boundary, max maxlen chars."""
    if len(text) <= maxlen:
        return text
    cut = text[:maxlen]
    last = max(cut.rfind('. '), cut.rfind('? '), cut.rfind('! '))
    if last > 100:
        return cut[:last+1]
    return cut + '...'

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'This section ' not in content:
        return 0

    changes = 0

    def replacer(m):
        nonlocal changes
        prefix = m.group(1)  # data-narrate="
        narr = m.group(2)    # the narration text
        suffix = m.group(3)  # "

        if not FILLER_RE.search(narr):
            return m.group(0)

        # Remove the filler sentence
        cleaned = FILLER_RE.sub('', narr).strip()
        if cleaned and not cleaned.endswith('.'):
            cleaned += '.'

        # Find position in source to grab next <p> content
        pos = m.end()
        p_match = NEXT_P_RE.search(content, pos, pos + 2000)
        if p_match:
            p_text = clean_html(p_match.group(1))
            if p_text and len(p_text) > 20:
                p_text = truncate_sentence(p_text, 280)
                # Avoid duplicating what's already in cleaned
                heading_words = set(cleaned.lower().split()[:5])
                p_words = set(p_text.lower().split()[:5])
                overlap = len(heading_words & p_words)
                if overlap < 3:  # Not a near-duplicate
                    cleaned = cleaned.rstrip('.') + '. ' + p_text
                    if not cleaned.endswith('.'):
                        cleaned += '.'

        if cleaned != narr:
            changes += 1
        return prefix + cleaned + suffix

    new_content = ATTR_RE.sub(replacer, content)

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    return changes

def main():
    dry_run = '--dry-run' in sys.argv
    if dry_run:
        print('=== DRY RUN ===\n')

    total = 0
    files_fixed = 0
    for html_file in sorted(ROOT.glob('*.html')):
        if dry_run:
            # Preview mode: count without writing
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            matches = FILLER_RE.findall(content)
            if matches:
                print(f'  {html_file.name}: {len(matches)} to fix')
                total += len(matches)
                files_fixed += 1
        else:
            n = fix_file(html_file)
            if n > 0:
                print(f'  {html_file.name}: {n} narrations fixed')
                files_fixed += 1
                total += n
    
    verb = 'would fix' if dry_run else 'fixed'
    print(f'\nTotal: {total} hallucinated narrations {verb} across {files_fixed} files')

if __name__ == '__main__':
    main()
