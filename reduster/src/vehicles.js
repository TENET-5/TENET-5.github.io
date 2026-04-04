// vehicles.js — Driveable vehicles for Red Duster
// E key to enter/exit, WASD to drive, mouse to steer
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { STATE } from './state.js';

const VEHICLES = [];
let _playerInVehicle = null;
let _vehicleSpeed = 0;

const MAX_SPEED = 28;       // m/s (~100 km/h)
const ACCELERATION = 12;    // m/s^2
const BRAKE_FORCE = 20;     // m/s^2
const FRICTION = 4;          // m/s^2 passive deceleration
const TURN_SPEED = 1.8;     // rad/s at full speed
const ENTER_DISTANCE = 5;   // metres

// Vehicle types
const VEHICLE_TYPES = {
  pickup: {
    name: 'Pickup Truck',
    maxSpeed: 28,
    accel: 12,
    bodyColor: [0.15, 0.18, 0.14],  // military green
    length: 5.2,
    width: 2.1,
    height: 1.8,
    cabHeight: 1.4,
  },
  suv: {
    name: 'SUV',
    maxSpeed: 24,
    accel: 10,
    bodyColor: [0.08, 0.08, 0.1],  // dark grey
    length: 4.8,
    width: 2.0,
    height: 2.0,
    cabHeight: 1.6,
  },
  snowmobile: {
    name: 'Snowmobile',
    maxSpeed: 20,
    accel: 15,
    bodyColor: [0.6, 0.1, 0.05],  // red
    length: 2.8,
    width: 1.1,
    height: 1.0,
    cabHeight: 0.8,
  },
};

function _createVehicleMesh(scene, type, position) {
  const spec = VEHICLE_TYPES[type] || VEHICLE_TYPES.pickup;
  const root = new TransformNode(`vehicle_${type}_${VEHICLES.length}`, scene);
  root.position = position.clone();

  // Body
  const body = MeshBuilder.CreateBox('body', {
    width: spec.width, height: spec.cabHeight * 0.6, depth: spec.length,
  }, scene);
  body.position.y = spec.cabHeight * 0.4;
  body.parent = root;

  const bodyMat = new PBRMaterial('vehBody', scene);
  bodyMat.albedoColor = new Color3(...spec.bodyColor);
  bodyMat.roughness = 0.65;
  bodyMat.metallic = 0.3;
  body.material = bodyMat;

  // Cab (upper portion)
  const cab = MeshBuilder.CreateBox('cab', {
    width: spec.width * 0.85, height: spec.cabHeight * 0.45, depth: spec.length * 0.45,
  }, scene);
  cab.position.y = spec.cabHeight * 0.8;
  cab.position.z = -spec.length * 0.1;
  cab.parent = root;

  const cabMat = new PBRMaterial('vehCab', scene);
  cabMat.albedoColor = new Color3(0.1, 0.15, 0.2);
  cabMat.roughness = 0.3;
  cabMat.metallic = 0.1;
  cabMat.alpha = 0.7;  // windows
  cab.material = cabMat;

  // Wheels (4)
  for (let i = 0; i < 4; i++) {
    const wheel = MeshBuilder.CreateCylinder(`wheel${i}`, {
      diameter: 0.7, height: 0.3,
    }, scene);
    const wx = (i % 2 === 0 ? -1 : 1) * spec.width * 0.5;
    const wz = (i < 2 ? 1 : -1) * spec.length * 0.35;
    wheel.position = new Vector3(wx, 0.35, wz);
    wheel.rotation.z = Math.PI / 2;
    wheel.parent = root;

    const wheelMat = new PBRMaterial('wheelMat', scene);
    wheelMat.albedoColor = new Color3(0.05, 0.05, 0.05);
    wheelMat.roughness = 0.9;
    wheelMat.metallic = 0.1;
    wheel.material = wheelMat;
  }

  // Make body pickable for interaction
  body.isPickable = true;
  body.metadata = { type: 'vehicle', vehicleType: type, vehicleIndex: VEHICLES.length };

  return { root, body, spec, type };
}

export function spawnVehicles(scene, getHeight) {
  // Spawn vehicles at strategic locations around the map
  const spawns = [
    { type: 'pickup', x: 2050, z: 2050 },     // near player start
    { type: 'pickup', x: 1800, z: 1600 },     // road intersection
    { type: 'suv', x: 2300, z: 2400 },         // near camp
    { type: 'suv', x: 1500, z: 1800 },         // forest road
    { type: 'snowmobile', x: 2100, z: 1400 },  // northern area
    { type: 'snowmobile', x: 1700, z: 2500 },  // near lake
    { type: 'pickup', x: 2500, z: 1500 },      // eastern road
  ];

  for (const s of spawns) {
    const y = getHeight ? getHeight(s.x, s.z) + 0.1 : 8;
    const v = _createVehicleMesh(scene, s.type, new Vector3(s.x, y, s.z));
    v.velocity = 0;
    v.steer = 0;
    v.fuel = 100;
    VEHICLES.push(v);
  }
}

