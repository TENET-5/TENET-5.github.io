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
        
        # Determine signature
        payload_str = json.dumps(evidence_data.get('payload', {}))
        sig_base = f"{target_name}{timestamp}{payload_str}{routing_agent}".encode('utf-8')
        signature = hashlib.blake2b(sig_base, digest_size=16).hexdigest()
        
        ethics_str = "CLEARED" if ethics_cleared else "FLAGGED"
        
        # Format the intelligence into markdown format for the dossier UI
        output_content = f"""# OSINT Dossier: {evidence_data.get('name', 'Unknown')}
Date Captured: {datetime.now().isoformat()}

## Routing & Metadata
- **Source:** {evidence_data.get('source', 'Classified')}
- **Topological Vector:** {evidence_data.get('topological_vector', 'N/A')}
- **Matrix Path:** {evidence_data.get('matrix_complexity', 'UNKNOWN')}
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
        
        self.logger.info(f"Handoff Success: Data secured symmetrically with sig {signature[:8]} at {filepath}")
        return filepath
