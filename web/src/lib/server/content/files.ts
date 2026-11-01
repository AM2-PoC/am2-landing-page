import { readItems } from '@directus/sdk';
import { directus } from '#lib/server/directus.ts';
import { DEFAULT_LOCALE, pickTranslation } from '#lib/i18n/translation.ts';
import { groupBy } from '#lib/server/content/helpers.ts';

export async function getFileAlts(fileIds: string[], locale: string): Promise<Map<string, string>> {
	const alts = new Map<string, string>();
	if (fileIds.length === 0) return alts;

	const rows = await directus.request(
		readItems('file_translations', {
			fields: ['directus_files_id', 'locale_code', 'alt_text'],
			filter: {
				directus_files_id: { _in: fileIds },
				locale_code: { _in: [locale, DEFAULT_LOCALE] }
			},
			limit: -1
		})
	);

	for (const [fileId, list] of groupBy(rows, (row) => row.directus_files_id)) {
		alts.set(fileId, pickTranslation(list, locale)?.alt_text ?? '');
	}
	return alts;
}
