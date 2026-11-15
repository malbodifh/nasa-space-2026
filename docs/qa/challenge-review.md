# Auditoría del reto «Dancing with the SARs»

> **Estado:** auditoría independiente del **2026-11-15** sobre `develop` @ `9256c87`.
> **Solo lectura:** no se modificó código, datos ni configuración. Este archivo es el único
> entregable. No es una evaluación de NASA ni del jurado: es una revisión científica y de
> veracidad de *claims*.
> Contraste: [`../../AGENTS.md`](../../AGENTS.md), [`../estado.md`](../estado.md),
> [`../producto/vision.md`](../producto/vision.md), [`../producto/nisar.md`](../producto/nisar.md),
> [`../producto/limites.md`](../producto/limites.md),
> [`../producto/alertas.md`](../producto/alertas.md),
> [`../tecnico/fuentes.md`](../tecnico/fuentes.md), `web/lib/sar*.ts`,
> `web/data/nisar.json`, `web/scripts/build-nisar.mjs`, `web/components/SurfaceStudy.tsx`,
> `web/components/RadarView.tsx`, `web/components/HomeMap.tsx`, `web/lib/events.ts`.

## 1. Cómo se auditó y qué no se pudo verificar

- **Sin credenciales.** Todas las consultas fueron `GET` públicos a CMR y a ASF. No se descargó
  ningún HDF5 (solo se leyó el manifiesto y la vista previa PNG). No se usaron claves ni se tocó
  el navegador.
- **Dos gránulos elegidos al azar del manifiesto**, uno por pista:
  - `NISAR_L2_PR_GCOV_034_170_D_083_4005_DHDH_A_20261105T000908_20261105T000942_P05036_N_F_J_001`
    (Palo Verde / Rincón / Caño Negro, 2026-11-05, «validado»).
  - `NISAR_L2_PR_GCOV_035_004_A_007_4005_DHDH_A_20261105T110510_20261105T110543_P05036_N_F_J_001`
    (Tortuguero, 2026-11-05, «validado»).
- **Acceso web.** La página oficial del reto y la guía de juzgamiento **no se pudieron abrir
  directamente** desde este entorno (`webfetch` → *Transport error*; `curl` → código `000`).
  Se usó el **contenido indexado de las páginas oficiales** (buscador) y la transcripción del
  video oficial de submission/judging. Se declara como **espejo**, no como lectura directa.
  No se inventan rúbricas ni pesos.
- **No se extrapoló** el tamaño/resolución del PNG a cobertura del sitio: la cobertura del
  manifiesto (98–100 %) es la fracción de píxeles con dato dentro del **rectángulo** de cada
  zona, no el área del humedal ni del bosque.
- **Corte de tiempo:** esta revisión evalúa el commit `9256c87`. Mientras se escribía, el árbol
  de trabajo mostraba cambios sin commit de otros agentes (internacionalización en `web/`); no
  se revisaron ni se tocaron. Si el merge cambia textos, repetir los hallazgos de §4 sobre la
  versión final.

## 2. Qué pide el reto (verificado en fuente oficial indexada)

Título: **Dancing with the SARs** — dificultad *Advanced Intermediate*, materia *Earth Science*.
Objetivo textual: construir una **aplicación interactiva** que use datos de radar de **NISAR**
para **rastrear y visualizar uno o más tipos de cambio de la superficie** en lugares del mundo.
Sugiere explícitamente: series de tiempo, animaciones, *dashboards*, sliders, mapas web;
**elegir un área de estudio**, descargar datos NISAR libres, añadir contexto óptico/GIS,
**hipotetizar los motores físicos** de lo que se ve (o no se ve), y discutir **qué polarizaciones**
resaltan cada cambio. Pide una solución **open-source y fácil de usar**.

Evidencia: `https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/`
(consultada 2026-11-15 vía contenido indexado).

**Lectura:** el proyecto cumple el núcleo del reto (NISAR real, misma pista, HH/HV, slider,
mapa de cambio, hipótesis físicas, cuatro áreas de Costa Rica). Lo que está en riesgo no es la
idea sino la **precisión de las cifras** y el **cumplimiento de formato en inglés**.

