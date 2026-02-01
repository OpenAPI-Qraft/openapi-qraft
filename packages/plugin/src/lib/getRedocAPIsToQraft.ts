import type { Config } from '@redocly/openapi-core';
import { isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CommanderError } from 'commander';
import { Ora } from 'ora';

export const OPENAPI_QRAFT_REDOC_CONFIG_KEY = 'x-openapi-qraft';
export const ASYNCAPI_QRAFT_REDOC_CONFIG_KEY = 'x-asyncapi-qraft';

export function getRedocAPIsToQraft(
  redoc: Config,
  cwd: URL,
  spinner: Ora,
  configKey: string = OPENAPI_QRAFT_REDOC_CONFIG_KEY,
  apiName?: string
) {
  const hasRedoclyApis = Object.keys(redoc?.apis ?? {}).length > 0;
  if (!hasRedoclyApis) {
    throw new CommanderError(
      1,
      'ERR_MISSING_APIS',
      'No "apis" found in Redocly config. Please specify the APIs to be generated.'
    );
  }
  if (!redoc.configFile) {
    throw new CommanderError(
      1,
      'ERR_MISSING_CONFIG_FILE',
      'No "configFile" found in Redocly config. Please specify the path to the Redocly config file.'
    );
  }

  const configRoot = isAbsolute(redoc.configFile)
    ? new URL(pathToFileURL(redoc.configFile))
    : new URL(redoc.configFile, cwd);

  const apisToQraftEntries = Object.entries(redoc.apis)
    .map(([itemPpiName, api]) => {
      if (apiName && apiName !== itemPpiName) return;

      const qraftConfig =
        configKey in api
          ? (api as Record<string, unknown>)[configKey]
          : undefined;

      if (!qraftConfig) {
        return void spinner.warn(
          `API ${itemPpiName} is missing an \`${configKey}\` key. Skipping...`
        );
      }

      if (typeof qraftConfig !== 'object') {
        throw new CommanderError(
          1,
          'ERR_MISSING_API_CONFIG',
          `API ${itemPpiName} is missing an \`${configKey}\` key. See https://openapi-qraft.github.io/openapi-qraft/docs/codegen/CLI/redocly-config.`
        );
      }

      const {
        o,
        ['output-dir']: outputPath = o,
        ...qraftConfigRest
      } = qraftConfig as {
        ['output-dir']?: string;
        o?: string;
      };

      if (!outputPath) {
        throw new CommanderError(
          1,
          'ERR_MISSING_API_OUTPUT',
          `API ${itemPpiName} is missing an "output-dir" key. See https://openapi-qraft.github.io/openapi-qraft/docs/codegen/CLI/redocly-config.`
        );
      }

      return [
        itemPpiName,
        {
          ...api,
          [configKey]: {
            ...qraftConfigRest,
            ['output-dir']: fileURLToPath(new URL(outputPath, configRoot)),
          },
        },
      ] as const;
    })
    .filter((api) => !!api);

  return Object.fromEntries(apisToQraftEntries);
}
