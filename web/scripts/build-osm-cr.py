#!/usr/bin/env python3
"""Genera data/overpass-costa-rica.json desde el extracto PBF de Geofabrik.

Requiere pyosmium (`pip install osmium`) y el PBF de Costa Rica:
  curl -L https://download.geofabrik.de/central-america/costa-rica-latest.osm.pbf -o /tmp/costa-rica.osm.pbf
  python3 scripts/build-osm-cr.py /tmp/costa-rica.osm.pbf
"""
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

import osmium

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "overpass-costa-rica.json"
PBF = sys.argv[1] if len(sys.argv) > 1 else "/tmp/opencode/costa-rica.osm.pbf"

ROAD_CLASSES = {"motorway", "trunk", "primary", "secondary"}
AREA_BOUNDARY = {"protected_area", "national_park"}

AREAS = [
    {
        "id": "guanacaste",
        "label": "Guanacaste · Liberia",
        "center": {"lat": 10.635, "lon": -85.4377},
        "radiusKm": 60,
        "bbox": [-86.1, 10.1, -84.9, 11.05],
    },
    {
        "id": "valle-central",
        "label": "Valle Central · San José",
        "center": {"lat": 9.9325, "lon": -84.0796},
        "radiusKm": 55,
        "bbox": [-84.6, 9.65, -83.6, 10.2],
    },
    {
        "id": "arenal",
        "label": "Arenal · La Fortuna",
        "center": {"lat": 10.471, "lon": -84.645},
        "radiusKm": 45,
        "bbox": [-85.05, 10.2, -84.05, 10.75],
    },
    {
        "id": "pacifico-central",
        "label": "Pacífico Central · Puntarenas",
        "center": {"lat": 9.976, "lon": -84.838},
        "radiusKm": 55,
        "bbox": [-85.15, 9.25, -84.05, 10.15],
    },
    {
        "id": "caribe",
        "label": "Caribe · Limón",
        "center": {"lat": 9.991, "lon": -83.036},
        "radiusKm": 55,
        "bbox": [-83.6, 9.45, -82.55, 10.35],
    },
]


def r4(value):
    return round(value, 4)


def r3(points):
    return [[round(x, 3), round(y, 3)] for x, y in points]


def haversine(a, b):
    radius = 6371
    dlat = math.radians(b["lat"] - a["lat"])
    dlon = math.radians(b["lon"] - a["lon"])
    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(a["lat"])) * math.cos(math.radians(b["lat"])) * math.sin(dlon / 2) ** 2
    )
    return 2 * radius * math.asin(math.sqrt(h))


def simplify(points, tolerance=0.0008):
    if len(points) <= 2:
        return points
    sq_tol = tolerance * tolerance

    def seg_dist(p, a, b):
        x, y = a
        dx, dy = b[0] - x, b[1] - y
        if dx or dy:
            t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy)
            if t > 1:
                x, y = b
            elif t > 0:
                x += dx * t
                y += dy * t
        return (p[0] - x) ** 2 + (p[1] - y) ** 2

    keep = [points[0]]
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        best = sq_tol
        index = -1
        for i in range(first + 1, last):
            dist = seg_dist(points[i], points[first], points[last])
            if dist > best:
                best, index = dist, i
        if index > 0:
            stack.append((first, index))
            keep.append(points[index])
            stack.append((index, last))
    keep.append(points[-1])
    return keep


def split_ring(ring, max_jump=0.05):
    """Corta anillos con saltos largos: evita unir costuras de otra área."""
    parts, current = [], [ring[0]]
    for point in ring[1:]:
        if math.hypot(point[0] - current[-1][0], point[1] - current[-1][1]) > max_jump:
            parts.append(current)
            current = [point]
        else:
            current.append(point)
    parts.append(current)
    return [part for part in parts if len(part) > 3 and part[0] == part[-1]]


def stitch(segments):
    rings, pool = [], [list(s) for s in segments]
    while pool:
        ring = pool.pop(0)
        for _ in range(500):
            first, last = ring[0], ring[-1]
            if first == last:
                break
            found = None
            for i, cand in enumerate(pool):
                if cand[0] == last:
                    found = (i, cand[1:])
                    break
                if cand[-1] == last:
                    found = (i, list(reversed(cand[:-1])))
                    break
            if not found:
                break
            index, extra = found
            pool.pop(index)
            ring.extend(extra)
        if len(ring) > 3 and ring[0] == ring[-1]:
            rings.extend(split_ring(ring))
    return rings


