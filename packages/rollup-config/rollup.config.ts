import fs from 'node:fs';
import { dirname, extname } from 'node:path';
import { OutputOptions, RollupOptions } from 'rollup';
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
