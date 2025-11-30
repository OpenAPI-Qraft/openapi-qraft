#!/usr/bin/env node
import type { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';
import { QraftCommand } from '@openapi-qraft/plugin';
import { RedoclyConfigCommand } from '@openapi-qraft/plugin/lib/RedoclyConfigCommand';
import { Option, ParseOptions } from 'commander';
import { builtInPlugins } from './builtInPlugins.js';
import { handleDeprecatedOptions } from './handleDeprecatedOptions.js';

export async function main(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const argv = handleDeprecatedOptions(processArgv);

  const redoclyConfigParseResult = await new RedoclyConfigCommand().parseConfig(
    qraft,
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
  const command = new QraftCommand();

  const { argv, plugins } = extractArgvPluginOptions(processArgv);

  if (plugins) {
    await setupPlugins(command, plugins);
  } else {
    // Default - set up the tanstack-query-react plugin
    await setupPlugins(command, [
      'tanstack-query-react',
    ] satisfies (keyof typeof builtInPlugins)[]);

    // Option to display help with all available plugins
    command.addOption(
      new Option(
        '--plugin <name_1> --plugin <name_2>',
        `Specifies which generator plugins should be used for code generation`
      )
        .choices(Object.keys(builtInPlugins))
        .argParser(() => {
          // Fallback handler for when plugin parsing fails
          throw new Error(
            'The plugin option must be processed before command parsing and should not be directly passed to the commander'
          );
        })
    );
  }

  await command.parseAsync(argv, processArgvParseOptions);
}

async function setupPlugins(command: QraftCommand, plugins: string[]) {
  const pluginList: QraftCommandPlugin[] = [];

  for (const pluginName of plugins) {
    if (!(pluginName in builtInPlugins))
      throw new Error(`Unknown plugin: '${pluginName}'`);

    pluginList.push(
      (await builtInPlugins[pluginName as keyof typeof builtInPlugins]())
        .default
    );

    addCommandUsageWithPlugins(command, plugins);
  }

  await Promise.all(pluginList.map((plugin) => plugin.setupCommand(command)));
  await Promise.all(
    pluginList.map((plugin) => plugin.postSetupCommand?.(command, plugins))
  );
}

/**
 * Adds plugin usage instructions by calling `command.usage(...)`
 */
function addCommandUsageWithPlugins(command: QraftCommand, plugins: string[]) {
  const pluginUsage = plugins.map((plugin) => `--plugin ${plugin}`).join(' ');
  command.usage(`${pluginUsage} [input] [options]`);
}

/**
 * Extracts multiple `--plugin <name>` options from `argv`
 * and returns both the filtered `argv` and the extracted plugins list.
 */
export function extractArgvPluginOptions(argv: string[]) {
  const pluginIndex = argv.indexOf('--plugin');
  if (pluginIndex === -1) return { argv };

  const filteredArgv: string[] = argv.slice(0, pluginIndex);
  const plugins: string[] = [];

  for (let i = pluginIndex; i < argv.length; i++) {
    if (argv[i] === '--plugin') {
      const pluginName = argv.at(i + 1);
      if (!pluginName)
        throw new Error(
          `A plugin name must be specified after the '--plugin' option`
        );
      if (pluginName?.startsWith('--'))
        throw new Error(
          `Invalid plugin name: '${pluginName}'. Plugin names cannot start with '--'`
        );
      plugins.push(pluginName);
      i++; // Skip next item
    } else {
      filteredArgv.push(argv[i]);
    }
  }

  return {
    argv: filteredArgv,
    plugins,
  };
}
