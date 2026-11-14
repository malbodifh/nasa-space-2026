# 08 — Problemas de astrofísica y ciencia (enfoque **data-first**)

> **Regla nueva (2026-11-14):** todo problema de este documento debe estar atado a un **dato NASA accesible hoy** por una API o un archivo de investigación. **Si no hay dato, no es un problema para este hackathon**: es una idea para otro evento.
> **Uso:** elegir el problema **después** de mirar el dato, no al revés.

---

## 0. Cómo leer este documento

Hay cuatro tipos de problemas:

| Tipo | Ejemplo | ¿Se puede resolver en 48 h? | ¿Usa nuestras APIs? |
|---|---|---|---|
| **A. Preguntas científicas grandes** | ¿Qué es la materia oscura? | No. Pero se puede hacer una herramienta que ayude a estudiarla. | A veces; muchas no. |
| **B. Dolores operativos** | Los datos están en 10 formatos y 20 archivos distintos | **Sí.** Es el mejor terreno para un hackathon. | **Sí**, con datos de IRSA/SPHEREx. |
| **C. Problemas de comunicación/acceso** | El público no entiende o no puede acceder a los datos | **Sí.** Muy buen terreno para impacto. | **Sí**, con HiPS/cutouts/media. |
| **D. Problemas sin datos disponibles** | “Detectar materia oscura con SPHEREx” | No | **No.** Descartar o reformular. |

**Regla de oro para un challenge custom:** no intentes resolver la pregunta científica; resolvé el **cuello de botella** que impide que los científicos (o el público) la respondan **con los datos que tenemos**.

> **Aviso importante:** las misiones listadas en “Datos/misiones” de la Parte A son **contexto científico**. Para el prototipo solo cuentan las APIs de la tabla 0.1. Si una misión no está ahí, no tenemos sus datos en este hackathon.

---

## 0.1 Inventario: los datos que SÍ tenemos

| API/dataset | Tipo | Qué dato entrega | Endpoint | Estado 2026-11-14 | DRL* | Sirve para |
|---|---|---|---|---|---|---|
| **SPHEREx SIA2** | Ciencia | Metadatos de imágenes: `obs_id`, banda, `t_min`, `access_url`, `cloud_access`, `s_region` | `https://irsa.ipac.caltech.edu/SIA` | ✅ (intermitente) | 5 | Series temporales, búsqueda por posición |
| **SPHEREx Cutout** | Ciencia | FITS recortado: `IMAGE`, `FLAGS`, `VARIANCE`, `ZODI`, `EPSF`, `WCS-WAVE` | `<access_url>?center=RA,Dec&size=0.1` | ✅ | 5 | Píxeles, diferencia, espectros |
| **IRSA TAP** | Ciencia/metadata | Tablas ADQL: `spherex.plane`, `spherex.artifact`; cruces con catálogos IRSA | `https://irsa.ipac.caltech.edu/TAP/sync` | ⚠️ 502 | 5 | Metadata ordenada, cruces |
| **HiPS All-Sky Cube** | Ciencia/visual | 102 capas PNG de 512×512; propiedades y longitudes de onda | `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube` | ✅ | 4 | Slider espectral, contexto |
| **AWS Open Data** | Ciencia | FITS completos (~60 MB c/u) en S3 anónimo | `s3://nasa-irsa-spherex` | ✅ (documentado) | 5 | Descarga masiva, fallback |
| **SPHEREx Data Explorer** | Ciencia/GUI | Búsqueda, visualización y descarga | `https://irsa.ipac.caltech.edu/applications/spherex/` | ✅ | 4 | Validar targets a mano |
| **Spectrophotometry Tool** | Ciencia/GUI | Espectros de SPHEREx | IRSA | ✅ (GUI) | 4 | Referencia de espectros |
| **Mosaic Tool** | Ciencia/GUI | Mosaicos | IRSA | ✅ (GUI) | 3 | No prioritario |
| **Source Discovery Tool** | Ciencia/código | Paquete Python para extraer fuentes y espectros | GitHub/IRSA tutorials | ✅ | 4 | Código para fotometría |
| **MOST** | Ciencia | Búsqueda de objetos del sistema solar en imágenes IRSA | `https://irsa.ipac.caltech.edu/applications/MOST/` | ✅ (GUI) | 4 | Asteroides/cometas |
| **NASA Exoplanet Archive TAP** | Ciencia/catálogo | Catálogo de exoplanetas: `pl_name`, `hostname`, `disc_year`, `sy_dist` | `https://exoplanetarchive.ipac.caltech.edu/TAP/sync` | ✅ | 5 | Contexto/cruces, no imágenes |
| **NASA Image & Video Library** | Media | Imágenes/videos de NASA | `https://images-api.nasa.gov/search?q=...` | ✅ | 2 | Landing/pitch |
| **APOD (WP API)** | Media | Foto astronómica del día | `https://science.nasa.gov/wp-json/wp/v2/apod-basic` | ✅ | 1 | Landing/pitch |
| **api.nasa.gov** | Media/contexto | APOD, NeoWs, EPIC, etc. | `https://api.nasa.gov/` | ⚠️ DEMO_KEY 500 | 1–3 | Solo si sobra tiempo |

\* **DRL = Data Readiness Level:** 5 = ciencia programable y documentada; 4 = ciencia pero GUI/código; 3 = ciencia indirecta/visualización; 2 = media; 1 = solo contexto.

---

## 0.2 Qué problemas se pueden atacar **de verdad** con estos datos

