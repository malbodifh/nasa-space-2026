# 03 — SPHEREx: guía técnica para el prototipo

> **Para qué sirve este documento:** que cualquier integrante entienda qué es SPHEREx, qué datos hay, cómo se acceden y qué podemos construir en 48 h sin perderse.
> **Estado:** validado con consultas reales a IRSA el 2026-11-14.

---

## 1. SPHEREx en 60 segundos

- **Misión:** NASA SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer).
- **Lanzamiento:** marzo 2025.
- **Qué hace:** mapea **todo el cielo cada 6 meses** en **102 bandas** de infrarrojo cercano (**0.75–5 µm**).
- **Cuánto:** imágenes de **más de mil millones de objetos**.
- **Cómo:** 6 detectores (D1–D6), cada uno con 17 canales espectrales → 6 × 17 = **102 bandas**.
- **Para qué:** inflación cósmica, historia de la luz galáctica, hielos y moléculas (agua, CO₂, CO) en nubes y discos.
- **Dato clave:** cada exposición es una **imagen espectral** (no una foto broadband). La longitud de onda varía a través del campo por un filtro de longitud de onda variable (LVF). Esto afecta cómo visualizamos.

### Números útiles
| Parámetro | Valor |
|---|---|
| Bandas | 102 |
| Rango | 0.75–5.0 µm |
| Detectors | 6 (D1–D6) |
| Canales por detector | 17 |
| Tamaño de imagen | 2040 × 2040 px |
| Escala de píxel | **6.15 arcsec/px** |
| Exposición | ~113.6 s |
| Cobertura | todo el cielo / 6 meses |
| Profundidad | Wide Survey + Deep Fields |

---

## 2. El challenge “Planet X and SPHEREx” (resumen del brief)

**Lo que pide:**
- Crear una **herramienta web pública** para mostrar imágenes del cielo de SPHEREx.
- El usuario ingresa **RA y Dec** de un parche de cielo.
- La herramienta muestra una **serie de imágenes** de ese parche “como un pequeño video”, para detectar objetos que se mueven.
- Probar con: **Barnard's Star**, **Epsilon Indi B**, **WISE 0855**, **RW Aurigae**, **R Draconis**.

**Sugerencias del brief (no obligatorias):**
- Diseñar para actualizarse con nuevos data releases.
- Mostrar las 102 bandas de forma creativa; sumar los 6 detectores para mejorar SNR.
- Poder **sumar o restar** imágenes de distintas épocas.
- Elegir el **field of view**.
- Overlay de Gaia/WISE.
- URL con coordenadas para embeber.
- Mostrar metadata y flags de contaminación.
- Generar **espectros on the fly**.

**Nuestra lectura:** el corazón es un **blink comparator** con diferencia de imágenes y una capa espectral. El resto son diferenciadores.

---

## 3. Los 5 targets de prueba

| Target | Tipo | RA | Dec | Por qué importa |
|---|---|---|---|---|
| **Barnard's Star** | Enana roja, PM 10.3″/año | 17h57m48.5s | +04°41′36″ | El mayor proper motion conocido; test de movimiento |
| **Epsilon Indi B** | Enana marrón binaria | 22h03m21.7s | −56°47′10″ | Sistema múltiple; test de contraste/resolución |
| **WISE 0855** | Enana marrón Y, PM ~8.1″/año | 08h55m10.83s | −07°14′42.5″ | Objeto frío y débil; test de stacking |
| **RW Aurigae** | Estrella variable | 05h07m49.5s | +30°24′05″ | Test de variabilidad, no de movimiento |
| **R Draconis** | Estrella variable | 16h32m40.2s | +66°45′18″ | Test de diferencia/curva de luz |

**Advertencia científica:** con 6.15″/px, el movimiento de Barnard's Star en un año es **~1.7 píxeles**; el de WISE 0855, **~1.3 píxeles**. No se ve como un video de una pelota cruzando la pantalla. Hay que usar **diferencia de imágenes + centroides sub-píxel**. Los asteroides/cometas sí se mueven mucho más y son el mejor “wow”.

---

