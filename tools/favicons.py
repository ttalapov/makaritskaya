#!/usr/bin/env python3
"""Draw the favicons from the site's own font.

    python tools/favicons.py

Writes assets/img/favicon.ico, favicon-32.png and apple-touch-icon.png.

The monogram is centred on its painted extents - the ink itself, not the
font's metrics box, which is what left the previous icons sitting low and
clipped at the bottom edge. The background is the page's cream rather than
transparency: iOS composites a transparent icon on black, and a dark
monogram would vanish on a dark tab strip.

Needs: pillow, fonttools, brotli (the site ships woff2, which Pillow cannot
read directly).
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "fonts" / "cormorant-garamond-cyrillic.woff2"
OUT = ROOT / "assets" / "img"
TTF = ROOT / "tools" / ".fonts" / "cormorant-cyrillic.ttf"   # gitignored cache

CREAM = (250, 248, 244)      # --cream
INK = (30, 36, 32)           # --ink
SAGE = (110, 146, 124)       # --sage-deep
TEXT = "ЮМ"
WEIGHT = 600                 # the header logo's weight


def ttf():
    if not TTF.exists():
        TTF.parent.mkdir(parents=True, exist_ok=True)
        font = TTFont(str(SRC))
        font.flavor = None                 # woff2 in, plain ttf out
        font.save(str(TTF))
    return ImageFont.truetype


def font_at(px):
    f = ImageFont.truetype(str(TTF), px)
    try:
        f.set_variation_by_axes([WEIGHT])  # Cormorant ships as a variable font
    except Exception:
        pass                               # a static fallback still draws fine
    return f


def draw_icon(size, pad_ratio=0.1, text=TEXT):
    big = size * 8                         # draw large, downsample once
    canvas = Image.new("RGBA", (big, big), CREAM + (255,))
    fnt = font_at(int(big * 0.62))
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    y = big * 0.18
    if len(text) == 1:
        d.text((big * 0.3, y), text, font=fnt, fill=INK + (255,))
    else:
        first, second = text[0], text[1]
        w1 = d.textlength(first, font=fnt)
        w2 = d.textlength(second, font=fnt)
        overlap = w2 * 0.22                # the two letters interlock, as before
        x = (big - (w1 + w2 - overlap)) / 2
        d.text((x + w1 - overlap, y), second, font=fnt, fill=SAGE + (255,))
        d.text((x, y), first, font=fnt, fill=INK + (255,))

    ink = layer.crop(layer.getchannel("A").getbbox())
    inner = int(big * (1 - 2 * pad_ratio))
    scale = min(inner / ink.width, inner / ink.height)
    ink = ink.resize((round(ink.width * scale), round(ink.height * scale)), Image.LANCZOS)
    canvas.alpha_composite(ink, ((big - ink.width) // 2, (big - ink.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS).convert("RGB")


def main():
    ttf()
    draw_icon(32, pad_ratio=0.07).save(OUT / "favicon-32.png")
    draw_icon(180, pad_ratio=0.16).save(OUT / "apple-touch-icon.png")
    # 16px cannot carry two letters legibly, so that frame gets the Ю alone;
    # the browser picks a frame by size, and each is drawn for its own size
    frames = {16: draw_icon(16, pad_ratio=0.06, text=TEXT[0]),
              32: draw_icon(32, pad_ratio=0.07),
              48: draw_icon(48, pad_ratio=0.08)}
    # append_images carries each drawing as its own frame; passing `sizes` as
    # well would make Pillow downscale the base image instead and drop them
    frames[48].save(OUT / "favicon.ico", append_images=[frames[16], frames[32]])
    for name in ("favicon.ico", "favicon-32.png", "apple-touch-icon.png"):
        f = OUT / name
        print(f"  {name:22} {Image.open(f).size}  {f.stat().st_size} bytes")


if __name__ == "__main__":
    main()