| Problema | Dato que lo habilita | API exacta | Factibilidad 48 h | ¿Recomendado? |
|---|---|---|---|---|
| **Objetos en movimiento / asteroides / cometas** | Series temporales de imágenes | SIA2 + Cutout + MOST | **Alta** | ✅ **Sí** |
| **Estrellas variables / curvas de luz** | Series temporales de cutouts | SIA2 + Cutout | **Alta** | ✅ **Sí** |
| **Espectros / hielos / agua / CO₂** | 102 bandas + `WCS-WAVE` | HiPS + Cutout + Spectrophotometry | Media | ✅ Sí (bonus) |
| **Visualización pública del cielo** | 102 capas + cutouts | HiPS + Cutout | **Alta** | ✅ **Sí** |
| **Ciencia ciudadana / blink** | Cutouts + diferencias | SIA2 + Cutout | **Alta** | ✅ **Sí** |
| **Clustering / galaxias / inflación** | Catálogo espectral y posiciones | SIA2/TAP + AWS | Media-baja | ⚠️ Solo si hay experto |
| **Cruces con catálogos / ficha de objeto** | Metadata + catálogo de exoplanetas | IRSA TAP + Exoplanet TAP | Media | ✅ Sí (custom) |
| **Calidad de datos / flags** | `FLAGS`, `VARIANCE` | Cutout | Media | ✅ Bonus |
| **Materia oscura / energía oscura** | No hay dato directo | — | Baja | ❌ No |
| **Atmósferas de exoplanetas** | No hay espectros de exoplanetas | Exoplanet TAP solo catálogo | Baja | ❌ No |
| **Sol / clima espacial** | No hay datos solares en estas APIs | — | Baja | ❌ No |
| **Superficie de Marte/Luna** | No hay imágenes de superficie | — | Baja | ❌ No |
| **Ondas gravitacionales / CMB** | No hay datos | — | Baja | ❌ No |

---

## 0.3 Qué **NO** se puede hacer con estos datos

- **No** se puede “detectar materia oscura” con SPHEREx.
- **No** se puede caracterizar atmósferas de exoplanetas: el Exoplanet Archive es un catálogo, no espectros.
- **No** se puede analizar la superficie de Marte/Luna: no tenemos MRO, LRO, HiRISE, MOLA.
- **No** se puede hacer clima espacial: no tenemos SDO, SOHO, Parker.
- **No** se puede usar NISAR/SAR: no está en la lista.
- **No** se puede usar Rubin/LSST en vivo: no está en la lista.
- **No** se puede decir “descubrimos un planeta”: no hay datos para eso.

Si el equipo quiere uno de estos, **necesita otra API/dataset** y debe justificarlo. No alcanza con que el tema sea “importante”.

---

## 0.4 Contrato de datos (obligatorio por feature)

Antes de codear cualquier feature, completar:

```text
Feature:
Dataset:
API/endpoint:
Campos que uso:
Acceso (auth/cuota):
Caché:
Fallback si falla:
Qué puedo afirmar:
Qué NO puedo afirmar:
```

Si no se puede completar, la feature no entra al backlog.

---

## 0.5 Regla de oro (actualizada)

> **No elijas el problema y después busques el dato.**
> **Mirá el dato que tenés y elegí el problema que ese dato permite responder.**
>
> Con las APIs de SPHEREx/IRSA, los problemas fuertes son: **movimiento, variabilidad, espectros, visualización y ciencia ciudadana**. Los demás son contexto o requieren datos que no tenemos.

---

# PARTE A — Preguntas científicas grandes

> **Recordatorio data-first:** las misiones de esta sección son **contexto**. Lo que podemos usar está en la tabla 0.1 y en la Parte F. Si una pregunta no aparece en **F1** con ✅ o ⚠️, **no es viable con nuestros datos**.

## A1. ¿Qué es la materia oscura?

- **Qué es:** ~27% del universo. No emite luz, pero su gravedad se ve en curvas de rotación de galaxias, lentes gravitacionales, CMB y estructura a gran escala.
- **Por qué es difícil:** no sabemos qué partícula es. Los candidatos (WIMPs, axiones, neutrinos estériles, agujeros negros primordiales) requieren experimentos muy distintos. La detección directa sigue sin señal concluyente.
- **Datos/misiones:** Fermi, Chandra, Hubble, Rubin/LSST, Euclid, Roman (futuro), experimentos subterráneos (LZ, XENONnT).
- **Oportunidad 48 h:** herramientas de visualización de lentes gravitacionales, simulación de halos, o un “detector de anomalías” en curvas de rotación. Difícil sin datos procesados.
- **Nivel de factibilidad:** baja para ciencia; media para visualización/educación.

## A2. Energía oscura y la tensión de Hubble

- **Qué es:** ~68% del universo es energía oscura. La expansión se acelera. Distintas mediciones de la constante de Hubble (H0) discrepan: CMB ~67 km/s/Mpc vs mediciones locales ~73 km/s/Mpc.
- **Por qué es difícil:** puede ser un error sistemático, nueva física, o ambas. Los datos recientes (DESI, JWST) todavía no cierran el caso.
- **Datos/misiones:** Planck, Hubble, JWST, DESI, Rubin, Euclid, Roman.
- **Oportunidad 48 h:** dashboard que compare mediciones de H0 con sus incertidumbres y muestre la tensión; educativo y visual.
- **Nivel:** baja para resolver; alta para comunicar.

