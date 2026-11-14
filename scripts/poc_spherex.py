#!/usr/bin/env python3
"""
PoC SPHEREx: SIA2 -> cutouts -> PNG contact sheet.

Uso:
    python scripts/poc_spherex.py --name "WISE 0855" --ra 133.795129 --dec -7.245147 --n 10
    python scripts/poc_spherex.py --csv data/samples/wise0855_sia2.csv --n 10

Requisitos:
    pip install requests numpy pillow astropy
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
import requests
from astropy.io import fits
from astropy.time import Time
from PIL import Image, ImageDraw, ImageFont

SIA_URL = "https://irsa.ipac.caltech.edu/SIA"
USER_AGENT = "AstralCodes-SpaceApps2026/0.1 (educational; contact: team)"


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------


def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def safe_slug(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "target"


def mjd_to_iso(mjd: float) -> str:
    return Time(mjd, format="mjd").to_datetime(timezone=UTC).isoformat()


def http_get(url: str, params: dict | None = None, timeout: int = 120, retries: int = 4):
    """GET con reintentos y backoff."""
    last = None
    for attempt in range(retries):
        try:
            r = requests.get(
                url,
                params=params,
                timeout=timeout,
                headers={"User-Agent": USER_AGENT},
            )
            if r.status_code == 200:
                return r
            last = RuntimeError(f"HTTP {r.status_code} for {r.url}")
        except Exception as exc:  # noqa: BLE001
            last = exc
        sleep = 2**attempt
        log(f"  reintento {attempt + 1}/{retries} en {sleep}s: {last}")
        time.sleep(sleep)
    raise RuntimeError(f"No se pudo descargar {url}: {last}")


# ---------------------------------------------------------------------------
# SIA2
# ---------------------------------------------------------------------------


def query_sia2(ra: float, dec: float, radius: float, collection: str) -> list[dict]:
    log(f"SIA2: {collection} radio={radius}° alrededor de ({ra}, {dec})")
    r = http_get(
        SIA_URL,
        params={
            "COLLECTION": collection,
            "POS": f"circle {ra} {dec} {radius}",
            "RESPONSEFORMAT": "CSV",
        },
        timeout=90,
    )
    rows = list(csv.DictReader(io.StringIO(r.text)))
    log(f"  {len(rows)} filas")
    return rows


def load_csv(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    log(f"CSV local: {len(rows)} filas")
    return rows


def pick_epochs(rows: list[dict], n: int, detector: str | None = None) -> list[dict]:
    """Agrupa por obs_id, elige un detector consistente y muestrea n épocas."""
    rows = [r for r in rows if r.get("dataproduct_type", "image") == "image"]
    if detector:
        rows = [r for r in rows if r.get("energy_bandpassname") == detector]
    if not rows:
        return []

    # Detector más común (para tener la misma banda en todas las épocas).
    from collections import Counter

    counts = Counter(r.get("energy_bandpassname", "") for r in rows)
    chosen_det = detector or counts.most_common(1)[0][0]
    rows = [r for r in rows if r.get("energy_bandpassname") == chosen_det]

    by_obs: dict[str, dict] = {}
    for r in rows:
        obs = r.get("obs_id") or r.get("obs_publisher_did") or ""
        if not obs:
            continue
        # Nos quedamos con la primera fila de cada obs_id.
        by_obs.setdefault(obs, r)

    epochs = sorted(by_obs.values(), key=lambda r: float(r.get("t_min") or 0))
    log(f"  {len(epochs)} épocas únicas, detector {chosen_det}")
    if len(epochs) <= n:
        return epochs

    # Muestreo uniforme en el tiempo.
    idx = np.linspace(0, len(epochs) - 1, n).round().astype(int)
    idx = sorted(set(idx.tolist()))
    return [epochs[i] for i in idx]


# ---------------------------------------------------------------------------
# Cutouts
# ---------------------------------------------------------------------------


def fetch_cutout(row: dict, ra: float, dec: float, size: float) -> dict:
    access_url = row["access_url"]
    url = f"{access_url}?center={ra},{dec}&size={size}"
    t0 = time.time()
    r = http_get(url, timeout=180, retries=4)
    with fits.open(io.BytesIO(r.content)) as hdul:
        image = np.array(hdul["IMAGE"].data, dtype="float32")
        flags = np.array(hdul["FLAGS"].data) if "FLAGS" in hdul else None
        header = hdul["IMAGE"].header.copy()
    return {
        "row": row,
        "image": image,
        "flags": flags,
        "header": header,
        "bytes": len(r.content),
        "seconds": round(time.time() - t0, 2),
    }


def normalize(image: np.ndarray, lo: float = 5.0, hi: float = 99.5) -> np.ndarray:
    finite = image[np.isfinite(image)]
    if finite.size == 0:
        return np.zeros_like(image, dtype="float32")
    vmin, vmax = np.percentile(finite, [lo, hi])
    if not np.isfinite(vmin) or not np.isfinite(vmax) or vmax <= vmin:
        vmin, vmax = float(finite.min()), float(finite.max())
    if vmax <= vmin:
        return np.zeros_like(image, dtype="float32")
    norm = np.clip((image - vmin) / (vmax - vmin), 0, 1)
    norm = np.nan_to_num(norm, nan=0.0, posinf=1.0, neginf=0.0)
    return norm.astype("float32")


def to_png(image: np.ndarray, path: Path, size: int = 256) -> None:
    norm = normalize(image)
    arr = (norm * 255).astype("uint8")
    img = Image.fromarray(arr, mode="L").resize((size, size), Image.Resampling.BILINEAR)
    # Colormap simple (inferno aproximado) para que se vea mejor.
    img = Image.merge(
        "RGB", (img, img.point(lambda v: int(v * 0.75)), img.point(lambda v: int(v * 0.35)))
    )
    img.save(path)


def make_contact_sheet(frames: list[dict], path: Path, base_dir: Path, cols: int = 5) -> None:
    if not frames:
        return
    thumb = 256
    label_h = 34
    rows = math.ceil(len(frames) / cols)
    sheet = Image.new("RGB", (cols * thumb, rows * (thumb + label_h)), (12, 12, 16))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 13)
    except Exception:  # noqa: BLE001
        font = ImageFont.load_default()

    for i, frame in enumerate(frames):
        img = Image.open(base_dir / frame["png"]).convert("RGB")
        x = (i % cols) * thumb
        y = (i // cols) * (thumb + label_h)
        sheet.paste(img, (x, y))
        label = f"{frame['date_utc'][:10]}  {frame['detector']}  {frame['obs_id'][-8:]}"
        draw.text((x + 6, y + thumb + 6), label, fill=(230, 230, 230), font=font)

    sheet.save(path)
    log(f"Hoja de contacto: {path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", default="WISE 0855")
    ap.add_argument("--ra", type=float, default=133.795129)
    ap.add_argument("--dec", type=float, default=-7.245147)
    ap.add_argument("--radius", type=float, default=0.1, help="radio de búsqueda SIA2 (deg)")
    ap.add_argument("--size", type=float, default=0.1, help="tamaño del cutout (deg)")
    ap.add_argument("--n", type=int, default=10, help="número de épocas")
    ap.add_argument("--detector", default=None, help="D1..D6 (opcional)")
    ap.add_argument("--collection", default="spherex_dr1")
    ap.add_argument("--csv", default=None, help="usar un CSV local en vez de SIA2")
    ap.add_argument("--out", default=None)
    ap.add_argument("--workers", type=int, default=6)
    args = ap.parse_args()

    slug = safe_slug(args.name)
    out = Path(args.out or f"data/cache/{slug}")
    out.mkdir(parents=True, exist_ok=True)

    rows = (
        load_csv(args.csv)
        if args.csv
        else query_sia2(args.ra, args.dec, args.radius, args.collection)
    )
    epochs = pick_epochs(rows, args.n, args.detector)
    if not epochs:
        raise SystemExit("No hay épocas para esos parámetros.")

    log(f"Descargando {len(epochs)} cutouts con {args.workers} workers...")
    results: list[dict] = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {
            pool.submit(fetch_cutout, row, args.ra, args.dec, args.size): row for row in epochs
        }
        for fut in as_completed(futures):
            row = futures[fut]
            try:
                results.append(fut.result())
                log(f"  ok {row['obs_id']} ({row.get('energy_bandpassname')})")
            except Exception as exc:  # noqa: BLE001
                log(f"  fallo {row.get('obs_id')}: {exc}")

    results.sort(key=lambda r: float(r["row"].get("t_min") or 0))
    frames = []
    for i, res in enumerate(results):
        row = res["row"]
        png = out / f"frame_{i:03d}.png"
        to_png(res["image"], png)
        frames.append(
            {
                "index": i,
                "obs_id": row.get("obs_id"),
                "detector": row.get("energy_bandpassname"),
                "t_min_mjd": float(row.get("t_min") or 0),
                "date_utc": mjd_to_iso(float(row.get("t_min") or 0)),
                "png": png.name,
                "shape": list(res["image"].shape),
                "cutout_bytes": res["bytes"],
                "seconds": res["seconds"],
                "access_url": row.get("access_url"),
            }
        )

    manifest = {
        "target": {
            "slug": slug,
            "name": args.name,
            "ra": args.ra,
            "dec": args.dec,
            "fov_deg": args.size,
        },
        "generated_at": datetime.now(UTC).isoformat(),
        "source": "NASA/SPHEREx DR1 via IRSA SIA2 + Cutout Service",
        "frames": frames,
    }
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    log(f"Manifest: {out / 'manifest.json'}")

    make_contact_sheet(frames, out / "contact_sheet.png", out, cols=min(5, len(frames)))
    log("Listo.")


if __name__ == "__main__":
    main()
