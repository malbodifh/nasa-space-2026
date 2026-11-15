import type { EventItem } from "@/lib/events";
import { formatWhen, OFFICIAL_LABEL, timeAgo } from "@/lib/events";
import type { SarStory, SarZone } from "@/lib/sar";

export type DisplayLocale = "es" | "en";

export function intlLocale(locale: DisplayLocale): string {
  return locale === "en" ? "en-US" : "es-CR";
}

/** Calendar dates from satellite products are UTC dates, not local instants. */
export function displayDate(date: string, locale: DisplayLocale, year = true): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: year ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}

export function displayPct(value: number, locale: DisplayLocale): string {
  return `${value.toLocaleString(intlLocale(locale), { maximumFractionDigits: 1 })} %`;
}

export function displayWhen(date: string, locale: DisplayLocale, now = new Date()): string {
  if (locale === "es") return formatWhen(date, now);
  const at = Date.parse(date);
  if (!Number.isFinite(at)) return "";
  const minutes = Math.max(0, Math.round((now.getTime() - at) / 60_000));
  const hasTime = date.length > 10 && !/T00:00(:00(\.0+)?)?Z$/.test(date);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: minutes > 300 * 24 * 60 ? "numeric" : undefined,
    timeZone: hasTime ? "America/Costa_Rica" : "UTC",
  }).format(new Date(at));
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Costa_Rica",
  }).format(new Date(at));
  const ago = minutes < 60 ? `${minutes} min ago`
    : minutes < 48 * 60 ? `${Math.round(minutes / 60)} h ago`
      : minutes < 7 * 24 * 60 ? `${Math.round(minutes / 1440)} days ago` : null;
  const when = hasTime ? `${day}, ${time}` : day;
  return ago ? `${when} · ${ago}` : when;
}

