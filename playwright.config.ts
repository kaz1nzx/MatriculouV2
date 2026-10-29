import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    viewport: { width: 1440, height: 980 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    // Every visit starts with the cookie choice already made, so the banner does not cover the page.
    // tests/legal.spec.ts clears it to exercise the banner itself.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:3000",
          localStorage: [
            {
              name: "matriculou-consent",
              value: JSON.stringify({
                version: 1,
                decidedAt: "2026-01-01T00:00:00.000Z",
                analytics: false,
                marketing: false,
              }),
            },
          ],
        },
      ],
    },
  },
  webServer: {
    command: "npm run dev -- --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 90000,
  },
});
