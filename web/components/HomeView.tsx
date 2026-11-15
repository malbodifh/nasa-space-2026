"use client";

import { Bell, BellRing, FlaskConical, LocateFixed, X } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import AlertToasts from "@/components/AlertToasts";
import EventList from "@/components/EventList";
import SafetyAdvice from "@/components/SafetyAdvice";
import { useLocale } from "@/components/LocaleProvider";
import { useAlertNotifications } from "@/components/useAlertNotifications";
import { DEMO_POINT } from "@/lib/demo";
import { buildDemoAlerts, DEMO_ALL, DEMO_SCENARIOS } from "@/lib/demo-scenarios";
import { categoryLabel, demoScenarioText, displayDate, displayDetail, displayTimeAgo, displayWhen, eventTitle, intlLocale, officialLabel, sourceLabel } from "@/lib/display-i18n";
import {
  affecting,
  buildHistory,
  FIRE_LABEL,
  fromAlert,
  locationStatus,
  NEAR_KM,
  placeName,
  radarDetections,
  type Tone,
} from "@/lib/events";
import { SAR_ZONES } from "@/lib/sar";
import type { AssessResponse, EventsResponse, LatLon } from "@/lib/types";

const HomeMap = dynamic(() => import("@/components/HomeMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-hundida" />,
});

/**
 * El mapa pesa cerca de 1 MB y bloquea el hilo principal varios segundos en un celular.
 * Se pide recién cuando el navegador queda libre, para que el texto pinte primero.
 */
function useAfterFirstPaint() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(id);
  }, []);
  return ready;
}

type LocationState = { point: LatLon; status: "buscando" | "gps" | "ejemplo" };

// Costa Rica mide unos 460 km de punta a punta: con 450 km, desde cualquier lugar del país se
// ven los eventos de todo el territorio (por ejemplo, un sismo en Golfito visto desde Liberia).
const REGION_KM = 450;

const TONE_DOT: Record<Tone, string> = {
  exito: "bg-exito",
  aviso: "bg-aviso",
  peligro: "bg-peligro",
  neutro: "bg-linea-fuerte",
};

const LATEST_RADAR = SAR_ZONES.flatMap((zone) => zone.acquisitions.map((item) => item.date)).sort().at(-1);

async function fetcher<T>(url: string): Promise<T> {
  // Sin timeout, una petición colgada deja la Home en carga para siempre.
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json() as Promise<T>;
}

function Stat({ value, label }: { value: string | number | null; label: string }) {
  return (
    <div className="tarjeta p-5 sm:p-5">
      {value === null ? (
        <div className="h-8 w-12 animate-pulse rounded-md bg-hundida" />
      ) : (
        <p className="text-[30px] leading-none font-bold tracking-[-0.03em] text-tinta">{value}</p>
      )}
      <p className="mt-2 text-[13px] leading-snug font-semibold text-tinta-suave">{label}</p>
    </div>
  );
}

