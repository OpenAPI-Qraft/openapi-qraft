export interface ExtractArgvPluginOptionsResult {
  argv: string[];
  plugins?: string[];
}

/**
 * Extracts multiple `--plugin <name>` options from `argv`
 * and returns both the filtered `argv` and the extracted plugins list.
 */
export function extractArgvPluginOptions(
  argv: string[]
): ExtractArgvPluginOptionsResult {
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