class Collector(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.roads = []
        self.area_ways = []
        self.relations = []

    def way(self, w):
        tags = w.tags
        if "highway" not in tags and "boundary" not in tags and "leisure" not in tags:
            return
        coords = []
        try:
            for node in w.nodes:
                coords.append((r4(node.lon), r4(node.lat)))
        except osmium.InvalidLocationError:
            return
        if len(coords) < 2:
            return
        if tags.get("highway") in ROAD_CLASSES:
            self.roads.append((dict(tags), coords))
        elif tags.get("boundary") in AREA_BOUNDARY or tags.get("leisure") == "nature_reserve":
            self.area_ways.append((dict(tags), coords))

    def relation(self, r):
        tags = dict(r.tags)
        if tags.get("boundary") in AREA_BOUNDARY or tags.get("leisure") == "nature_reserve":
            members = [(m.type, m.ref, m.role) for m in r.members]
            self.relations.append((tags, members))


class WaysById(osmium.SimpleHandler):
    def __init__(self, wanted):
        super().__init__()
        self.wanted = wanted
        self.geoms = {}

    def way(self, w):
        if w.id not in self.wanted:
            return
        try:
            coords = [(r4(n.lon), r4(n.lat)) for n in w.nodes]
        except osmium.InvalidLocationError:
            return
        if len(coords) >= 2:
            self.geoms[w.id] = coords


def area_props(tags):
    if tags.get("boundary") == "national_park":
        kind = "Parque nacional"
    elif tags.get("leisure") == "nature_reserve":
        kind = "Reserva natural"
    else:
        kind = "Área protegida"
    protect = tags.get("protect_class")
    return {
        "name": tags.get("name", "Área protegida sin nombre"),
        "kind": kind,
        "protectClass": int(protect) if protect and protect.isdigit() else None,
    }


def feature_from_way(tags, coords):
    ring = r3(simplify(coords, 0.0015))
    if len(ring) < 4:
        return None
    if ring[0] == ring[-1]:
        geom = {"type": "Polygon", "coordinates": [ring]}
    else:
        geom = {"type": "LineString", "coordinates": ring}
    return {"type": "Feature", "properties": area_props(tags), "geometry": geom}


def main():
    print("leyendo", PBF)
    collector = Collector()
    collector.apply_file(PBF, locations=True)
    print("caminos", len(collector.roads), "áreas ways", len(collector.area_ways), "relaciones", len(collector.relations))

    wanted = set()
    for _, members in collector.relations:
        for mtype, ref, role in members:
            if mtype == "w" and role in ("outer", ""):
                wanted.add(ref)

    member_geoms = {}
    if wanted:
        by_id = WaysById(wanted)
        by_id.apply_file(PBF, locations=True)
        member_geoms = by_id.geoms
    print("ways de relaciones", len(member_geoms))

    area_features = []
    for tags, coords in collector.area_ways:
        feature = feature_from_way(tags, coords)
        if feature:
            area_features.append(feature)

    for tags, members in collector.relations:
        segments = [member_geoms[ref] for mtype, ref, role in members if mtype == "w" and ref in member_geoms]
        if not segments:
            continue
        rings = [r3(simplify(ring, 0.0015)) for ring in stitch(segments)]
        if rings:
            geometry = (
                {"type": "Polygon", "coordinates": [rings[0]]}
                if len(rings) == 1
                else {"type": "MultiPolygon", "coordinates": [[ring] for ring in rings]}
            )
        else:
            geometry = {"type": "MultiLineString", "coordinates": [r3(simplify(seg, 0.0015)) for seg in segments]}
        area_features.append({"type": "Feature", "properties": area_props(tags), "geometry": geometry})

    areas = []
    for area in AREAS:
        center = area["center"]
        west, south, east, north = area["bbox"]
        by_kind = {}
        for tags, coords in collector.roads:
            mid = coords[len(coords) // 2]
            distance = haversine(center, {"lat": mid[1], "lon": mid[0]})
            if distance > 65:
                continue
            kind = tags["highway"]
            if kind == "secondary" and distance > 45:
                continue
            tol = {"secondary": 0.0018, "primary": 0.0012}.get(kind, 0.0008)
            by_kind.setdefault(kind, []).append(r3(simplify(coords, tol)))

        roads = [
            {
                "type": "Feature",
                "properties": {"kind": kind},
                "geometry": {"type": "MultiLineString", "coordinates": lines},
            }
            for kind, lines in by_kind.items()
        ]

        kept_areas = []
        for feature in area_features:
            coords = json.dumps(feature["geometry"]["coordinates"])
            nums = [float(n) for n in coords.replace("[", " ").replace("]", " ").replace(",", " ").split()]
            lons, lats = nums[0::2], nums[1::2]
            if not lons:
                continue
            if min(lons) > east or max(lons) < west or min(lats) > north or max(lats) < south:
                continue
            kept_areas.append(feature)

        areas.append(
            {
                **area,
                "roads": {"type": "FeatureCollection", "features": roads},
                "protectedAreas": {"type": "FeatureCollection", "features": kept_areas},
            }
        )
        print(
            area["id"],
            "caminos",
            sum(len(f["geometry"]["coordinates"]) for f in roads),
            "tramos,",
            len(kept_areas),
            "áreas",
        )

    payload = {
        "source": "OpenStreetMap · extracto Geofabrik Costa Rica",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "areas": areas,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print("bytes", OUT.stat().st_size, "->", OUT)


if __name__ == "__main__":
    main()
