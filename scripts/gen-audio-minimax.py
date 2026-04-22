"""
gen-audio-minimax.py · 用 MiniMax Speech API 批量生成 MP3

环境变量（从 .env 读）：
  MINIMAX_API_KEY     · 必填
  MINIMAX_BASE_URL    · 默认 https://api.minimax.chat/v1
  MINIMAX_MODEL       · 默认 speech-2.8-hd
  MINIMAX_VOICE_ID    · 默认 English_magnetic_voiced_man
  MINIMAX_GROUP_ID    · 可选（某些账户需要）

用法：
  python scripts/gen-audio-minimax.py                   # 跳过已有文件（增量）
  python scripts/gen-audio-minimax.py --force           # 全部重新生成
  python scripts/gen-audio-minimax.py --only sentences  # 只生成句子

产出：
  audio/sentences/*.mp3
  audio/vocab/*.mp3
  audio/coach/*.mp3
  audio/manifest.json
"""
import argparse
import hashlib
import json
import os
import pathlib
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

# ========== 配置 ==========
BASE = pathlib.Path(__file__).resolve().parent.parent
AUDIO_DIR = BASE / "audio"


def load_env():
    env_path = BASE / ".env"
    cfg = {}
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            cfg[k.strip()] = v.strip()
    # 环境变量可覆盖
    for k in ["MINIMAX_API_KEY", "MINIMAX_BASE_URL", "MINIMAX_MODEL", "MINIMAX_VOICE_ID", "MINIMAX_GROUP_ID"]:
        if os.environ.get(k):
            cfg[k] = os.environ[k]
    cfg.setdefault("MINIMAX_BASE_URL", "https://api.minimax.chat/v1")
    cfg.setdefault("MINIMAX_MODEL", "speech-2.8-hd")
    cfg.setdefault("MINIMAX_VOICE_ID", "English_magnetic_voiced_man")
    return cfg


CFG = load_env()


# ========== 数据抽取（同 edge-tts 脚本） ==========
def extract_pairs(js_path, id_field="id", text_field="en"):
    content = pathlib.Path(js_path).read_text(encoding="utf-8")
    id_rx = re.compile(rf"\b{id_field}:\s*['\"]([^'\"]+)['\"]")
    en_rx = re.compile(rf"\b{text_field}:\s*\"([^\"]+)\"")
    ids = id_rx.findall(content)
    ens = en_rx.findall(content)
    n = min(len(ids), len(ens))
    return list(zip(ids[:n], ens[:n]))


def extract_alphabet(vocab_path):
    content = pathlib.Path(vocab_path).read_text(encoding="utf-8")
    m = re.search(r"alphabet:\s*\[([\s\S]*?)\n\s*\]", content)
    if not m:
        return []
    block = m.group(1)
    ids = re.findall(r"\bid:\s*['\"]([^'\"]+)['\"]", block)
    letters = re.findall(r"\bletter:\s*\"([^\"]+)\"", block)
    examples = re.findall(r"\bexample:\s*\"([^\"]+)\"", block)
    n = min(len(ids), len(letters), len(examples))
    result = []
    for i in range(n):
        big = letters[i][0] if letters[i] else "A"
        text = f"{big}. {big} is for {examples[i]}."
        result.append((ids[i], text))
    return result


def extract_coach_lines(coach_path):
    content = pathlib.Path(coach_path).read_text(encoding="utf-8")
    lines = re.findall(r"\ben:\s*\"([^\"]+)\"", content)
    seen, unique = set(), []
    for l in lines:
        if l not in seen:
            seen.add(l)
            unique.append(l)
    return unique


def line_id(text):
    h = hashlib.md5(text.encode("utf-8")).hexdigest()[:10]
    return f"c_{h}"


