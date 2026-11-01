import { readItems } from '@directus/sdk';
import { directus } from '#lib/server/directus.ts';
import { cached } from '#lib/server/cache.ts';
import { DEFAULT_LOCALE, pickTranslation } from '#lib/i18n/translation.ts';
import { buildNavTree, type FlatNavRow } from '#lib/utils/nav-tree.ts';
import type { Navigation } from '#lib/types/navigation.ts';

export function getNavigation(locale: string): Promise<Navigation> {
	return cached(`navigation:${locale}`, 5 * 60_000, () => fetchNavigation(locale));
}

async function fetchNavigation(locale: string): Promise<Navigation> {
	const [items, translations] = await Promise.all([
		directus.request(
			readItems('navigation_items', {
				fields: [
					'id',
					'menu_location',
					'parent_id',
					'sort_order',
					{ page_id: ['path', 'is_published'] }
				],
				filter: { is_visible: { _eq: true } },
				limit: -1
			})
		),
		directus.request(
			readItems('navigation_item_translations', {
				fields: ['navigation_item_id', 'locale_code', 'label'],
				filter: { locale_code: { _in: [locale, DEFAULT_LOCALE] } },
				limit: -1
			})
		)
	]);

	const labels = new Map<number, { locale_code: string; label: string }[]>();
	for (const t of translations) {
		const list = labels.get(t.navigation_item_id) ?? [];
		list.push(t);
		labels.set(t.navigation_item_id, list);
	}

	const toRows = (location: 'header' | 'footer'): FlatNavRow[] =>
		items
			.filter((item) => item.menu_location === location)
			.flatMap((item) => {
				const page = item.page_id && typeof item.page_id === 'object' ? item.page_id : null;
				if (page && !page.is_published) return [];
				const label = pickTranslation(labels.get(item.id), locale)?.label;
				if (!label) return [];
				return [
					{
						id: item.id,
						parentId: item.parent_id,
						sortOrder: item.sort_order,
						label,
						path: page?.path ?? null
					}
				];
			});

	return { header: buildNavTree(toRows('header')), footer: buildNavTree(toRows('footer')) };
}