## A3. Amanecer cósmico y reionización

- **Qué es:** ¿cómo y cuándo se formaron las primeras estrellas y galaxias? ¿qué reionizó el universo?
- **Por qué es difícil:** son objetos muy débiles y lejanos; hay que mirar en infrarrojo y radio (21 cm).
- **Datos/misiones:** JWST, SPHEREx, Roman, SKA (futuro), experimentos de 21 cm.
- **Oportunidad 48 h:** explorador visual de galaxias lejanas con datos JWST/SPHEREx; línea de tiempo del universo.
- **Nivel:** baja para ciencia; alta para visualización.

## A4. Formación y evolución de galaxias

- **Qué es:** cómo crecen las galaxias, cómo el agujero negro central y el gas regulan la formación estelar (feedback), cómo se enriquecen químicamente.
- **Por qué es difícil:** escalas de tiempo enormes, física compleja (turbulencia, campos magnéticos, rayos cósmicos), datos multi-longitud de onda.
- **Datos/misiones:** Hubble, JWST, SPHEREx, Euclid, Rubin, ALMA (no NASA), Chandra.
- **Oportunidad 48 h:** herramienta para comparar poblaciones de galaxias en distintos redshifts; mapas de color/masa.
- **Nivel:** baja/Media.

## A5. Exoplanetas y habitabilidad

- **Qué es:** detectar planetas, caracterizar atmósferas, buscar biosignaturas, entender la diversidad de sistemas.
- **Por qué es difícil:** señal diminuta; la atmósfera de un planeta rocoso es ~10⁻⁶ de la luz de la estrella; contaminación estelar; nubes/hazes.
- **Datos/misiones:** Kepler, TESS, JWST, Roman, HWO (futuro), NASA Exoplanet Archive.
- **Oportunidad 48 h:** explorador de atmósferas con espectros JWST; visualizador de habitabilidad; ficha de exoplaneta.
- **Nivel:** media para visualización; baja para ciencia nueva.

## A6. Universo dinámico: transientes y alertas

- **Qué es:** supernovas, GRBs, kilonovas, estrellas variables, asteroides, cometas. El cielo cambia cada noche.
- **Por qué es difícil:** volumen. Rubin generará **~20 TB/noche** y **7–10 millones de alertas/noche**, con latencia de ~60 s. Ningún humano puede revisarlas.
- **Datos/misiones:** Rubin/LSST, ZTF, ATLAS, Pan-STARRS, SPHEREx, Swift, Fermi, IceCube, LIGO/Virgo/KAGRA.
- **Oportunidad 48 h:** **alert triage**, clasificación, priorización, seguimiento, visualización de alertas. **Alta.**
- **Nivel:** alta para un prototipo; es el mejor terreno para un challenge custom.

## A7. Agujeros negros y núcleos activos de galaxias (AGN)

- **Qué es:** cómo crecen los agujeros negros supermasivos, cómo afectan a su galaxia, cómo se fusionan.
- **Por qué es difícil:** escalas de energía extremas, datos en rayos X/radio/IR, variabilidad rápida.
- **Datos/misiones:** Chandra, NuSTAR, Swift, XMM-Newton (ESA), EHT, Rubin, Roman.
- **Oportunidad 48 h:** visor de variabilidad de AGN; clasificador de curvas de luz.
- **Nivel:** media.

## A8. Formación estelar, medio interestelar y hielos

- **Qué es:** cómo nacen las estrellas, qué moléculas hay en las nubes y discos, dónde está el agua.
- **Por qué es difícil:** polvo, hielos, química compleja, muchas líneas espectrales.
- **Datos/misiones:** SPHEREx (102 bandas, hielos), JWST, SOFIA (retirado), ALMA, Herschel (archivo).
- **Oportunidad 48 h:** explorador de espectros de hielos; mapas de agua/CO₂; comparador de espectros.
- **Nivel:** media; muy alineado con SPHEREx.

## A9. Física solar y clima espacial

- **Qué es:** erupciones solares, eyecciones de masa coronal (CMEs), viento solar, tormentas geomagnéticas.
- **Por qué es difícil:** el Sol es un sistema no lineal; predecir erupciones es muy difícil; hay que combinar observaciones y modelos.
- **Datos/misiones:** SDO, SOHO, Parker Solar Probe, Solar Orbiter (ESA), ACE, IMAP, PUNCH.
- **Oportunidad 48 h:** dashboard de clima espacial; predictor simple de flares; visualización de CMEs.
- **Nivel:** media; buen impacto en Earth science/space weather.

## A10. Ciencia planetaria

- **Qué es:** entender la formación y evolución de planetas, lunas, asteroides y cometas; buscar habitabilidad; preparar exploración humana.
- **Por qué es difícil:** datos de muchas misiones, formatos distintos, terrenos extremos, comunicación, radiación.
- **Datos/misiones:** Perseverance, Curiosity, MAVEN, MRO, LRO, Europa Clipper, Dragonfly, Cassini (archivo).
- **Oportunidad 48 h:** mapas multicapa, planificadores de ruta, análisis de sitios de aterrizaje, análogos terrestres.
- **Nivel:** alta para herramientas; los challenges 9, 10 y 11 son exactamente esto.

## A11. Ondas gravitacionales y multi-mensajero

