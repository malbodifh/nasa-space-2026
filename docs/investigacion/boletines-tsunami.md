# Consulta de boletines de tsunami

> Investigación de solo lectura, **15/11/2026**. No hay integración nueva en la app.
> Un boletín regional no equivale a una alerta emitida por Costa Rica.

## Fuentes oficiales accesibles

| Fuente | Consulta comprobada | Qué aporta | Límite |
|---|---|---|---|
| SINAMOT / UNA | [Monitoreo y reportes](https://www.sinamot.una.ac.cr/index.php/monitoreo-reportes) → [historial público](https://unacostasegura.una.ac.cr/webServices/) | Reportes de amenaza para Costa Rica; el historial consultado ofrece enlaces a reportes individuales. | Es HTML para humanos; no se verificó un contrato de API pública, latencia garantizada ni autorización de reutilización automatizada. El sitio solicita atribución al reproducir reportes. |
| SINAMOT / CNE | [Mapas de evacuación](https://www.sinamot.una.ac.cr/index.php/mapas-de-evacuacion) | Mapas interactivos y PDF por región, para preparación y rutas. | Son mapas de planificación; no son por sí solos el área afectada por un evento actual. Verificar cobertura, versión, términos y autoridad antes de reutilizar geometrías. |
| NOAA / NWS | [Suscripción a mensajes](https://ntwc.ncep.noaa.gov/?page=productRetrieval) | Feeds Atom de PTWC (`PHEB`) y NTWC (`PAAQ`), además de documentos CAP. | La cuenca no se deduce del código del centro; PTWC también emite productos para el Caribe. Las autoridades nacionales determinan sus propios avisos. |
| NOAA / NWS | [Perfil CAP-TSU](https://www.tsunami.gov/?page=cap) | Documentación y ejemplos de mensajes CAP firmados. | Un campo ausente, desconocido o no aplicable no significa ausencia de amenaza. |

El [historial SINAMOT](https://unacostasegura.una.ac.cr/webServices/) respondió con reportes
de los últimos tres meses. Se abrió como muestra el [boletín 1140](https://unacostasegura.una.ac.cr/webServices/tsunamiViewer.php?pg=&sub=htmlViewer&idx=1140):
contiene fecha local y UTC del sismo, magnitud, epicentro, profundidad, fuente sísmica y una
evaluación específica para Costa Rica. Es un **ejemplo histórico**, no el estado actual. No
se debe inferir una evaluación vigente de la fecha de la consulta o de la falta de un reporte.

SINAMOT publica [tres niveles de amenaza y orientaciones](https://www.sinamot.una.ac.cr/index.php/monitoreo-reportes).
Antes de reproducir instrucciones o integrarlas automáticamente, confirmar condiciones,
atribución, alcance territorial, vigencia y mantenimiento con SINAMOT/CNE.

## Qué consulta la app hoy

`web/lib/sources/feeds.ts` consulta cada dos minutos los Atom
[`PHEB`](https://www.tsunami.gov/events/xml/PHEBAtom.xml) y
[`PAAQ`](https://www.tsunami.gov/events/xml/PAAQAtom.xml). `parsePtwc` en
`web/lib/feeds-parse.ts` extrae posición del reporte, fecha, categoría, magnitud y enlace;
filtra por distancia aproximada (1.500 km para informativos, 4.000 km para los demás).
`alert-rules.ts` considera relevantes los boletines de tsunami rojos o naranjas.

**Límite:** ese filtro no comprueba si la costa de la persona está en el boletín. La
clasificación interna y el punto no demuestran que Costa Rica o una playa concreta estén
amenazadas. La app no consulta SINAMOT ni interpreta las áreas de los boletines.
En el código actual, ambos feeds se normalizan como fuente `PTWC`, aunque `PAAQ` corresponde
al NTWC; tampoco se procesan en el dominio las cancelaciones o la vigencia CAP. Corregir y
probar estos aspectos antes de usar la información para una evaluación territorial.
El [PR #28](https://github.com/malbodifh/nasa-space-2026/pull/28) propone retirar los círculos
visuales de tsunami; su estado de integración debe comprobarse en GitHub.

## Prueba de por qué no basta el resumen

En el [boletín PTWC WEPA40 del 17/07/2026](https://www.tsunami.gov/events/PHEB/2026/07/17/26198000/2/WEPA40/WEPA40.txt),
el texto clasifica por separado costas de Guatemala/México y costas de otros países,
incluida Costa Rica. También indica que las autoridades nacionales definen el aviso local.
El [CAP correspondiente](https://tsunami.gov/events/PHEB/2026/07/17/26198000/2/WEPA40/PHEBCAP.xml)
contiene `msgType=Update`, `references`, hora de emisión y un `areaDesc` que no reproduce
todas las listas del texto. Su recurso [JSON](https://www.tsunami.gov/events/PHEB/2026/07/17/26198000/2/WEPA40/PHEB.json)
tampoco debe asumirse como una lista exhaustiva validada de costas. Esto es **un caso**, no
una prueba de que todos los productos tengan el mismo formato.

Además, el [CAP PHEB observado el 15/11](https://www.tsunami.gov/events/xml/PHEBCAP.xml)
incluía `circle` de radio cero en la ubicación sísmica y `expires` del 13/11. Un círculo
de radio cero no es una zona inundable; un documento accesible tampoco está necesariamente
vigente. El valor del endpoint cambia cuando se emiten nuevos boletines.

## Camino propuesto, no implementado

1. Acordar con SINAMOT acceso, permisos, atribución, formato, latencia y política de uso.
   Mientras tanto, enlazar al portal y a los mapas oficiales; no hacer scraping operativo
   como si tuviera un contrato estable.
2. Para NOAA, obtener Atom desde el servidor y seguir solo enlaces HTTPS de hosts autorizados;
   fijar límites de tamaño, tiempo y redirecciones. Conservar emisor, identificador, producto,
   fecha de emisión, enlace y texto original.
3. Interpretar explícitamente `status`, `msgType`, `references`, `effective`/`onset` y
   `expires` cuando existan. Gestionar actualización, cancelación y datos ausentes; no
   inventar vigencia ni tratar un boletín de prueba como real.
4. Evaluar por producto y región qué estructura declara realmente las costas; validar con
   ejemplos históricos de cada formato y con expertos. Si no hay zona interpretable y
   vigente, mostrar **«alcance no determinable»** y el enlace oficial.
5. No transformar distancia, magnitud, CAP vacío o nombres de lugares en un polígono de
   inundación. No usar este procesamiento para ordenar evacuaciones ni afirmar seguridad.
6. Probar cambios/cancelaciones, formatos incompletos, eventos regionales sin Costa Rica,
   respuesta caída y estados desactualizados. Atribuir fuente y mantener revisión humana.
