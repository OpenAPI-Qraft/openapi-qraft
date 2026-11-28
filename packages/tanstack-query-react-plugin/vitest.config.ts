import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['./dist/**'],
    // Increased timeout is required because cold dynamic imports, code generation,
    // and TypeScript compiler tests run in parallel on CI runners (typically 2 vCPU
    // GitHub Actions). Default Vitest limits (10000ms hook / 5000ms test) are too
    // tight under CI CPU load, causing flaky failures.
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
