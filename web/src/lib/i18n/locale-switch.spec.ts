import { describe, expect, it } from 'vitest';
import { nextLocale } from './locale-switch.ts';

describe('nextLocale', () => {
	it('switches between the two site languages', () => {
		expect(nextLocale(['en', 'id'], 'en')).toBe('id');
		expect(nextLocale(['en', 'id'], 'id')).toBe('en');
	});

	it('cycles through more languages in order', () => {
		expect(nextLocale(['en', 'id', 'ms'], 'id')).toBe('ms');
		expect(nextLocale(['en', 'id', 'ms'], 'ms')).toBe('en');
	});

	it('returns null when only the current language is active', () => {
		expect(nextLocale(['en'], 'en')).toBeNull();
		expect(nextLocale([], 'en')).toBeNull();
	});

	it('offers the first active language when the current one is not active', () => {
		expect(nextLocale(['en'], 'id')).toBe('en');
	});
});
