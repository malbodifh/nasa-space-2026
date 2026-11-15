# Desastres naturales: qué dato sirve para qué

> **Alcance del proyecto:** alerta temprana **informativa** para Costa Rica, multi-amenaza
> observacional. NISAR aporta una capa de cambio de superficie, **no** un feed de alertas.
> **Inventario científico amplio:** [`../desastres.md`](../desastres.md).
> **Reglas de la app:** [`../../producto/alertas.md`](../../producto/alertas.md).

## 1. Matriz amenaza → dato → límite

| Amenaza | Observación / alerta | Dato NASA útil | Papel de NISAR | Qué **no** se puede concluir |
|---|---|---|---|---|
| **Incendio** | FIRMS (focos), EONET, GDACS | FIRMS, GIBS (histórico), GFWED (peligro), GCOV (cicatriz) | Cambio de retrodispersión en la vegetación quemada. | Un foco no es un perímetro; un cambio de brillo no es un área quemada. |
| **Inundación** | GDACS, EONET, lluvia Open-Meteo | IMERG (lluvia), SMAP (suelo), GCOV | Agua abierta suele oscurecer; vegetación inundada puede dar doble rebote. | Un píxel oscuro no confirma agua; la lluvia no confirma inundación. |
| **Deslizamiento** | EONET, GDACS | LHASA (susceptibilidad), IMERG, GCOV/GUNW | Cambio de superficie y, con GUNW, movimiento LOS. | No es predicción ni alerta oficial; la coherencia baja no prueba daño. |
| **Sismo** | USGS, OVSICORI, RSN | GUNW (deformación cosísmica), GCOV | Medir desplazamiento del suelo después del evento. | No es alerta temprana; no predice sismos. |
| **Volcán** | EONET, GVP, GDACS | GUNW (inflación/deflación), GCOV | Cambios de fase y de superficie en el cono. | No predice erupciones; la deformación no siempre es magmática. |
| **Tsunami** | PTWC/NTWC, SINAMOT | — | Ninguno directo. | NISAR no detecta tsunamis. |
| **Ciclón / tormenta** | NHC, GDACS | IMERG, GIBS, GCOV | Evaluar cambios costeros o de vegetación después del paso. | No es pronóstico de trayectoria; el cono es del NHC. |
| **Sequía** | GDACS, EONET | POWER, SMAP, GCOV | Estrés de vegetación en series largas. | No es una alerta repentina; la señal es lenta y ambigua. |

## 2. Qué muestra la app hoy

| Elemento | Comportamiento | Evidencia |
|---|---|---|
| Alertas activas | 8 fuentes: USGS, OVSICORI, RSN, PTWC, NHC, Open-Meteo, GDACS, EONET. | **Código local** (`overlays.ts`, `feeds.ts`, `seismic.ts`). |
| Incendios | FIRMS conectado pero **oculto** (`SHOW_FIRES=false`). | **Código local**. |
| Radar | 4 zonas precalculadas + estudio para puntos con pasadas. | **Código local** (`sar.ts`, `SurfaceStudy.tsx`). |
| Score | Solo condiciones de incendio (GIBS + POWER). | **Código local** (`risk.ts`). |
| Radios | Estimaciones de proximidad, no polígonos oficiales. | **Código local** (`alert-rules.ts`, `hazard-style.ts`). |
| Estado de fuentes | `meta.sources` con ok/fallback; OVSICORI desactualizado >12 h. | **Código local**. |

La app **no** genera un score para inundación, deslizamiento, sismo, volcán o tsunami. Muestra el
evento, la fuente, la hora y, si está en curso, un radio de proximidad estimado.

## 3. NISAR no es un sistema de alerta temprana

Razones:

1. **No es en tiempo real.** Los productos estándar se procesan y publican después de la
   adquisición; la latencia no es de segundos.
2. **No todos los días hay pasada.** El ciclo es de 12 días y la revisita promedio de ~6 días,
   pero eso no garantiza una adquisición sobre un punto.
3. **El cambio de brillo no identifica la causa.** Puede ser inundación, humedad, cosecha, obra o
   procesamiento.
4. **La comparación requiere la misma geometría.** Mezclar órbitas o modos produce artefactos.
5. **La validación es posterior.** Un mapa de cambio es una hipótesis, no una confirmación.

Por eso la app lo presenta como **capa informativa** y no como alerta.

## 4. Alertas oficiales vs información

| Frase correcta | Frase incorrecta |
|---|---|
| “Según NASA, la vista previa muestra un cambio de brillo”. | “NASA detectó una inundación”. |
| “El NHC emitió un aviso para…”. | “La app predice que el huracán llegará a…”. |
| “El modelo Open-Meteo pronostica 60 mm”. | “El IMN advierte 60 mm”. |
| “GDACS reporta alerta naranja”. | “La app declara alerta naranja”. |
| “El cambio es compatible con agua; no lo confirma”. | “Hay 13 % de área inundada”. |
| “El GUNW muestra desplazamiento LOS”. | “El volcán se levantó 3 cm”. |

## 5. Costa Rica: contexto de fuentes

| Fuente | Papel | Integración |
|---|---|---|
| **CNE** | Autoridad nacional de emergencias. | Solo enlace; sin API ni scraping (Turnstile). |
| **IMN** | Meteorología oficial. | Solo enlace; sin API. |
| **OVSICORI** | Sismicidad y volcanes. | Integrada (sismos). |
| **RSN** | Sismos sentidos. | Integrada (RSS). |
| **SINAMOT** | Tsunamis. | Solo referencia; no integrada. |

La app **no reemplaza** a CNE, 911, IMN, OVSICORI ni SINAMOT. Ante una emergencia, manda la
autoridad.

## 6. Preguntas que la app puede responder

- ¿Qué eventos abiertos hay cerca de mi ubicación?
- ¿Cuándo ocurrió y cuál es la fuente?
- ¿Hay una pasada de NISAR antes y después del evento?
- ¿La vista previa muestra más brillo u oscuridad?
- ¿Qué hipótesis físicas son compatibles con ese patrón?
- ¿Qué no se puede concluir con este dato?

## 7. Preguntas que la app **no** puede responder

- ¿Cuántos km² se inundaron?
- ¿Cuántas casas se dañaron?
- ¿Va a erupcionar el volcán mañana?
- ¿Cuál es la probabilidad de un tsunami?
- ¿El cambio de brillo fue por deforestación o por sequía?
- ¿El sismo va a tener réplicas?

Para esas preguntas hacen falta datos de campo, modelos oficiales o autoridades.

## Referencias

- Inventario científico: [`../desastres.md`](../desastres.md)
- Reglas de alerta: [`../../producto/alertas.md`](../../producto/alertas.md)
- Límites del producto: [`../../producto/limites.md`](../../producto/limites.md)
- EONET: <https://eonet.gsfc.nasa.gov/docs/v3>
- GDACS: <https://www.gdacs.org/>
- USGS: <https://earthquake.usgs.gov/>
- NHC: <https://www.nhc.noaa.gov/>
- PTWC/NTWC: <https://www.tsunami.gov/>
