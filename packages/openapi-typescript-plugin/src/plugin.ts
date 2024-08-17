import { fileHeader } from '@openapi-qraft/plugin/lib/fileHeader';
import { formatFileHeader } from '@openapi-qraft/plugin/lib/formatFileHeader';
import { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';
import { CommanderError } from 'commander';
import { generateSchemaTypes } from './generateSchemaTypes.js';
import {
  createOpenapiTypesImportPath,
  isValidTypeScriptFileName,
} from './lib/createOpenapiTypesImportPath.js';

export const plugin: QraftCommandPlugin = {
  setupCommand(command) {
    command
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
        '--no-blob-from-binary',
        'If this option is enabled, binary format fields will not be converted to Blob types, preserving the native representation'
      )
      .option(
        '--explicit-component-exports',
        'Enabling this option will export API components as standalone types, alongside `components` interface'
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
  postSetupCommand(command, plugins) {
    if (!plugins.includes('tanstack-query-react')) return;

    // Makes `--openapi-types-import-path` option to be optional
    command.options
      .find((option) => option.attributeName() === 'openapiTypesImportPath')
      ?.makeOptionMandatory(false);

    // Highlight the `--export-openapi-types` option default value
    command.options
      .find((option) => {
        return option.attributeName() === 'exportOpenapiTypes';
      })
      ?.default(true);

    command.hook('preAction', (thisCommand) => {
      // Do not override if a custom value already exists
      if (!command.getOptionValue('openapiTypesImportPath')) {
        let openapiTypesFileName = thisCommand.getOptionValue(
          'openapiTypesFileName'
        );

        if (
          thisCommand.getOptionValueSource('openapiTypesFileName') === 'default'
        ) {
          openapiTypesFileName = openapiTypesFileName.slice(
            0,
            openapiTypesFileName.indexOf('.')
          );
        }

        // Set value to `--openapi-types-import-path` option
        thisCommand.setOptionValue(
          'openapiTypesImportPath',
          createOpenapiTypesImportPath(
            openapiTypesFileName,
            thisCommand.getOptionValue('explicitImportExtensions')
          )
        );
      }

      const openapiTypesImportPath = thisCommand.getOptionValue(
        'openapiTypesImportPath'
      );

      // Validate if `--openapi-types-file-name` has a wrong file extension
      if (
        thisCommand.getOptionValue('explicitImportExtensions') &&
        thisCommand
          .getOptionValue('openapiTypesFileName')
          ?.endsWith?.('.d.ts') &&
        openapiTypesImportPath &&
        !openapiTypesImportPath?.endsWith?.('.d.ts')
      ) {
        throw new CommanderError(
          1,
          'ERR_INVALID_OPENAPI_TYPES_FILE_NAME',
          "When '--explicit-import-extensions' is set, the '--openapi-types-file-name' must end with '.ts', or set '--openapi-types-import-path' to '.d.ts'"
        );
      }

      // If the option is not set, set it to true
      if (command.getOptionValue('exportOpenapiTypes') === undefined) {
        thisCommand.setOptionValue('exportOpenapiTypes', true);
      }
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
