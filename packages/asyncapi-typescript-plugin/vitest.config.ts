import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['./dist/**'],
    // @qraft/asyncapi-plugin bundles @asyncapi/parser into dist/_vendor and dist/_virtual
    // (~1000 ESM files / ~15 MB). Because those paths are outside node_modules, Vitest
    // otherwise transforms and evaluates all of them through Vite's module runner on the
    // first import, which can exceed 30s on 2-vCPU CI runners. Externalize only the
    // pre-bundled vendor/virtual directories so Node loads them natively while keeping
    // dist/lib/* and @qraft/plugin transformed for node:fs mocking.
    server: {
      deps: {
        external: [
          /[\\/]asyncapi-plugin[\\/]dist[\\/]_(?:vendor|virtual)[\\/]/,
        ],
      },
    },
    // Keep generous timeouts for shared 2-vCPU CI runners where Turbo runs package test
    // suites in parallel.
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
