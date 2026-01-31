import type { QraftCommand } from '@qraft/plugin';
import type { QraftCommandPlugin } from '@qraft/plugin/lib/QraftCommandPlugin';

export type BuiltInPlugins<T extends string = string> = Record<
  T,
  () => Promise<{ default: QraftCommandPlugin<QraftCommand<any>> }>
>;

export interface SetupPluginsOptions<T extends string> {
  command: QraftCommand<any>;
  plugins: T[];
  builtInPlugins: BuiltInPlugins<T>;
  addUsage?: (command: QraftCommand<any>, plugins: T[]) => void;
}

/**
 * Loads and configures plugins for a QraftCommand.
 * Validates plugin names against builtInPlugins, dynamically imports each plugin,
 * and calls setupCommand/postSetupCommand lifecycle methods.
 */
export async function setupPlugins<T extends string>({
  command,
  plugins,
  builtInPlugins,
  addUsage,
}: SetupPluginsOptions<T>): Promise<void> {
  const pluginList: QraftCommandPlugin<QraftCommand<any>>[] = [];

  for (const pluginName of plugins) {
    if (!(pluginName in builtInPlugins))
      throw new Error(`Unknown plugin: '${pluginName}'`);

    pluginList.push(
      (await builtInPlugins[pluginName as keyof typeof builtInPlugins]()).default
    );

    addUsage?.(command, plugins);
  }

  await Promise.all(pluginList.map((plugin) => plugin.setupCommand(command)));
  await Promise.all(
    pluginList.map((plugin) => plugin.postSetupCommand?.(command, plugins))
  );
}
