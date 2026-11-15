type Entry<T> = {
  expires: number;
  value?: T;
  promise?: Promise<T>;
};

const MAX_ENTRIES = 200;
const store = new Map<string, Entry<unknown>>();

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
    if (hit.value !== undefined) return hit.value;
    if (hit.promise) return hit.promise;
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
