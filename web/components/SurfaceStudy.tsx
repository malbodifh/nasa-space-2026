"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import CompareSlider from "@/components/CompareSlider";
import { useLocale } from "@/components/LocaleProvider";
import { categoryLabel, displayDate, displayPct, displayStory, intlLocale, studyTitle, type DisplayLocale } from "@/lib/display-i18n";
import { browseProxy, type NisarSearch } from "@/lib/nisar-remote";
import { sarZone, zoneForPoint, type SarZone } from "@/lib/sar";
import { BRIGHTER_RGB, DARKER_RGB, nextPass, pickPair, type Bounds, type PairNote } from "@/lib/sar-change";
import { comparePair, CoverageError, type PairResult } from "@/lib/sar-image";
import { parseStudyDate, parseStudyPoint, scopedStudyPair, type StudySelection } from "@/lib/study-input";

type View = "comparar" | "cambios" | "optico";

type StudyPass = {
  date: string;
  status: "validado" | "provisional";
  url: string;
  granule: string;
  thumb: string | null;
};

type Source = { passes: StudyPass[]; frame: Bounds; region: Bounds | null; zone: SarZone | null };

/** Qué buscar en el radar según el tipo de evento. */
const HINTS: [RegExp, string, string][] = [
  [/inund|tormenta|huracán|lluvia|flood|storm|hurricane|rain/i, "Busque zonas que se oscurecen (posible agua nueva) o se vuelven magenta (posible vegetación con agua debajo). Son hipótesis.", "Look for darker areas (possible new water) or magenta areas (possible water beneath vegetation). These are hypotheses."],
  [/volc/i, "Posibles depósitos de ceniza o lodo en los ríos que bajan del cráter podrían verse más oscuros. El brillo no confirma su presencia.", "Possible ash or mud deposits in rivers below the crater could look darker. Brightness alone does not confirm their presence."],
  [/incend|fire/i, "Un área quemada puede perder hojas y ramas: la señal HV podría bajar. El radar solo no confirma un incendio.", "Burned vegetation may lose leaves and branches, reducing HV. Radar alone does not confirm a fire."],
  [/sismo|desliz|earthquake|landslide/i, "Busque laderas con cambios bruscos de brillo como posible señal de deslizamiento, no como confirmación.", "Look for abrupt brightness changes on slopes as a possible landslide signature, not confirmation."],
  [/radar/i, "La vista previa muestra aquí un cambio aparente entre dos pasadas; no identifica su causa.", "The preview shows an apparent change between two passes; it does not identify its cause."],
];

const FALLBACK_HINT = "Compare las dos fechas y busque zonas que cambiaron de brillo.";

const RADIUS_DEG = 0.22;

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json() as Promise<T>;
}

function opticalUrl([west, south, east, north]: Bounds, date: string, aspect: number): string {
  const width = 900;
  return (
    `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot` +
    `&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326` +
    `&BBOX=${south},${west},${north},${east}&WIDTH=${width}&HEIGHT=${Math.round(width / aspect)}` +
    `&TIME=${date}&FORMAT=image/jpeg`
  );
}

