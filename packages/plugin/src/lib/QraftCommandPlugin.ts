import { QraftCommand } from './QraftCommand.js';

export interface QraftCommandPlugin {
  setupCommand(command: QraftCommand): void | Promise<void>;

  /**
   * Called after all plugins have been set up
   */
  postSetupCommand?(
    command: QraftCommand,
    plugins: string[]
  ): void | Promise<void>;
}
