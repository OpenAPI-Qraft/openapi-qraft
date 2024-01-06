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
    '-fh, --file-header <string>',
    'Header to be added to the generated file (eg: /* eslint-disable */)'
  )
  .option(
    '-rm, --clean <bool>',
    'Clean output directory before generating services',
    (value) => !!JSON.parse(String(value).toLowerCase()),
    true
  )
  .action(async (args) => {
    await writeOpenAPISchemaServices({
      sourcePath: args.input,
      serviceImports: {
        operationGenericsPath: args.operationGenericsPath,
        schemaTypesPath: args.schemaTypesPath,
      },
      output: {
        dir: args.outDir,
        clean: args.clean,
        fileHeader: args.fileHeader ?? fileHeader,
      },
    });
  });

program.parse(process.argv);
