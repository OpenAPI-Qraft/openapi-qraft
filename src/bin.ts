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
  .option(
    '--operation-generics-path <path>',
    'Path to operation generics file',
    '@radist2s/qraft/ServiceOperation'
  )
  .option(
    '--schema-types-path <path>',
    'Path to schema types file (.d.ts)',
    './schema'
  )
  .action(async (args) => {
    await writeOpenAPISchemaServices({
      schemaDeclarationPath: args.input,
      servicesOutDir: args.outDir,
      schemaTypesPath: args.schemaTypesPath,
      operationGenericsPath: args.operationGenericsPath,
    });
  });

program.parse(process.argv);
