#!/usr/bin/env python3
# Copyright (c) 2026, TENET5
# All rights reserved.

import os
import sys
import json
import hashlib
import logging

# Ensure cross-directory package integration can reach the TENET core codebase
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'scrapers')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'S.L.A.T.E', 'tenet5', 'src')))

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

def dynamic_hash_coordinate(text_input: str) -> tuple:
    """ Generate a deterministic pseudo-3D coordinate array natively representing an entity text. """
    digest = hashlib.md5(text_input.encode('utf-8')).hexdigest()
    x = int(digest[0:8], 16) % 1000
    y = int(digest[8:16], 16) % 1000
    z = int(digest[16:24], 16) % 1000
    return (x, y, z)

def analyze_temporal_osint():
    logging.info("==========================================================")
    logging.info("TENET-5 TEMPORAL OSINT CONVOLUTIONAL ANALYZER")
    logging.info("==========================================================")
    
    try:
        from cija_pipeline_tracker import run_pipeline_analysis
        from tenet.discoveries.temporal_graph_convolution import TemporalGraphConvolutionalModule
    except ImportError as e:
        logging.error(f"Failed to bridge internal TENET-5 modules natively. Missing path: {e}")
        return

    # PHASE 1: Fetch Live Tracking OSINT 
    logging.info("[Phase 1] Extracting CIJA OSINT Network Vector Data...")
    pipeline_data = run_pipeline_analysis()
    
    mp_entities = pipeline_data.get('lobbied_mps', [])
    logging.info(f" -> Successfully acquired {len(mp_entities)} target MP nodes from pipeline.")
    
    # PHASE 2: Map Mathematical Spaces
    logging.info("[Phase 2] Aligning OSINT entity tensors onto spatial geometry...")
    spatial_graph = []
    
    for mp in mp_entities:
         entity_name = mp.get('name', 'unknown')
         (x, y, z) = dynamic_hash_coordinate(entity_name)
         spatial_graph.append((x, y, z))
    
    # Cap processing for tensor padding (as Temporal GCN N_MAX is statically defined)     
    if len(spatial_graph) > 200:
         spatial_graph = spatial_graph[:200]
         
    # PHASE 3: Temporal Graph Convolution
    logging.info("[Phase 3] Pushing topological mapping array directly through Temporal Convolutional Neural Array (Phases 51-54)...")
    
    # Init neural module dynamically
    tgcn_module = TemporalGraphConvolutionalModule(hidden_size=256, num_heads=8, num_layers=4)
    
    # Build temporal metadata dictionary to supplement the coordinate tuple mappings
    temporal_features = {
        "timestamp": pipeline_data.get("analyzed_at", ""),
        "total_edges_identified": pipeline_data.get("pipeline_summary", {}).get("cija_edges", 0),
        "source": "CIJA_OSINT_PIPELINE"
    }
    
    convolved_results = tgcn_module.process_temporal_graph(spatial_graph, temporal_features)
    
    # Log successful tensor convergence
    metrics = convolved_results.get("metrics", {})
    logging.info("----------------------------------------------------------")
    logging.info(f"   [!] Tensor Unification Complete. Accuracy Matrix: {metrics.get('accuracy', 0.0):.4f}")
    logging.info(f"   [!] Phase 54 ASGCN Activated Flag: {metrics.get('phase_54_asgcn_activated', False)}")
    logging.info(f"   [!] Phase 53 Topology Geometry Convolved: {metrics.get('edges_convolved')}")
    logging.info("----------------------------------------------------------")
    
    # Write convolved mathematical output
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'osint_vault', 'cija_temporal_convoluted.json')
    
    with open(output_path, 'w', encoding='utf-8') as vault_f:
         json.dump(convolved_results, vault_f, indent=4)
         
    logging.info(f"Stored processed topological matrices securely natively in {output_path}")

if __name__ == "__main__":
    analyze_temporal_osint()