- **Qué es:** detectar fusiones de agujeros negros/estrellas de neutrones y observarlas también en luz, neutrinos y rayos cósmicos.
- **Por qué es difícil:** eventos raros, ventanas cortas, coordinación global, ruido.
- **Datos:** LIGO/Virgo/KAGRA, LISA (futuro), Fermi, Swift, IceCube.
- **Oportunidad 48 h:** visualizador de eventos multi-mensajero; línea de tiempo; mapa de localización.
- **Nivel:** media/baja.

## A12. Cosmología con CMB

- **Qué es:** medir el universo temprano, la inflación, la masa de los neutrinos, la suma de masas de neutrinos.
- **Por qué es difícil:** señales microscópicas, contaminación galáctica, análisis estadísticos complejos.
- **Datos:** Planck, ACT, SPT, CMB-S4, LiteBIRD (futuro).
- **Oportunidad 48 h:** visualización de mapas CMB y espectros de potencia; educativo.
- **Nivel:** baja/media.

---

# PARTE B — Dolores operativos (el mejor terreno para un hackathon)

> **Recordatorio data-first:** estos dolores son válidos **solo si** se pueden atacar con los datos de la tabla 0.1. La columna “Datos/APIs” de cada punto y la matriz **F2** dicen con qué. Si no hay API, se descarta.

> Estos son los problemas que los científicos viven **todos los días**. No son “preguntas del universo”, son **fricciones de trabajo**. Un prototipo de 48 h puede aliviarlos de verdad.

## B1. Volumen y velocidad de los datos

- **Síntoma:** los datos llegan más rápido de lo que se pueden procesar.
- **Números:** Rubin ~20 TB/noche y 7–10 M alertas/noche; SKA y JWST también generan volúmenes enormes; archivos FITS de GB.
- **Por qué duele:** storage, ancho de banda, costos de nube, tiempos de descarga, procesos que tardan horas.
- **Datos/APIs:** Rubin, IRSA, MAST, AWS Open Data, Google Cloud.
- **Idea 48 h:** descargador inteligente con caché, compresión y reanudación; “solo lo que necesito”.
- **Factibilidad:** alta.

## B2. Formatos y protocolos heterogéneos

- **Síntoma:** FITS, VOTable, CSV, Parquet, Zarr, HDF5, ASDF, JSON; cada archivo con sus unidades y convenciones.
- **Por qué duele:** hay que escribir un parser distinto para cada misión; se pierden horas en “¿qué unidad es esto?”.
- **Datos/APIs:** IVOA (SIA2, TAP, SODA, ObsCore), FITS, VOTable.
- **Idea 48 h:** conversor/validador universal con vista previa y unidades; “subí un archivo y te digo qué es”.
- **Factibilidad:** alta; impacto alto; wow medio.

## B3. Acceso, autenticación y cuotas

- **Síntoma:** cada archivo pide una cuenta distinta (Earthdata Login, MAST, IRSA, ESA), tokens, cuotas, permisos.
- **Por qué duele:** fricción enorme para nuevos usuarios y para automatizar.
- **Datos/APIs:** NASA Earthdata, MAST, IRSA, ESA Archives, CDS.
- **Idea 48 h:** “una sola puerta” que detecte el archivo, guíe el login y cachee; o un buscador unificado con enlaces directos.
- **Factibilidad:** media; el login no se puede evitar, pero se puede guiar.

## B4. Cruzar catálogos (cross-matching)

- **Síntoma:** el mismo objeto aparece en 10 catálogos con coordenadas, épocas y resoluciones distintas.
- **Por qué duele:** el matching probabilístico es difícil; proper motion, errores, objetos extendidos.
- **Datos/APIs:** Gaia, WISE, 2MASS, SDSS, SPHEREx, SIMBAD, NED, VizieR.
- **Idea 48 h:** “ficha única de objeto” que resuelve nombre → coordenadas → cruza catálogos → muestra timeline.
- **Factibilidad:** alta; impacto alto; wow alto. **Muy buena idea custom.**

## B5. Triage de alertas y seguimiento

- **Síntoma:** millones de alertas, miles de falsos positivos, telescopios limitados.
- **Por qué duele:** hay que decidir en minutos qué observar; los brokers (ALeRCE, ANTARES, Fink, Lasair) ayudan, pero la coordinación sigue siendo manual.
- **Datos/APIs:** Rubin, ZTF, ALeRCE, Fink, ANTARES, Lasair, TNS.
- **Idea 48 h:** dashboard que ordene alertas por “interesante”, explique por qué y sugiera follow-up.
- **Factibilidad:** media; impacto muy alto; wow alto. **La mejor idea custom si hay alguien de datos.**

## B6. Visualización de datos complejos

- **Síntoma:** cubos 3D, 102 bandas, series temporales, mapas multi-longitud de onda; las herramientas existentes son difíciles.
- **Por qué duele:** los científicos no pueden “ver” patrones; el público no entiende.
- **Datos/APIs:** SPHEREx, JWST, Chandra, Aladin, Firefly, glue.
- **Idea 48 h:** visor web de cubos con slider, diferencia y anotaciones; o sonificación.
- **Factibilidad:** alta; wow alto. **Es lo que hace el challenge SPHEREx.**

## B7. Reproducibilidad y procedencia

- **Síntoma:** “en mi máquina funciona”; notebooks sin entorno; datos que cambian; resultados que no se pueden repetir.
- **Por qué duele:** la ciencia pierde credibilidad y tiempo; los revisores no pueden verificar.
- **Datos/APIs:** Binder, Code Ocean, Zenodo, DVC, RO-Crate, W3C PROV.
- **Idea 48 h:** “receta” de un click que corre un análisis, registra versiones y genera un informe reproducible.
- **Factibilidad:** alta; impacto alto; wow bajo/medio.

