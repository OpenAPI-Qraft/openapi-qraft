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

export const redoclyOption = new Option(
  '--redocly [config]',
  [
    `Use Redocly config to generate the API client.`,
    `If the [config] is not specified, the default Redocly config will be used: [${CONFIG_FILE_NAMES.join(' | ')}].`,
    'Example: "openapi-qraft --redocly", "openapi-qraft my-api@v1 external-api --redocly", "openapi-qraft --redocly ./my-redocly-config.yaml"',
  ].join(' ')
);

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

    this.usage(`<apis...> ${redoclyOption.description}`)
      .argument(
        '[apis...]',
        'Optional Redocly config path to generate the API client. If path is not specified, the default Redocly config will be used.'
      )
      .allowUnknownOption(true)
      .addOption(redoclyOption)
      .action(async (apis = [], args) => {
        const redocly = args.redocly;

        if (!redocly) return;

        const spinner = QraftCommand.spinner;

        spinner.start('Loading Redocly config ⛏︎');

        const redoc = await loadRedoclyConfig(redocly || true, this.cwd);

        const redocConfigFile = redoc.configFile;

        if (!redocConfigFile) {
          spinner.fail(
            'No "configFile" found in Redocly config. Please specify the path to the Redocly config file.'
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
              `API${
                notFoundAPIs.length > 1 ? 's' : ''
              } ${notFoundAPIs.map(c.red).join(', ')} not found in Redocly config.`
            );

            throw new CommanderError(
              1,
              'ERR_API_NOT_FOUND',
              `API${
                notFoundAPIs.length > 1 ? 's' : ''
              } ${c.red(notFoundAPIs.join(', '))} not found in Redocly config.`
            );
          }
        }

        redocAPIsToQraftEntries.forEach(([apiName, api]) => {
          const {
            ['x-openapi-qraft']: { ['output-dir']: outputDir, ...qraftConfig },
            root: inputOpenAPIDocument,
          } = api;

          const cwd = fileURLToPath(this.cwd);

          this.parsedAPIs[apiName] = [
            inputOpenAPIDocument,
            ...parseConfigToArgs({
              'redocly-api': [apiName, relative(cwd, redocConfigFile)],
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

    spinner.info('Loading Redocly config ⛏️');

    const { errors, results } = await Promise.allSettled(
      redoclyAPIsEntries.map(
        async ([apiName, [openAPIDocument, ...apiProcessArgv]]) => {
          spinner.info(
            `Generating API client for ${c.magenta(apiName)} using arguments: ` +
              `${c.green.italic(openAPIDocument)} ` +
              apiProcessArgv
                .map((arg) =>
                  arg.startsWith('--')
                    ? c.yellow.italic(arg)
                    : c.cyan.italic(maybeEscapeShellArg(arg))
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
        'Errors occurred during API generation:\n' +
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
      c.green(`Successfully generated clients for APIs: `) +
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
