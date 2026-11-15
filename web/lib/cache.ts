import { AsyncLocalStorage } from "node:async_hooks";

type Entry<T> = {
  expires: number;
  value?: T;
  promise?: Promise<T>;
  stale?: boolean;
};

const MAX_ENTRIES = 200;
const store = new Map<string, Entry<unknown>>();

type CacheContext = { hits: number; stale: number };
const context = new AsyncLocalStorage<CacheContext>();

/**
 * Ejecuta una consulta y devuelve si alguna fuente vino de la caché en memoria y si alguna
 * se sirvió vencida porque su refresco falló. No informa sobre la caché del CDN.
 */
export async function withCacheTracking<T>(
  fn: () => Promise<T>,
): Promise<{ value: T; cached: boolean; stale: boolean }> {
  const state: CacheContext = { hits: 0, stale: 0 };
  const value = await context.run(state, fn);
  return { value, cached: state.hits > 0, stale: state.stale > 0 };
}

function noteHit(): void {
  const state = context.getStore();
  if (state) state.hits += 1;
}

function noteStale(): void {
  const state = context.getStore();
  if (state) state.stale += 1;
}

/** Presupuesto de una fuente: el agregador conserva las otras aunque esta se cuelgue. */
export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Fuente sin respuesta dentro del presupuesto")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;

  if (hit?.promise) {
    noteHit();
    const value = await hit.promise;
    if (hit.stale) noteStale();
    return value;
  }
  if (hit && hit.expires > now) {
    if (hit.value !== undefined) {
      noteHit();
      if (hit.stale) noteStale();
      return hit.value;
    }
  }

  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }

  // Si el refresco falla y había un valor anterior, se sirve ese dato vencido en lugar de
  // dejar la fuente vacía. Es la regla de falla suave: 200 con el último dato y aviso.
  const previous = hit?.value;
  const entry: Entry<T> = { expires: now + ttlMs, value: previous };

  const promise = fn()
    .then((value) => {
      store.set(key, { expires: Date.now() + ttlMs, value });
      return value;
    })
    .catch((error) => {
      if (previous !== undefined) {
        entry.stale = true;
        // Gracia corta para no golpear una fuente caída en cada request.
        store.set(key, { expires: Date.now() + Math.min(ttlMs, 60_000), value: previous, stale: true });
        return previous;
      }
      store.delete(key);
      throw error;
    });

  entry.promise = promise;
  store.set(key, entry);
  const value = await promise;
  if (entry.stale) noteStale();
  return value;
}
