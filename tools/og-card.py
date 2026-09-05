#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenerate the Open Graph cards: python tools/og-card.py

Writes assets/img/og-<segment>.jpg, 1200x630, one per locale. Text is read from
content/<segment>.json, so the card cannot drift away from the page it
represents - change the name or the role there and re-run this.

Needs Pillow. Fonts are fetched from Google Fonts on first run and cached in
tools/.fonts/ (gitignored). The repo carries Cormorant as woff2, which Pillow
cannot read and fonttools is not installed to convert, so the WOFF 1.0 build is
fetched instead and unpacked here - it is an sfnt with zlib-compressed tables,
which needs nothing beyond struct and zlib.
"""
import json, os, re, struct, urllib.request, zlib
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'tools', '.fonts')
SEGMENTS = ('ua', 'ru')

W, H = 1200, 630
TEXT_LEFT, TEXT_MAX = 84, 590          # the portrait starts around x=700
CREAM      = (250, 248, 244)
SAGE       = (122, 158, 138)
SAGE_PALE  = (238, 244, 241)
SAGE_LIGHT = (200, 221, 210)
INK        = (30, 36, 32)
INK_MUTED  = (74, 86, 82)

SANS_CANDIDATES = [
    r'C:\Windows\Fonts\segoeui.ttf',
    r'C:\Windows\Fonts\arial.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
]
SAFARI5 = ('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-US) '
           'AppleWebKit/534.30 (KHTML, like Gecko) Version/5.1 Safari/534.30')


def woff_to_ttf(woff):
    """WOFF 1.0 is an sfnt whose tables are individually zlib-compressed."""
    sig, flavor, _, num_tables = struct.unpack('>4sIIH', woff[:14])
    assert sig == b'wOFF', 'not a WOFF file'
    entries, pos = [], 44
    for _ in range(num_tables):
        tag, off, comp_len, orig_len, csum = struct.unpack('>4sIIII', woff[pos:pos + 20])
        pos += 20
        raw = woff[off:off + comp_len]
        data = raw if comp_len == orig_len else zlib.decompress(raw)
        assert len(data) == orig_len, 'table %r has the wrong size' % tag
        entries.append((tag, csum, data))
    entries.sort(key=lambda e: e[0])
    sel = max(0, num_tables.bit_length() - 1)
    rng = (2 ** sel) * 16
    head = struct.pack('>IHHHH', flavor, num_tables, rng, sel, num_tables * 16 - rng)
    offset, directory, body = 12 + num_tables * 16, [], []
    for tag, csum, data in entries:
        directory.append(struct.pack('>4sIII', tag, csum, offset, len(data)))
        padded = data + b'\x00' * (-len(data) % 4)
        body.append(padded)
        offset += len(padded)
    return b''.join([head] + directory + body)


def cormorant(weight, size):
    os.makedirs(FONTS, exist_ok=True)
    path = os.path.join(FONTS, 'Cormorant-%d.ttf' % weight)
    if not os.path.exists(path):
        css = urllib.request.urlopen(urllib.request.Request(
            'https://fonts.googleapis.com/css?family=Cormorant+Garamond:%d'
            '&subset=cyrillic,latin' % weight,
            headers={'User-Agent': SAFARI5}), timeout=40).read().decode('utf-8')
        url = re.search(r'url\((https://[^)]+)\)', css).group(1)
        woff = urllib.request.urlopen(urllib.request.Request(
            url, headers={'User-Agent': SAFARI5}), timeout=40).read()
        open(path, 'wb').write(woff_to_ttf(woff))
        print('  fetched Cormorant %d -> %s' % (weight, path))
    return ImageFont.truetype(path, size)


def sans(size):
    for c in SANS_CANDIDATES:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    raise SystemExit('no sans-serif font found; add one to SANS_CANDIDATES')


def fit(loader, text, size, max_width, floor=18):
    """Largest size at or below `size` that keeps `text` within max_width."""
    while size > floor and loader(size).getlength(text) > max_width:
        size -= 1
    return loader(size)


def tracked(draw, xy, text, font, fill, tracking=0.0):
    """Pillow has no letter-spacing, so step glyph by glyph."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking


def tracked_width(text, font, tracking=0.0):
    return sum(font.getlength(ch) + tracking for ch in text) - tracking


def build(segment):
    hero = json.load(open(os.path.join(ROOT, 'content', '%s.json' % segment),
                          encoding='utf-8'))['hero']
    img = Image.new('RGB', (W, H), CREAM)

    blob = Image.new('L', (W, H), 0)
    ImageDraw.Draw(blob).ellipse([640, 20, 1180, 600], fill=255)
    img.paste(Image.new('RGB', (W, H), SAGE_PALE), (0, 0),
              blob.filter(ImageFilter.GaussianBlur(38)))

    p = Image.open(os.path.join(ROOT, 'assets', 'img', 'hero-yuliia-334.png')).convert('RGBA')
    ph = 505
    pw = round(p.width * ph / p.height)
    p = p.resize((pw, ph), Image.LANCZOS)

    # the crop ends in a hard line across the chest; the page hides that with a
    # css mask, so fade the alpha here the same way
    fade = Image.new('L', (pw, ph), 255)
    fd = ImageDraw.Draw(fade)
    span = int(ph * 0.16)
    for i in range(span):
        fd.line([(0, ph - span + i), (pw, ph - span + i)], fill=int(255 * (1 - i / span)))
    p.putalpha(ImageChops.multiply(p.getchannel('A'), fade))
    img.paste(p, (910 - pw // 2, H - 48 - ph), p)

    d = ImageDraw.Draw(img)
    x = TEXT_LEFT

    eyebrow = hero['eyebrow'].upper()
    f_eye = sans(19)
    while tracked_width(eyebrow, f_eye, 2.6) > TEXT_MAX - 64 and f_eye.size > 13:
        f_eye = sans(f_eye.size - 1)
    d.line([x, 207, x + 46, 207], fill=SAGE, width=2)
    tracked(d, (x + 64, 196), eyebrow, f_eye, SAGE, tracking=2.6)

    light = lambda sz: cormorant(300, sz)
    regular = lambda sz: cormorant(400, sz)

    longest = max(hero['nameFirst'], hero['nameLast'], key=len)
    f_name = fit(light, longest, 96, TEXT_MAX)
    d.text((x, 236), hero['nameFirst'], font=f_name, fill=INK)
    d.text((x, 340), hero['nameLast'], font=f_name, fill=SAGE)

    d.text((x, 472), hero['title'], font=fit(regular, hero['title'], 41, TEXT_MAX), fill=INK_MUTED)

    d.line([x, 546, x + 300, 546], fill=SAGE_LIGHT, width=1)
    tracked(d, (x, 566), 'MAKARITSKAYA.PP.UA', sans(17), INK_MUTED, tracking=2.2)

    out = os.path.join(ROOT, 'assets', 'img', 'og-%s.jpg' % segment)
    img.save(out, 'JPEG', quality=88, optimize=True, progressive=True)
    print('  %-24s %dx%d  %5.1f KB' % (os.path.relpath(out, ROOT), W, H,
                                       os.path.getsize(out) / 1024))


if __name__ == '__main__':
    for seg in SEGMENTS:
        build(seg)
    print('done - run `node build.mjs` to pick the new cards up')
