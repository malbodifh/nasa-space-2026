import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchLimited } from "@/app/api/_lib/remote";
import { GET as browse } from "@/app/api/nisar/browse/route";
import { GET as search } from "@/app/api/nisar/search/route";

const GRANULE = "NISAR_L2_PR_GCOV_025_170_D_083_4005_DHDH_A_20260720T000909_20260720T000944_P05023_N_F_J_001";
const COLLECTION = "NISAR_L2_GCOV_PROVISIONAL_V1";
const browseRequest = (g = GRANULE, c = COLLECTION) =>
  new Request(`https://app.test/api/nisar/browse?g=${encodeURIComponent(g)}&c=${encodeURIComponent(c)}`);
const searchRequest = () => new Request("https://app.test/api/nisar/search?lat=10&lon=-84");
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
let upstream: ReturnType<typeof vi.fn>;

beforeEach(() => {
  upstream = vi.fn();
  vi.stubGlobal("fetch", upstream);
});
afterEach(() => vi.unstubAllGlobals());

describe("descargas acotadas NISAR", () => {
  it("rechaza Content-Length excesivo sin leer el cuerpo", async () => {
    const cancel = vi.fn();
    upstream.mockResolvedValue(new Response(new ReadableStream({ cancel }), { headers: { "Content-Length": "1000" } }));
    await expect(fetchLimited("https://example.test/file", 10)).rejects.toThrow("demasiado grande");
    expect(cancel).toHaveBeenCalled();
  });
  it("limita una respuesta chunked aunque no declare tamaño", async () => {
    upstream.mockResolvedValue(new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(11)); },
    })));
    await expect(fetchLimited("https://example.test/file", 10)).rejects.toThrow("demasiado grande");
  });
  it("no sigue una redirección hacia un origen desconocido", async () => {
    upstream.mockResolvedValue(new Response(null, { status: 302, headers: { Location: "https://evil.test/x" } }));
    await expect(fetchLimited("https://example.test/file", 10)).rejects.toThrow("orígenes permitidos");
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it("sí sigue el salto de ASF a CloudFront firmado, que es el caso real", async () => {
    upstream
      .mockResolvedValueOnce(
        new Response(null, {
          status: 303,
          headers: {
            Location:
              "https://d1mv8zhcvry6x4.cloudfront.net/head-abc/sds-n-cumulus-prod.s3.us-west-2.amazonaws.com/x.kml?Signature=y",
          },
        }),
      )
      .mockResolvedValueOnce(new Response("kml", { status: 200 }));
    const result = await fetchLimited("https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/x.kml", 1024);
    expect(result.status).toBe(200);
    expect(upstream).toHaveBeenCalledTimes(2);
  });
  it("acota las redirecciones al mismo origen y usa señal de timeout", async () => {
    upstream.mockResolvedValue(new Response(null, { status: 302, headers: { Location: "/next" } }));
    await expect(fetchLimited("https://example.test/file", 10)).rejects.toThrow("Redirección");
    expect(upstream).toHaveBeenCalledTimes(3);
    expect(upstream.mock.calls[0][1]).toMatchObject({ redirect: "manual", signal: expect.any(AbortSignal) });
  });
});

