# Benchmark de apps de alerta y datos NASA

> **Estado:** histórico · benchmark del 14/11/2026.

> **Fecha de investigación:** 14/11/2026.
> **Objetivo:** entender qué hacen las apps que ya usan datos NASA/NOAA/USGS, dónde fallan y
> qué hueco real queda para el proyecto.
> **No es una decisión de hazard ni de región.** La recomendación técnica sigue siendo
> incendio, pero la decisión está abierta.
>
> Documentos relacionados:
> [`25-api-research.md`](apis-verificadas.md) (APIs verificadas),
> [`23-plan-app.md`](../archivo/plan-app-inicial.md) (producto),
> [`24-arquitectura-app.md`](../tecnico/arquitectura.md) (arquitectura) y
> [`22-investigacion-desastres.md`](desastres.md) (ciencia).

---

## 0. Resumen ejecutivo

1. **Watch Duty es el mejor benchmark de producto**, no de tecnología: demuestra que la gente
   quiere **claridad verificada**, no otro mapa. Pero es EE. UU., notifica por condado, depende
   de un newsroom humano y sus alertas críticas son solo iOS.
2. **FIRMS/Worldview tienen el dato, pero no la traducción.** Muestran puntos rojos; no dicen
   “está a 3 km, es confiable, el viento va hacia vos y esto deberías hacer”.
3. **Zoom Earth es el ejemplo del error que hay que evitar:** heat spots diarios, con horas de
   retraso, falsos positivos y un aviso propio de “no usar para preservar vida o propiedad”.
4. **Google Flood Hub ya cubre Costa Rica** y da pronósticos a 7 días. Si el hazard es
   inundación, competimos con Google; si es incendio, el campo está más libre.
5. **OVSICORI y UNA Costa Segura** demuestran que las apps locales fallan en latencia,
   notificaciones y mantenimiento, no en cantidad de datos.
6. **El hueco:** una app personal, en español, que responda en 5 segundos **“¿qué peligro hay
   cerca, qué tan confiable es, cuándo llegaría y qué hago?”**.
7. **La innovación no es una capa nueva de satélite:** es **radio personal + confianza
   explicada + memoria histórica + acción + transparencia de latencia**.

---

## 1. Metodología

Revisé sitios oficiales, centros de ayuda, blogs y fichas de Google Play. No inventé funciones:
lo que afirmo sale de documentación pública de cada app. Cuando una app no expone su API
interna, lo digo.

**Qué miré en cada una:**

- **Utilidad:** qué problema resuelve y para quién.
- **Habilidades:** qué hace mejor que el resto (notificaciones, mapa, verificación, etc.).
- **Datos/APIs:** qué fuentes usa o declara.
- **Límites y errores:** cobertura, latencia, precisión, notificaciones, idioma, dependencias.
- **Hueco:** qué podría hacer nuestro proyecto distinto.

**Fecha de los datos:** 14/11/2026. Los estados de cobertura y funciones pueden cambiar.

---

## 2. Matriz competitiva

