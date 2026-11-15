import { browseUrl, GRANULE_PATTERN, isCollection } from "@/lib/nisar-remote";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const collection = url.searchParams.get("c") ?? "";
  const granule = url.searchParams.get("g") ?? "";

  // Solo productos NISAR GCOV conocidos: la ruta no es un proxy abierto.
  if (!isCollection(collection) || !GRANULE_PATTERN.test(granule)) {
    return Response.json({ error: "Producto inválido" }, { status: 400 });
  }

  const response = await fetch(browseUrl(collection, granule), { redirect: "follow" });
  if (!response.ok) {
    return Response.json({ error: "ASF no devolvió la imagen" }, { status: 502 });
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!PNG_SIGNATURE.every((value, i) => bytes[i] === value)) {
    return Response.json({ error: "La vista previa no está disponible" }, { status: 404 });
  }

  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
    },
  });
}
