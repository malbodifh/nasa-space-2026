"use client";

import { MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCATIONS } from "@/lib/demo";

export default function LocationPicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="eyebrow">Costa Rica · ubicación</p>
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger
          aria-label="Elegir ubicación en Costa Rica"
          className="mt-1 h-auto w-full justify-between rounded-none border-0 border-b border-rule bg-transparent px-0 py-1.5 text-left shadow-none focus-visible:border-ink focus-visible:ring-0"
        >
          <span className="flex items-baseline gap-2">
            <MapPin className="size-3.5 shrink-0 text-burnt" />
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent className="rounded-none border-rule bg-sheet">
          {LOCATIONS.map((location) => (
            <SelectItem
              key={location.id}
              value={location.id}
              className="rounded-none text-[12px] focus:bg-rule/40"
            >
              <span className="flex w-full items-baseline justify-between gap-4">
                <span>{location.label}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ash">
                  {location.region}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
