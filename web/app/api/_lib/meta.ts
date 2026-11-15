import { reportTime } from "@/lib/alert-rules";
import type { ApiMeta } from "@/lib/types";

export function responseMeta(started: number, dates: (string | null | undefined)[], fallback: boolean): ApiMeta {
  const now = Date.now();
  const times = dates.flatMap((date) => {
    const at = date ? reportTime(date) : Number.NaN;
    return Number.isFinite(at) && at <= now ? [at] : [];
  });
  // La frescura la define el dato más reciente, no el más viejo del historial.
  const newest = times.length ? Math.max(...times) : null;
  return {
    cached: false,
    requestedAt: new Date(started).toISOString(),
    updatedAt: new Date(now).toISOString(),
    dataUpdatedAt: newest === null ? null : new Date(newest).toISOString(),
    latencySeconds: newest === null ? null : Math.floor((now - newest) / 1000),
    fallback,
    durationMs: now - started,
  };
}