## B8. IA/ML: etiquetas, sesgo e interpretabilidad

- **Síntoma:** los modelos clasifican galaxias/transientes, pero no se sabe por qué; hay pocos datos etiquetados; el dominio cambia.
- **Por qué duele:** sin incertidumbre y explicabilidad, los científicos no confían.
- **Datos/APIs:** Galaxy Zoo, Rubin, ZTF, JWST, catálogos etiquetados.
- **Idea 48 h:** clasificador con “explicación” visual (saliency), incertidumbre y revisión humana.
- **Factibilidad:** media; impacto alto; wow medio.

## B9. Software legado y sostenibilidad

- **Síntoma:** código FORTRAN/IDL/IRAF de los 80, dependencias rotas, nadie lo mantiene.
- **Por qué duele:** bloquea análisis y reproducibilidad.
- **Datos/APIs:** IRAF, IDL, Astropy, CASA.
- **Idea 48 h:** “traductor” o wrapper moderno para una tarea común; documentación automática.
- **Factibilidad:** media; impacto medio; poco wow.

## B10. Planificación de observaciones y propuestas

- **Síntoma:** pedir tiempo de telescopio es complejo; hay que justificar ciencia, visibilidad, condiciones, instrumentos.
- **Por qué duele:** mucho tiempo perdido; los novatos no saben por dónde empezar.
- **Datos/APIs:** NASA/ESA observatorios, efemérides, weather, TAC.
- **Idea 48 h:** asistente que, dada una pregunta científica, sugiere archivos/instrumentos y estima factibilidad.
- **Factibilidad:** media; impacto medio; wow medio.

## B11. Metadata, documentación y descubrimiento

- **Síntoma:** el dato existe, pero no se encuentra; la documentación está dispersa; las unidades no están claras.
- **Por qué duele:** se duplican esfuerzos y se usan datos mal.
- **Datos/APIs:** IVOA, NASA ADS, Zenodo, datacenters.
- **Idea 48 h:** buscador semántico sobre documentación de archivos; “preguntá en lenguaje natural qué datos hay para X”.
- **Factibilidad:** alta; impacto alto; wow medio. **Buena idea custom.**

## B12. Ciencia ciudadana

- **Síntoma:** millones de imágenes, pocos voluntarios; onboarding difícil; validación y crédito.
- **Por qué duele:** sin voluntarios, no se escala; sin validación, no se confía.
- **Datos/APIs:** Zooniverse, Backyard Worlds, Galaxy Zoo, Planet Hunters.
- **Idea 48 h:** experiencia guiada de descubrimiento con tutorial, scoring y validación cruzada.
- **Factibilidad:** alta; impacto alto; wow alto.

## B13. Comunicación pública y confianza

- **Síntoma:** la ciencia es compleja; el público desconfía; el acceso es desigual.
- **Por qué duele:** afecta financiamiento, políticas y vocaciones.
- **Datos/APIs:** NASA Images, APOD, EIC, redes.
- **Idea 48 h:** storytelling visual, sonificación, accesibilidad, traducción.
- **Factibilidad:** alta; impacto alto; wow alto.

## B14. Colaboración, crédito y datos compartidos

- **Síntoma:** colaboraciones enormes, authorship complejo, datos con derechos.
- **Por qué duele:** fricción social y legal.
- **Idea 48 h:** herramienta de crédito/procedencia para equipos; poco “wow”.
- **Factibilidad:** media; impacto medio.

## B15. Financiamiento y carrera

- **Síntoma:** pocos fondos, mucha competencia, precariedad.
- **Por qué duele:** afecta qué ciencia se hace.
- **Idea 48 h:** no es un problema de hackathon; evitar.

---

# PARTE C — Otros dominios (Space Apps no es solo astrofísica)

## C1. Earth science

- **Problemas:** armonizar sensores (MODIS/VIIRS), nubes, calibración, datos near-real-time, relevancia local, acceso (Earthdata Login), modelos vs observaciones.
- **Datos/APIs:** FIRMS, Earthdata, GES DISC, Giovanni, SMAP, GRACE-FO, Landsat, Sentinel.
- **Idea 48 h:** calendario de incendios armonizado; detective de tendencias; mapa de resiliencia local.

## C2. Ciencia planetaria

- **Problemas:** fusionar datos de misiones, terreno, radiación, comunicaciones, sitios de aterrizaje, análogos.
- **Datos/APIs:** USGS, PDS, Mars Trek, LRO, MRO, HiRISE, MOLA.
- **Idea 48 h:** mapa multicapa para Marswalk; navegador de sitios lunares; análogos terrestres.

## C3. Heliofísica / clima espacial

- **Problemas:** predecir flares/CMEs, validar modelos, datos dispersos, latencia.
- **Datos/APIs:** SDO, SOHO, Parker, Solar Orbiter, ACE, IMAP, PUNCH, DONKI.
- **Idea 48 h:** dashboard de clima espacial; predictor simple; visualización de CMEs.

## C4. Exploración humana

- **Problemas:** salud, soporte vital, radiación, alimentación, aislamiento, confiabilidad.
- **Datos/APIs:** NASA HRP, literatura, datos análogos.
- **Idea 48 h:** monitoreo de salud; simulador de outpost; planificador de recursos.

## C5. Educación y comunicación

