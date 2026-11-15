# Prevención y orientación para civiles

> Implementación: `web/lib/safety-advice.ts` y `web/components/SafetyAdvice.tsx`.
> Fuentes consultadas: **15/11/2026**. Es orientación general, no un protocolo emitido por la CNE.

## Qué ve la persona

La portada muestra «Qué puede hacer» para un reporte vigente priorizado por las reglas existentes.
Si no hay uno prioritario, elige uno relevante o el más cercano vigente; si no hay reportes, ofrece preparación.
No resume todas las amenazas ni evalúa la seguridad de una vivienda.

- Dos acciones breves por amenaza, en ES/EN, con enlace al protocolo de referencia.
- Datos desplegables: fuente, fecha/hora, calidad, clasificación interna y distancia aproximada
  al punto reportado. No es distancia al límite de un incendio, inundación u otro peligro.
- La magnitud sísmica no se presenta como intensidad local ni se convierte en daños.
- Una ubicación de ejemplo, datos incompletos y una simulación se identifican explícitamente.
- CNE y reporte original para consultar instrucciones locales; `tel:911` para una emergencia inmediata.

«Atención prioritaria al reporte» aparece solo si el reporte está vigente, tiene una distancia
válida, cumple `affects()` y su nivel normalizado es rojo o naranja. Es una prioridad de lectura,
no una orden de evacuación ni una nueva predicción. Los reportes vencidos, futuros o de fecha
inválida solo ofrecen preparación.

El programa aplica tres bandas de atención, no de seguridad personal: **atención prioritaria**
para la condición anterior; **seguimiento** para otros reportes vigentes; y **preparación** sin
reporte vigente seleccionado. Distancia desconocida impide priorizar, no demuestra seguridad.
Si hay un reporte vigente sin distancia verificable, la banda queda sin clasificar en vez de
asignarle seguimiento por defecto.
Los umbrales dependen de la amenaza y son reglas iniciales de la app, no zonas oficiales.
La banda corresponde a un reporte, no resume todos los eventos; las fuentes incompletas se indican.

Los consejos de protección se formulan condicionalmente a lo que ocurre: por ejemplo, sentir
una sacudida o reconocer señales naturales de tsunami en la costa. **No hay que esperar a la app
si se observa peligro real.** Tampoco se afirma seguridad por falta de alertas o por estar lejos.

## Fuentes y secciones

| Uso | Fuente oficial |
|---|---|
| Preparación y comunicación familiar | [FEMA / Ready.gov: haga un plan](https://www.ready.gov/es/haga-un-plan) |
| Sismo: durante la sacudida y después; réplicas | [FEMA / Ready.gov: terremotos](https://www.ready.gov/es/terremotos) |
| Magnitud ≠ intensidad en un lugar | [USGS: magnitud e intensidad](https://www.usgs.gov/faqs/what-difference-between-earthquake-magnitude-and-earthquake-intensity-what-modified-mercalli) |
| Tsunami: avisos naturales, rutas, no regresar sin indicación | [NOAA/NWS: During a Tsunami](https://www.weather.gov/safety/tsunami-during) — fuente en inglés; resumen traducido |
| Inundación y lluvia: no caminar/conducir en agua de inundación | [FEMA / Ready.gov: inundaciones](https://www.ready.gov/es/inundaciones) |
| Vientos fuertes, refugio e instrucciones de evacuación | [FEMA / Ready.gov: huracanes](https://www.ready.gov/es/huracanes) |
| Volcán, ceniza y cauces aguas abajo | [FEMA / Ready.gov: volcanes](https://www.ready.gov/es/volcanes) |
| Grietas, movimiento y cierres por deslizamientos | [FEMA / Ready.gov: deslizamientos](https://www.ready.gov/es/deslizamientos-de-tierra-y-avalanchas) |
| Incendios: rutas, humo e instrucciones oficiales | [FEMA / Ready.gov: incendios forestales](https://www.ready.gov/es/incendios-forestales) |

La CNE es la referencia local enlazada. Su sitio devolvió 403 durante esta revisión: no se
atribuyen a la CNE textos que no se pudieron leer ni se afirma su aprobación de esta guía.
Los protocolos estadounidenses se usan como orientación general; no se trasladan servicios
locales de EE. UU. (refugios, SMS, números de asistencia) a Costa Rica.

## IA y avisos

**No se entrenó un modelo ni se genera orientación libre con IA en runtime.**
La IA ayudó a redactar y programar; la app selecciona textos fijos con fuentes consultables.
No necesita un proveedor de modelos, claves adicionales ni tokens para mostrar esta tarjeta.

Un asistente futuro deberá recuperar protocolos aprobados y versionados, citar cada recomendación,
rechazar instrucciones sin respaldo y pasar revisión humana. No podrá inferir evacuaciones
de colores SAR, distancias a epicentros o umbrales visuales.
El requisito de entrenamiento y evaluación del detector está en
[`../investigacion/validacion-cambio-satelital.md`](../investigacion/validacion-cambio-satelital.md).
Las detecciones radar del historial no se pasan a esta tarjeta como alertas.

Los avisos existentes siguen funcionando **solo con la página abierta**. No se agregó envío
push con la app cerrada ni monitoreo permanente. Una app instalada no cambia esa limitación.

## Pruebas y límites

`web/tests/safety-advice.test.ts` cubre vigencia, distancias inválidas, umbrales existentes,
alias de amenazas, simulación, falta de datos y renderizado ES/EN.

Las pruebas verifican selección y presentación, no validan clínicamente ni certifican la
adecuación local de los protocolos. Se requiere revisión de protección civil y pruebas con
personas usuarias antes de presentar el sistema como guía operativa para la población.
