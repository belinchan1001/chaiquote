#!/usr/bin/env python3
"""Rasterize 齊Quote PWA icons.

Maskable + any-purpose assets draw a *bold* quote mark that fills ~78% of
the canvas (not the sparse 32×32 lockup, whose 20×16 bbox looked like a
tiny glyph on a blue field). Background is solid #1557C4.
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


def write_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
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
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


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


def emit(path: Path, size: int, *, rounded_tile: bool) -> None:
    pixels = render(size, rounded_tile=rounded_tile)
    span_w, span_h, coverage = mark_extent(pixels, size)
    if span_w < 0.70 or span_h < 0.70:
        raise SystemExit(
            f"{path.name}: mark span {span_w:.0%}×{span_h:.0%} is still sparse "
            f"(need ≥70% of canvas on both axes)"
        )
    if coverage < 0.40:
        raise SystemExit(f"{path.name}: inner coverage {coverage:.1%} is too low")
    write_png(path, size, size, pixels)
    print(
        f"wrote {path} span={span_w:.0%}×{span_h:.0%} "
        f"coverage={coverage:.1%} bytes={path.stat().st_size}"
    )


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
    emit(OUT / "favicon-32.png", 32, rounded_tile=True)


if __name__ == "__main__":
    main()
