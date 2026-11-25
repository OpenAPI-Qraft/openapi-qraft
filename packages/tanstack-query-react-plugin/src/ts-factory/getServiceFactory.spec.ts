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
import { resolveTanStackQueryCapabilities } from '../lib/resolveTanStackQueryVersion.js';
import { astToString } from './astToString.js';
import { getServiceFactory } from './getServiceFactory.js';

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

      const files = new Map([
        [path.resolve('ItemsService.ts'), source],
        [
          path.resolve('usage.ts'),
          `
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
        void [withPageParam, checkSelected];
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

  expect(getCompilationDiagnostics(files)).toEqual([]);
}

function getCompilationDiagnostics(
  files: ReadonlyMap<string, string>
): string[] {
  const host = ts.createCompilerHost(compilerOptions);
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

    if (content !== undefined) {
      return ts.createSourceFile(fileName, content, languageVersion, true);
    }

    const cached = sourceFileCache.get(fileName);
    if (cached && !shouldCreateNewSourceFile) return cached;

    const sourceFile = getSourceFile(
      fileName,
      languageVersion,
      onError,
      shouldCreateNewSourceFile
    );
    if (sourceFile) sourceFileCache.set(fileName, sourceFile);
    return sourceFile;
  };

  const program = ts.createProgram([...files.keys()], compilerOptions, host);
  return ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );
}
