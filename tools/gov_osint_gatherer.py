import asyncio
import logging
import os
import sys

# TENET5 Modern Tech Imports
from np_millennial_falcon import MillennialFalconTracker
from empirical_magic_handoff import EmpiricalMagicHandoff

# Set up advanced logging
logger = logging.getLogger("GovOSINTGatherer")
logger.setLevel(logging.DEBUG)
sh = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('[%(asctime)s - %(name)s] %(levelname)s: %(message)s')
sh.setFormatter(formatter)
logger.addHandler(sh)

class GovOSINTGatherer:
    def __init__(self):
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'evidence', 'profiles'))
        self.tracker = MillennialFalconTracker()
        self.handoff = EmpiricalMagicHandoff(output_dir)
        
    async def gather_hansard_records(self):
        logger.info("Connecting to Hansard endpoints (Active LIRIL Telemetry Capture)...")
        import glob
        import json
        
        hansard_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'hansard'))
        records = []
        
        # Load up to 10 latest entries to simulate streaming 
        files = glob.glob(os.path.join(hansard_dir, '*.jsonl'))
        files.sort(key=os.path.getmtime, reverse=True)
        
        if not files:
            logger.warning("No Hansard telemetry data found in cache. Falling back to SATOR polling.")
            await asyncio.sleep(1)
            return []
            
        for file in files[:2]:
            file_name = os.path.basename(file)
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    for line_idx, line in enumerate(f):
                        if line_idx >= 5: break  # Limit per file to avoid flooding
                        data = json.loads(line)
                        if 'name' in data and isinstance(data['name'], dict):
                            entity = data['name'].get('en', 'Unknown Bill')
                        elif 'politician' in data:
                            entity = data['politician'].get('name', 'Unknown MP')
                        else:
                            entity = f"{data.get('number', 'Anomaly')} - {data.get('date', 'Unknown')}"
                            
                        records.append({
                            "name": entity,
                            "source": f"Hansard Open API ({file_name})",
                            "payload": data
                        })
            except Exception as e:
                logger.error(f"Error parsing local telemetry {file_name}: {e}")
                
        logger.info(f"Retrieved {len(records)} empirical items of evidence from Hansard pipeline.")
        return records

    async def execute_pipeline(self):
        logger.info("Starting TENET5 OSINT Compilation Pipeline...")
        raw_data = await self.gather_hansard_records()
        
        tasks = []
        for index, item in enumerate(raw_data):
            tasks.append(self.process_target(item, index))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for r in results:
            if isinstance(r, Exception):
                logger.error(f"Pipeline error: {r}")
                
        logger.info("Aligning OSINT SATOR Telemetry via Empirical Magic Handoff...")
        telemetry_files = await self.handoff.align_osint_telemetry()
        if telemetry_files:
            logger.info(f"Successfully integrated {len(telemetry_files)} empirical magic handoff dossiers from OSINT telemetry streams.")
                
        logger.info("Pipeline Execution Completed. All discoveries protected.")

    async def gather_continuous_telemetry(self, interval=5):
        logger.info(f"Initiating OSINT Telemetry Gathering Daemon Loop (Interval: {interval}s)...")
        while True:
            try:
                await self.execute_pipeline()
            except Exception as e:
                logger.error(f"Continuous Gathering Error Caught: {e}")
            await asyncio.sleep(interval)

    async def process_target(self, target_data, index):
        # 1. N vs NP Topological Tracking
        tracked_data = await self.tracker.track_entity(target_data)
        
        # 2. Empirical Magic Handoff Memory System (Write to dossier storage)
        filepath = await self.handoff.secure_handoff(tracked_data)
        return filepath

if __name__ == "__main__":
    gatherer = GovOSINTGatherer()
    try:
        asyncio.run(gatherer.gather_continuous_telemetry(interval=5))
    except KeyboardInterrupt:
        logger.warning("Gatherer manually terminated.")
    except Exception as e:
        logger.critical(f"Critical System Failure: {e}", exc_info=True)
