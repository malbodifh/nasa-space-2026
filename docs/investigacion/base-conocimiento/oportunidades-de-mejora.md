# Oportunidades de mejora

> **Nada de esto está implementado** salvo lo marcado como **Existente** o **Parcial**.
> Es un catálogo para decidir, no una lista de promesas.

## 1. Catálogo

### SAR y productos NISAR

| Nombre | Objetivo | Fuente | Datos necesarios | Estado | Complejidad | Dependencias | Limitaciones | Valor |
|---|---|---|---|---|---|---|---|---|
| **Series temporales de retrodispersión** | Ver tendencia por zona, no solo dos fechas. | NISAR GCOV | γ0 por fecha, misma órbita; HDF5 o derivado. | Propuesta | Media | Descarga HDF5 o precomputar | Calibración, humedad, fenología. | Detectar cambios sostenidos. |
| **Comparación HH/HV** | Separar superficie de volumen. | NISAR GCOV / preview | HH y HV por fecha. | **Parcial**: la preview tiene ambos; el cambio usa HH. | Media | Cambiar el método y la UI | HV no es “biomasa” directa. | Mejor interpretación de vegetación/agua. |
| **Máscaras de calidad GCOV** | Excluir píxeles con pocos looks o promedio inválido. | NISAR GCOV | `mask`, `numberOfLooks`. | Propuesta | Media | HDF5 + procesamiento | `mask` no es máscara temática. | Menos falsos positivos. |
| **Fichas de procedencia** | Mostrar gránulo, CRID, colección y fecha. | CMR / manifiesto | Metadatos ya disponibles. | **Parcial**: el manifiesto los tiene; la UI muestra estado. | Baja | UI | No mejora la ciencia por sí sola. | Confianza y trazabilidad. |
| **Visualización de incertidumbre** | No mostrar un mapa binario sin calidad. | GCOV/GUNW | Coherencia, looks, incertidumbre ionosférica. | Propuesta | Alta | HDF5 + diseño | Difícil de explicar. | Honestidad y menos sobrelectura. |
| **Mapas de agua abierta con validación** | Distinguir agua de sombra/suelo liso. | GCOV + óptico | γ0, máscara, validación visual. | Propuesta | Alta | HDF5 + validación | Un píxel oscuro no es agua. | Inundación más defendible. |
| **Estadísticas por región** | Promedios/medianas por polígono. | GCOV | Raster + polígonos + máscara. | Propuesta | Media | HDF5/rasterio | No extrapolar a todo el país. | Resúmenes reproducibles. |
| **Deformación con GUNW** | Investigar volcanes y sismos. | NISAR GUNW | Fase desenvuelta, coherencia, correcciones. | Propuesta | Alta | Earthdata + InSAR | LOS, no vertical; atmósfera. | Nueva dimensión científica. |
| **Movimiento con GOFF** | Detectar desplazamientos grandes. | NISAR GOFF | Offsets, SNR, varianzas. | Propuesta | Alta | Earthdata + procesamiento | Outliers; no es serie validada. | Deslizamientos/criósfera. |

### Contexto y fuentes

| Nombre | Objetivo | Fuente | Datos necesarios | Estado | Complejidad | Dependencias | Limitaciones | Valor |
|---|---|---|---|---|---|---|---|---|
| **Contexto de precipitación** | Contrastar un cambio de brillo con lluvia. | NASA POWER / IMERG | Serie diaria o 30 min. | **Parcial**: POWER se usa en el score, no en el estudio SAR. | Baja/Media | API + UI | Latencia y escala gruesa. | Convertir hipótesis en contraste. |
| **Datos de incendio GFWED** | Añadir clima de fuego al score. | NASA GFWED | NetCDF diario, recorte. | Propuesta | Media | Descarga/precálculo | No es detección de incendios. | Mejor contexto de peligro. |
| **Humedad SMAP** | Contexto de suelo antes/después. | NASA SMAP | HDF5 o GIBS. | Propuesta | Media | Earthdata/GIBS | Resolución gruesa. | Explicar humedad antecedente. |
| **Comparación con Sentinel-1** | Tener C-band independiente. | ASF / Copernicus | SLC/GRD, misma zona. | Propuesta | Alta | Descarga + coregistro | Geometría y resolución distintas. | Validación cruzada. |
| **Comparación con Sentinel-2** | Contexto óptico de alta resolución. | Copernicus | Imágenes ópticas. | Propuesta | Media | API + nubes | Nubes y sombras. | Ver vegetación/agua. |
| **Comparación con Landsat** | Serie larga de contexto. | USGS | Landsat 8/9. | Propuesta | Media | API + nubes | 30 m y revisita. | Historia del paisaje. |

