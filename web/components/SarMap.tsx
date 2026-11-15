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

import { useLocale } from "@/components/LocaleProvider";
import { categoryLabel, displayDate } from "@/lib/display-i18n";
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
  const { locale, t } = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const onSelectRef = useRef(onSelectZone);
  const initialRef = useRef({ imageUrl, changeUrl, zone: zones.find((z) => z.id === activeId) });
  const imageStateRef = useRef<{
    map: MapLibreMap; imageUrl: string; changeUrl: string | null; bounds: string;
  } | null>(null);
  const fittedRef = useRef<{ map: MapLibreMap; bounds: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<"webgl" | "style" | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    popupRef.current?.remove();
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().setAttribute("aria-label", t("Mapa interactivo de radar NISAR", "Interactive NISAR radar map"));
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

  useEffect(() => {
    onSelectRef.current = onSelectZone;
    // Mantener el estado actual también si el usuario reintenta tras un fallo de estilo.
    initialRef.current = { imageUrl, changeUrl, zone: zones.find((item) => item.id === activeId) };
  }, [onSelectZone, imageUrl, changeUrl, zones, activeId]);

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
    fittedRef.current = { map, bounds: zone.bounds.join(",") };
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
    popupRef.current = popup;
    let disposed = false;
    let styleReady = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      clearTimeout(timeout);
      resizeObserver.disconnect();
      popup.remove();
      map.remove();
      mapRef.current = null;
      popupRef.current = null;
      imageStateRef.current = null;
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
      map.resize();
      const corners = imageCorners(zone.bounds);
      map.addSource("sar", { type: "image", url: initial.imageUrl, coordinates: corners });
      map.addSource("sar-change", {
        type: "image",
        url: initial.changeUrl ?? BLANK,
        coordinates: corners,
      });
      imageStateRef.current = {
        map, imageUrl: initial.imageUrl, changeUrl: initial.changeUrl, bounds: zone.bounds.join(","),
      };
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
              `<span style="color:#6e675c">${escapeHtml(p.categoryLabel)} · ${escapeHtml(p.source)} · ${escapeHtml(p.date)}</span>`,
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

    return dispose;
    // El mapa se crea una sola vez; imagen, zona y capas se actualizan en los efectos siguientes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const zone = zones.find((item) => item.id === activeId) ?? zones[0];

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const coordinates = imageCorners(zone.bounds);
    const bounds = zone.bounds.join(",");
    const previous = imageStateRef.current;
    if (previous?.map !== map || previous.imageUrl !== imageUrl || previous.bounds !== bounds) {
      (map.getSource("sar") as ImageSource | undefined)?.updateImage({ url: imageUrl, coordinates });
    }
    if (previous?.map !== map || previous.changeUrl !== changeUrl || previous.bounds !== bounds) {
      (map.getSource("sar-change") as ImageSource | undefined)?.updateImage({
        url: changeUrl ?? BLANK,
        coordinates,
      });
    }
    imageStateRef.current = { map, imageUrl, changeUrl, bounds };
  }, [ready, zone, imageUrl, changeUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource("zones") as GeoJSONSource | undefined)?.setData(zoneFeatures(zones, activeId));
    const bounds = zone.bounds.join(",");
    if (fittedRef.current?.map === map && fittedRef.current.bounds === bounds) return;
    map.fitBounds(
      [
        [zone.bounds[0], zone.bounds[1]],
        [zone.bounds[2], zone.bounds[3]],
      ],
      { padding: 24, duration: 700 },
    );
    fittedRef.current = { map, bounds };
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
          categoryLabel: categoryLabel(alert.category, alert.categoryLabel, locale),
          source: alert.source,
          date: Number.isFinite(Date.parse(alert.date)) ? displayDate(alert.date, locale) : alert.date,
        },
      })),
    });
  }, [ready, alerts, locale]);

  return (
    <div className="map-warm relative h-full w-full overflow-hidden bg-paper">
      <div ref={containerRef} className="h-full w-full" aria-label={t("Mapa de radar NISAR", "NISAR radar map")} />
      {degraded && !error ? (
        <p role="status" className="absolute bottom-3 left-3 right-14 rounded-lg bg-white/95 p-2 text-[12px] text-tinta-suave">
          {t("Algunas capas del mapa no pudieron cargarse.", "Some map layers could not be loaded.")}
        </p>
      ) : null}

      {!ready && !error ? (
        <div role="status" className="absolute inset-0 grid place-items-center bg-paper/70 font-mono text-[11px] text-ash">
          {t("Cargando mapa…", "Loading map…")}
        </div>
      ) : null}
      {error ? (
        <div role="status" className="absolute inset-0 grid place-items-center bg-paper/90 p-6 text-center text-[14px] text-tinta-suave">
          <div>
            <p>{error === "webgl"
              ? t("Su navegador no puede mostrar el mapa.", "Your browser cannot display the map.")
              : t("No se pudo cargar el mapa. Puede seguir consultando las imágenes y los datos.", "The map could not load. You can still view the images and data.")}</p>
            <button type="button" className="boton boton-chico boton-principal mt-3" onClick={() => {
              setError(null);
              setDegraded(false);
              setReady(false);
              setAttempt((value) => value + 1);
            }}>{t("Reintentar mapa", "Retry map")}</button>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-3 top-3 max-w-[220px] border border-rule bg-sheet/95 px-2.5 py-2 font-mono text-[8px] uppercase tracking-[0.1em] text-ash shadow-[3px_3px_0_rgba(27,26,23,0.06)] sm:text-[9px]">
        <p className="text-ink">{t("Radar NISAR · banda L", "NISAR radar · L-band")}</p>
        <div className="mt-1.5 hidden items-center gap-2 sm:flex">
          <span className="inline-block size-2 bg-[#141414]" />
          {t("Agua abierta / liso", "Open water / smooth")}
        </div>
        <div className="mt-1 hidden items-center gap-2 sm:flex">
          <span className="inline-block size-2 border border-rule bg-[#e9f2ea]" />
          {t("Vegetación densa", "Dense vegetation")}
        </div>
        <div className="mt-1 hidden items-center gap-2 sm:flex">
          <span className="inline-block size-2 bg-[#d55bd5]" />
          {t("HH fuerte · vegetación inundada posible", "Strong HH · possible flooded vegetation")}
        </div>
        {showChange && changeUrl ? (
          <>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="inline-block size-2 bg-[#2563eb]" />
              {t("Más oscuro que la fecha base", "Darker than the baseline")}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block size-2 bg-[#ea580c]" />
              {t("Más brillante que la fecha base", "Brighter than the baseline")}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