export default function HomeView() {
  const { locale, t } = useLocale();
  const [location, setLocation] = useState<LocationState>({ point: DEMO_POINT, status: "ejemplo" });
  const [locationError, setLocationError] = useState(false);
  const [activeLimit, setActiveLimit] = useState(5);
  const [historyLimit, setHistoryLimit] = useState(6);
  const [filter, setFilter] = useState("todos");
  // Modo demo: alertas simuladas para probar la app. `at` es el momento en que se activó.
  const [demo, setDemo] = useState<{ id: string; at: number } | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const mapReady = useAfterFirstPaint();

  const locate = useCallback(() => {
    setLocationError(false);
    if (!("geolocation" in navigator)) {
      setLocationError(true);
      return;
    }
    setLocation((current) => ({ ...current, status: "buscando" }));
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation({
          point: { lat: position.coords.latitude, lon: position.coords.longitude },
          status: "gps",
        }),
      () => {
        setLocation((current) => ({ ...current, status: "ejemplo" }));
        setLocationError(true);
      },
      { timeout: 8000, maximumAge: 5 * 60_000 },
    );
  }, []);

  const { point } = location;
  const query = `lat=${point.lat.toFixed(3)}&lon=${point.lon.toFixed(3)}`;
  const ready = location.status !== "buscando";

  const { data: events, error: eventsError } = useSWR<EventsResponse>(
    ready ? `/api/events?${query}&radius=${REGION_KM}` : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 60_000 },
  );
  const { data: assess, error: assessError } = useSWR<AssessResponse>(ready ? `/api/assess?${query}&radius=25` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const demoAlerts = useMemo(() => (demo ? buildDemoAlerts(demo.id, point, demo.at) : []), [demo, point]);
  const allAlerts = useMemo(() => [...demoAlerts, ...(events?.data.alerts ?? [])], [demoAlerts, events]);
  const active = useMemo(() => [...allAlerts].sort((a, b) => a.distanceKm - b.distanceKm), [allAlerts]);
  const history = useMemo(
    () =>
      buildHistory(
        events?.data.history ?? [],
        radarDetections(point).filter((item) => (item.distanceKm ?? 0) <= REGION_KM),
      ),
    [events, point],
  );
  // La lista va de la más reciente a la más antigua; el estado sigue usando la más cercana.
  const activeItems = useMemo(
    () => [...active].sort((a, b) => b.date.localeCompare(a.date)).map(fromAlert),
    [active],
  );
  const categories = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const item of history) {
      const entry = counts.get(item.category) ?? { label: categoryLabel(item.category, item.categoryLabel, locale), count: 0 };
      entry.count += 1;
      counts.set(item.category, entry);
    }
    return [...counts.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [history, locale]);
  const filtered = filter === "todos" ? history : history.filter((item) => item.category === filter);

  const status = locationStatus(active);
  const relevant = useMemo(() => (events || demoAlerts.length ? affecting(allAlerts) : null), [events, demoAlerts.length, allAlerts]);
  const notifications = useAlertNotifications(relevant);
  function exitDemo() {
    setDemo(null);
    for (const toast of notifications.toasts) {
      if (toast.id.startsWith("demo-")) notifications.dismiss(toast.id);
    }
  }
  const sources = events?.meta.sources ?? [];
  const online = sources.filter((source) => source.ok).length;
  const staleCount = sources.filter((source) => source.ok && source.stale).length;
  const fire = assess?.data.risk.level;
  // Un fallo de /api/assess no puede quedar en «…» como único estado terminal.
  const fireText = fire
    ? t(FIRE_LABEL[fire], { info: "insufficient data", low: "low", moderate: "moderate", high: "high", extreme: "extreme" }[fire])
    : assessError || assess
      ? t("sin datos", "no data")
      : "…";
  // Fallback: una o más fuentes fallaron. Sin alertas relevantes no se puede afirmar seguridad.
  const incomplete = events?.meta.fallback === true;
  const noAlerts = !status.nearest;
  const headlineTone: Tone = incomplete && noAlerts ? "neutro" : status.tone;
  const updated = events
    ? new Intl.DateTimeFormat(intlLocale(locale), { hour: "2-digit", minute: "2-digit", timeZone: "America/Costa_Rica" }).format(
        new Date(events.meta.updatedAt),
      )
    : null;

  return (
    <div className="min-h-screen">
      <AlertToasts toasts={notifications.toasts} onClose={notifications.dismiss} />
      <main id="contenido" className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6">
        {demo ? (
          <div
            role="status"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-aviso px-4 py-3 text-[14px] font-semibold text-white"
          >
            <span className="inline-flex items-center gap-2">
              <FlaskConical className="size-4" aria-hidden />
              {t("Modo demo: incluye alertas marcadas «Simulación». No son eventos reales.", "Demo mode: includes alerts marked “Simulated”. These are not real events.")}
            </span>
            <button
              type="button"
              onClick={exitDemo}
              className="inline-flex items-center gap-1 underline underline-offset-4"
            >
              <X className="size-4" aria-hidden />
              {t("Salir del demo", "Exit demo")}
            </button>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section
            className="h-[46vh] min-h-[300px] overflow-hidden rounded-[14px] bg-hundida lg:h-auto lg:min-h-[540px]"
            style={{ boxShadow: "var(--sombra-tarjeta)" }}
            aria-label={t("Mapa", "Map")}
          >
            {mapReady ? (
              <HomeMap point={point} radiusKm={NEAR_KM} active={activeItems} history={history} />
            ) : null}
          </section>

          <div className="flex flex-col gap-4">
            <section className="tarjeta" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="etiqueta">
                  {location.status === "buscando"
                    ? t("Buscando su ubicación…", "Finding your location…")
                    : location.status === "gps"
                      ? placeName(point).replace("Cerca de ", t("Cerca de ", "Near "))
                      : `${placeName(point).replace("Cerca de ", t("Cerca de ", "Near "))} · ${t("ubicación de ejemplo", "example location")}`}
                </p>
                {updated ? <p className="text-[12px] text-tinta-suave">{t("Actualizado", "Updated")} {updated}</p> : null}
              </div>

              {!events && !eventsError && !demo ? (
                <div className="mt-4 h-16 animate-pulse rounded-lg bg-hundida" />
              ) : eventsError && !demo ? (
                <p className="mt-3 text-[16px] text-tinta-suave">{t("No pudimos consultar las alertas. Intente más tarde.", "We couldn't retrieve alerts. Please try again later.")}</p>
              ) : (
                <>
                  <h1 className="mt-3 flex items-start gap-3 text-[28px] leading-tight font-bold tracking-[-0.025em]">
                    <span className={`mt-[0.42em] size-3 shrink-0 rounded-full ${TONE_DOT[headlineTone]}`} aria-hidden />
                    {incomplete && noAlerts
                      ? t("Información incompleta: no pudimos revisar todas las fuentes", "Incomplete information: we couldn't check every source")
                      : locale === "es"
                        ? status.title
                        : !status.nearest
                          ? "No alerts for your location"
                          : status.tone === "peligro"
                            ? "Alert for your location"
                            : `${relevant?.length ?? 0} ${(relevant?.length ?? 0) === 1 ? "notice" : "notices"} for your location`}
                  </h1>
                  <p className="mt-2 text-[15px] leading-snug text-tinta-suave">
                    {incomplete && noAlerts
                      ? t("Una o más fuentes no respondieron, así que pueden faltar eventos. Esto no significa que no haya peligro.", "One or more sources did not respond, so events may be missing. This does not mean there is no hazard.")
                      : status.nearest
                        ? `${eventTitle(fromAlert(status.nearest), locale)} · ${t("a ", "")}${Math.round(status.nearest.distanceKm).toLocaleString(intlLocale(locale))} km${t("", " away")}`
                        : t("Ningún evento reciente le afecta, según las reglas de cada amenaza.", "No recent events affect your location under the rules for each hazard.")}
                  </p>
                  {incomplete && !noAlerts ? (
                    <p className="mt-2 text-[13px] leading-snug text-tinta-suave">
                      {t("Algunas fuentes no respondieron: esta revisión está incompleta y puede faltar información.", "Some sources did not respond: this check is incomplete and information may be missing.")}
                    </p>
                  ) : null}
                  {status.nearest?.detail ? (
                    <p className="mt-1 text-[14px] leading-snug text-tinta-suave">{displayDetail(status.nearest.detail, locale)}</p>
                  ) : null}
                  {status.nearest ? (
                    <p className="mt-2 text-[13px] text-tinta-suave">
                      {displayWhen(status.nearest.date, locale)}
                      {status.nearest.url ? (
                        <>
                          {" · "}
                          <a
                            href={status.nearest.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-tinta underline underline-offset-4"
                          >
                            {officialLabel(status.nearest.source, locale)}
                          </a>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </>
              )}

              <div className="mt-5 flex items-center justify-between gap-3 rounded-[10px] border border-linea bg-hundida px-4 py-3">
                <span className="text-[14px] text-tinta-suave">{t("Condiciones para incendios", "Fire conditions")}</span>
                <span className="text-[14px] font-bold text-tinta">{fireText}</span>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setDemoOpen((open) => !open)}
                  aria-expanded={demoOpen}
                  className="boton boton-cristal w-full"
                >
                  <FlaskConical className="size-4" aria-hidden />
                  {t("Probar la app con una alerta simulada", "Try the app with a simulated alert")}
                </button>
                {demoOpen ? (
                  <div className="rounded-[10px] border border-linea bg-hundida p-3">
                    <p className="text-[13px] leading-snug text-tinta-suave">
                      {t("Elija un escenario: aparece en el mapa, la lista y el estado de su ubicación, y llega el aviso si lo activó. No es un evento real.", "Choose a scenario: it appears on the map, in the list and in your location status, with a notification if enabled. It is not a real event.")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[...DEMO_SCENARIOS, { id: DEMO_ALL, label: "Todo a la vez", hint: "" }].map((scenario) => (
                        <button
                          key={scenario.id}
                          type="button"
                          aria-pressed={demo?.id === scenario.id}
                          title={demoScenarioText(scenario.id, locale)?.hint ?? scenario.hint}
                          onClick={() => setDemo({ id: scenario.id, at: Date.now() })}
                          className={`boton boton-chico ${demo?.id === scenario.id ? "boton-principal" : "boton-cristal"}`}
                        >
                          {demoScenarioText(scenario.id, locale)?.label ?? scenario.label}
                        </button>
                      ))}
                    </div>
                    {demo ? (
                      <button
                        type="button"
                        onClick={exitDemo}
                        className="mt-3 text-[13px] font-semibold text-tinta underline underline-offset-4"
                      >
                        {t("Quitar la simulación", "Remove simulation")}
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {location.status !== "gps" ? (
                  <button type="button" onClick={locate} disabled={location.status === "buscando"} aria-busy={location.status === "buscando"} className="boton boton-principal w-full disabled:opacity-60">
                    <LocateFixed className="size-4" aria-hidden />
                    {location.status === "buscando" ? t("Buscando su ubicación…", "Finding your location…") : t("Usar mi ubicación", "Use my location")}
                  </button>
                ) : null}
                {locationError ? (
                  <p role="status" className="text-[13px] text-tinta-suave">{t("No pudimos obtener su ubicación. Se mantiene la ubicación de ejemplo; puede reintentar.", "We couldn't get your location. The example location is still in use; you can try again.")}</p>
                ) : null}
                {notifications.permission === "granted" ? (
                  <div className="flex items-center justify-between gap-3 rounded-[10px] bg-primario-suave px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-primario-fuerte">
                      <BellRing className="size-4" aria-hidden />
                      {t("Avisos activados", "Notifications enabled")}
                    </span>
                    <button
                      type="button"
                      onClick={() => void notifications.test()}
                      className="text-[13px] font-semibold text-primario-fuerte underline underline-offset-4"
                    >
                      {t("Probar aviso", "Test notification")}
                    </button>
                  </div>
                ) : notifications.permission === "unsupported" ? (
                  <p className="text-[13px] text-tinta-suave">{t("Este navegador no permite avisos del sistema.", "This browser does not support system notifications.")}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void (notifications.permission === "denied" ? notifications.test() : notifications.enable())}
                    className={`boton w-full ${location.status === "ejemplo" ? "boton-cristal" : "boton-principal"}`}
                  >
                    <Bell className="size-4" aria-hidden />
                    {notifications.permission === "denied" ? t("Probar aviso", "Test notification") : t("Avisarme de alertas nuevas", "Notify me of new alerts")}
                  </button>
                )}
                {notifications.notice ? (
                  <p role="status" className="text-[13px] leading-snug text-tinta-suave">
                    {notifications.notice}
                  </p>
                ) : null}
              </div>
            </section>

            <Suspense fallback={<div className="tarjeta">{t("Cargando orientación…", "Loading guidance…")}</div>}>
              <SafetyAdvice alerts={active} exampleLocation={location.status !== "gps"} incomplete={incomplete || Boolean(eventsError)} />
            </Suspense>

            <div className="grid grid-cols-2 gap-4">
              <Stat value={events || demo ? active.length.toLocaleString(intlLocale(locale)) : eventsError ? "—" : null} label={t("Eventos recientes en su región", "Recent events in your region")} />
              <Stat
                value={events || demo ? active.filter((item) => item.category === "earthquakes").length.toLocaleString(intlLocale(locale)) : eventsError ? "—" : null}
                label={t("Sismos en las últimas 72 h", "Earthquakes in the last 72 h")}
              />
              <Stat value={events ? history.length.toLocaleString(intlLocale(locale)) : null} label={t("Eventos en el último año", "Events in the last year")} />
              <Stat value={LATEST_RADAR ? displayDate(LATEST_RADAR, locale, false) : "—"} label={t("Última imagen de radar", "Latest radar image")} />
            </div>

            <details className="tarjeta group p-5 sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-[15px] font-semibold text-tinta">{t("Fuentes en vivo", "Live sources")}</span>
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-tinta-suave">
                  <span
                    className={`size-2 rounded-full ${!events ? "bg-linea-fuerte" : online === sources.length && staleCount === 0 ? "bg-exito" : "bg-aviso"}`}
                    aria-hidden
                  />
                  {events
                    ? t(`${online} de ${sources.length} en línea${staleCount ? ` · ${staleCount} desactualizada${staleCount > 1 ? "s" : ""}` : ""}`, `${online} of ${sources.length} online${staleCount ? ` · ${staleCount} outdated` : ""}`)
                    : eventsError ? t("No disponibles", "Unavailable") : t("Consultando…", "Checking…")}
                </span>
              </summary>
              <ul className="mt-4 space-y-2 border-t border-linea pt-4">
                {sources.map((source) => (
                  <li key={source.id} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="inline-flex items-center gap-2 text-tinta">
                      <span
                        className={`size-2 rounded-full ${!source.ok ? "bg-peligro" : source.stale ? "bg-aviso" : "bg-exito"}`}
                        aria-hidden
                      />
                      {sourceLabel(source.label, locale)}
                    </span>
                    <span className={`text-right ${!source.ok || source.stale ? "font-semibold text-tinta" : "text-tinta-suave"}`}>
                      {!source.ok
                        ? t("sin respuesta", "no response")
                        : source.stale
                          ? t("desactualizada", "outdated")
                          : source.latest
                            ? `${t("último dato", "latest data")} ${displayTimeAgo(source.latest, locale)}`
                            : t("sin eventos", "no events")}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] leading-relaxed text-tinta-suave">
                {t("Se consultan cada minuto. «Último dato» es el evento más reciente que publicó cada fuente; «sin eventos» significa que respondió, pero no hay nada que reportar en su región.", "Sources are checked every minute. “Latest data” is the most recent event published by each source; “no events” means it responded but has nothing to report in your region.")}
              </p>
            </details>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-6">
          <section aria-labelledby="activas">
            <h2 id="activas" className="text-[24px] font-bold tracking-[-0.02em]">
              {t("Alertas recientes", "Recent alerts")}
            </h2>
            <p className="mt-1 text-[15px] text-tinta-suave">
              {t("Las más recientes primero. «En curso» marca lo que ocurre en este momento.", "Newest first. “Ongoing” marks what is happening right now.")}
            </p>
            <div className="mt-4">
              {events || demo ? (
                <EventList
                  items={activeItems}
                  limit={activeLimit}
                  onMore={() => setActiveLimit((value) => value + 6)}
                  empty={t(`No hay alertas recientes a menos de ${REGION_KM} km.`, `No recent alerts within ${REGION_KM} km.`)}
                />
              ) : eventsError ? (
                <p className="tarjeta text-[15px] text-tinta-suave">{t("No pudimos cargar las alertas. Puede probar una simulación sin conexión.", "We couldn't load alerts. You can try a simulation without a connection.")}</p>
              ) : (
                <div className="tarjeta h-64 animate-pulse" />
              )}
            </div>
          </section>

          <section aria-labelledby="historial">
            <h2 id="historial" className="text-[24px] font-bold tracking-[-0.02em]">
              {t("Historial", "History")}
            </h2>
            <p className="mt-1 text-[15px] text-tinta-suave">{t("El último año en su región.", "The last year in your region.")}</p>
            {categories.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("Filtrar por tipo", "Filter by type")}>
                {[["todos", { label: t("Todos", "All"), count: history.length }] as const, ...categories].map(([id, entry]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={filter === id}
                    onClick={() => {
                      setFilter(id);
                      setHistoryLimit(6);
                    }}
                    className={`boton boton-chico ${filter === id ? "boton-principal" : "boton-cristal"}`}
                  >
                    {entry.label}
                    <span className={filter === id ? "text-white" : "text-tinta-suave"}>{entry.count.toLocaleString(intlLocale(locale))}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-4">
              {events ? (
                <EventList
                  items={filtered}
                  limit={historyLimit}
                  onMore={() => setHistoryLimit((value) => value + 10)}
                  empty={t("Sin eventos registrados en su región.", "No events recorded in your region.")}
                />
              ) : eventsError ? (
                <p className="tarjeta text-[15px] text-tinta-suave">{t("No pudimos cargar el historial. Intente más tarde.", "We couldn't load the history. Please try again later.")}</p>
              ) : (
                <div className="tarjeta h-64 animate-pulse" />
              )}
            </div>
          </section>
        </div>

        <footer className="mt-16 border-t border-linea pt-6 text-[13px] leading-relaxed text-tinta-suave">
          <p>
            {t("No es una alerta oficial. En una emergencia llame al", "This is not an official alert. In an emergency call")}{" "}
            <a href="tel:911" className="font-semibold text-tinta underline underline-offset-2">
              911
            </a>{" "}
            {t("o siga a la", "or follow the")}{" "}
            <a
              href="https://www.cne.go.cr/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-tinta underline underline-offset-2"
            >
              CNE
            </a>
            .
          </p>
          <p className="mt-2">
            {t("Datos: NASA EONET, GDACS, USGS, OVSICORI, NASA GIBS y POWER, radar NASA-ISRO NISAR. NASA no respalda este proyecto.", "Data: NASA EONET, GDACS, USGS, OVSICORI, NASA GIBS and POWER, NASA-ISRO NISAR radar. NASA does not endorse this project.")}
          </p>
        </footer>
      </main>
    </div>
  );
}
