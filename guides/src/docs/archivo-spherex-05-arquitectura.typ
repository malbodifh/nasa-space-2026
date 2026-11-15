// Generado desde backups/ideas/spherex/docs/05-arquitectura.md con pandoc. No editar a mano.

#import "theme.typ": *

= 05 --- Arquitectura del prototipo
#quote(block: true)[
#strong[Objetivo:] un demo que funcione en 48 h, se vea bien y no
dependa de que IRSA esté disponible en vivo. #strong[Estrategia:]
#strong[precomputar] los 5 targets + #strong[modo live] como bonus.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Stack recomendado
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Capa], [Tecnología], [Por qué],),
    table.hline(),
    [Backend], [#strong[Python 3.12 + FastAPI]], [astropy/numpy para
    FITS; rápido de escribir; async],
    [Procesamiento], [#strong[astropy, numpy, Pillow,
    reproject]], [Estándar de la industria para FITS],
    [Frontend], [#strong[React + Vite + Tailwind]], [Rápido,
    componentes, deploy simple],
    [Gráficos], [#strong[Plotly] o #strong[Chart.js]], [Espectros y
    curvas de luz],
    [Visor de cielo], [#strong[Aladin Lite] (opcional)], [HiPS cube,
    overlays Gaia/WISE],
    [Caché], [#strong[Archivos JSON + PNG en disco]], [Cero base de
    datos; simple y robusto],
    [Deploy], [#strong[Render / Fly.io / Railway] (backend) +
    #strong[Vercel] (frontend)], [Gratis y rápido],
    [Repo], [GitHub], [PRs, issues, Actions],
  )]
  , kind: table
  )

=== Alternativa “todo en uno”
Si el equipo es chico o hay poco tiempo: #strong[FastAPI sirve el
frontend build] (`StaticFiles`) y se deploya un solo servicio. Menos
piezas, menos riesgo.

=== Alternativa “sin frontend”
Streamlit o Gradio: más rápido de armar, pero menos control visual y
peor para un pitch “wow”. #strong[No recomendado] si Samuel/Leo pueden
hacer React.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Diagrama
```text
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Buscar    │  │  Blink     │  │ Diferencia│  │ Espectro│ │
│  │  RA/Dec    │  │  player    │  │  slider   │  │  chart  │ │
│  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  └────┬────┘ │
└────────┼───────────────┼──────────────┼─────────────┼──────┘
         │               │              │             │
         ▼               ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│  /api/targets   /api/frames   /api/diff   /api/spectrum     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Cache layer (data/cache/<target>/)                   │  │
│  │  manifest.json + frame_001.png ... + diff_001.png     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Ingest (offline / precompute)                        │  │
│  │  SIA2 → cutouts → FITS → normalize → PNG → manifest   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  IRSA / NASA                                                │
│  SIA2 · Cutout Service · TAP · HiPS · AWS S3                │
└─────────────────────────────────────────────────────────────┘
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Componentes
=== 3.1 Ingesta (offline, script)
#strong[Entrada:] target (nombre, RA, Dec), FOV, número de épocas.
#strong[Salida:] carpeta `data/cache/<slug>/` con:

- `manifest.json` --- metadata de cada frame.
- `frame_000.png` … --- imágenes normalizadas.
- `diff_000.png` … --- diferencias vs referencia.
- `spectrum.json` --- (bonus) espectro.
- `README.md` --- cómo se generó.

#strong[Pasos:]

+ Resolver nombre → RA/Dec (SIMBAD/Sesame o tabla hardcodeada).
+ SIA2 → filas.
+ Agrupar por `obs_id`, ordenar por `t_min`.
+ Elegir N épocas (p. ej., 24--40) distribuidas en el tiempo.
+ Por cada época, elegir un detector (D2 o D4) o el que tenga más
  cobertura.
+ Descargar cutout (paralelo, 8 workers).
+ Extraer `IMAGE` y `FLAGS`\; ignorar `EPSF`.
+ Normalizar y guardar PNG.
+ Alinear (reproject/astroalign) y guardar diferencias.
+ Escribir `manifest.json`.

=== 3.2 API (FastAPI)
Endpoints mínimos:

#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Método], [Ruta], [Qué hace],),
    table.hline(),
    [`GET`], [`/api/health`], [Healthcheck],
    [`GET`], [`/api/targets`], [Lista de targets precomputados],
    [`GET`], [`/api/targets/{slug}`], [Manifest de un target],
    [`GET`], [`/api/frames/{slug}/{index}.png`], [Frame individual],
    [`GET`], [`/api/diff/{slug}/{index}.png`], [Diferencia],
    [`GET`], [`/api/spectrum/{slug}`], [Espectro (bonus)],
    [`POST`], [`/api/live`], [Consulta live a SIA2 (bonus, con
    timeout)],
  )]
  , kind: table
  )

#strong[Regla:] el frontend #strong[nunca] llama a IRSA directamente.
Siempre pasa por el backend (CORS, caché, errores).

=== 3.3 Frontend (React)
Componentes:

- `<SearchBar>` --- RA/Dec o target; validación.
- `<TargetPresets>` --- los 5 targets del challenge.
- `<BlinkPlayer>` --- canvas con play/pause/velocidad; precarga de
  imágenes.
- `<EpochSlider>` --- navegación por época.
- `<DiffToggle>` --- original / diferencia / ambos.
- `<BandSlider>` --- 102 capas HiPS (si se implementa).
- `<ObjectCard>` --- metadata, flags, fuente.
- `<SpectrumChart>` --- Plotly (bonus).
- `<ShareButton>` --- URL con `?ra=...&dec=...`.

#strong[Estado:] `target`, `epoch`, `mode` (blink/diff), `playing`,
`fov`. #strong[Performance:] precargar los primeros 10 frames; `loading`
skeleton; imágenes de 256×256 o 512×512.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Modelo de datos
=== `manifest.json`
```json
{
  "target": {
    "slug": "wise0855",
    "name": "WISE 0855",
    "ra": 133.795129,
    "dec": -7.245147,
    "fov_deg": 0.1
  },
  "generated_at": "2026-11-14T18:00:00Z",
  "source": "NASA/SPHEREx DR1 via IRSA SIA2 + Cutout Service",
  "frames": [
    {
      "index": 0,
      "obs_id": "2025W19_1B_0116_1",
      "detector": "D3",
      "t_min_mjd": 60800.700028,
      "date_utc": "2025-05-27T16:48:02Z",
      "band_um": [1.63, 2.43],
      "exptime_s": 113.58,
      "png": "frame_000.png",
      "diff_png": "diff_000.png",
      "flags_png": null,
      "quality": 0.92
    }
  ]
}
```

=== `spectrum.json` (bonus)
```json
{
  "target": "wise0855",
  "wavelength_um": [0.75, 0.77, ...],
  "flux_mjy": [0.12, 0.11, ...],
  "flux_err_mjy": [0.01, 0.01, ...]
}
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Estructura de `src/`
```text
src/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI
│   │   ├── config.py          # settings
│   │   ├── routes/
│   │   │   ├── targets.py
│   │   │   ├── frames.py
│   │   │   └── live.py
│   │   ├── ingest/
│   │   │   ├── sia2.py
│   │   │   ├── cutout.py
│   │   │   ├── fits_io.py
│   │   │   ├── normalize.py
│   │   │   └── align.py
│   │   └── models.py
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.js
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
└── scripts/
    ├── precompute.py          # genera data/cache para los 5 targets
    └── make_contact_sheet.py
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Flujo de una consulta
```text
Usuario elige "WISE 0855"
  → frontend GET /api/targets/wise0855
  → backend lee data/cache/wise0855/manifest.json
  → frontend recibe 30 frames
  → precarga frame_000..009
  → play: cambia canvas cada 300 ms
  → toggle diff: carga diff_000..029
  → click en un píxel: muestra RA/Dec, flujo, flags
