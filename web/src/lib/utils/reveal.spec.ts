import { describe, expect, it } from 'vitest';
import { planReveal, revealRole, REVEAL_TIMING } from './reveal.ts';

/** Minimal stand-in for an element: tag name, data attributes, other attributes */
function fakeElement(tag: string, data: Record<string, string> = {}, attributes: string[] = []) {
	return {
		dataset: data as DOMStringMap,
		hasAttribute: (name: string) => attributes.includes(name),
		matches: (selector: string) => selector.split(',').some((s) => s.trim() === tag)
	};
}

describe('revealRole', () => {
	it('detects images and decoration, everything else is text', () => {
		expect(revealRole(fakeElement('img'))).toBe('media');
		expect(revealRole(fakeElement('div', {}, ['data-decor']))).toBe('decor');
		expect(revealRole(fakeElement('h2'))).toBe('text');
		expect(revealRole(fakeElement('li'))).toBe('text');
	});

	it('follows an explicit data-reveal-role', () => {
		expect(revealRole(fakeElement('div', { revealRole: 'media' }))).toBe('media');
		expect(revealRole(fakeElement('img', { revealRole: 'text' }))).toBe('text');
	});
});

describe('planReveal', () => {
	it('reveals text first, then media, then decoration, each one step later', () => {
		const plan = planReveal([
			{ item: 'photo', role: 'media' },
			{ item: 'heading', role: 'text' },
			{ item: 'shape', role: 'decor' },
			{ item: 'body', role: 'text' }
		]);
		expect(plan.map((p) => p.item)).toEqual(['heading', 'body', 'photo', 'shape']);
		expect(plan.map((p) => p.delayMs)).toEqual([0, 70, 140, 210]);
	});

	it('keeps page order inside a role and caps the delay', () => {
		const cards = Array.from({ length: 9 }, (_, i) => ({ item: i, role: 'text' as const }));
		const plan = planReveal(cards);
		expect(plan.map((p) => p.item)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		const longest = REVEAL_TIMING.maxSteps * REVEAL_TIMING.staggerMs;
		expect(Math.max(...plan.map((p) => p.delayMs))).toBe(longest);
	});

	it('does not delay an element that comes into view alone', () => {
		expect(planReveal([{ item: 'card', role: 'text' }])[0].delayMs).toBe(0);
	});
});
