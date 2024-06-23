import { defineConfig, Options } from 'tsup';

// See [Clerk's `tsup.config.ts`](https://github.com/clerk/javascript/blob/757be5c0bfb62d9cb8402604a6876dc717099548/packages/nextjs/tsup.config.ts)

const tsupBaseOptions: Options = {
  entry: ['src/**/*.{ts,tsx}', '!src/tests/**/*', '!src/**/*.test.{ts,tsx}'],
  // We want to preserve the original file structure
  // so that the "use client" directives are not lost
  // and make debugging easier via node_modules easier
  target: ['chrome91', 'firefox90', 'edge91', 'safari15', 'ios15', 'opera77'],
  tsconfig: 'tsconfig.build.json',
  dts: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  minify: false,
  outExtension: () => ({ js: '.js' }),
};

export default defineConfig([
  {
    format: 'esm',
    outDir: 'dist/esm',
    ...tsupBaseOptions,
  },
  {
    format: 'cjs',
    outDir: 'dist/cjs',
    ...tsupBaseOptions,
  },
]);
