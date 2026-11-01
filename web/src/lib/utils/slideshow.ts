/** Index of the slide whose start is closest to the current scroll position */
export function nearestSlide(offsets: readonly number[], scrollLeft: number): number {
	let best = 0;
	offsets.forEach((offset, index) => {
		if (Math.abs(offset - scrollLeft) < Math.abs(offsets[best] - scrollLeft)) best = index;
	});
	return best;
}

/** Keeps a slide index inside 0 … count-1 (no wrap-around: the arrows stop at both ends) */
export function clampSlide(index: number, count: number): number {
	if (count <= 0) return 0;
	return Math.min(Math.max(index, 0), count - 1);
}

/** Splits a list into groups of `size` items, e.g. features shown four per page */
export function chunk<T>(items: readonly T[], size: number): T[][] {
	if (size < 1) return [items.slice()];
	const groups: T[][] = [];
	for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
	return groups;
}

/**
 * Paged card row with the arrow beside the cards (Home "Security, Spelled Out"): how many
 * arrow lanes the cards of a page are pushed to the right. The first page leaves the lane on
 * the right free for the "next" arrow, the last page the lane on the left for "previous";
 * a page in between (seven cards or more) sits in the middle, half a lane from each side.
 */
export function laneShift(page: number, pageCount: number): number {
	if (pageCount <= 1 || page <= 0) return 0;
	return page >= pageCount - 1 ? 1 : 0.5;
}
