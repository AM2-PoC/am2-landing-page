export interface SiteLocale {
	code: string;
	name: string;
}

export interface SiteData {
	footerTagline: string;
	locales: SiteLocale[];
}
