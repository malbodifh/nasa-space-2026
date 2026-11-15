"use client";

import { Crosshair, LocateFixed, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import useSWR from "swr";

import AlertInbox from "@/components/AlertInbox";
import AlertToast from "@/components/AlertToast";
import BrandMark from "@/components/BrandMark";
import { ClimateCard, MemoryCard, RiskCard, SourcesCard } from "@/components/cards";
import CorrelationCard from "@/components/CorrelationCard";
import HazardCard from "@/components/HazardCard";
import { correlate } from "@/lib/correlate";
import ImageCompare from "@/components/ImageCompare";
import LocationPicker from "@/components/LocationPicker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEMO_LOCATION,
  DEMO_POINT,
  DEMO_RADIUS_KM,
  LOCATIONS,
  MEMORY_DATES,
  shortDate,
} from "@/lib/demo";
import type {
  AlertsResponse,
  AppAlert,
  AssessResponse,
  Correlation,
  LayerId,
  LayerState,
  OverlaysResponse,
} from "@/lib/types";

const SEEN_KEY = "mdf:alerts:seen:v1";

function subscribeToPermission() {
  return () => {};
}

function getPermissionSnapshot(): NotificationPermission | "unsupported" {
  return "Notification" in window ? Notification.permission : "unsupported";
}

function readSeen(): Set<string> | null {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return null;
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistSeen(seen: Set<string>) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen).slice(-200)));
  } catch {
    // Sin almacenamiento: las notificaciones igual funcionan en esta sesión.
  }
}

const MapCanvas = dynamic(() => import("@/components/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-paper font-mono text-[11px] text-ash">
      Cargando mapa…
    </div>
  ),
});