## 3. Criterios oficiales de NASA Space Apps 2026 (verificados)

De la *Project Submission Guide* y la *Judging & Awards Guide* (contenido indexado, 2026-11-15):

- Cinco criterios, **escala 1–5** cada uno, en todas las rondas (local, universal, global,
  ejecutiva): **Impact, Creativity, Validity, Relevance, Presentation**.
- **No se publicaron pesos** por criterio. Por eso aquí **no** se calcula una nota NASA ni se
  pondera: cualquier número de esta sección es una **escala propia del auditor**, etiquetada.
- El **demo** (video ≤30 s o ≤7 slides) se considera en la evaluación; un buen demo puede subir
  *Presentation*.
- **Idioma:** la página de submission y **cualquier material enlazado** deben estar en **inglés**.
  La única excepción es el audio del video en otro idioma **con subtítulos en inglés**.
- Referencias: todos los recursos externos (código, texto, imágenes) deben listarse; el uso de IA
  debe declararse; no se puede usar branding/logo de NASA.
- Fechas: nominees globales **3 dic 2026**, finalistas **17 dic 2026**, ganadores **26 ene 2027**.

## 4. Hallazgos

Severidad: **Crítica** (pone en riesgo elegibilidad o veracidad central), **Alta** (claim
científico engañoso), **Media** (precisión/metodología), **Baja** (texto o consistencia).

### H-1 · Crítica · La app y los documentos están en español; la guía exige inglés

La submission y **los materiales enlazados** deben estar en inglés (salvo audio de video con
subtítulos). La app (`web/app`, textos de UI), `docs/` y los nombres de las zonas están en
español, y [`../estado.md`](../estado.md) §3 reconoce que la submission en inglés y el video de
30 s **siguen pendientes** con entrega el **2026-11-15 23:59**.

**Riesgo:** no es un detalle de estilo; es un requisito de elegibilidad para juzgamiento global.
**Propuesta:** o (a) versión EN de la UI y de la página de submission, o (b) declarar la app como
demo y poner todo el contenido evaluable (submission, slides, referencias) en inglés. El video
puede ir en español **solo con subtítulos en inglés**.

### H-2 · Alta · Porcentajes y km² se presentan como «área que cambió» cuando son píxeles de una vista previa de 8 bits

- `web/components/SurfaceStudy.tsx:328` muestra `≈ N km²` con la etiqueta **«Área que cambió»**.
- `web/components/RadarView.tsx:154` calcula `km² = pct/100 × área del rectángulo`.
- `web/components/SurfaceStudy.tsx:64-69` titula `«X % del área se volvió más brillante»`.
- El denominador real del porcentaje es **píxeles válidos con `max(a,b) ≥ 70`**
  (`web/lib/sar-change.ts:121-127`), no el área del rectángulo ni el área del humedal.
- La imagen es un **PNG RGB de 8 bits** con realce de contraste automático, no gamma0 en dB
  (ver §5). Un umbral de **38/255** no tiene significado físico; puede cruzar por cambio de
  *stretch* entre pasadas.

**Por qué importa:** el reto pide *hipotetizar* motores físicos; afirmar «13 % del área» o
«N km² cambiaron» convierte una comparación visual en una medición que el dato no soporta.
Además `km²` **no es daño**: puede ser humedad, siembra, cosecha, agua bajo vegetación o
artefacto de procesamiento.
**Propuesta de texto (mínima, sin tocar código):**
> «≈13 % de los píxeles comparables de esta vista previa mostró un aumento de brillo ≥38/255
> (8 bits, sin calibrar). No es área de daño ni de inundación confirmada.»
Y cambiar la etiqueta a **«Píxeles con cambio aparente (aprox.)»**, no «Área que cambió».
Si se conserva km², añadir «calculado sobre el rectángulo de la zona; no es superficie afectada».

### H-3 · Alta · Se comparan pasadas **provisionales** con **validadas** y la base es provisional

