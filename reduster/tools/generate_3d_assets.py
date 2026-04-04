#!/usr/bin/env python3
# Copyright (c) 2024-2026 Daniel Perry. All Rights Reserved.
# EOSL-2.0 | SYSTEM_SEED=118400
"""
Red Duster 3D Asset Generator — GPU-accelerated mesh generation.

Generates proper .glb models to replace procedural box/cylinder meshes.
Uses Shap-E (OpenAI) or TRELLIS for text-to-3D on dual RTX 5070 Ti.

Output: public/models/*.glb (loaded by src/models.js)

Usage:
    python tools/generate_3d_assets.py                    # generate all
    python tools/generate_3d_assets.py --asset weapon_c7a2  # single asset
    python tools/generate_3d_assets.py --list             # list all assets
    python tools/generate_3d_assets.py --status           # check what exists
"""
import argparse
import os
import sys
import json
from pathlib import Path

SEED = 118400
ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "public" / "models"

# ── Asset Definitions ────────────────────────────────────────────────────────
# Each asset: name, prompt for 3D generation, scale, rotation

ASSETS = {
    # Weapons (viewmodels)
    "weapon_c7a2": {
        "prompt": "A Canadian C7A2 military assault rifle, detailed 3D model, game asset, side view, clean geometry",
        "scale": 0.3,
        "category": "weapons",
    },
    "weapon_sks": {
        "prompt": "A Soviet SKS semi-automatic rifle, wooden stock, game asset, clean 3D model",
        "scale": 0.3,
        "category": "weapons",
    },
    "weapon_rem870": {
        "prompt": "A Remington 870 pump-action shotgun, game asset, clean 3D model",
        "scale": 0.3,
        "category": "weapons",
    },
    "weapon_glock17": {
        "prompt": "A Glock 17 9mm pistol, compact, game asset, clean 3D model",
        "scale": 0.2,
        "category": "weapons",
    },
    "weapon_ar15": {
        "prompt": "An AR-15 semi-automatic rifle with rail system, game asset, clean 3D model",
        "scale": 0.3,
        "category": "weapons",
    },
    "weapon_m14": {
        "prompt": "An M14 battle rifle, wooden stock, iron sights, game asset, clean 3D model",
        "scale": 0.3,
        "category": "weapons",
    },
    "weapon_leeenfield": {
        "prompt": "A Lee-Enfield No.4 bolt-action rifle, WWII era, wooden stock, game asset",
        "scale": 0.3,
        "category": "weapons",
    },

    # Vehicles
    "vehicle_pickup": {
        "prompt": "A rugged military pickup truck, olive drab, off-road tires, game asset, low poly",
        "scale": 1.0,
        "category": "vehicles",
    },
    "vehicle_suv": {
        "prompt": "A dark grey tactical SUV, armored, tinted windows, game asset, low poly",
        "scale": 1.0,
        "category": "vehicles",
    },
    "vehicle_snowmobile": {
        "prompt": "A red snowmobile, winter vehicle, skis and track, game asset, low poly",
        "scale": 0.8,
        "category": "vehicles",
    },

    # Environment — Trees
    "spruce_tree": {
        "prompt": "A Canadian black spruce tree, boreal forest, conical shape, game environment asset",
        "scale": 1.5,
        "category": "trees",
    },
    "jack_pine": {
        "prompt": "A jack pine tree, twisted branches, boreal forest, game environment asset",
        "scale": 1.5,
        "category": "trees",
    },
    "white_birch": {
        "prompt": "A white birch tree with papery bark, deciduous, game environment asset",
        "scale": 1.5,
        "category": "trees",
    },
    "balsam_fir": {
        "prompt": "A balsam fir tree, dense conical evergreen, boreal forest, game asset",
        "scale": 1.5,
        "category": "trees",
    },
    "dead_snag": {
        "prompt": "A dead standing tree, bare branches, no leaves, weathered bark, game asset",
        "scale": 1.2,
        "category": "trees",
    },

    # Buildings
    "cabin_small": {
        "prompt": "A small Canadian log cabin, pitched roof, one room, rustic, game environment",
        "scale": 1.0,
        "category": "buildings",
    },
    "cabin_large": {
        "prompt": "A large Canadian wooden cabin, two stories, porch, windows, game environment",
        "scale": 1.0,
        "category": "buildings",
    },
    "tent_military": {
        "prompt": "A military canvas tent, camouflage, army camp, game asset",
        "scale": 0.8,
        "category": "buildings",
    },
    "guard_tower": {
        "prompt": "A wooden guard tower, military outpost, elevated platform, game asset",
        "scale": 1.0,
        "category": "buildings",
    },
    "sandbag_wall": {
        "prompt": "A military sandbag wall fortification, defensive position, game asset",
        "scale": 0.5,
        "category": "buildings",
    },

    # Props
    "supply_crate": {
        "prompt": "A military wooden supply crate, ammo box, game prop",
        "scale": 0.4,
        "category": "props",
    },
    "campfire": {
        "prompt": "A campfire with stone ring and logs, outdoor fire pit, game prop",
        "scale": 0.3,
        "category": "props",
    },
    "sleeping_bag": {
        "prompt": "A rolled sleeping bag, camping gear, game prop",
        "scale": 0.3,
        "category": "props",
    },
    "rock_boulder": {
        "prompt": "A large granite boulder, Canadian Shield rock, rough texture, game prop",
        "scale": 1.0,
        "category": "props",
    },
    "rock_small": {
        "prompt": "A small river stone, smooth grey rock, game prop",
        "scale": 0.3,
        "category": "props",
    },

    # Soldier
    "soldier_template": {
        "prompt": "A communist soldier in uniform, standing pose, military gear, game character, low poly",
        "scale": 1.0,
        "category": "characters",
    },
}