- **Problemas:** STEM abstracto, falta de acceso, desinformación, idioma.
- **Datos/APIs:** NASA Images, APOD, EIC, recursos educativos.
- **Idea 48 h:** juego, museo interactivo, sonificación, storytelling.

---

# PARTE D — Menú de ideas para un “Custom Challenge”

> Si el equipo decide hacer un custom (sabiendo que **no es elegible para Global Judging**), estas son las mejores apuestas. Puntaje: F = factibilidad 48 h, I = impacto, W = wow, D = datos listos. Total /20.

| # | Idea | Qué resuelve | Datos/APIs | F | I | W | D | Total |
|---|---|---|---|---|---|---|---|---|
| 1 | **Ficha única de objeto** | Cruzar catálogos y misiones en una sola vista | SIMBAD/NED, IRSA, MAST, Exoplanet Archive | 4 | 5 | 4 | 5 | **18** |
| 2 | **Triage de alertas** | Priorizar millones de alertas y sugerir follow-up | Rubin/ZTF, ALeRCE/Fink, TNS | 3 | 5 | 4 | 3 | **15** |
| 3 | **Copiloto de archivos NASA** | Lenguaje natural → consulta TAP/SIA → notebook reproducible | IRSA TAP, MAST, Exoplanet Archive | 4 | 5 | 4 | 4 | **17** |
| 4 | **Traductor de formatos** | FITS/VOTable/Parquet/Zarr con validación y unidades | Astropy, IVOA | 5 | 4 | 2 | 5 | **16** |
| 5 | **Timeline multi-misión** | Ver la misma posición a lo largo del tiempo en varias misiones | SPHEREx, WISE, ZTF, Gaia | 4 | 4 | 5 | 4 | **17** |
| 6 | **Onboarding de ciencia ciudadana** | Guiar a voluntarios a descubrir y validar | Zooniverse, Backyard Worlds | 4 | 4 | 4 | 4 | **16** |
| 7 | **Planificador de observaciones** | Dada una pregunta, sugerir archivos/instrumentos/ventanas | Efemérides, archivos | 3 | 4 | 3 | 3 | **13** |
| 8 | **Dashboard de calidad** | Ver flags, calibración y problemas de datos | IRSA/MAST | 4 | 3 | 2 | 4 | **13** |
| 9 | **Asistente de propuestas** | De pregunta científica a propuesta factible | Literatura, archivos | 3 | 4 | 3 | 3 | **13** |
| 10 | **Sonificación accesible** | Convertir luz curvas/cubos en sonido | EIC, NASA data | 4 | 4 | 5 | 4 | **17** |

### Mi recomendación si van por custom
1. **Ficha única de objeto** (18/20): visual, útil, se entiende en 30 s, y se puede conectar con SPHEREx.
2. **Copiloto de archivos NASA** (17/20): muy potente, pero el riesgo de alucinación hay que controlarlo con plantillas.
3. **Timeline multi-misión** (17/20): es casi el challenge SPHEREx con más misiones; muy buen demo.

---

# PARTE E — Cómo elegir y cómo encajarlo en un challenge oficial

## 5.1 Preguntas para filtrar
1. ¿Se puede explicar en una frase?
2. ¿Se puede mostrar en 30 segundos?
3. ¿Los datos están disponibles **hoy**?
4. ¿Un equipo de 5 puede tener algo funcional en 48 h?
5. ¿Qué criterio del jurado mejora? (Impact, Creativity, Validity, Relevance, Presentation)
6. ¿Qué hacemos si la API falla?
7. ¿Esto ya existe? Si existe, ¿qué mejora?

## 5.2 Cómo convertir un custom en un challenge oficial
| Idea custom | Challenge oficial donde encaja |
|---|---|
| Ficha única de objeto | **Planet X and SPHEREx** (ficha + timeline) |
| Triage de alertas | **Planet X and SPHEREx** (candidatos) o **MODIS/VIIRS** (alertas de fuego) |
| Copiloto de archivos | **Be An Earth System Trend Detective** o **SPHEREx** |
| Traductor de formatos | **Earth System Trend Detective** (datos) |
| Timeline multi-misión | **Planet X and SPHEREx** |
| Onboarding ciudadano | **Planet X and SPHEREx** o **Earth Jukebox** |
| Planificador de observaciones | **Lunar Landing Site Navigator** o **Martian Map** |
| Sonificación | **The Earth Information Jukebox** |

**Conclusión:** casi cualquier idea custom se puede **encajar** en un challenge oficial. Así conservás la elegibilidad global y hacés algo diferente.

---

# PARTE F — Matriz problema → dato NASA → API → prototipo

> Esta es la parte que manda. Si un problema no aparece acá con un dato concreto, **no entra al proyecto**.

## F1. Preguntas grandes: ¿tenemos el dato?

