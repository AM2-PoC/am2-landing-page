import { describe, expect, it } from 'vitest';
import { cleanSvg } from './svg.ts';

const drawing = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';

describe('cleanSvg', () => {
	it('removes C2PA content credentials and their namespace', () => {
		const svg =
			'<svg width="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" xmlns:c2pa="http://c2pa.org/manifest">' +
			'<metadata><c2pa:manifest>AAAWgmp1bWIAAAAe</c2pa:manifest></metadata>' +
			drawing +
			'</svg>';

		expect(cleanSvg(svg)).toBe(
			`<svg width="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">${drawing}</svg>`
		);
	});

	it('removes the XML prolog and comments', () => {
		const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generator: Figma -->\n<svg viewBox="0 0 24 24">${drawing}</svg>\n`;
		expect(cleanSvg(svg)).toBe(`<svg viewBox="0 0 24 24">${drawing}</svg>`);
	});

	it('keeps namespaces that are still used', () => {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#a"/></svg>`;
		expect(cleanSvg(svg)).toBe(svg);
	});

	it('leaves a clean SVG unchanged', () => {
		const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${drawing}</svg>`;
		expect(cleanSvg(svg)).toBe(svg);
	});
});
