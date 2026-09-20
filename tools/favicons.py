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
FONTS = ROOT / "assets" / "fonts"
OUT = ROOT / "assets" / "img"
CACHE = ROOT / "tools" / ".fonts"                            # gitignored

CREAM = (250, 248, 244)      # --cream
INK = (30, 36, 32)           # --ink
SAGE = (110, 146, 124)       # --sage-deep
TEXT = "ЮМ"
# The hero sets the name upright and the surname in sage italic, both light;
# the monogram borrows exactly that pairing.
WEIGHT = 300


def ttf(italic=False):
    """Unpack one of the site's woff2 files; Pillow cannot read woff2."""
    name = f"cormorant{'-italic' if italic else ''}-cyrillic"
    out = CACHE / f"{name}.ttf"
    if not out.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        font = TTFont(str(FONTS / f"cormorant-garamond{'-italic' if italic else ''}-cyrillic.woff2"))
        font.flavor = None                 # woff2 in, plain ttf out
        font.save(str(out))
    return out


def font_at(px, weight=WEIGHT, italic=False):
    f = ImageFont.truetype(str(ttf(italic)), px)
    try:
        f.set_variation_by_axes([weight])  # Cormorant ships as a variable font
    except Exception:
        pass                               # a static fallback still draws fine
    return f


# The М slides over the Ю and sits lower, so the pair reads on a diagonal -
# the arrangement of the original icon, which this keeps.
OVERLAP = 0.65    # how far the second letter slides over the first
DROP = 0.16       # and how far it sits below it, as a share of the type size


def draw_icon(size, pad_ratio=0.1, text=TEXT, weight=WEIGHT, overlap=None, drop=None):
    big = size * 8                         # draw large, downsample once
    canvas = Image.new("RGBA", (big, big), CREAM + (255,))
    upright = font_at(int(big * 0.62), weight)
    cursive = font_at(int(big * 0.62), weight, italic=True)
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    y = big * 0.18
    if len(text) == 1:
        d.text((big * 0.3, y), text, font=upright, fill=INK + (255,))
    else:
        first, second = text[0], text[1]
        w1 = d.textlength(first, font=upright)
        w2 = d.textlength(second, font=cursive)
        over = w2 * (OVERLAP if overlap is None else overlap)
        dy = upright.size * (DROP if drop is None else drop)
        x = (big - (w1 + w2 - over)) / 2
        d.text((x + w1 - over, y + dy), second, font=cursive, fill=SAGE + (255,))
        d.text((x, y), first, font=upright, fill=INK + (255,))

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
    # every frame carries the ЮМ monogram, each drawn at its own size rather
    # than downscaled from one drawing. The 16px one is set heavier: at that
    # size the logo weight's thin serifs wash out to pale grey.
    frames = {16: draw_icon(16, pad_ratio=0.05, weight=700),
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
