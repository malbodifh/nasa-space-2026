# GCOV: Geocoded Polarimetric Covariance

> **Qué es:** producto NISAR L2 geocodificado con retrodispersión calibrada y corregida por
> terreno, expresada como **gamma-cero** (`γ0`), más términos de covarianza polarimétrica.
> **Fuente:** ASF Data User Guide, GCOV, consultada el **15/11/2026**.

## 1. Definición corta

GCOV es una “foto” de potencia radar por píxel, ya corregida para que el relieve no invente
brillos, y ya colocada en un mapa. No contiene la fase interferométrica entre dos adquisiciones;
para eso está GUNW.

Es el producto más cercano a lo que un analista GIS espera: un ráster con valores físicos que se
puede comparar entre fechas y recortar por región.

## 2. Cómo se forma (conceptual)

1. **Adquisición.** NISAR emite pulsos L-band y recibe HH y HV (o VV/VH, o quad-pol) según el
   modo.
2. **Procesamiento de señal.** Se comprime en rango y azimuth, se corrige el movimiento y se
   obtiene una imagen compleja.
3. **RSLC.** Esa imagen compleja enfocada, en coordenadas radar, es la materia prima.
4. **Covarianza.** Para cada píxel se combinan las muestras de las polarizaciones:
   `C = ⟨k·k^H⟩`, donde `k` agrupa las componentes complejas. La diagonal es potencia; fuera de
   la diagonal hay amplitud y fase relativa.
5. **Corrección radiométrica del terreno (RTC).** Se compensa el efecto de la topografía con un
   DEM (Copernicus 30 m/90 m) y un algoritmo de área adaptativa. El resultado es `γ0`.
6. **Geocodificación.** Se proyecta a la zona UTM correspondiente con un DEM.
7. **Multilook adaptativo.** Se promedian muestras para reducir speckle; el número de looks
   depende del terreno y la geometría.
8. **HDF5.** Se escribe la jerarquía de grupos, datasets y atributos.

No es un proceso lineal simple: la RTC y el multilook cambian la resolución efectiva y el ruido.

## 3. Estructura HDF5

Las rutas oficiales de los términos de covarianza son:

```text
/science/LSAR/GCOV/grids/frequencyA/HHHH
/science/LSAR/GCOV/grids/frequencyA/HVHV
/science/LSAR/GCOV/grids/frequencyA/HHHV
/science/LSAR/GCOV/grids/frequencyA/HHVH
/science/LSAR/GCOV/grids/frequencyA/HHVV
/science/LSAR/GCOV/grids/frequencyA/HVVH
/science/LSAR/GCOV/grids/frequencyA/HVVV
/science/LSAR/GCOV/grids/frequencyA/VVVV
/science/LSAR/GCOV/grids/frequencyA/VHVH
/science/LSAR/GCOV/grids/frequencyA/VHVV
/science/LSAR/GCOV/grids/frequencyA/RHRH
/science/LSAR/GCOV/grids/frequencyA/RVRV
/science/LSAR/GCOV/grids/frequencyA/RHRV
```

Y los auxiliares:

```text
/science/LSAR/GCOV/grids/frequencyA/numberOfLooks
/science/LSAR/GCOV/grids/frequencyA/mask
/science/LSAR/GCOV/grids/frequencyA/rtcGammaToSigmaFactor
```

Puede existir `frequencyB` con los mismos tipos de dataset. **No todos los archivos traen todas
las polarizaciones**: depende del modo de adquisición. Un GCOV dual-pol HH/HV no tendrá VV.

### Qué significa cada auxiliar

| Dataset | Qué es | Cómo se usa | Qué **no** es |
|---|---|---|---|
| `HHHH`, `HVHV`, `VVVV`, `VHVH` | Términos diagonales reales: potencia retrodispersada. | `γ0` listo para analizar; pasar a dB con `10·log10`. | No son amplitudes; no aplicar `20·log10`. |
| `HHHV`, `HHVV`, etc. | Términos cruzados complejos. | Polarimetría avanzada; solo en quad-pol. | No están en dual-pol. |
| `numberOfLooks` | Número de muestras promediadas por píxel. | Ponderar calidad y ruido; no comparar píxeles con looks muy distintos sin cuidado. | No es un contador de “cuántas veces pasó el satélite”. |
| `mask` | Información sobre el conjunto de muestras que originó el píxel. | Filtrar píxeles sin promedio válido o con cobertura incompleta. | **No es una máscara de agua, bosque ni daño.** |
| `rtcGammaToSigmaFactor` | Factor para pasar de `γ0` a `σ0`. | Aplicar el factor según la especificación del producto. | No es un factor de calibración absoluta. |

La guía de formato aclara que el HDF5 de NISAR sigue la convención CF de netCDF; por eso algunos
lectores antiguos necesitan trucos (ver [`formatos-geoespaciales.md`](formatos-geoespaciales.md)).

## 4. Espaciado y resolución

