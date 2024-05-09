import { fileHeader } from '@openapi-qraft/plugin/lib/fileHeader';
import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';
import { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';

import { generateCode } from './generateCode.js';

export const plugin: QraftCommandPlugin = {
  setupCommand(command: QraftCommand) {
    command
      .description('Generate TanStack Query React client from OpenAPI Schema')
      .requiredOption(
        '--openapi-types-import-path <path>',
        'Path to schema types file (.d.ts), eg: "../schema.d.ts"'
      )
      .option(
        '--file-header <string>',
        'Header to be added to the generated file (eg: /* eslint-disable */)'
      )
      .option(
        '--explicit-import-extensions',
        'All import statements will include explicit `.js` extensions. Ideal for projects using ECMAScript modules.'
      )
      .option(
        '--operation-generics-import-path <path>',
        'Path to operation generics file',
        '@openapi-qraft/react'
      )
      .action(async ({ spinner, output, args, services }, resolve) => {
        return void (await generateCode({
          spinner,
          services,
          serviceImports: {
            operationGenericsImportPath: args.operationGenericsImportPath,
            openapiTypesImportPath: args.openapiTypesImportPath,
          },
          output: {
            ...output,
            fileHeader: args.fileHeader ?? fileHeader,
            explicitImportExtensions: args.explicitImportExtensions,
            servicesDirName: 'services',
          },
        }).then(resolve));
      });
  },
};
