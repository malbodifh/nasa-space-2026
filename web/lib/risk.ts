import { OFFICIAL_URL } from "@/lib/demo";
import type { ClimateStats, FireStats, RiskAssessment, RiskLevel, RiskReason } from "@/lib/types";

export function emptyFireStats(date: string): FireStats {
  return {
    date,
    count: 0,
    nearestKm: null,
    maxFrp: null,
    points: [],
    available: false,
    fallback: false,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return "extreme";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
}

export function assessRisk(
  current: FireStats,
  climate: ClimateStats | null,
  radiusKm: number,
): RiskAssessment {
  const updatedAt = new Date().toISOString();
  const hasData = current.available || climate !== null;

  const reasons: RiskReason[] = [];

  if (current.count > 0) {
    reasons.push({
      label: "Focos activos",
      value: `${current.count} ${current.count === 1 ? "foco" : "focos"} en ${radiusKm} km; el más cercano a ${current.nearestKm} km`,
      weight: 0.5,
    });
  }

  if (climate) {
    reasons.push({
      label: "Lluvia de 30 días",
      value: `${climate.rain30mm} mm; percentil ${climate.rain30Percentile} (más seco que ${climate.rain30Percentile} % de los años)`,
      weight: 0.25,
    });
    reasons.push({
      label: "Días sin lluvia",
      value: `${climate.daysSinceRain} días sin lluvia ≥ 1 mm`,
      weight: 0.15,
    });
    if (climate.windMs !== null || climate.rhPct !== null) {
      reasons.push({
        label: "Viento y humedad",
        value: `${climate.windMs ?? "—"} m/s de viento · ${climate.rhPct ?? "—"} % de humedad`,
        weight: 0.1,
      });
    }
  }

  if (!hasData) {
    return {
      level: "info",
      score: 0,
      reasons: [
        {
          label: "Sin datos suficientes",
          value: "No pudimos consultar GIBS ni POWER para este punto.",
          weight: 1,
        },
      ],
      confidence: "low",
      updatedAt,
      sources: sourcesFor(false, false),
      officialUrl: OFFICIAL_URL,
      disclaimer:
        "Información de contexto, no una alerta oficial. Si hay peligro, seguí las instrucciones de SENAPRED y CONAF.",
    };
  }

  const proximity =
    current.nearestKm !== null ? clamp(1 - current.nearestKm / radiusKm, 0, 1) : 0;
  const intensity = clamp((current.maxFrp ?? 0) / 100, 0, 1);
  const fireScore =
    current.count > 0 ? 55 + 45 * (0.65 * proximity + 0.35 * intensity) : 0;

  const dryness = climate ? clamp((100 - climate.rain30Percentile) / 100, 0, 1) : 0;
  const wind = climate?.windMs !== null && climate?.windMs !== undefined
    ? clamp(climate.windMs / 15, 0, 1)
    : 0;
  const lowHumidity =
    climate?.rhPct !== null && climate?.rhPct !== undefined
      ? clamp((50 - climate.rhPct) / 50, 0, 1)
      : 0;
  const precondition = climate ? 100 * (0.55 * dryness + 0.25 * wind + 0.2 * lowHumidity) : 0;

  const score = Math.round(Math.max(fireScore, precondition * 0.85));
  const level = levelFromScore(score);
  const confidence: RiskAssessment["confidence"] =
    current.available && climate && !climate.fallback && !current.fallback
      ? "high"
      : climate || current.available
        ? "medium"
        : "low";

  return {
    level,
    score,
    reasons: reasons.sort((a, b) => b.weight - a.weight).slice(0, 3),
    confidence,
    updatedAt,
    sources: sourcesFor(true, climate !== null),
    officialUrl: OFFICIAL_URL,
    disclaimer:
      "Información de contexto, no una alerta oficial. La app muestra observación y memoria; el pronóstico y la evacuación los define la autoridad.",
  };
}

function sourcesFor(gibs: boolean, power: boolean) {
  const sources = [];
  if (gibs) {
    sources.push({
      name: "NASA GIBS · focos",
      url: "https://gibs.earthdata.nasa.gov/",
      latency: "≤ 24 h",
    });
  }
  if (power) {
    sources.push({
      name: "NASA POWER · clima",
      url: "https://power.larc.nasa.gov/",
      latency: "2–3 días",
    });
  }
  sources.push({
    name: "NASA Worldview · imágenes",
    url: "https://wvs.earthdata.nasa.gov/",
    latency: "bajo demanda",
  });
  return sources;
}
