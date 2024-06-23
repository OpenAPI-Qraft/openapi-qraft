import fs from 'node:fs';
import { dirname, extname } from 'node:path';
import { OutputOptions, RollupLog, RollupOptions, Plugin } from 'rollup';
import { swc } from 'rollup-plugin-swc3';
import preserveDirectives from 'rollup-preserve-directives';

type Options = {
  swc?: Parameters<typeof swc>[0];
};

export const rollupConfig = (
  packageJson: { main?: string; module?: string },
  options?: Options
): RollupOptions[] => {
  const tsconfig = fs.existsSync('tsconfig.build.json')
    ? 'tsconfig.build.json'
    : 'tsconfig.json';

  // Inspired by https://github.com/mryechkin/rollup-library-starter/blob/main/rollup.config.mjs
  return [
    {
      input: 'src/index.ts',
      output: [
        packageJson.main
          ? ({
              dir: dirname(packageJson.main),
              format: 'commonjs',
              sourcemap: true,
              interop: 'auto',
              exports: 'named',
              preserveModules: true,
              entryFileNames: `[name]${extname(packageJson.main)}`,
            } satisfies OutputOptions)
          : null,
        packageJson.module
          ? ({
              dir: dirname(packageJson.module),
              format: 'esm',
              sourcemap: true,
              interop: 'auto',
              exports: 'named',
              preserveModules: true,
              entryFileNames: `[name]${extname(packageJson.module)}`,
            } satisfies OutputOptions)
          : null,
      ].filter((output): output is NonNullable<typeof output> =>
        Boolean(output)
      ),
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
    } satisfies RollupOptions,
  ];
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
