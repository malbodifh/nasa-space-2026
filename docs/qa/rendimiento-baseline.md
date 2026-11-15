# Rendimiento: línea base de producción

> **Estado:** medición del 15/11/2026, previa a las correcciones locales. No certifica mejoras.
> Sitio: <https://nasa-space-2026.vercel.app/>.

Se utilizó **Google PageSpeed Insights** (`pagespeed.web.dev`). El nombre `speedpage.com`
mencionado en la solicitud no entregó un informe legible. La API de PageSpeed devolvió 429;
la interfaz web sí completó el análisis. No se usaron claves ni se desplegó sobre `main`.

## Evidencia reproducible

- [Informe móvil](https://pagespeed.web.dev/analysis/https-nasa-space-2026-vercel-app/rvn2u2mz8l?form_factor=mobile).
- [Informe escritorio](https://pagespeed.web.dev/analysis/https-nasa-space-2026-vercel-app/rvn2u2mz8l?form_factor=desktop).
- Fecha que muestra el informe: **15 nov 2026, 01:13 GMT−6**.
- Lighthouse **13.6.0**, Chromium **157.0.8103.38**.
- No hay datos de usuarios reales en CrUX: son mediciones de laboratorio, no percentiles de campo.
- La URL apunta a producción; no es una medición del árbol local modificado.

## Resultados antes de las correcciones

**Móvil** — Moto G Power emulado, 4G lenta:

- Rendimiento: **57/100**.
- Accesibilidad: **96/100**; recomendaciones: **96/100**; SEO: **100/100**.
- FCP: **2,9 s**; LCP: **2,9 s**; TBT: **2280 ms**; CLS: **0**; Speed Index: **5,6 s**.
- Trabajo del hilo principal: **3,9 s**; ejecución JS: **2,0 s**.
- JavaScript sin usar: ahorro estimado **182 KiB**; **12 tareas largas**.

**Escritorio**:

- Rendimiento: **66/100**.
- Accesibilidad: **96/100**; recomendaciones: **96/100**; SEO: **100/100**.
- FCP: **0,2 s**; LCP: **1,1 s**; TBT: **1630 ms**; CLS: **0,074**; Speed Index: **1,4 s**.
- Trabajo del hilo principal: **2,9 s**; JS sin usar: ahorro estimado **181 KiB**.

## Hallazgos entregados a implementadores

1. El contador del filtro seleccionado usa `text-white/75` sobre `#5266EB`: contraste **3,38:1**
   para texto pequeño, inferior a 4,5:1. Usar blanco sólido sin bajar la opacidad.
2. El enlace de marca tiene texto visible «Memoria de Fuego» pero nombre accesible «Inicio».
   El nombre accesible debe incluir la marca visible.
3. La geolocalización se solicita al montar la portada. Solicitarla únicamente tras un clic.
4. El tiempo de bloqueo por JS domina la nota. Evitar precargar la ruta pesada de radar por
   cada enlace del historial; limitar trabajo y memoria del mapa sin eliminar funcionalidades.
5. La caché de imágenes SAR en memoria no tiene límite. Limitarla y permitir reintentos.

Las correcciones concretas se registran en
[`rendimiento-cambios.md`](rendimiento-cambios.md). Los hallazgos son evidencia de prioridades,
no una garantía de cuánto subirá el puntaje.

## Intento de medir la versión nueva (15/11, noche)

La corrección de rendimiento **no está medida**. Dos bloqueos concretos:

1. El preview de `develop` que generó Vercel está protegido por SSO: al abrirlo redirige a
   `vercel.com/login`. Hace falta una sesión con acceso al proyecto o desactivar temporalmente
   la protección de despliegues.
2. Lighthouse local no arranca en este entorno: falla al lanzar Chrome por bibliotecas del
   sistema ausentes. No es un problema de la app.

Para medir mañana: abrir el preview autenticado y correr PageSpeed Insights sobre esa URL,
móvil y escritorio, dos veces. Comparar TBT y LCP contra los valores de arriba.

## Repetición después de integrar

1. Pasar lint, tests y build de producción.
2. Probar una URL **preview de develop**, sin promover a `main`.
3. Repetir móvil y escritorio tres veces, sin otra carga intensa; registrar las URLs de informe.
4. Comparar medianas de LCP/TBT/CLS y comprobar que mapa, demo, idioma y navegación siguen funcionando.
5. Hasta tener esa URL y esos informes, el estado es **mejoras implementadas; impacto PageSpeed
   pendiente de medir**, no «rendimiento resuelto».
