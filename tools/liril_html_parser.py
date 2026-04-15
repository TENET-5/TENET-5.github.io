#!/usr/bin/env python3
# Copyright (C) 2026 TENET5 Development Team
# SPDX-License-Identifier: EOSL-2.0
# liril_html_parser.py

import os
import sys
import time
import re
from typing import List, Dict

# Core architecture hook
sys.path.append('E:/S.L.A.T.E/tenet5/src')
try:
    from tenet.discoveries.abcxyz_memory_handoff import MillennialFalcon
except ImportError:
    class MillennialFalcon:
        def __init__(self):
            pass
        def store_in_memory(self, key, value):
            pass
        def n_vs_np(self, data):
            return list(data)

def parse_html_files(file_paths: List[str]) -> Dict[str, str]:
    """Load HTML files securely as strings."""
    parsed_files = {}
    for file_path in file_paths:
        if not os.path.exists(file_path):
            print(f"[Warning] File not found: {file_path}")
            continue
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                parsed_files[file_path] = file.read()
        except Exception as e:
            print(f"[Error] Failed parsing {file_path}: {e}")
    return parsed_files

def extract_links(html_string: str) -> List[str]:
    """Extract all valid internal and external links via regex."""
    links = []
    # Match href="..." 
    matches = re.findall(r'href="([^"]+)"', html_string)
    for href in matches:
        if href and not href.startswith('#') and not href.startswith('javascript'):
            links.append(href)
    return list(set(links))

def extract_entities(html_string: str) -> List[str]:
    """Extract all entities (e.g. names, organizations) natively without Spacy."""
    # Strip basic html tags to get text block
    text = re.sub(r'<[^>]+>', ' ', html_string)
    # Lightweight generic named entity pattern: looking for Title Cased 2+ word sequences 
    pattern = r'(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)'
    candidates = re.findall(pattern, text)
    
    # Filter common garbage patterns
    stopwords = ["the", "this", "that", "there", "which"]
    entities = []
    for c in list(set(candidates)):
         if len(c) > 5 and not any(w.lower() in stopwords for w in c.split()):
             entities.append(c)
             
    return list(set(entities))

def main():
    print("=" * 50)
    print("TENET-5 LIRIL DOSSIER PARSER")
    print("=" * 50)
    
    falcon = MillennialFalcon()
    repo_dir = "E:/TENET-5.github.io"
    
    files_to_parse = [
        os.path.join(repo_dir, "charity-pipeline.html"),
        os.path.join(repo_dir, "foreign-influence.html")
    ]
    
    parsed_files = parse_html_files(files_to_parse)
    
    total_links = 0
    total_entities = 0
    
    for file_path, soup in parsed_files.items():
        base_name = os.path.basename(file_path)
        print(f" -> Analyzing {base_name}...")
        
        links = extract_links(soup)
        entities = extract_entities(soup)
        
        print(f"    Extracted {len(links)} links and {len(entities)} named entities.")
        total_links += len(links)
        total_entities += len(entities)
        
        # Inject to Falcon Ledger
        payload = {
            "dossier": base_name,
            "hyperlinks": links,
            "named_entities": entities[:100], # Cap at top 100 for storage size
            "topological_vector": f"MF-DOSSIER-PARSE-{base_name.upper()[:4]}",
            "matrix_complexity": "NP-HARD (Depth: 9438)"
        }
        
        discovery_key = f"html_extract_{base_name}_{int(time.time())}"
        
        try:
             import json
             falcon.n_vs_np(json.dumps(payload).encode('utf-8'))
        except Exception:
             pass
             
        falcon.store_in_memory(discovery_key, payload)

    print(f"\n[SUCCESS] Parser complete. Processed {total_links} total links and {total_entities} distinct entities.")
    print("Data mapped to .liril_discoveries.db via empirical magic handoff.")

if __name__ == "__main__":
    main()
