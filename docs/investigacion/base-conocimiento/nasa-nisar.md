# NISAR: misión, órbita y disponibilidad de datos

> **Fuentes principales:** NASA Science · NISAR Data User Guide (ASF) · verificación
> **15/11/2026**. Los datos de disponibilidad cambian: al final hay cómo comprobarlos hoy.

## 1. Ficha de la misión

| Característica | Valor | Evidencia |
|---|---|---|
| Misión | NASA–ISRO Synthetic Aperture Radar (NISAR) | **Oficial** |
| Organizaciones | NASA (L-band) e ISRO (S-band) | **Oficial** |
| Lanzamiento | 30 de julio de 2025, Satish Dhawan (GSLV-F16) | **Oficial** |
| Órbita | Casi polar, heliosincrónica | **Oficial** |
| Altitud nominal | 747 km | **Oficial** |
| Inclinación | 98,4° | **Oficial** |
| Ciclo repetitivo exacto | 12 días | **Oficial** |
| Revisita promedio | ~6 días (ascendente + descendente) | **Oficial** |
| Cruce nodal | 6:00 ascendente / 18:00 descendente | **Oficial** |
| Dirección de mirada | Izquierda (sur); deja un hueco cerca del polo norte | **Oficial** |
| Ancho de franja L | ~242 km (>240 km nominal) | **Oficial** |
| Reflector | 12 m de diámetro | **Oficial** (NASA/ISRO) |
| Longitud de onda L | 24 cm | **Oficial** |
| Frecuencia L | ~1,22–1,26 GHz (nominal ~1,25 GHz) | **Oficial** (tabla de ASF) |
| Longitud de onda S | 9,4 cm según NASA; 9,3 cm según la guía ASF | **Oficial** (discrepancia menor) |
| Frecuencia S | ~3,19 GHz (implícita en 9,4 cm) | **Ejemplo** (cálculo) |
| Duración base | 3 años de ciencia | **Oficial** |
| Distribución L | ASF DAAC (NASA Earthdata) | **Oficial** |
| Distribución S | ISRO / Bhoonidhi | **Oficial** |

Notas:

- **No hay una única frecuencia L.** La guía ASF publica frecuencias centrales de
  **1221,5 a 1257,5 MHz** según el ancho de banda. Decir “~1,25 GHz” es una aproximación útil,
  no un valor único de todos los productos.
- **S-band:** 9,4 cm es el valor de la ficha de misión de NASA; la guía ASF usa 9,3 cm. La
  diferencia no cambia ninguna conclusión del proyecto, pero conviene citar la fuente al usar
  el número. 9,4 cm equivale a ~3,19 GHz.
- **Resolución:** la ficha de misión resume 3–10 m; la guía ASF distingue ~7 m en azimuth y
  2–8 m en rango según el modo. No prometer una resolución única.

## 2. Ciclo, revisita, adquisición y publicación

Son cosas distintas. Confundirlas produce frases falsas como “NISAR pasa cada 6 días por este
punto, entonces hay una imagen nueva cada 6 días”.

| Concepto | Qué significa | Qué no garantiza |
|---|---|---|
| **Ciclo de repetición** | La órbita vuelve a la misma traza cada 12 días. | Que el radar haya encendido en ese cuadro. |
| **Revisita** | Promedio ~6 días al combinar pasadas ascendentes y descendentes. | Cobertura de un punto concreto ni pares útiles. |
| **Adquisición** | El instrumento tomó datos en una fecha y cuadro. | Que el producto ya exista o esté publicado. |
| **Disponibilidad** | El producto está en el catálogo y se puede descargar. | Que sea la versión más madura. |
| **Latencia** | Tiempo entre adquisición y publicación. | Un valor único: depende del producto y del centro de procesamiento. |
| **Fecha de publicación** | Cuándo se liberó una colección o un gránulo. | La fecha de la observación. |
| **Madurez** | BETA, PROVISIONAL o VALIDATED. | Que nuestra interpretación sea correcta. |

En el proyecto, `data/nisar.json` guarda `date` (adquisición) y `generatedAt` (cuándo se
generó el manifiesto). `generatedAt` **no** es una fecha de observación.

## 3. Etapas de madurez

| Etapa | Qué significa | Qué permite | Qué no permite |
|---|---|---|---|
| **BETA** | Productos de las primeras liberaciones; no calibrados del todo. | Probar flujos y formatos. | Análisis cuantitativo fino. |
| **PROVISIONAL** | Calibrados y validados en sitios limitados; procesamiento en mejora. | Análisis exploratorio y comparaciones con cautela. | Suponer que dos provisionales son homogéneos entre fechas. |
| **VALIDATED** | Calibrados y validados por la misión. | Uso científico con supuestos documentados. | Validar automáticamente **nuestra** interpretación. |

La colección validada de GCOV se llama `NISAR_L2_GCOV_V1`; la provisional,
`NISAR_L2_GCOV_PROVISIONAL_V1`. La validada **no** lleva la palabra `VALIDATED` en el nombre,
justamente porque su ausencia indica madurez plena. El código del proyecto usa esas dos
colecciones en [`web/lib/nisar-remote.ts`](../../../web/lib/nisar-remote.ts).

## 4. Cronología verificada (2025–2027)

