#!/usr/bin/env node
import { program } from 'commander';

import { fileHeader } from './lib/fileHeader.js';
import { writeOpenAPISchemaServices } from './write-open-api-schema-services.js';

program
  .description('Generate counterparts, taxId, payables and line items')
  .requiredOption(
    '-i, --input <path>',
    'Input OpenAPI Schema file path (json, yml)'
  )
  .requiredOption(
    '-o, --out-dir <path>',
    'Output directory for generated services'
  )
  .option(
    '-g, --operation-generics-path <path>',
    'Path to operation generics file',
    '@radist2s/qraft/ServiceOperation'
  )
  .option(
    '-t, --schema-types-path <path>',
    'Path to schema types file (.d.ts)',
    './schema'
  )
  .option(
    '-h --file-header <string>',
    'Header to be added to the generated file (eg: /* eslint-disable */)'
  )
  .action(async (args) => {
    await writeOpenAPISchemaServices({
      schemaDeclarationPath: args.input,
      servicesOutDir: args.outDir,
      schemaTypesPath: args.schemaTypesPath,
      operationGenericsPath: args.operationGenericsPath,
      fileHeader: args.fileHeader ?? fileHeader,
    });
  });

program.parse(process.argv);
