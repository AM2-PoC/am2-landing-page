export const DEFAULT_LOCALE = 'en';

export function pickTranslation<T extends { locale_code: string }>(
	translations: T[] | null | undefined,
	locale: string,
	fallback: string = DEFAULT_LOCALE
): T | undefined {
	if (!translations?.length) return undefined;
	return (
		translations.find((t) => t.locale_code === locale) ??
		translations.find((t) => t.locale_code === fallback) ??
		translations[0]
	);
}
