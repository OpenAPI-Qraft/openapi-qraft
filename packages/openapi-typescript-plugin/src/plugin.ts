import { fileHeader } from '@openapi-qraft/plugin/lib/fileHeader';
import { formatFileHeader } from '@openapi-qraft/plugin/lib/formatFileHeader';
import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';
import { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';

import { CommanderError } from 'commander';

import { generateSchemaTypes } from './generateSchemaTypes.js';
import {
  createOpenapiTypesImportPath,
  isValidTypeScriptFileName,
} from './lib/createOpenapiTypesImportPath.js';

export const plugin: QraftCommandPlugin = {
  setupCommand(command: QraftCommand) {
    const openapiTypesImportPathOption = command.options.find(
      (option) => option.attributeName() === 'openapiTypesImportPath'
    );

    if (openapiTypesImportPathOption) {
      // will be set in `preAction` hook if not provided
      openapiTypesImportPathOption.makeOptionMandatory(false);
    }

    command
      .hook('preAction', (thisCommand) => {
        if (!command.getOptionValue('openapiTypesImportPath'))
          thisCommand.setOptionValue(
            'openapiTypesImportPath',
            createOpenapiTypesImportPath(
              thisCommand.getOptionValue('openapiTypesFileName'),
              thisCommand.getOptionValue('explicitImportExtensions')
            )
          );
      })
      .description(
        'Generate TypeScript types from OpenAPI 3.x Document. Based on "openapi-typescript" (https://github.com/drwpow/openapi-typescript/)'
      )
      .option(
        '--openapi-types-file-name <path>',
        'OpenAPI Schema types file name, eg: "schema.d.ts"',
        openapiTypesFileNameOptionParser,
        'schema.ts'
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
            file: new URL(args.openapiTypesFileName, output.dir),
            code: formatFileHeader(args.fileHeader ?? fileHeader) + code,
          },
        ]);
      });
  },
};

export function openapiTypesFileNameOptionParser(value: string) {
  if (!isValidTypeScriptFileName(value)) {
    throw new CommanderError(
      1,
      'ERR_INVALID_SCHEMA_FILE_NAME',
      'OpenAPI Schema types file name must end with ".ts" or ".d.ts"'
    );
  }

  if (value.includes('/') || value.includes('\\')) {
    throw new CommanderError(
      1,
      'ERR_INVALID_SCHEMA_FILE_NAME',
      'OpenAPI Schema types file name must not include path'
    );
  }

  if (value.startsWith('.')) {
    throw new CommanderError(
      1,
      'ERR_INVALID_SCHEMA_FILE_NAME',
      'OpenAPI Schema types file name must not start with "."'
    );
  }

  return value;
}
