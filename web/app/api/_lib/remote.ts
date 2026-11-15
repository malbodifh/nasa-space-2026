/**
 * ASF sirve las vistas previas con un 303 a CloudFront firmado. Sin permitir ese salto,
 * la búsqueda de pasadas falla con 502 aunque CMR responda bien.
 */
const REDIRECT_HOSTS = ["nisar.asf.earthdatacloud.nasa.gov", "cloudfront.net", "amazonaws.com"];

function allowedRedirect(next: URL, origin: string): boolean {
  if (next.username || next.password) return false;
  if (next.origin === origin) return true;
  if (next.protocol !== "https:") return false;
  const host = next.hostname.toLowerCase();
  return REDIRECT_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/** Descarga acotada: el límite también se aplica a respuestas chunked sin Content-Length. */
export async function fetchLimited(url: string, maxBytes: number, timeoutMs = 8_000): Promise<{
  status: number;
  bytes: Uint8Array;
}> {
  const origin = new URL(url).origin;
  const signal = AbortSignal.timeout(timeoutMs);
  let target = url;
  for (let redirects = 0; redirects <= 2; redirects += 1) {
    const response = await fetch(target, {
      redirect: "manual",
      signal,
      cache: "no-store",
      headers: { Accept: "*/*", "User-Agent": "AstralCodes-GammaAlert/0.3" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirects === 2) throw new Error("Redirección no disponible");
      const next = new URL(location, target);
      if (!allowedRedirect(next, origin)) {
        throw new Error("Redirección fuera de los orígenes permitidos");
      }
      target = next.href;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      return { status: response.status, bytes: new Uint8Array() };
    }
    const declared = response.headers.get("content-length");
    if (declared && Number(declared) > maxBytes) {
      await response.body?.cancel();
      throw new Error("Respuesta demasiado grande");
    }
    const reader = response.body?.getReader();
    if (!reader) return { status: response.status, bytes: new Uint8Array() };
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          throw new Error("Respuesta demasiado grande");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { status: response.status, bytes };
  }
  throw new Error("Demasiadas redirecciones");
}
