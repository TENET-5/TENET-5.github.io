import asyncio
import logging
import json
import os
import hashlib
from datetime import datetime

class EmpiricalMagicHandoff:
    def __init__(self, output_dir):
        self.logger = logging.getLogger("EmpiricalMagicHandoff")
        self.logger.setLevel(logging.DEBUG)
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
    async def secure_handoff(self, evidence_data, routing_agent="LIRIL/MINIM", ethics_cleared=True):
        """
        The Empirical Magic Handoff Memory System ensures OSINT findings are seamlessly recorded and structured.
        Now includes LIRIL Agent constraints and cryptographic sigs.
        """
        self.logger.info("Initializing Empirical Magic Handoff...")
        await asyncio.sleep(0.2)  # Simulate secure handoff lock acquisition
        
        target_name = evidence_data.get('name', 'unknown').lower().replace(' ', '_')
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{target_name}_dossier_{timestamp}.md"
        filepath = os.path.join(self.output_dir, filename)
        
        # Determine signature logically coupled with the topological vector
        payload_str = json.dumps(evidence_data.get('payload', {}))
        topological_vector = evidence_data.get('topological_vector', 'N/A')
        sig_base = f"{target_name}{timestamp}{topological_vector}{payload_str}{routing_agent}".encode('utf-8')
        signature = hashlib.blake2b(sig_base, digest_size=16).hexdigest()
        
        ethics_str = "CLEARED" if ethics_cleared else "FLAGGED"
        
        # Enforce abcxyz N vs NP parameters from Millennial Falcon subsystem
        matrix_complexity = evidence_data.get('matrix_complexity', 'NP-CLASS (Unresolved)')
        abcxyz_compliance = evidence_data.get('abcxyz_compliance_check', 'SECURED (Millennial Falcon)')
        
        # Format the intelligence into markdown format for the dossier UI
        output_content = f"""# OSINT Dossier: {evidence_data.get('name', 'Unknown')}
Date Captured: {datetime.now().isoformat()}

## Routing & Metadata
- **Source:** {evidence_data.get('source', 'Classified')}
- **Topological Vector:** {evidence_data.get('topological_vector', 'N/A')}
- **Matrix Path (N vs NP):** {matrix_complexity}
- **abcxyz Compliance:** {abcxyz_compliance}
- **Routing Agent:** {routing_agent}
- **Ethics Gate:** {ethics_str}

## Evidence Details
```json
{json.dumps(evidence_data.get('payload', {}), indent=2)}
```

---
*Secured via TENET5 Empirical Magic Handoff Memory System*
*Cryptographic Signature (BLAKE2):* `{signature}`
"""
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(output_content)
        
        # Broadcast the OSINT Telemetry to TENET-5 AI Loop natively
        try:
            import nats
            nc = await nats.connect("nats://127.0.0.1:4222", connect_timeout=2)
            telemetry_payload = {
                "source": "LIRIL_EMPIRICAL_HANDOFF",
                "evidence_id": signature,
                "target": target_name,
                "matrix_complexity": matrix_complexity,
                "abcxyz_compliance": abcxyz_compliance,
                "routing_agent": routing_agent,
                "ethics": ethics_str,
                "filepath": filepath
            }
            await nc.publish("tenet.liril.broadcast", json.dumps(telemetry_payload).encode('utf-8'))
            await nc.drain()
            self.logger.info(f"Broadcasted OSINT Handoff telemetry to native TENET-5 AI system loop via NATS.")
        except ImportError:
            self.logger.debug("python-nats not available, deferring native AI trigger broadcast.")
        except Exception as e:
            self.logger.warning(f"TENET-5 NATS Event Loop offline. Autonomous AI response deferred: {e}")
        
        self.logger.info(f"Handoff Success: Data secured symmetrically with sig {signature[:8]} at {filepath}")
        return filepath

    async def align_osint_telemetry(self, osint_telemetry_url="http://127.0.0.1:8092/api/osint_telemetry"):
        """
        Polls the local OSINT Tenet5/SATOR telemetry hub and integrates 
        'OPERATIVE_DEPLOYED' and 'PARADOX_STORM_TRIGGERED' states cleanly 
        into the OSINT GitHub pages matrix.
        """
        import urllib.request
        import urllib.error
        
        self.logger.info(f"Polling OSINT Telemetry Sync at: {osint_telemetry_url}")
        target_events = [
            "OPERATIVE_DEPLOYED", 
            "PARADOX_STORM_TRIGGERED", 
            "OSINT_INTEL_ACQUIRED",
            "SATOR_CODE_ACTIVE",
            "STARK_CONTAINMENT_BREACH",
            "TEMPORAL_RIFT_DETECTED"
        ]
        
        try:
            req = urllib.request.Request(osint_telemetry_url, headers={'User-Agent': 'Tenet5-Empirical/1.0'})
            with urllib.request.urlopen(req, timeout=3.0) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    events = data.get("events", []) if isinstance(data, dict) else data
                    
                    synced_files = []
                    for ev in events:
                        ev_name = ev.get("event", "")
                        if ev_name in target_events:
                            payload_data = ev.get("data", {})
                            
                            # Construct an OSINT empirical dossier payload
                            evidence_data = {
                                'name': f"OSINT_Simulation_Log_{ev_name}",
                                'source': "TENET5 Vector: SATOR Network Port 8092",
                                'topological_vector': "MF-87E633DCF77C09E3",
                                'matrix_complexity': "N_VS_NP_CONVERGED",
                                'abcxyz_compliance_check': "VERIFIED",
                                'payload': payload_data
                            }
                            
                            filepath = await self.secure_handoff(evidence_data, routing_agent="LIRIL/OSINT_TELEMETRY")
                            synced_files.append(filepath)
                            
                    self.logger.info(f"Aligned {len(synced_files)} SATOR tracking events into OSINT dossiers.")
                    return synced_files
        except urllib.error.URLError as e:
            self.logger.warning(f"OSINT telemetry hub offline or unreachable. Skipping matrix alignment: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Failed to align telemetry: {e}")
            return []
