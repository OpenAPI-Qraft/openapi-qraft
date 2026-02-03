import type { OutputOptions, Plugin, RollupLog, RollupOptions } from 'rollup';
import fs from 'node:fs';
import { dirname, extname } from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import { swc } from 'rollup-plugin-swc3';
import preserveDirectives from 'rollup-preserve-directives';

type Options = {
  input: string;
  swc?: Parameters<typeof swc>[0];
  /** Dependencies to keep external (everything else will be bundled when this is set) */
  externalDependencies?: string[];
  /** Generate only ESM output (skip CommonJS) */
  esmOnly?: boolean;
};

/**
 * Rollup configuration for building CommonJS and ESM modules with Next.js Server Components support.
 * It uses SWC for transpiling TypeScript and JavaScript files
 * and `preserveDirectives()` to keep the `use server` and `use client` directives.
 * If cyclic cross-chunk reexport is detected, it will throw an error on build, but warn on watch mode.
 *
 * @param exports - The output file paths for CommonJS and ESM modules
 * @param exports.require - The index ‼️ file path for CommonJS module, e.g.: `dist/index.cjs` for ESM module, or `dist/index.js` for CommonJS module. Optional when `esmOnly` is true.
 * @param exports.import - The index ‼️ file path for ESM module, e.g.: `dist/index.js` for ESM module, or `dist/index.mjs` for CommonJS module.
 * @param options.input - The input file path, e.g.: `src/index.ts`, `src/callbacks/index.ts`
 * @param options.swc - The options for the SWC plugin
 * @param options.externalDependencies - Dependencies to keep external (everything else will be bundled when this is set)
 * @param options.esmOnly - Generate only ESM output (skip CommonJS)
 * @param options
 */
export const rollupConfig = (
  exports: { require?: string; import: string },
  options: Options
): RollupOptions => {
  const tsconfig = fs.existsSync('tsconfig.build.json')
    ? 'tsconfig.build.json'
    : 'tsconfig.json';

  const cjsOutput: OutputOptions | null =
    !options.esmOnly && exports.require
      ? {
          dir: dirname(exports.require),
          format: 'commonjs',
          sourcemap: true,
          interop: 'auto',
          exports: 'named',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: `[name]${extname(exports.require)}`,
        }
      : null;

  const esmOutput: OutputOptions = {
    dir: dirname(exports.import),
    format: 'esm',
    sourcemap: true,
    interop: 'auto',
    exports: 'named',
    preserveModules: true,
    preserveModulesRoot: 'src',
    entryFileNames: `[name]${extname(exports.import)}`,
  };

  const hasExternalDependencies = Boolean(options.externalDependencies?.length);

  // Inspired by https://github.com/mryechkin/rollup-library-starter/blob/main/rollup.config.mjs
  return {
    input: options.input,
    output: [cjsOutput, esmOutput].filter(
      (output): output is NonNullable<typeof output> => Boolean(output)
    ),
    external: hasExternalDependencies
      ? (id, importer) => {
          if (!importer || id.startsWith('\0')) {
            return undefined;
          }
          if (id.startsWith('.') || id.startsWith('/')) {
            return undefined;
          }
          for (const dep of options.externalDependencies!) {
            if (id === dep || id.startsWith(dep + '/')) {
              return true;
            }
          }
          return false;
        }
      : undefined,
    plugins: [
      hasExternalDependencies && nodeResolve(),
      hasExternalDependencies && json(),
      hasExternalDependencies && commonjs(),
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
    ].filter(Boolean),
    onwarn(warning, warn) {
      // Ignore SWC's comments
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

/**
 * Prevents cyclic cross-chunk reexport errors.
 * Fails on build but warns on watch mode.
 */
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
