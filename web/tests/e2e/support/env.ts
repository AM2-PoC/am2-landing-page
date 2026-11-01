// Addresses and test-only values shared by playwright.config.ts and the tests.
// None of these are real secrets: the mock Directus accepts exactly this token.

export const MOCK_DIRECTUS_PORT = 8065;
export const APP_PORT = 4174;
export const MOCK_DIRECTUS_URL = `http://127.0.0.1:${MOCK_DIRECTUS_PORT}`;
export const APP_URL = `http://127.0.0.1:${APP_PORT}`;

export const E2E_ENV = {
	DIRECTUS_URL: MOCK_DIRECTUS_URL,
	DIRECTUS_TOKEN: 'e2e-directus-token-not-a-secret',
	ASSETS_BASE_URL: MOCK_DIRECTUS_URL,
	REVALIDATE_SECRET: 'e2e-revalidate-secret-0123456789abcdef'
} as const;

/** Screen sizes every layout test runs on (phone, large phone, tablet, laptop, desktop) */
export const VIEWPORTS = [
	{ name: 'phone 375×812', width: 375, height: 812 },
	{ name: 'large phone 430×932', width: 430, height: 932 },
	{ name: 'tablet 768×1024', width: 768, height: 1024 },
	{ name: 'laptop 1440×900', width: 1440, height: 900 },
	{ name: 'desktop 1920×1080', width: 1920, height: 1080 }
] as const;

/** Tailwind lg: from here the desktop navigation replaces the menu button */
export const DESKTOP_MIN_WIDTH = 1024;
