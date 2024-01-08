#!/usr/bin/env node
import chalk from 'chalk';
import { program } from 'commander';
import * as console from 'console';

import { fileHeader } from './lib/fileHeader.js';
import { writeOpenAPISchemaServices } from './write-open-api-schema-services.js';

program
  .description(
    'Generate services declarations and Typed React Query Interfaces from OpenAPI Schema'
  )
  .option('-i, --input <path>', 'Input OpenAPI Schema file path (json, yml)')
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
    '-t, --schema-types-path <path>', // todo::specify better param name to avoid confusion with real path
    'Path to schema types file (.d.ts)',
    './schema'
  )
  .option(
    '-fh, --file-header <string>',
    'Header to be added to the generated file (eg: /* eslint-disable */)'
  )
  .option('-rm, --clean', 'Clean output directory before generating services')
  .option(
    '-ps, --postfix-services <string>',
    'Postfix to be added to the generated service name (eg: Service)'
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
        postfixServices: args.postfixServices,
      },
    }).catch((error) => {
      if (error instanceof Error)
        console.error(chalk.red(error.message, error.stack));
      console.error(error);
      process.exit(1);
    });
  });

program.parse(process.argv);
