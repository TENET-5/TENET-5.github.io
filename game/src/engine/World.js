/**
 * RED DUSTER — World Builder
 * Creates the map: ground, buildings, cover objects.
 */
import { MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';

export class World {
  constructor(scene) {
    this.scene = scene;
    this._buildGround();
    this._buildBuildings();
    this._buildCover();
  }

  _buildGround() {
    const gnd = MeshBuilder.CreateGround('ground', { width: 200, height: 200 }, this.scene);
    const mat = new StandardMaterial('groundMat', this.scene);
    mat.diffuseColor = new Color3(0.16, 0.16, 0.14);
    mat.specularColor = Color3.Black();
    gnd.material = mat;
    gnd.receiveShadows = true;
  }

  _buildBuildings() {
    const mat = new StandardMaterial('wallMat', this.scene);
    mat.diffuseColor = new Color3(0.35, 0.2, 0.13);

    for (let gx = -3; gx <= 3; gx++) {
      for (let gz = -3; gz <= 3; gz++) {
        if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1) continue;
        if (Math.random() < 0.25) continue;
        const w = 6 + Math.random() * 10;
        const d = 6 + Math.random() * 10;
        const h = 3 + Math.random() * 8;
        const b = MeshBuilder.CreateBox(`bldg_${gx}_${gz}`, { width: w, height: h, depth: d }, this.scene);
        b.position = new Vector3(gx * 20 + (Math.random() - 0.5) * 4, h / 2, gz * 20 + (Math.random() - 0.5) * 4);
        b.material = mat;
      }
    }
  }

  _buildCover() {
    const mat = new StandardMaterial('coverMat', this.scene);
    mat.diffuseColor = new Color3(0.27, 0.27, 0.28);

    for (let i = 0; i < 40; i++) {
      const s = 0.8 + Math.random() * 2;
      const c = MeshBuilder.CreateBox(`cover_${i}`, { size: s }, this.scene);
      c.position = new Vector3((Math.random() - 0.5) * 80, s / 2, (Math.random() - 0.5) * 80);
      c.material = mat;
    }
  }
}
