import { createDirectus, rest, staticToken } from '@directus/sdk';
import { DIRECTUS_URL, DIRECTUS_TOKEN } from '$app/env/private';
import type { Schema } from '#lib/types/directus.ts';

/** A Directus request that takes longer than this is cancelled (the page then shows 503) */
export const DIRECTUS_TIMEOUT_MS = 10_000;

export const directus = createDirectus<Schema>(DIRECTUS_URL)
	.with(staticToken(DIRECTUS_TOKEN))
	.with(
		rest({
			// Without a time limit a hanging CMS would keep every visitor's request open
			onRequest: (options) => ({ ...options, signal: withTimeout(options.signal) })
		})
	);

function withTimeout(signal: AbortSignal | null | undefined): AbortSignal {
	const timeout = AbortSignal.timeout(DIRECTUS_TIMEOUT_MS);
	return signal ? AbortSignal.any([signal, timeout]) : timeout;
}
