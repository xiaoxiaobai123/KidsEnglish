"""
gen-tangtang-audio.py
生成糖糖姐(中文女声)奖励语音 + 英文单词拼读三连

输出:
  audio/tangtang/*.mp3  (中文奖励)
  audio/spell/*.mp3     (英文拼读三连)
"""
import hashlib
import json
import pathlib
import re
import sys
import time
import requests

BASE = pathlib.Path(__file__).resolve().parent.parent
T_DIR = BASE / 'audio' / 'tangtang'
S_DIR = BASE / 'audio' / 'spell'
T_DIR.mkdir(parents=True, exist_ok=True)
S_DIR.mkdir(parents=True, exist_ok=True)


def load_env():
    env = {}
    for line in (BASE / '.env').read_text(encoding='utf-8').splitlines():
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()
    return env


# —— 糖糖姐 · 中文奖励语音库 ——
TANGTANG = {
    # 答对类(随机 1 条)
    'correct_1':  '太棒啦!',
    'correct_2':  '对了对了!',
    'correct_3':  '你真聪明!',
    'correct_4':  '记住啦!',
    'correct_5':  '你是小天才!',
    'correct_6':  '厉害厉害!',
    'correct_7':  '你今天好棒!',
    'correct_8':  '爸爸妈妈会很开心!',
    'correct_9':  '拼对了!超级棒!',

    # 连对奖励
    'streak_2':  '连对两个啦!',
    'streak_3':  '连对三个!厉害!',
    'streak_5':  '连对五个,记单词小王子出场!奖励三分!',

    # 里程碑
    'mile_10':   '哇!你记住了十个新词啦!',
    'mile_30':   '三十个新词!超过 Cat 老师啦!',
    'mile_50':   '五十个新词!爸爸妈妈应该给你一个大拥抱!',
    'mile_100':  '一百词大师诞生啦!今晚求爸爸妈妈加个小礼物!',

    # 错题安慰
    'wrong_1':   '没关系,再试一次!',
    'wrong_2':   '这个词有点难,我们再记一下!',
    'wrong_3':   '没问题,我陪你一起记!',
    'wrong_4':   '再拼一次就记住啦!',
    'wrong_5':   '爸爸妈妈相信你!',

    # 突袭开场
    'popquiz_1': '突袭拼写!这个词你真记住了吗?',
    'popquiz_2': '小考验来啦,接招!',
    'popquiz_3': '等等,我们先拼一个词!',
    'popquiz_4': '叮咚!糖糖姐突袭啦!',
}


def gen_mp3(text, out_path, voice_id, env, retries=3):
    if out_path.exists() and out_path.stat().st_size > 500:
        return 'skip'
    url = env.get('MINIMAX_BASE_URL', 'https://api.minimax.chat/v1') + '/t2a_v2'
    payload = {
        'model': env.get('MINIMAX_MODEL', 'speech-2.8-hd'),
        'text': text,
        'voice_setting': {
            'voice_id': voice_id,
            'speed': 1.0, 'pitch': 0, 'vol': 1.0, 'emotion': 'happy',
        },
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


def extract_vocab(vocab_path):
    """从 data-vocab.js 抽核心词 id + en"""
    content = pathlib.Path(vocab_path).read_text(encoding='utf-8')
    # 匹配 core 数组段
    m = re.search(r'core:\s*\[([\s\S]*?)\n\s*\]', content)
    if not m: return []
    block = m.group(1)
    pairs = []
    id_rx = re.compile(r'\bid:\s*[\'\"](\w+)[\'\"]')
    en_rx = re.compile(r'\ben:\s*\"([^\"]+)\"')
    ids = id_rx.findall(block)
    ens = en_rx.findall(block)
    n = min(len(ids), len(ens))
    return list(zip(ids[:n], ens[:n]))


def format_spell_text(en):
    """把 'cool' 格式化成 'cool. C. O. O. L. cool.' 让 MiniMax 念拼读三连"""
    # 去标点
    word = re.sub(r"[^a-zA-Z]", '', en).strip()
    if not word:
        return en
    letters = '. '.join(word.upper())
    return f"{en}. {letters}. {en}."


def main():
    env = load_env()
    TANGTANG_VOICE = 'female-tianmei'
    ENGLISH_VOICE  = 'English_magnetic_voiced_man'

    stats = {'ok': 0, 'skip': 0, 'fail': 0}

    print('=== 1. 糖糖姐中文奖励 ===')
    for key, text in TANGTANG.items():
        out = T_DIR / f'{key}.mp3'
        r = gen_mp3(text, out, TANGTANG_VOICE, env)
        stats[r] = stats.get(r, 0) + 1
        print(f'  [{r:4s}] {key}: "{text[:30]}"')
        time.sleep(0.3)

    print('\n=== 2. 英文拼读三连 ===')
    pairs = extract_vocab(BASE / 'data-vocab.js')
    print(f'  Found {len(pairs)} core words')
    for i, (vid, en) in enumerate(pairs):
        out = S_DIR / f'{vid}.mp3'
        text = format_spell_text(en)
        r = gen_mp3(text, out, ENGLISH_VOICE, env)
        stats[r] = stats.get(r, 0) + 1
        if (i + 1) % 10 == 0 or r == 'fail':
            print(f'  [{i+1}/{len(pairs)}] [{r:4s}] {vid}: "{text[:50]}"')
        time.sleep(0.3)

    # 写 manifest
    manifest = {
        'tangtang_voice': TANGTANG_VOICE,
        'spell_voice': ENGLISH_VOICE,
        'tangtang': sorted([p.stem for p in T_DIR.glob('*.mp3')]),
        'spell':    sorted([p.stem for p in S_DIR.glob('*.mp3')]),
        'tangtang_text': TANGTANG,
    }
    (BASE / 'audio' / 'tangtang-spell-manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8'
    )

    print(f'\n[Done] ok={stats["ok"]}  skip={stats["skip"]}  fail={stats["fail"]}')
    print(f'  tangtang: {len(manifest["tangtang"])}')
    print(f'  spell:    {len(manifest["spell"])}')


if __name__ == '__main__':
    main()
