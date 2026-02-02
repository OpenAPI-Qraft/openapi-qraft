#!/usr/bin/env node
import type { ParseOptions } from 'commander';
import { QraftCommand } from '@openapi-qraft/plugin';
import {
  addCommandUsageWithPlugins,
  createFileHeader,
  extractArgvPluginOptions,
  setupPlugins,
} from '@qraft/cli-utils';
import {
  OPENAPI_QRAFT_REDOC_CONFIG_KEY,
  RedoclyConfigCommand,
} from '@qraft/plugin/lib/RedoclyConfigCommand';
import { Option } from 'commander';
import { builtInPlugins } from './builtInPlugins.js';
import { handleDeprecatedOptions } from './handleDeprecatedOptions.js';

export async function main(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const argv = handleDeprecatedOptions(processArgv);

  const redoclyConfigParseResult = await new RedoclyConfigCommand().parseConfig(
    { [OPENAPI_QRAFT_REDOC_CONFIG_KEY]: qraft },
    argv,
    processArgvParseOptions
  );

  if (redoclyConfigParseResult?.length) return;

  await qraft(argv, processArgvParseOptions);
}

async function qraft(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const command = new QraftCommand(undefined, {
    defaultFileHeader: createFileHeader('@openapi-qraft/cli'),
  });

  const { argv, plugins } = extractArgvPluginOptions(processArgv);

  if (plugins) {
    await setupPlugins({
      command,
      plugins,
      builtInPlugins,
      addUsage: addCommandUsageWithPlugins,
    });
  } else {
    await setupPlugins({
      command,
      plugins: [
        'tanstack-query-react',
      ] satisfies (keyof typeof builtInPlugins)[],
      builtInPlugins,
      addUsage: addCommandUsageWithPlugins,
    });

    command.addOption(
      new Option(
        '--plugin <name_1> --plugin <name_2>',
        `Specifies which generator plugins should be used for code generation`
      )
        .choices(Object.keys(builtInPlugins))
        .argParser(() => {
          throw new Error(
            'The plugin option must be processed before command parsing and should not be directly passed to the commander'
          );
        })
    );
  }

  await command.parseAsync(argv, processArgvParseOptions);
}
