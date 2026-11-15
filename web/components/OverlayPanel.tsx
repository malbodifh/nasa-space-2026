"use client";

import { ChevronDown, Layers } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { LayerId, LayerState } from "@/lib/types";

const LAYERS: { id: LayerId; label: string; source: string; swatch: string }[] = [
  { id: "roads", label: "Caminos", source: "OSM", swatch: "bg-ink/45" },
  { id: "protected", label: "Áreas protegidas", source: "OSM", swatch: "bg-forest/40" },
  { id: "volcanoes", label: "Volcanes", source: "GVP", swatch: "bg-ink" },
  { id: "borders", label: "Fronteras", source: "NE", swatch: "bg-ash/60" },
  { id: "alerts", label: "Alertas", source: "EONET", swatch: "bg-burnt" },
  { id: "quakes", label: "Sismos M3+", source: "USGS", swatch: "bg-ash" },
];

export default function OverlayPanel({
  layers,
  onToggle,
  loading,
  failed,
}: {
  layers: LayerState;
  onToggle: (id: LayerId) => void;
  loading: boolean;
  failed: boolean;
}) {
  const active = Object.values(layers).filter(Boolean).length;

  return (
    <Collapsible defaultOpen className="pointer-events-auto w-[212px] border border-rule bg-sheet/95 shadow-[3px_3px_0_rgba(27,26,23,0.06)] backdrop-blur-sm">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 px-2.5 py-2 text-left">
        <Layers className="size-3.5 text-ash" />
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink">Capas</span>
        <span className="ml-auto font-mono text-[9px] text-ash">
          {active}/{LAYERS.length}
        </span>
        <ChevronDown className="size-3 text-ash transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ul className="border-t border-rule/80 px-2.5 py-1.5">
          {LAYERS.map((layer) => (
            <li key={layer.id} className="flex items-center gap-2 py-[3px]">
              <Checkbox
                id={`layer-${layer.id}`}
                checked={layers[layer.id]}
                onCheckedChange={() => onToggle(layer.id)}
                className="size-3 rounded-none border-ash/60 data-checked:border-ink data-checked:bg-ink data-checked:text-paper"
              />
              <label
                htmlFor={`layer-${layer.id}`}
                className="flex flex-1 cursor-pointer items-center gap-1.5 text-[11px] leading-none text-ink2"
              >
                <span className={`inline-block size-[3px] ${layer.swatch}`} aria-hidden />
                {layer.label}
              </label>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-ash/80">
                {layer.source}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-rule/80 px-2.5 py-1.5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.1em] text-ash">
          {failed ? (
            <span className="text-burnt">Capas externas no disponibles</span>
          ) : loading ? (
            <span>Consultando fuentes…</span>
          ) : (
            <span>OpenStreetMap · Smithsonian · Natural Earth</span>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
