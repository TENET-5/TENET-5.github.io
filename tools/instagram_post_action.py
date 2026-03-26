"""
TENET-5 Instagram Campaign — GitHub Actions Auto-Poster
Runs daily via .github/workflows/instagram-campaign.yml
Tracks posted items in tools/instagram_progress.json (committed to repo)

SETUP (one-time, takes ~15 minutes):
======================================
Step 1 — Make @lirilclaw a Professional account
  Instagram app → Settings → Account → Switch to Professional Account → Creator

Step 2 — Link to a Facebook Page
  Facebook → Pages → Create a Page (or use existing)
  Instagram Settings → Linked Accounts → Facebook → connect

Step 3 — Create Meta Developer App
  1. Go to: https://developers.facebook.com/apps/creation/
  2. Choose "Business" app type
  3. Add product: "Instagram Graph API"
  4. Under Instagram Graph API → Getting Started:
     - Connect your Instagram account
     - Copy your Instagram Account ID (looks like: 17841400000000000)

Step 4 — Generate Access Token
  1. Go to: https://developers.facebook.com/tools/explorer/
  2. Select your app
  3. Click "Generate Access Token"
  4. Add permissions: instagram_basic, instagram_content_publish, pages_show_list
  5. Click "Generate Access Token" and authorize
  6. To make it long-lived (60 days), run:
     curl -i -X GET "https://graph.facebook.com/oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id={APP_ID}
       &client_secret={APP_SECRET}
       &fb_exchange_token={SHORT_TOKEN}"

Step 5 — Add secrets to GitHub
  1. Go to: https://github.com/TENET-5/TENET-5.github.io/settings/secrets/actions
  2. Click "New repository secret"
  3. Add: IG_ACCESS_TOKEN = (your long-lived token)
  4. Add: IG_ACCOUNT_ID   = (your Instagram account ID number)

That's it. The workflow runs automatically every day at 9 AM Eastern.
To test: go to Actions tab → "Instagram Campaign" → "Run workflow"
"""

import os
import re
import json
import time
import sys
import requests
from pathlib import Path

# ── CONFIG ───────────────────────────────────────────────────────────────────
IG_ACCESS_TOKEN   = os.environ.get("IG_ACCESS_TOKEN", "")
IG_ACCOUNT_ID     = os.environ.get("IG_ACCOUNT_ID", "")
FORCE_POST_NUMBER = os.environ.get("FORCE_POST_NUMBER", "").strip()

CAMPAIGN_FILE  = Path(__file__).parent.parent / "instagram-campaign.md"
PROGRESS_FILE  = Path(__file__).parent / "instagram_progress.json"
GRAPH_API      = "https://graph.facebook.com/v19.0"

# Rotate through existing 1080px infographic images (confirmed live on site)
# Instagram Graph API requires a publicly accessible image URL
INFOGRAPHIC_IMAGES = [
    "https://tenet-5.github.io/img/infographics/timeline_1080.png",
    "https://tenet-5.github.io/img/infographics/scorecard_1080.png",
    "https://tenet-5.github.io/img/infographics/charges_1080.png",
    "https://tenet-5.github.io/img/infographics/maid_1080.png",
    "https://tenet-5.github.io/img/infographics/quote_1080.png",
]

def get_image_for_post(post_number: int) -> str:
    """Cycle through infographics so posts don't all look the same."""
    return INFOGRAPHIC_IMAGES[(post_number - 1) % len(INFOGRAPHIC_IMAGES)]

# ── PARSE CAPTIONS ───────────────────────────────────────────────────────────

def load_posts():
    """Parse instagram-campaign.md → list of caption strings."""
    text = CAMPAIGN_FILE.read_text(encoding="utf-8")
    posts = []
    # Split on --- separators
    raw_blocks = re.split(r'\n---\n', text)
    for block in raw_blocks:
        block = block.strip()
        lines = block.split('\n')
        # Find POST # header line
        header_idx = None
        for i, line in enumerate(lines):
            if re.match(r'POST #\d+', line.strip()):
                header_idx = i
                break
        if header_idx is None:
            continue

        title = lines[header_idx].strip()
        # Collect body: everything after title, stopping at [Source:...] line
        body_lines = []
        source_line = ""
        for line in lines[header_idx + 1:]:
            if line.strip().startswith('[Source:'):
                source_line = line.strip().strip('[]')
            else:
                body_lines.append(line)

        # Build caption — join body, add source as first comment hint
        caption_text = '\n'.join(body_lines).strip()
        # Remove leading/trailing dots (placeholder spacing)
        caption_text = re.sub(r'^\.\s*\n', '', caption_text, flags=re.MULTILINE)

        posts.append({
            "number": len(posts) + 1,
            "title":  title,
            "caption": caption_text,
            "source": source_line,
        })
    return posts


# ── PROGRESS ─────────────────────────────────────────────────────────────────

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"posted_numbers": [], "log": []}

def save_progress(progress):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2, ensure_ascii=False))
    print(f"✅ Progress saved to {PROGRESS_FILE}")

def next_post(posts, progress):
    posted = set(progress.get("posted_numbers", []))
    for post in posts:
        if post["number"] not in posted:
            return post
    return None


