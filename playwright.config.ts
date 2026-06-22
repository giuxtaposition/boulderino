import { defineConfig, devices } from '@playwright/test';

const PORT = 8081;
const BASE_URL = `http://localhost:${PORT}`;
const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `pnpm exec expo start --web --port ${PORT}`,
    url: BASE_URL,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        ...(CHROMIUM_PATH
          ? { launchOptions: { executablePath: CHROMIUM_PATH } }
          : {}),
      },
    },
  ],
});
