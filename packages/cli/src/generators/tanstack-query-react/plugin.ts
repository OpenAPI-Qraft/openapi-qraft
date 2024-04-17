import type { Command } from 'commander';
import { Ora } from 'ora';

import { fileHeader } from '../../lib/fileHeader.js';
import { GeneratorFiles } from '../../lib/GeneratorFiles.js';
import { Service } from '../../lib/open-api/getServices.js';
import { OutputOptions } from '../../lib/OutputOptions.js';
import { generateCode } from './generateCode.js';

interface Plugin {
  setupCommand(command: Command): void;
  action({
    spinner,
    services,
    output,
  }: {
    spinner: Ora;
    services: Service[];
    output: OutputOptions;
    args: Record<string, any>;
  }): Promise<GeneratorFiles>;
}

const plugin: Plugin = {
  setupCommand(command: Command) {
    command
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
      );
  },
  async action({ spinner, services, output, args }) {
    return await generateCode({
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
    });
  },
};

export default plugin;