# ── INSTAGRAM API ─────────────────────────────────────────────────────────────

def api_get(path, params=None):
    p = {"access_token": IG_ACCESS_TOKEN}
    if params:
        p.update(params)
    r = requests.get(f"{GRAPH_API}/{path}", params=p, timeout=30)
    return r.json()

def create_container(caption: str, image_url: str) -> str:
    """Step 1: Create media container."""
    r = requests.post(
        f"{GRAPH_API}/{IG_ACCOUNT_ID}/media",
        params={
            "image_url":    image_url,
            "caption":      caption,
            "access_token": IG_ACCESS_TOKEN,
        },
        timeout=30
    )
    data = r.json()
    if "id" not in data:
        raise RuntimeError(f"Container creation failed: {data}")
    return data["id"]

def wait_container(container_id: str, max_wait=90):
    """Poll until container status == FINISHED."""
    url    = f"{GRAPH_API}/{container_id}"
    params = {"fields": "status_code,status", "access_token": IG_ACCESS_TOKEN}
    for attempt in range(max_wait // 5):
        r      = requests.get(url, params=params, timeout=10)
        data   = r.json()
        status = data.get("status_code", "UNKNOWN")
        print(f"  Container status ({attempt * 5}s): {status}")
        if status == "FINISHED":
            return
        if status == "ERROR":
            raise RuntimeError(f"Container error: {data.get('status', data)}")
        time.sleep(5)
    raise TimeoutError(f"Container not ready after {max_wait}s")

def publish_container(container_id: str) -> str:
    """Step 2: Publish the container."""
    r = requests.post(
        f"{GRAPH_API}/{IG_ACCOUNT_ID}/media_publish",
        params={
            "creation_id":  container_id,
            "access_token": IG_ACCESS_TOKEN,
        },
        timeout=30
    )
    data = r.json()
    if "id" not in data:
        raise RuntimeError(f"Publish failed: {data}")
    return data["id"]

def verify_credentials():
    """Check token and account before attempting to post."""
    if not IG_ACCESS_TOKEN or not IG_ACCOUNT_ID:
        print("❌ CREDENTIALS NOT SET")
        print()
        print("Add these GitHub Secrets at:")
        print("https://github.com/TENET-5/TENET-5.github.io/settings/secrets/actions")
        print()
        print("  IG_ACCESS_TOKEN  — your Meta/Instagram long-lived page access token")
        print("  IG_ACCOUNT_ID    — your Instagram Business/Creator account ID")
        print()
        print("See full setup instructions at the top of this file.")
        sys.exit(1)

    data = api_get(IG_ACCOUNT_ID, {"fields": "id,username,account_type"})
    if "username" in data:
        print(f"✅ Authenticated as @{data['username']} ({data.get('account_type', '?')})")
        return True
    else:
        print(f"❌ Auth failed: {data}")
        sys.exit(1)


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("TENET-5 Instagram Campaign — Auto-Poster")
    print("=" * 60)

    verify_credentials()

    posts    = load_posts()
    progress = load_progress()
    posted   = set(progress.get("posted_numbers", []))

    print(f"\n📊 Campaign status: {len(posted)}/{len(posts)} posted")

    # Determine which post to send
    if FORCE_POST_NUMBER:
        target_num = int(FORCE_POST_NUMBER)
        post = next((p for p in posts if p["number"] == target_num), None)
        if not post:
            print(f"❌ Post #{target_num} not found")
            sys.exit(1)
        print(f"🔄 Force-posting: {post['title']}")
    else:
        post = next_post(posts, progress)
        if not post:
            print("🎉 All campaign posts have been published!")
            sys.exit(0)
        print(f"\n📸 Next post: {post['title']}")

    caption = post["caption"]
    print(f"\n--- CAPTION PREVIEW ---")
    print(caption[:200] + ("..." if len(caption) > 200 else ""))
    print("-----------------------\n")

    # Post to Instagram
    image_url = get_image_for_post(post["number"])
    print(f"  → Creating media container (image: {image_url})")
    try:
        container_id = create_container(caption, image_url)
        print(f"  → Container ID: {container_id}")
        wait_container(container_id)
        print(f"  → Publishing...")
        post_id = publish_container(container_id)
        print(f"\n✅ POSTED! Instagram post ID: {post_id}")

        # Save progress
        if post["number"] not in progress["posted_numbers"]:
            progress["posted_numbers"].append(post["number"])
        progress.setdefault("log", []).append({
            "post_number": post["number"],
            "title":       post["title"],
            "post_id":     post_id,
            "timestamp":   __import__("datetime").datetime.utcnow().isoformat() + "Z",
        })
        save_progress(progress)

        remaining = len(posts) - len(progress["posted_numbers"])
        print(f"   {remaining} posts remaining in campaign.")

    except Exception as e:
        print(f"\n❌ Failed: {e}")
        print("\nCommon fixes:")
        print("  - Token expired: regenerate at developers.facebook.com/tools/explorer")
        print("  - Account not Professional: Instagram → Settings → Account → Switch to Professional")
        print("  - Image URL not accessible: ensure tenet-5.github.io/img/og-image.jpg exists")
        sys.exit(1)


if __name__ == "__main__":
    main()
