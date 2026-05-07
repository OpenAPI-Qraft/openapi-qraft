import { resolve } from 'node:path';
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import { qraftTreeShakeEsbuild } from '@openapi-qraft/tree-shaking-plugin/esbuild';
import { build } from 'esbuild';
import {
  apiClient,
  createAPIClientFn,
  getBundlerOutputDir,
  getScenario,
  isExternalModuleRequest,
} from './shared.mjs';

const scenario = getScenario(process.env.QRAFT_TREE_SHAKE_SCENARIO ?? '');

await build({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  entryPoints: {
    [scenario.name]: resolve(process.cwd(), scenario.entry),
  },
  outdir: getBundlerOutputDir('esbuild', scenario),
  format: 'esm',
  bundle: true,
  minify: false,
  sourcemap: false,
  target: 'es2020',
  splitting: true,
  platform: 'browser',
  entryNames: '[name]',
  chunkNames: 'chunks/[name]',
  assetNames: 'assets/[name][ext]',
  plugins: [
    TsconfigPathsPlugin({ tsconfig: resolve(process.cwd(), 'tsconfig.json') }),
    qraftTreeShakeEsbuild({
      createAPIClientFn,
      apiClient,
    }),
    {
      name: 'external-dependencies',
      setup(build) {
        build.onResolve({ filter: /.*/ }, (args) => {
          if (!isExternalModuleRequest(args.path)) {
            return null;
          }

          return {
            path: args.path,
            external: true,
          };
        });
      },
    },
  ],
});
