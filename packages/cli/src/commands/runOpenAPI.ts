import {
  addCommandUsageWithPlugins,
  createFileHeader,
  extractArgvPluginOptions,
  hasHelpOption,
  setupPlugins,
} from '@qraft/cli-utils';
import { Option, ParseOptions } from 'commander';
import { openApiBuiltInPlugins } from '../builtInPlugins.js';

export async function runOpenAPI(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const { QraftCommand } = await import('@openapi-qraft/plugin');

  const command = new QraftCommand('qraft openapi', {
    defaultFileHeader: createFileHeader('@qraft/cli'),
  });

  const { argv, plugins } = extractArgvPluginOptions(processArgv);

  if (plugins) {
    await setupPlugins({
      command,
      plugins,
      builtInPlugins: openApiBuiltInPlugins,
      addUsage: addCommandUsageWithPlugins,
    });
  } else {
    command.addOption(
      new Option(
        '--plugin <name_1> --plugin <name_2>',
        `Specifies which generator plugins should be used for code generation`
      )
        .choices(Object.keys(openApiBuiltInPlugins))
        .argParser(() => {
          throw new Error(
            'The plugin option must be processed before command parsing and should not be directly passed to the commander'
          );
        })
    );

    if (!hasHelpOption(argv)) {
      throw new Error(
        `Plugin must be explicitly specified for openapi command. Available plugins: ${Object.keys(openApiBuiltInPlugins).join(', ')}`
      );
    }
  }

  await command.parseAsync(argv, processArgvParseOptions);
}
