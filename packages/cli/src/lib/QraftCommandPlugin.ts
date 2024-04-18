import { QraftCommand } from './QraftCommand.js';

export interface QraftCommandPlugin {
  setupCommand(command: QraftCommand): void;
}
