# Fórmulas y cálculos

> **Convención:** fórmulas conceptuales para entender y auditar el proyecto. No sustituyen la
> especificación de un producto ni una librería calibrada.
> Cada fórmula indica variables, unidades, supuestos y un ejemplo.

## 1. Resumen

| # | Fórmula | Resultado | Unidad |
|---|---|---|---|
| 1 | `R = c·t/2` | Distancia radar | m |
| 2 | `z = A·e^(iφ)` | Señal compleja | unidad de amplitud |
| 3 | `I = A²` | Intensidad/potencia | unidad de potencia |
| 4 | `P_dB = 10·log10(P)` | Potencia en dB | dB |
| 5 | `ΔdB = P2_dB − P1_dB` | Diferencia en dB | dB |
| 6 | `Q = P2/P1` | Cociente de potencias | adimensional |
| 7 | `ΔdB = 10·log10(Q)` | Cociente en dB | dB |
| 8 | `A_pixel = ancho × alto` | Área de píxel | m² |
| 9 | `ΔA = (N2 − N1)·A_pixel` | Área clasificada de cambio | m² |
| 10 | `I = z2·conj(z1)` | Interferograma | complejo |
| 11 | `ΔR = λ·Δφ/(4π)` | Diferencia de distancia (magnitud) | m |
| 12 | `d_LOS = u·l` | Desplazamiento en línea de vista | m |
| 13 | `media = Σx/n` | Media aritmética | unidad de x |
| 14 | `anomalía = x − media_ref` | Anomalía | unidad de x |
| 15 | `z = (x − media)/σ` | Anomalía estandarizada | adimensional |
| 16 | `% = 100·cambiados/comparables` | Porcentaje de píxeles | % |
| 17 | `γ0_dB = 10·log10(γ0)` | Retrodispersión en dB | dB |
| 18 | `A_bbox ≈ Δlon·111,32·cos(lat)·Δlat·110,57` | Área del rectángulo | km² |

## 2. Distancia radar

```text
R = c · t / 2
```

| Variable | Unidad | Significado |
|---|---|---|
| `R` | m | Distancia al blanco. |
| `c` | m/s | Velocidad de la luz (~299.792.458 m/s). |
| `t` | s | Tiempo de ida y vuelta. |

**Supuesto:** el pulso viaja a la velocidad de la luz y vuelve por el mismo camino.

**Ejemplo:** si el eco tarda `t = 0,005 s`, `R = 299.792.458 × 0,005 / 2 ≈ 749.481 m`. La división
por 2 es porque el tiempo incluye ida y vuelta.

## 3. Señal compleja, amplitud e intensidad

```text
z = A · e^(iφ)
A = |z|
I = |z|² = A²
```

| Variable | Unidad | Significado |
|---|---|---|
| `z` | unidad de amplitud | Señal IQ compleja. |
| `A` | unidad de amplitud | Amplitud del eco. |
| `φ` | rad | Fase. |
| `I` | unidad de potencia | Intensidad. |

**Supuesto:** `z` está calibrada en la misma escala para las dos fechas que se comparan.

**Ejemplo:** `A = 2`, `φ = π/2` → `z = 2i`, `I = 4`.

## 4. Decibelios

```text
P_dB = 10 · log10(P)
```

| Variable | Unidad | Significado |
|---|---|---|
| `P` | unidad de potencia | Potencia o intensidad, **siempre > 0**. |
| `P_dB` | dB | Potencia relativa. |

**Supuesto:** se usa `10·log10` para **potencia**. Para amplitud se usa `20·log10(A)`.
No mezclar.

**Ejemplo:** `P = 2` → `10·log10(2) ≈ 3,01 dB`. Duplicar potencia son ~3 dB.

## 5. Diferencia de retrodispersión

```text
ΔdB = P2_dB − P1_dB
```

**Ejemplo:** `P1_dB = −12 dB`, `P2_dB = −9 dB` → `ΔdB = +3 dB` (el doble de potencia).

