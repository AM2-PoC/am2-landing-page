import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { REVALIDATE_SECRET } from '$app/env/private';
import { clearCache } from '#lib/server/cache.ts';
import { secretMatches } from '#lib/server/secret.ts';

// Called by the Directus Flow "Revalidate website" (POST, JSON body, header
// x-revalidate-secret). SvelteKit's CSRF check rejects form posts from other sites with 403.
export const POST: RequestHandler = async ({ request }) => {
	if (!(await secretMatches(request.headers.get('x-revalidate-secret'), REVALIDATE_SECRET))) {
		error(401, 'Unauthorized');
	}
	clearCache();
	return json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
};
