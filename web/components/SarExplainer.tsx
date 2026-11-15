"use client";

import { useLocale } from "@/components/LocaleProvider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const STEPS = [
  {
    title: "Lleva su propia luz",
    titleEn: "It carries its own light",
    bodyEn: "NISAR does not wait for sunlight: it emits L-band microwave pulses (24 cm wavelength) and measures the echo. It works day and night through clouds.",
    body:
      "NISAR no espera al sol: emite pulsos de microondas en banda L (24 cm de longitud de onda) y " +
      "mide el eco. Funciona de día, de noche y con nubes.",
  },
  {
    title: "El brillo es forma y humedad",
    titleEn: "Brightness reflects shape and moisture",
    bodyEn: "The echo depends on roughness and dielectric properties (how much water is present). Rough or wet surfaces can return a stronger signal; still water reflects the pulse away from the satellite and appears black.",
    body:
      "El eco depende de la rugosidad y de la constante dieléctrica (cuánta agua hay). Una superficie " +
      "rugosa o húmeda devuelve más señal; el agua quieta refleja el pulso lejos del satélite y se ve negra.",
  },
  {
    title: "Dos polarizaciones",
    titleEn: "Two polarizations",
    bodyEn: "HH: transmits and receives horizontally; responds to ground and water-to-stem double bounce. HV: transmits horizontally and receives vertically; appears when the signal scatters within vegetation (leaves, branches).",
    body:
      "HH: emite y recibe en horizontal; responde al suelo y al doble rebote agua → tallo. " +
      "HV: emite horizontal y recibe vertical; aparece cuando la señal se dispersa dentro de la " +
      "vegetación (hojas, ramas).",
  },
  {
    title: "Vuelve cada 12 días",
    titleEn: "It returns every 12 days",
    bodyEn: "It repeats the same orbit over the same location. Comparing matching passes helps distinguish surface changes from viewing-angle differences. Data gaps can occur.",
    body:
      "Repite la misma órbita sobre el mismo lugar. Comparar pasadas iguales muestra qué cambió en " +
      "la superficie y no en el ángulo de observación.",
  },
];

export default function SarExplainer() {
  const { t } = useLocale();
  return (
    <section aria-labelledby="sar-explainer-title" className="border-t border-ink/80 pt-4">
      <p className="eyebrow">{t("¿Cómo ve el radar?", "How does radar see?")}</p>
      <h2 id="sar-explainer-title" className="mt-1 font-display text-[20px] leading-tight">
        {t("Una linterna de microondas que atraviesa las nubes", "A microwave flashlight that sees through clouds")}
      </h2>

      <ol className="mt-3 space-y-2.5">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-2.5">
            <span className="font-mono text-[10px] text-burnt">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-[12px] font-medium leading-snug text-ink">{t(step.title, step.titleEn)}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink2">{t(step.body, step.bodyEn)}</p>
            </div>
          </li>
        ))}
      </ol>

      <Collapsible className="mt-3 border-l-2 border-rule pl-2.5">
        <CollapsibleTrigger className="font-mono text-[9px] uppercase tracking-[0.12em] text-ash hover:text-ink">
          {t("Cómo leer los colores →", "How to read the colors →")}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-ink2">
            <li>
              <span className="mr-1.5 inline-block size-2 bg-[#141414] align-middle" />
              <strong className="font-medium text-ink">{t("Negro:", "Black:")}</strong> {t("posible agua abierta o superficie muy lisa.", "possible open water or a very smooth surface.")}
            </li>
            <li>
              <span className="mr-1.5 inline-block size-2 border border-rule bg-[#e9f2ea] align-middle" />
              <strong className="font-medium text-ink">{t("Blanco y verde claro:", "White and light green:")}</strong> {t("HH y HV altos; posible bosque o vegetación densa.", "strong HH and HV; possible forest or dense vegetation.")}
            </li>
            <li>
              <span className="mr-1.5 inline-block size-2 bg-[#d55bd5] align-middle" />
              <strong className="font-medium text-ink">Magenta:</strong> {t("HH alto y HV bajo; posible doble rebote en vegetación inundada, arrozales o construcciones.", "strong HH and weak HV; possible double bounce in flooded vegetation, rice fields or buildings.")}
            </li>
            <li>
              <span className="mr-1.5 inline-block size-2 bg-[#8a6f8f] align-middle" />
              <strong className="font-medium text-ink">{t("Gris violáceo:", "Purplish gray:")}</strong> {t("posible pasto, cultivos bajos o suelo descubierto.", "possible grass, low crops or bare ground.")}
            </li>
          </ul>
          <p className="mt-2 text-[10px] leading-relaxed text-ash">
            {t("En la vista previa de NISAR, el rojo y el azul llevan HH y el verde lleva HV. Son imágenes de 8 bits no calibradas: estos colores sugieren hipótesis, no identifican causas ni daños.", "In the NISAR preview, red and blue carry HH and green carries HV. These are uncalibrated 8-bit images: colors suggest hypotheses, not confirmed causes or damage.")}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
