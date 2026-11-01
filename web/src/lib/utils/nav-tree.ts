import type { NavItem } from '#lib/types/navigation.ts';

export interface FlatNavRow {
	id: number;
	parentId: number | null;
	sortOrder: number;
	label: string;
	path: string | null;
}

export function buildNavTree(rows: FlatNavRow[]): NavItem[] {
	const byParent = new Map<number | null, FlatNavRow[]>();
	for (const row of rows) {
		const list = byParent.get(row.parentId) ?? [];
		list.push(row);
		byParent.set(row.parentId, list);
	}

	const build = (parentId: number | null): NavItem[] =>
		(byParent.get(parentId) ?? [])
			.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
			.map((row) => ({ id: row.id, label: row.label, path: row.path, children: build(row.id) }))
			.filter((item) => item.path !== null || item.children.length > 0);

	return build(null);
}
