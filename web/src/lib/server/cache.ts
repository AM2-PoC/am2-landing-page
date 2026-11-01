// In-memory cache for content read from Directus (one per server process).
//
// * Bounded: at most MAX_ENTRIES keys. When it is full, expired entries go first, then the
//   entry that was used least recently, so many different URLs can never grow memory without
//   limit.
// * One request per key: visitors who ask for the same key at the same time share one
//   Directus request instead of each sending their own.
// * Stale on error: when Directus fails after an entry expired, the last good value is served
//   again (for RETRY_AFTER_ERROR_MS) instead of an error page; with no earlier value the
//   error is passed on. Failures themselves are never stored.
// * clearCache() (webhook /api/revalidate) also discards requests that were still running,
//   so content fetched before the change can't be written back afterwards.

type Entry<T> = { value: T; expires: number };

export const MAX_ENTRIES = 500;
export const RETRY_AFTER_ERROR_MS = 30_000;

const store = new Map<string, Entry<unknown>>();
const pending = new Map<string, Promise<unknown>>();
let generation = 0;

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
	const hit = store.get(key) as Entry<T> | undefined;
	if (hit && hit.expires > Date.now()) {
		touch(key, hit);
		return Promise.resolve(hit.value);
	}

	const running = pending.get(key) as Promise<T> | undefined;
	if (running) return running;

	const started = generation;
	const request = load().then(
		(value) => {
			if (started === generation) save(key, { value, expires: Date.now() + ttlMs });
			return value;
		},
		(error: unknown) => {
			if (hit && started === generation) {
				console.error(`[cache] reload of "${key}" failed, serving the last good value`, error);
				save(key, { value: hit.value, expires: Date.now() + RETRY_AFTER_ERROR_MS });
				return hit.value;
			}
			throw error;
		}
	);
	const tracked = request.finally(() => {
		if (pending.get(key) === tracked) pending.delete(key);
	});
	pending.set(key, tracked);
	return tracked;
}

export function clearCache() {
	generation += 1;
	store.clear();
	pending.clear();
}

/** Number of stored entries (for tests) */
export function cacheSize() {
	return store.size;
}

/** Map keeps insertion order: moving a key to the end marks it as recently used */
function touch(key: string, entry: Entry<unknown>) {
	store.delete(key);
	store.set(key, entry);
}

function save(key: string, entry: Entry<unknown>) {
	store.delete(key);
	if (store.size >= MAX_ENTRIES) evict();
	store.set(key, entry);
}

function evict() {
	const now = Date.now();
	for (const [key, entry] of store) {
		if (entry.expires <= now) store.delete(key);
	}
	// Still full: drop the least recently used entry (the first one in the Map)
	while (store.size >= MAX_ENTRIES) {
		const oldest = store.keys().next().value;
		if (oldest === undefined) break;
		store.delete(oldest);
	}
}
