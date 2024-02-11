#!/usr/bin/env node
import c from 'ansi-colors';
import { program } from 'commander';

import { fileHeader } from './lib/fileHeader.js';
import { writeOpenAPIServices } from './writeOpenAPIServices.js';

program
  .description(
    'Generate services declarations and Typed React Query Interfaces from OpenAPI Schema'
  )
  .argument('[input]', 'Input OpenAPI Schema file path, URL (json, yml)', null)
  .requiredOption(
    '-o, --output-dir <path>',
    'Output directory for generated services'
  )
  .requiredOption(
    '--openapi-types-import-path <path>', // todo::specify better param name to avoid confusion with real path
    'Path to schema types file (.d.ts), eg: "../openapi.d.ts"'
  )
  .option(
    '--operation-generics-import-path <path>',
    'Path to operation generics file',
    '@openapi-qraft/react'
  )
  .option(
    '--file-header <string>',
    'Header to be added to the generated file (eg: /* eslint-disable */)'
  )
  .option('-rm, --clean', 'Clean output directory before generating services')
  .option(
    '--postfix-services <string>',
    'Postfix to be added to the generated service name (eg: Service)'
  )
  .action(async (input, args) => {
    const source = input
      ? new URL(input, new URL(`file://${process.cwd()}/`))
      : process.stdin;

    if (source === process.stdin && source.isTTY) {
      console.error(
        c.red(
          'Input file not found or stdin is empty. Please specify `--input` option or pipe OpenAPI Schema to stdin.'
        )
      );

      process.exit(1);
    }

    await writeOpenAPIServices({
      source,
      serviceImports: {
        operationGenericsImportPath: args.operationGenericsImportPath,
        openapiTypesImportPath: args.openapiTypesImportPath,
      },
      output: {
        dir: args.outputDir,
        clean: args.clean,
        fileHeader: args.fileHeader ?? fileHeader,
        postfixServices: args.postfixServices,
      },
    }).catch((error) => {
      if (error instanceof Error)
        console.error(c.red(error.message), c.red(error.stack ?? ''));
      console.error(error);
      process.exit(1);
    });
  });

program.parse(process.argv);
