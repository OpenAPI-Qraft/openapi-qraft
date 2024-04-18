import { fileHeader } from '../../lib/fileHeader.js';
import { QraftCommand } from '../../lib/QraftCommand.js';
import { QraftCommandPlugin } from '../../lib/QraftCommandPlugin.js';
import { generateCode } from './generateCode.js';

const plugin: QraftCommandPlugin = {
  setupCommand(command: QraftCommand) {
    command
      .description('Generate TanStack Query React client from OpenAPI Schema')
      .requiredOption(
        '--openapi-types-import-path <path>', // todo::specify better param name to avoid confusion with real path
        'Path to schema types file (.d.ts), eg: "../openapi.d.ts"'
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
      .action(({ spinner, output, args, services }, resolve) => {
        return void generateCode({
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
        }).then(resolve);
      });
  },
};

export default plugin;
