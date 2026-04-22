"""
gen-letters-phonemes.py
生成 26 字母名 + 26 字母音(phonics)MP3

输出:
  audio/letters/A.mp3 ~ Z.mp3    (字母名,如 "A" → /eɪ/)
  audio/phonemes/A.mp3 ~ Z.mp3   (字母音 + 示例词,如 "A says ah, apple")
"""
import pathlib
import time
import requests

BASE = pathlib.Path(__file__).resolve().parent.parent
L_DIR = BASE / 'audio' / 'letters'
P_DIR = BASE / 'audio' / 'phonemes'
L_DIR.mkdir(parents=True, exist_ok=True)
P_DIR.mkdir(parents=True, exist_ok=True)


def load_env():
    env = {}
    for line in (BASE / '.env').read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    return env


# —— 字母名(纯字母,MiniMax 读作字母名字 /eɪ/, /biː/ 等) ——
LETTER_NAMES = {c: c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}

# —— 字母音(phonics · 经典"字母说什么音") ——
PHONEMES = {
    'A': 'A says ah, apple',
    'B': 'B says buh, ball',
    'C': 'C says kuh, cat',
    'D': 'D says duh, dog',
    'E': 'E says eh, egg',
    'F': 'F says fff, fish',
    'G': 'G says guh, goat',
    'H': 'H says huh, hat',
    'I': 'I says ih, igloo',
    'J': 'J says juh, jump',
    'K': 'K says kuh, kite',
    'L': 'L says lll, lion',
    'M': 'M says mmm, moon',
    'N': 'N says nnn, nest',
    'O': 'O says ah, octopus',
    'P': 'P says puh, pig',
    'Q': 'Q says kwuh, queen',
    'R': 'R says rrr, rabbit',
    'S': 'S says sss, sun',
    'T': 'T says tuh, tree',
    'U': 'U says uh, umbrella',
    'V': 'V says vvv, van',
    'W': 'W says wuh, water',
    'X': 'X says ks, fox',
    'Y': 'Y says yuh, yellow',
    'Z': 'Z says zzz, zebra',
}


def gen_mp3(text, out_path, voice_id, env, retries=3):
    if out_path.exists() and out_path.stat().st_size > 500:
        return 'skip'
    url = env.get('MINIMAX_BASE_URL', 'https://api.minimax.chat/v1') + '/t2a_v2'
    payload = {
        'model': env.get('MINIMAX_MODEL', 'speech-2.8-hd'),
        'text': text,
        'voice_setting': {'voice_id': voice_id, 'speed': 0.95, 'pitch': 0, 'vol': 1.0, 'emotion': 'happy'},
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
                print(f"  [FAIL] {out_path.name}: {msg}")
                return 'fail'
            audio = j.get('data', {}).get('audio')
            if not audio: return 'fail'
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(bytes.fromhex(audio))
            return 'ok'
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [EXC] {out_path.name}: {e}")
                return 'fail'
            time.sleep(2)
    return 'fail'


def main():
    env = load_env()
    VOICE = 'English_magnetic_voiced_man'
    stats = {'ok': 0, 'skip': 0, 'fail': 0}

    print('=== 字母名 · 26 条 ===')
    for L, text in LETTER_NAMES.items():
        out = L_DIR / f'{L}.mp3'
        r = gen_mp3(text, out, VOICE, env)
        stats[r] = stats.get(r, 0) + 1
        print(f'  [{r:4s}] {L} → "{text}"')
        time.sleep(0.3)

    print('\n=== 字母音 · 26 条 ===')
    for L, text in PHONEMES.items():
        out = P_DIR / f'{L}.mp3'
        r = gen_mp3(text, out, VOICE, env)
        stats[r] = stats.get(r, 0) + 1
        print(f'  [{r:4s}] {L} → "{text}"')
        time.sleep(0.3)

    print(f'\n[Done] ok={stats["ok"]}  skip={stats["skip"]}  fail={stats["fail"]}')


if __name__ == '__main__':
    main()
