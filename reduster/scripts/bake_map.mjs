import fs from 'fs';
import * as THREE from 'three';
global.window = { _THREE: THREE, speechSynthesis: {}, localStorage: { getItem:()=>null, setItem:()=>{} }, _chunkSize: 30, addEventListener: ()=>{} };
global.document = { createElement: () => ({ getContext: () => ({}), width: 0, height: 0, style:{} }), addEventListener: ()=>{} };
global.self = global.window;

const { getMapTile } = await import('../src/map.js');

console.log("Starting map bake... This may take a few minutes.");

const START_X = 3500;
const END_X = 6500;
const START_Z = 3500;
const END_Z = 7000;

const AF_START_X = 7200;
const AF_END_X = 7900;
const AF_START_Z = 2700;
const AF_END_Z = 3300;

const mapData = [];

function scanRegion(sx, ex, sz, ez) {
  for (let z = sz; z < ez; z++) {
    for (let x = sx; x < ex; x++) {
      const tile = getMapTile(x, z);
      if (tile > 0) { 
        mapData.push([x, z, tile]);
      }
    }
    if (z % 100 === 0) console.log(`Scanning Z: ${z}`);
  }
}

console.log("Scanning Town and Spawn corridor...");
scanRegion(START_X, END_X, START_Z, END_Z);

console.log("Scanning Airfield...");
scanRegion(AF_START_X, AF_END_X, AF_START_Z, AF_END_Z);

// Save as compressed JS literal or JSON array.
// JSON output
const outPath = './public/map_data.json';
console.log(`Baking complete! ${mapData.length} tiles baked. Saving to ${outPath}...`);
fs.writeFileSync(outPath, JSON.stringify(mapData));
console.log("Done!");
