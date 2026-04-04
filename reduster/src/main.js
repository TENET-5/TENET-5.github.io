/**
 * RED DUSTER — Main Entry Point
 * Babylon.js 9 open-world survival
 */
console.log('[RedDuster] main.js loaded');

import { startGame } from './engine.js';

const canvas  = document.getElementById('gameCanvas');
const menu    = document.getElementById('mainMenu');
const loading = document.getElementById('loadingOverlay');
const loadBar = document.getElementById('loadBar');

document.getElementById('btnSurvive').addEventListener('click', async () => {
  console.log('[RedDuster] SURVIVE clicked');
  menu.style.display = 'none';
  loading.style.display = 'flex';
  loadBar.style.width = '10%';

  try {
    const game = await startGame(canvas, (p) => {
      loadBar.style.width = `${10 + p * 90}%`;
    });
    console.log('[RedDuster] Game started successfully');

    loading.style.display = 'none';
    document.getElementById('hud').style.display = 'block';

    canvas.addEventListener('click', () => {
      if (!document.pointerLockElement) canvas.requestPointerLock();
    });
    canvas.requestPointerLock();
  } catch (err) {
    console.error('[RedDuster] FATAL:', err);
    loading.querySelector('.loading-text').textContent = 'FAILED: ' + err.message;
  }
});

document.getElementById('btnHost').addEventListener('click', () => {
  document.getElementById('btnSurvive').click();
});
document.getElementById('btnJoin').addEventListener('click', () => {
  document.getElementById('btnSurvive').click();
});
