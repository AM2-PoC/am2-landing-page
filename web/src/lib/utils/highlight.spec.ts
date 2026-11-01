import { describe, expect, it } from 'vitest';
import { splitHighlight } from './highlight.ts';

describe('splitHighlight', () => {
	it('splits the accent part in the middle of a heading', () => {
		expect(
			splitHighlight('For organizations that operate beyond the desk', 'beyond the desk')
		).toEqual([
			{ text: 'For organizations that operate ', accent: false },
			{ text: 'beyond the desk', accent: true }
		]);
	});

	it('returns the whole text when there is no highlight', () => {
		expect(splitHighlight('About AM²', null)).toEqual([{ text: 'About AM²', accent: false }]);
	});

	it('ignores a highlight that is not part of the heading', () => {
		expect(splitHighlight('About AM²', 'Pricing')).toEqual([{ text: 'About AM²', accent: false }]);
	});
});
