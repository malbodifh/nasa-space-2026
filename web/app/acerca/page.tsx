"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import GamaLogo from "@/components/GamaLogo";
import { useLocale } from "@/components/LocaleProvider";

const REPO = "https://github.com/malbodifh/nasa-space-2026/blob/develop";

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primario-fuerte underline decoration-primario/30 underline-offset-4 hover:decoration-current">
      {children}<ExternalLink size={13} aria-hidden="true" className="shrink-0" />
    </a>
  );
}

export default function AboutPage() {
  const { t } = useLocale();
  const steps = [
    {
      title: t("Revise el lugar de referencia", "Check the reference location"),
      body: t("Inicio abre con una ubicación de ejemplo cerca de Liberia. Pulse «Usar mi ubicación» y autorice el GPS si desea consultar su lugar; si no está disponible, se mantiene el ejemplo. No hay selector de ciudades. La lista regional puede incluir eventos que no le afectan directamente.", "Home opens with an example location near Liberia. Select “Use my location” and allow GPS access to check your location; if unavailable, the example remains. There is no city selector. The regional list can include events that do not directly affect you."),
    },
    {
      title: t("Lea el reporte, no solo el color", "Read the report, not just the color"),
      body: t("Revise la fecha, distancia, fuente y calidad del dato. Abra el reporte original y consulte a las autoridades antes de tomar decisiones.", "Check the date, distance, source and data quality. Open the original report and consult the authorities before making decisions."),
    },
    {
      title: t("Explore la superficie", "Explore the surface"),
      body: t("Desde un evento, abra el estudio de superficie. Compare las fechas disponibles del radar y la foto óptica; si faltan imágenes, no hay una comparación válida.", "Open the surface study from an event. Compare the available radar dates and optical image; missing imagery means a valid comparison is not available."),
    },
  ];
  const sources = [
    {
      name: "NASA–ISRO NISAR · ASF DAAC / CMR",
      href: "https://nisar.jpl.nasa.gov/",
      body: t("Vistas previas públicas del producto L2 GCOV, banda L. ASF distribuye las imágenes y CMR permite buscar las pasadas. Es el núcleo del estudio de superficie, no una alerta en tiempo real.", "Public browse images of the L-band L2 GCOV product. ASF distributes the imagery and CMR supports acquisition searches. This is the core of the surface study, not a real-time warning."),
    },
    {
      name: "NASA EONET",
      href: "https://eonet.gsfc.nasa.gov/",
      body: t("Catálogo curado de eventos naturales e historial. No es una red local de emergencias y puede tener demoras o cobertura incompleta.", "A curated natural-event catalog and history. It is not a local emergency network and can have delays or incomplete coverage."),
    },
    {
      name: "USGS · OVSICORI–UNA · RSN UCR–ICE",
      href: "https://www.ovsicori.una.ac.cr/",
      body: t("Reportes sísmicos regionales y locales. Cuando están disponibles, se muestran magnitud, profundidad, revisión y reportes coincidentes de otras redes. Un dato preliminar puede cambiar.", "Regional and local earthquake reports. Magnitude, depth, review status and matching reports from other networks are shown when available. Preliminary data can change."),
    },
    {
      name: "NOAA PTWC / NTWC · NOAA NHC",
      href: "https://www.tsunami.gov/",
      body: t("Boletines de tsunami y ciclones activos. Un boletín informativo no equivale a una advertencia. La ausencia de un ciclón publicado no demuestra que no existan otros riesgos.", "Tsunami bulletins and active tropical cyclones. An information bulletin is not a warning. No published cyclone does not mean there are no other hazards."),
    },
    {
      name: "GDACS · Open-Meteo",
      href: "https://www.gdacs.org/",
      body: t("GDACS aporta niveles de alerta internacionales. Open-Meteo aporta lluvia pronosticada: es un modelo, no una medición de lluvia ni un aviso oficial del IMN.", "GDACS provides international alert levels. Open-Meteo supplies forecast rainfall: a model, not a rainfall measurement or an official IMN warning."),
    },
    {
      name: "NASA Worldview · OpenStreetMap · Carto",
      href: "https://worldview.earthdata.nasa.gov/",
      body: t("Worldview aporta contexto óptico MODIS. OpenStreetMap aporta caminos y áreas protegidas; Carto es el mapa base. Su coincidencia con un cambio de radar no prueba daños ni causalidad.", "Worldview provides MODIS optical context. OpenStreetMap supplies roads and protected areas; Carto supplies the basemap. Their overlap with a radar change does not establish damage or causation."),
    },
  ];
  const evaluation = [
    {
      title: t("Vínculo con el reto", "Challenge alignment"),
      score: 4,
      criterion: "Relevance",
      status: t("Propuesta documentada", "Documented proposal"),
      evidence: t("El reto de trabajo es Dancing with the SARs (NISAR): acercar imágenes de radar y sus cambios a personas sin experiencia técnica.", "The working challenge is Dancing with the SARs (NISAR): making radar imagery and its changes approachable for non-specialists."),
      gap: t("La elección formal del reto sigue pendiente de registro. El auditor consultó el reto mediante contenido oficial indexado, no acceso directo. No afirmamos aceptación ni evaluación de NASA.", "Formal challenge selection remains unrecorded. The auditor consulted indexed official challenge content, not the page directly. We do not claim NASA acceptance or assessment."),
      href: `${REPO}/docs/estado.md`,
    },
    {
      title: t("Uso de datos espaciales", "Use of space data"),
      score: 2,
      criterion: "Validity",
      status: t("Implementado, exploratorio", "Implemented, exploratory"),
      evidence: t("Búsqueda CMR, vistas previas NISAR de ASF y comparación de dos fechas; cuatro zonas precalculadas documentadas.", "CMR search, ASF NISAR browse images and two-date comparisons; four documented precomputed zones."),
      gap: t("Falta validar la detección con productos calibrados y observaciones de terreno. No se ha demostrado precisión de daños.", "Detection still needs validation against calibrated products and ground observations. Damage-detection accuracy has not been established."),
      href: `${REPO}/docs/producto/nisar.md`,
    },
    {
      title: t("Utilidad y comunicación", "Usefulness and communication"),
      score: 3,
      criterion: "Impact",
      status: t("Prototipo funcional", "Functional prototype"),
      evidence: t("Alertas con fuente y hora, estado por ubicación, mapa y acceso al estudio de superficie; navegación e idioma ES/EN seleccionable.", "Alerts with source and time, location-based status, a map and access to the surface study; navigation and selectable ES/EN interface language."),
      gap: t("Faltan pruebas de comprensión con personas usuarias y una auditoría completa de accesibilidad. La traducción de la interfaz no modifica los reportes originales.", "User comprehension testing and a full accessibility audit remain outstanding. Interface translation does not alter original reports."),
      href: `${REPO}/docs/producto/guia-app.md`,
    },
    {
      title: t("Idea y combinación de herramientas", "Idea and combination of tools"),
      score: 3,
      criterion: "Creativity",
      status: t("Puente entre reportes y radar", "A bridge between reports and radar"),
      evidence: t("La entrada por un evento facilita explorar después imágenes NISAR, contexto óptico y capas del territorio en una misma experiencia.", "Entering through an event makes it easier to explore NISAR imagery, optical context and geographic layers in one experience."),
      gap: t("El umbral de brillo es una técnica estándar, no un algoritmo nuevo. La utilidad diferencial requiere probarse con personas usuarias.", "The brightness threshold is a standard technique, not a new algorithm. Its distinct usefulness still needs user testing."),
      href: `${REPO}/docs/producto/vision.md`,
    },
    {
      title: t("Presentación y reproducibilidad", "Presentation and reproducibility"),
      score: 2,
      criterion: "Presentation",
      status: t("Entrega final por verificar", "Final submission still to verify"),
      evidence: t("Código público, reglas, método y pruebas versionadas. Esta ayuda y el idioma seleccionable se agregaron después de la versión puntuada y no se han reevaluado.", "Public code, rules, method and versioned tests. This guide and selectable language were added after the scored version and have not been reassessed."),
      gap: t("Falta verificar demo, submission y materiales evaluables en inglés, despliegue final y licencia del código. Tener pruebas no certifica exactitud científica.", "The demo, submission and assessable English-language materials, final deployment and code license remain to be verified. Having tests does not certify scientific accuracy."),
      href: `${REPO}/docs/qa/challenge-review.md`,
    },
  ];

  return (
    <main id="contenido" className="mx-auto w-full max-w-[1760px] px-4 pt-6 pb-20 sm:px-6 lg:px-10">
      <section className="max-w-[820px]" aria-labelledby="about-title">
        <div className="mb-6 flex items-center gap-4">
          <GamaLogo className="size-14 shrink-0" />
          <div>
            <p className="etiqueta">{t("Acerca de la app", "About the app")}</p>
            <p className="mt-1 text-sm text-tinta-suave">Astral Codes · NASA Space Apps 2026</p>
          </div>
        </div>
        <h1 id="about-title" className="text-[34px] leading-[1.1] font-bold tracking-[-0.035em] sm:text-[48px]">
          {t("Entender lo que pasa cerca. Explorar qué cambió.", "Understand nearby events. Explore what changed.")}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-tinta-suave">
          {t("Memoria de Fuego es un prototipo educativo y exploratorio: reúne reportes de desastres naturales en Costa Rica y permite explorar cambios de superficie con radar NASA–ISRO NISAR. Las alertas son la entrada; el radar aporta evidencia visual para investigar, no una confirmación automática de daños. Esta guía es un tutorial, no una autoridad de emergencias.", "Memoria de Fuego is an educational, exploratory prototype: it brings together natural-hazard reports for Costa Rica and lets you explore surface changes with NASA–ISRO NISAR radar. Alerts are the entry point; radar provides visual evidence to investigate, not automatic confirmation of damage. This guide is a tutorial, not an emergency authority.")}
        </p>
        <div className="mt-6 rounded-xl border border-aviso/30 bg-aviso/5 p-4 text-sm leading-relaxed">
          <strong>{t("No es una alerta oficial ni un sistema de predicción.", "Not an official warning or a prediction system.")}</strong>{" "}
          {t("Sin eventos reportados no significa sin peligro. En una emergencia en Costa Rica, llame al 9-1-1 y siga a la CNE y los servicios de emergencia.", "No reported events does not mean no danger. In a Costa Rican emergency, call 9-1-1 and follow CNE and emergency services.")}
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            <SourceLink href="https://www.cne.go.cr/">CNE Costa Rica</SourceLink>
            <SourceLink href="https://www.imn.ac.cr/">{t("IMN · información meteorológica", "IMN · weather information")}</SourceLink>
          </div>
        </div>
      </section>

      <nav aria-label={t("En esta guía", "In this guide")} className="my-8 flex flex-wrap gap-2 text-sm">
        {[
          ["uso", t("Cómo usarla", "How to use it")],
          ["metodo", t("Cómo funciona", "How it works")],
          ["fuentes", t("Fuentes", "Sources")],
          ["limites", t("Límites", "Limitations")],
          ["autoevaluacion", t("Autoevaluación interna", "Internal self-assessment")],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-linea bg-elevada px-4 py-2 font-medium hover:bg-hundida">{label}</a>
        ))}
      </nav>

      <section id="uso" aria-labelledby="usage-title" className="scroll-mt-6 border-t border-linea pt-8">
        <h2 id="usage-title" className="text-2xl font-bold tracking-tight">{t("Una lectura en tres pasos", "Three steps to get started")}</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={index} className="rounded-2xl border border-linea bg-elevada p-5">
              <span className="flex size-8 items-center justify-center rounded-full bg-primario-suave text-sm font-bold text-primario-fuerte" aria-hidden="true">{index + 1}</span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{step.body}</p>
            </li>
          ))}
        </ol>
        <Link href="/" className="boton boton-principal mt-5">{t("Ir a Inicio", "Go to Home")}<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section id="metodo" aria-labelledby="method-title" className="mt-12 scroll-mt-6">
        <h2 id="method-title" className="text-2xl font-bold tracking-tight">{t("Cómo funciona y qué significa", "How it works and what it means")}</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-linea bg-elevada p-5 sm:p-6">
            <h3 className="text-lg font-semibold">{t("De la fuente al mapa", "From source to map")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("El servidor consulta y normaliza fuentes públicas. Aplica reglas de distancia, magnitud, nivel y antigüedad según la amenaza. Estar en la lista regional no equivale a afectar a su ubicación, y un evento reciente no siempre sigue en curso.", "The server queries and normalizes public feeds. It applies distance, magnitude, severity and age rules for each hazard. Appearing in the regional list does not mean affecting your location, and a recent event is not always ongoing.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("Por ejemplo, un sismo M4+ puede afectar el estado a 50 km; un M5+, a 150 km. Los reportes sísmicos cercanos en tiempo y lugar se agrupan, no se cuentan como sismos diferentes. Estos umbrales son reglas de la app, no pronósticos de impacto.", "For example, an M4+ earthquake can affect the status within 50 km; an M5+, within 150 km. Earthquake reports close in time and space are grouped rather than counted as different earthquakes. These thresholds are app rules, not impact forecasts.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("Las áreas estimadas solo aparecen para amenazas marcadas en curso. Revise también «Fuentes en vivo»: los datos pueden estar sin respuesta, desactualizados o en caché. El ritmo de consulta no garantiza la hora de publicación del organismo.", "Estimated areas appear only for hazards marked as ongoing. Also check “Live sources”: data can be unavailable, outdated or cached. Refresh frequency does not guarantee when an agency publishes its data.")}</p>
            <div className="mt-4 text-sm"><SourceLink href={`${REPO}/docs/producto/alertas.md`}>{t("Reglas completas de las alertas", "Full alert rules")}</SourceLink></div>
          </article>
          <article className="rounded-2xl border border-linea bg-elevada p-5 sm:p-6">
            <h3 className="text-lg font-semibold">{t("Del radar al cambio aparente", "From radar to apparent change")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("NISAR observa con radar, sin depender de la luz solar y atravesando las nubes. La app utiliza vistas previas PNG de 8 bits de L2 GCOV: HH en rojo y azul, HV en verde. No procesa el gamma0 calibrado del producto científico.", "NISAR observes with radar, independent of sunlight and through clouds. The app uses 8-bit PNG browse images of L2 GCOV: HH in red and blue, HV in green. It does not process calibrated gamma0 from the scientific product.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("Se comparan dos fechas: media 5×5 del canal HH y umbral de 38/255. La corrección de brillo usa la mediana de diferencias en el navegador y la media del cuadro en el precálculo: no son métodos idénticos. Se excluyen píxeles sin datos y valores oscuros en ambas fechas; la máscara no es una clasificación validada de agua.", "Two dates are compared using a 5×5 mean of the HH channel and a 38/255 threshold. Brightness correction uses the median difference in the browser and the frame mean in precomputation: these are not identical methods. No-data pixels and values dark in both dates are excluded; the mask is not a validated water classification.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("Azul indica menor brillo de radar; amarillo, mayor brillo. El porcentaje cuenta píxeles comparables no oscuros, no el área total ni el área dañada. No confirma inundación, daño o superficie quemada. El ciclo nominal de 12 días no garantiza una imagen disponible.", "Blue indicates lower radar brightness; yellow, higher brightness. The percentage counts comparable non-dark pixels, not total area or damaged area. It does not confirm flooding, damage or burned land. The nominal 12-day cycle does not guarantee an available image.")}</p>
            <div className="mt-4 text-sm"><SourceLink href={`${REPO}/docs/producto/nisar.md`}>{t("Método y zonas de demostración", "Method and demonstration areas")}</SourceLink></div>
          </article>
        </div>
      </section>

      <section id="fuentes" aria-labelledby="sources-title" className="mt-12 scroll-mt-6">
        <h2 id="sources-title" className="text-2xl font-bold tracking-tight">{t("Datos NASA y fuentes complementarias", "NASA data and complementary sources")}</h2>
        <p className="mt-3 max-w-[800px] text-sm leading-relaxed text-tinta-suave">{t("No todas las fuentes son de NASA ni todas son alertas oficiales. La procedencia y fecha del reporte importan más que un color. CNE e IMN se enlazan para consulta; no se extraen sus avisos automáticamente.", "Not all sources are NASA sources, and not all are official warnings. Report provenance and date matter more than a color. CNE and IMN are linked for reference; their notices are not automatically extracted.")}</p>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          {sources.map((source) => (
            <div key={source.name} className="rounded-xl border border-linea bg-elevada p-5">
              <dt className="text-sm"><SourceLink href={source.href}>{source.name}</SourceLink></dt>
              <dd className="mt-3 text-sm leading-relaxed text-tinta-suave">{source.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm"><SourceLink href={`${REPO}/docs/tecnico/fuentes.md`}>{t("Inventario técnico de fuentes y latencias", "Technical inventory of sources and latency")}</SourceLink></p>
      </section>

      <section id="limites" aria-labelledby="limits-title" className="mt-12 scroll-mt-6 rounded-2xl border border-linea bg-hundida/50 p-5 sm:p-7">
        <h2 id="limits-title" className="text-2xl font-bold tracking-tight">{t("Límites que no debemos ocultar", "Limitations we must not hide")}</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-tinta-suave">
          <li>{t("No predecimos sismos ni certificamos seguridad. Un pronóstico de lluvia es un modelo y un reporte sísmico preliminar puede revisarse.", "We do not predict earthquakes or certify safety. A rainfall forecast is a model and a preliminary earthquake report can be revised.")}</li>
          <li>{t("Los círculos del mapa son estimaciones simples; no son perímetros oficiales, mapas de evacuación ni rutas seguras.", "Map circles are simple estimates, not official perimeters, evacuation maps or safe routes.")}</li>
          <li>{t("Un cambio en una vista previa radar no demuestra su causa. Humedad, vegetación, geometría de observación y procesamiento pueden cambiar el brillo. Algunas pasadas son provisionales.", "A change in a radar browse image does not prove its cause. Moisture, vegetation, viewing geometry and processing can alter brightness. Some acquisitions are provisional.")}</li>
          <li>{t("Las bases y primeras pasadas del conjunto de demostración son provisionales; las últimas incluyen productos validados. Mezclar versiones de procesamiento puede producir diferencias que no son cambios del terreno. «Validado» describe el producto, no valida nuestra interpretación de daños.", "The demonstration dataset's baselines and early acquisitions are provisional; the latest include validated products. Mixing processing versions can produce differences unrelated to terrain changes. “Validated” describes the product; it does not validate our damage interpretation.")}</li>
          <li>{t("Las cuatro zonas precalculadas —Palo Verde, Caño Negro, Rincón de la Vieja y Tortuguero— no representan validación ni cobertura completa del país.", "The four precomputed areas—Palo Verde, Caño Negro, Rincón de la Vieja and Tortuguero—do not constitute validation or complete national coverage.")}</li>
          <li>{t("FIRMS está conectado pero los focos de calor permanecen ocultos en las alertas. Una anomalía térmica no es un incendio confirmado. Los datos GIBS y POWER no deben leerse como predicciones locales en tiempo real.", "FIRMS is connected but heat detections remain hidden from alerts. A thermal anomaly is not a confirmed wildfire. GIBS and POWER data must not be read as real-time local predictions.")}</li>
          <li>{t("Los avisos del navegador requieren permiso y la página abierta: no hay un servicio de notificaciones de emergencia en segundo plano.", "Browser notifications require permission and an open page: there is no background emergency notification service.")}</li>
          <li>{t("El idioma elegido se guarda localmente si el navegador lo permite. Los títulos y reportes originales pueden permanecer en su idioma de origen; no se traducen mediante servicios externos.", "Your language preference is saved locally when your browser permits it. Original titles and reports can remain in their source language; external translation services are not used.")}</li>
        </ul>
      </section>

      <section id="autoevaluacion" aria-labelledby="assessment-title" className="mt-12 scroll-mt-6">
        <p className="etiqueta">{t("Transparencia del prototipo", "Prototype transparency")}</p>
        <h2 id="assessment-title" className="mt-2 text-2xl font-bold tracking-tight">{t("Autoevaluación interna del hackathon", "Internal hackathon self-assessment")}</h2>
        <p className="mt-4 max-w-[850px] text-sm leading-relaxed text-tinta-suave">
          {t("Esta es una simulación del auditor en escala propia 0–4, no una calificación oficial, una rúbrica de NASA ni una predicción del jurado. Corresponde al commit 9256c87, revisado el 15 de noviembre de 2026, antes de incorporar esta ayuda y el selector de idioma. No se ha reevaluado la versión actual. No sumamos ni ponderamos: no hay pesos oficiales verificados.", "This is the auditor's simulation on its own 0–4 scale, not an official score, a NASA rubric or a prediction of judging results. It covers commit 9256c87, reviewed on November 15, 2026, before this guide and language selector were added. The current version has not been reassessed. We neither total nor weight scores: no official weights have been verified.")}
        </p>
        <p className="mt-3 max-w-[850px] text-sm leading-relaxed text-tinta-suave">
          {t("El auditor consultó las páginas oficiales mediante contenido indexado, no lectura directa; por eso estos nombres orientan nuestra revisión interna y no certifican los criterios vigentes del evento.", "The auditor consulted official pages through indexed content rather than direct access; these labels therefore guide our internal review and do not certify the event's current criteria.")}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <SourceLink href="https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/">{t("Página del reto", "Challenge page")}</SourceLink>
          <SourceLink href={`${REPO}/docs/qa/challenge-review.md`}>{t("Auditoría y alcance de la verificación", "Audit and verification scope")}</SourceLink>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {evaluation.map((item) => (
            <article key={item.href} className="rounded-2xl border border-linea bg-elevada p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-xs font-semibold text-primario-fuerte">{item.status}</p>
                <span className="rounded-full bg-hundida px-3 py-1 text-xs font-semibold">
                  {item.criterion} · {item.score}/4 {t("interno", "internal")}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-tinta-suave"><strong className="text-tinta">{t("Evidencia: ", "Evidence: ")}</strong>{item.evidence}</p>
              <p className="mt-3 text-sm leading-relaxed text-tinta-suave"><strong className="text-tinta">{t("Falta validar: ", "Still to validate: ")}</strong>{item.gap}</p>
              <div className="mt-4 text-sm"><SourceLink href={item.href}>{t("Consultar evidencia en el repositorio", "View repository evidence")}</SourceLink></div>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-linea pt-6 text-sm leading-relaxed text-tinta-suave">
        <p>{t("Hecho por Astral Codes para NASA Space Apps 2026. Identidad gráfica propia de Memoria de Fuego; no implica afiliación ni respaldo de NASA, ISRO o las agencias citadas.", "Built by Astral Codes for NASA Space Apps 2026. Memoria de Fuego's own visual identity does not imply affiliation with or endorsement by NASA, ISRO or the cited agencies.")}</p>
        <p className="mt-2">{t("Se usó asistencia de IA para desarrollar código y textos de esta interfaz. Las interpretaciones científicas requieren revisión humana.", "AI assistance was used to develop code and text for this interface. Scientific interpretations require human review.")}</p>
        <p className="mt-2">{t("Referencia del conjunto precalculado: manifiesto generado el 15 de noviembre de 2026 a las 04:06 UTC; no es la hora de actualización de cada fuente ni la fecha de cada imagen. Código disponible públicamente; la licencia de reutilización aún debe confirmarse.", "Precomputed dataset reference: manifest generated November 15, 2026 at 04:06 UTC; this is not each feed's update time or each image's acquisition date. Code is publicly available; its reuse license remains to be confirmed.")}</p>
      </footer>
    </main>
  );
}
