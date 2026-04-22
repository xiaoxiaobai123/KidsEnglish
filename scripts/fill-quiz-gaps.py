"""
fill-quiz-gaps.py · 补齐单元测验缺的音频 + 图片
- 音频：MiniMax（和已有 MP3 同声音 English_magnetic_voiced_man）
- 图片：Pollinations.ai（免费 Flux）
运行:
  python scripts/fill-quiz-gaps.py
"""
import hashlib
import pathlib
import re
import sys
import time
from urllib.parse import quote

import requests

BASE = pathlib.Path(__file__).resolve().parent.parent


def load_env():
    env = {}
    for line in (BASE / '.env').read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    return env


# ========== 1. 扫出缺什么 ==========
def scan_missing():
    content = (BASE / 'data-quiz.js').read_text(encoding='utf-8')
    refs = set(re.findall(r"['\"]([a-z]+:[a-zA-Z0-9_]+)['\"]", content))
    refs = [r for r in refs if r.startswith(('vocab:', 'sent:'))]
    missing_audio, missing_image = [], []
    for ref in sorted(refs):
        kind, _id = ref.split(':')
        if kind == 'vocab':
            a = BASE / 'audio' / 'vocab' / f'{_id}.mp3'
            i = BASE / 'audio' / 'images' / 'vocab' / f'{_id}.jpg'
        else:
            a = BASE / 'audio' / 'sentences' / f'{_id}.mp3'
            i = BASE / 'audio' / 'images' / 'sentences' / f'{_id}.jpg'
        if not a.exists():  missing_audio.append((ref, _id, kind))
        if not i.exists():  missing_image.append((ref, _id, kind))
    return missing_audio, missing_image


# ========== 2. MiniMax 生音频 ==========
def gen_audio_minimax(text, out_path, env):
    url = env.get('MINIMAX_BASE_URL', 'https://api.minimax.chat/v1') + '/t2a_v2'
    payload = {
        'model':        env.get('MINIMAX_MODEL', 'speech-2.8-hd'),
        'text':         text,
        'voice_setting': {
            'voice_id': env.get('MINIMAX_VOICE_ID', 'English_magnetic_voiced_man'),
            'speed': 1.0, 'pitch': 0, 'vol': 1.0, 'emotion': 'happy',
        },
        'audio_setting': {'sample_rate': 32000, 'bitrate': 128000, 'format': 'mp3', 'channel': 1},
    }
    headers = {'Authorization': f"Bearer {env['MINIMAX_API_KEY']}", 'Content-Type': 'application/json'}
    for attempt in range(3):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=30)
            j = r.json()
            code = j.get('base_resp', {}).get('status_code', -1)
            if code != 0:
                print(f"  [FAIL] {text}: {j.get('base_resp', {}).get('status_msg')}")
                if 'rate limit' in str(j).lower(): time.sleep(5 * (attempt + 1)); continue
                return False
            audio = j.get('data', {}).get('audio')
            if not audio: return False
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(bytes.fromhex(audio))
            return True
        except Exception as e:
            print(f"  [EXC] {text}: {e}")
            time.sleep(2)
    return False


# ========== 3. Pollinations 生图片 ==========
STYLE = ('cute cartoon illustration for 1st grade english learning, '
         'flat color, thick black outline, pastel palette, plain white background, '
         'centered subject, no text, friendly and simple')


def gen_image_pollinations(prompt, out_path, seed):
    full = f'{prompt}, {STYLE}'
    url = f'https://image.pollinations.ai/prompt/{quote(full)}?width=512&height=512&model=flux&nologo=true&seed={seed}'
    for attempt in range(5):
        try:
            r = requests.get(url, timeout=120)
            if r.status_code == 200 and len(r.content) > 1000:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_bytes(r.content)
                return True
            if r.status_code == 429:
                time.sleep(min(60, 5 * (attempt + 1))); continue
            print(f"  [FAIL] HTTP {r.status_code}")
            return False
        except Exception as e:
            print(f"  [EXC] {e}")
            time.sleep(3)
    return False


def stable_seed(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16) % 1000000


# ========== 4. 描述提示（ID → 图片 prompt） ==========
IMG_PROMPTS = {
    'u1_five':   'the number 5, big colorful cartoon digit',
    'u1_yellow': 'yellow paint splash, bright yellow color swatch',
    'u2_book':   'an open storybook with colorful pages',
    'u2_ruler':  'a straight wooden school ruler with numbers',
    'u3_carrot': 'an orange carrot with green leafy top',
    'u3_pea':    'green peas in a pea pod',
    'u4_green':  'green paint splash, bright green color swatch',
}


# ========== 5. 主流程 ==========
def main():
    env = load_env()
    missing_audio, missing_image = scan_missing()
    print(f'[Audio missing] {len(missing_audio)}')
    for ref, _id, _kind in missing_audio: print(f'  {ref}')
    print(f'[Image missing] {len(missing_image)}')
    for ref, _id, _kind in missing_image: print(f'  {ref}')

    # ---- 补音频（MiniMax）----
    if missing_audio:
        print('\n=== 用 MiniMax 补音频（磁性男声）===')
        for ref, _id, kind in missing_audio:
            # 从 ID 推文本：u4_green → "green"；vocab id 最后下划线后那段
            text = _id.split('_', 1)[1].replace('_', ' ') if '_' in _id else _id
            out = BASE / ('audio/vocab' if kind == 'vocab' else 'audio/sentences') / f'{_id}.mp3'
            print(f'  -> {ref} = "{text}"')
            ok = gen_audio_minimax(text, out, env)
            print('     OK' if ok else '     FAIL')
            time.sleep(1)

    # ---- 补图片（Pollinations）----
    if missing_image:
        print('\n=== 用 Pollinations 补图片（免费 Flux）===')
        for ref, _id, kind in missing_image:
            prompt = IMG_PROMPTS.get(_id)
            if not prompt:
                print(f'  [SKIP] {ref}: 无 prompt 定义，你需要告诉我怎么画')
                continue
            out = BASE / ('audio/images/vocab' if kind == 'vocab' else 'audio/images/sentences') / f'{_id}.jpg'
            print(f'  -> {ref}')
            ok = gen_image_pollinations(prompt, out, stable_seed(_id))
            print('     OK' if ok else '     FAIL')
            time.sleep(3)  # 避免限速

    print('\n[Done] 重新体检：')
    ma, mi = scan_missing()
    print(f'  剩余缺音频 {len(ma)}, 缺图片 {len(mi)}')
    for r, _, _ in ma: print(f'    audio  {r}')
    for r, _, _ in mi: print(f'    image  {r}')


if __name__ == '__main__':
    main()
