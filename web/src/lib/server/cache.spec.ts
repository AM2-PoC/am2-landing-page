import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_ENTRIES, RETRY_AFTER_ERROR_MS, cacheSize, cached, clearCache } from './cache.ts';

const TTL = 60_000;

beforeEach(() => {
	clearCache();
	vi.useFakeTimers();
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('cached', () => {
	it('loads once and serves the stored value until it expires', async () => {
		const load = vi.fn().mockResolvedValueOnce('v1').mockResolvedValueOnce('v2');

		expect(await cached('k', TTL, load)).toBe('v1');
		expect(await cached('k', TTL, load)).toBe('v1');
		expect(load).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(TTL + 1);
		expect(await cached('k', TTL, load)).toBe('v2');
		expect(load).toHaveBeenCalledTimes(2);
	});

	it('shares one running request between visitors who ask at the same time', async () => {
		let resolve!: (value: string) => void;
		const load = vi.fn(() => new Promise<string>((r) => (resolve = r)));

		const first = cached('k', TTL, load);
		const second = cached('k', TTL, load);
		resolve('value');

		expect(await Promise.all([first, second])).toEqual(['value', 'value']);
		expect(load).toHaveBeenCalledTimes(1);
	});

	it('never stores a failure: the next request tries again', async () => {
		const load = vi.fn().mockRejectedValueOnce(new Error('CMS down')).mockResolvedValueOnce('ok');

		await expect(cached('k', TTL, load)).rejects.toThrow('CMS down');
		expect(await cached('k', TTL, load)).toBe('ok');
		expect(load).toHaveBeenCalledTimes(2);
	});

	it('serves the last good value when a reload fails, and retries later', async () => {
		const load = vi
			.fn()
			.mockResolvedValueOnce('good')
			.mockRejectedValueOnce(new Error('CMS down'))
			.mockResolvedValueOnce('fresh');

		await cached('k', TTL, load);
		vi.advanceTimersByTime(TTL + 1);

		expect(await cached('k', TTL, load)).toBe('good');
		expect(await cached('k', TTL, load)).toBe('good'); // no new request during the pause
		expect(load).toHaveBeenCalledTimes(2);

		vi.advanceTimersByTime(RETRY_AFTER_ERROR_MS + 1);
		expect(await cached('k', TTL, load)).toBe('fresh');
	});

	it('keeps at most MAX_ENTRIES keys and drops the least recently used one', async () => {
		for (let i = 0; i < MAX_ENTRIES; i++) await cached(`k${i}`, TTL, async () => i);
		await cached('k0', TTL, async () => -1); // k0 is used again, k1 is now the oldest
		await cached('new', TTL, async () => 'new');

		expect(cacheSize()).toBe(MAX_ENTRIES);
		const reloadK0 = vi.fn(async () => 'reloaded');
		const reloadK1 = vi.fn(async () => 'reloaded');
		expect(await cached('k0', TTL, reloadK0)).toBe(0);
		expect(await cached('k1', TTL, reloadK1)).toBe('reloaded');
		expect(reloadK0).not.toHaveBeenCalled();
	});

	it('drops expired entries before fresh ones when it is full', async () => {
		await cached('short', 10, async () => 'short');
		for (let i = 1; i < MAX_ENTRIES; i++) await cached(`k${i}`, TTL, async () => i);
		vi.advanceTimersByTime(11);
		await cached('new', TTL, async () => 'new');

		expect(cacheSize()).toBe(MAX_ENTRIES);
		const reloadK1 = vi.fn(async () => 'reloaded');
		expect(await cached('k1', TTL, reloadK1)).toBe(1);
		expect(reloadK1).not.toHaveBeenCalled();
	});
});

describe('clearCache', () => {
	it('empties the cache', async () => {
		await cached('k', TTL, async () => 'old');
		clearCache();
		expect(cacheSize()).toBe(0);
		expect(await cached('k', TTL, async () => 'new')).toBe('new');
	});

	it('does not let a request that started before the clear write old content back', async () => {
		let resolve!: (value: string) => void;
		const slow = cached('k', TTL, () => new Promise<string>((r) => (resolve = r)));

		clearCache();
		resolve('before the change');
		expect(await slow).toBe('before the change'); // that visitor still gets an answer

		expect(await cached('k', TTL, async () => 'after the change')).toBe('after the change');
	});
});
