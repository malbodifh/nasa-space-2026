import { afterEach, describe, expect, it, vi } from "vitest";
import { isCurrent, partitionCurrent } from "@/lib/alert-rules";
import { capUrl, parseTsunamiCap } from "@/lib/tsunami-cap";
import type { DisasterAlert } from "@/lib/types";
import { getTsunamiBulletins } from "@/lib/sources/feeds";

vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllGlobals());

const sent = "2026-11-15T10:00:00Z";
const xml = (type: string, extra = "<info><expires>2026-11-15T11:00:00Z</expires></info>") =>
  `<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"><sent>${sent}</sent><status>Actual</status><msgType>${type}</msgType>${extra}</alert>`;

describe("CAP de tsunami", () => {
  it("acepta solo el CAP HTTPS del centro y la ruta oficial", () => {
    const link = (href: string) => `<link type="application/cap+xml" href="${href}" />`;
    const url = "https://www.tsunami.gov/events/PHEB/2026/07/17/26198000/2/WEPA40/PHEBCAP.xml";
    expect(capUrl(link(url), "PTWC")).toBe(url);
    expect(capUrl(link(url), "NTWC")).toBeNull();
    expect(capUrl(link(url.replace("www.tsunami.gov", "example.com")), "PTWC")).toBeNull();
  });

  it("lee Alert, Update y Cancel, pero rechaza fechas distintas, XML inválido y datos incompletos", () => {
    expect(parseTsunamiCap(xml("Alert"), sent)).toEqual({ state: "actual", expires: "2026-11-15T11:00:00Z" });
    expect(parseTsunamiCap(xml("Update"), sent).state).toBe("actual");
    expect(parseTsunamiCap(xml("Cancel", ""), sent).state).toBe("cancelled");
    expect(parseTsunamiCap(xml("Alert"), "2026-11-15T09:00:00Z").state).toBe("unknown");
    expect(parseTsunamiCap(xml("Alert", ""), sent).state).toBe("unknown");
    expect(parseTsunamiCap("<alert>", sent).state).toBe("unknown");
    expect(parseTsunamiCap(xml("Test"), sent).state).toBe("unknown");
  });

  it("manda al historial los cancelados o vencidos y conserva lo desconocido sin asumir seguridad", () => {
    const base: DisasterAlert = {
      id: "ptwc:1", source: "PTWC", category: "tsunami", categoryLabel: "Tsunami",
      title: "Aviso", level: "red", date: sent, lat: 10, lon: -84, distanceKm: 10, url: "",
    };
    const now = Date.parse("2026-11-15T11:00:00Z");
    const expired = { ...base, tsunamiCap: parseTsunamiCap(xml("Update"), sent) };
    const cancelled = { ...base, tsunamiCap: parseTsunamiCap(xml("Cancel", ""), sent) };
    expect(isCurrent(expired, now)).toBe(false);
    expect(isCurrent(cancelled, now)).toBe(false);
    expect(isCurrent({ ...base, tsunamiCap: { state: "unknown" } }, now)).toBe(true);
    expect(partitionCurrent([expired, cancelled], now).stale).toHaveLength(2);
  });

  it("consulta el CAP enlazado por Atom y conserva un boletín si falla la consulta", async () => {
    const url = "https://www.tsunami.gov/events/PHEB/2026/07/17/26198000/2/WEPA40/PHEBCAP.xml";
    const atom = `<feed><entry><id>cap-test</id><title>Zona</title><updated>${sent}</updated>
      <geo:lat>10</geo:lat><geo:long>-84</geo:long>
      <summary>Category: Warning Bulletin Issue Time: x</summary>
      <link type="application/cap+xml" href="${url}" /></entry></feed>`;
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const address = String(input);
      if (address === url) return new Response(xml("Cancel", ""));
      return new Response(address.includes("PHEBAtom") ? atom : "<feed></feed>");
    }));
    const [alert] = await getTsunamiBulletins({ lat: 10.123456, lon: -84 });
    expect(alert.tsunamiCap?.state).toBe("cancelled");

    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const address = String(input);
      if (address === url) throw new Error("CAP no disponible");
      return new Response(address.includes("PHEBAtom") ? atom : "<feed></feed>");
    }));
    const [fallback] = await getTsunamiBulletins({ lat: 10.123457, lon: -84 });
    expect(fallback.tsunamiCap?.state).toBe("unknown");
    expect(fallback.detail).toContain("Vigencia CAP no verificada");
  });
});
