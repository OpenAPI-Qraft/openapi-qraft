#!/usr/bin/env node
import { program } from 'commander';
import { c, formatTime } from 'openapi-typescript';

import { generateAndWriteSchema } from './generateAndWriteSchema.js';

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