function resultText(result: PairResult, locale: DisplayLocale): { title: string; detail: string } {
  const t = (es: string, en: string) => locale === "es" ? es : en;
  const total = result.brighterPct + result.darkerPct;
  if (total < 2) {
    return { title: t("Poco cambio aparente en la vista previa", "Little apparent change in the preview"), detail: t("Menos del 2 % de los píxeles comparables superó el umbral de cambio de brillo.", "Less than 2 % of comparable pixels exceeded the brightness-change threshold.") };
  }
  if (result.brighterPct >= result.darkerPct) {
    return {
      title: t(`${displayPct(result.brighterPct, locale)} de píxeles comparables más brillantes`, `${displayPct(result.brighterPct, locale)} of comparable pixels are brighter`),
      detail: t("Como hipótesis, podría relacionarse con humedad del suelo o agua bajo la vegetación; también puede deberse al procesamiento.", "Possible hypotheses include wetter soil or water beneath vegetation; processing differences can also contribute."),
    };
  }
  return {
    title: t(`${displayPct(result.darkerPct, locale)} de píxeles comparables más oscuros`, `${displayPct(result.darkerPct, locale)} of comparable pixels are darker`),
    detail: t("Como hipótesis, podría relacionarse con agua nueva o terreno más liso; también puede deberse al procesamiento.", "Possible hypotheses include new water or a smoother surface; processing differences can also contribute."),
  };
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-linea py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-semibold text-tinta">
        {title}
        <ChevronDown className="size-5 text-tinta-suave transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-3 text-[15px] leading-relaxed text-tinta-suave">{children}</div>
    </details>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] border border-linea bg-hundida px-4 py-3">
      <p className="text-[22px] leading-none font-bold tracking-[-0.02em] text-tinta">{value}</p>
      <p className="mt-1.5 text-[12px] font-semibold text-tinta-suave">{label}</p>
    </div>
  );
}

