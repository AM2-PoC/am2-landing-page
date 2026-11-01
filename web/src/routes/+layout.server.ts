import type { LayoutServerLoad } from './$types';
import { getLocale } from '#lib/paraglide/runtime.js';
import { getNavigation } from '#lib/server/content/navigation.ts';
import { getSiteData } from '#lib/server/content/site.ts';
import { fallbackNavigation, fallbackSiteData } from '#lib/server/content/fallback.ts';
import { THEME_COOKIE, parseTheme } from '#lib/theme/theme.ts';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const locale = getLocale();

	// The header and footer must still render when Directus is down, otherwise visitors get
	// SvelteKit's bare fallback page: use an empty menu and the built-in languages instead
	// (the page itself then shows the site's error page)
	const [navigation, site] = await Promise.all([
		getNavigation(locale).catch((cause: unknown) => {
			console.error('[layout] navigation could not be loaded', cause);
			return fallbackNavigation();
		}),
		getSiteData(locale).catch((cause: unknown) => {
			console.error('[layout] site data could not be loaded', cause);
			return fallbackSiteData();
		})
	]);

	return { locale, navigation, site, themePreference: parseTheme(cookies.get(THEME_COOKIE)) };
};