| App | Qué hace | Datos/APIs | Habilidad | Límite o error | Hueco para nosotros |
|---|---|---|---|---|---|
| **Watch Duty** | Alertas de incendios e inundaciones en EE. UU., mapa, evacuaciones y reportes | NASA FIRMS URT, NGFS/NOAA, Landsat, GOES, radios, fuentes oficiales | Verificación humana 24/7; “el satélite encuentra el calor, el reportero confirma qué es” | Solo EE. UU.; notifica por **condado**, no por radio; free = 4 condados; Critical Alerts solo iOS; no SMS/email/web push; depende de voluntarios | **Radio personal** (1/5/10/25 km), multi-plataforma, español, sin newsroom, con confianza explícita |
| **NASA FIRMS Fire Map** | Mapa global de focos, capas, timeline, alertas por email y archivo | FIRMS, GIBS, Worldview | Dato operativo global; email alerts por área; archivo histórico | Herramienta profesional: puntos rojos sin traducción; API 1–5 días; falsos positivos; no dice “qué hago” | Traducir el punto rojo a **“qué tan cerca, qué tan confiable, qué hago”** |
| **Zoom Earth** | Mapa meteorológico: satélite, radar, pronóstico, huracanes, focos de calor | GOES, GIBS, NHC, GDACS, FIRMS | Visualización rápida y global; mezcla clima + incendios | Heat spots **diarios, con horas de retraso**, falsos positivos, nubes tapan focos; su propio aviso: “no usar para preservar vida o propiedad” | Confianza + hora + incertidumbre + acción; no solo capa visual |
| **Global Forest Watch** | Alertas de incendios por área, tendencias y mapas | FIRMS/GLAD, datasets forestales | “Guardar área” + email cuando hay alerta; tendencia vs promedio | Enfoque forestal/global; no es alerta personal ni de proximidad; no hay viento/ETA | **“¿Es normal?”** con POWER + GIBS, y radio personal |
| **MyShake** | Alerta temprana de sismos y reportes ciudadanos | ShakeAlert/USGS, sensores del teléfono | EEW real; alerta crítica que atraviesa No Molestar; 6 idiomas; Homebase | EEW solo CA/OR/WA; no configurás radio/magnitud; una sola Homebase; no multi-riesgo | **Multi-riesgo** y radio configurable; no competir con EEW |
| **Google Flood Hub** | Pronóstico de inundaciones a 7 días, estado, gauges y cobertura | Modelos Google, gauges, API de flood forecasting | Cobertura global (incluye **Costa Rica**), 7 días, gauges verificados/baja confianza, API gratuita | API solo por **waitlist** (meses); web “aproximada, informativa”; no es alerta oficial; no cubre incendios | Si el hazard es inundación, **ya hay un gigante**; para incendio no |
| **FEMA** | Alertas NWS, refugios, preparación y recuperación | NWS, IPAWS, datos FEMA | Hasta 5 ubicaciones; accesibilidad; lenguaje simple; refugios | Solo EE. UU.; no cubre incendios satelitales; no es global | **Accesibilidad + lenguaje simple + acción**, pero global |
| **GDACS** | Alertas multi-riesgo globales (sismos, ciclones, inundaciones, volcanes, sequías, incendios) | USGS, NOAA, JRC, Copernicus, UN | Cobertura global; RSS/KML/CAP; mapas y satélite; Virtual OSOCC | No es personal; alerta por evento/país, no por “mi casa”; no traduce a acción local | **Capa personal** sobre GDACS: distancia, radio, confianza, acción |
| **OVSICORI-UNA** | Alerta de sismos sentidos en Costa Rica | Red sísmica OVSICORI | Alerta roja/naranja/verde; voz/vibración/sonido; reporte ciudadano; 50–150 km | 3,3★ en Play Store; reseñas reportan alertas **5–10 min tarde**, réplicas sin aviso y sonido que no suena en silencio | **Latencia honesta**, alertas críticas multiplataforma, réplicas y “por qué llegó tarde” |
| **UNA Costa Segura** | Reportes de tsunami de SINAMOT, historial y ruta a punto seguro | SINAMOT, IOC/UHSLC | Notificación de tsunamis; ruta de evacuación; compartir | 35 reseñas; usuarios reportan **crash al abrir la notificación**; una sola amenaza | **Confiabilidad de deep links** + multi-riesgo + offline |

**Otras referencias:** NASA Worldview/Earthdata (potentes, pero para expertos), PDC
DisasterAWARE (gobierno/empresa), ReliefWeb (información humanitaria), Ushahidi (reportes
ciudadanos), HOT (mapeo OSM). No son competidores directos, pero sirven para exposición y
contexto.

---

## 3. Fichas por app

### 3.1 Watch Duty

**Utilidad:** decirle a una persona si un incendio o una inundación amenaza su vida o su
propiedad, con información verificada y actualizada.

**Habilidades:**

- Mapa en vivo con incendios, inundaciones, quemas prescritas y niveles de río.
- Alertas por **condado**; free = 4 condados, miembros = ilimitados.
- **Critical Alerts** en iOS: atraviesan modo silencio, Focus y No Molestar.
- Seguimiento de un incendio específico; silenciar un incidente.
- Evacuaciones, refugios, información de aeronaves, viento/lluvia y capas satelitales.
- **Verificación humana:** staff y voluntarios (dispatchers, first responders, reporters)
  escuchan radios, cámaras e información oficial.
- Usa **NASA FIRMS URT** (VIIRS/MODIS), **NGFS/NOAA** (imagen cada 5 min en EE. UU.),
  **Landsat** y satélites; el equipo pone en contexto los falsos positivos.

**Límites/errores:**

- Solo EE. UU. (según su centro de ayuda, 50 estados desde 2025).
- Notifica por **condado**, no por radio; no se puede excluir una ciudad.
- No envía notificaciones por SMS, email ni web push.
- Critical Alerts solo iOS, opt-in y con umbral alto; no para cada emergencia.
- No todos los incendios/actualizaciones generan notificación: hay “silent incidents”.
- Depende de un newsroom humano; no es replicable en 48 h.

