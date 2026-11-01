import { readItems } from '@directus/sdk';
import { directus } from '#lib/server/directus.ts';
import { cached } from '#lib/server/cache.ts';
import { DEFAULT_LOCALE, pickTranslation } from '#lib/i18n/translation.ts';
import { locales as appLocales } from '#lib/paraglide/runtime.js';
import type { SiteData } from '#lib/types/site.ts';

export function getSiteData(locale: string): Promise<SiteData> {
	return cached(`site:${locale}`, 5 * 60_000, () => fetchSiteData(locale));
}

async function fetchSiteData(locale: string): Promise<SiteData> {
	const [footer, locales] = await Promise.all([
		directus.request(
			readItems('content_section_translations', {
				fields: ['locale_code', 'body'],
				filter: {
					content_section_id: { section_key: { _eq: 'site_footer' } },
					locale_code: { _in: [locale, DEFAULT_LOCALE] }
				},
				limit: 2
			})
		),
		directus.request(
			readItems('locales', {
				fields: ['code', 'name'],
				filter: { is_active: { _eq: true } },
				sort: ['-is_default', 'code']
			})
		)
	]);

	return {
		footerTagline: pickTranslation(footer, locale)?.body ?? '',
		locales: locales.filter((l) => (appLocales as readonly string[]).includes(l.code))
	};
}
