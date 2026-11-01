export function groupBy<T, K>(rows: readonly T[], keyOf: (row: T) => K): Map<K, T[]> {
	const map = new Map<K, T[]>();
	for (const row of rows) {
		const key = keyOf(row);
		const list = map.get(key);
		if (list) list.push(row);
		else map.set(key, [row]);
	}
	return map;
}

export function asObject<T extends object>(
	value: T | string | number | null | undefined
): T | null {
	return value !== null && typeof value === 'object' ? value : null;
}

export function idOf(value: number | { id: number } | null | undefined): number | null {
	if (value === null || value === undefined) return null;
	return typeof value === 'object' ? value.id : value;
}

export function publishedPath(
	value: { path: string; is_published: boolean } | number | null | undefined
): string | null {
	const page = asObject(value);
	return page && page.is_published ? page.path : null;
}

export function isString(value: unknown): value is string {
	return typeof value === 'string';
}
