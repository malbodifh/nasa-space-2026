import "server-only";

/**
 * Suscripciones push y registro de lo ya enviado. Con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 * usa Supabase (REST, sin dependencias); sin ellas usa memoria, solo útil en desarrollo local.
 */
export type PushSub = {
  endpoint: string;
  p256dh: string;
  auth: string;
  lat: number;
  lon: number;
  lang: "es" | "en";
};

export type PushStore = {
  persistent: boolean;
  upsert(sub: PushSub): Promise<void>;
  remove(endpoint: string): Promise<void>;
  list(): Promise<PushSub[]>;
  /** Pares «endpoint|alerta» enviados en las últimas 48 h. */
  sent(): Promise<Set<string>>;
  markSent(pairs: { endpoint: string; alertId: string }[]): Promise<void>;
};

const SENT_TTL_MS = 48 * 60 * 60 * 1000;

export function memoryStore(): PushStore {
  const subs = new Map<string, PushSub>();
  const sent = new Map<string, number>();
  return {
    persistent: false,
    async upsert(sub) {
      subs.set(sub.endpoint, sub);
    },
    async remove(endpoint) {
      subs.delete(endpoint);
    },
    async list() {
      return [...subs.values()];
    },
    async sent() {
      const cutoff = Date.now() - SENT_TTL_MS;
      return new Set([...sent].filter(([, at]) => at >= cutoff).map(([key]) => key));
    },
    async markSent(pairs) {
      for (const { endpoint, alertId } of pairs) sent.set(`${endpoint}|${alertId}`, Date.now());
    },
  };
}

export function supabaseStore(baseUrl: string, key: string): PushStore {
  const root = `${baseUrl.replace(/\/$/, "")}/rest/v1`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  async function call(path: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${root}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase ${response.status} ${path.split("?")[0]}`);
    return response;
  }

  return {
    persistent: true,
    async upsert(sub) {
      await call("/push_subscriptions?on_conflict=endpoint", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ ...sub, updated_at: new Date().toISOString() }),
      });
    },
    async remove(endpoint) {
      await call(`/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, { method: "DELETE" });
    },
    async list() {
      const response = await call("/push_subscriptions?select=endpoint,p256dh,auth,lat,lon,lang&limit=5000");
      return (await response.json()) as PushSub[];
    },
    async sent() {
      const since = new Date(Date.now() - SENT_TTL_MS).toISOString();
      const response = await call(`/push_sent?select=endpoint,alert_id&sent_at=gte.${encodeURIComponent(since)}&limit=50000`);
      const rows = (await response.json()) as { endpoint: string; alert_id: string }[];
      return new Set(rows.map((row) => `${row.endpoint}|${row.alert_id}`));
    },
    async markSent(pairs) {
      if (pairs.length === 0) return;
      await call("/push_sent?on_conflict=endpoint,alert_id", {
        method: "POST",
        headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify(pairs.map(({ endpoint, alertId }) => ({ endpoint, alert_id: alertId }))),
      });
      // Limpieza de lo viejo, para que la tabla no crezca sin límite.
      const old = new Date(Date.now() - SENT_TTL_MS).toISOString();
      await call(`/push_sent?sent_at=lt.${encodeURIComponent(old)}`, { method: "DELETE" }).catch(() => {});
    },
  };
}

let instance: PushStore | null = null;

export function getPushStore(): PushStore {
  if (!instance) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    instance = url && key ? supabaseStore(url, key) : memoryStore();
  }
  return instance;
}
