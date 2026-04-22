"""
gen-quiz-audio.py · 为 quiz 里的 quiz:q5_xx / quiz:q6_xx 等引用生成 MP3
源数据在 data-quiz.js 的 audioText 字段。
"""
import pathlib
import re
import sys
import time
import requests

BASE = pathlib.Path(__file__).resolve().parent.parent


def load_env():
    env = {}
    for line in (BASE / '.env').read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    return env


def extract_quiz_audios():
    """从 data-quiz.js 抽所有 audio='quiz:...' 及其 audioText"""
    content = (BASE / 'data-quiz.js').read_text(encoding='utf-8')
    # 匹配整个 item {} 中的 audio + audioText
    # 简化方法: 逐行匹配
    out = []
    lines = content.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.search(r"audio:\s*'(quiz:[^']+)'", line)
        if m:
            audio_ref = m.group(1)
            # 在同一个 object 里找 audioText（可能在下一行或同行）
            combined = line
            for off in range(0, 4):
                if i + off < len(lines):
                    combined += ' ' + lines[i + off]
            t = re.search(r'audioText:\s*"([^"]+)"', combined)
            if t:
                out.append((audio_ref, t.group(1)))
        i += 1
    return out


def gen_one(text, out_path, env, retries=5):
    if out_path.exists() and out_path.stat().st_size > 500:
        return 'skip'
    url = env.get('MINIMAX_BASE_URL', 'https://api.minimax.chat/v1') + '/t2a_v2'
    payload = {
        'model': env.get('MINIMAX_MODEL', 'speech-2.8-hd'),
        'text': text,
        'voice_setting': {'voice_id': env.get('MINIMAX_VOICE_ID', 'English_magnetic_voiced_man'),
                          'speed': 1.0, 'pitch': 0, 'vol': 1.0, 'emotion': 'happy'},
        'audio_setting': {'sample_rate': 32000, 'bitrate': 128000, 'format': 'mp3', 'channel': 1},
    }
    headers = {'Authorization': f"Bearer {env['MINIMAX_API_KEY']}", 'Content-Type': 'application/json'}
    for attempt in range(retries):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=30)
            j = r.json()
            code = j.get('base_resp', {}).get('status_code', -1)
            if code != 0:
                msg = j.get('base_resp', {}).get('status_msg', '')
                if 'rate limit' in msg.lower():
                    time.sleep(min(30, 5 * (attempt + 1)))
                    continue
                print(f"  [FAIL] {text[:40]}: {msg}")
                return 'fail'
            audio = j.get('data', {}).get('audio')
            if not audio:
                return 'fail'
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(bytes.fromhex(audio))
            return 'ok'
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [EXC] {text[:40]}: {e}")
                return 'fail'
            time.sleep(2)
    return 'fail'


def main():
    env = load_env()
    pairs = extract_quiz_audios()
    print(f'Found {len(pairs)} quiz audio refs')
    (BASE / 'audio' / 'quiz').mkdir(parents=True, exist_ok=True)

    stats = {'ok': 0, 'skip': 0, 'fail': 0}
    for i, (ref, text) in enumerate(pairs):
        _id = ref.split(':', 1)[1]
        out = BASE / 'audio' / 'quiz' / f'{_id}.mp3'
        r = gen_one(text, out, env)
        stats[r] = stats.get(r, 0) + 1
        print(f'  [{i+1}/{len(pairs)}] {r:4s} {_id} · "{text[:40]}"')
        time.sleep(0.5)

    print(f'\n[Done] ok={stats["ok"]}  skip={stats["skip"]}  fail={stats["fail"]}')


if __name__ == '__main__':
    main()
