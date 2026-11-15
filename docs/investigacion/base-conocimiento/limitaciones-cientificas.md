# Limitaciones científicas

> **Regla de oro:** un dato existe, pero eso no significa que diga lo que queremos que diga.
> Este documento separa **tener un archivo** de **poder concluir algo**.

## 1. Escalera de evidencia

| Nivel | Qué significa | Qué prueba | Estado en el proyecto |
|---|---|---|---|
| **1. Catálogo encontrado** | CMR/ASF lista un gránulo. | Que existe un registro. | **Sí**: `/api/nisar/search` y manifiesto. |
| **2. Previsualización accesible** | El PNG/KML de browse se descarga. | Que hay una representación visual. | **Sí**: 4 zonas y estudio puntual. |
| **3. Archivo científico descargado** | El HDF5 está en poder del equipo. | Que se posee el producto original. | **No**: el pipeline solo baja PNG/KML; los `h5Url` están declarados, no descargados. |
| **4. Archivo procesado** | Se abrió el HDF5 y se calcularon variables. | Que se trabajó con γ0/fase reales. | **No**. |
| **5. Cambio validado** | Hay evidencia independiente de la causa. | Que la interpretación se sostiene. | **No**: no hay campo, ni peritaje, ni validación externa. |

**Conclusión:** el proyecto está en el nivel 2. La app debe hablar de “vista previa” y
“diferencia aparente”, no de “daño confirmado”.

## 2. Diez trampas frecuentes

| Trampa | Por qué es falsa | Qué decir en su lugar |
|---|---|---|
| **“La revisita es de 6 días, entonces hay imagen cada 6 días.”** | La revisita es un promedio; la adquisición depende del plan y del cuadro. | “Puede haber una pasada; se consulta el catálogo.” |
| **“Las imágenes de la misma órbita están perfectamente alineadas.”** | Hay errores de órbita, DEM y geocodificación. | “Se comparan pasadas de la misma órbita; la alineación es aproximada.” |
| **“Coherencia baja = daño.”** | La coherencia baja por vegetación, agua, nieve, cambio natural o ruido. | “Coherencia baja; no se puede interpretar como deformación.” |
| **“Retrodispersión baja = agua.”** | Sombra, arena lisa, ángulo rasante y suelo seco también oscurecen. | “Compatible con agua; no confirmado.” |
| **“HV alto = bosque.”** | HV indica dispersión volumétrica; también la produce vegetación baja densa. | “Compatible con vegetación; requiere contexto.” |
| **“GUNW da desplazamiento vertical.”** | GUNW da línea de vista (LOS). | “Desplazamiento LOS; la vertical requiere supuestos.” |
| **“Un foco FIRMS es un incendio.”** | Es una anomalía térmica; puede ser industria, volcán o quema. | “Foco de calor detectado; no es perímetro.” |
| **“Lluvia intensa = inundación.”** | Depende del suelo, la cuenca y el drenaje. | “Lluvia pronosticada; no confirma inundación.” |
| **“Una anomalía demuestra una causa.”** | La anomalía es estadística; la causa es una hipótesis. | “Anomalía compatible con X; no la demuestra.” |
| **“Mezclar provisional y validado es una serie.”** | Cambia el CRID y la calibración. | “Serie heterogénea; la diferencia puede ser de procesamiento.” |

## 3. Límites del método SAR del proyecto

1. **Es una vista previa de 8 bits.** Tiene realce de contraste; no está en dB ni en γ0.
2. **El umbral 38/255 es una heurística.** No tiene significado físico universal.
3. **El denominador son píxeles comparables.** No es el área del humedal, del país ni de daño.
4. **La exclusión de oscuros (<70) no es una máscara de agua.** Es un filtro exploratorio.
5. **La corrección de brillo no es la misma** en cliente (mediana) y precálculo (media del
   cuadro). No comparar sus cifras como una serie homogénea.
6. **La georreferenciación es aproximada.** Las esquinas vienen del KML de la vista previa, no
   del HDF5.
7. **La base puede ser provisional.** Las primeras pasadas y la base pueden tener CRID distinto
   de las últimas validadas.
8. **No hay corrección atmosférica ni de ionósfera.** No aplica a este método de amplitud, pero
   sí a cualquier InSAR futuro.
9. **No hay corrección por ángulo de incidencia.** Se mitiga comparando la misma órbita.
10. **No hay validación de campo.** No se visitó ninguna zona ni se contrastó con peritaje.

