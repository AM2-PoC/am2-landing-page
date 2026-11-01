import { test, expect } from './support/test.ts';
import { LOCALES, PAGES, itemsWithIcons, localize, type Locale } from './support/content.ts';

const NOT_FOUND_HEADING: Record<Locale, string> = {
	en: 'Page not found',
	id: 'Halaman tidak ditemukan'
};
const ERROR_CODE: Record<Locale, string> = { en: 'Error 404', id: 'Kode kesalahan 404' };

test.describe('every page loads', () => {
	for (const locale of LOCALES) {
		for (const page of PAGES) {
			const url = localize(page.path, locale);

			test(`${url} answers 200 with its title, one h1 and the site chrome`, async ({
				page: tab,
				baseURL
			}) => {
				const response = await tab.goto(url);
				expect(response?.status()).toBe(200);

				await expect(tab).toHaveTitle(page.title[locale]);
				await expect(tab.locator('html')).toHaveAttribute('lang', locale);
				await expect(tab.getByRole('heading', { level: 1 })).toHaveCount(1);
				await expect(tab.getByRole('banner')).toBeVisible();
				await expect(tab.getByRole('main')).toBeVisible();
				await expect(tab.getByRole('contentinfo')).toBeVisible();

				await expect(tab.locator('link[rel="canonical"]')).toHaveAttribute(
					'href',
					new URL(url, baseURL).href
				);
				await expect(tab.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
					'href',
					new URL(page.path, baseURL).href
				);
			});
		}
	}
});

// Regression (audit M-9): the content names the on-premise icon "server", but the file is
// server-rack.svg (SvelteKit reserves server.* names), so that card showed no icon
test('every icon named in the CMS is drawn', async ({ page }) => {
	const items = itemsWithIcons();
	expect(items.length).toBeGreaterThan(0);
	for (const path of new Set(items.map((item) => item.path))) {
		await page.goto(path);
		for (const { title, iconKey } of items.filter((item) => item.path === path)) {
			// IconFeature: the icon (inline SVG) comes right before the card title
			const icon = page
				.getByRole('heading', { name: title, exact: true })
				.locator('xpath=preceding-sibling::span[1]/*[local-name()="svg"]');
			await expect(icon, `${path}: icon "${iconKey}" of "${title}"`).toHaveCount(1);
		}
	}
});

test.describe('unknown addresses', () => {
	for (const locale of LOCALES) {
		test(`a missing page shows the site's 404 page (${locale})`, async ({ page, pageErrors }) => {
			pageErrors.allow(/status of 404/);
			const response = await page.goto(localize('/this-page-does-not-exist', locale));

			expect(response?.status()).toBe(404);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(NOT_FOUND_HEADING[locale]);
			// Regression (audit L-2): the status line was always English ("Error 404")
			await expect(page.getByText(ERROR_CODE[locale], { exact: true })).toBeVisible();
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
			await expect(page.locator('html')).toHaveAttribute('lang', locale);
			await expect(page.getByRole('banner')).toBeVisible();
			const home = page.getByRole('main').getByRole('link');
			await expect(home).toHaveAttribute('href', localize('/', locale));
		});
	}

	// Regression (audit H-1): addresses that can never be a page path are answered with 404
	// right away, without a Directus request (and without filling the cache)
	const invalidPaths = (token: string) => [
		`/Upper-Case-${token}`,
		`/under_score_${token}`,
		`/${token}.php`,
		`/%3Cscript%3E${token}`,
		`/space%20${token}`,
		`/${token}${'x'.repeat(300)}`
	];
	test('addresses that cannot be a page are a 404 without asking the CMS', async ({
		request,
		cms
	}) => {
		const token = `invalid${test.info().workerIndex}t${Date.now()}`;
		for (const path of invalidPaths(token)) {
			const response = await request.get(path, { maxRedirects: 0 });
			expect(response.status(), path).toBe(404);
		}
		const asked = (await cms.requests()).filter((r) => r.filter?.toLowerCase().includes(token));
		expect(asked).toEqual([]);
	});

	test('a well-formed but unknown path is looked up once and then answered from the cache', async ({
		request,
		cms
	}) => {
		const path = `/not-a-page-${test.info().workerIndex}-${Date.now()}`;
		expect((await request.get(path)).status()).toBe(404);
		expect((await request.get(path)).status()).toBe(404);

		const asked = (await cms.requests()).filter(
			(r) => r.collection === 'pages' && r.filter?.includes(path)
		);
		expect(asked).toHaveLength(1);
	});

	test('a trailing slash redirects to the address without it', async ({ request, baseURL }) => {
		const response = await request.get('/about-us/', { maxRedirects: 0 });
		expect([301, 308]).toContain(response.status());
		const target = new URL(response.headers()['location'], `${baseURL}/about-us/`);
		expect(target.href).toBe(`${baseURL}/about-us`);
	});

	test('the development style guide is not part of the production site', async ({ request }) => {
		expect((await request.get('/styleguide')).status()).toBe(404);
	});
});

test.describe('links', () => {
	test('every internal link on every page leads to a page that exists', async ({ page }) => {
		test.slow(); // visits all pages
		const hrefs = new Map<string, string>();
		for (const locale of LOCALES) {
			for (const info of PAGES) {
				const url = localize(info.path, locale);
				await page.goto(url);
				for (const href of await page
					.locator('a[href]')
					.evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''))) {
					if (!hrefs.has(href)) hrefs.set(href, url);
				}
			}
		}

		const broken: string[] = [];
		for (const [href, foundOn] of hrefs) {
			if (href.startsWith('#')) continue;
			if (/^(https?:|mailto:|tel:)/.test(href)) continue;
			expect(href, `unexpected link type on ${foundOn}`).toMatch(/^\//);
			const response = await page.request.get(href, { maxRedirects: 0 });
			if (response.status() !== 200) broken.push(`${href} (${response.status()}) on ${foundOn}`);
		}
		expect(broken).toEqual([]);
		expect(hrefs.size).toBeGreaterThan(PAGES.length);
	});

	test('links that open a new tab cannot control this page', async ({ page }) => {
		test.slow(); // visits all pages
		for (const info of PAGES) {
			await page.goto(info.path);
			for (const rel of await page
				.locator('a[target="_blank"]')
				.evaluateAll((links) => links.map((a) => a.getAttribute('rel') ?? ''))) {
				expect(rel).toMatch(/noopener|noreferrer/);
			}
		}
	});
});
