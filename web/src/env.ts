import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

export const variables = defineEnvVars({
	DIRECTUS_URL: { schema: v.pipe(v.string(), v.url()) },
	DIRECTUS_TOKEN: { schema: v.pipe(v.string(), v.minLength(20)) },
	ASSETS_BASE_URL: { schema: v.pipe(v.string(), v.url()) },
	REVALIDATE_SECRET: { schema: v.pipe(v.string(), v.minLength(32)) }
});