export default function SurfaceStudy() {
  const { locale, t } = useLocale();
  const shortDate = (date: string) => displayDate(date, locale);
  const params = useSearchParams();
  // Validar antes de convertir: `Number(null)` y `Number("")` darían 0 y un punto falso.
  const pointInput = parseStudyPoint(params);
  const dateInput = parseStudyDate(params.get("fecha"));
  const hasPoint = pointInput.status === "valid";
  const lat = pointInput.status === "valid" ? pointInput.point.lat : 0;
  const lon = pointInput.status === "valid" ? pointInput.point.lon : 0;
  const eventDate = dateInput.status === "valid" ? dateInput.date : null;
  const byId = params.get("zona");
  // Una zona precalculada se puede abrir por su id sin coordenadas: los enlaces
  // reproducibles no deberían exigir lat/lon para mostrar el estudio.
  const zone = useMemo(() => {
    if (byId) return sarZone(byId) ?? null;
    return hasPoint ? zoneForPoint({ lat, lon }, 0) : null;
  }, [byId, hasPoint, lat, lon]);
  // Una zona pedida por id que no existe merece un mensaje propio, no "faltan coordenadas".
  const unknownZone = Boolean(byId) && !zone && !hasPoint;
  const invalidField: "coordinates" | "date" | "zone" | null = unknownZone
    ? "zone"
    : !hasPoint && !zone
      ? "coordinates"
      : dateInput.status === "invalid"
        ? "date"
        : null;
  const title = params.get("titulo") ?? t("Cambio de la superficie", "Surface change");
  const kind = params.get("tipo") ?? "";

  const { data: remote, error: remoteError, mutate: retryCatalog, isValidating: retryingCatalog } = useSWR<{ data: NisarSearch | null; meta?: { fallback?: boolean } }>(
    !zone && hasPoint ? `/api/nisar/search?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const source: Source | null = useMemo(() => {
    if (zone) {
      return {
        zone,
        frame: zone.bounds,
        region: null,
        passes: zone.acquisitions
          .filter((item) => item.date >= zone.baseline)
          .map((item) => ({
            date: item.date,
            status: item.status,
            url: item.image,
            granule: item.granule,
            thumb: item.image,
          })),
      };
    }
    if (!hasPoint || !remote?.data) return null;
    return {
      zone: null,
      frame: remote.data.bounds,
      region: [lon - RADIUS_DEG, lat - RADIUS_DEG, lon + RADIUS_DEG, lat + RADIUS_DEG],
      passes: remote.data.passes.map((pass) => ({
        date: pass.date,
        status: pass.status,
        url: browseProxy(pass.collection, pass.granule),
        granule: pass.granule,
        thumb: null,
      })),
    };
  }, [hasPoint, zone, remote, lat, lon]);

  const defaultPair = useMemo(() => (source ? pickPair(source.passes, eventDate) : null), [source, eventDate]);
  const sourceKey = source ? JSON.stringify([lat, lon, eventDate, zone?.id, source.frame, source.region, source.passes.map((pass) => pass.url)]) : "";
  const [chosen, setChosen] = useState<StudySelection | null>(null);
  // Cambiar de zona o de punto debe volver al par por defecto: se descarta la elección previa
  // durante el render (patrón admitido por React) en vez de con un efecto de cascada.
  const [chosenFor, setChosenFor] = useState(sourceKey);
  if (chosenFor !== sourceKey) {
    setChosenFor(sourceKey);
    setChosen(null);
  }
  const scopedPair = scopedStudyPair(chosen, sourceKey, source?.passes.length ?? 0);
  const pair = scopedPair ?? defaultPair;
  const note: PairNote = scopedPair ? null : (defaultPair?.note ?? null);

  const [view, setView] = useState<View>("comparar");
  const [state, setState] = useState<{ key: string; result?: PairResult; error?: string } | null>(null);

  const before = source && pair ? source.passes[pair.before] : null;
  const after = source && pair ? source.passes[pair.after] : null;
  const key = before && after ? `${sourceKey}|${before.url}|${after.url}` : "";

  useEffect(() => {
    if (!source || !before || !after) return;
    let cancelled = false;
    comparePair(before.url, after.url, source.frame, source.region)
      .then((result) => {
        if (!cancelled) setState({ key, result });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          key,
          error:
            error instanceof CoverageError
              ? "coverage"
              : "load",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [source, before, after, key]);

  /** Elegir una pasada en la tira: pasa a ser «después» (o «antes» si es anterior al par actual). */
  function pickFromStrip(index: number) {
    if (!pair) return;
    if (index === pair.before || index === pair.after) return;
    if (index > pair.before) setChosen({ sourceKey, before: pair.before, after: index });
    else setChosen({ sourceKey, before: index, after: pair.after });
  }

  const current = state && state.key === key ? state : null;
  const result = current?.result ?? null;
  const aspect = result ? result.width / result.height : 1.1;
  const marker =
    result && hasPoint
      ? {
          x: (lon - result.bounds[0]) / (result.bounds[2] - result.bounds[0]),
          y: (result.bounds[3] - lat) / (result.bounds[3] - result.bounds[1]),
        }
      : null;
  const matchedHint = HINTS.find(([pattern]) => pattern.test(`${kind} ${title}`));
  const hint = matchedHint ? matchedHint[locale === "es" ? 1 : 2] : t(FALLBACK_HINT, "Compare the two dates and look for areas with different brightness.");
  const hasRemoteData = Boolean(remote?.data);
  // Error de consulta (red, 502, timeout) nunca equivale a "no hay imágenes".
  const catalogFailed = !zone && !hasRemoteData && (Boolean(remoteError) || Boolean(remote && remote.meta?.fallback));
  // Solo una respuesta válida y vacía permite afirmar falta de imágenes.
  const catalogEmpty = !zone && Boolean(remote && !remote.data && !remoteError && !remote.meta?.fallback);
  const catalogPartial = !zone && !catalogFailed && !catalogEmpty && Boolean(remoteError || remote?.meta?.fallback);
  const loadingSource = hasPoint && !source && !catalogFailed && !catalogEmpty;
  const text = result ? resultText(result, locale) : null;
  const story = zone ? displayStory(zone, locale) : null;
  const provisional = before?.status === "provisional" || after?.status === "provisional";

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6">
      <Link href="/" className="boton boton-cristal boton-chico">
        <ArrowLeft className="size-4" aria-hidden />
        {t("Volver", "Back")}
      </Link>

      <p className="etiqueta mt-8">{[categoryLabel(kind, kind, locale), eventDate ? shortDate(eventDate) : null].filter(Boolean).join(" · ")}</p>
      <h1 className="mt-2 text-[32px] leading-[1.06] font-bold tracking-[-0.035em] sm:text-[48px]">
        {t("Cómo cambió la", "How the")} <span className="text-primario">{t("superficie", "surface changed")}</span>
      </h1>
      <p className="mt-3 max-w-[720px] text-[18px] leading-snug text-tinta-suave">{studyTitle(title, locale)}</p>
      {/simulad|demo/i.test(title) ? (
        <p role="status" className="mt-4 rounded-[10px] bg-aviso px-4 py-3 text-[14px] font-semibold text-white">{t("Evento de demostración, no real. Las imágenes de radar son observaciones reales y no prueban consecuencias del escenario simulado.", "Simulated event, not real. Radar images are real observations and do not show consequences of the simulated scenario.")}</p>
      ) : null}

      {invalidField ? (
        <p role="alert" className="tarjeta mt-8 text-[16px] text-tinta-suave">
          {invalidField === "zone"
            ? t("La zona solicitada no existe. Abra el estudio desde un evento o indique coordenadas.", "The requested area does not exist. Open the study from an event or provide coordinates.")
            : pointInput.status === "missing"
            ? t("Falta el lugar del evento: indique latitud y longitud.", "The event location is missing: provide both latitude and longitude.")
            : invalidField === "date"
              ? t("La fecha no es válida. Use una fecha real en formato AAAA-MM-DD.", "The date is invalid. Use a real calendar date in YYYY-MM-DD format.")
              : t("El lugar no es válido. Indique coordenadas no vacías: latitud entre −90 y 90, longitud entre −180 y 180.", "The location is invalid. Provide non-empty coordinates: latitude from −90 to 90, longitude from −180 to 180.")}
        </p>
      ) : catalogFailed ? (
        <div role="alert" className="tarjeta mt-8">
          <p className="text-[18px] font-semibold">{t("No pudimos consultar el catálogo; esto no significa que no haya imágenes.", "We couldn't query the catalog; this does not mean there are no images.")}</p>
          <p className="mt-2 text-[15px] text-tinta-suave">{t("El fallo puede ser de red o del servicio. Revise su conexión e intente de nuevo; no interpretamos el error como falta de cobertura.", "The failure may be network or service-related. Check your connection and try again; we do not read the error as missing coverage.")}</p>
          <button type="button" onClick={() => void retryCatalog()} disabled={retryingCatalog} className="boton boton-principal mt-4 disabled:opacity-60">{retryingCatalog ? t("Consultando…", "Checking…") : t("Reintentar consulta", "Retry catalog query")}</button>
        </div>
      ) : catalogEmpty ? (
        <div className="tarjeta mt-8">
          <p className="text-[18px] font-semibold">{t("El catálogo respondió y no devolvió imágenes de radar para este lugar.", "The catalog responded and returned no radar images for this location.")}</p>
          <p className="mt-2 text-[15px] text-tinta-suave">{t("Vuelva a revisar en unos días: el satélite repite su órbita cada 12 días, aunque puede haber huecos en los datos.", "Check again in a few days: the satellite repeats its orbit every 12 days, though data gaps can occur.")}</p>
        </div>
      ) : loadingSource || !source ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="tarjeta h-[480px] animate-pulse" />
          <div className="tarjeta h-[480px] animate-pulse" />
        </div>
      ) : !pair ? (
        <p className="tarjeta mt-8 text-[16px] text-tinta-suave">{t("Todavía hay una sola pasada del radar sobre este lugar.", "Only one radar pass is available for this location so far.")}</p>
      ) : (
        <>
          {catalogPartial ? (
            <div role="status" className="tarjeta mt-8 flex flex-wrap items-center justify-between gap-3 border-linea-fuerte">
              <p className="text-[14px] leading-snug text-tinta">
                {t("Consulta parcial: una fuente no respondió o devolvió datos incompletos. Pueden faltar imágenes; esto no significa que no existan.", "Partial query: a source did not respond or returned incomplete data. Images may be missing; this does not mean they don't exist.")}
              </p>
              <button type="button" onClick={() => void retryCatalog()} disabled={retryingCatalog} className="boton boton-cristal boton-chico disabled:opacity-60">{retryingCatalog ? t("Consultando…", "Checking…") : t("Reintentar consulta", "Retry catalog query")}</button>
            </div>
          ) : null}
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="tarjeta p-3 sm:p-4 lg:sticky lg:top-4">
              <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label={t("Tipo de vista", "View type")}>
                {(
                  [
                    ["comparar", t("Antes y después", "Before and after")],
                    ["cambios", t("Ver cambios", "View changes")],
                    ["optico", t("Foto normal vs radar", "Optical photo vs radar")],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={view === value}
                    onClick={() => setView(value)}
                    className={`boton boton-chico ${view === value ? "boton-principal" : "boton-cristal"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {current?.error ? (
                <p className="grid aspect-[1.1] place-items-center rounded-[10px] bg-hundida p-6 text-center text-[15px] text-tinta-suave">
                  {current.error === "coverage" ? t("El radar no cubre bien este lugar en esas fechas. Pruebe con otras.", "Radar coverage is insufficient here on these dates. Try different dates.") : t("No pudimos cargar las imágenes de radar. Intente de nuevo más tarde.", "We couldn't load the radar images. Please try again later.")}
                </p>
              ) : !result || !before || !after ? (
                <div className="grid aspect-[1.1] place-items-center rounded-[10px] bg-hundida p-6 text-center text-[15px] text-tinta-suave">
                  <p className="animate-pulse">
                    {source.zone
                      ? t("Cargando imágenes de radar…", "Loading radar images…")
                      : t("Descargando dos imágenes del satélite. Puede tardar unos segundos.", "Downloading two satellite images. This may take a few seconds.")}
                  </p>
                </div>
              ) : view === "optico" ? (
                <CompareSlider
                  aspect={aspect}
                  marker={marker}
                  left={{ src: opticalUrl(result.bounds, after.date, aspect), label: `${t("Foto", "Photo")} · ${shortDate(after.date)}` }}
                  right={{ src: result.after, label: `Radar · ${shortDate(after.date)}` }}
                />
              ) : (
                <CompareSlider
                  aspect={aspect}
                  marker={marker}
                  left={{ src: result.before, label: `${t("Antes", "Before")} · ${shortDate(before.date)}` }}
                  right={{
                    src: result.after,
                    label: `${t("Después", "After")} · ${shortDate(after.date)}`,
                    overlay: view === "cambios" ? result.change : null,
                  }}
                />
              )}

              {view === "cambios" && result ? (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1 text-[13px] font-semibold text-tinta-suave">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: `rgb(${BRIGHTER_RGB.join(",")})` }} />
                    {t("Más brillante", "Brighter")}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: `rgb(${DARKER_RGB.join(",")})` }} />
                    {t("Más oscuro", "Darker")}
                  </span>
                </div>
              ) : null}
              {view === "optico" && result ? (
                <p className="mt-3 px-1 text-[13px] text-tinta-suave">
                  {t("La foto normal depende del sol y suele salir nublada. El radar ve a través de las nubes.", "An optical photo depends on sunlight and is often obscured by clouds. Radar sees through clouds.")}
                </p>
              ) : null}
            </section>

            <div className="flex flex-col gap-4">
              {note ? (
                <p className="rounded-[14px] bg-primario-suave px-5 py-4 text-[15px] leading-relaxed text-tinta">
                  {note === "antes-de-los-datos"
                    ? t("El evento empezó antes de que el radar tuviera imágenes de este lugar. Comparamos la primera y la última pasada.", "The event began before radar images were available here. We compare the first and last available passes.")
                    : t(`El radar todavía no pasó después del evento; la próxima pasada sería cerca del ${shortDate(nextPass(source.passes[source.passes.length - 1].date))}. Mientras tanto, mostramos las dos últimas.`, `No post-event radar pass is available yet; the next is expected around ${shortDate(nextPass(source.passes[source.passes.length - 1].date))}. Meanwhile, we show the latest two.`)}
                </p>
              ) : null}

              <section className="tarjeta">
                {text && result && before && after ? (
                  <>
                    <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">{text.title}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-tinta-suave">{text.detail}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Stat value={`≈ ${displayPct(result.brighterPct + result.darkerPct, locale)}`} label={t("Píxeles con cambio aparente (aprox.)", "Apparent preview-pixel change (approx.)")} />
                      <Stat value={`${daysBetween(before.date, after.date).toLocaleString(intlLocale(locale))} ${t("días", "days")}`} label={t("Entre las dos imágenes", "Between the two images")} />
                    </div>
                    <p className="mt-5 border-t border-linea pt-4 text-[15px] leading-relaxed text-tinta-suave">{hint}</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="h-7 w-4/5 animate-pulse rounded-md bg-hundida" />
                    <div className="h-4 w-3/5 animate-pulse rounded-md bg-hundida" />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="h-16 animate-pulse rounded-[10px] bg-hundida" />
                      <div className="h-16 animate-pulse rounded-[10px] bg-hundida" />
                    </div>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-linea pt-5">
                  {(
                    [
                      ["before", t("Antes", "Before")],
                      ["after", t("Después", "After")],
                    ] as const
                  ).map(([side, label]) => (
                    <label key={side} className="block">
                      <span className="etiqueta">{label}</span>
                      <select
                        className="mt-2 h-11 w-full rounded-[8px] border border-linea-fuerte bg-elevada px-3 text-[15px]"
                        value={pair[side]}
                        onChange={(event) => setChosen({ ...pair, sourceKey, [side]: Number(event.target.value) })}
                      >
                        {source.passes.map((pass, index) => (
                          <option
                            key={pass.date}
                            value={index}
                            disabled={side === "before" ? index >= pair.after : index <= pair.before}
                          >
                            {shortDate(pass.date)} · {pass.status === "validado" ? t("Validada", "Validated") : t("Provisional", "Provisional")}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-4 rounded-[10px] bg-hundida p-4 text-[13px] leading-relaxed text-tinta-suave">
                  {t("Vista previa de 8 bits no calibrada: los porcentajes describen píxeles comparables con cambio aparente de brillo, no superficie dañada ni inundación confirmada. Un cambio no identifica su causa.", "Uncalibrated 8-bit preview: percentages describe comparable pixels with apparent brightness change, not damaged land or confirmed flooding. A change does not identify its cause.")}
                  {provisional ? ` ${t("Esta comparación incluye al menos una pasada provisional; las diferencias de procesamiento o calibración pueden influir en el resultado.", "This comparison includes at least one provisional pass; processing or calibration differences may affect the result.")}` : ""}
                </p>
                <Details title={t("Cómo leer la imagen", "How to read the image")}>
                  <ul className="space-y-2">
                    <li>
                      <strong className="text-tinta">{t("Oscuro:", "Dark:")}</strong> {t("posible agua o terreno liso. El agua refleja el radar lejos del satélite.", "possible water or smooth ground. Water reflects radar away from the satellite.")}
                    </li>
                    <li>
                      <strong className="text-tinta">{t("Blanco y verde claro:", "White and light green:")}</strong> {t("posible bosque o vegetación densa.", "possible forest or dense vegetation.")}
                    </li>
                    <li>
                      <strong className="text-tinta">Magenta:</strong> {t("posible vegetación con agua debajo, arrozales o construcciones. La señal puede rebotar en el agua y luego en los tallos.", "possible flooded vegetation, rice fields or buildings. The signal may bounce off water and then stems.")}
                    </li>
                  </ul>
                </Details>
                <Details title={t("Cómo funciona el radar", "How radar works")}>
                  <p>
                    {t("NISAR, de NASA e ISRO, lleva su propia luz: emite microondas de 24 cm y mide el eco. Por eso ve de día, de noche y con nubes. El eco cambia con la rugosidad del terreno y con la humedad. Repite su órbita cada 12 días; comparamos pasadas de la misma órbita para mantener el ángulo de observación.", "NASA and ISRO's NISAR carries its own light: it emits 24 cm microwaves and measures the echo, operating day and night through clouds. The echo varies with surface roughness and moisture. Its orbit repeats every 12 days; we compare passes from the same orbit to keep the viewing angle consistent.")}
                  </p>
                </Details>
                {story ? (
                  <>
                    <Details title={`${t("Zona de estudio:", "Study area:")} ${story.name}`}>
                      <p>{story.lead}</p>
                      <h3 className="mt-3 font-semibold text-tinta">{t("Qué mirar", "What to look for")}</h3>
                      <ul className="mt-2 space-y-2">{story.look.map((item) => <li key={item}>{item}</li>)}</ul>
                      <h3 className="mt-3 font-semibold text-tinta">{t("Huella humana", "Human footprint")}</h3>
                      <p className="mt-2">{story.human}</p>
                    </Details>
                    <Details title={t("Hipótesis: ¿por qué pudo cambiar?", "Hypotheses: why might it have changed?")}>
                      <ul className="space-y-2">
                        {story.hypotheses.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </Details>
                  </>
                ) : null}
                <Details title={t("Datos", "Data")}>
                  <p>
                    {t("NASA-ISRO NISAR, producto L2 GCOV, vista previa pública de ASF DAAC. Rojo y azul: HH; verde: HV. Se compara el brillo HH suavizado, no gamma0 calibrado; se ignoran los píxeles oscuros en ambas fechas. El umbral visual es 38/255, sin significado físico calibrado. Las cifras son aproximadas.", "NASA-ISRO NISAR L2 GCOV, public ASF DAAC preview. Red and blue: HH; green: HV. We compare smoothed HH brightness, not calibrated gamma0; pixels dark on both dates are ignored. The visual threshold is 38/255, without calibrated physical meaning. Figures are approximate.")}
                  </p>
                  <p className="mt-2 text-[13px] break-all">
                    {before?.granule}
                    <br />
                    {after?.granule}
                  </p>
                </Details>
              </section>
            </div>
          </div>

          <section className="mt-14" aria-labelledby="pasadas">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="pasadas" className="text-[24px] font-bold tracking-[-0.02em]">
                {t("Pasadas del radar", "Radar passes")}
              </h2>
              <p className="text-[14px] text-tinta-suave">
                {source.passes.length.toLocaleString(intlLocale(locale))} {t("imágenes · elija una para compararla", "images · choose one to compare")}
              </p>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {source.passes.map((pass, index) => {
                const role = index === pair.before ? t("Antes", "Before") : index === pair.after ? t("Después", "After") : null;
                return (
                  <button
                    key={pass.date}
                    type="button"
                    onClick={() => pickFromStrip(index)}
                    aria-pressed={role !== null}
                    className={`w-[132px] shrink-0 overflow-hidden rounded-[12px] bg-elevada text-left transition ${
                      role ? "ring-2 ring-primario" : "hover:ring-1 hover:ring-linea-fuerte"
                    }`}
                    style={{ boxShadow: "var(--sombra-tarjeta)" }}
                  >
                    {pass.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pass.thumb} alt="" className="aspect-square w-full bg-profundo object-cover" loading="lazy" />
                    ) : (
                      <div className="grid aspect-square w-full place-items-center bg-hundida text-[13px] font-semibold text-tinta-suave">
                        NISAR
                      </div>
                    )}
                    <div className="px-3 py-2.5">
                      <p className="text-[14px] font-semibold text-tinta">{shortDate(pass.date)}</p>
                      <p className={`mt-0.5 text-[12px] font-semibold ${role ? "text-primario-fuerte" : "text-tinta-suave"}`}>
                        {role ?? (pass.status === "validado" ? t("Validada", "Validated") : t("Provisional", "Provisional"))}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
