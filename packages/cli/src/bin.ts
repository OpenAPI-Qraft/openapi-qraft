#!/usr/bin/env node
import type { ParseOptions } from 'commander';
import c from 'ansi-colors';
import { Command } from 'commander';

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
    .helpOption(false)
    .version('1.0.0');

  program
    .command('openapi')
    .description('Generate code from OpenAPI specification')
    .allowUnknownOption()
    .allowExcessArguments()
    .action(async () => {
      const subcommandArgv = extractSubcommandArgv(processArgv, 'openapi');
      const { qraftOpenapi } = await import('./commands/openapi.js');
      await qraftOpenapi(subcommandArgv, processArgvParseOptions);
    });

  program
    .command('asyncapi')
    .description('Generate code from AsyncAPI specification')
    .allowUnknownOption()
    .allowExcessArguments()
    .action(async () => {
      const subcommandArgv = extractSubcommandArgv(processArgv, 'asyncapi');
      const { qraftAsyncapi } = await import('./commands/asyncapi.js');
      await qraftAsyncapi(subcommandArgv, processArgvParseOptions);
    });

  program.addHelpText(
    'after',
    `
${c.bold('Examples:')}
  ${c.dim('# Generate React Query hooks from OpenAPI')}
  $ qraft openapi ./openapi.yaml -o ./src/api

  ${c.dim('# Generate TypeScript types from OpenAPI')}
  $ qraft openapi --plugin openapi-typescript ./openapi.yaml -o ./src/types

  ${c.dim('# Generate TypeScript types from AsyncAPI')}
  $ qraft asyncapi --plugin asyncapi-typescript ./asyncapi.yaml -o ./src/types
`
  );

  await program.parseAsync(processArgv, processArgvParseOptions);
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