| Pregunta | ¿Dato en nuestras APIs? | API/dato disponible | Qué se puede hacer en 48 h | Veredicto |
|---|---|---|---|---|
| **A1. Materia oscura** | ❌ No directo | Solo catálogo/estructura a gran escala de SPHEREx | Visualizador de estructura a gran escala; no mide materia oscura | ❌ No |
| **A2. Energía oscura / H0** | ❌ No | No hay mediciones de H0 en las APIs | Nada honesto | ❌ No |
| **A3. Amanecer cósmico** | ❌ No | SPHEREx no es JWST; no hay datos de alto z en la lista | Nada directo | ❌ No |
| **A4. Formación de galaxias** | ⚠️ Parcial | Catálogo espectral/posiciones SPHEREx (SIA2/TAP/AWS) | Clasificador color/espectro de galaxias; requiere catálogo | ⚠️ Solo con experto |
| **A5. Exoplanetas** | ⚠️ Solo catálogo | NASA Exoplanet Archive TAP (`ps`) | Explorador de exoplanetas; **no** atmósferas | ✅ Solo catálogo/contexto |
| **A6. Transientes / movimiento** | ✅ Sí | SIA2 + Cutout + MOST | Blink, diferencia, candidatos, asteroides/cometas | ✅ **Recomendado** |
| **A7. Agujeros negros / AGN** | ⚠️ Parcial | SPHEREx colores + cruce WISE vía IRSA | Buscador de fuentes rojas/AGN; no rayos X | ⚠️ Bonus |
| **A8. Formación estelar / hielos** | ✅ Sí | 102 bandas + `WCS-WAVE` + Spectrophotometry | Espectros quick-look; mapas de agua/CO₂ | ✅ **Recomendado** |
| **A9. Sol / clima espacial** | ❌ No | No hay SDO/SOHO/Parker en la lista | Nada | ❌ No |
| **A10. Ciencia planetaria** | ⚠️ Parcial | MOST + SPHEREx (asteroides/cometas) | Buscar objetos del sistema solar; **no** superficies | ⚠️ Solo objetos |
| **A11. Ondas gravitacionales** | ❌ No | No hay LIGO/Virgo | Nada | ❌ No |
| **A12. CMB** | ❌ No | No hay Planck/ACT/SPT | Nada | ❌ No |

## F2. Dolores operativos: ¿qué dato los alivia?

| Dolor | Dato/API disponible | Prototipo 48 h | Factibilidad | Veredicto |
|---|---|---|---|---|
| **B1. Volumen de datos** | SIA2 + AWS + Cutout | Descargador inteligente con caché y reanudación | Alta | ✅ |
| **B2. Formatos** | FITS/VOTable/CSV de IRSA | Conversor/validador con vista previa y unidades | Alta | ✅ |
| **B3. Acceso/cuotas** | IRSA y Exoplanet Archive sin auth | Buscador unificado con enlaces directos | Media | ✅ |
| **B4. Cross-matching** | IRSA TAP + Exoplanet TAP + SIMBAD/NED | Ficha única de objeto | Alta | ✅ **Top custom** |
| **B5. Triage de alertas** | SIA2/Cutout (series SPHEREx) + MOST | Ranking de candidatos con explicación | Media | ⚠️ Sin Rubin |
| **B6. Visualización** | HiPS + Cutout | Blink + slider 102 bandas + diferencia | Alta | ✅ **Core** |
| **B7. Reproducibilidad** | SIA2/TAP + manifest | “Receta” que corre y registra versiones | Alta | ✅ |
| **B8. IA/ML** | Cutouts/catálogos SPHEREx | Clasificador con incertidumbre | Media | ⚠️ Faltan etiquetas |
| **B9. Software legado** | No hay dato | Wrapper/documentación | Baja | ❌ |
| **B10. Planificación de observaciones** | No hay datos de scheduling | Nada | Baja | ❌ |
| **B11. Metadata/descubrimiento** | IRSA TAP + Exoplanet TAP | Buscador semántico sobre metadata | Media | ✅ |
| **B12. Ciencia ciudadana** | Cutouts + HiPS | Onboarding guiado + validación | Alta | ✅ **Top** |
| **B13. Comunicación** | NASA Images + APOD + HiPS | Storytelling visual/sonificación | Alta | ✅ |
| **B14. Crédito/colaboración** | No hay dato | Nada | Baja | ❌ |
| **B15. Financiamiento** | No hay dato | Nada | Baja | ❌ |

## F3. Flujo de selección data-first

```text
[1] Mirar el inventario (0.1)
        ↓
[2] Elegir UN dataset que ya funciona
        ↓
[3] Preguntar: ¿qué problema permite responder?
        ↓
[4] Definir el demo de 30 s con ese dato
        ↓
[5] Definir el fallback si la API falla
        ↓
[6] Completar el contrato de datos (0.4)
        ↓
[7] Recién ahí: codear
```

## F4. Custom ideas con dato exacto

| Idea | Dato/API exacta | Qué se muestra | Factibilidad | ¿Vale la pena? |
|---|---|---|---|---|
| **Ficha única de objeto** | IRSA TAP (`spherex.plane/artifact`) + Exoplanet TAP (`ps`) + SIMBAD/NED | Nombre → coordenadas → imágenes → catálogo → timeline | Alta | ✅ **Sí** |
| **Timeline multi-misión** | SIA2 con colecciones IRSA (SPHEREx, WISE, 2MASS) + Cutout | Misma posición en varias misiones | Alta | ✅ **Sí** |
| **Copiloto de archivos** | IRSA TAP + Exoplanet TAP (plantillas de consulta) | Lenguaje natural → query → tabla/notebook | Alta | ✅ Sí |
| **Triage de candidatos SPHEREx** | SIA2 + Cutout + MOST | Ranking de objetos que cambian | Media | ⚠️ Sin Rubin |
| **Sonificación** | HiPS (102 capas) + NASA Images | Datos → sonido | Alta | ✅ Sí |
| **Traductor de formatos** | FITS/VOTable/CSV de IRSA | Subir/pegar URL → vista previa | Alta | ✅ Sí |

## F5. Ejemplo de contrato de datos (para el feature “blink”)

