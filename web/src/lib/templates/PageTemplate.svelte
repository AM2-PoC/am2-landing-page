<script lang="ts">
	import Seo from '#lib/components/layout/Seo.svelte';
	import SectionRenderer from './SectionRenderer.svelte';
	import type { PageData } from '#lib/types/content.ts';
	import type { SiteLocale } from '#lib/types/site.ts';

	let { page, locales }: { page: PageData; locales: SiteLocale[] } = $props();
</script>

<Seo title={page.seo.title} description={page.seo.description} path={page.path} {locales} />

{#each page.sections as section, index (section.key)}
	<SectionRenderer {section} {page} {index} />
{/each}
