#!/usr/bin/env python3
"""Rasterize 齊Quote PWA icons and site favicons.

Maskable + any-purpose assets draw a *bold* quote mark that fills ~78% of
the canvas (not the sparse 32×32 lockup, whose 20×16 bbox looked like a
tiny glyph on a blue field). Background is solid #1557C4.

Favicons reuse the same mark: rounded-tile PNG at 32/48/96, plus a
multi-size ICO (16/32/48) at the site root for crawlers such as Google.
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public"
GROK = OUT / "__grok"

BLUE = (0x15, 0x57, 0xC4, 255)
WHITE = (0xF4, 0xF8, 0xFF, 255)
CYAN = (0x00, 0xA8, 0xC5, 255)
CLEAR = (0, 0, 0, 0)

# Padding → mark box is 78% of the canvas on both axes (visually ~70–80%).
MARK_PAD = 0.11
# Each capsule is thicker than the 32×32 lockup (11/20), so the pair reads bold.
PILL_W = 0.60
SAMPLES = 2


def png_bytes(width: int, height: int, pixels: bytearray) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(pixels[y * stride : (y + 1) * stride])
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def write_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
    path.write_bytes(png_bytes(width, height, pixels))


def ico_bmp32(size: int, pixels: bytearray) -> bytes:
    """Classic 32-bit ICO image (BITMAPINFOHEADER + BGRA XOR + AND mask)."""
    xor = bytearray()
    for y in range(size - 1, -1, -1):
        row = y * size * 4
        for x in range(size):
            i = row + x * 4
            xor.extend((pixels[i + 2], pixels[i + 1], pixels[i], pixels[i + 3]))
    row_bytes = ((size + 31) // 32) * 4
    and_mask = bytearray()
    for y in range(size - 1, -1, -1):
        row = bytearray(row_bytes)
        base = y * size * 4
        for x in range(size):
            if pixels[base + x * 4 + 3] < 128:
                row[x // 8] |= 0x80 >> (x % 8)
        and_mask.extend(row)
    header = struct.pack(
        "<IiiHHIIiiII",
        40,
        size,
        size * 2,
        1,
        32,
        0,
        len(xor) + len(and_mask),
        0,
        0,
        0,
        0,
    )
    return header + bytes(xor) + bytes(and_mask)


def write_ico(path: Path, images: list[tuple[int, bytearray]]) -> None:
    count = len(images)
    offset = 6 + 16 * count
    entries = bytearray()
    payloads: list[bytes] = []
    for size, pixels in images:
        payload = ico_bmp32(size, pixels)
        payloads.append(payload)
        dim = 0 if size >= 256 else size
        entries.extend(struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, 32, len(payload), offset))
        offset += len(payload)
    path.write_bytes(struct.pack("<HHH", 0, 1, count) + bytes(entries) + b"".join(payloads))


def rounded_rect(px: float, py: float, x: float, y: float, w: float, h: float, r: float) -> bool:
    if px < x or py < y or px >= x + w or py >= y + h:
        return False
    cx = min(max(px, x + r), x + w - r)
    cy = min(max(py, y + r), y + h - r)
    dx = px - cx
    dy = py - cy
    return dx * dx + dy * dy <= r * r


def circle(px: float, py: float, cx: float, cy: float, r: float) -> bool:
    dx = px - cx
    dy = py - cy
    return dx * dx + dy * dy <= r * r


def sample_bold_mark(nx: float, ny: float) -> tuple[int, int, int, int]:
    """nx, ny in 0..1 canvas space. Full-bleed blue + large centered quotes."""
    color = BLUE
    box0 = MARK_PAD
    box1 = 1.0 - MARK_PAD
    box = box1 - box0
    if box <= 0:
        return color

    pill_w = box * PILL_W
    pill_h = box
    left_x = box0
    right_x = box1 - pill_w
    pill_y = box0
    radius = pill_w * 0.32
    # Dots sit in the upper third, same relative place as the lockup.
    dot_r = pill_w * 0.155
    left_dot = (left_x + pill_w * 0.50, pill_y + pill_h * 0.34)
    right_dot = (right_x + pill_w * 0.50, pill_y + pill_h * 0.34)

    if rounded_rect(nx, ny, left_x, pill_y, pill_w, pill_h, radius):
        color = WHITE
    if rounded_rect(nx, ny, right_x, pill_y, pill_w, pill_h, radius):
        color = CYAN
    if circle(nx, ny, left_dot[0], left_dot[1], dot_r):
        color = BLUE
    if circle(nx, ny, right_dot[0], right_dot[1], dot_r):
        color = WHITE
    return color


def render(size: int, *, rounded_tile: bool) -> bytearray:
    hi = size * SAMPLES
    big = bytearray(hi * hi * 4)
    tile_r = 0.22  # iOS-style squircle on any-purpose icons
    for y in range(hi):
        for x in range(hi):
            nx = (x + 0.5) / hi
            ny = (y + 0.5) / hi
            if rounded_tile and not rounded_rect(nx, ny, 0.0, 0.0, 1.0, 1.0, tile_r):
                color = CLEAR
            else:
                color = sample_bold_mark(nx, ny)
            i = (y * hi + x) * 4
            big[i : i + 4] = bytes(color)

    if SAMPLES == 1:
        return big

    out = bytearray(size * size * 4)
    n = SAMPLES * SAMPLES
    for y in range(size):
        for x in range(size):
            acc = [0, 0, 0, 0]
            for dy in range(SAMPLES):
                for dx in range(SAMPLES):
                    i = ((y * SAMPLES + dy) * hi + (x * SAMPLES + dx)) * 4
                    acc[0] += big[i]
                    acc[1] += big[i + 1]
                    acc[2] += big[i + 2]
                    acc[3] += big[i + 3]
            o = (y * size + x) * 4
            out[o] = acc[0] // n
            out[o + 1] = acc[1] // n
            out[o + 2] = acc[2] // n
            out[o + 3] = acc[3] // n
    return out


def mark_extent(pixels: bytearray, size: int) -> tuple[float, float, float]:
    """Width span, height span, and inner-80% non-blue coverage."""
    min_x, max_x, min_y, max_y = size, -1, size, -1
    pad = int(size * 0.10)
    for y in range(size):
        for x in range(size):
            i = (y * size + x) * 4
            if pixels[i + 3] < 16:
                continue
            if pixels[i : i + 3] == bytes(BLUE[:3]):
                continue
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)
    inner_total = 0
    inner_marked = 0
    for y in range(pad, size - pad):
        for x in range(pad, size - pad):
            i = (y * size + x) * 4
            inner_total += 1
            if pixels[i : i + 3] != bytes(BLUE[:3]) and pixels[i + 3] > 16:
                inner_marked += 1
    span_w = (max_x - min_x + 1) / size if max_x >= 0 else 0.0
    span_h = (max_y - min_y + 1) / size if max_y >= 0 else 0.0
    coverage = inner_marked / inner_total if inner_total else 0.0
    return span_w, span_h, coverage


def assert_mark(label: str, pixels: bytearray, size: int) -> tuple[float, float, float]:
    span_w, span_h, coverage = mark_extent(pixels, size)
    if span_w < 0.70 or span_h < 0.70:
        raise SystemExit(
            f"{label}: mark span {span_w:.0%}×{span_h:.0%} is still sparse "
            f"(need ≥70% of canvas on both axes)"
        )
    if coverage < 0.40:
        raise SystemExit(f"{label}: inner coverage {coverage:.1%} is too low")
    return span_w, span_h, coverage


def emit(path: Path, size: int, *, rounded_tile: bool) -> bytearray:
    pixels = render(size, rounded_tile=rounded_tile)
    span_w, span_h, coverage = assert_mark(path.name, pixels, size)
    write_png(path, size, size, pixels)
    print(
        f"wrote {path} span={span_w:.0%}×{span_h:.0%} "
        f"coverage={coverage:.1%} bytes={path.stat().st_size}"
    )
    return pixels


def main() -> None:
    GROK.mkdir(parents=True, exist_ok=True)
    # Maskable: full-bleed square so Android can cut any shape.
    emit(GROK / "icon-192-maskable.png", 192, rounded_tile=False)
    emit(GROK / "icon-512-maskable.png", 512, rounded_tile=False)
    # Any-purpose / home-screen: same bold mark, iOS-style rounded tile.
    emit(OUT / "icon-192.png", 192, rounded_tile=True)
    emit(OUT / "icon-512.png", 512, rounded_tile=True)
    emit(OUT / "apple-touch-icon.png", 180, rounded_tile=False)
    emit(GROK / "icon-180.png", 180, rounded_tile=False)
    favicon_32 = emit(OUT / "favicon-32.png", 32, rounded_tile=True)
    favicon_48 = emit(OUT / "favicon-48.png", 48, rounded_tile=True)
    emit(OUT / "favicon-96.png", 96, rounded_tile=True)
    # Root ICO for crawlers that request /favicon.ico (Google wants a 48px square).
    favicon_16 = render(16, rounded_tile=True)
    assert_mark("favicon.ico 16", favicon_16, 16)
    ico_path = OUT / "favicon.ico"
    write_ico(ico_path, [(16, favicon_16), (32, favicon_32), (48, favicon_48)])
    print(f"wrote {ico_path} sizes=16,32,48 bytes={ico_path.stat().st_size}")


if __name__ == "__main__":
    main()
