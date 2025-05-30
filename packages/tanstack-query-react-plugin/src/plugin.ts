import type { OverrideImportType } from './ts-factory/OverrideImportType.js';
import { fileHeader } from '@openapi-qraft/plugin/lib/fileHeader';
import {
  createPredefinedParametersGlobs,
  parseOperationPredefinedParametersOption,
} from '@openapi-qraft/plugin/lib/predefineSchemaParameters';
import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';
import { QraftCommandPlugin } from '@openapi-qraft/plugin/lib/QraftCommandPlugin';
import { CommanderError, Option } from 'commander';
import { generateCode } from './generateCode.js';
import { parseOptionSubValues } from './lib/parseOptionSubValues.js';
import { getAllAvailableCallbackNames } from './ts-factory/getCallbackNames.js';
import { CreateAPIClientFnOptions } from './ts-factory/getIndexFactory.js';

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
        "Add an export statement of the generated OpenAPI document types from the `./index.ts' file. Useful for sharing types within your project. Default: true when --plugin openapi-typescript is used.",
        parseBooleanOption
      )
      .option(
        '--queryable-write-operations [bool]',
        'Enable generation of query hooks (useQuery, useSuspenseQuery, etc.) for writable HTTP methods like POST, PUT, PATCH. By default, only mutation hooks are generated for writable operations.',
        parseBooleanOption
      )
      .addOption(
        (() => {
          const option = new Option(
            '--create-api-client-fn <functionName> [options...]',
            'Configure API client creation function. Allows specifying the function name, included services, and callbacks. Can be specified multiple times to generate several different API client functions from a single OpenAPI document.'
          )
            .argParser(parseCreateApiClientFn)
            .default(createApiClientFnDefault);

          option.defaultValueDescription = 'null';

          return option;
        })()
      )
      .addOption(
        new Option(
          '--override-import-type <pathname overrides...>',
          'Override import paths for specific types in generated files. This allows using custom type implementations instead of the default ones. Expected format: filepath originalModule:importTypeName:customImportPath'
        ).argParser(parseOverrideImportType)
      )
      .action(async ({ spinner, output, args, services, schema }, resolve) => {
        return void (await generateCode({
          spinner,
          services,
          serviceOptions: {
            openapiTypesImportPath: args.openapiTypesImportPath,
            queryableWriteOperations: args.queryableWriteOperations,
          },
          overrideImportType: Array.isArray(args.overrideImportType)
            ? args.overrideImportType[0]
            : undefined,
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
            createApiClientFn: normalizeCreateApiClientFn(
              args.createApiClientFn
            ),
          },
        }).then(resolve));
      });
  },
};

function parseBooleanOption(arg: string) {
  return arg?.toLowerCase() !== 'false';
}

function normalizeCreateApiClientFn(
  value: CreateAPIClientFnArg[]
): Array<[functionName: string, value: CreateAPIClientFnOptions]> {
  return value.map(([functionName, value]) => [
    functionName,
    {
      services: value.services ?? ['all'],
      callbacks: value.callbacks ?? ['all'],
      filename: value.filename ?? [functionName],
    },
  ]);
}

function parseCreateApiClientFn(
  value: string,
  previous: unknown
): CreateAPIClientFnArg[] {
  if (
    Array.isArray(previous) &&
    JSON.stringify(previous) === JSON.stringify(createApiClientFnDefault)
  ) {
    previous = [];
  }

  const nextValue = parseOptionSubValues(
    value,
    Array.isArray(previous) ? previous : undefined
  );

  const lastOptionConfig = nextValue.at(-1)?.[1];

  if (!lastOptionConfig)
    throw new CommanderError(
      1,
      'ERR_INVALID_SUB_OPTION_VALUE',
      `Invalid sub-option value: ${value}`
    );

  if (
    'callbacks' in lastOptionConfig &&
    Array.isArray(lastOptionConfig.callbacks)
  ) {
    const availableCallbackNames = [
      'all',
      'none',
      'operationInvokeFn',
      ...getAllAvailableCallbackNames(),
    ];
    const unknownCallback = lastOptionConfig.callbacks.find(
      (callbackName) => !availableCallbackNames.includes(callbackName)
    );

    if (unknownCallback) {
      throw new CommanderError(
        1,
        'ERR_UNKNOWN_CALLBACK',
        `Unknown callback '${unknownCallback}'\n` +
          `Available callbacks: ${availableCallbackNames.join(', ')}`
      );
    }
  }

  if (
    'services' in lastOptionConfig &&
    Array.isArray(lastOptionConfig.services)
  ) {
    if (lastOptionConfig.services.length > 1)
      throw new CommanderError(
        1,
        'ERR_MULTIPLE_SERVICES',
        `Multiple services are not supported`
      );

    const availableServiceOptions = ['all', 'none'];
    const unknownServiceOption = lastOptionConfig.services.find(
      (serviceOption) => !availableServiceOptions.includes(serviceOption)
    );

    if (unknownServiceOption) {
      throw new CommanderError(
        1,
        'ERR_UNKNOWN_SERVICE_OPTION',
        `Unknown service option '${unknownServiceOption}'\n` +
          `Available service options: ${availableServiceOptions.join(', ')}`
      );
    }
  }

  if (
    'filename' in lastOptionConfig &&
    Array.isArray(lastOptionConfig.filename)
  ) {
    if (lastOptionConfig.filename.length > 1)
      throw new CommanderError(
        1,
        'ERR_MULTIPLE_FILENAMES',
        `Provide only one filename for the --create-api-client-fn option`
      );
  }

  return nextValue;
}

type ParsedOverrideImportTypeOption = [
  overrides: OverrideImportType,
  filepath?: string,
];

function parseOverrideImportType(
  value: string,
  previousValue: unknown
): ParsedOverrideImportTypeOption {
  const previous = (
    Array.isArray(previousValue) ? previousValue : [{}]
  ) as ParsedOverrideImportTypeOption;

  if (!value.includes(':')) {
    previous.push(value);

    return previous;
  }

  const importOverrides = value.split(':');

  if (importOverrides.length === 3) {
    const originalModule = importOverrides[0];
    const typeName = importOverrides[1];
    const overrideModule = importOverrides[2];

    if (!originalModule || !typeName || !overrideModule) {
      throw new CommanderError(
        1,
        'ERR_INVALID_IMPORT_TYPE_OVERRIDE',
        `Invalid import type override: ${value}. Expected format: originalModule:importTypeName:customImportPath`
      );
    }

    const filePath = previous[previous.length - 1];

    if (!filePath || typeof filePath !== 'string') {
      throw new CommanderError(
        1,
        'ERR_INVALID_IMPORT_TYPE_OVERRIDE',
        `Invalid import type override: ${value}. Expected format: filepath originalModule:importTypeName:customImportPath`
      );
    }

    const [overrides] = previous;
    overrides[filePath] = overrides[filePath] ?? {};
    overrides[filePath][originalModule] =
      overrides[filePath][originalModule] ?? {};
    overrides[filePath][originalModule][typeName] = overrideModule;

    return previous;
  } else {
    throw new CommanderError(
      1,
      'ERR_INVALID_IMPORT_TYPE_OVERRIDE',
      `Invalid import type override: ${value}. Expected format: filepath namespace:importTypeName:importPath`
    );
  }
}

type CreateAPIClientFnArg = [
  functionName: string,
  value: Partial<CreateAPIClientFnOptions>,
];

const createApiClientFnDefault = [
  [
    'createAPIClient',
    {
      services: ['all'],
      callbacks: ['all'],
      filename: ['create-api-client'],
    },
  ],
] as const;
