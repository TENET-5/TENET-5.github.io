import os
import argparse
import torch
from diffusers import ShapEPipeline
from diffusers.utils import export_to_ply
import trimesh

# Red Duster AAA Procedural Generation Toolkit
# By default, runs locally using Diffusers 'openai/shap-e' model
# GPU memory requirement: ~10GB VRAM

PROMPTS = {
    "spruce_tree": "A low-poly Canadian spruce tree or pine tree suitable for a video game nature environment.",
    "maple_tree": "A lush, leafy deciduous maple tree with a wooden trunk, stylized for a game environment.",
    "dead_tree": "A withered dead tree with bare branches and no leaves, a desolate piece of nature.",
    "rock_boulder": "A massive, heavy gray stone boulder with a rough detailed surface.",
    "rock_small": "A smaller grey rock, smooth surface river stone.",
    "house_bungalow": "A classic 1960s Canadian residential bungalow house, simple boxy architecture.",
}

def generate_local(batch=False):
    print("[Shap-E Local GPU] Initializing model 'openai/shap-e'...")
    # Initialize ShapEPipeline from huggingface via diffusers
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[Shap-E Local GPU] Running on device: {device}")
    
    ckpt_id = "openai/shap-e"
    # Fallback to fp32 if the hardware doesn't support fp16 constraints
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    pipe = ShapEPipeline.from_pretrained(ckpt_id, torch_dtype=dtype).to(device)

    # Output directory
    out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "models")
    os.makedirs(out_dir, exist_ok=True)
    
    keys_to_run = list(PROMPTS.keys()) if batch else [list(PROMPTS.keys())[0]]

    for name in keys_to_run:
        prompt = PROMPTS[name]
        out_path = os.path.join(out_dir, f"{name}.glb")
        temp_ply = os.path.join(out_dir, f"{name}.ply")
        
        # Don't regenerate if already present (protects batch performance across runs)
        if os.path.exists(out_path):
            print(f"[Shap-E Local GPU] Skipping {name}, already exists at {out_path}")
            continue
            
        print(f"[Shap-E Local GPU] Generating '{name}': {prompt}")
        
        # Generate point cloud/mesh representations
        # Using 64 guidance scale and 4 steps is standard for ShapE but 
        # higher steps yields slightly more coherent game assets
        images = pipe(prompt, guidance_scale=15.0, num_inference_steps=64, frame_size=256, output_type="mesh").images
        
        mesh = images[0]
        export_to_ply(mesh, temp_ply)
        
        # Convert PLY to GLB for Babylon.js via trimesh
        # Babylon supports .glb natively using SceneLoader
        print(f"   --> Processing mesh geometry for Babylon...")
        try:
            mesh_data = trimesh.load(temp_ply)
            mesh_data.export(out_path, file_type='glb')
            print(f"   --> Successfully stored Asset: {out_path}")
            os.remove(temp_ply)
        except Exception as e:
            print(f"   --> Error converting to GLB: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--local", action="store_true", help="Force local GPU generation")
    parser.add_argument("--batch", action="store_true", help="Generate all assets in prompt list")
    args = parser.parse_args()

    # The user mandated local GPU execution
    generate_local(batch=args.batch)
