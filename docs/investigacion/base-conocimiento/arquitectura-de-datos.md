# Arquitectura de datos

> **Estado:** documenta lo que existe en `web/` al **15/11/2026**. No propone cambiar la
> arquitectura; la parte de Python/HDF5 está marcada como **propuesta**.

## 1. Principios vigentes

1. **Monolito BFF:** las Route Handlers de Next son el backend. No hay servicio aparte.
2. **Sin base de datos ni auth:** el estado vive en archivos, caché en memoria y CDN.
3. **Claves solo en el servidor:** el cliente nunca llama una API externa con credenciales.
4. **El dominio no ve JSON crudo:** `lib/sources/*` normaliza; `lib/risk`, `lib/stats` y
   `lib/events` reciben tipos propios.
5. **Falla suave:** una fuente caída devuelve el último dato o un estado explícito, no una
   invención.
6. **NISAR no es un feed de alertas:** es una capa informativa de cambio.

## 2. Flujo NISAR actual

```text
NASA CMR (catálogo)
        |
        |  short_name, point/bbox, page_size
        v
/api/nisar/search  ──────────────►  lista de pasadas + bounds (KML)
        |                                   |
        |                                   v
        |                          SurfaceStudy (cliente)
        |                                   |
        v                                   v
ASF DAAC (browse PNG) ──► /api/nisar/browse ──► canvas del navegador
                                                |
                                                v
                                      recorte + suavizado + umbral
                                                |
                                                v
                                         mapa de cambio WebP
```

Y en paralelo, para las cuatro zonas precalculadas:

```text
scripts/build-nisar.mjs
  → CMR (por bbox)
  → ASF browse PNG + KML
  → recorte, suavizado HH, comparación contra la base
  → public/nisar/<zona>/*.webp
  → data/nisar.json
```

## 3. Componentes

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Catálogo runtime | [`web/app/api/nisar/search/route.ts`](../../../web/app/api/nisar/search/route.ts) | Consulta CMR, elige frame, obtiene bounds, devuelve pasadas. |
| Proxy de imagen | [`web/app/api/nisar/browse/route.ts`](../../../web/app/api/nisar/browse/route.ts) | Descarga el PNG de ASF con límites y valida la firma. |
| Cliente NISAR | [`web/lib/nisar-remote.ts`](../../../web/lib/nisar-remote.ts) | Colecciones, regex de gránulo, URLs. |
| Comparación | [`web/lib/sar-change.ts`](../../../web/lib/sar-change.ts) | Recorte, cobertura, suavizado, mediana, umbral. |
| Imagen en cliente | [`web/lib/sar-image.ts`](../../../web/lib/sar-image.ts) | Decodifica, cachea y genera data URLs. |
| Manifiesto | [`web/lib/sar.ts`](../../../web/lib/sar.ts) | Zonas, historias, pasadas, área del rectángulo. |
| Precálculo | [`web/scripts/build-nisar.mjs`](../../../web/scripts/build-nisar.mjs) | Genera WebP y manifiesto. |
| UI | [`web/components/SurfaceStudy.tsx`](../../../web/components/SurfaceStudy.tsx) | Selector de fechas, slider, mapa, texto. |

## 4. Contratos

### `/api/nisar/search?lat=…&lon=…`

Respuesta correcta:

```json
{
  "data": {
    "frame": "170_D_083_4005",
    "bounds": [-85.62, 10.08, -85.02, 10.62],
    "passes": [
      { "date": "2026-07-20", "status": "provisional", "collection": "…", "granule": "…" }
    ]
  },
  "meta": { "fallback": false, "fallbackCollections": [] }
}
```

- `data: null` + `meta.reason: "sin-pasadas"` si no hay catálogo.
- `502` si CMR o los KML fallan de forma irrecuperable.
- `meta.fallback` si una colección falló y la otra respondió.
- **No** usa el `ApiMeta` completo de las rutas de alertas.

### `/api/nisar/browse?c=…&g=…`

- Solo acepta las dos colecciones NISAR GCOV y un gránulo que cumpla
  `^NISAR_L2_PR_GCOV_[A-Z0-9_]{1,180}$`.
- Devuelve `image/png` si la firma es válida; `404` si ASF devuelve HTML o un PNG truncado.
- `400` si el producto no es válido; `502` si ASF no responde.
- No es un proxy abierto.

### `data/nisar.json`

