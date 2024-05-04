#!/usr/bin/env node
import { createConfig } from '@redocly/openapi-core';

import { program } from 'commander';
import fs from 'node:fs';
import type { Readable, Writable } from 'node:stream';
import openapiTS, {
  astToString,
  c,
  COMMENT_HEADER,
  formatTime,
  OpenAPI3,
  OpenAPITSOptions,
} from 'openapi-typescript';
import ts from 'typescript';

program
  .description(
    'Generate TypeScript types from OpenAPI 3.x schema. Supports JSON and YAML. Based on "openapi-typescript" (https://github.com/drwpow/openapi-typescript/)'
  )
  .argument('[input]', 'Input OpenAPI Schema file path, URL (json, yml)', null)
  .option('-o, --output <path>', 'Specify output file')
  .option('--enum', 'Export true TS enums instead of unions')
  .option('--export-type, -t', 'Export top-level `type` instead of `interface`')
  .option('--immutable', 'Generate readonly types')
  .option(
    '--additional-properties',
    'Treat schema objects as if `additionalProperties: true` is set'
  )
  .option(
    '--empty-objects-unknown',
    'Generate `unknown` instead of `Record<string, never>` for empty objects'
  )
  .option(
    '--default-non-nullable',
    'Set to `false` to ignore default values when generating non-nullable types'
  )
  .option('--array-length', 'Generate tuples using array minItems / maxItems')
  .option('--path-params-as-types', 'Convert paths to template literal types')
  .option('--alphabetize', 'Sort object keys alphabetically')
  .option('--exclude-deprecated', 'Exclude deprecated types')
  .action(async (input, args) => {
    const timeStart = performance.now();

    const cwd = new URL(`file://${process.cwd()}/`);
    const output = (args.output as string) || process.stdout;

    await generateAndWriteSchema(handleSchemaInput(input, cwd), {
      output,
      args,
      cwd,
    });

    if (output && typeof output === 'string') {
      // if stdout, (still) don’t log anything to console!
      console.log(
        `🚀 ${c.green(`${input || 'stdin'} → ${c.bold(output)}`)} ${c.dim(
          `[${formatTime(performance.now() - timeStart)}]`
        )}`
      );
    }
  });

async function generateAndWriteSchema(
  schema: string | URL | OpenAPI3 | Readable | Buffer,
  {
    cwd,
    output,
    args,
  }: {
    cwd: URL;
    output: string | Writable;
    args: Pick<
      OpenAPITSOptions,
      | 'additionalProperties'
      | 'alphabetize'
      | 'arrayLength'
      | 'defaultNonNullable'
      | 'emptyObjectsUnknown'
      | 'enum'
      | 'excludeDeprecated'
      | 'exportType'
      | 'immutable'
      | 'pathParamsAsTypes'
    >;
  }
) {
  const result = `${COMMENT_HEADER}${astToString(
    await openapiTS(schema, {
      transform(schemaObject) {
        if (schemaObject.format === 'binary') {
          return {
            schema: schemaObject.nullable
              ? ts.factory.createUnionTypeNode([
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier('Blob'),
                    undefined
                  ),
                  ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                ])
              : ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('Blob'),
                  undefined
                ),
            // questionToken will be inferred by `openapiTS`, if true, it will force `?` for parameter
            questionToken: false,
          };
        }
      },
      additionalProperties: args.additionalProperties,
      alphabetize: args.alphabetize,
      arrayLength: args.arrayLength,
      // contentNever: args.contentNever, // todo::add `contentNever` in new version
      defaultNonNullable: args.defaultNonNullable,
      emptyObjectsUnknown: args.emptyObjectsUnknown,
      enum: args.enum,
      excludeDeprecated: args.excludeDeprecated,
      exportType: args.exportType,
      immutable: args.immutable,
      pathParamsAsTypes: args.pathParamsAsTypes,
      redocly: await createConfig({}, { extends: ['minimal'] }),
      silent: typeof output !== 'string',
    })
  )}`;

  if (typeof output === 'string') {
    const outFile = new URL(output, cwd);
    fs.mkdirSync(new URL('.', outFile), { recursive: true });
    fs.writeFileSync(outFile, result, 'utf8');
  } else {
    // if stdout, (still) don’t log anything to console!
    output.write(result);
  }
}

/**
 * Validates Schema's `input` and return `Readable` stream or `URL`
 * Exit process if input is invalid
 */
function handleSchemaInput(input: string | undefined, cwd: URL) {
  if (!input) {
    /**
     * Handle `stdin`, if no input file is provided
     * @example
     * ```bash
     * cat schema.json | script.js
     * ```
     */
    if (process.stdin.isTTY) {
      console.error(
        c.red(
          ' ✘  Input file not found or stdin is empty. Please specify `--input` option or pipe OpenAPI Schema to stdin.'
        )
      );

      process.exit(1);
    }

    return process.stdin;
  }

  /**
   * Handle single file
   * @example
   * ```bash
   * script.js schema.json
   * ```
   */

  // throw error on glob
  if (input.includes('*')) {
    console.error(
      c.red(
        ' ✘  Globbing is not supported. Please specify a single file or URL.'
      )
    );

    process.exit(1);
  }

  return new URL(input, cwd);
}

program.parse(process.argv);
