// Shared Playwright fixtures:
//   * every test fails when the page logs a JavaScript error, a console error or a
//     Content-Security-Policy violation (unless the test allows that message explicitly)
//   * `cms` switches the mock Directus into another state (only used in cms-states.e2e.ts)

import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { E2E_ENV, MOCK_DIRECTUS_URL } from './env.ts';

type PageErrors = {
	/** Ignore console errors matching this pattern in the current test (e.g. an expected 404) */
	allow(pattern: RegExp): void;
	readonly messages: string[];
};

type MockCms = {
	reset(): Promise<void>;
	outage(on: boolean): Promise<void>;
	delay(ms: number): Promise<void>;
	hideLocale(collection: string, locale: string): Promise<void>;
	/** /items requests the mock received (collection + JSON filter) */
	requests(): Promise<{ collection: string; filter: string | null }[]>;
};

export const test = base.extend<{ pageErrors: PageErrors; cms: MockCms }>({
	pageErrors: [
		async ({ page }, use) => {
			const messages: string[] = [];
			const allowed: RegExp[] = [];
			page.on('pageerror', (error) => messages.push(`pageerror: ${error.message}`));
			page.on('console', (message) => {
				if (message.type() !== 'error') return;
				// No favicon yet (brand asset still to be supplied): the browser's own request 404s
				if (message.location().url.endsWith('/favicon.ico')) return;
				messages.push(`console: ${message.text()}`);
			});
			await use({
				allow: (pattern) => allowed.push(pattern),
				get messages() {
					return messages;
				}
			});
			const unexpected = messages.filter((m) => !allowed.some((pattern) => pattern.test(m)));
			expect(unexpected, 'errors in the browser console').toEqual([]);
		},
		{ auto: true }
	],

	cms: async ({ request }, use) => {
		const post = async (path: string) => {
			const response = await request.post(`${MOCK_DIRECTUS_URL}${path}`);
			expect(response.ok()).toBe(true);
		};
		await use({
			reset: () => post('/__e2e/reset'),
			outage: (on) => post(`/__e2e/outage?on=${on ? 1 : 0}`),
			delay: (ms) => post(`/__e2e/delay?ms=${ms}`),
			hideLocale: (collection, locale) =>
				post(`/__e2e/hide-locale?collection=${collection}&locale=${locale}`),
			requests: async () => {
				const response = await request.get(`${MOCK_DIRECTUS_URL}/__e2e/requests`);
				return (await response.json()).data;
			}
		});
	}
});

export { expect };

/** Empties the website's content cache, exactly like the Directus Flow does */
export async function revalidate(request: APIRequestContext) {
	const response = await request.post('/api/revalidate', {
		headers: { 'x-revalidate-secret': E2E_ENV.REVALIDATE_SECRET },
		data: {}
	});
	expect(response.status()).toBe(200);
}

/**
 * Opens a page and waits until the network is quiet, i.e. the JavaScript has loaded and the
 * page is hydrated: a click on a menu button before that would be lost (only matters on a
 * slow or busy machine, but makes the interaction tests deterministic)
 */
export async function gotoReady(page: Page, url: string) {
	const response = await page.goto(url, { waitUntil: 'networkidle' });
	expect(response?.ok(), `${url} answered ${response?.status()}`).toBe(true);
	return response;
}

/** Scrolls once through the page (lazy images, reveal observers) and back to the top */
export async function scrollThrough(page: Page) {
	await page.evaluate(async () => {
		const step = Math.max(200, Math.floor(window.innerHeight * 0.75));
		for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
			window.scrollTo(0, y);
			await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
		}
		window.scrollTo(0, 0);
	});
}

/** Sets the theme cookie the server reads (am2-theme), before the page is opened */
export async function useTheme(page: Page, theme: 'dark' | 'light', baseURL: string) {
	await page.context().addCookies([{ name: 'am2-theme', value: theme, url: baseURL }]);
}
