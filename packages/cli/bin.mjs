#!/usr/bin/env node
'use strict';

/**
 * Workaround to allow `rimraf dist/` on rebuilds and keep `bin` executable
 * without a need `yarn install`
 */
import { program } from './dist/bin.js';
import plugin from './dist/generators/tanstack-query-react/plugin.js';

plugin.setupCommand(program);

program.parse(process.argv);
