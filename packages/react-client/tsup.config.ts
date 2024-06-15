import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import { defineConfig, Options } from 'tsup';

// See TanStack https://github.com/TanStack/query/blob/main/scripts/getTsupConfig.js

const tsupBaseOptions: Options = {
  entry: ['src/index.ts'],
  target: ['chrome91', 'firefox90', 'edge91', 'safari15', 'ios15', 'opera77'],
  tsconfig: 'tsconfig.build.json',
  dts: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: '"use client";',
  },
  esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
};

export default defineConfig([
  {
    format: ['esm'],
    outDir: 'dist/esm',
    ...tsupBaseOptions,
  },
  {
    format: ['cjs'],
    outDir: 'dist/cjs',
    ...tsupBaseOptions,
  },
]);
