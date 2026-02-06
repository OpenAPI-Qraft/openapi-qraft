import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Increased timeout is required because AsyncAPI schema parsing with @asyncapi/parser
    // is CPU-intensive and slow on CI runners (typically 2 vCPU GitHub Actions).
    // The first few tests pay the full cost of parser initialization (~4-5s on CI),
    // while subsequent tests benefit from internal caching (~600ms).
    // Default Vitest timeout (5000ms) is too tight for CI, causing flaky failures.
    testTimeout: 30_000,
  },
});
