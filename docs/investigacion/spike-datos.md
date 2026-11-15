# Spike de datos: cómo conectar la idea base

> **Estado:** histórico · spike con incendios en Valparaíso; no es la región ni el alcance actual.

> **Fecha:** 14/11/2026, 22:30–23:10 UTC.
> **Objetivo:** probar una rebanada vertical real antes de escribir UI:
> un punto → focos actuales → clima de fuego → memoria histórica → una lectura explicable.
>
> Punto de prueba: **Valparaíso, Chile** (`-33.047, -71.612`, radio 50 km). **No es la región
> demo decidida**; se eligió porque tiene incendios históricos verificables (2017 y 2024) y
> datos actuales en FIRMS. La decisión sigue abierta.

---

## 0. La pregunta del spike

> “¿Qué pasó acá, qué hay ahora y qué tan raro es?”

No “¿cuál es el score?”. El spike busca comprobar que las cuatro piezas se pueden conectar y
que la historia no se confunde con el presente.

---

## 1. Resultado en una tabla

| Pieza | Consulta | Resultado real |
|---|---|---|
| **FIRMS** | Últimos 5 días, bbox `-72.5,-34.2,-70.5,-32.2` | **90 detecciones** en el bbox; **0 dentro de 50 km**; FRP máx. 18,57 MW |
| **FIRMS por sensor** | VIIRS SNPP / NOAA-20 / NOAA-21 / MODIS | 0 / 49 / 31 / 10 detecciones |
| **POWER** | Diario 1981–2026, punto exacto | Último dato válido **2026-11-11** |
| **POWER: lluvia 30 d** | Suma móvil al 11/11 | **17,2 mm**, percentil **93,5** (más seco que 93,5 % de los años) |
| **POWER: sequía** | Días desde ≥ 1 mm | **20 días** |
| **POWER: atmósfera** | Último día | T máx. 19,36 °C; RH 93,27 %; viento 3,02 m/s |
| **GFWED** | GEOS-5, 2026-11-12 | FWI **0,92** (bajo); FFMC 74,1; DMC 9,0; DC 140,3; ISI 1,19; BUI 15,5 |
| **GIBS: 2024-02-03** | MVT MODIS Combined, 1 km | **93 detecciones a ≤ 50 km**; la más cercana a **7,45 km**; FRP máx. **664,79** |
| **GIBS: 2017-01-25** | MVT MODIS Combined, 1 km | **21 detecciones a ≤ 50 km**; la más cercana a **43,6 km**; FRP máx. **703,2** |
| **Worldview** | 2024-02-01 y 2024-02-10 | 200, JPEG 1024×1024 |
| **FIRMS WMS** | GetMap con key | 200, PNG 1024×512 |

**Lectura corta:** hoy no hay fuego cerca, el combustible está seco (percentil 93,5, 20 días sin
lluvia), pero la atmósfera está húmeda (RH 93 %) y el FWI es bajo. La memoria sí es fuerte:
en 2024 hubo 93 detecciones a menos de 50 km, con la más cercana a 7,4 km.

Eso es exactamente el producto: **presente y memoria no dicen lo mismo**, y la app tiene que
explicar por qué.

---

## 2. Qué significa para la idea

La idea base que mejor conecta estos datos no es un dashboard. Es:

> **“Tu casa ya vivió esto.”**
> Una memoria del lugar, con el presente como contraste.

### Rebanada vertical propuesta

1. **Entrada:** dirección o punto en el mapa.
2. **Ahora:** focos de las últimas 24–48 h, distancia, FRP y sensor.
3. **Memoria:** los eventos históricos del lugar (2017, 2024…), con imagen antes/después.
4. **Lectura:** 3 razones y una acción (“hoy no hay fuego cerca; la última vez llegó a 7 km;
   el combustible está seco”).
5. **Salida:** enlace a la alerta oficial y un plan de 3 pasos, no un gauge.

El mapa sigue existiendo, pero como **evidencia**, no como pantalla principal.

---

## 3. Cómo se conecta

```mermaid
flowchart LR
    U[Usuario: punto] --> R[/api/risk]
    R --> F[FIRMS area API]
    R --> P[POWER daily]
    R --> G[GFWED NetCDF]
    R --> H[GIBS MVT histórico]
    R --> W[Worldview Snapshots]
    F --> N[Normalizador]
    P --> N
    G --> N
    H --> N
    W --> N
    N --> D[Motor fire.ts]
    D --> A[RiskAssessment + reasons]
    A --> U
```

### Runtime (por request)

```text
GET /api/events?hazard=fire&bbox=...&days=1..5
  → FIRMS area API; normalizar a FireDetection[]

GET /api/risk?lat&lon&radius
  → FIRMS (proximidad)
  → POWER (viento, humedad, lluvia, suelo; cache 24 h)
  → GFWED (FWI del día; cache 12 h)
  → climatología precomputada (POWER + GIBS)
  → score + reasons + confidence

GET /api/imagery?bbox&date
  → Worldview Snapshots (cache 24 h)
```

### Offline (antes del demo)

- **POWER 1981–presente** para el punto/región: percentiles de lluvia, temperatura, viento y
  humedad del suelo → `web/data/fire-climatology.json`.
- **GIBS 20 años** para la región: un tile/día (o un tile/mes) de
  `MODIS_Combined_Thermal_Anomalies_All` y VIIRS; agregar por celda 0,05° y mes. Guardar
  conteos, no puntos crudos.
- **GFWED:** descargar el NetCDF del día, recortar el punto/región y guardar FWI.
- **Worldview:** no precomputar; cachear las imágenes que se muestran.

---

## 4. Recetas exactas

### FIRMS (datos, no imagen)

```text
https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_NOAA20_NRT/
  -72.5,-34.2,-70.5,-32.2/5/2026-11-09
```

