#!/usr/bin/env node
'use strict';

/**
 * Workaround to allow `rimraf dist/` on rebuilds and keep `bin` executable
 * without a need `yarn install`
 */
import { main } from './dist/bin.js';

main(process.argv);
