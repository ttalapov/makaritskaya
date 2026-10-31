#!/usr/bin/env python3
"""Generate the site's photographs from the originals in sources/.

    python tools/photos.py

sources/ is gitignored and never deployed: the full frame shows the child.
Only the two crops below reach assets/img/.

The cut-out's mask was drawn on the 960px frame. It is scaled up to the larger
original and its pixels taken from there, so the portrait gains the real
detail while keeping the hand-made outline.

Needs: pillow, numpy.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "sources"
OUT = ROOT / "assets" / "img"

ORIGINAL = SOURCES / "makaritskaya-original-1500.jpg"
CUTOUT = SOURCES / "makaritskaya.png"

BASE_WIDTH = 960                    # the frame both sets of crops were defined on
CUTOUT_ORIGIN = (150, 150)          # where the cut-out sits on that frame
HERO_BOX = (253, 37, 587, 415)      # in cut-out pixels
ABOUT_BOX = (170, 170, 890, 1070)   # on the 960px frame, 4:5

HERO_WIDTHS = (240, 334, 522)       # 522 is the crop's native width: no upscale
ABOUT_WIDTHS = (480, 720, 1120)


def clean_edges(rgb, alpha):
    """Replace the colour under soft edges with the portrait's own, so hair does
    not carry the green of the leaves behind it onto the page's cream."""
    solid = alpha > 0.97
    weight = Image.fromarray((solid * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(5))
    w = np.asarray(weight, dtype=np.float32) / 255
    layers = []
    for c in range(3):
        channel = Image.fromarray((rgb[..., c] * solid).astype("uint8"))
        layers.append(np.asarray(channel.filter(ImageFilter.GaussianBlur(5)), dtype=np.float32))
    bled = np.stack(layers, axis=-1) / np.maximum(w[..., None], 1e-3)
    out = rgb.astype(np.float32)
    keep = (alpha[..., None] > 0.97) | (w[..., None] < 0.02)
    return np.where(keep, out, np.clip(bled, 0, 255))


def hero_master():
    frame = Image.open(ORIGINAL).convert("RGB")
    k = frame.width / BASE_WIDTH
    x0, y0, x1, y1 = HERO_BOX
    ox, oy = CUTOUT_ORIGIN
    box = tuple(round(v * k) for v in (x0 + ox, y0 + oy, x1 + ox, y1 + oy))
    size = (box[2] - box[0], box[3] - box[1])

    mask = Image.open(CUTOUT).convert("RGBA").getchannel("A").crop(HERO_BOX)
    mask = mask.resize(size, Image.BICUBIC)

    rgb = np.asarray(frame.crop(box), dtype=np.float32)
    a = np.asarray(mask, dtype=np.float32) / 255
    rgb = clean_edges(rgb, a)
    return Image.fromarray(np.dstack([rgb, a * 255]).round().astype("uint8"), "RGBA")


def about_master():
    frame = Image.open(ORIGINAL).convert("RGB")
    k = frame.width / BASE_WIDTH
    return frame.crop(tuple(round(v * k) for v in ABOUT_BOX))


def fit(image, width):
    height = round(image.height * width / image.width)
    if width == image.width:
        return image
    return image.resize((width, height), Image.LANCZOS)


def save_all(image, stem, width, fallback):
    img = fit(image, width)
    image_dir = OUT
    img.save(image_dir / f"{stem}-{width}.avif", quality=62, speed=4)
    img.save(image_dir / f"{stem}-{width}.webp", quality=80, method=6)
    if fallback == "png":
        img.save(image_dir / f"{stem}-{width}.png", optimize=True)
    else:
        img.convert("RGB").save(image_dir / f"{stem}-{width}.jpg", quality=82, optimize=True, progressive=True)


def main():
    hero, about = hero_master(), about_master()
    for w in HERO_WIDTHS:
        save_all(hero, "hero-yuliia", w, "png")
    for w in ABOUT_WIDTHS:
        save_all(about, "about-yuliia-son", w, "jpg")
    for f in sorted(OUT.glob("*yuliia*")):
        with Image.open(f) as i:
            print(f"  {f.name:32} {f.stat().st_size:>8}  {i.size}")


if __name__ == "__main__":
    main()