| Ancho de banda (MHz) | RSLC azimuth (m) | RSLC rango (m) | GCOV (m) |
|---|---|---|---|
| 5 | ~5 | ~25 | **80** |
| 20 | ~5 | ~6,25 | **20** |
| 40 | ~5 | ~3,12 | **10** |
| 77 | ~5 | ~1,56 | **20** |

- Frecuencia **A** es la científica principal; frecuencia **B** se usa sobre todo para
  correcciones atmosféricas y suele ser más gruesa (80 m).
- **Espaciado** es la distancia entre centros de píxel. **Resolución** es la capacidad de
  distinguir dos objetos. El multilook y la RTC pueden empeorar la resolución efectiva aunque el
  espaciado sea fino.
- No convertir “píxel de 10 m” en “precisión de 10 m”.

## 5. Interpretación por tipo de superficie

| Superficie | Qué suele verse | Por qué | Qué no se puede concluir |
|---|---|---|---|
| **Agua abierta y quieta** | Muy oscura (baja `γ0`). | Reflexión especular: la energía se va lejos del radar. | Un píxel oscuro no prueba agua: sombra, arena lisa o ángulo también oscurecen. |
| **Agua con viento/olas** | Más brillante que el agua quieta. | La rugosidad devuelve parte de la energía. | No se puede estimar velocidad del viento sin modelo y calibración. |
| **Humedal con vegetación** | HH alto, a veces HV alto; cambia con la estación. | Doble rebote agua–tallos y dispersión volumétrica. | No distingue inundación natural de riego. |
| **Vegetación densa** | HV relativamente alto; L penetra parte del dosel. | Dispersión volumétrica en ramas y troncos. | HV no es un censo de árboles ni de biomasa sin calibración. |
| **Agricultura** | Parcelas con bordes rectos y cambios estacionales. | Siembra, riego, crecimiento y cosecha cambian la estructura y la humedad. | Un cambio rectangular no es necesariamente “daño”. |
| **Suelo desnudo húmedo** | Aumenta el brillo respecto al seco. | El agua sube la constante dieléctrica. | No se puede separar humedad de rugosidad con una sola fecha y una sola polarización. |
| **Nieve/glaciares** | Cambios de brillo y coherencia. | Nieve seca es transparente a L; la húmeda absorbe. | No es una medición directa de masa de hielo. |

## 6. Series temporales

Para comparar dos fechas GCOV de forma defendible:

1. Misma pista, dirección, frame y modo.
2. Misma polarización y mismo tipo de término.
3. Misma proyección/grilla o remuestreo documentado.
4. Misma madurez o, si se mezcla, declararlo.
5. Misma época orbital (precisa vs NRT) si se requiere geolocalización fina.
6. Corrección por diferencias radiométricas globales, si corresponde.
7. Mirar `numberOfLooks` y `mask`.
8. Pasar a dB solo después de verificar que `γ0 > 0`.

Un cambio de 3 dB es un factor ~2 en potencia. Un cambio de 1 dB (~26 %) puede ser real o de
procesamiento; sin incertidumbre no se puede decidir.

## 7. Estadísticas por región

Para un promedio por área:

- Usar polígonos en la misma proyección o reproyectar con cuidado.
- Excluir píxeles sin dato (`mask`, NaN, ceros no válidos).
- Ponderar por área de píxel si la proyección lo requiere.
- Reportar `n` (píxeles válidos), mediana y dispersión, no solo media.
- No extrapolar de una zona de 40 × 60 km a todo el país.
- No convertir “porcentaje de píxeles” en “km² de daño”.

## 8. Precauciones

1. **Un cambio de retrodispersión no identifica su causa.** Puede ser humedad, cosecha, tala,
   inundación, obra, ángulo o procesamiento.
2. **Una disminución no demuestra pérdida de vegetación.** También puede ser suelo más liso,
   agua, sombra o calibración.
3. **Un píxel oscuro no demuestra agua.** Menos aún con una sola polarización.
4. **Dos productos de distinta madurez no son una serie homogénea.** CRID y colección importan.
5. **La vista previa no es GCOV.** El PNG de 8 bits tiene realce de contraste; no está en dB.
6. **El `mask` no es una máscara temática.** Es información del promedio, no una clasificación.
7. **La RTC no elimina todos los efectos.** Quedan sombras, layover y errores de DEM.
8. **La covarianza no es una verdad de campo.** Necesita validación independiente.

## 9. Ejemplo numérico

Supongamos dos fechas con `γ0` lineal:

```text
fecha 1: 0,040
fecha 2: 0,080
```

```text
ΔdB = 10·log10(0,080 / 0,040) = 10·log10(2) ≈ 3,01 dB
```

Eso es el doble de potencia. No dice si el suelo se mojó, si creció la vegetación o si cambió el
procesamiento. Para atribuir una causa hace falta contexto independiente.

## Referencias

- ASF · GCOV: <https://nisar-docs.asf.alaska.edu/gcov/>
- ASF · Products overview: <https://nisar-docs.asf.alaska.edu/products-overview/>
- ASF · HDF5: <https://nisar-docs.asf.alaska.edu/data-format>
- Especificación L2 GCOV (JPL D-102274 RevF), enlazada desde la página oficial.
