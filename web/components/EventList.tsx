import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import EventIcon from "@/components/EventIcon";
import { isOngoing } from "@/lib/alert-rules";
import { formatWhen, OFFICIAL_LABEL, studyHref, type EventItem } from "@/lib/events";

const QUALITY_LABEL: Record<string, string> = {
  revisado: "Revisado",
  preliminar: "Preliminar",
  pronóstico: "Pronóstico",
  "detección satelital": "Detección satelital",
};

function EventRow({ item }: { item: EventItem }) {
  const href = studyHref(item);
  const sources = [item.source, ...(item.alsoReportedBy ?? [])];
  return (
    <li className="flex gap-3.5 py-4">
      <EventIcon item={item} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold text-tinta-suave">
          <span>{item.categoryLabel}</span>
          <span aria-hidden>·</span>
          <time dateTime={item.date}>{formatWhen(item.date)}</time>
          {item.distanceKm !== null ? (
            <>
              <span aria-hidden>·</span>
              <span>{Math.round(item.distanceKm)} km</span>
            </>
          ) : null}
          {item.kind === "alerta" && isOngoing(item) ? (
            <span className="rounded-full bg-peligro px-2 py-0.5 text-[11px] font-semibold text-white">En curso</span>
          ) : null}
          {item.quality ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                item.quality === "revisado" ? "bg-primario-suave text-primario-fuerte" : "bg-hundida text-tinta-suave"
              }`}
            >
              {QUALITY_LABEL[item.quality]}
            </span>
          ) : null}
        </p>

        <Link href={href} className="mt-1 block text-[16px] leading-snug font-semibold text-tinta hover:underline hover:underline-offset-4">
          {item.title}
        </Link>
        {item.detail ? <p className="mt-1 text-[14px] leading-snug text-tinta-suave">{item.detail}</p> : null}
        <p className="mt-1 text-[12px] text-tinta-suave">
          {sources.length > 1 ? `Confirmado por ${sources.join(", ")}` : `Fuente: ${item.source}`}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Link href={href} className="group inline-block text-[14px] font-semibold text-primario-fuerte">
            <span className="group-hover:underline group-hover:underline-offset-4">Ver cómo cambió la superficie de la Tierra</span>
            <ArrowRight className="ml-1 inline size-4 align-[-3px] transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-tinta-suave hover:text-tinta hover:underline hover:underline-offset-4"
            >
              {OFFICIAL_LABEL[item.source] ?? "Reporte original"}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function EventList({
  items,
  limit,
  onMore,
  empty,
}: {
  items: EventItem[];
  limit: number;
  onMore: () => void;
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="tarjeta text-[15px] text-tinta-suave">{empty}</p>;
  }
  return (
    <div className="tarjeta py-1 sm:py-1">
      <ul className="divide-y divide-linea">
        {items.slice(0, limit).map((item) => (
          <EventRow key={item.id} item={item} />
        ))}
      </ul>
      {items.length > limit ? (
        <div className="border-t border-linea pt-3 pb-4">
          <button type="button" onClick={onMore} className="boton boton-cristal boton-chico">
            Ver más ({items.length - limit})
          </button>
        </div>
      ) : null}
    </div>
  );
}
