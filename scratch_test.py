import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.empirical_magic_handoff import EmpiricalMagicHandoff

async def main():
    h = EmpiricalMagicHandoff(output_dir='data/dossiers')
    filepath = await h.secure_handoff({
        'name': 'Test Matrix Sync',
        'target': 'TestTarget_X99',
        'matrix_complexity': 'NP-CLASS',
        'payload': {'key': 'value'}
    }, routing_agent="LIRIL/TEST")
    
    print(f"Handoff saved to {filepath}")

if __name__ == "__main__":
    asyncio.run(main())
