<script lang="ts">
	import { page as appPage } from '$app/state';
	import { getLocale, localizeHref, type Locale } from '#lib/paraglide/runtime.js';
	import { withoutTrailingSlash } from '#lib/utils/href.ts';
	import type { SiteLocale } from '#lib/types/site.ts';

	type Props = { title: string; description: string; path: string; locales: SiteLocale[] };
	let { title, description, path, locales }: Props = $props();

	const absoluteUrl = (locale: string) =>
		new URL(
			withoutTrailingSlash(localizeHref(path, { locale: locale as Locale })),
			appPage.url.origin
		).href;
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}<meta name="description" content={description} />{/if}

	<link rel="canonical" href={absoluteUrl(getLocale())} />

	{#each locales as locale (locale.code)}
		<link rel="alternate" hreflang={locale.code} href={absoluteUrl(locale.code)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={absoluteUrl('en')} />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	{#if description}<meta property="og:description" content={description} />{/if}
	<meta property="og:url" content={absoluteUrl(getLocale())} />
</svelte:head>
