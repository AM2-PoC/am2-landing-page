<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { localizeHref, type Locale } from '#lib/paraglide/runtime.js';
	import { withoutTrailingSlash } from '#lib/utils/href.ts';

	type Props = Omit<HTMLAnchorAttributes, 'href'> & {
		href: string;
		locale?: string;
		children: Snippet;
	};

	let { href, locale, children, ...rest }: Props = $props();

	const target = $derived(
		withoutTrailingSlash(localizeHref(href, locale ? { locale: locale as Locale } : undefined))
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a href={target} {...rest}>{@render children()}</a>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
