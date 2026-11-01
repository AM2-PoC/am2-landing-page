import { getContext, setContext } from 'svelte';

/** Outline shapes taken from the AM² WebAdmin login screen */
export type DecorShape = 'rings' | 'chevrons' | 'diamonds' | 'cross';
export type DecorSide = 'left' | 'right';
/** top / bottom: corner of the section; middle: free side lane only (wide screens) */
export type DecorAnchor = 'top' | 'middle' | 'bottom';
export type DecorSize = 'sm' | 'md' | 'lg';

/** A shape in the side lanes / padding bands of a section (SectionDecor) */
export interface DecorSlot {
	shape: DecorShape;
	side: DecorSide;
	anchor: DecorAnchor;
	size: DecorSize;
	/** Vertical position of a middle slot as a share of the section height (0–1) */
	y?: number;
}

/** A shape in the free flank beside a centred section heading (IntroDecor) */
export interface DecorIntroAccent {
	shape: Exclude<DecorShape, 'cross'>;
	side: DecorSide;
}

export interface DecorLayout {
	slots: readonly DecorSlot[];
	intro: DecorIntroAccent;
}

/**
 * Compositions that rotate down the page. The large shapes always sit top-left and
 * bottom-right, so the end of one section and the start of the next never crowd the same
 * edge; small accents balance the opposite sides, and the heading accent switches sides.
 * Exact sizes are resolved in CSS (styles/decor.css) from the free space around the
 * content, so a shape stays hidden when there is no room for it.
 */
export const DECOR_LAYOUTS: readonly DecorLayout[] = [
	{
		slots: [
			{ shape: 'rings', side: 'left', anchor: 'top', size: 'lg' },
			{ shape: 'chevrons', side: 'right', anchor: 'bottom', size: 'md' },
			{ shape: 'cross', side: 'right', anchor: 'middle', size: 'md', y: 0.32 },
			{ shape: 'cross', side: 'left', anchor: 'bottom', size: 'sm' }
		],
		intro: { shape: 'diamonds', side: 'right' }
	},
	{
		slots: [
			{ shape: 'diamonds', side: 'left', anchor: 'top', size: 'md' },
			{ shape: 'rings', side: 'right', anchor: 'bottom', size: 'lg' },
			{ shape: 'cross', side: 'left', anchor: 'middle', size: 'sm', y: 0.62 }
		],
		intro: { shape: 'rings', side: 'left' }
	},
	{
		slots: [
			{ shape: 'chevrons', side: 'left', anchor: 'top', size: 'lg' },
			{ shape: 'diamonds', side: 'right', anchor: 'bottom', size: 'sm' },
			{ shape: 'cross', side: 'right', anchor: 'middle', size: 'lg', y: 0.4 }
		],
		intro: { shape: 'chevrons', side: 'right' }
	},
	{
		slots: [
			{ shape: 'rings', side: 'left', anchor: 'top', size: 'md' },
			{ shape: 'chevrons', side: 'right', anchor: 'bottom', size: 'lg' },
			{ shape: 'cross', side: 'left', anchor: 'bottom', size: 'md' }
		],
		intro: { shape: 'diamonds', side: 'left' }
	},
	{
		slots: [
			{ shape: 'diamonds', side: 'left', anchor: 'top', size: 'lg' },
			{ shape: 'rings', side: 'right', anchor: 'bottom', size: 'md' },
			{ shape: 'cross', side: 'right', anchor: 'middle', size: 'sm', y: 0.28 }
		],
		intro: { shape: 'rings', side: 'right' }
	},
	{
		slots: [
			{ shape: 'chevrons', side: 'left', anchor: 'top', size: 'md' },
			{ shape: 'rings', side: 'right', anchor: 'bottom', size: 'sm' },
			{ shape: 'cross', side: 'left', anchor: 'middle', size: 'md', y: 0.7 }
		],
		intro: { shape: 'chevrons', side: 'left' }
	}
];

/** Composition for the section at this position on the page (0 = first section) */
export function decorLayout(index: number): DecorLayout {
	const count = DECOR_LAYOUTS.length;
	return DECOR_LAYOUTS[((Math.trunc(index) % count) + count) % count];
}

const KEY = Symbol('section-decor');

/** Called by SectionRenderer: every section below it uses this composition */
export function setSectionDecor(layout: () => DecorLayout) {
	setContext(KEY, layout);
}

/** Composition for the current section; sections outside a page (styleguide) use the first one */
export function getSectionDecor(): () => DecorLayout {
	return getContext<(() => DecorLayout) | undefined>(KEY) ?? (() => DECOR_LAYOUTS[0]);
}
