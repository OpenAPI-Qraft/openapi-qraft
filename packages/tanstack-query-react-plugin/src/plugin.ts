import { fileHeader } from '@openapi-qraft/plugin/lib/fileHeader';
import {
  createPredefinedParametersGlobs,
  parseOperationPredefinedParametersOption,
} from '@openapi-qraft/plugin/lib/predefineSchemaParameters';
import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';
import { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';
import { Option } from 'commander';
import { generateCode } from './generateCode.js';

export const plugin: QraftCommandPlugin = {
  setupCommand(command: QraftCommand) {
    command
      .description('Generate TanStack Query React client from OpenAPI Schema')
      .requiredOption(
        '--openapi-types-import-path <path>',
        'Path to schema types file (.d.ts), eg: "../schema.d.ts"'
      )
      .addOption(
        new Option(
          '--explicit-import-extensions [extension]',
          'All import statements will contain an explicit file extension. Ideal for projects using ECMAScript modules.'
        )
          .preset('.js')
          .choices(['.js', '.ts'])
      )
      .option(
        '--export-openapi-types [bool]',
        'Export the OpenAPI schema types from the generated `./index.ts` file',
        (arg) => {
          return arg?.toLowerCase() !== 'false';
        }
      )
      .action(async ({ spinner, output, args, services, schema }, resolve) => {
        return void (await generateCode({
          spinner,
          services,
          serviceImports: {
            openapiTypesImportPath: args.openapiTypesImportPath,
          },
          output: {
            ...output,
            fileHeader: args.fileHeader ?? fileHeader,
            explicitImportExtensions: args.explicitImportExtensions,
            servicesDirName: 'services',
            exportSchemaTypes: args.exportOpenapiTypes,
            operationPredefinedParameters: args.operationPredefinedParameters
              ? createPredefinedParametersGlobs(
                  schema,
                  parseOperationPredefinedParametersOption(
                    ...args.operationPredefinedParameters
                  )
                )
              : undefined, // inherited from `--operation-predefined-parameters` option
          },
        }).then(resolve));
      });
  },
};
