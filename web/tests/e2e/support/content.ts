// Expected content, read from the same snapshot the mock Directus serves
// (tests/e2e/fixtures/content.json), so the tests never hard-code CMS texts.

import { readFileSync } from 'node:fs';

type Row = Record<string, unknown>;
type Snapshot = Record<string, Row[]>;

const snapshot: Snapshot = JSON.parse(
	readFileSync(new URL('../fixtures/content.json', import.meta.url), 'utf8')
);

export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];

export interface PageInfo {
	path: string;
	template: string;
	title: Record<Locale, string>;
}

/** URL of a page path in a language: English without prefix, Indonesian under /id */
export function localize(path: string, locale: Locale): string {
	if (locale === 'en') return path;
	return path === '/' ? '/id' : `/id${path}`;
}

/** All published pages, Home first, then by path */
export const PAGES: PageInfo[] = snapshot.pages
	.filter((page) => page.is_published === true)
	.map((page) => {
		const translations = snapshot.page_translations.filter((t) => t.page_id === page.id);
		const title = (locale: Locale) =>
			String(translations.find((t) => t.locale_code === locale)?.title ?? '');
		return {
			path: String(page.path),
			template: String(page.template),
			title: { en: title('en'), id: title('id') }
		};
	})
	.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : a.path.localeCompare(b.path)));

export function pageInfo(path: string): PageInfo {
	const page = PAGES.find((p) => p.path === path);
	if (!page) throw new Error(`page ${path} is not in the snapshot`);
	return page;
}

/** Labels of the top-level header menu entries, in menu order */
export function headerLabels(locale: Locale): string[] {
	return snapshot.navigation_items
		.filter((item) => item.menu_location === 'header' && item.parent_id === null)
		.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
		.map((item) =>
			String(
				snapshot.navigation_item_translations.find(
					(t) => t.navigation_item_id === item.id && t.locale_code === locale
				)?.label
			)
		);
}

/** Card titles of a content section (section_key), in sort order */
export function sectionItemTitles(sectionKey: string, locale: Locale): string[] {
	const section = snapshot.content_sections.find((s) => s.section_key === sectionKey);
	if (!section) throw new Error(`section ${sectionKey} is not in the snapshot`);
	return snapshot.section_items
		.filter((item) => item.content_section_id === section.id)
		.sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || Number(a.id) - Number(b.id))
		.map((item) =>
			String(
				snapshot.section_item_translations.find(
					(t) => t.section_item_id === item.id && t.locale_code === locale
				)?.title ?? ''
			)
		);
}

/** Heading of a content section (section_key) as a screen reader reads it (one line) */
export function sectionHeading(sectionKey: string, locale: Locale): string {
	const section = snapshot.content_sections.find((s) => s.section_key === sectionKey);
	const heading = snapshot.content_section_translations.find(
		(t) => t.content_section_id === section?.id && t.locale_code === locale
	)?.heading;
	if (!heading) throw new Error(`section ${sectionKey} has no ${locale} heading`);
	return String(heading).replace(/\s+/g, ' ').trim();
}

/** Cards that show an icon from the CMS (icon_key): page, card title (EN) and icon name */
export function itemsWithIcons(): { path: string; title: string; iconKey: string }[] {
	return snapshot.section_items
		.filter((item) => item.icon_key)
		.flatMap((item) => {
			const title = snapshot.section_item_translations.find(
				(t) => t.section_item_id === item.id && t.locale_code === 'en'
			)?.title;
			return snapshot.page_content_sections
				.filter((pcs) => pcs.content_section_id === item.content_section_id && pcs.is_visible)
				.map((pcs) => ({
					path: String(snapshot.pages.find((p) => p.id === pcs.page_id)?.path),
					title: String(title),
					iconKey: String(item.icon_key)
				}));
		});
}
