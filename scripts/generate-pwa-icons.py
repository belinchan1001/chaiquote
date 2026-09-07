#!/usr/bin/env python3
"""Rasterize 齊Quote maskable PNG icons (full-bleed blue, logo in the safe zone)."""

from __future__ import annotations

import struct
import zlib
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "__grok"

BLUE = (0x15, 0x57, 0xC4, 255)
WHITE = (0xF4, 0xF8, 0xFF, 255)
CYAN = (0x00, 0xA8, 0xC5, 255)


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


def render_logo(size: int, *, maskable: bool) -> bytearray:
    """Draw the 32×32 lockup. Maskable: full-bleed blue, mark in the inner ~70%."""
    pixels = bytearray(size * size * 4)
    inset = 0.15 if maskable else 0.0
    origin = size * inset
    scale = size * (1 - 2 * inset) / 32.0

    for y in range(size):
        for x in range(size):
            # Sample at pixel center in logo space.
            lx = (x + 0.5 - origin) / scale
            ly = (y + 0.5 - origin) / scale
            color = BLUE
            if 0 <= lx < 32 and 0 <= ly < 32:
                if not maskable and not rounded_rect(lx, ly, 0, 0, 32, 32, 9):
                    color = (0, 0, 0, 0)
                else:
                    # Right quote on top (matches favicon.svg paint order).
                    if rounded_rect(lx, ly, 6, 8, 11, 16, 3.5):
                        color = WHITE
                    if rounded_rect(lx, ly, 15, 8, 11, 16, 3.5):
                        color = CYAN
                    if circle(lx, ly, 11.5, 13.5, 1.7):
                        color = BLUE
                    if circle(lx, ly, 20.5, 13.5, 1.7):
                        color = WHITE
            elif maskable:
                color = BLUE
            else:
                color = (0, 0, 0, 0)
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes(color)
    return pixels


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_png(OUT_DIR / "icon-192-maskable.png", 192, 192, render_logo(192, maskable=True))
    write_png(OUT_DIR / "icon-512-maskable.png", 512, 512, render_logo(512, maskable=True))
    shutil.copyfile(ROOT / "public" / "apple-touch-icon.png", OUT_DIR / "icon-180.png")
    print("wrote", OUT_DIR / "icon-192-maskable.png")
    print("wrote", OUT_DIR / "icon-512-maskable.png")
    print("copied", OUT_DIR / "icon-180.png")


if __name__ == "__main__":
    main()