```json
{
  "generatedAt": "…",
  "source": { "mission": "…", "product": "…" },
  "method": { "changeThreshold": 38, "ignoreDarkInBoth": 70, "minCoverage": 0.85 },
  "zones": [
    { "id": "palo-verde", "frame": "170_D_083_4005", "baseline": "2026-07-20",
      "acquisitions": [ { "date": "…", "status": "…", "granule": "…", "h5Url": "…" } ] }
  ]
}
```

El manifiesto es **derivado**: no contiene los píxeles, solo rutas y cifras.

## 5. Caché y límites

| Nivel | Qué cachea | TTL / límite | Archivo |
|---|---|---|---|
| Navegador | Imágenes decodificadas | 32 MiB, 4 entradas, timeout 20 s | `sar-image.ts` |
| Next/CDN | PNG de browse | 1 día navegador; 7 días CDN | `browse/route.ts` |
| Next/CDN | Catálogo NISAR | 6 h; `stale-while-revalidate` 1 día | `search/route.ts` |
| Memoria del proceso | Fuentes de alertas | 2–30 min según fuente | `lib/sources/*` |
| Disco | WebP y manifiesto | Versionados; no expiran | `public/nisar`, `data/nisar.json` |

La caché en memoria es por proceso; en serverless no sobrevive a un cold start. `meta.cached`
solo indica hits de esa caché, no del CDN.

## 6. Límites de red y seguridad

| Control | Valor | Archivo |
|---|---|---|
| Timeout de browse/KML | 8 s | `_lib/remote.ts` |
| Timeout de CMR | 6 s | `search/route.ts` |
| Tamaño máximo PNG | 24 MiB | `browse/route.ts` |
| Tamaño máximo KML | 256 KiB | `search/route.ts` |
| Tamaño máximo catálogo | 2 MiB | `search/route.ts` |
| Redirecciones | máximo 2, mismo origen o hosts permitidos | `_lib/remote.ts` |
| Hosts de redirección | `nisar.asf.earthdatacloud.nasa.gov`, `cloudfront.net`, `amazonaws.com` | `_lib/remote.ts` |
| Firma PNG | 8 bytes completos | `browse/route.ts` |
| Gránulo | regex y longitud | `nisar-remote.ts` |

## 7. Modos de falla

| Falla | Respuesta | Qué ve el usuario |
|---|---|---|
| CMR caído | `502` o `data:null` con motivo | “No pudimos consultar el catálogo”. |
| Una colección cae | `200` con la otra + `meta.fallback` | Catálogo parcial, avisado. |
| KML sin esquinas | `502` | “No pudimos consultar…” |
| ASF devuelve HTML | `404` | “La vista previa no está disponible”. |
| PNG demasiado grande | `502` | Error de descarga. |
| Cobertura <50 % en una fecha | `CoverageError` en cliente | “El radar no cubre bien este lugar”. |
| Grillas distintas | Error en cliente | “Las dos imágenes no comparten la misma grilla”. |

## 8. Arquitectura conceptual con Python (propuesta)

Hoy el proyecto **no** procesa HDF5. Si se quisiera pasar de la vista previa a `γ0`:

```text
HDF5 GCOV (Earthdata)
        |
        v
Python: h5py / xarray / rasterio / GDAL
  - leer /science/LSAR/GCOV/grids/frequencyA/HHHH
  - aplicar mask, numberOfLooks, rtcGammaToSigmaFactor
  - recortar AOI, reproyectar, calcular dB
        |
        v
COG / GeoJSON / Parquet (derivado)
        |
        v
Next BFF (/api/...)
        |
        v
MapLibre / React
```

Esta cadena es **propuesta**: requiere Earthdata Login, dependencias Python, almacenamiento y
tiempo de procesamiento. No está implementada y no debe presentarse como existente.

## 9. Lo que no cambia

- No se agrega base de datos ni autenticación.
- No se llama ASF desde el navegador con credenciales.
- No se reemplaza la vista previa por HDF5 sin un cambio de alcance y pruebas.
- No se inventa un score para amenazas que no lo tienen.

## 10. Dónde está el resto

- Fuentes y caché de alertas: [`../../tecnico/fuentes.md`](../../tecnico/fuentes.md)
- Reglas de alerta: [`../../producto/alertas.md`](../../producto/alertas.md)
- Método NISAR vigente: [`../../producto/nisar.md`](../../producto/nisar.md)
- Diseño inicial (parcial): [`../../tecnico/arquitectura.md`](../../tecnico/arquitectura.md)
