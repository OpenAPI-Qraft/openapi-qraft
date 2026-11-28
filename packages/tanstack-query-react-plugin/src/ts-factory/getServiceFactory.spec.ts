import type { OpenAPISchemaType } from '@openapi-qraft/plugin/lib/open-api/OpenAPISchemaType';
import type { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import type { ServiceFactoryOptions } from './getServiceFactory.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getServices } from '@openapi-qraft/plugin/lib/open-api/getServices';
import {
  parseOperationNameModifier,
  processOperationNameModifierOption,
} from '@openapi-qraft/plugin/lib/processOperationNameModifierOption';
import ts from 'typescript';
import { afterAll, describe, expect, it, test } from 'vitest';
import { resolveTanStackQueryCapabilities } from '../lib/resolveTanStackQueryVersion.js';
import { astToString } from './astToString.js';
import { getServiceFactory } from './getServiceFactory.js';
import { getServiceIndexFactory } from './getServiceIndexFactory.js';

const compilerOptions: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022,
};

// Disk sources stay unchanged within this suite; virtual files belong to each case.
const sourceFileCache = new Map<string, ts.SourceFile>();

// TypeScript compiler checks can exceed the default 5s timeout on CI runners.
describe('service operation variable names', { timeout: 30_000 }, () => {
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

  it('avoids collisions with QraftServiceOperationsToken and QraftServiceOperationInvokeToken', () => {
    const service = createServiceWithExactOperationNames([
      'QraftServiceOperationsToken',
      'QraftServiceOperationInvokeToken',
    ]);
    const source = generateService(service);
    const servicesIndexSource = astToString(
      getServiceIndexFactory([service], { explicitImportExtensions: undefined })
    );

    expect(source).toContain(
      'export const QraftServiceOperationsTokenOperation ='
    );
    expect(source).toContain(
      'export const QraftServiceOperationInvokeTokenOperation ='
    );
    expect(source).toContain(
      'QraftServiceOperationsToken: QraftServiceOperationsTokenOperation'
    );
    expect(source).toContain(
      'QraftServiceOperationInvokeToken: QraftServiceOperationInvokeTokenOperation'
    );
    expect(servicesIndexSource).toContain(
      'QraftServiceOperationInvokeTokenOperation as items_QraftServiceOperationInvokeToken'
    );

    expectCompiles(
      service,
      source,
      `
      import {
        QraftServiceOperationsTokenOperation,
        QraftServiceOperationInvokeTokenOperation,
        itemsService,
        type ItemsService,
      } from './ItemsService';
      import { services } from './servicesIndex';

      const opsTokenOp: typeof QraftServiceOperationsTokenOperation =
        itemsService.QraftServiceOperationsToken;
      const invokeTokenOp: typeof QraftServiceOperationInvokeTokenOperation =
        itemsService.QraftServiceOperationInvokeToken;
      const indexedInvokeOp: typeof QraftServiceOperationInvokeTokenOperation =
        services.items.QraftServiceOperationInvokeToken;
      const ifaceCheck: ItemsService['QraftServiceOperationInvokeToken'] =
        null as unknown as ItemsService['QraftServiceOperationInvokeToken'];
      void [opsTokenOp, invokeTokenOp, indexedInvokeOp, ifaceCheck];
    `,
      {
        'servicesIndex.ts': servicesIndexSource,
      },
      {
        declaration: true,
        emitDeclarationOnly: true,
      }
    );
  });

  it('avoids collisions between generated <Op>Invoke type aliases and existing operation, service, or wrapper names', () => {
    const service = createServiceWithExactOperationNames([
      'listItems',
      'ListItemsInvoke',
      'ListItemsInvoke2',
    ]);
    const source = generateService(service);

    expect(source).toContain('listItems: ListItemsInvoke3 & {');
    expect(source).toContain(
      '[QraftServiceOperationInvokeToken]: ListItemsInvoke3'
    );
    expect(source).toContain('type ListItemsInvoke3 = {');
    expect(source).toContain('ListItemsInvoke: ListItemsInvokeInvoke & {');
    expect(source).toContain('ListItemsInvoke2: ListItemsInvoke2Invoke & {');
    expectCompiles(
      service,
      source,
      `
      import {
        listItems,
        ListItemsInvoke,
        ListItemsInvoke2,
        type ItemsService,
      } from './ItemsService';

      const a: ItemsService['listItems'] = null as unknown as ItemsService['listItems'];
      const b: ItemsService['ListItemsInvoke'] = null as unknown as ItemsService['ListItemsInvoke'];
      const c: ItemsService['ListItemsInvoke2'] = null as unknown as ItemsService['ListItemsInvoke2'];
      void [listItems, ListItemsInvoke, ListItemsInvoke2, a, b, c];
    `,
      {},
      {
        declaration: true,
        emitDeclarationOnly: true,
      }
    );

    const collidedServiceType: OpenAPIService = {
      ...createService(['listItems']),
      typeName: 'ListItemsInvoke',
    };
    const serviceCollisionSource = generateService(collidedServiceType);
    expect(serviceCollisionSource).toContain('listItems: ListItemsInvoke2 & {');
    expect(serviceCollisionSource).toContain(
      '[QraftServiceOperationInvokeToken]: ListItemsInvoke2'
    );
    expect(serviceCollisionSource).toContain('type ListItemsInvoke2 = {');
    expectCompiles(
      collidedServiceType,
      serviceCollisionSource,
      `
      import { listItems, type ListItemsInvoke } from './ItemsService';
      const op: ListItemsInvoke['listItems'] = null as unknown as ListItemsInvoke['listItems'];
      void [listItems, op];
    `,
      {},
      {
        declaration: true,
        emitDeclarationOnly: true,
      }
    );

    const wrapperService = createService(['listItems']);
    const wrapperCollisionSource = generateService(wrapperService, {
      operationParametersTypeWrapper: {
        '/items/listItems': { type: 'ListItemsInvoke', import: './wrapper' },
      },
    });
    expect(wrapperCollisionSource).toContain('listItems: ListItemsInvoke2 & {');
    expect(wrapperCollisionSource).toContain(
      '[QraftServiceOperationInvokeToken]: ListItemsInvoke2'
    );
    expect(wrapperCollisionSource).toContain('type ListItemsInvoke2 = {');
    expectCompiles(
      wrapperService,
      wrapperCollisionSource,
      `
      import { listItems, type ItemsService } from './ItemsService';
      const op: ItemsService['listItems'] = null as unknown as ItemsService['listItems'];
      void [listItems, op];
    `,
      {
        'wrapper.ts': `
          export type ListItemsInvoke<TSchema, TOperation, TData, TError> = undefined;
        `,
      },
      {
        declaration: true,
        emitDeclarationOnly: true,
      }
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

  it('uses a computed property key for __proto__ operations in the service object', () => {
    const baseService = createService(['protoOp', 'listItems']);
    const service: OpenAPIService = {
      ...baseService,
      operations: baseService.operations.map((operation, index) =>
        index === 0 ? { ...operation, name: '__proto__' } : operation
      ),
    };
    const source = generateService(service);

    expect(source).toContain('export const __proto__ =');
    expect(source).toContain('["__proto__"]: __proto__,');
    expect(source).not.toContain('__proto__: __proto__');
    expect(source).not.toMatch(
      /export const itemsService = \{[^}]*(?:\{|,)\s*__proto__\s*(?:,|\})/s
    );

    expectCompiles(
      service,
      source,
      `
        import { __proto__ as protoOperation, itemsService } from './ItemsService';
        const op: typeof protoOperation = itemsService['__proto__'];
        void op;
      `
    );

    const filesWithoutServiceObject = new Map([
      [
        path.resolve('ItemsService.ts'),
        generateService(service, { exportServiceObject: false }),
      ],
      [
        path.resolve('usage.ts'),
        `
          import { __proto__ as protoOperation, type ItemsService } from './ItemsService';
          const op: ItemsService['__proto__'] = null as unknown as ItemsService['__proto__'];
          void [protoOperation, op];
        `,
      ],
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

    expect(
      getCompilationDiagnostics(filesWithoutServiceObject, {
        declaration: true,
        emitDeclarationOnly: true,
      })
    ).toEqual([]);
  });

  it('keeps virtual files and type errors isolated between compilations', () => {
    const globalsPath = path.resolve('globals.d.ts');
    const stringDeclaration = 'declare const caseOnlyValue: string;';
    const files = new Map([
      [path.resolve('usage.ts'), 'const value: string = caseOnlyValue;'],
      [globalsPath, stringDeclaration],
    ]);

    expect(getCompilationDiagnostics(files)).toEqual([]);

    files.set(globalsPath, 'declare const caseOnlyValue: number;');
    expect(getCompilationDiagnostics(files)).toEqual([
      "Type 'number' is not assignable to type 'string'.",
    ]);

    files.delete(globalsPath);
    expect(getCompilationDiagnostics(files)).toEqual([
      "Cannot find name 'caseOnlyValue'.",
    ]);

    files.set(globalsPath, stringDeclaration);
    expect(getCompilationDiagnostics(files)).toEqual([]);
  });
});

describe(
  'imperativeQuery and deprecatedMethods codegen',
  { timeout: 30_000 },
  () => {
    it('generates and compiles query and infiniteQuery when imperativeQuery is enabled', () => {
      const optionalService = createService(['listItems']);
      const optionalSource = generateService(optionalService, {
        imperativeQuery: true,
      });

      expect(optionalSource).toContain(
        'from "@openapi-qraft/tanstack-query-react-types/imperative-query"'
      );
      expect(optionalSource).toContain('query<TData = ListItemsData>(');
      expect(optionalSource).toContain('infiniteQuery<TPageParam extends');

      expectCompiles(
        optionalService,
        optionalSource,
        `
      import type { ItemsService } from './ItemsService';
      declare const items: ItemsService;

      const direct: Promise<string> = items.listItems.query();
      const emptyOpts: Promise<string> = items.listItems.query({});
      const selected: Promise<number> = items.listItems.query({
        staleTime: 'static',
        select: (data) => data.length,
      });
      const infinite = items.listItems.infiniteQuery({
        getNextPageParam: () => undefined,
      });
      const infiniteSelected: Promise<number> = items.listItems.infiniteQuery({
        getNextPageParam: () => undefined,
        select: (data) => data.pages.length,
      });
      void [direct, emptyOpts, selected, infinite, infiniteSelected];
    `
      );
    });

    it('compiles infiniteQuery with initialPageParam and select for optional query parameters', () => {
      const schema: OpenAPISchemaType = {
        openapi: '3.1.0',
        info: { title: 'Optional params', version: '1.0.0' },
        components: { parameters: undefined },
        paths: {
          '/items': {
            get: {
              operationId: 'listPagedItems',
              parameters: [
                {
                  name: 'cursor',
                  in: 'query',
                  required: false,
                  schema: { type: 'string' },
                },
              ],
              responses: {
                200: {
                  description: 'Successful response',
                  content: {
                    'application/json': { schema: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      };
      const service = getServices(schema)[0];
      const source = generateService(service, { imperativeQuery: true });

      expect(source).toContain(
        'TData = OperationInfiniteData<ListPagedItemsData, ListPagedItemsParameters>'
      );

      const files = new Map([
        [path.resolve('ItemsService.ts'), source],
        [
          path.resolve('usage.ts'),
          `
        import type { OperationInfiniteData } from '@openapi-qraft/tanstack-query-react-types';
        import type { ServiceOperationImperativeInfiniteQueryOptions } from '@openapi-qraft/tanstack-query-react-types/imperative-query';
        import type { ItemsService } from './ItemsService';
        declare const items: ItemsService;

        const withPageParam = items.listPagedItems.infiniteQuery({
          initialPageParam: { query: { cursor: 'abc' } },
          getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam,
        });
        const withEmptyPageParam = items.listPagedItems.infiniteQuery({
          initialPageParam: {},
          getNextPageParam: () => undefined,
          staleTime: 'static',
          select: (data) => data.pages.length,
        });
        const checkSelected: Promise<number> = withEmptyPageParam;

        type NarrowCursorParam = { query: { cursor: 'a' | 'b' } };
        const narrowOpts: ServiceOperationImperativeInfiniteQueryOptions<
          typeof items.listPagedItems.schema,
          typeof items.listPagedItems.types.data,
          typeof items.listPagedItems.types.parameters,
          NarrowCursorParam,
          typeof items.listPagedItems.types.error
        > = {
          initialPageParam: { query: { cursor: 'a' } },
          getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
            lastPageParam.query?.cursor satisfies 'a' | 'b' | undefined;
            return { query: { cursor: 'b' } };
          },
        };
        const withNarrowOpts: Promise<
          OperationInfiniteData<
            typeof items.listPagedItems.types.data,
            typeof items.listPagedItems.types.parameters
          >
        > = items.listPagedItems.infiniteQuery<NarrowCursorParam>(narrowOpts);

        void [withPageParam, checkSelected, withNarrowOpts];
      `,
        ],
        [
          path.resolve('openapi.ts'),
          `
        export interface paths {
          '/items': {
            get: {
              parameters: { query?: { cursor?: string } };
              responses: { 200: { content: { 'application/json': string } } };
            };
          };
        }
      `,
        ],
      ]);

      expect(getCompilationDiagnostics(files)).toEqual([]);
    });

    it('requires options for query when parameters are required', () => {
      const schema: OpenAPISchemaType = {
        openapi: '3.1.0',
        info: { title: 'Required params', version: '1.0.0' },
        components: { parameters: undefined },
        paths: {
          '/items/{itemId}': {
            get: {
              operationId: 'getItem',
              parameters: [
                {
                  name: 'itemId',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' },
                },
              ],
              responses: {
                200: {
                  description: 'Successful response',
                  content: {
                    'application/json': { schema: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      };
      const service = getServices(schema)[0];
      const source = generateService(service, { imperativeQuery: true });

      const files = new Map([
        [path.resolve('ItemsService.ts'), source],
        [
          path.resolve('usage.ts'),
          `
        import type { ItemsService } from './ItemsService';
        declare const items: ItemsService;
        const ok: Promise<string> = items.getItem.query({
          parameters: { path: { itemId: '1' } },
        });
        // @ts-expect-error - options with required parameters cannot be omitted
        const invalid = items.getItem.query();
        void [ok, invalid];
      `,
        ],
        [
          path.resolve('openapi.ts'),
          `
        export interface paths {
          '/items/{itemId}': {
            get: {
              parameters: { path: { itemId: string } };
              responses: { 200: { content: { 'application/json': string } } };
            };
          };
        }
      `,
        ],
      ]);

      expect(getCompilationDiagnostics(files)).toEqual([]);
    });

    it('omits imperative query methods and subpath imports when imperativeQuery is disabled', () => {
      const service = createService(['listItems']);
      const source = generateService(service, { imperativeQuery: false });

      expect(source).not.toContain('imperative-query');
      expect(source).not.toContain('query<');
      expect(source).not.toContain('infiniteQuery<');
      expectCompiles(service, source);
    });

    it('emits merged @deprecated TSDoc without duplicate @deprecated tags', () => {
      const schema: OpenAPISchemaType = {
        openapi: '3.1.0',
        info: { title: 'Deprecated ops', version: '1.0.0' },
        components: { parameters: undefined },
        paths: {
          '/items/old': {
            get: {
              operationId: 'getOldItems',
              deprecated: true,
              summary: 'Legacy endpoint',
              responses: {
                200: {
                  description: 'Successful response',
                  content: {
                    'application/json': { schema: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      };
      const service = getServices(schema)[0];
      const capabilities = resolveTanStackQueryCapabilities({
        kind: 'semver',
        major: 5,
        minor: 108,
        patch: 1,
      });
      const source = generateService(service, {
        imperativeQuery: capabilities.imperativeQuery,
        deprecatedMethods: capabilities.deprecatedMethods,
      });

      expect(source).toContain(
        '@deprecated This operation is deprecated. Use `query(...)` instead.'
      );
      expect(source).toContain(
        "@deprecated This operation is deprecated. Use `query({ ...options, staleTime: 'static' })` instead."
      );
      expect(source).toContain(
        '@deprecated This operation is deprecated. Use `infiniteQuery(...)` instead.'
      );

      const fetchQuerySignatureIndex = source.indexOf('fetchQuery(options:');
      const fetchQueryBlock = source.slice(
        source.lastIndexOf('/**', fetchQuerySignatureIndex),
        fetchQuerySignatureIndex
      );
      expect(fetchQueryBlock).toContain(
        '@deprecated This operation is deprecated. Use `query(...)` instead.'
      );
      expect(fetchQueryBlock.match(/@deprecated/g)).toHaveLength(1);
    });
  }
);

describe('shared service operation option aliases', { timeout: 30_000 }, () => {
  const queryOptionAliases = [
    'ServiceOperationUseQueryDefinedOptions',
    'ServiceOperationUseQueryUndefinedOptions',
    'ServiceOperationUseSuspenseQueryOptions',
    'ServiceOperationUseInfiniteQueryDefinedOptions',
    'ServiceOperationUseInfiniteQueryUndefinedOptions',
    'ServiceOperationUseSuspenseInfiniteQueryOptions',
  ] as const;

  const removedTanStackTypes = [
    'DefinedInitialDataOptions',
    'UndefinedInitialDataOptions',
    'UseSuspenseQueryOptions',
    'DefinedInitialDataInfiniteOptions',
    'UndefinedInitialDataInfiniteOptions',
    'UseSuspenseInfiniteQueryOptions',
    'InfiniteQueryPageParamsOptions',
    'MutationCache',
  ] as const;

  function getImportedSpecifiersByModule(
    source: string
  ): Record<string, string[]> {
    const sourceFile = ts.createSourceFile(
      'service.ts',
      source,
      ts.ScriptTarget.Latest,
      true
    );
    const imports: Record<string, string[]> = {};

    for (const statement of sourceFile.statements) {
      if (
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings)
      ) {
        imports[statement.moduleSpecifier.text] =
          statement.importClause.namedBindings.elements.map(
            (element) => element.name.text
          );
      }
    }

    return imports;
  }

  const queryAndMutationOpenAPITypes = `
    export interface paths {
      '/items': {
        get: {
          parameters: { query?: { cursor?: string } };
          responses: {
            200: { content: { 'application/json': string } };
            400: { content: { 'application/json': { message: string } } };
          };
        };
      };
      '/items/{itemId}': {
        delete: {
          parameters: { path: { itemId: string } };
          responses: {
            200: { content: { 'application/json': { deleted: boolean } } };
            404: { content: { 'application/json': { error: string } } };
          };
        };
      };
    }
  `;

  function createQueryAndMutationService(): OpenAPIService {
    const schema: OpenAPISchemaType = {
      openapi: '3.1.0',
      info: { title: 'Query and mutation ops', version: '1.0.0' },
      components: { parameters: undefined },
      paths: {
        '/items': {
          get: {
            operationId: 'listItems',
            parameters: [
              {
                name: 'cursor',
                in: 'query',
                required: false,
                schema: { type: 'string' },
              },
            ],
            responses: {
              200: {
                description: 'Successful response',
                content: { 'application/json': { schema: { type: 'string' } } },
              },
              400: {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { message: { type: 'string' } },
                      required: ['message'],
                    },
                  },
                },
              },
            },
          },
        },
        '/items/{itemId}': {
          delete: {
            operationId: 'deleteItem',
            parameters: [
              {
                name: 'itemId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: {
              200: {
                description: 'Deleted',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { deleted: { type: 'boolean' } },
                      required: ['deleted'],
                    },
                  },
                },
              },
              404: {
                description: 'Not found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { error: { type: 'string' } },
                      required: ['error'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    return getServices(schema)[0];
  }

  it('emits shared option aliases and omits unused inline Omit types and TanStack Query imports', () => {
    const queryOnlySource = generateService(createService(['listItems']));
    const queryOnlyImports = getImportedSpecifiersByModule(queryOnlySource);
    expect(queryOnlySource).not.toContain('Omit<');
    for (const typeName of removedTanStackTypes) {
      expect(queryOnlyImports['@tanstack/react-query']).not.toContain(typeName);
    }
    expect(
      queryOnlyImports['@openapi-qraft/tanstack-query-react-types']
    ).not.toContain('PartialParameters');
    expect(
      queryOnlyImports['@openapi-qraft/tanstack-query-react-types']
    ).toEqual(expect.arrayContaining([...queryOptionAliases]));
    expect(
      queryOnlyImports['@openapi-qraft/tanstack-query-react-types']
    ).not.toContain('ServiceOperationMutationCacheBase');

    const mixedSource = generateService(createQueryAndMutationService());
    const mixedImports = getImportedSpecifiersByModule(mixedSource);
    expect(mixedSource).not.toContain('Omit<');
    for (const typeName of removedTanStackTypes) {
      expect(mixedImports['@tanstack/react-query']).not.toContain(typeName);
    }
    expect(
      mixedImports['@openapi-qraft/tanstack-query-react-types']
    ).not.toContain('PartialParameters');
    expect(mixedImports['@openapi-qraft/tanstack-query-react-types']).toEqual(
      expect.arrayContaining([
        ...queryOptionAliases,
        'ServiceOperationMutationCacheBase',
      ])
    );
  });

  it('does not double-wrap TPageParam with DeepReadonly in generated infinite query signatures', () => {
    const service = createQueryAndMutationService();
    const sourceWithoutImperative = generateService(service, {
      imperativeQuery: false,
    });
    const sourceWithImperative = generateService(service, {
      imperativeQuery: true,
    });

    for (const source of [sourceWithoutImperative, sourceWithImperative]) {
      expect(source).not.toContain('DeepReadonly<TPageParam>');
      expect(source).toContain('ServiceOperationFetchInfiniteQueryOptions<');
      expect(source).toContain(
        'ServiceOperationEnsureInfiniteQueryDataOptions<'
      );
    }

    expect(sourceWithImperative).toContain(
      'ServiceOperationImperativeInfiniteQueryOptions<'
    );
    expect(sourceWithImperative).toContain('NoInfer<TPageParam>');
  });

  it('preserves overload resolution, select, TPageParam, OperationError, and MutationCache inference', () => {
    const service = createQueryAndMutationService();
    const source = generateService(service);

    const files = new Map([
      [path.resolve('ItemsService.ts'), source],
      [path.resolve('openapi.ts'), queryAndMutationOpenAPITypes],
      [
        path.resolve('usage.ts'),
        `
          import type { ItemsService } from './ItemsService';
          import { skipToken } from '@tanstack/react-query';

          declare const items: ItemsService;

          const definedQuery = items.listItems.useQuery(
            { query: { cursor: '1' } } as const,
            { initialData: 'seed' }
          );
          const _definedData: string = definedQuery.data;
          definedQuery.error satisfies { message: string } | Error | null;

          const undefinedQuery = items.listItems.useQuery(
            { query: { cursor: '1' } } as const
          );
          undefinedQuery.data satisfies string | undefined;
          // @ts-expect-error - undefined overload includes undefined in data
          const _undefinedData: string = undefinedQuery.data;

          const selectedQuery = items.listItems.useQuery(undefined, {
            select: (data) => data.length,
            queryFn: skipToken,
          });
          selectedQuery.data satisfies number | undefined;
          items.listItems.useQuery(undefined, {
            // @ts-expect-error - queryKey is omitted from options
            queryKey: items.listItems.getQueryKey(),
          });

          const suspenseQuery = items.listItems.useSuspenseQuery(
            { query: { cursor: '1' } } as const,
            { select: (data) => data.length }
          );
          suspenseQuery.data satisfies number;
          suspenseQuery.error satisfies { message: string } | Error | null;
          items.listItems.useSuspenseQuery(undefined, {
            // @ts-expect-error - queryKey is omitted from options
            queryKey: items.listItems.getQueryKey(),
          });
          items.listItems.useSuspenseQuery(undefined, {
            // @ts-expect-error - skipToken is not allowed in useSuspenseQuery
            queryFn: skipToken,
          });

          const definedInfinite = items.listItems.useInfiniteQuery(
            { query: { cursor: '1' } } as const,
            {
              initialPageParam: { query: { cursor: '0' } } as const,
              getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
                lastPageParam.query?.cursor satisfies string | undefined;
                return undefined;
              },
              initialData: { pages: ['first'], pageParams: [{}] },
            }
          );
          const _definedInfinitePages: Array<string> =
            definedInfinite.data.pages;

          const undefinedInfinite = items.listItems.useInfiniteQuery(
            { query: { cursor: '1' } } as const,
            {
              initialPageParam: { query: { cursor: '0' } } as const,
              getNextPageParam: () => undefined,
              getPreviousPageParam: (
                _firstPage,
                _allPages,
                firstPageParam
              ) => {
                firstPageParam.query?.cursor satisfies string | undefined;
                return undefined;
              },
              select: (data) => data.pages.length,
              queryFn: skipToken,
            }
          );
          undefinedInfinite.data satisfies number | undefined;
          // @ts-expect-error - undefined infinite overload includes undefined in data
          const _undefinedInfiniteData: number = undefinedInfinite.data;

          const suspenseInfinite = items.listItems.useSuspenseInfiniteQuery(
            { query: { cursor: '1' } } as const,
            {
              initialPageParam: { query: { cursor: '0' } } as const,
              getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
                lastPageParam.query?.cursor satisfies string | undefined;
                return undefined;
              },
              select: (data) => data.pages.length,
            }
          );
          suspenseInfinite.data satisfies number;

          const explicitSuspenseInfinite =
            items.listItems.useSuspenseInfiniteQuery<
              typeof items.listItems.types.parameters,
              { custom: number }
            >(undefined, {
              initialPageParam: {},
              getNextPageParam: (lastPage) => {
                lastPage satisfies { custom: number };
                return undefined;
              },
            });
          explicitSuspenseInfinite.data.pages satisfies Array<{
            custom: number;
          }>;

          const mutationCache = items.deleteItem.getMutationCache();
          const foundMutation = mutationCache.find({
            parameters: { path: { itemId: '1' } },
          });
          foundMutation?.state.data satisfies
            | { deleted: boolean }
            | undefined;
          mutationCache.findAll({ exact: true }).length satisfies number;
          mutationCache.getAll().length satisfies number;
          mutationCache.clear();

          void [
            _definedData,
            _undefinedData,
            _definedInfinitePages,
            _undefinedInfiniteData,
          ];
        `,
      ],
    ]);

    expect(getCompilationDiagnostics(files)).toEqual([]);
  });

  test.each([
    {
      name: 'Node10 with imperativeQuery: false',
      imperativeQuery: false,
      openapiTypesImportPath: './openapi',
      serviceImportPath: './ItemsService',
      options: {
        ...compilerOptions,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.Node10,
      },
    },
    {
      name: 'Node10 with imperativeQuery: true',
      imperativeQuery: true,
      openapiTypesImportPath: './openapi',
      serviceImportPath: './ItemsService',
      options: {
        ...compilerOptions,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.Node10,
      },
    },
    {
      name: 'NodeNext with imperativeQuery: false',
      imperativeQuery: false,
      openapiTypesImportPath: './openapi.js',
      serviceImportPath: './ItemsService.js',
      options: {
        ...compilerOptions,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        verbatimModuleSyntax: true,
      },
    },
    {
      name: 'NodeNext with imperativeQuery: true',
      imperativeQuery: true,
      openapiTypesImportPath: './openapi.js',
      serviceImportPath: './ItemsService.js',
      options: {
        ...compilerOptions,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        verbatimModuleSyntax: true,
      },
    },
  ])(
    'compiles under $name',
    ({
      imperativeQuery,
      openapiTypesImportPath,
      serviceImportPath,
      options,
    }) => {
      const service = createQueryAndMutationService();
      const source = generateService(service, {
        imperativeQuery,
        openapiTypesImportPath,
      });

      const imperativeUsage = imperativeQuery
        ? `
          import type {
            ServiceOperationImperativeInfiniteQueryOptions,
            ServiceOperationImperativeQueryOptions,
          } from '@openapi-qraft/tanstack-query-react-types/imperative-query';
          type _ImperativeAlias = ServiceOperationImperativeQueryOptions<
            { url: '/items'; method: 'get' },
            string,
            { query?: { cursor?: string } }
          >;
          const _directImperativeInfiniteOptions: ServiceOperationImperativeInfiniteQueryOptions<
            { url: '/items'; method: 'get' },
            string,
            { query?: { cursor?: string } },
            { query?: { cursor?: string } }
          > = {
            parameters: constParams,
            initialPageParam: constPageParam,
            getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
              lastPageParam.query?.cursor satisfies string | undefined;
              return constPageParam;
            },
          };
          const _imperativeResult: Promise<string> = items.listItems.query();
          const _imperativeInfiniteResult: Promise<number> =
            items.listItems.infiniteQuery({
              parameters: constParams,
              initialPageParam: constPageParam,
              getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
                lastPageParam.query?.cursor satisfies string | undefined;
                return constPageParam;
              },
              queryFn: ({ pageParam }) => {
                pageParam.query?.cursor satisfies string | undefined;
                return Promise.resolve('page');
              },
              select: (data) => data.pages.length,
            });
          void [
            _imperativeResult,
            _directImperativeInfiniteOptions,
            _imperativeInfiniteResult,
          ];
        `
        : '';

      const files = new Map([
        [path.resolve('ItemsService.ts'), source],
        [path.resolve('openapi.ts'), queryAndMutationOpenAPITypes],
        [
          path.resolve('usage.ts'),
          `
            import type {
              ServiceOperationEnsureInfiniteQueryDataOptions,
              ServiceOperationFetchInfiniteQueryOptions,
              ServiceOperationMutationCacheBase,
              ServiceOperationUseInfiniteQueryDefinedOptions,
              ServiceOperationUseInfiniteQueryUndefinedOptions,
              ServiceOperationUseQueryDefinedOptions,
              ServiceOperationUseQueryUndefinedOptions,
              ServiceOperationUseSuspenseInfiniteQueryOptions,
              ServiceOperationUseSuspenseQueryOptions,
            } from '@openapi-qraft/tanstack-query-react-types';
            import type { ItemsService } from '${serviceImportPath}';

            declare const items: ItemsService;

            const constParams = { query: { cursor: '1' } } as const;
            const constPageParam = { query: { cursor: '0' } } as const;

            type _SharedAliases = [
              ServiceOperationMutationCacheBase,
              ServiceOperationUseQueryDefinedOptions<
                { url: '/items'; method: 'get' },
                string,
                { query?: { cursor?: string } }
              >,
              ServiceOperationUseQueryUndefinedOptions<
                { url: '/items'; method: 'get' },
                string,
                { query?: { cursor?: string } }
              >,
              ServiceOperationUseSuspenseQueryOptions<
                { url: '/items'; method: 'get' },
                string,
                { query?: { cursor?: string } }
              >,
              ServiceOperationUseInfiniteQueryDefinedOptions<
                { url: '/items'; method: 'get' },
                string,
                { query?: { cursor?: string } },
                { query?: { cursor?: string } }
              >,
              ServiceOperationUseInfiniteQueryUndefinedOptions<
                { url: '/items'; method: 'get' },
                string,
                { query?: { cursor?: string } },
                { query?: { cursor?: string } }
              >,
              ServiceOperationUseSuspenseInfiniteQueryOptions<
                { url: '/items'; method: 'get' },
                string,
                { query?: { cursor?: string } },
                { query?: { cursor?: string } }
              >,
            ];

            const _directFetchInfiniteOptions: ServiceOperationFetchInfiniteQueryOptions<
              { url: '/items'; method: 'get' },
              string,
              { query?: { cursor?: string } },
              { query?: { cursor?: string } }
            > = {
              parameters: constParams,
              initialPageParam: constPageParam,
              getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
                lastPageParam.query?.cursor satisfies string | undefined;
                return constPageParam;
              },
            };

            const _directEnsureInfiniteOptions: ServiceOperationEnsureInfiniteQueryDataOptions<
              { url: '/items'; method: 'get' },
              string,
              { query?: { cursor?: string } },
              { query?: { cursor?: string } }
            > = {
              parameters: constParams,
              initialPageParam: constPageParam,
              getNextPageParam: () => constPageParam,
              revalidateIfStale: true,
            };

            const _fetchInfiniteResult = items.listItems.fetchInfiniteQuery({
              parameters: constParams,
              initialPageParam: constPageParam,
              getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
                lastPageParam.query?.cursor satisfies string | undefined;
                return constPageParam;
              },
              queryFn: ({ pageParam }) => {
                pageParam.query?.cursor satisfies string | undefined;
                return Promise.resolve('page');
              },
            });

            const _prefetchInfiniteResult: Promise<void> =
              items.listItems.prefetchInfiniteQuery({
                parameters: constParams,
                initialPageParam: constPageParam,
                getNextPageParam: () => undefined,
              });

            const _ensureInfiniteResult =
              items.listItems.ensureInfiniteQueryData({
                parameters: constParams,
                initialPageParam: constPageParam,
                getNextPageParam: () => undefined,
                revalidateIfStale: false,
              });

            const queryResult = items.listItems.useQuery();
            const mutationCache = items.deleteItem.getMutationCache();
            void [
              queryResult,
              mutationCache,
              _directFetchInfiniteOptions,
              _directEnsureInfiniteOptions,
              _fetchInfiniteResult,
              _prefetchInfiniteResult,
              _ensureInfiniteResult,
            ];
            ${imperativeUsage}
          `,
        ],
      ]);

      expect(getCompilationDiagnostics(files, options)).toEqual([]);
    }
  );
});

describe('service object exports', { timeout: 30_000 }, () => {
  it('marks the aggregating service object export as @deprecated by default', () => {
    const service = createService(['listItems']);
    const source = generateService(service);

    expect(source).toContain(
      [
        '/** @deprecated Import individual operations directly from this module instead. Pass `--service-object-exports false` to omit this export. */',
        'export const itemsService = {',
      ].join('\n')
    );
    expectCompiles(service, source);
  });

  it('omits the aggregating service object export when exportServiceObject is false while preserving types and variable names', () => {
    const service = createService(['listItems', 'delete', 'itemsService']);
    const source = generateService(service, { exportServiceObject: false });
    const servicesIndexSource = astToString(
      getServiceIndexFactory([service], { explicitImportExtensions: undefined })
    );

    expect(source).not.toContain('export const itemsService =');
    expect(source).toContain('export interface ItemsService {');
    expect(source).toContain('export const listItems =');
    expect(source).toContain('export const deleteOperation =');
    expect(source).toContain('export const itemsServiceOperation =');
    expect(servicesIndexSource).toContain(
      'itemsServiceOperation as items_itemsService'
    );

    const files = new Map([
      [path.resolve('ItemsService.ts'), source],
      [path.resolve('servicesIndex.ts'), servicesIndexSource],
      [
        path.resolve('usage.ts'),
        `
        import type { ItemsService } from './ItemsService';
        import { deleteOperation, itemsServiceOperation, listItems } from './ItemsService';
        import { services, type Services } from './servicesIndex';

        const typedService: ItemsService = null as unknown as Services['items'];
        const listCheck: typeof listItems = services.items.listItems;
        const deleteCheck: typeof deleteOperation = services.items.delete;
        const serviceOpCheck: typeof itemsServiceOperation = services.items.itemsService;
        void [typedService, listCheck, deleteCheck, serviceOpCheck];
      `,
      ],
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

    expect(
      getCompilationDiagnostics(files, {
        declaration: true,
        emitDeclarationOnly: true,
      })
    ).toEqual([]);
  });
});

describe(
  'QraftServiceOperationInvokeToken TSDoc and generic inference',
  { timeout: 30_000 },
  () => {
    const packageRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../..'
    );
    const virtualDir = path.join(packageRoot, '__virtual_invoke_tsdoc__');

    const schema: OpenAPISchemaType = {
      openapi: '3.1.0',
      info: { title: 'Invoke TSDoc API', version: '1.0.0' },
      components: { parameters: undefined },
      paths: {
        '/items': {
          get: {
            operationId: 'listItems',
            deprecated: true,
            summary: 'List items',
            description: 'Fetch paginated items from the catalog.',
            parameters: [
              {
                name: 'cursor',
                in: 'query',
                required: false,
                schema: { type: 'string' },
              },
            ],
            responses: {
              200: {
                description: 'Item list',
                content: {
                  'application/json': { schema: { type: 'string' } },
                },
              },
            },
          },
          post: {
            operationId: 'createItem',
            summary: 'Create item',
            description: 'Create a new catalog item.',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                    required: ['name'],
                  },
                },
              },
            },
            responses: {
              201: {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { id: { type: 'string' } },
                      required: ['id'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const openapiSource = `
      export interface paths {
        '/items': {
          get: {
            parameters: { query?: { cursor?: string } };
            responses: { 200: { content: { 'application/json': string } } };
          };
          post: {
            requestBody: { content: { 'application/json': { name: string } } };
            responses: { 201: { content: { 'application/json': { id: string } } } };
          };
        };
      }
    `;

    const baseService = getServices(schema)[0];

    function buildVirtualFiles(options: {
      queryableWriteOperations: boolean;
      exportServiceObject?: boolean;
    }): Map<string, string> {
      const serviceOptions: ServiceFactoryOptions = {
        openapiTypesImportPath: '../openapi.js',
        queryableWriteOperations: options.queryableWriteOperations,
        operationParametersTypeWrapper: undefined,
        exportServiceObject: options.exportServiceObject,
      };
      const serviceSource = astToString(
        getServiceFactory(
          baseService,
          baseService.operations,
          serviceOptions,
          undefined
        )
      );
      const servicesIndexSource = astToString(
        getServiceIndexFactory([baseService], {
          explicitImportExtensions: '.js',
          serviceOptions,
        })
      );

      const usageSource = `
        import type {
          QraftServiceOperationInvokeToken,
          QraftServiceOperationsToken,
        } from '@openapi-qraft/tanstack-query-react-types';
        import { qraftAPIClient } from '@openapi-qraft/react';
        import { operationInvokeFn } from '@openapi-qraft/react/callbacks/operationInvokeFn';
        import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
        import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
        import { services } from './services/index.js';
        import { listItems, type ItemsService } from './services/ItemsService.js';

        const client = qraftAPIClient(
          services,
          { operationInvokeFn, useQuery, useMutation },
          { requestFn: null as any, baseUrl: 'https://api.example.com' }
        );
        const singleOpClient = qraftAPIClient(
          listItems,
          { operationInvokeFn },
          { requestFn: null as any, baseUrl: 'https://api.example.com' }
        );
        const noInvokeClient = qraftAPIClient(
          services,
          { useQuery },
          { requestFn: null as any, baseUrl: 'https://api.example.com' }
        );

        declare const directService: ItemsService;

        // Direct service interface invoke calls with explicit <TMeta, TSignal> generics
        const directQuery = directService.listItems<{ traceId: string }, AbortSignal>({
          parameters: { query: { cursor: '1' } },
          meta: { traceId: 'direct-q' },
        });
        const directMutation = directService.createItem<{ traceId: string }, AbortSignal>({
          body: { name: 'widget' },
          meta: { traceId: 'direct-m' },
        });

        // Filtered qraftAPIClient invoke calls with explicit <TMeta, TSignal> generics
        const clientQuery = client.items.listItems<{ traceId: string }, AbortSignal>({
          parameters: { query: { cursor: '1' } },
          meta: { traceId: 'client-q' },
        });
        const clientQueryZeroArgs = client.items.listItems();
        const clientMutation = client.items.createItem<{ traceId: string }, AbortSignal>({
          body: { name: 'widget' },
          meta: { traceId: 'client-m' },
        });

        // Single-operation client invoke call
        const singleQuery = singleOpClient<{ traceId: string }, AbortSignal>({
          parameters: { query: { cursor: '2' } },
          meta: { traceId: 'single-q' },
        });

        // Ensure QraftServiceOperationInvokeToken and QraftServiceOperationsToken never leak into user-facing types
        type InvokeClientKeys = keyof typeof client.items.listItems;
        type NoInvokeClientKeys = keyof typeof noInvokeClient.items.listItems;
        type DirectInterfaceKeys = keyof ItemsService['listItems'];
        type AssertNoInvokeLeak1 = QraftServiceOperationInvokeToken extends InvokeClientKeys ? never : true;
        type AssertNoInvokeLeak2 = QraftServiceOperationInvokeToken extends NoInvokeClientKeys ? never : true;
        type AssertNoInvokeLeak3 = QraftServiceOperationInvokeToken extends DirectInterfaceKeys ? never : true;
        type AssertNoOpsLeak1 = QraftServiceOperationsToken extends InvokeClientKeys ? never : true;
        type AssertNoOpsLeak2 = QraftServiceOperationsToken extends DirectInterfaceKeys ? never : true;
        const tokenLeakChecks: [
          AssertNoInvokeLeak1,
          AssertNoInvokeLeak2,
          AssertNoInvokeLeak3,
          AssertNoOpsLeak1,
          AssertNoOpsLeak2,
        ] = [true, true, true, true, true];

        // @ts-expect-error - operationInvokeFn was omitted so the operation is not callable
        noInvokeClient.items.listItems();

        void [
          directQuery,
          directMutation,
          clientQuery,
          clientQueryZeroArgs,
          clientMutation,
          singleQuery,
          tokenLeakChecks,
        ];
      `;

      return new Map<string, string>([
        [path.join(virtualDir, 'openapi.ts'), openapiSource],
        [
          path.join(virtualDir, 'services', `${baseService.fileBaseName}.ts`),
          serviceSource,
        ],
        [path.join(virtualDir, 'services', 'index.ts'), servicesIndexSource],
        [path.join(virtualDir, 'usage.ts'), usageSource],
      ]);
    }

    function createLanguageService(files: ReadonlyMap<string, string>) {
      const lsCompilerOptions: ts.CompilerOptions = {
        ...compilerOptions,
        noEmit: false,
        declaration: true,
        emitDeclarationOnly: true,
        verbatimModuleSyntax: true,
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
        baseUrl: packageRoot,
        paths: {
          '@openapi-qraft/react': ['../react-client/src/index.ts'],
          '@openapi-qraft/react/callbacks/*': [
            '../react-client/src/callbacks/*.ts',
          ],
        },
      };

      const virtualDirectories = new Set<string>();
      for (const fileName of files.keys()) {
        let dir = path.dirname(fileName);
        while (!virtualDirectories.has(dir)) {
          virtualDirectories.add(dir);
          const parent = path.dirname(dir);
          if (parent === dir) break;
          dir = parent;
        }
      }

      const host: ts.LanguageServiceHost = {
        getScriptFileNames: () => [...files.keys()],
        getScriptVersion: () => '1',
        getScriptSnapshot: (fileName) => {
          const content = files.get(fileName) ?? ts.sys.readFile(fileName);
          return content !== undefined
            ? ts.ScriptSnapshot.fromString(content)
            : undefined;
        },
        getCurrentDirectory: () => packageRoot,
        getCompilationSettings: () => lsCompilerOptions,
        getDefaultLibFileName: (opts) => ts.getDefaultLibFilePath(opts),
        fileExists: (fileName) =>
          files.has(fileName) || ts.sys.fileExists(fileName),
        readFile: (fileName) =>
          files.get(fileName) ?? ts.sys.readFile(fileName),
        directoryExists: (dirName) =>
          virtualDirectories.has(path.resolve(dirName)) ||
          ts.sys.directoryExists(dirName),
        getDirectories: ts.sys.getDirectories,
        realpath: ts.sys.realpath,
      };

      return {
        languageService: ts.createLanguageService(
          host,
          ts.createDocumentRegistry()
        ),
        lsCompilerOptions,
      };
    }

    function normalizeTags(tags: readonly ts.JSDocTagInfo[] | undefined) {
      return (tags ?? []).map((tag) => ({
        name: tag.name,
        text: ts.displayPartsToString(tag.text),
      }));
    }

    function getOffset(source: string, needle: string, offsetInside: number) {
      const index = source.indexOf(needle);
      if (index === -1) {
        throw new Error(`Needle not found: ${needle}`);
      }
      return index + offsetInside;
    }

    describe.each([
      { queryableWriteOperations: false, exportServiceObject: true },
      { queryableWriteOperations: true, exportServiceObject: false },
    ])(
      'queryableWriteOperations=$queryableWriteOperations exportServiceObject=$exportServiceObject',
      ({ queryableWriteOperations, exportServiceObject }) => {
        const files = buildVirtualFiles({
          queryableWriteOperations,
          exportServiceObject,
        });
        const usagePath = path.join(virtualDir, 'usage.ts');
        const usageSource = files.get(usagePath)!;
        const { languageService } = createLanguageService(files);

        afterAll(() => {
          languageService.dispose();
        });

        it('compiles without syntactic, semantic, or declaration emit diagnostics', () => {
          const serviceCode = files.get(
            path.join(virtualDir, 'services', `${baseService.fileBaseName}.ts`)
          )!;
          expect(serviceCode).toContain(
            '[QraftServiceOperationInvokeToken]: ListItemsInvoke'
          );
          expect(serviceCode).toContain(
            '[QraftServiceOperationInvokeToken]: CreateItemInvoke'
          );
          if (!exportServiceObject) {
            expect(serviceCode).not.toContain('export const itemsService');
          }

          const diagnostics = [
            ...languageService.getSyntacticDiagnostics(usagePath),
            ...languageService.getSemanticDiagnostics(usagePath),
          ];

          expect(
            diagnostics.map((d) =>
              ts.flattenDiagnosticMessageText(d.messageText, '\n')
            )
          ).toEqual([]);

          const emitOutput = languageService.getEmitOutput(usagePath, true);
          expect(emitOutput.emitSkipped).toBe(false);
          expect(emitOutput.outputFiles.length).toBeGreaterThan(0);

          const emitResult = languageService
            .getProgram()!
            .emit(undefined, () => {});
          expect(
            emitResult.diagnostics.map((d) =>
              ts.flattenDiagnosticMessageText(d.messageText, '\n')
            )
          ).toEqual([]);
        });

        it.each([
          {
            label: 'direct ItemsService.listItems',
            needle: 'directService.listItems<{ traceId: string }',
            calleeOffset: 'directService.'.length + 2,
            argOffset:
              'directService.listItems<{ traceId: string }, AbortSignal>('
                .length + 1,
          },
          {
            label: 'filtered client.items.listItems',
            needle: 'client.items.listItems<{ traceId: string }',
            calleeOffset: 'client.items.'.length + 2,
            argOffset:
              'client.items.listItems<{ traceId: string }, AbortSignal>('
                .length + 1,
          },
          {
            label: 'single-op client(listItems)',
            needle: 'singleOpClient<{ traceId: string }',
            calleeOffset: 2,
            argOffset:
              'singleOpClient<{ traceId: string }, AbortSignal>('.length + 1,
          },
        ])(
          'preserves TSDoc tags on QuickInfo and SignatureHelp for $label',
          ({ needle, calleeOffset, argOffset }) => {
            const quickInfo = languageService.getQuickInfoAtPosition(
              usagePath,
              getOffset(usageSource, needle, calleeOffset)
            );
            expect(normalizeTags(quickInfo?.tags)).toEqual([
              { name: 'deprecated', text: '' },
              { name: 'summary', text: 'List items' },
              {
                name: 'description',
                text: 'Fetch paginated items from the catalog.',
              },
            ]);

            const signatureHelp = languageService.getSignatureHelpItems(
              usagePath,
              getOffset(usageSource, needle, argOffset),
              undefined
            );
            expect(signatureHelp?.items).toHaveLength(1);
            expect(normalizeTags(signatureHelp?.items[0].tags)).toEqual([
              { name: 'deprecated', text: '' },
              { name: 'summary', text: 'List items' },
              {
                name: 'description',
                text: 'Fetch paginated items from the catalog.',
              },
            ]);
          }
        );

        it.each([
          {
            label: 'direct ItemsService.createItem',
            needle: 'directService.createItem<{ traceId: string }',
            calleeOffset: 'directService.'.length + 2,
            argOffset:
              'directService.createItem<{ traceId: string }, AbortSignal>('
                .length + 1,
          },
          {
            label: 'filtered client.items.createItem',
            needle: 'client.items.createItem<{ traceId: string }',
            calleeOffset: 'client.items.'.length + 2,
            argOffset:
              'client.items.createItem<{ traceId: string }, AbortSignal>('
                .length + 1,
          },
        ])(
          'preserves mutation TSDoc tags on QuickInfo and SignatureHelp for $label',
          ({ needle, calleeOffset, argOffset }) => {
            const quickInfo = languageService.getQuickInfoAtPosition(
              usagePath,
              getOffset(usageSource, needle, calleeOffset)
            );
            expect(normalizeTags(quickInfo?.tags)).toEqual([
              { name: 'summary', text: 'Create item' },
              { name: 'description', text: 'Create a new catalog item.' },
            ]);

            const signatureHelp = languageService.getSignatureHelpItems(
              usagePath,
              getOffset(usageSource, needle, argOffset),
              undefined
            );
            expect(signatureHelp?.items).toHaveLength(1);
            expect(normalizeTags(signatureHelp?.items[0].tags)).toEqual([
              { name: 'summary', text: 'Create item' },
              { name: 'description', text: 'Create a new catalog item.' },
            ]);
          }
        );

        it('reports @deprecated suggestion diagnostics for direct, filtered, and single-op invoke calls', () => {
          const deprecatedSuggestions = languageService
            .getSuggestionDiagnostics(usagePath)
            .filter((diagnostic) => diagnostic.code === 6387)
            .map((diagnostic) => ({
              snippet: usageSource.slice(
                diagnostic.start,
                diagnostic.start + diagnostic.length
              ),
              message: ts.flattenDiagnosticMessageText(
                diagnostic.messageText,
                '\n'
              ),
            }));

          expect(deprecatedSuggestions.map((d) => d.snippet)).toEqual(
            expect.arrayContaining(['listItems', 'singleOpClient'])
          );
          expect(
            deprecatedSuggestions.some((d) =>
              d.message.includes('directService.listItems')
            )
          ).toBe(true);
          expect(
            deprecatedSuggestions.some((d) =>
              d.message.includes('client.items.listItems')
            )
          ).toBe(true);
          expect(
            deprecatedSuggestions.some((d) =>
              d.message.includes('singleOpClient')
            )
          ).toBe(true);
        });
      }
    );
  }
);

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

function createServiceWithExactOperationNames(
  operationNames: string[]
): OpenAPIService {
  const service = createService(operationNames);

  return {
    ...service,
    operations: service.operations.map((operation, index) => ({
      ...operation,
      name: operationNames[index],
    })),
  };
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
  additionalFiles: Record<string, string> = {},
  extraOptions?: ts.CompilerOptions
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

  expect(getCompilationDiagnostics(files, extraOptions)).toEqual([]);
}

function getCompilationDiagnostics(
  files: ReadonlyMap<string, string>,
  extraOptions?: ts.CompilerOptions
): string[] {
  const effectiveOptions: ts.CompilerOptions = extraOptions
    ? {
        ...compilerOptions,
        ...extraOptions,
        ...(extraOptions.declaration ? { noEmit: false } : {}),
      }
    : compilerOptions;
  const host = ts.createCompilerHost(effectiveOptions);
  const { fileExists, readFile, getSourceFile } = host;
  const canUseDefaultCache = effectiveOptions === compilerOptions;

  host.fileExists = (fileName) => files.has(fileName) || fileExists(fileName);
  host.readFile = (fileName) => files.get(fileName) ?? readFile(fileName);
  host.writeFile = () => {};
  host.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNewSourceFile
  ) => {
    const content = files.get(fileName);

    if (content !== undefined) {
      return ts.createSourceFile(fileName, content, languageVersion, true);
    }

    if (canUseDefaultCache) {
      const cached = sourceFileCache.get(fileName);
      if (cached && !shouldCreateNewSourceFile) return cached;
    }

    const sourceFile = getSourceFile(
      fileName,
      languageVersion,
      onError,
      shouldCreateNewSourceFile
    );
    if (canUseDefaultCache && sourceFile) {
      sourceFileCache.set(fileName, sourceFile);
    }
    return sourceFile;
  };

  const program = ts.createProgram([...files.keys()], effectiveOptions, host);
  const preEmitDiagnostics = ts.getPreEmitDiagnostics(program);
  const emitDiagnostics = effectiveOptions.declaration
    ? program.emit().diagnostics
    : [];

  return [...preEmitDiagnostics, ...emitDiagnostics].map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
  );
}
