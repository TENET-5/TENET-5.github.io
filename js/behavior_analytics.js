/**
 * Phase 57: Real-Time User Behavior Analytics 
 * TENET5 Disinformation & Bot Mitigation Telemetry
 */
(function() {
  'use strict';

  // Base configuration
  const CONFIG = {
    SCORE_MAX: 100,
    SCORE_MIN: 0,
    TRUST_THRESHOLD: 40,
    TELEMETRY_ENDPOINT: 'http://127.0.0.1:18091/liril_agent',
    TICK_MS: 3000
  };

  class BehaviorAnalytics {
    constructor() {
      this.trustScore = 100;
      this.eventLog = [];
      this.lastPosition = { x: 0, y: 0 };
      this.clickCount = 0;
      this.initTime = Date.now();
      
      this.bindListeners();
      this.startHeartbeat();
    }

    bindListeners() {
      document.addEventListener('mousemove', this.trackVelocity.bind(this), { passive: true });
      document.addEventListener('click', this.trackClicks.bind(this), { passive: true });
      document.addEventListener('scroll', this.trackScroll.bind(this), { passive: true });
    }

    trackVelocity(e) {
      if (!this.lastPosition.x && !this.lastPosition.y) {
        this.lastPosition = { x: e.clientX, y: e.clientY };
        return;
      }
      
      const dx = e.clientX - this.lastPosition.x;
      const dy = e.clientY - this.lastPosition.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      
      this.lastPosition = { x: e.clientX, y: e.clientY };
      
      // Punish inhuman instantaneous velocities
      if (velocity > 1500) {
        this.applyPenalty(25, 'Erratic Velocity Detected [Bot Signature]');
      } else if (velocity > 0) {
        this.reward(1); // Human drift micro-reward
      }
    }

    trackClicks(e) {
      const now = Date.now();
      this.clickCount++;
      
      // Clear rapid click burst tracker
      if (!this.lastClickTick || (now - this.lastClickTick > 1000)) {
        this.lastClickTick = now;
        this.burstCount = 1;
      } else {
        this.burstCount++;
      }

      if (this.burstCount > 5) {
        this.applyPenalty(40, 'Rapid DOM Manipulation [Bot Signature]');
      }
    }

    trackScroll(e) {
      this.reward(0.5); // Natural human scrolling heals the trust score slightly
    }

    applyPenalty(amount, reason) {
      this.trustScore = Math.max(CONFIG.SCORE_MIN, this.trustScore - amount);
      this.logEvent(`PENALTY: -${amount} [${reason}] -> New Score: ${this.trustScore}`);
      this.evaluateBounds();
    }

    reward(amount) {
      this.trustScore = Math.min(CONFIG.SCORE_MAX, this.trustScore + amount);
    }

    logEvent(msg) {
      const ts = new Date().toISOString();
      const payload = `[${ts}] ${msg}`;
      this.eventLog.push(payload);
      
      // Limit memory structure
      if (this.eventLog.length > 50) this.eventLog.shift();
    }

    evaluateBounds() {
      if (this.trustScore < CONFIG.TRUST_THRESHOLD) {
        document.body.classList.add('trust-lock');
        console.warn('TENET5 STRUCTURAL LOCK: Trust Score critically low. UI parameters restricting.');
        
        // Dynamic DOM structural limitation (Locking sensitive canvases)
        const radar = document.getElementById('phase56-radar');
        if (radar) radar.style.filter = 'grayscale(100%) blur(4px)';
        const canvas = document.querySelector('.canvas-container');
        if (canvas) canvas.style.pointerEvents = 'none';
      }
    }

    async startHeartbeat() {
      setInterval(async () => {
        try {
          const payload = {
            matrix: 'SATOR',
            agent: 'NEMOCLAW_FRONTEND',
            action: 'telemetry_heartbeat',
            vector: {
              session_duration_ms: Date.now() - this.initTime,
              trust_score: this.trustScore,
              clicks: this.clickCount,
              logs: this.eventLog
            }
          };

          const resp = await fetch(CONFIG.TELEMETRY_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors' // Do not await structural blocks on front-end
          });
        } catch (err) {
          // Silent local failure, NATS telemetry skips
        }
      }, CONFIG.TICK_MS);
    }
  }

  // Initialize
  window.TENET5_Analytics = new BehaviorAnalytics();
})();
