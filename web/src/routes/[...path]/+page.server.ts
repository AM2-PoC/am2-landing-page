import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getLocale } from '#lib/paraglide/runtime.js';
import { getPage } from '#lib/server/content/pages.ts';
import { isPagePath, toPagePath } from '#lib/server/content/page-path.ts';

export const load: PageServerLoad = async ({ params }) => {
	const path = toPagePath(params.path);

	// A URL that can't be a page path never reaches Directus or the cache
	if (!isPagePath(path)) error(404, 'Page not found');

	let page: Awaited<ReturnType<typeof getPage>>;
	try {
		page = await getPage(path, getLocale());
	} catch (cause) {
		// Directus is unreachable or answered with an error: show the site's own error page
		// (503 = temporary, so search engines come back later) instead of a crash
		console.error(`[page] content for ${path} could not be loaded`, cause);
		error(503, 'Content temporarily unavailable');
	}
	if (!page) error(404, 'Page not found');

	return { page };
};
