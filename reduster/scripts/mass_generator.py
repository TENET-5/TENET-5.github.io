import os
import glob
import requests
import base64
import time

ARTIFACT_DIR = r"C:\Users\Xbxac\.gemini\antigravity\brain\628484d6-368e-4031-8b67-b2258997b147"
OUTPUT_DIR = r"E:\TENET-5.github.io\reduster\models"
TRELLIS_API = "http://localhost:8190/generate"

TARGET_ASSETS = [
    "boreal_pine_tree",
    "canadian_canoe",
    "combat_atv",
    "enemy_infantry",
    "wood_cottage",
    "morel_mushroom",
    "fiddleheads",
    "wild_leeks",
    "wild_blueberries",
    "moose"
]

def find_latest_image(prefix):
    matches = glob.glob(os.path.join(ARTIFACT_DIR, f"{prefix}*.png"))
    if not matches:
        return None
    return sorted(matches, key=os.path.getmtime, reverse=True)[0]

def generate_3d_asset(prefix):
    image_path = find_latest_image(prefix)
    if not image_path:
        print(f"[-] Skipping {prefix}: No 2D image found.")
        return

    print(f"\n[+] Processing {prefix}...")
    print(f"    Source: {os.path.basename(image_path)}")

    try:
        print(f"    Submitting job to TRELLIS API...")
        
        start_time = time.time()
        with open(image_path, "rb") as f:
            files = {"image": (os.path.basename(image_path), f, "image/png")}
            resp = requests.post(TRELLIS_API, files=files, timeout=300)
            
        resp.raise_for_status()
        
        data = resp.json()
        if "vertices" in data and data["vertices"] == 0:
            print(f"    [!] Warning: Trellis generated 0 vertices. (Check Trellis NATS/CUDA processing!)")
        
        # Download the specific binary result
        mesh_path = data.get("mesh_path")
        if not mesh_path:
            print(f"    [!] Failure: No mesh_path returned by Trellis.")
            return
            
        filename = data.get("filename", f"{prefix}.glb")
        save_path = os.path.join(OUTPUT_DIR, f"{prefix}.glb")
        
        # Fetch the binary content over the secondary /download endpoint or direct payload if inline
        binary_url = f"http://localhost:8190/download?filename={filename}"
        dl_resp = requests.get(binary_url)
        dl_resp.raise_for_status()
        
        with open(save_path, "wb") as f:
            f.write(dl_resp.content)
            
        size_kb = len(dl_resp.content) / 1024
        print(f"    [✓] Success! Saved to {save_path} ({size_kb:.2f} KB) - {time.time() - start_time:.1f}s")
    except Exception as e:
        print(f"    [X] Error generating {prefix}: {e}")

def main():
    print(f"--- TRELLIS MASS GENERATOR ---")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for asset in TARGET_ASSETS:
        generate_3d_asset(asset)
        
    print("\n--- ALL TASKS COMPLETE ---")

if __name__ == "__main__":
    main()
