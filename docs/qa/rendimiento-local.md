# Rendimiento: comparación local vs producción

> **Método A (Lighthouse 12.8.2, móvil simulado).** Mismo equipo, mismo Chromium
> (Playwright 1254), CPU y red simuladas a 4× / 1,6 Mbps como en PageSpeed, arranque en frío
> de `/`. Usa Lighthouse, como PageSpeed Insights, pero compara producción remota con
> loopback local: no aísla el efecto del código ni reproduce la infraestructura de Google.

## Lighthouse móvil (mismo equipo, misma herramienta)

| Métrica | Producción (código anterior) | `develop` | Cambio |
|---|---|---|---|
| Puntaje de rendimiento | 35 | **39** | +4 |
| FCP | 1,2 s | 1,2 s | igual |
| LCP | 15,5 s | **5,9 s** | −62 % |
| CLS | 0,024 | 0,022 | −8 % |
| TBT | 27.960 ms | 26.090 ms | −7 % |

Antes de aplazar el mapa, la misma medición daba LCP 8,7 s y puntaje 36. El aplazamiento del
mapa hasta el primer hueco libre del navegador bajó el LCP a 5,9 s.

## Método B (Playwright, sin throttling)

Carga inicial de `/` en 1280×900 con 7 s de observación y `PerformanceObserver` en la página:
LCP, CLS, tareas largas y TBT aproximado (tareas >50 ms menos 50 ms).

| Métrica | Producción | `develop` | Cambio |
|---|---|---|---|
| LCP | 8.220 ms | 6.144 ms | −25 % |
| CLS | 0,074 | 0,018 | −76 % |
| Tareas largas | 18 | 16 | −2 |
| TBT aproximado | 6.471 ms | 4.153 ms | −36 % |
| Peso transferido | 665 KB | 446 KB | −219 KB (−33 %) |

## Cómo leerlo sin engañarse

- **Ninguna de las dos es PageSpeed Insights.** PageSpeed corre en la infraestructura de Google
  y agrega datos de campo; el número oficial de producción (57 móvil, TBT 2.280 ms) no se
  reproduce acá. Las diferencias son observaciones de esas corridas, no una mejora garantizada.
- **El TBT sigue alto en ambas.** Se usó `--disable-gpu` y aparecieron advertencias
  `GPU stall due to ReadPixels`; el entorno puede influir. No se aisló cuánto tiempo corresponde
  a WebGL, hidratación u otro trabajo, ni se midió en un celular real.
- **La red no es comparable en el método B.** Producción viaja por internet y local por
  loopback. La simulación del método A tampoco elimina todas las diferencias de servidor y red.
- **Una sola corrida no es una distribución.** Sirve como indicio, no como certificado.

## Qué explica la diferencia

- El mapa (cerca de 1 MB de JavaScript) se pide después del primer pintado, no durante la
  hidratación: el texto de la portada pinta antes.
- El estudio de superficie ya no se precarga desde cada enlace del historial.
- Caché de imágenes SAR acotada y liberada, con reintentos.
- `pixelRatio` limitado y menos actualizaciones redundantes del mapa.
- La geolocalización ya no se dispara al montar: el mapa y las tarjetas pintan antes.

## Siguiente medición (cuando haya acceso)

1. PageSpeed móvil y escritorio sobre el preview de `develop`, dos veces.
2. Comparar contra 2.280 ms de TBT y 2,9 s de LCP de la línea base de producción.
3. Verificar en un dispositivo real que el mapa no bloquee la interacción.
