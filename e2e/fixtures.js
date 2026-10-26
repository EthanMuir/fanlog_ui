// Every outside host is stubbed (team logos get a blank PNG), and a test fails
// if the page throws or logs a React error.
import { test as base, expect } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https?:\/\/(?!localhost[:/]|127\.0\.0\.1[:/])/, (route) =>
      route.request().resourceType() === 'image'
        ? route.fulfill({ status: 200, contentType: 'image/png', body: PNG })
        : route.abort()
    );
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text());
    });
    await use(page);
    expect(errors, 'errors in the page').toEqual([]);
  },
});

export { expect };

// The bottom tab bar
export const tab = (page, name) => page.locator('button', { has: page.locator(`span:text-is("${name}")`) });
