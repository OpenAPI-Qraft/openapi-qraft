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
      .description(
        'Generate a TanStack Query React client from OpenAPI Document'
      )
      .requiredOption(
        '--openapi-types-import-path <path>',
        'Path to schema types file (.d.ts), e.g.: "../schema.d.ts"'
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
        "Add an export statement of the generated OpenAPI document types from the `./index.ts' file. Useful for sharing types within your project.",
        parseBooleanOption
      )
      .option(
        '--queryable-write-operations [bool]',
        'Enable generation of query hooks (useQuery, useSuspenseQuery, etc.) for writable HTTP methods like POST, PUT, PATCH. By default, only mutation hooks are generated for writable operations.',
        parseBooleanOption
      )
      .action(async ({ spinner, output, args, services, schema }, resolve) => {
        return void (await generateCode({
          spinner,
          services,
          serviceImports: {
            openapiTypesImportPath: args.openapiTypesImportPath,
            queryableWriteOperations: args.queryableWriteOperations,
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
              : undefined, // This value is inherited from the `--operation-predefined-parameters` option
          },
        }).then(resolve));
      });
  },
};

function parseBooleanOption(arg: string) {
  return arg?.toLowerCase() !== 'false';
}
