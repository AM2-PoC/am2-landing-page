import { describe, expect, it } from 'vitest';
import { parseTheme, themeCookie } from './theme.ts';

describe('parseTheme', () => {
	it('reads the saved choice and falls back to dark', () => {
		expect(parseTheme('light')).toBe('light');
		expect(parseTheme('dark')).toBe('dark');
		expect(parseTheme(undefined)).toBe('dark');
		expect(parseTheme('blue')).toBe('dark');
	});
});

describe('themeCookie', () => {
	it('remembers the choice for a year on the whole site', () => {
		expect(themeCookie('light')).toBe('am2-theme=light; Path=/; Max-Age=31536000; SameSite=Lax');
	});
});
