// eslint-disable-next-line import-x/no-extraneous-dependencies
import type { AsyncAPIDocumentInterface } from '@asyncapi/parser';
import { URL } from 'node:url';
import {
  handleSchemaInput,
  normalizeOutputDirPath,
  QraftCommandActionOptions,
  QraftCommand as QraftCommandBase,
  QraftCommandOptions,
} from '@qraft/plugin';
import {
  ASYNCAPI_QRAFT_REDOC_CONFIG_KEY,
  getRedocAPIsToQraft,
} from '@qraft/plugin/lib/getRedocAPIsToQraft';
import { loadRedoclyConfig } from '@qraft/plugin/lib/loadRedoclyConfig';
import { createRedoclyOption } from '@qraft/plugin/lib/RedoclyConfigCommand';
import c from 'ansi-colors';
import { CommanderError } from 'commander';
import { Ora } from 'ora';
import { packageVersion } from '../packageVersion.js';
import { readSchema } from './readSchema.js';

export class QraftCommand extends QraftCommandBase<AsyncAPIQraftCommandActionOptions> {
  constructor(name?: string, options?: QraftCommandOptions) {
    super(name, options);

    this.usage('[input] [options]')
      .argument(
        '[input]',
        'Input AsyncAPI Document file path, URL (json, yml)',
        null
      )
      .addOption(createRedoclyOption());
  }

  protected override async prepareActionOptions(
    inputs: string[],
    args: Record<string, any>
  ): Promise<AsyncAPIQraftCommandActionOptions> {
    const spinner = QraftCommand.spinner;

    const input = args.redocly
      ? await handleRedoclySchemaInput(
          args.redocly,
          inputs[0],
          this.cwd,
          spinner
        )
      : handleSchemaInput(inputs[0], this.cwd, spinner, 'AsyncAPI Document');

    spinner.text = 'Reading AsyncAPI Document...';

    const { document, rawSchema } = await readSchema(input);

    const outputDir = normalizeOutputDirPath(args.outputDir);

    return {
      inputs,
      args,
      spinner,
      document,
      rawSchema,
      output: {
        dir: outputDir,
        clean: args.clean,
      },
    };
  }

  protected override logVersion() {
    QraftCommand.spinner.info(
      `✨ ${c.bold(`AsyncAPI Qraft ${packageVersion}`)}`
    );
  }
}

export interface AsyncAPIQraftCommandActionOptions extends QraftCommandActionOptions {
  document: AsyncAPIDocumentInterface;
  rawSchema: Record<string, unknown>;
}

async function handleRedoclySchemaInput(
  redoclyConfigPath: string,
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

  const redoc = await loadRedoclyConfig(String(redoclyConfigPath), cwd);

  const api = getRedocAPIsToQraft(
    redoc,
    cwd,
    spinner,
    ASYNCAPI_QRAFT_REDOC_CONFIG_KEY,
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
