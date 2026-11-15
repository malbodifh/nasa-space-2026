import "server-only";

/** Llamada a la API REST de Supabase con la service role (sin dependencias). */
export type SupabaseCall = (path: string, init?: RequestInit) => Promise<Response>;

export function supabaseRest(baseUrl: string, key: string): SupabaseCall {
  const root = `${baseUrl.replace(/\/$/, "")}/rest/v1`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  return async (path, init = {}) => {
    const response = await fetch(`${root}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase ${response.status} ${path.split("?")[0]}`);
    return response;
  };
}

/** Credenciales de Supabase del servidor, si están configuradas. */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}
