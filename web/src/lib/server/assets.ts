import { ASSETS_BASE_URL } from '$app/env/private';
import type { ImageAsset } from '#lib/types/content.ts';

const WIDTHS = [480, 768, 1024, 1440, 1920];

export interface FileRow {
	id: string;
	width: number | null;
	height: number | null;
}

export function toImageAsset(file: FileRow | null | undefined, alt: string): ImageAsset | null {
	if (!file || !file.width || !file.height) return null;

	const base = `${ASSETS_BASE_URL}/assets/${file.id}`;
	const url = (width: number) => `${base}?width=${width}&format=auto&quality=80`;
	const widths = [...WIDTHS.filter((w) => w < file.width!), file.width];

	return {
		src: url(Math.min(1280, file.width)),
		srcset: widths.map((w) => `${url(w)} ${w}w`).join(', '),
		alt,
		width: file.width,
		height: file.height
	};
}
