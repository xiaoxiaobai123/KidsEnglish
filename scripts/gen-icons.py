"""
gen-icons.py · 给 PWA 生成 3 个必需的 icon

产出:
  icons/icon-192.png         · 192x192 主图标
  icons/icon-512.png         · 512x512 主图标
  icons/icon-maskable-512.png· 512x512 可遮罩版(Android 安全边距更大)

设计:
  黄橙渐变圆角方块 + 笑脸 emoji + "英语" 中文
  颜色取自 manifest.json 的 theme_color #FFB84D
"""
import pathlib
from PIL import Image, ImageDraw, ImageFont

BASE = pathlib.Path(__file__).resolve().parent.parent
OUT = BASE / "icons"
OUT.mkdir(parents=True, exist_ok=True)


def make_icon(size, out_path, maskable=False):
    # 可遮罩版的 logo 只能占中心 80%,给 Android 的圆形剪裁留空间
    inner_pct = 0.6 if maskable else 0.88
    margin = int(size * (1 - inner_pct) / 2)

    img = Image.new("RGBA", (size, size), (255, 248, 231, 255))  # #FFF8E7 背景
    draw = ImageDraw.Draw(img)

    # 渐变圆角方块(偷懒:直接画实心橙色方块,圆角)
    corner_r = int(size * 0.18)
    inner = [margin, margin, size - margin, size - margin]
    draw.rounded_rectangle(inner, radius=corner_r, fill=(255, 184, 77, 255))

    # 加描边黑线
    draw.rounded_rectangle(inner, radius=corner_r, outline=(42, 42, 42, 255), width=max(4, size // 64))

    # 中央 emoji "😆"(以字体栅格化,需要 fallback)
    # Windows 上有 Segoe UI Emoji,Win 10+ 自带
    emoji = "😆"
    font_size = int(size * inner_pct * 0.55)
    emoji_font = None
    for fp in [
        "C:/Windows/Fonts/seguiemj.ttf",  # Segoe UI Emoji
        "C:/Windows/Fonts/seguisym.ttf",
        "/System/Library/Fonts/Apple Color Emoji.ttc",
    ]:
        if pathlib.Path(fp).exists():
            try:
                emoji_font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                continue

    if emoji_font:
        bbox = draw.textbbox((0, 0), emoji, font=emoji_font, embedded_color=True)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        pos = ((size - w) // 2 - bbox[0], (size - h) // 2 - bbox[1])
        try:
            draw.text(pos, emoji, font=emoji_font, embedded_color=True)
        except Exception:
            draw.text(pos, emoji, font=emoji_font, fill=(42, 42, 42, 255))
    else:
        # fallback: 画一个简笔笑脸
        cx, cy = size // 2, size // 2
        r = int(size * 0.22)
        draw.ellipse([cx - r, cy - r - int(r*0.1), cx + r, cy + r - int(r*0.1)], outline=(42,42,42,255), width=max(4,size//48))
        # 眼睛
        er = max(6, size // 48)
        draw.ellipse([cx - r//2 - er, cy - r//4 - er, cx - r//2 + er, cy - r//4 + er], fill=(42,42,42,255))
        draw.ellipse([cx + r//2 - er, cy - r//4 - er, cx + r//2 + er, cy - r//4 + er], fill=(42,42,42,255))
        # 嘴
        draw.arc([cx - r//2, cy - r//4, cx + r//2, cy + r//2], start=20, end=160, fill=(42,42,42,255), width=max(4,size//48))

    img.save(out_path, "PNG")
    print(f"  [ok] {out_path.name} ({out_path.stat().st_size} bytes)")


make_icon(192, OUT / "icon-192.png")
make_icon(512, OUT / "icon-512.png")
make_icon(512, OUT / "icon-maskable-512.png", maskable=True)

print(f"\n完成 · 保存到 {OUT}")
