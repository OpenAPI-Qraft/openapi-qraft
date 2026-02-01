import { QraftCommand, QraftCommandActionOptions } from './QraftCommand.js';

export interface QraftCommandPlugin<
  TCommand extends QraftCommand<any> = QraftCommand<QraftCommandActionOptions>,
> {
  setupCommand(command: TCommand): void | Promise<void>;

  postSetupCommand?(command: TCommand, plugins: string[]): void | Promise<void>;
}
