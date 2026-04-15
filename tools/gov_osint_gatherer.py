import asyncio
import logging
import os
import sys
import time
import functools

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


def retry_with_backoff(max_retries=3, base_delay=1.0, max_delay=30.0):
    """Phase 26: Exponential backoff retry decorator for async functions.
    
    Retries on any exception with delays: base_delay * 2^attempt
    Capped at max_delay seconds between retries.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        logger.warning(
                            f"[RETRY] {func.__name__} failed (attempt {attempt + 1}/{max_retries + 1}): {e}. "
                            f"Retrying in {delay:.1f}s..."
                        )
                        await asyncio.sleep(delay)
            logger.error(f"[RETRY EXHAUSTED] {func.__name__} failed after {max_retries + 1} attempts: {last_exception}")
            raise last_exception
        return wrapper
    return decorator


class CircuitBreaker:
    """Phase 26: Circuit breaker — pauses pipeline when infrastructure is clearly down.
    
    After `failure_threshold` consecutive failures, opens the circuit for `reset_timeout` seconds.
    """
    def __init__(self, failure_threshold=5, reset_timeout=60.0):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.consecutive_failures = 0
        self.circuit_open_until = 0.0

    def record_success(self):
        self.consecutive_failures = 0

    def record_failure(self):
        self.consecutive_failures += 1
        if self.consecutive_failures >= self.failure_threshold:
            self.circuit_open_until = time.monotonic() + self.reset_timeout
            logger.warning(
                f"[CIRCUIT BREAKER] Opened after {self.consecutive_failures} consecutive failures. "
                f"Pipeline paused for {self.reset_timeout}s."
            )

    def is_open(self) -> bool:
        if time.monotonic() < self.circuit_open_until:
            return True
        if self.circuit_open_until > 0 and time.monotonic() >= self.circuit_open_until:
            logger.info("[CIRCUIT BREAKER] Reset timeout elapsed. Closing circuit, resuming pipeline.")
            self.circuit_open_until = 0.0
            self.consecutive_failures = 0
        return False

class GovOSINTGatherer:
    def __init__(self):
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'evidence', 'profiles'))
        self.tracker = MillennialFalconTracker()
        self.handoff = EmpiricalMagicHandoff(output_dir)
        self.breaker = CircuitBreaker(failure_threshold=5, reset_timeout=60.0)
        
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

    @retry_with_backoff(max_retries=2, base_delay=1.0)
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
            if self.breaker.is_open():
                logger.info("[CIRCUIT BREAKER] Pipeline paused. Waiting for reset...")
                await asyncio.sleep(5)
                continue
            try:
                await self.execute_pipeline()
                self.breaker.record_success()
            except Exception as e:
                logger.error(f"Continuous Gathering Error Caught: {e}")
                self.breaker.record_failure()
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