```text
Feature: Blink comparator
Dataset: SPHEREx DR1 Level 2
API/endpoint: SIA2 + Cutout Service
Campos: obs_id, t_min, energy_bandpassname, access_url, IMAGE, FLAGS
Acceso: público, sin auth
Caché: data/cache/<slug>/ + manifest.json
Fallback: CSV de SIA2 + FITS cacheados
Qué puedo afirmar: “mostramos cómo cambia un parche entre épocas”
Qué NO puedo afirmar: “descubrimos un objeto nuevo”
```

## F6. Problemas específicos de los datos SPHEREx (y cómo los atacamos)

| # | Problema del dato | Por qué duele | Dato/API | Solución en el prototipo | Estado |
|---|---|---|---|---|---|
| 1 | **La imagen es espectral, no broadband** | Una fuente aparece dispersada; no es una foto simple | `IMAGE` + `WCS-WAVE` | Mostrar el cutout tal cual + “colapsar” bandas; slider HiPS | ✅ MVP |
| 2 | **Rotación/traslación entre exposiciones** | No se puede restar/blinkear sin alinear | WCS del `IMAGE` + `reproject` | Reproyectar a grilla norte-arriba | ✅ Validado |
| 3 | **ePSF de ~4 MB por cutout** | Descargas lentas y pesadas | `EPSF` | Ignorarlo; cachear; bajar pocas épocas | ✅ Mitigado |
| 4 | **Objetos débiles (WISE 0855)** | No se ven en una exposición | `IMAGE` + stacking | Mediana de N épocas | 🟡 Pendiente |
| 5 | **Movimiento sub-píxel** | Barnard se mueve ~1.3 px en 9 meses | `IMAGE` + centroides | Diferencia + ajuste de centroide + trayectoria | 🟡 Pendiente |
| 6 | **102 bandas difíciles de explorar** | El usuario no sabe qué mirar | HiPS (102 PNG) | Slider espectral + longitud de onda | ✅ Validado |
| 7 | **Metadata/cobertura variable** | No todas las posiciones tienen todas las bandas | SIA2 + TAP | `manifest.json` con detector/fecha/banda | ✅ Validado |
| 8 | **Flags de contaminación** | Rayos cósmicos/satélites arruinan la diferencia | `FLAGS` | Overlay de flags + máscara | 🟡 Pendiente |
| 9 | **Cambian los data releases** | DR1/QR3, versiones y fechas | SIA2 `COLLECTION` + config | Configurar colecciones y cachear por release | ✅ Diseñado |
| 10 | **No hay catálogo de objetos en movimiento** | Hay que detectarlos | MOST + diferencia | Lista de candidatos con score | 🟡 Pendiente |
| 11 | **IRSA a veces falla (502)** | El demo en vivo se rompe | CSV/S3/caché | Precomputar + fallback offline | ✅ Validado |
| 12 | **Resolución de 6″/px** | No se ve movimiento fino | — | Management de expectativas: “medimos”, no “vemos” | ✅ Documentado |

## F7. Del brief del challenge a nuestra arquitectura

| Lo que pide el brief | Problema del dato | Feature | Dato/API |
|---|---|---|---|
| Mostrar imágenes y cambios | Rotación/tiempo | Blink + diferencia | SIA2 + Cutout |
| 102 bandas | Exploración espectral | Slider de capas | HiPS |
| Sumar/restar épocas | Alineación | Modo diferencia | Cutout + `reproject` |
| Elegir FOV | Descarga | Selector 0.05–0.2° | Cutout `size` |
| Overlay Gaia/WISE | Datos externos | Overlay WISE (si la colección IRSA responde) | IRSA SIA2 (verificar) |
| URL con coordenadas | Compartir | `?ra=&dec=` | Frontend |
| Metadata/flags | Calidad | Ficha + overlay | `FLAGS`, SIA2 |
| Espectros on the fly | `WCS-WAVE` | Espectro quick-look | Cutout + WCS-WAVE |
| Actualizarse con nuevos releases | Versiones | Config de colecciones | SIA2/TAP |

---

# PARTE G — Fuentes y lecturas

- **Astro2020 Decadal Survey** — prioridades de la astrofísica 2020s: <https://www.nationalacademies.org/our-work/decadal-survey-on-astronomy-and-astrophysics-2020-astro2020>
- **NASA Astrophysics** — temas y misiones: <https://science.nasa.gov/astrophysics/>
- **Rubin Observatory — Key Numbers** (20 TB/noche, 7–10 M alertas/noche): <https://rubinobservatory.org/for-scientists/rubin-101/key-numbers>
- **Rubin data deluge**: <https://rubinobservatory.org/news/rubin-data-deluge>
- **SPHEREx**: <https://science.nasa.gov/mission/spherex/>
- **SPHEREx Archive at IRSA**: <https://irsa.ipac.caltech.edu/spherex-archive-documentation/>
- **NASA Exoplanet Archive**: <https://exoplanetarchive.ipac.caltech.edu/>
- **IVOA standards** (SIA2, TAP, ObsCore): <https://ivoa.net/>
- **NASA Earthdata**: <https://www.earthdata.nasa.gov/>
- **NASA FIRMS**: <https://firms.modaps.eosdis.nasa.gov/>
- **NASA Space Apps 2026 Challenges**: <https://www.spaceappschallenge.org/2026/challenges/>

> **Nota:** las cifras y estados de misión cambian. Verificar antes de citar en la submission.