**Qué copiar:** la frase “el satélite encuentra el calor; el reportero confirma qué es”; la
separación entre observación y confirmación; la alerta crítica con prueba; la gestión de
lugares; la transparencia sobre qué no notifica.

**Qué no copiar:** el modelo por condado, el newsroom, la cobertura EE. UU., el muro de
miembros.

---

### 3.2 NASA FIRMS Fire Map

**Utilidad:** explorar focos de calor globales y descargar datos para análisis.

**Habilidades:**

- Mapa global y US/Canada; capas MODIS/VIIRS, color verdadero, aerosoles, etc.
- Timeline, medición, captura, share, modo de vista.
- **Fire Alerts** por email: mundo, país, área protegida o región custom; near real-time,
  diario o semanal; CSV/KML opcional.
- Descarga de archivo histórico y servicios web.
- Datos: MODIS 1 km, VIIRS 375 m; NRT global <3 h; RT <30 min y URT <5 min en EE. UU./Canadá.

**Límites/errores:**

- No es una app de alerta personal; es una herramienta de expertos.
- API solo 1–5 días; el histórico masivo pide Earthdata o GIBS.
- Cada hotspot es el **centro de un píxel**, no la ubicación exacta del fuego.
- Falsos positivos: gas flares, calor industrial, sun glint, humo sobrecalentado, maniobras
  de calibración.
- “Sin detección” no significa “sin fuego”: nubes, humo, dosel, fuegos pequeños o entre
  sobrevuelos.
- **Suomi NPP dejó de entregar datos el 2/11/2026**; hay que migrar a NOAA-20/21.

**Qué copiar:** la capa global, el email de área de interés, la transparencia de latencia y
la documentación de falsos positivos.

**Qué no copiar:** el punto rojo sin contexto, la jerga, la interfaz de experto.

---

### 3.3 Zoom Earth

**Utilidad:** ver el clima y los incendios en un mapa visual, sin instalar nada.

**Habilidades:**

- Satélite en vivo (GOES, Meteosat, Himawari), radar, pronóstico (ICON/GFS).
- Trayectorias de ciclones (NHC/JTWC/IBTrACS).
- Capa de heat spots (FIRMS), capa de incendios oficiales (NIFC, CIFFC, CEMS, GDACS).
- Timeline, medición, capas, idiomas, app móvil.

**Límites/errores:**

- Heat spots **no son en vivo**: se actualizan a diario y con horas de retraso.
- Pueden ser fuego, humo caliente o agricultura; las nubes tapan detecciones.
- Su propio aviso: **“Do not use for the preservation of life or property”**.
- No da distancia a tu casa, confianza, acción ni alerta personal.

**Qué copiar:** la velocidad de carga, el timeline, la mezcla de capas, el lenguaje visual.

**Qué no copiar:** presentar una capa de calor como alerta.

---

### 3.4 Global Forest Watch

**Utilidad:** monitorear bosques y alertas de deforestación/incendios por área.

**Habilidades:**

- Guardar un área y recibir **email** cuando hay nuevas alertas.
- Explorar tendencias de alertas de fuego: ¿estamos por encima o por debajo del promedio?
- Mapas y dashboards; enfoque en bosques tropicales.

**Límites/errores:**

- No es una app personal de proximidad; el área es administrativa/geográfica.
- Enfoque forestal, no de protección de viviendas.
- No hay viento, dirección, ETA ni acción.

**Qué copiar:** “guardar área” + email; **tendencia vs promedio**; el foco en “¿es normal?”.

**Qué no copiar:** el modelo de área sin radio; la interfaz de dashboard.

---

### 3.5 MyShake

**Utilidad:** alerta temprana de sismos y red ciudadana.

**Habilidades:**

- EEW de ShakeAlert en CA, OR y WA; pocos segundos de aviso.
- **Critical Alerts** en iOS que atraviesan Focus/No Molestar.
- Homebase; hasta 3 notificaciones personalizadas; reporte de experiencia.
- El teléfono como sensor (Android); 6 idiomas, incluido español.
- La Homebase no se transmite al servidor.

**Límites/errores:**

- EEW solo en tres estados de EE. UU.; no es global.
- No se puede configurar radio ni magnitud mínima para EEW.
- Una sola Homebase (múltiples “en el próximo release”).
- No multi-riesgo.

**Qué copiar:** la alerta crítica con prueba; el lenguaje “agachate, cubrite, esperá”; la
privacidad de la ubicación; los idiomas.

**Qué no copiar:** depender de una red sísmica densa; prometer EEW global.

---

### 3.6 Google Flood Hub

**Utilidad:** pronóstico de inundaciones fluviales y repentinas para personas y agencias.

**Habilidades:**

