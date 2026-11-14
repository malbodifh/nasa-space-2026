"""Astral Codes API — SkyBlink."""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

APP_VERSION = "0.1.0"
CACHE_DIR = Path("data/cache")

app = FastAPI(
    title="Astral Codes API",
    description="API pública de SkyBlink: cambios del cielo con SPHEREx.",
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    return {
        "name": "Astral Codes API",
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "astral-codes-api", "version": APP_VERSION}


@app.get("/api/targets")
def targets() -> dict:
    """Lista los targets precomputados en data/cache/."""
    items = []
    if CACHE_DIR.exists():
        for path in sorted(CACHE_DIR.iterdir()):
            manifest_path = path / "manifest.json"
            if not manifest_path.is_file():
                continue
            try:
                manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            target = manifest.get("target", {})
            items.append(
                {
                    "slug": path.name,
                    "name": target.get("name", path.name),
                    "ra": target.get("ra"),
                    "dec": target.get("dec"),
                    "frames": len(manifest.get("frames", [])),
                    "manifest": f"/cache/{path.name}/manifest.json",
                }
            )
    return {"targets": items}


# Servir los PNG/manifests cacheados. En producción esto puede ir a un CDN.
if CACHE_DIR.exists():
    app.mount("/cache", StaticFiles(directory=str(CACHE_DIR)), name="cache")
