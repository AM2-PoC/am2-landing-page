import { describe, expect, it } from 'vitest';
import { chunk, clampSlide, laneShift, nearestSlide } from './slideshow.ts';

describe('nearestSlide', () => {
	const offsets = [0, 1160, 2320, 3480];

	it('finds the slide that is in view', () => {
		expect(nearestSlide(offsets, 0)).toBe(0);
		expect(nearestSlide(offsets, 2320)).toBe(2);
		expect(nearestSlide(offsets, 3480)).toBe(3);
	});

	it('rounds to the closest slide while a swipe is in progress', () => {
		expect(nearestSlide(offsets, 500)).toBe(0);
		expect(nearestSlide(offsets, 700)).toBe(1);
	});

	it('returns 0 when there are no slides', () => {
		expect(nearestSlide([], 300)).toBe(0);
	});
});

describe('clampSlide', () => {
	it('stops at the first and the last slide', () => {
		expect(clampSlide(-1, 4)).toBe(0);
		expect(clampSlide(4, 4)).toBe(3);
		expect(clampSlide(2, 4)).toBe(2);
	});

	it('returns 0 when there are no slides', () => {
		expect(clampSlide(1, 0)).toBe(0);
	});
});

describe('chunk', () => {
	it('splits features into pages of four', () => {
		expect(chunk([1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([
			[1, 2, 3, 4],
			[5, 6, 7, 8]
		]);
		expect(chunk([1, 2, 3, 4, 5, 6, 7], 4)).toEqual([
			[1, 2, 3, 4],
			[5, 6, 7]
		]);
	});

	it('keeps a short list on one page and an empty list empty', () => {
		expect(chunk([1, 2, 3], 4)).toEqual([[1, 2, 3]]);
		expect(chunk([], 4)).toEqual([]);
	});
});

describe('laneShift', () => {
	it('keeps the arrow lane on the right for the first page and on the left for the last', () => {
		expect(laneShift(0, 2)).toBe(0);
		expect(laneShift(1, 2)).toBe(1);
	});

	it('centres a page in between and leaves a single page alone', () => {
		expect(laneShift(1, 3)).toBe(0.5);
		expect(laneShift(2, 3)).toBe(1);
		expect(laneShift(0, 1)).toBe(0);
	});
});
