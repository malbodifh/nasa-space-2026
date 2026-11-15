import type { DisasterAlert } from "@/lib/types";

/** Estado de riesgo de un ser querido, con las mismas reglas que la propia ubicación. */
export type LovedRisk = {
  tone: "exito" | "aviso" | "peligro" | "neutro";
  count: number;
  /** La alerta más relevante: es un evento público, no revela la zona de la persona. */
  nearest: DisasterAlert | null;
};

export type LovedOne = {
  id: string;
  alias: string;
  /** false si todavía no compartió su zona. */
  located: boolean;
  /** Zona aproximada: solo se entrega cuando está en riesgo, para marcarla en el mapa. */
  point: { lat: number; lon: number } | null;
  /** null si no se pudo consultar. */
  risk: LovedRisk | null;
};

export type LinksResponse = { following: LovedOne[]; followers: { id: string; name: string }[] };
