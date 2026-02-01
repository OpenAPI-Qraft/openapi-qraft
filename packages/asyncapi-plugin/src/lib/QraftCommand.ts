import type { AsyncAPIDocumentInterface } from '@asyncapi/parser';
import {
  normalizeOutputDirPath,
  QraftCommandActionOptions,
  QraftCommand as QraftCommandBase,
  QraftCommandOptions,
} from '@qraft/plugin';
import c from 'ansi-colors';
import { packageVersion } from '../packageVersion.js';
import { handleSchemaInput } from './handleSchemaInput.js';
import { readSchema } from './readSchema.js';

export class QraftCommand extends QraftCommandBase<AsyncAPIQraftCommandActionOptions> {
  constructor(name?: string, options?: QraftCommandOptions) {
    super(name, options);

    this.usage('[input] [options]').argument(
      '[input]',
      'Input AsyncAPI Document file path, URL (json, yml)',
      null
    );
  }

  protected override async prepareActionOptions(
    inputs: string[],
    args: Record<string, any>
  ): Promise<AsyncAPIQraftCommandActionOptions> {
    const spinner = QraftCommand.spinner;

    const input = handleSchemaInput(inputs[0], this.cwd, spinner);

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
