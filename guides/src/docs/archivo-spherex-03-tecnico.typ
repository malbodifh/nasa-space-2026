// Generado desde backups/ideas/spherex/docs/03-spherex-tecnico.md con pandoc. No editar a mano.

#import "theme.typ": *

= 03 --- SPHEREx: guía técnica para el prototipo
#quote(block: true)[
#strong[Para qué sirve este documento:] que cualquier integrante
entienda qué es SPHEREx, qué datos hay, cómo se acceden y qué podemos
construir en 48 h sin perderse. #strong[Estado:] validado con consultas
reales a IRSA el 2026-11-14.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. SPHEREx en 60 segundos
- #strong[Misión:] NASA SPHEREx (Spectro-Photometer for the History of
  the Universe, Epoch of Reionization and Ices Explorer).
- #strong[Lanzamiento:] marzo 2025.
- #strong[Qué hace:] mapea #strong[todo el cielo cada 6 meses] en
  #strong[102 bandas] de infrarrojo cercano (#strong[0.75--5 µm]).
- #strong[Cuánto:] imágenes de #strong[más de mil millones de objetos].
- #strong[Cómo:] 6 detectores (D1--D6), cada uno con 17 canales
  espectrales → 6 × 17 = #strong[102 bandas].
- #strong[Para qué:] inflación cósmica, historia de la luz galáctica,
  hielos y moléculas (agua, CO₂, CO) en nubes y discos.
- #strong[Dato clave:] cada exposición es una #strong[imagen espectral]
  (no una foto broadband). La longitud de onda varía a través del campo
  por un filtro de longitud de onda variable (LVF). Esto afecta cómo
  visualizamos.

=== Números útiles
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Parámetro], [Valor],),
    table.hline(),
    [Bandas], [102],
    [Rango], [0.75--5.0 µm],
    [Detectors], [6 (D1--D6)],
    [Canales por detector], [17],
    [Tamaño de imagen], [2040 × 2040 px],
    [Escala de píxel], [#strong[6.15 arcsec/px]],
    [Exposición], [\~113.6 s],
    [Cobertura], [todo el cielo / 6 meses],
    [Profundidad], [Wide Survey + Deep Fields],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. El challenge “Planet X and SPHEREx” (resumen del brief)
#strong[Lo que pide:]

- Crear una #strong[herramienta web pública] para mostrar imágenes del
  cielo de SPHEREx.
- El usuario ingresa #strong[RA y Dec] de un parche de cielo.
- La herramienta muestra una #strong[serie de imágenes] de ese parche
  “como un pequeño video”, para detectar objetos que se mueven.
- Probar con: #strong[Barnard\'s Star], #strong[Epsilon Indi B],
  #strong[WISE 0855], #strong[RW Aurigae], #strong[R Draconis].

#strong[Sugerencias del brief (no obligatorias):]

- Diseñar para actualizarse con nuevos data releases.
- Mostrar las 102 bandas de forma creativa; sumar los 6 detectores para
  mejorar SNR.
- Poder #strong[sumar o restar] imágenes de distintas épocas.
- Elegir el #strong[field of view].
- Overlay de Gaia/WISE.
- URL con coordenadas para embeber.
- Mostrar metadata y flags de contaminación.
- Generar #strong[espectros on the fly].

#strong[Nuestra lectura:] el corazón es un #strong[blink comparator] con
diferencia de imágenes y una capa espectral. El resto son
diferenciadores.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Los 5 targets de prueba
#figure(
  align(center)[#table(
    columns: 5,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,),
    table.header([Target], [Tipo], [RA], [Dec], [Por qué importa],),
    table.hline(),
    [#strong[Barnard\'s Star]], [Enana roja, PM
    10.3″/año], [17h57m48.5s], [+04°41′36″], [El mayor proper motion
    conocido; test de movimiento],
    [#strong[Epsilon Indi B]], [Enana marrón
    binaria], [22h03m21.7s], [−56°47′10″], [Sistema múltiple; test de
    contraste/resolución],
    [#strong[WISE 0855]], [Enana marrón Y, PM
    \~8.1″/año], [08h55m10.83s], [−07°14′42.5″], [Objeto frío y débil;
    test de stacking],
    [#strong[RW Aurigae]], [Estrella
    variable], [05h07m49.5s], [+30°24′05″], [Test de variabilidad, no de
    movimiento],
    [#strong[R Draconis]], [Estrella
    variable], [16h32m40.2s], [+66°45′18″], [Test de diferencia/curva de
    luz],
  )]
  , kind: table
  )