Manifiesto (`web/data/nisar.json`, `generatedAt 2026-11-15T04:06:34Z`):

| Zona | Base | Pasadas | Últimas |
|---|---|---|---|
| Palo Verde | 2026-07-20 **provisional** (P05023) | 10 | 2026-10-24 y 11-05 **validadas** (P05036) |
| Caño Negro | 2026-07-20 **provisional** | 10 | 2026-10-24 y 11-05 **validadas** |
| Rincón | 2026-07-20 **provisional** | 10 | 2026-10-24 y 11-05 **validadas** |
| Tortuguero | 2026-06-26 **provisional** | 11 | 2026-10-24 y 11-05 **validadas** |

33 de las 41 **entradas** del manifiesto son **provisionales** y 8 validadas (un mismo gránulo
aparece repetido en varias zonas). El salto de Palo Verde pasa de
**13,0 %** (2026-09-30, provisional) a **9,2 %** (2026-10-24, validada): parte de esa diferencia
puede ser **cambio de baseline de procesamiento** (P05023 → P05036), no superficie. La app
muestra el estado por pasada (`RadarView.tsx:216-221`), lo cual es correcto, pero **la serie
compara productos de distinta madurez**.
**Propuesta:** declararlo en la ficha («la base y las primeras pasadas son provisionales; las
últimas, validadas: la comparación mezcla versiones de calibración») y evitar presentar la
tendencia como si fuera un solo producto homogéneo.

### H-4 · Media · El documento del método no coincide con el código precalculado

[`../producto/nisar.md`](../producto/nisar.md) §«Cómo se detecta el cambio» dice:
«Se corrige por el **desfase mediano** entre las dos imágenes».
Pero `web/scripts/build-nisar.mjs:310` usa la **media del cuadro completo**:
`base.means.hh - means.hh` (`frameMeans`, líneas 154-166). El **mediano** solo se usa en el
navegador (`web/lib/sar-change.ts:91-101`). Son correcciones distintas y no equivalentes.
**Propuesta:** corregir el documento a «media del cuadro (precalculado) / mediana (navegador)»
o unificar el método. Un jurado técnico que lea ambos encontrará la discrepancia.

### H-5 · Media · La imagen del 26 de junio se conserva como mapa de cambio aunque el texto dice que se descartó

[`../producto/nisar.md`](../producto/nisar.md): «la imagen provisional del 26 de junio trae una
franja de brillo que inventaba cambios», y por eso la base es el 20 de julio. Pero el manifiesto
**sí incluye** `2026-06-26` con `change: "/nisar/palo-verde/change-2026-06-26.webp"` y
`/nisar/cano-negro/...` y `/nisar/rincon...`, calculado **hacia atrás** (base posterior). El
usuario puede seleccionarlo y ver un «cambio» que el propio equipo considera artefacto.
**Propuesta:** excluir esa pasada del selector de cambio (dejarla solo como imagen) o rotularla
«pasada descartada: artefacto conocido».

### H-6 · Baja · Cifras en prosa que no coinciden con el manifiesto

`web/lib/sar.ts:74-75` afirma que Rincón «apenas sube **1,7 %**» el 30 de septiembre. El
manifiesto para esa fecha da **1,6 %** más brillante **+ 0,2 %** más oscuro (**1,8 %** total).
También el texto dice «cerca del **13 %**» para Palo Verde, que sí coincide con 13,0 %.
**Propuesta:** no duplicar números a mano: generarlos desde el manifiesto o redondear con una
frase («alrededor de 2 %»).

### H-7 · Baja · El popup no dice «no oficial»; la leyenda dice «mayor peligro»

[`../producto/alertas.md`](../producto/alertas.md) §4 afirma: «Las áreas son estimaciones
simples, no zonas oficiales, **y así se dice en el popup**». En `HomeMap.tsx:231` el popup solo
dice «(estimadas)», y la leyenda (`HomeMap.tsx:283`) dice «Área roja: **mayor peligro**», sin
«estimada» ni «no oficial».
**Propuesta:** popup y leyenda: «Área roja estimada (no oficial)». Cambio de una línea, alto
impacto en honestidad.

