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
| Tsunami | el centro de alerta emite nivel rojo o naranja (vigilancia, aviso o advertencia) |
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

## 4. Color y áreas

Cada tipo de desastre tiene su color (`HAZARD_STYLE`): sismo café, tsunami azul, volcán naranja,
inundación turquesa, ciclón violeta, lluvia celeste, deslizamiento ocre, radar azul de marca.

Si la amenaza está **en curso**, el mapa dibuja dos radios; si no, ninguno:

| Amenaza | Roja | Amarilla |
|---|---|---|
| Sismo | 10^(0,45·M − 1,1) km (1–150) | 10^(0,45·M − 0,3) km (5–400) |
| Volcán | 5 km | 15 km |
| Tsunami rojo | 300 km | 1000 km |
| Tsunami naranja | sin área | 500 km |
| Huracán | 100 km | 300 km |
| Tormenta o depresión | 50 km | 200 km |
| Inundación | 10 km | 30 km |
| Deslizamiento | 2 km | 5 km |
| Lluvia fuerte | 10 km si es naranja | 25 km |
| Radar, avisos informativos | sin área | sin área |

Las áreas son **estimaciones simples**, no zonas oficiales, y así se dice en el popup.

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
- Viven solo en el navegador (no pasan por `/api/events`) y se quitan con «Salir del demo».
- Código: `web/lib/demo-scenarios.ts`.

## 9. Avisos

Cada alerta nueva que afecta a la persona se avisa de dos formas:

1. **Dentro de la página** (siempre): un aviso en la esquina que se cierra solo a los 9 s. No
   depende de ningún permiso, así que funciona también en navegadores que bloquean notificaciones.
2. **Del sistema** (opcional): si la persona pulsó «Avisarme de alertas nuevas» y aceptó el permiso.
   Pasa por un service worker (`web/public/sw.js`), necesario en el celular.

Solo funcionan con la página abierta. Al abrir la página por primera vez no se avisa de lo que ya
estaba, salvo las simulaciones del modo demo. «Probar aviso» envía los dos tipos y dice qué pasó.
