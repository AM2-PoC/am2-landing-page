<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import Button from '#lib/components/ui/Button.svelte';

	const notFound = $derived(page.status === 404);
	// 503: Directus could not be reached, the page itself still exists
	const unavailable = $derived(page.status === 503);
</script>

<svelte:head>
	<title>{page.status} — AM²</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section
	class="container-site flex min-h-96 flex-col items-center justify-center py-24 text-center"
>
	<p class="text-eyebrow text-accent font-mono uppercase">
		{m.error_code({ status: page.status })}
	</p>
	<h1 class="text-h2 text-strong mt-3">{notFound ? m.error_not_found() : m.error_generic()}</h1>
	<p class="text-muted mt-4 max-w-md text-lg">
		{unavailable ? m.error_unavailable_hint() : m.error_hint()}
	</p>
	<Button href="/" class="mt-8">{m.error_back_home()}</Button>
</section>
