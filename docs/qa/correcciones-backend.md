# Correcciones backend — 2026-11-15

Implementación sobre `develop`, sin operaciones de escritura Git, nuevas dependencias, fuentes,
auth ni base de datos. Se preserva `SHOW_FIRES=false` y el demo de portada incorporado en
`5e1683e`. Informe original: [api-audit.md](api-audit.md). Asistencia de IA: GPT Sol.

## ID → cambio → prueba

| ID | Corrección | Pruebas |
|---|---|---|
| BUG-API-1 | Validación compartida exige coordenadas no vacías antes de coercionar. Cero explícito válido; falta/vacío/NaN/rango/repetidos/desconocidos: 400, también overlays. | `alerts-route.test.ts`, `api-inputs.test.ts` |
| BUG-API-2 | Se lee y valida hazard. `test=1` responde inmediatamente con una sola plantilla DEMO y no-store, sin red ni mezcla con alertas reales. `test=0` nunca lleva DEMO. Solo cinco amenazas existentes. | Matriz cinco hazards × test 0/1 en `alerts-route.test.ts` |
| BUG-API-3 | Fechas imposibles/ilegibles/futuras no vigentes ni en curso; fecha desconocida explicada en historial. PTWC/NHC/GDACS no inventan fecha de reporte. Query assess usa calendario real. Presupuestos independientes conservan fuentes sanas; fallback identifica GIBS/POWER/GDACS/sismos y redes parciales. `visibleCount` distingue recibido de visible. GIBS incompleto no habilita score; POWER solo produce info sin fuente principal. | `api-inputs.test.ts`, `backend-domain.test.ts`, `backend-sources.test.ts`, `alerts-route.test.ts`, `risk.test.ts` |
| BUG-API-4 **parcial** | Nuevos campos opcionales `requestedAt`, `dataUpdatedAt`, `latencySeconds` separan consulta y edad de datos conocidos; null sin fecha. Semántica legado explicitada en tipos/documentación. | `backend-domain.test.ts`, `api-inputs.test.ts` |
| BUG-API-5 | Deduplicación solo entre fuentes distintas, con fecha válida y ventana ≤5 min; sismos ≤40 km, otras amenazas ≤10 km. Normaliza aliases GDACS, conserva primer reporte, confirmaciones y revisión. No suprime eventos de otro mes ni reportes separados de una misma fuente. | `backend-sources.test.ts`; regresiones `feeds.test.ts`, `freshness.test.ts` |
| BUG-API-6 | Timeout y límites de cuerpo (también chunked), redirecciones acotadas al origen, firma PNG completa, granules CMR validados, KML válido y que contenga el punto. Catálogos/KML en paralelo; fallo de una colección no borra la otra ni promueve provisional a validado. | `nisar-routes.test.ts` |
| ATRIBUCIÓN-LLUVIA | Forecast enlaza documentación Open-Meteo, no IMN. Se conserva aclaración «no es un aviso oficial del IMN». | `backend-domain.test.ts` |
| SECRET-FIRMS | No se agrega clave a respuestas ni logs. Errores FIRMS públicos genéricos; pruebas solo usan clave ficticia. Sin activar consulta FIRMS desde eventos ocultos. | `backend-sources.test.ts` |

El único test existente ajustado es el caso húmedo de `risk.test.ts`: ahora declara
`available:true` para representar **fuente accesible sin focos**, distinto de fuente ausente.

## Validación

- **161 tests / 9 archivos verdes**:
  `pnpm --dir web exec vitest run tests/alerts-route.test.ts tests/api-inputs.test.ts tests/backend-domain.test.ts tests/backend-sources.test.ts tests/nisar-routes.test.ts tests/risk.test.ts tests/freshness.test.ts tests/seismic.test.ts tests/feeds.test.ts`
- ESLint focal de `app/api`, módulos backend y esos tests: verde.
- Sin build general ni cambios en UI; otras sesiones trabajan en paralelo. No se consultaron
  fuentes externas en los tests ni se emitieron avisos reales.

## Pendientes explícitos (no declarar resueltos)

1. **BUG-API-4:** instrumentar hits/TTL y fecha de consulta por fuente; migrar consumidores de
   `updatedAt` legado y alinear el contrato completo de arquitectura. `cached:false` NO prueba
   ausencia de caché interna/CDN. Los campos nuevos no sustituyen latencia de publicación ni
   cobertura de observación. NISAR mantiene su contrato propio (no el ApiMeta completo).
2. **Cobertura GIBS:** MVT vacío es una respuesta accesible, no prueba de pasada válida sobre el
   punto. No se inventó una máscara de cobertura ni se alteró la fórmula científica del score.
   Falta evidencia/modelado de cobertura para resolver por completo esa parte de BUG-API-3.
3. **NISAR:** se prueban hasta tres KML del frame con más fechas. Si esos fallan, 502 honesto,
   sin probar ilimitadamente todos los frames/pasadas; no garantiza máxima cobertura.
4. No hay persistencia de último dato válido entre cold starts. Sin snapshot o dato disponible,
   se devuelve ausencia/fallback explícito, no «último dato» inventado.
5. Los campos `visibleCount` y metadata nuevos requieren adopción por UI en trabajo separado;
   aquí no se alteraron etiquetas ni la presentación.
