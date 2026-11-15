import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const STEPS = [
  {
    title: "Lleva su propia luz",
    body:
      "NISAR no espera al sol: emite pulsos de microondas en banda L (24 cm de longitud de onda) y " +
      "mide el eco. Funciona de día, de noche y con nubes.",
  },
  {
    title: "El brillo es forma y humedad",
    body:
      "El eco depende de la rugosidad y de la constante dieléctrica (cuánta agua hay). Una superficie " +
      "rugosa o húmeda devuelve más señal; el agua quieta refleja el pulso lejos del satélite y se ve negra.",
  },
  {
    title: "Dos polarizaciones",
    body:
      "HH: emite y recibe en horizontal; responde al suelo y al doble rebote agua → tallo. " +
      "HV: emite horizontal y recibe vertical; aparece cuando la señal se dispersa dentro de la " +
      "vegetación (hojas, ramas).",
  },
  {
    title: "Vuelve cada 12 días",
    body:
      "Repite la misma órbita sobre el mismo lugar. Comparar pasadas iguales muestra qué cambió en " +
      "la superficie y no en el ángulo de observación.",
  },
];

export default function SarExplainer() {
  return (
    <section aria-labelledby="sar-explainer-title" className="border-t border-ink/80 pt-4">
      <p className="eyebrow">¿Cómo ve el radar?</p>
      <h2 id="sar-explainer-title" className="mt-1 font-display text-[20px] leading-tight">
        Una linterna de microondas que atraviesa las nubes
      </h2>

      <ol className="mt-3 space-y-2.5">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-2.5">
            <span className="font-mono text-[10px] text-burnt">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-[12px] font-medium leading-snug text-ink">{step.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink2">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <Collapsible className="mt-3 border-l-2 border-rule pl-2.5">
        <CollapsibleTrigger className="font-mono text-[9px] uppercase tracking-[0.12em] text-ash hover:text-ink">
          Cómo leer los colores →
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-ink2">
            <li>
              <span className="mr-1.5 inline-block size-2 bg-[#141414] align-middle" />
              <strong className="font-medium text-ink">Negro:</strong> agua abierta o superficie muy lisa.
            </li>
            <li>
              <span className="mr-1.5 inline-block size-2 border border-rule bg-[#e9f2ea] align-middle" />
              <strong className="font-medium text-ink">Blanco y verde claro:</strong> HH y HV altos;
              bosque o vegetación densa.
            </li>
            <li>
              <span className="mr-1.5 inline-block size-2 bg-[#d55bd5] align-middle" />
              <strong className="font-medium text-ink">Magenta:</strong> HH alto y HV bajo; doble
              rebote en vegetación inundada, arrozales o construcciones.
            </li>
            <li>
              <span className="mr-1.5 inline-block size-2 bg-[#8a6f8f] align-middle" />
              <strong className="font-medium text-ink">Gris violáceo:</strong> pasto, cultivos bajos
              o suelo descubierto.
            </li>
          </ul>
          <p className="mt-2 text-[10px] leading-relaxed text-ash">
            En la vista previa de NISAR, el rojo y el azul llevan HH y el verde lleva HV (lo
            comprobamos: rojo y azul son iguales en todos los píxeles).
          </p>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
