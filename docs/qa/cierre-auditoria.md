# Cierre de auditoría · 15/11/2026

Trabajo preparado en `fix/cierre-qa-entrega` para revisión de David. No autoriza el merge
ni certifica la versión publicada. El respaldo local `pre-ponytail` sigue en `192996f`.
El PR #21 ya integró el trabajo previo de `develop` en `main`; esta entrega contiene
únicamente las correcciones locales posteriores y no repite esa promoción.

## Correcciones y regresiones

| Hallazgo | Corrección |
|---|---|
| La fusión con GDACS perdía magnitud y reglas sísmicas | Conservar el reporte sísmico y las fuentes adicionales |
| Distancias personalizadas compartidas entre ubicaciones | Claves de caché con coordenadas exactas |
| Bbox EONET con latitudes invertidas | Orden oeste, norte, este, sur |
| Datos vencidos sin aviso en lecturas siguientes | Conservar `stale` durante la gracia y en solicitudes concurrentes |
| Overpass vacío cacheado 24 h tras una caída | Propagar el fallo a la caché; devolver vacío fuera de ella si no hay dato previo |
| Más de tres avisos se descartaban para siempre | Mantener la cola completa y mostrar hasta tres avisos simultáneos |
| Cero píxeles comparables se interpretaba como estabilidad | Informar falta de datos comparables, sin porcentaje ni hipótesis |
| El enlace radar cambiaba el par de fechas original | Conservar zona/base y validar el par publicado |
| Foto óptica rota sin explicación | Estado de carga, error y reintento por imagen |
| Foco invisible del comparador | Indicador visible en el contenedor al navegar con teclado |
| Explicación inglesa implicaba una máscara de agua | Aclarar que se excluyen píxeles oscuros, no agua identificada |
| Simplificación Python desordenaba puntos | Seleccionar índices y emitirlos en el orden original |
| `make sync` forzaba referencias con commits locales | Exigir avance seguro y actualización condicionada al valor previo |
| CLI de UI sin uso arrastraba avisos de seguridad | Retirar `shadcn`, `tw-animate-css` y sus imports sin uso |
| Instrucciones de ramas y enlaces desactualizados | Retirar `staging` del flujo vigente y corregir enlaces rotos |

Las pruebas de regresión cubren las ramas de lógica corregidas. Los tests de notificaciones
simulan los hooks: no certifican la entrega de avisos del sistema operativo.
La revisión de claves incluye sismos, EONET, GDACS, PTWC, NHC, FIRMS, lluvia,
Overpass, GIBS y POWER. Las claves exactas evitan compartir resultados personalizados,
pero pueden aumentar consultas entre ubicaciones distintas.

La verificación bajo Node 22 también detectó un test de parámetros que consultaba CMR
real: ahora simula el catálogo y exige respuesta 200 sin depender de la red.

## Verificación final

- Node **22.23.5**: ESLint, TypeScript, **358 tests en 31 archivos** y build de producción verdes.
- Python: Ruff y **5 tests** verdes; guía Typst compilada en `/tmp/opencode/`, sin modificar PDFs.
- `git diff --check` y enlaces locales Markdown comprobados: sin errores.
- `pnpm audit --prod`: **0 avisos conocidos** tras retirar las dependencias sin uso.
- Navegador contra `http://localhost:3100`: enlace radar de Palo Verde conserva
  **20/07 → 30/09**; foco del rango visible y sin desborde a 390 px.
- Worldview bloqueado deliberadamente: aparece el error óptico y el botón de reintento
  recibe un clic real y emite una nueva solicitud. Los errores de red de esta prueba son esperados.
- Portada con mapa: sin desborde horizontal a **320, 390, 768 y 1280 px**.
- El primer intento reveló que el rango tapaba el reintento: los controles de error ahora
  están fuera del recorte; hay prueba de regresión y retest de clic real.

## Fuera de esta entrega

- La línea de tiempo deslizante SAR queda guardada en `docs/estado.md`; no se implementó.
- No se regeneraron los snapshots OSM: faltan el extracto PBF y `pyosmium` en este entorno.
  El generador está corregido y tiene prueba; los datos existentes necesitan regeneración
  y revisión antes de usarlos para interpretar geometrías.
- No se asignó una licencia ni se decidió el logo en nombre del equipo.
- PageSpeed sobre el preview, dispositivos reales y validación científica independiente
  siguen pendientes. Las mediciones locales no sustituyen esos controles.

## Ejecución local

No ejecutar `next build` mientras `next start` sirve el mismo `.next`: el proceso puede
conservar referencias a CSS que ya no existe. Detener solo el servidor de puerto 3100,
compilar, volver a iniciarlo y recargar el navegador.
