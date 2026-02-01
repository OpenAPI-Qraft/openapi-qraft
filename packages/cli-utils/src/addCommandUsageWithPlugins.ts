import type { QraftCommand } from '@qraft/plugin';

/**
 * Adds plugin usage instructions by calling `command.usage(...)`
 */
export function addCommandUsageWithPlugins(
  command: QraftCommand<any>,
  plugins: string[]
): void {
  const pluginUsage = plugins.map((plugin) => `--plugin ${plugin}`).join(' ');
  command.usage(`${pluginUsage} [input] [options]`);
}
