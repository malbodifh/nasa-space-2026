"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import CompareSlider from "@/components/CompareSlider";
import { shortDate } from "@/lib/demo";
import { browseProxy, type NisarSearch } from "@/lib/nisar-remote";
import { formatPct, sarZone, zoneAreaKm2, zoneForPoint, type SarZone } from "@/lib/sar";
import { BRIGHTER_RGB, DARKER_RGB, nextPass, pickPair, type Bounds, type PairNote } from "@/lib/sar-change";
import { comparePair, CoverageError, type PairResult } from "@/lib/sar-image";

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
const HINTS: [RegExp, string][] = [
  [/inund|tormenta|huracán|lluvia/i, "Busque zonas que se oscurecen (agua nueva) o se vuelven magenta (vegetación con agua debajo)."],
  [/volc/i, "Busque depósitos de ceniza o lodo en los ríos que bajan del cráter: se ven más oscuros."],
  [/incend/i, "Un área quemada pierde hojas y ramas: la señal HV baja y la zona se oscurece."],
  [/sismo|desliz/i, "Busque deslizamientos: laderas que cambian de brillo de golpe."],
  [/radar/i, "El radar detectó aquí un cambio grande entre dos pasadas."],
];

const FALLBACK_HINT = "Compare las dos fechas y busque zonas que cambiaron de brillo.";

const RADIUS_DEG = 0.22;

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
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

