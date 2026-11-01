import type { PageTemplate, SectionTone } from '#lib/types/content.ts';

type Tone = { tone?: SectionTone };

export const iconGridOptions: Record<
	string,
	Tone & { variant?: 'compact' | 'feature'; dividers?: boolean }
> = {
	home_outcomes: { variant: 'compact' },
	home_operational_models: { variant: 'feature', dividers: true },
	solutions_pillars: { variant: 'compact', dividers: true }
};

export const cardGridOptions: Record<
	string,
	Tone & { variant?: 'feature' | 'banner' | 'tall'; columns?: 2 | 3 }
> = {
	home_platforms: { variant: 'feature' },
	home_industries: { variant: 'banner' },
	platform_ptt_benefits: { variant: 'tall', columns: 3 },
	platform_cc_benefits: { variant: 'tall', columns: 3 },
	about_what_we_do: { variant: 'banner', tone: 'raised' }
};

/** 'peek': three cards in view, the next one peeking in. 'single': one wide card with arrows beside it */
export const carouselOptions: Record<string, Tone & { variant?: 'peek' | 'single' }> = {
	home_security_controls: { variant: 'peek' },
	solutions_capabilities: { variant: 'single' }
};

/** paged: features four at a time with arrows (Figma: Features pages); shorter lists show no arrows */
export const splitListOptions: Record<string, Tone & { paged?: boolean }> = {
	feature_ptt_app_list: { paged: true },
	feature_ptt_webadmin_list: { paged: true },
	feature_cc_app_list: { paged: true },
	feature_cc_webadmin_list: { paged: true }
};

export const splitMediaOptions: Record<string, Tone & { imagePosition?: 'left' | 'right' }> = {
	home_why_am2: { imagePosition: 'left' },
	solutions_challenge: { imagePosition: 'right', tone: 'canvas' }
};

export function heroVariant(template: PageTemplate): 'centered' | 'background' | 'media-pair' {
	if (template === 'home') return 'centered';
	if (template === 'about') return 'media-pair';
	return 'background';
}
