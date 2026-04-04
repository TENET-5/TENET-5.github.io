"""
generate_textures.py — Red Duster AAA texture generation pipeline
Generates:
  1. ORM packed textures (R=AO, G=Roughness, B=Metallic) for all PBR materials
  2. Terrain mix/control texture (RGBA splat weights: grass/dirt/rock/unused)
  3. Concrete & asphalt ORM textures

Run: python scripts/generate_textures.py
Output: public/textures/*.png (ORM maps + terrain_mix.png)
"""

import os, math, struct, random
import numpy as np
import cupy as cp
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'textures')
SIZE = 1024  # ORM texture resolution
MIX_SIZE = 512  # Terrain blend map resolution (lower is fine — it's a control map)

# ─────────────────────────────────────────────────────────────────────────────
# Noise utilities (GPU accelerated via CuPy)
# ─────────────────────────────────────────────────────────────────────────────
rng = cp.random.default_rng(42)

def _hash2(x, y):
    h = cp.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return h - cp.floor(h)

def smooth_noise(size, scale=0.1, seed=0):
    """Tileable smooth noise via bilinear interpolation over hash grid."""
    xs = cp.linspace(0, scale * size, size, endpoint=False) + seed
    ys = cp.linspace(0, scale * size, size, endpoint=False) + seed
    X, Y = cp.meshgrid(xs, ys)
    ix, iy = cp.floor(X).astype(int), cp.floor(Y).astype(int)
    fx, fy = X - ix, Y - iy
    sx = fx * fx * (3 - 2 * fx)
    sy = fy * fy * (3 - 2 * fy)
    a = _hash2(ix, iy); b = _hash2(ix+1, iy)
    c = _hash2(ix, iy+1); d = _hash2(ix+1, iy+1)
    return a + (b-a)*sx + (c-a)*sy + (a-b-c+d)*sx*sy

def fbm(size, octaves=5, scale=0.05, seed=0):
    out = cp.zeros((size, size), dtype=cp.float32)
    amp, freq = 0.5, 1.0
    for i in range(octaves):
        out += amp * smooth_noise(size, scale * freq, seed + i * 17.3)
        amp *= 0.5; freq *= 2.0
    return cp.clip(out, 0, 1)

def save_orm(name, ao, roughness, metallic):
    """Pack AO(R), Roughness(G), Metallic(B) into a single PNG."""
    r = cp.clip(ao * 255, 0, 255).astype(cp.uint8)
    g = cp.clip(roughness * 255, 0, 255).astype(cp.uint8)
    b = cp.clip(metallic * 255, 0, 255).astype(cp.uint8)
    img_data = cp.asnumpy(cp.stack([r, g, b], axis=2))
    img = Image.fromarray(img_data, 'RGB')
    path = os.path.join(OUT, f'{name}_orm.png')
    img.save(path)
    print(f'  [✓] {name}_orm.png  ({SIZE}x{SIZE}) [GPU]')

# ─────────────────────────────────────────────────────────────────────────────
# ORM TEXTURE DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────

def generate_grass_orm():
    """Grass: high AO in recesses, high roughness, zero metallic."""
    ao = 0.65 + fbm(SIZE, octaves=4, scale=0.08, seed=1) * 0.35   # 0.65–1.0
    rough = 0.88 + fbm(SIZE, octaves=3, scale=0.12, seed=2) * 0.10  # 0.88–0.98
    metal = cp.zeros((SIZE, SIZE), dtype=cp.float32)
    # Add darker patches (packed dirt between grass blades)
    dirt_patches = fbm(SIZE, octaves=2, scale=0.04, seed=3)
    ao = ao * (0.8 + dirt_patches * 0.2)
    save_orm('grass', ao, rough, metal)

def generate_rock_orm():
    """Rock: strong AO variation (cracks), very high roughness, tiny metallic (mineral)."""
    ao = 0.45 + fbm(SIZE, octaves=5, scale=0.1, seed=10) * 0.55     # 0.45–1.0
    rough = 0.85 + fbm(SIZE, octaves=3, scale=0.15, seed=11) * 0.15  # 0.85–1.0
    # Tiny metallic specks (pyrite minerals in Canadian Shield granite)
    metal = cp.clip(fbm(SIZE, octaves=2, scale=0.2, seed=12) - 0.75, 0, 1) * 0.15
    save_orm('rock', ao, rough, metal)

