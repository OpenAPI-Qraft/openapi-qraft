import {
  QraftCommandActionOptions,
  QraftCommand as QraftCommandBase,
  QraftCommandOptions,
} from '@qraft/plugin';
import c from 'ansi-colors';

export class QraftCommand extends QraftCommandBase<AsyncAPIQraftCommandActionOptions> {
  constructor(name?: string, options?: QraftCommandOptions) {
    super(name, options);

    this.usage('[input] [options]').argument(
      '[input]', // todo::hwy not make it required?
      'Input AsyncAPI Document file path, URL (json, yml)',
      null
    );
  }

  protected override logVersion() {
    QraftCommand.spinner.info(`✨ ${c.bold('AsyncAPI Qraft')}`);
  }
}

export interface AsyncAPIQraftCommandActionOptions extends QraftCommandActionOptions {}
