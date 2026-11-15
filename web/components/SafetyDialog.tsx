"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import SafetyAdvice from "@/components/SafetyAdvice";
import type { DisasterAlert } from "@/lib/types";

export default function SafetyDialog({ alerts, exampleLocation, incomplete }: {
  alerts: DisasterAlert[]; exampleLocation: boolean; incomplete: boolean;
}) {
  const { t } = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="boton boton-cristal w-full" onClick={() => {
        setOpen(true);
        dialog.current?.showModal();
      }}>{t("Ver orientación de emergencia", "View emergency guidance")}</button>
      <dialog ref={dialog} aria-labelledby="orientacion" onClose={() => setOpen(false)} className="m-auto max-h-[90dvh] w-[min(94vw,540px)] overflow-y-auto rounded-[14px] bg-elevada p-5 text-tinta shadow-xl backdrop:bg-black/60">
        <form method="dialog" className="mb-4 flex justify-end">
          <button className="boton boton-cristal">{t("Cerrar", "Close")}</button>
        </form>
        {open ? <SafetyAdvice alerts={alerts} exampleLocation={exampleLocation} incomplete={incomplete} /> : null}
      </dialog>
    </>
  );
}
