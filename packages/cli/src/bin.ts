#!/usr/bin/env node
import { QraftCommand } from './lib/QraftCommand.js';

const command = new QraftCommand();

const { argv, plugins } = extractArgvPluginOptions(process.argv); // todo::move parsing to the QraftCommand `parse` method

if (plugins) {
  if (plugins?.includes('tanstack-query-react')) {
    import('./generators/tanstack-query-react/plugin.js').then(
      ({ default: plugin }) => {
        plugin.setupCommand(command);
        addCommandUsageWithPlugins(command, plugins);
        command.parse(argv);
      }
    );
  } else {
    throw new Error(`Unknown plugin: '${plugins.join(', ')}'`);
  }
} else {
  // default - setup tanstack-query-react plugin
  import('./generators/tanstack-query-react/plugin.js').then(
    ({ default: plugin }) => {
      plugin.setupCommand(command);
      command.option('--plugin <name>', 'Client generator plugin name', () => {
        throw new Error(
          'Plugin option must be handled before parsing the command and should not be passed to the commander'
        );
      });
      command.parse(argv);
    }
  );
}

function addCommandUsageWithPlugins(command: QraftCommand, plugins: string[]) {
  const pluginUsage = plugins.map((plugin) => `--plugin ${plugin}`).join(' ');
  command.usage(`${pluginUsage} [input] [options]`);
}

function extractArgvPluginOptions(argv: string[]) {
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

  if (plugins.length > 1)
    throw new Error(
      `Only one plugin can be specified, got: '${plugins.join(', ')}'`
    );

  return {
    argv: filteredArgv,
    plugins,
  };
}