function resultText(result: PairResult): { title: string; detail: string } {
  const total = result.brighterPct + result.darkerPct;
  if (total < 2) {
    return { title: "La superficie casi no cambió", detail: "Menos del 2 % del área cambió entre estas fechas." };
  }
  if (result.brighterPct >= result.darkerPct) {
    return {
      title: `${formatPct(result.brighterPct)} del área se volvió más brillante`,
      detail: "Suele indicar suelo más húmedo o vegetación con agua debajo.",
    };
  }
  return {
    title: `${formatPct(result.darkerPct)} del área se volvió más oscura`,
    detail: "Suele indicar agua nueva o un terreno más liso.",
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
  const params = useSearchParams();
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lon) && params.has("lat");
  const eventDate = params.get("fecha");
  const title = params.get("titulo") ?? "Cambio de la superficie";
  const kind = params.get("tipo") ?? "";

  const zone = useMemo(() => {
    const byId = params.get("zona");
    if (byId) return sarZone(byId) ?? null;
    return hasPoint ? zoneForPoint({ lat, lon }, 0) : null;
  }, [params, hasPoint, lat, lon]);

  const { data: remote, error: remoteError } = useSWR<{ data: NisarSearch | null }>(
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
    if (!remote?.data) return null;
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
  }, [zone, remote, lat, lon]);

  const defaultPair = useMemo(() => (source ? pickPair(source.passes, eventDate) : null), [source, eventDate]);
  const [chosen, setChosen] = useState<{ before: number; after: number } | null>(null);
  const pair = chosen ?? defaultPair;
  const note: PairNote = chosen ? null : (defaultPair?.note ?? null);

  const [view, setView] = useState<View>("comparar");
  const [state, setState] = useState<{ key: string; result?: PairResult; error?: string } | null>(null);

  const before = source && pair ? source.passes[pair.before] : null;
  const after = source && pair ? source.passes[pair.after] : null;
  const key = before && after ? `${before.url}|${after.url}` : "";

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
              ? "El radar no cubre bien este lugar en esas fechas. Pruebe con otras."
              : "No pudimos cargar las imágenes de radar. Intente de nuevo más tarde.",
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
    if (index > pair.before) setChosen({ before: pair.before, after: index });
    else setChosen({ before: index, after: pair.after });
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
  const hint = HINTS.find(([pattern]) => pattern.test(`${kind} ${title}`))?.[1] ?? FALLBACK_HINT;
  const loadingSource = !source && !remoteError && !(remote && !remote.data) && hasPoint;
  const text = result ? resultText(result) : null;
  const area = result ? zoneAreaKm2(result.bounds) : 0;
  const changedKm2 = result ? Math.round(((result.brighterPct + result.darkerPct) / 100) * area) : 0;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6">
      <Link href="/" className="boton boton-cristal boton-chico">
        <ArrowLeft className="size-4" aria-hidden />
        Volver
      </Link>

      <p className="etiqueta mt-8">{[kind, eventDate ? shortDate(eventDate) : null].filter(Boolean).join(" · ")}</p>
      <h1 className="mt-2 text-[32px] leading-[1.06] font-bold tracking-[-0.035em] sm:text-[48px]">
        Cómo cambió la <span className="text-primario">superficie</span>
      </h1>
      <p className="mt-3 max-w-[720px] text-[18px] leading-snug text-tinta-suave">{title}</p>

      {!hasPoint ? (
        <p className="tarjeta mt-8 text-[16px] text-tinta-suave">Falta el lugar del evento.</p>
      ) : remoteError || (remote && !remote.data) ? (
        <div className="tarjeta mt-8">
          <p className="text-[18px] font-semibold">El radar NISAR todavía no tiene imágenes de este lugar.</p>
          <p className="mt-2 text-[15px] text-tinta-suave">Vuelva a revisar en unos días: el satélite pasa cada 12 días.</p>
        </div>
      ) : loadingSource || !source ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="tarjeta h-[480px] animate-pulse" />
          <div className="tarjeta h-[480px] animate-pulse" />
        </div>
      ) : !pair ? (
        <p className="tarjeta mt-8 text-[16px] text-tinta-suave">Todavía hay una sola pasada del radar sobre este lugar.</p>
      ) : (
        <>
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="tarjeta p-3 sm:p-4 lg:sticky lg:top-4">
              <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Tipo de vista">
                {(
                  [
                    ["comparar", "Antes y después"],
                    ["cambios", "Ver cambios"],
                    ["optico", "Foto normal vs radar"],
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
                  {current.error}
                </p>
              ) : !result || !before || !after ? (
                <div className="grid aspect-[1.1] place-items-center rounded-[10px] bg-hundida p-6 text-center text-[15px] text-tinta-suave">
                  <p className="animate-pulse">
                    {source.zone
                      ? "Cargando imágenes de radar…"
                      : "Descargando dos imágenes del satélite. Puede tardar unos segundos."}
                  </p>
                </div>
              ) : view === "optico" ? (
                <CompareSlider
                  aspect={aspect}
                  marker={marker}
                  left={{ src: opticalUrl(result.bounds, after.date, aspect), label: `Foto · ${shortDate(after.date)}` }}
                  right={{ src: result.after, label: `Radar · ${shortDate(after.date)}` }}
                />
              ) : (
                <CompareSlider
                  aspect={aspect}
                  marker={marker}
                  left={{ src: result.before, label: `Antes · ${shortDate(before.date)}` }}
                  right={{
                    src: result.after,
                    label: `Después · ${shortDate(after.date)}`,
                    overlay: view === "cambios" ? result.change : null,
                  }}
                />
              )}

              {view === "cambios" && result ? (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1 text-[13px] font-semibold text-tinta-suave">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: `rgb(${BRIGHTER_RGB.join(",")})` }} />
                    Más brillante
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: `rgb(${DARKER_RGB.join(",")})` }} />
                    Más oscuro
                  </span>
                </div>
              ) : null}
              {view === "optico" && result ? (
                <p className="mt-3 px-1 text-[13px] text-tinta-suave">
                  La foto normal depende del sol y suele salir nublada. El radar ve a través de las nubes.
                </p>
              ) : null}
            </section>

            <div className="flex flex-col gap-4">
              {note ? (
                <p className="rounded-[14px] bg-primario-suave px-5 py-4 text-[15px] leading-relaxed text-tinta">
                  {note === "antes-de-los-datos"
                    ? "El evento empezó antes de que el radar tuviera imágenes de este lugar. Comparamos la primera y la última pasada."
                    : `El radar todavía no pasó después del evento; la próxima pasada sería cerca del ${shortDate(nextPass(source.passes[source.passes.length - 1].date))}. Mientras tanto, mostramos las dos últimas.`}
                </p>
              ) : null}

              <section className="tarjeta">
                {text && before && after ? (
                  <>
                    <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">{text.title}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-tinta-suave">{text.detail}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Stat value={`≈ ${changedKm2.toLocaleString("es-CR")} km²`} label="Área que cambió" />
                      <Stat value={`${daysBetween(before.date, after.date)} días`} label="Entre las dos imágenes" />
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
                      ["before", "Antes"],
                      ["after", "Después"],
                    ] as const
                  ).map(([side, label]) => (
                    <label key={side} className="block">
                      <span className="etiqueta">{label}</span>
                      <select
                        className="mt-2 h-11 w-full rounded-[8px] border border-linea-fuerte bg-elevada px-3 text-[15px]"
                        value={pair[side]}
                        onChange={(event) => setChosen({ ...pair, [side]: Number(event.target.value) })}
                      >
                        {source.passes.map((pass, index) => (
                          <option
                            key={pass.date}
                            value={index}
                            disabled={side === "before" ? index >= pair.after : index <= pair.before}
                          >
                            {shortDate(pass.date)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <Details title="Cómo leer la imagen">
                  <ul className="space-y-2">
                    <li>
                      <strong className="text-tinta">Oscuro:</strong> agua o terreno liso. El agua refleja el
                      radar lejos del satélite.
                    </li>
                    <li>
                      <strong className="text-tinta">Blanco y verde claro:</strong> bosque o vegetación densa.
                    </li>
                    <li>
                      <strong className="text-tinta">Magenta:</strong> vegetación con agua debajo, arrozales o
                      construcciones. La señal rebota en el agua y luego en los tallos.
                    </li>
                  </ul>
                </Details>
                <Details title="Cómo funciona el radar">
                  <p>
                    NISAR, de NASA e ISRO, lleva su propia luz: emite microondas de 24 cm y mide el eco. Por eso
                    ve de día, de noche y con nubes. El eco cambia con la rugosidad del terreno y con la humedad.
                    Pasa por el mismo lugar cada 12 días, siempre con el mismo ángulo, así que dos pasadas se
                    pueden comparar.
                  </p>
                </Details>
                {zone ? (
                  <Details title="¿Por qué cambió?">
                    <ul className="space-y-2">
                      {zone.hypotheses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </Details>
                ) : null}
                <Details title="Datos">
                  <p>
                    NASA-ISRO NISAR, producto L2 GCOV, vista previa pública de ASF DAAC. Rojo y azul: HH; verde:
                    HV. El cambio compara el brillo HH suavizado; se ignora el agua oscura en ambas fechas. Las
                    cifras son aproximadas.
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
                Pasadas del radar
              </h2>
              <p className="text-[14px] text-tinta-suave">
                {source.passes.length} imágenes · elija una para compararla
              </p>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {source.passes.map((pass, index) => {
                const role = index === pair.before ? "Antes" : index === pair.after ? "Después" : null;
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
                        {role ?? (pass.status === "validado" ? "Validada" : "Provisional")}
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
