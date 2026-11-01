import { describe, it, expect } from 'vitest';
import { pickTranslation } from './translation.ts';

const rows = [
	{ locale_code: 'en', title: 'Hello' },
	{ locale_code: 'id', title: 'Halo' }
];

describe('pickTranslation', () => {
	it('returns the requested locale', () => {
		expect(pickTranslation(rows, 'id')?.title).toBe('Halo');
	});

	it('falls back to EN when the requested translation is missing', () => {
		expect(pickTranslation([rows[0]], 'id')?.title).toBe('Hello');
	});

	it('returns undefined for an empty list', () => {
		expect(pickTranslation([], 'en')).toBeUndefined();
	});
});
