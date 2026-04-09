/**
 * RED DUSTER — Telemetry Bridge
 * Links biological survival and combat chronometry strictly into the TENET-5 ABCXYZ Empirical Magic Handoff local hub!
 */

const TELEMETRY_ENDPOINT = 'http://127.0.0.1:8091/api/telemetry';

// Transient cache tracking dropped telemetry packets if node is locally restarting
const _offlineCache = [];
let _networkStable = true;

export async function transmitSatorEvent(eventName, payloadStr) {
  const packet = {
    event: eventName,
    payload: `[Pos: ${Math.round(window._px || 0)}, ${Math.round(window._pz || 0)}] ` + payloadStr,
    timestamp: (Date.now() / 1000).toString(),
  };

  try {
    const res = await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
      mode: 'cors'
    });

    if (!res.ok) throw new Error('Telemetry TCP response strictly negative.');

    _networkStable = true;
    
    // Purge cached queues upon reconnect sequence
    if (_offlineCache.length > 0) {
      console.log(`[STARK] Flushing ${_offlineCache.length} queued SATOR traces into Empirical Hub...`);
      let oldEvent = _offlineCache.shift();
      while(oldEvent) {
         transmitSatorEvent(oldEvent.event, oldEvent.payloadStr);
         oldEvent = _offlineCache.shift();
      }
    }
    
  } catch (err) {
    if (_networkStable) {
      console.warn('[ABORT] Empirical Magic Handoff server offline. Caching stream data locally.');
      _networkStable = false; // Prevent log spam
    }
    _offlineCache.push({ event: eventName, payloadStr: payloadStr });
  }
}

/**
 * Fetch the latest cross-engine save file chronometry from the SATOR ABCXYZ hub.
 * This ensures parity between Godot and Web Native versions.
 */
export async function fetchSatorState() {
  try {
    const res = await fetch('http://127.0.0.1:8091/api/save', {
      method: 'GET',
      mode: 'cors'
    });
    if (!res.ok) throw new Error('SATOR Save endpoint unreachable.');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[STARK] SATOR Hub Save Sync offline, defaulting to localStorage parity.');
    return null;
  }
}
