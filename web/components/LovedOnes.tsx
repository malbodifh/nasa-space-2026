"use client";

import { Check, Copy, Heart, MapPin, Share2, UserPlus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { eventTitle, intlLocale } from "@/lib/display-i18n";
import { fromAlert } from "@/lib/events";
import { readName, saveName } from "@/lib/device";
import type { LovedOne } from "@/lib/links/types";

const TONE_DOT = { exito: "bg-exito", aviso: "bg-aviso", peligro: "bg-peligro", neutro: "bg-linea-fuerte" } as const;
const FIELD = "w-full rounded-[10px] border border-linea bg-transparent px-3 py-2.5 text-[15px] text-tinta placeholder:text-tinta-suave/70 focus:outline-2 focus:outline-primario";

type Props = {
  following: LovedOne[];
  followers: { id: string; name: string }[];
  loading: boolean;
  error: boolean;
  invite: (inviterName: string, alias: string) => Promise<string>;
  remove: (other: string, role: "following" | "follower") => Promise<void>;
  onShowOnMap: (person: LovedOne) => void;
};

/** Texto del estado de un ser querido. */
export function lovedStatus(person: LovedOne, locale: "es" | "en", t: (es: string, en: string) => string): string {
  if (!person.located) return t("Todavía no comparte su zona", "Not sharing their area yet");
  if (!person.risk) return t("No pudimos revisar su zona", "We couldn't check their area");
  const nearest = person.risk.nearest;
  if (!nearest || person.risk.count === 0) return t("Sin alertas cerca", "No alerts nearby");
  const km = Math.round(nearest.distanceKm).toLocaleString(intlLocale(locale));
  return `${eventTitle(fromAlert(nearest), locale)} · ${t(`a ${km} km de su zona`, `${km} km from their area`)}`;
}

export default function LovedOnes({ following, followers, loading, error, invite, remove, onShowOnMap }: Props) {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(() => (typeof window === "undefined" ? "" : readName()));
  const [alias, setAlias] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !alias.trim()) return;
    setBusy(true);
    setProblem(null);
    try {
      saveName(name.trim());
      const url = await invite(name.trim(), alias.trim());
      setLink(url);
      const text = t(
        `${name.trim()} quiere saber si usted está en riesgo por un desastre natural. Abra este link para aceptar (vence en 48 horas):`,
        `${name.trim()} wants to know if you are at risk from a natural disaster. Open this link to accept (expires in 48 hours):`,
      );
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Gamma Alert", text, url }).catch(() => {});
      }
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : t("No se pudo crear la invitación.", "The invitation could not be created."));
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setOpen(false);
    setLink(null);
    setAlias("");
    setProblem(null);
  }

  return (
    <section id="seres-queridos" className="tarjeta scroll-mt-24" aria-labelledby="seres-queridos-titulo">
      <h2 id="seres-queridos-titulo" className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.015em] text-tinta">
        <Heart className="size-[18px] text-peligro" aria-hidden />
        {t("Seres queridos", "Loved ones")}
      </h2>
      <p className="mt-1.5 text-[14px] leading-snug text-tinta-suave">
        {t(
          "Reciba un aviso y véalos marcados en el mapa si están en riesgo por un desastre, aunque ambos tengan la app cerrada.",
          "Get a notification and see them on the map if they are at risk from a disaster, even with both apps closed.",
        )}
      </p>

      {loading ? <div className="mt-4 h-12 animate-pulse rounded-lg bg-hundida" /> : null}
      {error ? <p className="mt-3 text-[13px] text-tinta-suave">{t("No pudimos revisar a sus seres queridos. Se reintentará solo.", "We couldn't check your loved ones. It will retry automatically.")}</p> : null}

      {following.length > 0 ? (
        <ul className="mt-4 divide-y divide-linea rounded-[10px] border border-linea">
          {following.map((person) => {
            const tone = person.risk && person.risk.count > 0 ? person.risk.tone : person.risk ? "exito" : "neutro";
            return (
              <li key={person.id} className="flex items-start gap-3 px-3.5 py-3">
                <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${TONE_DOT[tone]}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-tinta">{person.alias}</p>
                  <p className="text-[13px] leading-snug text-tinta-suave">{lovedStatus(person, locale, t)}</p>
                  {person.point ? (
                    <button
                      type="button"
                      onClick={() => onShowOnMap(person)}
                      className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-primario-fuerte underline underline-offset-4"
                    >
                      <MapPin className="size-3.5" aria-hidden />
                      {t("Ver en el mapa", "Show on map")}
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t(`¿Dejar de recibir avisos de ${person.alias}?`, `Stop getting alerts for ${person.alias}?`))) void remove(person.id, "following");
                  }}
                  className="rounded-md p-1 text-tinta-suave hover:bg-hundida hover:text-tinta"
                  aria-label={t(`Quitar a ${person.alias}`, `Remove ${person.alias}`)}
                >
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {open ? (
        link ? (
          <div className="mt-4 rounded-[10px] bg-primario-suave p-3.5">
            <p className="text-[14px] font-semibold text-primario-fuerte">
              {t(`Envíele este link a ${alias}. Cuando lo acepte, aparecerá aquí.`, `Send this link to ${alias}. Once accepted, they will appear here.`)}
            </p>
            <p className="mt-2 break-all rounded-md bg-white/70 px-2.5 py-2 font-mono text-[12px] text-tinta">{link}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button type="button" onClick={() => void copy()} className="boton boton-chico boton-principal">
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? t("Copiado", "Copied") : t("Copiar link", "Copy link")}
              </button>
              {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
                <button type="button" onClick={() => void navigator.share({ title: "Gamma Alert", url: link }).catch(() => {})} className="boton boton-chico boton-cristal">
                  <Share2 className="size-4" aria-hidden />
                  {t("Compartir", "Share")}
                </button>
              ) : null}
              <button type="button" onClick={reset} className="boton boton-chico boton-cristal">
                {t("Listo", "Done")}
              </button>
            </div>
            <p className="mt-2 text-[12px] text-tinta-suave">{t("El link sirve una sola vez y vence en 48 horas.", "The link works once and expires in 48 hours.")}</p>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-tinta">
              {t("¿Quién es?", "Who is it?")}
              <input value={alias} onChange={(event) => setAlias(event.target.value)} maxLength={40} required placeholder={t("Mamá", "Mom")} className={FIELD} />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-tinta">
              {t("Su nombre (lo verá al abrir el link)", "Your name (shown when they open the link)")}
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required placeholder="Juan" autoComplete="given-name" className={FIELD} />
            </label>
            {problem ? <p role="alert" className="text-[13px] text-peligro">{problem}</p> : null}
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="boton boton-principal flex-1 disabled:opacity-60">
                <Share2 className="size-4" aria-hidden />
                {busy ? t("Creando link…", "Creating link…") : t("Crear link de invitación", "Create invite link")}
              </button>
              <button type="button" onClick={reset} className="boton boton-cristal">
                {t("Cancelar", "Cancel")}
              </button>
            </div>
          </form>
        )
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="boton boton-cristal mt-4 w-full">
          <UserPlus className="size-4" aria-hidden />
          {t("Invitar a un ser querido", "Invite a loved one")}
        </button>
      )}

      {followers.length > 0 ? (
        <div className="mt-4 border-t border-linea pt-3">
          <p className="text-[13px] font-semibold text-tinta">{t("Reciben avisos si usted está en riesgo", "Get alerts if you are at risk")}</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {followers.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-2 text-[14px] text-tinta-suave">
                <span>{person.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t(`¿Dejar de compartir su zona con ${person.name}?`, `Stop sharing your area with ${person.name}?`))) void remove(person.id, "follower");
                  }}
                  className="text-[13px] font-semibold text-tinta-suave underline underline-offset-4 hover:text-tinta"
                >
                  {t("Dejar de compartir", "Stop sharing")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-[12px] leading-snug text-tinta-suave">
        {t(
          "Solo se comparte una zona aproximada (~1 km), que se actualiza cuando cada persona abre la app. Nadie ve su ubicación exacta.",
          "Only an approximate area (~1 km) is shared, updated whenever each person opens the app. Nobody sees your exact location.",
        )}
      </p>
    </section>
  );
}
