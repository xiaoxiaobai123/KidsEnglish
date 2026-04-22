"""
gen-vocab-edge.py · 用 Edge TTS 重生全部单词音频(en-US-GuyNeural 经典美男)

用 Microsoft Edge 的免费 TTS 接口,把 data-vocab.js 里的所有词(core + rhyme + alphabet)
重新生成到 audio/vocab/*.mp3。

选择 Guy(经典美男)的理由:
  - 尾辅音清晰(kite 的 /t/、lamb 的 /m/)——儿童英语启蒙必需
  - 发音按音素字典走,绝对稳定,不会把 silent letter 读错
  - 免费,无 key,无额度限制

用法:
  python scripts/gen-vocab-edge.py                   # 带自动备份
  python scripts/gen-vocab-edge.py --no-backup       # 不备份,直接覆盖
  python scripts/gen-vocab-edge.py --skip-alphabet   # 只生 core + rhyme(跳过字母)
  python scripts/gen-vocab-edge.py --only u4_kite    # 只生某一个

备份:
  原 MiniMax 版本 → audio/vocab_minimax_backup/<id>.mp3
"""
import argparse
import asyncio
import pathlib
import re
import shutil
import sys
import time

import edge_tts

BASE = pathlib.Path(__file__).resolve().parent.parent
VOCAB_DIR = BASE / "audio" / "vocab"
BACKUP_DIR = BASE / "audio" / "vocab_minimax_backup"

VOICE = "en-US-GuyNeural"
RATE  = "-40%"   # 夸张慢速 · phonics 教学场景:双元音/辅音咬字更清楚


def extract_core_and_rhyme(vocab_path):
    """抽取 VOCAB.core 和 VOCAB.rhyme 的 (id, en) 对。
    注意 exEn 这类字段不匹配 en:"..", 用 \\b 前缀。"""
    content = pathlib.Path(vocab_path).read_text(encoding="utf-8")
    # 只匹配 core 和 rhyme 块(alphabet 走单独路径)
    # 粗暴:全文抓 id + en,成对配
    id_rx = re.compile(r"\bid:\s*['\"]([^'\"]+)['\"]")
    en_rx = re.compile(r"\ben:\s*\"([^\"]+)\"")
    ids = id_rx.findall(content)
    ens = en_rx.findall(content)
    n = min(len(ids), len(ens))
    # 过滤掉字母(a_a ~ a_z)
    pairs = []
    for i in range(n):
        if not ids[i].startswith("a_"):
            pairs.append((ids[i], ens[i]))
    return pairs


def extract_alphabet(vocab_path):
    """字母:生成 'A. A is for apple.' 这种教学格式。"""
    content = pathlib.Path(vocab_path).read_text(encoding="utf-8")
    m = re.search(r"alphabet:\s*\[([\s\S]*?)\n\s*\]", content)
    if not m:
        return []
    block = m.group(1)
    ids = re.findall(r"\bid:\s*['\"]([^'\"]+)['\"]", block)
    letters = re.findall(r"\bletter:\s*\"([^\"]+)\"", block)
    examples = re.findall(r"\bexample:\s*\"([^\"]+)\"", block)
    n = min(len(ids), len(letters), len(examples))
    pairs = []
    for i in range(n):
        big = letters[i][0] if letters[i] else "A"
        text = f"{big}. {big} is for {examples[i]}."
        pairs.append((ids[i], text))
    return pairs


async def gen_one(text, out_path, retries=3):
    """生成单个 mp3。返回 ('ok'|'fail', msg)。"""
    for attempt in range(retries):
        try:
            comm = edge_tts.Communicate(text, VOICE, rate=RATE)
            await comm.save(str(out_path))
            size = out_path.stat().st_size
            if size > 500:
                return ("ok", f"{size}b")
            return ("fail", f"too small ({size}b)")
        except Exception as e:
            if attempt == retries - 1:
                return ("fail", str(e))
            await asyncio.sleep(1 + attempt)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-backup", action="store_true", help="不备份旧 MiniMax 版")
    ap.add_argument("--skip-alphabet", action="store_true", help="只生 core + rhyme(跳过字母)")
    ap.add_argument("--only", help="只生某一个 id(如 u4_kite)")
    ap.add_argument("--concurrency", type=int, default=4)
    args = ap.parse_args()

    vocab_js = BASE / "data-vocab.js"
    core_rhyme = extract_core_and_rhyme(vocab_js)
    alphabet = [] if args.skip_alphabet else extract_alphabet(vocab_js)
    all_items = core_rhyme + alphabet

    if args.only:
        all_items = [(i, t) for i, t in all_items if i == args.only]
        if not all_items:
            print(f"[ERROR] id '{args.only}' 没找到")
            sys.exit(1)

    print(f"[Plan] {len(core_rhyme)} core+rhyme + {len(alphabet)} alphabet = {len(all_items)} 个")
    print(f"[Voice] {VOICE}  rate={RATE}")

    # 备份
    if not args.no_backup and not args.only and VOCAB_DIR.exists():
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        n_backed = 0
        for wid, _ in all_items:
            src = VOCAB_DIR / f"{wid}.mp3"
            dst = BACKUP_DIR / f"{wid}.mp3"
            if src.exists() and not dst.exists():
                shutil.copy2(src, dst)
                n_backed += 1
        print(f"[Backup] 备份 {n_backed} 个原 MiniMax 文件到 {BACKUP_DIR}")

    VOCAB_DIR.mkdir(parents=True, exist_ok=True)

    # 并发生成(edge_tts 请求有速率限制,4 并发较稳)
    sem = asyncio.Semaphore(args.concurrency)
    stats = {"ok": 0, "fail": 0}
    t0 = time.time()

    async def work(wid, text):
        async with sem:
            out = VOCAB_DIR / f"{wid}.mp3"
            status, info = await gen_one(text, out)
            stats[status] = stats.get(status, 0) + 1
            tag = "OK  " if status == "ok" else "FAIL"
            print(f"  [{tag}] {wid:18s} '{text[:40]}' -- {info}")

    await asyncio.gather(*(work(wid, text) for wid, text in all_items))

    dt = time.time() - t0
    print(f"\n[Done] ok={stats['ok']}  fail={stats.get('fail',0)}  in {dt:.1f}s")
    if stats.get("fail", 0):
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