## 4. Capas de acceso a los datos

| Capa | Qué es | Para qué la usamos | Estado |
|---|---|---|---|
| **SIA2** | Protocolo IVOA de búsqueda de imágenes por posición/banda/tiempo | Listar exposiciones que cubren una coordenada | ✅ Funciona (intermitente) |
| **Cutout Service** | Recorta un FITS remoto con `?center=RA,Dec&size=...` | Bajar solo el parche que nos interesa | ✅ Funciona |
| **TAP** | Consultas ADQL a tablas `spherex.plane`, `spherex.artifact` | Listar todas las imágenes ordenadas por tiempo; metadata | ⚠️ 502 en el momento de la prueba |
| **HiPS All-Sky Cube** | Pirámide de imágenes de 102 capas, order 5, tiles PNG | Slider de 102 bandas y contexto | ✅ Funciona |
| **AWS Open Data** | Bucket S3 `nasa-irsa-spherex`, acceso anónimo | Descarga masiva / fallback | ✅ Documentado |
| **Data Explorer** | GUI web de IRSA | Validar visualmente targets | ✅ |
| **Spectrophotometry Tool** | GUI de espectros | Referencia de espectros | ✅ |
| **Source Discovery Tool** | Paquete Python + notebook | Código para extraer fuentes y espectros | ✅ |
| **MOST** | Moving Object Search Tool | Buscar objetos del sistema solar | ✅ |

---

## 5. Recetas verificadas

### 5.1 SIA2: listar imágenes que cubren una posición

```bash
curl -sS "https://irsa.ipac.caltech.edu/SIA?\
COLLECTION=spherex_dr1&\
POS=circle+133.795129+-7.245147+0.1&\
RESPONSEFORMAT=CSV" -o spherex.csv
```

Colecciones:
- `spherex_dr1` — Wide Survey DR1.
- `spherex_dr1_deep` — Deep Survey DR1.
- `spherex_dr1_cube` — All-Sky Cube DR1.
- `spherex_qr3`, `spherex_qr3_deep` — QR3.
- QR2 ya no se busca; usar DR1 + QR3.

Columnas útiles del CSV:
`obs_id`, `energy_bandpassname` (D1–D6), `em_min`, `em_max`, `t_min`, `t_max`, `access_url`, `cloud_access`, `s_ra`, `s_dec`, `s_pixel_scale`, `s_region`.

**Resultado real (WISE 0855, radio 0.1°):**
- 258 filas.
- 129 `obs_id` únicos.
- 6 detectores.
- Rango temporal: MJD 60800.7 → 61174.3 (~1 año).
- Cada `obs_id` puede tener 1–6 filas (una por detector que cubre la posición).

### 5.2 Cutout: bajar un parche

```bash
curl -sSL "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W19_1B/l2b-v27-2026-197/3/level2_2025W19_1B_0116_1D3_spx_l2b-v27-2026-197.fits?center=133.795129,-7.245147&size=0.1" -o cutout.fits
```

**Lo que devuelve:**
- FITS MEF con 7 HDUs:
  1. Primary (sin datos).
  2. `IMAGE` — 2D, `MJy/sr`.
  3. `FLAGS` — bits de contaminación.
  4. `VARIANCE`.
  5. `ZODI` — fondo zodiacal.
  6. `EPSF` — modelo de PSF, **8752 × 451 bytes = ~3.95 MB**.
  7. `WCS-WAVE` — tabla de longitud de onda.
- Para `size=0.1` el IMAGE es ~58 × 59 px.
- **El ePSF domina el peso.** No lo necesitamos para el blink.
- Ojo: el archivo puede tardar ~8 s y pesar ~4 MB.

**Optimización:** pedir varias épocas en paralelo (8 workers), cachear, y no pedir más de 30–40 épocas por target.

### 5.3 TAP: todas las imágenes de una posición ordenadas por tiempo

