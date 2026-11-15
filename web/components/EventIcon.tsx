import {
  Activity,
  CloudLightning,
  CloudRain,
  Flame,
  Mountain,
  Satellite,
  TriangleAlert,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { EventItem } from "@/lib/events";
import { hazardColor, hazardOf, type Hazard } from "@/lib/hazard-style";

const ICONS: Partial<Record<Hazard, LucideIcon>> = {
  sismo: Activity,
  tsunami: Waves,
  volcan: Mountain,
  inundacion: Waves,
  ciclon: CloudLightning,
  lluvia: CloudRain,
  incendio: Flame,
  radar: Satellite,
};

/** Ícono del tipo de evento, en el mismo color que su punto en el mapa. */
export default function EventIcon({ item, size = "md" }: { item: EventItem; size?: "md" | "lg" }) {
  const Icon = ICONS[hazardOf(item.category)] ?? TriangleAlert;
  const color = hazardColor(item.category);
  const serious = item.level === "red" || item.level === "orange";
  const box = size === "lg" ? "size-12 rounded-[12px]" : "size-10 rounded-[10px]";
  return (
    <span
      className={`relative grid shrink-0 place-items-center border ${box}`}
      style={{ color, backgroundColor: `${color}14`, borderColor: `${color}33` }}
      aria-hidden
    >
      <Icon className={size === "lg" ? "size-6" : "size-5"} strokeWidth={1.9} />
      {serious ? (
        <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-peligro" />
      ) : null}
    </span>
  );
}
