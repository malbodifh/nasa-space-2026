import { affects, isCurrent } from "@/lib/alert-rules";
import type { DisasterAlert } from "@/lib/types";

type Text = readonly [es: string, en: string];
type Guide = { steps: readonly Text[]; es: string; en: string; source: string };

const preparation: Guide = {
  steps: [
    ["Tenga a mano sus contactos, medicamentos y suministros esenciales; acuerde un punto de encuentro familiar.", "Keep contacts, medicines and essential supplies ready; agree on a family meeting point."],
    ["Consulte a la CNE y a las autoridades locales. Si percibe peligro real, protéjase aunque la app no muestre alertas.", "Check CNE and local authorities. If you notice actual danger, protect yourself even if the app shows no alerts."],
  ],
  es: "https://www.ready.gov/es/haga-un-plan",
  en: "https://www.ready.gov/plan",
  source: "Ready.gov / FEMA",
};

const guides: Record<string, Guide> = {
  earthquakes: {
    steps: [
      ["Si siente una sacudida: agáchese, cúbrase y agárrese. Si está dentro, permanezca dentro durante el movimiento y aléjese de ventanas.", "If you feel shaking: drop, cover and hold on. If indoors, stay inside during shaking and away from windows."],
      ["Después, evite edificios dañados y cables caídos. Puede haber réplicas; protéjase si vuelve a sentir movimiento.", "Afterward, avoid damaged buildings and fallen power lines. Aftershocks are possible; protect yourself if shaking resumes."],
    ],
    es: "https://www.ready.gov/es/terremotos", en: "https://www.ready.gov/earthquakes", source: "Ready.gov / FEMA",
  },
  tsunami: {
    steps: [
      ["Si está en la costa y siente un sismo fuerte o prolongado, observa un retiro inusual del mar o escucha un fuerte rugido: vaya a zonas altas o tierra adentro cuando pueda moverse con seguridad. No espere una notificación de la app.", "If on the coast and you feel a strong or long earthquake, see an unusual sea retreat or hear a loud ocean roar: move to high ground or inland as soon as you can safely move. Do not wait for an app notification."],
      ["Manténgase lejos de playas y desembocaduras; siga las rutas señalizadas y las instrucciones locales. No regrese hasta que las autoridades lo indiquen.", "Stay away from beaches and river mouths; follow posted routes and local instructions. Do not return until authorities say it is safe."],
    ],
    es: "https://www.weather.gov/safety/tsunami-during", en: "https://www.weather.gov/safety/tsunami-during", source: "NOAA / NWS (EN)",
  },
  floods: {
    steps: [
      ["No camine ni conduzca por calles inundadas; no cruce ríos o quebradas crecidas.", "Do not walk or drive through flooded roads; do not cross swollen rivers or streams."],
      ["Si las autoridades ordenan evacuar, siga sus instrucciones y rutas. No use la distancia de este reporte como límite de una inundación.", "If authorities order evacuation, follow their instructions and routes. Do not treat this report's distance as a flood boundary."],
    ],
    es: "https://www.ready.gov/es/inundaciones", en: "https://www.ready.gov/floods", source: "Ready.gov / FEMA",
  },
  severeStorms: {
    steps: [
      ["Si hay vientos fuertes y no le han indicado evacuar, busque refugio en una habitación interior, lejos de ventanas.", "If strong winds occur and you have not been told to evacuate, shelter in an interior room away from windows."],
      ["Revise las instrucciones locales de evacuación y no atraviese aguas de inundación. La distancia al centro del ciclón no delimita sus efectos.", "Check local evacuation instructions and do not enter floodwater. Distance to a cyclone's center does not define its impacts."],
    ],
    es: "https://www.ready.gov/es/huracanes", en: "https://www.ready.gov/hurricanes", source: "Ready.gov / FEMA",
  },
  volcanoes: {
    steps: [
      ["Siga las restricciones y rutas oficiales. Evite acercarse al volcán y a los cauces que bajan de él.", "Follow official restrictions and routes. Avoid approaching the volcano and river channels downstream."],
      ["Si cae ceniza y no le han indicado evacuar, reduzca la exposición al aire libre y cierre puertas y ventanas. Consulte los avisos de OVSICORI y la CNE.", "If ash falls and you have not been told to evacuate, reduce outdoor exposure and close doors and windows. Check OVSICORI and CNE notices."],
    ],
    es: "https://www.ready.gov/es/volcanes", en: "https://www.ready.gov/volcanoes", source: "Ready.gov / FEMA",
  },
  landslides: {
    steps: [
      ["Si observa grietas nuevas, movimiento de tierra o ruidos inusuales en una ladera, aléjese de la zona si puede hacerlo de forma segura y avise a las autoridades.", "If you notice new cracks, ground movement or unusual sounds on a slope, leave the area if you can do so safely and notify authorities."],
      ["No se acerque para inspeccionar el deslizamiento; siga los cierres y las instrucciones de los equipos de emergencia.", "Do not approach to inspect a landslide; follow closures and emergency responders' instructions."],
    ],
    es: "https://www.ready.gov/es/deslizamientos-de-tierra-y-avalanchas", en: "https://www.ready.gov/landslides-debris-flow", source: "Ready.gov / FEMA",
  },
  wildfires: {
    steps: [
      ["Prepare su ruta de salida y siga las instrucciones de las autoridades si le indican evacuar. No espere una actualización de esta app.", "Prepare your exit route and follow authorities' instructions if told to evacuate. Do not wait for this app to update."],
      ["Evite acercarse al fuego y reduzca la exposición al humo. Un foco satelital no confirma por sí solo un incendio ni su extensión.", "Do not approach a fire and reduce smoke exposure. A satellite hotspot alone does not confirm a wildfire or its extent."],
    ],
    es: "https://www.ready.gov/es/incendios-forestales", en: "https://www.ready.gov/wildfires", source: "Ready.gov / FEMA",
  },
};

const aliases: Record<string, string> = {
  EQ: "earthquakes", TC: "severeStorms", FL: "floods", VO: "volcanoes", WF: "wildfires", heavyRain: "floods",
};

/** Prioridad para leer un reporte, no estimación de daño ni intensidad local. */
export function safetyAdvice(alert: DisasterAlert | null, now = Date.now()) {
  const current = alert !== null && isCurrent(alert, now);
  const distanceKnown = alert !== null && Number.isFinite(alert.distanceKm) && alert.distanceKm >= 0;
  const relevant = current && distanceKnown && affects(alert);
  const priority = relevant && (alert.level === "red" || alert.level === "orange");
  return {
    mode: !current ? "prepare" : !distanceKnown ? "unknown" : priority ? "priority" : "followup",
    current,
    distanceKnown,
    relevant,
    guide: current ? guides[aliases[alert.category] ?? alert.category] ?? preparation : preparation,
  } as const;
}

/** El orden de entrada desempata por cercanía; no determina la gravedad real. */
export function selectAdviceAlert(alerts: DisasterAlert[], now = Date.now()): DisasterAlert | null {
  return alerts.find((alert) => safetyAdvice(alert, now).mode === "priority")
    ?? alerts.find((alert) => safetyAdvice(alert, now).current && safetyAdvice(alert, now).relevant)
    ?? alerts.find((alert) => safetyAdvice(alert, now).current)
    ?? alerts[0]
    ?? null;
}