## 4. Límites de la comparación temporal

- **Misma órbita, misma dirección, mismo modo.** Cambiar cualquiera introduce geometría distinta.
- **Misma polarización.** HH y HV no son intercambiables.
- **Misma madurez o declarar la mezcla.**
- **Misma época orbital** si se requiere geolocalización fina (`P` vs `N`).
- **Mismo procesamiento de imagen** (realce, recorte, suavizado).
- **Mismo denominador** si se comparan porcentajes.

## 5. Límites de los productos NISAR

| Producto | Lo que no se puede concluir |
|---|---|
| **GCOV** | No hay fase; no sirve para desplazamiento. No distingue causa de cambio. |
| **GUNW** | No da vertical; no corrige atmósfera por defecto; solo co-pol y pares de 12 días. |
| **GOFF** | Offsets con outliers; no es una serie de deformación validada. |
| **SME2** | Validación en curso; no es una medición de campo. |
| **RSLC** | No es un mapa; requiere procesamiento experto. |
| **Vista previa** | No es calibrada; no es el producto. |

## 6. Límites de las fuentes externas

- **USGS/OVSICORI/RSN**: un sismo preliminar puede cambiar; las magnitudes no son idénticas
  entre redes.
- **PTWC/NHC**: son agencias de EE.UU.; no sustituyen a CNE/SINAMOT/IMN.
- **GDACS**: agrega; el reporte oficial está en la agencia de origen.
- **Open-Meteo**: modelo, no aviso oficial.
- **FIRMS**: foco no es perímetro; falsos positivos.
- **OSM**: exposición incompleta y de calidad variable.
- **GVP**: catálogo de volcanes, no monitoreo en vivo.

## 7. Sesgos del proyecto

1. **Cuatro zonas no son una muestra aleatoria.** Fueron elegidas por interés (humedal, volcán,
   bosque). No representan Costa Rica.
2. **El texto se apoya en las imágenes ya generadas.** Son hipótesis plausibles, no
   predicciones preregistradas.
3. **La selección de fechas puede resaltar un evento.** Comparar “la fecha que se ve interesante”
   contra una base aumenta el riesgo de falso positivo.
4. **El texto en español y el inglés pueden divergir.** La traducción no cambia la evidencia,
   pero puede cambiar el matiz.
5. **La UI puede sugerir más certeza de la que hay.** Un mapa de colores parece una medición.

## 8. Qué haría falta para subir de nivel

| Nivel | Requisito mínimo |
|---|---|
| 3. HDF5 descargado | Earthdata Login, almacenamiento, checksum, versión/CRID. |
| 4. HDF5 procesado | `h5py`/`xarray`/`rasterio`, leer γ0, máscara, looks, RTC. |
| 5. Cambio validado | Verificación de campo, imagery óptica de alta resolución, peritaje oficial, o varias fechas consistentes. |

Sin esos pasos, la conclusión máxima es: “la vista previa muestra una diferencia aparente que
podría ser compatible con X; no lo confirma”.

## 9. Frases seguras

- “Según NASA, la vista previa de NISAR muestra un cambio de brillo entre estas fechas.”
- “El patrón es compatible con humedad del suelo; no lo confirma.”
- “No se puede determinar la causa con este dato.”
- “La comparación mezcla productos provisionales y validados; puede haber diferencias de
  procesamiento.”
- “El porcentaje se refiere a píxeles comparables, no a superficie afectada.”
- “El GUNW mide desplazamiento en la línea de vista, no vertical.”

## 10. Frases prohibidas

- “NASA confirma…”
- “Detectamos una inundación/incendio/deslizamiento…”
- “X km² de daño.”
- “Probabilidad de X %.”
- “El volcán se elevó X cm.”
- “El bosque perdió X % de biomasa.”
- “Alerta oficial” (si no lo es).

## Referencias

- Auditoría científica: [`../../qa/challenge-review.md`](../../qa/challenge-review.md)
- Correcciones: [`../../qa/correcciones-ciencia.md`](../../qa/correcciones-ciencia.md)
- Límites del producto: [`../../producto/limites.md`](../../producto/limites.md)
- GCOV: <https://nisar-docs.asf.alaska.edu/gcov/>
- GUNW: <https://nisar-docs.asf.alaska.edu/gunw/>
