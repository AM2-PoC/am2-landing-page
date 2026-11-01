/**
 * Device silhouettes of the Home hero intro: body cameras and PTT radios drawn as faint
 * shapes around the heading, from the Figma frame "Home (Dark Mode - EN)" 231:4279,
 * layer "Hero Decorative Silhouettes" (1549 × 927 px). All numbers are Figma pixels.
 *
 * Every silhouette keeps its Figma distance to the nearest side and to the top or bottom
 * of the hero (scaled by --hero-u in styles/hero-intro.css). On a desktop screen that is
 * the exact mockup; on tall phone screens the shapes stay in the bands above and below
 * the heading instead of sliding behind it.
 */

export const SILHOUETTE_FRAME = { width: 1549, height: 927 } as const;

/** ink: the page's text colour at a very low opacity (theme aware); accent: AM² orange */
export type SilhouettePaint = 'ink' | 'accent' | 'white';

export type SilhouetteShape =
	| {
			kind: 'rect';
			x: number;
			y: number;
			width: number;
			height: number;
			radius: number;
			paint: SilhouettePaint;
			alpha: number;
			/** Drawn as a 1 px outline instead of a filled area */
			outline?: boolean;
	  }
	| {
			kind: 'circle';
			cx: number;
			cy: number;
			r: number;
			paint: SilhouettePaint;
			alpha: number;
			outline?: boolean;
	  }
	| {
			kind: 'line';
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			paint: SilhouettePaint;
			alpha: number;
	  };

interface Box {
	width: number;
	height: number;
	radius: number;
	fill: number;
}

/** Rounded outer case with a 1 px rim, and the inner housing inside its padding */
interface DeviceSpec {
	name: string;
	/** Centre in the Figma frame */
	cx: number;
	cy: number;
	width: number;
	height: number;
	/** Degrees, clockwise (CSS direction) */
	rotate: number;
	radius: number;
	padding: number;
	fill: number;
	rim: number;
	inner: { radius: number; fill: number };
}

export interface BodyCamSpec extends DeviceSpec {
	type: 'bodycam';
	lens: {
		size: number;
		fill: number;
		core: { r: number; fill: number };
		/** Small highlight, offset from the lens centre */
		glint?: { r: number; dx: number; dy: number; fill: number };
		/** Orange status light with a white dot, offset from the lens centre */
		led?: { r: number; dx: number; dy: number; dot: number };
	};
	mount?: Box;
}

export interface RadioSpec extends DeviceSpec {
	type: 'radio';
	screen: Box & { glow: Box };
	button: { width: number; height: number };
}

export interface RingSpec {
	type: 'ring';
	name: string;
	cx: number;
	cy: number;
	size: number;
	stroke: number;
}

export interface LineSpec {
	type: 'line';
	name: string;
	cx: number;
	cy: number;
	length: number;
	rotate: number;
	stroke: number;
}

export type SilhouetteSpec = BodyCamSpec | RadioSpec | RingSpec | LineSpec;

