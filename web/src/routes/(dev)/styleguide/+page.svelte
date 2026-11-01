<script lang="ts">
	import * as sample from './sample.ts';
	import Container from '#lib/components/layout/Container.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import ArrowLink from '#lib/components/ui/ArrowLink.svelte';
	import Eyebrow from '#lib/components/ui/Eyebrow.svelte';
	import FieldLabel from '#lib/components/ui/FieldLabel.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import Textarea from '#lib/components/ui/Textarea.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import FieldError from '#lib/components/ui/FieldError.svelte';
	import HeroSection from '#lib/components/sections/HeroSection.svelte';
	import IconGridSection from '#lib/components/sections/IconGridSection.svelte';
	import CardGridSection from '#lib/components/sections/CardGridSection.svelte';
	import CarouselSection from '#lib/components/sections/CarouselSection.svelte';
	import SplitListSection from '#lib/components/sections/SplitListSection.svelte';
	import SplitMediaSection from '#lib/components/sections/SplitMediaSection.svelte';
	import ProcessStepsSection from '#lib/components/sections/ProcessStepsSection.svelte';
	import AccordionSection from '#lib/components/sections/AccordionSection.svelte';
	import CtaSection from '#lib/components/sections/CtaSection.svelte';
	import ProductListSection from '#lib/components/sections/ProductListSection.svelte';
	import ResponsibilityMatrixSection from '#lib/components/sections/ResponsibilityMatrixSection.svelte';

	const options = [
		{ value: 1, label: 'AM² PTT' },
		{ value: 2, label: 'AM² Command Center' }
	];
</script>

<svelte:head>
	<title>Styleguide — AM²</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#snippet label(text: string)}
	<div class="border-line-chrome bg-chrome border-y py-2">
		<Container><p class="text-label text-accent font-mono uppercase">{text}</p></Container>
	</div>
{/snippet}

{@render label('Primitives — Button / ArrowLink / Eyebrow')}
<Container class="flex flex-wrap items-center gap-4 py-12">
	<Button>Get in Touch</Button>
	<Button shape="card">Get in Touch (card)</Button>
	<Button loading>Sending…</Button>
	<Button disabled>Disabled</Button>
	<ArrowLink href="/platforms/am2-ptt" label="Explore AM² PTT" />
	<Eyebrow>Discuss your requirements</Eyebrow>
</Container>

{@render label('Primitives — Form fields (normal & error)')}
<Container class="grid max-w-2xl gap-6 py-12 sm:grid-cols-2">
	<div>
		<FieldLabel for="sg-name" required>Full name</FieldLabel>
		<Input id="sg-name" placeholder="Jane Doe" />
	</div>
	<div>
		<FieldLabel for="sg-email" required>Work email</FieldLabel>
		<Input
			id="sg-email"
			type="email"
			value="not-an-email"
			invalid
			aria-describedby="sg-email-error"
		/>
		<FieldError id="sg-email-error" message="Enter a valid email address" />
	</div>
	<div>
		<FieldLabel for="sg-product" required>Product of interest</FieldLabel>
		<Select id="sg-product" {options} />
	</div>
	<div>
		<FieldLabel for="sg-disabled">Disabled</FieldLabel>
		<Input id="sg-disabled" disabled value="Read only" />
	</div>
	<div class="sm:col-span-2">
		<FieldLabel for="sg-message">Message (optional)</FieldLabel>
		<Textarea id="sg-message" rows={4} />
	</div>
	<div class="sm:col-span-2">
		<Checkbox id="sg-consent">
			I agree that AM² may process the information above to prepare and respond to this proposal
			request.
		</Checkbox>
	</div>
</Container>

{@render label('HeroSection — centered (Home)')}
<HeroSection section={sample.heroCentered} variant="centered" />

{@render label('HeroSection — background (inner pages)')}
<HeroSection section={sample.heroBackground} variant="background" />

{@render label('IconGridSection — compact (outcomes)')}
<IconGridSection section={sample.outcomes} />

{@render label('IconGridSection — feature + dividers (operational model)')}
<IconGridSection section={sample.models} variant="feature" dividers />

{@render label('CardGridSection — feature (platforms)')}
<CardGridSection section={sample.platforms} variant="feature" />

{@render label('CardGridSection — banner (industries)')}
<CardGridSection section={sample.industries} variant="banner" />

{@render label('CarouselSection — peek (security)')}
<CarouselSection section={sample.security} />

{@render label('SplitListSection')}
<SplitListSection section={sample.splitList} />

{@render label('SplitMediaSection (Why AM²)')}
<SplitMediaSection section={sample.whyAm2} />

{@render label('ProcessStepsSection (How We Work)')}
<ProcessStepsSection section={sample.steps} />

{@render label('AccordionSection (FAQ)')}
<AccordionSection section={sample.faq} />

{@render label('CtaSection')}
<CtaSection section={sample.cta} />

{@render label('ProductListSection')}
<ProductListSection section={sample.productSection} products={sample.products} />

{@render label('ResponsibilityMatrixSection')}
<ResponsibilityMatrixSection section={sample.matrix} rows={sample.matrixRows} />
