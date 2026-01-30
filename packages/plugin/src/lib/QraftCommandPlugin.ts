import { QraftCommand } from './QraftCommand.js';

export interface QraftCommandPlugin<
  TCommand extends QraftCommand = QraftCommand,
> {
  setupCommand(command: TCommand): void | Promise<void>;

  postSetupCommand?(
    command: TCommand,
    plugins: string[]
  ): void | Promise<void>;
}
