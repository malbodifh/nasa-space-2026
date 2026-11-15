# Productos NISAR

> **Fuente:** NISAR Data User Guide (ASF), consultada el **15/11/2026**.
> **Regla:** las características nominales no garantizan que exista un producto para una región
> o fecha. La disponibilidad se comprueba en CMR/ASF.

## 1. Niveles de procesamiento

En SAR, los niveles de NASA no significan lo mismo que en imágenes ópticas:

| Nivel | Qué es | ¿Se puede poner en un mapa? |
|---|---|---|
| **L0** | Datos crudos del instrumento, sin enfocar. | No. |
| **L1** | Imagen compleja enfocada, en coordenadas radar (range-Doppler). | No directamente. |
| **L2** | Producto geocodificado a una grilla geográfica. | Sí. |
| **L3** | Parámetro geofísico derivado (por ejemplo, humedad del suelo). | Sí, en una grilla específica. |

Que un producto sea L2 no significa que sea “mejor” para todo: GCOV es L2 y es el más útil para
retrodispersión; GUNW es L2 y sirve para desplazamiento; RSLC es L1 y es la materia prima de la
interferometría.

## 2. Tabla comparativa

| Producto | Nivel | Variables | Formato | Geocodificado | Espaciado | Aplicaciones | Limitaciones | Dificultad | Acceso | Documentación |
|---|---|---|---|---|---|---|---|---|---|---|
| **L0B / RRSD** | L0 | Pulsos radar corregidos y alineados. | HDF5 | No | N/A (range-Doppler) | Reprocesamiento, calibración, investigación de señal. | No es una imagen utilizable; requiere cadena SAR. | Alta | ASF, Earthdata Login | [RRSD](https://nisar-docs.asf.alaska.edu/rrsd) |
| **RSLC** | L1 | Señal compleja enfocada por polarización. | HDF5 | No | ~5 m azimuth; ~1,6–25 m rango según banda | InSAR, polarimetría, cambio fino, materia prima de L2. | No es map-ready; requiere coregistro y correcciones. | Alta | ASF, Earthdata Login | [RSLC](https://nisar-docs.asf.alaska.edu/rslc) |
| **RIFG** | L1 | Interferograma envuelto + coherencia. | HDF5 | No | 30 m | Líneas de tierra, control de calidad, inspección de fase. | Fase envuelta; no da desplazamiento absoluto sin desenvolver. | Alta | ASF, Earthdata Login | [RIFG](https://nisar-docs.asf.alaska.edu/rifg) |
| **RUNW** | L1 | Interferograma diferencial desenvuelto + coherencia + ionósfera. | HDF5 | No | 80 m | Desplazamiento del suelo en coordenadas radar. | No es mapa; requiere geocodificación y correcciones. | Alta | ASF, Earthdata Login | [RUNW](https://nisar-docs.asf.alaska.edu/runw) |
| **ROFF** | L1 | Offsets de píxel (along-track y slant-range) + varianzas/SNR. | HDF5 | No | 90 m | Criósfera, flujos rápidos, desplazamientos grandes. | Offsets sin filtro; outliers; no es una serie de deformación. | Alta | ASF, Earthdata Login | [ROFF](https://nisar-docs.asf.alaska.edu/roff) |
| **GSLC** | L2 | Señal compleja geocodificada por polarización. | HDF5 | Sí | 5–40 m según banda | Retrodispersión, polarimetría, interferometría geocodificada. | Archivos grandes; necesita LUTs para β0/σ0/γ0. | Alta | ASF, Earthdata Login | [GSLC](https://nisar-docs.asf.alaska.edu/gslc) |
| **GCOV** | L2 | Términos de covarianza polarimétrica; γ0 con RTC. | HDF5 | Sí | 10, 20 u 80 m | Biomasa, humedad del suelo, disturbios, inundación, cultivos. | Solo potencia (no fase); mezcla de madureces; requiere máscara y looks. | Media | ASF, Earthdata Login | [GCOV](https://nisar-docs.asf.alaska.edu/gcov) |
| **GUNW** | L2 | Fase desenvuelta, coherencia, componentes conexas, ionósfera, offsets. | HDF5 | Sí | 80 m (desenvuelto); 20 m (envuelto/coherencia) | Desplazamiento LOS, sismos, volcanes, subsidencia, deslizamientos. | Solo co-pol HH/VV, pares de 12 días, no da vertical; atmósfera no removida. | Alta | ASF, Earthdata Login | [GUNW](https://nisar-docs.asf.alaska.edu/gunw) |
| **GOFF** | L2 | Offsets geocodificados (along-track y range) + SNR. | HDF5 | Sí | 80 m | Criósfera, movimiento rápido, complemento de GUNW. | Offsets sin post-proceso; outliers; no es desplazamiento vertical. | Alta | ASF, Earthdata Login | [GOFF](https://nisar-docs.asf.alaska.edu/goff) |
| **SME2** | L3 | Humedad del suelo (DSG, PMI, TSR) + incertidumbre. | HDF5 | Sí | 200 m (500 m en el Sahara) | Sequía, riego, agricultura, pronóstico de rendimiento. | Validación aún en curso; en 11/2026 no había colección validada. | Media | ASF, Earthdata Login | [SME2](https://nisar-docs.asf.alaska.edu/sme2) |

## 3. Lo que la app usa hoy

| Dato | Producto real | Qué se usa | Qué no se usa |
|---|---|---|---|
| Catálogo de pasadas | GCOV L2 | CMR + nombres de gránulo. | No se descarga el HDF5. |
| Imagen comparada | GCOV L2 | Vista previa pública `*_LATLON.png` (8 bits, HH/HV). | No se usa γ0 calibrado. |
| Mapa de cambio | Derivado de la vista previa | Diferencia de HH suavizada, umbral 38/255. | No es un producto NISAR oficial. |
| Órbita / cuadro | GCOV L2 | Pista, dirección, frame y modo del nombre. | No se usa el HDF5 para correcciones. |

Detalle del método vigente: [`../../producto/nisar.md`](../../producto/nisar.md).
Detalle del pipeline: [`arquitectura-de-datos.md`](arquitectura-de-datos.md).

## 4. Disponibilidad y madurez

- **BETA:** primeras liberaciones; no calibrar en serio.
- **PROVISIONAL:** calibrado y parcialmente validado.
- **VALIDATED:** calibrado y validado.
- La colección validada de GCOV es `NISAR_L2_GCOV_V1`; la provisional,
  `NISAR_L2_GCOV_PROVISIONAL_V1`.
- **SME2** seguía provisional en noviembre de 2026: no había colección validada.
- La liberación validada L0–L2 incluye adquisiciones desde el **21/10/2026**; el
  reprocesamiento de datos anteriores está previsto para **2027**.
- Un mismo gránulo puede aparecer en varias zonas del manifiesto. Contar entradas no es contar
  observaciones únicas.

Cronología y matices: [`nasa-nisar.md`](nasa-nisar.md) §3–§4.

## 5. Cómo elegir un producto

| Si querés… | Producto razonable | Por qué |
|---|---|---|
| Un mapa rápido de brillo | **GCOV** | Ya está geocodificado y corregido por terreno. |
| Entender la señal cruda | **RSLC** | Contiene amplitud y fase complejas. |
| Medir desplazamiento del suelo | **GUNW** | Fase desenvuelta y coherencia en una grilla. |
| Medir movimiento rápido o criósfera | **GOFF / ROFF** | Offsets densos; otra técnica. |
| Humedad del suelo | **SME2** | Producto L3 específico; validación pendiente. |
| Cambio de cobertura o disturbio | **GCOV** | Series de γ0; requiere varias fechas. |
| Ver la fase interferométrica | **RIFG / RUNW** | Envolvente o desenvuelta, antes de geocodificar. |

## 6. Advertencias

1. **Espaciado no es resolución.** Un GCOV de 10 m tiene píxeles cada 10 m, pero la resolución
   efectiva depende del multilook y del terreno.
2. **GCOV no tiene fase.** Para desplazamiento hace falta GUNW u otro interferograma.
3. **GUNW no da desplazamiento vertical.** Da línea de vista (LOS); la vertical requiere
   supuestos o combinar órbitas.
4. **Un producto validado no valida nuestro análisis.** Valida el procesamiento de la misión.
5. **La vista previa no es el producto.** Es un PNG con realce de contraste; no está en dB.
6. **No mezclar madureces sin decirlo.** Una diferencia entre provisional y validado puede ser
   del software, no del suelo.

## 7. Nombres y versiones

Los productos llevan **CRID** (Composite Release ID), que identifica la versión del software de
procesamiento. En el proyecto:

- provisional: `P05023`;
- validado: `P05036`.

Un cambio de CRID puede cambiar la radiometría. Si se comparan fechas con CRID distinto, hay que
declararlo. El nombre completo se explica en [`nasa-nisar.md`](nasa-nisar.md) §5.

## Referencias

- ASF · Products overview: <https://nisar-docs.asf.alaska.edu/products-overview/>
- ASF · GCOV: <https://nisar-docs.asf.alaska.edu/gcov/>
- ASF · GUNW: <https://nisar-docs.asf.alaska.edu/gunw/>
- ASF · GOFF: <https://nisar-docs.asf.alaska.edu/goff/>
- ASF · HDF5: <https://nisar-docs.asf.alaska.edu/data-format>
- ASF · Available data: <https://nisar-docs.asf.alaska.edu/availability-overview/>
