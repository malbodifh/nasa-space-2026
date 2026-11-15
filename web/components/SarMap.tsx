"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  AttributionControl,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
  type ImageSource,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { imageCorners, type SarZone } from "@/lib/sar";
import type { DisasterAlert } from "@/lib/types";

type Props = {
  zones: SarZone[];
  activeId: string;
  imageUrl: string;
  changeUrl: string | null;
  showRadar: boolean;
  showChange: boolean;
  opacity: number;
  alerts: DisasterAlert[];
  onSelectZone: (id: string) => void;
};

const STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const EMPTY = { type: "FeatureCollection" as const, features: [] };
// Imagen transparente de 1 px: la fuente de cambio existe aunque la fecha base no tenga cambio.
const BLANK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function zoneFeatures(zones: SarZone[], activeId: string) {
  return {
    type: "FeatureCollection" as const,
    features: zones.map((zone) => {
      const [w, s, e, n] = zone.bounds;
      return {
        type: "Feature" as const,
        properties: { id: zone.id, name: zone.name, active: zone.id === activeId },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [w, s],
              [e, s],
              [e, n],
              [w, n],
              [w, s],
            ],
          ],
        },
      };
    }),
  };
}

export default function SarMap({
  zones,
  activeId,
  imageUrl,
  changeUrl,
  showRadar,
  showChange,
  opacity,
  alerts,
  onSelectZone,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelectZone);
  const initialRef = useRef({ imageUrl, changeUrl, zone: zones.find((z) => z.id === activeId) });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelectZone;
  }, [onSelectZone]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initial = initialRef.current;
    const zone = initial.zone ?? zones[0];

    let map: MapLibreMap;
    try {
      setWorkerUrl("/maplibre-gl-worker.mjs");
      map = new MapLibreMap({
        container: containerRef.current,
        style: STYLE_URL,
        bounds: [
          [zone.bounds[0], zone.bounds[1]],
          [zone.bounds[2], zone.bounds[3]],
        ],
        fitBoundsOptions: { padding: 24 },
        minZoom: 5,
        maxZoom: 14,
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
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: "Radar: NASA-ISRO NISAR · ASF DAAC",
      }),
      "bottom-right",
    );
    const popup = new Popup({ closeButton: false, offset: 10, maxWidth: "260px" });

    map.on("style.load", () => {
      map.resize();
      const corners = imageCorners(zone.bounds);
      map.addSource("sar", { type: "image", url: initial.imageUrl, coordinates: corners });
      map.addSource("sar-change", {
        type: "image",
        url: initial.changeUrl ?? BLANK,
        coordinates: corners,
      });
      map.addSource("zones", { type: "geojson", data: EMPTY });
      map.addSource("sar-alerts", { type: "geojson", data: EMPTY });

      map.addLayer({
        id: "sar-raster",
        type: "raster",
        source: "sar",
        paint: { "raster-opacity": 0.9, "raster-fade-duration": 0 },
      });
      map.addLayer({
        id: "sar-change-raster",
        type: "raster",
        source: "sar-change",
        paint: { "raster-opacity": 0.95, "raster-fade-duration": 0 },
      });
      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": "#1b1a17",
          "fill-opacity": ["case", ["get", "active"], 0, 0.06],
        },
      });
      map.addLayer({
        id: "zones-line",
        type: "line",
        source: "zones",
        paint: {
          "line-color": ["case", ["get", "active"], "#b23a1a", "#1b1a17"],
          "line-width": ["case", ["get", "active"], 1.6, 1],
          "line-dasharray": [3, 2],
          "line-opacity": 0.8,
        },
      });
      map.addLayer({
        id: "sar-alerts-circle",
        type: "circle",
        source: "sar-alerts",
        paint: {
          "circle-radius": 6,
          "circle-color": "#b23a1a",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#faf7ef",
        },
      });

      map.on("click", "zones-fill", (event) => {
        const id = event.features?.[0]?.properties?.id;
        if (typeof id === "string") onSelectRef.current(id);
      });
      map.on("click", "sar-alerts-circle", (event) => {
        const p = event.features?.[0]?.properties as Record<string, unknown> | undefined;
        if (!p) return;
        popup
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${escapeHtml(p.title)}</strong><br/>` +
              `<span style="color:#6e675c">${escapeHtml(p.categoryLabel)} · ${escapeHtml(p.source)} · ${escapeHtml(String(p.date).slice(0, 10))}</span>`,
          )
          .addTo(map);
      });
      for (const layer of ["zones-fill", "sar-alerts-circle"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }
      setReady(true);
    });

    return () => {
      resizeObserver.disconnect();
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
    // El mapa se crea una sola vez; imagen, zona y capas se actualizan en los efectos siguientes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zone = zones.find((item) => item.id === activeId) ?? zones[0];

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const coordinates = imageCorners(zone.bounds);
    (map.getSource("sar") as ImageSource | undefined)?.updateImage({ url: imageUrl, coordinates });
    (map.getSource("sar-change") as ImageSource | undefined)?.updateImage({
      url: changeUrl ?? BLANK,
      coordinates,
    });
  }, [ready, zone, imageUrl, changeUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("zones") as GeoJSONSource | undefined)?.setData(zoneFeatures(zones, activeId));
    map.fitBounds(
      [
        [zone.bounds[0], zone.bounds[1]],
        [zone.bounds[2], zone.bounds[3]],
      ],
      { padding: 24, duration: 700 },
    );
  }, [ready, zones, zone, activeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty("sar-raster", "visibility", showRadar ? "visible" : "none");
    map.setLayoutProperty("sar-change-raster", "visibility", showChange ? "visible" : "none");
    map.setPaintProperty("sar-raster", "raster-opacity", opacity);
  }, [ready, showRadar, showChange, opacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("sar-alerts") as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: alerts.map((alert) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [alert.lon, alert.lat] },
        properties: {
          title: alert.title,
          categoryLabel: alert.categoryLabel,
          source: alert.source,
          date: alert.date,
        },
      })),
    });
  }, [ready, alerts]);

  return (
    <div className="map-warm relative h-full w-full overflow-hidden bg-paper">
      <div ref={containerRef} className="h-full w-full" aria-label="Mapa de radar NISAR" />

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

      <div className="pointer-events-none absolute left-3 top-3 max-w-[220px] border border-rule bg-sheet/95 px-2.5 py-2 font-mono text-[8px] uppercase tracking-[0.1em] text-ash shadow-[3px_3px_0_rgba(27,26,23,0.06)] sm:text-[9px]">
        <p className="text-ink">Radar NISAR · banda L</p>
        <div className="mt-1.5 hidden items-center gap-2 sm:flex">
          <span className="inline-block size-2 bg-[#141414]" />
          Agua abierta / liso
        </div>
        <div className="mt-1 hidden items-center gap-2 sm:flex">
          <span className="inline-block size-2 border border-rule bg-[#e9f2ea]" />
          Vegetación densa
        </div>
        <div className="mt-1 hidden items-center gap-2 sm:flex">
          <span className="inline-block size-2 bg-[#d55bd5]" />
          HH fuerte · vegetación inundada
        </div>
        {showChange && changeUrl ? (
          <>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="inline-block size-2 bg-[#2563eb]" />
              Más oscuro que la fecha base
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block size-2 bg-[#ea580c]" />
              Más brillante que la fecha base
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
