/**
 * Identidad del teléfono para los vínculos con seres queridos. No hay cuentas: el teléfono genera
 * un id y una clave secreta y los guarda; el servidor solo conoce el hash de la clave.
 * `linked` indica que ya invitó o aceptó a alguien: solo entonces se comparte su zona.
 */
export type DeviceCredentials = { id: string; key: string };
export type StoredDevice = DeviceCredentials & { linked: boolean };

export const DEVICE_STORAGE_KEY = "gamma:dispositivo";
export const NAME_STORAGE_KEY = "gamma:mi-nombre";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function readDevice(store: Pick<Storage, "getItem"> | null = storage()): StoredDevice | null {
  try {
    const raw = store?.getItem(DEVICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDevice>;
    if (typeof parsed.id !== "string" || typeof parsed.key !== "string") return null;
    return { id: parsed.id, key: parsed.key, linked: parsed.linked === true };
  } catch {
    return null;
  }
}

function write(device: StoredDevice, store: Pick<Storage, "setItem"> | null = storage()): void {
  try {
    store?.setItem(DEVICE_STORAGE_KEY, JSON.stringify(device));
  } catch {
    // Sin almacenamiento, el vínculo dura solo esta visita.
  }
}

/** Devuelve el dispositivo guardado o crea uno nuevo. */
export function ensureDevice(store: Storage | null = storage()): StoredDevice {
  const existing = readDevice(store);
  if (existing) return existing;
  const device: StoredDevice = {
    id: crypto.randomUUID(),
    key: base64url(crypto.getRandomValues(new Uint8Array(32))),
    linked: false,
  };
  write(device, store);
  return device;
}

export function markLinked(store: Storage | null = storage()): StoredDevice {
  const device = { ...ensureDevice(store), linked: true };
  write(device, store);
  return device;
}

/** Credenciales para el servidor, solo si el teléfono ya tiene vínculos. */
export function linkedCredentials(): DeviceCredentials | null {
  const device = readDevice();
  return device?.linked ? { id: device.id, key: device.key } : null;
}

export function readName(): string {
  try {
    return storage()?.getItem(NAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveName(name: string): void {
  try {
    storage()?.setItem(NAME_STORAGE_KEY, name);
  } catch {
    // No es importante: solo evita volver a escribir el nombre.
  }
}