### H-8 · Baja · «9 fuentes en vivo … y NISAR» infla el conteo de alertas

[`../estado.md`](../estado.md) §2 lista 9 fuentes «en vivo» incluyendo NISAR. En el código,
NISAR no es un feed de alertas: `web/lib/events.ts:63` genera `radarDetections` con
`level: "info"` y `categoryLabel: "Detectado por radar"`. Son **detecciones informativas**, no
alertas. Contarlas como fuente de alertas contradice [`../producto/limites.md`](../producto/limites.md)
(«no somos una alerta oficial»).
**Propuesta:** «8 fuentes de alertas + una capa informativa de radar».

### H-9 · Informativo · El número de ciclo no es global entre pistas

En el manifiesto, el 2026-06-26 es **ciclo 23** en la pista `170_D` y **ciclo 24** en `004_A`;
el 2026-11-05 es **34** y **35** respectivamente. La diferencia sistemática de 1 sugiere que el
campo de ciclo del nombre del producto **no debe usarse como identificador global** en textos o
UI. No se encontró un claim incorrecto en la app, pero conviene no exponerlo como «ciclo N de la
misión».

### H-10 · Informativo · No existe `/about`

No hay ruta `app/about` (solo `/` y `/superficie`). Las fuentes están en el pie y en
`docs/tecnico/fuentes.md`. El reto pide una solución **open-source y fácil de usar**, y la
submission exige listar recursos. Una página de fuentes/método/limitaciones ayuda a *Validity*,
*Relevance* y *Presentation*. URLs sugeridas en §7.

### Observación de alcance (no es falla)

Los cuatro AOI y sus fechas son coherentes: Palo Verde (humedal/arrozales), Caño Negro
(llanura inundable), Rincón de la Vieja (volcán) y Tortuguero (control de bosque). Las
comparaciones entre zonas usan la misma base (20-07) en las tres primeras, así que la frase
«el salto se concentra en las tierras bajas» es defendible **como observación**, no como prueba.
El texto de `sar.ts` ya la presenta como hipótesis; mantener ese encuadre.

## 5. Verificaciones que **sí** pasaron (evidencia, 2026-11-15)

| # | Claim | Verificación | Resultado |
|---|---|---|---|
| V-1 | Producto **NISAR L2 GCOV** (banda L), pista/cuadro correctos | CMR `granules.json?short_name=NISAR_L2_GCOV_V1&granule_ur=…` para ambos gránulos | **OK**: título exacto, `C3622241360-ASF`, inicio `2026-11-05T00:09:08Z` y `11:05:10Z` |
| V-2 | Tamaños del manifiesto (5678 y 4266 MB) | `granule_size` de CMR | **OK**: 5677,85 MB y 4265,56 MB (redondeo del manifiesto) |
| V-3 | «Vista previa pública sin cuenta Earthdata» | `GET` al `_LATLON.png` del granule 034 | **OK**: `303` → URL firmada de CloudFront → `200`, PNG de **4.073.507 bytes** |
| V-4 | «Vista previa de 8 bits» | Cabecera IHDR del PNG | **OK**: **1986×1956**, *bit depth* **8**, *color type* **2** (RGB) |
| V-5 | «HH en rojo y azul, HV en verde»; «rojo y azul iguales en todos los píxeles» (`SarExplainer.tsx:78-79`) | Decodificación de los 3,88 Mpx del PNG | **OK**: 2.059.191 píxeles con dato, **R≈B (\|Δ\|≤1) en 100,00 %**, G>0 en 100 %; medias R=151,7, G=139,2 (y 1.825.425 píxeles negros fuera de la franja) |
| V-6 | `frameBounds` derivados del KML | `_LATLON.kml` del granule 034 | **OK**: `LatLonQuad` = `-86.648822,9.350309 -83.542072,9.350309 -83.542072,12.355046 -86.648822,12.355046` = manifiesto |
| V-7 | Estado «provisional» vs «validado» | CMR: colección validada solo devuelve ciclos 33–34 para la pista 170 en jun–nov | **OK** (2026-10-24 y 2026-11-05 validadas; el resto, provisionales) |
| V-8 | «NISAR repite la órbita cada 12 días» | Espaciado de fechas del manifiesto (excepto huecos) | **OK** como ciclo; hay **huecos** (faltan 2026-07-08 y 2026-08-01 en la pista 170) |
| V-9 | Comparar «la misma órbita» | `/api/nisar/search` agrupa por `frame` y elige el cuadro con más fechas | **OK** en diseño: no mezcla ascendente/descendente ni cuadros distintos |
| V-10 | Banda L ≈ 24 cm; GUNW para fase | Conocimiento de misión/ASF docs | **OK** (coherente con `nisar-docs.asf.alaska.edu/gcov/`) |
| V-11 | El proxy solo acepta gránulos válidos | `web/lib/nisar-remote.ts:7` `GRANULE_PATTERN` + colecciones en lista blanca | **OK** (sin SSRF trivial por nombre) |

