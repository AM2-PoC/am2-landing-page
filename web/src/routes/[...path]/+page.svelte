<script lang="ts">
	import type { PageProps } from './$types';
	import PageTemplate from '#lib/templates/PageTemplate.svelte';

	let { data }: PageProps = $props();
</script>

<PageTemplate page={data.page} locales={data.site.locales} />
