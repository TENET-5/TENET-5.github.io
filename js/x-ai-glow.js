/**
 * x.ai inspired glow effect and glassy navigation tracker
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Create the global moving halo
  const halo = document.createElement('div');
  halo.className = 'x-halo';
  document.body.appendChild(halo);

  // 2. Track mouse globally and update CSS variables
  document.addEventListener('mousemove', (e) => {
    // Update the radial gradient positions for any styled component
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    
    // Move the actual halo element
    halo.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
});
