#!/usr/bin/env node
import type { ParseOptions } from 'commander';
import c from 'ansi-colors';
import { Command } from 'commander';
import { packageVersion } from './packageVersion.js';

export async function main(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const redoclyResults = await processRedoclyConfig(
    processArgv,
    processArgvParseOptions
  );
  if (redoclyResults?.length) return;

  const program = new Command();

  program
    .name('qraft')
    .description(
      'Generate type-safe code from OpenAPI and AsyncAPI specifications'
    )
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
  $ qraft --redocly
`
  );

  await program.parseAsync(processArgv, processArgvParseOptions);
}

async function processRedoclyConfig(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
): Promise<unknown[] | undefined> {
  const {
    RedoclyConfigCommand,
    OPENAPI_QRAFT_REDOC_CONFIG_KEY,
    ASYNCAPI_QRAFT_REDOC_CONFIG_KEY,
  } = await import('@qraft/plugin/lib/RedoclyConfigCommand');

  const { qraftOpenapi } = await import('./commands/openapi.js');
  const { qraftAsyncapi } = await import('./commands/asyncapi.js');

  const openapiResults = await new RedoclyConfigCommand(undefined, {
    configKey: OPENAPI_QRAFT_REDOC_CONFIG_KEY,
  }).parseConfig(qraftOpenapi, processArgv, processArgvParseOptions);

  const asyncapiResults = await new RedoclyConfigCommand(undefined, {
    configKey: ASYNCAPI_QRAFT_REDOC_CONFIG_KEY,
  }).parseConfig(qraftAsyncapi, processArgv, processArgvParseOptions);

  const allResults = [...(openapiResults ?? []), ...(asyncapiResults ?? [])];
  return allResults.length ? allResults : undefined;
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
