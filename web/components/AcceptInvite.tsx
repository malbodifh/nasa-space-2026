"use client";

import { BellRing, Check, Heart, LocateFixed, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { ensureDevice, markLinked } from "@/lib/device";
import { subscribePush } from "@/lib/push-client";
import { saveLocation } from "@/lib/saved-location";
import type { LatLon } from "@/lib/types";

type State =
  | { step: "cargando" }
  | { step: "invalida" }
  | { step: "pregunta"; inviterName: string }
  | { step: "aceptando"; inviterName: string }
  | { step: "lista"; inviterName: string; point: LatLon; reciprocal: boolean };

function currentPosition(): Promise<LatLon> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("sin-gps"));
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      reject,
      { timeout: 15_000, maximumAge: 5 * 60_000 },
    );
  });
}

/** Página del link de invitación: la persona invitada acepta compartir su zona aproximada. */
export default function AcceptInvite() {
  const code = useSearchParams().get("c") ?? "";
  const { locale, t } = useLocale();
  const [state, setState] = useState<State>({ step: "cargando" });
  const [reciprocal, setReciprocal] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);
  const [pushState, setPushState] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/links/invite?code=${encodeURIComponent(code)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as { inviterName?: string };
        if (cancelled) return;
        setState(response.ok && data.inviterName ? { step: "pregunta", inviterName: data.inviterName } : { step: "invalida" });
      })
      .catch(() => {
        if (!cancelled) setState({ step: "invalida" });
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function accept() {
    if (state.step !== "pregunta") return;
    const { inviterName } = state;
    setProblem(null);
    setState({ step: "aceptando", inviterName });
    let point: LatLon;
    try {
      point = await currentPosition();
    } catch {
      setProblem(t("Para aceptar hace falta su ubicación aproximada. Permita el acceso a la ubicación e intente de nuevo.", "Your approximate location is needed to accept. Allow location access and try again."));
      setState({ step: "pregunta", inviterName });
      return;
    }
    try {
      const device = ensureDevice();
      const response = await fetch("/api/links/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device: { id: device.id, key: device.key }, code, lat: point.lat, lon: point.lon, lang: locale, reciprocal }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? `Error ${response.status}`);
      markLinked();
      saveLocation(point);
      setState({ step: "lista", inviterName, point, reciprocal });
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : t("No se pudo aceptar la invitación.", "The invitation could not be accepted."));
      setState({ step: "pregunta", inviterName });
    }
  }

  async function enablePush() {
    if (state.step !== "lista") return;
    const result = await subscribePush(state.point, locale);
    setPushState(result === "ok" ? "ok" : "fail");
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-[560px] px-4 pt-6 pb-20 sm:px-6">
      <div className="tarjeta">
        {state.step === "cargando" ? (
          <div className="flex flex-col gap-3" role="status" aria-label={t("Cargando invitación", "Loading invitation")}>
            <div className="h-7 w-3/4 animate-pulse rounded-md bg-hundida" />
            <div className="h-16 animate-pulse rounded-md bg-hundida" />
          </div>
        ) : state.step === "invalida" ? (
          <>
            <h1 className="text-[24px] leading-tight font-bold tracking-[-0.02em] text-tinta">{t("Esta invitación ya no sirve", "This invitation is no longer valid")}</h1>
            <p className="mt-2 text-[15px] leading-snug text-tinta-suave">
              {t("Venció (dura 48 horas) o ya fue usada. Pídale a la persona que le envíe un link nuevo.", "It expired (links last 48 hours) or was already used. Ask the person to send you a new link.")}
            </p>
            <Link href="/" className="boton boton-principal mt-5 w-full">{t("Ir a Gamma Alert", "Go to Gamma Alert")}</Link>
          </>
        ) : state.step === "lista" ? (
          <>
            <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-exito">
              <Check className="size-4" aria-hidden />
              {t("Vínculo creado", "Link created")}
            </p>
            <h1 className="mt-2 text-[24px] leading-tight font-bold tracking-[-0.02em] text-tinta">
              {t(`${state.inviterName} recibirá un aviso si usted está en riesgo`, `${state.inviterName} will be notified if you are at risk`)}
            </h1>
            <p className="mt-2 text-[15px] leading-snug text-tinta-suave">
              {state.reciprocal
                ? t(`Y usted recibirá uno si ${state.inviterName} lo está. Active los avisos en este teléfono para recibirlos aunque la app esté cerrada.`, `And you will get one if ${state.inviterName} is. Enable notifications on this phone to get them even with the app closed.`)
                : t("Puede dejar de compartir cuando quiera desde la sección «Seres queridos».", "You can stop sharing at any time from the “Loved ones” section.")}
            </p>
            {pushState === "ok" ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-primario-suave px-4 py-3 text-[14px] font-semibold text-primario-fuerte">
                <BellRing className="size-4" aria-hidden />
                {t("Avisos activados en este teléfono", "Notifications enabled on this phone")}
              </p>
            ) : (
              <button type="button" onClick={() => void enablePush()} className="boton boton-principal mt-5 w-full">
                <BellRing className="size-4" aria-hidden />
                {t("Activar avisos en este teléfono", "Enable notifications on this phone")}
              </button>
            )}
            {pushState === "fail" ? (
              <p className="mt-2 text-[13px] text-tinta-suave">
                {t("No se pudieron activar aquí. Instale la app (menú del navegador › «Agregar a pantalla de inicio») y ábrala una vez.", "They could not be enabled here. Install the app (browser menu › “Add to Home screen”) and open it once.")}
              </p>
            ) : null}
            <Link href="/#seres-queridos" className="boton boton-cristal mt-2 w-full">{t("Ir a Gamma Alert", "Go to Gamma Alert")}</Link>
            <p className="mt-4 text-[12px] leading-snug text-tinta-suave">
              {t("Consejo: agregue Gamma Alert a su pantalla de inicio. Cada vez que la abra se actualiza su zona aproximada.", "Tip: add Gamma Alert to your home screen. Each time you open it, your approximate area is updated.")}
            </p>
          </>
        ) : (
          <>
            <Heart className="size-7 text-peligro" aria-hidden />
            <h1 className="mt-3 text-[24px] leading-tight font-bold tracking-[-0.02em] text-tinta">
              {t(`${state.inviterName} quiere saber si usted está en riesgo`, `${state.inviterName} wants to know if you are at risk`)}
            </h1>
            <p className="mt-2 text-[15px] leading-snug text-tinta-suave">
              {t(
                `Si hay un sismo, una inundación u otro desastre natural cerca de usted, ${state.inviterName} recibirá un aviso y lo verá marcado en su mapa, aunque ambos tengan la app cerrada.`,
                `If there is an earthquake, flood or other natural disaster near you, ${state.inviterName} will get a notification and see you marked on their map, even with both apps closed.`,
              )}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-[14px] leading-snug text-tinta-suave">
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primario-fuerte" aria-hidden />{t("Solo se comparte su zona aproximada (~1 km), nunca su ubicación exacta.", "Only your approximate area (~1 km) is shared, never your exact location.")}</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primario-fuerte" aria-hidden />{t(`${state.inviterName} solo ve el pin cuando usted está en riesgo.`, `${state.inviterName} only sees the pin when you are at risk.`)}</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primario-fuerte" aria-hidden />{t("La zona se actualiza cuando usted abre la app. Puede dejar de compartir cuando quiera.", "Your area updates when you open the app. You can stop sharing at any time.")}</li>
            </ul>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[10px] border border-linea px-3.5 py-3 text-[14px] text-tinta">
              <input type="checkbox" checked={reciprocal} onChange={(event) => setReciprocal(event.target.checked)} className="mt-0.5 size-4 accent-[var(--color-primario)]" />
              <span>{t(`Yo también quiero un aviso si ${state.inviterName} está en riesgo`, `I also want a notification if ${state.inviterName} is at risk`)}</span>
            </label>
            {problem ? <p role="alert" className="mt-3 text-[14px] text-peligro">{problem}</p> : null}
            <button type="button" onClick={() => void accept()} disabled={state.step === "aceptando"} className="boton boton-principal mt-5 w-full disabled:opacity-60">
              <LocateFixed className="size-4" aria-hidden />
              {state.step === "aceptando" ? t("Aceptando…", "Accepting…") : t("Aceptar y compartir mi zona", "Accept and share my area")}
            </button>
            <Link href="/" className="boton boton-cristal mt-2 w-full">{t("No, gracias", "No, thanks")}</Link>
          </>
        )}
      </div>
    </main>
  );
}
