# Requisito: detector de cambios verificable

> Pedido del usuario, 15/11/2026. **Pendiente: no hay modelo entrenado ni validación de precisión.**
> La heurística actual sobre previews no se convierte en detector validado por añadir una IA.

## Lo que no se debe confundir

- **Diferencia visual:** cambió el valor de un PNG/WebP entre fechas.
- **Cambio físico:** evidencia de que una propiedad del terreno cambió, descartando artefactos.
- **Causa o daño:** interpretación que requiere observaciones independientes y validación.

El detector debe poder abstenerse: «datos no comparables», «evidencia insuficiente» o
«causa no confirmada» son resultados válidos. Entrenarlo no elimina los falsos positivos.
Los colores de un radar son una representación de la señal, no colores naturales del terreno.

## Antes de entrenar

1. Obtener los GCOV científicos, su procedencia, calibración, CRID y capas de calidad.
   [ASF: GCOV](https://nisar-docs.asf.alaska.edu/gcov/).
2. Comprobar polarización, geometría, CRS, resolución, grilla y alineamiento por fecha.
   No basta que dos imágenes tengan las mismas dimensiones.
3. Usar una escala física y un método de procesamiento común; no tratar el PNG normalizado,
   el WebP con pérdida o el umbral 38/255 como una medida calibrada.
4. Reunir ejemplos de cambio, ausencia de cambio y artefactos con etiquetas revisadas,
   área/fechas precisas y evidencia independiente que pueda consultarse.
5. Separar entrenamiento y evaluación por eventos, lugares y fechas para no evaluar con
   recortes de la misma escena usada al entrenar.
6. Comparar con una referencia simple, medir falsos positivos y cambios no detectados,
   publicar errores, condiciones de uso y versión del modelo.

## Casos candidatos, no éxitos demostrados

- **Palo Verde, 20/07 → 30/09/2026:** diferencia de preview; lluvia regional no confirma
  inundación de las parcelas ni daños. Investigar humedad, manejo agrícola y procesamiento.
- **Rincón de la Vieja, 25/08 → 18/09/2026:** contrastar con el
  [comunicado OVSICORI del 11/09](https://www.ovsicori.una.ac.cr/index.php/vulcanologia/informes-y-boletines/informes-tecnicos?download=1417:comunicado-del-ovsicori-una-volcan-rincon-de-la-vieja-actualizacion-al-11-setiembre-del-2026).
  Que haya lahares documentados no demuestra que una mancha del preview corresponda a sus depósitos.
  Sirve también para investigar cambios que el método no detecta.

La configuración exacta de visualización de cada PNG y el corregistro real aún no se verificaron.
El pipeline offline y el navegador usan compensaciones distintas; sus porcentajes no son
una serie calibrada homogénea. Ver [`../producto/nisar.md`](../producto/nisar.md).

## Desglose de una medición futura sin agentes

Un programa determinista podría: (1) seleccionar escenas calibradas comparables y registrar
fechas, geometría y calidad; (2) alinearlas y excluir píxeles sin cobertura o de calidad
insuficiente; (3) calcular un indicador de cambio con umbrales validados por tipo de superficie;
(4) cruzar el resultado con mapas de cobertura o infraestructura fechados y atribuidos; y
(5) informar área evaluable, porcentaje candidato y su incertidumbre, con enlaces a las fuentes.
La identificación de qué cambió requeriría contrastar el mapa de cobertura con evidencia
independiente: un cruce espacial por sí solo no prueba daño.

El denominador debe ser el área evaluable de la zona definida, no toda la imagen. Una medida
de altura o topografía requiere modelos digitales de elevación compatibles y verificación de
incertidumbre; una diferencia de brillo SAR no mide elevación. Si faltan calibración,
comparabilidad o validación, el resultado debe ser **no determinable**, sin porcentaje de
superficie afectada ni etiqueta de impacto significativo. Hoy solo existe el porcentaje de
píxeles de preview con cambio aparente: no se propone un nuevo índice sin datos de referencia.

## Límite de uso civil

Las máscaras SAR no disparan recomendaciones de evacuación ni se usan como confirmación
de una amenaza. Las recomendaciones actuales reciben reportes normalizados de las fuentes
de eventos, no las detecciones informativas del historial radar.

Antes de habilitar recomendaciones basadas en un detector hacen falta validación independiente,
revisión de protección civil y reglas de abstención. Un asistente puede explicar evidencia
con citas, pero no fabricar magnitudes, probabilidades, daños ni órdenes oficiales.
