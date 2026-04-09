# EOSL-2.0 Copyright (c) 2023, TENET5 Operating System
# ETHICS MATRIX GENERATOR - Empirical Magic Handoff Memory

import json
from typing import List

# Complete SATOR 5x5 Grid Mapping
PALINDROMIC_AGENTS = [
    "AVIVA", "ANINA", "STATS", "CIVIC", "SAGAS",
    "KAYAK", "RADAR", "REFER", "ROTOR", "LEVEL",
    "MADAM", "MINIM", "SEMES", "ALULA", "SHAHS",
    "DEKED", "DELED", "LEMEL", "SOLOS", "TENET",
    "LIRIL", "SALAS", "SEXES", "EIRIE", "FINIF"
]

def generate_ethics_matrix(agents: List[str]) -> List[List[str]]:
    matrix = [['' for _ in range(5)] for _ in range(5)]
    for i, agent in enumerate(agents):
        row = i // 5
        col = i % 5
        matrix[row][col] = agent
    return matrix

def generate_dossier_matrix():
    print("[ETHICS] Initializing SATOR 5x5 Grid Mapping...")
    matrix = generate_ethics_matrix(PALINDROMIC_AGENTS)
    
    output_path = r"E:\TENET-5.github.io\data\ethics_matrix_dossier.json"
    
    payload = {
        "architecture": "5x5 SATOR Palindromic Array",
        "lock": "125/125 Hardware Matrix",
        "dimensions": {
            "ART": matrix[0],
            "TECHNOLOGY": matrix[1],
            "SCIENCE": matrix[2],
            "MATHEMATICS": matrix[3],
            "ETHICS": matrix[4]
        },
        "raw_grid": matrix,
        "status": "fully mathematically closed"
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=4)
        
    print(f"[MATHEMATICS] Matrix completely flushed to {output_path}")

if __name__ == '__main__':
    generate_dossier_matrix()
