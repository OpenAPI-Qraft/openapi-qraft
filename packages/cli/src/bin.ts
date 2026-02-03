#!/usr/bin/env node
import type { ParseOptions } from 'commander';
import {
  ASYNCAPI_QRAFT_REDOC_CONFIG_KEY,
  OPENAPI_QRAFT_REDOC_CONFIG_KEY,
} from '@qraft/plugin/lib/getRedocAPIsToQraft';
import {
  createRedoclyOption,
  RedoclyConfigCommand,
} from '@qraft/plugin/lib/RedoclyConfigCommand';
import c from 'ansi-colors';
import { Command } from 'commander';
import { packageVersion } from './packageVersion.js';

export async function main(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const program = new Command();

  program
    .name('qraft')
    .description(
      'Generate type-safe code from OpenAPI and AsyncAPI specifications'
    )
    // todo::maybe add "<bin> help <command>" handling
    .helpCommand(false)
    .version(packageVersion);

  program
    .command('openapi')
    .description('Generate code from OpenAPI specification')
    .allowUnknownOption()
    .allowExcessArguments()
    .action(async () => {
      const subcommandArgv = extractSubcommandArgv(processArgv, 'openapi');
      const { qraftOpenapi } = await import('./commands/openapi.js');
      await qraftOpenapi(subcommandArgv, processArgvParseOptions);
    })
    .helpOption(false); // The command handles the help independently

  program
    .command('asyncapi')
    .description('Generate code from AsyncAPI specification')
    .allowUnknownOption()
    .allowExcessArguments()
    .action(async () => {
      const subcommandArgv = extractSubcommandArgv(processArgv, 'asyncapi');
      const { qraftAsyncapi } = await import('./commands/asyncapi.js');
      await qraftAsyncapi(subcommandArgv, processArgvParseOptions);
    })
    .helpOption(false); // The command handles the help independently

  program
    .command('redocly')
    .description('Generate from Redocly config (both OpenAPI and AsyncAPI)')
    .argument(
      '[apis...]',
      'Selective API names from Redocly config to generate'
    )
    .addOption(createRedoclyOption())
    .action(async (apis: string[], options: { redocly: string | boolean }) => {
      const redoclyArgv = buildRedoclyArgv(apis, options.redocly);

      await new RedoclyConfigCommand().parseConfig(
        {
          [OPENAPI_QRAFT_REDOC_CONFIG_KEY]: async (argv, parseOptions) => {
            const { runOpenAPI } = await import('./commands/runOpenAPI.js');
            return runOpenAPI(argv, parseOptions);
          },
          [ASYNCAPI_QRAFT_REDOC_CONFIG_KEY]: async (argv, parseOptions) => {
            const { runAsyncAPI } = await import('./commands/runAsyncAPI.js');
            return runAsyncAPI(argv, parseOptions);
          },
        },
        redoclyArgv,
        { from: 'user' }
      );
    });

  program.addHelpText(
    'after',
    `
${c.bold('Examples:')}
  ${c.dim('# Generate React Query hooks from OpenAPI')}
  $ qraft openapi --plugin tanstack-query-react ./openapi.yaml -o ./src/api

  ${c.dim('# Generate TypeScript types from OpenAPI')}
  $ qraft openapi --plugin openapi-typescript ./openapi.yaml -o ./src/types

  ${c.dim('# Generate TypeScript types from AsyncAPI')}
  $ qraft asyncapi --plugin asyncapi-typescript ./asyncapi.yaml -o ./src/types

  ${c.dim('# Generate from Redocly config (both OpenAPI and AsyncAPI)')}
  $ qraft redocly

  ${c.dim('# Generate specific APIs from Redocly config')}
  $ qraft redocly openapi-main asyncapi-main

  ${c.dim('# Generate from custom Redocly config path')}
  $ qraft redocly --redocly ./custom-redocly.yaml
`
  );

  await program.parseAsync(processArgv, processArgvParseOptions);
}

function buildRedoclyArgv(
  apis: string[],
  redoclyConfig: string | boolean
): string[] {
  const argv: string[] = [...apis];

  if (typeof redoclyConfig === 'string') {
    argv.push('--redocly', redoclyConfig);
  } else if (redoclyConfig) {
    argv.push('--redocly');
  }

  return argv;
}

function extractSubcommandArgv(
  processArgv: string[],
  subcommand: string
): string[] {
  const subcommandIndex = processArgv.indexOf(subcommand);
  if (subcommandIndex === -1) return processArgv;

  return [
    ...processArgv.slice(0, 2),
    ...processArgv.slice(subcommandIndex + 1),
  ];
}
