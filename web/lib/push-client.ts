/** Suscripción push del navegador. Solo corre en el cliente. */
export type PushResult = "ok" | "unsupported" | "denied" | "not-configured" | "error";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && Boolean(PUBLIC_KEY);
}

/** ¿La app corre instalada como PWA (ventana propia) y no en una pestaña del navegador? */
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function keyBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

async function send(subscription: PushSubscription, point: { lat: number; lon: number }, lang: "es" | "en"): Promise<PushResult> {
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), lat: point.lat, lon: point.lon, lang }),
  });
  if (response.status === 503) return "not-configured";
  return response.ok ? "ok" : "error";
}

/** Crea (o reutiliza) la suscripción y la registra con la ubicación aproximada. Pide permiso si falta. */
export async function subscribePush(point: { lat: number; lon: number }, lang: "es" | "en"): Promise<PushResult> {
  if (!pushSupported()) return "unsupported";
  try {
    if (Notification.permission === "default") await Notification.requestPermission();
    if (Notification.permission !== "granted") return "denied";
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUBLIC_KEY as string) }));
    return await send(subscription, point, lang);
  } catch {
    return "error";
  }
}

/** Si ya hay suscripción, la mantiene al día con la ubicación actual. No pide permisos. */
export async function refreshPush(point: { lat: number; lon: number }, lang: "es" | "en"): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;
    return (await send(subscription, point, lang)) === "ok";
  } catch {
    return false;
  }
}