```sql
SELECT
  'https://irsa.ipac.caltech.edu/' || a.uri || '?center=133.795129,-7.245147d&size=0.1' AS uri,
  p.time_bounds_lower
FROM spherex.artifact a
JOIN spherex.plane p ON a.planeid = p.planeid
WHERE 1 = CONTAINS(POINT('ICRS', 133.795129, -7.245147), p.poly)
ORDER BY p.time_bounds_lower
```

- Endpoint: `https://irsa.ipac.caltech.edu/TAP/sync?query=...&format=csv`
- **Estado:** 502 intermitente el 2026-11-14. No depender de TAP para el demo; usar SIA2 como plan A.
- Si TAP funciona, es la forma más limpia de obtener la lista ordenada por tiempo.

### 5.4 HiPS cube: slider de 102 bandas sin FITS

- URL: `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
- `properties`:
  - `hips_order = 5`
  - `hips_order_min = 0`
  - `hips_tile_width = 512`
  - `hips_cube_depth = 102`
  - `hips_tile_format = png`
  - `hips_pixel_scale = 0.0035786` (~12.9″/px)
  - `data_cube_crval3_arr` = longitudes de onda de las 102 capas.
- Tiles:
  - `.../Norder5/Dir0/Npix445.png` (capa base)
  - `.../Norder5/Dir0/Npix445/Npix445_1.png` … `_101.png`
  - ~72 KB por PNG.
- **Uso:** descargar las 102 capas del tile que cubre el target (~7 MB) y hacer un slider en el frontend. No hace falta bajar el FITS de ~320 MB.
- **Alternativa:** Aladin Lite v3.6+ soporta HiPS cubes; se puede cargar la URL y cambiar de capa.

### 5.5 AWS Open Data

- Bucket: `nasa-irsa-spherex` (us-east-1), acceso anónimo.
- Ejemplo: `s3://nasa-irsa-spherex/dr1/level2/...`
- Útil para descargas masivas o si IRSA está lento.
- En Python: `fits.open("s3://...", fsspec_kwargs={"anon": True})`.

---

## 6. Cómo se ve un cutout (y por qué importa)

- El `IMAGE` es una **imagen espectral**: la fuente no es un punto perfecto, está dispersada.
- El `FLAGS` trae bits de contaminación (rayos cósmicos, satélites, no funcionales, etc.).
- El `WCS-WAVE` es una tabla de búsqueda que mapea píxel → longitud de onda y ancho de banda.
- La orientación del cutout sigue la orientación del detector en esa exposición, no el norte.
- Para hacer diferencia de imágenes hay que **reproyectar** a una grilla común o **registrar** las imágenes.

### Tres niveles de visualización

| Nivel | Qué mostramos | Complejidad | Cuándo |
|---|---|---|---|
| **Nivel 1** | Cutout tal cual, stretch percentil, blink | Baja | MVP / demo |
| **Nivel 2** | Suma de píxeles (white-light) + diferencia | Media | Si el nivel 1 se ve raro |
| **Nivel 3** | Colapso espectral por bandas + cubo 3D | Alta | Stretch goal |

**Recomendación:** empezar por Nivel 1; si el equipo tiene tiempo, Nivel 2. Nivel 3 solo si sobra tiempo.

---

## 7. Pipeline del MVP (paso a paso)

```text
[1] Usuario ingresa RA/Dec o target
        ↓
[2] SIA2: buscar exposiciones que cubren la posición
        ↓
[3] Agrupar por obs_id, ordenar por t_min, elegir N épocas
        ↓
[4] Para cada época: cutout (center fijo, size=FOV)
        ↓
[5] Extraer IMAGE + FLAGS (ignorar EPSF)
        ↓
[6] Normalizar: sigma-clip + stretch percentil + downsample
        ↓
[7] Alinear: WCS reproject o registro por correlación
        ↓
[8] Referencia = mediana de todas las épocas
        ↓
[9] Diferencia = época − referencia
        ↓
[10] Detectar candidatos: umbral + componentes conexas + centroide
        ↓
[11] Servir JSON + PNGs cacheados
        ↓
[12] Frontend: blink, slider, diferencia, ficha, espectro
```

### Pseudocódigo del backend