#strong[Advertencia científica:] con 6.15″/px, el movimiento de
Barnard\'s Star en un año es #strong[\~1.7 píxeles]\; el de WISE 0855,
#strong[\~1.3 píxeles]. No se ve como un video de una pelota cruzando la
pantalla. Hay que usar #strong[diferencia de imágenes + centroides
sub-píxel]. Los asteroides/cometas sí se mueven mucho más y son el mejor
“wow”.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Capas de acceso a los datos
#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Capa], [Qué es], [Para qué la usamos], [Estado],),
    table.hline(),
    [#strong[SIA2]], [Protocolo IVOA de búsqueda de imágenes por
    posición/banda/tiempo], [Listar exposiciones que cubren una
    coordenada], [#text(fill: green, weight: "bold")[✓] Funciona (intermitente)],
    [#strong[Cutout Service]], [Recorta un FITS remoto con
    `?center=RA,Dec&size=...`], [Bajar solo el parche que nos
    interesa], [#text(fill: green, weight: "bold")[✓] Funciona],
    [#strong[TAP]], [Consultas ADQL a tablas `spherex.plane`,
    `spherex.artifact`], [Listar todas las imágenes ordenadas por
    tiempo; metadata], [#text(fill: orange, weight: "bold")[!] 502 en el momento de la prueba],
    [#strong[HiPS All-Sky Cube]], [Pirámide de imágenes de 102 capas,
    order 5, tiles PNG], [Slider de 102 bandas y contexto], [#text(fill: green, weight: "bold")[✓]
    Funciona],
    [#strong[AWS Open Data]], [Bucket S3 `nasa-irsa-spherex`, acceso
    anónimo], [Descarga masiva / fallback], [#text(fill: green, weight: "bold")[✓] Documentado],
    [#strong[Data Explorer]], [GUI web de IRSA], [Validar visualmente
    targets], [#text(fill: green, weight: "bold")[✓]],
    [#strong[Spectrophotometry Tool]], [GUI de espectros], [Referencia
    de espectros], [#text(fill: green, weight: "bold")[✓]],
    [#strong[Source Discovery Tool]], [Paquete Python +
    notebook], [Código para extraer fuentes y espectros], [#text(fill: green, weight: "bold")[✓]],
    [#strong[MOST]], [Moving Object Search Tool], [Buscar objetos del
    sistema solar], [#text(fill: green, weight: "bold")[✓]],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Recetas verificadas
=== 5.1 SIA2: listar imágenes que cubren una posición
```bash
curl -sS "https://irsa.ipac.caltech.edu/SIA?\
COLLECTION=spherex_dr1&\
POS=circle+133.795129+-7.245147+0.1&\
RESPONSEFORMAT=CSV" -o spherex.csv
```

Colecciones:

- `spherex_dr1` --- Wide Survey DR1.
- `spherex_dr1_deep` --- Deep Survey DR1.
- `spherex_dr1_cube` --- All-Sky Cube DR1.
- `spherex_qr3`, `spherex_qr3_deep` --- QR3.
- QR2 ya no se busca; usar DR1 + QR3.

Columnas útiles del CSV: `obs_id`, `energy_bandpassname` (D1--D6),
`em_min`, `em_max`, `t_min`, `t_max`, `access_url`, `cloud_access`,
`s_ra`, `s_dec`, `s_pixel_scale`, `s_region`.

#strong[Resultado real (WISE 0855, radio 0.1°):]

- 258 filas.
- 129 `obs_id` únicos.
- 6 detectores.
- Rango temporal: MJD 60800.7 → 61174.3 (\~1 año).
- Cada `obs_id` puede tener 1--6 filas (una por detector que cubre la
  posición).

=== 5.2 Cutout: bajar un parche
```bash
curl -sSL "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W19_1B/l2b-v27-2026-197/3/level2_2025W19_1B_0116_1D3_spx_l2b-v27-2026-197.fits?center=133.795129,-7.245147&size=0.1" -o cutout.fits
```

#strong[Lo que devuelve:]

- FITS MEF con 7 HDUs:
  + Primary (sin datos).
  + `IMAGE` --- 2D, `MJy/sr`.
  + `FLAGS` --- bits de contaminación.
  + `VARIANCE`.
  + `ZODI` --- fondo zodiacal.
  + `EPSF` --- modelo de PSF, #strong[8752 × 451 bytes = \~3.95 MB].
  + `WCS-WAVE` --- tabla de longitud de onda.
- Para `size=0.1` el IMAGE es \~58 × 59 px.
- #strong[El ePSF domina el peso.] No lo necesitamos para el blink.
- Ojo: el archivo puede tardar \~8 s y pesar \~4 MB.

#strong[Optimización:] pedir varias épocas en paralelo (8 workers),
cachear, y no pedir más de 30--40 épocas por target.

=== 5.3 TAP: todas las imágenes de una posición ordenadas por tiempo
```sql
SELECT
  'https://irsa.ipac.caltech.edu/' || a.uri || '?center=133.795129,-7.245147d&size=0.1' AS uri,
  p.time_bounds_lower
FROM spherex.artifact a
JOIN spherex.plane p ON a.planeid = p.planeid
WHERE 1 = CONTAINS(POINT('ICRS', 133.795129, -7.245147), p.poly)
ORDER BY p.time_bounds_lower
```

- Endpoint:
  `https://irsa.ipac.caltech.edu/TAP/sync?query=...&format=csv`
- #strong[Estado:] 502 intermitente el 2026-11-14. No depender de TAP
  para el demo; usar SIA2 como plan A.
- Si TAP funciona, es la forma más limpia de obtener la lista ordenada
  por tiempo.

=== 5.4 HiPS cube: slider de 102 bandas sin FITS
- URL:
  `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
- `properties`:
  - `hips_order = 5`
  - `hips_order_min = 0`
  - `hips_tile_width = 512`
  - `hips_cube_depth = 102`
  - `hips_tile_format = png`
  - `hips_pixel_scale = 0.0035786` (\~12.9″/px)
  - `data_cube_crval3_arr` = longitudes de onda de las 102 capas.
- Tiles:
  - `.../Norder5/Dir0/Npix445.png` (capa base)
  - `.../Norder5/Dir0/Npix445/Npix445_1.png` … `_101.png`
  - \~72 KB por PNG.
- #strong[Uso:] descargar las 102 capas del tile que cubre el target
  (\~7 MB) y hacer un slider en el frontend. No hace falta bajar el FITS
  de \~320 MB.
- #strong[Alternativa:] Aladin Lite v3.6+ soporta HiPS cubes; se puede
  cargar la URL y cambiar de capa.

=== 5.5 AWS Open Data
- Bucket: `nasa-irsa-spherex` (us-east-1), acceso anónimo.
- Ejemplo: `s3://nasa-irsa-spherex/dr1/level2/...`
- Útil para descargas masivas o si IRSA está lento.
- En Python: `fits.open("s3://...", fsspec_kwargs={"anon": True})`.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Cómo se ve un cutout (y por qué importa)
- El `IMAGE` es una #strong[imagen espectral]: la fuente no es un punto
  perfecto, está dispersada.
- El `FLAGS` trae bits de contaminación (rayos cósmicos, satélites, no
  funcionales, etc.).
- El `WCS-WAVE` es una tabla de búsqueda que mapea píxel → longitud de
  onda y ancho de banda.
- La orientación del cutout sigue la orientación del detector en esa
  exposición, no el norte.
- Para hacer diferencia de imágenes hay que #strong[reproyectar] a una
  grilla común o #strong[registrar] las imágenes.

=== Tres niveles de visualización
#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Nivel], [Qué mostramos], [Complejidad], [Cuándo],),
    table.hline(),
    [#strong[Nivel 1]], [Cutout tal cual, stretch percentil,
    blink], [Baja], [MVP / demo],
    [#strong[Nivel 2]], [Suma de píxeles (white-light) +
    diferencia], [Media], [Si el nivel 1 se ve raro],
    [#strong[Nivel 3]], [Colapso espectral por bandas + cubo
    3D], [Alta], [Stretch goal],
  )]
  , kind: table
  )

#strong[Recomendación:] empezar por Nivel 1; si el equipo tiene tiempo,
Nivel 2. Nivel 3 solo si sobra tiempo.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Pipeline del MVP (paso a paso)
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

=== Pseudocódigo del backend
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

#quote(block: true)[
#strong[Nota:] el código real debe manejar errores, reintentos, caché y
paralelismo. Esto es solo el esqueleto.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Alineación: el problema difícil
Opciones, de mejor a peor:

+ #strong[Reproject con WCS] (`reproject` + `astropy`): lo correcto,
  pero hay que entender el WCS del cutout.
+ #strong[`astroalign`]: registra por estrellas, maneja rotación y
  traslación. Rápido de implementar; puede fallar en campos vacíos.
+ #strong[Fase de correlación] (`scipy`/OpenCV): traslación solamente;
  no corrige rotación.
+ #strong[No alinear]: aceptable para un primer demo, pero los bordes
  rotan y confunden.

#strong[Recomendación:] intentar `reproject` con el WCS del `IMAGE`\; si
falla, `astroalign`\; si falla, no alinear y avisar en la UI.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 9. Detección de movimiento (bonus)
+ Restar la referencia (mediana) a cada época.
+ Umbral de detección: `|diff| > k * sigma`.
+ Componentes conectadas (scipy.ndimage.label).
+ Centroide de cada componente.
+ Asociar centroides entre épocas (matching por distancia).
+ Ajustar una línea → velocidad angular (″/día).
+ Mostrar candidatos con una etiqueta #strong[“candidato”], no
  “descubrimiento”.

#strong[Para el pitch:] un gráfico de trayectoria de 5--10 épocas es más
convincente que el blink solo, porque muestra el movimiento sub-píxel.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 10. Riesgos técnicos y mitigaciones
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Riesgo], [Impacto], [Mitigación],),
    table.hline(),
    [TAP 502], [Alto], [SIA2 + cache; no depender de TAP],
    [SIA2 502 intermitente], [Alto], [Reintentos con backoff; cachear
    respuestas],
    [Cutouts de 4 MB], [Medio], [Bajar 20--40 épocas; 8 workers; cache],
    [WCS del cutout confuso], [Alto], [Probar `reproject` temprano;
    fallback `astroalign`],
    [Fuente débil (WISE 0855)], [Medio], [Stacking; usar Barnard/RW Aur
    para el wow],
    [Movimiento sub-píxel], [Alto], [Diferencia + centroides +
    trayectoria],
    [Imagen espectral], [Medio], [Mostrar tal cual; explicar en la UI],
    [Deploy lento], [Medio], [Precomputar 5 targets; modo live como
    bonus],
    [IRSA bloquea CORS], [Medio], [Backend propio; no llamar IRSA desde
    el browser],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 11. Lo que NO prometemos
- Detectar planetas nuevos.
- Astrometría publicable.
- Cubo espectral completo en 48 h.
- Cobertura de todo el cielo en vivo.
- Reemplazar el Data Explorer de IRSA.

#strong[Lo que sí prometemos:] una experiencia pública, clara y visual
para explorar cambios en el cielo con datos reales de SPHEREx.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 12. Enlaces internos
- APIs y endpoints
- Arquitectura
- Plan de 48 h
- Problemas de astrofísica
- Fuentes