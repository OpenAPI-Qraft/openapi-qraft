import { sep } from 'node:path';
import process from 'node:process';
import { pathToFileURL, URL } from 'node:url';
import { Config, createConfig, getMergedConfig } from '@redocly/openapi-core';
import c from 'ansi-colors';
import { Command, CommanderError, Option, ParseOptions } from 'commander';
import ora, { Ora } from 'ora';
import { packageVersion } from '../packageVersion.js';
import { filterDocumentPaths } from './filterDocumentPaths.js';
import { GeneratorFile } from './GeneratorFile.js';
import { getRedocAPIsToQraft } from './getRedocAPIsToQraft.js';
import { handleSchemaInput } from './handleSchemaInput.js';
import { loadRedoclyConfig } from './loadRedoclyConfig.js';
import { getServices } from './open-api/getServices.js';
import { OpenAPISchemaType } from './open-api/OpenAPISchemaType.js';
import { OpenAPIService } from './open-api/OpenAPIService.js';
import { readSchema } from './open-api/readSchema.js';
import { OutputOptions } from './OutputOptions.js';
import {
  createPredefinedParametersGlobs,
  parseOperationPredefinedParametersOption,
  predefineSchemaParameters,
} from './predefineSchemaParameters.js';
import {
  parseOperationNameModifier,
  processOperationNameModifierOption,
} from './processOperationNameModifierOption.js';
import { redoclyOption } from './RedoclyConfigCommand.js';
import { splitCommaSeparatedGlobs } from './splitCommaSeparatedGlobs.js';
import { writeGeneratorFiles } from './writeGeneratorFiles.js';

export class QraftCommand extends Command {
  static spinner = ora();

  protected readonly cwd: URL;
  protected registeredPluginActions: QraftCommandActionCallback[] = [];

  /**
   * @param name - not used
   */
  constructor(name?: string) {
    super(name);
    this.cwd = pathToFileURL(`${process.cwd()}/`);

    this.usage('[input] [options]')
      .argument(
        '[input]',
        'Input OpenAPI Document file path, URL (json, yml)',
        null
      )
      .option(
        '-o, --output-dir <path>',
        'Output directory for generated services'
      )
      .addOption(
        new Option(
          '-c, --clean',
          'Clean output directory before generating services'
        )
      )
      .option(
        '--filter-services <glob-patterns...>',
        'Filter services to be generated using glob patterns. Example: "/user/**,/post/**". For more details, see the NPM `micromatch` package documentation.'
      )
      .option(
        '--operation-predefined-parameters <patterns...>',
        'Predefined parameters for services. The specified service parameters will be optional. Example: "/**:header.x-monite-version,query.x-api-key" or "get /**:header.x-monite-entity-id"',
        parseColonSeparatedList
      )
      .option(
        '--operation-name-modifier <patterns...>',
        'Modifies operation names using a pattern. Use the `==>` operator to separate the regular expression (left) and the substitution string (right). For example: "post /**:[A-Za-z]+Id ==> createOne"'
      )
      .addOption(
        new Option(
          '--postfix-services <string>',
          'Postfix to be added to the generated service name (eg: Service)'
        )
      )
      .option(
        '--service-name-base <endpoint[<index>] | tags>',
        'Use OpenAPI Operation `endpoint[<index>]` path part (e.g.: "/0/1/2") or `tags` as the base name of the service.',
        'endpoint[0]'
      )
      .addOption(
        new Option(
          '--file-header <string>',
          'Header to be added to the generated file (eg: /* eslint-disable */)'
        )
      )
      .addOption(redoclyOption);
  }

  action(callback: QraftCommandActionCallback): this {
    this.registerPluginAction(callback);
    return super.action(this.actionCallback.bind(this));
  }

