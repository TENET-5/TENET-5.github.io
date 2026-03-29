/**
 * RED DUSTER — Game Engine Core
 * Manages scene, camera, render loop, input, and game state.
 */
import { Engine, Scene, Vector3, Color3, UniversalCamera, HemisphericLight, DirectionalLight, PointLight, MeshBuilder, StandardMaterial, Matrix } from '@babylonjs/core';
import { World } from './World.js';
import { Player } from './Player.js';
import { EnemyManager } from './EnemyManager.js';
import { HUD } from '../ui/HUD.js';
import { Audio } from './Audio.js';

export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);
    this.state = {
      hp: 100, ammo: 30, maxAmmo: 30, kills: 0, wave: 0,
      alive: true, reloading: false, lastShot: 0
    };
    this.hud = new HUD(this.state);
    this.audio = new Audio();

    window.addEventListener('resize', () => this.engine.resize());
  }

  start() {
    this._setupScene();
    this._setupCamera();
    this._setupLighting();

    this.world = new World(this.scene);
    this.player = new Player(this.camera, this.state, this.canvas);
    this.enemyManager = new EnemyManager(this.scene, this.state);

    this.canvas.requestPointerLock();
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && this.state.alive) {
        document.getElementById('splash').style.display = 'flex';
      }
    });

    this._setupInput();
    this._nextWave();

    let regen = 0;
    this.engine.runRenderLoop(() => {
      if (!this.state.alive) { this.scene.render(); return; }
      const dt = this.engine.getDeltaTime() / 1000;

      this.player.update(dt);
      this.enemyManager.update(dt, this.camera.position);

      // Enemy shooting
      this.enemyManager.tryShootPlayer(this.camera.position, (dmg) => {
        this.state.hp -= dmg;
        regen = 0;
        this.hud.flashDamage();
        this.hud.update();
        if (this.state.hp <= 0) this._die();
      });

      // Auto fire
      if (this.player.mouseDown) this._shoot();

      // Health regen
      regen += dt;
      if (regen > 3 && this.state.hp < 100) {
        this.state.hp = Math.min(100, this.state.hp + 5 * dt);
        this.hud.update();
      }

      this.enemyManager.updateGibs(dt);
      this.scene.render();
    });
  }

  _setupScene() {
    this.scene.clearColor = new Color3(0.03, 0.03, 0.06);
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.012;
    this.scene.fogColor = new Color3(0.03, 0.03, 0.06);
  }

  _setupCamera() {
    this.camera = new UniversalCamera('cam', new Vector3(0, 1.7, 0), this.scene);
    this.camera.minZ = 0.1;
    this.camera.fov = 1.2;
    this.camera.attachControl(this.canvas, true);
    this.camera.speed = 0;
    this.camera.angularSensibility = 3000;
  }

  _setupLighting() {
    new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene).intensity = 0.6;
    const sun = new DirectionalLight('sun', new Vector3(-1, -2, -1), this.scene);
    sun.intensity = 0.8;
    // Fire lights
    for (let i = 0; i < 6; i++) {
      const pl = new PointLight(`fire${i}`, new Vector3((Math.random() - 0.5) * 80, 5, (Math.random() - 0.5) * 80), this.scene);
      pl.diffuse = new Color3(1, 0.15, 0);
      pl.intensity = 3;
      pl.range = 25;
    }
  }

  _setupInput() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR' && !this.state.reloading && this.state.ammo < this.state.maxAmmo) {
        this._reload();
      }
    });
    document.addEventListener('mousedown', () => this._shoot());
  }

  _shoot() {
    if (!this.state.alive || this.state.reloading || this.state.ammo <= 0) return;
    const now = Date.now();
    if (now - this.state.lastShot < 100) return;
    this.state.lastShot = now;
    this.state.ammo--;
    this.audio.play('shoot');

    const ray = this.scene.createPickingRay(
      this.engine.getRenderWidth() / 2,
      this.engine.getRenderHeight() / 2,
      Matrix.Identity(), this.camera
    );

    const result = this.enemyManager.raycast(ray);
    if (result.hit) {
      result.enemy.hp -= result.headshot ? 100 : 35;
      this.audio.play('hit');
      this.hud.showHitMarker(result.headshot);
      if (result.enemy.hp <= 0) {
        this.enemyManager.kill(result.enemy);
        this.state.kills++;
        this.audio.play('die');
        if (this.enemyManager.enemies.length === 0) {
          setTimeout(() => this._nextWave(), 2000);
        }
      }
    }
    this.hud.update();
  }

  _reload() {
    this.state.reloading = true;
    this.hud.showReloading(true);
    setTimeout(() => {
      this.state.ammo = this.state.maxAmmo;
      this.state.reloading = false;
      this.hud.showReloading(false);
      this.hud.update();
    }, 2000);
  }

  _nextWave() {
    this.state.wave++;
    const count = Math.min(30, 5 + this.state.wave * 3);
    this.enemyManager.spawnWave(count);
    this.hud.update();
  }

  _die() {
    this.state.alive = false;
    document.getElementById('death-screen').style.display = 'flex';
    document.getElementById('death-stats').textContent = `Wave ${this.state.wave} | Kills: ${this.state.kills}`;
    document.exitPointerLock();
  }
}
