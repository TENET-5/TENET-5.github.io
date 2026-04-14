import sys
import os
import json
from dataclasses import dataclass
from typing import Dict, List

# Mount the TENET5 src directory so we can import the engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'S.L.A.T.E', 'tenet5', 'src')))

from tenet.discoveries.temporal_graph_convolution import TemporalGraphConvolutionalModule

@dataclass
class RegistryNode:
    id: str
    name: str
    is_politician: bool
    temporal_edges: List[str]

class OSINTDashboardIntegration:
    def __init__(self, data_path: str, output_path: str):
        self.data_path = data_path
        self.output_path = output_path
        self.registry_nodes: Dict[str, RegistryNode] = {}
        
        print("[Chronos-Temporal] Booting Unified Temporal Engine...")
        # Deep Temporal Engine - Using empirical fallbacks natively if torch unavailable
        self.tgc_module = TemporalGraphConvolutionalModule(hidden_size=64, num_heads=2)
        
    def load_registry(self):
        with open(self.data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Parse Connections
        for conn in data.get("corporate_connections", []):
            node_id = conn.get("emh_hash", str(hash(conn["person"])))
            self.registry_nodes[node_id] = RegistryNode(
                id=node_id,
                name=conn["person"],
                is_politician=conn.get("is_politician", False),
                temporal_edges=[conn["corporation"]]
            )
            
    def analyze_graph(self):
        print(f"[Chronos-Temporal] Loaded {len(self.registry_nodes)} Registry Nodes. Initiating Phase 54 Convolution...")
        results = []
        for node_id, node in self.registry_nodes.items():
            # Minimal spatial graph (e.g. mapping across spatial bounds of lobbying influence)
            spatial_graph = [(1, 2, 1), (3, 4, 1), (5, 6, 1)] 
            
            temporal_features = {
                "entity": node.name,
                "vector": "CORPORATE_LOBBYING",
                "politician": node.is_politician
            }
            
            # Exec Convolution natively
            intel = self.tgc_module.process_temporal_graph(spatial_graph, temporal_features)
            
            anomaly_score = intel.get("metrics", {}).get("loss", 0.0)
            
            # Generate Millennial Falcon topological vector
            import hashlib
            vector_input = f"{node.name}:{','.join(node.temporal_edges)}".encode('utf-8')
            vector_hash = hashlib.blake2b(vector_input, digest_size=8).hexdigest().upper()
            topo_vector = f"MF-{vector_hash}-PATH{len(node.temporal_edges)}"
            
            # Risk classification based on anomaly score
            risk_level = "HIGH" if anomaly_score > 0.05 else "MEDIUM" if anomaly_score > 0.01 else "LOW"
            
            results.append({
                "id": node.id,
                "name": node.name,
                "edges": node.temporal_edges,
                "corporation": node.temporal_edges[0] if node.temporal_edges else "UNKNOWN",
                "anomaly_score": anomaly_score,
                "topological_vector": topo_vector,
                "risk_level": risk_level,
                "metrics": intel.get("metrics", {}),
                "status": intel.get("status")
            })
            
        # Ensure data dir exists
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
            
        with open(self.output_path, 'w', encoding='utf-8') as f:
            json.dump({
                "identity": "SATOR_MATRIX_CHRONOS",
                "engine": "Chronos Temporal Engine + Phase 54 A-SGCN",
                "convolutions": results
            }, f, indent=2)
            
        print(f"[Chronos-Temporal] Exported {len(results)} mapped temporal arrays to OSINT Dashboard ({self.output_path}).")

if __name__ == "__main__":
    registry_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'corporate_registry_analysis.json'))
    out_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'temporal_convolutions.json'))
    
    integration = OSINTDashboardIntegration(registry_file, out_file)
    integration.load_registry()
    integration.analyze_graph()
