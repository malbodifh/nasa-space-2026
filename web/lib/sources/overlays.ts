import "server-only";

import { feedIsStale, partitionCurrent, reportTime } from "@/lib/alert-rules";
import { withTimeout } from "@/lib/cache";
import { distanceKm } from "@/lib/geo";
import { getEonetAlerts, getEonetHistory } from "@/lib/sources/eonet";
import { getFires, getRainForecast, getStorms, getTsunamiBulletins } from "@/lib/sources/feeds";
import { getGdacsAlerts } from "@/lib/sources/gdacs";
import { getOsmOverlays } from "@/lib/sources/overpass";
import { getSeismic } from "@/lib/sources/seismic";
import { getBorders, getVolcanoes } from "@/lib/sources/static-overlays";
import type {
  DisasterAlert,
  GeoCollection,
  LatLon,
  OverlaySource,
  OverlaysData,
  ProtectedAreaProps,
  RoadProps,
  SeismicEvent,
  SourceStatus,
  VolcanoProps,
} from "@/lib/types";

const EMPTY: GeoCollection<never> = { type: "FeatureCollection", features: [] };

export function dedupe(alerts: DisasterAlert[]): DisasterAlert[] {
  const aliases: Record<string, string> = {
    EQ: "earthquakes", TC: "severeStorms", FL: "floods", VO: "volcanoes", WF: "wildfires",
  };
  const category = (alert: DisasterAlert) => aliases[alert.category] ?? alert.category;
  const merged: DisasterAlert[] = [];
  for (const alert of alerts) {
    const same = merged.find((candidate) =>
      candidate.source !== alert.source &&
      !candidate.alsoReportedBy?.includes(alert.source) &&
      category(candidate) === category(alert) &&
      Math.abs(reportTime(candidate.date) - reportTime(alert.date)) <= 5 * 60 * 1000 &&
      distanceKm(candidate, alert) <= (category(alert) === "earthquakes" ? 40 : 10),
    );
    if (!same) {
      merged.push({ ...alert, alsoReportedBy: [...(alert.alsoReportedBy ?? [])] });
      continue;
    }
    const sources = [same.source, ...(same.alsoReportedBy ?? []), alert.source, ...(alert.alsoReportedBy ?? [])];
    const reviewed = same.quality === "revisado" || alert.quality === "revisado";
    // El catálogo agregado puede carecer de magnitud y «sentido en»: no debe tapar la red sísmica.
    if (category(alert) === "earthquakes") {
      const felt = same.felt || alert.felt;
      if (same.magnitudeValue == null && alert.magnitudeValue != null) Object.assign(same, alert);
      if (felt) same.felt = felt;
    }
    same.alsoReportedBy = [...new Set(sources)].filter((source) => source !== same.source);
    if (reviewed) same.quality = "revisado";
  }
  return merged.sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Nivel del sismo: el PAGER de USGS (impacto estimado) manda; si no hay, la magnitud. */
function seismicLevel(event: SeismicEvent): DisasterAlert["level"] {
  if (event.pager === "red") return "red";
  if (event.pager === "orange" || event.pager === "yellow") return "orange";
  if (event.magnitude >= 6) return "red";
  if (event.magnitude >= 5) return "orange";
  if (event.magnitude >= 4) return "green";
  return "info";
}

/** Solo los sismos recientes y perceptibles (o reportados como sentidos) entran a las alertas. */
function seismicAlerts(events: SeismicEvent[], days = 3, minMagnitude = 2): DisasterAlert[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return events
    .filter((event) => (event.magnitude >= minMagnitude || event.felt) && Date.parse(event.time) >= cutoff)
    .map((event) => ({
      id: `seismic:${event.source}:${event.id}`,
      source: event.source,
      category: "earthquakes",
      categoryLabel: "Sismo",
      title: `M ${event.magnitude.toFixed(1)} · ${event.place}`,
      level: seismicLevel(event),
      date: event.time,
      lat: event.lat,
      lon: event.lon,
      distanceKm: event.distanceKm,
      url: event.url ?? "https://www.ovsicori.una.ac.cr/",
      magnitude: event.depthKm !== null ? `Profundidad ${event.depthKm} km` : null,
      magnitudeValue: event.magnitude,
      felt: event.felt ?? null,
      alsoReportedBy: event.alsoReportedBy ?? [],
      quality: event.reviewed ? "revisado" : "preliminar",
      detail: event.felt
        ? `Sentido en ${event.felt}`
        : event.mmi
          ? `Intensidad máxima estimada ${event.mmi.toFixed(1)} (USGS)`
          : null,
    }));
}

type Outcome = { id: string; label: string; result: PromiseSettledResult<DisasterAlert[]> };

/**
 * Incendios ocultos por ahora: los focos de FIRMS dan muchos falsos positivos en Costa Rica
 * (calor de cráteres, industria, quemas agrícolas). El filtro de `filterFirms` queda listo
 * para cuando se valide; cambiar a `true` los vuelve a mostrar.
 */
const SHOW_FIRES = false;

const isFire = (category: string) => category === "wildfires" || category === "WF";

/**
 * Solo eventos, sin caminos. `alerts`: activos (EONET y GDACS abiertos, sismos de 7 días,
 * boletines de tsunami, ciclones, fuegos de FIRMS y lluvia pronosticada).
 * `history`: eventos cerrados de EONET del último año y sismos M4+ de 30 días.
 * `sources`: si cada fuente respondió en esta consulta.
 */
export async function getEvents(point: LatLon): Promise<{
  alerts: DisasterAlert[];
  history: DisasterAlert[];
  fallbackSources: string[];
  sources: SourceStatus[];
}> {
  const [seismicResult, closedResult, ...feeds] = await Promise.allSettled([
    withTimeout(getSeismic(point), 6_500),
    withTimeout(getEonetHistory(point, 365), 6_000),
    withTimeout(getEonetAlerts(point), 6_000),
    withTimeout(getGdacsAlerts(point), 6_000),
    withTimeout(getTsunamiBulletins(point), 6_000),
    withTimeout(getStorms(point), 6_000),
    SHOW_FIRES ? withTimeout(getFires(point), 6_000) : Promise.resolve([]),
    withTimeout(getRainForecast(point), 6_000),
  ]);
  const outcomes: Outcome[] = [
    { id: "eonet", label: "NASA EONET", result: feeds[0] },
    { id: "gdacs", label: "GDACS", result: feeds[1] },
    { id: "ptwc", label: "Tsunamis · NOAA PTWC", result: feeds[2] },
    { id: "nhc", label: "Ciclones · NOAA NHC", result: feeds[3] },
    ...(SHOW_FIRES ? [{ id: "firms", label: "Fuegos · NASA FIRMS", result: feeds[4] }] : []),
    { id: "rain", label: "Lluvia · Open-Meteo", result: feeds[5] },
  ];

  const seismic = seismicResult.status === "fulfilled" ? seismicResult.value : null;
  const failedSeismic = seismic ? seismic.failed : ["USGS", "OVSICORI", "RSN"];
  const newestOf = (alerts: DisasterAlert[]) =>
    alerts.reduce<string | null>((max, alert) => (
      Number.isFinite(reportTime(alert.date)) && (!max || reportTime(alert.date) > reportTime(max))
        ? alert.date : max
    ), null);
  const sources: SourceStatus[] = [
    ...outcomes.map(({ id, label, result }) => ({
      id,
      label,
      ok: result.status === "fulfilled",
      count: result.status === "fulfilled" ? result.value.length : 0,
      latest: result.status === "fulfilled" ? newestOf(result.value) : null,
    })),
    {
      id: "usgs",
      label: "Sismos · USGS",
      ok: !failedSeismic.includes("USGS"),
      count: seismic?.global ?? 0,
      latest: seismic?.latest.USGS ?? null,
    },
    {
      id: "ovsicori",
      label: "Sismos · OVSICORI",
      ok: !failedSeismic.includes("OVSICORI"),
      count: seismic?.local ?? 0,
      latest: seismic?.latest.OVSICORI ?? null,
      // OVSICORI regenera su archivo con cada sismo nuevo (~8 al día en la región). Horas sin
      // cambios son normales; 12 h sin regenerarse indica que algo se detuvo.
      stale: feedIsStale(seismic?.ovsicoriGeneratedAt ?? null, 12),
    },
    {
      id: "rsn",
      label: "Sismos sentidos · RSN",
      ok: !failedSeismic.includes("RSN"),
      count: seismic?.rsn ?? 0,
      latest: seismic?.latest.RSN ?? null,
    },
    {
      id: "eonet-historial",
      label: "Historial · EONET",
      ok: closedResult.status === "fulfilled",
      count: closedResult.status === "fulfilled" ? closedResult.value.length : 0,
      latest: closedResult.status === "fulfilled" ? newestOf(closedResult.value) : null,
    },
  ];

  const events = seismic?.events ?? [];
  // Vigencia por amenaza: lo que ya no tiene reportes recientes pasa al historial.
  const { current: alerts, stale } = partitionCurrent(
    dedupe([
      ...outcomes.flatMap(({ result }) => (result.status === "fulfilled" ? result.value : [])),
      ...seismicAlerts(events),
    ]),
  );
  const active = new Set(alerts.map((alert) => alert.id));
  const listed = new Set<string>();
  const history = [
    ...stale,
    ...(closedResult.status === "fulfilled" ? closedResult.value : []),
    ...seismicAlerts(events, 30, 3),
  ].filter((alert) => {
    if (active.has(alert.id) || listed.has(alert.id)) return false;
    listed.add(alert.id);
    return true;
  });

  // Incendios ocultos por ahora: también los de EONET y GDACS.
  const shown = (alert: DisasterAlert) => SHOW_FIRES || !isFire(alert.category);
  return {
    alerts: alerts.filter(shown),
    history: history.filter(shown),
    fallbackSources: sources.filter((source) => !source.ok).map((source) => source.id),
    sources,
  };
}

export async function getOverlays(
  point: LatLon,
  radiusKm: number,
): Promise<{ data: Omit<OverlaysData, "sources"> & { sources: OverlaySource[] }; fallbackSources: string[] }> {
  const [osmResult, eonetResult, gdacsResult, seismicResult] = await Promise.allSettled([
    withTimeout(getOsmOverlays(point, radiusKm), 6_000),
    withTimeout(getEonetAlerts(point), 6_000),
    withTimeout(getGdacsAlerts(point), 6_000),
    withTimeout(getSeismic(point), 6_500),
  ]);

  const fallbackSources: string[] = [];

  const osm =
    osmResult.status === "fulfilled"
      ? osmResult.value
      : {
          roads: EMPTY as GeoCollection<RoadProps>,
          protectedAreas: EMPTY as GeoCollection<ProtectedAreaProps>,
          fallback: true,
          mode: "empty" as const,
          fetchedAt: null,
        };

  if (osmResult.status === "rejected" || osm.mode === "empty") fallbackSources.push("osm");

  const eonet = eonetResult.status === "fulfilled" ? eonetResult.value : [];
  if (eonetResult.status === "rejected") fallbackSources.push("eonet");

  const gdacs = gdacsResult.status === "fulfilled" ? gdacsResult.value : [];
  if (gdacsResult.status === "rejected") fallbackSources.push("gdacs");

  const seismic: SeismicEvent[] =
    seismicResult.status === "fulfilled" ? seismicResult.value.events : [];
  if (seismicResult.status === "rejected") fallbackSources.push("seismic");
  else fallbackSources.push(...seismicResult.value.failed.map((source) => source.toLowerCase()));

  const volcanoes = getVolcanoes(point, radiusKm);
  const borders = getBorders(point, radiusKm);

  const sources: OverlaySource[] = [
    {
      id: "osm",
      label: "Caminos y áreas protegidas · OpenStreetMap",
      url: "https://www.openstreetmap.org/copyright",
      note:
        osm.mode === "live"
          ? "Consulta viva a Overpass API, simplificada para el mapa."
          : osm.mode === "snapshot"
            ? "Snapshot local de OpenStreetMap para la región demo; se regenera con scripts/build-overlays.mjs."
            : "Overpass no respondió para este punto: sin capa de caminos.",
      live: osm.mode === "live",
      fallback: osm.mode === "empty",
    },
    {
      id: "gvp",
      label: "Volcanes · Smithsonian GVP",
      url: "https://volcano.si.edu/",
      note: "Catálogo Holoceno, snapshot del repositorio. No es monitoreo en vivo.",
      live: false,
      fallback: false,
    },
    {
      id: "natural-earth",
      label: "Fronteras · Natural Earth 110m",
      url: "https://www.naturalearthdata.com/",
      note: "Límites internacionales de referencia, no son fronteras oficiales.",
      live: false,
      fallback: false,
    },
    {
      id: "eonet",
      label: "Eventos naturales · NASA EONET",
      url: "https://eonet.gsfc.nasa.gov/",
      note: eonetResult.status === "rejected"
        ? "EONET no respondió en esta consulta."
        : "Eventos abiertos en el área; EONET agrega fuentes como GDACS e InciWeb.",
      live: true,
      fallback: eonetResult.status === "rejected",
    },
    {
      id: "gdacs",
      label: "Alertas oficiales · GDACS",
      url: "https://www.gdacs.org/",
      note: gdacsResult.status === "rejected"
        ? "GDACS no respondió en esta consulta."
        : "Nivel verde/naranja/rojo según GDACS. Complemento no NASA.",
      live: true,
      fallback: gdacsResult.status === "rejected",
    },
    {
      id: "usgs",
      label: "Sismos · USGS",
      url: "https://earthquake.usgs.gov/",
      note:
        seismicResult.status === "fulfilled" && seismicResult.value.global > 0
          ? "Catálogo FDSN de los últimos 30 días; revisado y automático."
          : "Sin sismos M≥2,5 en 600 km o USGS no respondió.",
      live: true,
      fallback: seismicResult.status === "rejected" || seismicResult.value.failed.includes("USGS"),
    },
    {
      id: "ovsicori",
      label: "Sismos locales · OVSICORI-UNA",
      url: "https://www.ovsicori.una.ac.cr/",
      note:
        seismicResult.status === "fulfilled" && seismicResult.value.local > 0
          ? "Red sísmica local de Costa Rica; datos preliminares."
          : "Sin sismos locales M≥2,5 o OVSICORI no respondió.",
      live: true,
      fallback: seismicResult.status === "rejected" || seismicResult.value.failed.includes("OVSICORI"),
    },
  ];

  return {
    data: {
      roads: osm.roads,
      protectedAreas: osm.protectedAreas,
      volcanoes: volcanoes.collection as GeoCollection<VolcanoProps>,
      borders: borders as GeoCollection<Record<string, never>>,
      alerts: partitionCurrent(dedupe([...eonet, ...gdacs, ...seismicAlerts(seismic)])).current
        .filter((alert) => SHOW_FIRES || !isFire(alert.category)),
      seismic,
      sources,
    },
    fallbackSources,
  };
}
