import { describe, expect, it } from 'vitest';
import { DECOR_LAYOUTS, decorLayout } from './decor-layouts.ts';

describe('decorLayout', () => {
	it('rotates through the compositions by section position', () => {
		expect(decorLayout(0)).toBe(DECOR_LAYOUTS[0]);
		expect(decorLayout(1)).toBe(DECOR_LAYOUTS[1]);
		expect(decorLayout(DECOR_LAYOUTS.length)).toBe(DECOR_LAYOUTS[0]);
	});

	it('never fails on unexpected indexes', () => {
		expect(decorLayout(-1)).toBe(DECOR_LAYOUTS[DECOR_LAYOUTS.length - 1]);
		expect(decorLayout(2.7)).toBe(DECOR_LAYOUTS[2]);
	});

	it('gives neighbouring sections different compositions', () => {
		for (let i = 0; i < DECOR_LAYOUTS.length; i++) {
			expect(decorLayout(i + 1)).not.toBe(decorLayout(i));
		}
	});

	it('keeps the large shapes on the top-left / bottom-right diagonal', () => {
		for (const layout of DECOR_LAYOUTS) {
			const large = layout.slots.filter((slot) => slot.shape !== 'cross');
			for (const slot of large) {
				expect(`${slot.anchor}-${slot.side}`).toMatch(/^(top-left|bottom-right)$/);
			}
		}
	});
});
