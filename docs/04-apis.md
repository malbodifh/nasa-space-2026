# 04 — APIs: qué hace cada una y cuáles usamos

> **Regla:** no integramos 14 APIs. Usamos las que el demo necesita y dejamos las demás como “bonus” o contexto.
> **Probado el 2026-11-14** desde este entorno. Los estados pueden cambiar; siempre tener fallback.

---

## 1. Tabla de decisión

| # | API | Qué hace | Auth | Estado probado | Prioridad | Uso en el proyecto |
|---|---|---|---|---|---|---|
| 1 | **SPHEREx SIA2** | Busca imágenes por posición, banda y tiempo | No | ✅ 200 (a veces 502) | **P0** | Listar exposiciones que cubren la coordenada |
| 2 | **SPHEREx HiPS Cube** | Pirámide all-sky de 102 capas | No | ✅ 200 | **P1** | Slider de 102 bandas / contexto |
| 3 | **SPHEREx Cutout** | Recorta un FITS remoto | No | ✅ 200 (4 MB, ~8 s) | **P0** | Bajar el parche de cada época |
| 4 | **IRSA TAP** | ADQL sobre tablas de metadatos | No | ⚠️ 502 | **P1** | Lista ordenada por tiempo; fallback de SIA2 |
| 5 | **SPHEREx Data Explorer** | GUI de búsqueda/visualización | No | ✅ (JS) | P2 | Validar targets a mano |
| 6 | **Spectrophotometry Tool** | GUI de espectros | No | ✅ (GUI) | P2 | Referencia de espectros |
| 7 | **Mosaic Tool** | GUI de mosaicos | No | ✅ (GUI) | P3 | No lo usamos |
| 8 | **Source Discovery Tool** | Paquete Python + notebook | No | ✅ | P2 | Código para fuentes/espectros |
| 9 | **MOST** | Busca imágenes de objetos del sistema solar | No | ✅ (GUI) | P2 | Bonus: asteroides/cometas |
| 10 | **AWS Open Data** | Bucket S3 con los FITS | No (anónimo) | ✅ (documentado) | P1 | Fallback / descarga masiva |
| 11 | **NASA Exoplanet Archive TAP** | Catálogo de exoplanetas | No | ✅ 200 | P2 | Contexto “¿hay un exoplaneta acá?” |
| 12 | **NASA Image & Video Library** | Imágenes/videos NASA | No | ✅ 200 | P3 | Landing / media |
| 13 | **APOD (WP API)** | Foto astronómica del día | No | ✅ 200 | P3 | Landing / storytelling |
| 14 | **api.nasa.gov** | Portal general (APOD, NeoWs, EPIC…) | DEMO_KEY | ⚠️ 500 con DEMO_KEY | P3 | Solo si sobra tiempo |

**Conclusión:** el core se construye con **1 + 3 + (2 o 10)**. TAP es opcional. Las APIs 11–14 son contexto, no producto.

---

## 2. Detalle de cada API

### 2.1 SPHEREx SIA2 (P0)
- **Qué es:** protocolo IVOA Simple Image Access v2. Devuelve una tabla de imágenes que satisfacen una posición/banda/tiempo.
- **Endpoint:** `https://irsa.ipac.caltech.edu/SIA`
- **Parámetros clave:**
  - `COLLECTION=spherex_dr1` (o `spherex_qr3`, `_deep`, `_cube`).
  - `POS=circle RA Dec radio` (grados).
  - `RESPONSEFORMAT=CSV` (o `VOTABLE`, `JSON`, `HTML`).
  - `MAXREC` para limitar filas.
- **Columnas útiles:** `obs_id`, `energy_bandpassname`, `em_min`, `em_max`, `t_min`, `t_max`, `access_url`, `cloud_access`, `s_ra`, `s_dec`, `s_pixel_scale`, `s_region`.
- **Ejemplo:**
  ```bash
  curl -sS "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+133.795129+-7.245147+0.1&RESPONSEFORMAT=CSV" -o out.csv
  ```
- **Gotchas:**
  - A veces devuelve 502 por saturación; reintentar con backoff.
  - Radios grandes → respuestas enormes; usar 0.05–0.2°.
  - Puede haber varias filas por `obs_id` (una por detector).
- **Fallback:** TAP; si también falla, cache precomputada.

