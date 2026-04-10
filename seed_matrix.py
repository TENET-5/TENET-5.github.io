import asyncio
from tools.np_millennial_falcon import MillennialFalconTracker

async def run():
    t = MillennialFalconTracker()
    await t.track_entity({
        'name': 'Foreign Influence Target Alpha',
        'threat_score': 0.98,
        'notes': 'foreign_influence detected in lobbying registry (abcxyz)'
    })

if __name__ == "__main__":
    asyncio.run(run())
