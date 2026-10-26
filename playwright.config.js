import { defineConfig, devices } from '@playwright/test';

// End-to-end suite: the production build (vite build + vite preview) in
// Chromium, at the size the landing page embeds it (a 390x844 phone frame).
// Team logos and other outside hosts are stubbed in e2e/fixtures.js.
// E2E_SKIP_BUILD=1 reuses an existing dist/.

const PORT = 4400;
const build = process.env.E2E_SKIP_BUILD ? '' : 'npx vite build && ';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: 'embedded', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testMatch: /layout\.spec/ },
  ],
  webServer: {
    command: `${build}npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
