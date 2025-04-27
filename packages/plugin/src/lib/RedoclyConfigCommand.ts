import { relative } from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';
import { CONFIG_FILE_NAMES } from '@redocly/openapi-core';
import c from 'ansi-colors';
import { Command, CommanderError, Option, ParseOptions } from 'commander';
import { getRedocAPIsToQraft } from './getRedocAPIsToQraft.js';
import { loadRedoclyConfig } from './loadRedoclyConfig.js';
import { maybeEscapeShellArg } from './maybeEscapeShellArg.js';
import { parseConfigToArgs } from './parseConfigToArgs.js';
import { QraftCommand } from './QraftCommand.js';

export const redoclyOption = (() => {
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
})();
/**
 * @param name - not used
 */
export class RedoclyConfigCommand extends Command {
  protected readonly cwd: URL;

  /**
   * Redocly API item and QraftCommand arguments
   */
  protected parsedAPIs: RedoclyQraftAPIs = {};

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
      .action(async (apis = [], args) => {
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

        const redocAPIsToQraftEntries = Object.entries(
          getRedocAPIsToQraft(redoc, this.cwd, spinner)
        ).filter(([apiName]) => !apis.length || apis.includes(apiName));

        if (apis.length) {
          const notFoundAPIs = apis.filter(
            (inputAPIName: string) =>
              !redocAPIsToQraftEntries.some(
                ([apiName]) => apiName === inputAPIName
              )
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

        redocAPIsToQraftEntries.forEach(([apiName, api]) => {
          const {
            ['x-openapi-qraft']: { ['output-dir']: outputDir, ...qraftConfig },
          } = api;

          const cwd = fileURLToPath(this.cwd);

          this.parsedAPIs[apiName] = [
            apiName,
            ...parseConfigToArgs({
              redocly: relative(cwd, redocConfigFile),
              'output-dir': relative(cwd, outputDir),
              ...qraftConfig,
            }),
          ];
        });

        spinner.stop();
      });
  }

  async parseConfig<T>(
    callbackFn: CallbackFn<T>,
    argv: readonly string[],
    options?: ParseOptions
  ): Promise<T[] | undefined> {
    await this.parseAsync(argv, options);

    if (!Object.entries(this.parsedAPIs).length) return;

    return RedoclyConfigCommand.forEachRedoclyAPIEntry(
      this.parsedAPIs,
      callbackFn
    );
  }

  static async forEachRedoclyAPIEntry<T>(
    redoclyAPIs: RedoclyQraftAPIs,
    callbackFn: CallbackFn<T>
  ) {
    const redoclyAPIsEntries = Object.entries(redoclyAPIs);

    const spinner = QraftCommand.spinner;

    spinner.info('Loading Redocly configuration...');

    const { errors, results } = await Promise.allSettled(
      redoclyAPIsEntries.map(
        async ([apiName, [openAPIDocument, ...apiProcessArgv]]) => {
          spinner.info(
            `Generating API client for ${c.magenta(apiName)} with the following parameters:\n` +
              c.gray.italic('bin ') +
              `${c.green.italic(openAPIDocument)}` +
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

          return callbackFn([openAPIDocument, ...apiProcessArgv], {
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

    if (errors.length) {
      throw new CommanderError(
        1,
        'ERROR',
        'The following errors occurred during API client generation:\n' +
          errors
            .map((error) =>
              error instanceof Error
                ? error.message + '\n' + error.stack
                : JSON.stringify(error, null, 2)
            )
            .join('\n\n')
      );
    }

    spinner.succeed(
      c.green(`API clients successfully generated for: `) +
        redoclyAPIsEntries
          .map(([apiName]) => `"${c.magenta(apiName)}"`)
          .join(', ') +
        '.'
    );

    return results;
  }
}

type CallbackFn<T> = (
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) => T;

type RedoclyQraftAPIs = {
  [apiName: string]: string[];
};