describe("GET /api/nisar/browse", () => {
  it.each(["../../etc/passwd", "NISAR_L2_PR_GCOV_A/../../x", "NISAR_L2_PR_GCOV_" + "A".repeat(181)])(
    "rechaza granule inválido %s", async (granule) => {
      expect((await browse(browseRequest(granule))).status).toBe(400);
      expect(upstream).not.toHaveBeenCalled();
    },
  );
  it("rechaza colecciones desconocidas", async () => {
    expect((await browse(browseRequest(GRANULE, "other"))).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it("devuelve PNG válido, con timeout y host fijo", async () => {
    upstream.mockResolvedValue(new Response(png));
    const response = await browse(browseRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png);
    expect(upstream.mock.calls[0][0]).toContain(`https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/${COLLECTION}/`);
  });
  it("no acepta HTML ni una firma PNG truncada", async () => {
    upstream.mockResolvedValueOnce(new Response("<html>login</html>"));
    expect((await browse(browseRequest())).status).toBe(404);
    upstream.mockResolvedValueOnce(new Response(png.slice(0, 4)));
    expect((await browse(browseRequest())).status).toBe(404);
  });
  it("captura timeout/red caídos sin filtrar el error upstream", async () => {
    upstream.mockRejectedValue(new Error("secret upstream URL"));
    const response = await browse(browseRequest());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("secret");
  });
});

describe("GET /api/nisar/search", () => {
  it("ignora títulos no válidos antes de construir la URL KML", async () => {
    upstream.mockImplementation(async () => Response.json({
      feed: { entry: [{ title: "../../x" }, { title: "NISAR_L2_PR_GCOV_" }] },
    }));
    const response = await search(searchRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: null, meta: { reason: "sin-pasadas" } });
    expect(upstream.mock.calls.every(([url]) => String(url).startsWith("https://cmr.earthdata.nasa.gov/"))).toBe(true);
  });
  it("mantiene provisional y comprueba que el KML cubra el punto", async () => {
    upstream.mockImplementation(async (url: string) => {
      if (url.includes("cmr.earthdata")) return Response.json({
        feed: { entry: url.includes("PROVISIONAL") ? [{ title: GRANULE }] : [] },
      });
      return new Response("<coordinates>-85,9,0 -83,9,0 -83,11,0 -85,11,0 -85,9,0</coordinates>");
    });
    const response = await search(searchRequest());
    const { data } = await response.json();
    expect(response.status).toBe(200);
    expect(data.bounds).toEqual([-85, 9, -83, 11]);
    expect(data.passes[0]).toMatchObject({ status: "provisional", collection: COLLECTION, granule: GRANULE });
  });
  it("conserva el catálogo provisional si el validado falla, indicando fallback", async () => {
    upstream.mockImplementation(async (url: string) => {
      if (url.includes("cmr.earthdata")) {
        return url.includes("PROVISIONAL")
          ? Response.json({ feed: { entry: [{ title: GRANULE }] } })
          : new Response(null, { status: 503 });
      }
      return new Response("<coordinates>-85,9 -83,9 -83,11 -85,11</coordinates>");
    });
    const response = await search(searchRequest());
    const { data, meta } = await response.json();
    expect(response.status).toBe(200);
    expect(data.passes[0].status).toBe("provisional");
    expect(meta).toMatchObject({ fallback: true, fallbackCollections: ["NISAR_L2_GCOV_V1"] });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("prefiere validado solo cuando esa colección realmente lo devolvió", async () => {
    upstream.mockImplementation(async (url: string) => url.includes("cmr.earthdata")
      ? Response.json({ feed: { entry: [{ title: GRANULE }] } })
      : new Response("<coordinates>-85,9 -83,9 -83,11 -85,11</coordinates>"));
    const { data } = await (await search(searchRequest())).json();
    expect(data.passes[0]).toMatchObject({ status: "validado", collection: "NISAR_L2_GCOV_V1" });
  });
  it("prefiere un cuadro con pasadas validadas antes que uno con más fechas provisionales", async () => {
    const validatedFrame = "004_A_007_4005";
    const provisionalFrame = "170_D_083_4005";
    const granuleFor = (frame: string, date: string) =>
      `NISAR_L2_PR_GCOV_025_${frame}_DHDH_A_${date}T000909_${date}T000944_P05023_N_F_J_001`;
    upstream.mockImplementation(async (url: string) => {
      if (url.includes("cmr.earthdata")) {
        return url.includes("PROVISIONAL")
          ? Response.json({ feed: { entry: [
            { title: granuleFor(provisionalFrame, "20260720") },
            { title: granuleFor(provisionalFrame, "20260813") },
            { title: granuleFor(provisionalFrame, "20260930") },
          ] } })
          : Response.json({ feed: { entry: [
            { title: granuleFor(validatedFrame, "20261024") },
            { title: granuleFor(validatedFrame, "20261105") },
          ] } });
      }
      return new Response("<coordinates>-85,9 -83,9 -83,11 -85,11</coordinates>");
    });
    const { data } = await (await search(searchRequest())).json();
    expect(data.frame).toBe(validatedFrame);
    expect(data.passes.map((pass: { status: string }) => pass.status)).toEqual(["validado", "validado"]);
  });

  it("no convierte esquinas inválidas o fuera del punto en bounds válidos", async () => {
    upstream.mockImplementation(async (url: string) => url.includes("cmr.earthdata")
      ? Response.json({ feed: { entry: [{ title: GRANULE }] } })
      : new Response("<coordinates>1,1 2,1 2,2 1,2</coordinates>"));
    const response = await search(searchRequest());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("undefined_undefined");
  });
});
