# Reglas de las alertas

> **Estado:** vigente · debe coincidir con `web/lib/alert-rules.ts`, `web/lib/hazard-style.ts` y
> `web/lib/events.ts`. Si cambia el código, se corrige acá en el mismo PR.
> Las fuentes (qué API, cuota, clave) están en [`../tecnico/fuentes.md`](../tecnico/fuentes.md).

## Ciclo de una alerta

```text
fuente → normalizar → ¿afecta a la persona? → ¿está vigente? → ¿está en curso? → lista y mapa
```

Cada paso tiene una regla distinta por tipo de amenaza.

## 1. ¿Le afecta? (`affects`)

| Amenaza | Le afecta si… |
|---|---|
| Sismo | M4+ a ≤50 km, M5+ a ≤150 km, M6,5+ a ≤400 km, o fue sentido a ≤60 km |
| Tsunami | se muestra si el centro de alerta emite nivel rojo o naranja (vigilancia, aviso o advertencia), **pero la app no afirma que su costa esté incluida** |
| Ciclón o tormenta | a ≤500 km, o con nivel serio |
| Volcán | a ≤30 km |
| Inundación | a ≤50 km, o con nivel serio a ≤150 km |
| Lluvia fuerte | siempre que el pronóstico lo marque |
| Otras | a ≤50 km, o con nivel serio a ≤300 km |

La portada pide eventos en un radio de 450 km, que cubre todo el país (mide unos 460 km): así un
sismo en Golfito se ve desde Liberia. Que aparezca en la lista no significa que le afecte; el
estado de riesgo usa solo lo que pasa `affects`.

## 2. ¿Está vigente? (`isCurrent`)

Pasado ese tiempo sin reportes nuevos, la alerta sale de «recientes» y va al historial con la
nota «Sin reportes nuevos desde esta fecha.».

| Amenaza | Horas |
|---|---|
| Sismo | 72 |
| Tsunami, lluvia fuerte | 24 |
| Inundación, ciclón, incendio | 168 |
| Volcán | 720 |
| Ciclón del NHC | mientras el NHC lo publique |

## 3. ¿Está en curso? (`isOngoing`)

«En curso» significa **que ocurre en este momento**. Solo eso dibuja áreas en el mapa.

| Amenaza | En curso durante |
|---|---|
| Sismo | 1 h |
| Tsunami | 12 h, y solo si el nivel es rojo o naranja (un boletín informativo no cuenta) |
| Volcán, deslizamiento | 24 h desde el último reporte |
| Inundación, ciclón | 48 h |
| Ciclón del NHC, lluvia pronosticada | mientras estén publicados |

## 4. Color y radios de proximidad

Cada tipo de desastre tiene su color (`HAZARD_STYLE`): sismo café, tsunami azul, volcán naranja,
inundación turquesa, ciclón violeta, lluvia celeste, deslizamiento ocre, radar azul de marca.

Para algunas amenazas **en curso**, el mapa dibuja radios de proximidad; si no, ninguno:

| Amenaza | Roja | Amarilla |
|---|---|---|
| Sismo | 10^(0,45·M − 1,1) km (1–50) | 10^(0,45·M − 0,3) km (5–150) |
| Volcán | 5 km | 15 km |
| Tsunami | sin círculo | sin círculo |
| Huracán | 60 km | 150 km |
| Tormenta o depresión | 40 km | 100 km |
| Inundación | 10 km | 30 km |
| Deslizamiento | 2 km | 5 km |
| Lluvia fuerte | 10 km si es naranja | 25 km |
| Radar, avisos informativos | sin área | sin área |

Los radios son **estimaciones simples de proximidad**, no zonas oficiales ni áreas de afectación,
y así se dice en el popup y en la leyenda.
Para tsunami se muestra el punto del reporte sin radio: no identifica qué costas están amenazadas.
Consultar el boletín oficial para conocer las zonas bajo aviso. Eliminar el círculo no significa
que no haya peligro.

**Boletines de tsunami.** La app consulta el CAP enlazado por NOAA solo si coincide con la entrada
Atom; una cancelación o un vencimiento explícitos pasan el boletín al historial, y si el CAP falta
la vigencia queda como desconocida. Lo que no hace: interpretar el `areaDesc` ni la lista de costas
para decidir si una playa concreta está incluida. Por eso el titular, la orientación y el aviso
dicen «alcance local desconocido» en lugar de «alerta para su ubicación», el punto no se pinta con
radio y el aviso enlaza a los reportes de SINAMOT y a la CNE. La ausencia de un reporte no prueba
que la costa esté a salvo.

## 5. Varias fuentes, un solo evento

El mismo sismo reportado por RSN, OVSICORI y USGS se muestra **una vez**: son el mismo evento si
están a ≤40 km y ≤5 min. Gana el primer reporte y los demás aparecen como «Confirmado por…».
Se marca **Revisado** si alguna red lo revisó y **Preliminar** si ninguna lo hizo.

Los sismos se listan desde M3,5 o cuando RSN informa que se sintió; los menores se descartan para
no llenar la lista.

## 6. Incendios

