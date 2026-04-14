import sys
import os
import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

# Ensure we can import from the currently local directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from gov_osint_gatherer import GovOSINTGatherer
from empirical_magic_handoff import EmpiricalMagicHandoff

class TestEmpiricalMagicHandoffIntegration(unittest.IsolatedAsyncioTestCase):
    
    @patch('gov_osint_gatherer.EmpiricalMagicHandoff')
    @patch('gov_osint_gatherer.MillennialFalconTracker')
    async def test_execute_pipeline_success(self, MockTracker, MockHandoff):
        """Test the structural execution of the pipeline aligning with OSINT telemetry."""
        # Setup mocks
        mock_tracker_instance = MockTracker.return_value
        mock_handoff_instance = MockHandoff.return_value
        
        # We simulate the pipeline acquiring empirical OSINT events
        mock_handoff_instance.align_osint_telemetry = AsyncMock(return_value=["evidence/profiles/osint_telemetry_event_1.md"])
        mock_handoff_instance.secure_handoff = AsyncMock(return_value="evidence/profiles/secure_1.md")
        mock_tracker_instance.track_entity = AsyncMock(return_value={"topological_state": "verified"})
        
        gatherer = GovOSINTGatherer()
        # Override the mocked instances directly onto the gatherer to ensure strict async compatibility
        gatherer.tracker = mock_tracker_instance
        gatherer.handoff = mock_handoff_instance
        
        # Override the hansard records to return a mock list rapidly
        gatherer.gather_hansard_records = AsyncMock(return_value=[
            {"name": "Public Official Test", "payload": "Test findings"}
        ])

        # Execute
        await gatherer.execute_pipeline()
        
        # Verify calls occurred correctly establishing the required empirical handoff bridge
        gatherer.gather_hansard_records.assert_called_once()
        mock_tracker_instance.track_entity.assert_called()
        mock_handoff_instance.secure_handoff.assert_called()
        mock_handoff_instance.align_osint_telemetry.assert_called_once()
        
    @patch('gov_osint_gatherer.EmpiricalMagicHandoff')
    @patch('gov_osint_gatherer.MillennialFalconTracker')
    async def test_daemon_loop_exception_resilience(self, MockTracker, MockHandoff):
        """Phase 68/69 loop resilience test to ensure WebXR failures don't crash LIRIL ingestion."""
        gatherer = GovOSINTGatherer()
        
        # Force a failure inside the pipeline to test the try/except loop
        gatherer.execute_pipeline = AsyncMock(side_effect=Exception("Simulated OSINT Node Disconnect"))
        
        # We run the continuous task but cancel it after 1 poll iteration to verify it survived the try/except loop
        task = asyncio.create_task(gatherer.gather_continuous_telemetry(interval=0.01))
        await asyncio.sleep(0.05)
        task.cancel()
        
        # The test passes if it hasn't crashed before cancellation
        val = False
        try:
            await task
        except asyncio.CancelledError:
            val = True
            
        self.assertTrue(val, "Daemon loop failed to survive a pipeline exception gracefully.")

if __name__ == '__main__':
    unittest.main()
