import { readItems } from '@directus/sdk';
import { directus } from '#lib/server/directus.ts';
import { DEFAULT_LOCALE, pickTranslation } from '#lib/i18n/translation.ts';
import { toImageAsset } from '#lib/server/assets.ts';
import { getFileAlts } from '#lib/server/content/files.ts';
import { asObject, groupBy, idOf, isString } from '#lib/server/content/helpers.ts';
import type { ProductData, ResponsibilityRowData } from '#lib/types/content.ts';

export async function getProducts(platformId: number, locale: string): Promise<ProductData[]> {
	const [products, platformPages] = await Promise.all([
		directus.request(
			readItems('products', {
				fields: ['id', { image_id: ['id', 'width', 'height'] }],
				filter: { platform_id: { _eq: platformId }, is_active: { _eq: true } },
				sort: ['sort_order', 'id'],
				limit: -1
			})
		),
		directus.request(
			readItems('pages', {
				fields: ['path'],
				filter: {
					template: { _eq: 'platform' },
					platform_id: { _eq: platformId },
					is_published: { _eq: true }
				},
				limit: 1
			})
		)
	]);
	if (products.length === 0) return [];

	const texts = await directus.request(
		readItems('product_translations', {
			fields: ['product_id', 'locale_code', 'name', 'description'],
			filter: {
				product_id: { _in: products.map((p) => p.id) },
				locale_code: { _in: [locale, DEFAULT_LOCALE] }
			},
			limit: -1
		})
	);
	const textsByProduct = groupBy(texts, (t) => idOf(t.product_id));
	const alts = await getFileAlts(
		products.map((p) => asObject(p.image_id)?.id).filter(isString),
		locale
	);

	return products.flatMap((product) => {
		const text = pickTranslation(textsByProduct.get(product.id), locale);
		if (!text) return [];
		const file = asObject(product.image_id);
		return [
			{
				id: product.id,
				name: text.name,
				description: text.description,
				image: toImageAsset(file, file ? (alts.get(file.id) ?? text.name) : ''),
				platformHref: platformPages[0]?.path ?? null
			}
		];
	});
}

export async function getResponsibilities(
	deploymentModelId: number,
	locale: string
): Promise<ResponsibilityRowData[]> {
	const rows = await directus.request(
		readItems('deployment_model_responsibilities', {
			fields: ['id', 'owner_party', { responsibility_id: ['id', 'sort_order'] }],
			filter: { deployment_model_id: { _eq: deploymentModelId } },
			limit: -1
		})
	);
	if (rows.length === 0) return [];

	const responsibilityIds = rows.map((r) => idOf(r.responsibility_id)).filter((id) => id !== null);
	const texts = await directus.request(
		readItems('responsibility_translations', {
			fields: ['responsibility_id', 'locale_code', 'name'],
			filter: {
				responsibility_id: { _in: responsibilityIds },
				locale_code: { _in: [locale, DEFAULT_LOCALE] }
			},
			limit: -1
		})
	);
	const textsByResponsibility = groupBy(texts, (t) => idOf(t.responsibility_id));

	return rows
		.map((row) => ({ row, responsibility: asObject(row.responsibility_id) }))
		.filter((x) => x.responsibility !== null)
		.sort(
			(a, b) => a.responsibility!.sort_order - b.responsibility!.sort_order || a.row.id - b.row.id
		)
		.flatMap(({ row, responsibility }) => {
			const text = pickTranslation(textsByResponsibility.get(responsibility!.id), locale);
			return text ? [{ id: row.id, label: text.name, owner: row.owner_party }] : [];
		});
}
