import { QraftCommand } from '../bin.js';

export interface QraftCommandPlugin {
  setupCommand(command: QraftCommand): void;
}