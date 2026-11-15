import type { OpenAPISchemaType } from '@openapi-qraft/plugin/lib/open-api/OpenAPISchemaType';
import type { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import type { ServiceFactoryOptions } from './getServiceFactory.js';
import path from 'node:path';
import { getServices } from '@openapi-qraft/plugin/lib/open-api/getServices';
import {
  parseOperationNameModifier,
  processOperationNameModifierOption,
} from '@openapi-qraft/plugin/lib/processOperationNameModifierOption';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { astToString } from './astToString.js';
import { getServiceFactory } from './getServiceFactory.js';

describe('service operation variable names', () => {
  it('compiles reserved words while preserving public operation names', () => {
    const service = createService([
      'arguments',
      'await',
      'break',
      'case',
      'catch',
      'class',
      'const',
      'continue',
      'debugger',
      'default',
      'delete',
      'do',
      'else',
      'enum',
      'eval',
      'export',
      'extends',
      'false',
      'finally',
      'for',
      'function',
      'if',
      'implements',
      'import',
      'in',
      'instanceof',
      'interface',
      'let',
      'new',
      'null',
      'package',
      'private',
      'protected',
      'public',
      'return',
      'static',
      'super',
      'switch',
      'this',
      'throw',
      'true',
      'try',
      'typeof',
      'var',
      'void',
      'while',
      'with',
      'yield',
    ]);
    const source = generateService(service);

    expect(source).toContain('export const deleteOperation =');
    expect(source).toContain('export const defaultOperation =');
    expect(source).toContain('delete: deleteOperation');
    expect(source).toContain('default: defaultOperation');
    expect(source).not.toContain('export default');
    expectCompiles(
      service,
      source,
      `
      import { deleteOperation, defaultOperation, itemsService } from './ItemsService';
      const deletion: typeof deleteOperation = itemsService.delete;
      const fallback: typeof defaultOperation = itemsService.default;
    `
    );
  });

  it('preserves ordinary operation exports and service shorthand properties', () => {
    const service = createService(['listItems']);
    const source = generateService(service);

    expect(source).toContain('export const listItems =');
    expect(source).toContain('export const itemsService = {\n    listItems\n}');
    expectCompiles(
      service,
      source,
      `
      import { listItems, itemsService } from './ItemsService';
      const operation: typeof listItems = itemsService.listItems;
    `
    );
  });

  it('avoids existing operation names when allocating safe variable names', () => {
    const service = createService([
      'delete',
      'deleteOperation',
      'deleteOperation2',
    ]);
    const source = generateService(service);

    expect(source).toContain('export const deleteOperation3 =');
    expect(source).toContain('delete: deleteOperation3');
    expectCompiles(
      service,
      source,
      `
      import { deleteOperation, deleteOperation2, deleteOperation3, itemsService } from './ItemsService';
      const reserved: '/items/delete' = itemsService.delete.schema.url;
      const ordinary: '/items/deleteOperation' = deleteOperation.schema.url;
      const numbered: '/items/deleteOperation2' = deleteOperation2.schema.url;
      const alias: typeof deleteOperation3 = itemsService.delete;
    `
    );
  });

  it('reserves operation names regardless of their position in the document', () => {
    const service = createService(['deleteOperation', 'delete']);
    const source = generateService(service);

    expect(source).toContain('delete: deleteOperation2');
    expectCompiles(service, source);
  });

  it('avoids collisions with the service variable and schema imports', () => {
    const service = createService(['itemsService', 'paths']);
    const source = generateService(service);

    expect(source).toContain('itemsService: itemsServiceOperation');
    expect(source).toContain('paths: pathsOperation');
    expectCompiles(
      service,
      source,
      `
      import { itemsServiceOperation, pathsOperation, itemsService } from './ItemsService';
      const serviceOperation: typeof itemsServiceOperation = itemsService.itemsService;
      const schemaOperation: typeof pathsOperation = itemsService.paths;
    `
    );
  });

  it('allocates safe names after operation name modifiers', () => {
    const { services, errors } = processOperationNameModifierOption(
      parseOperationNameModifier('/items/listItems:^listItems$ ==> delete'),
      [createService(['listItems'])]
    );

    expect(errors).toEqual([]);
    const source = generateService(services[0]);
    expect(source).toContain('export const deleteOperation =');
    expect(source).toContain('delete: deleteOperation');
    expectCompiles(
      services[0],
      source,
      `
      import { itemsService } from './ItemsService';
      const url: '/items/listItems' = itemsService.delete.schema.url;
    `
    );
  });

  it('reserves custom parameter wrapper imports when allocating variable names', () => {
    const service = createService(['wrapper', 'delete']);
    const source = generateService(service, {
      operationParametersTypeWrapper: {
        '/items/wrapper': { type: 'wrapper', import: './wrapper' },
        '/items/delete': { type: 'deleteOperation', import: './wrapper' },
      },
    });

    expect(source).toContain('wrapper: wrapperOperation');
    expect(source).toContain('delete: deleteOperation2');
    expectCompiles(
      service,
      source,
      `
        import { wrapperOperation, deleteOperation2, itemsService } from './ItemsService';
        const wrapper: typeof wrapperOperation = itemsService.wrapper;
        const deletion: typeof deleteOperation2 = itemsService.delete;
      `,
      {
        'wrapper.ts': `
          export type wrapper<TSchema, TOperation, TData, TError> = undefined;
          export type deleteOperation<TSchema, TOperation, TData, TError> = undefined;
        `,
      }
    );
  });
});

function createService(operationIds: string[]): OpenAPIService {
  const schema: OpenAPISchemaType = {
    openapi: '3.1.0',
    info: { title: 'Operation names', version: '1.0.0' },
    components: { parameters: undefined },
    paths: Object.fromEntries(
      operationIds.map((operationId) => [
        `/items/${operationId}`,
        {
          get: {
            operationId,
            responses: {
              default: { description: 'Unexpected response' },
              200: {
                description: 'Successful response',
                content: { 'application/json': { schema: { type: 'string' } } },
              },
            },
          },
        },
      ])
    ),
  };

  return getServices(schema)[0];
}

function generateService(
  service: OpenAPIService,
  options: Partial<ServiceFactoryOptions> = {}
): string {
  return astToString(
    getServiceFactory(
      service,
      service.operations,
      {
        openapiTypesImportPath: './openapi',
        queryableWriteOperations: false,
        operationParametersTypeWrapper: undefined,
        ...options,
      },
      undefined
    )
  );
}

function expectCompiles(
  service: OpenAPIService,
  source: string,
  usage = '',
  additionalFiles: Record<string, string> = {}
): void {
  const files = new Map([
    [path.resolve('ItemsService.ts'), source],
    [path.resolve('usage.ts'), usage],
    [
      path.resolve('openapi.ts'),
      `
      export interface paths {
        ${service.operations
          .map(
            (operation) => `
          ${JSON.stringify(operation.path)}: {
            ${operation.method}: {
              responses: { 200: { content: { 'application/json': string } } };
            };
          };
        `
          )
          .join('\n')}
      }
    `,
    ],
  ]);

  for (const [fileName, content] of Object.entries(additionalFiles)) {
    files.set(path.resolve(fileName), content);
  }

  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
  };
  const host = ts.createCompilerHost(options);
  const { fileExists, readFile, getSourceFile } = host;

  host.fileExists = (fileName) => files.has(fileName) || fileExists(fileName);
  host.readFile = (fileName) => files.get(fileName) ?? readFile(fileName);
  host.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNewSourceFile
  ) => {
    const content = files.get(fileName);

    return content === undefined
      ? getSourceFile(
          fileName,
          languageVersion,
          onError,
          shouldCreateNewSourceFile
        )
      : ts.createSourceFile(fileName, content, languageVersion, true);
  };

  const program = ts.createProgram([...files.keys()], options, host);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );

  expect(diagnostics).toEqual([]);
}