**Cuidado:** una diferencia de 3 dB puede ser real o de calibración. No es “3 dB de daño”.

## 6. Cociente de potencias

```text
Q = P2 / P1
```

| Variable | Unidad | Significado |
|---|---|---|
| `Q` | adimensional | Cuántas veces cambió la potencia. |
| `P1`, `P2` | misma unidad | Potencias comparables. |

**Ejemplo:** `P1 = 0,04`, `P2 = 0,08` → `Q = 2`.

## 7. Cociente a dB

```text
ΔdB = 10 · log10(Q)
```

**Ejemplo:** `Q = 2` → `3,01 dB`; `Q = 0,5` → `−3,01 dB`; `Q = 10` → `10 dB`.

## 8. Área de píxel

```text
A_pixel = ancho × alto
```

| Variable | Unidad | Significado |
|---|---|---|
| `ancho`, `alto` | m | Espaciado del píxel en el terreno. |
| `A_pixel` | m² | Área nominal de muestreo. |

**Supuesto:** el píxel es cuadrado en la proyección local.

**Ejemplo:** GCOV de 10 m → `10 × 10 = 100 m²`.

**Cuidado:** área de muestreo **no** es resolución efectiva. Un píxel de 10 m puede representar
un área resuelta mayor.

## 9. Área de cambio clasificada

```text
ΔA = (N2 − N1) · A_pixel
```

| Variable | Unidad | Significado |
|---|---|---|
| `N1`, `N2` | píxeles | Cantidad de píxeles de una clase en cada fecha. |
| `A_pixel` | m²/píxel | Área nominal. |
| `ΔA` | m² | Cambio de área de esa clase. |

**Supuestos:** misma grilla, misma clasificación, misma resolución, mismos criterios.

**Ejemplo:** `N1 = 1.000`, `N2 = 1.100`, `A_pixel = 100 m²` → `ΔA = 10.000 m² = 0,01 km²`.

**Advertencia:** esto **no** es “superficie dañada”. Es el área de una clase definida por
nosotros. Si la clase es “píxel más brillante”, el resultado es “área más brillante”, no “daño”.

## 10. Interferograma

```text
I = z2 · conj(z1)
Δφ = arg(I)
```

| Variable | Unidad | Significado |
|---|---|---|
| `z1`, `z2` | complejo | Señales de las dos fechas. |
| `I` | complejo | Interferograma. |
| `Δφ` | rad | Fase interferométrica, envuelta. |

**Supuesto:** las imágenes están coregistradas y en la misma geometría.

**Ejemplo:** si `z1 = 1`, `z2 = e^(iπ/2)`, entonces `I = i` y `Δφ = π/2`.

La coherencia se puede estimar como:

```text
γ = |⟨I⟩| / sqrt(⟨|z1|²⟩ · ⟨|z2|²⟩)
```

con `0 ≤ γ ≤ 1`. Es una magnitud; no tiene unidades.

## 11. Fase y distancia

```text
|ΔR| = λ · |Δφ| / (4π)
```

| Variable | Unidad | Significado |
|---|---|---|
| `ΔR` | m | Diferencia de camino en LOS. |
| `λ` | m | Longitud de onda. |
| `Δφ` | rad | Fase desenvuelta. |

**Supuestos:** radar monostático, fase desenvuelta, sin contribuciones de atmósfera, ionósfera,
terreno u órbita.

**Ejemplo:** L-band `λ = 0,24 m`, `Δφ = 2π` → `|ΔR| = 0,12 m = 12 cm`.

**Convención de signo:** la fórmula usa valor absoluto. Para saber si se acerca o se aleja, hay
que fijar la convención de fase y el orden de las fechas. Ver
[`insar-gunw-goff.md`](insar-gunw-goff.md) §3.

## 12. Desplazamiento LOS

```text
d_LOS = u · l
```

