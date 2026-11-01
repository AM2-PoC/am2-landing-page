import { describe, expect, it } from 'vitest';
import { groupBy, idOf, publishedPath } from './helpers.ts';

describe('groupBy', () => {
	it('groups rows by key and keeps their order', () => {
		const map = groupBy(
			[
				{ k: 1, v: 'a' },
				{ k: 2, v: 'b' },
				{ k: 1, v: 'c' }
			],
			(r) => r.k
		);
		expect(map.get(1)?.map((r) => r.v)).toEqual(['a', 'c']);
		expect(map.get(2)?.map((r) => r.v)).toEqual(['b']);
	});
});

describe('idOf', () => {
	it('reads the id from a number or an expanded object', () => {
		expect(idOf(5)).toBe(5);
		expect(idOf({ id: 7 })).toBe(7);
		expect(idOf(null)).toBeNull();
	});
});

describe('publishedPath', () => {
	it('returns the path only for published pages', () => {
		expect(publishedPath({ path: '/about-us', is_published: true })).toBe('/about-us');
		expect(publishedPath({ path: '/draft', is_published: false })).toBeNull();
		expect(publishedPath(3)).toBeNull();
	});
});
