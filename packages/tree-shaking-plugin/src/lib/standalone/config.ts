import type { QraftTreeShakeProjectConfig } from './project.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createJiti } from 'jiti';

export const defaultTransformQraftProjectConfigFiles = Object.freeze([
  'qraft-tree-shake.config.ts',
  'qraft-tree-shake.config.mts',
  'qraft-tree-shake.config.js',
  'qraft-tree-shake.config.mjs',
  'qraft-tree-shake.config.cjs',
  'qraft-tree-shake.config.cts',
]) satisfies readonly string[];

export async function findTransformQraftProjectConfig(
  root = process.cwd()
): Promise<string | null> {
  const resolvedRoot = path.resolve(root);

  for (const configFile of defaultTransformQraftProjectConfigFiles) {
    const configPath = path.join(resolvedRoot, configFile);

    try {
      await fs.access(configPath);
      return configPath;
    } catch {
      continue;
    }
  }

  return null;
}

export async function loadTransformQraftProjectConfig(
  configFile: string
): Promise<QraftTreeShakeProjectConfig> {
  const resolvedConfigFile = path.resolve(configFile);
  const jiti = createJiti(pathToFileURL(resolvedConfigFile).href);
  const loadedConfig = await jiti.import(resolvedConfigFile, {
    default: true,
  });

  return loadedConfig as QraftTreeShakeProjectConfig;
}
