import { locales } from '#lib/paraglide/runtime.js';
import type { Navigation } from '#lib/types/navigation.ts';
import type { SiteData } from '#lib/types/site.ts';

// Used only while Directus can't be reached: the page still gets its header, footer and
// language switch, and shows the site's error page (see routes/+layout.server.ts)

/** Names of the languages the website is built with (messages/*.json) */
const LOCALE_NAMES: Record<string, string> = { en: 'English', id: 'Bahasa Indonesia' };

export function fallbackNavigation(): Navigation {
	return { header: [], footer: [] };
}

export function fallbackSiteData(): SiteData {
	return {
		footerTagline: '',
		locales: locales.map((code) => ({ code, name: LOCALE_NAMES[code] ?? code.toUpperCase() }))
	};
}
