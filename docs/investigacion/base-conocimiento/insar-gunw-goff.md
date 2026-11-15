# Interferometría: GUNW y GOFF

> **Idea central:** dos imágenes radar de la misma zona, tomadas en fechas distintas, permiten
> comparar la **fase** de la onda. Esa diferencia es sensible a cambios de distancia de pocos
> centímetros. Pero también a la atmósfera, la ionósfera, el terreno y los errores de órbita.
> **Fuente:** ASF Data User Guide, GUNW/GOFF, consultada el **15/11/2026**.

## 1. Interferometría en una frase

Si tengo dos imágenes complejas `z₁` y `z₂` del mismo punto:

```text
I = z₂ · conj(z₁)
Δφ = arg(I) = φ₂ − φ₁
```

`I` es el interferograma: su **fase** contiene la diferencia de fase entre las observaciones,
afectada también por atmósfera, relieve y otros errores. Su módulo sin normalizar es el producto
de las amplitudes; **no es coherencia**. La coherencia se estima con un promedio y una
normalización, como se muestra en [`formulas-y-calculos.md`](formulas-y-calculos.md) §10.

## 2. Fase envuelta y desenvuelta

| Concepto | Definición sencilla | Explicación técnica | Error frecuente |
|---|---|---|---|
| **Fase envuelta** | La fase cabe en una vuelta de 2π. | El radar solo mide fase módulo 2π; un desplazamiento de una longitud de onda “da la vuelta”. | Leer un salto de 2π como un cambio brusco del terreno. |
| **Fase desenvuelta** | Se cuentan las vueltas para obtener una fase continua. | Algoritmos de unwrapping suman múltiplos de 2π; pueden fallar con ruido o incoherencia. | Confiar en un desenvuelto sin revisar coherencia y componentes conexas. |
| **Coherencia** | Cuánto se parecen las dos observaciones. | Magnitud normalizada entre 0 y 1; baja si cambió la superficie, hay vegetación, agua o ruido. | “Coherencia baja = daño”. No: puede ser decorrelación natural. |
| **Componentes conexas** | Regiones donde el desenvuelto es consistente. | Máscara de conectividad; ayuda a detectar errores de unwrapping. | Ignorarlas y promediar toda la escena. |

## 3. De fase a distancia

Para un radar monostático (transmite y recibe en la misma antena), la distancia recorrida es dos
veces la distancia al blanco. La relación conceptual es:

```text
|ΔR| = λ · |Δφ| / (4π)
```

| Variable | Unidad | Supuesto |
|---|---|---|
| `ΔR` | m | Diferencia de distancia en la línea de vista (LOS). |
| `λ` | m | Longitud de onda; L-band NISAR ≈ 0,24 m. |
| `Δφ` | rad | Fase desenvuelta, sin ambigüedad. |

Para L-band, una vuelta completa (`2π`) equivale a:

```text
|ΔR| = 0,24 m · 2π / (4π) = 0,12 m = 12 cm
```

Es decir, **una franja de interferencia ≈ 12 cm de cambio LOS**. Para S-band (9,4 cm) sería
~4,7 cm, pero NISAR GUNW estándar es L-band.

### Convención de signo

La fórmula con valor absoluto evita el problema, pero para interpretar “se levantó” o “se hundió”
hay que fijar convención:

- Si la fase se define como `φ = −(4π/λ)·R` (convención frecuente), entonces
  `Δφ = −(4π/λ)·ΔR`.
- Si el blanco se **acerca** al radar, `R` disminuye, `ΔR < 0`, y `Δφ > 0` con esa convención.
- La ficha de NASA Disasters describe GUNW como desplazamiento a lo largo de la línea de vista
  (LOS), pero no fija una convención de signo en el texto consultado.
- Algunos mapas de NISAR GUNW se visualizan con **positivo hacia el satélite**; no es una
  convención universal de todos los productos InSAR.
- El **orden de las fechas** del par también cambia el signo. No asumir “después − antes” sin
  leer los metadatos.

**Regla práctica:** antes de decir “se elevó 3 cm”, verificar (1) la convención del producto,
(2) el orden de las fechas y (3) el vector LOS de la órbita.

## 4. Desplazamiento LOS vs vertical

`d_LOS` es la proyección del movimiento 3D sobre la línea de vista:

```text
d_LOS = u · l
```

| Variable | Unidad | Significado |
|---|---|---|
| `u` | m | Vector de desplazamiento 3D (este, norte, arriba). |
| `l` | adimensional | Vector unitario desde el suelo hacia el satélite. |
| `d_LOS` | m | Componente medida por InSAR. |

Si se supone que el movimiento es **puramente vertical**:

```text
d_vertical ≈ d_LOS / cos(θ)
```

donde `θ` es el ángulo de incidencia local. Pero ese supuesto casi nunca es cierto: un volcán
puede inflarse y deslizarse; un deslizamiento puede moverse pendiente abajo. Para separar
vertical y horizontal hacen falta dos geometrías (ascendente y descendente) y un modelo.

**GUNW no entrega automáticamente desplazamiento vertical.** Entrega LOS.

## 5. Qué contiene GUNW

