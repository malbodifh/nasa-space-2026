# Datos meteorológicos y geofísicos

> **Idea clave:** una observación, una estimación, un pronóstico, un modelo y una alerta oficial
> no son lo mismo. La app debe decir cuál está mostrando.
> **Fuentes:** documentación oficial consultada el **15/11/2026**; pruebas del equipo
> **14/11/2026**.

## 1. Taxonomía de datos

| Tipo | Qué es | Ejemplo | Qué se puede decir |
|---|---|---|---|
| **Observación** | Medición directa de un sensor. | Retrodispersión radar de NISAR. | “El sensor midió X”. |
| **Estimación** | Producto derivado de observaciones con un algoritmo. | IMERG (lluvia), SMAP (humedad). | “El algoritmo estima X, con incertidumbre”. |
| **Reanálisis** | Observaciones asimiladas en un modelo consistente. | POWER/MERRA-2. | “La climatología indica X”. |
| **Pronóstico** | Predicción hacia el futuro. | Open-Meteo. | “El modelo pronostica X”. |
| **Modelo** | Simulación de un proceso. | LHASA, GloFAS. | “El modelo estima susceptibilidad”. |
| **Alerta oficial** | Aviso de una autoridad. | NHC, PTWC, CNE. | “La autoridad emitió X”. |

## 2. GPM / IMERG

| Campo | Valor |
|---|---|
| Qué es | Estimación multisatelital de precipitación. |
| Resolución espacial | ~0,1°. |
| Resolución temporal | 30 minutos; también diaria y mensual. |
| Variables | Tasa (mm/h) y acumulados (mm). |
| Cobertura | Global; la IR cubre 60°N–60°S, las microondas amplían. |
| Latencia | **Early ~4 h**, **Late ~12–14 h**, **Final ~3,5 meses**. |
| Formatos | HDF, GeoTIFF, NetCDF. |
| Acceso | PPS/GES DISC con Earthdata; GIBS para visual. |
| Uso en el proyecto | **No integrado directamente**. La capa GIBS está documentada, pero no se usa. |
| Limitación | Early llega tarde para flash floods; la lluvia no confirma inundación. |

**Ejemplo:** si un evento ocurrió a las 14:00 y solo hay IMERG Early, a las 18:00 puede haber una
primera estimación. Para un aviso de crecida repentina, eso es demasiado tarde.

## 3. NASA POWER

| Campo | Valor |
|---|---|
| Qué es | Reanálisis y climatología (MERRA-2). |
| Resolución espacial | ~0,5°. |
| Resolución temporal | Horaria, diaria, mensual, climatología. |
| Variables usadas | `PRECTOTCORR`, `T2M_MAX`, `RH2M`, `WS2M`. Otras disponibles: `T2M`, `T2M_MIN`, `GWETTOP`, `GWETROOT`, `EVPTRNS`. |
| Unidades | Según variable; la app usa mm, °C, m/s y %. Verificar la unidad en la respuesta. |
| Latencia | ~2–3 días; el último dato puede ser `-999`. |
| Cobertura | Global terrestre. |
| Uso en el proyecto | **Integrado** en `/api/assess` y `/api/alerts` para climatología y score de fuego. |
| Limitación | No es pronóstico; no resuelve extremos locales; `-999` es relleno. |

`PRECTOTCORR` es precipitación corregida; no es un pluviómetro. Los percentiles se calculan
contra la serie histórica, no contra “lo normal” de un libro.

## 4. NASA GFWED

| Campo | Valor |
|---|---|
| Qué es | Fire Weather Index del sistema canadiense, calculado con MERRA-2/GEOS-5. |
| Variables | `FFMC`, `DMC`, `DC`, `ISI`, `BUI`, `FWI`. Nombres a verificar en el NetCDF antes de codificar. |
| Unidades | Índices adimensionales. |
| Resolución espacial | GEOS-5 ~0,25°; MERRA-2 ~0,5°. |
| Resolución temporal | Diaria. |
| Latencia | GEOS-5 ~12 h; MERRA-2 ~2 meses. |
| Formato | NetCDF (~17 MB/día). |
| Acceso | NCCS, sin clave. |
| Uso en el proyecto | **No integrado**. |
| Limitación | **No son incendios confirmados**: son condiciones de peligro. |

