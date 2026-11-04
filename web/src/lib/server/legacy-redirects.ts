import {
	baseLocale,
	deLocalizeUrl,
	extractLocaleFromUrl,
	localizeUrl
} from '#lib/paraglide/runtime.js';

/**
 * Pages that no longer exist → the page that replaced them (paths without a language
 * prefix). The two platform pages were merged into one in database/10_combined_platform_page.sql.
 */
export const LEGACY_PAGE_REDIRECTS: Readonly<Record<string, string>> = {
	'/platforms/am2-ptt': '/platforms/am2-ptt-command-center',
	'/platforms/am2-command-center': '/platforms/am2-ptt-command-center'
};

/**
 * Where an old URL moved to, in the same language and with the same query string,
 * or null when the URL is not an old page (e.g. /id/platforms/am2-ptt?ref=x →
 * /id/platforms/am2-ptt-command-center?ref=x).
 */
export function legacyRedirectTarget(url: URL): string | null {
	const delocalized = deLocalizeUrl(url);
	const path = delocalized.pathname.replace(/\/+$/, '') || '/';
	const target = LEGACY_PAGE_REDIRECTS[path];
	if (!target) return null;

	delocalized.pathname = target;
	const localized = localizeUrl(delocalized, { locale: extractLocaleFromUrl(url) ?? baseLocale });
	return localized.pathname + localized.search;
}
