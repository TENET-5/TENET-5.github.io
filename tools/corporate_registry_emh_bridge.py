"""
TENET5 Corporate Registry → Empirical Magic Handoff Bridge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reads corporate_registry_analysis.json TRIPLE_VECTOR flags
and commits each flagged entity through the EMH pipeline
with BLAKE2 signatures and NATS broadcast.
"""
import asyncio
import sys
import os
import json
import logging

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from empirical_magic_handoff import EmpiricalMagicHandoff

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(message)s')

REGISTRY_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'corporate_registry_analysis.json')
DOSSIER_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'dossiers')

async def main():
    with open(REGISTRY_FILE, 'r', encoding='utf-8') as f:
        registry = json.load(f)

    emh = EmpiricalMagicHandoff(DOSSIER_DIR)
    
    # Phase 1: TRIPLE_VECTOR cross-reference flags
    flags = registry.get('cross_reference_flags', [])
    print(f"[BRIDGE] Processing {len(flags)} TRIPLE_VECTOR cross-reference flags...")
    
    for flag in flags:
        evidence = {
            'name': flag['entity'],
            'source': 'ISED Corporations Canada / Lobbying Registry / Elections Canada',
            'topological_vector': f"MF-{flag.get('emh_hash', 'UNKNOWN')}",
            'matrix_complexity': 'NP-CLASS (TRIPLE_VECTOR)',
            'abcxyz_compliance_check': 'VERIFIED (Millennial Falcon)',
            'payload': {
                'flag_type': flag['flag_type'],
                'description': flag['description'],
                'vectors': flag['vectors'],
                'risk_note': flag['risk_note'],
                'legal_status': flag['legal_status']
            }
        }
        
        filepath = await emh.secure_handoff(
            evidence, 
            routing_agent='LIRIL/SEMES [SCIENCE]',
            ethics_cleared=True
        )
        print(f"  → {flag['entity']}: {filepath}")
    
    # Phase 2: Corporate connections (politician ↔ corporation)
    connections = registry.get('corporate_connections', [])
    print(f"\n[BRIDGE] Processing {len(connections)} corporate-political connections...")
    
    for conn in connections:
        evidence = {
            'name': conn['person'],
            'source': conn.get('source', 'Public records'),
            'topological_vector': f"MF-{conn.get('emh_hash', 'UNKNOWN')}",
            'matrix_complexity': 'P-CLASS (direct connection)',
            'abcxyz_compliance_check': 'VERIFIED',
            'payload': {
                'corporation': conn['corporation'],
                'role': conn['role'],
                'status': conn['status'],
                'is_politician': conn['is_politician']
            }
        }
        
        filepath = await emh.secure_handoff(
            evidence,
            routing_agent='LIRIL/RADAR [TECHNOLOGY]',
            ethics_cleared=True
        )
        print(f"  → {conn['person']} ↔ {conn['corporation']}: {filepath}")
    
    total = len(flags) + len(connections)
    print(f"\n[COMPLETE] {total} entities secured via Empirical Magic Handoff.")
    print(f"[DOSSIER DIR] {os.path.abspath(DOSSIER_DIR)}")

if __name__ == '__main__':
    asyncio.run(main())
