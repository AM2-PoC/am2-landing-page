import { test, expect } from './support/test.ts';

const replacement = '/platforms/am2-ptt-command-center';

for (const { source, target } of [
	{ source: '/platforms/am2-ptt?ref=legacy', target: `${replacement}?ref=legacy` },
	{
		source: '/id/platforms/am2-command-center?ref=legacy',
		target: `/id${replacement}?ref=legacy`
	}
]) {
	test(`permanently redirects ${source} to the combined platform page`, async ({ request }) => {
		const response = await request.get(source, { maxRedirects: 0 });

		expect(response.status()).toBe(301);
		expect(response.headers()['location']).toBe(target);
	});
}

test('both product pages link back to the combined platform page', async ({ page }) => {
	for (const path of ['/products/am2-ptt', '/products/am2-command-center']) {
		await page.goto(path);
		const links = page.getByRole('link', { name: 'Explore the Platform' });
		expect(await links.count(), `${path} platform links`).toBeGreaterThan(0);
		for (let index = 0; index < (await links.count()); index++) {
			await expect(links.nth(index)).toHaveAttribute('href', replacement);
		}
	}
});