  async actionCallback(...actionArgs: any[]) {
    const inputs = actionArgs.filter(
      (arg) => typeof arg === 'string'
    ) as string[];
    const args = actionArgs.find(
      (arg) => arg && typeof arg === 'object'
    ) as Record<string, any>;

    if (!args) throw new Error('Arguments object not found');

    if (args.version) {
      console.info(`v${packageVersion}`); // todo::add displaying of the used plugin version
      process.exit(0);
    }

    const spinner = QraftCommand.spinner;

    spinner.start('Initializing process...');

    const redoc = args.redocly
      ? getMergedConfig(
          await loadRedoclyConfig(args.redocly, this.cwd),
          inputs[0]
        )
      : await createConfig(
          {
            rules: {
              // throw error on duplicate operationIDs
              'operation-operationId-unique': { severity: 'error' },
            },
          },
          { extends: ['minimal'] }
        );

    const input = args.redocly
      ? handleRedoclySchemaInput(redoc, inputs[0], this.cwd, spinner)
      : handleSchemaInput(inputs[0], this.cwd, spinner);

    spinner.text = 'Reading OpenAPI Document...';

    let schema = filterDocumentPaths(
      await readSchema(input, redoc),
      splitCommaSeparatedGlobs(args.filterServices)
    );

    if (args.operationPredefinedParameters) {
      const predefinedParametersGlobs = createPredefinedParametersGlobs(
        schema,
        parseOperationPredefinedParametersOption(
          ...args.operationPredefinedParameters
        )
      );

      const predefinedParametersErrors = predefinedParametersGlobs.flatMap(
        ({ errors }) => errors
      );

      if (predefinedParametersErrors.length) {
        predefinedParametersErrors.forEach((error) => spinner.warn(error));
        spinner.fail(
          'An error occurred while setting up operation predefined parameters.'
        );
        process.exit(1);
      }

      schema = predefineSchemaParameters(schema, predefinedParametersGlobs);
    }

    spinner.text = 'Retrieving OpenAPI Services...';
    let services = getServices(schema as OpenAPISchemaType, {
      postfixServices: args.postfixServices,
      serviceNameBase: args.serviceNameBase,
    });

    if (args.operationNameModifier) {
      const {
        services: modifiedServicesOperationNames,
        errors: operationNameModifierErrors,
      } = processOperationNameModifierOption(
        parseOperationNameModifier(
          ...(Array.isArray(args.operationNameModifier)
            ? args.operationNameModifier
            : [args.operationNameModifier])
        ),
        services
      );

      if (operationNameModifierErrors.length) {
        operationNameModifierErrors.forEach((error) => {
          if (error.type === 'conflictingOperationNameModifier') {
            spinner.fail(
              [
                c.red.bold(
                  `Error occurred during operation name modifier setup: '${error.serviceName}.${error.originalOperationName}' to '${error.replacedOperationName}'`
                ),
                c.yellow(
                  error.modifiers
                    .map(
                      ({
                        pathGlobs,
                        operationNameModifierRegex,
                        operationNameModifierReplace,
                      }) =>
                        `Conflicting operation name modifier: '${pathGlobs}': '${operationNameModifierRegex}' => '${operationNameModifierReplace}'`
                    )
                    .join('\n')
                ),
              ].join('\n')
            );
          } else if (error.type === 'unusedOperationNameModifier') {
            spinner.fail(
              [
                c.yellow.bold(
                  `Unused operation name modifier: '${error.modifier.pathGlobs}': '${error.modifier.operationNameModifierRegex}' => '${error.modifier.operationNameModifierReplace}'`
                ),
              ].join('\n')
            );
          }
        });

        process.exit(1);
      }

      services = modifiedServicesOperationNames;
    }

    spinner.text = 'Generating code...';

    const outputDir = normalizeOutputDirPath(args.outputDir);

    for (const pluginAction of this.registeredPluginActions) {
      const fileItems = await new Promise<GeneratorFile[]>(
        (resolve, reject) => {
          pluginAction(
            {
              inputs,
              args,
              spinner,
              services,
              schema: schema as OpenAPISchemaType,
              output: {
                dir: outputDir,
                clean: args.clean,
              },
            },
            resolve
          ).catch(reject);
        }
      );

      try {
        if (this.registeredPluginActions.indexOf(pluginAction) === 0) {
          await writeGeneratorFiles({
            // Create output directory first, but for the first plugin only
            fileItems: [{ directory: outputDir, clean: false }, ...fileItems],
            spinner,
          });
        } else {
          await writeGeneratorFiles({ fileItems, spinner });
        }
      } catch (error) {
        spinner.fail(
          c.red('An error occurred during the code generation process.')
        );

        if (error instanceof Error) {
          console.error(c.red(error.message), c.red(error.stack ?? ''));
        }

        throw error;
      }
    }

    spinner.succeed(c.green('Qraft process completed successfully'));
  }

