/**
 * RED DUSTER — Main Entry Point
 * TENET5 Studios — Babylon.js Engine
 */
import { Game } from './engine/Game.js';

const game = new Game('renderCanvas');

document.getElementById('play-btn').addEventListener('click', () => {
  document.getElementById('splash').style.display = 'none';
  game.start();
});
