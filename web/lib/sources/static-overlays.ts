import "server-only";

import bordersFile from "@/data/borders.json";
import volcanoesFile from "@/data/volcanoes.json";
import { bboxForRadius, distanceKm, geometryBBox } from "@/lib/geo";
import type { GeoCollection, GeoFeature, LatLon, VolcanoProps } from "@/lib/types";

const volcanoes = volcanoesFile as unknown as GeoCollection<VolcanoProps> & {
  generatedAt: string;
};
const borders = bordersFile as unknown as GeoCollection<Record<string, never>>;

export function getVolcanoes(point: LatLon, radiusKm: number) {
  const limit = Math.max(radiusKm * 3, 200);
  const features = volcanoes.features
    .map((feature) => ({ feature, distanceKm: distanceKm(point, pointOf(feature)) }))
    .filter((item) => item.distanceKm <= limit)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map((item) => item.feature);

  return {
    collection: { type: "FeatureCollection" as const, features },
    generatedAt: volcanoes.generatedAt,
  };
}

export function getBorders(point: LatLon, radiusKm: number) {
  const [west, south, east, north] = bboxForRadius(point, Math.max(radiusKm * 4, 500));
  const features = borders.features.filter((feature) => {
    const [w, s, e, n] = geometryBBox(feature.geometry);
    return w <= east && e >= west && s <= north && n >= south;
  });

  return { type: "FeatureCollection" as const, features };
}

function pointOf(feature: GeoFeature<VolcanoProps>): LatLon {
  const [lon, lat] = feature.geometry.type === "Point" ? feature.geometry.coordinates : [0, 0];
  return { lat, lon };
}