### 2.2 HiPS All-Sky Cube (P1)
- **Qué es:** mosaico all-sky en 102 capas (una por banda/canal), en tiles PNG de 512×512.
- **URL:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
- **Propiedades:** `hips_order=5`, `hips_pixel_scale=0.0035786` (~12.9″/px), `hips_cube_depth=102`, `hips_tile_format=png`.
- **Tiles:** `.../Norder5/Dir0/Npix445.png` y `.../Norder5/Dir0/Npix445/Npix445_1.png` … `_101.png`.
- **Uso:** descargar las 102 capas del tile del target (~7 MB) y hacer un slider. También se puede cargar en Aladin Lite (soporta HiPS cubes desde v3.6).
- **Gotcha:** es un mosaico estático (no serie temporal). No sirve para el blink; sí para el contexto espectral.
- **Alternativa:** FITS cube de ~320 MB por tile; no recomendado para el demo.

### 2.3 Cutout Service (P0)
- **Qué es:** recorta un FITS remoto con parámetros en la URL.
- **Patrón:** `<access_url>?center=RA,Dec&size=0.1`
- **Devuelve:** MEF con `IMAGE`, `FLAGS`, `VARIANCE`, `ZODI`, `EPSF`, `WCS-WAVE`.
- **Tamaño:** ~4 MB por cutout (el `EPSF` de 8752×451 domina).
- **Tiempo:** ~8 s por cutout.
- **Gotchas:**
  - No soporta HTTP Range (probado): no se puede pedir solo una extensión.
  - No comprime los cutouts de SPHEREx.
  - La orientación sigue al detector, no al norte.
  - El WCS puede ser complicado; probar reproyección temprano.
- **Optimización:** 8 descargas en paralelo, caché en disco, 20–40 épocas por target.

### 2.4 IRSA TAP (P1)
- **Qué es:** Table Access Protocol; consultas ADQL sobre el esquema `spherex`.
- **Endpoint:** `https://irsa.ipac.caltech.edu/TAP/sync`
- **Query útil:**
  ```sql
  SELECT 'https://irsa.ipac.caltech.edu/' || a.uri || '?center=RA,Decd&size=0.1' AS uri,
         p.time_bounds_lower
  FROM spherex.artifact a
  JOIN spherex.plane p ON a.planeid = p.planeid
  WHERE 1 = CONTAINS(POINT('ICRS', RA, Dec), p.poly)
  ORDER BY p.time_bounds_lower
  ```
- **Estado:** 502 intermitente. No es bloqueante si usamos SIA2.
- **Ventaja:** una sola consulta devuelve todas las imágenes ordenadas por tiempo y con URL de cutout.
- **Gotcha:** el `sync` puede tardar; para queries grandes usar `async`.

### 2.5 SPHEREx Data Explorer (P2)
- **Qué es:** GUI web para buscar, visualizar y descargar datos.
- **URL:** `https://irsa.ipac.caltech.edu/applications/spherex/`
- **Uso:** validar manualmente los 5 targets; capturas para el pitch.
- **No es API:** no lo integramos.

### 2.6 Spectrophotometry Tool (P2)
- **Qué es:** herramienta de IRSA para extraer espectros de SPHEREx.
- **Uso:** referencia de cómo debería verse un espectro; comparar con nuestro bonus.
- **No es API:** link externo si acaso.

### 2.7 Mosaic Tool (P3)
- **Qué es:** GUI para mosaicos de SPHEREx.
- **Uso:** ninguno en el MVP.

### 2.8 Source Discovery Tool (P2)
- **Qué es:** paquete Python `spherex_source_discovery_tool` + notebook.
- **Uso:** copiar ideas/código para extracción de fuentes, fotometría de apertura y espectros.
- **URL:** `https://caltech-ipac.github.io/irsa-tutorials/spherex-source-discovery-tool-demo/`
- **Gotcha:** requiere `SExtractor`, `astropy`, `photutils`, `sep`; pesado para 48 h.

### 2.9 MOST (P2)
- **Qué es:** Moving Object Search Tool; calcula órbitas y busca imágenes que cubrían la posición predicha.
- **URL:** `https://irsa.ipac.caltech.edu/applications/MOST/`
- **Uso:** bonus “¿hay un asteroide/cometa conocido en este campo?”.
- **Gotcha:** es una GUI; hay interfaz en `astroquery.ipac.irsa.most`.

### 2.10 AWS Open Data (P1)
- **Qué es:** bucket S3 con los FITS de SPHEREx.
- **Bucket:** `s3://nasa-irsa-spherex` (us-east-1), anónimo.
- **Uso:** fallback si IRSA está lento; descarga masiva.
- **Gotcha:** los archivos completos son ~60 MB; no usar para un solo cutout.

