import { describe, expect, it } from 'vitest';
import { locales } from '#lib/paraglide/runtime.js';
import { fallbackNavigation, fallbackSiteData } from './fallback.ts';

describe('fallback content while Directus is down', () => {
	it('offers every language of the website with a readable name', () => {
		const site = fallbackSiteData();
		expect(site.locales.map((l) => l.code)).toEqual([...locales]);
		expect(site.locales.every((l) => l.name.length > 1 && l.name !== l.code)).toBe(true);
	});

	it('has an empty menu instead of failing', () => {
		expect(fallbackNavigation()).toEqual({ header: [], footer: [] });
	});
});
