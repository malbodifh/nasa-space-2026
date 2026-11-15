import "server-only";

import { cached } from "@/lib/cache";
import { distanceKm } from "@/lib/geo";
import type { AlertLevel, DisasterAlert, LatLon } from "@/lib/types";

const GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH";
const LOOKBACK_DAYS = 45;
const MAX_ALERT_KM = 600;

const CATEGORY_LABEL: Record<string, string> = {
  WF: "Incendio",
  TC: "Ciclón",
  FL: "Inundación",
  VO: "Volcán",
  DR: "Sequía",
  EQ: "Sismo",
};

type GdacsFeature = {
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    eventtype: string;
    eventid: number;
    eventname?: string;
    description?: string;
    alertlevel?: string;
    alertscore?: number;
    country?: string;
    fromdate?: string;
    todate?: string;
    datemodified?: string;
    url?: { report?: string; details?: string };
    severitydata?: { severitytext?: string };
  };
};

function levelOf(value?: string): AlertLevel {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "red") return "red";
  if (normalized === "orange") return "orange";
  if (normalized === "green") return "green";
  return "info";
}

export async function getGdacsAlerts(point: LatLon): Promise<DisasterAlert[]> {
  const key = `gdacs:${point.lat}:${point.lon}`;

  return cached(key, 30 * 60 * 1000, async () => {
    const today = new Date();
    const from = new Date(today.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const date = (value: Date) => value.toISOString().slice(0, 10);

    const url =
      `${GDACS_URL}?eventlist=WF,TC,FL,VO,DR,EQ` +
      `&fromDate=${date(from)}&toDate=${date(today)}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.1 (hackathon)" },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`GDACS ${response.status}`);

    const payload = (await response.json()) as { features?: GdacsFeature[] };
    const alerts: DisasterAlert[] = [];

    for (const feature of payload.features ?? []) {
      const [lon, lat] = feature.geometry?.coordinates ?? [];
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

      const distance = distanceKm(point, { lat, lon });
      const props = feature.properties;
      // Una sequía regional tiene el centroide lejos pero puede incluir a Costa Rica
      // en su lista de países. Filtrar solo por distancia la haría desaparecer.
      const mentionsCostaRica = /\bcosta\s+rica\b/i.test(props.country ?? "");
      if (distance > MAX_ALERT_KM && !mentionsCostaRica) continue;

      alerts.push({
        id: `GDACS-${props.eventtype}-${props.eventid}`,
        source: "GDACS",
        category: props.eventtype,
        categoryLabel: CATEGORY_LABEL[props.eventtype] ?? props.eventtype,
        title: props.eventname ?? props.description ?? "Evento sin nombre",
        level: levelOf(props.alertlevel),
        date: props.datemodified ?? props.fromdate ?? "",
        lat,
        lon,
        distanceKm: Math.round(distance * 10) / 10,
        url:
          props.url?.report ??
          `https://www.gdacs.org/report.aspx?eventid=${props.eventid}&eventtype=${props.eventtype}`,
        magnitude: props.severitydata?.severitytext ?? null,
      });
    }

    return alerts;
  });
}
