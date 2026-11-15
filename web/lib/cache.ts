import { AsyncLocalStorage } from "node:async_hooks";

type Entry<T> = {
  expires: number;
  value?: T;
  promise?: Promise<T>;
};

const MAX_ENTRIES = 200;
const store = new Map<string, Entry<unknown>>();

type CacheContext = { hits: number };
const context = new AsyncLocalStorage<CacheContext>();

/**
 * Ejecuta una consulta y devuelve si al menos una fuente vino de la caché en memoria.
 * No informa sobre la caché del CDN, que el proceso no puede ver.
 */
export async function withCacheTracking<T>(fn: () => Promise<T>): Promise<{ value: T; cached: boolean }> {
  const state: CacheContext = { hits: 0 };
  const value = await context.run(state, fn);
  return { value, cached: state.hits > 0 };
}

function noteHit(): void {
  const state = context.getStore();
  if (state) state.hits += 1;
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

  if (hit && hit.expires > now) {
    if (hit.value !== undefined) {
      noteHit();
      return hit.value;
    }
    if (hit.promise) {
      noteHit();
      return hit.promise;
    }
  }

  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }

  const promise = fn()
    .then((value) => {
      store.set(key, { expires: Date.now() + ttlMs, value });
      return value;
    })
    .catch((error) => {
      store.delete(key);
      throw error;
    });

  store.set(key, { expires: now + ttlMs, promise });
  return promise;
}
