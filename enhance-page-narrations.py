#!/usr/bin/env python3
"""
TENET5 Page Narration Enhancer
Auto-detects sections without narrations and adds contextual narrations
based on page structure and heading content.

Usage: python3 enhance-page-narrations.py accountability.html
"""

import re
import sys
from pathlib import Path

def extract_heading_text(html_snippet):
    """Extract text from h1, h2, h3, h4 tags."""
    match = re.search(r'<h[1-4][^>]*>(.*?)</h[1-4]>', html_snippet, re.DOTALL)
    if match:
        # Remove HTML tags from matched text
        text = re.sub(r'<[^>]+>', '', match.group(1)).strip()
        # Clean up entities
        text = text.replace('&mdash;', '—').replace('&ndash;', '–')
        text = text.replace('&amp;', '&')
        return text[:60]  # Limit to 60 chars
    return None

def find_sections_without_narration(html_content):
    """Find all <section> and <h2> tags without data-narrate attributes."""
    # Find all section tags
    section_pattern = r'<section[^>]*>|<h2[^>]*>'
    matches = list(re.finditer(section_pattern, html_content))
    
    sparse_sections = []
    for match in matches:
        tag = match.group(0)
        start = match.start()
        
        # Check if already has data-narrate
        if 'data-narrate=' not in tag:
            # Extract text content following the tag (up to 200 chars)
            end = min(start + 500, len(html_content))
            snippet = html_content[start:end]
            
            heading_text = extract_heading_text(snippet)
            if heading_text:
                sparse_sections.append({
                    'tag': tag,
                    'start': start,
                    'heading': heading_text,
                    'type': 'section' if '<section' in tag else 'h2'
                })
    
    return sparse_sections

def generate_narration(heading_text, section_type):
    """Generate contextual narration based on heading."""
    heading_lower = heading_text.lower()
    
    # Category-based narrations
    if any(word in heading_lower for word in ['conviction', 'guilty', 'sentenced', 'criminal']):
        return f"{heading_text}. Legal outcome documentation with charge details and sentencing records."
    elif any(word in heading_lower for word in ['ethics', 'scandal', 'misconduct', 'breach']):
        return f"{heading_text}. Institutional misconduct investigation with timeline and findings."
    elif any(word in heading_lower for word in ['expense', 'spending', 'budget', 'cost']):
        return f"{heading_text}. Financial accounting and expenditure analysis with comparative metrics."
    elif any(word in heading_lower for word in ['timeline', 'history', 'chronology']):
        return f"{heading_text}. Chronological sequence of events with documented sources and impacts."
    elif any(word in heading_lower for word in ['recruitment', 'degradation', 'standard']):
        return f"{heading_text}. Institutional analysis of policy changes and implementation impacts."
    elif any(word in heading_lower for word in ['military', 'armed forces', 'caf', 'defence']):
        return f"{heading_text}. Military institutional review with operational and policy implications."
    elif any(word in heading_lower for word in ['data', 'statistics', 'analysis', 'chart']):
        return f"{heading_text}. Data visualization and statistical analysis with context and interpretation."
    elif any(word in heading_lower for word in ['section', 'chapter', 'part']):
        return f"{heading_text}. This section provides detailed analysis and supporting evidence."
    else:
        return f"{heading_text}. Key information with supporting documentation and analysis."

def suggest_enhancements(filename):
    """Analyze a file and suggest narration enhancements."""
    path = Path(filename)
    if not path.exists():
        print(f"File not found: {filename}")
        return
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sparse_sections = find_sections_without_narration(content)
    
    if not sparse_sections:
        print(f"✓ {filename}: All sections have narrations")
        return
    
    print(f"\n📊 {filename}: Found {len(sparse_sections)} sections without narrations\n")
    
    for i, section in enumerate(sparse_sections, 1):
        narration = generate_narration(section['heading'], section['type'])
        print(f"{i}. {section['type'].upper()}")
        print(f"   Heading: {section['heading']}")
        print(f"   → data-narrate=\"{narration}\"")
        print()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 enhance-page-narrations.py <filename.html>")
        sys.exit(1)
    
    suggest_enhancements(sys.argv[1])
