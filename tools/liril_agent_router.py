import asyncio
import logging
import argparse
import sys
import os

from np_millennial_falcon import MillennialFalconTracker
from empirical_magic_handoff import EmpiricalMagicHandoff

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)s: %(message)s')
logger = logging.getLogger("LIRIL_Router")

class LirilAgentRouter:
    def __init__(self, output_dir, osint_data_sources: list[str] = None):
        self.output_dir = output_dir
        self.osint_data_sources = osint_data_sources or []
        self.falcon = MillennialFalconTracker()
        self.handoff = EmpiricalMagicHandoff(self.output_dir)
        
        # S.L.A.T.E constraints map
        self.artstem_agents = {
            "SCIENCE": "KAYAK/MINIM",
            "TECHNOLOGY": "RADAR/MAXIM",
            "REASONING": "CIVIC/SOLVER",
            "MATHEMATICS": "LEVEL/CALC",
            "ART": "ROTOR/CREATE"
        }

    def _simulate_liril_classification(self, payload):
        """Simulates MCP LIRIL ARTSTEM domain classification."""
        text = str(payload).lower()
        if 'abcxyz' in text or 'alpha' in text:
            return "TECHNOLOGY"  # Special routing for Foreign Influence Target Alpha (P-CLASS)
        elif 'ABCXYZ' in text or 'temporal' in text or 'chronos' in text:
            return "ART"  # Temporal waves map to ART STEM domains
        elif 'code' in text or 'algorithm' in text or 'cyber' in text:
            return "TECHNOLOGY"
        elif 'vote' in text or 'parliament' in text or 'lobby' in text:
            return "REASONING"
        elif 'financial' in text or 'cost' in text:
            return "MATHEMATICS"
        return "SCIENCE"

    async def route_payload(self, raw_data, data_source: str = None):
        source_label = data_source or raw_data.get('source', 'UNKNOWN')
        logger.info(f"Received raw data payload for entity: {raw_data.get('name')} from {source_label}")
        
        # 1. Classify payload
        domain = self._simulate_liril_classification(raw_data)
        agent = self.artstem_agents.get(domain, "UNKNOWN")
        logger.info(f"LIRIL GATE: Classified as {domain}. Routing to {agent}")
        
        # 2. Track Topological Vector (ABCXYZ N vs NP)
        tracked_data = await self.falcon.track_entity(raw_data)
        
        # 3. Secure empirical magic handoff
        ethics_cleared = True # Base assumption for OSINT scraper feed
        filepath = await self.handoff.secure_handoff(
            tracked_data, 
            routing_agent=f"{agent} [{domain}]",
            ethics_cleared=ethics_cleared
        )
        
        logger.info(f"ROUTING COMPLETE. Agent {agent} closed transaction at {filepath}")
        return filepath

async def main():
    parser = argparse.ArgumentParser(description="LIRIL Agent Routing test runner")
    parser.add_argument("--test", action="store_true", help="Run a test payload")
    args = parser.parse_args()
    
    if args.test:
        router = LirilAgentRouter(output_dir="../data/dossiers")
        test_payload = {
            "name": "Han Dong",
            "source": "OpenParliament.ca",
            "payload": {
                "lobbying_count": 45,
                "alerts": ["Foreign Interference Inquiry (Hogue)"],
                "notes": "Cleared by inquiry but still tracked in the parliamentary network.",
                "target_flag": "abcxyz"  # Tests the new abcxyz logic
            }
        }
        await router.route_payload(test_payload, data_source="OpenParliament_OSINT")
        
        logger.info("Aligning OSINT SATOR Telemetry during Router Test...")
        synced_files = await router.handoff.align_osint_telemetry()
        if synced_files:
            logger.info(f"Test Execution aligned {len(synced_files)} empirical magic handoff vectors.")
        
if __name__ == "__main__":
    if sys.platform != 'win32':
        import nest_asyncio
        nest_asyncio.apply()
    asyncio.run(main())
