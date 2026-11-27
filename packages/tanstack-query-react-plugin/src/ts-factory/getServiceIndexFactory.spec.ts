import type { OpenAPISchemaType } from '@openapi-qraft/plugin/lib/open-api/OpenAPISchemaType';
import type { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import type { ServiceFactoryOptions } from './getServiceFactory.js';
import path from 'node:path';
import { getServices } from '@openapi-qraft/plugin/lib/open-api/getServices';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { astToString } from './astToString.js';
import { getCreateAPIClientFactory } from './getCreateAPIClientFactory.js';
import { getIndexFactory } from './getIndexFactory.js';
import { getServiceFactory } from './getServiceFactory.js';
import { getServiceIndexFactory } from './getServiceIndexFactory.js';

const compilerOptions: ts.CompilerOptions = {
  strict: true,
  declaration: true,
  emitDeclarationOnly: true,
  skipLibCheck: true,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022,
  baseUrl: '.',
  paths: {
    '@openapi-qraft/react': ['../react-client/src/index.ts'],
    '@openapi-qraft/react/callbacks/index': [
      '../react-client/src/callbacks/index.ts',
    ],
  },
};

const sourceFileCache = new Map<string, ts.SourceFile>();

describe('getServiceIndexFactory', { timeout: 30_000 }, () => {
  it('generates per-operation imports, explicit typeof types, and Services type', () => {
    const services = [
      createService('files', 'FilesService', 'filesService', [
        'getFiles',
        'postFiles',
      ]),
      createService('users', 'UsersService', 'usersService', ['getUsers']),
    ];

    const withJsExtension = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );
    expect(withJsExtension).toContain(
      'import { type FilesService, getFiles as files_getFiles, postFiles as files_postFiles } from "./FilesService.js";'
    );
    expect(withJsExtension).toContain(
      'import { type UsersService, getUsers as users_getUsers } from "./UsersService.js";'
    );
    expect(withJsExtension).not.toContain('import type { FilesService }');
    expect(withJsExtension).not.toContain('import type { UsersService }');
    expect(withJsExtension).toContain('export type Services = {');
    expect(withJsExtension).toContain('files: FilesService;');
    expect(withJsExtension).toContain('users: UsersService;');
    expect(withJsExtension).toContain(
      [
        'readonly getFiles: typeof files_getFiles;',
        '        readonly postFiles: typeof files_postFiles;',
      ].join('\n')
    );
    expect(withJsExtension).toContain('getFiles: files_getFiles,');
    expect(withJsExtension).not.toContain('filesService');
    expect(withJsExtension).not.toContain('usersService');

    const withTsExtension = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.ts' })
    );
    expect(withTsExtension).toContain('from "./FilesService.ts";');

    const withoutExtension = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: undefined })
    );
    expect(withoutExtension).toContain('from "./FilesService";');
  });

  it('prevents collisions when different services share identical operation names', () => {
    const services = [
      createService('users', 'UsersService', 'usersService', [
        'getItems',
        'delete',
      ]),
      createService('projects', 'ProjectsService', 'projectsService', [
        'getItems',
        'delete',
      ]),
    ];

    const source = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );

    expect(source).toContain(
      'import { type UsersService, getItems as users_getItems, deleteOperation as users_delete } from "./UsersService.js";'
    );
    expect(source).toContain(
      'import { type ProjectsService, getItems as projects_getItems, deleteOperation as projects_delete } from "./ProjectsService.js";'
    );
    expect(source).toContain('readonly delete: typeof users_delete;');
    expect(source).toContain('readonly delete: typeof projects_delete;');
    expect(source).toContain('delete: users_delete');
    expect(source).toContain('delete: projects_delete');

    expectGeneratedProjectCompiles(services);
  });

  it('imports reserved-word and collided operation variables cleanly while preserving property keys', () => {
    const services = [
      createService('files', 'FilesService', 'filesService', [
        'delete',
        'default',
        'class',
        'filesService',
        'paths',
        'wrapper',
      ]),
    ];

    const serviceOptions: Partial<ServiceFactoryOptions> = {
      imperativeQuery: true,
      operationParametersTypeWrapper: {
        '/files/wrapper': { type: 'wrapper', import: './wrapper.js' },
        '/files/delete': { type: 'deleteOperation', import: './wrapper.js' },
      },
    };

    const source = astToString(
      getServiceIndexFactory(services, {
        explicitImportExtensions: '.js',
        serviceOptions,
      })
    );

    expect(source).toContain('deleteOperation2 as files_delete');
    expect(source).toContain('defaultOperation as files_default');
    expect(source).toContain('classOperation as files_class');
    expect(source).toContain('filesServiceOperation as files_filesService');
    expect(source).toContain('pathsOperation as files_paths');
    expect(source).toContain('wrapperOperation as files_wrapper');
    expect(source).toContain('delete: files_delete');
    expect(source).toContain('default: files_default');
    expect(source).toContain('class: files_class');
    expect(source).toContain('filesService: files_filesService');

    expectGeneratedProjectCompiles(services, serviceOptions, {
      'services/wrapper.ts': `
        export type wrapper<TSchema, TOperation, TData, TError> = undefined;
        export type deleteOperation<TSchema, TOperation, TData, TError> = undefined;
      `,
    });
  });

  it('guarantees alias uniqueness across boundary collisions like foo_bar+baz vs foo+bar_baz', () => {
    const services = [
      createService('foo_bar', 'FooBarService', 'fooBarService', ['baz']),
      createService('foo', 'FooService', 'fooService', [
        'bar_baz',
        'bar_baz_2',
      ]),
    ];

    const source = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );

    expect(source).toContain(
      'import { type FooBarService, baz as foo_bar_baz } from "./FooBarService.js";'
    );
    expect(source).toContain(
      'import { type FooService, bar_baz as foo_bar_baz_3, bar_baz_2 as foo_bar_baz_2 } from "./FooService.js";'
    );

    expectGeneratedProjectCompiles(services);
  });

  it('sanitizes special characters, leading digits, and top-level identifier collisions', () => {
    const services = [
      createService(
        'user-profile',
        'UserProfileService',
        'userProfileService',
        ['get.item']
      ),
      createService(
        'user_profile',
        'UserProfile2Service',
        'userProfile2Service',
        ['get_item']
      ),
      createService('123', 'NumericService', 'numericService', ['get']),
      createService('', 'EmptyNameService', 'emptyNameService', [
        'Services',
        'services',
        'delete',
      ]),
      createService('foo', 'foo_bar', 'fooService', ['bar']),
    ];

    const source = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );

    expect(source).toContain('as user_profile_get_item');
    expect(source).toContain('as user_profile_get_item_2');
    expect(source).toContain('as _123_get');
    expect(source).toContain('Services as service_Services');
    expect(source).toContain('services as service_services');
    expect(source).toContain('deleteOperation as service_delete');
    expect(source).toContain('bar as foo_bar_2');
    expect(source).toContain('"user-profile": UserProfileService;');
    expect(source).toContain(
      'readonly "get.item": typeof user_profile_get_item;'
    );
    expect(source).toContain('"123": NumericService;');
    expect(source).toContain('"": EmptyNameService;');

    const compilableServices = [
      createService(
        'user_profile',
        'UserProfileService',
        'userProfileService',
        ['get_item']
      ),
      createService('123', 'NumericService', 'numericService', ['get']),
      createService('', 'EmptyServicesService', 'emptyServicesService', [
        'Services',
      ]),
      createService('_', 'UnderscoreLowerService', 'underscoreLowerService', [
        'services',
        'delete',
      ]),
      createService('foo', 'foo_bar', 'fooService', ['bar']),
    ];

    expectGeneratedProjectCompiles(compilableServices);
  });

  it('omits value import for services with no operations', () => {
    const services: OpenAPIService[] = [
      {
        name: 'empty',
        variableName: 'emptyService',
        typeName: 'EmptyService',
        fileBaseName: 'EmptyService',
        operations: [],
      },
      createService('files', 'FilesService', 'filesService', ['getFiles']),
    ];

    const source = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );

    expect(source).toContain(
      'import type { EmptyService } from "./EmptyService.js";'
    );
    expect(source).not.toContain('import { type EmptyService');
    expect(source).toContain(
      'import { type FilesService, getFiles as files_getFiles } from "./FilesService.js";'
    );
    expect(source).not.toContain('import type { FilesService }');
    expect(source).toContain('empty: {};');
    expect(source).toContain('empty: {}');

    expectGeneratedProjectCompiles(services);
  });

  it('falls back to the service prefix when a service name has no ASCII identifier characters', () => {
    const services = [
      createService('日本語', 'JapaneseService', 'japaneseService', [
        'getFiles',
        'undefined',
        'Object',
      ]),
      createService('🚀', 'EmojiService', 'emojiService', ['getFiles']),
      createService('---', 'PunctuationService', 'punctuationService', [
        'delete',
      ]),
    ];

    const source = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );

    expect(source).toContain(
      'import { type JapaneseService, getFiles as service_getFiles, undefined as service_undefined, Object as service_Object } from "./JapaneseService.js";'
    );
    expect(source).toContain(
      'import { type EmojiService, getFiles as service_getFiles_2 } from "./EmojiService.js";'
    );
    expect(source).toContain(
      'import { type PunctuationService, deleteOperation as service_delete } from "./PunctuationService.js";'
    );
    expect(source).not.toContain('undefined as undefined');
    expect(source).not.toContain('Object as Object');
    expect(source).toContain('readonly getFiles: typeof service_getFiles;');
    expect(source).toContain('readonly getFiles: typeof service_getFiles_2;');

    expectGeneratedProjectCompiles(services);
  });

  it('uses computed ["__proto__"] keys in object literals for __proto__ service and operation names', () => {
    const services = [
      createService('files', 'FilesService', 'filesService', [
        '__proto__',
        'getFiles',
      ]),
      createService('__proto__', 'ProtoService', 'protoService', ['__proto__']),
    ];

    const source = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );

    expect(source).toContain(
      'import { type FilesService, __proto__ as files_proto, getFiles as files_getFiles } from "./FilesService.js";'
    );
    expect(source).toContain(
      'import { type ProtoService, __proto__ as proto_proto } from "./ProtoService.js";'
    );
    expect(source).toContain('readonly __proto__: typeof files_proto;');
    expect(source).toContain('readonly __proto__: typeof proto_proto;');
    expect(source).toContain('["__proto__"]: files_proto');
    expect(source).toContain('["__proto__"]: proto_proto');
    expect(source).toContain('["__proto__"]: {');
    const objectLiteralSection = source.slice(source.indexOf('} = {'));
    expect(objectLiteralSection).not.toContain('__proto__:');

    expectGeneratedProjectCompiles(services);
  });

  it('compiles single inline-type imports under verbatimModuleSyntax and enforces readonly operation properties', () => {
    const services: OpenAPIService[] = [
      {
        name: 'empty',
        variableName: 'emptyService',
        typeName: 'EmptyService',
        fileBaseName: 'EmptyService',
        operations: [],
      },
      createService('files', 'FilesService', 'filesService', ['getFiles']),
    ];

    const servicesIndexSource = astToString(
      getServiceIndexFactory(services, { explicitImportExtensions: '.js' })
    );

    const files = new Map<string, string>([
      [
        path.resolve('openapi.ts'),
        `
        export interface paths {
          '/files/getFiles': {
            get: {
              responses: { 200: { content: { 'application/json': string } } };
            };
          };
        }
      `,
      ],
      ...services.map(
        (service) =>
          [
            path.resolve(`services/${service.fileBaseName}.ts`),
            astToString(
              getServiceFactory(
                service,
                service.operations,
                {
                  openapiTypesImportPath: '../openapi.js',
                  queryableWriteOperations: false,
                  operationParametersTypeWrapper: undefined,
                },
                undefined
              )
            ),
          ] as const
      ),
      [path.resolve('services/index.ts'), servicesIndexSource],
      [
        path.resolve('usage.ts'),
        `
        import { services, type Services } from './services/index.js';
        import { getFiles } from './services/FilesService.js';

        const filesTypeCheck: Services['files'] = null as unknown as Services['files'];
        const emptyCheck: Services['empty'] = {};
        const op: typeof getFiles = services.files.getFiles;
        // @ts-expect-error - service operation properties are readonly
        services.files.getFiles = op;
        void [filesTypeCheck, emptyCheck, op];
      `,
      ],
    ]);

    expect(
      getDeclarationDiagnostics(files, {
        verbatimModuleSyntax: true,
      })
    ).toEqual([]);
  });

  it('emits declaration files without TS4023 across services, index, and create-api-client', () => {
    const services = [
      createService('files', 'FilesService', 'filesService', [
        'getFiles',
        'delete',
      ]),
      createService('users', 'UsersService', 'usersService', [
        'getFiles',
        'default',
      ]),
    ];

    expectGeneratedProjectCompiles(services, { imperativeQuery: true });
  });

  it('emits declaration files without TS4023 when exportServiceObject is false', () => {
    const services = [
      createService('files', 'FilesService', 'filesService', [
        'getFiles',
        'delete',
      ]),
      createService('users', 'UsersService', 'usersService', [
        'getFiles',
        'default',
      ]),
    ];

    expectGeneratedProjectCompiles(services, {
      exportServiceObject: false,
      imperativeQuery: true,
    });
  });
});

