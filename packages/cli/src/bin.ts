#!/usr/bin/env node
import chalk from 'chalk';
import { program } from 'commander';

import { fileHeader } from './lib/fileHeader.js';
import { writeOpenAPISchemaServices } from './write-open-api-schema-services.js';

program
  .description(
    'Generate services declarations and Typed React Query Interfaces from OpenAPI Schema'
  )
  .argument('[input]', 'Input OpenAPI Schema file path, URL (json, yml)', null)
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
  .action(async (input, args) => {
    const source = input
      ? new URL(input, new URL(`file://${process.cwd()}/`))
      : process.stdin;

    if (source === process.stdin && source.isTTY) {
      console.error(
        chalk.red(
          'Input file not found or stdin is empty. Please specify `--input` option or pipe OpenAPI Schema to stdin.'
        )
      );

      process.exit(1);
    }

    await writeOpenAPISchemaServices({
      source,
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