- 1–5 días, bbox `west,south,east,north`.
- CSV con `latitude`, `longitude`, `frp`, `confidence`, `acq_date`, `acq_time`, `satellite`.
- La key va solo en el servidor. **No** en el cliente.

### POWER

```text
https://power.larc.nasa.gov/api/temporal/daily/point?
  parameters=PRECTOTCORR,T2M_MAX,RH2M,WS2M&community=AG&
  longitude=-71.612&latitude=-33.047&start=19810101&end=20261113&format=JSON
```

- `-999` = sin dato.
- Último dato válido: 2026-11-11 (2 días de lag).
- 16.751 días en ~1,1 MB; cachear y precomputar.

### GFWED

```text
https://portal.nccs.nasa.gov/datashare/GlobalFWI/v2.0/fwiCalcs.GEOS-5/
  Default/GEOS-5/2026/FWI.GEOS-5.Daily.Default.20261112.nc
```

- 17,2 MB; variables `GEOS-5_FWI`, `_FFMC`, `_DMC`, `_DC`, `_ISI`, `_BUI`.
- Punto Valparaíso: FWI 0,92; FFMC 74,1; DC 140,3.
- Recortar con `netCDF4`/`xarray`; no descargar en el request.

### GIBS histórico

```text
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/
  MODIS_Combined_Thermal_Anomalies_All/default/{DATE}/1km/{z}/{y}/{x}.mvt
```

- MVT gzip; decodificar con `@mapbox/vector-tile` + `pbf`.
- Usar `LATITUDE`/`LONGITUDE` de las propiedades, no la geometría del tile.
- `z=6` alcanza para 50 km; `1km` llega hasta `z=6`.
- Para VIIRS usar `500m` (llega más profundo).

### Worldview

```text
https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&
  LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326&
  BBOX=-72.5,-34.2,-70.5,-32.2&WIDTH=1024&HEIGHT=1024&
  TIME=2024-02-03&FORMAT=image/jpeg
```

---

## 5. Contratos mínimos

```ts
type FireDetection = {
  id: string;
  lat: number;
  lon: number;
  detectedAt: string;
  sensor: "MODIS" | "VIIRS";
  satellite: string;
  confidence: number; // 0..100
  frp: number;        // MW
  distanceKm?: number;
  source: "FIRMS" | "GIBS";
};

type FireMemory = {
  date: string;
  detectionsWithin50km: number;
  nearestKm: number;
  maxFrp: number;
  source: "GIBS";
};

type FireRisk = {
  level: "info" | "low" | "moderate" | "high" | "extreme";
  score: number;
  reasons: { label: string; value: string; weight: number }[];
  confidence: "low" | "medium" | "high";
  updatedAt: string;
  sources: { name: string; url: string; latency: string }[];
  officialUrl?: string;
};
```

El resto (respuesta `{ data, meta }`, `HazardAdapter`, fallbacks) está en
[`24-arquitectura-app.md`](../tecnico/arquitectura.md).

---

## 6. Orden para pasar al prototipo

1. **Cerrar decisiones:** hazard, región demo y reto oficial. Sin eso no se escribe UI.
2. **Guardar la key:** `FIRMS_MAP_KEY` en `web/.env.local` y en Vercel; nunca en el repo.
3. **Spike reproducible:** un script `web/scripts/spike-fire.ts` que imprima el JSON del punto
   con FIRMS + POWER + GFWED + GIBS. Sirve para validar y para fixtures.
4. **Precomputar memoria:** `web/scripts/build-fire-memory.ts` para la región demo.
5. **Motor `lib/risk/fire.ts`:** pesos visibles, 3 razones, confianza, sin dato → `info`.
6. **Recién ahí UI:** mapa + tarjeta de memoria + plan de acción.

**Corte de alcance:** si no hay tiempo, se elimina el mapa de capas y queda:
dirección → memoria + focos actuales + 3 razones + enlace oficial.

---

## 7. Riesgos detectados en el spike

| Riesgo | Evidencia | Mitigación |
|---|---|---|
| Focos lejanos asustan | 90 detecciones en bbox, 0 a 50 km | Mostrar distancia, no solo el punto |
| Memoria parece predicción | 2024 tuvo 93 detecciones cerca | Decir “pasó”, no “va a pasar”; mostrar fecha |
| Señales contradictorias | Seco (p93,5) pero RH 93 % y FWI 0,92 | Mostrar 3 razones y confianza, no un score solo |
| GIBS MVT no es visual directo | EPSG:4326 | Decodificar server-side y devolver GeoJSON |
| GFWED pesa 17 MB | NetCDF diario | Precomputar/cachear; no request directo |
| WMS filtra la key | Key en el path | Proxear o usar area API + círculos |
| Región no decidida | Valparaíso fue solo prueba | No presentarlo como región final |

---

## 8. Lo que falta decidir

1. **Hazard:** fuego es el más NASA-native y el que el spike validó.
2. **Región demo:** Valparaíso sirve para el guion, pero la decisión es del equipo.
3. **Reto oficial:** #8 si es fuego; #2 si el peso es la tendencia histórica.
4. **Nombre y alcance:** “La casa que recuerda” es una hipótesis de producto, no una decisión.

---

## 9. Reproducir

Los comandos exactos, límites y fallbacks están en
[`25-api-research.md`](apis-verificadas.md). El spike se corrió con:

- FIRMS area API (key del equipo, no versionada).
- POWER daily 1981–2026.
- GFWED GEOS-5 2026-11-12.
- GIBS MVT `2024-02-03` y `2017-01-25`.
- Worldview `2024-02-01` / `2024-02-10`.

No se commiteó ningún dato crudo, NetCDF, imagen ni clave.
