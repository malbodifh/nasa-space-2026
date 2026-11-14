#!/usr/bin/env python3
"""
Alinea cutouts SPHEREx a una grilla común, calcula diferencia vs mediana
y genera contact sheets + GIF de blink.

Uso:
    python scripts/align_diff.py --slug wise-0855 --limit 10

Requiere que exista data/cache/<slug>/manifest.json (lo genera poc_spherex.py).
"""

from __future__ import annotations

import argparse
import json
import math
import time
from pathlib import Path

import numpy as np
import requests
from astropy.io import fits
from astropy.wcs import WCS
from PIL import Image, ImageDraw, ImageFont
from reproject import reproject_interp

USER_AGENT = "AstralCodes-SpaceApps2026/0.1 (educational)"


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def http_get(url: str, timeout: int = 180, retries: int = 4) -> requests.Response:
    last = None
    for attempt in range(retries):
        try:
            r = requests.get(url, timeout=timeout, headers={"User-Agent": USER_AGENT})
            if r.status_code == 200:
                return r
            last = RuntimeError(f"HTTP {r.status_code}")
        except Exception as exc:  # noqa: BLE001
            last = exc
        sleep = 2**attempt
        log(f"  retry {attempt + 1}/{retries} in {sleep}s: {last}")
        time.sleep(sleep)
    raise RuntimeError(f"failed {url}: {last}")


def fetch_fits(url: str, path: Path) -> Path:
    if path.exists() and path.stat().st_size > 100_000:
        return path
    r = http_get(url)
    path.write_bytes(r.content)
    return path


def normalize(image: np.ndarray, lo: float = 5.0, hi: float = 99.5) -> np.ndarray:
    finite = image[np.isfinite(image)]
    if finite.size == 0:
        return np.zeros_like(image, dtype="float32")
    vmin, vmax = np.nanpercentile(finite, [lo, hi])
    if not np.isfinite(vmin) or not np.isfinite(vmax) or vmax <= vmin:
        return np.zeros_like(image, dtype="float32")
    norm = np.clip((image - vmin) / (vmax - vmin), 0, 1)
    return np.nan_to_num(norm, nan=0.0, posinf=1.0, neginf=0.0).astype("float32")


def save_gray(image: np.ndarray, path: Path, size: int = 256) -> None:
    arr = (normalize(image) * 255).astype("uint8")
    img = Image.fromarray(arr, mode="L").resize((size, size), Image.Resampling.BILINEAR)
    img.convert("RGB").save(path)


def save_diverging(diff: np.ndarray, path: Path, size: int = 256, lim: float | None = None) -> None:
    """Diferencia con 0=negro, negativo=azul, positivo=rojo."""
    finite = diff[np.isfinite(diff)]
    if finite.size == 0:
        Image.new("RGB", (size, size), (0, 0, 0)).save(path)
        return
    if lim is None:
        vmin, vmax = np.nanpercentile(finite, [1, 99])
        lim = max(abs(vmin), abs(vmax), 1e-6)
    t = np.clip(diff / lim, -1, 1)
    t = np.nan_to_num(t, nan=0.0)
    r = np.where(t > 0, 255 * t, 0)
    b = np.where(t < 0, 255 * (-t), 0)
    rgb = np.dstack([r, np.zeros_like(r), b]).astype("uint8")
    Image.fromarray(rgb, mode="RGB").resize((size, size), Image.Resampling.BILINEAR).save(path)


