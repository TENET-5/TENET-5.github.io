/**
 * ABRACADABRA CORE
 * Handles the generative UI, visualizer, and mock transcription.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('audio-visualizer');
  const ctx = canvas.getContext('2d');
  const transcriptionText = document.getElementById('transcription-text');
  const lirilStatus = document.getElementById('liril-status-text');
  const genCanvas = document.getElementById('gen-canvas');
  
  const btnSpeak = document.getElementById('sim-speak');
  const btnGenerate = document.getElementById('sim-generate');

  // Resize Canvas
  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Visualizer State
  let isSpeaking = false;
  let time = 0;

  function drawVisualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerY = canvas.height / 2;
    const segments = 120;
    const spacing = canvas.width / segments;

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let i = 0; i <= segments; i++) {
      const x = i * spacing;
      
      // Calculate amplitude
      let amplitude = 2; // Idle state
      if (isSpeaking) {
        // Create chaotic but smooth waveforms when speaking
        const noise = Math.sin(i * 0.5 + time) * Math.cos(i * 0.2 - time * 1.5);
        const centerFocus = Math.sin((i / segments) * Math.PI); // Stronger in middle
        amplitude = 2 + (noise * 40 * centerFocus);
      } else {
        // Gentle breathing idle
        amplitude = 2 + Math.sin(i * 0.1 + time * 0.5) * 4;
      }

      const y = centerY + amplitude;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mirror line for depth
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    for (let i = 0; i <= segments; i++) {
      const x = i * spacing;
      let amplitude = 2;
      if (isSpeaking) {
        const noise = Math.sin(i * 0.5 + time) * Math.cos(i * 0.2 - time * 1.5);
        const centerFocus = Math.sin((i / segments) * Math.PI);
        amplitude = 2 + (noise * 40 * centerFocus);
      } else {
        amplitude = 2 + Math.sin(i * 0.1 + time * 0.5) * 4;
      }
      ctx.lineTo(x, centerY - amplitude);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    time += 0.1;
    requestAnimationFrame(drawVisualizer);
  }

  // Start loop
  drawVisualizer();

  // Typing Effect
  function typeWriter(text, element, speed = 30) {
    element.innerHTML = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // Simulations
  btnSpeak.addEventListener('click', () => {
    isSpeaking = true;
    lirilStatus.textContent = 'LIRIL: PROCESSING VOICE';
    typeWriter("Generate a new data visualization component for the PRISM OS pipeline.", transcriptionText, 40);
    
    setTimeout(() => {
      isSpeaking = false;
      lirilStatus.textContent = 'LIRIL: MATERIALIZING';
      transcriptionText.innerHTML = '<span style="color: var(--slate-ink-dim)">Command received. Materializing output...</span>';
    }, 3000);
  });

  btnGenerate.addEventListener('click', () => {
    // Remove intro if exists
    const intro = document.querySelector('.canvas-intro');
    if (intro) intro.remove();

    const artifact = document.createElement('div');
    artifact.className = 'generated-artifact';
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    
    artifact.innerHTML = `
      <div class="artifact-header">
        <span>[SYS.GEN] // PRISM_DATAVIZ_COMPONENT</span>
        <span>T+${timestamp}</span>
      </div>
      <div class="artifact-content">
&lt;div class="data-viz-container"&gt;
  &lt;svg viewBox="0 0 100 50" class="quantum-sparkline"&gt;
    &lt;path d="M0,25 Q10,5 20,25 T40,25 T60,10 T80,30 T100,20" 
          stroke="var(--slate-ink)" fill="none" stroke-width="2"/&gt;
  &lt;/svg&gt;
&lt;/div&gt;

// Artifact materialized successfully via LIRIL generative pipeline.
// Ready for integration.
      </div>
    `;
    
    genCanvas.appendChild(artifact);
    
    // Auto scroll to bottom
    genCanvas.scrollTop = genCanvas.scrollHeight;
    
    lirilStatus.textContent = 'LIRIL: LISTENING';
    transcriptionText.innerHTML = 'Speak to materialize...';
  });

});
