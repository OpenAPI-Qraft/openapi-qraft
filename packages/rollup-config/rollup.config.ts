import fs from 'node:fs';
import { dirname, extname } from 'node:path';
import type { OutputOptions, Plugin, RollupLog, RollupOptions } from 'rollup';
import { swc } from 'rollup-plugin-swc3';
import preserveDirectives from 'rollup-preserve-directives';

type Options = {
  input: string;
  swc?: Parameters<typeof swc>[0];
};

/**
 * Rollup configuration for building CommonJS and ESM modules with Next.js Server Components support.
 * It uses SWC for transpiling TypeScript and JavaScript files
 * and `preserveDirectives()` to keep the `use server` and `use client` directives.
 * If cyclic cross-chunk reexport is detected, it will throw an error on build, but warn on watch mode.
 *
 * @param exports - The output file paths for CommonJS and ESM modules
 * @param exports.require - The index ‼️ file path for CommonJS module, e.g.: `dist/index.cjs` for ESM module, or `dist/index.js` for CommonJS module.
 * @param exports.import - The index ‼️ file path for ESM module, e.g.: `dist/index.js` for ESM module, or `dist/index.mjs` for CommonJS module.
 * @param options.input - The input file path, e.g.: `src/index.ts`, `src/callbacks/index.ts`
 * @param options.swc - The options for the SWC plugin
 * @param options
 */
export const rollupConfig = (
  exports: { require: string; import: string },
  options: Options
): RollupOptions => {
  const tsconfig = fs.existsSync('tsconfig.build.json')
    ? 'tsconfig.build.json'
    : 'tsconfig.json';

  // Inspired by https://github.com/mryechkin/rollup-library-starter/blob/main/rollup.config.mjs
  return {
    input: options.input,
    output: [
      {
        dir: dirname(exports.require),
        format: 'commonjs',
        sourcemap: true,
        interop: 'auto',
        exports: 'named',
        preserveModules: true,
        entryFileNames: `[name]${extname(exports.require)}`,
      } satisfies OutputOptions,
      {
        dir: dirname(exports.import),
        format: 'esm',
        sourcemap: true,
        interop: 'auto',
        exports: 'named',
        preserveModules: true,
        entryFileNames: `[name]${extname(exports.import)}`,
      } satisfies OutputOptions,
    ].filter((output): output is NonNullable<typeof output> => Boolean(output)),
    plugins: [
      swc(
        options?.swc
          ? options.swc
          : {
              tsconfig,
              swcrc: true,
              sourceMaps: true,
            }
      ),
      preserveDirectives(),
      errorOnCyclicCrossChunkReexport(),
    ],
    onwarn(warning, warn) {
      if (!warning.message.includes('"/*#__PURE__*/"')) {
        warn(warning);
      }
    },
    treeshake: {
      preset: 'recommended',
      moduleSideEffects: false,
    },
    watch: {
      chokidar: {
        usePolling: true,
        useFsEvents: false,
        interval: 500,
      },
      exclude: 'node_modules/**',
    },
  };
};

function errorOnCyclicCrossChunkReexport(): Plugin {
  const warnLog: RollupLog[] = [];

  return {
    name: 'error-on-cyclic-cross-chunk-reexport',
    onLog: {
      order: 'post',
      handler(level, log) {
        if (
          log.code === 'CYCLIC_CROSS_CHUNK_REEXPORT' &&
          log.message.includes('output.preserveModules')
        ) {
          warnLog.push(log);
        }
      },
    },
    writeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        if (!warnLog.length || this.meta.watchMode) return;

        this.error(
          "Fatal: detected cyclic cross-chunk reexport with 'output.preserveModules'. " +
            'Check the logs and fix the dependencies.'
        );
      },
    },
  };
}
