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
import { useEffect, useMemo, useRef, useState } from "react";

import { isOngoing } from "@/lib/alert-rules";
import { relativeDay, studyHref, type EventItem } from "@/lib/events";
import { bboxForRadius, circlePolygon } from "@/lib/geo";
import { alertZones, HAZARD_ORDER, HAZARD_STYLE, hazardOf, type Hazard } from "@/lib/hazard-style";
import type { LatLon } from "@/lib/types";

type Props = {
  point: LatLon;
  /** Solo para encuadrar el mapa alrededor de su ubicación. */
  radiusKm: number;
  active: EventItem[];
  history: EventItem[];
};

const STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const EMPTY = { type: "FeatureCollection" as const, features: [] };
const RED = "#DC2626";
const YELLOW = "#EAB308";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fit(map: MapLibreMap, point: LatLon, radiusKm: number, duration: number) {
  const [west, south, east, north] = bboxForRadius(point, radiusKm * 1.15);
  map.fitBounds(
    [
      [west, south],
      [east, north],
    ],
    { padding: 16, duration },
  );
}

const km = (value: number) => `${value.toLocaleString("es-CR")} km`;

export default function HomeMap({ point, radiusKm, active, history }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const initialRef = useRef({ point, radiusKm });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo los eventos que ocurren en este momento tienen área; si ya pasaron, no se dibuja.
  const zones = useMemo(
    () =>
      active.flatMap((item) => {
        const zone = alertZones(item);
        return zone ? [{ item, zone }] : [];
      }),
    [active],
  );

  const legend = useMemo(() => {
    const present = new Set<Hazard>([...active, ...history].map((item) => hazardOf(item.category)));
    return HAZARD_ORDER.filter((hazard) => present.has(hazard));
  }, [active, history]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let map: MapLibreMap;
    try {
      setWorkerUrl("/maplibre-gl-worker.mjs");
      map = new MapLibreMap({
        container: containerRef.current,
        style: STYLE_URL,
        center: [initialRef.current.point.lon, initialRef.current.point.lat],
        zoom: 7,
        minZoom: 3,
        maxZoom: 13,
        attributionControl: false,
      });
    } catch {
      // WebGL2 solo se puede detectar después del montaje.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Su navegador no puede mostrar el mapa.");
      return;
    }
    mapRef.current = map;
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    const popup = new Popup({ closeButton: false, offset: 12, maxWidth: "260px" });

    map.on("style.load", () => {
      map.addSource("zones", { type: "geojson", data: EMPTY });
      map.addSource("me", { type: "geojson", data: EMPTY });
      map.addSource("events", { type: "geojson", data: EMPTY });

      // Primero el área amarilla y encima la roja, que es más pequeña.
      for (const [ring, color, opacity] of [
        ["yellow", YELLOW, 0.16],
        ["red", RED, 0.2],
      ] as const) {
        map.addLayer({
          id: `zone-${ring}-fill`,
          type: "fill",
          source: "zones",
          filter: ["==", ["get", "ring"], ring],
          paint: { "fill-color": color, "fill-opacity": opacity },
        });
        map.addLayer({
          id: `zone-${ring}-line`,
          type: "line",
          source: "zones",
          filter: ["==", ["get", "ring"], ring],
          paint: { "line-color": color, "line-opacity": 0.9, "line-width": 1.5 },
        });
      }

      map.addLayer({
        id: "events-circle",
        type: "circle",
        source: "events",
        paint: {
          "circle-radius": ["case", ["get", "active"], 8, 5.5],
          "circle-color": ["get", "color"],
          "circle-opacity": ["case", ["get", "active"], 1, 0.6],
          "circle-stroke-width": ["case", ["get", "active"], 2.5, 1.5],
          "circle-stroke-color": "#FFFFFF",
        },
      });
      map.addLayer({
        id: "me-halo",
        type: "circle",
        source: "me",
        paint: { "circle-radius": 14, "circle-color": "#5266EB", "circle-opacity": 0.18 },
      });
      map.addLayer({
        id: "me-dot",
        type: "circle",
        source: "me",
        paint: {
          "circle-radius": 6,
          "circle-color": "#5266EB",
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#FFFFFF",
        },
      });

      map.on("click", "events-circle", (event) => {
        const p = event.features?.[0]?.properties as Record<string, unknown> | undefined;
        if (!p) return;
        popup
          .setLngLat(event.lngLat)
          .setHTML(
            `<p style="font-weight:600">${escapeHtml(p.title)}</p>` +
              `<p style="color:#5A5F6E">${escapeHtml(p.label)} · ${escapeHtml(p.when)}${p.ongoing ? " · en curso" : ""}</p>` +
              (p.zones ? `<p style="color:#5A5F6E;margin-top:4px">${escapeHtml(p.zones)}</p>` : "") +
              `<a href="${escapeHtml(p.href)}" style="display:inline-block;margin-top:6px;color:#3F51D6;font-weight:600">Ver cómo cambió la superficie →</a>`,
          )
          .addTo(map);
      });
      map.on("mouseenter", "events-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "events-circle", () => {
        map.getCanvas().style.cursor = "";
      });
      fit(map, initialRef.current.point, initialRef.current.radiusKm, 0);
      setReady(true);
    });

    return () => {
      observer.disconnect();
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("me") as GeoJSONSource | undefined)?.setData({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.lon, point.lat] },
      properties: {},
    });
    fit(map, point, radiusKm, 600);
  }, [ready, point, radiusKm]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("zones") as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: zones.flatMap(({ item, zone }) =>
        (
          [
            ["yellow", zone.yellow],
            ["red", zone.red],
          ] as const
        )
          .filter(([, radius]) => radius > 0)
          .map(([ring, radius]) => {
            const circle = circlePolygon({ lat: item.lat, lon: item.lon }, radius);
            return { ...circle, properties: { ring } };
          }),
      ) as never,
    });
  }, [ready, zones]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const zoneText = new Map(
      zones.map(({ item, zone }) => [
        item.id,
        zone.red > 0
          ? `Área roja ${km(zone.red)} · amarilla ${km(zone.yellow)} (estimadas)`
          : `Área amarilla ${km(zone.yellow)} (estimada)`,
      ]),
    );
    (map.getSource("events") as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      // Los activos van al final para dibujarse encima del historial.
      features: [
        ...history.map((item) => ({ item, active: false })),
        ...active.map((item) => ({ item, active: true })),
      ].map(({ item, active: isActive }) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [item.lon, item.lat] },
        properties: {
          title: item.title,
          label: item.categoryLabel,
          when: relativeDay(item.date),
          href: studyHref(item),
          active: isActive,
          ongoing: isActive && isOngoing(item),
          zones: isActive ? (zoneText.get(item.id) ?? "") : "",
          color: HAZARD_STYLE[hazardOf(item.category)].color,
        },
      })),
    });
  }, [ready, active, history, zones]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" aria-label="Mapa de alertas cerca de usted" />

      {ready && (legend.length > 0 || zones.length > 0) ? (
        <div
          className="pointer-events-none absolute bottom-3 left-3 max-w-[calc(100%-6rem)] rounded-[10px] bg-white/95 px-3 py-2.5"
          style={{ boxShadow: "var(--sombra-tarjeta)" }}
        >
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[12px] font-semibold text-tinta">
            {legend.map((hazard) => (
              <li key={hazard} className="inline-flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: HAZARD_STYLE[hazard].color }}
                  aria-hidden
                />
                {HAZARD_STYLE[hazard].label}
              </li>
            ))}
          </ul>
          {zones.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-linea pt-2 text-[12px] text-tinta-suave">
              <li className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2" style={{ borderColor: RED, backgroundColor: `${RED}33` }} aria-hidden />
                Área roja: mayor peligro
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2" style={{ borderColor: YELLOW, backgroundColor: `${YELLOW}33` }} aria-hidden />
                Área amarilla: precaución
              </li>
            </ul>
          ) : null}
        </div>
      ) : null}

      {!ready && !error ? (
        <div className="absolute inset-0 grid place-items-center bg-hundida text-[14px] text-tinta-suave">
          Cargando mapa…
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-hundida p-6 text-center text-[14px] text-tinta-suave">
          {error}
        </div>
      ) : null}
    </div>
  );
}