- Pronóstico a **7 días**; estado de inundación; gauges reales y virtuales.
- Capa de cobertura; gauges de menor confianza; eventos significativos; historial.
- Email subscriptions; **Flood Forecasting API** gratuita (CC BY 4.0).
- Cobertura de **150+ ubicaciones**, incluida **Costa Rica**.

**Límites/errores:**

- La API está limitada a **pilot participants**; la lista de espera puede tardar meses.
- La web dice que las condiciones son **aproximadas e informativas**; no es alerta oficial.
- No cubre incendios ni otros hazards.
- No es una app de acción local (evacuación, refugio).

**Qué copiar:** la transparencia de cobertura y confianza; el historial; la suscripción por
email; la API gratuita (si se pudiera acceder).

**Qué no copiar:** competir de frente en inundación para Costa Rica.

---

### 3.7 FEMA

**Utilidad:** preparación, alertas y recuperación para residentes de EE. UU.

**Habilidades:**

- Alertas meteorológicas y de emergencia de NWS para hasta **5 ubicaciones**.
- Refugios, centros de recuperación, asistencia, preparación.
- Accesibilidad: lectores de pantalla, lenguaje simple, texto alternativo.
- Mensajes de texto (SHELTER, DRC, PREPARE) y app en inglés/español.

**Límites/errores:**

- Solo EE. UU. (el SMS solo continental + Puerto Rico/Guam).
- No usa datos satelitales de incendios.
- No es una app global ni multi-riesgo con NASA.

**Qué copiar:** accesibilidad, lenguaje simple, hasta 5 lugares, refugios, prueba de alertas.

**Qué no copiar:** el alcance geográfico y la dependencia de NWS.

---

### 3.8 GDACS

**Utilidad:** alertas globales multi-riesgo para coordinación humanitaria.

**Habilidades:**

- Sismos, ciclones, inundaciones, volcanes, sequías, incendios.
- Niveles de alerta (verde/naranja/rojo), mapas, imágenes satelitales.
- RSS, KML, CAP; Virtual OSOCC; enlaces a Copernicus EMS.
- Cobertura global y curada.

**Límites/errores:**

- No es personal: alerta por evento/país, no por “mi casa”.
- No traduce a acción local ni a refugio.
- Algunas funciones pueden estar en mantenimiento.
- No es una app de consumo; es una plataforma de coordinación.

**Qué copiar:** el catálogo multi-riesgo, los niveles de alerta, los feeds CAP/RSS.

**Qué no copiar:** la interfaz de agencia; la falta de proximidad.

---

### 3.9 OVSICORI-UNA (app)

**Utilidad:** alertar a la población de Costa Rica sobre sismos que pueden sentirse.

**Habilidades:**

- Alerta **roja/naranja/verde** según intensidad; voz, vibración, sonido o silencio.
- Ventana útil de **50–150 km**; más cerca no hay tiempo, más lejos no hay daño.
- Reporte de experiencia; mapa y catálogo de sismos; filtros 24 h/30 días; magnitud y
  profundidad; actualización.
- Gratuita; servicio de la Universidad Nacional.

**Límites/errores (reseñas y descripción):**

- **3,3★** y ~1,4 mil reseñas.
- Usuarios reportan alertas **5–10 min después** del sismo, réplicas sin aviso y sonido que
  no suena en modo silencio.
- “Magnitudes pueden cambiar después de la revisión”; no es una alerta perfecta.
- Una sola amenaza (sismos).

**Qué copiar:** el semáforo rojo/naranja/verde; la voz; el reporte ciudadano; el lenguaje
“agacharse, protegerse, esperar”.

**Qué no copiar:** la latencia sin explicación; la falta de alerta crítica confiable; la
ausencia de réplicas.

---

### 3.10 UNA Costa Segura

**Utilidad:** notificar reportes de amenaza de tsunami de SINAMOT y guiar a un punto seguro.

**Habilidades:**

- Notificación cuando SINAMOT genera un reporte de amenaza de tsunami.
- Detalle e historial de reportes; compartir en redes/correo.
- Ruta a punto seguro dentro de la zona de inundación; planificación familiar/empresarial.
- Recomienda **3 medios redundantes** de información.

**Límites/errores:**

- 35 reseñas; usuarios reportan **crash al abrir la notificación** y no poder entrar al
  historial.
- Una sola amenaza (tsunami).
- Depende de que SINAMOT genere el reporte.

**Qué copiar:** la ruta a punto seguro; el historial; el compartir; la recomendación de medios
redundantes.

**Qué no copiar:** un deep link frágil; una sola fuente; una sola amenaza.

---