| Variable | Nombre | Qué representa |
|---|---|---|
| `FFMC` | Fine Fuel Moisture Code | Humedad de combustibles finos; afecta la ignición. |
| `DMC` | Duff Moisture Code | Humedad de la capa orgánica media. |
| `DC` | Drought Code | Sequía profunda del suelo. |
| `ISI` | Initial Spread Index | Velocidad inicial de propagación. |
| `BUI` | Buildup Index | Combustible disponible para arder. |
| `FWI` | Fire Weather Index | Índice compuesto de peligro. |

Un FWI alto no significa que haya fuego; significa que, si se enciende, las condiciones favorecen
la propagación.

## 5. NASA SMAP

| Campo | Valor |
|---|---|
| Qué es | Humedad del suelo por radiometría pasiva y radar. |
| Variables | Humedad superficial; productos asimilados de raíz. |
| Unidades | m³/m³ (fracción volumétrica), según producto. |
| Resolución | Decenas de km en pasivo; productos L4 más finos. Verificar por producto. |
| Latencia | Días. |
| Formatos | HDF5, GeoTIFF (GIBS). |
| Acceso | NSIDC/GES DISC con Earthdata; GIBS sin clave. |
| Uso en el proyecto | **No integrado**. |
| Limitación | No es una medición de campo; la vegetación densa y el hielo complican la estimación. |

## 6. NASA LHASA

| Campo | Valor |
|---|---|
| Qué es | Modelo de amenaza de deslizamiento que combina lluvia, susceptibilidad y sismicidad. |
| Resolución | ~1 km. |
| Cobertura | 60°N–60°S. |
| Latencia | ~5 h. |
| Formato | GeoTIFF/NetCDF; ~146 MB/día. |
| Acceso | NCCS, sin clave para NRT. |
| Uso en el proyecto | **No integrado**; no es viable en runtime. |
| Limitación | Es un modelo, no una alerta oficial ni una confirmación. |

## 7. Comparación rápida

| Fuente | Tipo | Resolución | Latencia | ¿Sirve para…? |
|---|---|---|---|---|
| IMERG Early | Estimación | 0,1° / 30 min | ~4 h | Acumulados; no flash flood. |
| POWER | Reanálisis | ~0,5° / día | 2–3 días | Climatología y anomalías. |
| GFWED | Modelo | 0,25° / día | ~12 h | Peligro de incendio. |
| SMAP | Estimación | decenas de km | días | Humedad del suelo. |
| LHASA | Modelo | ~1 km | ~5 h | Susceptibilidad de deslizamiento. |
| Open-Meteo | Pronóstico | punto / hora | horas | Lluvia próxima; no aviso oficial. |

## 8. Errores de interpretación

1. **“Lluvia intensa = inundación.”** La inundación depende del suelo, la cuenca, el drenaje y la
   duración; la lluvia es solo un factor.
2. **“FWI alto = incendio.”** Es peligro, no detección.
3. **“SMAP dice que el suelo está húmedo, entonces no hay riesgo de fuego.”** La humedad
   superficial no es la humedad de los combustibles vivos.
4. **“IMERG es un pluviómetro.”** Es una estimación satelital con error.
5. **“POWER es el clima de hoy.”** Es reanálisis, con latencia y resolución gruesa.
6. **“LHASA es una alerta.”** Es un modelo de susceptibilidad.

## Referencias

- GPM/IMERG: <https://gpm.nasa.gov/data/imerg>
- POWER: <https://power.larc.nasa.gov/docs/services/api/>
- GFWED: <https://data.giss.nasa.gov/impacts/gfwed/>
- SMAP: <https://smap.jpl.nasa.gov/>
- LHASA: <https://gpm.nasa.gov/landslides/>
- Open-Meteo: <https://open-meteo.com/>
