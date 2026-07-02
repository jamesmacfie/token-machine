import { defineConfig } from 'vitest/config'

// Standalone config so vitest doesn't load vite.config.ts (Cloudflare plugin is
// incompatible with the test runner). Our tests are pure logic — no plugins needed.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
})
