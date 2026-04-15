#!/usr/bin/env python3
"""
Social Media Monitoring Scraper
Collects public posts, hooks into SATOR Nexus and ABCXYZ EMH for trajectory tracking.
"""
import os
import json
import time

# TENET5 OSINT Standard paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_FILE = os.path.join(DATA_DIR, 'social_media_analysis.json')

try:
    import sys
    sys.path.append(r'E:\S.L.A.T.E\tenet5\src')
    from tenet.discoveries.sator_memory_nexus_v2 import SATORMemoryNexus
    from tenet.discoveries.sator_memory_nexus import SATORGrid
    try:
        from ABCXYZ.osint_nitter_bridge import NitterOSINTBridge
        import asyncio
        HAS_NITTER = True
    except ImportError:
        HAS_NITTER = False
        
    sys.path.append(os.path.join(DATA_DIR, '..', 'tools'))
    try:
        from np_millennial_falcon import MillennialFalconTracker
        import asyncio
        HAS_FALCON = True
    except ImportError:
        HAS_FALCON = False
        
    HAS_SATOR = True
except ImportError:
    HAS_SATOR = False
    HAS_NITTER = False
    HAS_FALCON = False

class SocialMediaMonitor:
    def __init__(self):
        self.nexus = None
        if HAS_SATOR:
            self.nexus = SATORMemoryNexus(grid=SATORGrid())

    def scrape_targets(self):
        targets = ["CIJAinfo", "markcarney", "JustinTrudeau", "Puglaas"]
        
        # LIRIL Task 1: Numpy Array Data Validation Check
        try:
            import numpy as np
            arr = np.array(targets)
            if not isinstance(arr, np.ndarray) or arr.dtype.kind not in ['U', 'S', 'O']:
                raise TypeError("OSINT Target arrays must be normalized numeric or unicode structures.")
        except Exception as e:
            print(f"[ERROR] Native Array Validation failure block: {e}")
            
        results = {}
        
        if HAS_NITTER:
            print("[OSINT] Nitter bridge available. Fetching real targeted timelines...")
            bridge = NitterOSINTBridge()
            for t in targets:
                print(f" -> Fetching @{t}")
                try:
                    tweets = asyncio.run(bridge.fetch_target_timeline(t))
                    analysis = bridge.analyze_timeline_for_vectors(t, tweets)
                    results[t] = analysis
                except Exception as e:
                    print(f"    Failed pulling @{t}: {e}")
                    results[t] = {"error": str(e), "edges_discovered": [], "primary_vector": "unknown"}
        else:
            print("[OSINT] Simulated Social Scan based on cached endpoints...")
            for t in targets:
                results[t] = {
                    "edges_discovered": [f"{t}_associates"],
                    "primary_vector": "political_messaging"
                }
                
        return results

def main():
    print("=" * 50)
    print("TENET-5 SOCIAL MEDIA MONITOR")
    print("=" * 50)
    monitor = SocialMediaMonitor()
    results = monitor.scrape_targets()
    
    if HAS_FALCON:
        print("\n  [LIRIL] Invoking Millennial Falcon N-vs-NP Matrix Engine...")
        tracker = MillennialFalconTracker()
        
        async def embed_intelligence():
            for target, data in results.items():
                import copy
                cloned_data = copy.deepcopy(data)
                node_payload = {
                    "name": f"OSINT_SocialProxy_{target}",
                    "source": "TENET5 Social Media Vector",
                    "payload": cloned_data
                }
                metrics = await tracker.track_entity(node_payload)
                # Strip the circular payload reflection out of the metrics dump
                metrics.pop("payload", None)
                results[target]['falcon_metrics'] = metrics
                
        asyncio.run(embed_intelligence())
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            "generated_at": time.time(),
            "targets": results,
            "metadata": {
                "sator_nexus_integration": HAS_SATOR,
                "nitter_bridge_integration": HAS_NITTER,
                "falcon_matrix_integration": HAS_FALCON
            }
        }, f, indent=2)
    print(f"\n[SUCCESS] Social Media analysis tracked and saved to {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