/** Opacities are the Figma fills, e.g. rgba(255, 255, 255, 0.03) → 0.03 */
export const SILHOUETTE_SPECS: readonly SilhouetteSpec[] = [
	{
		type: 'bodycam',
		name: 'BodyCam-TL-Large',
		cx: 135.85,
		cy: 202.4,
		width: 320,
		height: 320,
		rotate: -6,
		radius: 48,
		padding: 24,
		fill: 0.03,
		rim: 0.06,
		inner: { radius: 28, fill: 0.03 },
		lens: {
			size: 130,
			fill: 0.039,
			core: { r: 22, fill: 0.063 },
			glint: { r: 9, dx: -13, dy: -13, fill: 0.094 }
		},
		mount: { width: 52, height: 32, radius: 8, fill: 0.03 }
	},
	{
		type: 'radio',
		name: 'PTT-UL',
		cx: 267.82,
		cy: 285.69,
		width: 170,
		height: 200,
		rotate: 4,
		radius: 28,
		padding: 14,
		fill: 0.04,
		rim: 0.07,
		inner: { radius: 16, fill: 0.02 },
		screen: {
			width: 100,
			height: 60,
			radius: 10,
			fill: 0.04,
			glow: { width: 68, height: 28, radius: 6, fill: 0.06 }
		},
		button: { width: 64, height: 34 }
	},
	{
		type: 'bodycam',
		name: 'BodyCam-L-Small',
		cx: 121.57,
		cy: 546.24,
		width: 140,
		height: 140,
		rotate: -3,
		radius: 24,
		padding: 10,
		fill: 0.02,
		rim: 0.05,
		inner: { radius: 14, fill: 0.03 },
		lens: { size: 72, fill: 0.035, core: { r: 11, fill: 0.055 } }
	},
	{
		type: 'radio',
		name: 'PTT-BL-Large',
		cx: 89.25,
		cy: 856.73,
		width: 260,
		height: 280,
		rotate: 8,
		radius: 36,
		padding: 18,
		fill: 0.03,
		rim: 0.06,
		inner: { radius: 18, fill: 0.02 },
		screen: {
			width: 110,
			height: 72,
			radius: 12,
			fill: 0.04,
			glow: { width: 74, height: 34, radius: 7, fill: 0.07 }
		},
		button: { width: 72, height: 38 }
	},
	{
		type: 'bodycam',
		name: 'BodyCam-BL-Tiny',
		cx: 324.17,
		cy: 835.45,
		width: 100,
		height: 100,
		rotate: -5,
		radius: 18,
		padding: 8,
		fill: 0.02,
		rim: 0.04,
		inner: { radius: 10, fill: 0.02 },
		lens: { size: 52, fill: 0.031, core: { r: 7, fill: 0.051 } }
	},
	{
		type: 'bodycam',
		name: 'BodyCam-TR-Huge',
		cx: 1326.57,
		cy: 206.45,
		width: 460,
		height: 460,
		rotate: 10,
		radius: 64,
		padding: 28,
		fill: 0.02,
		rim: 0.05,
		inner: { radius: 36, fill: 0.03 },
		lens: {
			size: 200,
			fill: 0.035,
			core: { r: 34, fill: 0.063 },
			led: { r: 14, dx: 68, dy: -68, dot: 5 }
		},
		mount: { width: 72, height: 44, radius: 10, fill: 0.03 }
	},
	{
		type: 'radio',
		name: 'PTT-R-Mid',
		cx: 1438.84,
		cy: 366.31,
		width: 210,
		height: 240,
		rotate: -7,
		radius: 32,
		padding: 16,
		fill: 0.03,
		rim: 0.07,
		inner: { radius: 18, fill: 0.02 },
		screen: {
			width: 110,
			height: 70,
			radius: 12,
			fill: 0.04,
			glow: { width: 72, height: 32, radius: 6, fill: 0.07 }
		},
		button: { width: 68, height: 36 }
	},
	{
		type: 'bodycam',
		name: 'BodyCam-R-Small',
		cx: 1532.73,
		cy: 606.67,
		width: 160,
		height: 160,
		rotate: 5,
		radius: 26,
		padding: 12,
		fill: 0.02,
		rim: 0.04,
		inner: { radius: 16, fill: 0.03 },
		lens: { size: 88, fill: 0.035, core: { r: 13, fill: 0.055 } }
	},
	{
		type: 'radio',
		name: 'PTT-BR-Large',
		cx: 1360.1,
		cy: 839.17,
		width: 300,
		height: 300,
		rotate: -4,
		radius: 40,
		padding: 20,
		fill: 0.03,
		rim: 0.06,
		inner: { radius: 20, fill: 0.02 },
		screen: {
			width: 130,
			height: 86,
			radius: 14,
			fill: 0.04,
			glow: { width: 88, height: 40, radius: 8, fill: 0.07 }
		},
		button: { width: 82, height: 44 }
	},
	{
		type: 'radio',
		name: 'PTT-BC-Tiny',
		cx: 973.4,
		cy: 905.94,
		width: 120,
		height: 120,
		rotate: 6,
		radius: 20,
		padding: 8,
		fill: 0.02,
		rim: 0.05,
		inner: { radius: 12, fill: 0.02 },
		screen: {
			width: 60,
			height: 36,
			radius: 8,
			fill: 0.04,
			glow: { width: 36, height: 16, radius: 4, fill: 0.06 }
		},
		button: { width: 40, height: 20 }
	},
	{ type: 'ring', name: 'Arc Accent TL', cx: 470, cy: 130, size: 180, stroke: 0.031 },
	{ type: 'ring', name: 'Arc Accent BR', cx: 1110, cy: 740, size: 120, stroke: 0.027 },
	{
		type: 'line',
		name: 'Accent Line 1',
		cx: 512.9,
		cy: 215.92,
		length: 200,
		rotate: 34,
		stroke: 0.039
	},
	{
		type: 'line',
		name: 'Accent Line 2',
		cx: 375.78,
		cy: 696.06,
		length: 140,
		rotate: -20,
		stroke: 0.031
	}
];

/** Drawing of one silhouette in its own (unrotated) box */
export interface SilhouetteArt {
	width: number;
	height: number;
	shapes: SilhouetteShape[];
}

/** Case, rim and inner housing shared by body cameras and radios */
function deviceShell(spec: DeviceSpec): SilhouetteShape[] {
	const { width, height, radius, padding } = spec;
	return [
		{ kind: 'rect', x: 0, y: 0, width, height, radius, paint: 'ink', alpha: spec.fill },
		{
			kind: 'rect',
			x: 0.5,
			y: 0.5,
			width: width - 1,
			height: height - 1,
			radius: radius - 0.5,
			paint: 'ink',
			alpha: spec.rim,
			outline: true
		},
		{
			kind: 'rect',
			x: padding,
			y: padding,
			width: width - 2 * padding,
			height: height - 2 * padding,
			radius: spec.inner.radius,
			paint: 'ink',
			alpha: spec.inner.fill
		}
	];
}

/**
 * Parts stacked in the middle of the housing without a gap (Figma auto layout:
 * vertical, centred): returns the top edge of each part.
 */
