import { describe, expect, it } from 'vitest';
import {
	HERO_SILHOUETTES,
	SILHOUETTE_SPECS,
	silhouetteArt,
	silhouettePlacement,
	type BodyCamSpec,
	type RadioSpec
} from './hero-silhouettes.ts';

const find = <T>(name: string) => SILHOUETTE_SPECS.find((spec) => spec.name === name) as T;

describe('silhouetteArt', () => {
	it('stacks the lens and the mount in the middle of the housing, as in Figma', () => {
		const art = silhouetteArt(find<BodyCamSpec>('BodyCam-TL-Large'));
		const [, , housing, lens, core, glint, mount] = art.shapes;
		// Figma: housing at 24 px, lens 55 px below its top, mount right under the lens
		expect(housing).toMatchObject({ kind: 'rect', x: 24, y: 24, width: 272, height: 272 });
		expect(lens).toMatchObject({ kind: 'circle', cx: 160, cy: 79 + 65, r: 65 });
		expect(core).toMatchObject({ cx: 160, cy: 144, r: 22 });
		expect(glint).toMatchObject({ cx: 147, cy: 131, r: 9 });
		expect(mount).toMatchObject({ kind: 'rect', x: 134, y: 79 + 130, width: 52, height: 32 });
	});

	it('puts the radio screen above the orange push-to-talk button', () => {
		const art = silhouetteArt(find<RadioSpec>('PTT-UL'));
		const screen = art.shapes[3];
		const button = art.shapes.at(-1);
		// Figma: screen 39 px below the top of the inner body (14 px padding)
		expect(screen).toMatchObject({ kind: 'rect', x: 35, y: 14 + 39, width: 100, height: 60 });
		expect(button).toMatchObject({ x: 53, y: 14 + 39 + 60, paint: 'accent', radius: 17 });
	});

	it('draws the rim as a 1 px outline inside the box', () => {
		const rim = silhouetteArt(find<RadioSpec>('PTT-BR-Large')).shapes[1];
		expect(rim).toMatchObject({ x: 0.5, y: 0.5, width: 299, height: 299, outline: true });
	});

	it('gives the huge camera its orange status light', () => {
		const shapes = silhouetteArt(find<BodyCamSpec>('BodyCam-TR-Huge')).shapes;
		expect(shapes.filter((shape) => shape.paint !== 'ink')).toHaveLength(2);
	});
});

describe('silhouettePlacement', () => {
	it('measures from the nearer side and edge of the 1549 × 927 frame', () => {
		expect(silhouettePlacement(find('BodyCam-TL-Large'))).toEqual({
			side: 'left',
			anchor: 'top',
			x: 135.85,
			y: 202.4
		});
		const bottomRight = silhouettePlacement(find('PTT-BR-Large'));
		expect(bottomRight.side).toBe('right');
		expect(bottomRight.anchor).toBe('bottom');
		expect(bottomRight.x).toBeCloseTo(188.9);
		expect(bottomRight.y).toBeCloseTo(87.83);
	});
});

describe('HERO_SILHOUETTES', () => {
	it('contains every layer of the Figma group', () => {
		expect(HERO_SILHOUETTES).toHaveLength(14);
		expect(HERO_SILHOUETTES.every((item) => item.x >= 0 && item.y >= 0)).toBe(true);
	});
});
