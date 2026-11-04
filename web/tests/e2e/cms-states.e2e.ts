// The website when Directus misbehaves: down, hanging, or missing a translation.
// These tests change the mock CMS for everyone, so Playwright runs them in their own project
// ("cms-states") after all other tests, one at a time, and every test puts the mock and the
// website's cache back to normal before and after itself.

import { test, expect, revalidate } from './support/test.ts';
import { pageInfo } from './support/content.ts';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ cms, request }) => {
	await cms.reset();
	await revalidate(request);
});

test.afterEach(async ({ cms, request }) => {
	await cms.reset();
	await revalidate(request);
});

// Regression (audit M-1): with Directus down the visitor used to get SvelteKit's bare
// "Internal Error" page without header, footer or language
test.describe('Directus is down', () => {
	for (const [locale, url, heading] of [
		['en', '/about-us', 'Something went wrong'],
		['id', '/id/about-us', 'Terjadi kendala']
	] as const) {
		test(`the site's own error page is shown with status 503 (${locale})`, async ({
			page,
			cms,
			pageErrors
		}) => {
			pageErrors.allow(/status of 503/);
			await cms.outage(true);

			const response = await page.goto(url);
			expect(response?.status()).toBe(503);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
			await expect(page.locator('html')).toHaveAttribute('lang', locale);
			await expect(page.getByRole('banner')).toBeVisible();
			await expect(page.getByRole('contentinfo')).toBeVisible();
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
			// The language switch still works without the CMS
			await expect(
				page.getByRole('banner').getByRole('link', { name: /English|Indonesia/ })
			).toBeVisible();
			// No internal details leak into the page
			expect(await page.content()).not.toMatch(/Service Unavailable|8065|at \S+ \(/);
		});
	}

	test('pages that were already loaded keep working from the cache', async ({ page, cms }) => {
		expect((await page.goto('/platforms/am2-ptt-command-center'))?.status()).toBe(200);
		await cms.outage(true);

		expect((await page.goto('/platforms/am2-ptt-command-center'))?.status()).toBe(200);
		await expect(page).toHaveTitle(pageInfo('/platforms/am2-ptt-command-center').title.en);
	});

	test('the site recovers on its own once Directus is back (errors are not cached)', async ({
		page,
		cms,
		pageErrors
	}) => {
		pageErrors.allow(/status of 503/);
		await cms.outage(true);
		expect((await page.goto('/services/saas'))?.status()).toBe(503);

		await cms.outage(false);
		expect((await page.goto('/services/saas'))?.status()).toBe(200);
		await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeAttached();
	});
});

// Regression (audit M-2): a hanging Directus used to keep the visitor's request open
// indefinitely; now every CMS request is cancelled after 10 s
test('a hanging Directus gives up after the time limit with a 503', async ({ request, cms }) => {
	test.setTimeout(45_000);
	await cms.delay(20_000);

	const started = Date.now();
	const response = await request.get('/services/on-premise', { timeout: 30_000 });
	const seconds = (Date.now() - started) / 1000;

	expect(response.status()).toBe(503);
	expect(seconds).toBeGreaterThan(9);
	expect(seconds).toBeLessThan(20);
});

test.describe('missing translations', () => {
	test('a page without an Indonesian title falls back to the English one', async ({
		page,
		cms
	}) => {
		await cms.hideLocale('page_translations', 'id');

		const response = await page.goto('/id/about-us');
		expect(response?.status()).toBe(200);
		await expect(page).toHaveTitle(pageInfo('/about-us').title.en);
		await expect(page.locator('html')).toHaveAttribute('lang', 'id');
	});

	test('sections without Indonesian texts show the English texts instead of empty space', async ({
		page,
		cms
	}) => {
		await cms.hideLocale('content_section_translations', 'id');
		await cms.hideLocale('section_item_translations', 'id');

		await page.goto('/about-us');
		const englishHeading = await page.getByRole('heading', { level: 1 }).innerText();

		await revalidate(page.request);
		await page.goto('/id/about-us');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(englishHeading);
	});

	test('a menu entry without an Indonesian label falls back to English', async ({ page, cms }) => {
		await cms.hideLocale('navigation_item_translations', 'id');
		await page.setViewportSize({ width: 1440, height: 900 });

		await page.goto('/id');
		await expect(
			page
				.getByRole('navigation', { name: 'Navigasi utama' })
				.getByRole('link', { name: 'About Us' })
		).toBeVisible();
	});
});
