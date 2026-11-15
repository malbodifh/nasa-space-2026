import type {
  AppAlert,
  DisasterAlert,
  FireStats,
  LatLon,
  RiskAssessment,
  RiskLevel,
} from "@/lib/types";

const nf = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });

const SEVERITY_ORDER: Record<AppAlert["severity"], number> = {
  critical: 0,
  warning: 1,
  watch: 2,
  info: 3,
};

const RISK_LABEL: Record<RiskLevel, string> = {
  info: "sin datos",
  low: "bajo",
  moderate: "moderado",
  high: "alto",
  extreme: "extremo",
};

function levelOfRisk(level: RiskLevel): AppAlert["severity"] | null {
  if (level === "extreme") return "critical";
  if (level === "high") return "warning";
  if (level === "moderate") return "watch";
  return null;
}

function levelOfOfficial(alert: DisasterAlert): AppAlert["severity"] {
  if (alert.level === "red") return "critical";
  if (alert.level === "orange") return "warning";
  if (alert.level === "green") return "watch";
  return "info";
}

export function buildAlerts({
  radiusKm,
  current,
  risk,
  official,
  now = new Date(),
}: {
  radiusKm: number;
  current: FireStats;
  risk: RiskAssessment;
  official: DisasterAlert[];
  now?: Date;
}): AppAlert[] {
  const alerts: AppAlert[] = [];
  const createdAt = now.toISOString();

  if (current.count > 0 && current.nearestKm !== null) {
    const near = current.nearestKm <= 10;
    const nearest = current.points[0];
    alerts.push({
      id: `fire:${current.date}:${current.count}:${current.nearestKm.toFixed(0)}`,
      kind: "fire",
      severity: near ? "warning" : "watch",
      title: near
        ? `Foco de calor a ${nf.format(current.nearestKm)} km`
        : `${current.count} ${current.count === 1 ? "foco" : "focos"} en ${radiusKm} km`,
      body:
        nearest?.satellite
          ? `Detección ${nearest.satellite}${nearest.instrument ? ` · ${nearest.instrument}` : ""} a ${nf.format(current.nearestKm)} km` +
            `${nearest.frp ? ` · FRP ${nf.format(nearest.frp)} MW` : ""}. Observación satelital, no confirmación en terreno.`
          : `NASA GIBS registró ${current.count} ${current.count === 1 ? "detección" : "detecciones"} en el radio de ${radiusKm} km.`,
      source: "NASA GIBS",
      url: "https://gibs.earthdata.nasa.gov/",
      createdAt,
      distanceKm: current.nearestKm,
      scope: near ? "point" : "radius",
    });
  }

  const riskSeverity = levelOfRisk(risk.level);
  if (riskSeverity) {
    alerts.push({
      id: `risk:${risk.level}:${risk.score}`,
      kind: "risk",
      severity: riskSeverity,
      title: `Condiciones ${RISK_LABEL[risk.level]}s para incendio`,
      body: `${risk.reasons[0]?.value ?? "Score calculado con datos NASA."} Confianza ${risk.confidence}. Esto no es una alerta oficial.`,
      source: "NASA POWER + GIBS",
      url: risk.officialUrl,
      createdAt,
      distanceKm: null,
      scope: "point",
    });
  }

  for (const alert of official) {
    const scope: AppAlert["scope"] =
      alert.distanceKm <= radiusKm ? "radius" : "region";
    alerts.push({
      id: `official:${alert.id}`,
      kind: "official",
      severity: levelOfOfficial(alert),
      title: alert.title,
      body: `${alert.categoryLabel} reportado por ${alert.source}${alert.magnitude ? ` · ${alert.magnitude}` : ""}. Nivel ${alert.level}.`,
      source: alert.source,
      url: alert.url,
      createdAt: alert.date,
      distanceKm: alert.distanceKm,
      scope,
    });
  }

  return alerts.sort((a, b) => {
    const severity = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severity !== 0) return severity;
    return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY);
  });
}

export type DemoHazard = "fire" | "earthquake" | "volcano" | "flood" | "storm";

const DEMO_TEMPLATES: Record<DemoHazard, Omit<AppAlert, "id" | "createdAt">> = {
  fire: {
    kind: "test",
    severity: "warning",
    title: "Foco de calor a 8 km [DEMO]",
    body: "NASA FIRMS detectó 3 focos de calor a 8 km · VIIRS S-NPP · FRP 42 MW. Aviso de demostración — no implica peligro real.",
    source: "NASA FIRMS [demo]",
    url: "https://firms.modaps.eosdis.nasa.gov/",
    distanceKm: 8,
    scope: "radius",
  },
  earthquake: {
    kind: "test",
    severity: "warning",
    title: "Sismo M 5.2 a 42 km [DEMO]",
    body: "USGS registró M 5.2 ML · profundidad 12 km · sentido en varias localidades. Aviso de demostración — no implica peligro real.",
    source: "USGS [demo]",
    url: "https://earthquake.usgs.gov/",
    distanceKm: 42,
    scope: "radius",
  },
  volcano: {
    kind: "test",
    severity: "critical",
    title: "Volcán Poás — actividad elevada [DEMO]",
    body: "OVSICORI reporta tremor continuo y columna de vapor de 300 m · radio de exclusión de 1 km activo. Aviso de demostración — no implica peligro real.",
    source: "OVSICORI [demo]",
    url: "https://www.ovsicori.una.ac.cr/",
    distanceKm: 22,
    scope: "radius",
  },
  flood: {
    kind: "test",
    severity: "warning",
    title: "Inundación — cuenca del Río Grande [DEMO]",
    body: "GDACS nivel naranja: desbordamiento a 35 km · zonas bajas en alerta preventiva · evitá pasos de río. Aviso de demostración — no implica peligro real.",
    source: "GDACS [demo]",
    url: "https://www.gdacs.org/",
    distanceKm: 35,
    scope: "radius",
  },
  storm: {
    kind: "test",
    severity: "watch",
    title: "Tormenta tropical a 320 km [DEMO]",
    body: "NHC: depresión tropical con trayectoria hacia Costa Rica en 48 h · vientos 75 km/h sostenidos. Aviso de demostración — no implica peligro real.",
    source: "NHC [demo]",
    url: "https://www.nhc.noaa.gov/",
    distanceKm: 320,
    scope: "region",
  },
};

export function buildTestAlert(
  point: LatLon,
  radiusKm: number,
  hazard: DemoHazard = "fire",
  now = new Date(),
): AppAlert {
  void radiusKm; // reservado para futuras variantes por radio
  const template = DEMO_TEMPLATES[hazard];
  return {
    ...template,
    id: `test:${hazard}:${now.getTime()}`,
    createdAt: now.toISOString(),
  };
}

/** Alerta de prueba básica sin tipo de amenaza (compatibilidad). */
export function buildGenericTestAlert(point: LatLon, radiusKm: number, now = new Date()): AppAlert {
  return buildTestAlert(point, radiusKm, "fire", now);
}
