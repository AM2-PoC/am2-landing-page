import { test, expect } from './support/test.ts';
import { LOCALES, PAGES, headerLabels, localize, pageInfo } from './support/content.ts';

test.describe('language switch', () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test('opens the same page in Indonesian and back in English', async ({ page }) => {
		await page.goto('/platforms/am2-ptt');
		await page
			.getByRole('banner')
			.getByRole('link', { name: /Switch to Bahasa Indonesia/ })
			.click();

		await expect(page).toHaveURL('/id/platforms/am2-ptt');
		await expect(page.locator('html')).toHaveAttribute('lang', 'id');
		await expect(page).toHaveTitle(pageInfo('/platforms/am2-ptt').title.id);

		await page
			.getByRole('banner')
			.getByRole('link', { name: /Ganti ke English/ })
			.click();
		await expect(page).toHaveURL('/platforms/am2-ptt');
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	test('keeps the query string', async ({ page }) => {
		await page.goto('/about-us?ref=newsletter');
		await expect(
			page.getByRole('banner').getByRole('link', { name: /Switch to Bahasa Indonesia/ })
		).toHaveAttribute('href', '/id/about-us?ref=newsletter');
	});

	test('the menu is translated', async ({ page }) => {
		for (const locale of LOCALES) {
			await page.goto(localize('/', locale));
			const menu = page
				.getByRole('banner')
				.getByRole('navigation', { name: locale === 'en' ? 'Main navigation' : 'Navigasi utama' });
			for (const label of headerLabels(locale)) {
				await expect(menu.getByText(label, { exact: true }).first()).toBeVisible();
			}
		}
	});
});

test.describe('links stay in the chosen language', () => {
	for (const info of PAGES) {
		const url = localize(info.path, 'id');
		test(`${url}: every internal link (except the language switch) starts with /id`, async ({
			page
		}) => {
			await page.goto(url);
			const links = await page.locator('a[href^="/"]').evaluateAll((anchors) =>
				anchors.map((a) => ({
					href: a.getAttribute('href') ?? '',
					switcher: a.hasAttribute('hreflang')
				}))
			);
			expect(links.length).toBeGreaterThan(0);
			for (const { href, switcher } of links) {
				if (switcher) expect(href, 'language switch leads to English').not.toMatch(/^\/id(\/|$)/);
				else expect(href).toMatch(/^\/id(\/|$|\?|#)/);
			}
		});
	}
});

test.describe('no untranslated or raw texts', () => {
	// Message keys (error_code), ICU placeholders ({status}) and JavaScript leftovers must
	// never reach the visitor
	const RAW =
		/\b[a-z]+(?:_[a-z]+){1,}\b|\{[a-z_]+\}|\bundefined\b|\bnull\b|\bNaN\b|\[object Object\]/;

	for (const locale of LOCALES) {
		test(`all pages in ${locale.toUpperCase()}`, async ({ page }) => {
			test.slow(); // visits all pages
			for (const info of PAGES) {
				await page.goto(localize(info.path, locale));
				const text = await page.locator('body').innerText();
				expect(text, `${info.path}`).not.toMatch(RAW);
				const labels = await page
					.locator('[aria-label]')
					.evaluateAll((els) => els.map((el) => el.getAttribute('aria-label') ?? ''));
				for (const label of labels) expect(label, info.path).not.toMatch(RAW);
			}
		});
	}

	test('Indonesian pages use the Indonesian interface texts', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto('/id');
		await expect(page.getByRole('link', { name: 'Langsung ke konten utama' })).toBeAttached();
		await expect(page.getByRole('button', { name: 'Buka menu' })).toBeVisible();
	});
});