type Point = { lat: number; lon: number; label: string };

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export default function AppShell() {
  const [point, setPoint] = useState<Point>(DEMO_POINT);
  const [locationId, setLocationId] = useState(DEMO_LOCATION.id);
  const [radiusKm, setRadiusKm] = useState(DEMO_RADIUS_KM);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerState>({
    roads: true,
    protected: true,
    volcanoes: true,
    borders: true,
    alerts: true,
    quakes: true,
  });
  const [requestedPermission, setRequestedPermission] = useState<
    NotificationPermission | "unsupported" | null
  >(null);
  const [toast, setToast] = useState<AppAlert | null>(null);
  const [testing, setTesting] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testAlerts, setTestAlerts] = useState<AppAlert[]>([]);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [hiddenHazards, setHiddenHazards] = useState<string[]>([]);
  const seenRef = useRef<Set<string> | null>(null);
  const firstLoadRef = useRef(true);

  const url = useMemo(() => {
    const params = new URLSearchParams({
      lat: point.lat.toFixed(4),
      lon: point.lon.toFixed(4),
      radius: String(radiusKm),
    });
    if (selectedDate) params.set("date", selectedDate);
    return `/api/assess?${params.toString()}`;
  }, [point.lat, point.lon, radiusKm, selectedDate]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<AssessResponse>(url, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    refreshInterval: 5 * 60 * 1000,
  });

  const overlaysUrl = useMemo(() => {
    const params = new URLSearchParams({
      lat: point.lat.toFixed(2),
      lon: point.lon.toFixed(2),
      radius: String(radiusKm),
    });
    return `/api/overlays?${params.toString()}`;
  }, [point.lat, point.lon, radiusKm]);

  const {
    data: overlaysData,
    error: overlaysError,
    isLoading: overlaysLoading,
  } = useSWR<OverlaysResponse>(overlaysUrl, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    refreshInterval: 30 * 60 * 1000,
  });

  const alertsUrl = useMemo(() => {
    const params = new URLSearchParams({
      lat: point.lat.toFixed(4),
      lon: point.lon.toFixed(4),
      radius: String(radiusKm),
    });
    return `/api/alerts?${params.toString()}`;
  }, [point.lat, point.lon, radiusKm]);

  const {
    data: alertsData,
    error: alertsFetchError,
    isLoading: alertsLoading,
  } = useSWR<AlertsResponse>(alertsUrl, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
    refreshInterval: 60_000,
  });

  const browserPermission = useSyncExternalStore<NotificationPermission | "unsupported">(
    subscribeToPermission,
    getPermissionSnapshot,
    () => "default",
  );
  const permission = requestedPermission ?? browserPermission;

  useEffect(() => {
    seenRef.current = readSeen();
  }, []);

  const notify = useCallback(
    (alert: AppAlert) => {
      setToast(alert);
      if (permission !== "granted") return;
      try {
        new Notification(alert.title, {
          body: alert.body,
          tag: alert.id,
          icon: "/icon.svg",
          lang: "es",
        });
      } catch {
        // Algunos navegadores exigen un service worker; el aviso en pantalla alcanza.
      }
    },
    [permission],
  );

  useEffect(() => {
    if (!alertsData) return;
    const list = alertsData.data.alerts;
    const seen = seenRef.current ?? new Set<string>();

    if (firstLoadRef.current) {
      for (const alert of list) seen.add(alert.id);
      firstLoadRef.current = false;
      seenRef.current = seen;
      persistSeen(seen);
      return;
    }

    const fresh = list.filter((alert) => !seen.has(alert.id));
    for (const alert of list) seen.add(alert.id);
    seenRef.current = seen;
    persistSeen(seen);

    if (fresh.length > 0) notify(fresh[0]);
  }, [alertsData, notify]);

  const payload = data?.data;
  const overlays = overlaysData?.data ?? null;
  const memoryMode = selectedDate !== null;
  const points = memoryMode ? (payload?.memory.points ?? []) : (payload?.current.points ?? []);

  const correlations: Correlation[] = useMemo(() => {
    if (!payload) return [];
    const active = overlays ?? {
      roads: { type: "FeatureCollection" as const, features: [] },
      protectedAreas: { type: "FeatureCollection" as const, features: [] },
      volcanoes: { type: "FeatureCollection" as const, features: [] },
      borders: { type: "FeatureCollection" as const, features: [] },
      alerts: [],
      seismic: [],
      sources: [],
    };
    return correlate({
      point,
      fires: memoryMode ? payload.memory.points : payload.current.points,
      roads: active.roads,
      protectedAreas: active.protectedAreas,
      volcanoes: active.volcanoes,
      alerts: active.alerts,
      radiusKm,
      memoryMode,
    });
  }, [payload, overlays, point, radiusKm, memoryMode]);

  const enableNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      setRequestedPermission("unsupported");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setRequestedPermission(result);
    } catch {
      setRequestedPermission("denied");
    }
  }, []);

  const sendTest = useCallback(async () => {
    setTesting(true);
    setAlertsError(null);
    try {
      const params = new URLSearchParams({
        lat: point.lat.toFixed(4),
        lon: point.lon.toFixed(4),
        radius: String(radiusKm),
        test: "1",
      });
      const response = await fetch(`/api/alerts?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("El servicio de alertas no respondió");
      const body = (await response.json()) as AlertsResponse;
      const testAlert = body.data.alerts.find((alert) => alert.kind === "test");
      if (!testAlert) throw new Error("La prueba no devolvió una alerta");
      setTestAlerts((current) => [testAlert, ...current].slice(0, 3));
      notify(testAlert);
    } catch (error) {
      setAlertsError(error instanceof Error ? error.message : "No se pudo enviar la prueba");
    } finally {
      setTesting(false);
    }
  }, [point.lat, point.lon, radiusKm, notify]);

  useEffect(() => {
    if (!testMode) return;
    const timer = window.setInterval(() => {
      void sendTest();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [testMode, sendTest]);

  const onToggleLayer = useCallback((id: LayerId) => {
    setLayers((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const onToggleHazard = useCallback((category: string) => {
    setHiddenHazards((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }, []);

  const onPick = useCallback((lat: number, lon: number) => {
    setPoint({ lat, lon, label: "Punto elegido" });
    setLocationId("custom");
    setSelectedDate(null);
    setGeoError(null);
  }, []);

  const onSelectLocation = useCallback((id: string) => {
    const location = LOCATIONS.find((item) => item.id === id);
    if (!location) return;
    setLocationId(location.id);
    setPoint({ lat: location.lat, lon: location.lon, label: `${location.label}, Costa Rica` });
    setRadiusKm(location.radiusKm);
    setSelectedDate(null);
    setGeoError(null);
  }, []);

  function locate() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no permite geolocalización.");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPoint({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: "Mi ubicación",
        });
        setLocationId("custom");
        setSelectedDate(null);
      },
      () => setGeoError("No pudimos obtener tu ubicación. Elegí un punto en el mapa."),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }

  function resetPoint() {
    onSelectLocation(DEMO_LOCATION.id);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 py-3 lg:px-6">
          <BrandMark className="size-9 shrink-0" />
          <div className="min-w-0">
            <p className="eyebrow truncate">Astral Codes · NASA Space Apps 2026</p>
            <h1 className="font-display text-[26px] leading-none tracking-tight">Memoria de Fuego</h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {isValidating && data ? (
              <span className="hidden items-center gap-1.5 font-mono text-[10px] text-ash sm:inline-flex">
                <RefreshCw className="size-3 animate-spin" />
                actualizando
              </span>
            ) : null}
            <span className="hidden font-mono text-[10px] text-ash md:block">Costa Rica</span>
            <span className="stamp">No es alerta oficial</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="order-2 flex flex-col bg-sheet/50 px-4 py-4 lg:order-1 lg:h-[calc(100dvh-74px)] lg:overflow-y-auto lg:border-r lg:border-rule lg:px-5">
          <section>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <LocationPicker value={locationId} onSelect={onSelectLocation} />
                <p className="mt-2 font-display text-[22px] leading-tight">{point.label}</p>
                <p className="mt-1 font-mono text-[10px] text-ash">
                  {point.lat.toFixed(3)}, {point.lon.toFixed(3)} · radio {radiusKm} km
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => mutate()}
                aria-label="Actualizar datos"
                title="Actualizar datos"
                className="rounded-none text-ash hover:bg-rule/40 hover:text-ink"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={locate}
                className="rounded-none border-rule bg-transparent text-[11px] hover:bg-rule/40"
              >
                <LocateFixed className="size-3.5" />
                Mi ubicación
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetPoint}
                className="rounded-none text-[11px] text-ash hover:bg-rule/40 hover:text-ink"
              >
                <Crosshair className="size-3.5" />
                Reiniciar
              </Button>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-ash">
              Si hay peligro inminente, llamá al{" "}
              <a href="tel:911" className="text-ink underline underline-offset-2">
                911
              </a>{" "}
              o seguí a la{" "}
              <a
                href="https://www.cne.go.cr/"
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-2"
              >
                CNE
              </a>
              . Esta app no reemplaza una alerta oficial.
            </p>

            {geoError ? (
              <p className="mt-2 border-l-2 border-burnt pl-2 font-mono text-[10px] text-burnt">
                {geoError}
              </p>
            ) : null}
          </section>

          <div className="mt-5">
            <AlertInbox
              alerts={[...testAlerts, ...(alertsData?.data.alerts ?? [])]}
              loading={alertsLoading}
              failed={Boolean(alertsFetchError) || Boolean(alertsError)}
              permission={permission}
              testing={testing}
              testMode={testMode}
              onEnable={enableNotifications}
              onTest={sendTest}
              onToggleTestMode={() => setTestMode((current) => !current)}
            />
            {alertsError && !alertsFetchError ? (
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-burnt">
                {alertsError}
              </p>
            ) : null}
          </div>

          <Tabs
            value={selectedDate ?? "today"}
            onValueChange={(value) => setSelectedDate(value === "today" ? null : value)}
            className="mt-5 gap-0"
          >
            <TabsList
              variant="line"
              className="h-auto w-full justify-start gap-5 rounded-none border-b border-rule bg-transparent p-0"
              aria-label="Capa del mapa"
            >
              <TabsTrigger
                value="today"
                className="rounded-none px-0 pb-2 pt-0 font-mono text-[10px] uppercase tracking-[0.14em] data-active:text-burnt"
              >
                Ahora
              </TabsTrigger>
              {MEMORY_DATES.map((item) => (
                <TabsTrigger
                  key={item.date}
                  value={item.date}
                  className="rounded-none px-0 pb-2 pt-0 font-mono text-[10px] uppercase tracking-[0.14em] data-active:text-burnt"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mt-3 flex items-center gap-4">
            <span className="eyebrow">Radio</span>
            {[10, 25, 50].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRadiusKm(value)}
                aria-pressed={radiusKm === value}
                className={`font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                  radiusKm === value
                    ? "text-ink underline decoration-burnt decoration-2 underline-offset-4"
                    : "text-ash hover:text-ink"
                }`}
              >
                {value} km
              </button>
            ))}
          </div>

          {memoryMode ? (
            <p className="mt-4 border-l-2 border-burnt bg-burnt/5 px-3 py-2 font-mono text-[10px] leading-relaxed text-burnt">
              Estás viendo la memoria del {shortDate(selectedDate)}. El riesgo de abajo siempre se
              calcula con datos de hoy.
            </p>
          ) : null}

          {isLoading && !payload ? (
            <div className="mt-5 space-y-3">
              <div className="h-40 animate-pulse bg-rule/30" />
              <div className="h-28 animate-pulse bg-rule/30" />
              <div className="h-32 animate-pulse bg-rule/30" />
            </div>
          ) : error && !payload ? (
            <section className="mt-5 border-l-2 border-burnt pl-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-burnt">
                No pudimos cargar los datos
              </p>
              <p className="mt-1 text-[12px] text-ash">{error.message}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                className="mt-3 rounded-none border-rule bg-transparent text-[11px]"
              >
                <RefreshCw className="size-3.5" />
                Reintentar
              </Button>
            </section>
          ) : payload ? (
            <div className="mt-5">
              <HazardCard
                alerts={overlays?.alerts ?? []}
                radiusKm={radiusKm}
                hidden={hiddenHazards}
                onToggle={onToggleHazard}
              />
              <div className="mt-5">
                <RiskCard risk={payload.risk} meta={data?.meta} />
              </div>
              <MemoryCard memory={payload.memory} selectedDate={selectedDate} onSelect={setSelectedDate} />
              <CorrelationCard
                correlations={correlations}
                sources={overlays?.sources ?? []}
                loading={overlaysLoading}
              />
              <ClimateCard climate={payload.climate} />
              {selectedDate ? <ImageCompare point={point} date={payload.memory.date} /> : null}
              <SourcesCard risk={payload.risk} />
            </div>
          ) : null}

          <footer className="mt-6 border-t border-rule pt-3 pb-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ash">
              Prototipo · NASA Space Apps Challenge 2026
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-ash">
              No reemplaza a la CNE, SINAC ni a los servicios de emergencia. Datos: NASA GIBS,
              NASA POWER, NASA Worldview, NASA EONET. Mapa: © OpenStreetMap, © CARTO. NASA no
              respalda este proyecto.
            </p>
          </footer>
        </aside>

        <section className="order-1 h-[48vh] min-h-[320px] border-b border-rule lg:order-2 lg:h-[calc(100dvh-74px)] lg:border-b-0">
          <MapCanvas
            lat={point.lat}
            lon={point.lon}
            radiusKm={radiusKm}
            points={points}
            memoryMode={memoryMode}
            onPick={onPick}
            overlays={overlays}
            layers={layers}
            onToggleLayer={onToggleLayer}
            overlaysLoading={overlaysLoading}
            overlaysFailed={Boolean(overlaysError)}
            hiddenHazards={hiddenHazards}
          />
        </section>
      </main>

      {toast ? <AlertToast alert={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
