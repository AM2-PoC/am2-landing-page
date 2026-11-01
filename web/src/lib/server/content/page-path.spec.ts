import { describe, expect, it } from 'vitest';
import { isPagePath, toPagePath } from './page-path.ts';

describe('toPagePath', () => {
	it('adds the leading slash and removes trailing ones', () => {
		expect(toPagePath(undefined)).toBe('/');
		expect(toPagePath('')).toBe('/');
		expect(toPagePath('platforms/am2-ptt')).toBe('/platforms/am2-ptt');
		expect(toPagePath('about-us//')).toBe('/about-us');
	});
});

describe('isPagePath', () => {
	it.each(['/', '/about-us', '/platforms/am2-ptt', '/features/am2-command-center-webadmin'])(
		'accepts the page path %s',
		(path) => expect(isPagePath(path)).toBe(true)
	);

	it.each([
		'',
		'about-us',
		'/About-Us',
		'/about_us',
		'/about-us/',
		'/-about',
		'/about--us',
		'//evil.example',
		'/../etc/passwd',
		'/%2e%2e/etc/passwd',
		'/a b',
		'/<script>',
		'/é',
		'/a.php'
	])('rejects %j without asking the CMS', (path) => expect(isPagePath(path)).toBe(false));

	it('rejects paths longer than the database column (255 characters)', () => {
		expect(isPagePath(`/${'a'.repeat(254)}`)).toBe(true);
		expect(isPagePath(`/${'a'.repeat(255)}`)).toBe(false);
	});
});