### 2.11 NASA Exoplanet Archive TAP (P2)
- **Qué es:** catálogo de exoplanetas confirmados y candidatos.
- **Endpoint:** `https://exoplanetarchive.ipac.caltech.edu/TAP/sync`
- **Ejemplo:**
  ```bash
  curl "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+top+3+pl_name,hostname,disc_year,sy_dist+from+ps&format=csv"
  ```
- **Uso:** ficha “¿hay un exoplaneta conocido cerca de esta coordenada?” (requiere cruce espacial).
- **Prioridad:** baja; no es central.

### 2.12 NASA Image and Video Library (P3)
- **Qué es:** busca imágenes/videos de NASA.
- **Endpoint:** `https://images-api.nasa.gov/search?q=SPHEREx&media_type=image`
- **Uso:** landing, hero image, créditos.
- **Gotcha:** verificar licencias y créditos.

### 2.13 APOD (P3)
- **Qué es:** Astronomy Picture of the Day.
- **Endpoint:** `https://science.nasa.gov/wp-json/wp/v2/apod-basic`
- **Uso:** landing / storytelling.
- **Gotcha:** no es dato científico para el proyecto; solo contexto.

### 2.14 api.nasa.gov (P3)
- **Qué es:** portal de APIs NASA (APOD, NeoWs, EPIC, etc.).
- **Auth:** `api_key=DEMO_KEY` (limitada) o key gratis.
- **Estado:** `DEMO_KEY` devolvió 500 en la prueba; pedir key propia.
- **Uso:** solo si sobra tiempo.

---

## 3. Qué NO usar en el core

- **APIs 11–14** no son necesarias para el challenge; si las usamos, que sea para la landing o una ficha extra.
- **TAP** no puede ser el único camino: está intermitente.
- **Mosaic Tool / Spectrophotometry Tool** son GUIs, no APIs.
- **MOST** es bonus, no core.

---

## 4. Reglas de uso responsable

1. **No hacer scraping masivo.** Respetar los servicios de IRSA.
2. **Reintentos con backoff** (1 s, 2 s, 4 s) y límite de intentos.
3. **Cachear** todo lo que se descargue; no pedir dos veces lo mismo.
4. **User-Agent identificable** y, si es posible, contacto.
5. **No compartir claves** ni ponerlas en el frontend.
6. **Citar** IRSA/NASA en la UI y en la submission.

---

## 5. Snippets listos para copiar

### SIA2 en Python
```python
import csv, io, requests


def sia2(ra, dec, radius=0.1, collection="spherex_dr1"):
    r = requests.get(
        "https://irsa.ipac.caltech.edu/SIA",
        params={
            "COLLECTION": collection,
            "POS": f"circle {ra} {dec} {radius}",
            "RESPONSEFORMAT": "CSV",
        },
        timeout=60,
    )
    r.raise_for_status()
    return list(csv.DictReader(io.StringIO(r.text)))
```

### Cutout en Python
```python
from astropy.io import fits
import io, requests


def cutout(access_url, ra, dec, size=0.1):
    r = requests.get(f"{access_url}?center={ra},{dec}&size={size}", timeout=120)
    r.raise_for_status()
    return fits.open(io.BytesIO(r.content))
```

### HiPS tile en Python
```python
import requests


def hips_layer(base, norder, ipix, layer):
    d = (ipix // 10000) * 10000
    if layer == 0:
        url = f"{base}/Norder{norder}/Dir{d}/Npix{ipix}.png"
    else:
        url = f"{base}/Norder{norder}/Dir{d}/Npix{ipix}/Npix{ipix}_{layer}.png"
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.content
```

### HEALPix para saber el tile
```python
# pip install astropy-healpix
from astropy_healpix import HEALPix
from astropy.coordinates import SkyCoord
import astropy.units as u

hp = HEALPix(nside=2**5, order="nested", frame="icrs")
ipix = hp.skycoord_to_healpix(SkyCoord(ra, dec, unit="deg"))
```

---

## 6. Estado de la red (nota para el equipo)

Durante la investigación, IRSA mostró **502 intermitentes** en SIA2/TAP, pero los cutouts y el HiPS respondieron bien. Esto es típico de un fin de semana de hackathon con mucha carga. **No es un bloqueo del proyecto**, pero sí una razón para:
- cachear,
- precomputar,
- tener un modo demo offline,
- y no prometer “consulta en vivo para cualquier coordenada” como única experiencia.

Ver [03-spherex-tecnico.md](03-spherex-tecnico.md) para los detalles.