```

#strong[Modo live (bonus):]

```text
Usuario ingresa RA/Dec nueva
  → POST /api/live {ra, dec, fov}
  → backend consulta SIA2 (timeout 30 s)
  → si hay datos: procesa 8–12 frames y devuelve manifest temporal
  → si falla: mensaje claro + sugiere target precomputado
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Caché y performance
- #strong[Precomputar] los 5 targets el día 1. Es la mejor inversión de
  tiempo.
- #strong[Tamaño objetivo:] \<5 MB por target en PNGs (30 frames × \~100
  KB + diffs).
- #strong[Paralelismo:] 8 workers para cutouts.
- #strong[Reintentos:] 3 con backoff exponencial.
- #strong[Timeout:] 120 s por cutout; 30 s por SIA2.
- #strong[No] descargar el ePSF si se puede evitar (hoy no se puede con
  el cutout service; aceptarlo).
- #strong[No] pedir más de 40 épocas por target.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Deploy
=== Opción A --- dos servicios (recomendada)
- Frontend: Vercel (build de Vite).
- Backend: Render/Fly.io (FastAPI + datos cacheados en el repo o en un
  volumen).
- Variables: `API_URL` en el frontend.

=== Opción B --- un solo servicio
- FastAPI sirve `frontend/dist` con `StaticFiles`.
- Deploy en Render/Fly.io.
- Menos CORS, menos configuración. #strong[Ideal si hay poco tiempo.]

=== Reglas
- Links públicos, sin login.
- Healthcheck `/api/health`.
- Video de respaldo por si falla el internet en la presentación.
- No depender de IRSA en vivo para el pitch.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 9. Testing y QA
- #strong[Backend:] test de `sia2()` con una respuesta mock; test de
  `normalize()` con un array conocido.
- #strong[Frontend:] probar en Chrome y Firefox; mobile no es prioridad.
- #strong[Datos:] validar que los 5 targets tengan al menos 10 frames.
- #strong[Demo:] ensayar con internet apagado (modo cache).
- #strong[Checklist:] #link("10-submission-checklist.md").

#line(length: 100%, stroke: 0.6pt + lineColor)

== 10. Seguridad y ética
- No subir claves.
- No exponer rutas absolutas.
- No usar imágenes con copyright.
- Citar NASA/IRSA.
- Declarar uso de IA.
- No afirmar descubrimientos; decir “candidato”.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 11. Plan de contingencia
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Falla], [Plan B],),
    table.hline(),
    [IRSA no responde], [Usar caché precomputada],
    [Cutout service cambia], [Usar AWS S3 o frames de muestra],
    [El deploy no funciona], [Correr local + video grabado],
    [El frontend se rompe], [Deck de 7 slides con capturas],
    [No hay tiempo para 5 targets], [2 targets bien hechos (WISE 0855 +
    Barnard)],
    [El blink no se ve], [Diferencia + trayectoria de centroides],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 12. Decisiones pendientes
- ☐ ¿React o HTML/JS simple?
- ☐ ¿FastAPI o Node?
- ☐ ¿Aladin Lite o visor propio?
- ☐ ¿Incluimos espectro o lo dejamos como “próximamente”?
- ☐ ¿Deploy en Vercel + Render o todo en FastAPI?