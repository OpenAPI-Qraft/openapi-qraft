import process from 'node:process';
import { URL } from 'node:url';
import {
  normalizeOutputDirPath,
  QraftCommandActionOptions,
  QraftCommand as QraftCommandBase,
  QraftCommandOptions,
  splitOptionFlags,
} from '@qraft/plugin';
import {
  getRedocAPIsToQraft,
  OPENAPI_QRAFT_REDOC_CONFIG_KEY,
} from '@qraft/plugin/lib/getRedocAPIsToQraft';
import { loadRedoclyConfig } from '@qraft/plugin/lib/loadRedoclyConfig';
import { redoclyOption } from '@qraft/plugin/lib/RedoclyConfigCommand';
import { Config, createConfig, getMergedConfig } from '@redocly/openapi-core';
import c from 'ansi-colors';
import { CommanderError, Option } from 'commander';
import { Ora } from 'ora';
import { packageVersion } from '../packageVersion.js';
import { filterDocumentPaths } from './filterDocumentPaths.js';
import { handleSchemaInput } from './handleSchemaInput.js';
import { getServices } from './open-api/getServices.js';
import { OpenAPISchemaType } from './open-api/OpenAPISchemaType.js';
import { OpenAPIService } from './open-api/OpenAPIService.js';
import { readSchema } from './open-api/readSchema.js';
import {
  createPredefinedParametersGlobs,
  parseOperationPredefinedParametersOption,
  predefineSchemaParameters,
} from './predefineSchemaParameters.js';
import {
  parseOperationNameModifier,
  processOperationNameModifierOption,
} from './processOperationNameModifierOption.js';
import { splitCommaSeparatedGlobs } from './splitCommaSeparatedGlobs.js';

export { splitOptionFlags };

export class QraftCommand extends QraftCommandBase<OpenAPIQraftCommandActionOptions> {
  constructor(name?: string, options?: QraftCommandOptions) {
    super(name, options);

    this.usage('[input] [options]')
      .argument(
        '[input]', // todo::why now required with <input>?
        'Input OpenAPI Document file path, URL (json, yml)',
        null
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
      .addOption(redoclyOption);
  }

  async actionCallback(...actionArgs: any[]): Promise<void> {
    const args = actionArgs.find(
      (arg) => arg && typeof arg === 'object'
    ) as Record<string, any>;

    if (!args) throw new Error('Arguments object not found');

    if (args.version) {
      console.info(`v${packageVersion}`);
      process.exit(0);
    }

    return super.actionCallback(...actionArgs);
  }

  protected override async prepareActionOptions(
    inputs: string[],
    args: Record<string, any>
  ): Promise<OpenAPIQraftCommandActionOptions> {
    const spinner = QraftCommand.spinner;

    const redoc = args.redocly
      ? getMergedConfig(
          await loadRedoclyConfig(args.redocly, this.cwd),
          inputs[0]
        )
      : await createConfig(
          {
            rules: {
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

    const outputDir = normalizeOutputDirPath(args.outputDir);

    return {
      inputs,
      args,
      spinner,
      services,
      schema: schema as OpenAPISchemaType,
      output: {
        dir: outputDir,
        clean: args.clean,
      },
    };
  }

  protected override logVersion() {
    QraftCommand.spinner.info(
      `✨ ${c.bold(`OpenAPI Qraft ${packageVersion}`)}`
    );
  }
}

export interface OpenAPIQraftCommandActionOptions extends QraftCommandActionOptions {
  services: OpenAPIService[];
  schema: OpenAPISchemaType;
}

export type QraftCommandActionCallback = (
  options: OpenAPIQraftCommandActionOptions,
  resolve: (
    files: import('@qraft/plugin/lib/GeneratorFile').GeneratorFile[]
  ) => void
) => Promise<void>;

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

  const api = getRedocAPIsToQraft(
    redoc,
    cwd,
    spinner,
    OPENAPI_QRAFT_REDOC_CONFIG_KEY,
    inputAPIName
  )[inputAPIName];

  if (!api)
    throw new CommanderError(
      1,
      'ERR_MISSING_API',
      `API not found in Redocly API (${inputAPIName}) found in the Redocly configuration: ${inputAPIName}. Please specify the correct API.`
    );

  return new URL(api['root'], cwd);
}