| Capa | Espaciado | Para qué sirve | Limitación |
|---|---|---|---|
| Fase desenvuelta | 80 m | Desplazamiento LOS. | Sensible a unwrapping y atmósfera. |
| Interferograma envuelto | 20 m | Inspección de fase y calidad. | Ambigüedad 2π. |
| Coherencia | 20 m y 80 m | Detectar decorrelación y errores. | Baja coherencia no prueba daño. |
| Componentes conexas | — | Consistencia del desenvuelto. | No es una máscara de confianza absoluta. |
| Pantalla ionosférica + incertidumbre | — | Corregir el efecto de la ionósfera. | **No está aplicada por defecto** en las capas de datos. |
| LUTs de correcciones | — | Mareas terrestres, troposfera húmeda/seca. | **No están removidas por defecto**. |
| Offsets | — | Desplazamientos grandes donde la fase falla. | Pueden tener outliers. |

Condiciones del producto estándar:

- Solo **co-pol** (HH o VV), no cross-pol.
- Pares **nearest-neighbor de 12 días**.
- Frecuencia **A**.
- Geocodificado a UTM o estereográfica polar.
- 80 m para la fase desenvuelta.

## 6. Qué contiene GOFF

GOFF es el producto de **offsets de píxel** geocodificados, derivado de ROFF:

- capas de offset along-track y slant-range;
- varianzas, pico de correlación, SNR;
- 80 m de espaciado;
- sin filtro ni post-proceso: puede haber outliers.

Se usa sobre todo en criósfera y movimientos rápidos, donde la fase interferométrica se rompe.
No es una serie de desplazamiento vertical ni un mapa de daño.

## 7. Fuentes de error

| Fuente | Qué hace | Cómo se detecta | Cómo se mitiga |
|---|---|---|---|
| **Atmósfera (troposfera)** | Retrasa la señal; fase falsa de escala espacial amplia. | Patrones suaves que no coinciden con el terreno; comparar con modelos meteorológicos. | LUTs, correcciones externas, pares redundantes. |
| **Ionósfera** | Afecta sobre todo a L-band; fase de gran escala. | Pantalla ionosférica y su incertidumbre. | Aplicar la corrección (no viene aplicada por defecto). |
| **Topografía/DEM** | Residuos de fase por errores del DEM. | Correlación con pendientes y sombras. | DEM mejor, RTC, enmascarar. |
| **Órbita** | Error de trayectoria. | Rampas de fase de gran escala. | Efemérides precisas (`P`), no NRT (`N`) si se requiere exactitud. |
| **Unwrapping** | Saltos de 2π mal resueltos. | Componentes conexas, discontinuidades. | Revisar coherencia; usar componentes. |
| **Decorrelación** | Pérdida de coherencia por vegetación, agua, nieve o cambio. | Coherencia baja. | Enmascarar; no interpretar como deformación. |
| **Movimiento no vertical** | La LOS mezcla componentes. | Comparar ascendente y descendente. | Inversión con dos geometrías. |

## 8. Incertidumbre

No hay un único “error de ±X cm” para todos los píxeles. La incertidumbre depende de:

- coherencia local;
- número de looks y ruido de fase;
- calidad del desenvuelto;
- corrección ionosférica/troposférica;
- error del DEM y de la órbita;
- supuesto de movimiento (LOS vs vertical).

Para reportar:

1. Dar la incertidumbre del producto o una estimación basada en coherencia.
2. Decir que es LOS, no vertical.
3. Mostrar la coherencia al usuario, no solo el mapa de color.
4. No promediar píxeles incoherentes para “mejorar” la cifra.

## 9. Flujo de interpretación

```text
1. ¿Hay par? → fechas, órbita, modo, polarización
2. ¿Coherencia suficiente? → enmascarar lo bajo
3. ¿Desenvuelto consistente? → componentes conexas
4. ¿Correcciones aplicadas? → ionósfera, troposfera, mareas
5. ¿Signo y fechas? → convención del producto
6. ¿LOS o vertical? → no confundir
7. ¿Contraste independiente? → GNSS, nivelación, sismicidad, campo
8. Recién entonces: hipótesis de deformación
```

## 10. Errores frecuentes

- **“Coherencia baja = daño.”** Falso: puede ser vegetación, agua, nieve o cambio natural.
- **“GUNW da el desplazamiento vertical.”** Falso: da LOS.
- **“Una franja = 12 cm de daño.”** Falso: 12 cm es la escala de una vuelta de fase; el signo y la
  causa no están incluidos.
- **“La corrección ionosférica ya está aplicada.”** En GUNW está incluida como capa, pero no
  aplicada por defecto a las capas de datos.
- **“Dos pares cualquiera se pueden restar.”** Distinta geometría, modo o procesamiento puede
  producir diferencias que no son del suelo.

## Referencias

- ASF · GUNW: <https://nisar-docs.asf.alaska.edu/gunw/>
- ASF · GOFF: <https://nisar-docs.asf.alaska.edu/goff/>
- ASF · Products overview: <https://nisar-docs.asf.alaska.edu/products-overview/>
- NASA Disasters · NISAR GUNW Surface Displacement:
  <https://science.data.nasa.gov/disasters/data-gallery/nisar-gunw-displacement>
- Especificación L2 GUNW (JPL D-102272 RevE), enlazada desde la página oficial.