def generate_dirt_orm():
    """Dirt: even AO, very high roughness, zero metallic."""
    ao = 0.75 + fbm(SIZE, octaves=4, scale=0.06, seed=20) * 0.25   # 0.75–1.0
    rough = 0.93 + fbm(SIZE, octaves=2, scale=0.08, seed=21) * 0.07  # 0.93–1.0
    metal = cp.zeros((SIZE, SIZE), dtype=cp.float32)
    save_orm('dirt', ao, rough, metal)

def generate_bark_orm():
    """Tree bark: strong crevice AO, very high roughness, zero metallic."""
    # Bark AO — vertical ridges
    ridge = cp.abs(cp.sin(cp.arange(SIZE) * 0.4)) 
    ridge = cp.tile(ridge, (SIZE, 1)).T  # Horizontal ridges
    ao = 0.5 + ridge * 0.25 + fbm(SIZE, octaves=3, scale=0.1, seed=30) * 0.25
    ao = cp.clip(ao, 0, 1)
    rough = 0.90 + fbm(SIZE, octaves=2, scale=0.12, seed=31) * 0.08
    metal = cp.zeros((SIZE, SIZE), dtype=cp.float32)
    save_orm('bark', ao, rough, metal)

def generate_asphalt_orm():
    """Asphalt: high AO (aggregate bumps), medium-high roughness, near-zero metallic."""
    ao = 0.70 + fbm(SIZE, octaves=5, scale=0.15, seed=40) * 0.30   # 0.70–1.0
    rough = 0.78 + fbm(SIZE, octaves=3, scale=0.10, seed=41) * 0.17  # 0.78–0.95
    # Tiny metallic from aggregate stone
    metal = cp.clip(fbm(SIZE, octaves=3, scale=0.25, seed=42) - 0.8, 0, 1) * 0.05
    save_orm('asphalt', ao, rough, metal)

def generate_concrete_orm():
    """Concrete: varied AO (pores/cracks), medium roughness, zero metallic."""
    ao = 0.60 + fbm(SIZE, octaves=5, scale=0.09, seed=50) * 0.40   # 0.60–1.0
    # Concrete roughness varies — smooth cast vs weathered
    rough = 0.72 + fbm(SIZE, octaves=3, scale=0.07, seed=51) * 0.23  # 0.72–0.95
    metal = cp.zeros((SIZE, SIZE), dtype=cp.float32)
    save_orm('concrete', ao, rough, metal)

def generate_leaf_orm():
    """Leaf/foliage: high AO from leaf layering, medium roughness, near-zero metallic."""
    ao = 0.60 + fbm(SIZE, octaves=4, scale=0.1, seed=60) * 0.40
    rough = 0.70 + fbm(SIZE, octaves=2, scale=0.08, seed=61) * 0.20  # 0.70–0.90 (slightly glossy)
    metal = cp.zeros((SIZE, SIZE), dtype=cp.float32)
    save_orm('leaf', ao, rough, metal)

