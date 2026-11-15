# Base de conocimiento: NISAR, SAR y datos NASA

> **Estado:** referencia viva · verificación inicial **15/11/2026**.
> **No reemplaza** [`../../producto/nisar.md`](../../producto/nisar.md) (cómo funciona la app hoy)
> ni [`../../tecnico/fuentes.md`](../../tecnico/fuentes.md) (qué fuente usa la app hoy).
> Esta carpeta explica **de dónde vienen los datos, qué significan y qué no se puede afirmar**.

## Para qué sirve

Reunir en un solo lugar la ciencia de NISAR, los fundamentos del radar, los productos, las API,
los formatos y los límites, para que la siguiente persona no tenga que reconstruir el contexto.

Está escrita para alguien con conocimientos básicos de programación, no para especialistas en
geofísica. Cada concepto trae una explicación simple, una técnica y un ejemplo del proyecto.

## Cómo leer según la pregunta

| Quiero… | Leer |
|---|---|
| Entender qué es NISAR y en qué estado están sus datos | [`nasa-nisar.md`](nasa-nisar.md) |
| Entender qué es un radar y qué significan HH, HV, dB o coherencia | [`fundamentos-sar.md`](fundamentos-sar.md) |
| Elegir un producto NISAR | [`productos-nisar.md`](productos-nisar.md) |
| Entender GCOV a fondo | [`gcov.md`](gcov.md) |
| Entender GUNW, GOFF e interferometría | [`insar-gunw-goff.md`](insar-gunw-goff.md) |
| Consultar una API NASA | [`apis-nasa.md`](apis-nasa.md) |
| Consultar una fuente externa (USGS, GDACS, OSM…) | [`apis-externas.md`](apis-externas.md) |
| Entender lluvia, suelo y clima de fuego | [`datos-meteorologicos.md`](datos-meteorologicos.md) |
| Ver qué dato sirve para cada desastre | [`desastres-naturales.md`](desastres-naturales.md) |
| Usar o revisar una fórmula | [`formulas-y-calculos.md`](formulas-y-calculos.md) |
| Entender HDF5, GeoTIFF, GeoJSON o EPSG | [`formatos-geoespaciales.md`](formatos-geoespaciales.md) |
| Ver el flujo real de datos del proyecto | [`arquitectura-de-datos.md`](arquitectura-de-datos.md) |
| Ver los valores vigentes del código | [`fuentes-del-proyecto.md`](fuentes-del-proyecto.md) |
| Saber qué no se puede concluir | [`limitaciones-cientificas.md`](limitaciones-cientificas.md) |
| Buscar ideas para después | [`oportunidades-de-mejora.md`](oportunidades-de-mejora.md) |
| Ver todas las fuentes citadas | [`referencias.md`](referencias.md) |

## Regla de evidencia

Cada afirmación importante se clasifica con una de estas etiquetas:

| Etiqueta | Significa |
|---|---|
| **Oficial** | Documentación de NASA, ASF, ISRO o el proveedor, consultada y enlazada. |
| **Código local** | Valor leído directamente de `web/` en este repositorio. |
| **Auditoría** | Verificación hecha por el equipo el 14–15/11/2026 y registrada en `docs/qa/`. |
| **Ejemplo** | Cuenta matemática o escenario ilustrativo; no es un dato observado. |
| **Hipótesis** | Explicación posible, todavía sin validar. |
| **Propuesta** | Idea para el futuro; **no está implementada**. |
| **Sin verificar** | Dato de una fuente secundaria o que no se pudo comprobar en esta sesión. |

Si una fuente no responde, no se completa con una suposición: se dice que no hay dato.

## Distinción de estados en la app

| Estado | Significa |
|---|---|
| **Activo** | Se ejecuta en la app actual. |
| **Oculto** | El código existe, pero una bandera lo desactiva (por ejemplo, incendios). |
| **Parcial** | Hay una parte implementada y otra no. |
| **Experimental** | Se usó para explorar; no es un producto validado. |
| **Propuesta** | Solo está en la documentación. |

## Cómo se mantiene

- Si cambia el código que describe [`fuentes-del-proyecto.md`](fuentes-del-proyecto.md), se
  actualiza ese archivo en el mismo cambio.
- Si cambia una API, se actualiza su ficha y la fecha de verificación.
- Los documentos de `docs/investigacion/` que son estudios fechados **no se reescriben**; este
  subdirectorio es la excepción viva.
- No se copian cifras de otro documento: se enlaza al dueño del dato.
- Los enlaces relativos se comprueban antes de cerrar un cambio.

## Alcance de esta base

Cubre NISAR L-band, SAR, productos L0–L3, API NASA y complementos, formatos y límites. **No**
documenta la interfaz, el diseño visual ni el despliegue; eso vive en `docs/producto/` y
`docs/tecnico/`.

## Verificación rápida

- Los datos de misión y disponibilidad se contrastaron con la documentación oficial de NASA y
  ASF el **15/11/2026**.
- Las pruebas de CMR y ASF Search de esta sesión fueron consultas de solo lectura; no se
  descargó ningún HDF5 ni se usó Earthdata Login.
- Las pruebas de las demás API son las del equipo, fechadas **14/11/2026**, y se citan como
  tales. No se repitieron todas.
