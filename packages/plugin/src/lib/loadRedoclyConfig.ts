import { fileURLToPath, URL } from 'node:url';
import {
  Config,
  CONFIG_FILE_NAMES,
  findConfig,
  loadConfig,
} from '@redocly/openapi-core';
import { CommanderError } from 'commander';

/**
 * Loads Redocly config from the default config file:
 * 'redocly.yaml', 'redocly.yml', '.redocly.yaml', '.redocly.yml'
 */
export async function loadRedoclyConfig(
  configPath: null | undefined,
  cwd: URL
): Promise<Config>;
/**
 * Loads Redocly config from the specified path or from the default config file.
 */
export async function loadRedoclyConfig(
  configPath: string,
  cwd: URL
): Promise<Config>;
export async function loadRedoclyConfig(
  configPath: string | null | undefined,
  cwd: URL
): Promise<Config> {
  const normalizedConfigPath =
    typeof configPath === 'string'
      ? configPath
      : findConfig(fileURLToPath(cwd));

  if (!normalizedConfigPath) {
    throw new CommanderError(
      1,
      'INVALID_REDOCLY_CONFIG_PATH',
      typeof configPath === 'string'
        ? `Could not find Redocly config file at ${configPath}`
        : `Could not find Redocly config file in ${cwd}. Searched in: ${CONFIG_FILE_NAMES.join(', ')}`
    );
  }

  return await loadConfig({
    configPath: normalizedConfigPath,
  });
}
