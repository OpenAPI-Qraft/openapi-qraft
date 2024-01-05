#!/usr/bin/env node
import { program } from 'commander';

import { writeOpenAPISchemaServices } from './write-open-api-schema-services.js';

program
  .description('Generate counterparts, taxId, payables and line items')
  .requiredOption(
    '--input <path>',
    'Input OpenAPI Schema file path (json, yml)'
  )
  .requiredOption('--out-dir <path>', 'Output directory for generated services')
  .action(async (args) => {
    await writeOpenAPISchemaServices(args.input, args.outDir);
  });

program.parse(process.argv);