# ─────────────────────────────────────────────────────────────────────────────
# TERRAIN MIX TEXTURE (RGBA control map for 3-layer splatting)
# Channels: R=grass weight, G=dirt weight, B=rock weight, A=unused
#
# Logic mirrors getHeight() from world.js
# ─────────────────────────────────────────────────────────────────────────────
def generate_terrain_mix():
    S = MIX_SIZE
    WORLD_SIZE = 2000.0

    # Replicate world.js hash + noise in cupy for consistency
    def h2(x, y):
        v = cp.sin(x * 12.9898 + y * 78.233) * 43758.5453
        return v - cp.floor(v)

    def smooth(t): return t * t * (3 - 2 * t)

    def noise2d(X, Y):
        ix = cp.floor(X).astype(cp.float32); iy = cp.floor(Y).astype(cp.float32)
        fx = X - ix; fy = Y - iy
        sx = smooth(fx); sy = smooth(fy)
        a = h2(ix, iy); b = h2(ix+1, iy)
        c = h2(ix, iy+1); d = h2(ix+1, iy+1)
        return a + (b-a)*sx + (c-a)*sy + (a-b-c+d)*sx*sy

    def fbm2d(X, Y, oct=5):
        v = cp.zeros_like(X); a = 0.5; f = 1.0
        for _ in range(oct):
            v += a * noise2d(X * f, Y * f); a *= 0.5; f *= 2.0
        return v

    # World-space coordinates for each texel
    xi = cp.linspace(0, WORLD_SIZE, S, endpoint=False)
    zi = cp.linspace(0, WORLD_SIZE, S, endpoint=False)
    X, Z = cp.meshgrid(xi, zi)

    # Height (simplified — matches world.js getHeight structure)
    shield = fbm2d(X*0.001, Z*0.001, 5) * 45
    drumlin = fbm2d(X*0.004, Z*0.002, 4) * 15
    outcrop = fbm2d(X*0.015, Z*0.015, 4) * 5
    micro = fbm2d(X*0.06, Z*0.06, 3) * 0.8
    river_dist = cp.abs(Z - 1000 - cp.sin(X*0.002)*200 - cp.sin(X*0.005)*80)
    river = cp.maximum(0, 1 - river_dist/60) * 16
    bog_base = fbm2d(X*0.003, Z*0.003, 3)
    bog_depth = cp.where(bog_base < 0.35, (0.35 - bog_base) * 20, 0)
    height = shield + drumlin + outcrop + micro - river - bog_depth

    # Slope (finite difference)
    dh = 2.0  # 2m step
    hx = fbm2d((X+dh)*0.001, Z*0.001, 5)*45 + fbm2d((X+dh)*0.004, Z*0.002, 4)*15
    hz = fbm2d(X*0.001, (Z+dh)*0.001, 5)*45 + fbm2d(X*0.004, (Z+dh)*0.002, 4)*15
    slope = (cp.abs(height - hx) + cp.abs(height - hz)) / dh

    # Wetness (from bog logic)
    wetness = cp.clip((0.35 - bog_base) / 0.35, 0, 1)

    # ── Derive blend weights ──
    rock_weight = cp.clip((slope - 2.5) / 2.0, 0, 1)  # Steep → rock
    # High peaks also get rock
    rock_weight = cp.maximum(rock_weight, cp.clip((height - 22) / 10, 0, 1))

    dirt_weight = cp.clip(wetness * 1.5, 0, 1) * (1 - rock_weight)
    # Also dirt around rivers
    river_dirt = cp.clip((1 - river_dist / 30) * 0.8, 0, 1)
    dirt_weight = cp.maximum(dirt_weight, river_dirt * (1 - rock_weight))

    grass_weight = cp.maximum(0, 1 - rock_weight - dirt_weight)

    # Normalize (always sum to 1)
    total = grass_weight + dirt_weight + rock_weight + 1e-6
    grass_weight /= total
    dirt_weight  /= total
    rock_weight  /= total

    # Add micro-variation to prevent hard edges
    jitter = fbm2d(X * 0.05, Z * 0.05, 3) * 0.08
    grass_weight = cp.clip(grass_weight + jitter - 0.04, 0, 1)
    dirt_weight  = cp.clip(dirt_weight  + jitter - 0.04, 0, 1)
    rock_weight  = cp.clip(rock_weight  + jitter - 0.04, 0, 1)
    # Re-normalize
    total = grass_weight + dirt_weight + rock_weight + 1e-6
    grass_weight /= total; dirt_weight /= total; rock_weight /= total

    r = (grass_weight * 255).astype(cp.uint8)
    g = (dirt_weight  * 255).astype(cp.uint8)
    b = (rock_weight  * 255).astype(cp.uint8)
    a = cp.zeros((S, S), dtype=cp.uint8)

    img_data = cp.asnumpy(cp.stack([r, g, b, a], axis=2))
    img = Image.fromarray(img_data, 'RGBA')
    path = os.path.join(OUT, 'terrain_mix.png')
    img.save(path)
    print(f'  [✓] terrain_mix.png  ({S}x{S}) [GPU]')

# ─────────────────────────────────────────────────────────────────────────────
def main():
    os.makedirs(OUT, exist_ok=True)
    print(f'\\n[Red Duster] Generating GPU-Accelerated PBR textures → {os.path.abspath(OUT)}\\n')
    generate_grass_orm()
    generate_rock_orm()
    generate_dirt_orm()
    generate_bark_orm()
    generate_asphalt_orm()
    generate_concrete_orm()
    generate_leaf_orm()
    print()
    print('[Red Duster] Generating terrain mix/control GPU texture...')
    generate_terrain_mix()
    print('\\n[✓] All textures generated by ABCXYZ hardware renderer.')

if __name__ == '__main__':
    main()
