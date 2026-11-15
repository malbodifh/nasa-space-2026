# Guía ejecutable de QA

> Tester independiente, 15/11/2026. No modifica producto ni fuentes. Resultado de esta
> ejecución en [baseline.md](baseline.md). La matriz manual **no fue ejecutada**:
> este encargo prohíbe browser. Ejecutarla al congelar los cambios concurrentes.

## Preparación y gates

1. Registrar fecha con zona horaria, SHA, rama y cambios locales:

   ```bash
   date --iso-8601=seconds
   git rev-parse HEAD
   git branch --show-current
   git status --short
   node --version
   pnpm --version
   ```

2. Usar dependencias existentes, sin instalar ni leer `.env`. El entorno esperado es
   Node 22 y pnpm 11.28.5. Guardar salida completa y código de retorno de cada gate:

   ```bash
   make check > /tmp/opencode/qa-final-make-check.log 2>&1
   echo $?
   pnpm --dir web lint > /tmp/opencode/qa-final-web-lint.log 2>&1
   echo $?
   pnpm --dir web test > /tmp/opencode/qa-final-web-test.log 2>&1
   echo $?
   ```

3. Leer cada log completo. Un timeout no es un aprobado. No ejecutar `build`, iniciar
   otro servidor, instalar paquetes ni escribir `.next`: el coordinador gestiona build.
4. Para revisión humana autorizada, usar producción o servidor existente del coordinador.
   Repetir matriz a 1440×900 y 390×844; agregar 320×740 para navegación.
   Usar perfil de prueba y no conceder geolocalización/notificaciones personales.
5. Registrar por caso: hora, SHA local o versión deploy si es conocida, URL, viewport,
   idioma, pasos, esperado, real, captura saneada y PASS/FAIL/BLOQUEADO.
   No atribuir el deploy al SHA local sin evidencia.

## Matriz manual

Todas las filas están **PENDIENTES**, no son evidencia de éxito.

| ID | Pasos ejecutables | Resultado esperado |
|---|---|---|
| M01 Home inicial | Abrir `/`; rechazar GPS; esperar 8 s más carga de datos; desplegar «Fuentes en vivo». | Ubicación de ejemplo explícita; mapa y tarjetas utilizables; cada fuente distingue respuesta, vacío y antigüedad; no afirmar seguridad si faltan datos. |
| M02 GPS | En perfil de prueba permitir una coordenada de Costa Rica; recargar; luego denegar y reintentar. | Actualiza ubicación sin romper mapa ni tarjetas; permiso denegado permite continuar con ejemplo. Sin solicitudes de permiso en bucle. |
| M03 Alertas/historial | Revisar recientes, historial, filtros, «ver más» y enlace de un evento a estudio. | Recientes e historial ordenados; evento conserva fuente, fecha/hora CR, calidad y enlace oficial; estudio conserva coordenadas, título y fecha. Áreas solo para eventos en curso y aviso de estimación. |
| M04 Logo y menú | Desde Home abrir menú; navegar a Superficie; activar logo; repetir con Tab, Enter, Escape, flechas y clic fuera. | Logo vuelve a `/`; menú abre/cierra, foco visible y restaurado con Escape; sin elementos ocultos enfocables ni desbordes; ruta actual identificable. Cualquier enlace nuevo debe resolver, no 404. |
| M05 Desktop/mobile | Ejecutar M01–M04 y M08 en los tres tamaños; probar scroll, zoom de texto 200 % y giro móvil. | Sin scroll horizontal de página ni controles tapados; menú por encima del mapa; interacción táctil y teclado accesibles. La tira SAR puede tener su propio scroll horizontal. |
| M06 Demo cinco amenazas | Activar modo prueba; elegir una a una incendio (`fire`), sismo (`earthquake`), volcán (`volcano`), inundación (`flood`), tormenta (`storm`). Repetir una y cerrar. | Cada aviso dice inequívocamente PRUEBA/SIMULADO, coincide con amenaza y no altera alertas reales ni cifras históricas. No requiere permisos para una indicación visible. Al cerrar cesan timers y avisos de demo. Si selector no existe, BLOQUEADO/TEST-3, no usar API como sustituto de UI. |
| M07 Notificaciones | Rechazar permiso; recargar. En perfil compatible permitir y pulsar «Probar». | Denegado/unsupported no rompe UI; prueba identificada; sin prometer avisos con página cerrada. No notificar como nuevos todos los eventos existentes al abrir. |
| M08 SAR cuatro zonas | Abrir cada URL de tabla siguiente; mover slider con ratón/tacto/teclado; cambiar Antes/Después, «Ver cambios», «Foto normal vs radar» y desplegar «Datos». | Dos fechas válidas ordenadas; imagen y porcentajes corresponden al par; fuente/granules, carácter aproximado y provisional visibles; sin causalidad inventada. Fechas previas a base excluidas. |
| M09 SAR sin cobertura | Abrir punto fuera de zonas precalculadas; con una respuesta controlada del catálogo `data:null`, repetir. | Distingue «sin zona precalculada» de «sin imágenes del catálogo». Solo una respuesta vacía válida permite afirmar falta de cobertura; no calcula porcentajes falsos. |
| M10 Entrada inválida | Abrir `/superficie`, `?lat=10`, `?lat=&lon=`, `?lat=999&lon=999`, `?lat=NaN&lon=-85`, `?lat=10&lon=-85&fecha=no-fecha` y `?lat=10&lon=-85&zona=inexistente`. | Falta/rango/formato inválido explícito, sin consultas para coordenadas inválidas, sin crash ni espera infinita. Zona desconocida tiene salida recuperable; fecha inválida no genera resultados engañosos. |
| M11 Sin conexión inicial | En perfil autorizado poner Offline antes de cargar Home y luego estudio remoto; esperar 30 s; restaurar conexión. | Error entendible, no «sin peligro» ni «sin cobertura» inferidos por fallo; navegación disponible y recuperación al reconectar. Guardar resultado real si 30 s no finaliza. |
| M12 Fallback/empty | Con interceptación local temporal (sin editar repo), devolver fixture contractual con datos antiguos/fallback y fuente no disponible; después fixture válido con listas vacías y fuentes OK. | Fallback identifica dato anterior/antigüedad; vacío exitoso no equivale a fuente caída. No esconder aviso como si todos los datos fueran actuales. Coordinar fixtures con QA de APIs, no repetir auditoría de endpoints. |
| M13 Timeout/error | Retener respuesta de `/api/events` y `/api/assess` >30 s; probar error HTTP de `/api/nisar/search` y fallo de imagen SAR; después liberar. | Carga no indefinida sin explicación; fallo de consulta no se convierte en ausencia de imágenes; condiciones de incendio no quedan en «…» como único estado terminal. Error de imagen permite volver/cambiar fechas. |
| M14 English | Cambiar a English en menú; recorrer Home, menú, alertas, estudio, datos SAR, empty y errores; recargar y volver a Español. | Texto propio, accesibilidad, fechas y avisos en idioma elegido; preferencia persiste si almacenamiento disponible. Títulos originales de fuentes pueden conservarse, sin mezclar textos propios. Validar storage bloqueado sin crash. |
| M15 Seguridad sin secretos | Revisar Network/HTML/console solo del perfil de prueba, sin abrir `.env`; probar título de URL `%3Cscript%3Ealert(1)%3C%2Fscript%3E`. | Título se muestra como texto, nunca ejecuta; sin claves/tokens en URL, HTML, bundle o logs. Datos científicos vía BFF; revisar por separado tiles base y cualquier acceso óptico externo según política de fuentes. No copiar valores sensibles: registrar solo PASS/FAIL y origen/tipo. |

