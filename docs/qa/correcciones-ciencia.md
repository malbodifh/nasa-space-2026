# Correcciones científicas y de procedencia

> **Estado:** implementadas en el árbol local de `develop`, 15/11/2026.
> Auditoría independiente original: [`challenge-review.md`](challenge-review.md).
> No se alteraron los gránulos, las imágenes ni los resultados numéricos del manifiesto.

## Hallazgo → corrección → prueba

- **H-5, pasada con artefacto:** `SAR_ZONES` no ofrece adquisiciones anteriores a la base
  configurada. Esto retira de los selectores y detecciones la pasada 26/06 de la pista 170, con
  artefacto conocido. Los archivos originales permanecen para trazabilidad.
  `sar-provenance.test.ts` verifica la conservación del manifiesto y la exclusión en la vista.
- **H-6, números duplicados:** las cifras de Palo Verde y Rincón del 30/09 en la narración ES
  se leen del manifiesto, no de constantes manuales. Se habla de píxeles comparables, no de área.
- **H-2, causa/daños:** las detecciones informativas llevan la aclaración de vistas previas de
  8 bits y no confirmación de daños. La UI bilingüe elimina la conversión a km² afectados.
- **H-4, métodos distintos:** `docs/producto/nisar.md` documenta mediana en el navegador frente
  a media del cuadro en el precálculo. No se afirma que son equivalentes.
- **H-3, madurez de producto:** documentación y ayuda advierten sobre comparar bases
  provisionales con productos posteriores validados; «validado» no valida nuestra interpretación.
- **Atribución de lluvia:** el modelo Open-Meteo no se presenta como «Avisos del IMN».
  El IMN sigue siendo una referencia oficial independiente, no el autor del pronóstico de la app.

## Validación focal

`pnpm --dir web exec vitest run tests/sar-provenance.test.ts tests/sar.test.ts tests/events.test.ts`
pasó: **18 tests, 3 archivos**, 15/11 a las 01:19 CR.

La validación final completa se registra en [`pruebas.md`](pruebas.md). Pasar tests verifica
contratos y regresiones, no precisión científica.

## Riesgos que permanecen

- Los browse PNG no sustituyen productos radiométricamente calibrados ni observaciones de terreno.
- El umbral 38/255 sigue siendo una heurística de brillo; no mide inundación, daño ni desplazamiento.
- Los dos pipelines no se recalcularon ni unificaron para evitar sustituir datos de David sin
  validación. Sus resultados no se deben presentar como una serie calibrada homogénea.
- No se añadió SAR nuevo, ninguna probabilidad y ningún score de inundación/deslizamiento.
