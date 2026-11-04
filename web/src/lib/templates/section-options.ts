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
	Tone & { variant?: 'feature' | 'banner' | 'tall'; columns?: 1 | 2 | 3 }
> = {
	// Migration 11 reduces this section to one combined platform card.
	home_platforms: { variant: 'feature', columns: 1 },
	home_industries: { variant: 'banner' },
	platform_combined_benefits: { variant: 'tall', columns: 3 },
	platform_combined_devices: { variant: 'feature' },
	// Former single-platform pages (unpublished by 10_combined_platform_page.sql, kept for rollback)
	platform_ptt_benefits: { variant: 'tall', columns: 3 },
	platform_cc_benefits: { variant: 'tall', columns: 3 },
	about_what_we_do: { variant: 'banner', tone: 'raised' }
};

/** 'peek': three cards in view, the next one peeking in. 'single': one wide card with arrows beside it */
export const carouselOptions: Record<string, Tone & { variant?: 'peek' | 'single' }> = {
	home_security_controls: { variant: 'peek' },
	solutions_capabilities: { variant: 'single' }
};

/**
 * paged: features four at a time with arrows (Figma: Features pages); shorter lists show no arrows.
 * imagePosition: side of the photo for non-paged lists (default right)
 */
export const splitListOptions: Record<
	string,
	Tone & { paged?: boolean; imagePosition?: 'left' | 'right' }
> = {
	// Combined platform page: one section covers both platforms (12_combined_platform_capabilities.sql);
	// platform_combined_command_center is hidden there and kept only for rollback
	platform_combined_ptt: { imagePosition: 'right' },
	platform_combined_command_center: { imagePosition: 'left' },
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
	return 'background';
}