function createService(
  serviceName: string,
  typeName: string,
  variableName: string,
  operationIds: string[]
): OpenAPIService {
  const pathPrefix = serviceName || 'root';
  const schema: OpenAPISchemaType = {
    openapi: '3.1.0',
    info: { title: `${typeName} schema`, version: '1.0.0' },
    components: { parameters: undefined },
    paths: Object.fromEntries(
      operationIds.map((operationId, index) => [
        `/${pathPrefix}/${operationId || index}`,
        {
          get: {
            operationId,
            responses: {
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

  const service = getServices(schema)[0];

  return {
    ...service,
    name: serviceName,
    typeName,
    variableName,
    fileBaseName: typeName,
    operations: service.operations.map((operation, index) => ({
      ...operation,
      name: operationIds[index],
    })),
  };
}

function expectGeneratedProjectCompiles(
  services: OpenAPIService[],
  serviceOptions: Partial<ServiceFactoryOptions> = {},
  additionalFiles: Record<string, string> = {}
): void {
  const resolvedServiceOptions: ServiceFactoryOptions = {
    openapiTypesImportPath: '../openapi.js',
    queryableWriteOperations: false,
    operationParametersTypeWrapper: undefined,
    ...serviceOptions,
  };

  const files = new Map<string, string>();

  files.set(
    path.resolve('openapi.ts'),
    `
    export type $defs = Record<string, never>;
    export type components = Record<string, never>;
    export type operations = Record<string, never>;
    export type webhooks = Record<string, never>;
    export interface paths {
      ${services
        .flatMap((service) =>
          service.operations.map(
            (operation) => `
        ${JSON.stringify(operation.path)}: {
          ${operation.method}: {
            responses: { 200: { content: { 'application/json': string } } };
          };
        };
      `
          )
        )
        .join('\n')}
    }
  `
  );

  for (const service of services) {
    files.set(
      path.resolve(`services/${service.fileBaseName}.ts`),
      astToString(
        getServiceFactory(
          service,
          service.operations,
          resolvedServiceOptions,
          undefined
        )
      )
    );
  }

  files.set(
    path.resolve('services/index.ts'),
    astToString(
      getServiceIndexFactory(services, {
        explicitImportExtensions: '.js',
        serviceOptions: resolvedServiceOptions,
      })
    )
  );

  files.set(
    path.resolve('create-api-client.ts'),
    astToString(
      getCreateAPIClientFactory({
        servicesDirName: 'services',
        explicitImportExtensions: '.js',
        defaultClientCallbacks: ['all'],
        defaultClientServices: ['all'],
        createAPIClientFnName: 'createAPIClient',
        createAPIClientFnImportTypeOverrides: undefined,
        contextName: undefined,
      })
    )
  );

  files.set(
    path.resolve('index.ts'),
    astToString(
      getIndexFactory({
        createApiClientFn: [
          [
            'createAPIClient',
            {
              services: ['all'],
              callbacks: ['all'],
              filename: ['create-api-client'],
            },
          ],
        ],
        servicesDirName: 'services',
        explicitImportExtensions: '.js',
        openapiTypesImportPath: '../openapi.js',
      })
    )
  );

  for (const [relativePath, content] of Object.entries(additionalFiles)) {
    files.set(path.resolve(relativePath), content);
  }

  expect(getDeclarationDiagnostics(files)).toEqual([]);
}

function getDeclarationDiagnostics(
  files: ReadonlyMap<string, string>,
  extraOptions: ts.CompilerOptions = {}
): string[] {
  const effectiveOptions: ts.CompilerOptions = {
    ...compilerOptions,
    ...extraOptions,
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

  const host = ts.createCompilerHost(effectiveOptions);
  const { fileExists, readFile, getSourceFile, directoryExists } = host;

  host.directoryExists = (dirName) =>
    virtualDirectories.has(path.resolve(dirName)) ||
    (directoryExists ? directoryExists(dirName) : false);
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

  const program = ts.createProgram([...files.keys()], effectiveOptions, host);
  const preEmitDiagnostics = ts.getPreEmitDiagnostics(program);
  const emitResult = program.emit();

  return [...preEmitDiagnostics, ...emitResult.diagnostics].map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
  );
}
