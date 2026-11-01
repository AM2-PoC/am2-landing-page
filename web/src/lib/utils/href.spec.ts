import { describe, expect, it } from 'vitest';
import { withoutTrailingSlash } from './href.ts';

describe('withoutTrailingSlash', () => {
	it('removes the slash after a locale prefix', () => {
		expect(withoutTrailingSlash('/id/')).toBe('/id');
		expect(withoutTrailingSlash('/id/?ref=nav')).toBe('/id?ref=nav');
		expect(withoutTrailingSlash('/id/about-us/#team')).toBe('/id/about-us#team');
	});

	it('leaves the root and normal paths alone', () => {
		expect(withoutTrailingSlash('/')).toBe('/');
		expect(withoutTrailingSlash('/?ref=nav')).toBe('/?ref=nav');
		expect(withoutTrailingSlash('/platforms/am2-ptt')).toBe('/platforms/am2-ptt');
	});
});