**Conclusión de V-1…V-11:** los claims *de fuente, producto, resolución, composición de canales,
AOI y estado del producto* son **verificables y correctos**. Los problemas están en la
**interpretación cuantitativa** y en el **empaquetado para la submission**.

## 6. Propuestas priorizadas para el implementador

**P0 — antes de las 23:59 (elegibilidad / veracidad)**
1. Preparar submission y materiales en **inglés**; si el video va en español, **subtítulos EN**.
2. Cambiar «Área que cambió (km²)» por «píxeles con cambio aparente (aprox.)» y añadir la frase
   de que **no es daño confirmado** (H-2).
3. Añadir en la ficha de cada zona: «base y primeras pasadas **provisionales**; últimas
   **validadas**» (H-3).
4. Declarar en la UI que un cambio de brillo **no identifica causa** (hoy solo está en
   `docs/producto/nisar.md` y en `CorrelationCard`, no en `/superficie`).

**P1 — quick wins**
5. Popup y leyenda: «Área roja/amarilla **estimada (no oficial)**» (H-7).
6. Excluir o rotular la pasada 2026-06-26 como artefacto conocido (H-5).
7. Corregir el «desfase mediano» del documento o unificarlo con el código (H-4).
8. Generar de una sola fuente las cifras de `sar.ts` (13 %, 1,7 %) (H-6).

**P2 — si queda tiempo**
9. Crear `/about` con reto, método, fuentes, límites, autoría, licencia y declaración de IA (H-10).
10. Reetiquetar el conteo de fuentes: «8 alertas + radar informativo» (H-8).
11. Ocultar el ciclo en la UI o explicarlo como «ciclo de adquisición del producto» (H-9).

## 7. URLs para una página `/about`

Oficiales (verificadas o citadas por la guía):
- Reto: `https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/`
- Guía de submission: `https://www.spaceappschallenge.org/resources/project-submission-guide/`
- Guía de juzgamiento y premios: `https://www.spaceappschallenge.org/resources/judging-awards-guide/`
- NISAR (NASA): `https://nisar.jpl.nasa.gov/`
- NISAR (ISRO/NASA misión): `https://www.nasa.gov/mission/nisar/`
- Docs del producto GCOV (ASF): `https://nisar-docs.asf.alaska.edu/gcov/`
- ASF DAAC (NISAR): `https://asf.alaska.edu/data-sets/sar-data-sets/nisar/`
- CMR: `https://cmr.earthdata.nasa.gov/search/`
- EONET v3: `https://eonet.gsfc.nasa.gov/docs/v3`
- GDACS: `https://www.gdacs.org/`
- USGS FDSN: `https://earthquake.usgs.gov/fdsnws/event/1/`
- Open-Meteo: `https://open-meteo.com/`
- NASA GIBS: `https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api`
- NASA POWER: `https://power.larc.nasa.gov/`
- Worldview Snapshots: `https://wvs.earthdata.nasa.gov/`
- OVSICORI-UNA: `https://www.ovsicori.una.ac.cr/`
- RSN (UCR-ICE): `https://rsn.ucr.ac.cr/`
- CNE Costa Rica: `https://www.cne.go.cr/`
- OpenStreetMap: `https://www.openstreetmap.org/`
- MapLibre: `https://maplibre.org/`
- Carto Positron: `https://carto.com/basemaps/`

