import { resolve } from 'node:path';
import { qraftTreeShakeVite } from '@openapi-qraft/tree-shaking-plugin/vite';
import { defineConfig } from 'vite';
import { getTreeShakePluginOptions } from './scripts/module-access-fixtures.mjs';
import { getScenario } from './scripts/scenarios.mjs';
import {
  getBundlerOutputDir,
  isExternalModuleRequest,
} from './scripts/shared.mjs';

export default defineConfig(({ mode }) => {
  const scenario = getScenario(mode);

  return {
    plugins: [
      qraftTreeShakeVite(getTreeShakePluginOptions(scenario)),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      emptyOutDir: true,
      minify: false,
      sourcemap: true,
      target: 'es2020',
      outDir: getBundlerOutputDir('vite', scenario),
      rollupOptions: {
        input: {
          [scenario.name]: resolve(process.cwd(), scenario.entry),
        },
        external: isExternalModuleRequest,
        output: {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  };
});