export function displayTimeAgo(date: string, locale: DisplayLocale, now = new Date()): string {
  if (locale === "es") return timeAgo(date, now);
  const at = Date.parse(date);
  if (!Number.isFinite(at)) return "";
  const minutes = Math.max(0, Math.round((now.getTime() - at) / 60_000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 48 * 60) return `${Math.round(minutes / 60)} h ago`;
  if (minutes < 30 * 24 * 60) return `${Math.round(minutes / 1440)} days ago`;
  return displayDate(date, locale, now.getTime() - at > 300 * 86_400_000);
}

const CATEGORIES: Record<string, string> = {
  earthquakes: "Earthquake", earthquake: "Earthquake", sismo: "Earthquake", sismos: "Earthquakes",
  tsunami: "Tsunami", tsunamis: "Tsunami",
  volcanoes: "Volcano", volcano: "Volcano", volcan: "Volcano", volcán: "Volcano", volcanes: "Volcanoes",
  floods: "Flood", flood: "Flood", inundación: "Flood", inundaciones: "Floods",
  severeStorms: "Severe storm", storms: "Storm", storm: "Storm", tormenta: "Storm", tormentas: "Storms",
  tropicalCyclones: "Tropical cyclone", cyclone: "Tropical cyclone", ciclón: "Tropical cyclone",
  hurricanes: "Hurricane", huracán: "Hurricane",
  rainfall: "Heavy rain", rain: "Heavy rain", "heavy-rain": "Heavy rain", "lluvia fuerte": "Heavy rain", lluvia: "Rain",
  landslides: "Landslide", landslide: "Landslide", deslizamiento: "Landslide", deslizamientos: "Landslides",
  wildfires: "Wildfire", wildfire: "Wildfire", incendio: "Wildfire", incendios: "Wildfires",
  drought: "Drought", droughts: "Drought", sequía: "Drought", sequías: "Droughts",
  dustHaze: "Dust and haze", "polvo y bruma": "Dust and haze", polvo: "Dust",
  seaLakeIce: "Sea and lake ice", snow: "Snow", snowIce: "Snow and ice", nieve: "Snow",
  temperatureExtremes: "Temperature extremes", waterColor: "Water color", manmade: "Human-caused event",
  hielo: "Ice", agua: "Water", antrópico: "Human-caused event", "temperatura extrema": "Temperature extreme",
  "ciclón o tormenta": "Cyclone or storm",
  EQ: "Earthquake", TC: "Tropical cyclone", FL: "Flood", VO: "Volcano", DR: "Drought", WF: "Wildfire",
  radar: "Detected by radar", "detectado por radar": "Detected by radar", todos: "All",
};

export function categoryLabel(category: string, fallback: string, locale: DisplayLocale): string {
  return locale === "es" ? fallback : CATEGORIES[category] ?? CATEGORIES[fallback.toLowerCase()] ?? fallback;
}

const OFFICIAL_EN: Record<string, string> = {
  RSN: "RSN report", OVSICORI: "OVSICORI website", USGS: "USGS event page",
  PTWC: "Tsunami center bulletin", NHC: "NHC advisory", "NASA FIRMS": "FIRMS map",
  GDACS: "GDACS report", "NASA EONET": "EONET source", "Open-Meteo": "Open-Meteo forecast",
};

export function officialLabel(source: string, locale: DisplayLocale): string {
  return locale === "es" ? OFFICIAL_LABEL[source] ?? "Reporte original" : OFFICIAL_EN[source] ?? "Original report";
}

export function sourceLabel(label: string, locale: DisplayLocale): string {
  if (locale === "es") return label;
  return label.replace(/^Ciclones · /, "Cyclones · ")
    .replace(/^Fuegos · /, "Fires · ")
    .replace(/^Lluvia · /, "Rain · ")
    .replace(/^Sismos sentidos · /, "Felt earthquakes · ")
    .replace(/^Sismos · /, "Earthquakes · ")
    .replace(/^Historial · /, "History · ");
}

function generatedTitle(title: string): string {
  return title.replace(/^Se pronostican (.+) mm de lluvia en 24 horas$/, "$1 mm of rain forecast over 24 hours");
}

/** Translate only app-authored radar headings. Source report titles remain verbatim. */
export function eventTitle(item: Pick<EventItem, "title" | "kind" | "id">, locale: DisplayLocale): string {
  if (locale === "en" && item.id.startsWith("demo-")) {
    return DEMO_EN[item.id.split("-")[1]]?.title ?? `Simulated alert · ${item.title}`;
  }
  if (locale === "es") return item.title;
  if (item.kind !== "radar") return generatedTitle(item.title);
  const id = item.id.split(":")[1];
  const story = EN_STORIES[id];
  return story ? `Surface change in ${story.name}` : item.title;
}

/** Only known app-authored headings; original third-party report titles are not translated. */
export function studyTitle(title: string, locale: DisplayLocale): string {
  if (locale === "es") return title;
  const demo = Object.values(DEMO_EN).find((item) => item.titleEs === title);
  if (demo) return demo.title;
  for (const [id, story] of Object.entries(EN_STORIES)) {
    if (title === `Cambio de la superficie en ${ES_ZONE_NAMES[id]}`) return `Surface change in ${story.name}`;
  }
  return generatedTitle(title);
}

/** Known app-authored annotations only; never machine-translate source reports. */
export function displayDetail(detail: string, locale: DisplayLocale): string {
  if (locale === "es") return detail;
  const scenario = Object.values(DEMO_EN).find((item) => item.detailEs && detail.includes(item.detailEs));
  if (detail.startsWith("Simulación, no es un evento real.")) {
    return `Simulation, not a real event. ${scenario?.detail ?? ""}`.trim();
  }
  return detail
    .replaceAll("Comparación de vistas previas de 8 bits. No identifica la causa ni confirma daños.", "Comparison of 8-bit previews. It does not identify the cause or confirm damage.")
    .replaceAll("Sin reportes nuevos desde esta fecha.", "No new reports since this date.")
    .replaceAll("Pronóstico de modelo, no es un aviso oficial del IMN.", "Model forecast, not an official IMN advisory.")
    .replaceAll("Sin peligro de tsunami según el centro de alerta.", "No tsunami danger according to the warning center.")
    .replaceAll("Amenaza de tsunami", "Tsunami threat")
    .replaceAll("Advertencia de tsunami", "Tsunami warning")
    .replaceAll("Vigilancia de tsunami", "Tsunami watch")
    .replaceAll("Aviso de tsunami", "Tsunami advisory")
    .replaceAll("Boletín informativo", "Information bulletin")
    .replace(/^Sentido en /, "Felt in ")
    .replace(/^Intensidad máxima estimada /, "Estimated maximum intensity ")
    .replace(/^Vientos de /, "Winds of ")
    .replaceAll("Preliminar", "Preliminary")
    .replaceAll("Revisado", "Reviewed")
    .replaceAll("Pronóstico", "Forecast");
}

const DEMO_EN: Record<string, { label: string; hint: string; title: string; titleEs: string; detailEs: string; detail: string }> = {
  sismo: { label: "Strong earthquake", hint: "M 6.1 at 35 km", title: "M 6.1 · Simulated earthquake", titleEs: "M 6.1 · Sismo simulado", detailEs: "Profundidad 14 km", detail: "Depth 14 km · strongly felt in the region." },
  tsunami: { label: "Tsunami", hint: "Pacific tsunami warning", title: "Simulated tsunami warning", titleEs: "Advertencia de tsunami simulada", detailEs: "Aléjese de la costa", detail: "Move away from the coast and to higher ground." },
  huracan: { label: "Hurricane", hint: "Category 2 at 180 km", title: "Simulated hurricane", titleEs: "Huracán Demo", detailEs: "Vientos de 165 km/h", detail: "Winds of 165 km/h · approaching the coast." },
  volcan: { label: "Eruption", hint: "Volcano at 12 km", title: "Simulated eruption", titleEs: "Erupción simulada", detailEs: "Columna de ceniza de 2 km", detail: "2 km ash column · avoid the area near the crater." },
  inundacion: { label: "Flood", hint: "River overflow at 20 km", title: "Simulated river overflow", titleEs: "Desborde de río simulado", detailEs: "Zonas bajas en alerta", detail: "Low-lying areas on alert · avoid river crossings." },
  todo: { label: "All at once", hint: "All simulated scenarios", title: "", titleEs: "", detailEs: "", detail: "" },
};

export function demoScenarioText(id: string, locale: DisplayLocale): { label: string; hint: string } | null {
  return locale === "en" ? DEMO_EN[id] ?? null : null;
}

type DisplayStory = Omit<SarStory, "center">;
const ES_ZONE_NAMES: Record<string, string> = {
  "palo-verde": "Palo Verde y bajo Tempisque", "cano-negro": "Caño Negro y río Frío",
  "rincon-de-la-vieja": "Volcán Rincón de la Vieja", tortuguero: "Tortuguero",
};
const EN_STORIES: Record<string, DisplayStory> = {
  "palo-verde": {
    name: "Palo Verde and lower Tempisque", region: "Guanacaste", kind: "Seasonal wetland and rice fields",
    lead: "The Tempisque River floodplain dries out in the dry season and becomes wet with the rains. Radar records the change even under cloud cover.",
    look: [
      "Preview brightness changes very little through September 18. On September 30, about 13 % of comparable pixels suddenly become brighter.",
      "Orange covers large, straight-edged plots to the northwest and strips along the Tempisque.",
      "Magenta patches along the river (strong HH) expand in October and November.",
      "Rincón de la Vieja, in the same satellite pass, changes by only around 2 % of comparable preview pixels: the jump is concentrated in the lowlands, not across the entire image.",
    ],
    hypotheses: [
      "Wet soil: water raises the soil's dielectric constant and produces a stronger echo. Heavy rain in late September could explain a widespread jump in flat lowlands. This can be checked against daily NASA POWER or IMERG rainfall.",
      "Double bounce: when water covers the ground beneath reeds, grass or rice, the signal bounces off the water and then the stems, returning strongly in HH. This could explain the magenta along the river.",
      "Rectangular shapes suggest irrigation and planting of rice or sugarcane: human activity, not just the wetland's natural cycle. This is a hypothesis, not a confirmed cause.",
    ],
    human: "The lower Tempisque combines a national park and Ramsar wetland with irrigation districts. Plot shapes help investigate natural versus agricultural flooding, but do not establish causation.",
  },
  "cano-negro": {
    name: "Caño Negro and Frío River", region: "Northern region", kind: "Stable floodplain during the rainy season",
    lead: "Caño Negro's lagoons fill with rain and drain toward Lake Nicaragua. Between July and November, radar sees them as almost unchanged.",
    look: [
      "Less than 1 % of comparable preview pixels change in each pass after July 20.",
      "The few changes are to the north, along channels flowing toward the San Juan River.",
      "The black lagoons and gray floodplain grasslands retain their shape throughout the period.",
    ],
    hypotheses: [
      "By July, the rainy season had been underway for two months: the floodplain may already have been waterlogged and remained so. Observing the rise would require a dry-season pass (March–April).",
      "Smooth open water reflects the signal away from the satellite and appears black. Blue shoreline pixels may be new open water; orange ones may be vegetation standing in water.",
      "The small change, compared with Palo Verde's jump on the same day, suggests late-September rain may have been heavier in Guanacaste than in the northern region. Rainfall data are needed to test this.",
    ],
    human: "Pastures and monocultures (pineapple, sugarcane) surround the refuge. A plot with an abrupt brightness change may reflect planting or harvesting; radar alone cannot confirm the cause.",
  },
  "rincon-de-la-vieja": {
    name: "Rincón de la Vieja volcano", region: "Guanacaste", kind: "Active volcano and mountain range",
    lead: "One of the country's most active volcanoes, with frequent steam-driven eruptions. EONET volcano alerts lead here.",
    look: [
      "The cone and mountain forests appear white and greenish: dense vegetation.",
      "Less than 2 % of comparable preview pixels change between July and November, mainly in pastures on the lower slopes.",
      "No strong brightness change appears near the crater during this period.",
    ],
    hypotheses: [
      "An eruption with lahars could leave smooth mud and ash deposits in rivers below the crater: they might appear darker (blue on the change map). This is an expected signature, not evidence of a detected lahar.",
      "Detecting a few centimeters of volcanic inflation or deflation requires interferometry: the NISAR GUNW product compares phase between passes. That is a possible next step, not part of this view.",
      "Slopes facing the satellite are brighter than those facing away; this is why we compare passes from the same orbit.",
    ],
    human: "The national park borders cattle farms and the Las Pailas and Borinquen geothermal plants.",
  },
  tortuguero: {
    name: "Tortuguero", region: "Caribbean", kind: "Control area: stable flooded forest",
    lead: "Dense forest, canals and year-round rain. A comparison area: a suitable method should flag very little change here.",
    look: [
      "The forest appears white and greenish throughout the period: strong HH and HV.",
      "The change map is almost empty on land (less than 0.5 % of comparable preview pixels).",
      "Wind changes the sea's tone; the method ignores it because it is water on both dates.",
    ],
    hypotheses: [
      "L-band (24 cm) penetrates part of the canopy: the signal scatters among branches and trunks and returns in HV. This helps explain the green and white forest.",
      "A persistently wet, covered forest may have a nearly stable response between June and November: it provides a comparison baseline for the other areas, not independent validation.",
      "A strong change here could suggest clearing, extreme flooding or a processing error. Additional evidence would be needed to distinguish them.",
    ],
    human: "Banana plantations begin to the southwest. Forest clearing could appear as an abrupt loss of HV brightness (less vegetation volume); this view does not confirm clearing or measure damage.",
  },
};

export function displayStory(zone: SarZone, locale: DisplayLocale): DisplayStory {
  if (locale === "en") return EN_STORIES[zone.id] ?? zone;
  return {
    ...zone,
    look: zone.look.map((text) => text
      .replace("13 % se vuelve más brillante", "13 % de los píxeles comparables de la vista previa se vuelve más brillante")
      .replace("apenas sube 1,7 %", "cambia alrededor del 2 % de los píxeles comparables")
      .replace("del 1 % de la zona", "del 1 % de los píxeles comparables de la vista previa")
      .replace("del 2 % de la zona", "del 2 % de los píxeles comparables de la vista previa")
      .replace("del 0,5 % de la zona", "del 0,5 % de los píxeles comparables de la vista previa")),
  };
}
