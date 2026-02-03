import { QraftCommandPlugin as QraftCommandPluginBase } from '@qraft/plugin';
import { QraftCommand } from './QraftCommand.js';

export interface QraftCommandPlugin extends QraftCommandPluginBase<QraftCommand> {}
