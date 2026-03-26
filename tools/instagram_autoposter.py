"""
TENET-5 Instagram Auto-Poster
Uses Instagram Graph API (Meta Business Suite)
Reads captions from instagram-campaign.md and posts one per scheduled run.

SETUP REQUIRED:
1. Instagram account must be Professional (Business or Creator)
   Instagram app → Settings → Account → Switch to Professional Account
2. Connect to a Facebook Page at business.facebook.com
3. Create a Meta Developer App at developers.facebook.com
   - Add Instagram Graph API product
   - Generate a long-lived Page Access Token
4. Copy your Instagram Business Account ID and Access Token below
5. Run: pip install requests schedule pillow
6. Run: python instagram_autoposter.py

For automated daily posting, add to Windows Task Scheduler:
  Action: python E:\TENET-5.github.io\tools\instagram_autoposter.py --post-next
"""

import os
import re
import json
import time
import argparse
import requests
from datetime import datetime
from pathlib import Path

# ── CONFIGURATION ────────────────────────────────────────────────────────────
# Paste your credentials here OR set as environment variables
IG_ACCESS_TOKEN = os.environ.get("IG_ACCESS_TOKEN", "PASTE_YOUR_ACCESS_TOKEN_HERE")
IG_ACCOUNT_ID   = os.environ.get("IG_ACCOUNT_ID",   "PASTE_YOUR_IG_BUSINESS_ACCOUNT_ID_HERE")

# Which image to use for posts (must be a publicly accessible URL)
# tenet-5.github.io images work. Change per post or use a default.
DEFAULT_IMAGE_URL = "https://tenet-5.github.io/img/infographics/timeline_1080.png"

CAMPAIGN_FILE  = Path(__file__).parent.parent / "instagram-campaign.md"
PROGRESS_FILE  = Path(__file__).parent / "instagram_progress.json"
GRAPH_API_BASE = "https://graph.facebook.com/v19.0"

# ── PARSE CAMPAIGN FILE ───────────────────────────────────────────────────────

def load_posts():
    """Parse instagram-campaign.md into list of {title, caption, hashtags, source}"""
    text = CAMPAIGN_FILE.read_text(encoding="utf-8")
    posts = []
    blocks = re.split(r'\n---\n', text.strip())
    for block in blocks:
        block = block.strip()
        if not block or not block.startswith("POST #"):
            continue
        lines = block.split("\n")
        title_line = lines[0]  # POST #N — TOPIC
        # Collect caption lines (non-hashtag, non-source, non-dot lines)
        caption_lines = []
        hashtag_line  = ""
        source_line   = ""
        for line in lines[1:]:
            line = line.strip()
            if not line or line == ".":
                continue
            if line.startswith("#") or (line.startswith("[") and "hashtag" in line.lower()):
                hashtag_line = line
            elif line.lower().startswith("source:"):
                source_line = line
            else:
                caption_lines.append(line)

        caption = " ".join(caption_lines).strip()
        posts.append({
            "title":    title_line,
            "caption":  caption,
            "hashtags": hashtag_line,
            "source":   source_line,
            "full_text": f"{caption}\n.\n.\n.\n{hashtag_line}"
        })
    return posts


# ── PROGRESS TRACKING ─────────────────────────────────────────────────────────

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"posted": [], "last_post": None}

def save_progress(progress):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

def next_post_index(posts, progress):
    posted = set(progress.get("posted", []))
    for i, post in enumerate(posts):
        if post["title"] not in posted:
            return i
    return None  # all posted


# ── INSTAGRAM GRAPH API ───────────────────────────────────────────────────────

