"""
gen-coach-for-name.py · 为指定孩子名字生成一套 coach 音频

用法:
  python scripts/gen-coach-for-name.py --name Ethan
  python scripts/gen-coach-for-name.py --name Cory      # 默认 Cory 可不跑(是兜底)

输出:
  audio/coach/<cid>_<lowercasename>.mp3

覆盖逻辑:
  app.js 根据 STATE.settings.childName 选对应后缀音频,fallback 到无后缀
"""
import argparse
import hashlib
import os
import pathlib
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

BASE = pathlib.Path(__file__).resolve().parent.parent
COACH_DIR = BASE / "audio" / "coach"


def load_env():
    env = {}
    env_path = BASE / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    for k in ["MINIMAX_API_KEY", "MINIMAX_BASE_URL", "MINIMAX_MODEL", "MINIMAX_VOICE_ID", "MINIMAX_GROUP_ID"]:
        if os.environ.get(k):
            env[k] = os.environ[k]
    env.setdefault("MINIMAX_BASE_URL", "https://api.minimax.chat/v1")
    env.setdefault("MINIMAX_MODEL", "speech-2.8-hd")
    env.setdefault("MINIMAX_VOICE_ID", "English_magnetic_voiced_man")
    return env


def extract_coach_lines(path):
    """抽取 en 台词,去重。"""
    content = pathlib.Path(path).read_text(encoding='utf-8')
    rx = re.compile(r'\ben:\s*"([^"]+)"')
    lines = rx.findall(content)
    seen, uniq = set(), []
    for l in lines:
        if l not in seen:
            seen.add(l)
            uniq.append(l)
    return uniq


def line_id(text):
    h = hashlib.md5(text.encode('utf-8')).hexdigest()[:10]
    return f"c_{h}"


def gen_one(text, out_path, cfg, retries=4):
    if out_path.exists() and out_path.stat().st_size > 500:
        return "skip"
    url = f"{cfg['MINIMAX_BASE_URL']}/t2a_v2"
    if cfg.get("MINIMAX_GROUP_ID"):
        url += f"?GroupId={cfg['MINIMAX_GROUP_ID']}"
    headers = {
        "Authorization": f"Bearer {cfg['MINIMAX_API_KEY']}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": cfg["MINIMAX_MODEL"],
        "text": text,
        "voice_setting": {
            "voice_id": cfg["MINIMAX_VOICE_ID"],
            "speed": 1.0, "pitch": 0, "vol": 1.0, "emotion": "happy",
        },
        "audio_setting": {
            "sample_rate": 32000, "bitrate": 128000, "format": "mp3", "channel": 1,
        },
    }
    for attempt in range(retries):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=30)
            j = r.json()
            base = j.get("base_resp", {})
            msg = base.get("status_msg", "")
            if base.get("status_code") != 0:
                if "rate limit" in msg.lower() or "rpm" in msg.lower():
                    time.sleep(min(30, 2 ** (attempt + 1)))
                    continue
                if attempt == retries - 1:
                    return f"fail: {msg}"
                time.sleep(1 + attempt)
                continue
            audio = j.get("data", {}).get("audio")
            if not audio:
                return "fail: no data"
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(bytes.fromhex(audio))
            return "ok"
        except Exception as e:
            if attempt == retries - 1:
                return f"exc: {e}"
            time.sleep(1 + attempt)
    return "fail"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True, help="孩子的英文名(如 Ethan)")
    ap.add_argument("--coach-name", default="Cat", help="教练名(默认 Cat)")
    ap.add_argument("--concurrency", type=int, default=4)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    cfg = load_env()
    if not cfg.get("MINIMAX_API_KEY"):
        print("[ERROR] MINIMAX_API_KEY 未配置")
        sys.exit(1)

    name = args.name
    suffix = name.lower()
    # Cory 是默认,无后缀
    is_default = (suffix == "cory")

    lines = extract_coach_lines(BASE / "data-coach.js")
    print(f"[Plan] {len(lines)} 条 coach 台词 · 烘焙名字 '{name}' · 后缀 {'无(默认覆盖)' if is_default else '_' + suffix}")

    COACH_DIR.mkdir(parents=True, exist_ok=True)
    tasks = []
    for raw in lines:
        cid = line_id(raw)
        # 替换占位符
        text = raw.replace("{name}", name).replace("{coach}", args.coach_name)
        text = re.sub(r'\{\w+\}', '', text).strip()
        if not text:
            continue
        fname = f"{cid}.mp3" if is_default else f"{cid}_{suffix}.mp3"
        out = COACH_DIR / fname
        if out.exists() and out.stat().st_size > 500 and not args.force:
            tasks.append(("skip", cid, text, out))
            continue
        tasks.append(("gen", cid, text, out))

    print(f"[Work] {sum(1 for t in tasks if t[0]=='gen')} 生成 · {sum(1 for t in tasks if t[0]=='skip')} 已跳过")

    stats = {"ok": 0, "skip": 0, "fail": 0}
    with ThreadPoolExecutor(max_workers=args.concurrency) as ex:
        futures = {}
        for action, cid, text, out in tasks:
            if action == "skip":
                stats["skip"] += 1
                continue
            futures[ex.submit(gen_one, text, out, cfg)] = (cid, text)
        done = 0
        for fut in as_completed(futures):
            cid, text = futures[fut]
            r = fut.result()
            if r == "ok": stats["ok"] += 1
            elif r == "skip": stats["skip"] += 1
            else: stats["fail"] += 1
            done += 1
            if done % 15 == 0 or done == len(futures):
                print(f"  [{done}/{len(futures)}] ok={stats['ok']} skip={stats['skip']} fail={stats['fail']}")

    print(f"\n[Done] ok={stats['ok']}  skip={stats['skip']}  fail={stats['fail']}")


if __name__ == "__main__":
    main()
