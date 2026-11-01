import { describe, expect, it } from 'vitest';
import { secretMatches } from './secret.ts';

const SECRET = 'a-revalidate-secret-of-at-least-32-chars';

describe('secretMatches', () => {
	it('accepts the exact secret', async () => {
		expect(await secretMatches(SECRET, SECRET)).toBe(true);
	});

	it.each([
		['missing header', null],
		['empty header', ''],
		['wrong secret', 'x'.repeat(SECRET.length)],
		['prefix only', SECRET.slice(0, -1)],
		['longer value', `${SECRET}x`],
		['different case', SECRET.toUpperCase()]
	])('rejects a %s', async (_, received) => {
		expect(await secretMatches(received, SECRET)).toBe(false);
	});

	it('never matches when no secret is configured', async () => {
		expect(await secretMatches('', '')).toBe(false);
	});
});
