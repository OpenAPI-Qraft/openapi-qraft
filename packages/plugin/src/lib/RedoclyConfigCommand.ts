import { relative } from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';
import { CONFIG_FILE_NAMES } from '@redocly/openapi-core';
import c from 'ansi-colors';
import { Command, CommanderError, Option, ParseOptions } from 'commander';
import {
  ASYNCAPI_QRAFT_REDOC_CONFIG_KEY,
  getRedocAPIsToQraft,
  OPENAPI_QRAFT_REDOC_CONFIG_KEY,
} from './getRedocAPIsToQraft.js';
import { loadRedoclyConfig } from './loadRedoclyConfig.js';
import { maybeEscapeShellArg } from './maybeEscapeShellArg.js';
import { parseConfigToArgs } from './parseConfigToArgs.js';
import { QraftCommand } from './QraftCommand.js';

export { ASYNCAPI_QRAFT_REDOC_CONFIG_KEY, OPENAPI_QRAFT_REDOC_CONFIG_KEY };

export const redoclyOption = createRedoclyOption();

export function createRedoclyOption() {
  const bin = c.gray.underline('bin');
  const __redocly = c.yellow('--redocly');

  const examples = [
    `${bin} ${__redocly}`,
    `${bin} ${c.green('my-api')} ${__redocly}`,
    `${bin} ${c.green('my-api@v1 my-api@v2')} ${__redocly}`,
    `${bin} ${__redocly} ${c.yellow.underline('./my-redocly-config.yaml')}`,
  ].map((example) => `${c.italic.yellow(example)}`);

  return new Option(
    '--redocly [config]',
    [
      c.bold(`Use the Redocly configuration to generate multiple API clients`),
      `If the [config] parameter is not specified, the default Redocly configuration will be used: [${CONFIG_FILE_NAMES.join(' | ')}].`,
      `For more information about this option, use the command: ${c.yellow.italic('--redocly-help')}`,
      `${c.underline('Examples:')}`,
      ...examples.map((example) => `${c.gray('$')} ${example}`),
    ].join('\n')
  );
}

export type ConfigKeyCallbacks<T> = {
  [configKey: string]: CallbackFn<T>;
};

export class RedoclyConfigCommand extends Command {
  protected readonly cwd: URL;
  protected configKeys: string[] = [];

  /**
   * Redocly API grouped by configKey
   * { [configKey]: { [apiName]: argv[] } }
   */
  protected parsedAPIsByConfigKey: RedoclyQraftAPIsByConfigKey = {};

  constructor(name?: string) {
    super(name);
    this.cwd = pathToFileURL(`${process.cwd()}/`);

    this.usage(c.green('[apis...] --redocly <config>'))
      .argument(
        '[apis...]',
        'Optional list of Redocly APIs for which to generate API clients. If not specified, clients for all APIs will be generated.'
      )
      .allowUnknownOption(true)
      .helpOption('--redocly-help', 'Display help for the `--redocly` option')
      .addOption(redoclyOption)
      .action(async (apis: string[] = [], args) => {
        const redocly = args.redocly;

        if (!redocly) return;

        const spinner = QraftCommand.spinner;

        spinner.start('Loading Redocly configuration ⚙︎');

        const redoc = await loadRedoclyConfig(redocly || true, this.cwd);

        const redocConfigFile = redoc.configFile;

        if (!redocConfigFile) {
          spinner.fail(
            'No "configFile" found in the Redocly configuration. Please specify the correct path to the Redocly configuration file.'
          );
          process.exit(1);
        }

        type RawApisMap = ReturnType<typeof getRedocAPIsToQraft>;
        const allRawApisByConfigKey: Record<string, RawApisMap> = {};

        for (const configKey of this.configKeys) {
          const apisForKey = getRedocAPIsToQraft(
            redoc,
            this.cwd,
            spinner,
            configKey
          );
          if (Object.keys(apisForKey).length > 0) {
            allRawApisByConfigKey[configKey] = apisForKey;
          }
        }

        const allApiNames = new Set(
          Object.values(allRawApisByConfigKey).flatMap((apis) =>
            Object.keys(apis)
          )
        );

        if (apis.length) {
          const notFoundAPIs = apis.filter(
            (inputAPIName) => !allApiNames.has(inputAPIName)
          );

          if (notFoundAPIs.length) {
            spinner.fail(
              `The specified API${
                notFoundAPIs.length > 1 ? 's' : ''
              } ${notFoundAPIs.map(c.red).join(', ')} ${notFoundAPIs.length > 1 ? 'were' : 'was'} not found in the Redocly configuration.`
            );

            throw new CommanderError(
              1,
              'ERR_API_NOT_FOUND',
              `The specified API${
                notFoundAPIs.length > 1 ? 's' : ''
              } ${c.red(notFoundAPIs.join(', '))} ${notFoundAPIs.length > 1 ? 'were' : 'was'} not found in the Redocly configuration.`
            );
          }
        }

        for (const [configKey, apisForKey] of Object.entries(
          allRawApisByConfigKey
        )) {
          const filteredEntries = Object.entries(apisForKey).filter(
            ([apiName]) => !apis.length || apis.includes(apiName)
          );

          if (filteredEntries.length === 0) continue;

          this.parsedAPIsByConfigKey[configKey] = {};

          for (const [apiName, api] of filteredEntries) {
            const globalQraftConfig =
              configKey in redoc.rawConfig
                ? (redoc.rawConfig as Record<string, unknown>)[configKey]
                : undefined;

            const apiQraftConfigWithOutput = (
              api as unknown as Record<string, unknown>
            )[configKey] as { ['output-dir']: string };
            const { ['output-dir']: outputDir, ...apiQraftConfig } =
              apiQraftConfigWithOutput;

            const cwd = fileURLToPath(this.cwd);

            this.parsedAPIsByConfigKey[configKey][apiName] = [
              apiName,
              ...parseConfigToArgs({
                redocly: relative(cwd, redocConfigFile),
                'output-dir': relative(cwd, outputDir),
                ...(globalQraftConfig && typeof globalQraftConfig === 'object'
                  ? globalQraftConfig
                  : undefined),
                ...apiQraftConfig,
              }),
            ];
          }
        }

        spinner.stop();
      });
  }

