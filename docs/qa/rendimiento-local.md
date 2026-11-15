# Rendimiento: comparación local vs producción

> **Método:** Playwright (Chromium headless), mismo equipo, misma ventana 1280×900, carga
> inicial de `/` con 7 s de observación. Métricas tomadas con `PerformanceObserver` en la
> página: LCP, CLS, tareas largas y TBT aproximado (suma de tareas >50 ms menos 50 ms).
> **No es PageSpeed Insights.** No hay throttling de red ni CPU, y no hay datos de campo.

## Comparación

| Métrica | Producción (código anterior) | Local (develop) | Cambio |
|---|---|---|---|
| LCP | 8.220 ms | 6.144 ms | −25 % |
| CLS | 0,074 | 0,018 | −76 % |
| Tareas largas | 18 | 16 | −2 |
| TBT aproximado | 6.471 ms | 4.153 ms | −36 % |
| Peso transferido | 665 KB | 446 KB | −219 KB (−33 %) |

## Cómo leerlo sin engañarse

- **La red no es comparable.** Producción viaja por internet y local por loopback: parte de la
  mejora de LCP es latencia, no código. El peso transferido y el CLS sí son del código.
- **TBT sigue alto en ambos** porque este equipo renderiza WebGL por software; las advertencias
  de `GPU stall due to ReadPixels` aparecen incluso en el código anterior. Un móvil real y
  PageSpeed darán otros números.
- **Una sola corrida no es una distribución.** Sirve como indicio, no como certificado.
- La medición de PageSpeed sobre el preview sigue pendiente por el bloqueo de acceso de Vercel.

## Qué explica la diferencia

- El estudio de superficie ya no se precarga desde cada enlace del historial.
- Caché de imágenes SAR acotada y liberada, con reintentos.
- `pixelRatio` limitado y menos actualizaciones redundantes del mapa.
- La geolocalización ya no se dispara al montar: el mapa y las tarjetas pintan antes.

## Siguiente medición (cuando haya acceso)

1. PageSpeed móvil y escritorio sobre el preview de `develop`, dos veces.
2. Comparar TBT y LCP contra 2.280 ms y 2,9 s de la línea base.
3. Verificar en un dispositivo real que el mapa no bloquee la interacción.
