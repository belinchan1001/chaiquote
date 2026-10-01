#!/usr/bin/env python3
"""Resize the adaptive launcher source into Bubblewrap mipmaps.

`android/icons/icon-512-adaptive.png` is already scaled inward so Android's
adaptive mask (safe circle 66dp inside the 108dp layer) still shows the blue
ring. These bitmaps fill that 108dp layer. Do not also apply Bubblewrap's
8.5dp inset — that padding is for a full-bleed maskable icon and would shrink
this artwork a second time.

`android/store_icon.png` is the Play Console listing icon (blue to the edges).
This script does not write it. 阿祺 uploads that file in Play Console; it is
not the home-screen icon.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "android/icons/icon-512-adaptive.png"
RES = ROOT / "android/app/src/main/res"

# 108dp adaptive-icon layer at each launcher density.
MASKABLE = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}


def generate() -> None:
    src = Image.open(SOURCE).convert("RGBA")
    if src.size != (512, 512):
        raise SystemExit(f"{SOURCE} must be 512x512, got {src.size}")
    for folder, size in MASKABLE.items():
        dest = RES / folder / "ic_maskable.png"
        src.resize((size, size), Image.Resampling.LANCZOS).save(dest)


if __name__ == "__main__":
    try:
        generate()
    except Exception as err:
        print(err, file=sys.stderr)
        raise SystemExit(1) from err
