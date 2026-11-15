"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  AttributionControl,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import OverlayPanel from "@/components/OverlayPanel";
import { bboxForRadius, circlePolygon } from "@/lib/geo";
import { hazardFor } from "@/lib/hazards";
import type {
  DisasterAlert,
  FirePoint,
  LayerId,
  LayerState,
  OverlaysData,
} from "@/lib/types";

type Props = {
  lat: number;
  lon: number;
  radiusKm: number;
  points: FirePoint[];
  memoryMode: boolean;
  onPick: (lat: number, lon: number) => void;
  overlays: OverlaysData | null;
  layers: LayerState;
  onToggleLayer: (id: LayerId) => void;
  overlaysLoading: boolean;
  overlaysFailed: boolean;
  hiddenHazards: string[];
};

const STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const EMPTY = { type: "FeatureCollection" as const, features: [] };

const LEVEL_COLOR: Record<DisasterAlert["level"], string> = {
  red: "#7f1d1d",
  orange: "#b23a1a",
  green: "#33523f",
  info: "#6e675c",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function link(url: unknown, label: string): string {
  if (typeof url !== "string" || !url.startsWith("http")) return "";
  return `<br/><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" style="color:#b23a1a">${escapeHtml(label)} →</a>`;
}

export default function MapCanvas({
  lat,
  lon,
  radiusKm,
  points,
  memoryMode,
  onPick,
  overlays,
  layers,
  onToggleLayer,
  overlaysLoading,
  overlaysFailed,
  hiddenHazards,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onPickRef = useRef(onPick);
  const popupRef = useRef<Popup | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: MapLibreMap;
    try {
      setWorkerUrl("/maplibre-gl-worker.mjs");
      map = new MapLibreMap({
        container: containerRef.current,
        style: STYLE_URL,
        center: [lon, lat],
        zoom: 9,
        minZoom: 3,
        maxZoom: 15,
        attributionControl: false,
      });
    } catch {
      // WebGL2 solo se puede detectar después del montaje.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Tu navegador no soporta WebGL2, necesario para el mapa.");
      return;
    }

    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    popupRef.current = new Popup({ closeButton: false, offset: 10, maxWidth: "260px" });

    // "style.load" llega antes que "load": el mapa aparece sin esperar teselas.
    map.on("style.load", () => {
      map.resize();
      setReady(true);
      map.addSource("borders", { type: "geojson", data: EMPTY });
      map.addSource("protected", { type: "geojson", data: EMPTY });
      map.addSource("roads", { type: "geojson", data: EMPTY });
      map.addSource("user-radius", { type: "geojson", data: EMPTY });
      map.addSource("fires", { type: "geojson", data: EMPTY });
      map.addSource("volcanoes", { type: "geojson", data: EMPTY });
      map.addSource("alerts", { type: "geojson", data: EMPTY });
      map.addSource("quakes", { type: "geojson", data: EMPTY });
      map.addSource("user-point", { type: "geojson", data: EMPTY });

      map.addLayer({
        id: "borders-line",
        type: "line",
        source: "borders",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#6e675c", "line-opacity": 0.45, "line-width": 0.7, "line-dasharray": [4, 3] },
      });
      map.addLayer({
        id: "protected-fill",
        type: "fill",
        source: "protected",
        paint: { "fill-color": "#33523f", "fill-opacity": 0.07 },
      });
      map.addLayer({
        id: "protected-line",
        type: "line",
        source: "protected",
        paint: { "line-color": "#33523f", "line-opacity": 0.28, "line-width": 0.8, "line-dasharray": [3, 2] },
      });
      map.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["match", ["get", "kind"], "motorway", "#b23a1a", "trunk", "#a16207", "#1b1a17"],
          "line-opacity": ["match", ["get", "kind"], "secondary", 0.16, 0.28],
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.35, 10, 0.9, 13, 1.8],
        },
      });
      map.addLayer({
        id: "radius-fill",
        type: "fill",
        source: "user-radius",
        paint: { "fill-color": "#33523f", "fill-opacity": 0.05 },
      });
      map.addLayer({
        id: "radius-line",
        type: "line",
        source: "user-radius",
        paint: {
          "line-color": "#33523f",
          "line-opacity": 0.65,
          "line-width": 1.1,
          "line-dasharray": [2, 2],
        },
      });
      map.addLayer({
        id: "fires-heat",
        type: "heatmap",
        source: "fires",
        maxzoom: 9,
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["coalesce", ["get", "frp"], 0], 0, 0.2, 500, 1],
          "heatmap-intensity": 0.7,
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 5, 12, 9, 34],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(161,98,7,0)",
            0.35,
            "rgba(217,119,6,0.35)",
            0.65,
            "rgba(178,58,26,0.55)",
            1,
            "rgba(127,29,29,0.8)",
          ],
          "heatmap-opacity": 0.5,
        },
      });
      map.addLayer({
        id: "fires-circle",
        type: "circle",
        source: "fires",
        paint: {
          "circle-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "frp"], 0],
            0,
            "#a16207",
            50,
            "#b23a1a",
            200,
            "#7f1d1d",
          ],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 3, 12, 7],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#faf7ef",
          "circle-opacity": 0.95,
        },
      });
      map.addLayer({
        id: "volcanoes-circle",
        type: "circle",
        source: "volcanoes",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 3.5, 12, 7],
          "circle-color": "#f2eee5",
          "circle-stroke-width": 1.4,
          "circle-stroke-color": "#1b1a17",
        },
      });
      map.addLayer({
        id: "alerts-halo",
        type: "circle",
        source: "alerts",
        paint: {
          "circle-radius": 14,
          "circle-color": [
            "match",
            ["get", "level"],
            "red",
            LEVEL_COLOR.red,
            "orange",
            LEVEL_COLOR.orange,
            "green",
            LEVEL_COLOR.green,
            LEVEL_COLOR.info,
          ],
          "circle-opacity": 0.16,
        },
      });
      map.addLayer({
        id: "alerts-circle",
        type: "circle",
        source: "alerts",
        paint: {
          "circle-radius": 5,
          "circle-color": [
            "match",
            ["get", "level"],
            "red",
            LEVEL_COLOR.red,
            "orange",
            LEVEL_COLOR.orange,
            "green",
            LEVEL_COLOR.green,
            LEVEL_COLOR.info,
          ],
          "circle-stroke-width": 1.4,
          "circle-stroke-color": "#faf7ef",
        },
      });
      map.addLayer({
        id: "quakes-halo",
        type: "circle",
        source: "quakes",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "magnitude"], 2, 7, 5, 18, 7, 30],
          "circle-color": "#6e675c",
          "circle-opacity": 0.14,
        },
      });
      map.addLayer({
        id: "quakes-circle",
        type: "circle",
        source: "quakes",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "magnitude"], 2, 2.5, 5, 6, 7, 10],
          "circle-color": "#6e675c",
          "circle-stroke-width": 1.2,
          "circle-stroke-color": "#faf7ef",
        },
      });
      map.addLayer({
        id: "user-halo",
        type: "circle",
        source: "user-point",
        paint: { "circle-radius": 12, "circle-color": "#1b1a17", "circle-opacity": 0.12 },
      });
      map.addLayer({
        id: "user-point",
        type: "circle",
        source: "user-point",
        paint: {
          "circle-radius": 4,
          "circle-color": "#1b1a17",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#faf7ef",
        },
      });

      map.on("click", "fires-circle", (event) => {
        const feature = event.features?.[0];
        if (!feature || !popupRef.current) return;
        const p = feature.properties as Record<string, unknown>;
        const frp = Number(p.frp);
        popupRef.current
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${escapeHtml(p.satellite ?? "Satélite")}</strong> · ${escapeHtml(p.instrument ?? "")}<br/>` +
              `${escapeHtml(p.distanceKm)} km · FRP ${escapeHtml(Number.isFinite(frp) ? frp : "—")} MW<br/>` +
              `<span style="color:#6e675c">${escapeHtml(p.date)} ${escapeHtml(p.time ?? "")} · confianza ${escapeHtml(p.confidence ?? "—")}</span>`,
          )
          .addTo(map);
      });

      map.on("click", "volcanoes-circle", (event) => {
        const feature = event.features?.[0];
        if (!feature || !popupRef.current) return;
        const p = feature.properties as Record<string, unknown>;
        popupRef.current
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${escapeHtml(p.name)}</strong><br/>` +
              `${escapeHtml(p.type ?? "Volcán")}${p.elevation ? ` · ${escapeHtml(p.elevation)} m` : ""}<br/>` +
              `<span style="color:#6e675c">${escapeHtml(p.country ?? "")} · última erupción: ${escapeHtml(p.lastEruption ?? "sin registro")}</span>` +
              link(p.url, "Smithsonian GVP"),
          )
          .addTo(map);
      });

      map.on("click", "protected-fill", (event) => {
        const feature = event.features?.[0];
        if (!feature || !popupRef.current) return;
        const p = feature.properties as Record<string, unknown>;
        popupRef.current
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${escapeHtml(p.name)}</strong><br/><span style="color:#6e675c">${escapeHtml(p.kind)} · OpenStreetMap</span>`,
          )
          .addTo(map);
      });

      map.on("click", "quakes-circle", (event) => {
        const feature = event.features?.[0];
        if (!feature || !popupRef.current) return;
        const p = feature.properties as Record<string, unknown>;
        popupRef.current
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>M ${escapeHtml(p.magnitude)}</strong> · ${escapeHtml(p.place)}<br/>` +
              `<span style="color:#6e675c">${escapeHtml(p.source)} · ${escapeHtml(p.distanceKm)} km · ${escapeHtml(p.time).slice(0, 16).replace("T", " ")}</span>` +
              (p.depthKm !== null && p.depthKm !== undefined ? `<br/>Profundidad ${escapeHtml(p.depthKm)} km` : "") +
              link(p.url, "Ver evento"),
          )
          .addTo(map);
      });

      map.on("click", "alerts-circle", (event) => {
        const feature = event.features?.[0];
        if (!feature || !popupRef.current) return;
        const p = feature.properties as Record<string, unknown>;
        popupRef.current
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${escapeHtml(p.title)}</strong><br/>` +
              `${escapeHtml(p.categoryLabel)} · nivel ${escapeHtml(p.level)}<br/>` +
              `<span style="color:#6e675c">${escapeHtml(p.source)} · ${escapeHtml(p.distanceKm)} km · ${escapeHtml(String(p.date).slice(0, 10))}</span>` +
              link(p.url, "Reporte oficial"),
          )
          .addTo(map);
      });

      for (const layer of [
        "fires-circle",
        "volcanoes-circle",
        "protected-fill",
        "alerts-circle",
        "quakes-circle",
      ]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      map.on("load", () => map.resize());

      map.on("click", (event) => {
        const hits = map.queryRenderedFeatures(event.point, {
          layers: [
            "fires-circle",
            "volcanoes-circle",
            "protected-fill",
            "alerts-circle",
            "quakes-circle",
          ],
        });
        if (hits.length > 0) return;
        onPickRef.current(event.lngLat.lat, event.lngLat.lng);
      });
    });

    return () => {
      resizeObserver.disconnect();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // El mapa se crea una sola vez; el centro y los datos se actualizan en los efectos siguientes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const radius = circlePolygon({ lat, lon }, radiusKm);
    const fireCollection = {
      type: "FeatureCollection" as const,
      features: points.map((fire) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [fire.lon, fire.lat] },
        properties: {
          id: fire.id,
          frp: fire.frp ?? 0,
          date: fire.date,
          time: fire.time ?? "",
          satellite: fire.satellite ?? "",
          instrument: fire.instrument ?? "",
          confidence: fire.confidence ?? "",
          distanceKm: fire.distanceKm ?? null,
        },
      })),
    };

    const sources: [string, unknown][] = [
      ["user-radius", radius],
      ["fires", fireCollection],
      [
        "user-point",
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [lon, lat] },
          properties: {},
        },
      ],
    ];

    for (const [id, data] of sources) {
      const source = map.getSource(id) as GeoJSONSource | undefined;
      if (source) source.setData(data as never);
      else map.addSource(id, { type: "geojson", data: data as never });
    }
  }, [ready, lat, lon, radiusKm, points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const alertFeatures = (overlays?.alerts ?? [])
      .filter((alert) => alert.category !== "earthquakes")
      .filter((alert) => !hiddenHazards.includes(hazardFor(alert.category).id))
      .map((alert) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [alert.lon, alert.lat] },
      properties: {
        id: alert.id,
        title: alert.title,
        source: alert.source,
        level: alert.level,
        categoryLabel: alert.categoryLabel,
        distanceKm: alert.distanceKm,
        date: alert.date,
        url: alert.url,
      },
    }));

    const quakeFeatures = hiddenHazards.includes("earthquakes")
      ? []
      : (overlays?.seismic ?? [])
          .filter((event) => event.magnitude >= 3)
          .map((event) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [event.lon, event.lat] },
          properties: {
            id: event.id,
            magnitude: event.magnitude,
            depthKm: event.depthKm,
            time: event.time,
            place: event.place,
            source: event.source,
            distanceKm: event.distanceKm,
            url: event.url,
          },
        }));

    const collections: [string, unknown][] = [
      ["roads", overlays?.roads ?? EMPTY],
      ["protected", overlays?.protectedAreas ?? EMPTY],
      ["volcanoes", overlays?.volcanoes ?? EMPTY],
      ["borders", overlays?.borders ?? EMPTY],
      ["alerts", { type: "FeatureCollection", features: alertFeatures }],
      ["quakes", { type: "FeatureCollection", features: quakeFeatures }],
    ];

    for (const [id, data] of collections) {
      const source = map.getSource(id) as GeoJSONSource | undefined;
      if (source) source.setData(data as never);
    }
  }, [ready, overlays, hiddenHazards]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const visibility: Record<string, LayerId> = {
      "roads-line": "roads",
      "protected-fill": "protected",
      "protected-line": "protected",
      "volcanoes-circle": "volcanoes",
      "borders-line": "borders",
      "alerts-halo": "alerts",
      "alerts-circle": "alerts",
      "quakes-halo": "quakes",
      "quakes-circle": "quakes",
    };

    for (const [layerId, key] of Object.entries(visibility)) {
      if (!map.getLayer(layerId)) continue;
      map.setLayoutProperty(layerId, "visibility", layers[key] ? "visible" : "none");
    }
  }, [ready, layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const [west, south, east, north] = bboxForRadius({ lat, lon }, Math.max(radiusKm * 1.6, 10));
    map.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding: 44, duration: 650, maxZoom: 12 },
    );
  }, [ready, lat, lon, radiusKm]);

  return (
    <div className="map-warm relative h-full w-full overflow-hidden bg-paper">
      <div ref={containerRef} className="h-full w-full" aria-label="Mapa de focos de calor y capas" />

      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <OverlayPanel
          layers={layers}
          onToggle={onToggleLayer}
          loading={overlaysLoading}
          failed={overlaysFailed}
        />
      </div>

      {!ready && !error ? (
        <div className="absolute inset-0 grid place-items-center bg-paper/70 font-mono text-[11px] text-ash">
          Cargando mapa…
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-paper/90 p-6 text-center font-mono text-[11px] text-burnt">
          {error}
        </div>
      ) : null}

      <div className="pointer-events-none absolute bottom-4 left-4 border border-rule bg-sheet/95 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ash shadow-[3px_3px_0_rgba(27,26,23,0.06)]">
        <div className="flex items-center gap-2">
          <span className="inline-block size-1.5 bg-ember" />
          {memoryMode ? "Memoria · NASA GIBS" : "Focos recientes · NASA GIBS"}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-block size-2 border border-forest" />
          Tu punto · {radiusKm} km
        </div>
        {overlays && overlays.alerts.length > 0 ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-burnt" />
            {overlays.alerts.length} eventos
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute right-4 top-4 hidden border border-rule bg-sheet/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ash lg:block">
        {memoryMode ? "Archivo" : "Ahora"}
      </div>
    </div>
  );
}
