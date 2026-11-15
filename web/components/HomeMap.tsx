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

import { useLocale } from "@/components/LocaleProvider";
import { isOngoing } from "@/lib/alert-rules";
import { categoryLabel, displayTimeAgo, eventTitle, intlLocale } from "@/lib/display-i18n";
import { studyHref, type EventItem } from "@/lib/events";
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

/** Quien pidió menos movimiento no debería ver el mapa desplazarse. */
function motionDuration(duration: number): number {
  if (typeof window === "undefined") return duration;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

function fit(map: MapLibreMap, point: LatLon, radiusKm: number, duration: number) {
  const [west, south, east, north] = bboxForRadius(point, radiusKm * 1.15);
  map.fitBounds(
    [
      [west, south],
      [east, north],
    ],
    { padding: 16, duration: motionDuration(duration) },
  );
}

const HAZARD_EN: Record<Hazard, string> = {
  sismo: "Earthquake", tsunami: "Tsunami", volcan: "Volcano", inundacion: "Flood",
  ciclon: "Cyclone or storm", lluvia: "Heavy rain", deslizamiento: "Landslide",
  incendio: "Wildfire", radar: "Detected by radar", otro: "Other",
};

export default function HomeMap({ point, radiusKm, active, history }: Props) {
  const { locale, t } = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const textRef = useRef(t);
  const fittedRef = useRef<{ map: MapLibreMap; lat: number; lon: number; radiusKm: number } | null>(null);
  const initialRef = useRef({ point, radiusKm });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<"webgl" | "style" | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    textRef.current = t;
    popupRef.current?.remove();
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().setAttribute("aria-label", t("Mapa interactivo de alertas", "Interactive alert map"));
    for (const [selector, label] of [
      [".maplibregl-ctrl-zoom-in", t("Acercar", "Zoom in")],
      [".maplibregl-ctrl-zoom-out", t("Alejar", "Zoom out")],
      [".maplibregl-ctrl-attrib-button", t("Fuentes del mapa", "Map attribution")],
    ]) {
      const button = map.getContainer().querySelector(selector);
      button?.setAttribute("aria-label", label);
      button?.setAttribute("title", label);
    }
  }, [t, ready]);

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
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        attributionControl: false,
      });
    } catch {
      // WebGL2 solo se puede detectar después del montaje.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("webgl");
      return;
    }
    mapRef.current = map;
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    const popup = new Popup({ closeButton: false, offset: 12, maxWidth: "260px" });
    popupRef.current = popup;
    let disposed = false;
    let styleReady = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      clearTimeout(timeout);
      observer.disconnect();
      popup.remove();
      map.remove();
      mapRef.current = null;
      popupRef.current = null;
      fittedRef.current = null;
    };
    const fail = () => {
      if (disposed) return;
      setError("style");
      setReady(false);
      dispose();
    };
    const timeout = window.setTimeout(fail, 15_000);
    map.on("error", () => {
      if (disposed) return;
      if (!styleReady) fail();
      else setDegraded(true);
    });

    map.on("style.load", () => {
      if (disposed) return;
      styleReady = true;
      clearTimeout(timeout);
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
              `<p style="color:#5A5F6E">${escapeHtml(p.label)} · ${escapeHtml(p.when)}${p.ongoing ? escapeHtml(textRef.current(" · en curso", " · ongoing")) : ""}</p>` +
              (p.zones ? `<p style="color:#5A5F6E;margin-top:4px">${escapeHtml(p.zones)}</p>` : "") +
              `<a href="${escapeHtml(p.href)}" style="display:inline-block;margin-top:6px;color:#3F51D6;font-weight:600">${escapeHtml(textRef.current("Ver cómo cambió la superficie", "See how the surface changed"))} →</a>`,
          )
          .addTo(map);
      });
      map.on("mouseenter", "events-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "events-circle", () => {
        map.getCanvas().style.cursor = "";
      });
      setReady(true);
    });

    return dispose;
  }, [attempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("me") as GeoJSONSource | undefined)?.setData({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.lon, point.lat] },
      properties: {},
    });
    const previous = fittedRef.current;
    if (previous?.map !== map || previous.lat !== point.lat || previous.lon !== point.lon || previous.radiusKm !== radiusKm) {
      fit(map, point, radiusKm, previous?.map === map ? 600 : 0);
      fittedRef.current = { map, lat: point.lat, lon: point.lon, radiusKm };
    }
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
          ? t(
              `Área roja ${zone.red.toLocaleString(intlLocale(locale))} km · amarilla ${zone.yellow.toLocaleString(intlLocale(locale))} km (estimadas, no oficiales)`,
              `Red area ${zone.red.toLocaleString(intlLocale(locale))} km · yellow ${zone.yellow.toLocaleString(intlLocale(locale))} km (estimated, unofficial)`,
            )
          : t(
              `Área amarilla ${zone.yellow.toLocaleString(intlLocale(locale))} km (estimada, no oficial)`,
              `Yellow area ${zone.yellow.toLocaleString(intlLocale(locale))} km (estimated, unofficial)`,
            ),
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
          title: eventTitle(item, locale),
          label: categoryLabel(item.category, item.categoryLabel, locale),
          when: displayTimeAgo(item.date, locale),
          href: studyHref(item),
          active: isActive,
          ongoing: isActive && isOngoing(item),
          zones: isActive ? (zoneText.get(item.id) ?? "") : "",
          color: HAZARD_STYLE[hazardOf(item.category)].color,
        },
      })),
    });
  }, [ready, active, history, zones, locale, t]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" aria-label={t("Mapa de alertas cerca de usted", "Map of alerts near you")} />
      {degraded && !error ? (
        <p role="status" className="absolute left-3 right-14 top-3 rounded-lg bg-white/95 p-2 text-[12px] text-tinta-suave">
          {t("Algunas capas del mapa no pudieron cargarse.", "Some map layers could not be loaded.")}
        </p>
      ) : null}

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
                {t(HAZARD_STYLE[hazard].label, HAZARD_EN[hazard])}
              </li>
            ))}
          </ul>
          {zones.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-linea pt-2 text-[12px] text-tinta-suave">
              <li className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2" style={{ borderColor: RED, backgroundColor: `${RED}33` }} aria-hidden />
                 {t("Área roja estimada, no oficial", "Estimated red area, unofficial")}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border-2" style={{ borderColor: YELLOW, backgroundColor: `${YELLOW}33` }} aria-hidden />
                 {t("Área amarilla estimada, no oficial", "Estimated yellow area, unofficial")}
              </li>
            </ul>
          ) : null}
        </div>
      ) : null}

      {!ready && !error ? (
        <div role="status" className="absolute inset-0 grid place-items-center bg-hundida text-[14px] text-tinta-suave">
          {t("Cargando mapa…", "Loading map…")}
        </div>
      ) : null}
      {error ? (
        <div role="status" className="absolute inset-0 grid place-items-center bg-hundida p-6 text-center text-[14px] text-tinta-suave">
          <div>
            <p>{error === "webgl"
              ? t("Su navegador no puede mostrar el mapa.", "Your browser cannot display the map.")
              : t("No se pudo cargar el mapa. Las alertas siguen disponibles en la lista.", "The map could not load. Alerts are still available in the list.")}</p>
            <button type="button" className="boton boton-chico boton-principal mt-3" onClick={() => {
              setError(null);
              setDegraded(false);
              setReady(false);
              setAttempt((value) => value + 1);
            }}>{t("Reintentar mapa", "Retry map")}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