| Variable | Unidad | Significado |
|---|---|---|
| `u` | m | Vector 3D de desplazamiento. |
| `l` | adimensional | Vector unitario hacia el satélite. |
| `d_LOS` | m | Componente medida. |

**Supuesto:** `l` corresponde a la geometría de la órbita y al ángulo de incidencia local.

**Ejemplo:** si el movimiento es solo vertical y `θ = 30°`, `d_LOS = d_v·cos(30°) ≈ 0,866·d_v`.
Por eso `d_v = d_LOS / cos(θ)`. Si hay movimiento horizontal, esa división es incorrecta.

## 13. Media, anomalía y z-score

```text
media = Σx / n
anomalía = x − media_ref
z = (x − media_ref) / σ
```

| Variable | Unidad | Significado |
|---|---|---|
| `x` | unidad de la variable | Valor observado. |
| `media_ref` | misma unidad | Media de referencia. |
| `σ` | misma unidad | Desviación estándar de referencia. |
| `z` | adimensional | Cuántas desviaciones estándar. |

**Supuestos:** la referencia es comparable (misma estación, misma época, misma fuente) y `σ > 0`.

**Ejemplo:** lluvia de 30 días `x = 120 mm`, media histórica `80 mm`, `σ = 20 mm` →
`anomalía = +40 mm`, `z = 2`. No significa “probabilidad 97,7 %”; solo que está a 2σ si el
modelo de distribución es razonable.

## 14. Porcentaje de píxeles cambiados

```text
porcentaje = 100 · cambiados / comparables
```

| Variable | Unidad | Significado |
|---|---|---|
| `cambiados` | píxeles | Píxeles que superan el umbral. |
| `comparables` | píxeles | Píxeles válidos y no excluidos. |
| `porcentaje` | % | Fracción de píxeles, no de área. |

**Ejemplo:** 1.300 píxeles cambiados de 10.000 comparables → `13 %`.

**Advertencia:** esta fórmula **no calcula superficie dañada**. El denominador son píxeles
comparables, no el área del humedal ni del país. Convertir el porcentaje a km² sin una
clasificación validada es inventar una medición.

## 15. Retrodispersión en dB

```text
γ0_dB = 10 · log10(γ0)
```

**Supuesto:** `γ0 > 0`. Si el producto trae valores negativos o cero, no pasarlos a dB sin
entender por qué.

**Ejemplo:** `γ0 = 0,04` → `10·log10(0,04) ≈ −14 dB`.

## 16. Área del rectángulo de estudio

```text
A_bbox ≈ (E − W) · 111,32 · cos(lat_media) · (N − S) · 110,57
```

| Variable | Unidad | Significado |
|---|---|---|
| `W`, `E` | grados | Longitud oeste y este. |
| `S`, `N` | grados | Latitud sur y norte. |
| `lat_media` | grados | Latitud media del rectángulo. |
| `A_bbox` | km² | Área aproximada. |

**Supuestos:** área pequeña, Tierra esférica, sin corrección por elipsoide.

**Ejemplo:** el rectángulo de Palo Verde (`[-85,62, 10,08, -85,02, 10,62]`) da ~3.900 km². Ese
número es el área del **rectángulo**, no la superficie del humedal ni el área afectada.

## 17. Qué fórmula **no** usar para afirmar daño

No existe una fórmula que convierta directamente:

```text
píxeles cambiados → km² de daño → personas afectadas
```

Para eso hacen falta:

- una clasificación validada de “daño”;
- una máscara de exposición (edificios, cultivos, caminos);
- una fuente oficial de evaluación;
- una estimación de incertidumbre.

Sin eso, el máximo rigor es decir: “X % de los píxeles comparables de esta vista previa superó
este umbral de brillo; no es área de daño”.

## Referencias

- ASF · GCOV: <https://nisar-docs.asf.alaska.edu/gcov/>
- ASF · GUNW: <https://nisar-docs.asf.alaska.edu/gunw/>
- NASA Earthdata · SAR basics: <https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar>