# ========== MiniMax API ==========
def gen_one(text, out_path, *, speed=1.0, pitch=0, retries=5):
    """调用 MiniMax,返回 'ok' / 'skip' / 'fail'。遇 RPM 限速自动退避重试。"""
    if out_path.exists() and out_path.stat().st_size > 500:
        return "skip"

    clean = text.replace("{name}", "Cory").replace("{coach}", "Cat")
    clean = re.sub(r"\{\w+\}", "", clean).strip()
    if not clean:
        return "fail"

    url = f"{CFG['MINIMAX_BASE_URL']}/t2a_v2"
    if CFG.get("MINIMAX_GROUP_ID"):
        url += f"?GroupId={CFG['MINIMAX_GROUP_ID']}"

    headers = {
        "Authorization": f"Bearer {CFG['MINIMAX_API_KEY']}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": CFG["MINIMAX_MODEL"],
        "text": clean,
        "voice_setting": {
            "voice_id": CFG["MINIMAX_VOICE_ID"],
            "speed": speed,
            "pitch": pitch,
            "vol": 1.0,
            "emotion": "happy",
        },
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3",
            "channel": 1,
        },
    }

    for attempt in range(retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            j = resp.json()
            base = j.get("base_resp", {})
            msg = base.get("status_msg", "")
            if base.get("status_code") != 0:
                # 限速：指数退避
                if "rate limit" in msg.lower() or "rpm" in msg.lower():
                    wait = min(30, 2 ** (attempt + 1))
                    time.sleep(wait)
                    continue
                if attempt == retries - 1:
                    print(f"  [FAIL] {out_path.name}: {msg}")
                    return "fail"
                time.sleep(1 + attempt)
                continue
            audio = j.get("data", {}).get("audio")
            if not audio:
                return "fail"
            data = bytes.fromhex(audio)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(data)
            return "ok"
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [EXC] {out_path.name}: {e}")
                return "fail"
            time.sleep(1 + attempt)
    return "fail"


# ========== 主入口 ==========
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--force", action="store_true", help="强制重新生成所有文件")
    p.add_argument("--only", choices=["sentences", "vocab", "coach"], help="只生成某一类")
    p.add_argument("--concurrency", type=int, default=4)
    p.add_argument("--speed", type=float, default=1.0, help="句子速度 0.5~2.0")
    p.add_argument("--vocab-speed", type=float, default=0.8, help="单词速度")
    args = p.parse_args()

    (AUDIO_DIR / "sentences").mkdir(parents=True, exist_ok=True)
    (AUDIO_DIR / "vocab").mkdir(parents=True, exist_ok=True)
    (AUDIO_DIR / "coach").mkdir(parents=True, exist_ok=True)

    if args.force:
        for sub in ["sentences", "vocab", "coach"]:
            for f in (AUDIO_DIR / sub).glob("*.mp3"):
                f.unlink()
        print("[Force] 清空旧文件")

    print(f"[Config] model={CFG['MINIMAX_MODEL']}  voice={CFG['MINIMAX_VOICE_ID']}")

    sentences = extract_pairs(BASE / "data-sentences.js")
    vocab = extract_pairs(BASE / "data-vocab.js")
    alphabet = extract_alphabet(BASE / "data-vocab.js")
    vocab_all = vocab + alphabet
    coach_lines = extract_coach_lines(BASE / "data-coach.js")

    print(f"[Counts] {len(sentences)} sentences, {len(vocab_all)} vocab, {len(coach_lines)} coach")

    tasks = []
    results = {"sentences": {}, "vocab": {}, "coach": {}}

    if not args.only or args.only == "sentences":
        for sid, text in sentences:
            path = AUDIO_DIR / "sentences" / f"{sid}.mp3"
            results["sentences"][sid] = text
            tasks.append(("sent", sid, text, path, args.speed))

    if not args.only or args.only == "vocab":
        for vid, text in vocab_all:
            path = AUDIO_DIR / "vocab" / f"{vid}.mp3"
            results["vocab"][vid] = text
            tasks.append(("vocab", vid, text, path, args.vocab_speed))

    if not args.only or args.only == "coach":
        for line in coach_lines:
            cid = line_id(line)
            path = AUDIO_DIR / "coach" / f"{cid}.mp3"
            results["coach"][cid] = line
            tasks.append(("coach", cid, line, path, args.speed))

    print(f"[Plan] {len(tasks)} total audio files, concurrency={args.concurrency}")

    stats = {"ok": 0, "skip": 0, "fail": 0}
    with ThreadPoolExecutor(max_workers=args.concurrency) as ex:
        futures = {ex.submit(gen_one, text, path, speed=speed): (kind, tid)
                   for (kind, tid, text, path, speed) in tasks}
        done_count = 0
        for fut in as_completed(futures):
            kind, tid = futures[fut]
            r = fut.result()
            stats[r] = stats.get(r, 0) + 1
            done_count += 1
            if done_count % 20 == 0 or done_count == len(tasks):
                print(f"  [{done_count}/{len(tasks)}] ok={stats['ok']} skip={stats['skip']} fail={stats['fail']}")

    print(f"\n[Done] ok={stats.get('ok',0)}  skip={stats.get('skip',0)}  fail={stats.get('fail',0)}")

    # 写 manifest
    manifest_path = AUDIO_DIR / "manifest.json"
    manifest = {
        "provider": "minimax",
        "model": CFG["MINIMAX_MODEL"],
        "voice": CFG["MINIMAX_VOICE_ID"],
        "sentences": list(results["sentences"].keys()) if results["sentences"] else (
            [p.stem for p in (AUDIO_DIR / "sentences").glob("*.mp3")]
        ),
        "vocab": list(results["vocab"].keys()) if results["vocab"] else (
            [p.stem for p in (AUDIO_DIR / "vocab").glob("*.mp3")]
        ),
        "coach": results["coach"] if results["coach"] else (
            # 重构 coach：从现有文件推断
            {p.stem: "" for p in (AUDIO_DIR / "coach").glob("*.mp3")}
        ),
    }
    # 如果这次没生成某一类，但 manifest 老版里有，保留旧的
    if (AUDIO_DIR / "manifest.json").exists() and args.only:
        try:
            old = json.loads((AUDIO_DIR / "manifest.json").read_text(encoding="utf-8"))
            if args.only != "sentences": manifest["sentences"] = old.get("sentences", manifest["sentences"])
            if args.only != "vocab":     manifest["vocab"]     = old.get("vocab",     manifest["vocab"])
            if args.only != "coach":     manifest["coach"]     = old.get("coach",     manifest["coach"])
        except Exception:
            pass

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[Manifest] {manifest_path}")


if __name__ == "__main__":
    main()