  async parseConfig<T>(
    callbacks: ConfigKeyCallbacks<T>,
    argv: readonly string[],
    options?: ParseOptions
  ): Promise<T[] | undefined> {
    this.configKeys = Object.keys(callbacks);

    await this.parseAsync(argv, options);

    const hasAnyAPIs = Object.values(this.parsedAPIsByConfigKey).some(
      (apis) => Object.keys(apis).length > 0
    );

    if (!hasAnyAPIs) return; // todo::improve error reporting

    return RedoclyConfigCommand.forEachRedoclyAPIEntry(
      this.parsedAPIsByConfigKey,
      callbacks
    );
  }

  static async forEachRedoclyAPIEntry<T>(
    apisByConfigKey: RedoclyQraftAPIsByConfigKey,
    callbacks: ConfigKeyCallbacks<T>
  ) {
    const spinner = QraftCommand.spinner;

    spinner.info('Loading Redocly configuration...');

    const allResults: T[] = [];
    const allErrors: unknown[] = [];

    for (const [configKey, apis] of Object.entries(apisByConfigKey)) {
      const callback = callbacks[configKey];
      if (!callback) continue;

      const apiEntries = Object.entries(apis);

      const { errors, results } = await Promise.allSettled(
        apiEntries.map(
          async ([apiName, [openAPIDocument, ...apiProcessArgv]]) => {
            spinner.info(
              `Generating API client for ${c.magenta(apiName)} with the following parameters:\n` +
                c.gray.italic('bin ') +
                `${c.green.italic(openAPIDocument)} ` +
                apiProcessArgv
                  .map((arg) =>
                    arg.startsWith('--')
                      ? c.yellow.italic(arg)
                      : c.yellow.italic.underline(maybeEscapeShellArg(arg))
                  )
                  .join(' ')
            );
            spinner.text = '';
            spinner.start();

            return await callback([openAPIDocument, ...apiProcessArgv], {
              from: 'user',
            });
          }
        )
      ).then((results) =>
        results.reduce<{ errors: unknown[]; results: T[] }>(
          (acc, result) => {
            if (result.status === 'rejected') acc.errors.push(result.reason);
            else acc.results.push(result.value);

            return acc;
          },
          { errors: [], results: [] }
        )
      );

      allResults.push(...results);
      allErrors.push(...errors);
    }

    if (allErrors.length) {
      throw new CommanderError(
        1,
        'ERROR',
        'The following errors occurred during API client generation:\n' +
          allErrors
            .map((error) =>
              error instanceof Error
                ? error.message + '\n' + error.stack
                : JSON.stringify(error, null, 2)
            )
            .join('\n\n')
      );
    }

    const allApiNames = Object.values(apisByConfigKey).flatMap((apis) =>
      Object.keys(apis)
    );

    spinner.succeed(
      c.green(`API clients successfully generated for: `) +
        allApiNames.map((apiName) => `"${c.magenta(apiName)}"`).join(', ') +
        '.'
    );

    return allResults;
  }
}

type CallbackFn<T> = (
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) => T | Promise<T>;

type RedoclyQraftAPIsByConfigKey = {
  [configKey: string]: {
    [apiName: string]: string[];
  };
};