function stackTops(spec: DeviceSpec, heights: number[]): number[] {
	const total = heights.reduce((sum, h) => sum + h, 0);
	let top = spec.padding + (spec.height - 2 * spec.padding - total) / 2;
	return heights.map((h) => {
		const current = top;
		top += h;
		return current;
	});
}

function bodyCamArt(spec: BodyCamSpec): SilhouetteShape[] {
	const { lens, mount } = spec;
	const [lensTop, mountTop] = stackTops(spec, [lens.size, mount?.height ?? 0]);
	const cx = spec.width / 2;
	const cy = lensTop + lens.size / 2;
	const shapes: SilhouetteShape[] = [
		...deviceShell(spec),
		{ kind: 'circle', cx, cy, r: lens.size / 2, paint: 'ink', alpha: lens.fill },
		{ kind: 'circle', cx, cy, r: lens.core.r, paint: 'ink', alpha: lens.core.fill }
	];
	if (lens.glint) {
		const { r, dx, dy, fill } = lens.glint;
		shapes.push({ kind: 'circle', cx: cx + dx, cy: cy + dy, r, paint: 'ink', alpha: fill });
	}
	if (lens.led) {
		const { r, dx, dy, dot } = lens.led;
		shapes.push(
			{ kind: 'circle', cx: cx + dx, cy: cy + dy, r, paint: 'accent', alpha: 1 },
			{ kind: 'circle', cx: cx + dx, cy: cy + dy, r: dot, paint: 'white', alpha: 1 }
		);
	}
	if (mount) {
		shapes.push({
			kind: 'rect',
			x: (spec.width - mount.width) / 2,
			y: mountTop,
			width: mount.width,
			height: mount.height,
			radius: mount.radius,
			paint: 'ink',
			alpha: mount.fill
		});
	}
	return shapes;
}

function radioArt(spec: RadioSpec): SilhouetteShape[] {
	const { screen, button } = spec;
	const { glow } = screen;
	const [screenTop, buttonTop] = stackTops(spec, [screen.height, button.height]);
	const center = (w: number) => (spec.width - w) / 2;
	return [
		...deviceShell(spec),
		{
			kind: 'rect',
			x: center(screen.width),
			y: screenTop,
			width: screen.width,
			height: screen.height,
			radius: screen.radius,
			paint: 'ink',
			alpha: screen.fill
		},
		{
			kind: 'rect',
			x: center(glow.width),
			y: screenTop + (screen.height - glow.height) / 2,
			width: glow.width,
			height: glow.height,
			radius: glow.radius,
			paint: 'ink',
			alpha: glow.fill
		},
		{
			kind: 'rect',
			x: center(button.width),
			y: buttonTop,
			width: button.width,
			height: button.height,
			radius: button.height / 2,
			paint: 'accent',
			alpha: 1
		}
	];
}

export function silhouetteArt(spec: SilhouetteSpec): SilhouetteArt {
	switch (spec.type) {
		case 'bodycam':
			return { width: spec.width, height: spec.height, shapes: bodyCamArt(spec) };
		case 'radio':
			return { width: spec.width, height: spec.height, shapes: radioArt(spec) };
		case 'ring':
			return {
				width: spec.size,
				height: spec.size,
				shapes: [
					{
						kind: 'circle',
						cx: spec.size / 2,
						cy: spec.size / 2,
						r: spec.size / 2 - 0.5,
						paint: 'ink',
						alpha: spec.stroke,
						outline: true
					}
				]
			};
		case 'line':
			return {
				width: spec.length,
				height: 2,
				shapes: [
					{ kind: 'line', x1: 0, y1: 1, x2: spec.length, y2: 1, paint: 'ink', alpha: spec.stroke }
				]
			};
	}
}

/**
 * Where a silhouette sits: its centre measured from the nearer side (left/right) and from
 * the nearer edge (top/bottom) of the Figma frame.
 */
export interface SilhouettePlacement {
	side: 'left' | 'right';
	anchor: 'top' | 'bottom';
	/** Distance from that side to the centre */
	x: number;
	/** Distance from that edge to the centre */
	y: number;
}

export function silhouettePlacement(spec: SilhouetteSpec): SilhouettePlacement {
	const { width, height } = SILHOUETTE_FRAME;
	const side = spec.cx < width / 2 ? 'left' : 'right';
	const anchor = spec.cy < height / 2 ? 'top' : 'bottom';
	return {
		side,
		anchor,
		x: side === 'left' ? spec.cx : width - spec.cx,
		y: anchor === 'top' ? spec.cy : height - spec.cy
	};
}

export interface HeroSilhouette extends SilhouetteArt, SilhouettePlacement {
	name: string;
	rotate: number;
}

/** Ready-to-draw list, in Figma layer order (back to front) */
export const HERO_SILHOUETTES: readonly HeroSilhouette[] = SILHOUETTE_SPECS.map((spec) => ({
	name: spec.name,
	rotate: spec.type === 'ring' ? 0 : spec.rotate,
	...silhouetteArt(spec),
	...silhouettePlacement(spec)
}));
