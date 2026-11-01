import type { NavItem } from '#lib/types/navigation.ts';

export function isActive(item: NavItem, currentPath: string): boolean {
	if (item.path === currentPath) return true;
	return item.children.some((child) => isActive(child, currentPath));
}

export function collectActiveGroupIds(items: NavItem[], currentPath: string): number[] {
	return items.flatMap((item) =>
		item.children.length > 0 && isActive(item, currentPath)
			? [item.id, ...collectActiveGroupIds(item.children, currentPath)]
			: []
	);
}
