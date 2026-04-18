import asyncio
import json
import logging
import os
import sys

# Incorporate pathing for OSINT modules and S.L.A.T.E core
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GH_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))
SLATE_DIR = os.path.abspath(os.path.join(GH_DIR, '..', 'S.L.A.T.E', 'tenet5', 'src'))
SLATE_TOOLS = os.path.abspath(os.path.join(GH_DIR, '..', 'S.L.A.T.E', 'tenet5', 'tools'))

if SLATE_DIR not in sys.path:
    sys.path.append(SLATE_DIR)
if SLATE_TOOLS not in sys.path:
    sys.path.append(SLATE_TOOLS)
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# LIRIL Core Routing & Memory Imports
try:
    from liril_agent_router import LirilAgentRouter
except ImportError:
    LirilAgentRouter = None
    
try:
    from np_millennial_falcon import MillennialFalconTracker
except ImportError:
    MillennialFalconTracker = None

try:
    from clean_hallucinations import clean_file
except ImportError:
    clean_file = lambda x: None

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)s: %(message)s')
logger = logging.getLogger("LIRIL_AUTONOMOUS_DAEMON")

class LirilAutonomousDaemon:
    def __init__(self):
        if LirilAgentRouter is None:
            logger.error("Failed to load LirilAgentRouter. Aborting.")
            sys.exit(1)
            
        self.router = LirilAgentRouter(output_dir=os.path.join(GH_DIR, "data", "dossiers"))
        if MillennialFalconTracker:
            self.falcon = MillennialFalconTracker()
        else:
            self.falcon = None
            
        # Defaults to DRY_RUN to protect the mass mailer from unintentional triggers.
        # Toggle to "LIVE" via env var or config to arm the autonomous deployment pipeline.
        self.deploy_mode = os.environ.get("LIRIL_DEPLOY_MODE", "DRY_RUN")
        
    async def process_nats_payload(self, msg):
        """ Processes raw intelligence payloads pushed over the NATS bus natively. """
        try:
            payload = json.loads(msg.data.decode('utf-8'))
            logger.info(f"Ingested NATS Payload from [{msg.subject}]")
            
            # STEP 1: ABCXYZ N-vs-NP Constraints & Agent Routing Execution
            # Using the established Empirical Magic Handoff system internally.
            dossier_filepath = await self.router.route_payload(payload, data_source=msg.subject)
            
            # STEP 2: Post-route processing and Hallucination scrubbing
            if dossier_filepath and os.path.exists(dossier_filepath):
                logger.info(f"Running baseline hallucination scrubber on {dossier_filepath}")
                clean_file(dossier_filepath)
                
            # STEP 3: Automated Triage & Live Deployment
            await self._assess_deployment(payload, dossier_filepath)
                
        except Exception as e:
            logger.error(f"Daemon payload execution failure: {e}")
            
    async def _assess_deployment(self, payload, filepath):
        """ Evaluates whether a dossier triggers mass distribution loops. """
        severity = payload.get("matrix_complexity", "NP-CLASS")
        payload_str = str(payload).upper()
        
        # Threat triggers: N_VS_NP_CONVERGED signifies undeniable systemic proof (e.g., Target Alpha)
        if "N_VS_NP_CONVERGED" in severity or "ABCXYZ" in payload_str or "BROOKFIELD" in payload_str:
            logger.warning("[DEPLOYMENT TRIGGERED] Mass intelligence broadcasting justified.")
            
            mp_broadcaster_script = os.path.join(SLATE_DIR, "tenet", "lirilclaw_web", "services", "mp_broadcaster.py")
            if os.path.exists(mp_broadcaster_script):
                if self.deploy_mode == "LIVE":
                    logger.critical(">>> EXECUTING LIVE MASS BROADCAST TO PARLIAMENT <<<")
                    # Autonomous hook into mp_broadcaster (sending evidence_summary across all members)
                    os.system(f"python \"{mp_broadcaster_script}\" --send-all --template evidence_summary")
                else:
                    logger.info(">>> DRY RUN: mp_broadcaster engaged, but blocked from LIVE execution. <<<")
                    logger.info(f"Would have executed: python {mp_broadcaster_script} --send-all --template evidence_summary")
            else:
                logger.warning(f"Deployment failed. Could not locate: {mp_broadcaster_script}")

    async def run(self):
        import nats
        logger.info("======================================================")
        logger.info("Booting Full LIRIL Autonomous OSINT System...")
        logger.info("Engaging ABCXYZ constants and Matrix Routing Topology.")
        logger.info(f"DEPOYMENT MODE: {self.deploy_mode}")
        logger.info("======================================================")
        
        try:
            nc = await nats.connect("nats://127.0.0.1:4222", connect_timeout=5)
            
            # Subscribe to external intelligence gathering nodes feeding the daemon
            await nc.subscribe("tenet5.aurora.ingest", cb=self.process_nats_payload)
            await nc.subscribe("tenet5.osint.telemetry", cb=self.process_nats_payload)
            
            logger.info("Agent Autonomous Daemon connected. Subscribed to NATS matrix. Awaiting telemetry...")
            
            # Heartbeat / polling Loop
            cycles = 0
            while True:
                await asyncio.sleep(600)  # Sweep every 10 minutes
                cycles += 1
                logger.info(f"[Cycle {cycles}] Running scheduled Empirical Matrix synchronization sweep.")
                synced = await self.router.handoff.align_osint_telemetry()
                if synced:
                    logger.info(f"Aligned {len(synced)} missed autonomous events natively.")
                    
        except nats.errors.NoServersError:
            logger.error("NATS Server unreachable. LIRIL automations blocked.")

if __name__ == "__main__":
    if sys.platform != 'win32':
        import nest_asyncio
        nest_asyncio.apply()
        
    daemon = LirilAutonomousDaemon()
    try:
        asyncio.run(daemon.run())
    except KeyboardInterrupt:
        logger.info("LIRIL Autonomous Daemon halted securely.")
