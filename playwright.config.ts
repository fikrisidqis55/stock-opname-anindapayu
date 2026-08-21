import { defineConfig } from '@playwright/test';

// Port 3001: 3000 dipakai proyek lain di mesin ini.
const PORT = 3001;
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  use: {
    baseURL: BASE,
    headless: true,
  },
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `${BASE}/login`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
