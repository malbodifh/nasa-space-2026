import type { DisasterAlert } from "@/lib/types";

type Cap = NonNullable<DisasterAlert["tsunamiCap"]>;
const unknown: Cap = { state: "unknown" };

/**
 * Solo se acepta el CAP de la entrada concreta: HTTPS, host oficial, ruta del centro y sin
 * query, hash ni credenciales. Una URL externa o redirigida no se consulta.
 */
export function capUrl(entry: string, source: "PTWC" | "NTWC"): string | null {
  const links = entry.match(/<link\b[^>]*\/?>/gi) ?? [];
  for (const link of links) {
    if (!/\btype=["']application\/cap\+xml["']/i.test(link)) continue;
    const href = link.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    try {
      const url = new URL(href);
      const center = source === "PTWC" ? "PHEB" : "PAAQ";
      if (url.protocol === "https:" && url.hostname === "www.tsunami.gov" && !url.port
        && !url.username && !url.password && !url.search && !url.hash
        && new RegExp(`^/events/${center}/[0-9/]+/[A-Z0-9]+/${center}CAP\\.xml$`).test(url.pathname)) {
        return url.href;
      }
    } catch {
      return null;
    }
  }
  return null;
}

/** Valor de un elemento hoja, con prefijo de espacio de nombres opcional. */
function leaf(xml: string, name: string): string | null {
  return xml.match(new RegExp(`<(?:[\\w.-]+:)?${name}[^>]*>([^<]*)</(?:[\\w.-]+:)?${name}>`, "i"))?.[1].trim() ?? null;
}

/**
 * Lee `status`, `msgType` y `expires` del CAP. Devuelve «desconocido» ante cualquier ambigüedad
 * (fecha distinta a la del Atom, varios `info`, XML malformado): no saber la vigencia no prueba
 * que la amenaza haya cesado.
 */
export function parseTsunamiCap(xml: string, atomDate: string): Cap {
  if (xml.length > 256_000 || /<!DOCTYPE|<!ENTITY/i.test(xml)) return unknown;
  if (!/^\s*(?:<\?xml[^>]*\?>\s*)?<(?:[\w.-]+:)?alert\b/i.test(xml) || !/<\/(?:[\w.-]+:)?alert>\s*$/i.test(xml)) {
    return unknown;
  }
  const sent = leaf(xml, "sent");
  if (!sent || Date.parse(sent) !== Date.parse(atomDate)) return unknown;
  if (leaf(xml, "status") !== "Actual") return unknown;

  const msgType = leaf(xml, "msgType");
  if (msgType === "Cancel") return { state: "cancelled" };
  if (msgType !== "Alert" && msgType !== "Update") return unknown;

  // Varios bloques `info` pueden tener vigencias distintas: no se elige una arbitrariamente.
  if ((xml.match(/<(?:[\w.-]+:)?info\b/gi) ?? []).length !== 1) return unknown;
  const expires = leaf(xml, "expires");
  if (!expires || !Number.isFinite(Date.parse(expires))) return unknown;
  return { state: "actual", expires };
}
