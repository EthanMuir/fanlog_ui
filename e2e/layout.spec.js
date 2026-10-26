import { expect, test } from './fixtures.js';

test('fits its frame without scrolling the page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Matchday Updates')).toBeVisible();
  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(overflow.x).toBeLessThanOrEqual(0);
});