## 4. Patrones de fallo (y cómo los resolvemos)

### 4.1 Notifican por política, no por distancia

**Evidencia:** Watch Duty notifica por **condado**, no por radio; no se puede excluir una
ciudad. Free = 4 condados. MyShake usa **Homebase** y no permite configurar radio/magnitud para
EEW. FEMA permite 5 ubicaciones.

**Problema:** recibís alertas de un incendio a 80 km y no de uno a 3 km en el condado vecino.

**Nuestra solución:**

- **Radio personal:** 1, 5, 10, 25 km; el usuario elige.
- **Múltiples lugares:** casa, trabajo, escuela, familia.
- **“Solo si está a X km y la confianza es > Y”.**
- **URL state** (`?lat=&lon=&r=`) para compartir y no guardar cuenta.

---

### 4.2 Prometen “tiempo real” cuando el dato llega horas después

**Evidencia:** Zoom Earth dice que los heat spots son **diarios y con horas de retraso**.
FIRMS global NRT llega en **<3 h**; RT <30 min y URT <5 min **solo EE. UU./Canadá**. La app de
OVSICORI recibe reseñas de alertas **5–10 min tarde**.

**Problema:** el usuario cree que el punto es “ahora”. Si el satélite pasó hace 4 h, la
decisión cambia.

**Nuestra solución:**

- **“Dato de hace 2 h 15 min”** visible, no escondido.
- **Último sobrevuelo / próximo sobrevuelo**.
- **Estado de frescura:** fresco / aceptable / viejo / sin dato.
- **Nunca decir “en tiempo real”** si es NRT global.

---

### 4.3 El punto rojo parece una casa, pero es un píxel

**Evidencia:** FIRMS lo dice: cada hotspot es el **centro de un píxel** de ~1 km (MODIS) o
~375 m (VIIRS); puede haber uno o varios fuegos; no se puede saber el tamaño exacto.

**Problema:** la app muestra un pin preciso y la persona cree que el fuego está exactamente
ahí. Es **falsa precisión**.

**Nuestra solución:**

- **Círculo de incertidumbre** de 375 m/1 km, no un pin.
- **“Detección en un píxel, no una casa”** en el detalle.
- **Agrupar detecciones** en un evento (clustering) y mostrar un área.
- **No calcular distancia a la casa** con precisión de metros; usar “a ~3 km”.

---

### 4.4 Falsos positivos sin contexto

**Evidencia:** Watch Duty advierte que **gas flares, calor industrial y sun glint** producen
falsos positivos. FIRMS documenta artefactos por **humo sobrecalentado**, **maniobras de
calibración** (patrones lineales) y confianza baja por sun glint. Zoom Earth dice que un punto
puede ser “humo caliente o agricultura”.

**Problema:** alertar por cada detección genera pánico y desconfianza. Watch Duty lo resuelve
con humanos; nosotros no tenemos newsroom.

**Nuestra solución (sin humanos 24/7):**

1. **Confianza:** MODIS 0–100; VIIRS low/nominal/high; descartar low por defecto.
2. **FRP** (Fire Radiative Power): un flare industrial suele tener FRP bajo/constante; un
   incendio forestal, alto y variable.
3. **Persistencia:** exigir detección en **2+ sobrevuelos** o en **2+ sensores** (MODIS +
   VIIRS NOAA-20/21).
4. **Contexto de suelo:** land cover (GIBS), OSM `landuse=industrial`, proximidad a
   carreteras/pozos; etiquetar “posible fuente industrial”.
5. **Cruce GOES:** ABI FireTemp cada 10–30 min en América; si GOES no ve nada y FIRMS sí,
   bajar confianza.
6. **Patrón lineal:** descartar clusters alineados típicos de calibración.
7. **Noche/día + sun glint:** usar el flag `daynight` y la geometría.
8. **Nunca decir “incendio confirmado”**: “detección satelital”, “posible incendio”, “no
   confirmado”.

---

### 4.5 “No hay detección” se interpreta como “no hay peligro”

**Evidencia:** FIRMS explica que un fuego puede no detectarse por nubes, humo, dosel, tamaño,
temperatura, o porque empezó y terminó entre sobrevuelos. Zoom Earth: las nubes impiden la
detección.

**Problema:** el usuario ve el mapa vacío y cree que está a salvo.

**Nuestra solución:**

- **“Sin detecciones no significa sin fuego”** visible.
- **Cobertura de nubes** y **próximo sobrevuelo**.
- **Estado “sin dato”** en vez de “sin riesgo”.
- **Combinar con fuentes oficiales** (CNE, bomberos, noticias) para el contexto.

---

