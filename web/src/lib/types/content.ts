export type SectionType =
	| 'hero'
	| 'icon_grid'
	| 'card_grid'
	| 'carousel'
	| 'split_list'
	| 'split_media'
	| 'process_steps'
	| 'accordion'
	| 'cta'
	| 'product_list'
	| 'responsibility_matrix'
	| 'contact_form'
	| 'footer';

export type SectionTone = 'canvas' | 'raised' | 'gradient' | 'chrome';

export interface ImageAsset {
	src: string;
	srcset?: string;
	alt: string;
	width: number;
	height: number;
}

export interface LinkData {
	href: string;
	label: string;
}

export interface SectionItemData {
	id: number;
	title: string | null;
	description: string | null;
	iconKey: string | null;
	image: ImageAsset | null;
	link: LinkData | null;
}

export interface SectionData {
	key: string;
	type: SectionType;
	eyebrow: string | null;
	heading: string | null;
	highlight: string | null;
	body: string | null;
	image: ImageAsset | null;
	cta: LinkData | null;
	items: SectionItemData[];
}

export interface ProductData {
	id: number;
	name: string;
	description: string;
	image: ImageAsset | null;
	platformHref: string | null;
}

export interface ResponsibilityRowData {
	id: number;
	label: string;
	owner: 'am2' | 'customer';
}

export type PageTemplate =
	'home' | 'solution' | 'platform' | 'product' | 'service' | 'feature' | 'contact' | 'about';

export interface PageData {
	id: number;
	path: string;
	template: PageTemplate;
	platformId: number | null;
	deploymentModelId: number | null;
	seo: { title: string; description: string };
	sections: SectionData[];
	products: ProductData[];
	responsibilities: ResponsibilityRowData[];
}
