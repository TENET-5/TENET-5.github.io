/**
 * RED DUSTER — Player Controller
 * WASD movement, sprint, pointer lock mouse aim.
 */
import { Vector3 } from '@babylonjs/core';

export class Player {
  constructor(camera, state, canvas) {
    this.camera = camera;
    this.state = state;
    this.keys = { w: false, a: false, s: false, d: false, shift: false };
    this.mouseDown = false;

    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW') this.keys.w = true;
      if (e.code === 'KeyS') this.keys.s = true;
      if (e.code === 'KeyA') this.keys.a = true;
      if (e.code === 'KeyD') this.keys.d = true;
      if (e.code === 'ShiftLeft') this.keys.shift = true;
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW') this.keys.w = false;
      if (e.code === 'KeyS') this.keys.s = false;
      if (e.code === 'KeyA') this.keys.a = false;
      if (e.code === 'KeyD') this.keys.d = false;
      if (e.code === 'ShiftLeft') this.keys.shift = false;
    });
    document.addEventListener('mousedown', () => { this.mouseDown = true; });
    document.addEventListener('mouseup', () => { this.mouseDown = false; });
  }

  update(dt) {
    const speed = this.keys.shift ? 28 : 15;
    const fwd = this.camera.getDirection(Vector3.Forward());
    const right = this.camera.getDirection(Vector3.Right());
    const move = Vector3.Zero();

    if (this.keys.w) move.addInPlace(fwd.scale(speed * dt));
    if (this.keys.s) move.addInPlace(fwd.scale(-speed * dt));
    if (this.keys.d) move.addInPlace(right.scale(speed * dt));
    if (this.keys.a) move.addInPlace(right.scale(-speed * dt));

    this.camera.position.addInPlace(move);
    this.camera.position.y = 1.7;
    this.camera.position.x = Math.max(-95, Math.min(95, this.camera.position.x));
    this.camera.position.z = Math.max(-95, Math.min(95, this.camera.position.z));
  }
}
