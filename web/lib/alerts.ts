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

export function buildTestAlert(point: LatLon, radiusKm: number, now = new Date()): AppAlert {
  return {
    id: `test:${now.getTime()}`,
    kind: "test",
    severity: "warning",
    title: "Alerta de prueba",
    body: `Este es un aviso simulado para ${point.lat.toFixed(3)}, ${point.lon.toFixed(3)} con radio de ${radiusKm} km. Sirve para verificar notificaciones, sonido y registro. No implica peligro.`,
    source: "Modo prototipo",
    url: null,
    createdAt: now.toISOString(),
    distanceKm: 0,
    scope: "point",
  };
}
