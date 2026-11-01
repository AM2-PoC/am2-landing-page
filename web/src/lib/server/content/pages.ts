import { readItems } from '@directus/sdk';
import { directus } from '#lib/server/directus.ts';
import { cached } from '#lib/server/cache.ts';
import { DEFAULT_LOCALE, pickTranslation } from '#lib/i18n/translation.ts';
import { toImageAsset } from '#lib/server/assets.ts';
import { getFileAlts } from '#lib/server/content/files.ts';
import { getProducts, getResponsibilities } from '#lib/server/content/domain.ts';
import { asObject, groupBy, idOf, isString, publishedPath } from '#lib/server/content/helpers.ts';
import type {
	PageData,
	PageTemplate,
	SectionData,
	SectionItemData,
	SectionType
} from '#lib/types/content.ts';

const CACHE_TTL = 5 * 60_000;

export function getPage(path: string, locale: string): Promise<PageData | null> {
	return cached(`page:${locale}:${path}`, CACHE_TTL, () => fetchPage(path, locale));
}

async function fetchPage(path: string, locale: string): Promise<PageData | null> {
	const locales = [locale, DEFAULT_LOCALE];

	const [page] = await directus.request(
		readItems('pages', {
			fields: ['id', 'path', 'template', 'platform_id', 'deployment_model_id'],
			filter: { path: { _eq: path }, is_published: { _eq: true } },
			limit: 1
		})
	);
	if (!page) return null;

	const [seoRows, placements] = await Promise.all([
		directus.request(
			readItems('page_translations', {
				fields: ['locale_code', 'title', 'meta_description'],
				filter: { page_id: { _eq: page.id }, locale_code: { _in: locales } },
				limit: -1
			})
		),
		directus.request(
			readItems('page_content_sections', {
				fields: [
					'id',
					{
						content_section_id: [
							'id',
							'section_key',
							'section_type',
							{ image_id: ['id', 'width', 'height'] },
							{ cta_page_id: ['path', 'is_published'] }
						]
					}
				],
				filter: { page_id: { _eq: page.id }, is_visible: { _eq: true } },
				sort: ['sort_order', 'id'],
				limit: -1
			})
		)
	]);

	const sections = placements.map((p) => asObject(p.content_section_id)).filter((s) => s !== null);
	const sectionIds = sections.map((s) => s.id);

	const [sectionTexts, items] = await Promise.all([
		sectionIds.length === 0
			? Promise.resolve([])
			: directus.request(
					readItems('content_section_translations', {
						fields: [
							'content_section_id',
							'locale_code',
							'eyebrow',
							'heading',
							'heading_highlight',
							'body',
							'cta_label'
						],
						filter: { content_section_id: { _in: sectionIds }, locale_code: { _in: locales } },
						limit: -1
					})
				),
		sectionIds.length === 0
			? Promise.resolve([])
			: directus.request(
					readItems('section_items', {
						fields: [
							'id',
							'content_section_id',
							'icon_key',
							{ image_id: ['id', 'width', 'height'] },
							{ link_page_id: ['path', 'is_published'] }
						],
						filter: { content_section_id: { _in: sectionIds }, is_visible: { _eq: true } },
						sort: ['sort_order', 'id'],
						limit: -1
					})
				)
	]);

	const itemIds = items.map((i) => i.id);
	const itemTexts =
		itemIds.length === 0
			? []
			: await directus.request(
					readItems('section_item_translations', {
						fields: ['section_item_id', 'locale_code', 'title', 'description', 'link_label'],
						filter: { section_item_id: { _in: itemIds }, locale_code: { _in: locales } },
						limit: -1
					})
				);

	const fileIds = [
		...sections.map((s) => asObject(s.image_id)?.id),
		...items.map((i) => asObject(i.image_id)?.id)
	].filter(isString);
	const alts = await getFileAlts(fileIds, locale);

	const textsBySection = groupBy(sectionTexts, (t) => idOf(t.content_section_id));
	const itemsBySection = groupBy(items, (i) => idOf(i.content_section_id));
	const textsByItem = groupBy(itemTexts, (t) => idOf(t.section_item_id));

	const sectionData: SectionData[] = sections.map((section) => {
		const text = pickTranslation(textsBySection.get(section.id), locale);
		const file = asObject(section.image_id);
		const ctaPath = publishedPath(section.cta_page_id);

		return {
			key: section.section_key,
			type: section.section_type as SectionType,
			eyebrow: text?.eyebrow ?? null,
			heading: text?.heading ?? null,
			highlight: text?.heading_highlight ?? null,
			body: text?.body ?? null,
			image: toImageAsset(file, file ? (alts.get(file.id) ?? '') : ''),
			cta: ctaPath && text?.cta_label ? { href: ctaPath, label: text.cta_label } : null,
			items: (itemsBySection.get(section.id) ?? []).map((item): SectionItemData => {
				const itemText = pickTranslation(textsByItem.get(item.id), locale);
				const itemFile = asObject(item.image_id);
				const linkPath = publishedPath(item.link_page_id);
				return {
					id: item.id,
					title: itemText?.title ?? null,
					description: itemText?.description ?? null,
					iconKey: item.icon_key,
					image: toImageAsset(itemFile, itemFile ? (alts.get(itemFile.id) ?? '') : ''),
					link:
						linkPath && itemText?.link_label ? { href: linkPath, label: itemText.link_label } : null
				};
			})
		};
	});

	const types = new Set(sectionData.map((s) => s.type));
	const [products, responsibilities] = await Promise.all([
		types.has('product_list') && page.platform_id
			? getProducts(page.platform_id, locale)
			: Promise.resolve([]),
		types.has('responsibility_matrix') && page.deployment_model_id
			? getResponsibilities(page.deployment_model_id, locale)
			: Promise.resolve([])
	]);

	const seo = pickTranslation(seoRows, locale);

	return {
		id: page.id,
		path: page.path,
		template: page.template as PageTemplate,
		platformId: page.platform_id ?? null,
		deploymentModelId: page.deployment_model_id ?? null,
		seo: { title: seo?.title ?? 'AM²', description: seo?.meta_description ?? '' },
		sections: sectionData,
		products,
		responsibilities
	};
}
