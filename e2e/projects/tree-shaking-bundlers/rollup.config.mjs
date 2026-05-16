import { resolve } from 'node:path';
import { qraftTreeShakeRollup } from '@openapi-qraft/tree-shaking-plugin/rollup';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import {
  entrypoints,
  getBundlerOutputDir,
  getScenario,
  isExternalModuleRequest,
} from './scripts/shared.mjs';

const scenario = getScenario(process.env.QRAFT_TREE_SHAKE_SCENARIO ?? '');

export default {
  plugins: [
    alias({
      entries: [
        {
          find: /^@\//,
          replacement: `${resolve(process.cwd(), 'src')}/`,
        },
      ],
      customResolver: nodeResolve({
        extensions: ['.ts', '.tsx', '.mts', '.cts', '.mjs', '.js'],
      }),
    }),
    qraftTreeShakeRollup({
      entrypoints,
    }),
    esbuild({
      include: /\.[cm]?[jt]sx?$/,
      sourceMap: true,
      minify: false,
      target: 'es2020',
    }),
  ],
  input: resolve(process.cwd(), scenario.entry),
  external: isExternalModuleRequest,
  output: {
    dir: getBundlerOutputDir('rollup', scenario),
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name].js',
    assetFileNames: 'assets/[name][extname]',
  },
  treeshake: true,
};
