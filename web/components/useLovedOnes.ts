"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import { ensureDevice, markLinked, readDevice, type StoredDevice } from "@/lib/device";
import type { LinksResponse } from "@/lib/links/types";
import { refreshPush } from "@/lib/push-client";
import type { LatLon } from "@/lib/types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `Error ${response.status}`);
  return data;
}

/**
 * Seres queridos: a quién sigue el teléfono (y si están en riesgo), quién lo sigue, invitar y
 * quitar vínculos. Con `point` real, mantiene al día la zona que ven sus seres queridos.
 */
export function useLovedOnes(point: LatLon | null, lang: "es" | "en") {
  const [device, setDevice] = useState<StoredDevice | null>(null);
  useEffect(() => {
    // Se lee después de montar: en el servidor no hay almacenamiento local.
    const timer = window.setTimeout(() => setDevice(readDevice()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const credentials = useMemo(() => (device?.linked ? { id: device.id, key: device.key } : null), [device]);

  const { data, error, mutate } = useSWR<LinksResponse>(
    credentials ? ["seres-queridos", credentials.id] : null,
    () => post<LinksResponse>("/api/links/list", { device: credentials }),
    { refreshInterval: 60_000, revalidateOnFocus: true },
  );

  // La zona que ven sus seres queridos se actualiza cada vez que la app conoce su ubicación real.
  const lastSent = useRef<string | null>(null);
  const lat = point?.lat;
  const lon = point?.lon;
  useEffect(() => {
    if (!device?.linked || lat === undefined || lon === undefined) return;
    const key = `${lat.toFixed(2)}:${lon.toFixed(2)}`;
    if (lastSent.current === key) return;
    lastSent.current = key;
    void post("/api/links/location", { device: { id: device.id, key: device.key }, lat, lon, lang }).catch(() => {
      lastSent.current = null;
    });
  }, [device, lat, lon, lang]);

  /** Crea la invitación y devuelve el link para compartir. */
  const invite = useCallback(
    async (inviterName: string, alias: string): Promise<string> => {
      const device = ensureDevice();
      const { code } = await post<{ code: string }>("/api/links/invite", {
        device: { id: device.id, key: device.key },
        inviterName,
        alias,
        lang,
      });
      // Solo cuando el servidor ya conoce el teléfono: antes, enviar su zona daría «no reconocido».
      setDevice(markLinked());
      // La suscripción push queda asociada al teléfono para recibir avisos por sus seres queridos.
      if (lat !== undefined && lon !== undefined) void refreshPush({ lat, lon }, lang);
      return `${window.location.origin}/vincular?c=${encodeURIComponent(code)}`;
    },
    [lang, lat, lon],
  );

  const remove = useCallback(
    async (other: string, role: "following" | "follower") => {
      if (!credentials) return;
      await post("/api/links/remove", { device: credentials, other, role });
      await mutate();
    },
    [credentials, mutate],
  );

  return { following: data?.following ?? [], followers: data?.followers ?? [], loading: Boolean(credentials) && !data && !error, error: Boolean(error), invite, remove, refresh: mutate };
}