  protected registerPluginAction(callback: QraftCommandActionCallback) {
    this.registeredPluginActions.push(callback);
  }

  option(
    flags: string,
    description?: string,
    defaultValue?: string | boolean | string[]
  ): this;
  option<T>(
    flags: string,
    description: string,
    parseArg: (value: string, previous: T) => T,
    defaultValue?: T
  ): this;
  /** @deprecated since v7, instead use choices or a custom function */
  option(
    flags: string,
    description: string,
    regexp: RegExp,
    defaultValue?: string | boolean | string[]
  ): this;
  option<T>(
    flags: string,
    description?: string,
    parseArg?:
      | ((value: string, previous: T) => T)
      | string
      | boolean
      | string[]
      | RegExp,
    defaultValue?: T
  ): this {
    if (
      this.findSimilarOption({
        flags,
        mandatory: false,
      })
    ) {
      return this;
    }

    return super.option(
      flags,
      // @ts-expect-error - Issues with overloading
      description,
      parseArg,
      defaultValue
    );
  }

  requiredOption(
    flags: string,
    description?: string,
    defaultValue?: string | boolean | string[]
  ): this;
  requiredOption<T>(
    flags: string,
    description: string,
    parseArg: (value: string, previous: T) => T,
    defaultValue?: T
  ): this;
  /** @deprecated since v7, instead use choices or a custom function */
  requiredOption(
    flags: string,
    description: string,
    regexp: RegExp,
    defaultValue?: string | boolean | string[]
  ): this;
  requiredOption<T>(
    flags: string,
    description?: string,
    regexpOrDefaultValue?:
      | string
      | boolean
      | string[]
      | RegExp
      | ((value: string, previous: T) => T),
    defaultValue?: string | boolean | string[]
  ): this {
    if (
      this.findSimilarOption({
        flags,
        mandatory: true,
      })
    ) {
      return this;
    }

    return super.requiredOption(
      flags,
      // @ts-expect-error - Issues with overloading
      description,
      regexpOrDefaultValue,
      defaultValue
    );
  }

  addOption(option: Option): this {
    if (
      this.findSimilarOption({
        flags: option.flags,
        mandatory: option.mandatory,
      })
    ) {
      return this;
    }

    return super.addOption(option);
  }

  parseAsync(argv?: readonly string[], options?: ParseOptions): Promise<this> {
    if (options?.from !== 'user') this.logVersion();
    return super.parseAsync(argv, options);
  }

  parse(argv?: readonly string[], options?: ParseOptions): this {
    if (options?.from !== 'user') this.logVersion();
    return super.parse(argv, options);
  }

  protected logVersion() {
    QraftCommand.spinner.info(
      `✨ ${c.bold(`OpenAPI Qraft ${packageVersion}`)}`
    );
  }

  protected findSimilarOption(option: { flags: string; mandatory: boolean }) {
    try {
      return findSimilarOption(option, this.options);
    } catch (error) {
      console.error(
        c.red(
          error instanceof Error
            ? error.message
            : 'An error occurred during command option setup'
        )
      );

      throw error;
    }
  }
}

/**
 * Normalize an output directory path by adding trailing slash
 */
function normalizeOutputDirPath(outputDir: string): URL {
  return pathToFileURL(
    outputDir.endsWith(sep) ? outputDir : `${outputDir}${sep}`
  );
}

export type QraftCommandActionCallback = (
  options: {
    /**
     * Command inputs, e.g. `bin <input> [options]` where `<input>` is the `inputs` item
     */
    inputs: string[];
    /**
     * Command arguments, e.g. `bin <input> [options]` where `[options]` is the `args`
     */
    args: Record<string, any>;
    /**
     * Spinner instance
     */
    spinner: Ora;
    /**
     * OpenAPI services
     */
    services: OpenAPIService[];
    /**
     * OpenAPI schema
     */
    schema: OpenAPISchemaType;
    /**
     * Output options
     */
    output: OutputOptions;
  },
  resolve: (files: GeneratorFile[]) => void
) => Promise<void>;

