import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchLimited } from "@/app/api/_lib/remote";

function redirect(location: string) {
  return new Response(null, { status: 303, headers: { location } });
}

function ok(body = "datos") {
  return new Response(body, { status: 200, headers: { "content-type": "text/plain" } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLimited y redirecciones", () => {
  it("sigue el 303 de ASF hacia CloudFront, que es el caso real", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        redirect(
          "https://d1mv8zhcvry6x4.cloudfront.net/head-abc/sds-n-cumulus-prod.s3.us-west-2.amazonaws.com/file.kml?Signature=x",
        ),
      )
      .mockResolvedValueOnce(ok("kml"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchLimited("https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/x.kml", 1024);
    expect(result.status).toBe(200);
    expect(new TextDecoder().decode(result.bytes)).toBe("kml");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rechaza un redirect a un origen ajeno", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(redirect("https://evil.example/file")));
    await expect(fetchLimited("https://nisar.asf.earthdatacloud.nasa.gov/x.kml", 1024)).rejects.toThrow(
      "orígenes permitidos",
    );
  });

  it("rechaza bajar a http y no acepta credenciales en la URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(redirect("http://d1mv8zhcvry6x4.cloudfront.net/x")));
    await expect(fetchLimited("https://nisar.asf.earthdatacloud.nasa.gov/x.kml", 1024)).rejects.toThrow();

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(redirect("https://user:pass@cloudfront.net/x")));
    await expect(fetchLimited("https://nisar.asf.earthdatacloud.nasa.gov/x.kml", 1024)).rejects.toThrow();
  });

  it("corta cuando el cuerpo supera el límite", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok("x".repeat(2048))));
    await expect(fetchLimited("https://nisar.asf.earthdatacloud.nasa.gov/x.kml", 1024)).rejects.toThrow(
      "demasiado grande",
    );
  });
});
