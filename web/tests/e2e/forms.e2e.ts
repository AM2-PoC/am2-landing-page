import { test, expect } from './support/test.ts';
import { LOCALES, PAGES, localize, pageInfo } from './support/content.ts';

test.describe('Contact Sales', () => {
	for (const locale of LOCALES) {
		test(`every "Contact Sales" call to action leads to the page (${locale})`, async ({ page }) => {
			const target = localize('/contact-sales', locale);
			await page.goto(localize('/', locale));
			const links = page.locator(`main a[href="${target}"]`);
			expect(await links.count()).toBeGreaterThan(0);

			await links.first().click();
			await expect(page).toHaveURL(target);
			await expect(page).toHaveTitle(pageInfo('/contact-sales').title[locale]);
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		});
	}

	// Audit H-2: the contact form (Fase 9) is not built yet, so a visitor can't send a request.
	// These tests describe the required behaviour and switch on (remove .fixme) with the form.
	test.describe('form (Fase 9, not built yet)', () => {
		test.fixme('required fields are validated in the browser and on the server', async () => {});
		test.fixme('a work email and a phone number are checked on the server', async () => {});
		test.fixme('errors are announced next to the field and focus moves to the first one', async () => {});
		test.fixme('HTML/script in the fields is stored and shown as plain text (XSS)', async () => {});
		test.fixme('repeated submissions are rate-limited and protected against bots', async () => {});
	});
});

test.describe('no unprotected forms', () => {
	// Until the contact form exists the website has no form at all; any form that appears
	// must post to this site (CSP form-action 'self' blocks everything else)
	test('pages contain no forms that post to another site', async ({ page, baseURL }) => {
		test.slow(); // visits all pages
		for (const info of PAGES) {
			await page.goto(info.path);
			for (const action of await page
				.locator('form')
				.evaluateAll((forms) => forms.map((f) => (f as HTMLFormElement).action))) {
				expect(new URL(action).origin).toBe(new URL(baseURL!).origin);
			}
		}
	});
});
