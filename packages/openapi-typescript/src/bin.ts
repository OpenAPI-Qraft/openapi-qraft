#!/usr/bin/env node
import { createConfig } from '@redocly/openapi-core';

import { program } from 'commander';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import openapiTS, {
  astToString,
  c,
  COMMENT_HEADER,
  formatTime,
  OpenAPI3,
} from 'openapi-typescript';
import ts from 'typescript';

const timeStart = performance.now();

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
    const CWD = new URL(`file://${process.cwd()}/`);
    const output = (args.output as string) || process.stdout;

    async function generateAndWriteSchema(
      schema: string | URL | OpenAPI3 | Readable | Buffer
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
                questionToken: true, // todo::make PR to openapi-typescript to add `schemaObject` to `transform` third argument, to get `required` properties
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
        const outFile = new URL(output, CWD);
        fs.mkdirSync(new URL('.', outFile), { recursive: true });
        fs.writeFileSync(outFile, result, 'utf8');
      } else {
        // if stdout, (still) don’t log anything to console!
        output.write(result);
      }

      if (typeof output === 'string') {
        done(input || 'stdin', output, performance.now() - timeStart);
      }
    }

    if (!input) {
      if (process.stdin.isTTY) {
        console.error(
          c.red(
            'Input file not found or stdin is empty. Please specify `--input` option or pipe OpenAPI Schema to stdin.'
          )
        );

        process.exit(1);
      }

      await generateAndWriteSchema(process.stdin);
    }
    // handle single file
    else {
      // throw error on glob
      if (input.includes('*')) {
        errorAndExit(
          'Globbing is not supported. Please specify a single file or URL.'
        );
      }

      await generateAndWriteSchema(new URL(input, CWD));
    }
  });

function done(input: string, output: string, time: number) {
  // final console output
  console.log(
    `🚀 ${c.green(`${input} → ${c.bold(output)}`)} ${c.dim(
      `[${formatTime(time)}]`
    )}`
  );
}

function errorAndExit(message: string) {
  console.error(c.red(` ✘  ${message}`)); // eslint-disable-line no-console
  throw new Error(message);
}

program.parse(process.argv);