def check_status():
    """Show which assets exist and which need generation."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    existing = {f.stem for f in MODELS_DIR.glob("*.glb")}

    print(f"Asset Status ({len(existing)}/{len(ASSETS)} generated)")
    print("=" * 60)

    for category in ["weapons", "vehicles", "trees", "buildings", "props", "characters"]:
        items = [(k, v) for k, v in ASSETS.items() if v["category"] == category]
        if items:
            print(f"\n  {category.upper()}:")
            for name, spec in items:
                status = "OK" if name in existing else "MISSING"
                size = ""
                if name in existing:
                    fpath = MODELS_DIR / f"{name}.glb"
                    size = f" ({fpath.stat().st_size // 1024}KB)"
                mark = "[+]" if name in existing else "[!]"
                print(f"    {mark} {name:25s} {status}{size}")

    print(f"\n  Total: {len(existing)}/{len(ASSETS)}")
    missing = len(ASSETS) - len(existing)
    if missing > 0:
        print(f"  Missing: {missing} assets need generation")
    else:
        print("  All assets generated!")


def generate_asset(name, spec):
    """Generate a single .glb asset using Shap-E on GPU."""
    import torch
    from diffusers import ShapEPipeline
    from diffusers.utils import export_to_ply

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = MODELS_DIR / f"{name}.glb"

    if out_path.exists():
        print(f"  [{name}] Already exists, skipping")
        return True

    print(f"  [{name}] Generating: {spec['prompt'][:60]}...")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32

    try:
        pipe = ShapEPipeline.from_pretrained("openai/shap-e", torch_dtype=dtype).to(device)

        images = pipe(
            spec["prompt"],
            guidance_scale=15.0,
            num_inference_steps=64,
            frame_size=256,
        ).images

        # Export to PLY then convert to GLB via trimesh
        ply_path = MODELS_DIR / f"{name}.ply"
        export_to_ply(images[0], str(ply_path))

        import trimesh
        mesh = trimesh.load(str(ply_path))

        # Apply scale
        mesh.apply_scale(spec.get("scale", 1.0))

        # Export as GLB
        mesh.export(str(out_path), file_type="glb")

        # Cleanup PLY
        ply_path.unlink(missing_ok=True)

        size_kb = out_path.stat().st_size // 1024
        print(f"  [{name}] Generated: {size_kb}KB")
        return True

    except Exception as e:
        print(f"  [{name}] FAILED: {e}")
        return False


def generate_all(category_filter=None):
    """Generate all missing assets."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    existing = {f.stem for f in MODELS_DIR.glob("*.glb")}
    missing = [(k, v) for k, v in ASSETS.items()
               if k not in existing and (not category_filter or v["category"] == category_filter)]

    if not missing:
        print("All assets already generated!")
        return

    print(f"Generating {len(missing)} missing assets on GPU...")
    success = 0
    for name, spec in missing:
        if generate_asset(name, spec):
            success += 1

    print(f"\nDone: {success}/{len(missing)} generated")


def main():
    parser = argparse.ArgumentParser(description="Red Duster 3D Asset Generator")
    parser.add_argument("--asset", type=str, help="Generate single asset by name")
    parser.add_argument("--category", type=str, help="Generate assets by category")
    parser.add_argument("--list", action="store_true", help="List all asset definitions")
    parser.add_argument("--status", action="store_true", help="Check generation status")
    args = parser.parse_args()

    if args.list:
        for name, spec in ASSETS.items():
            print(f"  {name:25s} [{spec['category']:10s}] {spec['prompt'][:60]}")
        return

    if args.status:
        check_status()
        return

    if args.asset:
        if args.asset not in ASSETS:
            print(f"Unknown asset: {args.asset}")
            print(f"Available: {', '.join(ASSETS.keys())}")
            return
        generate_asset(args.asset, ASSETS[args.asset])
        return

    generate_all(category_filter=args.category)


if __name__ == "__main__":
    main()
