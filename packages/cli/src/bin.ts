#!/usr/bin/env node
import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';
import type { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';

import { Option } from 'commander';
import process from 'node:process';

import { builtInPlugins } from './builtInPlugins.js';

export async function main() {
  const command = new QraftCommand();

  const { argv, plugins } = extractArgvPluginOptions(process.argv);

  if (plugins) {
    await setupPlugins(command, plugins);
  } else {
    // default - setup tanstack-query-react plugin
    await setupPlugins(command, [
      'tanstack-query-react',
    ] satisfies (keyof typeof builtInPlugins)[]);

    // option to display help with all available plugins
    command.addOption(
      new Option(
        '--plugin <name_1> --plugin <name_2>',
        `Generator plugins to be used.`
      )
        .choices(Object.keys(builtInPlugins))
        .argParser(() => {
          // Fallback, if plugins parsing went wrong
          throw new Error(
            'Plugin option must be handled before parsing the command and should not be passed to the commander'
          );
        })
    );
  }

  return void (await command.parseAsync(argv));
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
 * Add plugin's usage instructions calling `command.usage(...)`
 */
function addCommandUsageWithPlugins(command: QraftCommand, plugins: string[]) {
  const pluginUsage = plugins.map((plugin) => `--plugin ${plugin}`).join(' ');
  command.usage(`${pluginUsage} [input] [options]`);
}

/**
 * Extracts multiple `--plugin <name>` options from the `argv`
 * and returns the filtered `argv` and the list of plugins.
 */
export function extractArgvPluginOptions(argv: string[]) {
  const pluginIndex = argv.indexOf('--plugin');
  if (pluginIndex === -1) return { argv };

  const filteredArgv: string[] = argv.slice(0, pluginIndex);
  const plugins: string[] = [];

  for (let i = pluginIndex; i < argv.length; i++) {
    if (argv[i] === '--plugin') {
      const pluginName = argv.at(i + 1);
      if (!pluginName) throw new Error(`Missing plugin name after '--plugin'`);
      if (pluginName?.startsWith('--'))
        throw new Error(`Invalid plugin name: '${pluginName}'`);
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
