"""
gen-images-minimax.py · 用 MiniMax image-01 给缺失的图片兜底
(Pollinations 限速太狠的时候用这个)

与 gen-images.py 共用 VOCAB_PROMPTS 和 SENTENCE_PROMPTS 配置。
"""
import base64
import hashlib
import importlib.util
import os
import pathlib
import re
import sys
import time

import requests

BASE = pathlib.Path(__file__).resolve().parent.parent
VOCAB_DIR = BASE / 'audio' / 'images' / 'vocab'
SENT_DIR  = BASE / 'audio' / 'images' / 'sentences'
VOCAB_DIR.mkdir(parents=True, exist_ok=True)
SENT_DIR.mkdir(parents=True, exist_ok=True)


def load_env():
    env = {}
    for line in (BASE / '.env').read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    return env


# 从 gen-images.py 导入 VOCAB_PROMPTS 和 SENTENCE_PROMPTS
def load_prompts():
    spec = importlib.util.spec_from_file_location(
        'gen_images', BASE / 'scripts' / 'gen-images.py'
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.VOCAB_PROMPTS, mod.SENTENCE_PROMPTS, mod.STYLE_SUFFIX


STYLE = ('cute cartoon illustration for 1st grade english learning, '
         'flat color, thick black outline, pastel palette, plain white background, '
         'centered subject, no text, friendly and simple')


def gen_one(prompt, out_path, env, retries=3):
    if out_path.exists() and out_path.stat().st_size > 1000:
        return 'skip'
    full = f'{prompt}, {STYLE}'
    url = env.get('MINIMAX_BASE_URL', 'https://api.minimax.chat/v1') + '/image_generation'
    payload = {
        'model': 'image-01',
        'prompt': full,
        'aspect_ratio': '1:1',
        'n': 1,
        'response_format': 'url',
    }
    headers = {'Authorization': f"Bearer {env['MINIMAX_API_KEY']}", 'Content-Type': 'application/json'}
    for attempt in range(retries):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=60)
            j = r.json()
            code = j.get('base_resp', {}).get('status_code', -1)
            if code != 0:
                msg = j.get('base_resp', {}).get('status_msg', '')
                if 'rate limit' in msg.lower():
                    time.sleep(min(30, 5 * (attempt + 1)))
                    continue
                print(f"  [FAIL] {out_path.name}: {msg}")
                return 'fail'
            img_urls = j.get('data', {}).get('image_urls') or []
            if not img_urls:
                return 'fail'
            # 下载图片
            img_resp = requests.get(img_urls[0], timeout=60)
            if img_resp.status_code == 200 and len(img_resp.content) > 1000:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_bytes(img_resp.content)
                return 'ok'
            return 'fail'
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [EXC] {out_path.name}: {e}")
                return 'fail'
            time.sleep(2)
    return 'fail'


def main():
    env = load_env()
    VOCAB_PROMPTS, SENTENCE_PROMPTS, _ = load_prompts()

    # 找出所有缺失的
    missing = []
    for vid, prompt in VOCAB_PROMPTS.items():
        p = VOCAB_DIR / f'{vid}.jpg'
        if not p.exists() or p.stat().st_size < 1000:
            missing.append(('vocab', vid, prompt, p))
    for sid, prompt in SENTENCE_PROMPTS.items():
        p = SENT_DIR / f'{sid}.jpg'
        if not p.exists() or p.stat().st_size < 1000:
            missing.append(('sent', sid, prompt, p))

    print(f'[Missing] {len(missing)} 张图片需要 MiniMax 兜底')
    if not missing:
        print('都齐了!')
        return

    stats = {'ok': 0, 'fail': 0, 'skip': 0}
    for i, (kind, _id, prompt, path) in enumerate(missing):
        r = gen_one(prompt, path, env)
        stats[r] = stats.get(r, 0) + 1
        print(f"  [{i+1}/{len(missing)}] {r:4s} {kind}:{_id}")
        time.sleep(0.5)

    print(f'\n[Done] ok={stats["ok"]}  fail={stats["fail"]}  skip={stats.get("skip",0)}')

    # 更新 manifest.json(只列出真存在的 jpg)
    import json
    IMG_DIR = BASE / 'audio' / 'images'
    manifest_path = IMG_DIR / 'manifest.json'
    manifest = {
        'provider': 'mixed (pollinations + minimax)',
        'model': 'flux / image-01',
        'style': STYLE,
        'vocab':     sorted(p.stem for p in VOCAB_DIR.glob('*.jpg')),
        'sentences': sorted(p.stem for p in SENT_DIR.glob('*.jpg')),
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"[Manifest] updated: vocab={len(manifest['vocab'])}, sent={len(manifest['sentences'])}")


if __name__ == '__main__':
    main()
