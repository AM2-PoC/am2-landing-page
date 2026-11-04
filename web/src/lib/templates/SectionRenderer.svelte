<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import HeroSection from '#lib/components/sections/HeroSection.svelte';
	import IconGridSection from '#lib/components/sections/IconGridSection.svelte';
	import CardGridSection from '#lib/components/sections/CardGridSection.svelte';
	import CarouselSection from '#lib/components/sections/CarouselSection.svelte';
	import SlideshowSection from '#lib/components/sections/SlideshowSection.svelte';
	import SplitListSection from '#lib/components/sections/SplitListSection.svelte';
	import PagedListSection from '#lib/components/sections/PagedListSection.svelte';
	import SplitMediaSection from '#lib/components/sections/SplitMediaSection.svelte';
	import ProcessStepsSection from '#lib/components/sections/ProcessStepsSection.svelte';
	import AccordionSection from '#lib/components/sections/AccordionSection.svelte';
	import CtaSection from '#lib/components/sections/CtaSection.svelte';
	import ProductListSection from '#lib/components/sections/ProductListSection.svelte';
	import ResponsibilityMatrixSection from '#lib/components/sections/ResponsibilityMatrixSection.svelte';
	import {
		cardGridOptions,
		carouselOptions,
		heroVariant,
		iconGridOptions,
		splitListOptions,
		splitMediaOptions
	} from './section-options.ts';
	import { decorLayout, setSectionDecor } from '#lib/components/decor/decor-layouts.ts';
	import type { PageData, SectionData } from '#lib/types/content.ts';

	type Props = {
		section: SectionData;
		page: PageData;
		/** Position on the page: picks the background decoration, so neighbours differ */
		index?: number;
	};
	let { section, page, index = 0 }: Props = $props();

	setSectionDecor(() => decorLayout(index));
</script>

{#if section.type === 'hero'}
	<HeroSection {section} variant={heroVariant(page.template)} />
{:else if section.type === 'icon_grid'}
	<IconGridSection {section} {...iconGridOptions[section.key] ?? {}} />
{:else if section.type === 'card_grid'}
	<CardGridSection {section} {...cardGridOptions[section.key] ?? {}} />
{:else if section.type === 'carousel'}
	{@const { variant, ...carousel } = carouselOptions[section.key] ?? {}}
	{#if variant === 'single'}
		<SlideshowSection {section} {...carousel} />
	{:else}
		<CarouselSection {section} {...carousel} />
	{/if}
{:else if section.type === 'split_list'}
	{@const { paged, imagePosition, ...splitList } = splitListOptions[section.key] ?? {}}
	{#if paged}
		<PagedListSection {section} {...splitList} />
	{:else}
		<SplitListSection {section} {imagePosition} {...splitList} />
	{/if}
{:else if section.type === 'split_media'}
	<SplitMediaSection {section} {...splitMediaOptions[section.key] ?? {}} />
{:else if section.type === 'process_steps'}
	<ProcessStepsSection {section} />
{:else if section.type === 'accordion'}
	<AccordionSection {section} />
{:else if section.type === 'cta'}
	<CtaSection {section} />
{:else if section.type === 'product_list'}
	<ProductListSection {section} products={page.products} />
{:else if section.type === 'responsibility_matrix'}
	<ResponsibilityMatrixSection {section} rows={page.responsibilities} />
{:else if section.type === 'contact_form'}
	<!-- Temporary: intro only. The full form is built in Phase 9 -->
	<!-- First section of its page: the intro rises in right after loading -->
	<Section tone="gradient" labelledby="{section.key}-heading" reveal={false}>
		<SectionIntro
			eyebrow={section.eyebrow}
			heading={section.heading}
			highlight={section.highlight}
			body={section.body}
			level={1}
			align="left"
			reveal="load"
			headingId="{section.key}-heading"
		/>
	</Section>
{:else if import.meta.env.DEV}
	<p class="container-site text-error py-8">Unknown section type: {section.type}</p>
{/if}