Nota para `/about`: incluir **fecha de generación** del manifiesto
(`2026-11-15T04:06:34Z`) y decir «según NASA/ASF», nunca «descubrimiento». Declarar licencia
del código y el uso de IA (requisito de la guía).

## 8. Evaluación **SIMULADA** (no oficial)

> **Advertencia:** NASA **no publica pesos** por criterio. Lo siguiente es una **escala propia
> del auditor (0–4)** sobre los cinco criterios oficiales, con justificación. **No es una nota de
> NASA, no es una predicción del jurado y no debe citarse como puntaje oficial.**

| Criterio oficial | Escala propia 0–4 | Justificación |
|---|---|---|
| **Impact** | **3** | Problema real (Costa Rica multi-amenaza) y puente alerta→superficie poco común; pero sin canal de difusión real, avisos solo con la pestaña abierta y sin integración con CNE. |
| **Creativity** | **3** | Combinar feed de alertas con «cómo cambió el terreno» es una idea clara y útil; la detección de cambio por umbral sobre *browse* 8 bits es estándar, no novedosa. |
| **Validity** | **2** | Fuentes y AOI verificados; límites declarados. Pero km²/% sobre un PNG sin calibrar, mezcla provisional/validada y cifras en prosa desalineadas debilitan la validez científica. |
| **Relevance** | **4** | Responde el reto de lleno: NISAR GCOV, misma pista, HH/HV, serie temporal, slider, hipótesis físicas y cuatro sitios. |
| **Presentation** | **2** | Buena UI y narrativa visual; en contra: app y docs en español, sin `/about`, sin demo de 30 s/slides y con la submission pendiente a horas del cierre. |

**Lectura cualitativa:** el proyecto es **relevante y honesto en sus límites**, pero la
**validez cuantitativa** y el **cumplimiento de formato** son los cuellos de botella. Con los
cambios P0/P1 subirían *Validity* y *Presentation* sin tocar la ciencia.

## 9. Reproducibilidad (comandos usados, sin credenciales)

```bash
# 1) Existencia y metadatos de dos gránulos del manifiesto
curl -s "https://cmr.earthdata.nasa.gov/search/granules.json?short_name=NISAR_L2_GCOV_V1&granule_ur=NISAR_L2_PR_GCOV_034_170_D_083_4005_DHDH_A_20261105T000908_20261105T000942_P05036_N_F_J_001"
curl -s "https://cmr.earthdata.nasa.gov/search/granules.json?short_name=NISAR_L2_GCOV_V1&granule_ur=NISAR_L2_PR_GCOV_035_004_A_007_4005_DHDH_A_20261105T110510_20261105T110543_P05036_N_F_J_001"

# 2) Vista previa pública (sin login) y KML de esquinas
curl -sL -o pv.png "https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/NISAR_L2_GCOV_V1/<granule>/<granule>_LATLON.png"
curl -sL "https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/NISAR_L2_GCOV_V1/<granule>/<granule>_LATLON.kml"
```

Verificado: HTTP 200 tras redirección firmada; PNG 1986×1956, 8 bits, RGB; KML con
`LatLonQuad` idéntico a `frameBounds`; R≈B (|Δ|≤1) en 100 % de los píxeles con dato.

## 10. Límites de esta auditoría

- No se ejecutó la app ni se probó el deploy; la revisión es de **código, datos y documentos**.
- No se descargó el HDF5, así que **no** se pudo comprobar gamma0 ni la calibración real: por eso
  se afirma que la vista previa **no es** una medición calibrada, no que los valores sean falsos.
- La página oficial no fue accesible directamente; se usó contenido indexado. Si cambia la
  rúbrica o aparecen pesos, esta sección debe rehacerse.
- No se juzgó el diseño visual ni la accesibilidad con usuarios; solo se verificaron textos y
  claims.
