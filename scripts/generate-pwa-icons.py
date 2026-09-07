#!/usr/bin/env python3
"""Rasterize 齊Quote maskable PNG icons.

Maskable assets are full-bleed #1557C4 with the quote mark scaled to fill
the Android adaptive-icon safe zone (~80% of the canvas), not the whole
32×32 lockup (that left a near-blank blue field).
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "__grok"

BLUE = (0x15, 0x57, 0xC4, 255)
WHITE = (0xF4, 0xF8, 0xFF, 255)
CYAN = (0x00, 0xA8, 0xC5, 255)

# Quote mark in the 32×32 lockup (excludes the outer rounded tile).
MARK_X, MARK_Y, MARK_W, MARK_H = 6.0, 8.0, 20.0, 16.0
# Android maskable safe zone is the inner ~80% (10% padding each side).
SAFE_ZONE = 0.80
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


def sample_mark(lx: float, ly: float) -> tuple[int, int, int, int]:
    """Paint the two quote tiles in lockup space; default is brand blue."""
    color = BLUE
    if rounded_rect(lx, ly, 6, 8, 11, 16, 3.5):
        color = WHITE
    if rounded_rect(lx, ly, 15, 8, 11, 16, 3.5):
        color = CYAN
    if circle(lx, ly, 11.5, 13.5, 1.7):
        color = BLUE
    if circle(lx, ly, 20.5, 13.5, 1.7):
        color = WHITE
    return color


def render_maskable(size: int) -> bytearray:
    """Full-bleed blue; mark uniformly scaled to the inner SAFE_ZONE square."""
    target = size * SAFE_ZONE
    scale = target / max(MARK_W, MARK_H)
    drawn_w = MARK_W * scale
    drawn_h = MARK_H * scale
    origin_x = (size - drawn_w) / 2.0 - MARK_X * scale
    origin_y = (size - drawn_h) / 2.0 - MARK_Y * scale

    hi = size * SAMPLES
    big = bytearray(hi * hi * 4)
    for y in range(hi):
        for x in range(hi):
            px = (x + 0.5) / SAMPLES
            py = (y + 0.5) / SAMPLES
            lx = (px - origin_x) / scale
            ly = (py - origin_y) / scale
            color = sample_mark(lx, ly)
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


def mark_coverage(pixels: bytearray, size: int) -> float:
    """Fraction of inner-80% pixels that are not solid brand blue."""
    pad = int(size * 0.10)
    total = 0
    marked = 0
    for y in range(pad, size - pad):
        for x in range(pad, size - pad):
            i = (y * size + x) * 4
            total += 1
            if pixels[i : i + 3] != bytes(BLUE[:3]):
                marked += 1
    return marked / total if total else 0.0


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for size, name in ((192, "icon-192-maskable.png"), (512, "icon-512-maskable.png")):
        pixels = render_maskable(size)
        coverage = mark_coverage(pixels, size)
        if coverage < 0.18:
            raise SystemExit(f"{name}: mark coverage {coverage:.1%} is too low (near-blank)")
        path = OUT_DIR / name
        write_png(path, size, size, pixels)
        print(f"wrote {path} coverage={coverage:.1%} bytes={path.stat().st_size}")


if __name__ == "__main__":
    main()