```python
import io, json, requests
import numpy as np
from astropy.io import fits
from PIL import Image

SIA = "https://irsa.ipac.caltech.edu/SIA"


def query_sia(ra, dec, radius_deg=0.1):
    params = {
        "COLLECTION": "spherex_dr1",
        "POS": f"circle {ra} {dec} {radius_deg}",
        "RESPONSEFORMAT": "CSV",
    }
    r = requests.get(SIA, params=params, timeout=60)
    r.raise_for_status()
    return r.text  # parsear con csv.DictReader


def fetch_cutout(access_url, ra, dec, size_deg=0.1):
    url = f"{access_url}?center={ra},{dec}&size={size_deg}"
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    hdul = fits.open(io.BytesIO(r.content))
    image = hdul["IMAGE"].data.astype("float32")
    flags = hdul["FLAGS"].data
    return image, flags, hdul["IMAGE"].header


def to_png(image, path, lo=5, hi=99.5):
    finite = image[np.isfinite(image)]
    vmin, vmax = np.percentile(finite, [lo, hi])
    norm = np.clip((image - vmin) / (vmax - vmin + 1e-9), 0, 1)
    Image.fromarray((norm * 255).astype("uint8")).save(path)
```

> **Nota:** el código real debe manejar errores, reintentos, caché y paralelismo. Esto es solo el esqueleto.

---

## 8. Alineación: el problema difícil

Opciones, de mejor a peor:

1. **Reproject con WCS** (`reproject` + `astropy`): lo correcto, pero hay que entender el WCS del cutout.
2. **`astroalign`**: registra por estrellas, maneja rotación y traslación. Rápido de implementar; puede fallar en campos vacíos.
3. **Fase de correlación** (`scipy`/OpenCV): traslación solamente; no corrige rotación.
4. **No alinear**: aceptable para un primer demo, pero los bordes rotan y confunden.

**Recomendación:** intentar `reproject` con el WCS del `IMAGE`; si falla, `astroalign`; si falla, no alinear y avisar en la UI.

---

## 9. Detección de movimiento (bonus)

1. Restar la referencia (mediana) a cada época.
2. Umbral de detección: `|diff| > k * sigma`.
3. Componentes conectadas (scipy.ndimage.label).
4. Centroide de cada componente.
5. Asociar centroides entre épocas (matching por distancia).
6. Ajustar una línea → velocidad angular (″/día).
7. Mostrar candidatos con una etiqueta **“candidato”**, no “descubrimiento”.

**Para el pitch:** un gráfico de trayectoria de 5–10 épocas es más convincente que el blink solo, porque muestra el movimiento sub-píxel.

---

## 10. Riesgos técnicos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| TAP 502 | Alto | SIA2 + cache; no depender de TAP |
| SIA2 502 intermitente | Alto | Reintentos con backoff; cachear respuestas |
| Cutouts de 4 MB | Medio | Bajar 20–40 épocas; 8 workers; cache |
| WCS del cutout confuso | Alto | Probar `reproject` temprano; fallback `astroalign` |
| Fuente débil (WISE 0855) | Medio | Stacking; usar Barnard/RW Aur para el wow |
| Movimiento sub-píxel | Alto | Diferencia + centroides + trayectoria |
| Imagen espectral | Medio | Mostrar tal cual; explicar en la UI |
| Deploy lento | Medio | Precomputar 5 targets; modo live como bonus |
| IRSA bloquea CORS | Medio | Backend propio; no llamar IRSA desde el browser |

---

## 11. Lo que NO prometemos

- Detectar planetas nuevos.
- Astrometría publicable.
- Cubo espectral completo en 48 h.
- Cobertura de todo el cielo en vivo.
- Reemplazar el Data Explorer de IRSA.

**Lo que sí prometemos:** una experiencia pública, clara y visual para explorar cambios en el cielo con datos reales de SPHEREx.

---

## 12. Enlaces internos

- [APIs y endpoints](04-apis.md)
- [Arquitectura](05-arquitectura.md)
- [Plan de 48 h](06-plan-48h.md)
- [Problemas de astrofísica](08-problemas-astrofisica.md)
- [Fuentes](11-fuentes.md)
