import "server-only";

import { affecting, locationStatus } from "@/lib/events";
import { getEvents } from "@/lib/sources/overlays";
import type { LovedRisk } from "@/lib/links/types";
import type { DisasterAlert, LatLon } from "@/lib/types";

/** Alertas de cada zona, consultadas una sola vez por celda de ~1 km. */
export function alertsByCell(): (point: LatLon) => Promise<DisasterAlert[]> {
  const cache = new Map<string, Promise<DisasterAlert[]>>();
  return (point) => {
    const key = `${point.lat.toFixed(2)}:${point.lon.toFixed(2)}`;
    let pending = cache.get(key);
    if (!pending) {
      pending = getEvents({ lat: Number(point.lat.toFixed(2)), lon: Number(point.lon.toFixed(2)) }).then((result) => result.alerts);
      cache.set(key, pending);
    }
    return pending;
  };
}

/** Estado de un ser querido con las mismas reglas que se usan para la propia ubicación. */
export function riskFrom(alerts: DisasterAlert[]): LovedRisk {
  const status = locationStatus(alerts);
  return { tone: status.tone, count: affecting(alerts).length, nearest: status.nearest };
}
