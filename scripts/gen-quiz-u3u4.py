"""
gen-quiz-u3u4.py · Pollinations free 生 U3-U4 真卷/仿真卷的 quiz 专用图片
输出到 audio/images/quiz/<id>.jpg
运行: python scripts/gen-quiz-u3u4.py
"""
import pathlib, time, requests
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = pathlib.Path(__file__).resolve().parent.parent
OUT = BASE / 'audio' / 'images' / 'quiz'
OUT.mkdir(parents=True, exist_ok=True)

STYLE = (
    "cute cartoon illustration for 1st grade english textbook, "
    "flat color, thick black outline, pastel palette, plain white background, "
    "centered subject, no text, no numbers, friendly and simple"
)

# U3-U4 quiz 图 · key = id · value = prompt
# 数量类图 prompt 强调 "exactly N" + 无文字无数字
PROMPTS = {
    # 水果类
    'u3u4_bananas':      "a bunch of yellow bananas",
    'u3u4_grapes':       "a bunch of purple grapes on a stem",
    'u3u4_cherries':     "two red cherries with green stems",
    'u3u4_apple':        "a single red apple with green leaf",

    # 蔬菜数量类
    'u3u4_2carrots':     "exactly two orange carrots with green tops side by side, no other items",
    'u3u4_3carrots':     "exactly three orange carrots with green tops in a row, three carrots total",
    'u3u4_2onions':      "exactly two round white onions side by side, two onions total",
    'u3u4_3onions':      "exactly three round brown onions in a pile, three onions total",
    'u3u4_4onions':      "exactly four round brown onions in a pile, four onions total",
    'u3u4_2peppers':     "exactly two red bell peppers side by side",

    # 风筝数量
    'u3u4_1kite':        "a single colorful diamond kite flying with tail",
    'u3u4_2kites':       "exactly two colorful kites flying in blue sky",
    'u3u4_3kites':       "exactly three colorful kites flying in blue sky, three kites total",

    # 鸟数量
    'u3u4_1bird':        "a single small cute bird on branch",
    'u3u4_2birds':       "exactly two small birds flying together",
    'u3u4_3birds':       "exactly three small birds flying in sky, three birds total",

    # 花数量
    'u3u4_5flowers':     "exactly five pink flowers in a meadow, five flowers total",
    'u3u4_3flowers':     "exactly three pink flowers side by side in meadow",

    # 玩具 · 物品
    'u3u4_puppy':        "a cute fluffy puppy dog sitting",
    'u3u4_teddy':        "a soft brown teddy bear",
    'u3u4_robot':        "a cute blue friendly cartoon robot toy",
    'u3u4_bag':          "a colorful school backpack with straps",
    'u3u4_coat':         "a warm winter coat hanging",
    'u3u4_balloon':      "a single round red balloon with string",

    # 场景
    'u3u4_monkey_carrot':"a cute cartoon monkey happily holding and eating an orange carrot",
    'u3u4_3happytrees':  "three green trees with cute smiling faces",

    # 儿童卡通头像 (真卷 + 仿真)
    'u3u4_face_suhai':   "cute cartoon chinese girl with long black hair, child portrait, friendly smile",
    'u3u4_face_wangbing':"cute cartoon chinese boy with short black hair and round glasses, child portrait",
    'u3u4_face_yangling':"cute cartoon chinese girl with twin pigtails, child portrait, smiling",
    'u3u4_face_liutao':  "cute cartoon chinese boy with short hair, child portrait, friendly smile",
    'u3u4_face_missli':  "cute cartoon young female asian teacher, warm smile, portrait",
    'u3u4_face_mike':    "cute cartoon blond boy with short hair, child portrait, smiling",
    'u3u4_face_helen':   "cute cartoon girl with long brown hair, child portrait, smiling",
    'u3u4_face_tim':     "cute cartoon asian boy with short dark hair and big eyes, child portrait",
    'u3u4_face_amy':     "cute cartoon young woman with brown hair, friendly smile portrait",
    'u3u4_face_mrgreen': "cute cartoon friendly male teacher with short hair, portrait",
}


def gen_one(qid, prompt, seed=None):
    out_path = OUT / f'{qid}.jpg'
    if out_path.exists() and out_path.stat().st_size > 1000:
        return 'skip', qid
    full = f'{prompt}, {STYLE}'
    # seed 稳定 · 同 id 同图
    seed = seed or (sum(ord(c) for c in qid) * 31 % 1000000)
    url = ('https://image.pollinations.ai/prompt/' + quote(full)
           + f'?width=512&height=512&model=flux&nologo=true&seed={seed}')
    for attempt in range(5):
        try:
            r = requests.get(url, timeout=120)
            if r.status_code == 200 and len(r.content) > 1000:
                out_path.write_bytes(r.content)
                return 'ok', qid
            if r.status_code == 429:
                time.sleep(5 * (attempt + 1))
                continue
            if attempt == 4:
                return 'fail', qid
            time.sleep(3 + attempt * 2)
        except Exception as e:
            if attempt == 4:
                return 'fail', qid
            time.sleep(3)
    return 'fail', qid


def main():
    print(f'[Plan] {len(PROMPTS)} U3-U4 quiz images → {OUT}')
    stats = {'ok': 0, 'skip': 0, 'fail': 0}
    with ThreadPoolExecutor(max_workers=3) as ex:
        futures = {ex.submit(gen_one, qid, pr): qid for qid, pr in PROMPTS.items()}
        done = 0
        for fut in as_completed(futures):
            status, qid = fut.result()
            stats[status] = stats.get(status, 0) + 1
            done += 1
            print(f'  [{done}/{len(PROMPTS)}] {status:4s} {qid}')
    print(f'\n[Done] ok={stats["ok"]}  skip={stats["skip"]}  fail={stats["fail"]}')


if __name__ == '__main__':
    main()