### 4.6 Notificaciones frágiles

**Evidencia:** Watch Duty: notificaciones solo push en iOS/Android; **no SMS, email ni web
push**. Critical Alerts **solo iOS**, opt-in, y no para cada emergencia. OVSICORI: reseñas de
sonido que no suena en silencio y alertas tarde. UNA Costa Segura: crash al abrir la
notificación.

**Problema:** la notificación es el momento de verdad; si falla, la app no sirve.

**Nuestra solución:**

- **Web Push + PWA** (Android/desktop) y **link compartible**; en iOS, mostrar limitación.
- **Plan B:** botón “compartir por WhatsApp/SMS” con texto prearmado; no requiere backend.
- **Prueba de notificación** desde ajustes, como Watch Duty/MyShake.
- **Deep link robusto:** la notificación abre una tarjeta cacheada; si falla la red, muestra
  el último dato.
- **Niveles:** silencio / informativo / importante / crítico; el crítico solo si se cumple la
  regla.
- **No prometer** “atraviesa el modo silencio” en Android si no se puede.

---

### 4.7 Una app por amenaza

**Evidencia:** el mercado de sismos en Costa Rica está saturado: OVSICORI, Sismo Detector,
Mis Alertas de Terremotos, Terremotos Cerca de Mí, ¡Sismo Listo!, ShakeNet, etc. Para tsunami,
UNA Costa Segura. Para inundación, Google Flood Hub. Para incendios, Watch Duty/FIRMS.

**Problema:** el usuario necesita 5 apps y 5 registros.

**Nuestra solución:** **un hazard por MVP** (incendio), pero una **arquitectura
`HazardAdapter`** para sumar los demás sin rehacer la UI. No lanzar “multi-riesgo” en 48 h;
lanzar “incendio bien hecho” y mostrar el camino.

---

### 4.8 Datos sin acción

**Evidencia:** FIRMS/Worldview muestran capas, no “qué hacer”. Watch Duty da evacuaciones y
refugios; FEMA da refugios y preparación; MyShake dice “agachate, cubrite, esperá”.

**Problema:** el usuario ve el peligro y no sabe el siguiente paso.

**Nuestra solución:** cada tarjeta tiene **3 acciones concretas** + **link oficial** + **punto
de encuentro/refugio** si existe. No dar consejo médico ni táctico; sí “alejate del humo”,
“cerrá ventanas”, “llamá al 911/CNE”, “seguí la alerta oficial”.

---

### 4.9 El histórico y la “normalidad” faltan

**Evidencia:** Global Forest Watch muestra tendencias vs promedio; POWER/GIBS permiten 20+
años. La mayoría de las apps de alerta muestran solo el ahora.

**Problema:** “¿esto es normal para mi zona?” es la pregunta que convierte un punto en una
decisión.

**Nuestra solución:**

- **“Memoria del lugar”:** conteo de focos por mes/año en un radio, con GIBS 2000+.
- **Percentil POWER** de lluvia/temperatura/viento.
- **“Este año vs los últimos 20”**.
- **Antes/después** con Worldview Snapshots.

---

### 4.10 Dependencias que se caen o se retiran

**Evidencia:** **Suomi NPP dejó de entregar datos el 2/11/2026**; FIRMS pide migrar a
NOAA-20/21. **EO Browser fue deprecado** y ahora es Copernicus Browser. La app de RSN
enlazada desde su sitio devolvía **404** el 14/11. La API de Google Flood Hub está en
**waitlist**.

**Problema:** si el demo depende de una fuente retirada, no hay demo.

**Nuestra solución:**

- **No usar `VIIRS_SNPP_NRT`** como fuente principal; usar NOAA-20/21.
- **Cachear y precomputar**; el demo corre offline.
- **Tener fallback** por fuente (FIRMS → GIBS; POWER → climatología; Worldview → sin imagen).
- **Monitorear deprecaciones** en `docs/investigacion/apis-verificadas.md`.

---

## 5. Habilidades que conviene copiar

| Patrón | Quién lo hace bien | Cómo lo adaptamos |
|---|---|---|
| **Verificación humana** | Watch Duty | No tendremos newsroom; usamos **confianza + persistencia + contexto** y decimos “no confirmado” |
| **Alerta crítica que atraviesa silencio** | MyShake (iOS), Watch Duty (iOS) | Implementar en PWA donde se pueda; **no prometer** en Android; ofrecer SMS/WhatsApp manual |
| **Radio/área de interés** | GFW (guardar área), FIRMS email alerts | **Punto + radio** y **varios lugares**, no condado |
| **Tendencias vs promedio** | Global Forest Watch | **“¿Es normal?”** con POWER + GIBS |
| **Antes/después** | Worldview Snapshots | Tarjeta visual “así estaba / así está” |
| **Accesibilidad y lenguaje simple** | FEMA | Texto llano, lector de pantalla, contraste, español |
| **Prueba de notificación** | Watch Duty, MyShake | Botón “probar alerta” en ajustes |
| **Explicar la incertidumbre** | FIRMS FAQ, Zoom Earth | “Píxel, no casa”; “sin detección ≠ sin fuego” |

