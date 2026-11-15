import { hazardFor } from "@/lib/hazards";

const ACTIONS: Record<string, string[]> = {
  wildfires: [
    "Alejate del humo y cerrá ventanas si el fuego está cerca.",
    "Llamá al 911 si ves fuego o humo denso; no intentes apagarlo solo.",
    "Seguí las instrucciones de la CNE y del Cuerpo de Bomberos.",
  ],
  volcanoes: [
    "Evitá la ceniza: cubrí nariz y boca, y protegé tus ojos.",
    "No te acerques al cráter, a las quebradas ni a los ríos de lodo.",
    "Seguí los boletines de OVSICORI-UNA y de la CNE.",
  ],
  severeStorms: [
    "Buscá refugio bajo techo, lejos de árboles y cables.",
    "No cruces ríos, quebradas ni calles con agua corriendo.",
    "Cargá el teléfono y seguí los avisos de la CNE.",
  ],
  floods: [
    "Subí a un lugar alto; no cruces el agua a pie ni en vehículo.",
    "Desconectá la electricidad si el agua entra a tu casa.",
    "Llamá al 911 y seguí a la CNE y a Bomberos.",
  ],
  earthquakes: [
    "Agachate, cubrite y sujetate; alejate de ventanas y fachadas.",
    "Si podés salir con calma, hacelo por las escaleras, no por el ascensor.",
    "Revisá grietas y réplicas; reportá daños a la CNE.",
  ],
  landslides: [
    "Alejate de laderas, quebradas y cauces.",
    "No camines ni manejes por zonas recién afectadas.",
    "Reportá el deslizamiento al 911 y a la CNE.",
  ],
  drought: [
    "Ahorrá agua y evitá quemas al aire libre.",
    "Seguí las restricciones de las autoridades locales.",
  ],
  dustHaze: [
    "Cerrá ventanas y evitá actividad física al aire libre.",
    "Usá mascarilla si tenés que salir.",
  ],
};

const DEFAULT_ACTIONS = [
  "Seguí las indicaciones de la CNE y de las autoridades locales.",
  "Llamá al 911 si hay peligro inmediato.",
];

export function actionsFor(category: string): string[] {
  return ACTIONS[hazardFor(category).id] ?? DEFAULT_ACTIONS;
}
