"use client";

import Link from "next/link";
import { ArrowRight, Bell, ExternalLink, Globe, Heart, Languages, MapPinned, Satellite } from "lucide-react";

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
      title: t("Elija su ubicación", "Choose your location"),
      body: t("Pulse «Usar mi ubicación» y la app le muestra al instante qué está pasando cerca de usted. La app recuerda su ubicación para la próxima vez.", "Select “Use my location” and the app instantly shows what is happening near you. It remembers your location for next time."),
    },
    {
      title: t("Revise las alertas", "Review the alerts"),
      body: t("Cada alerta muestra la fecha, la distancia, la fuente y un enlace al reporte original, para que entienda cada evento de un vistazo.", "Each alert shows the date, distance, source and a link to the original report, so you can understand every event at a glance."),
    },
    {
      title: t("Explore la superficie", "Explore the surface"),
      body: t("Desde cualquier evento, abra el estudio de superficie y compare imágenes de radar NISAR de distintas fechas para ver cómo cambió el terreno.", "From any event, open the surface study and compare NISAR radar images from different dates to see how the land changed."),
    },
  ];
  const features = [
    {
      icon: MapPinned,
      title: t("Alertas cerca de usted", "Alerts near you"),
      body: t("Sismos, volcanes, tsunamis, ciclones, lluvias fuertes e inundaciones en un solo mapa, con su estado según su ubicación.", "Earthquakes, volcanoes, tsunamis, cyclones, heavy rain and floods on one map, with a status based on your location."),
    },
    {
      icon: Bell,
      title: t("Avisos en su teléfono", "Notifications on your phone"),
      body: t("Instale la app y reciba avisos cuando algo le afecta, incluso con la app cerrada.", "Install the app and get notified when something affects you, even with the app closed."),
    },
    {
      icon: Heart,
      title: t("Seres queridos", "Loved ones"),
      body: t("Comparta un link con su familia y reciba un aviso, con un pin en el mapa, si alguno de ellos está en riesgo. Solo se comparte una zona aproximada.", "Share a link with your family and get a notification, with a pin on the map, if any of them is at risk. Only an approximate area is shared."),
    },
    {
      icon: Satellite,
      title: t("Radar NASA–ISRO NISAR", "NASA–ISRO NISAR radar"),
      body: t("El radar ve a través de las nubes, de día y de noche. La app convierte sus imágenes en una comparación visual fácil de entender.", "Radar sees through clouds, day and night. The app turns its imagery into an easy-to-read visual comparison."),
    },
    {
      icon: Globe,
      title: t("Fuentes confiables", "Trusted sources"),
      body: t("Datos de NASA, NOAA, USGS, OVSICORI, RSN y GDACS reunidos y actualizados en un solo lugar.", "Data from NASA, NOAA, USGS, OVSICORI, RSN and GDACS, gathered and kept up to date in one place."),
    },
    {
      icon: Languages,
      title: t("Inglés y español", "English and Spanish"),
      body: t("Toda la interfaz está disponible en los dos idiomas y la app recuerda su preferencia.", "The whole interface is available in both languages and the app remembers your choice."),
    },
  ];
  const sources = [
    {
      name: "NASA–ISRO NISAR · ASF DAAC / CMR",
      href: "https://nisar.jpl.nasa.gov/",
      body: t("Imágenes de radar en banda L del producto L2 GCOV. ASF las distribuye y CMR permite buscar cada pasada del satélite. Son el corazón del estudio de superficie.", "L-band radar imagery from the L2 GCOV product. ASF distributes it and CMR lets us find every satellite pass. It is the heart of the surface study."),
    },
    {
      name: "NASA EONET",
      href: "https://eonet.gsfc.nasa.gov/",
      body: t("Catálogo de eventos naturales de NASA, con su historial.", "NASA's catalog of natural events, with their history."),
    },
    {
      name: "USGS · OVSICORI–UNA · RSN UCR–ICE",
      href: "https://www.ovsicori.una.ac.cr/",
      body: t("Reportes sísmicos regionales y locales con magnitud, profundidad y estado de revisión. Cuando varias redes reportan el mismo sismo, la app los une en uno solo.", "Regional and local earthquake reports with magnitude, depth and review status. When several networks report the same earthquake, the app merges them into one."),
    },
    {
      name: "NOAA PTWC / NTWC · NOAA NHC",
      href: "https://www.tsunami.gov/",
      body: t("Boletines de tsunami y ciclones tropicales activos.", "Tsunami bulletins and active tropical cyclones."),
    },
    {
      name: "GDACS · Open-Meteo",
      href: "https://www.gdacs.org/",
      body: t("GDACS aporta niveles de alerta internacionales y Open-Meteo, el pronóstico de lluvia.", "GDACS provides international alert levels and Open-Meteo provides rainfall forecasts."),
    },
    {
      name: "NASA Worldview · OpenStreetMap · Carto",
      href: "https://worldview.earthdata.nasa.gov/",
      body: t("Worldview aporta imágenes ópticas MODIS; OpenStreetMap, caminos y áreas protegidas; Carto, el mapa base.", "Worldview provides MODIS optical imagery; OpenStreetMap, roads and protected areas; Carto, the basemap."),
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
          {t("Gamma Alert reúne en un solo lugar los reportes de desastres naturales en Costa Rica y le avisa cuando algo le afecta a usted o a su familia. Con el radar NASA–ISRO NISAR, además, permite ver cómo cambió la superficie de la Tierra después de cada evento.", "Gamma Alert brings natural-hazard reports for Costa Rica together in one place and notifies you when something affects you or your family. With NASA–ISRO NISAR radar, it also lets you see how the Earth's surface changed after each event.")}
        </p>
        <div className="mt-6 rounded-xl border border-primario/30 bg-primario-suave/40 p-4 text-sm leading-relaxed">
          {t("Gamma Alert complementa a los servicios oficiales. En una emergencia en Costa Rica, llame al 9-1-1 y siga las indicaciones de la CNE.", "Gamma Alert complements official services. In a Costa Rican emergency, call 9-1-1 and follow CNE guidance.")}
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            <SourceLink href="https://www.cne.go.cr/">CNE Costa Rica</SourceLink>
            <SourceLink href="https://www.imn.ac.cr/">{t("IMN · información meteorológica", "IMN · weather information")}</SourceLink>
          </div>
        </div>
      </section>

      <nav aria-label={t("En esta guía", "In this guide")} className="my-8 flex flex-wrap gap-2 text-sm">
        {[
          ["uso", t("Cómo usarla", "How to use it")],
          ["funciones", t("Qué ofrece", "What it offers")],
          ["metodo", t("Cómo funciona", "How it works")],
          ["fuentes", t("Fuentes", "Sources")],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-linea bg-elevada px-4 py-2 font-medium hover:bg-hundida">{label}</a>
        ))}
      </nav>

      <section id="uso" aria-labelledby="usage-title" className="scroll-mt-6 border-t border-linea pt-8">
        <h2 id="usage-title" className="text-2xl font-bold tracking-tight">{t("Empiece en tres pasos", "Three steps to get started")}</h2>
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

      <section id="funciones" aria-labelledby="features-title" className="mt-12 scroll-mt-6">
        <h2 id="features-title" className="text-2xl font-bold tracking-tight">{t("Qué ofrece Gamma Alert", "What Gamma Alert offers")}</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-linea bg-elevada p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primario-suave text-primario-fuerte" aria-hidden="true"><Icon size={20} /></span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="metodo" aria-labelledby="method-title" className="mt-12 scroll-mt-6">
        <h2 id="method-title" className="text-2xl font-bold tracking-tight">{t("Cómo funciona", "How it works")}</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-linea bg-elevada p-5 sm:p-6">
            <h3 className="text-lg font-semibold">{t("De la fuente al mapa", "From source to map")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("El servidor consulta las fuentes públicas, unifica sus datos y aplica reglas de distancia, magnitud, nivel y antigüedad para cada amenaza. Así la app sabe qué eventos le afectan y cuáles están en curso.", "The server queries public feeds, unifies their data and applies distance, magnitude, severity and age rules for each hazard. That is how the app knows which events affect you and which are ongoing.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("Por ejemplo, un sismo M4+ cuenta a 50 km y uno M5+ a 150 km. Cuando varias redes reportan el mismo sismo, se muestra como uno solo.", "For example, an M4+ earthquake counts within 50 km and an M5+ within 150 km. When several networks report the same earthquake, it is shown as one.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("Cada pocos minutos, el servidor revisa su zona y la de sus seres queridos y envía un aviso cuando hace falta.", "Every few minutes, the server checks your area and your loved ones' areas and sends a notification when needed.")}</p>
            <div className="mt-4 text-sm"><SourceLink href={`${REPO}/docs/producto/alertas.md`}>{t("Reglas completas de las alertas", "Full alert rules")}</SourceLink></div>
          </article>
          <article className="rounded-2xl border border-linea bg-elevada p-5 sm:p-6">
            <h3 className="text-lg font-semibold">{t("Del radar al cambio", "From radar to change")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("NISAR observa con radar, sin depender de la luz del sol y atravesando las nubes. La app usa las vistas previas del producto L2 GCOV: HH en rojo y azul, HV en verde.", "NISAR observes with radar, independent of sunlight and through clouds. The app uses L2 GCOV browse images: HH in red and blue, HV in green.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("Se comparan dos fechas con un promedio 5×5 del canal HH y un umbral de 38/255, corrigiendo el brillo general entre imágenes.", "Two dates are compared using a 5×5 mean of the HH channel and a 38/255 threshold, correcting overall brightness between images.")}</p>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{t("En el resultado, azul indica menos brillo de radar y amarillo, más brillo. Así se ve de un vistazo dónde cambió el terreno.", "In the result, blue means less radar brightness and yellow means more. That shows at a glance where the land changed.")}</p>
            <div className="mt-4 text-sm"><SourceLink href={`${REPO}/docs/producto/nisar.md`}>{t("Método y zonas de demostración", "Method and demonstration areas")}</SourceLink></div>
          </article>
        </div>
      </section>

      <section id="fuentes" aria-labelledby="sources-title" className="mt-12 scroll-mt-6">
        <h2 id="sources-title" className="text-2xl font-bold tracking-tight">{t("Datos NASA y fuentes complementarias", "NASA data and complementary sources")}</h2>
        <p className="mt-3 max-w-[800px] text-sm leading-relaxed text-tinta-suave">{t("Cada alerta indica su fuente y enlaza al reporte original.", "Every alert names its source and links to the original report.")}</p>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          {sources.map((source) => (
            <div key={source.name} className="rounded-xl border border-linea bg-elevada p-5">
              <dt className="text-sm"><SourceLink href={source.href}>{source.name}</SourceLink></dt>
              <dd className="mt-3 text-sm leading-relaxed text-tinta-suave">{source.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm"><SourceLink href={`${REPO}/docs/tecnico/fuentes.md`}>{t("Inventario técnico de fuentes", "Technical inventory of sources")}</SourceLink></p>
      </section>

      <footer className="mt-12 border-t border-linea pt-6 text-sm leading-relaxed text-tinta-suave">
        <p>{t("Creada por Astral Codes para el NASA International Space Apps Challenge 2026, con datos abiertos de NASA, NASA–ISRO NISAR y agencias científicas de todo el mundo.", "Created by Astral Codes for the NASA International Space Apps Challenge 2026, powered by open data from NASA, NASA–ISRO NISAR and scientific agencies around the world.")}</p>
        <p className="mt-2">{t("Código abierto y disponible en GitHub.", "Open source and available on GitHub.")} <SourceLink href="https://github.com/malbodifh/nasa-space-2026">GitHub</SourceLink></p>
      </footer>
    </main>
  );
}