---

## 6. El hueco: qué app no existe

**No existe una app personal, en español, que responda en 5 segundos:**

> **“¿Qué peligro hay cerca de mí, qué tan confiable es, cuándo llegaría y qué hago?”**

Las piezas están separadas:

- **Watch Duty** lo hace, pero solo EE. UU., por condado, con newsroom y en inglés.
- **FIRMS/Worldview** tienen el dato, pero son herramientas de expertos.
- **Zoom Earth** muestra el dato, pero avisa que no sirve para salvar vidas.
- **Google Flood Hub** cubre inundación en Costa Rica, pero no incendios y su API está en
  waitlist.
- **OVSICORI/UNA** cubren sismo/tsunami local, pero con problemas de latencia/notificación y
  una sola amenaza.
- **GDACS** es global, pero no personal.

**Posicionamiento recomendado (si el hazard es incendio):**

> **“El traductor personal de los satélites de NASA: no te mostramos un punto rojo; te decimos
> si está cerca, qué tan confiable es, hacia dónde va el viento y qué hacer.”**

O, más corto:

> **“Watch Duty sin newsroom, para tu radio y en español.”**

No copiar el nombre ni la estética; copiar la **claridad** y la **verificación**, y resolver lo
que ellos no pueden: **radio personal, multi-idioma, multi-fuente y transparencia de latencia**.

---

## 7. Backlog de innovación para el MVP

### P0 — Sin esto no hay producto

| Feature | Por qué | Cómo |
|---|---|---|
| **Punto + radio** | Resuelve el fallo de “condado” | Geolocalización + búsqueda + slider 1/5/10/25 km; URL state |
| **Tarjeta “qué, dónde, cuándo, confianza”** | Es la pregunta del usuario | Distancia, dirección, último sobrevuelo, confianza, fuente, hora |
| **Círculo de incertidumbre** | Evita falsa precisión | 375 m/1 km según sensor; no un pin |
| **Confianza explicada** | Evita falsos positivos | `confidence` + FRP + persistencia + contexto; “posible fuente industrial” |
| **“Sin detección ≠ sin fuego”** | Evita falsa calma | Estado “sin dato” + nubes + próximo sobrevuelo |
| **Acción + link oficial** | Convierte dato en decisión | 3 acciones + CNE/bomberos; disclaimer |
| **Offline / fallback** | El demo no puede depender de red | Cache + JSON estático + `fallback: true` |

### P1 — Diferenciación

| Feature | Por qué |
|---|---|
| **“Memoria del lugar”** | GIBS 20 años + POWER percentiles: “¿es normal?” |
| **Antes/después** | Worldview Snapshots: evidencia visual |
| **Viento y dirección** | Open-Meteo/POWER: “el humo va hacia…” |
| **FWI / clima de fuego** | GFWED: contexto, no solo detección |
| **Niveles de notificación** | Evitar fatiga: silencio/info/importante/crítico |
| **Prueba de alerta** | Confianza en la app |
| **Modo docente/periodista** | Explica cómo leer un hotspot; impacto educativo |

### P2 — Stretch

| Feature | Por qué |
|---|---|
| **Debrief con IA** | Explicar en lenguaje simple con citas; precomputado, no runtime |
| **Multi-riesgo** | `HazardAdapter` para sismo/inundación/tsunami |
| **Reportes ciudadanos** | Ground truth, pero requiere moderación; no en 48 h |
| **SMS/WhatsApp** | Fallback cuando no hay push; link prearmado |
| **API pública** | Para docentes/periodistas; no en el MVP |

---

## 8. Qué NO hacer

1. **Otra app de sismos.** El mercado de Costa Rica está saturado (OVSICORI, Sismo Detector,
   Mis Alertas, Terremotos Cerca de Mí, ShakeNet…). No hay hueco.
2. **Otro Google Flood Hub.** Ya cubre Costa Rica, tiene 7 días, gauges y API (aunque en
   waitlist). Competir de frente es perder.
