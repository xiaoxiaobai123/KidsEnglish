"""
gen-u3-missing.py · 一次性补齐 Unit 3 缺失的插图

用法:
  python scripts/gen-u3-missing.py
  python scripts/gen-u3-missing.py --force   # 覆盖已有

走 Pollinations.ai (免费 Flux),无需 API Key。
"""
import argparse
import hashlib
import json
import pathlib
import sys
import time
from urllib.parse import quote

import requests

BASE = pathlib.Path(__file__).resolve().parent.parent
IMG_DIR = BASE / "audio" / "images"
VOCAB_DIR = IMG_DIR / "vocab"
VOCAB_DIR.mkdir(parents=True, exist_ok=True)

STYLE_SUFFIX = (
    "cute cartoon illustration for 1st grade english learning, "
    "flat color, thick black outline, pastel palette, plain white background, "
    "centered subject, no text, friendly and simple"
)

# Unit 3 缺失的插图 — 真题里被 quiz/vocab 引用,但 audio/images/vocab 里还没文件
MISSING = {
    # 核心词 (quiz 里的 q1_06 / q1_07 用)
    "u3_we":      "two cute kids standing side by side waving hello with big smiles, group of friends, cartoon",
    "u3_all":     "a group of four happy kids together holding hands in a circle, all of us, cartoon",
    "u3_yummy":   "a kid licking lips happily holding a plate of green peas, big smile, yummy face, cartoon",

    # 歌谣词 (vocab/词库屏 / 闪卡 / 真题里也可能拉)
    "r_u3_you":   "a single cartoon hand pointing forward at the viewer, you, cartoon",
    "r_u3_so":    "a kid raising both hands high in amazement with sparkles around, so wow, cartoon",
    "r_u3_to":    "a big right-pointing yellow arrow with a kid walking toward it, going to, cartoon",
}


def stable_seed(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16) % 1000000


def generate(prompt, out_path, *, seed=42, width=512, height=512, force=False, retries=5):
    if not force and out_path.exists() and out_path.stat().st_size > 1000:
        return "skip"
    full_prompt = f"{prompt}, {STYLE_SUFFIX}"
    url = (
        "https://image.pollinations.ai/prompt/"
        + quote(full_prompt)
        + f"?width={width}&height={height}&model=flux&nologo=true&seed={seed}"
    )
    for attempt in range(retries):
        try:
            r = requests.get(url, timeout=180)
            if r.status_code == 200 and len(r.content) > 1000:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_bytes(r.content)
                return "ok"
            if r.status_code == 429:
                wait = min(60, 5 * (attempt + 1))
                print(f"  [429] {out_path.name}: 限速,等 {wait}s")
                time.sleep(wait)
                continue
            print(f"  [HTTP {r.status_code}] {out_path.name}: try {attempt+1}/{retries}")
            time.sleep(3 + attempt * 3)
        except Exception as e:
            print(f"  [EXC] {out_path.name}: {e} (try {attempt+1}/{retries})")
            time.sleep(3 + attempt * 3)
    return "fail"


def update_manifest():
    manifest_path = IMG_DIR / "manifest.json"
    if not manifest_path.exists():
        return
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    sent_dir = IMG_DIR / "sentences"
    data["vocab"] = sorted([p.stem for p in VOCAB_DIR.glob("*.jpg")])
    data["sentences"] = sorted([p.stem for p in sent_dir.glob("*.jpg")])
    manifest_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[Manifest] vocab={len(data['vocab'])} sent={len(data['sentences'])}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    stats = {"ok": 0, "skip": 0, "fail": 0}
    for vid, prompt in MISSING.items():
        out = VOCAB_DIR / f"{vid}.jpg"
        r = generate(prompt, out, seed=stable_seed(vid), force=args.force)
        stats[r] = stats.get(r, 0) + 1
        print(f"  [{r:4s}] {vid}")

    print(f"\n[Done] ok={stats['ok']}  skip={stats['skip']}  fail={stats['fail']}")
    update_manifest()


if __name__ == "__main__":
    main()