def contact_sheet(items: list[tuple[Path, str]], path: Path, cols: int = 5) -> None:
    if not items:
        return
    thumb = 256
    label_h = 34
    rows = math.ceil(len(items) / cols)
    sheet = Image.new("RGB", (cols * thumb, rows * (thumb + label_h)), (12, 12, 16))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 13)
    except Exception:  # noqa: BLE001
        font = ImageFont.load_default()
    for i, (p, label) in enumerate(items):
        img = Image.open(p).convert("RGB")
        x = (i % cols) * thumb
        y = (i // cols) * (thumb + label_h)
        sheet.paste(img, (x, y))
        draw.text((x + 6, y + thumb + 6), label, fill=(230, 230, 230), font=font)
    sheet.save(path)
    log(f"contact sheet: {path}")


def make_gif(frames: list[Path], path: Path, duration: int = 450) -> None:
    imgs = [Image.open(p).convert("RGB") for p in frames]
    if not imgs:
        return
    imgs[0].save(path, save_all=True, append_images=imgs[1:], duration=duration, loop=0)
    log(f"gif: {path}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", default="wise-0855")
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--size", type=float, default=0.1)
    ap.add_argument("--out-size", type=int, default=64)
    ap.add_argument("--pixscale", type=float, default=6.15, help="arcsec/pixel")
    args = ap.parse_args()

    base = Path("data/cache") / args.slug
    manifest = json.loads((base / "manifest.json").read_text(encoding="utf-8"))
    target = manifest["target"]
    frames = manifest["frames"][: args.limit]
    fits_dir = base / "fits"
    fits_dir.mkdir(parents=True, exist_ok=True)

    # WCS común: norte arriba, centrado en el target.
    out_wcs = WCS(naxis=2)
    out_wcs.wcs.crpix = [args.out_size / 2 + 0.5, args.out_size / 2 + 0.5]
    out_wcs.wcs.crval = [target["ra"], target["dec"]]
    out_wcs.wcs.cdelt = [-args.pixscale / 3600.0, args.pixscale / 3600.0]
    out_wcs.wcs.ctype = ["RA---TAN", "DEC--TAN"]

    aligned: list[np.ndarray] = []
    labels: list[str] = []
    aligned_paths: list[Path] = []

    for frame in frames:
        url = f"{frame['access_url']}?center={target['ra']},{target['dec']}&size={args.size}"
        path = fits_dir / f"{frame['index']:03d}.fits"
        log(f"frame {frame['index']:02d} {frame['date_utc'][:10]} {frame['obs_id']}")
        fetch_fits(url, path)
        with fits.open(path) as hdul:
            image = np.array(hdul["IMAGE"].data, dtype="float32")
            wcs = WCS(hdul["IMAGE"].header)
        arr, _ = reproject_interp((image, wcs), out_wcs, shape_out=(args.out_size, args.out_size))
        # Restar el fondo de cada exposición (mediana robusta).
        arr = arr - np.nanmedian(arr)
        aligned.append(arr)
        labels.append(f"{frame['date_utc'][:10]}  {frame['detector']}")
        p = base / f"aligned_{frame['index']:03d}.png"
        save_gray(arr, p)
        aligned_paths.append(p)

    cube = np.stack(aligned, axis=0)
    stack = np.nanmedian(cube, axis=0)
    save_gray(stack, base / "stack.png")

    # Ruido robusto global (MAD) para expresar la diferencia en sigmas.
    resid = cube - stack
    med = np.nanmedian(resid)
    sigma = 1.4826 * np.nanmedian(np.abs(resid - med))
    sigma = max(float(sigma), 1e-6)
    log(f"sigma robusto = {sigma:.4g}")

    diff_paths: list[Path] = []
    diff_items: list[tuple[Path, str]] = []
    for i, arr in enumerate(aligned):
        diff = (arr - stack) / sigma
        p = base / f"diff_{i:03d}.png"
        save_diverging(diff, p, lim=5.0)
        diff_paths.append(p)
        diff_items.append((p, labels[i]))

    contact_sheet([(p, labels[i]) for i, p in enumerate(aligned_paths)], base / "aligned_sheet.png")
    contact_sheet(diff_items, base / "diff_sheet.png")
    make_gif(aligned_paths, base / "blink.gif")
    make_gif(diff_paths, base / "diff.gif")
    log("done")


if __name__ == "__main__":
    main()