3. **Otro Watch Duty.** Requiere 24/7 de reporteros, radios y newsroom; no se hace en 48 h.
4. **Otro dashboard multi-riesgo.** La arquitectura puede ser multi-riesgo; el MVP no.
5. **Mostrar el punto rojo sin contexto.** Es el error de Zoom Earth/FIRMS para el público.
6. **Prometer “tiempo real” global.** FIRMS global es <3 h; URT es solo EE. UU./Canadá.
7. **Prometer alerta crítica en Android.** Watch Duty/MyShake solo la tienen en iOS.
8. **Depender de S-NPP.** Retirado el 2/11/2026; usar NOAA-20/21.
9. **Depender de una API en waitlist.** Google Flood API tarda meses.
10. **Decir “alerta oficial”.** No lo somos; siempre link a CNE/NHC y disclaimer.

---

## 9. Experimentos de validación (5)

1. **Test de 5 segundos:** mostrá un hotspot de FIRMS a 3 km de una casa y preguntá “¿qué
   harías?”. Después mostrá la tarjeta con distancia, confianza y hora. Medí si cambia la
   decisión.
2. **A/B de precisión:** un pin vs un círculo de 1 km. Hipótesis: el círculo genera menos
   falsa confianza.
3. **Test de falso positivo:** mostrá un flare industrial y un incendio forestal; preguntá
   cuál es peligroso. Medí si la app ayuda a distinguirlos.
4. **Test de “sin dato”:** mapa vacío con nubes vs “sin detecciones, cobertura nublada”. Medí
   si entienden la diferencia.
5. **Test de notificación:** alerta a 5 km vs 20 km; ¿cuál quieren recibir? Ajustar el default.

**Métrica norte:** tiempo hasta responder “¿hay peligro cerca de mí?” y **% de usuarios que
pueden explicar la confianza y la fuente** después de usar la app.

---

## 10. Decisiones que habilita

- **Hazard:** incendio sigue siendo la recomendación técnica; no es una decisión tomada.
- **Región:** una sola; idealmente con 2–3 eventos históricos verificables.
- **Reto:** #8 si es fuego; #2 si pesa la tendencia; #5 si es inundación.
- **MVP:** P0 del punto 7, sin multi-riesgo.
- **Posicionamiento:** “traductor personal”, no “alerta oficial”.

---

## 11. Fuentes

**Watch Duty**

- Sitio: <https://www.watchduty.org/>
- Cómo funciona: <https://www.watchduty.org/how-it-works/overview>
- Blog NGFS/satélites: <https://www.watchduty.org/blog/watch-duty-strengthens-early-wildfire-detection-with-enhanced-satellite-feeds>
- Cobertura: <https://support.watchduty.org/hc/en-us/articles/15246288300813-What-states-and-counties-do-you-cover>
- Notificaciones: <https://support.watchduty.org/hc/en-us/articles/49114357393677-How-Watch-Duty-Notifications-Work>
- Critical Alerts: <https://support.watchduty.org/hc/en-us/articles/45326382026253-How-Critical-Alerts-Work-in-Watch-Duty>

**NASA FIRMS / Earthdata**

- Fire Map: <https://firms.modaps.eosdis.nasa.gov/map/>
- Fire Alerts: <https://firms.modaps.eosdis.nasa.gov/alerts/>
- FAQ: <https://www.earthdata.nasa.gov/data/tools/firms/faq>
- FIRMS: <https://www.earthdata.nasa.gov/data/tools/firms>

**Otras apps**

- Zoom Earth: <https://zoom.earth/>
- Global Forest Watch: <https://www.globalforestwatch.org/topics/fires/>
- MyShake: <https://myshake.berkeley.edu/> y <https://myshake.berkeley.edu/FAQ_en.html>
- Google Flood Hub: <https://sites.research.google/floods/> y <https://support.google.com/flood-hub/>
- FEMA: <https://www.fema.gov/about/news-multimedia/mobile-products>
- GDACS: <https://www.gdacs.org/>
- OVSICORI app: <https://play.google.com/store/apps/details?id=com.bbr.ovsicoriapp>
- UNA Costa Segura: <https://play.google.com/store/apps/details?id=cr.una.unacostasegura>

**Documentos del repo**

- APIs verificadas: [`25-api-research.md`](apis-verificadas.md)
- Plan de app: [`23-plan-app.md`](../archivo/plan-app-inicial.md)
- Arquitectura: [`24-arquitectura-app.md`](../tecnico/arquitectura.md)
- Investigación de desastres: [`22-investigacion-desastres.md`](desastres.md)

---

**Última actualización:** 14/11/2026.
**Nota:** este documento es benchmark de producto; la fuente de verdad de APIs y estados es
[`25-api-research.md`](apis-verificadas.md).
