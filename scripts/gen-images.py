"""
gen-images.py · 用 Pollinations.ai (免费 Flux) 批量生成插图

用法：
  python scripts/gen-images.py --unit 4          # 只跑 U4
  python scripts/gen-images.py --all             # 全 8 单元
  python scripts/gen-images.py --unit 4 --force  # 覆盖已生成的

产出：
  audio/images/vocab/<id>.jpg
  audio/images/sentences/<id>.jpg
  audio/images/manifest.json
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
from urllib.parse import quote

import requests

BASE = pathlib.Path(__file__).resolve().parent.parent
IMG_DIR = BASE / "audio" / "images"
VOCAB_DIR = IMG_DIR / "vocab"
SENT_DIR  = IMG_DIR / "sentences"
VOCAB_DIR.mkdir(parents=True, exist_ok=True)
SENT_DIR.mkdir(parents=True, exist_ok=True)

# —— 风格统一（这段会拼到每条 prompt 前面） ——
STYLE_SUFFIX = (
    "cute cartoon illustration for 1st grade english learning, "
    "flat color, thick black outline, pastel palette, plain white background, "
    "centered subject, no text, friendly and simple"
)

# —— 每个词/句的自定义内容 prompt ——
# 抽象词（the/are/they're/is 等）不生图
VOCAB_PROMPTS = {
    # Unit 1
    "u1_marble":   "a glass marble toy with swirl pattern",
    "u1_one":      "the number 1, big colorful cartoon digit",
    "u1_two":      "the number 2, big colorful cartoon digit",
    "u1_three":    "the number 3, big colorful cartoon digit",
    "u1_four":     "the number 4, big colorful cartoon digit",
    "u1_five":     "the number 5, big colorful cartoon digit",
    "u1_yellow":   "a yellow paint splash, bright yellow color swatch",

    # Unit 2
    "u2_pencil":   "a yellow wooden pencil with sharpened tip",
    "u2_book":     "an open storybook with colorful pages",
    "u2_ruler":    "a straight wooden school ruler with numbers",
    "u2_rubber":   "a pink eraser, school supply",
    "u2_ouch":     "a child with surprised face showing ouch expression",
    "u2_sorry":    "a child saying sorry with apologetic face",
    "u2_ok":       "a smiling kid giving thumbs up, it's ok",

    # Unit 3
    "u3_like":     "a big red heart with a smile, love symbol",
    "u3_carrot":   "an orange carrot with green leafy top",
    "u3_onion":    "a white round onion with papery skin",
    "u3_pea":      "green peas in a pea pod",
    "u3_pepper":   "a red bell pepper",
    "u3_metoo":    "two kids waving happily saying me too",
    "u3_nothanks": "a kid politely saying no thanks",
    "u3_yesplease":"a kid happily saying yes please",

    # Unit 4
    "u4_spring":   "spring season scene with flowers, trees and sunshine",
    "u4_tree":     "a single tall green leafy tree",
    "u4_flower":   "a pink blooming flower with leaves",
    "u4_bird":     "a cute small bird singing happily",
    "u4_kite":     "a colorful diamond shaped kite with tail flying",
    "u4_green":    "green paint splash, bright green color swatch",
    "u4_beautiful":"sparkles and hearts symbol of beauty",
    "u4_happy":    "a big yellow smiley face with sunshine",
    "u4_colourful":"a vibrant rainbow arc with stars",

    # Unit 5
    "u5_ladybird":  "a red ladybug with black spots",
    "u5_cicada":    "a cicada insect on a tree leaf",
    "u5_butterfly": "a colorful butterfly with big wings",
    "u5_dragonfly": "a dragonfly with shiny wings",
    "u5_cute":      "a super cute smiling character with sparkles",

    # Unit 6
    "u6_go":     "a child pointing forward saying go",
    "u6_run":    "a child running fast with motion lines",
    "u6_jump":   "a kid jumping high with joy",
    "u6_hop":    "a kid hopping on one foot",
    "u6_walk":   "a kid walking happily",
    "u6_ready":  "a kid in running pose ready to start",

    # Unit 7
    "u7_pig":    "a pink cute pig on farm",
    "u7_lamb":   "a white fluffy lamb",
    "u7_duck":   "a yellow cartoon duck",
    "u7_cow":    "a black and white spotted cow",
    "u7_shh":    "a finger on lips saying shhh to be quiet",

    # Unit 8
    "u8_bag":     "a colorful school backpack",
    "u8_bottle":  "a water bottle with cap",
    "u8_hankie":  "a folded handkerchief",
    "u8_sticker": "a star sticker",
    "u8_yoyo":    "a yo-yo toy with string",
    "u8_bee":     "a yellow bee with wings",
}

# —— 句子 Hero 图：整个场景 ——
SENTENCE_PROMPTS = {
    # Unit 1
    "s_u1_01": "a child counting red glass marbles on ground, cartoon",
    "s_u1_02": "three red marbles in a row, cartoon",
    "s_u1_03": "four yellow marbles lined up, cartoon",
    "s_u1_04": "five green peas in a row, cartoon",
    "s_u1_05": "a small green tree with child pointing, cartoon",
    "s_u1_06": "six wooden sticks being counted, cartoon",
    "s_u1_07": "child holding up five fingers saying cool, cartoon",
    "s_u1_08": "three red apples in a basket, cartoon",

    # Unit 2
    "s_u2_01": "a kid proudly showing a yellow pencil, cartoon",
    "s_u2_02": "two kids, one looks hurt saying ouch, other says it's ok, cartoon",
    "s_u2_03": "a kid showing an open book, cartoon",
    "s_u2_04": "a kid showing a wooden ruler, cartoon",
    "s_u2_05": "a kid showing a pink eraser, cartoon",
    "s_u2_06": "two smiling friends saying sorry, cartoon",
    "s_u2_07": "two kids nodding yes holding pencil, cartoon",

    # Unit 3
    "s_u3_01": "two kids happily eating orange carrots together, cartoon",
    "s_u3_02": "a kid refusing onion politely, cartoon",
    "s_u3_03": "a kid happily accepting green pea, cartoon",
    "s_u3_04": "a family eating red bell peppers at dinner, cartoon",
    "s_u3_05": "green sweet peas with smile, cartoon",
    "s_u3_06": "kids eating lots of green peas happily, cartoon",
    "s_u3_07": "green peas with hearts showing yummy, cartoon",
    "s_u3_08": "a kid saying yes I do, loving carrots, cartoon",

    # Unit 4
    "s_u4_01": "four green trees in a spring park, a child looking up smiling, cartoon",
    "s_u4_02": "beautiful pink and yellow flowers blooming in spring, cartoon",
    "s_u4_03": "happy little birds singing on tree branches with sunshine, cartoon",
    "s_u4_04": "several colourful kites flying in blue sky, cartoon",
    "s_u4_05": "flowers with smiley faces in spring meadow, cartoon",
    "s_u4_06": "tall trees swinging their branches in spring breeze, cartoon",
    "s_u4_07": "spring scene with birds singing and flowers blooming, cartoon",

    # Unit 5
    "s_u5_01": "a child pointing at a red ladybug on a leaf, cartoon",
    "s_u5_02": "a cute cicada insect on tree, cartoon",
    "s_u5_03": "a colorful butterfly flying, cartoon",
    "s_u5_04": "a blue dragonfly over pond, cartoon",
    "s_u5_05": "butterflies flying in summer sky, cartoon",
    "s_u5_06": "butterflies dancing in blue summer sky, cartoon",
    "s_u5_07": "butterflies flying here and there over flowers, cartoon",
    "s_u5_08": "butterflies flying up and down around, cartoon",

    # Unit 6
    "s_u6_01": "two kids lined up ready to race, cartoon",
    "s_u6_02": "kids running fast on a path, one cheering, cartoon",
    "s_u6_03": "kids jumping high with joy, cartoon",
    "s_u6_04": "kids hopping on one foot and walking, cartoon",
    "s_u6_05": "three kids hopping and running happily, cartoon",
    "s_u6_06": "kids doing activities one by one in a line, cartoon",

    # Unit 7
    "s_u7_01": "a kid with finger on lips whispering next to a pink pig, cartoon",
    "s_u7_02": "a white lamb saying baa, cartoon",
    "s_u7_03": "a yellow duck saying quack, cartoon",
    "s_u7_04": "a black and white cow on a farm, cartoon",
    "s_u7_05": "Mary with a little white lamb following, cartoon",
    "s_u7_06": "a white fluffy lamb in snow, cartoon",
    "s_u7_07": "a pink pig and a black cow together on farm, cartoon",

    # Unit 8
    "s_u8_01": "a kid holding a school backpack curiously, cartoon",
    "s_u8_02": "a water bottle and a handkerchief on desk, cartoon",
    "s_u8_03": "stickers and yo-yo toy on table, cartoon",
    "s_u8_04": "a kid showing his colorful schoolbag, cartoon",
    "s_u8_05": "a kid looking into a bag with wide eyes, cartoon",
    "s_u8_06": "two yo-yos and a storybook on desk, cartoon",
    "s_u8_07": "a surprised kid with a yellow bee nearby, cartoon",
}


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
            r = requests.get(url, timeout=120)
            if r.status_code == 200 and len(r.content) > 1000:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_bytes(r.content)
                return "ok"
            # 429 限速：指数退避
            if r.status_code == 429:
                wait = min(60, 5 * (attempt + 1))
                time.sleep(wait)
                continue
            if attempt == retries - 1:
                print(f"  [FAIL] {out_path.name}: HTTP {r.status_code} / {len(r.content)} bytes")
                return "fail"
            time.sleep(3 + attempt * 3)
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [EXC] {out_path.name}: {e}")
                return "fail"
            time.sleep(3 + attempt * 3)
    return "fail"


def stable_seed(s):
    """根据 ID 生成稳定 seed，让同一 ID 每次结果相同"""
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16) % 1000000


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--unit", type=int, help="只跑某个单元 (1-8)")
    p.add_argument("--all", action="store_true", help="跑全部 8 单元")
    p.add_argument("--force", action="store_true", help="覆盖已有文件")
    p.add_argument("--concurrency", type=int, default=3, help="并发数")
    args = p.parse_args()

    if not args.unit and not args.all:
        p.error("指定 --unit N 或 --all")

    # 过滤要生成的词和句
    def pick(keys, unit):
        if args.all:
            return list(keys)
        prefix_v = f"u{unit}_"
        prefix_s = f"s_u{unit}_"
        return [k for k in keys if k.startswith(prefix_v) or k.startswith(prefix_s)]

    vocab_todo = [k for k in VOCAB_PROMPTS.keys() if args.all or k.startswith(f"u{args.unit}_")]
    sent_todo  = [k for k in SENTENCE_PROMPTS.keys() if args.all or k.startswith(f"s_u{args.unit}_")]

    print(f"[Plan] vocab: {len(vocab_todo)}  sentences: {len(sent_todo)}  total: {len(vocab_todo)+len(sent_todo)}")

    tasks = []
    for vid in vocab_todo:
        out = VOCAB_DIR / f"{vid}.jpg"
        tasks.append((vid, VOCAB_PROMPTS[vid], out, stable_seed(vid)))
    for sid in sent_todo:
        out = SENT_DIR / f"{sid}.jpg"
        tasks.append((sid, SENTENCE_PROMPTS[sid], out, stable_seed(sid)))

    stats = {"ok": 0, "skip": 0, "fail": 0}
    done = 0

    with ThreadPoolExecutor(max_workers=args.concurrency) as ex:
        futures = {ex.submit(generate, pr, out, seed=seed, force=args.force): (tid, out)
                   for (tid, pr, out, seed) in tasks}
        for fut in as_completed(futures):
            tid, out = futures[fut]
            r = fut.result()
            stats[r] = stats.get(r, 0) + 1
            done += 1
            # 进度行
            print(f"  [{done}/{len(tasks)}] {r:4s} {tid}")

    print(f"\n[Done] ok={stats['ok']}  skip={stats['skip']}  fail={stats['fail']}")

    # 写 manifest
    manifest_path = IMG_DIR / "manifest.json"
    manifest = {
        "provider": "pollinations.ai",
        "model": "flux",
        "style": STYLE_SUFFIX,
        "vocab":     [p.stem for p in VOCAB_DIR.glob("*.jpg")],
        "sentences": [p.stem for p in SENT_DIR.glob("*.jpg")],
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[Manifest] {manifest_path}  (vocab={len(manifest['vocab'])}, sent={len(manifest['sentences'])})")


if __name__ == "__main__":
    main()