| Fecha | Hecho | Evidencia |
|---|---|---|
| 2025-07-30 | Lanzamiento. | **Oficial** |
| 2025-08 en adelante | Adquisición L-band continua sobre casi todas las tierras emergidas. | **Oficial** |
| 2026-01-23 | Primera liberación: 25 productos de muestra, previos a calibración. | **Oficial** |
| 2026-01 | Inicio de la fase de operaciones científicas (“early January 2026”). | **Oficial** |
| 2026-02-27 | Liberación BETA: >100.000 productos L1–L3, >500 TB, adquiridos entre 2025-10-17 y 2026-01-20. | **Oficial** |
| 2026-06-17 | Primeras adquisiciones incluidas en la colección PROVISIONAL. | **Oficial** |
| 2026-07-20 | Liberación PROVISIONAL (L0–L3), CRID P05023. | **Oficial** |
| 2026-07-27 22:03:25 UTC → 2026-08-10 00:55:27 UTC | Hueco permanente de datos del instrumento. | **Oficial** |
| 2026-10-21 | Primeras adquisiciones incluidas en la colección VALIDATED. | **Oficial** |
| 2026-10-23 (parte del día) | Fin de la ventana PROVISIONAL; la colección validada ya había empezado el 21/10. | **Oficial** |
| 2026-11-06 | Liberación VALIDATED L0–L2, CRID P05036. | **Oficial** |
| 2026-11 | SME2 seguía sin colección VALIDATED; se seguía validando con GCOV. | **Oficial** |
| 2027 | Reprocesamiento de la adquisición anterior al 2026-10-21; SME2 validado cuando haya serie suficiente. | **Oficial** |

Corrección al resumen histórico que circuló por el equipo: los productos PROVISIONAL **no**
salieron “desde junio de 2026”. La liberación fue el **20 de julio de 2026**; junio es la fecha
de las **adquisiciones** incluidas. Es la misma diferencia entre adquisición y publicación de
la §2.

## 5. Cómo se lee un nombre de gránulo GCOV

Ejemplo real del proyecto:

```text
NISAR_L2_PR_GCOV_034_170_D_083_4005_DHDH_A_20261105T000908_20261105T000942_P05036_N_F_J_001
```

| Campo | Ejemplo | Significado |
|---|---|---|
| Misión | `NISAR` | Misión. |
| Instrumento y nivel | `L2` | L-band, nivel 2. |
| Tipo de procesamiento | `PR` | Producción (también `UR` urgente, `OD` a pedido). |
| Producto | `GCOV` | Covarianza geocodificada. |
| Ciclo | `034` | Ciclo de 12 días **de esa pista**; no es un contador global. |
| Órbita relativa | `170` | Pista dentro del ciclo (001–173). |
| Dirección | `D` | Descendente (`A` ascendente). |
| Cuadro | `083` | Frame de la pista (001–176). |
| Modo | `4005` | Ancho de banda primario 40 MHz + secundario 05 MHz. |
| Polarización | `DHDH` | HH + HV en la banda primaria y lo mismo en la secundaria. |
| Fuente | `A` | Adquisición simple. |
| Inicio / fin | `20261105T000908` / `…000942` | UTC, formato `YYYYMMDDTHHMMSS`. |
| CRID | `P05036` | Versión del software de procesamiento. |
| Época orbital | `N` | Efemérides casi en tiempo real (`P` precisa, `M` media, `F` pronóstico). |
| Cobertura | `F` | Cuadro completo (`P` parcial). |
| Centro | `J` | JPL. |
| Contador | `001` | Contador del producto. |

Dos advertencias:

- El **ciclo no es global**: el mismo día puede ser ciclo 34 en la pista 170 y 35 en la 004.
  No usarlo como “día N de la misión” en la interfaz.
- `N` en la época orbital **no** significa “no validado”. La madurez la decide la colección
  (`…_PROVISIONAL_V1` o `NISAR_L2_GCOV_V1`), no ese carácter.

## 6. Qué cambia y qué no

- **No cambia** la geometría básica: 12 días, ~6 días de revisita, ~242 km de franja, órbita
  de 747 km.
- **Sí cambia** la disponibilidad: colecciones, CRID, productos validados, huecos, política de
  distribución. Cualquier afirmación de estado debe llevar fecha.
- **No se debe convertir una fecha histórica en estado permanente**. “SME2 está provisional”
  era cierto en noviembre de 2026; puede dejar de serlo en 2027.

## 7. Cómo verificar el estado hoy

1. **Disponibilidad y madurez:** <https://nisar-docs.asf.alaska.edu/availability-overview/>
2. **Productos y espaciados:** <https://nisar-docs.asf.alaska.edu/products-overview/>
3. **Catálogo de gránulos:** CMR, colecciones `NISAR_L2_GCOV_V1` y
   `NISAR_L2_GCOV_PROVISIONAL_V1`.
4. **Búsqueda y descarga:** Vertex / ASF Search (<https://search.asf.alaska.edu/>) o
   <https://api.daac.asf.alaska.edu/services/search/param>.
5. **Cambios de CRID:** página de CRID de NASA Earthdata, enlazada desde la guía de
   disponibilidad.

## 8. Lo que esta ficha no afirma

- No afirma que exista una pasada de NISAR sobre Costa Rica en una fecha concreta. Eso se
  consulta en CMR.
- No afirma una latencia de publicación uniforme. La guía consultada no publica un SLA único.
- No afirma que “validado” signifique que un mapa de cambio del proyecto esté validado.

## Referencias

- NASA · NISAR: <https://science.nasa.gov/mission/nisar/>
- NASA · Mission overview: <https://science.nasa.gov/mission/nisar/mission-overview/>
- NASA · SweepSAR: <https://science.nasa.gov/mission/nisar/sweepsar/>
- ASF · About NISAR: <https://nisar-docs.asf.alaska.edu/nisar-intro>
- ASF · Available data: <https://nisar-docs.asf.alaska.edu/availability-overview/>
- ASF · Products: <https://nisar-docs.asf.alaska.edu/products-overview/>
- ASF · GCOV: <https://nisar-docs.asf.alaska.edu/gcov/>
