import type { Ora } from 'ora';
import process from 'node:process';
import { fileHeader } from '@openapi-qraft/plugin/lib/fileHeader';
import {
  createPredefinedParametersGlobs,
  parseOperationPredefinedParametersOption,
} from '@openapi-qraft/plugin/lib/predefineSchemaParameters';
import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';
import { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';
import { Option } from 'commander';
import { generateCode } from './generateCode.js';
import { getAllAvailableCallbackNames } from './ts-factory/getCallbackNames.js';

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
      .addOption(
        new Option(
          '--default-client-callbacks <callbacks...>',
          'List of default API client methods and hooks that will be available by default. These can be overridden at runtime if needed..'
        )
          .choices(['all', 'none', ...getAllAvailableCallbackNames()])
          .default(['all'])
      )
      .action(async ({ spinner, output, args, services, schema }, resolve) => {
        validateDefaultCallbacks(args.defaultClientCallbacks, spinner);

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
            defaultClientCallbacks: args.defaultClientCallbacks
              .map((callbackName: string) => callbackName.trim())
              .filter(Boolean),
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

function validateDefaultCallbacks(
  defaultCallbacks: string[],
  spinner: Ora
): asserts defaultCallbacks is string[] | ['all'] | ['none'] {
  if (!defaultCallbacks || defaultCallbacks.length === 0) return;

  const hasSpecialValue = defaultCallbacks.some(
    (cb) => cb === 'all' || cb === 'none'
  );
  if (hasSpecialValue && defaultCallbacks.length > 1) {
    spinner.fail(
      `When using "all" or "none" as a callback value, no other callbacks should be specified.`
    );
    process.exit(1);
  }
}
