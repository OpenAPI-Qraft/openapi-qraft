#!/usr/bin/env node
import { createCommand } from 'commander';

import { QraftCommand } from './bin.js';

const program = createCommand();

const { argv, plugins } = extractArgvPluginOptions(process.argv);

if (plugins) {
  if (plugins?.includes('tanstack-query-react')) {
    import('./generators/tanstack-query-react/plugin.js').then(
      ({ default: plugin }) => {
        const command = new QraftCommand();
        plugin.setupCommand(command);
        program.addCommand(command).parse(argv);
      }
    );
  } else {
    throw new Error(`Unknown plugin: ${plugins.join(', ')}`);
  }
} else {
  // default - setup tanstack-query-react plugin
  import('./generators/tanstack-query-react/plugin.js').then(
    ({ default: plugin }) => {
      const command = new QraftCommand();
      plugin.setupCommand(command);
      program.addCommand(command, { isDefault: true }).parse(argv);
    }
  );
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

  return {
    argv: filteredArgv,
    plugins,
  };
}
