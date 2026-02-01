import { QraftCommand } from '@qraft/asyncapi-plugin';
import { fileHeader } from '@qraft/plugin/lib/fileHeader';
import { formatFileHeader } from '@qraft/plugin/lib/formatFileHeader';
import { QraftCommandPlugin } from '@qraft/plugin/lib/QraftCommandPlugin';
import c from 'ansi-colors';
import { CommanderError } from 'commander';
import { generateSchemaTypes } from './generateSchemaTypes.js';

export const plugin: QraftCommandPlugin<QraftCommand> = {
  setupCommand(command) {
    command
      .description('Generate TypeScript types from an AsyncAPI Document.')
      .option(
        '--asyncapi-types-file-name <path>',
        'AsyncAPI Schema types file name, e.g.: "schema.d.ts"',
        asyncapiTypesFileNameOptionParser,
        'schema.ts'
      )
      .option('--enum', 'Export true TS enums instead of unions')
      .option('--enum-values', 'Export enum values as arrays.')
      .option('--dedupe-enums', 'Dedupe enum types when `--enum` is set')
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
        '--properties-required-by-default',
        'Treat schema objects as if `required` is set to all properties by default'
      )
      .option('--alphabetize', 'Sort object keys alphabetically')
      .option('--exclude-deprecated', 'Exclude deprecated fields from types')
      .action(async ({ output, args, spinner, inputs }, resolve) => {
        spinner.text = 'Generating AsyncAPI Document Types...';

        const code = await generateSchemaTypes(inputs[0], {
          args,
          silent: true,
        });

        spinner.succeed(c.green('AsyncAPI Document types generated'));

        resolve([
          {
            file: new URL(args.asyncapiTypesFileName, output.dir),
            code: formatFileHeader(args.fileHeader ?? fileHeader) + code,
          },
        ]);
      });
  },
};

export function asyncapiTypesFileNameOptionParser(value: string) {
  if (!isValidTypeScriptFileName(value)) {
    throw new CommanderError(
      1,
      'ERR_INVALID_SCHEMA_FILE_NAME',
      'AsyncAPI Schema types file name must end with ".ts" or ".d.ts"'
    );
  }

  if (value.includes('/') || value.includes('\\')) {
    throw new CommanderError(
      1,
      'ERR_INVALID_SCHEMA_FILE_NAME',
      'AsyncAPI Schema types file name must not include path'
    );
  }

  if (value.startsWith('.')) {
    throw new CommanderError(
      1,
      'ERR_INVALID_SCHEMA_FILE_NAME',
      'AsyncAPI Schema types file name must not start with "."'
    );
  }

  return value;
}

function isValidTypeScriptFileName(fileName: string): boolean {
  return fileName.endsWith('.ts') || fileName.endsWith('.d.ts');
}
