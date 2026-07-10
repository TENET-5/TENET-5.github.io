/**
 * TENET5 - ABRACADABRA Voice-First Root
 * Simulates a quantum intelligence routing interface.
 */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('abra-input');
  const orb = document.getElementById('abra-orb');
  const status = document.getElementById('abra-status');
  
  // Hardcoded routes for demonstration of "abcxyz quantum pipelines"
  const routes = {
    'scorecard': 'data-science-dashboard.html',
    'accountability': 'data-science-dashboard.html',
    'news': 'data-science-dashboard.html',
    'dashboard': 'data-science-dashboard.html',
    'osint': 'data-science-dashboard.html#sec-osint',
    'cbc': 'cbc-social-amplification.html',
    'social': 'data-science-dashboard.html#sec-osint',
    'default': 'data-science-dashboard.html' // Fallback
  };

  input.addEventListener('focus', () => {
    orb.classList.add('listening');
    status.innerText = "LIRIL IS LISTENING...";
  });

  input.addEventListener('blur', () => {
    if(!orb.classList.contains('processing')) {
      orb.classList.remove('listening');
      status.innerText = "AWAITING COMMAND";
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = input.value.toLowerCase().trim();
      if (!query) return;

      // Transition to processing state
      input.blur();
      input.disabled = true;
      orb.classList.remove('listening');
      orb.classList.add('processing');
      
      status.innerText = "ANALYZING INTENT VIA PRISM OS...";

      // Determine route based on keywords
      let targetRoute = routes['default'];
      for (const [key, route] of Object.entries(routes)) {
        if (query.includes(key)) {
          targetRoute = route;
          break;
        }
      }

      // Simulate quantum pipeline delay + routing animation
      setTimeout(() => {
        status.innerText = `ROUTING TO TARGET DATA MODULE...`;
        
        // Flash animation via anime.js
        anime({
          targets: '.routing-flash',
          opacity: [0, 1],
          duration: 300,
          easing: 'easeInQuad',
          complete: () => {
            window.location.href = targetRoute;
          }
        });
      }, 1500);
    }
  });
});