### URLs SAR reproducibles

Prefijar con `https://nasa-space-2026.vercel.app`.

| Zona | Ruta |
|---|---|
| Palo Verde | `/superficie?lat=10.35036&lon=-85.31993&zona=palo-verde&fecha=2026-08-05&titulo=QA%20Palo%20Verde` |
| Caño Negro | `/superficie?lat=10.89032&lon=-84.74973&zona=cano-negro&fecha=2026-08-05&titulo=QA%20Ca%C3%B1o%20Negro` |
| Rincón de la Vieja | `/superficie?lat=10.83962&lon=-85.31993&zona=rincon-de-la-vieja&fecha=2026-08-05&titulo=QA%20Rinc%C3%B3n` |
| Tortuguero | `/superficie?lat=10.47012&lon=-83.56017&zona=tortuguero&fecha=2026-08-05&titulo=QA%20Tortuguero` |
| Fuera de zonas precalculadas | `/superficie?lat=8.6&lon=-83.0&fecha=2026-08-05&titulo=QA%20fuera%20de%20zona` |

El último punto **no prueba ausencia total de imágenes NISAR**: puede activar búsqueda remota.
Para la rama sin cobertura usar respuesta vacía controlada, no inventar que el satélite no cubre.

## Qué cubren y qué no cubren los tests existentes

- `tests/test_repo.py`: presencia de archivos, enlaces locales y PDFs, no producto.
- Vitest: parsers/feeds, fusión sísmica, reglas de vigencia/áreas, estado e historial,
  geografía, riesgo/estadística, correlación y matemática SAR.
- `web/tests/sar.test.ts` comprueba datos ordenados y puntos de tres zonas; el mínimo es
  `>=3`, no asegura por sí solo las cuatro zonas de demo ni las imágenes en pantalla.
- `web/tests/sar-change.test.ts` prueba máscara, agua, mediana y selección de fechas.
- No hay suite browser en la configuración observada (`environment: "node"`):
  93 tests verdes no certifican canvas, permisos, menú, traducción, móvil ni hidratación.

## Registro de fallos y cierre

Asignar `TEST-n`; P0 = seguridad/daño crítico, P1 = flujo principal o dato engañoso,
P2 = degradación o cobertura faltante. Incluir pasos, esperado, real y evidencia;
no resolver código desde QA. Marcar revisión estática como tal.

Antes del re-test pedir al coordinador SHA y árbol congelado. Repetir gates sin build,
M01/M04/M06/M08/M10/M11/M13/M14 y cada issue corregido. Si cambia el árbol durante
la ejecución, registrar como concurrente y no certificar release.
