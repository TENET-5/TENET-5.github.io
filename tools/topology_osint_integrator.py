#!/usr/bin/env python3
# Copyright (c) 2026, TENET5
# All rights reserved.

import os
import sys
import json
import asyncio
import logging
import subprocess

# Secure pathing
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data', 'scrapers'))

from gov_osint_gatherer import GovOSINTGatherer

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

async def main():
    logging.info("==================================================")
    logging.info("TENET-5 LIRIL TOPOLOGY INTEGRATOR BRIDGE")
    logging.info("==================================================")
    
    # PHASE 1: Intercept 
    logging.info("Starting Hansard OSINT Interception...")
    gatherer = GovOSINTGatherer()
    raw_data = await gatherer.gather_hansard_records()
    
    # PHASE 2: Distill directly to OSINT Vault Format
    vault_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'osint_vault')
    os.makedirs(vault_dir, exist_ok=True)
    
    snapshot_path = os.path.join(vault_dir, 'gov_osint_snapshot.json')
    
    # OSINT vault format: JSON mapping { "TargetName": { "search_query": [...] } }
    vault_payload = {}
    
    for item in raw_data:
        entity_name = item.get("name", "Unknown_Entity")
        payload = item.get("payload", {})
        
        vault_payload[entity_name] = {
            "gov_osint_extract": [
                {
                    "body": json.dumps(payload),
                    "source": item.get("source", "Hansard")
                }
            ]
        }
        logging.info(f" -> Mapped registry data for: {entity_name}")
        
    with open(snapshot_path, 'w', encoding='utf-8') as f:
        json.dump(vault_payload, f, indent=4)
        
    logging.info(f"Successfully baked newly discovered OSINT arrays into {snapshot_path}")
    
    # PHASE 3: Autonomous Re-Bake
    logging.info("Triggering System-Wide Network Topology Regeneration...")
    
    target_script = os.path.join(os.path.dirname(__file__), '..', 'data', 'scrapers', 'network_topology_analyzer.py')
    
    try:
        # Run process to inherently encapsulate logic state effectively
        process_result = subprocess.run(
            [sys.executable, target_script, '--analyze'], 
            capture_output=True, text=True, check=True
        )
        logging.info("Analyzer output captured successfully.")
        
        # Output tail log to ensure connection
        for line in process_result.stderr.split('\n')[-4:]:
            if line:
                 logging.info(f"   [Topology Core] {line}")
                 
    except subprocess.CalledProcessError as e:
         logging.error(f"Failed to execute analyzer: {e.stderr}")

    logging.info("LIRIL Orchestrator Directive Achieved.")

if __name__ == "__main__":
    asyncio.run(main())
