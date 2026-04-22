"""
gen-letters-edge.py · Edge TTS 重生 26 字母音频(覆盖 MiniMax 版)

输出:audio/letters/A.mp3 ~ Z.mp3
备份:audio/letters_minimax_backup/
声源:en-US-GuyNeural(经典美男,字母清晰有力)
速度:-15% (比单词 -40% 快,但仍清晰)
"""
import asyncio
import pathlib
import shutil

import edge_tts

BASE = pathlib.Path(__file__).resolve().parent.parent
LETTERS = BASE / "audio" / "letters"
BACKUP = BASE / "audio" / "letters_minimax_backup"
VOICE = "en-US-GuyNeural"
RATE  = "-15%"


async def main():
    if LETTERS.exists() and not BACKUP.exists():
        shutil.copytree(LETTERS, BACKUP)
        print(f"[Backup] {BACKUP}")
    LETTERS.mkdir(parents=True, exist_ok=True)

    for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        out = LETTERS / f"{c}.mp3"
        try:
            comm = edge_tts.Communicate(c, VOICE, rate=RATE)
            await comm.save(str(out))
            size = out.stat().st_size
            print(f"  [ok] {c}  ({size}b)")
        except Exception as e:
            print(f"  [FAIL] {c}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