export function tryEnterVehicle(camera) {
  if (_playerInVehicle) {
    // Exit vehicle
    exitVehicle(camera);
    return;
  }

  // Find nearest vehicle
  for (const v of VEHICLES) {
    const dist = Vector3.Distance(camera.position, v.root.position);
    if (dist < ENTER_DISTANCE) {
      enterVehicle(v, camera);
      return;
    }
  }
}

function enterVehicle(vehicle, camera) {
  _playerInVehicle = vehicle;
  _vehicleSpeed = 0;
  STATE.inVehicle = true;
  STATE.vehicleType = vehicle.type;

  // Disable FPS camera controls
  camera.detachControl();

  // Position camera above vehicle (3rd person)
  const spec = vehicle.spec;
  camera.position = vehicle.root.position.clone();
  camera.position.y += spec.cabHeight + 2;
}

function exitVehicle(camera) {
  if (!_playerInVehicle) return;

  // Place player beside vehicle
  const v = _playerInVehicle;
  const exitOffset = new Vector3(v.spec.width + 1, 0, 0);
  camera.position = v.root.position.add(exitOffset);
  camera.position.y = v.root.position.y + 1.7;

  // Re-enable FPS controls
  const canvas = document.getElementById('renderCanvas') || document.querySelector('canvas');
  if (canvas) camera.attachControl(canvas, true);

  _playerInVehicle = null;
  _vehicleSpeed = 0;
  STATE.inVehicle = false;
  STATE.vehicleType = null;
}

export function updateVehicles(dt, camera, keys, getHeight) {
  if (!_playerInVehicle) return;

  const v = _playerInVehicle;
  const spec = v.spec;

  // Input
  const throttle = keys.w ? 1 : (keys.s ? -0.5 : 0);
  const steerInput = (keys.a ? -1 : 0) + (keys.d ? 1 : 0);

  // Acceleration / braking
  if (throttle > 0) {
    _vehicleSpeed = Math.min(spec.maxSpeed, _vehicleSpeed + spec.accel * throttle * dt);
  } else if (throttle < 0) {
    _vehicleSpeed = Math.max(-spec.maxSpeed * 0.3, _vehicleSpeed + spec.accel * throttle * dt);
  } else {
    // Friction
    if (_vehicleSpeed > 0) _vehicleSpeed = Math.max(0, _vehicleSpeed - FRICTION * dt);
    if (_vehicleSpeed < 0) _vehicleSpeed = Math.min(0, _vehicleSpeed + FRICTION * dt);
  }

  // Steering (speed-dependent)
  const speedFactor = Math.min(1, Math.abs(_vehicleSpeed) / 5);
  const turnRate = TURN_SPEED * steerInput * speedFactor * dt;
  v.root.rotation.y += turnRate;

  // Move vehicle
  const forward = new Vector3(
    Math.sin(v.root.rotation.y),
    0,
    Math.cos(v.root.rotation.y),
  );
  v.root.position.addInPlace(forward.scale(_vehicleSpeed * dt));

  // Terrain follow
  if (getHeight) {
    const groundY = getHeight(v.root.position.x, v.root.position.z) + 0.1;
    v.root.position.y += (groundY - v.root.position.y) * Math.min(dt * 8, 1);
  }

  // Camera follows vehicle (3rd person chase cam)
  const camOffset = forward.scale(-8).add(new Vector3(0, spec.cabHeight + 3, 0));
  const targetCamPos = v.root.position.add(camOffset);
  camera.position.addInPlace(targetCamPos.subtract(camera.position).scale(Math.min(dt * 5, 1)));
  camera.setTarget(v.root.position.add(new Vector3(0, spec.cabHeight, 0)));

  // Fuel drain
  v.fuel = Math.max(0, v.fuel - Math.abs(_vehicleSpeed) * 0.01 * dt);
  if (v.fuel <= 0) {
    _vehicleSpeed = Math.max(0, _vehicleSpeed - 10 * dt);
  }

  // Update STATE
  STATE.vehicleSpeed = Math.round(Math.abs(_vehicleSpeed) * 3.6); // km/h
  STATE.vehicleFuel = Math.round(v.fuel);
}

export function isInVehicle() {
  return !!_playerInVehicle;
}

export function getNearestVehicle(camera) {
  let nearest = null;
  let nearestDist = ENTER_DISTANCE;
  for (const v of VEHICLES) {
    const dist = Vector3.Distance(camera.position, v.root.position);
    if (dist < nearestDist) {
      nearest = v;
      nearestDist = dist;
    }
  }
  return nearest;
}
