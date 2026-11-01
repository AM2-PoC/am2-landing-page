import { describe, expect, it } from 'vitest';
import { HOLD, holdIsOver, isScrollDownKey } from './reveal-on-scroll.ts';

describe('isScrollDownKey', () => {
	it('catches the keys that scroll the page down', () => {
		for (const key of ['ArrowDown', 'PageDown', 'End', ' ']) {
			expect(isScrollDownKey(key, { tagName: 'BODY' })).toBe(true);
		}
		expect(isScrollDownKey('ArrowUp', { tagName: 'BODY' })).toBe(false);
		expect(isScrollDownKey('Tab', { tagName: 'BODY' })).toBe(false);
	});

	it('leaves typing and pressing buttons alone', () => {
		expect(isScrollDownKey(' ', { tagName: 'INPUT' })).toBe(false);
		expect(isScrollDownKey('ArrowDown', { tagName: 'SELECT' })).toBe(false);
		expect(isScrollDownKey(' ', { tagName: 'BUTTON' })).toBe(false);
		expect(isScrollDownKey(' ', { tagName: 'DIV', isContentEditable: true })).toBe(false);
		expect(isScrollDownKey('PageDown', { tagName: 'BUTTON' })).toBe(true);
	});
});

describe('holdIsOver', () => {
	it('keeps the page in place until the animation has played', () => {
		expect(holdIsOver(500, 500)).toBe(false);
		expect(holdIsOver(HOLD.minMs, HOLD.quietMs)).toBe(true);
	});

	it('waits for trackpad momentum to stop, but never longer than the maximum', () => {
		expect(holdIsOver(1200, 50)).toBe(false);
		expect(holdIsOver(HOLD.maxMs, 0)).toBe(true);
	});
});
