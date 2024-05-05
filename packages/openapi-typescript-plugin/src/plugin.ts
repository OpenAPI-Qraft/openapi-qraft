import { fileHeader } from '@openapi-qraft/plugin/lib/fileHeader';
import { formatFileHeader } from '@openapi-qraft/plugin/lib/formatFileHeader';
import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';
import { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';

import { generateSchemaTypes } from './generateSchemaTypes.js';

export const plugin: QraftCommandPlugin = {
  setupCommand(command: QraftCommand) {
    command
      .description(
        'Generate TypeScript types from OpenAPI 3.x Document. Based on "openapi-typescript" (https://github.com/drwpow/openapi-typescript/)'
      )
      .option('--enum', 'Export true TS enums instead of unions')
      .option(
        '-t, --export-type',
        'Export top-level `type` instead of `interface`'
      )
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
      .option(
        '--array-length',
        'Generate tuples using array minItems / maxItems'
      )
      .option(
        '--path-params-as-types',
        'Convert paths to template literal types'
      )
      .option('--alphabetize', 'Sort object keys alphabetically')
      .option('--exclude-deprecated', 'Exclude deprecated types')
      .option(
        '--file-header <string>',
        'Header to be added to the generated file (eg: /* eslint-disable */)'
      )
      .action(async ({ output, args, spinner, schema }, resolve) => {
        spinner.text = 'Generating OpenAPI Document Types';

        const code = await generateSchemaTypes(schema, {
          args,
          silent: true,
        });

        spinner.succeed('OpenAPI Document types generated');

        resolve([
          {
            file: new URL('openapi.ts', output.dir),
            code: formatFileHeader(args.fileHeader ?? fileHeader) + code,
          },
        ]);
      });
  },
};