function findSimilarOption(
  {
    flags,
    mandatory,
  }: {
    flags: string;
    mandatory: boolean;
  },
  options: readonly Option[]
) {
  const newOptionParsedFlags = splitOptionFlags(flags);
  /** @see {@link https://github.com/tj/commander.js/blob/83c3f4e391754d2f80b179acc4bccc2d4d0c863d/lib/option.js#L15} Source implementation */
  const optional = flags.includes('['); // A value is optional when the option is specified.
  const required = flags.includes('<'); // A value must be supplied when the option is specified.
  // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument
  const variadic = /\w\.\.\.[>\]]$/.test(flags); // The option can take multiple values.

  return options.find((existingOption) => {
    const existingOptionParsedFlags = splitOptionFlags(existingOption.flags);

    if (
      !(
        (existingOptionParsedFlags.longFlag !== undefined &&
          existingOptionParsedFlags.longFlag ===
            newOptionParsedFlags.longFlag) ||
        (existingOptionParsedFlags.shortFlag !== undefined &&
          existingOptionParsedFlags.shortFlag ===
            newOptionParsedFlags.shortFlag)
      )
    ) {
      return false;
    }

    if (
      existingOptionParsedFlags.longFlag !== undefined &&
      newOptionParsedFlags.longFlag !== undefined &&
      existingOptionParsedFlags.longFlag !== newOptionParsedFlags.longFlag
    ) {
      throw new Error(
        `Long flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}"`
      );
    }

    if (
      existingOptionParsedFlags.shortFlag !== undefined &&
      newOptionParsedFlags.shortFlag !== undefined &&
      existingOptionParsedFlags.shortFlag !== newOptionParsedFlags.shortFlag
    ) {
      throw new Error(
        `Short flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}"`
      );
    }

    if (required !== existingOption.required) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different required status`
      );
    }

    if (optional !== existingOption.optional) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different optional status`
      );
    }

    if (mandatory !== existingOption.mandatory) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different mandatory status`
      );
    }

    if (variadic !== existingOption.variadic) {
      throw new Error(
        `Flag ${flags} already exists in the option list with flags: "${existingOption.flags}" and description: "${existingOption.description}" but with different variadic status`
      );
    }

    return existingOption;
  });
}

/**
 * Split the short and long flag out of something like '-m,--mixed <value>'
 * @link https://github.com/tj/commander.js/blob/83c3f4e391754d2f80b179acc4bccc2d4d0c863d/lib/option.js#L310
 */
export function splitOptionFlags(flags: string) {
  let shortFlag;
  let longFlag;

  // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed, for example, unintended `-sw, --short-word` [sic].
  const flagParts = flags.split(/[ |,]+/);

  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
    shortFlag = flagParts.shift();

  longFlag = flagParts.shift();

  // Add support for a lone short flag without significantly changing parsing!
  if (!shortFlag && /^-[^-]$/.test(longFlag ?? '')) {
    shortFlag = longFlag;
    longFlag = undefined;
  }

  return { shortFlag, longFlag };
}

function parseColonSeparatedList(value: string, previous: unknown) {
  if (Array.isArray(previous)) {
    const previousValue = previous.at(-1);

    if (
      typeof previousValue === 'string' &&
      !previousValue.includes(':') &&
      !value.includes(':')
    ) {
      return previous.slice(0, -1).concat(`${previousValue}:${value}`);
    }

    return previous.concat(value);
  }

  return [value];
}

function handleRedoclySchemaInput(
  redoc: Config,
  inputAPIName: string,
  cwd: URL,
  spinner: Ora
) {
  if (!inputAPIName) {
    throw new CommanderError(
      1,
      'ERR_MISSING_API',
      'No API specified. Please specify the API to be generated.'
    );
  }

  const api = getRedocAPIsToQraft(redoc, cwd, spinner, inputAPIName)[
    inputAPIName
  ];

  if (!api)
    throw new CommanderError(
      1,
      'ERR_MISSING_API',
      `API not found in Redocly API (${inputAPIName}) found in the Redocly configuration: ${inputAPIName}. Please specify the correct API.`
    );

  return new URL(api['root'], cwd);
}
