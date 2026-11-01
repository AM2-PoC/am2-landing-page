import type { Handle } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { ASSETS_BASE_URL } from '$app/env/private';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { applySecurityHeaders, originOf } from '#lib/server/security-headers.ts';
import { THEME_COOKIE, parseTheme } from '#lib/theme/theme.ts';

const assetsOrigin = originOf(ASSETS_BASE_URL);

// Security headers on every response (pages, errors, /api); images from Directus are
// allowed in the Content-Security-Policy
const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	try {
		applySecurityHeaders(response.headers, {
			assetsOrigin,
			https: event.url.protocol === 'https:'
		});
	} catch {
		// Some responses (e.g. a proxied fetch) have read-only headers: leave them as they are
	}
	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) =>
					html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

// <html data-theme> is rendered on the server from the visitor's saved choice,
// so a light page never flashes dark first (and the other way round)
const handleTheme: Handle = ({ event, resolve }) => {
	const theme = parseTheme(event.cookies.get(THEME_COOKIE));
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%am2.theme%', theme)
	});
};

export const handle: Handle = sequence(handleSecurityHeaders, handleParaglide, handleTheme);
