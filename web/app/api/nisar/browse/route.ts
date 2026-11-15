import { fetchLimited } from "@/app/api/_lib/remote";
import { browseUrl, GRANULE_PATTERN, isCollection } from "@/lib/nisar-remote";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const collection = url.searchParams.get("c") ?? "";
  const granule = url.searchParams.get("g") ?? "";

  // Solo productos NISAR GCOV conocidos: la ruta no es un proxy abierto.
  if (!isCollection(collection) || !GRANULE_PATTERN.test(granule)) {
    return Response.json({ error: "Producto inválido" }, { status: 400 });
  }

  let bytes: Uint8Array;
  try {
    const result = await fetchLimited(browseUrl(collection, granule), 24 * 1024 * 1024);
    if (result.status < 200 || result.status >= 300) {
      return Response.json({ error: "ASF no devolvió la imagen" }, { status: 502 });
    }
    bytes = result.bytes;
  } catch {
    return Response.json(
      { error: "No pudimos descargar la vista previa de ASF." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!PNG_SIGNATURE.every((value, i) => bytes[i] === value)) {
    return Response.json({ error: "La vista previa no está disponible" }, { status: 404 });
  }

  return new Response(bytes as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
    },
  });
}