### Producto y operación

| Nombre | Objetivo | Fuente | Datos necesarios | Estado | Complejidad | Dependencias | Limitaciones | Valor |
|---|---|---|---|---|---|---|---|---|
| **Estado operativo de las API** | Saber si CMR/ASF/GIBS/POWER responden. | `/api/health` | Estado por fuente. | **Parcial**: health existe; NISAR figura. | Baja | UI/ops | No mide latencia real. | Menos diagnósticos a ciegas. |
| **Explicaciones educativas SAR** | Enseñar qué se está viendo. | Contenido propio | Textos, diagramas. | **Parcial**: hay pistas por amenaza. | Baja | Diseño | No sustituye validación. | Comprensión y confianza. |
| **Comparación entre regiones** | Contextualizar Palo Verde vs Caño Negro vs Tortuguero. | Manifiesto | Series de las 4 zonas. | **Parcial**: existen las 4 zonas. | Baja | UI/análisis | No es muestra representativa. | Narrativa honesta. |

## 2. Orden sugerido por costo/beneficio

| Prioridad | Oportunidad | Por qué |
|---|---|---|
| 1 | Fichas de procedencia | Ya hay metadatos; mejora la confianza con poco código. |
| 2 | Contexto de precipitación | Reutiliza POWER; ayuda a no atribuir causas. |
| 3 | Comparación HH/HV | La preview ya tiene ambos canales. |
| 4 | Máscaras de calidad | Requiere HDF5, pero reduce falsos positivos. |
| 5 | Series temporales | Requiere HDF5 o más precálculo; alto valor. |
| 6 | GUNW/GOFF | Alto costo y alta ciencia; solo con validación. |

## 3. Criterios para aceptar una mejora

Antes de implementar:

1. **¿Hay dato NASA accesible?** Si no, no se inventa.
2. **¿Se puede explicar en una frase?** Si no, no está listo para la UI.
3. **¿Tiene una prueba?** Al menos un test de contrato o un caso de ejemplo.
4. **¿Tiene una limitación escrita?** Toda cifra nueva necesita su “qué no demuestra”.
5. **¿Respeta la arquitectura?** BFF y sin claves en cliente; cualquier almacenamiento
   adicional necesita una decisión explícita (el push ya contempla Supabase).
6. **¿Se puede apagar?** Una bandera o feature flag para no romper el demo.

## 4. Lo que no se recomienda

- Añadir un score de inundación/deslizamiento sin validación.
- Convertir porcentajes de píxeles a km² de daño.
- Presentar GUNW como vertical.
- Usar FIRMS como “incendios confirmados”.
- Descargar HDF5 en una request de Vercel.
- Meter un modelo de IA sin datos de entrenamiento y validación.
- Sumar una API solo porque existe.

## 5. Relación con el reto

El reto “Dancing with the SARs” pide una app interactiva con NISAR, elegir un AOI, comparar
fechas y añadir contexto. El proyecto ya cumple el núcleo con vistas previas. Las mejoras de
mayor valor para el jurado son las que **aumentan el rigor** (procedencia, incertidumbre,
contexto) sin inflar promesas.

## Referencias

- NISAR GCOV: <https://nisar-docs.asf.alaska.edu/gcov/>
- NISAR GUNW: <https://nisar-docs.asf.alaska.edu/gunw/>
- NISAR GOFF: <https://nisar-docs.asf.alaska.edu/goff/>
- POWER: <https://power.larc.nasa.gov/docs/services/api/>
- IMERG: <https://gpm.nasa.gov/data/imerg>
- GFWED: <https://data.giss.nasa.gov/impacts/gfwed/>
- SMAP: <https://smap.jpl.nasa.gov/>
- ASF Search: <https://docs.asf.alaska.edu/api/basics/>