def create_media_container(caption: str, image_url: str) -> str:
    """Step 1: Create a media container. Returns container_id."""
    url = f"{GRAPH_API_BASE}/{IG_ACCOUNT_ID}/media"
    params = {
        "image_url":    image_url,
        "caption":      caption,
        "access_token": IG_ACCESS_TOKEN,
    }
    r = requests.post(url, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()
    if "id" not in data:
        raise RuntimeError(f"Container creation failed: {data}")
    return data["id"]

def wait_for_container(container_id: str, max_wait: int = 60):
    """Poll until container STATUS == FINISHED."""
    url = f"{GRAPH_API_BASE}/{container_id}"
    params = {"fields": "status_code", "access_token": IG_ACCESS_TOKEN}
    for _ in range(max_wait // 5):
        r = requests.get(url, params=params, timeout=10)
        status = r.json().get("status_code", "")
        if status == "FINISHED":
            return
        if status == "ERROR":
            raise RuntimeError(f"Container processing error for {container_id}")
        time.sleep(5)
    raise TimeoutError(f"Container {container_id} not ready after {max_wait}s")

def publish_container(container_id: str) -> str:
    """Step 2: Publish the container. Returns post_id."""
    url = f"{GRAPH_API_BASE}/{IG_ACCOUNT_ID}/media_publish"
    params = {
        "creation_id":  container_id,
        "access_token": IG_ACCESS_TOKEN,
    }
    r = requests.post(url, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()
    if "id" not in data:
        raise RuntimeError(f"Publish failed: {data}")
    return data["id"]

def post_to_instagram(caption: str, image_url: str = DEFAULT_IMAGE_URL) -> str:
    print(f"  → Creating media container...")
    container_id = create_media_container(caption, image_url)
    print(f"  → Container ID: {container_id}. Waiting for processing...")
    wait_for_container(container_id)
    print(f"  → Publishing...")
    post_id = publish_container(container_id)
    return post_id


# ── MAIN ──────────────────────────────────────────────────────────────────────

def cmd_post_next():
    """Post the next unposted item in the campaign."""
    if "PASTE_YOUR" in IG_ACCESS_TOKEN or "PASTE_YOUR" in IG_ACCOUNT_ID:
        print("\n❌ CREDENTIALS NOT SET")
        print("   Edit this file and set IG_ACCESS_TOKEN and IG_ACCOUNT_ID")
        print("   OR set environment variables:")
        print("   $env:IG_ACCESS_TOKEN = 'your_token'")
        print("   $env:IG_ACCOUNT_ID   = 'your_account_id'")
        print("\nSee SETUP instructions at the top of this file.\n")
        return

    posts    = load_posts()
    progress = load_progress()
    idx      = next_post_index(posts, progress)

    if idx is None:
        print("✅ All 30 campaign posts have been published!")
        return

    post = posts[idx]
    print(f"\n📸 Posting: {post['title']}")
    print(f"   Caption preview: {post['caption'][:80]}...")

    try:
        post_id = post_to_instagram(post["full_text"])
        progress["posted"].append(post["title"])
        progress["last_post"] = {
            "title":     post["title"],
            "post_id":   post_id,
            "timestamp": datetime.now().isoformat(),
        }
        save_progress(progress)
        print(f"\n✅ Posted successfully! Instagram post ID: {post_id}")
        remaining = len(posts) - len(progress["posted"])
        print(f"   {remaining} posts remaining in campaign.")
    except Exception as e:
        print(f"\n❌ Post failed: {e}")

def cmd_status():
    """Show campaign progress."""
    posts    = load_posts()
    progress = load_progress()
    posted   = set(progress.get("posted", []))
    print(f"\n📊 TENET-5 Instagram Campaign Status")
    print(f"   Total posts: {len(posts)}")
    print(f"   Posted:      {len(posted)}")
    print(f"   Remaining:   {len(posts) - len(posted)}")
    if progress.get("last_post"):
        lp = progress["last_post"]
        print(f"   Last post:   {lp['title']} @ {lp['timestamp']}")
    print()
    for i, post in enumerate(posts):
        status = "✅" if post["title"] in posted else "⏳"
        print(f"   {status} {post['title']}")

def cmd_setup_check():
    """Verify credentials and account access."""
    if "PASTE_YOUR" in IG_ACCESS_TOKEN:
        print("❌ IG_ACCESS_TOKEN not set")
        return
    url = f"{GRAPH_API_BASE}/{IG_ACCOUNT_ID}"
    params = {"fields": "id,username,name", "access_token": IG_ACCESS_TOKEN}
    try:
        r = requests.get(url, params=params, timeout=10)
        data = r.json()
        if "username" in data:
            print(f"✅ Connected to @{data['username']} (ID: {data['id']})")
        else:
            print(f"❌ Account check failed: {data}")
    except Exception as e:
        print(f"❌ Connection error: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TENET-5 Instagram Auto-Poster")
    parser.add_argument("--post-next",    action="store_true", help="Post next unposted campaign item")
    parser.add_argument("--status",       action="store_true", help="Show campaign progress")
    parser.add_argument("--setup-check",  action="store_true", help="Verify API credentials")
    args = parser.parse_args()

    if args.post_next:
        cmd_post_next()
    elif args.status:
        cmd_status()
    elif args.setup_check:
        cmd_setup_check()
    else:
        # Default: show status + instructions
        cmd_status()
        print("Usage:")
        print("  python instagram_autoposter.py --setup-check   # verify credentials")
        print("  python instagram_autoposter.py --post-next     # post next item")
        print("  python instagram_autoposter.py --status        # show progress")
        print()
        print("For daily auto-posting, add to Windows Task Scheduler:")
        print("  python E:\\TENET-5.github.io\\tools\\instagram_autoposter.py --post-next")