Ocultos por ahora ([`../decisiones/0006-ocultar-incendios.md`](../decisiones/0006-ocultar-incendios.md)):
casi todos los focos satelitales resultaron falsos. El interruptor es `SHOW_FIRES` en
`web/lib/sources/overlays.ts`.

## 7. Qué se muestra siempre

Fuente, hora (hora de Costa Rica y «hace X»), calidad (revisado, preliminar, pronóstico) y enlace
al reporte oficial. Una fuente caída se marca «sin respuesta» en «Fuentes en vivo»; no se
inventa el dato.

## 8. Modo demo

El botón «Probar la app con una alerta simulada» (portada, tarjeta de estado) inyecta alertas
ficticias alrededor de la ubicación de la persona: sismo M6,1, tsunami, huracán, erupción,
inundación o todo a la vez. Pasan por las mismas reglas que las reales, así que se ve el estado de
riesgo, el mapa con áreas roja y amarilla, la lista y el aviso del navegador.

- Siempre se marcan: franja «Modo demo», etiqueta «Simulación», fuente «Demostración» y sin
  enlace oficial.
- El tsunami del demo es el único caso con área: usa un **guion costero fijo** de Sámara a Jacó
  (`TSUNAMI_DEMO_AREA`) con flechas hacia la costa (`TSUNAMI_DEMO_FLOW`). Es ilustrativo —no un
  modelo de inundación, ni un run-up, ni un polígono oficial— y no se deriva de magnitud ni de
  distancia. Un boletín de tsunami **real** sigue mostrándose solo como punto.
- Viven solo en el navegador (no pasan por `/api/events`) y se quitan con «Salir del demo».
- Código: `web/lib/demo-scenarios.ts`.

La ruta de compatibilidad `/api/alerts?lat=…&lon=…&test=1&hazard=…` es independiente del demo
de la portada. Solo admite `fire`, `earthquake`, `volcano`, `flood`, `storm` (por defecto `fire`);
devuelve **únicamente** una plantilla `[DEMO]`, sin consultar fuentes, sin enviar notificaciones
a terceros y con `Cache-Control:no-store`. `test=0` nunca incluye la simulación. Amenazas
desconocidas, coordenadas ausentes/vacías, parámetros repetidos o desconocidos devuelven 400.

## 9. Avisos

Cada alerta nueva que afecta a la persona se avisa de dos formas:

1. **Dentro de la página** (siempre): un aviso en la esquina que se cierra solo a los 9 s. No
   depende de ningún permiso, así que funciona también en navegadores que bloquean notificaciones.
2. **Del sistema** (opcional): si la persona pulsó «Avisarme de alertas nuevas» y aceptó el permiso.
   Pasa por un service worker (`web/public/sw.js`), necesario en el celular.

Solo funcionan con la página abierta. Al abrir la página por primera vez no se avisa de lo que ya
estaba, salvo las simulaciones del modo demo. «Probar aviso» envía los dos tipos y dice qué pasó.

## 10. Orientación para civiles

La tarjeta «Qué puede hacer» presenta dos acciones por amenaza, fuentes oficiales y datos
desplegables del reporte. Usa las reglas existentes de cercanía y vigencia para priorizar su
lectura, sin calcular intensidad local, daños ni órdenes de evacuación.
Ver [`prevencion.md`](prevencion.md): no hay modelo entrenado ni generación libre de consejos;
las máscaras SAR no se usan para decidir esas recomendaciones.
## 11. PWA y avisos push

La app es instalable (`web/app/manifest.ts`, íconos en `web/public/icons/`) y envía avisos push aunque la página esté cerrada.

- **Quién recibe avisos:** quien tiene la PWA instalada queda suscrito automáticamente al abrirla (sin botón; en iOS el permiso se pide con el primer toque). Quien usa la web en una pestaña recibe avisos dentro de la página mientras esté abierta, y del sistema si activó el permiso.
- **Suscripción:** al activarse, el navegador crea una suscripción Web Push (claves VAPID) y la registra en `POST /api/push/subscribe` con la ubicación redondeada a ~1 km. No existe ninguna opción para darse de baja: las alertas siempre se envían (la suscripción solo se elimina si el navegador la invalida).
- **Almacenamiento:** Supabase (`web/supabase/push.sql`, variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`). Sin ellas solo hay almacén en memoria y, en producción, el endpoint responde 503.
- **Envío:** `GET /api/push/cron` (con `Authorization: Bearer $CRON_SECRET`) agrupa las suscripciones por celda de ~1 km, consulta `getEvents`, aplica `affecting` (las mismas reglas de la página) y envía solo lo de las últimas 6 h que esa suscripción no recibió. Máximo 3 avisos por suscripción y ciclo. Las suscripciones caducadas (404/410) se eliminan.
- **Disparador:** `.github/workflows/push-cron.yml` cada 5 min (Vercel Hobby solo admite crons diarios). Necesita los secretos `PUSH_CRON_URL` y `CRON_SECRET` en GitHub.
- **Variables:** ver `web/.env.example`. Las claves VAPID se generan con `web-push`; la privada nunca va al repositorio.
- **iOS:** el push solo funciona con la app instalada en la pantalla de inicio (iOS 16.4+).
