import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ICON_ALIASES, iconFileName } from './icon-name.ts';

const files = new Set(
	readdirSync(new URL('../assets/icons/', import.meta.url)).map((f) => f.replace(/\.svg$/, ''))
);

describe('iconFileName', () => {
	it('maps the content name "server" to server-rack.svg', () => {
		expect(iconFileName('server')).toBe('server-rack');
	});

	it('keeps names that are already file names', () => {
		expect(iconFileName('camera')).toBe('camera');
	});

	it('only points to icon files that exist', () => {
		for (const target of Object.values(ICON_ALIASES)) expect(files.has(target)).toBe(true);
	});

	it('every icon_key in the seed data has a file', () => {
		// icon keys used by 02_seed.sql (snapshot in tests/e2e/fixtures/content.json)
		for (const key of [
			'radio-handheld',
			'target',
			'network',
			'camera',
			'cloud',
			'server',
			'radio-secure',
			'eye-location',
			'admin-console'
		]) {
			expect(files.has(iconFileName(key)), key).toBe(true);
		}
	});
});
