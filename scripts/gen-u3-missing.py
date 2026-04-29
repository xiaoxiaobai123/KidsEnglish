"""
gen-u3-missing.py · Generate missing U3 vocab images via Pollinations (free).
Falls back to MiniMax if Pollinations fails.
"""
import hashlib
import os
import pathlib
import sys
import time
from urllib.parse import quote

import requests

BASE = pathlib.Path(__file__).resolve().parent.parent
VOCAB_DIR = BASE / "audio" / "images" / "vocab"
SENT_DIR  = BASE / "audio" / "images" / "sentences"
VOCAB_DIR.mkdir(parents=True, exist_ok=True)
SENT_DIR.mkdir(parents=True, exist_ok=True)

STYLE = (
    "cute cartoon illustration for 1st grade english learning, "
    "flat color, thick black outline, pastel palette, plain white background, "
    "centered subject, no text, friendly and simple"
)

# U3 missing + mock-paper extras (concrete + safe for diffusion)
# vocab key -> (filename, prompt)
JOBS = [
    # Missing referenced by U3 真题 section 1
    ("vocab", "u3_we",        "two cheerful kids hugging side by side pointing to themselves, friendship, no text, cartoon"),
    ("vocab", "u3_all",       "a group of four diverse happy kids together holding hands, all together, no text, cartoon"),

    # Extra reusable assets for the two mock papers
    ("vocab", "u3_potato",    "a single brown round potato with sprouts, no text, cartoon"),
    ("vocab", "u3_tomato",    "a single shiny red tomato with green stem, no text, cartoon"),
    ("vocab", "u3_apple",     "a single red apple with green leaf, no text, cartoon"),

    # Mock paper sentence images
    ("sent",  "s_u3m1_01",    "a kid happily eating an orange carrot with a smile, plain background, cartoon"),
    ("sent",  "s_u3m1_02",    "a kid pushing away a white onion politely, no text, cartoon"),
    ("sent",  "s_u3m1_03",    "two kids sharing a plate of green peas happily, plain background, cartoon"),
    ("sent",  "s_u3m1_04",    "a family eating red bell peppers at dinner, plain background, cartoon"),
    ("sent",  "s_u3m1_05",    "a kid looking at three orange carrots on a plate, plain background, cartoon"),
    ("sent",  "s_u3m1_06",    "a smiling kid holding a green pea pod with hearts, no text, cartoon"),

    ("sent",  "s_u3m2_01",    "a kid with thumbs up next to red bell peppers, no text, cartoon"),
    ("sent",  "s_u3m2_02",    "two friends laughing both pointing at green peas, no text, cartoon"),
    ("sent",  "s_u3m2_03",    "a kid politely refusing a white onion with hand, plain background, cartoon"),
    ("sent",  "s_u3m2_04",    "a kid happily counting orange carrots one two three, no text, cartoon"),
    ("sent",  "s_u3m2_05",    "a smiling chef holding a basket of carrots peas onions and peppers, no text, cartoon"),
    ("sent",  "s_u3m2_06",    "a kid licking lips next to a sweet green pea, yummy, no text, cartoon"),
]


def load_env():
    env = {}
    p = BASE / ".env"
    if not p.exists():
        return env
    for line in p.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def stable_seed(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16) % 1000000


def gen_pollinations(prompt, out_path, retries=4):
    if out_path.exists() and out_path.stat().st_size > 1000:
        return "skip"
    full = f"{prompt}, {STYLE}"
    seed = stable_seed(out_path.stem)
    url = (
        "https://image.pollinations.ai/prompt/"
        + quote(full)
        + f"?width=512&height=512&model=flux&nologo=true&seed={seed}"
    )
    for attempt in range(retries):
        try:
            r = requests.get(url, timeout=120)
            if r.status_code == 200 and len(r.content) > 1000:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_bytes(r.content)
                return "ok"
            if r.status_code == 429:
                time.sleep(min(60, 5 * (attempt + 1)))
                continue
            time.sleep(3 + attempt * 3)
        except Exception as e:
            print(f"  [pollinations exc] {out_path.name}: {e}")
            time.sleep(3 + attempt * 3)
    return "fail"


def gen_minimax(prompt, out_path, env):
    if not env.get("MINIMAX_API_KEY"):
        return "fail"
    full = f"{prompt}, {STYLE}"
    base = env.get("MINIMAX_BASE_URL", "https://api.minimax.chat/v1").rstrip("/")
    url = f"{base}/image_generation"
    payload = {
        "model": "image-01",
        "prompt": full,
        "aspect_ratio": "1:1",
        "n": 1,
        "response_format": "url",
    }
    headers = {
        "Authorization": f"Bearer {env['MINIMAX_API_KEY']}",
        "Content-Type": "application/json",
    }
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        j = r.json()
        if j.get("base_resp", {}).get("status_code", -1) != 0:
            print(f"  [minimax fail] {out_path.name}: {j.get('base_resp', {}).get('status_msg')}")
            return "fail"
        urls = j.get("data", {}).get("image_urls") or []
        if not urls:
            return "fail"
        img = requests.get(urls[0], timeout=60)
        if img.status_code == 200 and len(img.content) > 1000:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(img.content)
            return "ok"
    except Exception as e:
        print(f"  [minimax exc] {out_path.name}: {e}")
    return "fail"


def main():
    env = load_env()
    stats = {"ok": 0, "fail": 0, "skip": 0}
    for kind, vid, prompt in JOBS:
        out = (VOCAB_DIR if kind == "vocab" else SENT_DIR) / f"{vid}.jpg"
        if out.exists() and out.stat().st_size > 1000:
            stats["skip"] += 1
            print(f"  skip {vid}")
            continue
        # Try Pollinations first (free)
        r = gen_pollinations(prompt, out)
        if r == "fail":
            r = gen_minimax(prompt, out, env)
        stats[r] = stats.get(r, 0) + 1
        print(f"  {r:4s} {kind}:{vid}")
        time.sleep(0.6)

    print(f"\n[done] ok={stats['ok']} fail={stats['fail']} skip={stats['skip']}")

    # Update manifest
    import json
    manifest_path = BASE / "audio" / "images" / "manifest.json"
    if manifest_path.exists():
        m = json.loads(manifest_path.read_text(encoding="utf-8"))
    else:
        m = {"provider": "mixed (pollinations + minimax)", "model": "flux / image-01", "style": STYLE}
    m["vocab"] = sorted(p.stem for p in VOCAB_DIR.glob("*.jpg"))
    m["sentences"] = sorted(p.stem for p in SENT_DIR.glob("*.jpg"))
    manifest_path.write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[manifest] vocab={len(m['vocab'])} sentences={len(m['sentences'])}")


if __name__ == "__main__":
    main()
