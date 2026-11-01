export interface DirectusFileRow {
	id: string;
	width: number | null;
	height: number | null;
}

type FileRef = string | DirectusFileRow | null;

export interface Locale {
	code: string;
	name: string;
	is_default: boolean;
	is_active: boolean;
}

export interface Page {
	id: number;
	path: string;
	template:
		'home' | 'solution' | 'platform' | 'product' | 'service' | 'feature' | 'contact' | 'about';
	platform_id: number | null;
	deployment_model_id: number | null;
	is_published: boolean;
}

export interface PageTranslation {
	id: number;
	page_id: number | Page;
	locale_code: string;
	title: string;
	meta_description: string | null;
}

export interface NavigationItem {
	id: number;
	menu_location: 'header' | 'footer';
	parent_id: number | null;
	page_id: number | Page | null;
	sort_order: number;
	is_visible: boolean;
}

export interface NavigationItemTranslation {
	id: number;
	navigation_item_id: number;
	locale_code: string;
	label: string;
}

export interface ContentSection {
	id: number;
	section_key: string;
	section_type: string;
	image_id: FileRef;
	cta_page_id: number | Page | null;
}

export interface ContentSectionTranslation {
	id: number;
	content_section_id: number | ContentSection;
	locale_code: string;
	eyebrow: string | null;
	heading: string | null;
	heading_highlight: string | null;
	body: string | null;
	cta_label: string | null;
}

export interface PageContentSection {
	id: number;
	page_id: number | Page;
	content_section_id: number | ContentSection;
	sort_order: number;
	is_visible: boolean;
}

export interface SectionItem {
	id: number;
	content_section_id: number | ContentSection;
	image_id: FileRef;
	icon_key: string | null;
	link_page_id: number | Page | null;
	sort_order: number;
	is_visible: boolean;
}

export interface SectionItemTranslation {
	id: number;
	section_item_id: number | SectionItem;
	locale_code: string;
	title: string | null;
	description: string | null;
	link_label: string | null;
}

export interface Product {
	id: number;
	platform_id: number;
	code: string;
	image_id: FileRef;
	sort_order: number;
	is_active: boolean;
}

export interface ProductTranslation {
	id: number;
	product_id: number | Product;
	locale_code: string;
	name: string;
	description: string;
}

export interface Responsibility {
	id: number;
	code: string;
	sort_order: number;
}

export interface ResponsibilityTranslation {
	id: number;
	responsibility_id: number | Responsibility;
	locale_code: string;
	name: string;
}

export interface DeploymentModelResponsibility {
	id: number;
	deployment_model_id: number;
	responsibility_id: number | Responsibility;
	owner_party: 'am2' | 'customer';
}

export interface FileTranslation {
	id: number;
	directus_files_id: string;
	locale_code: string;
	alt_text: string;
}

export interface Schema {
	locales: Locale[];
	pages: Page[];
	page_translations: PageTranslation[];
	navigation_items: NavigationItem[];
	navigation_item_translations: NavigationItemTranslation[];
	content_sections: ContentSection[];
	content_section_translations: ContentSectionTranslation[];
	page_content_sections: PageContentSection[];
	section_items: SectionItem[];
	section_item_translations: SectionItemTranslation[];
	products: Product[];
	product_translations: ProductTranslation[];
	responsibilities: Responsibility[];
	responsibility_translations: ResponsibilityTranslation[];
	deployment_model_responsibilities: DeploymentModelResponsibility[];
	file_translations: FileTranslation[];
	directus_files: DirectusFileRow[];
}
