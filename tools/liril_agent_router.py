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
    def __init__(self, output_dir):
        self.output_dir = output_dir
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
        if 'code' in text or 'algorithm' in text or 'cyber' in text:
            return "TECHNOLOGY"
        elif 'vote' in text or 'parliament' in text or 'lobby' in text:
            return "REASONING"
        elif 'financial' in text or 'cost' in text:
            return "MATHEMATICS"
        return "SCIENCE"

    async def route_payload(self, raw_data):
        logger.info(f"Received raw data payload for entity: {raw_data.get('name')}")
        
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
                "notes": "Cleared by inquiry but still tracked in the parliamentary network."
            }
        }
        await router.route_payload(test_payload)
        
if __name__ == "__main__":
    if sys.platform != 'win32':
        import nest_asyncio
        nest_asyncio.apply()
    asyncio.run(main())
